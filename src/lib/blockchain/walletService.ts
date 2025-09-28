"use client"

import { useNativeGlyphConnection, useGlyph } from "@use-glyph/sdk-react"
import { useConnect, useDisconnect } from "thirdweb/react"
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets"
import { thirdwebClient, apeChain } from "./thirdweb"
import { deploySmartAccount } from "thirdweb/wallets"
import { preAuthenticate } from "thirdweb/wallets/in-app"
import { getContract } from "thirdweb"

export class WalletService {
  private static instance: WalletService
  private glyphConnection: any = null
  private glyphLogin: any = null
  private glyphUser: any = null
  private connect: any = null
  private disconnect: any = null

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
  }

  async connectGlyphWallet(): Promise<void> {
    if (!this.glyphConnection) {
      throw new Error("Glyph connection not initialized")
    }
    
    console.log("Attempting to connect Glyph wallet...")
    await this.glyphConnection()
    console.log("Successfully connected Glyph wallet")
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
      
      // Clear sessionStorage too
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('thirdweb') || key.includes('wallet') || key.includes('connect')) {
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
}

// Hook to use the wallet service
export function useWalletService() {
  const { connect: connectGlyph } = useNativeGlyphConnection()
  const { login: glyphLogin, user: glyphUser } = useGlyph()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const walletService = WalletService.getInstance()
  
  // Initialize the service with current hooks
  walletService.initialize({
    connectGlyph,
    glyphLogin,
    glyphUser,
    connect,
    disconnect
  })

  return walletService
}
