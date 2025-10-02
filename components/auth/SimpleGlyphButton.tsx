"use client"

import { useState, useEffect } from "react"
import { GlyphIcon } from "@/components/wallet/WalletIcons"

interface SimpleGlyphButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function SimpleGlyphButton({ onSuccess, onError }: SimpleGlyphButtonProps) {
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleClick = async () => {
    console.log("=== SIMPLE GLYPH BUTTON CLICKED ===")
    setLoading(true)
    
    try {
      // Check if we're in the browser
      if (typeof window === "undefined") {
        throw new Error("Not in browser environment")
      }

      console.log("Attempting to use NativeGlyphConnectButton approach...")
      
      // Try to dynamically import and use the NativeGlyphConnectButton
      const { NativeGlyphConnectButton } = await import("@use-glyph/sdk-react")
      console.log("NativeGlyphConnectButton imported successfully")
      
      // Since we can't render the component directly in this context,
      // let's try to access the underlying connection logic
      throw new Error("NativeGlyphConnectButton requires proper React context")
      
    } catch (error: any) {
      console.error("Simple Glyph connection failed:", error)
      onError?.(error.message || "Failed to connect to Glyph")
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) {
    return (
      <div className="rounded-md bg-zinc-900 px-3 py-2 text-sm flex items-center gap-2 opacity-50">
        <GlyphIcon />
        Loading...
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
      title="Connect with Glyph wallet"
    >
      <GlyphIcon />
      {loading ? "Connecting..." : "Glyph"}
    </button>
  )
}
