import { Card } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export function BenefitsCard({ benefits }: { benefits: string[] }) {
  return (
    <Card className="rounded-xl border-border bg-[#1a1912] p-5">
      <div className="mb-3 text-sm font-extrabold uppercase tracking-wider text-white">Avantages Clés</div>
      <ul className="space-y-2">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
            <span className="text-sm text-white/80">{b}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
