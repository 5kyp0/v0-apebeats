"use client"
import { useState, useEffect, useRef } from "react"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { GlyphIcon, MetaMaskIcon, RabbyIcon, RainbowIcon, WalletConnectIcon, EmailIcon, GoogleIcon, AppleIcon, XIcon, FacebookIcon } from "@/components/wallet/WalletIcons"
import { PopupGuidanceModal } from "@/components/auth/PopupGuidanceModal"
import { detectBrowser } from "@/lib/browserDetection"
import { ClientOnly } from "@/components/ClientOnly"

function LoginInlineContent({ onDone }: { onDone?: () => void }) {
  // All hooks must be called at the top level
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"idle"|"email"|"code"|"done">("idle")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPopupGuidance, setShowPopupGuidance] = useState(false)
  const [glyphInitialized, setGlyphInitialized] = useState(false)

  // Call useSafeGlyph hook at the top level
  const { login: glyphLogin, user: glyphUser, authenticated: glyphAuthenticated, ready: glyphReady } = useSafeGlyph()

  // Use refs to store the latest values
  const glyphReadyRef = useRef(glyphReady)
  const glyphAuthenticatedRef = useRef(glyphAuthenticated)
  const glyphUserRef = useRef(glyphUser)
  
  // Update refs on every render
  glyphReadyRef.current = glyphReady
  glyphAuthenticatedRef.current = glyphAuthenticated
  glyphUserRef.current = glyphUser

  // Simple function to handle onDone calls
  const handleOnDone = () => {
    console.log("handleOnDone called")
    try {
      if (onDone && typeof onDone === 'function') {
        onDone()
      } else {
        console.log("onDone is not a function or is undefined")
      }
    } catch (error) {
      console.warn("Error calling onDone:", error)
    }
  }

  // Track when Glyph is initialized
  useEffect(() => {
    if (glyphReady !== undefined) {
      setGlyphInitialized(true)
    }
  }, [glyphReady])

  // Monitor Glyph connection state using refs with delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const currentReady = glyphReadyRef.current
        const currentAuthenticated = glyphAuthenticatedRef.current
        const currentUser = glyphUserRef.current
        
        if (currentReady && currentAuthenticated && currentUser?.evmWallet) {
          console.log("Glyph connection successful:", currentUser)
          setStep("done")
          setShowPopupGuidance(false)
          setLoading(false)
          handleOnDone()
        }
      } catch (error) {
        console.warn("Error in Glyph connection monitoring:", error)
      }
    }, 100) // Small delay to ensure values are stable
    
    return () => clearTimeout(timeoutId)
  })

  // Debug logging
  console.log("LoginInlineContent render:", {
    glyphReady,
    glyphAuthenticated,
    glyphUser: glyphUser ? "present" : "null",
    glyphLogin: typeof glyphLogin,
    glyphInitialized,
    onDone: typeof onDone,
    onDoneValue: onDone
  })

  async function sendCode() {
    setError(null); setLoading(true)
    try {
      // For now, just simulate sending code
      console.log("Sending code to:", email)
      setStep("code")
    } catch (e: any) {
      setError(e?.message || "Failed to send code")
    } finally { setLoading(false) }
  }

  async function verifyCode() {
    setError(null); setLoading(true)
    try {
      // For now, just simulate email wallet connection
      console.log("Verifying code for:", email)
      setStep("done"); handleOnDone()
    } catch (e: any) {
      setError(e?.message || "Failed to verify code")
    } finally { setLoading(false) }
  }

  function connectGlyphWallet() {
    setError(null)
    setLoading(true)
    
    console.log("Attempting to connect Glyph wallet using login function...")
    
    // Check if already connected
    if (glyphReady && glyphAuthenticated && glyphUser?.evmWallet) {
      console.log("Already connected to Glyph, skipping connection")
      setStep("done")
      setShowPopupGuidance(false)
      setLoading(false)
      handleOnDone()
      return
    }
    
    try {
      // Use the Glyph login function - this is void, not a promise
      if (typeof glyphLogin === 'function') {
        glyphLogin()
        console.log("Glyph login initiated")
        
        // Don't set loading to false immediately since the connection is async
        // The connection state will be handled by the useEffect
      } else {
        console.warn("Glyph login function not available")
        setError("Glyph wallet not available. Please try again.")
        setLoading(false)
        return
      }
    } catch (e: any) {
      console.error("Failed to initiate Glyph login:", e)
      setError(e?.message || "Failed to connect Glyph wallet. Please try again.")
      setLoading(false)
    }
  }

  const handleRetryGlyphConnection = () => {
    setShowPopupGuidance(false)
    setError(null)
    connectGlyphWallet()
  }

  async function connectInjected(rdns: string) {
    setError(null); setLoading(true)
    try {
      // For now, just simulate connection
      console.log("Connecting wallet:", rdns)
      setStep("done"); handleOnDone()
    } catch (e: any) { 
      console.error(`Failed to connect ${rdns}:`, e)
      setError(e?.message || "Failed to connect wallet. Please try again or use a different wallet.") 
    } finally { setLoading(false) }
  }

  async function connectWC() {
    setError(null); setLoading(true)
    try {
      // For now, just simulate connection
      console.log("Connecting WalletConnect")
      setStep("done"); handleOnDone()
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function connectSocial(strategy: "google"|"x"|"facebook") {
    setError(null); setLoading(true)
    try {
      // For now, just simulate connection
      console.log("Connecting social wallet:", strategy)
      setStep("done"); handleOnDone()
    } catch (e: any) { setError(e?.message || "Failed to connect with social") } finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border p-6 bg-card/90 backdrop-blur shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-foreground">Sign in to ApeBeats</div>
        <button
          onClick={handleOnDone}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>
      
      {/* Show warning only if Glyph is initialized but not ready (indicating real error) */}
      {glyphInitialized && !glyphReady && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Glyph wallet is not available. You can still use other login methods below.
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button disabled={loading} onClick={() => connectSocial("google")} className="rounded-md bg-secondary hover:bg-secondary/80 px-3 py-2 text-sm flex items-center gap-2 text-secondary-foreground">
          <GoogleIcon />
          Google
        </button>
        <button disabled={loading} onClick={() => connectSocial("x")} className="rounded-md bg-secondary hover:bg-secondary/80 px-3 py-2 text-sm flex items-center gap-2 text-secondary-foreground">
          <XIcon />
          X
        </button>
        <button disabled={loading} onClick={() => connectSocial("facebook")} className="rounded-md bg-secondary hover:bg-secondary/80 px-3 py-2 text-sm col-span-2 flex items-center gap-2 text-secondary-foreground">
          <FacebookIcon />
          Facebook
        </button>
      </div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Or email</div>
      {step !== "code" && (
        <div className="space-y-2 mb-2">
          <input className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" placeholder="you@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <button disabled={!email || loading} onClick={sendCode} className="w-full rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50 px-3 py-2 text-sm text-primary-foreground">Send Code</button>
        </div>
      )}
      {step === "code" && (
        <div className="space-y-2 mb-2">
          <input className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm tracking-widest text-foreground placeholder:text-muted-foreground" placeholder="123456" value={code} onChange={(e)=>setCode(e.target.value)} />
          <button disabled={!code || loading} onClick={verifyCode} className="w-full rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50 px-3 py-2 text-sm text-primary-foreground">Verify & Connect</button>
        </div>
      )}
      <div className="my-3 h-px bg-border" />
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Or connect a wallet</div>
      <div className="grid grid-cols-2 gap-2">
        <button disabled={loading} onClick={connectGlyphWallet} className="rounded-md bg-secondary hover:bg-secondary/80 px-3 py-2 text-sm flex items-center gap-2 text-secondary-foreground" title="Glyph wallet by Yuga Labs - opens Glyph wallet directly">
          <GlyphIcon />
          Glyph
        </button>
        <button disabled={loading} onClick={() => connectInjected("io.rabby")} className="rounded-md bg-secondary hover:bg-secondary/80 px-3 py-2 text-sm flex items-center gap-2 text-secondary-foreground">
          <RabbyIcon />
          Rabby
        </button>
        <button disabled={loading} onClick={() => connectInjected("io.metamask")} className="rounded-md bg-secondary hover:bg-secondary/80 px-3 py-2 text-sm flex items-center gap-2 text-secondary-foreground">
          <MetaMaskIcon />
          MetaMask
        </button>
        <button disabled={loading} onClick={() => connectInjected("me.rainbow")} className="rounded-md bg-secondary hover:bg-secondary/80 px-3 py-2 text-sm flex items-center gap-2 text-secondary-foreground">
          <RainbowIcon />
          Rainbow
        </button>
        <button disabled={loading} onClick={connectWC} className="col-span-2 rounded-md bg-primary hover:bg-primary/90 px-3 py-2 text-sm flex items-center gap-2 text-primary-foreground">
          <WalletConnectIcon />
          WalletConnect
        </button>
      </div>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      
      {/* Popup Guidance Modal */}
      <PopupGuidanceModal
        isOpen={showPopupGuidance}
        onClose={() => setShowPopupGuidance(false)}
        onRetry={handleRetryGlyphConnection}
        browserType={detectBrowser()}
      />
    </div>
  )
}

export default function LoginInline({ onDone }: { onDone?: () => void }) {
  return (
    <ClientOnly>
      <LoginInlineContent onDone={onDone} />
    </ClientOnly>
  )
}


