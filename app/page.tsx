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
  const [randomVideos, setRandomVideos] = useState<string[]>([])
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false)

  const genesisVideos = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/15-jknCr6ApXUldXFHc8cEhDkEkWCAaVw.mp4",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/15-LfgmCMLL4WE8nSYKx8iAvp0zZLkpJ1.mp4",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/35-t1WlZsXxyxYPWH30MXGBFspz5kUKLd.mp4",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7-sX34W5HgZdRY3qMa2G1gZ0vRoy8L1L.mp4",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-goZyJZ8mfkrgMiO20rMRxFAeHsDWt4.mp4",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/33-GEYW8ie6BS4zEpqYkFbgeS9o9T9iYE.mp4",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/40-mN4sKHNKz9T5WG133CLnBEADA9RMuK.mp4",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/25-VAuntrCY9BoMzOvJDUCKHvdk1Ds7Pl.mp4",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/16-iK78dPYs6y4DYkVLKB5TOVqqcxsqeC.mp4",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-ePllyvB0TWKrCSXOJmGknFX59BsaKq.mp4",
  ]

  const getGenesisNumber = (videoSrc: string) => {
    const match = videoSrc.match(/genesis-(\d+)/)
    return match ? match[1] : "1"
  }

  const getRandomVideos = () => {
    const shuffled = [...genesisVideos]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, 4)
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  useEffect(() => {
    setRandomVideos(getRandomVideos())
  }, [])

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBeat((prev) => (prev + 1) % 100)
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
          zIndex: 2, // moved swamp image above color drops
        }}
      ></div>

      <div className="fixed inset-0 opacity-20 dark:opacity-15" style={{ zIndex: 1 }}>
        {" "}
        {/* reduced opacity and moved below swamp image */}
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
        <div
          className="absolute top-1/2 right-1/3 w-56 h-56 bg-gradient-to-r from-orange-500/35 to-red-500/35 dark:from-orange-500/20 dark:to-red-500/20 rounded-full blur-3xl color-shift"
          style={{ animationDelay: "6s" }}
        ></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-yellow-500/30 to-green-500/30 dark:from-yellow-500/15 dark:to-green-500/15 rounded-full blur-3xl color-shift"></div>
        <div
          className="absolute top-1/4 right-1/4 w-52 h-52 bg-gradient-to-r from-lime-500/25 to-emerald-500/25 dark:from-lime-500/12 dark:to-emerald-500/12 rounded-full blur-3xl float"
          style={{ animationDelay: "8s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/3 w-60 h-60 bg-gradient-to-r from-amber-500/30 to-orange-500/30 dark:from-amber-500/15 dark:to-orange-500/15 rounded-full blur-3xl color-shift"
          style={{ animationDelay: "9s" }}
        ></div>
        <div
          className="absolute bottom-1/2 right-1/2 w-48 h-48 bg-gradient-to-r from-teal-500/35 to-cyan-500/35 dark:from-teal-500/20 dark:to-cyan-500/20 rounded-full blur-2xl psychedelic-pulse"
          style={{ animationDelay: "10s" }}
        ></div>
        <div
          className="absolute top-1/5 left-2/3 w-38 h-38 bg-gradient-to-r from-magenta-500/35 to-purple-500/35 dark:from-magenta-500/20 dark:to-purple-500/20 rounded-full blur-2xl psychedelic-pulse"
          style={{ animationDelay: "11s" }}
        ></div>
        <div
          className="absolute bottom-1/5 left-1/5 w-42 h-42 bg-gradient-to-r from-yellow-400/35 to-orange-400/35 dark:from-yellow-400/20 dark:to-orange-400/20 rounded-full blur-2xl color-shift"
          style={{ animationDelay: "12s" }}
        ></div>
        <div
          className="absolute top-4/5 right-1/5 w-34 h-34 bg-gradient-to-r from-green-400/35 to-blue-400/35 dark:from-green-400/20 dark:to-blue-400/20 rounded-full blur-xl float"
          style={{ animationDelay: "13s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav
        className="relative z-50 flex items-center justify-between p-6 md:p-8"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow" aria-hidden="true">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ApeBeats</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-primary transition-colors cursor-pointer"
              aria-label="Navigate to About section"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("collections")}
              className="hover:text-primary transition-colors cursor-pointer"
              aria-label="Navigate to Collections section"
            >
              Collections
            </button>
            <button
              onClick={() => scrollToSection("roadmap")}
              className="hover:text-primary transition-colors cursor-pointer"
              aria-label="Navigate to Roadmap section"
            >
              Roadmap
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-8 py-12 md:py-20" role="banner">
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
                className="rounded-full w-16 h-16 pulse-glow"
                aria-label="Play music"
              >
                <Play className="w-6 h-6" />
              </Button>
              <div className="flex-1 max-w-md">
                <div className="flex items-center space-x-2 mb-2">
                  <Volume2 className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground">Live from the Swamp</span>
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

            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
              role="region"
              aria-label="Live ApeChain data"
            >
              <div className="text-center">
                <div className="text-accent font-mono">$APE</div>
                <div className="text-muted-foreground">$1.23</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-mono">TXN/MIN</div>
                <div className="text-muted-foreground">847</div>
              </div>
              <div className="text-center">
                <div className="text-accent font-mono">GAS</div>
                <div className="text-muted-foreground">0.02</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-mono">BPM</div>
                <div className="text-muted-foreground">87</div>
              </div>
            </div>
          </Card>

          <div className="max-w-md mx-auto">
            <Button
              size="lg"
              className="w-full px-12 py-6 text-lg pulse-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              onClick={() => window.open("https://forms.gle/VB4RJsquNwrEnw2d7", "_blank")}
              aria-label="Join the ApeBeats waitlist"
            >
              <ExternalLink className="w-5 h-5 mr-2" aria-hidden="true" />
              Join the Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="relative z-10 px-6 md:px-8 py-20" role="region" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl md:text-5xl font-bold mb-6">
              Enter the <span className="text-primary">Sonic Swamp</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Where Voyagers discover Koda artifacts pulsing with ApeChain data, creating eternal lo-fi rhythms in the
              Otherside ecosystem. Experience the future of ApeSounds, ApeWaves, and Ape Music.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105"
                role="article"
              >
                <div className="text-primary mb-4" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Genesis Collection Preview Section */}
      <section className="relative z-10 px-6 md:px-8 py-20" role="region" aria-labelledby="genesis-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="genesis-heading" className="text-3xl md:text-5xl font-bold mb-6">
              Genesis Collection Preview
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience the first artifacts from the Sonic Swamp - each one unique, each one eternal. Preview ApeSounds
              and ApeWaves from the Genesis collection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {randomVideos.map((videoSrc, index) => (
              <Card
                key={`${videoSrc}-${index}`} // Use videoSrc in key to ensure proper re-rendering
                className="p-4 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105"
                role="article"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-secondary/20">
                  <video
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    controls
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-label={`Genesis NFT preview ${getGenesisNumber(videoSrc)}`}
                  />
                </div>
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    Genesis #{getGenesisNumber(videoSrc)} {/* This now correctly shows the number from the filename */}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">
              4 random previews from the 420 Genesis collection • Refreshes on page reload
            </p>
            <Button
              variant="outline"
              onClick={() => setRandomVideos(getRandomVideos())}
              className="bg-card/50 backdrop-blur-sm border-primary/30 hover:border-primary/50"
              aria-label="Show different Genesis collection previews"
            >
              Show Different Previews
            </Button>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section
        id="collections"
        className="relative z-10 px-6 md:px-8 py-20"
        role="region"
        aria-labelledby="collections-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="collections-heading" className="text-3xl md:text-5xl font-bold mb-6">
              Two Collections
            </h2>
            <p className="text-lg text-muted-foreground">
              Genesis artifacts and infinite echoes from the Sonic Swamp. Discover ApeSounds, ApeWaves, and Ape Music
              NFTs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30" role="article">
              <Badge className="mb-4 bg-primary/20 text-primary">Limited Edition</Badge>
              <h3 className="text-2xl font-bold mb-4">Genesis Apechain Beats</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supply</span>
                  <span className="font-mono">420 NFTs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-mono">6.9 APE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Royalties</span>
                  <span className="font-mono">4.2%</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Royalty shares on all collections</li>
                <li>• Monthly free mint credits (10s/month)</li>
                <li>• Founding Voyager status</li>
                <li>• Generated from 4 layers of 10 second audio loops</li>
              </ul>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30" role="article">
              <Badge className="mb-4 bg-accent/20 text-accent">Unlimited</Badge>
              <h3 className="text-2xl font-bold mb-4">Apechain Live Beats</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supply</span>
                  <span className="font-mono">Unlimited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-mono">0,5 ape per second</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Royalties</span>
                  <span className="font-mono">6.9%</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Capture 5-60 second moments</li>
                <li>• 100% onchain generation</li>
                <li>• Synchronized video visuals</li>
                <li>• Real-time data snapshots</li>
              </ul>
              <Button className="w-full" disabled>
                After Genesis Launch
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section
        id="roadmap"
        className="relative z-10 px-6 md:px-8 py-20"
        role="region"
        aria-labelledby="roadmap-heading"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="roadmap-heading" className="text-3xl md:text-5xl font-bold mb-6">
              Voyager's Quest
            </h2>
            <p className="text-lg text-muted-foreground">
              The journey through the Sonic Swamp unfolds in phases. Follow the evolution of ApeSounds, ApeWaves, and
              Ape Music.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div
              className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-accent to-primary opacity-30"
              aria-hidden="true"
            ></div>

            <div className="space-y-8">
              {[
                {
                  phase: "Phase 1",
                  title: "Genesis Discovery",
                  status: "Coming Soon",
                  items: [
                    "Genesis Apechain Beats mint (420 NFTs)",
                    "Founding Echo chapter release",
                    "Royalty share on all related drops",
                  ],
                },
                {
                  phase: "Phase 2",
                  title: "Infinite Rhythm",
                  status: "Q? 2026",
                  items: ["24/7 live stream launch", "Apechain Live Beats collection", "Real-time data integration"],
                },
                {
                  phase: "Phase 3",
                  title: "Swamp Evolution",
                  status: "?",
                  items: ["Redacted", "Redacted", "Redacted"],
                },
              ].map((phase, index) => (
                <Card
                  key={index}
                  className="relative p-8 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 ml-12"
                  role="article"
                >
                  <div
                    className="absolute -left-12 top-8 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-4 border-background pulse-glow"
                    aria-hidden="true"
                  >
                    <span className="text-primary-foreground font-bold">{index + 1}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="text-sm text-primary font-semibold mb-1">{phase.phase}</div>
                      <h3 className="text-2xl font-bold">{phase.title}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className="self-start md:self-center mt-2 md:mt-0 bg-accent/10 text-accent border-accent/30"
                    >
                      {phase.status}
                    </Badge>
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <div
                          className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"
                          aria-hidden="true"
                        ></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final Waitlist Section */}
      <section className="relative z-10 px-6 md:px-8 py-20" role="region" aria-labelledby="waitlist-heading">
        <div className="max-w-2xl mx-auto text-center">
          <h2 id="waitlist-heading" className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Enter the Swamp?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the waitlist to be among the first Voyagers to discover the Genesis Apechain Beats collection.
            Experience the future of ApeSounds, ApeWaves, and Ape Music NFTs.
          </p>
          <Button
            size="lg"
            className="px-12 py-6 text-lg pulse-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            onClick={() => window.open("https://forms.gle/VB4RJsquNwrEnw2d7", "_blank")}
            aria-label="Join the ApeBeats waitlist"
          >
            <ExternalLink className="w-5 h-5 mr-2" aria-hidden="true" />
            Join the Waitlist
          </Button>

          <div className="mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToTop}
              className="px-8 py-4 bg-card/50 backdrop-blur-sm border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
              aria-label="Back to top of page"
            >
              <ChevronUp className="w-5 h-5 mr-2" aria-hidden="true" />
              Back to Top
            </Button>
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
              aria-label="Close popup"
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

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-8 py-12 border-t border-border/50" role="contentinfo">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center" aria-hidden="true">
                <Music className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">ApeBeats</span>
              <span className="text-muted-foreground">• Sonic Swamp Hub</span>
            </div>

            <div className="flex items-center justify-center space-x-6">
              <a
                href="https://x.com/CarquetE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow ApeBeats on X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/EAeFftJe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Join ApeBeats Discord community"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9460 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>
              Inspired by the BAYC ecosystem. Built with respect for Yuga Labs and the ape community. Discover
              ApeSounds, ApeWaves, and Ape Music NFTs on ApeChain.
            </p>
          </div>
        </div>
      </footer>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 pulse-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Back to top of page"
        >
          <ChevronUp className="w-6 h-6 text-primary-foreground" />
        </button>
      )}
    </div>
  )
}
