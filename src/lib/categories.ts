/**
 * Single source of truth for product categories
 * Matches the Supabase categories enum
 */

export type Category = {
  slug: string
  label: string
}

/**
 * All valid categories in the system
 * These MUST match the categories stored in the Supabase products table
 */
export const CATEGORIES: Category[] = [
  { slug: "build-muscle", label: "Build Muscle" },
  { slug: "fat-loss", label: "Fat Loss" },
  { slug: "strength-power", label: "Strength & Power" },
  { slug: "recovery", label: "Recovery" },
  { slug: "health-vitamins", label: "Health & Vitamins" },
  { slug: "accessories", label: "Accessories" },
]
