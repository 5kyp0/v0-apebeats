import { createConfig } from "wagmi"
import { http, defineChain } from "viem"
// import { glyphWalletConnector } from "@use-glyph/sdk-react"

// ApeChain configuration
const APECHAIN_CHAIN_ID = Number(process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID || 33139)
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ""
const APECHAIN_RPC = ALCHEMY_API_KEY 
  ? `https://apechain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : "https://eth.llamarpc.com"

// Define ApeChain for wagmi
const apeChain = defineChain({
  id: APECHAIN_CHAIN_ID,
  name: "ApeChain",
  rpc: APECHAIN_RPC,
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

export const wagmiConfig = createConfig({
  chains: [apeChain],
  transports: {
    [apeChain.id]: http(),
  },
  connectors: [
    // glyphWalletConnector()
  ],
  ssr: true,
  // Ensure ApeChain is the default chain
  defaultChain: apeChain,
})
