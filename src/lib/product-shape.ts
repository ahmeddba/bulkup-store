import type {
  ProductRow,
  ProductWithRelations,
  PackItemRow,
} from "./supabase/queries"
import { getPackItems } from "./supabase/queries"
import type { SupabaseClient } from "@supabase/supabase-js"

// ============================================================================
// SHAPED TYPES FOR UI
// ============================================================================

export type ShapedImage = {
  url: string
  alt: string
}

export type ShapedVariant = {
  size: string
  price: number
}

export type ShapedPackItem = {
  productId: string
  productName: string
  productSlug: string
  sizeLabel: string | null
  quantity: number
  retailPrice: number // price of this component (size price or product price)
  inStock: boolean
}

export type ShapedProduct = {
  id: string
  slug: string
  name: string
  description: string
  sku: string
  inStock: boolean
  currency: string
  productType: 'standard' | 'pack'
  
  // Brand & Category
  brandName: string
  brandSlug: string
  categoryName: string
  categorySlug: string
  
  // Media
  images: ShapedImage[]
  
  // Pricing & Variants
  defaultPrice: number // in TND
  originalPrice: number // in TND
  discountPercent: number
  variants: ShapedVariant[]
  
  // Pack-specific
  packItems: ShapedPackItem[]
  retailTotal: number // sum of component retail prices (0 for standard products)
  
  // Additional
  flavors: string[]
  benefits: string[]
  dosage: string
  
  // Flags
  isBestSeller: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build full URL for product image from storage bucket
 */
export function buildImageUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) {
    console.warn("NEXT_PUBLIC_SUPABASE_URL not set")
    return "/placeholder.jpg"
  }
  return `${baseUrl}/storage/v1/object/public/product-images/${path}`
}

/**
 * Shape pack items from raw DB rows into UI-ready format
 */
export function shapePackItems(rawItems: PackItemRow[]): ShapedPackItem[] {
  return rawItems
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item) => {
      const product = item.products
      const size = item.product_sizes

      // Use size price if size exists, otherwise product price
      const retailPrice = size ? size.price : product.price
      const inStock = size ? (product.in_stock && size.in_stock) : product.in_stock

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        sizeLabel: size?.label ?? null,
        quantity: item.quantity,
        retailPrice,
        inStock,
      }
    })
}

/**
 * Convert product WITH brand and category relations to UI shape
 */
