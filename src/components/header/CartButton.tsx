"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ShoppingCart } from "lucide-react"
import { cartCount, readCart } from "@/lib/cart"
import { cn } from "@/lib/utils"

export function CartButton({ className }: { className?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const sync = () => setCount(cartCount(readCart()))
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("bulkup:cart", sync as EventListener)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("bulkup:cart", sync as EventListener)
    }
  }, [])

  const hasItems = useMemo(() => count > 0, [count])

  if (!hasItems) {
    return null
  }

  return (
    <Link
      href="/checkout"
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-[#2b291f] text-white transition-colors hover:bg-[#343224] focus:outline-none focus:ring-2 focus:ring-primary/50",
        className
      )}
      aria-label="Ouvrir le panier"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
    </Link>
  )
}
