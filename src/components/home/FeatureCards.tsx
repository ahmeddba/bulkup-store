import { Card } from "@/components/ui/card"
import { BadgeCheck, Headset, Truck } from "lucide-react"

const items = [
  {
    icon: Truck,
    title: "Livraison Rapide",
    desc: "Expédition le jour même pour les commandes locales via WhatsApp.",
  },
  {
    icon: BadgeCheck,
    title: "Produits Authentiques",
    desc: "100% de marques authentiques garanties directement de la source.",
  },
  {
    icon: Headset,
    title: "Support Expert",
    desc: "Experts en fitness prêts à vous aider à bien choisir.",
  },
]

export function FeatureCards() {
  return (
    <section className="container py-8">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <Card
              key={it.title}
              className="surface soft-border hover-lift rounded-xl bg-[#141414] p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-white">{it.title}</div>
                  <p className="mt-1 text-sm text-white/55">{it.desc}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