export function shapeProductWithRelations(
  product: ProductWithRelations,
  rawPackItems?: PackItemRow[]
): ShapedProduct {
  // Sort and map images
  const images: ShapedImage[] = (Array.isArray(product.images) ? product.images : [])
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((img) => ({
      url: buildImageUrl(img.path),
      alt: img.alt ?? product.name,
    }))

  // If no images, provide placeholder
  if (images.length === 0) {
    images.push({
      url: "/placeholder.jpg",
      alt: product.name,
    })
  }

  const isPack = product.product_type === 'pack'

  // Shape pack items
  const packItems = (isPack && rawPackItems) ? shapePackItems(rawPackItems) : []
  
  // Calculate retailTotal for packs: sum of component retail prices * quantity
  const retailTotal = packItems.reduce((sum, item) => sum + (item.retailPrice * item.quantity), 0)

  // Sort variants and extract with proper price validation
  // Variants in DB have format: {"sort":1,"label":"480ml","price_dt":180}
  let variants: ShapedVariant[] = (Array.isArray(product.variants) ? product.variants : [])
    .map((v: any) => {
      // Read price_dt from variant (not "price")
      const priceDt = v.price_dt || v.price || 0
      const parsedPrice = Number(priceDt)
      let price = isNaN(parsedPrice) ? 0 : parsedPrice
      
      // If variant price is 0 but product has a global price, use it
      if (price === 0 && product.price > 0) {
        price = product.price
      }
      
      return {
        size: v.label || v.size || "",
        price,
      }
    })
    .filter(v => v.size && v.price > 0) // Only include variants with valid size and price

  // Fallback: use product.price if no valid variants
  const priceTND = product.price
  
  if (variants.length === 0 && priceTND > 0) {
    variants = [{ size: "", price: priceTND }]
  }
  
  // Default price: use first variant's price if available, otherwise use product price
  const defaultPrice = (variants.length > 0 && variants[0].price > 0) 
    ? variants[0].price 
    : priceTND

  // For packs, originalPrice is the retailTotal (component sum)
  // For standard products, use the existing original_price logic
  let calculatedOriginalPrice: number
  let discountPercent: number

  if (isPack && retailTotal > 0) {
    calculatedOriginalPrice = retailTotal
    // Calculate discount percent from retail total vs pack price
    discountPercent = defaultPrice > 0 
      ? Math.round(((retailTotal - defaultPrice) / retailTotal) * 100)
      : 0
  } else {
    const originalPriceTND = product.original_price > 0 ? product.original_price : defaultPrice
    calculatedOriginalPrice = originalPriceTND > defaultPrice ? originalPriceTND : defaultPrice
    discountPercent = product.discount_percent || 0
  }

  // Parse benefits from text[] array
  const benefits: string[] = Array.isArray(product.benefits)
    ? product.benefits.filter(b => b && b.trim())
    : []

  // Parse flavors from jsonb
  let flavors: string[] = []
  if (product.flavors) {
    if (Array.isArray(product.flavors)) {
      flavors = product.flavors
    } else if (typeof product.flavors === 'object' && Array.isArray((product.flavors as any).flavors)) {
      flavors = (product.flavors as any).flavors
    }
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? "",
    sku: product.sku ?? "",
    inStock: product.in_stock,
    currency: product.currency ?? "TND",
    productType: product.product_type ?? 'standard',
    
    // Brand & Category from relations (tolerant of null brand)
    brandName: product.brands?.name ?? "",
    brandSlug: product.brands?.slug ?? "",
    categoryName: product.categories?.name ?? "",
    categorySlug: product.categories?.slug ?? "",
    
    images,
    
    defaultPrice,
    originalPrice: calculatedOriginalPrice,
    discountPercent,
    variants,
    
    // Pack data
    packItems,
    retailTotal,
    
    flavors,
    benefits,
    dosage: product.dosage ?? "",
    
    isBestSeller: product.is_best_seller,
  }
}

/**
 * Shape multiple products with relations
 */
export function shapeProductsWithRelations(products: ProductWithRelations[]): ShapedProduct[] {
  return products.map(p => shapeProductWithRelations(p))
}

// Legacy exports for backwards compatibility
export const shapeProductWithCategory = shapeProductWithRelations
export const shapeProductsWithCategory = shapeProductsWithRelations

/**
 * Shape products without relations (for cases where relations aren't fetched)
 * This is a fallback - prefer using shapeProductWithRelations
 */
export function shapeProducts(products: ProductRow[]): ShapedProduct[] {
  // Since ProductRow doesn't have relations, we can't extract brand/category
  // This function is kept for backwards compatibility but should not be used
  return products.map(p => shapeProductWithRelations(p as unknown as ProductWithRelations))
}

/**
 * Shape multiple products, enriching pack products with their pack items.
 * This is the preferred function for server pages that display product grids -
 * it batch-fetches pack items for all pack products in one pass.
 */
export async function shapeProductsWithPacks(
  supabase: SupabaseClient,
  products: ProductWithRelations[]
): Promise<ShapedProduct[]> {
  // Identify which products are packs
  const packProducts = products.filter(p => p.product_type === 'pack')
  
  // Batch fetch pack items for all packs
  const packItemsMap: Record<string, PackItemRow[]> = {}
  await Promise.all(
    packProducts.map(async (pack) => {
      packItemsMap[pack.id] = await getPackItems(supabase, pack.id)
    })
  )

  // Shape all products, passing pack items where applicable
  return products.map(p => 
    shapeProductWithRelations(p, p.product_type === 'pack' ? packItemsMap[p.id] : undefined)
  )
}
