import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatTND } from "@/lib/utils"
import type { ShapedProduct } from "@/lib/product-shape"

export function ProductCard({ product }: { product: ShapedProduct }) {
  const image = product.images[0]?.url ?? "/placeholder.jpg"
  const hot = product.isBestSeller
  const isNew = false // Can add is_promotion field to schema if needed

  const defaultVariant = product.variants[0]
  const unitPriceCents = Math.round(product.defaultPrice * 100) // For cart compatibility
  
  // Check if there's a discount
  const hasDiscount = product.originalPrice > product.defaultPrice

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

        {/* Discount Badge */}
        {hasDiscount && product.discountPercent > 0 ? (
          <div className="absolute right-3 top-3 z-10">
            <Badge className="rounded-sm bg-green-600 text-[10px] font-extrabold uppercase tracking-wide text-white">
              -{product.discountPercent}%
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
          {defaultVariant?.size ?? product.sku}
        </div>

        <div className="mt-auto pt-3">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-black text-primary">
              {formatTND(product.defaultPrice)}
            </div>
            {hasDiscount ? (
              <div className="text-xs font-semibold text-white/40 line-through">
                {formatTND(product.originalPrice)}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
