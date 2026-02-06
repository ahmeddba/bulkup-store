import { Tag } from "lucide-react"

export function PromoBanner() {
  return (
    <div className="w-full bg-black border-b border-primary/30">
      <div className="container py-3">
        <div className="flex items-center justify-center gap-3 text-center">
          <Tag className="h-4 w-4 text-primary animate-pulse" />
          <p className="text-sm font-bold text-white">
            <span className="text-primary">OFFRE SPÉCIALE</span>
            {" · "}
            Profitez de <span className="text-primary">10% de réduction</span> sur tous les produits du site
          </p>
          <Tag className="h-4 w-4 text-primary animate-pulse" />
        </div>
      </div>
    </div>
  )
}
