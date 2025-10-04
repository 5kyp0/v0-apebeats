"use client"

import { 
  readContract,
  getContract,
  type Address
} from "thirdweb"
import { 
  thirdwebClient, 
  apeChainThirdweb, 
  getBatchTransferContract,
  APE_TOKEN_ADDRESS 
} from "./thirdweb"

export interface LeaderboardEntry {
  address: string
  totalTransferred: string
  transferCount: number
  rank: number
}

export interface GlobalStats {
  totalVolume: string
  totalTransfers: number
}

export interface UserStats {
  totalTransferred: string
  transferCount: number
}

export class LeaderboardService {
  private static instance: LeaderboardService

  private constructor() {}

  static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService()
    }
    return LeaderboardService.instance
  }

  /**
   * Get global statistics from the contract
   */
  async getGlobalStats(): Promise<GlobalStats> {
    try {
      const contract = getBatchTransferContract()
      
      const [totalVolume, totalTransfers] = await Promise.all([
        readContract({
          contract,
          method: "function totalVolumeTransferred() view returns (uint256)",
          params: []
        }),
        readContract({
          contract,
          method: "function totalTransfersExecuted() view returns (uint256)",
          params: []
        })
      ])

      return {
        totalVolume: totalVolume.toString(),
        totalTransfers: Number(totalTransfers)
      }
    } catch (error) {
      console.error("Error getting global stats:", error)
      return { totalVolume: "0", totalTransfers: 0 }
    }
  }

  /**
   * Get user statistics from the contract
   */
  async getUserStats(userAddress: Address): Promise<UserStats> {
    try {
      const contract = getBatchTransferContract()
      
      const [totalTransferred, transferCount] = await Promise.all([
        readContract({
          contract,
          method: "function userTotalTransferred(address user) view returns (uint256)",
          params: [userAddress]
        }),
        readContract({
          contract,
          method: "function userTransferCount(address user) view returns (uint256)",
          params: [userAddress]
        })
      ])

      return {
        totalTransferred: totalTransferred.toString(),
        transferCount: Number(transferCount)
      }
    } catch (error) {
      console.error("Error getting user stats:", error)
      return { totalTransferred: "0", transferCount: 0 }
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: string, decimals: number = 18, displayDecimals: number = 3): string {
    if (amount === "0") return "0." + "0".repeat(displayDecimals)
    
    try {
      const divisor = BigInt(10 ** decimals)
      const wholePart = BigInt(amount) / divisor
      const fractionalPart = BigInt(amount) % divisor
      
      const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
      const formattedFractional = fractionalStr.substring(0, displayDecimals)
      
      return `${wholePart}.${formattedFractional}`
    } catch (error) {
      console.error("Error formatting amount:", error, "amount:", amount)
      return "0." + "0".repeat(displayDecimals)
    }
  }

  /**
   * Get mock leaderboard data for demonstration
   * In a real implementation, you'd need an indexer or events to track all users
   */
  async getMockLeaderboard(): Promise<LeaderboardEntry[]> {
    // This would be replaced with real data from an indexer or events
    // For now, we'll return mock data to show the UI structure
    return [
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
  }

  /**
   * Get leaderboard data (currently mock, but ready for real data)
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      // For now, return mock data
      // In a real implementation, you would:
      // 1. Query all transfer events from the contract
      // 2. Aggregate data by user address
      // 3. Sort by total transferred amount
      // 4. Return the top users
      
      return await this.getMockLeaderboard()
    } catch (error) {
      console.error("Error getting leaderboard:", error)
      return []
    }
  }

  /**
   * Refresh leaderboard data
   */
  async refreshLeaderboard(): Promise<{
    leaderboard: LeaderboardEntry[]
    globalStats: GlobalStats
    userStats?: UserStats
  }> {
    try {
      const [leaderboard, globalStats] = await Promise.all([
        this.getLeaderboard(),
        this.getGlobalStats()
      ])

      return {
        leaderboard,
        globalStats
      }
    } catch (error) {
      console.error("Error refreshing leaderboard:", error)
      return {
        leaderboard: [],
        globalStats: { totalVolume: "0", totalTransfers: 0 }
      }
    }
  }

  /**
   * Get leaderboard with user stats if address provided
   */
  async getLeaderboardWithUserStats(userAddress?: Address): Promise<{
    leaderboard: LeaderboardEntry[]
    globalStats: GlobalStats
    userStats?: UserStats
  }> {
    try {
      const [leaderboard, globalStats, userStats] = await Promise.all([
        this.getLeaderboard(),
        this.getGlobalStats(),
        userAddress ? this.getUserStats(userAddress) : Promise.resolve(undefined)
      ])

      return {
        leaderboard,
        globalStats,
        userStats
      }
    } catch (error) {
      console.error("Error getting leaderboard with user stats:", error)
      return {
        leaderboard: [],
        globalStats: { totalVolume: "0", totalTransfers: 0 },
        userStats: userAddress ? { totalTransferred: "0", transferCount: 0 } : undefined
      }
    }
  }
}

// Hook to use the leaderboard service
export function useLeaderboardService() {
  return LeaderboardService.getInstance()
}
