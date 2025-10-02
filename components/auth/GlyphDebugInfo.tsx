"use client"

import { useState } from "react"
import { useNativeGlyphConnection, useGlyph } from "@use-glyph/sdk-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function GlyphDebugInfo() {
  const { connect: connectGlyph } = useNativeGlyphConnection()
  const { login: glyphLogin, user: glyphUser } = useGlyph()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const runDebugCheck = async () => {
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      glyphUser: glyphUser,
      connectFunctionAvailable: !!connectGlyph,
      loginFunctionAvailable: !!glyphLogin,
      popupBlockingTest: null as boolean | null,
      windowOpenTest: null as boolean | null,
    }

    // Test popup blocking
    try {
      const popup = window.open('', '_blank', 'width=1,height=1')
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        info.popupBlockingTest = true
      } else {
        info.popupBlockingTest = false
        popup.close()
      }
    } catch (error) {
      info.popupBlockingTest = true
    }

    // Test window.open with proper parameters
    try {
      const popup = window.open(
        'about:blank',
        'test-popup',
        'width=500,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      )
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        info.windowOpenTest = true
      } else {
        info.windowOpenTest = false
        popup.close()
      }
    } catch (error) {
      info.windowOpenTest = true
    }

    setDebugInfo(info)
  }

  const testDirectConnection = async () => {
    try {
      console.log("Testing direct Glyph connection...")
      await connectGlyph()
      console.log("Direct connection successful!")
    } catch (error) {
      console.error("Direct connection failed:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Glyph Connection Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDebugCheck} variant="outline">
            Run Debug Check
          </Button>
          <Button onClick={testDirectConnection} variant="outline">
            Test Direct Connection
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-2">
            <h4 className="font-medium">Debug Results:</h4>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Current Glyph User:</strong> {glyphUser ? 'Connected' : 'Not Connected'}</p>
          <p><strong>Connect Function:</strong> {connectGlyph ? 'Available' : 'Not Available'}</p>
          <p><strong>Login Function:</strong> {glyphLogin ? 'Available' : 'Not Available'}</p>
        </div>
      </CardContent>
    </Card>
  )
}

