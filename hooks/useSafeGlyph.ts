"use client"

import { useGlyph } from "@use-glyph/sdk-react"
import { useState, useEffect } from "react"

export function useSafeGlyph() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Always call useGlyph hook at the top level (no conditional calling)
  const glyphValues = useGlyph()

  // Return default values if not on client side
  if (!isClient) {
    return {
      user: null,
      authenticated: false,
      ready: false,
      login: () => {},
      logout: () => {},
      signMessage: async () => {},
      sendTransaction: async () => "",
      glyphUrl: "",
      refreshUser: async () => {},
      nativeSymbol: "APE",
      balances: null,
      hasBalances: false,
      refreshBalances: async () => {},
    }
  }

  return glyphValues
}
