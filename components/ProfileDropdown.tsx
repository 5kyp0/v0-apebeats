"use client"
import { useState } from "react"
import { useActiveAccount, useWalletDetailsModal } from "thirdweb/react"
import { useWalletService } from "@/lib/walletService"
import useUserStore from "@/src/stores/userStore"
import { thirdwebClient, apeChain } from "@/lib/thirdweb"
import { ChevronDown, User, LogOut, Plus, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { GlyphIcon, MetaMaskIcon, RabbyIcon, RainbowIcon, WalletConnectIcon } from "./WalletIcons"
import { useNetworkCheck } from "./NetworkSwitcher"

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

export default function ProfileDropdown() {
  const account = useActiveAccount()
  const walletService = useWalletService()
  const { open: openWalletDetails } = useWalletDetailsModal()
  const email = useUserStore((s: any) => s.email)
  const { isCorrectNetwork, currentChainId } = useNetworkCheck()
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function connectGlyphWallet() {
    setError(null); setLoading(true)
    try {
      await walletService.connectGlyphWallet()
      setShowDropdown(false)
    } catch (e: any) { 
      console.error("Failed to connect Glyph wallet:", e)
      setError(e?.message || "Failed to connect Glyph wallet. Please try again.") 
    } finally { setLoading(false) }
  }

  async function connectWallet(rdns: string) {
    setError(null); setLoading(true)
    try {
      await walletService.connectInjectedWallet(rdns)
      setShowDropdown(false)
    } catch (e: any) { 
      console.error(`Failed to connect ${rdns}:`, e)
      setError(e?.message || "Failed to connect wallet. Please try again or use a different wallet.") 
    } finally { setLoading(false) }
  }

  async function connectWalletConnect() {
    setError(null); setLoading(true)
    try {
      await walletService.connectWalletConnect()
      setShowDropdown(false)
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function connectSocial(strategy: "google"|"x"|"facebook") {
    setError(null); setLoading(true)
    try {
      await walletService.connectSocialWallet(strategy)
      setShowDropdown(false)
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function handleDisconnect() {
    try {
      await walletService.disconnectWallet()
      setShowDropdown(false)
      
      // Force reload after a short delay
      setTimeout(() => {
        window.location.href = window.location.origin
      }, 200)
      
    } catch (e) {
      console.error('Disconnect error:', e)
      setShowDropdown(false)
      // Still reload even if there's an error
      setTimeout(() => {
        window.location.href = window.location.origin
      }, 200)
    }
  }

  function handleReceive() {
    if (!account?.address) return
    // Show a lightweight receive view: copy address to clipboard
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(account.address).catch(() => {})
    }
    alert(`Your wallet address has been copied to clipboard.\n\n${account.address}`)
  }

  function handleSend() {
    // Open Thirdweb wallet details modal which includes send funds flow
    if (openWalletDetails) {
      openWalletDetails({ client: thirdwebClient })
    }
  }

  async function handleSwitchNetwork() {
    setLoading(true)
    try {
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
        } else {
          throw switchError
        }
      }
    } catch (error) {
      console.error("Failed to switch network:", error)
      setError("Failed to switch network. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <User className="w-4 h-4" />
        {email || (account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : "Profile")}
        <ChevronDown className="w-3 h-3" />
      </button>

      {showDropdown && (
        <div className="absolute top-8 right-0 z-50 w-80 rounded-lg border border-border p-4 bg-card/90 backdrop-blur">
          <div className="space-y-4">
            {/* User Info */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Profile</div>
              {email && <div className="text-xs text-muted-foreground">{email}</div>}
              {account?.address && (
                <div className="text-xs text-muted-foreground font-mono">{account.address}</div>
              )}
            </div>

            {/* Network Status */}
            {account && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Network</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isCorrectNetwork ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-500">{apeChain.name}</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-orange-500">
                          Network {currentChainId || "Unknown"}
                        </span>
                      </>
                    )}
                  </div>
                  {!isCorrectNetwork && (
                    <button
                      onClick={handleSwitchNetwork}
                      disabled={loading}
                      className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
                    >
                      {loading ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <span>Switch to {apeChain.name}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Send / Receive (APE) */}
            {account?.address && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Wallet Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={loading}
                    onClick={handleSend}
                    className="rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50 px-3 py-2 text-xs text-primary-foreground"
                  >
                    Send APE
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleReceive}
                    className="rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 px-3 py-2 text-xs text-secondary-foreground"
                  >
                    Receive
                  </button>
                </div>
              </div>
            )}

            {/* Connect Additional Wallets */}
            <div className="space-y-2">
              <div className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Plus className="w-4 h-4" />
                Connect Wallets
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={loading}
                  onClick={connectGlyphWallet}
                  className="rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 px-3 py-2 text-xs flex items-center gap-2 text-secondary-foreground"
                  title="Glyph wallet by Yuga Labs - opens Glyph wallet directly"
                >
                  <GlyphIcon />
                  Glyph
                </button>
                <button
                  disabled={loading}
                  onClick={() => connectWallet("io.rabby")}
                  className="rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 px-3 py-2 text-xs flex items-center gap-2 text-secondary-foreground"
                >
                  <RabbyIcon />
                  Rabby
                </button>
                <button
                  disabled={loading}
                  onClick={() => connectWallet("io.metamask")}
                  className="rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 px-3 py-2 text-xs flex items-center gap-2 text-secondary-foreground"
                >
                  <MetaMaskIcon />
                  MetaMask
                </button>
                <button
                  disabled={loading}
                  onClick={() => connectWallet("me.rainbow")}
                  className="rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 px-3 py-2 text-xs flex items-center gap-2 text-secondary-foreground"
                >
                  <RainbowIcon />
                  Rainbow
                </button>
                <button
                  disabled={loading}
                  onClick={connectWalletConnect}
                  className="col-span-2 rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50 px-3 py-2 text-xs flex items-center gap-2 text-primary-foreground"
                >
                  <WalletConnectIcon />
                  WalletConnect
                </button>
              </div>
            </div>

            {/* Disconnect */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
