import { supabaseServer } from "@/lib/supabase/server"
import { getBestSellers } from "@/lib/supabase/queries"
import { Hero } from "@/components/home/Hero"
import { FeatureCards } from "@/components/home/FeatureCards"
import { ProductGrid } from "@/components/home/ProductGrid"
import { StickyCartBar } from "@/components/home/StickyCartBar"

export default async function HomePage() {
  const supabase = await supabaseServer()
  const products = await getBestSellers(supabase)

  return (
    <div className="relative">
      <Hero />
      <FeatureCards />
      <ProductGrid products={products} />
      {/* Only Home gets the sticky cart bar (matches screenshot) */}
      <StickyCartBar currency="USD" />
    </div>
  )
}
