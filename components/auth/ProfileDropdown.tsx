"use client"
import { useState, useEffect, useRef } from "react"
import { useActiveAccount, useWalletDetailsModal } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import useUserStore from "@/stores/userStore"
import { thirdwebClient, apeChain } from "@/lib/thirdweb"
import { ChevronDown, User, LogOut, Plus, Wifi, WifiOff, RefreshCw, Coins, Send, Download, Wallet } from "lucide-react"
import { PopupGuidanceModal } from "@/components/auth/PopupGuidanceModal"
import { detectBrowser } from "@/lib/browserDetection"
import { SendReceiveModal } from "@/components/auth/SendReceiveModal"
import { GlyphIcon, MetaMaskIcon, RabbyIcon, RainbowIcon, WalletConnectIcon } from "@/components/wallet/WalletIcons"
// Note: Glyph components will be dynamically imported to prevent style conflicts
import { useNetworkCheck } from "@/components/wallet/NetworkSwitcher"
import { useApeCoinBalance } from "@/hooks/useApeCoinBalance"


export default function ProfileDropdown() {
  const account = useActiveAccount()
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()
  const { login: glyphLogin, logout: glyphLogout, user: glyphUser, authenticated: glyphAuthenticated, ready: glyphReady } = useSafeGlyph()

  // Monitor Glyph connection state
  useEffect(() => {
    if (glyphReady && glyphAuthenticated && glyphUser?.evmWallet) {
      console.log("Glyph connection successful:", glyphUser)
      setShowDropdown(false)
      setShowPopupGuidance(false)
      setLoading(false)
    }
  }, [glyphReady, glyphAuthenticated, glyphUser])
  const { open: openWalletDetails } = useWalletDetailsModal()
  const email = useUserStore((state) => state.email)
  
  // Check for Glyph connection using the proper SDK method
  const isGlyphConnected = !!(glyphUser?.evmWallet)
  const currentAddress = account?.address || wagmiAddress || glyphUser?.evmWallet
  const { isCorrectNetwork, currentChainId } = useNetworkCheck()
  const { balance, loading: balanceLoading } = useApeCoinBalance()
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPopupGuidance, setShowPopupGuidance] = useState(false)
  const [showAdditionalWallets, setShowAdditionalWallets] = useState(false)
  const [showSendReceiveModal, setShowSendReceiveModal] = useState(false)
  const [sendReceiveMode, setSendReceiveMode] = useState<'send' | 'receive'>('send')
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)

  function connectGlyphWallet() {
    setError(null)
    setLoading(true)
    
    console.log("Attempting to connect Glyph wallet using login function...")
    
    // Check if already connected
    if (glyphReady && glyphUser?.evmWallet) {
      console.log("Already connected to Glyph, skipping connection")
      setShowDropdown(false)
      setShowPopupGuidance(false)
      setLoading(false)
      return
    }
    
    try {
      // Use the Glyph login function - this is void, not a promise
      glyphLogin()
      
      console.log("Glyph login initiated")
      
      // Don't set loading to false immediately since the connection is async
      // The connection state will be handled by the useEffect
    } catch (e: any) {
      console.error("Failed to initiate Glyph login:", e)
      setError(e?.message || "Failed to connect Glyph wallet. Please try again.")
      setLoading(false)
    }
  }

  async function connectWallet(rdns: string) {
    setError(null); setLoading(true)
    try {
      // For now, just simulate connection
      console.log("Connecting wallet:", rdns)
      setShowDropdown(false)
    } catch (e: any) { 
      console.error(`Failed to connect ${rdns}:`, e)
      setError(e?.message || "Failed to connect wallet. Please try again or use a different wallet.") 
    } finally { setLoading(false) }
  }

  async function connectWalletConnect() {
    setError(null); setLoading(true)
    try {
      // For now, just simulate connection
      console.log("Connecting WalletConnect")
      setShowDropdown(false)
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function connectSocial(strategy: "google"|"x"|"facebook") {
    setError(null); setLoading(true)
    try {
      // For now, just simulate connection
      console.log("Connecting social wallet:", strategy)
      setShowDropdown(false)
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function handleDisconnect() {
    try {
      console.log("Handling disconnect...")
      setShowDropdown(false)
      
      // Check if Glyph is connected and disconnect it
      if (isGlyphConnected) {
        console.log("Disconnecting Glyph wallet...")
        
        // Use the Glyph logout function
        if (typeof glyphLogout === 'function') {
          await glyphLogout()
          console.log("Glyph logout successful")
        } else {
          console.warn("Glyph logout function not available")
        }
        
        // Clear user store state
        useUserStore.getState().setIsGlyphConnected(false)
        useUserStore.getState().setWalletAddress(null)
        useUserStore.getState().setEmail(null)
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('apebeats_email')
          // Clear Glyph-related storage
          Object.keys(localStorage).forEach(key => {
            if (key.includes('glyph') || key.includes('use-glyph')) {
              localStorage.removeItem(key)
            }
          })
        }
      }
      
      // Clear all wallet-related storage
      if (typeof window !== 'undefined') {
        // Clear all thirdweb related storage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('thirdweb') || key.includes('wallet') || key.includes('connect')) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear sessionStorage too
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('thirdweb') || key.includes('wallet') || key.includes('connect') || key.includes('glyph')) {
            sessionStorage.removeItem(key)
          }
        })
      }
      
      console.log("Disconnect completed successfully")
      
    } catch (e) {
      console.error('Disconnect error:', e)
      setError("Failed to disconnect")
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
                  name: apeChain.nativeCurrency?.name || 'APE',
                  symbol: apeChain.nativeCurrency?.symbol || 'APE',
                  decimals: apeChain.nativeCurrency?.decimals || 18,
                },
                blockExplorerUrls: apeChain.blockExplorers?.[0]?.url 
                  ? [apeChain.blockExplorers[0].url] 
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

  const handleRetryGlyphConnection = async () => {
    setShowPopupGuidance(false)
    setError(null)
    connectGlyphWallet()
  }

  const handleSendTokens = () => {
    setSendReceiveMode('send')
    setShowSendReceiveModal(true)
    setShowDropdown(false)
  }

  const handleReceiveTokens = () => {
    setSendReceiveMode('receive')
    setShowSendReceiveModal(true)
    setShowDropdown(false)
  }

  // Close dropdown when clicking outside and adjust position
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    const adjustPosition = () => {
      if (dropdownRef.current && showDropdown) {
        const rect = dropdownRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const dropdownHeight = 400 // Approximate height of dropdown
        
        // If there's not enough space below, position above
        if (rect.bottom + dropdownHeight > viewportHeight) {
          setDropdownPosition('top')
        } else {
          setDropdownPosition('bottom')
        }
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      adjustPosition()
      window.addEventListener('resize', adjustPosition)
      window.addEventListener('scroll', adjustPosition)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', adjustPosition)
      window.removeEventListener('scroll', adjustPosition)
    }
  }, [showDropdown])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <User className="w-4 h-4" />
        {email || 
         (currentAddress ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}` : "Profile")}
        <ChevronDown className="w-3 h-3" />
      </button>

      {showDropdown && (
        <div className={`absolute right-0 z-[9999] w-80 max-h-[80vh] overflow-y-auto rounded-lg border border-border p-4 bg-card/95 backdrop-blur shadow-lg ${
          dropdownPosition === 'top' ? 'bottom-8' : 'top-8'
        }`}>
          <div className="space-y-4">
            {/* User Info */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Profile</div>
              {email && <div className="text-xs text-muted-foreground">{email}</div>}
              {currentAddress && (
                <div className="text-xs text-muted-foreground font-mono">
                  {account?.address ? "Thirdweb" : isGlyphConnected ? "Glyph" : "Wallet"}: {currentAddress}
                </div>
              )}
            </div>

            {/* ApeCoin Balance */}
            {currentAddress && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  ApeCoin Balance
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {balanceLoading ? (
                      <div className="w-16 h-5 bg-muted animate-pulse rounded" />
                    ) : (
                      `${balance} APE`
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isCorrectNetwork ? "ApeChain" : "Other Network"}
                  </div>
                </div>
              </div>
            )}

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

            {/* Glyph Connection Status */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Glyph Wallet</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GlyphIcon />
                  <span className="text-xs">
                    {isGlyphConnected ? (
                      <span className="text-green-500">Connected</span>
                    ) : (
                      <span className="text-muted-foreground">Not Connected</span>
                    )}
                  </span>
                </div>
                {isGlyphConnected && (
                  <button
                    onClick={async () => {
                      try {
                        console.log("Disconnecting Glyph wallet...")
                        
                        // Use the Glyph logout function
                        if (typeof glyphLogout === 'function') {
                          await glyphLogout()
                          console.log("Glyph logout successful")
                        } else {
                          console.warn("Glyph logout function not available")
                        }
                        
                        // Clear user store state
                        useUserStore.getState().setIsGlyphConnected(false)
                        useUserStore.getState().setWalletAddress(null)
                        useUserStore.getState().setEmail(null)
                        
                        // Clear localStorage
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('apebeats_email')
                          // Clear Glyph-related storage
                          Object.keys(localStorage).forEach(key => {
                            if (key.includes('glyph') || key.includes('use-glyph')) {
                              localStorage.removeItem(key)
                            }
                          })
                        }
                        
                        setError(null)
                        console.log("Glyph wallet disconnected successfully")
                      } catch (e: any) {
                        console.error("Failed to disconnect Glyph wallet:", e)
                        setError(e?.message || "Failed to disconnect Glyph wallet")
                      }
                    }}
                    className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* Send / Receive (APE) */}
            {currentAddress && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Wallet Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={loading}
                    onClick={handleSendTokens}
                    className="rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50 px-3 py-2 text-xs text-primary-foreground flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Send APE
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleReceiveTokens}
                    className="rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 px-3 py-2 text-xs text-secondary-foreground flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
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

      {/* Popup Guidance Modal */}
      <PopupGuidanceModal
        isOpen={showPopupGuidance}
        onClose={() => setShowPopupGuidance(false)}
        onRetry={handleRetryGlyphConnection}
        browserType={detectBrowser()}
      />

      {/* Send/Receive Modal */}
      <SendReceiveModal
        isOpen={showSendReceiveModal}
        onClose={() => setShowSendReceiveModal(false)}
        mode={sendReceiveMode}
      />
    </div>
  )
}
