"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { apeChain, apeChainMainnet } from './chains'

export type NetworkMode = 'batch' | 'main'

interface NetworkContextType {
  currentNetwork: NetworkMode
  isBatchPage: boolean
  chainId: number
  chainName: string
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [currentNetwork, setCurrentNetwork] = useState<NetworkMode>('main')

  // Determine if we're on a batch page
  const isBatchPage = pathname?.startsWith('/batch') || 
                     pathname?.startsWith('/transfers') || 
                     pathname?.startsWith('/dashboard') ||
                     pathname?.startsWith('/stake')

  useEffect(() => {
    if (isBatchPage) {
      setCurrentNetwork('batch')
    } else {
      setCurrentNetwork('main')
    }
  }, [isBatchPage])

  const contextValue: NetworkContextType = {
    currentNetwork,
    isBatchPage,
    chainId: currentNetwork === 'batch' ? apeChain.id : apeChainMainnet.id,
    chainName: currentNetwork === 'batch' ? apeChain.name : apeChainMainnet.name
  }

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetworkContext() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetworkContext must be used within a NetworkProvider')
  }
  return context
}

// Hook to get the appropriate chain configuration
export function useCurrentChain() {
  const { currentNetwork } = useNetworkContext()
  return currentNetwork === 'batch' ? apeChain : apeChainMainnet
}

// Hook to get the appropriate thirdweb chain configuration
export function useCurrentThirdwebChain() {
  const { currentNetwork } = useNetworkContext()
  return currentNetwork === 'batch' ? apeChain : apeChainMainnet
}
