import type { CartItem } from "./cart"
import { formatMoney } from "./utils"

export type CheckoutPayload = {
  fullName: string
  whatsappNumber: string
  address: string
  coords?: { lat: number; lng: number } | null
}

export function buildWhatsAppMessage(items: CartItem[], currency: string, payload: CheckoutPayload) {
  const lines: string[] = []
  lines.push("Bulkup Store — Order Request")
  lines.push("")
  lines.push("Items:")
  items.forEach((it, idx) => {
    const itemTotal = it.unitPriceCents * it.qty
    lines.push(
      `${idx + 1}) ${it.name} — ${it.variantLabel} x${it.qty} = ${formatMoney(itemTotal, currency)}`
    )
  })
  const total = items.reduce((s, it) => s + it.unitPriceCents * it.qty, 0)
  lines.push("")
  lines.push(`Total: ${formatMoney(total, currency)}`)
  lines.push("")
  lines.push(`Name: ${payload.fullName}`)
  lines.push(`WhatsApp: ${payload.whatsappNumber}`)
  lines.push(`Address: ${payload.address}`)
  if (payload.coords) lines.push(`Location: ${payload.coords.lat}, ${payload.coords.lng}`)
  lines.push("")
  lines.push("No payment now — pay upon delivery.")

  return lines.join("\n")
}

export function openWhatsAppOrder(items: CartItem[], currency: string, payload: CheckoutPayload) {
  const storeNumber = process.env.NEXT_PUBLIC_WHATSAPP_STORE_NUMBER
  if (!storeNumber) throw new Error("Missing NEXT_PUBLIC_WHATSAPP_STORE_NUMBER")
  const message = buildWhatsAppMessage(items, currency, payload)
  const url = `https://wa.me/${storeNumber}?text=${encodeURIComponent(message)}`
  window.open(url, "_blank", "noopener,noreferrer")
}
