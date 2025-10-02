// Chain configurations
import { defineChain as defineViemChain } from "viem"
import { defineChain as defineThirdwebChain } from "thirdweb"
import { mainnet, base, arbitrum as curtis } from "viem/chains"

// ApeChain configuration with Alchemy API
// Required envs:
// - NEXT_PUBLIC_ALCHEMY_API_KEY (get from https://dashboard.alchemy.com)
// - NEXT_PUBLIC_APECHAIN_CHAIN_ID (33139 for ApeChain mainnet)
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ""
const APECHAIN_CHAIN_ID = Number(process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID || 33139) // ApeChain mainnet
const APECHAIN_RPC = ALCHEMY_API_KEY 
  ? `https://apechain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : ""


// Viem-compatible apeChain for wagmi/Glyph
export const apeChain = (() => {
  // Always use ApeChain configuration
  if (APECHAIN_CHAIN_ID && APECHAIN_RPC && APECHAIN_RPC !== "") {
    return defineViemChain({
      id: APECHAIN_CHAIN_ID,
      name: "ApeChain",
      rpcUrls: {
        default: {
          http: [APECHAIN_RPC],
        },
        public: {
          http: [APECHAIN_RPC],
        },
      },
      nativeCurrency: {
        name: "APE",
        symbol: "APE",
        decimals: 18,
      },
      blockExplorers: {
        default: {
          name: "ApeChain Explorer",
          url: "https://explorer.apechain.com",
        },
      },
      testnet: false,
    })
  } else {
    // Force ApeChain configuration even if env vars are missing
    return defineViemChain({
      id: 33139, // ApeChain mainnet
      name: "ApeChain",
      rpcUrls: {
        default: {
          http: ["https://apechain.calderachain.xyz/http"],
        },
        public: {
          http: ["https://apechain.calderachain.xyz/http"],
        },
      },
      nativeCurrency: {
        name: "APE",
        symbol: "APE",
        decimals: 18,
      },
      blockExplorers: {
        default: {
          name: "ApeChain Explorer",
          url: "https://explorer.apechain.com",
        },
      },
      testnet: false,
    })
  }
})()

// Thirdweb-compatible apeChain for thirdweb client
export const apeChainThirdweb = (() => {
  if (APECHAIN_CHAIN_ID && APECHAIN_RPC && APECHAIN_RPC !== "") {
    return defineThirdwebChain(APECHAIN_CHAIN_ID)
  } else {
    // Force ApeChain configuration even if env vars are missing
    return defineThirdwebChain(33139) // ApeChain mainnet
  }
})()

// Export all chains
export { mainnet, base, curtis }
