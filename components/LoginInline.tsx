"use client"
import { useState } from "react"
import { inAppWallet, createWallet, walletConnect } from "thirdweb/wallets"
import { preAuthenticate } from "thirdweb/wallets/in-app"
import { useConnect } from "thirdweb/react"
import { thirdwebClient } from "@/lib/thirdweb"
import { deploySmartAccount } from "thirdweb/wallets"

export default function LoginInline({ onDone }: { onDone?: () => void }) {
  const { connect } = useConnect()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"idle"|"email"|"code"|"done">("idle")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendCode() {
    setError(null); setLoading(true)
    try {
      await preAuthenticate({ client: thirdwebClient, strategy: "email", email })
      setStep("code")
    } catch (e: any) {
      setError(e?.message || "Failed to send code")
    } finally { setLoading(false) }
  }

  async function verifyCode() {
    setError(null); setLoading(true)
    try {
      const wallet = inAppWallet()
      const w = await connect(async () => {
        await wallet.connect({ client: thirdwebClient, strategy: "email", email, verificationCode: code })
        return wallet
      })
      // Deploy smart account only if we have a valid account
      if (w && w.account) {
        try { 
          await deploySmartAccount({ client: thirdwebClient, account: w.account }) 
        } catch (deployError) {
          console.warn('Smart account deployment failed:', deployError)
        }
      }
      
      setStep("done"); onDone?.()
    } catch (e: any) {
      setError(e?.message || "Failed to verify code")
    } finally { setLoading(false) }
  }

  async function connectInjected(rdns: string) {
    setError(null); setLoading(true)
    try {
      let w = null as any
      try {
        w = await connect(async () => {
          const wallet = createWallet(rdns)
          await wallet.connect({ client: thirdwebClient })
          return wallet
        })
      } catch (injectedErr) {
        if (rdns === "app.glyph") {
          w = await connect(async () => {
            const wc = walletConnect()
            await wc.connect({ client: thirdwebClient })
            return wc
          })
        } else {
          throw injectedErr
        }
      }
      
      // Deploy smart account only if we have a valid account
      if (w && w.account) {
        try { 
          await deploySmartAccount({ client: thirdwebClient, account: w.account }) 
        } catch (deployError) {
          console.warn('Smart account deployment failed:', deployError)
        }
      }
      
      setStep("done"); onDone?.()
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function connectWC() {
    setError(null); setLoading(true)
    try {
      const w = await connect(async () => {
        const wallet = walletConnect()
        await wallet.connect({ client: thirdwebClient })
        return wallet
      })
      
      // Deploy smart account only if we have a valid account
      if (w && w.account) {
        try { 
          await deploySmartAccount({ client: thirdwebClient, account: w.account }) 
        } catch (deployError) {
          console.warn('Smart account deployment failed:', deployError)
        }
      }
      
      setStep("done"); onDone?.()
    } catch (e: any) { setError(e?.message || "Failed to connect") } finally { setLoading(false) }
  }

  async function connectSocial(strategy: "google"|"x"|"facebook") {
    setError(null); setLoading(true)
    try {
      const wallet = inAppWallet()
      const w = await connect(async () => {
        await wallet.connect({ client: thirdwebClient, strategy })
        return wallet
      })
      
      // Deploy smart account only if we have a valid account
      if (w && w.account) {
        try { 
          await deploySmartAccount({ client: thirdwebClient, account: w.account }) 
        } catch (deployError) {
          console.warn('Smart account deployment failed:', deployError)
          // Don't fail the entire flow if smart account deployment fails
        }
      }
      
      setStep("done"); onDone?.()
    } catch (e: any) { setError(e?.message || "Failed to connect with social") } finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-800 p-6 bg-black/90 backdrop-blur shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Sign in to ApeBeats</div>
        <button
          onClick={() => onDone?.()}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button disabled={loading} onClick={() => connectSocial("google")} className="rounded-md bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm">Google</button>
        <button disabled={loading} onClick={() => connectSocial("x")} className="rounded-md bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm">X</button>
        <button disabled={loading} onClick={() => connectSocial("facebook")} className="rounded-md bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm col-span-2">Facebook</button>
      </div>
      <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Or email</div>
      {step !== "code" && (
        <div className="space-y-2 mb-2">
          <input className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" placeholder="you@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <button disabled={!email || loading} onClick={sendCode} className="w-full rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-sm">Send Code</button>
        </div>
      )}
      {step === "code" && (
        <div className="space-y-2 mb-2">
          <input className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm tracking-widest" placeholder="123456" value={code} onChange={(e)=>setCode(e.target.value)} />
          <button disabled={!code || loading} onClick={verifyCode} className="w-full rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-sm">Verify & Connect</button>
        </div>
      )}
      <div className="my-3 h-px bg-zinc-800" />
      <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Or connect a wallet</div>
      <div className="grid grid-cols-2 gap-2">
        <button disabled={loading} onClick={() => connectInjected("app.glyph")} className="rounded-md bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm">Glyph</button>
        <button disabled={loading} onClick={() => connectInjected("io.rabby")} className="rounded-md bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm">Rabby</button>
        <button disabled={loading} onClick={() => connectInjected("io.metamask")} className="rounded-md bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm">MetaMask</button>
        <button disabled={loading} onClick={() => connectInjected("me.rainbow")} className="rounded-md bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm">Rainbow</button>
        <button disabled={loading} onClick={connectWC} className="col-span-2 rounded-md bg-lime-600 hover:bg-lime-500 px-3 py-2 text-sm">WalletConnect</button>
      </div>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  )
}


