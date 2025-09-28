"use client"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig } from "@/lib/blockchain/wagmi"
import { useMemo } from "react"

interface GlyphProviderProps {
  children: React.ReactNode
}

export default function GlyphProvider({ children }: GlyphProviderProps) {
  // Create a client for React Query with optimized settings
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1, // Reduce retries to prevent excessive requests
        refetchOnWindowFocus: false, // Prevent refetch on window focus
      },
    },
  }), [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  )
}
