import Link from "next/link"
import { supabaseServer } from "@/lib/supabase/server"
import { getProductBySlug } from "@/lib/supabase/queries"
import { shapeProductWithRelations } from "@/lib/product-shape"
import ProductDetailClientImpl from "./ProductDetailClientImpl"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await supabaseServer()
  const rawProduct = await getProductBySlug(supabase, slug)

  if (!rawProduct) {
    return (
      <div className="container py-16">
        <h1 className="text-2xl font-black text-white">Produit introuvable</h1>
        <Link href="/" className="mt-4 inline-block text-primary font-extrabold">
          Retour à l'accueil →
        </Link>
      </div>
    )
  }

  const product = shapeProductWithRelations(rawProduct)

  // Map shaped data to client component props
  const images = product.images.map((img) => ({
    url: img.url,
    alt: img.alt,
  }))

  const variants = product.variants.map((v, idx) => ({
    id: `variant-${idx}`,
    label: v.size,
    price: v.price, // Use actual price, not cents
  }))

  return (
    <div className="container py-6 md:py-10">
      <nav className="flex flex-wrap gap-2 text-sm md:text-base">
        <Link className="font-semibold text-white/55 hover:text-primary transition-colors" href="/">
          Accueil
        </Link>
        <span className="font-semibold text-white/55">/</span>
        <Link className="font-semibold text-white/55 hover:text-primary transition-colors" href={`/category/${product.categorySlug}`}>
          {product.categoryName}
        </Link>
        <span className="font-semibold text-white/55">/</span>
        <span className="font-semibold text-white">{product.name}</span>
      </nav>

      <ProductDetailClientImpl
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          sku: product.sku,
          inStock: product.inStock,
          currency: product.currency,
          price: product.defaultPrice, // Final price (already discounted)
          originalPrice: product.originalPrice, // Price before discount
          discountPercent: product.discountPercent, // Discount percentage
          isBestSeller: product.isBestSeller,
          flavors: product.flavors,
        }}
        images={images}
        variants={variants}
        benefits={product.benefits.length > 0 ? product.benefits : [
          "Augmente la masse musculaire maigre",
          "Améliore la force et la puissance",
          "Accélère la récupération musculaire",
        ]}
      />
    </div>
  )
}
