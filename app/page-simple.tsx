"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Volume2, Zap, Music, Users, Coins, ExternalLink, ChevronUp, Sun, Moon, X } from "lucide-react"

export default function ApeBeatLanding() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Simulate live data updates
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const interval = setInterval(() => {
      if (!document.hidden) {
        setCurrentBeat((prev) => (prev + 1) % 100)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowBackToTop(scrollTop > 1000)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  const features = [
    {
      icon: <Music className="w-6 h-6" />,
      title: "24/7 Onchain Beats",
      description:
        "Fully generated lo-fi hip-hop using live ApeChain data - transaction volumes, $APE price, gas fees, and more.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Snapshot NFTs",
      description: "Capture any 5-60 second moment as a unique NFT with synchronized visuals. 0,5 APE per second.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Genesis Collection",
      description: "420 limited Genesis NFTs at 6.9 APE each. Holders get royalty shares and free monthly mints.",
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "True Ownership",
      description: "100% onchain music and video generation. Verifiable, immutable, and owned by you forever.",
    },
  ]

  const handlePlayClick = () => {
    setShowComingSoonPopup(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      <div
        className="fixed inset-0 opacity-30 dark:opacity-25 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "center center",
          zIndex: 2,
        }}
      ></div>

      <div className="fixed inset-0 opacity-20 dark:opacity-15" style={{ zIndex: 1 }}>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/40 to-pink-500/40 dark:from-purple-500/25 dark:to-pink-500/25 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-500/30 to-red-500/30 dark:from-orange-500/15 dark:to-red-500/15 rounded-full blur-2xl"></div>
      </div>

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 bg-background/80 backdrop-blur border-b border-border/50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ApeBeats</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("collections")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Collections
            </button>
            <button
              onClick={() => scrollToSection("roadmap")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Roadmap
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 p-0"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-8 pt-28 pb-12 md:pt-36 md:pb-20" role="banner">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">Sonic Swamp Hub • Coming Soon</Badge>

          <h1 className="text-4xl md:text-7xl font-bold mb-6 text-balance">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              ApeBeats
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
            24/7 lo-fi hip-hop beats generated from live ApeChain data. Capture unique musical moments as NFTs.
          </p>

          {/* Live Beat Visualizer */}
          <Card
            className="mb-12 p-8 bg-card/50 backdrop-blur-sm border-primary/20"
            role="region"
            aria-label="Live beat visualizer"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button
                size="lg"
                onClick={handlePlayClick}
                className="rounded-full w-16 h-16"
              >
                <Play className="w-6 h-6" />
              </Button>
              <div className="flex-1 max-w-md">
                <div className="flex items-center space-x-2 mb-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Live from the Swamp</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                    style={{ width: `${currentBeat % 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-accent font-mono">BLOCK</div>
                <div className="text-muted-foreground">1,234,567</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-mono">BLOCK TIME</div>
                <div className="text-muted-foreground">2.1s</div>
              </div>
              <div className="text-center">
                <div className="text-accent font-mono">GAS</div>
                <div className="text-muted-foreground">15 gwei</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-mono">BPM</div>
                <div className="text-muted-foreground">87</div>
              </div>
            </div>
          </Card>

          <div className="max-w-md mx-auto space-y-4">
            <Button
              size="lg"
              className="w-full px-12 py-6 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              onClick={() => window.open("https://forms.gle/VB4RJsquNwrEnw2d7", "_blank")}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Join the Waitlist
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full px-12 py-6 text-lg bg-card/50 backdrop-blur-sm border-primary/30 hover:border-primary/50"
              onClick={() => window.location.href = '/music'}
            >
              <Music className="w-5 h-5 mr-2" />
              Try the Music Engine
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="relative z-10 px-6 md:px-8 py-20" role="region">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Enter the <span className="text-primary">Sonic Swamp</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Where Voyagers discover Koda artifacts pulsing with ApeChain data, creating eternal lo-fi rhythms in the
              Otherside ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105"
              >
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Popup Modal */}
      {showComingSoonPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="p-8 bg-card border-primary/30 max-w-md mx-4 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComingSoonPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Coming after Genesis</h3>
              <p className="text-muted-foreground mb-6">
                The live stream will be available after the Genesis collection launch. Join the waitlist to be notified!
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setShowComingSoonPopup(false)} variant="outline" className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    window.open("https://forms.gle/VB4RJsquNwrEnw2d7", "_blank")
                    setShowComingSoonPopup(false)
                  }}
                  className="flex-1"
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <ChevronUp className="w-6 h-6 text-primary-foreground" />
        </button>
      )}
    </div>
  )
}
