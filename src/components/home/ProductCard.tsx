import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/utils"
import type { ProductWithMedia } from "@/lib/supabase/queries"
import { AddToCartButton } from "../product/QuantityStepper"

function firstImageUrl(p: ProductWithMedia) {
  const img = p.product_images?.[0]
  if (!img) return "/placeholder.jpg"
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/product-images/${img.storage_path}`
}

export function ProductCard({ product }: { product: ProductWithMedia }) {
  const image = firstImageUrl(product)
  const hot = product.is_best_seller
  const isNew = product.is_promotion

  const defaultVariant = product.product_variants?.[0]
  const unit = product.price_cents + (defaultVariant?.price_delta_cents ?? 0)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#141414] transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] w-full overflow-hidden bg-[#1a1a1a]">
        {hot ? (
          <div className="absolute left-3 top-3 z-10">
            <Badge className="rounded-sm bg-red-600 text-[10px] font-extrabold uppercase tracking-wide text-white">
              Tendance
            </Badge>
          </div>
        ) : null}

        {!hot && isNew ? (
          <div className="absolute left-3 top-3 z-10">
            <Badge className="rounded-sm bg-primary text-[10px] font-extrabold uppercase tracking-wide text-black">
              Nouveau
            </Badge>
          </div>
        ) : null}

        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url('${image}')` }}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`}>
          <div className="line-clamp-2 text-base font-extrabold leading-tight text-white transition-colors group-hover:text-primary">
            {product.name}
          </div>
        </Link>
        <div className="mt-1 text-xs text-white/40">
          {defaultVariant?.label ? defaultVariant.label : product.sku}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="text-lg font-black text-primary">{formatMoney(unit, product.currency)}</div>

          {defaultVariant ? (
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                sku: product.sku,
                currency: product.currency,
              }}
              variant={{
                id: defaultVariant.id,
                label: defaultVariant.label,
                unitPriceCents: unit,
              }}
              imageUrl={image}
              className="hidden h-9 rounded bg-white/10 px-4 text-sm font-extrabold text-white hover:bg-primary hover:text-black md:inline-flex"
            />
          ) : (
            <Button className="hidden h-9 rounded bg-white/10 px-4 text-sm font-extrabold text-white md:inline-flex" disabled>
              Ajouter
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
