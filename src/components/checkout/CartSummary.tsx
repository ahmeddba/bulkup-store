"use client"

import { useEffect, useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/utils"
import { readCart, writeCart, cartSubtotalCents, type CartItem } from "@/lib/cart"

export function CartSummary({ currency = "USD" }: { currency?: string }) {
  // Initialize with empty array to match server-side rendering
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    // Sync with localStorage after component mounts (client-side only)
    const sync = () => setItems(readCart().items)
    
    // Initial sync
    sync()
    
    // Listen for changes
    window.addEventListener("storage", sync)
    window.addEventListener("bulkup:cart", sync as EventListener)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("bulkup:cart", sync as EventListener)
    }
  }, [])

  const subtotal = useMemo(() => cartSubtotalCents({ items }), [items])
  const delivery = 0
  const total = subtotal + delivery

  const remove = (variantId: string) => {
    const state = readCart()
    state.items = state.items.filter((x) => x.variantId !== variantId)
    writeCart(state)
    window.dispatchEvent(new Event("bulkup:cart"))
  }

  return (
    <Card className="overflow-hidden rounded-xl border-border bg-[#23221b]">
      <div className="flex items-center justify-between border-b border-border bg-[#28271e] px-6 py-4">
        <div className="text-lg font-extrabold text-white">Votre Panier</div>
        <div className="text-sm font-semibold text-white/55">{items.reduce((s, i) => s + i.qty, 0)} Articles</div>
      </div>

      <div className="divide-y divide-border">
        {items.map((it) => (
          <div key={it.variantId} className="flex gap-4 p-4 transition-colors hover:bg-white/5 lg:p-5">
            <div className="h-[80px] w-[80px] overflow-hidden rounded-lg bg-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl ?? "/placeholder.jpg"} alt={it.name} className="h-full w-full object-cover opacity-90" />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-base font-semibold text-white lg:text-lg">{it.name}</div>
                  <div className="text-xs text-white/45">{it.variantLabel}</div>
                </div>
                <div className="text-lg font-extrabold text-primary">
                  {formatMoney(it.unitPriceCents * it.qty, currency)}
                </div>
              </div>

              <div className="mt-2 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-black/30 px-2 py-1 text-sm text-white/55">Qté: {it.qty}</span>
                  <button className="text-xs font-semibold text-white/55 hover:text-white">Modifier</button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                  onClick={() => remove(it.variantId)}
                  aria-label="Retirer l'article"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-[#28271e] p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/55">
            <span>Sous-total</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-sm text-white/55">
            <span>Frais de Livraison</span>
            <span>Gratuit</span>
          </div>
          <div className="my-2 h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-lg font-extrabold text-white">Total</span>
            <span className="text-3xl font-black tracking-tight text-primary">{formatMoney(total, currency)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
