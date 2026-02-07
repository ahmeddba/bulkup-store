"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { formatTND } from "@/lib/utils"
import { ProductGallery } from "@/components/product/ProductGallery"
import { BenefitsCard } from "@/components/product/BenefitsCard"
import { SizeSelector } from "@/components/product/SizeSelector"
import { QuantityStepper, AddToCartButton } from "@/components/product/QuantityStepper"

export default function ProductDetailClientImpl({
  product,
  images,
  variants,
  benefits,
}: {
  product: {
    id: string
    slug: string
    name: string
    description: string
    sku: string
    inStock: boolean
    currency: string
    price: number // Final price (already discounted) in TND
    originalPrice: number // Price before discount in TND
    discountPercent: number // Discount percentage
    isBestSeller: boolean
  }
  images: { url: string; alt: string }[]
  variants: { id: string; label: string; price: number }[]
  benefits: string[]
}) {
  const initialVariant = variants[0]?.id ?? ""
  const [variantId, setVariantId] = useState(initialVariant)
  const [qty, setQty] = useState(1)

  const selected = useMemo(() => variants.find((v) => v.id === variantId) ?? variants[0], [variantId, variants])
  
  // Use selected variant price (variants come from DB with actual prices)
  const displayPrice = selected?.price ?? product.price
  const displayPriceCents = Math.round(displayPrice * 100)
  
  // Calculate original price (10% discount): original = price / 0.9
  const displayOriginalPrice = displayPrice / 0.9
  const hasDiscount = displayPrice > 0 // Always show discount if we have a price

  return (
    <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <ProductGallery images={images} bestSeller={product.isBestSeller} />
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {product.inStock ? (
              <Badge className="bg-green-500/20 text-green-400 font-extrabold">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                En Stock
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-300 font-extrabold">Rupture de Stock</Badge>
            )}
            
            {/* Discount Badge */}
            {hasDiscount ? (
              <Badge className="bg-green-600 text-white font-extrabold">
                -10%
              </Badge>
            ) : null}
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-2 flex items-end gap-3">
            <div className="text-3xl font-black text-primary">
              {formatTND(displayPrice)}
            </div>
            {hasDiscount ? (
              <div className="mb-1 text-lg font-semibold text-white/55 line-through">
                {formatTND(displayOriginalPrice)}
              </div>
            ) : null}
          </div>
        </div>

        <p className="leading-relaxed text-white/55">{product.description}</p>

        <BenefitsCard benefits={benefits} />

        <div className="space-y-4">
          <SizeSelector 
            value={variantId} 
            options={variants.map(v => ({
              id: v.id,
              label: v.label,
              unitPriceCents: Math.round(v.price * 100)
            }))} 
            onChange={setVariantId} 
          />

          <div className="mt-2 flex flex-col gap-4 sm:flex-row">
            <QuantityStepper value={qty} onChange={setQty} className="sm:w-32" />

            <AddToCartButton
              product={{ 
                id: product.id, 
                slug: product.slug, 
                name: product.name, 
                sku: product.sku, 
                currency: product.currency 
              }}
              variant={{ 
                id: selected.id, 
                label: selected.label, 
                unitPriceCents: Math.round(selected.price * 100)
              }}
              imageUrl={images[0]?.url}
              qty={qty}
              className="h-14 flex-1 rounded-lg bg-primary text-lg font-black text-black shadow-glow-yellow hover:bg-[#d9ba0b] hover:shadow-[0_0_20px_rgba(242,208,13,0.35)] press"
            />
          </div>

          <div className="text-center text-xs font-semibold text-white/55">
            La commande est passée via WhatsApp. Aucune connexion requise.
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#393728] text-primary">🏬</div>
            <div>
              <div className="text-xs font-semibold text-white/55">Enlèvement</div>
              <div className="text-sm font-extrabold text-white">En Magasin</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#393728] text-primary">🚚</div>
            <div>
              <div className="text-xs font-semibold text-white/55">Livraison</div>
              <div className="text-sm font-extrabold text-white">En 24-48H</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
