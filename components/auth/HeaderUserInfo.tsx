"use client"

import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { useApeCoinBalance } from "@/hooks/useApeCoinBalance"
import { Coins, User } from "lucide-react"
import { ClientOnly } from "@/components/ClientOnly"

function HeaderUserInfoContent() {
  const account = useActiveAccount()
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()
  const { user: glyphUser, ready: glyphReady } = useSafeGlyph()
  const { formattedBalance, loading: balanceLoading } = useApeCoinBalance()

  // Check for Glyph connection using the proper SDK method
  const isGlyphConnected = !!(glyphReady && glyphUser?.evmWallet)
  const currentAddress = account?.address || wagmiAddress || glyphUser?.evmWallet
  const hasWallet = currentAddress || isGlyphConnected

  if (!hasWallet) {
    return null
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Wallet Address */}
      {currentAddress && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-mono text-xs">
            {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
          </span>
        </div>
      )}

      {/* ApeCoin Balance */}
      {hasWallet && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Coins className="w-4 h-4" />
          <span className="text-xs">
            {balanceLoading ? (
              <div className="w-12 h-3 bg-muted animate-pulse rounded" />
            ) : (
              `${formattedBalance} APE`
            )}
          </span>
        </div>
      )}
    </div>
  )
}

export function HeaderUserInfo() {
  return (
    <ClientOnly>
      <HeaderUserInfoContent />
    </ClientOnly>
  )
}

