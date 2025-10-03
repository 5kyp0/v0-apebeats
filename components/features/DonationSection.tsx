"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Copy, 
  CheckCircle, 
  ExternalLink,
  Gift,
  Building2
} from "lucide-react"

interface DonationOption {
  name: string
  address: string
  description: string
  icon: React.ReactNode
  color: string
}

const donationOptions: DonationOption[] = [
  {
    name: "Support Developer",
    address: "0x32cDaA9429365153Cf7BE048f42152945d99399d",
    description: "Support the developer behind ApeBeats",
    icon: <Heart className="w-5 h-5" />,
    color: "from-pink-500 to-rose-500"
  },
  {
    name: "ApeBeats Treasury",
    address: "0x5891199DEc0Cf3ce79EdEDC3101937fBE03C0297",
    description: "Support the ApeBeats project development",
    icon: <Building2 className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500"
  }
]

export default function DonationSection() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const copyToClipboard = async (address: string, name: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const openInExplorer = (address: string) => {
    // Open in Etherscan (you can modify this to support different networks)
    window.open(`https://etherscan.io/address/${address}`, '_blank')
  }

  return (
    <div className="mt-8 p-4 bg-card/10 backdrop-blur-sm border border-border/30 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Support ApeBeats</span>
        </div>
        <Badge variant="outline" className="text-xs">
          Optional
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4">
        Help keep this tool free and support development
      </p>

      <div className="space-y-2">
        {donationOptions.map((option, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 rounded border border-border/20 bg-background/20 hover:bg-background/30 transition-colors"
          >
            <div className={`w-6 h-6 bg-gradient-to-r ${option.color} rounded flex items-center justify-center flex-shrink-0`}>
              {option.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{option.name}</div>
              <div className="text-xs font-mono text-muted-foreground truncate">
                {option.address.slice(0, 6)}...{option.address.slice(-4)}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(option.address, option.name)}
                className="h-6 w-6 p-0"
              >
                {copiedAddress === option.address ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openInExplorer(option.address)}
                className="h-6 w-6 p-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {copiedAddress && (
        <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Address copied to clipboard!
        </div>
      )}
    </div>
  )
}
