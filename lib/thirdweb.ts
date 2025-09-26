// thirdweb client setup
import { createThirdwebClient, defineChain } from "thirdweb"
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets"

export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "demo-client-id",
})


// ApeChain configuration with Alchemy API
// Required envs:
// - NEXT_PUBLIC_ALCHEMY_API_KEY (get from https://dashboard.alchemy.com)
// - NEXT_PUBLIC_APECHAIN_CHAIN_ID (33139 for ApeChain mainnet)
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ""
const APECHAIN_CHAIN_ID = Number(process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID || 33139) // ApeChain mainnet
const APECHAIN_RPC = ALCHEMY_API_KEY 
  ? `https://apechain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : ""

// For testing, you can use Ethereum mainnet as fallback
const FALLBACK_CHAIN_ID = 1
const FALLBACK_RPC = "https://eth.llamarpc.com"

export const apeChain = APECHAIN_CHAIN_ID && APECHAIN_RPC
  ? defineChain({
      id: APECHAIN_CHAIN_ID,
      name: "ApeChain",
      rpc: APECHAIN_RPC,
      nativeCurrency: {
        name: "APE",
        symbol: "APE",
        decimals: 18,
      },
    })
  : defineChain({
      id: FALLBACK_CHAIN_ID,
      name: "Ethereum (Fallback)",
      rpc: FALLBACK_RPC,
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
    })

// Preferred wallets for Connect UI
export const preferredWallets = [
  // Injected wallets by rdns (will only show if installed)
  createWallet("io.metamask"),
  createWallet("io.rabby"),
  createWallet("me.rainbow"),
  createWallet("app.glyph"),
  // Fallback WalletConnect to support these on mobile
  walletConnect(),
  // In-app wallet with socials
  inAppWallet({
    auth: {
      options: ["email", "google", "apple", "x"],
    },
  }),
]


