import { createConfig, http } from "wagmi"
import { glyphWalletConnector } from "@use-glyph/sdk-react"
import { apeChain, apeChainMainnet, mainnet, base, curtis } from "./chains"

// Create wagmi config lazily to avoid loading on non-wallet pages
let _wagmiConfig: ReturnType<typeof createConfig> | null = null

export function getWagmiConfig() {
  if (!_wagmiConfig) {
    _wagmiConfig = createConfig({
      chains: [apeChain, apeChainMainnet, mainnet, base, curtis],
      transports: {
        [apeChain.id]: http(),
        [apeChainMainnet.id]: http(),
        [mainnet.id]: http(),
        [base.id]: http(),
        [curtis.id]: http(),
      },
      connectors: [
        glyphWalletConnector({
          chains: [apeChain, apeChainMainnet, mainnet, base, curtis],
          options: {
            shimDisconnect: true,
          },
        })
      ],
      ssr: true,
      // Use ApeChain as the default chain
      defaultChain: apeChain,
    })
  }
  return _wagmiConfig
}

// Lazy getter for backward compatibility
export const wagmiConfig = new Proxy({} as ReturnType<typeof createConfig>, {
  get(target, prop) {
    return getWagmiConfig()[prop as keyof ReturnType<typeof createConfig>]
  }
})