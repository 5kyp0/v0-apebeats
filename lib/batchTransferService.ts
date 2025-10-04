"use client"

import { 
  readContract, 
  prepareContractCall, 
  sendTransaction, 
  getContract,
  getContractEvents,
  type Address
} from "thirdweb"
import { 
  thirdwebClient, 
  apeChainThirdweb, 
  getBatchTransferContract,
  getApeTokenContract,
  APE_TOKEN_ADDRESS 
} from "./thirdweb"
import { useActiveAccount } from "thirdweb/react"

export interface BatchTransferRecipient {
  address: string
  amount: string
}

export interface BatchTransferOptions {
  recipients: BatchTransferRecipient[]
  mode: 'equal' | 'custom' | 'random'
  equalAmount?: string
  randomMin?: string
  randomMax?: string
  randomSeed?: number
  tokenAddress?: Address // Optional token address, defaults to APE token
}

export interface TransferEstimate {
  totalAmount: string
  fee: string
  totalRequired: string
  gasEstimate?: string
  tokenAddress?: Address
  tokenSymbol?: string
  tokenDecimals?: number
}

export interface SupportedToken {
  address: Address
  symbol: string
  name: string
  decimals: number
  feeBps: number
}

export class BatchTransferService {
  private static instance: BatchTransferService

  private constructor() {}

  static getInstance(): BatchTransferService {
    if (!BatchTransferService.instance) {
      BatchTransferService.instance = new BatchTransferService()
    }
    return BatchTransferService.instance
  }

  /**
   * Get user's token balance for a specific token
   */
  async getBalance(userAddress: Address, tokenAddress?: Address): Promise<string> {
    try {
      const contract = tokenAddress ? this.getTokenContract(tokenAddress) : getApeTokenContract()
      const balance = await readContract({
        contract,
        method: "function balanceOf(address account) view returns (uint256)",
        params: [userAddress]
      })
      return balance.toString()
    } catch (error) {
      console.error("Error getting balance:", error)
      // Return "0" instead of throwing to prevent UI crashes
      return "0"
    }
  }

  /**
   * Get token contract for a specific address
   */
  private getTokenContract(tokenAddress: Address) {
    return getContract({
      client: thirdwebClient,
      chain: apeChainThirdweb,
      address: tokenAddress,
      abi: [
        {
          "type": "function",
          "name": "balanceOf",
          "inputs": [{ "name": "account", "type": "address" }],
          "outputs": [{ "name": "", "type": "uint256" }],
          "stateMutability": "view"
        },
        {
          "type": "function",
          "name": "allowance",
          "inputs": [
            { "name": "owner", "type": "address" },
            { "name": "spender", "type": "address" }
          ],
          "outputs": [{ "name": "", "type": "uint256" }],
          "stateMutability": "view"
        },
        {
          "type": "function",
          "name": "approve",
          "inputs": [
            { "name": "spender", "type": "address" },
            { "name": "amount", "type": "uint256" }
          ],
          "outputs": [{ "name": "", "type": "bool" }],
          "stateMutability": "nonpayable"
        },
        {
          "type": "function",
          "name": "symbol",
          "inputs": [],
          "outputs": [{ "name": "", "type": "string" }],
          "stateMutability": "view"
        },
        {
          "type": "function",
          "name": "name",
          "inputs": [],
          "outputs": [{ "name": "", "type": "string" }],
          "stateMutability": "view"
        },
        {
          "type": "function",
          "name": "decimals",
          "inputs": [],
          "outputs": [{ "name": "", "type": "uint8" }],
          "stateMutability": "view"
        }
      ] as const,
    })
  }

  /**
   * Get user's allowance for the batch transfer contract
   */
  async getAllowance(userAddress: Address, contractAddress: Address, tokenAddress?: Address): Promise<string> {
    try {
      const contract = tokenAddress ? this.getTokenContract(tokenAddress) : getApeTokenContract()
      const allowance = await readContract({
        contract,
        method: "function allowance(address owner, address spender) view returns (uint256)",
        params: [userAddress, contractAddress]
      })
      return allowance.toString()
    } catch (error) {
      console.error("Error getting allowance:", error)
      // Return "0" instead of throwing to prevent UI crashes
      return "0"
    }
  }

