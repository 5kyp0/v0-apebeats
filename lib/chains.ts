// Chain configurations
import { defineChain as defineViemChain } from "viem"
import { defineChain as defineThirdwebChain } from "thirdweb"
import { mainnet, base, arbitrum as curtis } from "viem/chains"

// Curtis Testnet configuration
// Required envs:
// - NEXT_PUBLIC_CHAIN_ID (33111 for Curtis Testnet)
// - NEXT_PUBLIC_RPC_URL (Curtis Testnet RPC URL)
const CURTIS_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 33111) // Curtis Testnet
const CURTIS_RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://curtis.rpc.caldera.xyz/http"

// ApeChain Mainnet configuration
// Required envs:
// - NEXT_PUBLIC_APECHAIN_CHAIN_ID (33139 for ApeChain Mainnet)
// - NEXT_PUBLIC_APECHAIN_RPC (ApeChain Mainnet RPC URL)
const APECHAIN_MAINNET_ID = Number(process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID || 33139) // ApeChain Mainnet
const APECHAIN_MAINNET_RPC = process.env.NEXT_PUBLIC_APECHAIN_RPC || "https://apechain-mainnet.g.alchemy.com/v2/demo"


// Viem-compatible Curtis Testnet for wagmi/Glyph
export const apeChain = (() => {
  // Use Curtis Testnet configuration
  return defineViemChain({
    id: CURTIS_CHAIN_ID,
    name: "Curtis Testnet",
    rpcUrls: {
      default: {
        http: [CURTIS_RPC],
      },
      public: {
        http: [CURTIS_RPC],
      },
    },
    nativeCurrency: {
      name: "APE",
      symbol: "APE",
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: "Curtis Explorer",
        url: "https://curtis.apescan.io",
      },
    },
    testnet: true,
  })
})()

// Thirdweb-compatible Curtis Testnet for thirdweb client
export const apeChainThirdweb = (() => {
  return defineThirdwebChain(CURTIS_CHAIN_ID)
})()

// Viem-compatible ApeChain Mainnet for wagmi/Glyph
export const apeChainMainnet = (() => {
  return defineViemChain({
    id: APECHAIN_MAINNET_ID,
    name: "ApeChain Mainnet",
    rpcUrls: {
      default: {
        http: [APECHAIN_MAINNET_RPC],
      },
      public: {
        http: [APECHAIN_MAINNET_RPC],
      },
    },
    nativeCurrency: {
      name: "APE",
      symbol: "APE",
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: "Apescan",
        url: "https://apescan.io",
      },
    },
    testnet: false,
  })
})()

// Thirdweb-compatible ApeChain Mainnet for thirdweb client
export const apeChainMainnetThirdweb = (() => {
  return defineThirdwebChain(APECHAIN_MAINNET_ID)
})()

// Export all chains
export { mainnet, base, curtis }
