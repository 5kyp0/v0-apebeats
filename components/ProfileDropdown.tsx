"use client"
import { useState } from "react"
import { useActiveAccount, useConnect, useDisconnect, useWalletDetailsModal } from "thirdweb/react"
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets"
import { thirdwebClient } from "@/lib/thirdweb"
import { deploySmartAccount } from "thirdweb/wallets"
import useUserStore from "@/lib/userStore"
import { ChevronDown, User, LogOut, Plus } from "lucide-react"

export default function ProfileDropdown() {
  const account = useActiveAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { open: openWalletDetails } = useWalletDetailsModal()
  const email = useUserStore((s) => s.email)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function connectWallet(rdns: string) {
    setError(null); setLoading(true)
    try {
      let w = null as any
      try {
        w = await connect(async () => {
          const wallet = createWallet(rdns)
          await wallet.connect({ client: thirdwebClient })
          return wallet
        })
      } catch (injectedErr) {
        // If Glyph (not a browser extension) or other injected wallet isn't available, fallback to WalletConnect
        if (rdns === "app.glyph") {
          w = await connect(async () => {
            const wc = walletConnect()
            await wc.connect({ client: thirdwebClient })
            return wc
          })
        } else {
          throw injectedErr
        }
      }
      try { await deploySmartAccount({ client: thirdwebClient, account: w.account }) } catch {}
      setShowDropdown(false)
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function connectWalletConnect() {
    setError(null); setLoading(true)
    try {
      const w = await connect(async () => {
        const wallet = walletConnect()
        await wallet.connect({ client: thirdwebClient })
        return wallet
      })
      try { await deploySmartAccount({ client: thirdwebClient, account: w.account }) } catch {}
      setShowDropdown(false)
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function connectSocial(strategy: "google"|"x"|"facebook") {
    setError(null); setLoading(true)
    try {
      const wallet = inAppWallet()
      const w = await connect(async () => {
        await wallet.connect({ client: thirdwebClient, strategy })
        return wallet
      })
      try { await deploySmartAccount({ client: thirdwebClient, account: w.account }) } catch {}
      setShowDropdown(false)
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function handleDisconnect() {
    try {
      console.log('Disconnecting...')
      
      // Clear all localStorage first
      if (typeof window !== 'undefined') {
        // Clear our app storage
        localStorage.removeItem('apebeats_email')
        
        // Clear all thirdweb related storage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('thirdweb') || key.includes('wallet') || key.includes('connect')) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear sessionStorage too
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('thirdweb') || key.includes('wallet') || key.includes('connect')) {
            sessionStorage.removeItem(key)
          }
        })
      }
      
      // Try to disconnect using the hook
      try {
        await disconnect()
      } catch (e) {
        console.warn('Hook disconnect failed:', e)
      }
      
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
    openWalletDetails()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
      >
        <User className="w-4 h-4" />
        {email || (account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : "Profile")}
        <ChevronDown className="w-3 h-3" />
      </button>

      {showDropdown && (
        <div className="absolute top-8 right-0 z-50 w-80 rounded-lg border border-zinc-800 p-4 bg-black/90 backdrop-blur">
          <div className="space-y-4">
            {/* User Info */}
            <div className="space-y-2">
              <div className="text-sm font-semibold">Profile</div>
              {email && <div className="text-xs text-zinc-400">{email}</div>}
              {account?.address && (
                <div className="text-xs text-zinc-400 font-mono">{account.address}</div>
              )}
            </div>

            {/* Send / Receive (APE) */}
            {account?.address && (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Wallet Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={loading}
                    onClick={handleSend}
                    className="rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-xs"
                  >
                    Send APE
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleReceive}
                    className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-xs"
                  >
                    Receive
                  </button>
                </div>
              </div>
            )}

            {/* Connect Additional Wallets */}
            <div className="space-y-2">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Connect Wallets
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={loading}
                  onClick={() => connectWallet("app.glyph")}
                  className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-xs"
                >
                  Glyph
                </button>
                <button
                  disabled={loading}
                  onClick={() => connectWallet("io.rabby")}
                  className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-xs"
                >
                  Rabby
                </button>
                <button
                  disabled={loading}
                  onClick={() => connectWallet("io.metamask")}
                  className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-xs"
                >
                  MetaMask
                </button>
                <button
                  disabled={loading}
                  onClick={() => connectWallet("me.rainbow")}
                  className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-xs"
                >
                  Rainbow
                </button>
                <button
                  disabled={loading}
                  onClick={connectWalletConnect}
                  className="col-span-2 rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-xs"
                >
                  WalletConnect
                </button>
              </div>
            </div>

            {/* Disconnect */}
            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
