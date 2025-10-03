"use client"

import { useState, useEffect } from "react"
import { useActiveAccount, useNetworkSwitcherModal } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { apeChain } from "@/lib/chains"

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: () => void) => void
      removeListener: (event: string, callback: () => void) => void
    }
  }
}

interface NetworkSwitcherProps {
  showAlways?: boolean
  className?: string
}

export default function NetworkSwitcher({ showAlways = false, className = "" }: NetworkSwitcherProps) {
  const account = useActiveAccount()
  const { address: wagmiAddress } = useAccount()
  const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated } = useSafeGlyph()
  const { open: openNetworkSwitcher } = useNetworkSwitcherModal()
  
  // Check if any wallet is connected
  const isAnyWalletConnected = !!(account?.address || wagmiAddress || (glyphReady && glyphAuthenticated && glyphUser?.evmWallet))
  
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [currentChainId, setCurrentChainId] = useState<number | null>(null)
  
  // Debug logging
  console.log("🔍 NetworkSwitcher wallet detection:", {
    accountAddress: account?.address,
    wagmiAddress,
    glyphReady,
    glyphAuthenticated,
    glyphUserEvmWallet: glyphUser?.evmWallet,
    isAnyWalletConnected,
    currentChainId,
    isCorrectNetwork,
    apeChainId: apeChain.id
  })

  // Check if user is on the correct network (ApeChain)
  useEffect(() => {
    const checkNetwork = async () => {
      console.log("🔍 NetworkSwitcher checkNetwork:", {
        isAnyWalletConnected,
        hasWindow: typeof window !== "undefined",
        hasEthereum: !!(typeof window !== "undefined" && window.ethereum)
      })
      
      if (isAnyWalletConnected && typeof window !== "undefined" && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          const chainIdNumber = parseInt(chainId, 16)
          console.log("🔍 NetworkSwitcher chain detection:", {
            chainId,
            chainIdNumber,
            apeChainId: apeChain.id,
            isCorrect: chainIdNumber === apeChain.id
          })
          setCurrentChainId(chainIdNumber)
          
          const correctNetwork = chainIdNumber === apeChain.id
          setIsCorrectNetwork(correctNetwork)
          
          // Show banner if user is connected but on wrong network
          if (!correctNetwork) {
            setShowBanner(true)
          } else {
            setShowBanner(false)
          }
        } catch (error) {
          console.error("Failed to get chain ID:", error)
          // If we can't get chain ID but user is connected, assume correct network
          setIsCorrectNetwork(true)
          setShowBanner(false)
          setCurrentChainId(apeChain.id) // Assume ApeChain if we can't detect
        }
      } else if (isAnyWalletConnected) {
        console.log("🔍 NetworkSwitcher: Connected but no ethereum provider, assuming ApeChain")
        // If connected but no ethereum provider, assume correct network
        setIsCorrectNetwork(true)
        setShowBanner(false)
        setCurrentChainId(apeChain.id)
      } else {
        // If not connected, don't show network status
        setIsCorrectNetwork(false)
        setShowBanner(false)
        setCurrentChainId(null)
      }
    }

    checkNetwork()

    // Listen for chain changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleChainChanged = () => {
        checkNetwork()
      }

      window.ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [account, wagmiAddress, glyphReady, glyphUser, isAnyWalletConnected])

  const handleSwitchNetwork = async () => {
    setIsLoading(true)
    try {
      if (openNetworkSwitcher) {
        openNetworkSwitcher()
      } else {
        // Fallback: try to switch network manually
        await switchToApeChain()
      }
    } catch (error) {
      console.error("Failed to switch network:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchToApeChain = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet detected")
    }

    const targetChainId = `0x${apeChain.id.toString(16)}`
    
    try {
      // Try to switch to ApeChain
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      })
    } catch (switchError: any) {
      // If the network is not added to the wallet, add it
      if (switchError.code === 4902) {
        await addApeChainNetwork()
      } else {
        throw switchError
      }
    }
  }

  const addApeChainNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet detected")
    }

    const targetChainId = `0x${apeChain.id.toString(16)}`
    
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: targetChainId,
          chainName: apeChain.name,
          rpcUrls: [apeChain.rpc],
          nativeCurrency: {
            name: apeChain.nativeCurrency.name,
            symbol: apeChain.nativeCurrency.symbol,
            decimals: apeChain.nativeCurrency.decimals,
          },
          blockExplorerUrls: apeChain.blockExplorers?.default?.url 
            ? [apeChain.blockExplorers.default.url] 
            : undefined,
        },
      ],
    })
  }

  // Don't show anything if user is not connected and showAlways is false
  if (!isAnyWalletConnected && !showAlways) {
    return null
  }

  // Show network status banner when on wrong network
  if (showBanner && account) {
    return (
      <div className={`fixed top-20 left-0 right-0 z-40 px-4 ${className}`}>
        <Card className="mx-auto max-w-4xl border-orange-500/50 bg-orange-500/10 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-semibold text-orange-500">Wrong Network</div>
                <div className="text-sm text-muted-foreground">
                  Please switch to <Badge variant="outline" className="ml-1">{apeChain.name}</Badge> to use ApeBeats
                </div>
              </div>
            </div>
            <Button
              onClick={handleSwitchNetwork}
              disabled={isLoading}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Switch Network"
              )}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Show network status indicator when showAlways is true or when connected
  if (showAlways || isAnyWalletConnected) {
    console.log("🔍 NetworkSwitcher render:", {
      showAlways,
      isAnyWalletConnected,
      isCorrectNetwork,
      apeChainName: apeChain.name,
      shouldShowConnected: isCorrectNetwork && isAnyWalletConnected
    })
    
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {isCorrectNetwork && isAnyWalletConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500">Connected to {apeChain.name}</span>
          </>
        ) : isAnyWalletConnected ? (
          <>
            <WifiOff className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-500">Wrong Network</span>
            <Button
              onClick={handleSwitchNetwork}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="ml-2"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                "Switch"
              )}
            </Button>
          </>
        ) : null}
      </div>
    )
  }

  return null
}

// Hook to check if user is on correct network
export function useNetworkCheck() {
  const account = useActiveAccount()
  const { address: wagmiAddress } = useAccount()
  const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated } = useSafeGlyph()
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true)
  const [currentChainId, setCurrentChainId] = useState<number | null>(null)

  // Check if any wallet is connected
  const isAnyWalletConnected = !!(account?.address || wagmiAddress || (glyphReady && glyphAuthenticated && glyphUser?.evmWallet))

  useEffect(() => {
    const checkNetwork = async () => {
      if (isAnyWalletConnected && typeof window !== "undefined" && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          const chainIdNumber = parseInt(chainId, 16)
          setCurrentChainId(chainIdNumber)
          setIsCorrectNetwork(chainIdNumber === apeChain.id)
        } catch (error) {
          console.error("Failed to get chain ID:", error)
          setIsCorrectNetwork(true)
          setCurrentChainId(null)
        }
      } else {
        setIsCorrectNetwork(true)
        setCurrentChainId(null)
      }
    }

    checkNetwork()

    // Listen for chain changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleChainChanged = () => {
        checkNetwork()
      }

      window.ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [account, wagmiAddress, glyphReady, glyphUser, isAnyWalletConnected])

  return {
    isCorrectNetwork,
    currentChainId,
    targetChain: apeChain,
  }
}
