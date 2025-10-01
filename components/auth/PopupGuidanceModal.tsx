"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, ExternalLink, Shield, Settings, RefreshCw } from "lucide-react"

interface PopupGuidanceModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
  browserType?: 'chrome' | 'brave' | 'firefox' | 'safari' | 'edge' | 'unknown'
}

export function PopupGuidanceModal({ isOpen, onClose, onRetry, browserType = 'unknown' }: PopupGuidanceModalProps) {
  const [step, setStep] = useState<'detect' | 'instructions' | 'retry'>('detect')

  if (!isOpen) return null

  const getBrowserInstructions = () => {
    switch (browserType) {
      case 'chrome':
        return {
          title: "Chrome Popup Settings",
          steps: [
            "Click the shield icon in the address bar",
            "Select 'Allow popups and redirects'",
            "Refresh the page and try connecting again"
          ]
        }
      case 'brave':
        return {
          title: "Brave Browser Popup Settings",
          steps: [
            "Click the Brave shield icon in the address bar",
            "Turn off 'Shields' for this site (temporarily)",
            "Or click 'Advanced controls' and allow 'Popups and redirects'",
            "Refresh the page and try connecting again",
            "Re-enable Shields after connecting if desired"
          ]
        }
      case 'firefox':
        return {
          title: "Firefox Popup Settings",
          steps: [
            "Click the shield icon in the address bar",
            "Turn off 'Enhanced Tracking Protection' for this site",
            "Or go to Settings > Privacy & Security > Permissions > Block pop-up windows",
            "Add this site to the exceptions list"
          ]
        }
      case 'safari':
        return {
          title: "Safari Popup Settings",
          steps: [
            "Go to Safari > Preferences > Websites",
            "Select 'Pop-up Windows' from the left sidebar",
            "Set this website to 'Allow'"
          ]
        }
      case 'edge':
        return {
          title: "Edge Popup Settings",
          steps: [
            "Click the shield icon in the address bar",
            "Select 'Allow popups and redirects'",
            "Refresh the page and try connecting again"
          ]
        }
      default:
        return {
          title: "Browser Popup Settings",
          steps: [
            "Look for a popup blocker icon in your browser's address bar",
            "Click it and allow popups for this site",
            "Or go to your browser's settings and add this site to the popup exceptions"
          ]
        }
    }
  }

  const instructions = getBrowserInstructions()

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">Popup Blocked</CardTitle>
            <CardDescription>
              Your browser is blocking the Glyph wallet connection popup
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              To connect your Glyph wallet, we need to open a popup window. Your browser is currently blocking this.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">{instructions.title}</h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={onRetry}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            <p>Still having issues? Try using a different wallet or contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
