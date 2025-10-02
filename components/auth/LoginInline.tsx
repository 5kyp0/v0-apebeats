"use client"
import { useState, useEffect } from "react"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"

// Note: Glyph styles removed to prevent layout conflicts
import { MetaMaskIcon, RabbyIcon, RainbowIcon, WalletConnectIcon, GoogleIcon, XIcon, FacebookIcon } from "@/components/wallet/WalletIcons"
import { GlyphConnectButton } from "@/components/auth/GlyphConnectButton"
import { ClientOnly } from "@/components/ClientOnly"
import { useConnect, useActiveAccount } from "thirdweb/react"
import { inAppWallet, createWallet, walletConnect } from "thirdweb/wallets"
import { thirdwebClient, apeChain } from "@/lib/thirdweb"
import { preAuthenticate } from "thirdweb/wallets/in-app"

function LoginInlineContent({ onDone }: { onDone?: () => void }) {
  // All hooks must be called at the top level
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"idle"|"email"|"code"|"done">("idle")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Thirdweb hooks
  const { connect } = useConnect()
  const account = useActiveAccount()

  // Call useSafeGlyph hook at the top level
  const { user: glyphUser, authenticated: glyphAuthenticated } = useSafeGlyph()


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

  // Monitor Glyph connection state
  useEffect(() => {
    if (glyphAuthenticated && glyphUser?.evmWallet) {
      console.log("Glyph connection successful:", glyphUser)
      setStep("done")
      setLoading(false)
      handleOnDone()
    }
  }, [glyphAuthenticated, glyphUser])

  // Check if user is already connected
  useEffect(() => {
    if (account?.address || (glyphAuthenticated && glyphUser?.evmWallet)) {
      setStep("done")
      handleOnDone()
    }
  }, [account?.address, glyphAuthenticated, glyphUser?.evmWallet])

  // Debug logging
  console.log("LoginInlineContent render:", {
    glyphAuthenticated,
    glyphUser: glyphUser ? "present" : "null",
    account: account?.address,
    connect: typeof connect,
    thirdwebClient: thirdwebClient ? "present" : "null",
    onDone: typeof onDone,
    onDoneValue: onDone
  })

  async function sendCode() {
    setError(null); setLoading(true)
    try {
      console.log("Sending code to:", email)
      if (!thirdwebClient) {
        throw new Error("Thirdweb client not initialized")
      }
      await preAuthenticate({
        client: thirdwebClient,
        strategy: "email",
        email,
      })
      setStep("code")
    } catch (e: any) {
      console.error("Failed to send code:", e)
      setError(e?.message || "Failed to send code")
    } finally { setLoading(false) }
  }

  async function verifyCode() {
    setError(null); setLoading(true)
    try {
      console.log("Verifying code for:", email)
      if (!thirdwebClient || !connect) {
        throw new Error("Thirdweb client or connect function not initialized")
      }
      const wallet = inAppWallet()
      await connect(async () => {
        await wallet.connect({
          client: thirdwebClient,
          strategy: "email",
          email,
          verificationCode: code,
        })
        return wallet
      })
      setStep("done")
      handleOnDone()
    } catch (e: any) {
      console.error("Failed to verify code:", e)
      setError(e?.message || "Failed to verify code")
    } finally { setLoading(false) }
  }


  async function connectInjected(rdns: string) {
    setError(null); setLoading(true)
    try {
      console.log("Connecting wallet:", rdns)
      const wallet = createWallet(rdns)
      await connect(async () => {
        await wallet.connect({
          client: thirdwebClient,
        })
        return wallet
      })
      setStep("done")
      handleOnDone()
    } catch (e: any) { 
      console.error(`Failed to connect ${rdns}:`, e)
      setError(e?.message || "Failed to connect wallet. Please try again or use a different wallet.") 
    } finally { setLoading(false) }
  }

  async function connectWC() {
    setError(null); setLoading(true)
    try {
      console.log("Connecting WalletConnect")
      const wallet = walletConnect()
      await connect(async () => {
        await wallet.connect({
          client: thirdwebClient,
        })
        return wallet
      })
      setStep("done")
      handleOnDone()
    } catch (e: any) { 
      setError(e?.message || "Failed to connect") 
    } finally { setLoading(false) }
  }


  async function connectSocial(strategy: "google"|"x"|"facebook") {
    setError(null); setLoading(true)
    try {
      console.log("Connecting social wallet:", strategy)
      if (!thirdwebClient || !connect) {
        throw new Error("Thirdweb client or connect function not initialized")
      }
      const wallet = inAppWallet()
      await connect(async () => {
        await wallet.connect({
          client: thirdwebClient,
          strategy,
        })
        return wallet
      })
      setStep("done")
      handleOnDone()
    } catch (e: any) { 
      console.error("Failed to connect with social:", e)
      setError(e?.message || "Failed to connect with social") 
    } finally { setLoading(false) }
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
      
      {/* Show success message if connected */}
      {step === "done" && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
          <p className="text-xs text-green-600 dark:text-green-400">
            ✅ Successfully connected! You can now access all features.
          </p>
        </div>
      )}

      {step !== "done" && (
        <>
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
            <div className="rounded-md bg-secondary hover:bg-secondary/80 px-3 py-2 text-sm flex items-center gap-2 text-secondary-foreground">
              <GlyphConnectButton />
            </div>
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
        </>
      )}
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
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


