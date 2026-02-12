"use client"

import { cn } from "@/lib/utils"

export function FlavorSelector({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (flavor: string) => void
}) {
  if (!options || options.length === 0) return null

  return (
    <div className="mb-6">
      <div className="mb-2 text-sm font-extrabold text-white">Saveur</div>
      <div className="flex flex-wrap gap-3">
        {options.map((flavor) => {
          const selected = flavor === value
          return (
            <button
              key={flavor}
              onClick={() => onChange(flavor)}
              className={cn(
                "rounded-lg px-4 py-3 text-sm font-extrabold transition-colors",
                selected
                  ? "border-2 border-primary bg-primary text-black hover:bg-[#ffe144]"
                  : "border border-border bg-transparent text-white/65 hover:border-white/40 hover:text-white"
              )}
              type="button"
            >
              {flavor}
            </button>
          )
        })}
      </div>
    </div>
  )
}
