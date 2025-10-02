"use client"

import React from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GlyphProvider as GlyphSDKProvider, StrategyType, WalletClientType } from "@use-glyph/sdk-react"
import { wagmiConfig } from "@/lib/wagmi"
import { apeChain, mainnet, base, curtis } from "@/lib/chains"

// Import Glyph styles only when needed to prevent layout conflicts
// import "@use-glyph/sdk-react/style.css"
import "@/styles/glyph-overrides.css"

// Create a client for React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Reduce retries to prevent excessive requests
      refetchOnWindowFocus: false, // Prevent refetch on window focus
    },
  },
})

interface GlyphProviderProps {
  children: React.ReactNode
}

export default function GlyphProvider({ children }: GlyphProviderProps) {
  // Log only once on mount
  React.useEffect(() => {
    console.log("🔧 GlyphProvider with Native (Wagmi) integration initialized")
  }, [])
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <GlyphSDKProvider
          strategy={StrategyType.EIP1193}
          walletClientType={WalletClientType.WAGMI}
        >
          {children}
        </GlyphSDKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}