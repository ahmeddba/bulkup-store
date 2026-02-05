import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header/Header"

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-lexend",
})

export const metadata: Metadata = {
  title: "Bulkup Store",
  description: "Suppléments premium livrés via WhatsApp.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={lexend.className}>
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
