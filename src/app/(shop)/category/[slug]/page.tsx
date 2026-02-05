import { supabaseServer } from "@/lib/supabase/server"
import { getProductsByCategorySlug } from "@/lib/supabase/queries"
import { ProductGrid } from "@/components/home/ProductGrid"

export default async function CategoryPage({
      params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await supabaseServer()
  const { category, products } = await getProductsByCategorySlug(supabase, slug)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="text-sm font-extrabold uppercase tracking-widest text-primary">Catégorie</div>
        <h1 className="mt-1 text-3xl font-black text-white">{category?.name ?? "Produits"}</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-white/55">
          Parcourez les suppléments premium. Les commandes sont passées via WhatsApp — aucune connexion requise.
        </p>
      </div>

      {/* Reuse grid styling */}
      <ProductGrid products={products} />
    </div>
  )
}
