import { supabaseServer } from "@/lib/supabase/server"
import { getBestSellers } from "@/lib/supabase/queries"
import { shapeProductsWithRelations } from "@/lib/product-shape"
import { Hero } from "@/components/home/Hero"
import { FeatureCards } from "@/components/home/FeatureCards"
import { ProductGrid } from "@/components/home/ProductGrid"

export default async function HomePage() {
  const supabase = await supabaseServer()
  const rawProducts = await getBestSellers(supabase)
  const products = shapeProductsWithRelations(rawProducts)

  return (
    <div className="relative">
      <Hero />
      <FeatureCards />
      <ProductGrid products={products} />
    </div>
  )
}
