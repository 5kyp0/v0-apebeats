"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Music, Sun, Moon, ArrowLeft } from "lucide-react"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { useRouter } from "next/navigation"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { ClientOnly } from "@/components/ClientOnly"

// Lazy load components to improve initial page load
const HeaderUser = lazy(() => import("@/components/auth/HeaderUser"))
const NetworkSwitcher = lazy(() => import("@/components/wallet/NetworkSwitcher"))
const MenuDropdown = lazy(() => import("@/components/features/MenuDropdown"))
const LoginInline = lazy(() => import("@/components/auth/LoginInline"))

interface CommonHeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
  icon?: React.ReactNode
  onLoginClick?: () => void
}

function CommonHeaderContent({
  title = "ApeBeats",
  subtitle,
  showBackButton = false,
  backButtonText = "Back to Home",
  backButtonHref = "/",
  icon = <Music className="w-5 h-5 text-primary-foreground" />,
  onLoginClick
}: CommonHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  
  // Get auth state
  const account = useActiveAccount()
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()
  const { user: glyphUser, ready: glyphReady } = useSafeGlyph()
  
  // Check for Glyph connection using the proper SDK method
  const isGlyphConnected = !!(glyphReady && glyphUser?.evmWallet)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Auto-close login modal when user becomes connected
  useEffect(() => {
    if ((account?.address || isGlyphConnected) && showLoginModal) {
      setShowLoginModal(false)
    }
  }, [account?.address, isGlyphConnected, showLoginModal])

  const handleBackClick = () => {
    if (backButtonHref) {
      router.push(backButtonHref)
    }
  }

  return (
    <>
      {/* Network Switcher Banner */}
      <Suspense fallback={null}>
        <NetworkSwitcher />
      </Suspense>

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 bg-background/80 backdrop-blur border-b border-border/50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow" aria-hidden="true">
            {icon}
          </div>
          <span className="text-xl font-bold">{title}</span>
          {subtitle && (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          )}
          <div className="ml-4 flex items-center space-x-4">
            <ErrorBoundary>
              <Suspense fallback={<div className="w-16 h-6 bg-zinc-800 rounded animate-pulse" />}>
                <HeaderUser onLoginClick={onLoginClick || (() => setShowLoginModal(true))} />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
              <Suspense fallback={null}>
                <NetworkSwitcher showAlways={true} className="hidden md:flex" />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-6 text-sm">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="hover:text-primary transition-colors cursor-pointer flex items-center space-x-1"
                aria-label={`Navigate to ${backButtonText}`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{backButtonText}</span>
              </button>
            )}
          </div>
          <ErrorBoundary>
            <Suspense fallback={<div className="w-16 h-8 bg-zinc-800 rounded animate-pulse" />}>
              <MenuDropdown />
            </Suspense>
          </ErrorBoundary>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 p-0"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </nav>

      {/* Login Modal - Only show if not logged in */}
      {showLoginModal && (!account?.address && !isGlyphConnected) && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLoginModal(false)
            }
          }}
        >
          <div className="relative max-w-md w-full mx-4">
            <Suspense fallback={<div className="w-full h-96 bg-card rounded-xl animate-pulse" />}>
              <LoginInline onDone={() => setShowLoginModal(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  )
}

export function CommonHeader(props: CommonHeaderProps) {
  return (
    <ClientOnly>
      <CommonHeaderContent {...props} />
    </ClientOnly>
  )
}
