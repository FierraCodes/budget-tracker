import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import Link from "next/link"
import { Home, CreditCard, TrendingUp, Target, Upload, BarChart3 } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Money Manager",
  description: "Personal finance management application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center space-x-8">
                    {/* Mobile Navigation */}
                    <MobileNav />

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                      <BarChart3 className="h-6 w-6" />
                      <span className="font-bold text-xl">Money Manager</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                      <Link href="/" className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/transactions"
                        className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Transactions</span>
                      </Link>
                      <Link
                        href="/accounts"
                        className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span>Accounts</span>
                      </Link>
                      <Link
                        href="/categories"
                        className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Categories</span>
                      </Link>
                      <Link
                        href="/goals"
                        className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
                      >
                        <Target className="h-4 w-4" />
                        <span>Goals</span>
                      </Link>
                      <Link
                        href="/import-export"
                        className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Import/Export</span>
                      </Link>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
