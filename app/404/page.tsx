"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Music, 
  Search, 
  ArrowLeft, 
  Zap, 
  Sun, 
  Moon, 
  Volume2,
  Play,
  ExternalLink,
  AlertTriangle,
  Compass,
  Bug,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from "lucide-react"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { useActiveAccount } from "thirdweb/react"
import useUserStore from "@/stores/userStore"
import LoginInline from "@/components/auth/LoginInline"

// Lazy load components to improve initial page load
const HeaderUser = lazy(() => import("@/components/auth/HeaderUser"))
const NetworkSwitcher = lazy(() => import("@/components/wallet/NetworkSwitcher"))
const MenuDropdown = lazy(() => import("@/components/features/MenuDropdown"))

export default function Custom404Page() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  // Get auth state
  const account = useActiveAccount()
  const email = useUserStore((s: any) => s.email)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Simulate live beat data
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        setCurrentBeat((prev) => (prev + 1) % 100)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const funMessages = [
    "Looks like this beat got lost in the swamp!",
    "This page is taking a break from the rhythm.",
    "Even the best DJs miss a beat sometimes.",
    "This page went on a sonic adventure.",
    "The swamp swallowed this page whole!",
    "This beat is still being composed.",
    "Lost in the musical dimension.",
    "This page is dancing to its own rhythm."
  ]

  const [randomMessage] = useState(() => 
    funMessages[Math.floor(Math.random() * funMessages.length)]
  )

  // Capture debug information
  const debugInfo = {
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Server',
    referrer: typeof window !== 'undefined' ? document.referrer : 'Server',
    account: account?.address || 'Not connected',
    email: email || 'Not logged in'
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 md:px-8 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ApeBeats
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <button
                onClick={() => window.location.href = '/'}
                className="hover:text-primary transition-colors cursor-pointer flex items-center space-x-1"
                aria-label="Navigate to Home page"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 p-0"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Suspense fallback={<div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>}>
              <HeaderUser onLoginClick={() => setShowLoginModal(true)} />
            </Suspense>
            <Suspense fallback={<div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>}>
              <MenuDropdown />
            </Suspense>
          </div>
        </nav>
      </header>

      {/* Main 404 Content */}
      <main className="relative z-10 px-6 md:px-8 pt-28 pb-12 md:pt-36 md:pb-20 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Badge */}
          <Badge className="mb-6 bg-destructive/20 text-destructive border-destructive/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Page Not Found
          </Badge>

          {/* Large 404 with fun styling */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                404
              </span>
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Compass className="w-6 h-6 text-muted-foreground" />
              <span className="text-xl md:text-2xl text-muted-foreground">
                {randomMessage}
              </span>
            </div>
          </div>

          {/* Live Beat Visualizer - Same as main page */}
          <Card
            className="mb-12 p-8 bg-card/50 backdrop-blur-sm border-primary/20 max-w-md mx-auto
                       hover:border-primary/40 transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Volume2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Live Beat</span>
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-primary rounded-full transition-all duration-200 ${
                      (currentBeat + i) % 4 === 0 ? 'h-6' : 'h-3'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-2xl font-bold text-primary mb-2">
              {currentBeat.toString().padStart(3, '0')}
            </div>
            <p className="text-sm text-muted-foreground">
              Beats generated from ApeChain data
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/music'}
              className="w-full sm:w-auto"
            >
              <Music className="w-4 h-4 mr-2" />
              Music Engine
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Debug Information Toggle */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Bug className="w-4 h-4 mr-2" />
              {showDebugInfo ? 'Hide' : 'Show'} Debug Info
              {showDebugInfo ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Debug Information */}
          {showDebugInfo && (
            <Card className="p-6 bg-card/30 backdrop-blur-sm border-destructive/20 max-w-2xl mx-auto text-left">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Bug className="w-5 h-5 mr-2 text-destructive" />
                Debug Information
              </h3>
              <div className="space-y-3 text-sm">
                {Object.entries(debugInfo).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between">
                    <span className="font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <div className="flex items-center space-x-2 max-w-xs">
                      <span className="text-right break-all">{String(value)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(String(value), key)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === key ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Helpful Links */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-6 text-muted-foreground">
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:border-primary/50"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">Home</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/music'}
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:border-primary/50"
              >
                <Music className="w-5 h-5" />
                <span className="text-sm">Music</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/mint'}
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:border-primary/50"
              >
                <Zap className="w-5 h-5" />
                <span className="text-sm">Mint NFT</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/snapshot'}
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:border-primary/50"
              >
                <Search className="w-5 h-5" />
                <span className="text-sm">Snapshot</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
        aria-label="Scroll to top"
      >
        <ArrowLeft className="w-5 h-5 rotate-90" />
      </Button>

      {/* Login Modal - Only show if not logged in */}
      {showLoginModal && (!email && !account?.address) && (
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
    </div>
  )
}

