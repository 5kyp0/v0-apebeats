"use client"

import { useNativeGlyphConnection, useGlyph } from "@use-glyph/sdk-react"
import { useConnect, useDisconnect } from "thirdweb/react"
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets"
import { thirdwebClient, apeChain } from "./thirdweb"
import { deploySmartAccount } from "thirdweb/wallets"
import { preAuthenticate } from "thirdweb/wallets/in-app"
import { getContract } from "thirdweb"
import useUserStore from "@/stores/userStore"

export class WalletService {
  private static instance: WalletService
  private glyphConnection: any = null
  private glyphLogin: any = null
  private glyphUser: any = null
  private connect: any = null
  private disconnect: any = null
  private glyphStateWatcher: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  // Helper function to deploy smart account
  private async deploySmartAccountIfNeeded(wallet: any) {
    try {
      if (wallet && wallet.getAccount) {
        const account = await wallet.getAccount()
        if (account) {
          // For now, we'll skip smart account deployment as it requires specific account contracts
          // This can be enabled later when we have the proper account contract setup
          console.log("Smart account deployment skipped - requires account contract setup")
          // await deploySmartAccount({ 
          //   client: thirdwebClient, 
          //   account,
          //   accountContract: accountContract, // This needs to be defined
          //   chain: apeChain
          // })
        }
      }
    } catch (deployError) {
      console.warn('Smart account deployment failed:', deployError)
    }
  }

  // Initialize the service with hooks
  initialize(hooks: {
    connectGlyph: any
    glyphLogin: any
    glyphUser: any
    connect: any
    disconnect: any
  }) {
    this.glyphConnection = hooks.connectGlyph
    this.glyphLogin = hooks.glyphLogin
    this.glyphUser = hooks.glyphUser
    this.connect = hooks.connect
    this.disconnect = hooks.disconnect
    
    // Update user store when Glyph user changes
    this.updateUserStore()
    
    // Set up periodic check for Glyph user state changes
    // Temporarily disabled to fix connection issues
    // this.setupGlyphStateWatcher()
  }

  // Set up a watcher to detect Glyph user state changes
  private setupGlyphStateWatcher() {
    if (typeof window === 'undefined') return
    
    // Check for changes every 1 second
    const interval = setInterval(() => {
      const currentConnected = this.isGlyphConnected()
      const currentAddress = this.glyphUser?.evmWallet?.address || null
      
      const storeState = useUserStore.getState()
      if (storeState.isGlyphConnected !== currentConnected || 
          storeState.walletAddress !== currentAddress) {
        this.updateUserStore()
      }
    }, 1000)
    
    // Store interval ID for cleanup
    this.glyphStateWatcher = interval
  }

  // Clean up the watcher
  cleanup() {
    if (this.glyphStateWatcher) {
      clearInterval(this.glyphStateWatcher)
      this.glyphStateWatcher = null
    }
  }

  // Update user store with current connection state
  private updateUserStore() {
    if (typeof window === 'undefined') return
    
    const isConnected = this.isGlyphConnected()
    const walletAddress = this.glyphUser?.evmWallet?.address || null
    
    console.log("WalletService: Updating user store", {
      isConnected,
      walletAddress,
      glyphUser: this.glyphUser,
      evmWallet: this.glyphUser?.evmWallet
    })
    
    // Update user store
    useUserStore.getState().setIsGlyphConnected(isConnected)
    useUserStore.getState().setWalletAddress(walletAddress)
  }

