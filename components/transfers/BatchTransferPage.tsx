"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { BatchTransferForm } from "./BatchTransferForm"
import { Leaderboard } from "./Leaderboard"
import { TeamManagement } from "./TeamManagement"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle, 
  Clock,
  Users,
  Coins,
  Send,
  Trophy,
  Shield
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function BatchTransferPage() {
  const [isClient, setIsClient] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const account = useActiveAccount()
  const { address: wagmiAddress } = useAccount()
  const { user: glyphUser, ready: glyphReady } = useSafeGlyph()
  const [lastReceipt, setLastReceipt] = useState<any>(null)
  
  useEffect(() => {
    setIsClient(true)
    // Add a small delay to ensure proper hydration
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  
  // Check for any wallet connection
  const isGlyphConnected = !!(glyphReady && glyphUser?.evmWallet)
  const hasWallet = !!(account?.address || wagmiAddress || isGlyphConnected)

  const handleTransferComplete = (receipt: any) => {
    setLastReceipt(receipt)
    toast.success("Batch transfer completed successfully!")
  }

  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Batch Transfer"
      showBackButton={true}
      backButtonText="Back to Home"
      backButtonHref="/"
      icon={<Coins className="w-5 h-5 text-primary-foreground" />}
      showFooter={false}
    >
      <div className="max-w-4xl mx-auto">
        {!isClient || !isHydrated ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Batch Transfer APE
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Send APE tokens to multiple addresses in a single transaction
              </p>
            </div>

        {/* Success Message */}
        {lastReceipt && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                Transfer Successful!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-green-700 dark:text-green-300">
                  Your batch transfer has been completed successfully.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Transaction Hash:
                  </span>
                  <code className="text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                    {lastReceipt.transactionHash?.slice(0, 10)}...
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const explorerUrl = `https://explorer.apechain.com/tx/${lastReceipt.transactionHash}`
                      window.open(explorerUrl, '_blank')
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Connection Status */}
        {!hasWallet && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Clock className="h-5 w-5" />
                Connect Your Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 dark:text-orange-300">
                Please connect your wallet to start batch transferring APE tokens.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Multiple Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Send to up to 100 addresses in a single transaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Gas Efficient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Save up to 70% on gas fees compared to individual transfers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Transparent Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Clear 0.5% fee structure with no hidden costs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="transfer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Batch Transfer
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Team Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transfer" className="mt-6">
            <BatchTransferForm onTransferComplete={handleTransferComplete} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <TeamManagement />
          </TabsContent>
        </Tabs>

            {/* Back to Home */}
            <div className="text-center mt-12">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                asChild
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </CommonPageLayout>
  )
}
