"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export type GalleryImage = {
  url: string
  alt: string
}

export function ProductGallery({ images, bestSeller }: { images: GalleryImage[]; bestSeller?: boolean }) {
  const safe = useMemo(() => (images.length ? images : [{ url: "/placeholder.jpg", alt: "" }]), [images])
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <div className="group relative aspect-square md:aspect-[4/3] overflow-hidden rounded-xl border border-border bg-[#1a1912]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
          style={{ backgroundImage: `url('${safe[active].url}')` }}
        />
        {bestSeller ? (
          <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-black">
            Best Seller
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {safe.slice(0, 4).map((img, idx) => (
          <button
            key={img.url + idx}
            onClick={() => setActive(idx)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border transition-all",
              idx === active ? "border-2 border-primary" : "border-border opacity-70 hover:opacity-100 hover:border-white/40"
            )}
            aria-label={`Select image ${idx + 1}`}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${img.url}')` }} />
          </button>
        ))}
      </div>
    </div>
  )
}
