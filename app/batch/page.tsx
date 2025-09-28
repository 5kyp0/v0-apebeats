"use client"

import { Suspense, lazy } from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Send, Users, Zap, ArrowLeft } from "lucide-react"

// Lazy load components
const HeaderUser = lazy(() => import("@/components/HeaderUser"))
const NetworkSwitcher = lazy(() => import("@/components/NetworkSwitcher"))
const MenuDropdown = lazy(() => import("@/components/MenuDropdown"))

export default function BatchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Background Image */}
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

      {/* Floating Elements */}
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

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 bg-background/80 backdrop-blur border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow" aria-hidden="true">
            <Send className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ApeBeats</span>
          <span className="text-sm text-muted-foreground">Batch Operations</span>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Mystical Jungle Background */}
        <div className="absolute inset-0 -z-10">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg')",
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
          {/* Subtle glow effects to enhance the mystical atmosphere */}
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl float" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-primary/3 blur-2xl swamp-ripple" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Announcement Badge */}
            <div className="mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium glow-primary">
                <Send className="mr-2 h-4 w-4" />
                {"Batch Sender • Live on ApeChain"}
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              <span className="text-balance">
                Send{" "}
                <span className="text-gradient-primary drop-shadow-lg">ApeCoin</span>{" "}
                to Multiple Addresses
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 sm:text-xl text-balance drop-shadow-md">
              Batch send ApeCoin to multiple addresses in a single, gas-efficient transaction. Configure equal, random, or custom amounts per recipient with built-in transparency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                className="pulse-glow text-lg px-8 py-4"
                onClick={() => window.location.href = '/transfers'}
              >
                Start Batch Send
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 bg-transparent"
                onClick={() => window.location.href = '/dashboard'}
              >
                View Dashboard
              </Button>
            </div>

            {/* Key Features Preview */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 pulse-glow backdrop-blur-sm border border-primary/30">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white drop-shadow-md">Gas Efficient</h3>
                <p className="text-sm text-white/80 text-center drop-shadow-sm">
                  Send to multiple addresses in a single transaction
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 float backdrop-blur-sm border border-primary/30">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white drop-shadow-md">Flexible Amounts</h3>
                <p className="text-sm text-white/80 text-center drop-shadow-sm">Equal, random, or custom amounts per recipient</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 swamp-ripple backdrop-blur-sm border border-primary/30">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white drop-shadow-md">Transparent Fees</h3>
                <p className="text-sm text-white/80 text-center drop-shadow-sm">Built-in transparency with minimal developer fees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="relative z-10 text-center pb-12">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}
