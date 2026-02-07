import type { ShapedProduct } from "@/lib/product-shape"
import { ProductCard } from "./ProductCard"
import Link from "next/link"

export function ProductGrid({ products }: { products: ShapedProduct[] }) {
  return (
    <section id="best-sellers" className="container pb-24">
      <div className="flex items-end justify-between pb-4 pt-8">
        <div>
          <div className="text-sm font-extrabold uppercase tracking-widest text-primary">Les Mieux Notés</div>
          <h2 className="mt-1 text-3xl font-black text-white">Meilleures Ventes</h2>
        </div>
        <Link
          href="/products"
          className="hidden items-center gap-1 text-sm font-extrabold text-white/55 transition-colors hover:text-white md:flex"
        >
          Voir Tous les Produits <span className="text-base">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link 
          href="/products"
          className="rounded-lg bg-primary px-8 py-3 text-sm font-extrabold text-black transition-all hover:bg-[#d9ba0b] hover:shadow-[0_0_20px_rgba(242,208,13,0.35)]"
        >
          Voir Tous les Produits
        </Link>
      </div>

      <div className="mt-12 flex justify-center md:hidden">
        <Link className="border-b border-primary pb-1 text-sm font-extrabold text-white" href="/products">
          Voir Tous les Produits
        </Link>
      </div>
    </section>
  )
}
