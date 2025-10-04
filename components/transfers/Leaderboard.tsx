"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { ClientOnly } from "@/components/ClientOnly"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  RefreshCw,
  Crown,
  Medal,
  Award
} from "lucide-react"
import { useLeaderboardService } from "@/lib/leaderboardService"
import { toast } from "sonner"

interface LeaderboardEntry {
  address: string
  totalTransferred: string
  transferCount: number
  rank: number
}

interface GlobalStats {
  totalVolume: string
  totalTransfers: number
}

function LeaderboardContent() {
  const account = useActiveAccount()
  const { address: wagmiAddress } = useAccount()
  const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated } = useSafeGlyph()
  const leaderboardService = useLeaderboardService()
  
  // Check for any wallet connection
  const isGlyphConnected = !!(glyphReady && glyphAuthenticated && glyphUser?.evmWallet)
  const hasWallet = !!(account?.address || wagmiAddress || isGlyphConnected)
  const currentAddress = account?.address || wagmiAddress || glyphUser?.evmWallet
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ totalVolume: "0", totalTransfers: 0 })
  const [userStats, setUserStats] = useState<{totalTransferred: string, transferCount: number}>({ totalTransferred: "0", transferCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load leaderboard data
  useEffect(() => {
    loadLeaderboardData()
  }, [account?.address])

  const loadLeaderboardData = async () => {
    setIsLoading(true)
    try {
      // Load global stats
      const global = await leaderboardService.getGlobalStats()
      setGlobalStats(global)

      // Load user stats if connected
      if (account?.address) {
        const user = await leaderboardService.getUserStats(account.address)
        setUserStats(user)
      }

      // For now, we'll use mock data since we don't have a way to get all users
      // In a real implementation, you'd need an indexer or events to track all users
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          address: "0x1234...5678",
          totalTransferred: "1000.000",
          transferCount: 25,
          rank: 1
        },
        {
          address: "0x2345...6789",
          totalTransferred: "850.500",
          transferCount: 18,
          rank: 2
        },
        {
          address: "0x3456...7890",
          totalTransferred: "720.250",
          transferCount: 15,
          rank: 3
        },
        {
          address: "0x4567...8901",
          totalTransferred: "650.750",
          transferCount: 12,
          rank: 4
        },
        {
          address: "0x5678...9012",
          totalTransferred: "580.000",
          transferCount: 10,
          rank: 5
        }
      ]

      // Add current user if they have stats and aren't already in the list
      if (account?.address && userStats.totalTransferred !== "0") {
        const userEntry: LeaderboardEntry = {
          address: account.address,
          totalTransferred: leaderboardService.formatAmount(userStats.totalTransferred),
          transferCount: userStats.transferCount,
          rank: 0 // Will be calculated
        }
        
        // Insert user into appropriate position
        const allEntries = [...mockLeaderboard, userEntry]
        allEntries.sort((a, b) => parseFloat(b.totalTransferred) - parseFloat(a.totalTransferred))
        
        // Update ranks
        allEntries.forEach((entry, index) => {
          entry.rank = index + 1
        })
        
        setLeaderboard(allEntries.slice(0, 10)) // Top 10
      } else {
        setLeaderboard(mockLeaderboard)
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      toast.error("Failed to load leaderboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await loadLeaderboardData()
    setIsRefreshing(false)
    toast.success("Leaderboard refreshed")
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const formatAddress = (address: string) => {
    if (address === account?.address) {
      return "You"
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isCurrentUser = (address: string) => {
    return address === account?.address
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Batch Transfer Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading leaderboard...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {batchService.formatAmount(globalStats.totalVolume)} APE
            </div>
            <p className="text-sm text-muted-foreground">
              Transferred through batch transfers
            </p>
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
            <div className="text-2xl font-bold text-primary">
              {globalStats.totalTransfers.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              Batch transfers executed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Stats */}
      {account?.address && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-semibold">
                  {batchService.formatAmount(userStats.totalTransferred)} APE
                </div>
                <p className="text-sm text-muted-foreground">Total Transferred</p>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {userStats.transferCount}
                </div>
                <p className="text-sm text-muted-foreground">Batch Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Contributors
              </CardTitle>
              <CardDescription>
                Users with the highest total volume transferred
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.address}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isCurrentUser(entry.address) 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <div>
                    <div className="font-medium">
                      {formatAddress(entry.address)}
                      {isCurrentUser(entry.address) && (
                        <Badge variant="secondary" className="ml-2">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.transferCount} transfers
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {entry.totalTransferred} APE
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function Leaderboard() {
  return (
    <ClientOnly fallback={
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LeaderboardContent />
    </ClientOnly>
  )
}
