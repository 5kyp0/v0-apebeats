"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { ClientOnly } from "@/components/ClientOnly"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  BarChart3,
  ExternalLink,
  Coins,
  Users
} from "lucide-react"
import { useSimpleBatchTransferService } from "@/lib/simpleBatchService"
import { useApeCoinBalance } from "@/hooks/useApeCoinBalance"
import Link from "next/link"

function UserDashboardContent() {
  const account = useActiveAccount()
  const { address: wagmiAddress } = useAccount()
  const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated } = useSafeGlyph()
  const batchService = useSimpleBatchTransferService()
  const { balance: apeBalance, rawBalance: apeRawBalance, loading: balanceLoading, error: balanceError } = useApeCoinBalance()
  
  // Check for any wallet connection
  const isGlyphConnected = !!(glyphReady && glyphAuthenticated && glyphUser?.evmWallet)
  const hasWallet = !!(account?.address || wagmiAddress || isGlyphConnected)
  const currentAddress = account?.address || wagmiAddress || glyphUser?.evmWallet

  const formatBalance = (balance: string) => {
    return batchService.formatAmount(balance)
  }

  if (balanceLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5" />
              APE Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {apeBalance} APE
            </div>
            <div className="text-sm text-muted-foreground">
              Available for transfers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0
            </div>
            <div className="text-sm text-muted-foreground">
              Batch transfers completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recipients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0
            </div>
            <div className="text-sm text-muted-foreground">
              Total addresses sent to
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest batch transfer transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Start your first batch transfer to see activity here</p>
            <Link href="/transfers">
              <Button className="mt-4">
                Start Batch Transfer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common batch transfer operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/transfers">
              <Button className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Coins className="h-6 w-6" />
                <span>Batch Transfer APE</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full h-20 flex flex-col items-center justify-center gap-2"
              disabled
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Track your activity on ApeChain • 
          <Link href="/transfers" className="text-primary hover:underline ml-1">
            Start batch transferring
          </Link>
        </p>
      </div>
    </div>
  )
}

export function UserDashboard() {
  return (
    <ClientOnly fallback={
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ErrorBoundary fallback={
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Component Error</h3>
            <p className="text-sm text-muted-foreground">There was an error loading the dashboard.</p>
          </div>
        </div>
      }>
        <UserDashboardContent />
      </ErrorBoundary>
    </ClientOnly>
  )
}
