import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="container py-6 md:py-10">
      <div
        className="relative min-h-[500px] overflow-hidden rounded-2xl  bg-[#1c1c1c] shadow-2xl"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.12) 100%), url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 max-w-2xl p-6 md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-3 py-1 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Tendance Actuelle</span>
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
            Alimentez Votre <br /> <span className="text-primary">Ambition.</span>
          </h1>

          <p className="mt-4 max-w-md text-lg font-light text-white/75 md:text-xl">
            Suppléments premium conçus pour les athlètes de haut niveau. Aucun compte, juste des résultats.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 bg-primary px-8 text-base font-extrabold text-black shadow-glow-yellow hover:bg-[#ffe144] press"
            >
              <Link href="#best-sellers">
                Meilleures Ventes <span className="ml-2">→</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="h-12 border border-white/10 bg-white/10 px-8 text-base font-extrabold text-white backdrop-blur-md hover:bg-white/20 press"
            >
              <Link href="/category/bundles">Voir les Packs</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
