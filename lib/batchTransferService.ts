"use client"

import { 
  readContract, 
  prepareContractCall, 
  sendTransaction, 
  getContract,
  type Address,
  type TransactionReceipt
} from "thirdweb"
import { 
  thirdwebClient, 
  apeChain, 
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
}

export interface TransferEstimate {
  totalAmount: string
  fee: string
  totalRequired: string
  gasEstimate?: string
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
   * Get user's APE token balance
   */
  async getBalance(userAddress: Address): Promise<string> {
    try {
      const contract = getApeTokenContract()
      const balance = await readContract({
        contract,
        method: "function balanceOf(address account) view returns (uint256)",
        params: [userAddress]
      })
      return balance.toString()
    } catch (error) {
      console.error("Error getting balance:", error)
      throw new Error("Failed to get balance")
    }
  }

  /**
   * Get user's allowance for the batch transfer contract
   */
  async getAllowance(userAddress: Address, contractAddress: Address): Promise<string> {
    try {
      const contract = getApeTokenContract()
      const allowance = await readContract({
        contract,
        method: "function allowance(address owner, address spender) view returns (uint256)",
        params: [userAddress, contractAddress]
      })
      return allowance.toString()
    } catch (error) {
      console.error("Error getting allowance:", error)
      throw new Error("Failed to get allowance")
    }
  }

  /**
   * Get current fee rate in basis points
   */
  async getFeeBps(): Promise<number> {
    try {
      const contract = getBatchTransferContract()
      const feeBps = await readContract({
        contract,
        method: "function feeBps() view returns (uint256)",
        params: []
      })
      return Number(feeBps)
    } catch (error) {
      console.error("Error getting fee BPS:", error)
      return 50 // Default 0.5%
    }
  }

  /**
   * Calculate fee for a given amount
   */
  async calculateFee(totalAmount: string): Promise<string> {
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
      const feeBps = await this.getFeeBps()
      const fee = (BigInt(totalAmount) * BigInt(feeBps)) / BigInt(10000)
      return fee.toString()
    }
  }

  /**
   * Estimate transfer costs and requirements
   */
  async estimateTransfer(options: BatchTransferOptions): Promise<TransferEstimate> {
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

    const fee = await this.calculateFee(totalAmount.toString())
    const totalRequired = totalAmount + BigInt(fee)

    return {
      totalAmount: totalAmount.toString(),
      fee,
      totalRequired: totalRequired.toString()
    }
  }

  /**
   * Approve APE tokens for batch transfer
   */
  async approveTokens(userAddress: Address, amount: string): Promise<TransactionReceipt> {
    try {
      const apeTokenContract = getApeTokenContract()
      const batchTransferContract = getBatchTransferContract()

      const transaction = prepareContractCall({
        contract: apeTokenContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [batchTransferContract.address, BigInt(amount)]
      })

      const { transactionHash } = await sendTransaction({
        transaction,
        account: userAddress
      })

      // Transaction sent successfully, return the hash
      return { transactionHash } as TransactionReceipt
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
  ): Promise<TransactionReceipt> {
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
      return { transactionHash } as TransactionReceipt
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
  ): Promise<TransactionReceipt> {
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
      return { transactionHash } as TransactionReceipt
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
  ): Promise<TransactionReceipt> {
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
      return { transactionHash } as TransactionReceipt
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
  ): Promise<TransactionReceipt> {
    // First, estimate the transfer
    const estimate = await this.estimateTransfer(options)
    
    // Check if user has enough balance
    const balance = await this.getBalance(userAddress)
    if (BigInt(balance) < BigInt(estimate.totalRequired)) {
      throw new Error("Insufficient balance")
    }

    // Check allowance and approve if needed
    const batchTransferContract = getBatchTransferContract()
    const allowance = await this.getAllowance(userAddress, batchTransferContract.address)
    if (BigInt(allowance) < BigInt(estimate.totalRequired)) {
      console.log("Approving tokens...")
      await this.approveTokens(userAddress, estimate.totalRequired)
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
   * Format amount for display (with decimals)
   */
  formatAmount(amount: string, decimals: number = 18): string {
    const divisor = BigInt(10 ** decimals)
    const wholePart = BigInt(amount) / divisor
    const fractionalPart = BigInt(amount) % divisor
    
    if (fractionalPart === BigInt(0)) {
      return wholePart.toString()
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
    const trimmedFractional = fractionalStr.replace(/0+$/, '')
    
    return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString()
  }

  /**
   * Parse amount from user input (with decimals)
   */
  parseAmount(amount: string, decimals: number = 18): string {
    const [whole, fractional = ''] = amount.split('.')
    const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals)
    return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFractional || '0')).toString()
  }
}

// Hook to use the batch transfer service
export function useBatchTransferService() {
  return BatchTransferService.getInstance()
}
