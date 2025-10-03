"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { UserDashboard } from "./UserDashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { ArrowLeft, ExternalLink, BarChart3 } from "lucide-react"
import Link from "next/link"

export function DashboardPage() {
  const [isClient, setIsClient] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const account = useActiveAccount()
  const { address: wagmiAddress } = useAccount()
  const { user: glyphUser, ready: glyphReady } = useSafeGlyph()
  
  useEffect(() => {
    setIsClient(true)
    // Add a small delay to ensure proper hydration
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  
  // Check for any wallet connection
  const isGlyphConnected = !!(glyphReady && glyphUser?.evmWallet)
  const hasWallet = !!(account?.address || wagmiAddress || isGlyphConnected)
  const currentAddress = account?.address || wagmiAddress || glyphUser?.evmWallet

  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Dashboard"
      showBackButton={true}
      backButtonText="Back to Home"
      backButtonHref="/"
      icon={<BarChart3 className="w-5 h-5 text-primary-foreground" />}
      showFooter={false}
    >
      <div className="max-w-4xl mx-auto">
        {!isClient || !isHydrated ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Dashboard
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                View your batch transfer history and monitor transaction analytics.
              </p>
            </div>

            {/* Wallet Connection Status */}
            {!hasWallet && (
              <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardHeader>
                  <CardTitle className="text-orange-700 dark:text-orange-300">
                    Connect Your Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700 dark:text-orange-300">
                    Please connect your wallet to view your dashboard and track your activity.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Dashboard Content */}
            {hasWallet && <UserDashboard />}

            {/* Back to Home */}
            <div className="text-center mt-12">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                asChild
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </CommonPageLayout>
  )
}
