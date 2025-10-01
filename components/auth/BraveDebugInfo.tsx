"use client"

import { useState } from "react"
import { detectBrowser } from "@/lib/browserDetection"
import { useWalletService } from "@/lib/walletService"

export function BraveDebugInfo() {
  const [testResult, setTestResult] = useState<string>("")
  const walletService = useWalletService()
  const browserType = detectBrowser()

  const testPopupBlocking = async () => {
    try {
      // Test popup blocking directly
      const popup = window.open('', '_blank', 'width=400,height=300,scrollbars=yes,resizable=yes')
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setTestResult("❌ Popup blocked")
      } else {
        // Give it a moment
        await new Promise(resolve => setTimeout(resolve, 100))
        if (popup.closed) {
          setTestResult("❌ Popup was closed by browser")
        } else {
          setTestResult("✅ Popup opened successfully")
          popup.close()
        }
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`)
    }
  }

  const testWalletService = async () => {
    try {
      const result = await walletService.connectGlyphWalletWithGuidance()
      setTestResult(`WalletService result: ${JSON.stringify(result)}`)
    } catch (error: any) {
      const isPopupError = error.stack?.includes('requestConnection') || 
                          error.stack?.includes('index.js:18264') ||
                          error.stack?.includes('index.js:18311')
      setTestResult(`WalletService error: ${error.message}\nStack: ${error.stack?.substring(0, 200)}...\nIs popup error: ${isPopupError}`)
    }
  }

  const testDirectGlyph = async () => {
    try {
      // Test direct Glyph connection to see the raw error
      const { connect: connectGlyph } = await import("@use-glyph/sdk-react")
      await connectGlyph()
      setTestResult("✅ Direct Glyph connection successful")
    } catch (error: any) {
      const isPopupError = error.stack?.includes('requestConnection') || 
                          error.stack?.includes('index.js:18264') ||
                          error.stack?.includes('index.js:18311')
      setTestResult(`❌ Direct Glyph error: ${error.message}\nIs popup error: ${isPopupError}`)
    }
  }

  return (
    <div className="p-4 border border-yellow-500 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
      <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
        🦁 Brave Debug Info
      </h3>
      <div className="space-y-2 text-sm">
        <div><strong>Browser:</strong> {browserType}</div>
        <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</div>
        <div><strong>Brave Property:</strong> {typeof window !== 'undefined' ? String((window.navigator as any).brave) : 'N/A'}</div>
        <div><strong>Test Result:</strong> {testResult}</div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={testPopupBlocking}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Test Popup
          </button>
          <button 
            onClick={testWalletService}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs"
          >
            Test WalletService
          </button>
          <button 
            onClick={testDirectGlyph}
            className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
          >
            Test Direct Glyph
          </button>
        </div>
      </div>
    </div>
  )
}