  /**
   * Get current fee rate in basis points for a specific token
   */
  async getFeeBps(tokenAddress?: Address): Promise<number> {
    try {
      const contract = getBatchTransferContract()
      
      if (tokenAddress) {
        // Get token-specific fee
        const feeBps = await readContract({
          contract,
          method: "function getTokenFee(address token) view returns (uint256)",
          params: [tokenAddress]
        })
        return Number(feeBps)
      } else {
        // Get default fee
        const feeBps = await readContract({
          contract,
          method: "function feeBps() view returns (uint256)",
          params: []
        })
        return Number(feeBps)
      }
    } catch (error) {
      console.error("Error getting fee BPS:", error)
      return 50 // Default 0.5%
    }
  }

  /**
   * Calculate fee for a given amount and token
   */
  async calculateFee(totalAmount: string, tokenAddress?: Address): Promise<string> {
    try {
      const contract = getBatchTransferContract()
      const fee = await readContract({
        contract,
        method: "function calculateFee(uint256 totalAmount) view returns (uint256)",
        params: [BigInt(totalAmount)]
      })
      return fee.toString()
    } catch (error) {
      console.error("Error calculating fee:", error)
      // Fallback calculation
      const feeBps = await this.getFeeBps(tokenAddress)
      const fee = (BigInt(totalAmount) * BigInt(feeBps)) / BigInt(10000)
      return fee.toString()
    }
  }

  /**
   * Get all supported tokens
   */
  async getSupportedTokens(): Promise<SupportedToken[]> {
    try {
      // For now, we'll return the APE token as the primary supported token
      // In a full implementation, you'd query the contract for all supported tokens
      const apeTokenContract = getApeTokenContract()
      
      const [symbol, name, decimals] = await Promise.all([
        readContract({
          contract: apeTokenContract,
          method: "function symbol() view returns (string)",
          params: []
        }),
        readContract({
          contract: apeTokenContract,
          method: "function name() view returns (string)",
          params: []
        }),
        readContract({
          contract: apeTokenContract,
          method: "function decimals() view returns (uint8)",
          params: []
        })
      ])

      const feeBps = await this.getFeeBps(APE_TOKEN_ADDRESS as Address)

      return [{
        address: APE_TOKEN_ADDRESS as Address,
        symbol: symbol as string,
        name: name as string,
        decimals: Number(decimals),
        feeBps
      }]
    } catch (error) {
      console.error("Error getting supported tokens:", error)
      return []
    }
  }

  /**
   * Check if a token is supported
   */
  async isTokenSupported(tokenAddress: Address): Promise<boolean> {
    try {
      const contract = getBatchTransferContract()
      const isSupported = await readContract({
        contract,
        method: "function isTokenSupported(address token) view returns (bool)",
        params: [tokenAddress]
      })
      return Boolean(isSupported)
    } catch (error) {
      console.error("Error checking token support:", error)
      return false
    }
  }

  /**
   * Estimate transfer costs and requirements
   */
  async estimateTransfer(options: BatchTransferOptions): Promise<TransferEstimate> {
    const tokenAddress = options.tokenAddress || (APE_TOKEN_ADDRESS as Address)
    let totalAmount = BigInt(0)

    if (options.mode === 'equal' && options.equalAmount) {
      totalAmount = BigInt(options.equalAmount) * BigInt(options.recipients.length)
    } else if (options.mode === 'custom') {
      for (const recipient of options.recipients) {
        totalAmount += BigInt(recipient.amount)
      }
    } else if (options.mode === 'random' && options.randomMin && options.randomMax) {
      // For random mode, we'll estimate with average amount
      const minAmount = BigInt(options.randomMin)
      const maxAmount = BigInt(options.randomMax)
      const avgAmount = (minAmount + maxAmount) / BigInt(2)
      totalAmount = avgAmount * BigInt(options.recipients.length)
    }

    const fee = await this.calculateFee(totalAmount.toString(), tokenAddress)
    const totalRequired = totalAmount + BigInt(fee)

    // Get token metadata
    let tokenSymbol = "APE"
    let tokenDecimals = 18
    
    try {
      const tokenContract = this.getTokenContract(tokenAddress)
      const [symbol, decimals] = await Promise.all([
        readContract({
          contract: tokenContract,
          method: "function symbol() view returns (string)",
          params: []
        }),
        readContract({
          contract: tokenContract,
          method: "function decimals() view returns (uint8)",
          params: []
        })
      ])
      tokenSymbol = symbol as string
      tokenDecimals = Number(decimals)
    } catch (error) {
      console.warn("Could not fetch token metadata, using defaults")
    }

    return {
      totalAmount: totalAmount.toString(),
      fee,
      totalRequired: totalRequired.toString(),
      tokenAddress,
      tokenSymbol,
      tokenDecimals
    }
  }

