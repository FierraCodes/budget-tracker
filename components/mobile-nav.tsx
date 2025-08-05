"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, CreditCard, TrendingUp, Target, Upload, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: TrendingUp,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: BarChart3,
  },
  {
    title: "Goals",
    href: "/goals",
    icon: Target,
  },
//  {
//    title: "Import/Export",
//    href: "/import-export",
//    icon: Upload,
//  },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
            <BarChart3 className="h-6 w-6" />
            <span className="font-bold text-xl">Money Manager</span>
          </Link>
        </div>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary py-2 px-3 rounded-md",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
