export type CartItem = {
  productId: string
  productSlug: string
  name: string
  sku: string
  imageUrl?: string
  variantId: string
  variantLabel: string
  unitPriceCents: number
  qty: number
}

export type CartState = {
  items: CartItem[]
}

const KEY = "bulkup_cart_v1"

export function readCart(): CartState {
  if (typeof window === "undefined") return { items: [] }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { items: [] }
    const parsed = JSON.parse(raw) as CartState
    if (!parsed?.items) return { items: [] }
    return parsed
  } catch {
    return { items: [] }
  }
}

export function writeCart(state: CartState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(state))
}

export function cartCount(state: CartState) {
  return state.items.reduce((sum, it) => sum + it.qty, 0)
}

export function cartSubtotalCents(state: CartState) {
  return state.items.reduce((sum, it) => sum + it.unitPriceCents * it.qty, 0)
}
