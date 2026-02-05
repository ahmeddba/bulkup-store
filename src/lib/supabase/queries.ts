import type { SupabaseClient } from "@supabase/supabase-js"

export type CategoryRow = {
  id: string
  slug: string
  name: string
  sort_order: number
}

export type ProductRow = {
  id: string
  slug: string
  name: string
  description: string
  sku: string
  in_stock: boolean
  price_cents: number
  compare_at_cents: number | null
  currency: string
  is_best_seller: boolean
  is_promotion: boolean
  category_id: string | null
}

export type ProductVariantRow = {
  id: string
  product_id: string
  label: string
  sort_order: number
  price_delta_cents: number
  sku_suffix: string | null
}

export type ProductImageRow = {
  id: string
  product_id: string
  storage_path: string
  alt: string
  sort_order: number
}

export type ProductWithMedia = ProductRow & {
  product_images: ProductImageRow[]
  product_variants: ProductVariantRow[]
  categories?: CategoryRow | null
}

export async function getHeaderCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true })

  if (error) throw error
  return (data ?? []) as CategoryRow[]
}

export async function getBestSellers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, sku, in_stock, price_cents, compare_at_cents, currency, is_best_seller, is_promotion, category_id, product_images:product_images(id, product_id, storage_path, alt, sort_order), product_variants:product_variants(id, product_id, label, sort_order, price_delta_cents, sku_suffix)"
    )
    .or("is_best_seller.eq.true,is_promotion.eq.true")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as ProductWithMedia[]
}

export async function getProductsByCategorySlug(supabase: SupabaseClient, slug: string) {
  const { data: category, error: cErr } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order")
    .eq("slug", slug)
    .maybeSingle()

  if (cErr) throw cErr
  if (!category) return { category: null as CategoryRow | null, products: [] as ProductWithMedia[] }

  const { data: products, error: pErr } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, sku, in_stock, price_cents, compare_at_cents, currency, is_best_seller, is_promotion, category_id, product_images:product_images(id, product_id, storage_path, alt, sort_order), product_variants:product_variants(id, product_id, label, sort_order, price_delta_cents, sku_suffix)"
    )
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })

  if (pErr) throw pErr
  return { category: category as CategoryRow, products: (products ?? []) as ProductWithMedia[] }
}

export async function getProductBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, sku, in_stock, price_cents, compare_at_cents, currency, is_best_seller, is_promotion, category_id, categories:categories(id, slug, name, sort_order), product_images:product_images(id, product_id, storage_path, alt, sort_order), product_variants:product_variants(id, product_id, label, sort_order, price_delta_cents, sku_suffix)"
    )
    .eq("slug", slug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  const p = data as unknown as ProductWithMedia
  p.product_images = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  p.product_variants = [...(p.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  return p
}
