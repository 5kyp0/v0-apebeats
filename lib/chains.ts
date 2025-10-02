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

// For testing, you can use Ethereum mainnet as fallback
const FALLBACK_CHAIN_ID = 1
const FALLBACK_RPC = "https://eth.llamarpc.com"

// Viem-compatible apeChain for wagmi/Glyph
export const apeChain = (() => {
  console.log("Creating viem apeChain with:", {
    APECHAIN_CHAIN_ID,
    APECHAIN_RPC: APECHAIN_RPC ? "set" : "not set",
    ALCHEMY_API_KEY: ALCHEMY_API_KEY ? "set" : "not set"
  })
  
  if (APECHAIN_CHAIN_ID && APECHAIN_RPC) {
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
    console.warn("Using fallback chain - ApeChain environment variables not set")
    // Use mainnet as fallback instead of custom Ethereum config
    return mainnet
  }
})()

// Thirdweb-compatible apeChain for thirdweb client
export const apeChainThirdweb = (() => {
  console.log("Creating thirdweb apeChain with:", {
    APECHAIN_CHAIN_ID,
    APECHAIN_RPC: APECHAIN_RPC ? "set" : "not set",
    ALCHEMY_API_KEY: ALCHEMY_API_KEY ? "set" : "not set"
  })
  
  if (APECHAIN_CHAIN_ID && APECHAIN_RPC) {
    return defineThirdwebChain({
      id: APECHAIN_CHAIN_ID,
      name: "ApeChain",
      rpc: [APECHAIN_RPC],
      nativeCurrency: {
        name: "APE",
        symbol: "APE",
        decimals: 18,
      },
      blockExplorers: [
        {
          name: "ApeChain Explorer",
          url: "https://explorer.apechain.com",
        },
      ],
      testnet: false,
    })
  } else {
    console.warn("Using fallback chain - ApeChain environment variables not set")
    // Use mainnet as fallback instead of custom Ethereum config
    return defineThirdwebChain({
      id: mainnet.id,
      name: mainnet.name,
      rpc: mainnet.rpcUrls.default.http,
      nativeCurrency: mainnet.nativeCurrency,
      blockExplorers: mainnet.blockExplorers ? [mainnet.blockExplorers.default] : [],
      testnet: mainnet.testnet,
    })
  }
})()

// Export all chains
export { mainnet, base, curtis }
