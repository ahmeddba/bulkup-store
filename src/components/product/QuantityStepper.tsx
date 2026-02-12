"use client"

import { useCallback, useMemo, useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { readCart, writeCart, type CartItem } from "@/lib/cart"
import { AddToCartConfirmDialog } from "./AddToCartConfirmDialog"

export function QuantityStepper({
  value,
  onChange,
  className,
}: {
  value: number
  onChange: (n: number) => void
  className?: string
}) {
  return (
    <div className={cn("flex h-14 items-center justify-between rounded-lg border border-border bg-[#1a1912] px-3", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="p-2 text-white/60 transition-colors hover:text-white"
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="text-lg font-black text-white">{value}</div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="p-2 text-white/60 transition-colors hover:text-white"
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export function AddToCartButton({
  product,
  variant,
  imageUrl,
  className,
  qty,
  flavor,
}: {
  product: { id: string; slug: string; name: string; sku: string; currency: string }
  variant: { id: string; label: string; unitPriceCents: number }
  imageUrl?: string
  className?: string
  qty?: number
  flavor?: string
}) {
  const [busy, setBusy] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const finalQty = useMemo(() => qty ?? 1, [qty])

  const handleConfirm = useCallback(() => {
    setBusy(true)
    try {
      const state = readCart()
      // Check if existing item matches variant AND flavor
      const existing = state.items.find((x) => 
        x.variantId === variant.id && 
        (x.flavor === flavor || (!x.flavor && !flavor))
      )
      
      if (existing) {
        existing.qty += finalQty
      } else {
        const item: CartItem = {
          productId: product.id,
          productSlug: product.slug,
          name: product.name,
          sku: product.sku,
          imageUrl,
          variantId: variant.id,
          variantLabel: variant.label,
          unitPriceCents: variant.unitPriceCents,
          qty: finalQty,
          flavor,
        }
        state.items.unshift(item)
      }
      writeCart(state)
      window.dispatchEvent(new Event("bulkup:cart"))
      setShowConfirm(false)
    } finally {
      setBusy(false)
    }
  }, [finalQty, imageUrl, product.id, product.name, product.sku, product.slug, variant.id, variant.label, variant.unitPriceCents, flavor])

  return (
    <>
      <Button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={busy}
        className={cn(className)}
      >
        Ajouter <ShoppingCart className="ml-2 h-4 w-4" />
      </Button>

      <AddToCartConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirm}
        product={{
          name: product.name,
          imageUrl,
        }}
        variant={variant}
        flavor={flavor}
        qty={finalQty}
        currency={product.currency}
      />
    </>
  )
}
