"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { getApeTokenContract, thirdwebClient, apeChain } from "@/lib/thirdweb"
import { readContract } from "thirdweb"

export function useApeCoinBalance() {
  const account = useActiveAccount()
  const [balance, setBalance] = useState<string>("0")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (account?.address) {
      loadBalance()
    } else {
      setBalance("0")
      setError(null)
    }
  }, [account?.address])

  const loadBalance = async () => {
    if (!account?.address) return
    
    setLoading(true)
    setError(null)
    
    try {
      const contract = getApeTokenContract()
      const balance = await readContract({
        contract,
        method: "function balanceOf(address account) view returns (uint256)",
        params: [account.address]
      })
      setBalance(balance.toString())
    } catch (err) {
      console.error("Error loading ApeCoin balance:", err)
      setError("Failed to load balance")
      setBalance("0")
    } finally {
      setLoading(false)
    }
  }

  const formatBalance = (balance: string): string => {
    if (balance === "0") return "0"
    
    // Convert from wei to APE (18 decimals)
    const balanceNumber = BigInt(balance)
    const divisor = BigInt(10 ** 18)
    const wholePart = balanceNumber / divisor
    const fractionalPart = balanceNumber % divisor
    
    if (fractionalPart === BigInt(0)) {
      return wholePart.toString()
    }
    
    // Format with up to 4 decimal places
    const fractionalString = fractionalPart.toString().padStart(18, '0')
    const trimmedFractional = fractionalString.replace(/0+$/, '')
    
    if (trimmedFractional.length === 0) {
      return wholePart.toString()
    }
    
    const decimalPlaces = Math.min(4, trimmedFractional.length)
    const formattedFractional = trimmedFractional.substring(0, decimalPlaces)
    
    return `${wholePart}.${formattedFractional}`
  }

  return {
    balance,
    formattedBalance: formatBalance(balance),
    loading,
    error,
    refetch: loadBalance
  }
}
