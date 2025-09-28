"use client"

import { Suspense, lazy } from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, ArrowLeft, Lock, TrendingUp, Award } from "lucide-react"

// Lazy load components
const HeaderUser = lazy(() => import("@/components/HeaderUser"))
const NetworkSwitcher = lazy(() => import("@/components/NetworkSwitcher"))
const MenuDropdown = lazy(() => import("@/components/MenuDropdown"))

export default function StakePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
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

      <div className="fixed inset-0 opacity-20 dark:opacity-15" style={{ zIndex: 1, willChange: "transform" }}>
        {/* Optimized floating elements - reduced count and complexity for better performance */}
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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 bg-background/80 backdrop-blur border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow" aria-hidden="true">
            <Coins className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ApeBeats</span>
          <span className="text-sm text-muted-foreground">Staking</span>
        </div>
        
        <div className="flex items-center space-x-4">
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
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-8 pt-28 pb-12 md:pt-36 md:pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Coins className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              NFT Staking
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stake your ApeBeats NFTs to earn rewards and participate in the ecosystem.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-500" />
                  Stake NFTs
                </CardTitle>
                <CardDescription>
                  Lock your NFTs to earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Stake your ApeBeats NFTs to earn passive rewards while maintaining ownership of your digital assets.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Rewards & Benefits
                </CardTitle>
                <CardDescription>
                  Earn tokens and unlock exclusive features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Earn native tokens, access exclusive content, and unlock special features by staking your NFTs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Tier System
                </CardTitle>
                <CardDescription>
                  Higher tiers, better rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Staking multiple NFTs unlocks higher tiers with increased reward rates and exclusive benefits.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-blue-500" />
                  Flexible Staking
                </CardTitle>
                <CardDescription>
                  Choose your staking duration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Flexible staking periods with different reward rates. Longer staking periods offer higher rewards.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
