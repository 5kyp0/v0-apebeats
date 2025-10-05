"use client"

import { 
  readContract,
  getContract,
  getContractEvents,
  type Address
} from "thirdweb"
import { 
  thirdwebClient, 
  apeChainThirdweb, 
  getBatchTransferContract,
  APE_TOKEN_ADDRESS 
} from "./thirdweb"
import { alchemyEventService } from "./alchemyService"

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
  private cache: {
    leaderboard: LeaderboardEntry[] | null
    globalStats: GlobalStats | null
    userStats: Map<string, UserStats>
    lastUpdated: number
  }
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.cache = {
      leaderboard: null,
      globalStats: null,
      userStats: new Map(),
      lastUpdated: 0
    }
  }

  static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService()
    }
    return LeaderboardService.instance
  }

  private isCacheValid(): boolean {
    return Date.now() - this.cache.lastUpdated < this.CACHE_DURATION
  }

  private updateCacheTimestamp(): void {
    this.cache.lastUpdated = Date.now()
  }

  private clearCache(): void {
    this.cache.leaderboard = null
    this.cache.globalStats = null
    this.cache.userStats.clear()
    this.cache.lastUpdated = 0
  }

  /**
   * Get global statistics from the contract
   */
  async getGlobalStats(): Promise<GlobalStats> {
    // Check cache first
    if (this.cache.globalStats && this.isCacheValid()) {
      return this.cache.globalStats
    }

    try {
      console.log("🔍 Fetching global stats...")
      const contract = getBatchTransferContract()
      console.log("🔍 Contract for global stats:", {
        address: contract.address,
        chainId: contract.chain.id
      })
      
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

      console.log("🔍 Global stats fetched:", {
        totalVolume: totalVolume.toString(),
        totalTransfers: Number(totalTransfers)
      })

      const stats = {
        totalVolume: totalVolume.toString(),
        totalTransfers: Number(totalTransfers)
      }

      // Update cache
      this.cache.globalStats = stats
      this.updateCacheTimestamp()

      return stats
    } catch (error) {
      console.error("Error getting global stats:", error)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      return { totalVolume: "0", totalTransfers: 0 }
    }
  }

  /**
   * Get user statistics from the contract
   */
  async getUserStats(userAddress: Address): Promise<UserStats> {
    const addressKey = userAddress.toLowerCase()
    
    // Check cache first
    if (this.cache.userStats.has(addressKey) && this.isCacheValid()) {
      return this.cache.userStats.get(addressKey)!
    }

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

      const stats = {
        totalTransferred: totalTransferred.toString(),
        transferCount: Number(transferCount)
      }

      // Update cache
      this.cache.userStats.set(addressKey, stats)
      this.updateCacheTimestamp()

      return stats
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
    
    // Handle very small scientific notation amounts
    if (amount.includes('e-')) {
      const num = parseFloat(amount)
      if (num < 1e-15) {
        return "0." + "0".repeat(displayDecimals)
      }
      // Convert to BigInt representation
      const amountBigInt = BigInt(Math.floor(num * Math.pow(10, decimals)))
      return this.formatAmount(amountBigInt.toString(), decimals, displayDecimals)
    }
    
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
   * Get current fee percentage from contract
   */
  async getCurrentFeePercentage(): Promise<{
    feeBps: number
    feePercentage: string
    error?: string
  }> {
    try {
      console.log("🔍 Fetching current fee from contract...")
      
      const contract = getBatchTransferContract()
      
      const feeBps = await readContract({
        contract,
        method: "function feeBps() view returns (uint256)",
        params: []
      })
      
      const feeBpsNumber = Number(feeBps)
      const feePercentage = (feeBpsNumber / 100).toFixed(1) // Convert basis points to percentage
      
      console.log("🔍 Current fee:", feeBpsNumber, "bps =", feePercentage + "%")
      
      return {
        feeBps: feeBpsNumber,
        feePercentage
      }
    } catch (error) {
      console.error("🔍 Error fetching fee:", error)
      return {
        feeBps: 50, // Default fallback
        feePercentage: "0.5",
        error: error.message
      }
    }
  }

  /**
   * Get real leaderboard data by querying transfer events
   */
  async getRealLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      console.log("🔍 Attempting to fetch real leaderboard data...")
      
      // First, try Alchemy
      console.log("🔍 Trying Alchemy event querying...")
      try {
        const alchemyLeaderboard = await alchemyEventService.getLeaderboardFromEvents()
        if (alchemyLeaderboard.length > 0) {
          console.log("🔍 ✅ Alchemy successfully provided leaderboard data:", alchemyLeaderboard.length, "entries")
          return alchemyLeaderboard
        } else {
          console.log("🔍 ⚠️ Alchemy returned no events, trying Thirdweb fallback...")
        }
      } catch (alchemyError) {
        console.log("🔍 ❌ Alchemy failed:", alchemyError.message)
        console.log("🔍 Trying Thirdweb fallback...")
      }
      
      // Fallback to Thirdweb
      console.log("🔍 Trying Thirdweb event querying...")
      const contract = getBatchTransferContract()
      console.log("🔍 Contract obtained:", {
        address: contract.address,
        chainId: contract.chain.id,
        chainName: contract.chain.name
      })
      
      // Try to query events with a more specific block range to avoid API issues
      console.log("🔍 Querying BatchTransferExecuted events...")
      
      // First, try to get the current block number to limit the query range
      let events = []
      try {
        // Try with a smaller block range first (last 1000 blocks)
        events = await getContractEvents({
          contract,
          eventName: "BatchTransferExecuted",
          fromBlock: "latest" - 1000n, // Last 1000 blocks
          toBlock: "latest"
        })
        console.log("🔍 Events found (last 1000 blocks):", events.length)
      } catch (eventError) {
        console.log("🔍 Event query failed with error:", eventError.message)
        console.log("🔍 This is likely due to Thirdweb API limitations on Curtis testnet")
        
        // Try alternative approach with different parameters
        try {
          console.log("🔍 Trying with different event query parameters...")
          events = await getContractEvents({
            contract,
            eventName: "BatchTransferExecuted",
            fromBlock: 0, // Start from block 0
            toBlock: "latest"
          })
          console.log("🔍 Events found (from block 0):", events.length)
        } catch (alternativeError) {
          console.log("🔍 Alternative event query also failed:", alternativeError.message)
          console.log("🔍 Thirdweb API appears to be having issues with this contract/network")
          return []
        }
      }

      if (events.length === 0) {
        console.log("🔍 No events found, this could mean:")
        console.log("🔍 1. No transfers have been made yet")
        console.log("🔍 2. Thirdweb API is not indexing this contract properly")
        console.log("🔍 3. The contract events are not being emitted correctly")
        return []
      }

      console.log("🔍 Sample event:", events[0])

      // Aggregate data by user address
      const userStats = new Map<string, { totalTransferred: bigint, transferCount: number }>()
      
      for (const event of events) {
        // Check if event has the expected structure
        if (!event.args || !event.args.sender || !event.args.totalAmount) {
          console.log("🔍 Skipping event with missing args:", event)
          continue
        }
        
        const sender = event.args.sender as string
        const totalAmount = event.args.totalAmount
        
        // Convert to BigInt if it's not already, with proper error handling
        let totalAmountBigInt: bigint
        try {
          if (typeof totalAmount === 'bigint') {
            totalAmountBigInt = totalAmount
          } else if (totalAmount !== null && totalAmount !== undefined) {
            totalAmountBigInt = BigInt(totalAmount.toString())
          } else {
            console.log("🔍 Skipping event with null/undefined totalAmount:", event)
            continue
          }
        } catch (conversionError) {
          console.log("🔍 Error converting totalAmount to BigInt:", conversionError, "totalAmount:", totalAmount)
          continue
        }
        
        console.log("🔍 Processing event:", { sender, totalAmount: totalAmountBigInt.toString() })
        
        if (userStats.has(sender)) {
          const stats = userStats.get(sender)!
          stats.totalTransferred += totalAmountBigInt
          stats.transferCount += 1
        } else {
          userStats.set(sender, {
            totalTransferred: totalAmountBigInt,
            transferCount: 1
          })
        }
      }

      console.log("🔍 User stats aggregated:", userStats.size, "users")

      // Convert to leaderboard entries and sort by total transferred
      const entries: LeaderboardEntry[] = Array.from(userStats.entries())
        .map(([address, stats]) => ({
          address,
          totalTransferred: this.formatAmount(stats.totalTransferred.toString(), 18, 3),
          transferCount: stats.transferCount,
          rank: 0 // Will be set after sorting
        }))
        .sort((a, b) => parseFloat(b.totalTransferred) - parseFloat(a.totalTransferred))
        .slice(0, 10) // Top 10 users

      // Set ranks
      entries.forEach((entry, index) => {
        entry.rank = index + 1
      })

      console.log("🔍 Final leaderboard entries:", entries)
      return entries
    } catch (error) {
      console.error("Error fetching real leaderboard data:", error)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      // Fallback to mock data if real data fails
      return []
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
   * Get leaderboard data from real blockchain events
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Check cache first
    if (this.cache.leaderboard && this.isCacheValid()) {
      return this.cache.leaderboard
    }

    try {
      // Try to get real data first
      const realData = await this.getRealLeaderboard()
      
      // If we have real data, cache and return it
      if (realData.length > 0) {
        this.cache.leaderboard = realData
        this.updateCacheTimestamp()
        return realData
      }
      
      // If no real data from events, try alternative approach
      console.log("No events found, trying alternative data source...")
      const alternativeData = await this.getAlternativeLeaderboard()
      
      if (alternativeData.length > 0) {
        this.cache.leaderboard = alternativeData
        this.updateCacheTimestamp()
        return alternativeData
      }
      
      // Fallback to mock data if no real data is available
      console.log("No real transfer data found, using mock data for demonstration")
      const mockData = await this.getMockLeaderboard()
      this.cache.leaderboard = mockData
      this.updateCacheTimestamp()
      return mockData
    } catch (error) {
      console.error("Error getting leaderboard:", error)
      // Fallback to mock data on error
      const mockData = await this.getMockLeaderboard()
      this.cache.leaderboard = mockData
      this.updateCacheTimestamp()
      return mockData
    }
  }

  /**
   * Alternative approach: Try to get individual user data using a different method
   * Since the Thirdweb API is failing, we'll try to query known addresses
   */
  async getAlternativeLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      console.log("🔍 Trying alternative leaderboard approach...")
      
      // Get global stats to confirm there's activity
      const globalStats = await this.getGlobalStats()
      
      if (globalStats.totalTransfers === 0) {
        console.log("🔍 No transfers found in global stats")
        return []
      }
      
      console.log("🔍 Global stats show activity:", globalStats)
      
      // Try to get individual user stats for some common addresses
      // This is a workaround since we can't get all users from events
      const contract = getBatchTransferContract()
      const entries: LeaderboardEntry[] = []
      
      // Try to get stats for some known addresses (you can add more)
      // These are addresses that might have made transfers
      const knownAddresses = [
        "0x32cDaA9429365153Cf7BE048f42152945d99399d", // Deployer address from deployment
        "0x6481Ed1233f0d03B4d97364fE184B165FaC393e0", // Another address from deployment
        // Add more addresses here if you know users who have made transfers
        // You can get these from transaction history or by asking users
      ]
      
      console.log("🔍 Checking known addresses for user stats...")
      
      for (const address of knownAddresses) {
        try {
          const [totalTransferred, transferCount] = await Promise.all([
            readContract({
              contract,
              method: "function userTotalTransferred(address user) view returns (uint256)",
              params: [address]
            }),
            readContract({
              contract,
              method: "function userTransferCount(address user) view returns (uint256)",
              params: [address]
            })
          ])
          
          if (Number(totalTransferred) > 0) {
            entries.push({
              address,
              totalTransferred: this.formatAmount(totalTransferred.toString(), 18, 3),
              transferCount: Number(transferCount),
              rank: 0 // Will be set after sorting
            })
            console.log("🔍 Found user with transfers:", { address, totalTransferred: totalTransferred.toString(), transferCount: Number(transferCount) })
          }
        } catch (userError) {
          console.log("🔍 Error checking user stats for", address, ":", userError.message)
        }
      }
      
      // Sort by total transferred and set ranks
      entries.sort((a, b) => parseFloat(b.totalTransferred) - parseFloat(a.totalTransferred))
      entries.forEach((entry, index) => {
        entry.rank = index + 1
      })
      
      console.log("🔍 Alternative leaderboard entries found:", entries.length)
      
      // If we found individual users, return them
      if (entries.length > 0) {
        return entries
      }
      
      // Otherwise, return aggregated data
      console.log("🔍 No individual users found, returning aggregated data")
      return [
        {
          address: "0x0000000000000000000000000000000000000000", // Placeholder
          totalTransferred: this.formatAmount(globalStats.totalVolume, 18, 3),
          transferCount: globalStats.totalTransfers,
          rank: 1
        }
      ]
    } catch (error) {
      console.error("Error in alternative leaderboard:", error)
      return []
    }
  }

  /**
   * Debug method to check contract connectivity and event emission
   */
  async debugContractStatus(): Promise<{
    contractConnected: boolean
    globalStats: any
    thirdwebEventQueryWorking: boolean
    alchemyEventQueryWorking: boolean
    alchemyConnectionWorking: boolean
    sampleEvent: any
    error?: string
  }> {
    try {
      console.log("🔍 Debugging contract status...")
      
      const contract = getBatchTransferContract()
      console.log("🔍 Contract info:", {
        address: contract.address,
        chainId: contract.chain.id,
        chainName: contract.chain.name
      })
      
      // Test 1: Check if we can read global stats
      const globalStats = await this.getGlobalStats()
      console.log("🔍 Global stats readable:", globalStats)
      
      // Test 2: Try Alchemy connection
      let alchemyConnectionWorking = false
      let alchemyEventQueryWorking = false
      try {
        const alchemyTest = await alchemyEventService.testConnection()
        alchemyConnectionWorking = alchemyTest.connected
        console.log("🔍 Alchemy connection:", alchemyTest.connected ? "✅ Working" : "❌ Failed")
        
        if (alchemyTest.connected) {
          try {
            const alchemyEvents = await alchemyEventService.getBatchTransferEvents()
            alchemyEventQueryWorking = true
            console.log("🔍 Alchemy event query: ✅ Working, found", alchemyEvents.length, "events")
          } catch (alchemyEventError) {
            console.log("🔍 Alchemy event query: ❌ Failed:", alchemyEventError.message)
          }
        }
      } catch (alchemyError) {
        console.log("🔍 Alchemy test failed:", alchemyError.message)
      }
      
      // Test 3: Try to query events with Thirdweb
      let thirdwebEventQueryWorking = false
      let sampleEvent = null
      try {
        const events = await getContractEvents({
          contract,
          eventName: "BatchTransferExecuted",
          fromBlock: "latest" - 100n, // Last 100 blocks
          toBlock: "latest"
        })
        thirdwebEventQueryWorking = true
        sampleEvent = events[0] || null
        console.log("🔍 Thirdweb event query: ✅ Working, found", events.length, "events")
      } catch (eventError) {
        console.log("🔍 Thirdweb event query: ❌ Failed:", eventError.message)
      }
      
      return {
        contractConnected: true,
        globalStats,
        thirdwebEventQueryWorking,
        alchemyEventQueryWorking,
        alchemyConnectionWorking,
        sampleEvent
      }
    } catch (error) {
      console.error("🔍 Contract debug failed:", error)
      return {
        contractConnected: false,
        globalStats: null,
        thirdwebEventQueryWorking: false,
        alchemyEventQueryWorking: false,
        alchemyConnectionWorking: false,
        sampleEvent: null,
        error: error.message
      }
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
      // Clear cache to force fresh data
      this.clearCache()
      
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
