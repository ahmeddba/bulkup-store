"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatMoney } from "@/lib/utils"
import { ShoppingCart, Package, Hash } from "lucide-react"

type AddToCartConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  product: {
    name: string
    imageUrl?: string
  }
  variant: {
    label: string
    unitPriceCents: number
  }
  qty: number
  currency: string
}

export function AddToCartConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  product,
  variant,
  qty,
  currency,
}: AddToCartConfirmDialogProps) {
  const totalCents = variant.unitPriceCents * qty

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-border bg-[#1a1a1a]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl font-black text-white">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Confirmer l'ajout au panier
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/55">
            Vérifiez les détails avant d'ajouter ce produit à votre panier
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-4">
          {/* Product Image & Name */}
          <div className="flex gap-4">
            {product.imageUrl && (
              <div className="h-20 w-20 overflow-hidden rounded-lg bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="text-lg font-bold text-white">{product.name}</div>
              <div className="mt-1 text-sm text-white/55">{variant.label}</div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/55">
                <Package className="h-4 w-4" />
                <span>Variante</span>
              </div>
              <div className="font-semibold text-white">{variant.label}</div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/55">
                <Hash className="h-4 w-4" />
                <span>Quantité</span>
              </div>
              <div className="font-semibold text-white">×{qty}</div>
            </div>

            <div className="my-2 h-px bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/55">Prix unitaire</div>
              <div className="text-sm font-semibold text-white">
                {formatMoney(variant.unitPriceCents, currency)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-base font-bold text-white">Total</div>
              <div className="text-xl font-black text-primary">
                {formatMoney(totalCents, currency)}
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border-border bg-white/5 text-white hover:bg-white/10">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-primary text-black hover:bg-[#ffe033] font-black shadow-glow-yellow"
          >
            Confirmer l'ajout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
