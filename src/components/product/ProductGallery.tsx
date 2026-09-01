"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import Image from "next/image"

export type GalleryImage = {
  url: string
  alt: string
}

export function ProductGallery({ images, bestSeller }: { images: GalleryImage[]; bestSeller?: boolean }) {
  const safe = useMemo(() => (images.length ? images : [{ url: "/placeholder.jpg", alt: "" }]), [images])
  const [active, setActive] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const needsCarousel = safe.length > 4

  // Scroll container ref for the thumbnail row
  const scrollRef = useRef<HTMLDivElement>(null)
  // Outer wrapper ref to measure visible width
  const wrapperRef = useRef<HTMLDivElement>(null)
  // Refs for each thumbnail button so we can scrollIntoView
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Computed thumbnail width based on measured container
  const [thumbWidth, setThumbWidth] = useState(0)

  // Track whether we can scroll left / right
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  // Re-evaluate arrows and thumbnail width after mount and on resize
  useEffect(() => {
    if (!needsCarousel) return
    updateScrollState()

    const computeThumbWidth = () => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const totalWidth = wrapper.clientWidth
      // Arrow buttons: 2.5rem (40px) each side + 8px gap from thumbnail = 48px each
      const arrowSpace = 48 * 2
      // 3 gaps between 4 visible thumbs, each gap is 12px (gap-3)
      const gapSpace = 3 * 12
      const available = totalWidth - arrowSpace - gapSpace
      setThumbWidth(Math.floor(available / 4))
    }

    computeThumbWidth()

    const wrapper = wrapperRef.current
    const scrollEl = scrollRef.current
    const ro = new ResizeObserver(() => {
      computeThumbWidth()
      updateScrollState()
    })
    if (wrapper) ro.observe(wrapper)
    if (scrollEl) ro.observe(scrollEl)
    return () => ro.disconnect()
  }, [needsCarousel, updateScrollState])

  // When the active thumbnail changes, scroll it into view
  useEffect(() => {
    const thumb = thumbRefs.current[active]
    if (thumb && needsCarousel) {
      thumb.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" })
      // Update arrow state after scroll animation
      const timeout = setTimeout(updateScrollState, 350)
      return () => clearTimeout(timeout)
    }
  }, [active, needsCarousel, updateScrollState])

  const scrollBy = useCallback((direction: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    // Scroll by one thumbnail width + gap
    const thumb = thumbRefs.current[0]
    const scrollAmount = thumb ? thumb.offsetWidth + 12 : el.clientWidth / 4
    el.scrollBy({ left: direction * scrollAmount, behavior: "smooth" })
    // Update arrow state after scroll animation
    setTimeout(updateScrollState, 350)
  }, [updateScrollState])

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
        {needsCarousel ? (
          /* Carousel mode: overflow-x scroll with prev/next arrows */
          <div ref={wrapperRef} className="relative flex items-center w-full gap-2">
            {/* Left arrow – flush to the far left */}
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              className={cn(
                "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border border-border bg-black/70 text-white transition-all backdrop-blur-sm",
                canScrollLeft
                  ? "hover:bg-primary hover:text-black hover:border-primary cursor-pointer opacity-100 shadow-md"
                  : "opacity-0 cursor-default pointer-events-none"
              )}
              aria-label="Previous thumbnails"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Scrollable thumbnail row */}
            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              className="flex flex-1 min-w-0 gap-3 overflow-x-auto scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {safe.map((img, idx) => (
                <button
                  key={img.url + idx}
                  ref={(el) => { thumbRefs.current[idx] = el }}
                  onClick={() => setActive(idx)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border transition-all flex-shrink-0",
                    "min-w-[60px]",
                    idx === active ? "border-2 border-primary" : "border-border opacity-70 hover:opacity-100 hover:border-white/40"
                  )}
                  style={thumbWidth > 0 ? { width: thumbWidth } : undefined}
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

            {/* Right arrow – flush to the far right */}
            <button
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              className={cn(
                "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border border-border bg-black/70 text-white transition-all backdrop-blur-sm",
                canScrollRight
                  ? "hover:bg-primary hover:text-black hover:border-primary cursor-pointer opacity-100 shadow-md"
                  : "opacity-0 cursor-default pointer-events-none"
              )}
              aria-label="Next thumbnails"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          /* Standard mode: ≤4 images, grid layout — unchanged */
          <div className="grid grid-cols-4 gap-3">
            {safe.map((img, idx) => (
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
        )}
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
              unoptimized
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
