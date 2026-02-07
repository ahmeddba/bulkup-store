"use client"

import { useMemo, useState } from "react"
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react"
import type { ShapedProduct } from "@/lib/product-shape"
import type { BrandRow } from "@/lib/supabase/queries"
import { ProductCard } from "@/components/home/ProductCard"

type ProductsClientProps = {
  products: ShapedProduct[]
  brands: BrandRow[]
}

export function ProductsClient({ products, brands }: ProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)

  // Calculate min/max prices from all products
  const priceMinMax = useMemo(() => {
    let min = Infinity
    let max = 0
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.price < min) min = v.price
        if (v.price > max) max = v.price
      })
    })
    return { min: min === Infinity ? 0 : Math.floor(min), max: Math.ceil(max) }
  }, [products])

  const [priceRange, setPriceRange] = useState<[number, number]>([priceMinMax.min, priceMinMax.max])

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter (name OR brand)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesBrand = product.brandName.toLowerCase().includes(query)
        if (!matchesName && !matchesBrand) return false
      }

      // Brand filter (by slug)
      if (selectedBrandSlug) {
        if (product.brandSlug !== selectedBrandSlug) return false
      }

      // Price filter (check if ANY variant falls in range)
      const hasVariantInRange = product.variants.some((v) => {
        return v.price >= priceRange[0] && v.price <= priceRange[1]
      })
      if (!hasVariantInRange) return false

      return true
    })
  }, [products, searchQuery, selectedBrandSlug, priceRange])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedBrandSlug("")
    setPriceRange([priceMinMax.min, priceMinMax.max])
  }

  const hasActiveFilters = searchQuery || selectedBrandSlug || priceRange[0] !== priceMinMax.min || priceRange[1] !== priceMinMax.max

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-white/10"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showFilters ? "Masquer les Filtres" : "Afficher les Filtres"}
        </button>
      </div>

      {/* Filters Sidebar */}
      <aside
        className={`space-y-6 ${
          showFilters ? "block" : "hidden"
        } lg:block`}
      >
        <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
          {/* Brand Dropdown */}
          <div>
            <h3 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-primary">
              Marque
            </h3>
            <div className="relative">
              <select
                value={selectedBrandSlug}
                onChange={(e) => setSelectedBrandSlug(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-3 pr-10 text-sm font-semibold text-white focus:border-primary focus:outline-none"
              >
                <option value="">Toutes les marques</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="mt-6 border-t border-white/10 pt-6">
            <h3 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-primary">
              Prix (TND)
            </h3>
            <div className="space-y-4">
              {/* Price Range Display */}
              <div className="flex items-center justify-between text-sm font-semibold text-white">
                <span>{priceRange[0]} TND</span>
                <span>{priceRange[1]} TND</span>
              </div>
              
              {/* Dual Range Slider */}
              <div className="relative h-2">
                {/* Track */}
                <div className="absolute h-2 w-full rounded-full bg-white/10" />
                
                {/* Active Range Highlight */}
                <div
                  className="absolute h-2 rounded-full bg-primary"
                  style={{
                    left: `${((priceRange[0] - priceMinMax.min) / (priceMinMax.max - priceMinMax.min)) * 100}%`,
                    right: `${100 - ((priceRange[1] - priceMinMax.min) / (priceMinMax.max - priceMinMax.min)) * 100}%`,
                  }}
                />
                
                {/* Min Range Input */}
                <input
                  type="range"
                  min={priceMinMax.min}
                  max={priceMinMax.max}
                  step={5}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val <= priceRange[1]) {
                      setPriceRange([val, priceRange[1]])
                    }
                  }}
                  className="absolute top-0 z-[2] w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-xl [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-xl hover:[&::-moz-range-thumb]:scale-110 hover:[&::-webkit-slider-thumb]:scale-110"
                  style={{
                    pointerEvents: priceRange[0] === priceRange[1] ? 'none' : 'auto'
                  }}
                />
                
                {/* Max Range Input */}
                <input
                  type="range"
                  min={priceMinMax.min}
                  max={priceMinMax.max}
                  step={5}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= priceRange[0]) {
                      setPriceRange([priceRange[0], val])
                    }
                  }}
                  className="absolute top-0 z-[3] w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-xl [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-xl hover:[&::-moz-range-thumb]:scale-110 hover:[&::-webkit-slider-thumb]:scale-110"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-6 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-white/10"
            >
              Effacer les Filtres
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher par nom ou marque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#141414] py-3 pl-12 pr-4 text-sm font-semibold text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm font-semibold text-white/55">
          {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""} trouvé{filteredProducts.length !== 1 ? "s" : ""}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#141414] p-12 text-center">
            <p className="text-lg font-black text-white">Aucun produit trouvé</p>
            <p className="mt-2 text-sm font-semibold text-white/55">
              Essayez de modifier vos critères de recherche
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-extrabold text-black transition-colors hover:bg-[#d9ba0b]"
              >
                Effacer les Filtres
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
