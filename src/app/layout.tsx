import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header/Header"
import { PromoBanner } from "@/components/header/PromoBanner"

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-lexend",
})

export const metadata: Metadata = {
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
        <footer className="mt-10 border-t border-border bg-[#13120d] py-6">
          <div className="container text-center text-sm text-white/55">
            © 2023 Bulkup Store. Plus fort chaque jour.
          </div>
        </footer>
      </body>
    </html>
  )
}
