"use client"

import { useGlyph } from "@use-glyph/sdk-react"
import { useState, useEffect } from "react"

export function useSafeGlyph() {
  const [isClient, setIsClient] = useState(false)
  const [initializationAttempted, setInitializationAttempted] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Always call useGlyph hook at the top level (no conditional calling)
  const glyphValues = useGlyph()

  // Track initialization attempts
  useEffect(() => {
    if (isClient && !initializationAttempted) {
      setInitializationAttempted(true)
      console.log("🔍 useSafeGlyph: First client-side render, Glyph initialization starting...")
    }
  }, [isClient, initializationAttempted])

  // Debug logging with better state tracking
  useEffect(() => {
    if (isClient) {
      // Enhanced logging for debugging connection issues
      console.log("🔍 useSafeGlyph detailed state:", {
        ready: glyphValues.ready,
        authenticated: glyphValues.authenticated,
        user: glyphValues.user ? {
          evmWallet: glyphValues.user.evmWallet,
          authenticated: glyphValues.user.authenticated,
          ready: glyphValues.user.ready
        } : "null",
        login: typeof glyphValues.login,
        logout: typeof glyphValues.logout,
        hasBalances: !!glyphValues.balances,
        balancesLength: glyphValues.balances?.length || 0,
        nativeSymbol: glyphValues.nativeSymbol,
        timestamp: new Date().toISOString()
      })
    }
  }, [isClient, glyphValues.ready, glyphValues.authenticated, glyphValues.user, glyphValues.balances])

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
