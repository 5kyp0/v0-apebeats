"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Send, Users, Zap, ArrowLeft } from "lucide-react"
import { CommonPageLayout } from "@/components/CommonPageLayout"

export default function BatchPage() {
  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Batch Operations"
      showBackButton={true}
      backButtonText="Back to Home"
      backButtonHref="/"
      icon={<Send className="w-5 h-5 text-primary-foreground" />}
    >
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
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              <span className="text-balance">
                Send{" "}
                <span className="text-gradient-primary drop-shadow-lg">ApeCoin</span>{" "}
                to Multiple Addresses
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/90 sm:text-xl text-balance drop-shadow-md">
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
                <h3 className="font-semibold text-foreground drop-shadow-md">Gas Efficient</h3>
                <p className="text-sm text-foreground/80 text-center drop-shadow-sm">
                  Send to multiple addresses in a single transaction
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 float backdrop-blur-sm border border-primary/30">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground drop-shadow-md">Flexible Amounts</h3>
                <p className="text-sm text-foreground/80 text-center drop-shadow-sm">Equal, random, or custom amounts per recipient</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 swamp-ripple backdrop-blur-sm border border-primary/30">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground drop-shadow-md">Transparent Fees</h3>
                <p className="text-sm text-foreground/80 text-center drop-shadow-sm">Built-in transparency with minimal developer fees</p>
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
    </CommonPageLayout>
  )
}
