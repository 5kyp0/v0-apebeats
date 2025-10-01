import { createConfig, http } from "wagmi"
import { apeChain, mainnet, base, curtis } from "viem/chains"
import { glyphWalletConnector } from "@use-glyph/sdk-react"

export const wagmiConfig = createConfig({
  chains: [apeChain, mainnet, base, curtis],
  transports: {
    [apeChain.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
    [curtis.id]: http(),
  },
  connectors: [
    glyphWalletConnector()
  ],
  ssr: true,
  // Ensure ApeChain is the default chain
  defaultChain: apeChain,
})
