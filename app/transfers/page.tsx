"use client"

import { Suspense, lazy } from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, ArrowLeft, Users, Zap } from "lucide-react"

// Lazy load components
const HeaderUser = lazy(() => import("@/components/HeaderUser"))
const NetworkSwitcher = lazy(() => import("@/components/NetworkSwitcher"))
const MenuDropdown = lazy(() => import("@/components/MenuDropdown"))

export default function TransfersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 bg-background/80 backdrop-blur border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow" aria-hidden="true">
            <Send className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ApeBeats</span>
          <span className="text-sm text-muted-foreground">Batch Transfer</span>
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
                <Send className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Batch Transfer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Send APE tokens to multiple addresses efficiently in a single transaction.
            </p>
          </div>

          {/* Coming Soon Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Multiple Recipients
                </CardTitle>
                <CardDescription>
                  Send to multiple addresses at once
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file or manually add multiple recipient addresses to send APE tokens in a single batch transaction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Gas Optimization
                </CardTitle>
                <CardDescription>
                  Optimized for cost efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Batch transfers are optimized to minimize gas costs compared to individual transactions.
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
