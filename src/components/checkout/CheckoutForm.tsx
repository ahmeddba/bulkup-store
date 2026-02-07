"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, User, Crosshair } from "lucide-react"
import { readCart } from "@/lib/cart"
import { openWhatsAppOrder } from "@/lib/whatsapp"

export function CheckoutForm({ currency = "USD" }: { currency?: string }) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [busy, setBusy] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState<string>("")

  const canSubmit = useMemo(() => {
    const items = readCart().items
    return items.length > 0 && fullName.trim() && phone.trim() && address.trim()
  }, [address, fullName, phone])

  const captureGPS = async () => {
    if (!navigator.geolocation) {
      setGpsError("GPS non disponible sur cet appareil")
      return
    }
    
    setGpsLoading(true)
    setGpsError("")
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6)
        const lng = pos.coords.longitude.toFixed(6)
        
        // Create Google Maps link
        const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
        setAddress((prev) => {
          // If address is empty, just set the maps link
          if (!prev.trim()) return mapsLink
          // If there's already a maps link, replace it
          if (prev.includes("google.com/maps")) {
            return prev.replace(/https:\/\/www\.google\.com\/maps\?q=[-\d.]+,[-\d.]+/, mapsLink)
          }
          // Otherwise append to existing address
          return `${prev} | ${mapsLink}`
        })
        
        setGpsLoading(false)
        setGpsError("")
      },
      (error) => {
        setGpsLoading(false)
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("Permission GPS refusée")
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGpsError("Position GPS indisponible")
        } else if (error.code === error.TIMEOUT) {
          setGpsError("Délai d'attente GPS dépassé")
        } else {
          setGpsError("Erreur GPS")
        }

      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const submit = () => {
    setBusy(true)
    try {
      const items = readCart().items
      openWhatsAppOrder(items, currency, {
        fullName,
        whatsappNumber: phone,
        address,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="rounded-xl border-border bg-[#23221b] p-6 shadow-xl shadow-black/40 lg:p-8">
      <div>
        <div className="text-xl font-extrabold text-white">Où livrer ?</div>
        <div className="mt-1 text-sm font-semibold text-white/55">Nous organiserons la livraison via WhatsApp.</div>
      </div>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label className="ml-1 text-xs font-extrabold uppercase tracking-wider text-white/55">Nom Complet</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ex. Marie Dubois"
              className="h-12 bg-[#181711] pl-10 text-white placeholder:text-white/30 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="ml-1 text-xs font-extrabold uppercase tracking-wider text-white/55">Numéro WhatsApp</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="h-12 bg-[#181711] pl-10 text-white placeholder:text-white/30 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="ml-1 text-xs font-extrabold uppercase tracking-wider text-white/55">Adresse de Livraison</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rue, Ville, Code Postal"
                className="h-12 bg-[#181711] pl-10 text-white placeholder:text-white/30 focus-visible:ring-primary"
              />
            </div>
            <Button
              type="button"
              onClick={captureGPS}
              disabled={gpsLoading}
              variant="outline"
              className="h-12 w-12 border-border bg-[#181711] text-primary hover:border-primary hover:bg-primary/10 disabled:opacity-50"
              aria-label="Utiliser mon GPS"
              title="Utiliser mon GPS"
            >
              {gpsLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Crosshair className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* GPS Feedback Messages */}
          {gpsLoading === false && !gpsError && address.includes('google.com/maps') && (
            <div className="ml-1 flex items-center gap-1 text-xs font-semibold text-green-400">
              <span>✓</span>
              <span>Position GPS capturée avec succès</span>
            </div>
          )}
          {gpsError && (
            <div className="ml-1 flex items-center gap-1 text-xs font-semibold text-red-400">
              <span>✗</span>
              <span>{gpsError}</span>
            </div>
          )}
          {!address.includes('google.com/maps') && !gpsError && (
            <div className="ml-1 text-xs italic text-white/45">* Nous confirmerons l'emplacement exact par chat.</div>
          )}
        </div>

        <div className="my-2 h-px bg-border" />

        <div className="flex items-center gap-2 rounded-lg border border-primary/10 bg-primary/5 p-3 text-white/60">
          <span className="text-primary">✓</span>
          <span className="text-xs font-semibold">Aucun paiement requis maintenant. Paiement à la livraison.</span>
        </div>

        <Button
          type="button"
          onClick={submit}
          disabled={!canSubmit || busy}
          className="h-14 w-full rounded-xl bg-primary text-lg font-black text-black shadow-glow-yellow hover:bg-[#ffe033] press"
        >
          Envoyer la Commande via WhatsApp
        </Button>
      </div>
    </Card>
  )
}
