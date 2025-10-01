import { create } from "zustand"

type UserState = {
  email: string | null
  setEmail: (email: string | null) => void
  isGlyphConnected: boolean
  setIsGlyphConnected: (connected: boolean) => void
  walletAddress: string | null
  setWalletAddress: (address: string | null) => void
}

const useUserStore = create<UserState>((set, get) => ({
  email: null,
  setEmail: (email) => {
    try {
      set({ email })
    } catch (error) {
      console.warn("Error setting email in store:", error)
    }
  },
  isGlyphConnected: false,
  setIsGlyphConnected: (connected) => {
    try {
      set({ isGlyphConnected: connected })
    } catch (error) {
      console.warn("Error setting Glyph connection state:", error)
    }
  },
  walletAddress: null,
  setWalletAddress: (address) => {
    try {
      set({ walletAddress: address })
    } catch (error) {
      console.warn("Error setting wallet address:", error)
    }
  },
}))

// Add error handling for store access
const originalGetState = useUserStore.getState
useUserStore.getState = () => {
  try {
    return originalGetState()
  } catch (error) {
    console.warn("Error getting store state:", error)
    return {
      email: null,
      setEmail: () => {},
      isGlyphConnected: false,
      setIsGlyphConnected: () => {},
      walletAddress: null,
      setWalletAddress: () => {},
    }
  }
}

export default useUserStore


