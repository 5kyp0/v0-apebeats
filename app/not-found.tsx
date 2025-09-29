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

// Lazy load components to improve initial page load
const HeaderUser = lazy(() => import("@/components/auth/HeaderUser"))
const NetworkSwitcher = lazy(() => import("@/components/wallet/NetworkSwitcher"))
const MenuDropdown = lazy(() => import("@/components/features/MenuDropdown"))

export default function NotFound() {
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
    url: typeof window !== 'undefined' ? window.location.href : 'N/A',
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
    search: typeof window !== 'undefined' ? window.location.search : 'N/A',
    hash: typeof window !== 'undefined' ? window.location.hash : 'N/A',
    referrer: typeof document !== 'undefined' ? document.referrer || 'Direct navigation' : 'N/A',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A',
    isAuthenticated: !!(email || account?.address),
    walletAddress: account?.address || 'Not connected',
    email: email || 'Not provided',
    errorType: '404 Not Found',
    errorMessage: 'Page not found - route does not exist'
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const quickActions = [
    {
      icon: <Home className="w-5 h-5" />,
      title: "Home",
      description: "Return to the Sonic Swamp Hub",
      action: () => window.location.href = '/',
      color: "from-primary to-accent"
    },
    {
      icon: <Music className="w-5 h-5" />,
      title: "Music Engine",
      description: "Try the generative music",
      action: () => window.location.href = '/music',
      color: "from-accent to-primary"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Mint Genesis",
      description: "Claim your NFT artifact",
      action: () => window.location.href = '/mint',
      color: "from-primary to-accent"
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Explore",
      description: "Discover more beats",
      action: () => window.location.href = '/snapshot',
      color: "from-accent to-primary"
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Same background as main page */}
      <div
        className="fixed inset-0 opacity-30 dark:opacity-25 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "center center",
          zIndex: 2,
          willChange: "transform",
        }}
      ></div>

      {/* Same floating elements as main page */}
      <div className="fixed inset-0 opacity-20 dark:opacity-15" style={{ zIndex: 1, willChange: "transform" }}>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/40 to-pink-500/40 dark:from-purple-500/25 dark:to-pink-500/25 rounded-full blur-xl float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-lg float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-500/30 to-red-500/30 dark:from-orange-500/15 dark:to-red-500/15 rounded-full blur-2xl float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-purple-500/35 to-pink-500/35 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl psychedelic-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-2xl psychedelic-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Network Switcher Banner */}
      <Suspense fallback={null}>
        <NetworkSwitcher />
      </Suspense>

      {/* Same header as main page */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 bg-background/80 backdrop-blur border-b border-border/50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow" aria-hidden="true">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ApeBeats</span>
          <div className="ml-4 flex items-center space-x-4">
            <ErrorBoundary>
              <Suspense fallback={<div className="w-16 h-6 bg-zinc-800 rounded animate-pulse" />}>
                <HeaderUser onLoginClick={() => setShowLoginModal(true)} />
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
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <button
              onClick={() => window.location.href = '/'}
              className="hover:text-primary transition-colors cursor-pointer"
              aria-label="Navigate to Home"
            >
              Home
            </button>
            <button
              onClick={() => window.location.href = '/music'}
              className="hover:text-primary transition-colors cursor-pointer"
              aria-label="Navigate to Music Engine"
            >
              Music
            </button>
            <button
              onClick={() => window.location.href = '/mint'}
              className="hover:text-primary transition-colors cursor-pointer"
              aria-label="Navigate to Mint"
            >
              Mint
            </button>
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
            className="mb-12 p-8 bg-card/50 backdrop-blur-sm border-primary/20 max-w-md mx-auto"
            role="region"
            aria-label="Live beat visualizer"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button
                size="lg"
                className="rounded-full w-16 h-16 pulse-glow"
                aria-label="Play music"
                disabled
              >
                <Play className="w-6 h-6" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Volume2 className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground">Lost in the Swamp</span>
                </div>
                <div
                  className="h-2 bg-secondary rounded-full overflow-hidden"
                  role="progressbar"
                  aria-label="Beat progress"
                >
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                    style={{ width: `${currentBeat % 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-accent font-mono">ERROR</div>
                <div className="text-muted-foreground">404</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-mono">BPM</div>
                <div className="text-muted-foreground">Lost</div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8">Find Your Way Back</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 cursor-pointer group"
                  onClick={action.action}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      action.action()
                    }
                  }}
                >
                  <div className={`text-primary mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Debug Information Section */}
          <div className="mb-12">
            <Card className="p-6 bg-card/30 backdrop-blur-sm border-destructive/20">
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-card/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Bug className="w-5 h-5 text-destructive" />
                  <div className="text-left">
                    <h3 className="font-semibold text-destructive">Debug Information</h3>
                    <p className="text-sm text-muted-foreground">Click to view error details and debugging info</p>
                  </div>
                </div>
                {showDebugInfo ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {showDebugInfo && (
                <div className="mt-4 space-y-4 border-t border-border/50 pt-4">
                  <div className="grid gap-3">
                    {Object.entries(debugInfo).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono text-muted-foreground uppercase tracking-wide">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-sm text-foreground break-all mt-1">
                            {value}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(String(value), key)}
                          className="ml-2 flex-shrink-0"
                        >
                          {copiedField === key ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-semibold text-destructive mb-2">Full Debug JSON</h4>
                    <pre className="text-xs text-muted-foreground overflow-x-auto">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(debugInfo, null, 2), 'json')}
                      className="mt-2"
                    >
                      {copiedField === 'json' ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Main Action Buttons */}
          <div className="max-w-md mx-auto space-y-4">
            <Button
              size="lg"
              className="w-full px-12 py-6 text-lg pulse-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              onClick={() => window.location.href = '/'}
              aria-label="Return to ApeBeats home page"
            >
              <Home className="w-5 h-5 mr-2" aria-hidden="true" />
              Back to the Swamp
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full px-12 py-6 text-lg bg-card/50 backdrop-blur-sm border-primary/30 hover:border-primary/50"
              onClick={() => window.history.back()}
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Go Back
            </Button>
          </div>

          {/* Fun Footer Message */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Even the best Voyagers get lost in the Sonic Swamp sometimes.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center" aria-hidden="true">
                <Music className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">ApeBeats</span>
              <span className="text-muted-foreground">• Sonic Swamp Hub</span>
            </div>
          </div>
        </div>
      </main>

      {/* Login Modal - Same as main page */}
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
              <div className="bg-card rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Join the Swamp</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet or sign in to access all features.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowLoginModal(false)} variant="outline" className="flex-1">
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      window.location.href = '/'
                      setShowLoginModal(false)
                    }}
                    className="flex-1"
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
