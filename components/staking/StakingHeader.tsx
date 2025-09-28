"use client"

import { Button } from "@/components/ui/button"
import { Music, TrendingUp, Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Suspense, lazy } from "react"

// Lazy load components
const HeaderUser = lazy(() => import("@/components/HeaderUser"))
const NetworkSwitcher = lazy(() => import("@/components/NetworkSwitcher"))
const MenuDropdown = lazy(() => import("@/components/MenuDropdown"))

export function StakingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  return (
    <header ref={headerRef} className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-[100] relative">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center font-bold text-primary-foreground pulse-glow">
            <Music className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">ApeBeats</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
            Features
          </a>
          <a href="#tiers" className="text-muted-foreground hover:text-primary transition-colors">
            Staking Tiers
          </a>
          <a href="/stake/dashboard" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <TrendingUp className="w-4 h-4" />
            Staking Dashboard
          </a>
          <a href="#community" className="text-muted-foreground hover:text-primary transition-colors">
            Community
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Suspense fallback={<div className="w-8 h-8 bg-muted animate-pulse rounded" />}>
            <MenuDropdown />
          </Suspense>
          <Suspense fallback={<div className="w-8 h-8 bg-muted animate-pulse rounded" />}>
            <NetworkSwitcher />
          </Suspense>
          <Suspense fallback={<div className="w-8 h-8 bg-muted animate-pulse rounded" />}>
            <HeaderUser />
          </Suspense>
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 px-0 border border-border hover:bg-primary/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <a 
              href="#features" 
              className="block w-full text-left px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#tiers" 
              className="block w-full text-left px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Staking Tiers
            </a>
            <a 
              href="/stake/dashboard" 
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <TrendingUp className="w-4 h-4" />
              Staking Dashboard
            </a>
            <a 
              href="#community" 
              className="block w-full text-left px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Community
            </a>
            <div className="px-3 py-2 space-y-2">
              <div className="w-full">
                <Suspense fallback={<div className="w-full h-8 bg-muted animate-pulse rounded" />}>
                  <MenuDropdown />
                </Suspense>
              </div>
              <div className="w-full">
                <Suspense fallback={<div className="w-full h-8 bg-muted animate-pulse rounded" />}>
                  <HeaderUser />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
