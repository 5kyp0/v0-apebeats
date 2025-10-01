"use client"

import { NativeGlyphConnectButton, LogoutButton } from "@use-glyph/sdk-react"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"

export function GlyphConnectButton() {
  const { authenticated } = useSafeGlyph()
  
  return authenticated ? <LogoutButton /> : <NativeGlyphConnectButton />
}
