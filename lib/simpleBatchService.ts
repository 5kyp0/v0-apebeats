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
  getApeTokenContract,
  getBatchTransferContract,
  APE_TOKEN_ADDRESS 
} from "./thirdweb"
import { walletTransactionService, type WalletInfo } from "./walletTransactionService"
import { alchemyEventService } from "./alchemyService"

export interface BatchTransferRecipient {
  address: string
  amount: string
}

export interface BatchTransferOptions {
  recipients: BatchTransferRecipient[]
  mode: 'equal' | 'custom' | 'random'
  equalAmount?: string
  equalTotalAmount?: string
  randomMin?: string
  randomMax?: string
  randomTotalAmount?: string
  randomSeed?: number
  tokenAddress?: Address
}

export interface TransferEstimate {
  totalAmount: string
  fee: string
  totalRequired: string
  gasEstimate?: string
  tokenAddress?: Address | null
  tokenSymbol?: string
  tokenDecimals?: number
}

export class SimpleBatchTransferService {
  private static instance: SimpleBatchTransferService

  private constructor() {}

  static getInstance(): SimpleBatchTransferService {
    if (!SimpleBatchTransferService.instance) {
      SimpleBatchTransferService.instance = new SimpleBatchTransferService()
    }
    return SimpleBatchTransferService.instance
  }

  /**
   * Get user's token balance for a specific token
   */
  async getBalance(userAddress: Address, tokenAddress?: Address): Promise<string> {
    try {
      const contract = tokenAddress ? this.getTokenContract(tokenAddress) : getApeTokenContract()
      const balance = await readContract({
        contract,
        method: "balanceOf",
        params: [userAddress]
      })
      return balance.toString()
    } catch (error) {
      console.error("Error getting balance:", error)
      return "0"
    }
  }

  /**
   * Get token contract for a specific address
   */
  private getTokenContract(tokenAddress: Address) {
    return getApeTokenContract() // Simplified - just use APE token contract for now
  }

  /**
   * Get current fee rate in basis points for a specific token
   */
  async getFeeBps(tokenAddress?: Address): Promise<number> {
    try {
      const contract = getBatchTransferContract()
      
      // For native APE transfers, use the default fee rate
      if (!tokenAddress) {
        console.log("🔍 Fetching native APE fee rate from contract")
        const feeBps = await readContract({
          contract,
          method: "function feeBps() view returns (uint256)"
        })
        console.log("🔍 Native fee rate from contract:", feeBps.toString())
        return Number(feeBps)
      } else {
        // For ERC20 tokens, use the token-specific fee rate
        console.log("🔍 Fetching ERC20 fee rate from contract for token:", tokenAddress)
        const feeBps = await readContract({
          contract,
          method: "function getTokenFeeBps(address token) view returns (uint256)",
          params: [tokenAddress]
        })
        console.log("🔍 Token fee rate from contract:", feeBps.toString())
        return Number(feeBps)
      }
    } catch (error) {
      console.error("Error fetching fee rate from contract:", error)
      console.log("🔍 Falling back to default fee rate: 50 bps (0.5%)")
      return 50 // 0.5% fallback
    }
  }

  /**
   * Calculate fee for a given amount and token
   */
  async calculateFee(totalAmount: string, tokenAddress?: Address): Promise<string> {
    try {
      const feeBps = await this.getFeeBps(tokenAddress)
      const calculatedFee = (BigInt(totalAmount) * BigInt(feeBps)) / BigInt(10000)
      
      // Apply minimum fee logic to match contract behavior
      const MIN_FEE = BigInt("1000000000000000") // 0.001 APE in wei (1e15)
      const fee = calculatedFee < MIN_FEE ? MIN_FEE : calculatedFee
      
      console.log("🔍 Fee calculation:", {
        totalAmount,
        feeBps,
        calculatedFee: calculatedFee.toString(),
        minFee: MIN_FEE.toString(),
        finalFee: fee.toString(),
        appliedMinimum: calculatedFee < MIN_FEE,
        calculatedFeeFormatted: this.formatAmount(calculatedFee.toString(), 18, 5),
        finalFeeFormatted: this.formatAmount(fee.toString(), 18, 5),
        minFeeFormatted: this.formatAmount(MIN_FEE.toString(), 18, 5)
      })
      
      return fee.toString()
    } catch (error) {
      console.error("Error calculating fee:", error)
      return "0"
    }
  }

