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

export type ProductRow = {
  id: string
  slug: string
  name: string
  description: string | null
  sku: string | null
  in_stock: boolean
  currency: string
  
  // RELATIONS (NOT flat text fields)
  category_id: string // UUID foreign key to categories.id
  brand_id: string // UUID foreign key to brands.id
  
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
    .select("*, categories!inner(id, slug, name, sort_order), brands!inner(id, slug, name, sort_order)")
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
    .select("*, categories!inner(id, slug, name, sort_order), brands!inner(id, slug, name, sort_order)")
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
  // Fetch category first
  const { data: category, error: cErr } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (cErr && cErr.code !== 'PGRST116') throw cErr

  // Fetch products with category and brand relations
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("*, categories!inner(id, slug, name, sort_order), brands!inner(id, slug, name, sort_order)")
    .eq("categories.slug", slug)
    .order("sales_count", { ascending: false })
 
  if (pErr) throw pErr

  return {
    category: category ?? null,
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
    .select("*, categories!inner(id, slug, name, sort_order), brands!inner(id, slug, name, sort_order)")
    .eq("slug", slug)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as ProductWithRelations | null
}
