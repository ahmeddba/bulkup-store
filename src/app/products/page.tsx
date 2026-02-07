import { supabaseServer } from "@/lib/supabase/server"
import { getAllProducts, getBrands } from "@/lib/supabase/queries"
import { shapeProductsWithRelations } from "@/lib/product-shape"
import { ProductsClient } from "@/components/products/ProductsClient"

export default async function ProductsPage() {
  const supabase = await supabaseServer()
  
  // Fetch products and brands in parallel
  const [rawProducts, brands] = await Promise.all([
    getAllProducts(supabase),
    getBrands(supabase),
  ])
  
  const products = shapeProductsWithRelations(rawProducts)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="text-sm font-extrabold uppercase tracking-widest text-primary">Catalogue</div>
        <h1 className="mt-1 text-3xl font-black text-white">Tous les Produits</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-white/55">
          Parcourez notre collection complète de suppléments premium. Utilisez les filtres pour trouver exactement ce dont vous avez besoin.
        </p>
      </div>

      <ProductsClient products={products} brands={brands} />
    </div>
  )
}
