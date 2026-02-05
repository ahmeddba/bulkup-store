"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { cartCount, cartSubtotalCents, readCart } from "@/lib/cart"
import { formatMoney } from "@/lib/utils"

export function StickyCartBar({ currency = "USD" }: { currency?: string }) {
  const [count, setCount] = useState(0)
  const [subtotal, setSubtotal] = useState(0)

  useEffect(() => {
    const sync = () => {
      const c = readCart()
      setCount(cartCount(c))
      setSubtotal(cartSubtotalCents(c))
    }
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("bulkup:cart", sync as EventListener)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("bulkup:cart", sync as EventListener)
    }
  }, [])

  const visible = useMemo(() => count > 0, [count])
  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
      <Link
        href="/checkout"
        className="group flex h-14 w-full max-w-md items-center justify-between rounded-full bg-primary px-6 text-black shadow-glow-yellow-strong transition-all hover:-translate-y-1 hover:bg-[#ffe144] press"
      >
        <div className="flex items-center gap-2">
          <div className="rounded bg-black/10 px-2 py-1 text-xs font-extrabold">{count}</div>
          <span className="text-sm font-extrabold">Articles Ajoutés</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-black">{formatMoney(subtotal, currency)}</span>
          <div className="mx-1 h-4 w-px bg-black/20" />
          <span className="flex items-center gap-1 text-sm font-extrabold">
            Commander <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Link>
    </div>
  )
}
