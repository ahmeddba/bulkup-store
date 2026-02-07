import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header/Header"
import { PromoBanner } from "@/components/header/PromoBanner"
import { StoreLocationMap } from "@/components/home/StoreLocationMap"
import { StickyCartBar } from "@/components/home/StickyCartBar"

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-lexend",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Bulkup Store - Suppléments Premium pour Athlètes",
  description: "Suppléments premium de haute qualité pour athlètes. Protéines, créatine, pré-entraînement et plus. Livraison rapide via WhatsApp - aucun compte requis.",
  keywords: ["suppléments", "protéines", "créatine", "pré-entraînement", "nutrition sportive", "musculation", "fitness"],
  authors: [{ name: "Bulkup Store" }],
  creator: "Bulkup Store",
  publisher: "Bulkup Store",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://bulkup-store.com",
    siteName: "Bulkup Store",
    title: "Bulkup Store - Suppléments Premium pour Athlètes",
    description: "Suppléments premium de haute qualité pour athlètes. Protéines, créatine, pré-entraînement et plus. Livraison rapide via WhatsApp.",
    images: [
      {
        url: "/logoblack.png",
        width: 1200,
        height: 630,
        alt: "Bulkup Store - Suppléments Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bulkup Store - Suppléments Premium pour Athlètes",
    description: "Suppléments premium de haute qualité pour athlètes. Livraison rapide via WhatsApp - aucun compte requis.",
    images: ["/logoblack.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when you set up Google Search Console, etc.
    // google: 'your-google-verification-code',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={lexend.className}>
        <PromoBanner />
        <Header />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <StickyCartBar currency="TND" />
        <footer className="mt-10 border-t border-border bg-[#13120d] py-10">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Info Section */}
              <div>
                <h3 className="text-lg font-black text-white">Bulkup Store</h3>
                <p className="mt-2 text-sm text-white/55">
                  Suppléments premium de haute qualité pour athlètes.
                </p>
                
                {/* Working Hours */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-semibold text-white/55">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" /> Ouvert Lun-Sam: 9h - 21h
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> Dim: Fermé
                  </span>
                </div>
                
                <p className="mt-4 text-sm text-white/55">
                  © 2025 Bulkup Store. Plus fort chaque jour.
                </p>
              </div>
              
              {/* Map Section */}
              <div>
                <h3 className="mb-4 text-lg font-black text-white">Notre Magasin</h3>
                <StoreLocationMap />
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
