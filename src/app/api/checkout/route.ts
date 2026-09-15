import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { buildWhatsAppMessage } from "@/lib/whatsapp"
import { shapeProductWithRelations } from "@/lib/product-shape"
import { getPackItems } from "@/lib/supabase/queries"
import type { ProductWithRelations } from "@/lib/supabase/queries"
import type { CartItem } from "@/lib/cart"

// ============================================================================
// CONSTANTS
// ============================================================================
const MAX_ITEMS = 50
const MAX_QTY_PER_ITEM = 100
const MAX_PAYLOAD_SIZE = 50_000 // 50 KB

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0
}

function isPositiveInteger(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v > 0
}

/**
 * Validate and sanitize the incoming checkout request body.
 * Returns typed data or throws with a user-safe message.
 */
function parseCheckoutBody(body: unknown): {
  items: Array<{
    productId: string
    variantId: string
    variantLabel: string
    qty: number
    flavor: string
  }>
  payload: { fullName: string; whatsappNumber: string; address: string }
  currency: string
} {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body")
  }

  const { items, payload, currency } = body as Record<string, unknown>

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No items in cart")
  }
  if (items.length > MAX_ITEMS) {
    throw new Error(`Too many items (max ${MAX_ITEMS})`)
  }

  const parsed = items.map((item: unknown, idx: number) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid item at index ${idx}`)
    }
    const it = item as Record<string, unknown>
    if (!isNonEmptyString(it.productId)) throw new Error(`Missing productId at index ${idx}`)
    if (!isNonEmptyString(it.variantId)) throw new Error(`Missing variantId at index ${idx}`)
    if (!isPositiveInteger(it.qty)) throw new Error(`Invalid quantity at index ${idx}`)
    if ((it.qty as number) > MAX_QTY_PER_ITEM) throw new Error(`Quantity too large at index ${idx}`)

    return {
      productId: it.productId as string,
      variantId: it.variantId as string,
      variantLabel: typeof it.variantLabel === "string" ? it.variantLabel : "",
      qty: it.qty as number,
      flavor: typeof it.flavor === "string" ? it.flavor : "",
    }
  })

  // Validate payload
  if (!payload || typeof payload !== "object") {
    throw new Error("Missing checkout payload")
  }
  const p = payload as Record<string, unknown>
  if (!isNonEmptyString(p.fullName)) throw new Error("Missing full name")
  if (!isNonEmptyString(p.whatsappNumber)) throw new Error("Missing WhatsApp number")
  if (!isNonEmptyString(p.address)) throw new Error("Missing address")

  return {
    items: parsed,
    payload: {
      fullName: (p.fullName as string).trim().slice(0, 200),
      whatsappNumber: (p.whatsappNumber as string).trim().slice(0, 30),
      address: (p.address as string).trim().slice(0, 500),
    },
    currency: typeof currency === "string" ? currency : "TND",
  }
}

// ============================================================================
// CHECKOUT HANDLER
// ============================================================================

export async function POST(req: Request) {
  try {
    // Guard against oversized payloads
    const contentLength = req.headers.get("content-length")
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 })
    }

    const rawBody = await req.json()
    const { items, payload, currency } = parseCheckoutBody(rawBody)

    const supabase = await supabaseServer()

    // -----------------------------------------------------------------------
    // 1. Batch-fetch ALL referenced products from authoritative DB
    //    Use LEFT JOIN (no !inner) so packs with brand_id=null are included
    // -----------------------------------------------------------------------
    const productIds = [...new Set(items.map(i => i.productId))]
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select("*, categories(id, slug, name, sort_order), brands(id, slug, name, sort_order)")
      .in("id", productIds)

    if (error || !dbProducts) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // -----------------------------------------------------------------------
    // 2. FAIL-CLOSED: every submitted product must exist in DB
    // -----------------------------------------------------------------------
    const dbProductMap = new Map(dbProducts.map(p => [p.id, p as ProductWithRelations]))

    for (const item of items) {
      if (!dbProductMap.has(item.productId)) {
        return NextResponse.json(
          { error: `Product not found: one or more items in your cart are no longer available. Please refresh and try again.` },
          { status: 400 }
        )
      }
    }

    // -----------------------------------------------------------------------
    // 3. Validate and resolve each item authoritatively
    // -----------------------------------------------------------------------
    const verifiedItems: CartItem[] = []

    for (const item of items) {
      const rawProduct = dbProductMap.get(item.productId)!
      const isPack = rawProduct.product_type === "pack"

      // Stock check
      if (!rawProduct.in_stock) {
        return NextResponse.json(
          { error: `"${rawProduct.name}" is out of stock. Please remove it and try again.` },
          { status: 400 }
        )
      }

      let finalPriceTND: number
      let authorizedLabel: string

      if (isPack) {
        // ─── PACK VALIDATION ───────────────────────────────────────────
        // Pack variant IDs must follow pack-{uuid} format
        if (item.variantId !== `pack-${rawProduct.id}`) {
          return NextResponse.json(
            { error: `Invalid pack reference for "${rawProduct.name}".` },
            { status: 400 }
          )
        }

        // Authoritative price is the DB price, NEVER from client
        finalPriceTND = rawProduct.price

        // Validate pack items exist and are all available
        const packItems = await getPackItems(supabase, rawProduct.id)
        if (packItems.length === 0) {
          return NextResponse.json(
            { error: `Pack "${rawProduct.name}" has no items configured. Contact support.` },
            { status: 400 }
          )
        }

        // Verify every component is available
        for (const pi of packItems) {
          if (!pi.products.in_stock) {
            return NextResponse.json(
              { error: `A component of pack "${rawProduct.name}" ("${pi.products.name}") is out of stock.` },
              { status: 400 }
            )
          }
        }

        authorizedLabel = "Pack"
      } else {
        // ─── STANDARD PRODUCT VALIDATION ────────────────────────────────
        const shaped = shapeProductWithRelations(rawProduct)

        if (item.variantId.startsWith("variant-")) {
          const idx = parseInt(item.variantId.replace("variant-", ""), 10)

          if (isNaN(idx) || idx < 0 || idx >= shaped.variants.length) {
            return NextResponse.json(
              { error: `Invalid variant for "${rawProduct.name}". Please refresh and try again.` },
              { status: 400 }
            )
          }

          const authVariant = shaped.variants[idx]

          // Cross-check: if variant has a size label, it MUST match what the client claims
          // This prevents index-swap attacks where variant order changes
          if (authVariant.size && item.variantLabel && authVariant.size !== item.variantLabel) {
            return NextResponse.json(
              { error: `Variant mismatch for "${rawProduct.name}": expected "${authVariant.size}" but received "${item.variantLabel}". Please refresh your cart.` },
              { status: 400 }
            )
          }

          // Check for ambiguous/duplicate variant labels within this product
          const duplicateLabels = shaped.variants.filter(v => v.size === authVariant.size)
          if (duplicateLabels.length > 1) {
            return NextResponse.json(
              { error: `Ambiguous variant data for "${rawProduct.name}". Contact support.` },
              { status: 400 }
            )
          }

          finalPriceTND = authVariant.price
          authorizedLabel = authVariant.size
        } else {
          // No variant specified — use default price
          finalPriceTND = shaped.defaultPrice
          authorizedLabel = shaped.variants[0]?.size || ""
        }

        // Final price sanity check
        if (!finalPriceTND || finalPriceTND <= 0) {
          return NextResponse.json(
            { error: `Cannot resolve price for "${rawProduct.name}". Contact support.` },
            { status: 400 }
          )
        }
      }

      verifiedItems.push({
        productId: rawProduct.id,
        productSlug: rawProduct.slug,
        name: rawProduct.name,       // Authoritative name from DB
        sku: rawProduct.sku || "",
        variantId: item.variantId,
        variantLabel: authorizedLabel, // Authoritative label from DB
        unitPriceCents: Math.round(finalPriceTND * 100),
        qty: item.qty,
        flavor: item.flavor,
      })
    }

    // -----------------------------------------------------------------------
    // 4. Build WhatsApp message with verified data
    // -----------------------------------------------------------------------
    const storeNumber = process.env.NEXT_PUBLIC_WHATSAPP_STORE_NUMBER
    if (!storeNumber) {
      console.error("Missing NEXT_PUBLIC_WHATSAPP_STORE_NUMBER")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const message = buildWhatsAppMessage(verifiedItems, currency, payload)
    const url = `https://wa.me/${storeNumber}?text=${encodeURIComponent(message)}`

    return NextResponse.json({ url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error"
    // Log server-side only, do not expose stack trace
    console.error("Checkout API error:", err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
