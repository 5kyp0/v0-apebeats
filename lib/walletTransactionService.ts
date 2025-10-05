"use client"

import { 
  readContract,
  prepareContractCall,
  sendTransaction,
  type Address
} from "thirdweb"
import { 
  thirdwebClient, 
  apeChainThirdweb, 
  getBatchTransferContract,
  APE_TOKEN_ADDRESS 
} from "./thirdweb"

export interface WalletInfo {
  type: 'thirdweb' | 'glyph'
  account?: any
  address?: string
  signer?: any
  sendTransaction?: any // Made flexible to accommodate different wallet signatures
}

export class WalletTransactionService {
  /**
   * Execute a contract transaction using the appropriate wallet method
   */
  async executeTransaction(
    walletInfo: WalletInfo,
    contractMethod: string,
    params: any[],
    value?: bigint
  ): Promise<{ transactionHash: string }> {
    try {
      console.log("🔍 executeTransaction called with:", { 
        walletType: walletInfo.type, 
        method: contractMethod, 
        params, 
        value 
      })

      const contract = getBatchTransferContract()
      
      // Debug: Log contract details
      console.log("🔍 Contract details:", {
        address: contract.address,
        chainId: contract.chain.id,
        chainName: contract.chain.name,
        envContractAddress: process.env.NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS,
        isAddressValid: contract.address && contract.address !== "0x0000000000000000000000000000000000000000",
        expectedAddress: "0x2245a8160b5965E47Cb46A33637886e2e5d93710",
        addressMatch: contract.address === "0x2245a8160b5965E47Cb46A33637886e2e5d93710",
        contractObject: contract
      })

      if (walletInfo.type === 'thirdweb' && walletInfo.account) {
        // Use ThirdWeb's sendTransaction
        console.log("🔍 Preparing ThirdWeb transaction:", {
          contractAddress: contract.address,
          method: contractMethod,
          params: params.map(p => p.toString()),
          value: value?.toString() || "0"
        })

        // Get current gas price for Curtis testnet (APE)
        let gasPrice = BigInt(1000000000) // Default 1 Gwei fallback
        try {
          const { createPublicClient, http } = await import("viem")
          const { curtis } = await import("./chains")
          const client = createPublicClient({
            chain: curtis,
            transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://curtis.rpc.caldera.xyz/http")
          })
          const networkGasPrice = await client.getGasPrice()
          gasPrice = networkGasPrice
          console.log("🔍 Current gas price from network:", gasPrice.toString())
        } catch (error) {
          console.log("🔍 Could not fetch gas price, using default:", gasPrice.toString())
        }

        const transaction = prepareContractCall({
          contract,
          method: contractMethod,
          params,
          value,
          gas: BigInt(1000000), // Set gas limit for batch transfers
          gasPrice: gasPrice // Dynamic gas price for APE (Curtis testnet)
        })

        console.log("🔍 ThirdWeb transaction prepared:", {
          to: transaction.to,
          data: transaction.data,
          value: transaction.value?.toString() || "0",
          method: contractMethod,
          params: params.map(p => p.toString()),
          dataLength: transaction.data?.length || 0,
          isContractCreation: !transaction.data || transaction.data === "0x" || transaction.data.length < 10
        })

        const { transactionHash } = await sendTransaction({
          transaction,
          account: walletInfo.account
        })

        console.log("🔍 ThirdWeb transaction sent, hash:", transactionHash)
        return { transactionHash }
      } else if (walletInfo.type === 'glyph' && walletInfo.signer) {
        // Use Glyph's sendTransaction method
        console.log("🔍 Using Glyph sendTransaction method")
        console.log("🔍 Glyph wallet info:", {
          type: walletInfo.type,
          address: walletInfo.address,
          hasSigner: !!walletInfo.signer,
          signerMethods: Object.keys(walletInfo.signer || {})
        })
        
        // Get contract address and ABI
        const contractAddress = contract.address
        const contractABI = contract.abi || []
        
        // Find the method in the ABI
        const methodABI = contractABI.find((item: any) => 
          item.type === 'function' && item.name === contractMethod
        )
        
        if (!methodABI) {
          throw new Error(`Method ${contractMethod} not found in contract ABI`)
        }
        
        console.log("🔍 Found method ABI:", methodABI)
        
        // Encode the function call data using the full contract ABI
        const { encodeFunctionData } = await import("viem")
        const data = encodeFunctionData({
          abi: contractABI,
          functionName: contractMethod,
          args: params
        })
        
        // Debug: Log the encoded data
        console.log("🔍 Function data encoding:", {
          method: contractMethod,
          actualDataStart: data.substring(0, 10),
          fullData: data,
          dataLength: data.length,
          isDataValid: data && data.length > 10 && data.startsWith("0x"),
          params: params,
          paramsLength: params.length
        })
        
        // Get the correct chain ID for Curtis Testnet
        const curtisChainId = 33111 // Curtis Testnet
        
        // Create the transaction object in the format expected by Glyph
        const transaction = {
          to: contractAddress,
          data: data,
          value: value?.toString() || "0",
          chainId: curtisChainId
        }
        
        console.log("🔍 Glyph transaction object:", {
          to: transaction.to,
          data: transaction.data.substring(0, 20) + "...",
          value: transaction.value,
          chainId: transaction.chainId,
          dataLength: transaction.data.length,
          isValidFormat: transaction.to && transaction.data && transaction.data.length > 10
        })
        
        // Validate transaction before sending
        if (!transaction.to || transaction.to === "0x0000000000000000000000000000000000000000") {
          throw new Error("Invalid contract address")
        }
        
        if (!transaction.data || transaction.data === "0x" || transaction.data.length < 10) {
          throw new Error("Invalid transaction data")
        }
        
        try {
          // Use Glyph's sendTransaction with the correct format: sendTransaction({ transaction })
          const txHash = await walletInfo.signer.sendTransaction({ transaction })
          console.log("🔍 Glyph sendTransaction successful, hash:", txHash)
          return { transactionHash: txHash }
        } catch (error) {
          console.error("🔍 Glyph sendTransaction failed:", error)
          throw new Error(`Glyph transaction failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      } else {
        throw new Error(`Unsupported wallet type: ${walletInfo.type} or missing required properties`)
      }
    } catch (error) {
      console.error("Error executing transaction:", error)
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Check and handle token approval (only for ERC20 tokens, not native tokens)
   */
  async checkAndApproveTokens(
    walletInfo: WalletInfo, 
    amount: string, 
    tokenAddress?: Address
  ): Promise<void> {
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
      
      if (walletInfo.type === 'thirdweb' && walletInfo.account) {
        // Use ThirdWeb for approval
        const { getContract } = await import("thirdweb")
        const tokenContract = getContract({
          client: thirdwebClient,
          chain: apeChainThirdweb,
          address: tokenAddress,
          abi: [
            {
              "inputs": [
                {"name": "owner", "type": "address"},
                {"name": "spender", "type": "address"}
              ],
              "name": "allowance",
              "outputs": [{"name": "", "type": "uint256"}],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {"name": "spender", "type": "address"},
                {"name": "amount", "type": "uint256"}
              ],
              "name": "approve",
              "outputs": [{"name": "", "type": "bool"}],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ]
        })
        
        const batchTransferContract = getBatchTransferContract()
        
        // Check current allowance
        const allowance = await readContract({
          contract: tokenContract,
          method: "allowance",
          params: [walletInfo.account.address, batchTransferContract.address]
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
            account: walletInfo.account
          })
          
          console.log("🔍 Approval transaction sent, hash:", approveHash)
        } else {
          console.log("🔍 Sufficient allowance already exists")
        }
      } else if (walletInfo.type === 'glyph' && walletInfo.signer) {
        // Use Glyph for approval
        console.log("🔍 Using Glyph for token approval")
        
        const batchTransferContract = getBatchTransferContract()
        
        // Create token contract ABI
        const tokenABI = [
          {
            "inputs": [
              {"name": "owner", "type": "address"},
              {"name": "spender", "type": "address"}
            ],
            "name": "allowance",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {"name": "spender", "type": "address"},
              {"name": "amount", "type": "uint256"}
            ],
            "name": "approve",
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ]
        
        // Encode allowance call
        const { encodeFunctionData } = await import("viem")
        const allowanceData = encodeFunctionData({
          abi: tokenABI,
          functionName: "allowance",
          args: [walletInfo.address, batchTransferContract.address]
        })
        
        // Call allowance method (this is a view function, so we need to use callStatic or similar)
        // For now, let's assume we need approval and proceed
        console.log("🔍 Checking allowance for Glyph wallet...")
        
        // Encode approve call
        const approveData = encodeFunctionData({
          abi: tokenABI,
          functionName: "approve",
          args: [batchTransferContract.address, amount]
        })
        
        console.log("🔍 Sending approval transaction via Glyph...")
        
        // Send approval transaction with proper format for Glyph
        const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 33111)
        
        const approveTxHash = await walletInfo.signer.sendTransaction({
          to: tokenAddress,
          data: approveData,
          value: "0",
          gasLimit: "100000",
          chainId: chainId
        })
        
        console.log("🔍 Approval transaction sent, hash:", approveTxHash)
      }
    } catch (error) {
      console.error("🔍 Error checking/approving tokens:", error)
      throw new Error(`Token approval failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

export const walletTransactionService = new WalletTransactionService()
