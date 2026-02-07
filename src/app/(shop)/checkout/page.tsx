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
    </div>
  )
}