  // Helper function to check if popup is blocked
  private async checkPopupBlocking(): Promise<boolean> {
    try {
      // For Brave browser, we need to be more careful with popup detection
      const isBrave = (window.navigator as any).brave || window.navigator.userAgent.toLowerCase().includes('brave')
      
      if (isBrave) {
        // Brave has more aggressive popup blocking, so we'll use a more reliable test
        const popup = window.open('', '_blank', 'width=400,height=300,scrollbars=yes,resizable=yes')
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          return true // Popup was blocked
        }
        // Give Brave a moment to potentially block the popup
        await new Promise(resolve => setTimeout(resolve, 100))
        if (popup.closed) {
          return true // Popup was closed by Brave
        }
        popup.close()
        return false
      } else {
        // Standard popup test for other browsers
        const popup = window.open('', '_blank', 'width=1,height=1')
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          return true // Popup was blocked
        }
        popup.close()
        return false
      }
    } catch (error) {
      return true
    }
  }

  // Helper function to open popup in a user-initiated way
  private openUserInitiatedPopup(url: string, name: string = 'glyph-connect'): Window | null {
    const isBrave = this.isBraveBrowser()
    
    // Brave requires more specific popup parameters to work reliably
    const popupParams = isBrave 
      ? 'width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no,personalbar=no'
      : 'width=500,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    
    const popup = window.open(url, name, popupParams)
    
    if (!popup) {
      throw new Error(this.getPopupErrorMessage())
    }
    
    return popup
  }

  // Helper function to check if we're running in Brave browser
  private isBraveBrowser(): boolean {
    return (window.navigator as any).brave || window.navigator.userAgent.toLowerCase().includes('brave')
  }

  // Helper function to get browser-specific popup error message
  private getPopupErrorMessage(): string {
    const isBrave = this.isBraveBrowser()
    if (isBrave) {
      return "Popup blocked by Brave browser. Please click the Brave shield icon in the address bar and turn off 'Shields' for this site, then try again."
    }
    return "Popup blocked. Please allow popups for this site and try again."
  }

  // Helper function to check if user is already connected to Glyph
  private isGlyphConnected(): boolean {
    return !!(this.glyphUser?.evmWallet)
  }

  // Public method to get connection status
  getGlyphConnectionStatus(): { isConnected: boolean; user: any } {
    return {
      isConnected: this.isGlyphConnected(),
      user: this.glyphUser
    }
  }

  async connectGlyphWallet(): Promise<void> {
    console.log("WalletService: connectGlyphWallet called", {
      glyphUser: this.glyphUser,
      evmWallet: this.glyphUser?.evmWallet,
      isConnected: this.isGlyphConnected(),
      glyphConnection: !!this.glyphConnection
    })
    
    if (!this.glyphConnection) {
      throw new Error("Glyph connection not initialized")
    }
    
    // Check if already connected
    if (this.isGlyphConnected()) {
      console.log("User already has Glyph wallet connected")
      return
    }
    
    console.log("Attempting to connect Glyph wallet...")
    
    // Check for popup blocking before attempting connection
    const isPopupBlocked = await this.checkPopupBlocking()
    if (isPopupBlocked) {
      console.warn("Popup blocking detected before Glyph connection attempt")
      throw new Error(this.getPopupErrorMessage())
    }
    
    try {
      // Add a small delay to ensure the popup has time to open
      const connectionPromise = this.glyphConnection()
      
      // Set a timeout to detect if popup doesn't open
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Connection timeout - popup may not have opened"))
        }, 5000) // 5 second timeout
      })
      
      await Promise.race([connectionPromise, timeoutPromise])
      console.log("Successfully connected Glyph wallet")
      console.log("Post-connection state:", {
        glyphUser: this.glyphUser,
        evmWallet: this.glyphUser?.evmWallet,
        isConnected: this.isGlyphConnected()
      })
      
      // Update user store after successful connection
      this.updateUserStore()
    } catch (error: any) {
      console.error("Glyph connection error:", error)
      
      // Handle specific error cases
      if (error.message?.includes('already connected') || 
          error.message?.includes('user already connected') ||
          error.message?.includes('already authenticated')) {
        console.log("User is already connected to Glyph")
        return
      }
      
      // Handle popup blocking errors - check for various error patterns
      if (error.message?.includes('popup') || 
          error.message?.includes('blocked') ||
          error.message?.includes('window.open') ||
          error.message?.includes('timeout') ||
          error.stack?.includes('requestConnection') ||
          error.stack?.includes('index.js:18264') ||
          error.stack?.includes('index.js:18311')) {
        console.log("Detected popup blocking or connection error, showing guidance")
        throw new Error(this.getPopupErrorMessage())
      }
      
      throw error
    }
  }

  // Method to manually trigger Glyph popup with user interaction
  async connectGlyphWalletWithUserInteraction(): Promise<void> {
    if (!this.glyphConnection) {
      throw new Error("Glyph connection not initialized")
    }
    
    // Check if already connected
    if (this.isGlyphConnected()) {
      console.log("User already has Glyph wallet connected")
      return
    }
    
    console.log("Attempting to connect Glyph wallet with user interaction...")
    
    try {
      // This should be called directly from a user click event
      await this.glyphConnection()
      console.log("Successfully connected Glyph wallet")
    } catch (error: any) {
      console.error("Glyph connection error:", error)
      
      // Handle specific error cases
      if (error.message?.includes('already connected') || 
          error.message?.includes('user already connected') ||
          error.message?.includes('already authenticated')) {
        console.log("User is already connected to Glyph")
        return
      }
      
      // Handle popup blocking errors
      if (error.message?.includes('popup') || 
          error.message?.includes('blocked') ||
          error.message?.includes('window.open')) {
        throw new Error(this.getPopupErrorMessage())
      }
      
      throw error
    }
  }

  // Alternative connection method that provides better user guidance
  async connectGlyphWalletWithGuidance(): Promise<{ success: boolean; message: string; needsPopup: boolean }> {
    if (!this.glyphConnection) {
      return { success: false, message: "Glyph connection not initialized", needsPopup: false }
    }
    
    // Check if already connected
    if (this.isGlyphConnected()) {
      return { success: true, message: "Already connected to Glyph wallet", needsPopup: false }
    }
    
    // Check for popup blocking first
    const isPopupBlocked = await this.checkPopupBlocking()
    if (isPopupBlocked) {
      return { 
        success: false, 
        message: this.getPopupErrorMessage(), 
        needsPopup: true 
      }
    }
    
    try {
      await this.glyphConnection()
      return { success: true, message: "Successfully connected to Glyph wallet", needsPopup: false }
    } catch (error: any) {
      if (error.message?.includes('already connected') || 
          error.message?.includes('user already connected') ||
          error.message?.includes('already authenticated')) {
        return { success: true, message: "Already connected to Glyph wallet", needsPopup: false }
      }
      
      if (error.message?.includes('popup') || 
          error.message?.includes('blocked') ||
          error.message?.includes('window.open')) {
        return { 
          success: false, 
          message: this.getPopupErrorMessage(), 
          needsPopup: true 
        }
      }
      
      return { success: false, message: error.message || "Failed to connect to Glyph wallet", needsPopup: false }
    }
  }

  async connectInjectedWallet(rdns: string): Promise<void> {
    if (!this.connect) {
      throw new Error("Connect function not initialized")
    }

    console.log(`Attempting to connect ${rdns} as injected wallet...`)
    const wallet = createWallet(rdns as any)
    const w = await this.connect(async () => {
      await wallet.connect({ client: thirdwebClient })
      return wallet
    })
    
    // Deploy smart account if we have a valid account
    await this.deploySmartAccountIfNeeded(w)
    
    console.log(`Successfully connected ${rdns} as injected wallet`)
  }

  async connectWalletConnect(): Promise<void> {
    if (!this.connect) {
      throw new Error("Connect function not initialized")
    }

    const wallet = walletConnect()
    const w = await this.connect(async () => {
      await wallet.connect({ client: thirdwebClient })
      return wallet
    })
    
    // Deploy smart account if we have a valid account
    await this.deploySmartAccountIfNeeded(w)
  }

  async connectSocialWallet(strategy: "google"|"x"|"facebook"): Promise<void> {
    if (!this.connect) {
      throw new Error("Connect function not initialized")
    }

    const wallet = inAppWallet()
    const w = await this.connect(async () => {
      await wallet.connect({ client: thirdwebClient, strategy })
      return wallet
    })
    
    // Deploy smart account if we have a valid account
    await this.deploySmartAccountIfNeeded(w)
  }

  async connectEmailWallet(email: string, code: string): Promise<void> {
    if (!this.connect) {
      throw new Error("Connect function not initialized")
    }

    const wallet = inAppWallet()
    const w = await this.connect(async () => {
      await wallet.connect({ client: thirdwebClient, strategy: "email", email, verificationCode: code })
      return wallet
    })
    
    // Check if user has a Glyph wallet, if not, create one
    if (!this.glyphUser?.evmWallet) {
      console.log("Creating Glyph wallet for user...")
      try {
        await this.glyphLogin()
        console.log("Glyph wallet created successfully")
      } catch (glyphError) {
        console.warn("Failed to create Glyph wallet:", glyphError)
      }
    }
    
    // Deploy smart account if we have a valid account
    await this.deploySmartAccountIfNeeded(w)
  }

  async sendEmailCode(email: string): Promise<void> {
    await preAuthenticate({ client: thirdwebClient, strategy: "email", email })
  }

  async switchToApeChain(): Promise<void> {
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
                name: apeChain.nativeCurrency?.name || "APE",
                symbol: apeChain.nativeCurrency?.symbol || "APE",
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
  }

  async disconnectWallet(): Promise<void> {
    if (!this.disconnect) {
      throw new Error("Disconnect function not initialized")
    }

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
      
      // Clear Glyph-related storage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('glyph') || key.includes('use-glyph')) {
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
    
    // Try to disconnect using the hook
    try {
      await this.disconnect()
    } catch (e) {
      console.warn('Hook disconnect failed:', e)
    }
  }

  // Specific method to disconnect Glyph wallet
  async disconnectGlyphWallet(): Promise<void> {
    console.log('Disconnecting Glyph wallet...')
    
    // Clear Glyph-specific storage
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('glyph') || key.includes('use-glyph')) {
          localStorage.removeItem(key)
        }
      })
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('glyph') || key.includes('use-glyph')) {
          sessionStorage.removeItem(key)
        }
      })
    }
    
    console.log('Glyph wallet disconnected')
  }
}

// Hook to use the wallet service
export function useWalletService() {
  const { connect: connectGlyph } = useNativeGlyphConnection()
  const { login: glyphLogin, user: glyphUser } = useGlyph()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const walletService = WalletService.getInstance()
  
  // Initialize the service with current hooks (only if not already initialized)
  if (!walletService.glyphConnection) {
    console.log("Initializing WalletService with hooks")
    walletService.initialize({
      connectGlyph,
      glyphLogin,
      glyphUser,
      connect,
      disconnect
    })
  } else {
    // Update the hooks in case they changed
    walletService.glyphConnection = connectGlyph
    walletService.glyphLogin = glyphLogin
    walletService.glyphUser = glyphUser
    walletService.connect = connect
    walletService.disconnect = disconnect
  }

  return walletService
}
