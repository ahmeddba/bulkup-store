import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { buildWhatsAppMessage } from "@/lib/whatsapp"
import { shapeProductWithRelations } from "@/lib/product-shape"
import type { CartItem } from "@/lib/cart"

export async function POST(req: Request) {
  try {
    const { items, payload, currency } = await req.json()
    const supabase = await supabaseServer()
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    const productIds = Array.from(new Set(items.map((i: any) => i.productId)))
    
    // Fetch products with relations (brand & category) to reuse shaping code
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('*, categories!inner(id, slug, name, sort_order), brands!inner(id, slug, name, sort_order)')
      .in('id', productIds)

    if (error || !dbProducts) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 400 })
    }

    const verifiedItems: CartItem[] = []
    
    for (const item of items) {
      const rawProduct = dbProducts.find((p) => p.id === item.productId)
      if (!rawProduct) continue;
      
      const shapedProduct = shapeProductWithRelations(rawProduct as any)
      
      let finalPriceTND = shapedProduct.defaultPrice
      let variantLabel = item.variantLabel || ""

      // Attempt to find the specific variant price
      if (item.variantId && item.variantId.startsWith("variant-")) {
        const idx = parseInt(item.variantId.replace("variant-", ""), 10)
        const variant = shapedProduct.variants[idx]
        if (variant && variant.price > 0) {
          finalPriceTND = variant.price
          variantLabel = variant.size || variantLabel
        }
      }

      verifiedItems.push({
        ...item,
        name: shapedProduct.name, // Ensure name is passed accurately
        variantLabel,
        unitPriceCents: Math.round(finalPriceTND * 100),
      })
    }

    if (verifiedItems.length === 0) {
       return NextResponse.json({ error: "No valid items found" }, { status: 400 })
    }

    const storeNumber = process.env.NEXT_PUBLIC_WHATSAPP_STORE_NUMBER
    if (!storeNumber) {
      throw new Error("Missing NEXT_PUBLIC_WHATSAPP_STORE_NUMBER")
    }
    
    const message = buildWhatsAppMessage(verifiedItems, currency || "TND", payload)
    const url = `https://wa.me/${storeNumber}?text=${encodeURIComponent(message)}`
    
    return NextResponse.json({ url })

  } catch (error: any) {
    console.error("Checkout API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