  /**
   * Approve tokens for batch transfer
   */
  async approveTokens(userAddress: Address, amount: string, tokenAddress?: Address): Promise<{ transactionHash: string }> {
    try {
      const tokenContract = tokenAddress ? this.getTokenContract(tokenAddress) : getApeTokenContract()
      const batchTransferContract = getBatchTransferContract()

      const transaction = prepareContractCall({
        contract: tokenContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [batchTransferContract.address, BigInt(amount)]
      })

      const { transactionHash } = await sendTransaction({
        transaction,
        account: userAddress
      })

      // Transaction sent successfully, return the hash
      return { transactionHash }
    } catch (error) {
      console.error("Error approving tokens:", error)
      throw new Error("Failed to approve tokens")
    }
  }

  /**
   * Execute batch transfer with equal amounts
   */
  async batchTransferEqual(
    userAddress: Address,
    recipients: string[],
    amountPerRecipient: string
  ): Promise<{ transactionHash: string }> {
    try {
      const contract = getBatchTransferContract()
      const transaction = prepareContractCall({
        contract,
        method: "function batchTransferEqual(address[] recipients, uint256 amountPerRecipient)",
        params: [recipients, BigInt(amountPerRecipient)]
      })

      const { transactionHash } = await sendTransaction({
        transaction,
        account: userAddress
      })

      // Transaction sent successfully, return the hash
      return { transactionHash }
    } catch (error) {
      console.error("Error executing batch transfer equal:", error)
      throw new Error("Failed to execute batch transfer")
    }
  }

  /**
   * Execute batch transfer with custom amounts
   */
  async batchTransferCustom(
    userAddress: Address,
    recipients: BatchTransferRecipient[]
  ): Promise<{ transactionHash: string }> {
    try {
      const contract = getBatchTransferContract()
      const addresses = recipients.map(r => r.address)
      const amounts = recipients.map(r => BigInt(r.amount))

      const transaction = prepareContractCall({
        contract,
        method: "function batchTransfer(address[] recipients, uint256[] amounts)",
        params: [addresses, amounts]
      })

      const { transactionHash } = await sendTransaction({
        transaction,
        account: userAddress
      })

      // Transaction sent successfully, return the hash
      return { transactionHash }
    } catch (error) {
      console.error("Error executing batch transfer custom:", error)
      throw new Error("Failed to execute batch transfer")
    }
  }

  /**
   * Execute batch transfer with random amounts
   */
  async batchTransferRandom(
    userAddress: Address,
    recipients: string[],
    minAmount: string,
    maxAmount: string,
    seed: number
  ): Promise<{ transactionHash: string }> {
    try {
      const contract = getBatchTransferContract()
      const transaction = prepareContractCall({
        contract,
        method: "function batchTransferRandom(address[] recipients, uint256 minAmount, uint256 maxAmount, uint256 seed)",
        params: [recipients, BigInt(minAmount), BigInt(maxAmount), BigInt(seed)]
      })

      const { transactionHash } = await sendTransaction({
        transaction,
        account: userAddress
      })

      // Transaction sent successfully, return the hash
      return { transactionHash }
    } catch (error) {
      console.error("Error executing batch transfer random:", error)
      throw new Error("Failed to execute batch transfer")
    }
  }

