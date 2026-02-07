import type {
  ProductRow,
  ProductWithRelations,
  ImageJson,
  VariantJson,
} from "./supabase/queries"

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

export type ShapedProduct = {
  id: string
  slug: string
  name: string
  description: string
  sku: string
  inStock: boolean
  currency: string
  
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
 * Convert product WITH brand and category relations to UI shape
 */
export function shapeProductWithRelations(product: ProductWithRelations): ShapedProduct {
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

  // Sort variants and extract with proper price validation
  // Variants in DB have format: {"sort":1,"label":"480ml","price_dt":180}
  const variants: ShapedVariant[] = (Array.isArray(product.variants) ? product.variants : [])
    .map((v: any) => {
      // Read price_dt from variant (not "price")
      const priceDt = v.price_dt || v.price || 0
      const parsedPrice = Number(priceDt)
      const price = isNaN(parsedPrice) ? 0 : parsedPrice
      
      return {
        size: v.label || v.size || "",
        price,
      }
    })
    .filter(v => v.size && v.price > 0) // Only include variants with valid size and price

  // Fallback: use product.price if no valid variants
  const priceTND = product.price
  
  // Default price: use first variant's price if available, otherwise use product price
  const defaultPrice = (variants.length > 0 && variants[0].price > 0) 
    ? variants[0].price 
    : priceTND
  
  // Calculate original price (before 10% discount): original = price / 0.9
  // This means: price = original * 0.9, so original = price / 0.9
  const calculatedOriginalPrice = defaultPrice / 0.9

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
    
    // Brand & Category from relations
    brandName: product.brands?.name ?? "",
    brandSlug: product.brands?.slug ?? "",
    categoryName: product.categories?.name ?? "",
    categorySlug: product.categories?.slug ?? "",
    
    images,
    
    defaultPrice,
    originalPrice: calculatedOriginalPrice,
    discountPercent: 10, // Always 10% discount
    variants,
    
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
  return products.map(shapeProductWithRelations)
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
