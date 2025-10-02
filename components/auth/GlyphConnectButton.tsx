"use client"

import { NativeGlyphConnectButton } from "@use-glyph/sdk-react"
import { GlyphIcon } from "@/components/wallet/WalletIcons"
import { useRef } from "react"

export function GlyphConnectButton() {
  const nativeButtonRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    // Find the native button and trigger a click on it
    const nativeButton = nativeButtonRef.current?.querySelector('button')
    if (nativeButton) {
      nativeButton.click()
    }
  }

  return (
    <div 
      onClick={handleClick} 
      className="relative flex items-center gap-2 w-full cursor-pointer glyph-button-wrapper"
    >
      {/* Custom visual content */}
      <GlyphIcon />
      <span>Glyph</span>
      
      {/* Native button positioned absolutely (hidden but functional) */}
      <div ref={nativeButtonRef} className="absolute inset-0 glyph-native-overlay pointer-events-none">
        <NativeGlyphConnectButton />
      </div>
    </div>
  )
}
