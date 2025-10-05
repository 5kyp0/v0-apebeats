import { Alchemy, Network, AlchemyConfig } from 'alchemy-sdk'
import { getBatchTransferContract } from './thirdweb'
import { LeaderboardEntry } from './leaderboardService'

// Alchemy configuration for Curtis testnet
const alchemyConfig: AlchemyConfig = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'demo',
  network: Network.ETH_MAINNET, // We'll override this with custom RPC
}

// Create Alchemy instance with custom RPC for Curtis testnet
const alchemy = new Alchemy({
  ...alchemyConfig,
  // Override with Curtis testnet RPC
  url: process.env.NEXT_PUBLIC_RPC_URL || 'https://curtis.rpc.caldera.xyz/http'
})

export class AlchemyEventService {
  private contract: any
  private contractAddress: string

  constructor() {
    this.contract = getBatchTransferContract()
    this.contractAddress = this.contract.address
  }

  /**
   * Get BatchTransferExecuted events using Alchemy
   */
  async getBatchTransferEvents(fromBlock?: number, toBlock?: number): Promise<any[]> {
    try {
      console.log("🔍 [Alchemy] Querying BatchTransferExecuted events...")
      console.log("🔍 [Alchemy] Contract address:", this.contractAddress)
      console.log("🔍 [Alchemy] From block:", fromBlock || "latest")
      console.log("🔍 [Alchemy] To block:", toBlock || "latest")

      // Get the current block number if not specified
      const currentBlock = await alchemy.core.getBlockNumber()
      console.log("🔍 [Alchemy] Current block number:", currentBlock)

      // Set default block range if not provided - use a much larger range to catch older transactions
      const from = fromBlock || Math.max(0, currentBlock - 100000) // Last 100k blocks
      const to = toBlock || currentBlock

      console.log("🔍 [Alchemy] Querying events from block", from, "to", to)

      // Query events using Alchemy
      const events = await alchemy.core.getLogs({
        address: this.contractAddress,
        topics: [
          // BatchTransferExecuted event signature - using the actual hash found in the logs
          "0x2e8ccc829726e36a40b79d6483d9e5040a903dcf7ad331bf796a70c067c3bd84"
        ],
        fromBlock: from,
        toBlock: to
      })

      console.log("🔍 [Alchemy] Found", events.length, "events")

      // If no events found in recent range, try from block 0
      if (events.length === 0 && from > 0) {
        console.log("🔍 [Alchemy] No events in recent range, trying from block 0...")
        const allEvents = await alchemy.core.getLogs({
          address: this.contractAddress,
          topics: [
            // BatchTransferExecuted event signature - using the actual hash found in the logs
            "0x2e8ccc829726e36a40b79d6483d9e5040a903dcf7ad331bf796a70c067c3bd84"
          ],
          fromBlock: 0,
          toBlock: currentBlock
        })
        console.log("🔍 [Alchemy] Found", allEvents.length, "events from block 0")
        events.push(...allEvents)
      }

      // Parse the events
      const parsedEvents = events.map((event, index) => {
        try {
          // Decode the event data
          const decoded = this.decodeBatchTransferEvent(event)
          console.log(`🔍 [Alchemy] Event ${index + 1}:`, decoded)
          return decoded
        } catch (error) {
          console.error(`🔍 [Alchemy] Error parsing event ${index + 1}:`, error)
          return null
        }
      }).filter(Boolean)

      console.log("🔍 [Alchemy] Successfully parsed", parsedEvents.length, "events")
      return parsedEvents

    } catch (error) {
      console.error("🔍 [Alchemy] Error querying events:", error)
      throw error
    }
  }

  /**
   * Decode a BatchTransferExecuted event
   */
  private decodeBatchTransferEvent(event: any) {
    try {
      // Based on the actual events found in the logs, the structure appears to be:
      // BatchTransferExecuted(address indexed sender, address indexed token, uint256 totalAmount, uint256 fee, uint256 recipientCount, bytes32 batchId)
      
      const sender = '0x' + event.topics[1].slice(26) // Remove the 0x and first 24 characters
      const token = '0x' + event.topics[2].slice(26) // Second indexed parameter
      const data = event.data.slice(2) // Remove 0x prefix
      
      // Parse the data (each parameter is 32 bytes = 64 hex characters)
      const totalAmount = BigInt('0x' + data.slice(0, 64))
      const fee = BigInt('0x' + data.slice(64, 128))
      const recipientCount = BigInt('0x' + data.slice(128, 192))
      const batchId = '0x' + data.slice(192, 256)

      return {
        sender,
        token,
        totalAmount: totalAmount.toString(),
        fee: fee.toString(),
        recipientCount: Number(recipientCount),
        batchId,
        timestamp: Math.floor(Date.now() / 1000), // Use current timestamp as fallback
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.logIndex
      }
    } catch (error) {
      console.error("🔍 [Alchemy] Error decoding event:", error)
      throw error
    }
  }

  /**
   * Get leaderboard data using Alchemy events
   */
  async getLeaderboardFromEvents(): Promise<LeaderboardEntry[]> {
    try {
      console.log("🔍 [Alchemy] Getting leaderboard from events...")
      
      const events = await this.getBatchTransferEvents()
      
      if (events.length === 0) {
        console.log("🔍 [Alchemy] No events found")
        return []
      }

      // Aggregate data by sender
      const userStats = new Map<string, { totalTransferred: bigint, transferCount: number }>()

      for (const event of events) {
        const sender = event.sender
        const amount = BigInt(event.totalAmount)
        
        if (userStats.has(sender)) {
          const existing = userStats.get(sender)!
          userStats.set(sender, {
            totalTransferred: existing.totalTransferred + amount,
            transferCount: existing.transferCount + 1
          })
        } else {
          userStats.set(sender, {
            totalTransferred: amount,
            transferCount: 1
          })
        }
      }

      // Convert to leaderboard entries
      const entries: LeaderboardEntry[] = Array.from(userStats.entries())
        .map(([address, stats]) => ({
          address,
          totalTransferred: this.formatAmount(stats.totalTransferred.toString()),
          transferCount: stats.transferCount,
          rank: 0 // Will be set after sorting
        }))
        .sort((a, b) => parseFloat(b.totalTransferred) - parseFloat(a.totalTransferred))
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      console.log("🔍 [Alchemy] Generated leaderboard with", entries.length, "entries")
      return entries

    } catch (error) {
      console.error("🔍 [Alchemy] Error getting leaderboard from events:", error)
      return []
    }
  }

  /**
   * Format amount from wei to APE
   */
  private formatAmount(amountWei: string): string {
    const amount = BigInt(amountWei)
    const apeAmount = Number(amount) / 1e18
    return apeAmount.toFixed(3)
  }

  /**
   * Test Alchemy connectivity
   */
  async testConnection(): Promise<{
    connected: boolean
    currentBlock: number | null
    error?: string
  }> {
    try {
      console.log("🔍 [Alchemy] Testing connection...")
      
      const currentBlock = await alchemy.core.getBlockNumber()
      console.log("🔍 [Alchemy] Connection successful, current block:", currentBlock)
      
      return {
        connected: true,
        currentBlock
      }
    } catch (error) {
      console.error("🔍 [Alchemy] Connection test failed:", error)
      return {
        connected: false,
        currentBlock: null,
        error: error.message
      }
    }
  }
}

// Export singleton instance
export const alchemyEventService = new AlchemyEventService()
