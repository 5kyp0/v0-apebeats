import { createConfig, http } from "wagmi"
import { apeChain } from "viem/chains"
import { glyphWalletConnector } from "@use-glyph/sdk-react"

export const wagmiConfig = createConfig({
  chains: [apeChain],
  transports: {
    [apeChain.id]: http(),
  },
  connectors: [
    glyphWalletConnector()
  ],
  ssr: true,
  // Ensure ApeChain is the default chain
  defaultChain: apeChain,
})
