"use client"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig } from "@/lib/wagmi"
import { GlyphWalletProvider } from "@use-glyph/sdk-react"
import { apeChain } from "viem/chains"
import { useState } from "react"

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
  const [isInitialized, setIsInitialized] = useState(false)

  // Prevent multiple initialization attempts
  if (!isInitialized) {
    setIsInitialized(true)
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <GlyphWalletProvider chains={[apeChain]}>
          {children}
        </GlyphWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
