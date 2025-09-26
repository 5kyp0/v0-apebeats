"use client"
import { useState } from "react"
import { inAppWallet, createWallet, walletConnect } from "thirdweb/wallets"
import { preAuthenticate } from "thirdweb/wallets/in-app"
import { useConnect, useActiveAccount } from "thirdweb/react"
import { deploySmartAccount } from "thirdweb/wallets"
import { thirdwebClient } from "@/lib/thirdweb"
import useUserStore from "@/lib/userStore"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"email" | "code" | "done">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { connect } = useConnect()
  const account = useActiveAccount()
  const setEmailGlobal = useUserStore((s) => s.setEmail)

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
      // Optional: deploy smart account on first connect (no-op if deployed)
      try { await deploySmartAccount({ client: thirdwebClient, account: acc }); } catch {}
      setStep("done")
      setEmailGlobal(email)
      if (typeof window !== "undefined") window.localStorage.setItem("apebeats_email", email)
    } catch (e: any) {
      setError(e?.message || "Failed to verify code")
    } finally {
      setLoading(false)
    }
  }

  async function connectInjected(rdns: string) {
    setError(null)
    setLoading(true)
    try {
      const w = await connect(async () => {
        const w = createWallet(rdns)
        await w.connect({ client: thirdwebClient })
        return w
      })
      try { await deploySmartAccount({ client: thirdwebClient, account: w.account }); } catch {}
      setStep("done")
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet")
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
      try { await deploySmartAccount({ client: thirdwebClient, account: w.account }); } catch {}
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
              className="w-full rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-sm font-medium"
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
              className="w-full rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-sm font-medium"
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
              disabled={loading}
              onClick={() => connectInjected("app.glyph")}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-sm"
            >
              Glyph
            </button>
            <button
              disabled={loading}
              onClick={() => connectInjected("io.rabby")}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-sm"
            >
              Rabby
            </button>
            <button
              disabled={loading}
              onClick={() => connectInjected("io.metamask")}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-sm"
            >
              MetaMask
            </button>
            <button
              disabled={loading}
              onClick={() => connectInjected("me.rainbow")}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 px-3 py-2 text-sm"
            >
              Rainbow
            </button>
            <button
              disabled={loading}
              onClick={connectWithWalletConnect}
              className="col-span-2 rounded-md bg-lime-600 hover:bg-lime-500 disabled:opacity-50 px-3 py-2 text-sm font-medium"
            >
              WalletConnect (mobile)
            </button>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}