  /**
   * Parse amount from user input to wei
   */
  private parseAmountToWei(amount: string): string {
    console.log("🔍 parseAmountToWei called with:", amount)
    if (!amount || amount === '') return '0'
    
    // Handle decimal input (like "0.05" or ".05")
    const numAmount = parseFloat(amount)
    console.log("🔍 Parsed number:", numAmount)
    if (isNaN(numAmount)) return '0'
    
    // Convert to wei (18 decimals)
    const weiAmount = Math.floor(numAmount * Math.pow(10, 18))
    console.log("🔍 Converted to wei:", weiAmount.toString())
    return weiAmount.toString()
  }

  /**
   * Estimate transfer costs and requirements
   */
  async estimateTransfer(options: BatchTransferOptions): Promise<TransferEstimate> {
    console.log("🔍 estimateTransfer called with options:", options)
    // For native APE transfers, use undefined. Only use ERC20 APE if explicitly specified
    const tokenAddress = options.tokenAddress
    let totalAmount = BigInt(0)

    if (options.mode === 'equal') {
      if (options.equalTotalAmount) {
        // Use total amount for equal distribution
        const totalInWei = this.parseAmountToWei(options.equalTotalAmount)
        console.log("🔍 Equal mode - total amount:", totalInWei, "recipients:", options.recipients.length)
        totalAmount = BigInt(totalInWei)
      } else if (options.equalAmount) {
        // Use per-recipient amount
        const amountPerRecipient = this.parseAmountToWei(options.equalAmount)
        console.log("🔍 Equal mode - amountPerRecipient:", amountPerRecipient, "recipients:", options.recipients.length)
        totalAmount = BigInt(amountPerRecipient) * BigInt(options.recipients.length)
      }
    } else if (options.mode === 'custom') {
      for (const recipient of options.recipients) {
        const amount = this.parseAmountToWei(recipient.amount)
        totalAmount += BigInt(amount)
      }
    } else if (options.mode === 'random') {
      if (options.randomTotalAmount) {
        // Use total amount for random distribution
        const totalInWei = this.parseAmountToWei(options.randomTotalAmount)
        console.log("🔍 Random mode - total amount:", totalInWei, "recipients:", options.recipients.length)
        totalAmount = BigInt(totalInWei)
      } else if (options.randomMin && options.randomMax) {
        // Use min/max range
        const minAmount = this.parseAmountToWei(options.randomMin)
        const maxAmount = this.parseAmountToWei(options.randomMax)
        const avgAmount = (BigInt(minAmount) + BigInt(maxAmount)) / BigInt(2)
        totalAmount = avgAmount * BigInt(options.recipients.length)
      }
    }

    console.log("🔍 Total amount calculated:", totalAmount.toString())
    const fee = await this.calculateFee(totalAmount.toString(), tokenAddress)
    console.log("🔍 Fee calculated:", fee)
    const totalRequired = totalAmount + BigInt(fee)

    const result = {
      totalAmount: totalAmount.toString(),
      fee,
      totalRequired: totalRequired.toString(),
      tokenAddress: tokenAddress || null, // Use null for native APE instead of undefined
      tokenSymbol: tokenAddress ? "APE" : "APE", // Native APE
      tokenDecimals: 18
    }
    console.log("🔍 Final estimate result:", result)
    return result
  }

  /**
   * Format amount for display (with decimals)
   */
  formatAmount(amount: string, decimals: number = 18, displayDecimals: number = 5): string {
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
    
    // Handle decimal input (like "0.000")
    if (amount.includes('.')) {
      return amount
    }
    
    try {
      const divisor = BigInt(10 ** decimals)
      const wholePart = BigInt(amount) / divisor
      const fractionalPart = BigInt(amount) % divisor
      
      // Show specified number of decimal places
      const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
      const formattedFractional = fractionalStr.substring(0, displayDecimals)
      
      return `${wholePart}.${formattedFractional}`
    } catch (error) {
      console.error("Error formatting amount:", error, "amount:", amount)
      return "0." + "0".repeat(displayDecimals)
    }
  }

