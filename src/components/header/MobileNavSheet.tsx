"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/", label: "Home" },
  { href: "/category/proteins", label: "Proteins" },
  { href: "/category/creatine", label: "Creatine" },
  { href: "/category/preworkout-energy", label: "Pre-Workout" },
  { href: "/category/fat-burners", label: "Fat Burners" },
  { href: "/category/vitamins-minerals", label: "Vitamins" },
  { href: "/category/accessories", label: "Accessories" },
]

export function MobileNavSheet() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-[#0a0a0a] text-white border-border">
        <SheetHeader>
          <SheetTitle className="text-white">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
