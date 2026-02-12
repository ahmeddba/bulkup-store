"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { X, ZoomIn } from "lucide-react"
import Image from "next/image"

export type GalleryImage = {
  url: string
  alt: string
}

export function ProductGallery({ images, bestSeller }: { images: GalleryImage[]; bestSeller?: boolean }) {
  const safe = useMemo(() => (images.length ? images : [{ url: "/placeholder.jpg", alt: "" }]), [images])
  const [active, setActive] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div 
          className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-[#1a1912] cursor-zoom-in md:aspect-[4/3]"
          onClick={() => setIsZoomed(true)}
        >
          {/* Image with object-contain to show full image */}
          <Image
            src={safe[active].url}
            alt={safe[active].alt}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized
          />
          
          {bestSeller ? (
            <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-black">
              Best Seller
            </div>
          ) : null}
          
          {/* Zoom Indicator */}
          <div className="absolute right-4 top-4 rounded-full bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Thumbnails */}
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
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-contain p-1"
                sizes="100px"
                unoptimized
              />
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            onClick={() => setIsZoomed(false)}
            aria-label="Close zoom"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative h-full w-full max-w-6xl">
            <Image
              src={safe[active].url}
              alt={safe[active].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          
          {/* Navigation Arrows */}
          {safe.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation()
                  setActive((prev) => (prev === 0 ? safe.length - 1 : prev - 1))
                }}
                disabled={active === 0}
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation()
                  setActive((prev) => (prev === safe.length - 1 ? 0 : prev + 1))
                }}
                disabled={active === safe.length - 1}
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}
          
          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white">
            {active + 1} / {safe.length}
          </div>
        </div>
      )}
    </>
  )
}