  /**
   * Parse amount from user input (with decimals)
   */
  parseAmount(amount: string, decimals: number = 18): string {
    if (!amount || amount === '') return '0'
    
    // Handle decimal input (like "0.05" or ".05")
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return '0'
    
    // Convert to wei (18 decimals)
    const weiAmount = Math.floor(numAmount * Math.pow(10, decimals))
    return weiAmount.toString()
  }

  /**
   * Check and handle token approval (only for ERC20 tokens, not native tokens)
   */
  async checkAndApproveTokens(walletInfo: WalletInfo, amount: string, tokenAddress?: Address): Promise<void> {
    try {
      console.log("🔍 Checking token approval for amount:", amount, "tokenAddress:", tokenAddress)
      
      // If no tokenAddress is provided, we're dealing with native APE (gas token)
      // Native tokens don't need approval
      if (!tokenAddress) {
        console.log("🔍 Native APE token detected - no approval needed")
        return
      }
      
      // Only check approval for ERC20 tokens
      console.log("🔍 ERC20 token detected - checking approval...")
      const tokenContract = this.getTokenContract(tokenAddress!)
      const batchTransferContract = getBatchTransferContract()
      
      // Check current allowance
      const allowance = await readContract({
        contract: tokenContract,
        method: "allowance",
        params: [walletInfo.address!, batchTransferContract.address]
      })
      
      console.log("🔍 Current allowance:", allowance.toString())
      console.log("🔍 Required amount:", amount)
      
      if (BigInt(allowance.toString()) < BigInt(amount)) {
        console.log("🔍 Approval needed, requesting approval...")
        
        const approveTransaction = prepareContractCall({
          contract: tokenContract,
          method: "approve",
          params: [batchTransferContract.address, BigInt(amount)]
        })
        
        const { transactionHash: approveHash } = await sendTransaction({
          transaction: approveTransaction,
          account: walletInfo.account!
        })
        
        console.log("🔍 Approval transaction sent, hash:", approveHash)
        // Note: In a real app, you'd want to wait for confirmation here
      } else {
        console.log("🔍 Sufficient allowance already exists")
      }
    } catch (error) {
      console.error("🔍 Error checking/approving tokens:", error)
      throw new Error(`Token approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Grant team role to an address
   */
  async grantTeamRole(walletInfo: WalletInfo, address: string): Promise<{ transactionHash: string }> {
    try {
      console.log("🔍 grantTeamRole called with:", { walletType: walletInfo.type, address })
      
      // Use the TEAM_ROLE constant directly (it's a bytes32 value)
      // TEAM_ROLE = keccak256("TEAM_ROLE")
      const teamRole = "0x0000000000000000000000000000000000000000000000000000000000000001" // Placeholder - should be actual TEAM_ROLE
      
      return await walletTransactionService.executeTransaction(
        walletInfo,
        "grantTeamRole",
        [address, teamRole]
      )
    } catch (error) {
      console.error("Error granting team role:", error)
      throw new Error(`Failed to grant team role: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Revoke team role from an address
   */
  async revokeTeamRole(walletInfo: WalletInfo, address: string): Promise<{ transactionHash: string }> {
    try {
      console.log("🔍 revokeTeamRole called with:", { walletType: walletInfo.type, address })
      
      // Use the TEAM_ROLE constant directly (it's a bytes32 value)
      // TEAM_ROLE = keccak256("TEAM_ROLE")
      const teamRole = "0x0000000000000000000000000000000000000000000000000000000000000001" // Placeholder - should be actual TEAM_ROLE
      
      return await walletTransactionService.executeTransaction(
        walletInfo,
        "revokeTeamRole",
        [address, teamRole]
      )
    } catch (error) {
      console.error("Error revoking team role:", error)
      throw new Error(`Failed to revoke team role: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Set fee rate
   */
  async setFeeBps(walletInfo: WalletInfo, feeBps: number): Promise<{ transactionHash: string }> {
    try {
      console.log("🔍 setFeeBps called with:", { walletType: walletInfo.type, feeBps })
      
      return await walletTransactionService.executeTransaction(
        walletInfo,
        "setFeeBps",
        [feeBps]
      )
    } catch (error) {
      console.error("Error setting fee BPS:", error)
      throw new Error(`Failed to set fee BPS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get current fee rate from contract
   */
  async getCurrentFeeBps(): Promise<number> {
    try {
      console.log("🔍 Fetching current fee BPS from contract")
      return await this.getFeeBps() // Use the existing getFeeBps method which reads from contract
    } catch (error) {
      console.error("Error getting current fee BPS:", error)
      return 50 // Default fallback
    }
  }

  /**
   * Get user statistics from the contract
   */
  async getUserStats(userAddress: Address): Promise<{totalTransferred: string, transferCount: number}> {
    try {
      console.log("🔍 Fetching user stats for:", userAddress)
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

      console.log("🔍 User stats fetched:", stats)
      return stats
    } catch (error) {
      console.error("Error getting user stats:", error)
      return { totalTransferred: "0", transferCount: 0 }
    }
  }

  /**
   * Get global statistics from the contract
   */
  async getGlobalStats(): Promise<{totalVolume: string, totalTransfers: number}> {
    try {
      console.log("🔍 Fetching global stats...")
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

      const stats = {
        totalVolume: totalVolume.toString(),
        totalTransfers: Number(totalTransfers)
      }

      console.log("🔍 Global stats fetched:", stats)
      return stats
    } catch (error) {
      console.error("Error getting global stats:", error)
      return { totalVolume: "0", totalTransfers: 0 }
    }
  }

  /**
   * Get recent transfer history for a user using Alchemy API
   */
  async getUserTransferHistory(userAddress: Address, limit: number = 10): Promise<Array<{
    transactionHash: string
    totalAmount: string
    fee: string
    recipientCount: number
    batchId: string
    timestamp: number
    blockNumber: number
  }>> {
    try {
      console.log("🔍 Fetching transfer history for user using Alchemy:", userAddress)
      
      // Use Alchemy to get batch transfer events
      const events = await alchemyEventService.getBatchTransferEvents()
      console.log("🔍 Found events from Alchemy:", events.length)
      
      // Filter events by user address
      const userEvents = events.filter((event: any) => 
        event.sender?.toLowerCase() === userAddress.toLowerCase()
      )
      
      console.log("🔍 Found user events:", userEvents.length)
      
      // Sort by block number (most recent first) and limit results
      const sortedEvents = userEvents
        .sort((a: any, b: any) => b.blockNumber - a.blockNumber)
        .slice(0, limit)
      
      // Process events into transfer history format
      const transferHistory = sortedEvents.map((event: any) => {
        const totalAmount = (parseInt(event.totalAmount) / Math.pow(10, 18)).toString()
        const fee = (parseInt(event.fee) / Math.pow(10, 18)).toString()
        
        return {
          transactionHash: event.transactionHash,
          totalAmount: totalAmount,
          fee: fee,
          recipientCount: event.recipientCount,
          batchId: event.batchId,
          timestamp: event.timestamp * 1000, // Convert to milliseconds
          blockNumber: event.blockNumber
        }
      })
      
      console.log("🔍 Processed transfer history:", transferHistory.length, "transfers")
      return transferHistory
    } catch (error) {
      console.error("Error getting user transfer history:", error)
      return []
    }
  }

  /**
   * Execute the complete batch transfer flow
   */
  async executeBatchTransfer(
    walletInfo: WalletInfo,
    options: BatchTransferOptions
  ): Promise<{ transactionHash: string }> {
    try {
      console.log("🔍 executeBatchTransfer called with:", { walletType: walletInfo.type, address: walletInfo.address || walletInfo.account?.address, options })
      const contract = getBatchTransferContract()
      console.log("🔍 Contract obtained:", contract)
      
      if (options.mode === 'equal') {
        const recipients = options.recipients.map(r => r.address)
        let amountPerRecipient: string
        let totalAmount: string
        
        if (options.equalTotalAmount) {
          // Use total amount and calculate per-recipient amount
          const totalInWei = this.parseAmountToWei(options.equalTotalAmount)
          amountPerRecipient = (BigInt(totalInWei) / BigInt(recipients.length)).toString()
          totalAmount = totalInWei
          console.log("🔍 Equal transfer (total) - totalAmount:", totalAmount, "amountPerRecipient:", amountPerRecipient, "recipients:", recipients.length)
        } else if (options.equalAmount) {
          // Use per-recipient amount
          amountPerRecipient = this.parseAmountToWei(options.equalAmount)
          totalAmount = (BigInt(amountPerRecipient) * BigInt(recipients.length)).toString()
          console.log("🔍 Equal transfer (per-recipient) - amountPerRecipient:", amountPerRecipient, "recipients:", recipients.length, "totalAmount:", totalAmount)
        } else {
          throw new Error("Either equalAmount or equalTotalAmount must be provided for equal mode")
        }
        
        // Check if this is native APE or ERC20 token
        if (!options.tokenAddress) {
          // Native APE transfer - try using ThirdWeb contract directly for Glyph
          console.log("🔍 Native APE transfer - using ThirdWeb contract write method directly")
          
          const fee = await this.calculateFee(totalAmount)
          const totalWithFee = BigInt(totalAmount) + BigInt(fee)
          
          console.log("🔍 Fee calculation details:", {
            totalAmount: totalAmount.toString(),
            fee: fee,
            totalWithFee: totalWithFee.toString(),
            feePercentage: (Number(fee) / Number(totalAmount) * 100).toFixed(4) + "%"
          })
          
            // Use the unified wallet transaction service for all wallet types
            console.log("🔍 Using unified wallet transaction service")
            return await walletTransactionService.executeTransaction(
              walletInfo,
              "batchTransferEqual",
              [recipients, BigInt(amountPerRecipient)],
              totalWithFee
            )
        } else {
          // ERC20 token transfer
          console.log("🔍 ERC20 token transfer - checking approval first")
          
          // Check and approve tokens first (only for ERC20 tokens)
          await walletTransactionService.checkAndApproveTokens(walletInfo, totalAmount, options.tokenAddress)
          
          return await walletTransactionService.executeTransaction(
            walletInfo,
            "batchTransferTokenEqual",
            [options.tokenAddress, recipients, BigInt(amountPerRecipient)]
          )
        }
      } else if (options.mode === 'custom') {
        const addresses = options.recipients.map(r => r.address)
        const amounts = options.recipients.map(r => BigInt(this.parseAmountToWei(r.amount)))
        const totalAmount = amounts.reduce((sum, amount) => sum + amount, BigInt(0)).toString()
        
        console.log("🔍 Custom transfer - addresses:", addresses, "amounts:", amounts, "totalAmount:", totalAmount)
        
        // Check if this is native APE or ERC20 token
        if (!options.tokenAddress) {
          // Native APE transfer (works for both ThirdWeb and Glyph)
          console.log("🔍 Native APE custom transfer - using batchTransfer with msg.value")
          
          const totalWithFee = BigInt(totalAmount) + BigInt(await this.calculateFee(totalAmount))
          
          return await walletTransactionService.executeTransaction(
            walletInfo,
            "batchTransfer",
            [addresses, amounts],
            totalWithFee
          )
        } else {
          // ERC20 token transfer
          console.log("🔍 ERC20 token custom transfer - checking approval first")
          
          // Check and approve tokens first (only for ERC20 tokens)
          await walletTransactionService.checkAndApproveTokens(walletInfo, totalAmount, options.tokenAddress)
          
          return await walletTransactionService.executeTransaction(
            walletInfo,
            "batchTransferToken",
            [options.tokenAddress, addresses, amounts]
          )
        }
      } else {
        throw new Error("Unsupported transfer mode")
      }
    } catch (error) {
      console.error("Error executing batch transfer:", error)
      throw new Error(`Failed to execute batch transfer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Hook to use the simple batch transfer service
export function useSimpleBatchTransferService() {
  return SimpleBatchTransferService.getInstance()
}
