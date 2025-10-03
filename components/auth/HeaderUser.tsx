"use client"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import ProfileDropdown from "@/components/auth/ProfileDropdown"
import { HeaderUserInfo } from "@/components/auth/HeaderUserInfo"
import { ClientOnly } from "@/components/ClientOnly"

interface HeaderUserProps {
  onLoginClick?: () => void
}

function HeaderUserContent({ onLoginClick }: HeaderUserProps) {
  const account = useActiveAccount()
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()
  const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated } = useSafeGlyph()
  
  // Check for Glyph connection using the proper SDK method
  const isGlyphConnected = !!(glyphReady && glyphAuthenticated && glyphUser?.evmWallet)
  
  // For now, we'll just check wallet connections and skip email state
  // This avoids the Zustand SSR issues
  const hasWallet = !!(account?.address || wagmiAddress || isGlyphConnected)

  // Show login button if no wallet connections
  if (!hasWallet) {
    return (
      <button
        onClick={onLoginClick}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
      >
        Login
      </button>
    )
  }

  // Show profile dropdown and user info if logged in with any wallet
  return (
    <div className="flex items-center gap-4">
      <HeaderUserInfo />
      <ProfileDropdown />
    </div>
  )
}

export default function HeaderUser({ onLoginClick }: HeaderUserProps) {
  return (
    <ClientOnly 
      fallback={
        <button
          onClick={onLoginClick}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Login
        </button>
      }
    >
      <HeaderUserContent onLoginClick={onLoginClick} />
    </ClientOnly>
  )
}