import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { CartButton } from "./CartButton"
import { MobileNavSheet } from "./MobileNavSheet"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { CATEGORIES } from "@/lib/categories"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "text-xs md:text-sm font-semibold text-white/90 transition-colors hover:text-primary focus:outline-none"
          )}
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md py-4">
      <div className="container flex h-[64px] items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={80} height={80} />
        </div>

        <NavigationMenu className="hidden lg:block">
          <NavigationMenuList className="gap-4 xl:gap-8">
            <NavLink href="/">Home</NavLink>
            {CATEGORIES.map((category) => (
              <NavLink key={category.slug} href={`/category/${category.slug}`}>
                {category.label}
              </NavLink>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <MobileNavSheet />
          </div>
          <CartButton />
        </div>
      </div>
    </header>
  )
}
