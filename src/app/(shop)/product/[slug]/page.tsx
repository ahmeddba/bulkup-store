import Link from "next/link"
import { supabaseServer } from "@/lib/supabase/server"
import { getProductBySlug } from "@/lib/supabase/queries"
import ProductDetailClientImpl from "./ProductDetailClientImpl"


export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await supabaseServer()
  const product = await getProductBySlug(supabase, slug)

  if (!product) {
    return (
      <div className="container py-16">
        <h1 className="text-2xl font-black text-white">Product not found</h1>
        <Link href="/" className="mt-4 inline-block text-primary font-extrabold">
          Go Home →
        </Link>
      </div>
    )
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const images = (product.product_images ?? []).map((img) => ({
    url: `${base}/storage/v1/object/public/product-images/${img.storage_path}`,
    alt: img.alt || product.name,
  }))

  const variants = (product.product_variants ?? []).map((v) => ({
    id: v.id,
    label: v.label,
    unitPriceCents: product.price_cents + (v.price_delta_cents ?? 0),
  }))

  // Client interaction islands are handled via small client components below using inline wrappers
  // We keep this page server-rendered; interactive parts are client components.

  const benefits = [
    "Increases lean muscle mass significantly",
    "Boosts explosive strength & power output",
    "Accelerates post-workout muscle recovery",
  ]

  return (
    <div className="container py-6 md:py-10">
      <nav className="flex flex-wrap gap-2 text-sm md:text-base">
        <Link className="font-semibold text-white/55 hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span className="font-semibold text-white/55">/</span>
        <Link className="font-semibold text-white/55 hover:text-primary transition-colors" href="/category/creatine-strength">
          Supplements
        </Link>
        <span className="font-semibold text-white/55">/</span>
        <span className="font-semibold text-white">{product.categories?.name ?? "Product"}</span>
      </nav>

      <ProductDetailClient
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          sku: product.sku,
          inStock: product.in_stock,
          currency: product.currency,
          priceCents: product.price_cents,
          compareAtCents: product.compare_at_cents,
          isBestSeller: product.is_best_seller,
        }}
        images={images}
        variants={variants}
        benefits={benefits}
      />
    </div>
  )
}

/** client island */
function ProductDetailClient(props: {
  product: {
    id: string
    slug: string
    name: string
    description: string
    sku: string
    inStock: boolean
    currency: string
    priceCents: number
    compareAtCents: number | null
    isBestSeller: boolean
  }
  images: { url: string; alt: string }[]
  variants: { id: string; label: string; unitPriceCents: number }[]
  benefits: string[]
}) {
  return (
    <ProductDetailClientImpl {...props} />
  )
}
