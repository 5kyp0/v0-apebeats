"use client"
import { useState } from "react"
import { useWalletService } from "@/lib/blockchain/walletService"
import { GlyphIcon, MetaMaskIcon, RabbyIcon, RainbowIcon, WalletConnectIcon, EmailIcon, GoogleIcon, AppleIcon, XIcon, FacebookIcon } from "../wallet/WalletIcons"

export default function LoginInline({ onDone }: { onDone?: () => void }) {
  const walletService = useWalletService()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"idle"|"email"|"code"|"done">("idle")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendCode() {
    setError(null); setLoading(true)
    try {
      await walletService.sendEmailCode(email)
      setStep("code")
    } catch (e: any) {
      setError(e?.message || "Failed to send code")
    } finally { setLoading(false) }
  }

  async function verifyCode() {
    setError(null); setLoading(true)
    try {
      await walletService.connectEmailWallet(email, code)
      setStep("done"); onDone?.()
    } catch (e: any) {
      setError(e?.message || "Failed to verify code")
    } finally { setLoading(false) }
  }

  async function connectGlyphWallet() {
    setError(null); setLoading(true)
    try {
      await walletService.connectGlyphWallet()
      setStep("done"); onDone?.()
    } catch (e: any) { 
      console.error("Failed to connect Glyph wallet:", e)
      setError(e?.message || "Failed to connect Glyph wallet. Please try again.") 
    } finally { setLoading(false) }
  }

  async function connectInjected(rdns: string) {
    setError(null); setLoading(true)
    try {
      await walletService.connectInjectedWallet(rdns)
      setStep("done"); onDone?.()
    } catch (e: any) { 
      console.error(`Failed to connect ${rdns}:`, e)
      setError(e?.message || "Failed to connect wallet. Please try again or use a different wallet.") 
    } finally { setLoading(false) }
  }

  async function connectWC() {
    setError(null); setLoading(true)
    try {
      await walletService.connectWalletConnect()
      setStep("done"); onDone?.()
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function connectSocial(strategy: "google"|"x"|"facebook") {
    setError(null); setLoading(true)
    try {
      await walletService.connectSocialWallet(strategy)
      setStep("done"); onDone?.()
    } catch (e: any) { setError(e?.message || "Failed to connect with social") } finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border p-6 bg-card/90 backdrop-blur shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-foreground">Sign in to ApeBeats</div>
        <button
          onClick={() => onDone?.()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>
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
    </div>
  )
}


