import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format value as Tunisian Dinar (DT)
 * - Shows minimal decimals (none for integers, up to 2 for decimals)
 * - Uses "DT" suffix
 * - Handles null/undefined as 0
 */
export function formatTND(value: number | string | null | undefined): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return "0 DT"
  }

  // Convert to number if string
  const num = typeof value === "string" ? parseFloat(value) : value

  // Handle NaN
  if (isNaN(num)) {
    return "0 DT"
  }

  // Format with minimal decimals
  // If it's an integer, show no decimals
  // If it has decimals, show up to 2, trimmed
  const formatted = num % 1 === 0 
    ? num.toFixed(0) 
    : num.toFixed(2).replace(/\.?0+$/, '') // Remove trailing zeros

  return `${formatted} DT`
}

/**
 * Legacy function for backwards compatibility
 * Converts cents to TND and formats
 * @deprecated Use formatTND with TND values directly
 */
export function formatMoney(cents: number, currency = "TND") {
  const value = cents / 100
  return formatTND(value)
}
