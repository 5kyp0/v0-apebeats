"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Send, Download, Copy, Check } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import useUserStore from "@/stores/userStore"

interface SendReceiveModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'send' | 'receive'
}

export function SendReceiveModal({ isOpen, onClose, mode }: SendReceiveModalProps) {
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const account = useActiveAccount()
  const isGlyphConnected = useUserStore((state) => state.isGlyphConnected)
  const walletAddress = useUserStore((state) => state.walletAddress)
  
  const currentAddress = account?.address || walletAddress

  if (!isOpen) return null

  const handleSend = async () => {
    if (!amount || !recipient) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // TODO: Implement actual send functionality using Thirdweb MCP
      console.log("Sending", amount, "APE to", recipient)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Success - close modal
      onClose()
      setAmount("")
      setRecipient("")
    } catch (err: any) {
      setError(err.message || "Failed to send tokens")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = async () => {
    if (currentAddress) {
      try {
        await navigator.clipboard.writeText(currentAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy address:", err)
      }
    }
  }

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
            <CardTitle className="text-lg flex items-center gap-2">
              {mode === 'send' ? (
                <>
                  <Send className="w-5 h-5" />
                  Send APE
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Receive APE
                </>
              )}
            </CardTitle>
            <CardDescription>
              {mode === 'send' 
                ? "Send ApeCoin to another address" 
                : "Share your address to receive ApeCoin"
              }
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {mode === 'send' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (APE)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleSend}
                disabled={loading || !amount || !recipient}
                className="w-full"
              >
                {loading ? "Sending..." : "Send APE"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Your Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={currentAddress || ""}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Share this address to receive ApeCoin. Make sure the sender is on the ApeChain network.
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

