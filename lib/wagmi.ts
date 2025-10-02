import { createConfig, http } from "wagmi"
import { glyphWalletConnector } from "@use-glyph/sdk-react"
import { apeChain, mainnet, base, curtis } from "./chains"

console.log("Creating wagmi config with apeChain:", apeChain)

export const wagmiConfig = createConfig({
  chains: [apeChain, mainnet, base, curtis],
  transports: {
    [apeChain.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
    [curtis.id]: http(),
  },
  connectors: [
    glyphWalletConnector({
      chains: [apeChain, mainnet, base, curtis],
      options: {
        shimDisconnect: true,
      },
    })
  ],
  ssr: true,
  // Use ApeChain as the default chain
  defaultChain: apeChain,
})