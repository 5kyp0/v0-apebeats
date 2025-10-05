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
import { useLeaderboardService } from "@/lib/leaderboardService"
import { useApeCoinBalance } from "@/hooks/useApeCoinBalance"
import Link from "next/link"

function UserDashboardContent() {
  const account = useActiveAccount()
  const { address: wagmiAddress } = useAccount()
  const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated } = useSafeGlyph()
  const batchService = useSimpleBatchTransferService()
  const leaderboardService = useLeaderboardService()
  const { balance: apeBalance, rawBalance: apeRawBalance, loading: balanceLoading, error: balanceError } = useApeCoinBalance()
  
  // Check for any wallet connection
  const isGlyphConnected = !!(glyphReady && glyphAuthenticated && glyphUser?.evmWallet)
  const hasWallet = !!(account?.address || wagmiAddress || isGlyphConnected)
  const currentAddress = account?.address || wagmiAddress || glyphUser?.evmWallet

  const [userStats, setUserStats] = useState<{totalTransferred: string, transferCount: number}>({ totalTransferred: "0", transferCount: 0 })
  const [globalStats, setGlobalStats] = useState<{totalVolume: string, totalTransfers: number}>({ totalVolume: "0", totalTransfers: 0 })
  const [currentFee, setCurrentFee] = useState<string>("0.5")
  const [transferHistory, setTransferHistory] = useState<Array<{
    transactionHash: string
    totalAmount: string
    fee: string
    recipientCount: number
    batchId: string
    timestamp: number
    blockNumber: number
  }>>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Load user and global stats
  useEffect(() => {
    const loadStats = async () => {
      if (!currentAddress) return
      
      setIsLoadingStats(true)
      try {
        const [user, global, feeData, history] = await Promise.all([
          batchService.getUserStats(currentAddress as any),
          batchService.getGlobalStats(),
          leaderboardService.getCurrentFeePercentage(),
          batchService.getUserTransferHistory(currentAddress as any, 5) // Get last 5 transfers
        ])
        
        setUserStats(user)
        setGlobalStats(global)
        setCurrentFee(feeData.feePercentage)
        setTransferHistory(history)
        console.log("🔍 Dashboard stats loaded:", { user, global, fee: feeData.feePercentage, history: history.length })
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadStats()
  }, [currentAddress, batchService, leaderboardService])

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
              {isLoadingStats ? "..." : userStats.transferCount}
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
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : formatBalance(userStats.totalTransferred)} APE
            </div>
            <div className="text-sm text-muted-foreground">
              Total amount transferred
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : formatBalance(globalStats.totalVolume)} APE
            </div>
            <div className="text-sm text-muted-foreground">
              All-time volume transferred
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : globalStats.totalTransfers}
            </div>
            <div className="text-sm text-muted-foreground">
              All-time batch transfers
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Current Fee Rate
          </CardTitle>
          <CardDescription>
            The current fee rate for batch transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {isLoadingStats ? "..." : `${currentFee}%`}
            </div>
            <div className="text-sm text-muted-foreground">
              {isLoadingStats ? "Loading..." : "Current fee rate"}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Fee is automatically calculated and deducted from each transfer
            </div>
          </div>
        </CardContent>
      </Card>

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
          {isLoadingStats ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : transferHistory.length > 0 ? (
            <div className="space-y-3">
              {transferHistory.map((transfer, index) => (
                <div key={transfer.transactionHash} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Coins className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        Batch Transfer #{transferHistory.length - index}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transfer.recipientCount} recipient{transfer.recipientCount !== 1 ? 's' : ''} • Block #{transfer.blockNumber}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatBalance(transfer.totalAmount)} APE
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Fee: {formatBalance(transfer.fee)} APE
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const explorerUrl = `https://curtis.apescan.io/tx/${transfer.transactionHash}`
                      window.open(explorerUrl, '_blank')
                    }}
                    title={`View transaction on Curtis Explorer`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
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
          )}
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