  /**
   * Execute the complete batch transfer flow
   */
  async executeBatchTransfer(
    userAddress: Address,
    options: BatchTransferOptions
  ): Promise<{ transactionHash: string }> {
    const tokenAddress = options.tokenAddress || (APE_TOKEN_ADDRESS as Address)
    
    // First, estimate the transfer
    const estimate = await this.estimateTransfer(options)
    
    // Check if user has enough balance
    const balance = await this.getBalance(userAddress, tokenAddress)
    if (BigInt(balance) < BigInt(estimate.totalRequired)) {
      throw new Error("Insufficient balance")
    }

    // Check allowance and approve if needed
    const batchTransferContract = getBatchTransferContract()
    const allowance = await this.getAllowance(userAddress, batchTransferContract.address, tokenAddress)
    if (BigInt(allowance) < BigInt(estimate.totalRequired)) {
      console.log("Approving tokens...")
      await this.approveTokens(userAddress, estimate.totalRequired, tokenAddress)
    }

    // Execute the appropriate batch transfer method
    const recipients = options.recipients.map(r => r.address)
    
    if (options.mode === 'equal' && options.equalAmount) {
      return await this.batchTransferEqual(userAddress, recipients, options.equalAmount)
    } else if (options.mode === 'custom') {
      return await this.batchTransferCustom(userAddress, options.recipients)
    } else if (options.mode === 'random' && options.randomMin && options.randomMax) {
      const seed = options.randomSeed || Math.floor(Math.random() * 1000000)
      return await this.batchTransferRandom(
        userAddress, 
        recipients, 
        options.randomMin, 
        options.randomMax, 
        seed
      )
    }

    throw new Error("Invalid transfer options")
  }

  /**
   * Get user statistics for leaderboard
   */
  async getUserStats(userAddress: Address): Promise<{totalTransferred: string, transferCount: number}> {
    try {
      const contract = getBatchTransferContract()
      const [totalTransferred, transferCount] = await readContract({
        contract,
        method: "function getUserStats(address user) view returns (uint256 totalTransferred, uint256 transferCount)",
        params: [userAddress]
      })
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
   * Get global statistics for leaderboard
   */
  async getGlobalStats(): Promise<{totalVolume: string, totalTransfers: number}> {
    try {
      const contract = getBatchTransferContract()
      const [totalVolume, totalTransfers] = await readContract({
        contract,
        method: "function getGlobalStats() view returns (uint256 totalVolume, uint256 totalTransfers)",
        params: []
      })
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
   * Format amount for display (with decimals)
   */
  formatAmount(amount: string, decimals: number = 18): string {
    if (amount === "0") return "0.000"
    
    const divisor = BigInt(10 ** decimals)
    const wholePart = BigInt(amount) / divisor
    const fractionalPart = BigInt(amount) % divisor
    
    // Always show exactly 3 decimal places
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
    const formattedFractional = fractionalStr.substring(0, 3)
    
    return `${wholePart}.${formattedFractional}`
  }

  /**
   * Parse amount from user input (with decimals)
   */
  parseAmount(amount: string, decimals: number = 18): string {
    const [whole, fractional = ''] = amount.split('.')
    const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals)
    return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFractional || '0')).toString()
  }

  /**
   * Get transfer events for real-time leaderboard data
   */
  async getTransferEvents(fromBlock?: number) {
    try {
      const contract = getBatchTransferContract()
      const events = await getContractEvents({
        contract,
        eventName: "BatchTransferExecuted",
        fromBlock: fromBlock || "earliest"
      })
      return events
    } catch (error) {
      console.error("Error getting transfer events:", error)
      throw new Error("Failed to get transfer events")
    }
  }

  /**
   * Get recent transfer events for leaderboard updates
   */
  async getRecentTransferEvents(blockRange: number = 1000) {
    try {
      const contract = getBatchTransferContract()
      const latestBlock = await readContract({
        contract,
        method: "function getCurrentBlock() view returns (uint256)",
        params: []
      }).catch(() => BigInt(0)) // Fallback if method doesn't exist
      
      const fromBlock = latestBlock > BigInt(blockRange) 
        ? latestBlock - BigInt(blockRange) 
        : BigInt(0)
      
      return await this.getTransferEvents(Number(fromBlock))
    } catch (error) {
      console.error("Error getting recent transfer events:", error)
      // Fallback to getting all events
      return await this.getTransferEvents()
    }
  }
}

// Hook to use the batch transfer service
export function useBatchTransferService() {
  return BatchTransferService.getInstance()
}
