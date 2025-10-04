"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { thirdwebClient, APE_TOKEN_ADDRESS, apeChain } from "@/lib/thirdweb"
import { getWalletBalance } from "thirdweb/wallets"

/**
 * Hook to fetch and format APE token balance from ApeChain
 * Supports ThirdWeb, Wagmi, and Glyph wallet connections
 * Returns balance formatted to exactly 3 decimal places
 */
export function useApeCoinBalance() {
  const account = useActiveAccount() // ThirdWeb account
  const { address: wagmiAddress } = useAccount() // Wagmi account
  const { user: glyphUser, ready: glyphReady } = useSafeGlyph() // Glyph account
  
  const [balance, setBalance] = useState<string>("0")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine which wallet is connected and get the address
  const glyphAddress = glyphUser?.evmWallet || glyphUser?.address || glyphUser?.walletAddress
  const currentAddress = account?.address || wagmiAddress || glyphAddress
  

  useEffect(() => {
    if (currentAddress) {
      loadBalance()
    } else {
      setBalance("0")
      setError(null)
    }
  }, [currentAddress])

  const loadBalance = async () => {
    if (!currentAddress) {
      setBalance("0")
      setError("No wallet connected")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Try native APE balance first (ApeChain's native token)
      let balanceResult
      
      try {
        balanceResult = await getWalletBalance({
          client: thirdwebClient,
          chain: apeChain,
          address: currentAddress
          // No tokenAddress = native token
        })
      } catch (nativeError) {
        // Fallback to ERC20 APE token if native fails
        balanceResult = await getWalletBalance({
          client: thirdwebClient,
          chain: apeChain,
          address: currentAddress,
          tokenAddress: APE_TOKEN_ADDRESS
        })
      }

      setBalance(balanceResult.value.toString())
      setError(null)
    } catch (err) {
      console.error("❌ Error loading APE balance:", err?.message || err)
      setError(`Failed to load balance: ${err?.message || 'Unknown error'}`)
      setBalance("0")
    } finally {
      setLoading(false)
    }
  }

  const formatBalance = (balance: string): string => {
    if (balance === "0") return "0.000"
    
    // Convert from wei to APE (18 decimals)
    const balanceNumber = BigInt(balance)
    const divisor = BigInt(10 ** 18)
    const wholePart = balanceNumber / divisor
    const fractionalPart = balanceNumber % divisor
    
    // Always show exactly 3 decimal places
    const fractionalString = fractionalPart.toString().padStart(18, '0')
    const formattedFractional = fractionalString.substring(0, 3)
    
    return `${wholePart}.${formattedFractional}`
  }

  return {
    balance: formatBalance(balance),
    loading,
    error,
    refetch: loadBalance,
    rawBalance: balance
  }
}
