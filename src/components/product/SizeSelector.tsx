"use client"

import { cn } from "@/lib/utils"

export type SizeOption = {
  id: string
  label: string
  unitPriceCents: number
}

export function SizeSelector({
  value,
  options,
  onChange,
}: {
  value: string
  options: SizeOption[]
  onChange: (id: string) => void
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-extrabold text-white">Size</div>
      <div className="flex gap-3">
        {options.map((opt) => {
          const selected = opt.id === value
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex-1 rounded-lg px-4 py-3 text-sm font-extrabold transition-colors",
                selected
                  ? "border-2 border-primary bg-primary text-black hover:bg-[#ffe144]"
                  : "border border-border bg-transparent text-white/65 hover:border-white/40 hover:text-white"
              )}
              type="button"
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
