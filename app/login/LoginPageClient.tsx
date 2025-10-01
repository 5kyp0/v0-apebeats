"use client"
import { useState, useEffect } from "react"
import { inAppWallet, createWallet, walletConnect } from "thirdweb/wallets"
import { preAuthenticate } from "thirdweb/wallets/in-app"
import { useActiveAccount, useConnect } from "thirdweb/react"
import { deploySmartAccount } from "thirdweb/wallets"
import { thirdwebClient } from "@/lib/thirdweb"
import useUserStore from "@/stores/userStore"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { GlyphIcon, MetaMaskIcon, RabbyIcon, RainbowIcon, WalletConnectIcon, EmailIcon, GoogleIcon, AppleIcon, XIcon, FacebookIcon } from "@/components/wallet/WalletIcons"
import { PopupGuidanceModal } from "@/components/auth/PopupGuidanceModal"
import { detectBrowser } from "@/lib/browserDetection"
import { GlyphConnectButton } from "@/components/auth/GlyphConnectButton"
import { SimpleGlyphButton } from "@/components/auth/SimpleGlyphButton"
import { NativeGlyphConnectButton } from "@use-glyph/sdk-react"

export function LoginPageClient() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"email" | "code" | "done">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPopupGuidance, setShowPopupGuidance] = useState(false)

  const { login: glyphLogin, user: glyphUser, authenticated: glyphAuthenticated, ready: glyphReady } = useSafeGlyph()
  const account = useActiveAccount()
  const setEmailGlobal = useUserStore((state) => state.setEmail)

  // Monitor Glyph connection state
  useEffect(() => {
    if (glyphReady && glyphAuthenticated && glyphUser?.evmWallet) {
      console.log("Glyph connection successful:", glyphUser)
      setStep("done")
      setShowPopupGuidance(false)
      setLoading(false)
    }
  }, [glyphReady, glyphAuthenticated, glyphUser])

  // create the in-app wallet only when needed to avoid stale instances

  async function handleSendCode() {
    setError(null)
    setLoading(true)
    try {
      await preAuthenticate({ client: thirdwebClient, strategy: "email", email })
      setStep("code")
    } catch (e: any) {
      setError(e?.message || "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    setError(null)
    setLoading(true)
    try {
      const acc = await connect(async () => {
        const wallet = inAppWallet()
        await wallet.connect({
          client: thirdwebClient,
          strategy: "email",
          email,
          verificationCode: code,
        })
        return wallet
      })
      
      // Check if user has a Glyph wallet, if not, create one
      if (!glyphUser?.evmWallet) {
        console.log("Creating Glyph wallet for user...")
        try {
          await glyphLogin()
          console.log("Glyph wallet created successfully")
        } catch (glyphError) {
          console.warn("Failed to create Glyph wallet:", glyphError)
          // Continue without Glyph wallet if creation fails
        }
      }
      
      setStep("done")
      setEmailGlobal(email)
      if (typeof window !== "undefined") window.localStorage.setItem("apebeats_email", email)
    } catch (e: any) {
      setError(e?.message || "Failed to verify code")
    } finally {
      setLoading(false)
    }
  }

  function connectGlyphWallet() {
    console.log("=== GLYPH CONNECTION DEBUG ===")
    console.log("Button clicked!")
    console.log("Current loading state:", loading)
    console.log("Current error state:", error)
    console.log("Glyph ready:", glyphReady)
    console.log("Glyph user:", glyphUser)
    console.log("Glyph authenticated:", glyphAuthenticated)
    console.log("Glyph login function:", glyphLogin)
    
    setError(null)
    setLoading(true)
    
    console.log("Attempting to connect Glyph wallet using login function...")
    console.log("Glyph user before connection:", glyphUser)
    
    // Check if already connected to avoid the "already connected" error
    if (glyphReady && glyphUser?.evmWallet) {
      console.log("Already connected to Glyph, skipping connection")
      setStep("done")
      setShowPopupGuidance(false)
      setLoading(false)
      return
    }
    
    try {
      console.log("Calling glyphLogin()...")
      // Use the Glyph login function - this is void, not a promise
      glyphLogin()
      
      console.log("Glyph login initiated successfully")
      
      // Don't set loading to false immediately since the connection is async
      // The connection state will be handled by the useGlyph hook
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
    setError(null)
    setLoading(true)
    try {
      let w = null as any
      try {
        console.log(`Attempting to connect ${rdns} as injected wallet...`)
        w = await connect(async () => {
          const wallet = createWallet(rdns as any)
          await wallet.connect({ client: thirdwebClient })
          return wallet
        })
        console.log(`Successfully connected ${rdns} as injected wallet`)
      } catch (injectedErr) {
        console.log(`${rdns} injection failed:`, injectedErr)
        throw injectedErr
      }
      
      // Smart account deployment is handled by WalletService
      console.log("Smart account deployment handled by WalletService")
      
      setStep("done")
    } catch (e: any) {
      console.error(`Failed to connect ${rdns}:`, e)
      setError(e?.message || "Failed to connect wallet. Please try again or use a different wallet.")
    } finally {
      setLoading(false)
    }
  }

  async function connectWithWalletConnect() {
    setError(null)
    setLoading(true)
    try {
      const w = await connect(async () => {
        const _w = walletConnect()
        await _w.connect({ client: thirdwebClient })
        return _w
      })
      // TODO: Fix deploySmartAccount parameters
      // try { 
      //   if (w && w.getAccount) {
      //     const account = await w.getAccount()
      //     await deploySmartAccount({ client: thirdwebClient, account })
      //   }
      // } catch {}
      setStep("done")
    } catch (e: any) {
      setError(e?.message || "Failed to connect via WalletConnect")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800 p-6 bg-black/40">
        <h1 className="text-lg font-semibold mb-4">Login</h1>
        {step === "email" && (
          <div className="space-y-3">
            <label className="block text-sm">Email</label>
            <input
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <button
              disabled={!email || loading}
              onClick={handleSendCode}
              className="w-full rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-sm font-medium cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </div>
        )}
        {step === "code" && (
          <div className="space-y-3">
            <label className="block text-sm">Verification Code</label>
            <input
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm tracking-widest"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
            />
            <button
              disabled={!code || loading}
              onClick={handleVerify}
              className="w-full rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-sm font-medium cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Connect"}
            </button>
          </div>
        )}
        {step === "done" && (
          <div className="space-y-3 text-sm">
            <p className="text-zinc-300">Logged in as {email}</p>
            <p className="text-zinc-500">You can navigate back to the home page.</p>
          </div>
        )}

        <div className="my-6 h-px bg-zinc-800" />
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Or connect a wallet</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                console.log("=== TEST GLYPH BUTTON CLICKED ===")
                console.log("NativeGlyphConnectButton:", NativeGlyphConnectButton)
                console.log("GlyphConnectButton:", GlyphConnectButton)
                alert("Test button clicked! Check console for component info.")
              }}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm flex items-center gap-2 cursor-pointer"
            >
              <GlyphIcon />
              Test Glyph
            </button>
            <div className="rounded-md bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm flex items-center gap-2 cursor-pointer">
              <NativeGlyphConnectButton 
                onSuccess={() => {
                  console.log("NativeGlyphConnectButton success!")
                  setStep("done")
                  setShowPopupGuidance(false)
                }}
                onError={(error: any) => {
                  console.error("NativeGlyphConnectButton error:", error)
                  setError(error?.message || "Failed to connect to Glyph")
                }}
              />
            </div>
            <div className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-sm flex items-center gap-2 cursor-pointer">
              <GlyphConnectButton />
            </div>
            <button
              disabled={loading}
              onClick={() => connectInjected("io.rabby")}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <RabbyIcon />
              Rabby
            </button>
            <button
              disabled={loading}
              onClick={() => connectInjected("io.metamask")}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <MetaMaskIcon />
              MetaMask
            </button>
            <button
              disabled={loading}
              onClick={() => connectInjected("me.rainbow")}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <RainbowIcon />
              Rainbow
            </button>
            <button
              disabled={loading}
              onClick={connectWithWalletConnect}
              className="col-span-2 rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-sm font-medium flex items-center gap-2"
            >
              <WalletConnectIcon />
              WalletConnect (mobile)
            </button>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
      
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
