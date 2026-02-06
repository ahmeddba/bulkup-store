import { CartSummary } from "@/components/checkout/CartSummary"
import { CheckoutForm } from "@/components/checkout/CheckoutForm"

export default function CheckoutPage() {
  return (
    <div className="container py-6 lg:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white lg:text-4xl">Finaliser la Commande</h1>
        <p className="mt-2 text-sm font-semibold text-white/55 lg:text-base">
          Vérifiez votre panier et dites-nous où l'envoyer.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <CartSummary currency="TND" />
        </div>
        <div className="lg:col-span-5">
          <CheckoutForm currency="TND" />
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="text-center lg:text-left">
            <div className="text-base font-extrabold text-white">Bulkup Store - Centre-Ville</div>
            <div className="mt-1 text-sm font-semibold text-white/55">123 Boulevard Muscle, Ville Fitness, FC 90210</div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-white/55 lg:justify-start">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Ouvert Lun-Sam: 9h - 21h
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Dim: Fermé
              </span>
            </div>
          </div>

          <div className="group relative h-[100px] w-full max-w-[300px] cursor-pointer overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/map.jpg" alt="Map" className="h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/10">
              <span className="rounded-full border border-border bg-[#23221b]/90 px-3 py-1.5 text-xs font-extrabold text-white">
                <span className="mr-2 text-primary">⌁</span> Voir sur la Carte
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
