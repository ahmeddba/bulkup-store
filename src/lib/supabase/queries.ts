import type { SupabaseClient } from "@supabase/supabase-js"

// ============================================================================
// DATABASE TYPES (matching ACTUAL schema with categories + brands tables)
// ============================================================================

export type CategoryRow = {
  id: string
  slug: string
  name: string
  sort_order: number
}

export type BrandRow = {
  id: string
  slug: string
  name: string
  sort_order: number
}

// JSON type for images stored in products.images
export type ImageJson = {
  path: string
  alt: string | null
  sort: number
}

// JSON type for variants stored in products.variants
export type VariantJson = {
  size: string
  price: number // Price in TND
}

// Row from product_sizes table
export type ProductSizeRow = {
  id: string
  product_id: string
  label: string
  price: number
  in_stock: boolean
  sort_order: number
}

// Row from pack_items table (with nested relations)
export type PackItemRow = {
  id: string
  pack_id: string
  product_id: string
  product_size_id: string | null
  quantity: number
  sort_order: number
  products: {
    id: string
    name: string
    slug: string
    price: number
    in_stock: boolean
  }
  product_sizes: ProductSizeRow | null
}

export type ProductRow = {
  id: string
  slug: string
  name: string
  description: string | null
  sku: string | null
  in_stock: boolean
  currency: string
  product_type: 'standard' | 'pack'
  
  // RELATIONS (NOT flat text fields)
  category_id: string // UUID foreign key to categories.id
  brand_id: string | null // UUID foreign key to brands.id (nullable for packs)
  
  // Pricing (based on actual DB schema)
  price: number // int8 - final selling price in millimes (divide by 1000 for TND)
  original_price: number // numeric - price before discount in TND
  discount_percent: number // int - default 10
  
  dosage: string | null
  benefits: string[] | null // text[] array in DB
  flavors: any | null // jsonb in DB
  
  is_best_seller: boolean
  is_promotion: boolean
  sales_count: number
  
  images: ImageJson[]
  variants: VariantJson[]
}

// Product with expanded relations
export type ProductWithRelations = ProductRow & {
  categories: CategoryRow | null
  brands: BrandRow | null
}

// ============================================================================
// SHARED SELECT for product queries (single source of truth)
// ============================================================================

const PRODUCT_SELECT = "*, categories(id, slug, name, sort_order), brands(id, slug, name, sort_order)"

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all categories for navigation
 */
export async function getCategories(supabase: SupabaseClient): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Get all brands for filter dropdown
 */
export async function getBrands(supabase: SupabaseClient): Promise<BrandRow[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Get best selling products for homepage
 * Includes brand and category relations
 */
export async function getBestSellers(supabase: SupabaseClient): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .or("is_best_seller.eq.true,sales_count.gt.0")
    .order("sales_count", { ascending: false })
    .limit(8)

  if (error) throw error
  return (data ?? []) as ProductWithRelations[]
}

/**
 * Get all products for the products page
 * Includes brand and category relations
 */
export async function getAllProducts(supabase: SupabaseClient): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("in_stock", true)
    .order("sales_count", { ascending: false })

  if (error) throw error
  return (data ?? []) as ProductWithRelations[]
}

/**
 * Get products by category slug using relation
 */
export async function getProductsByCategorySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<{ category: CategoryRow | null; products: ProductWithRelations[] }> {
  const isPacksCategory = slug === 'packs' || slug === 'bundles'
  
  // Fetch category first
  const { data: category, error: cErr } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (cErr && cErr.code !== 'PGRST116') throw cErr

  let productsQuery = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("sales_count", { ascending: false })

  if (isPacksCategory) {
    // If it's the bundles/packs page, fetch all pack products regardless of their db category
    productsQuery = productsQuery.eq("product_type", "pack")
  } else {
    // Normal category behavior
    productsQuery = productsQuery.eq("category_id", category?.id ?? "")
  }

  const { data: products, error: pErr } = await productsQuery
 
  if (pErr) throw pErr
  
  // Create a synthetic category if it doesn't exist in DB but they requested packs
  const resolvedCategory = category ?? (isPacksCategory ? {
    id: "synth-packs",
    slug: slug,
    name: "Packs & Bundles",
    sort_order: 99
  } : null)

  return {
    category: resolvedCategory,
    products: (products ?? []) as ProductWithRelations[],
  }
}

/**
 * Get a single product by slug with relations
 */
export async function getProductBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as ProductWithRelations | null
}

/**
 * Get pack items for a pack product (with included product and size details)
 * Uses separate queries to avoid PostgREST composite FK disambiguation issues
 */
export async function getPackItems(
  supabase: SupabaseClient,
  packId: string
): Promise<PackItemRow[]> {
  // Step 1: Fetch pack_items rows
  const { data: items, error: itemsErr } = await supabase
    .from("pack_items")
    .select("id, pack_id, product_id, product_size_id, quantity, sort_order")
    .eq("pack_id", packId)
    .order("sort_order", { ascending: true })

  if (itemsErr) throw itemsErr
  if (!items || items.length === 0) return []

  // Step 2: Fetch the referenced products in bulk
  const productIds = [...new Set(items.map(i => i.product_id))]
  const { data: products, error: productsErr } = await supabase
    .from("products")
    .select("id, name, slug, price, in_stock")
    .in("id", productIds)

  if (productsErr) throw productsErr

  // Step 3: Fetch referenced product_sizes in bulk (for items that have a size)
  const sizeIds = items.map(i => i.product_size_id).filter((id): id is string => id != null)
  let sizesMap: Record<string, ProductSizeRow> = {}
  if (sizeIds.length > 0) {
    const { data: sizes, error: sizesErr } = await supabase
      .from("product_sizes")
      .select("id, product_id, label, price, in_stock, sort_order")
      .in("id", sizeIds)

    if (sizesErr) throw sizesErr
    sizesMap = Object.fromEntries((sizes ?? []).map(s => [s.id, s]))
  }

  // Step 4: Assemble into PackItemRow shape
  const productsMap = Object.fromEntries((products ?? []).map(p => [p.id, p]))

  return items.map(item => ({
    id: item.id,
    pack_id: item.pack_id,
    product_id: item.product_id,
    product_size_id: item.product_size_id,
    quantity: item.quantity,
    sort_order: item.sort_order,
    products: productsMap[item.product_id] ?? { id: item.product_id, name: "Unknown", slug: "", price: 0, in_stock: false },
    product_sizes: item.product_size_id ? (sizesMap[item.product_size_id] ?? null) : null,
  }))
}
