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
        url: "https://explorer.curtis.apechain.xyz",
      },
    },
    testnet: true,
  })
})()

// Thirdweb-compatible Curtis Testnet for thirdweb client
export const apeChainThirdweb = (() => {
  return defineThirdwebChain(CURTIS_CHAIN_ID)
})()

// Export all chains
export { mainnet, base, curtis }
