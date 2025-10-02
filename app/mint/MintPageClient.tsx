"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Music, ArrowLeft, Plus, Minus } from "lucide-react"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { useRouter } from "next/navigation"
import { useAccount, useConnect, useDisconnect, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, formatEther } from "viem"
import { 
  CONTRACT_CONFIG, 
  MINT_CONFIG, 
  MERKLE_CONFIG, 
  CONTRACT_ABI, 
  type MintPhase,
  getMintPhase,
  getMaxQuantity,
  getPrice,
  getTotalPrice,
  validateMintParams
} from "@/lib/mint-config"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"

// Helper function to format balance to exactly 3 decimal places
function formatBalanceToThreeDecimals(value: bigint): string {
  if (value === 0n) return "0.000"
  
  const divisor = 10n ** 18n
  const wholePart = value / divisor
  const fractionalPart = value % divisor
  
  // Always show exactly 3 decimal places
  const fractionalString = fractionalPart.toString().padStart(18, '0')
  const formattedFractional = fractionalString.substring(0, 3)
  
  return `${wholePart}.${formattedFractional}`
}

export function MintPageClient() {
  const [isClient, setIsClient] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [mintPhase, setMintPhase] = useState<MintPhase>('gtd')
  const [totalMinted, setTotalMinted] = useState(0)
  const [isMinting, setIsMinting] = useState(false)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null)
  
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isConfirmed) {
      setNotification({ message: "🎉 Successfully minted!", type: 'success' })
      setIsMinting(false)
      // Refresh mint stats
      fetchMintStats()
    }
  }, [isConfirmed])

  useEffect(() => {
    if (error) {
      setNotification({ message: `❌ Minting failed: ${error.message}`, type: 'error' })
      setIsMinting(false)
    }
  }, [error])

  const fetchMintStats = async () => {
    // This would typically fetch from the contract
    // For now, we'll use mock data
    setTotalMinted(42) // Mock current minted count
  }

  const handleMint = async () => {
    // Validate mint parameters
    const validation = validateMintParams(mintPhase, quantity, address)
    if (!validation.valid) {
      setNotification({ message: `❌ ${validation.error}`, type: 'error' })
      return
    }

    if (!balance || balance.value < parseEther(getTotalPrice(mintPhase, quantity).toString())) {
      setNotification({ message: "❌ Insufficient balance", type: 'error' })
      return
    }

    setIsMinting(true)
    setNotification({ message: "⏳ Transaction submitted...", type: 'info' })

    try {
      const value = parseEther(getTotalPrice(mintPhase, quantity).toString())
      
      switch (mintPhase) {
        case 'founder':
          writeContract({
            address: CONTRACT_CONFIG.address as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'mintFounder',
            args: [BigInt(quantity)],
            value
          })
          break
        case 'gtd':
          writeContract({
            address: CONTRACT_CONFIG.address as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'mintGTD',
            args: [address as `0x${string}`, []], // Empty proof for demo
            value
          })
          break
        case 'fcfs':
          writeContract({
            address: CONTRACT_CONFIG.address as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'mintFCFS',
            args: [BigInt(quantity), address as `0x${string}`, []], // Empty proof for demo
            value
          })
          break
        case 'public':
          writeContract({
            address: CONTRACT_CONFIG.address as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'mintPublic',
            args: [BigInt(quantity)],
            value
          })
          break
      }
    } catch (err) {
      setNotification({ message: `❌ Transaction failed: ${err}`, type: 'error' })
      setIsMinting(false)
    }
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const mintProgress = (totalMinted / MINT_CONFIG.totalSupply) * 100

  return (
    <CommonPageLayout
      title="ApeBeats Genesis"
      showBackButton={true}
      backButtonText="Back to Home"
      backButtonHref="/"
      icon={<Music className="w-5 h-5 text-primary-foreground" />}
    >
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm ${
          notification.type === 'success' ? 'bg-green-500/90 text-white' :
          notification.type === 'error' ? 'bg-red-500/90 text-white' :
          'bg-blue-500/90 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Claim Your Genesis Beat
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
            Enter the Sonic Swamp Hub and claim your unique Genesis Beat artifact. 
            Each NFT contains procedurally generated audio-visual combinations from 4 layers of 10-second loops crafted in Ableton Live.
          </p>
        </div>

        {/* Mint Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center bg-background/50 backdrop-blur-sm border-border/50">
            <div className="text-3xl font-bold text-primary mb-2">{MINT_CONFIG.totalSupply}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Total Supply</div>
          </Card>
          <Card className="p-6 text-center bg-background/50 backdrop-blur-sm border-border/50">
            <div className="text-3xl font-bold text-accent mb-2">{totalMinted}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Minted</div>
          </Card>
          <Card className="p-6 text-center bg-background/50 backdrop-blur-sm border-border/50">
            <div className="text-3xl font-bold text-primary mb-2">{getPrice(mintPhase)}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">APE Price</div>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Mint Progress</span>
            <span>{totalMinted} / {MINT_CONFIG.totalSupply}</span>
          </div>
          <Progress value={mintProgress} className="h-3" />
        </div>

        {/* Mint Phases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { name: 'GTD Mint', status: mintPhase === 'gtd' ? 'Live' : 'Upcoming' },
            { name: 'FCFS Mint', status: mintPhase === 'fcfs' ? 'Live' : 'Upcoming' },
            { name: 'Public Mint', status: mintPhase === 'public' ? 'Live' : 'Upcoming' }
          ].map((phase, index) => (
            <Card 
              key={index}
              className={`p-4 text-center transition-all ${
                phase.status === 'Live' 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20' 
                  : 'bg-background/50 border-border/50'
              }`}
            >
              <div className="font-semibold mb-1">{phase.name}</div>
              <div className={`text-sm ${
                phase.status === 'Live' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {phase.status}
              </div>
            </Card>
          ))}
        </div>

        {/* Mint Interface */}
        <div className="max-w-md mx-auto">
          <Card className="p-8 bg-background/50 backdrop-blur-sm border-border/50">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Enter the Swamp Portal</h3>
              <p className="text-muted-foreground">Connect your wallet to claim your Genesis Beat artifact</p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="text-2xl font-bold min-w-[3rem] text-center">{quantity}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(getMaxQuantity(mintPhase), quantity + 1))}
                disabled={quantity >= getMaxQuantity(mintPhase)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Mint Button */}
            <Button
              onClick={handleMint}
              disabled={!isConnected || isMinting || isPending || isConfirming}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              {isMinting || isPending || isConfirming ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isConfirming ? 'Confirming...' : 'Minting...'}
                </div>
              ) : (
                `Mint ${quantity} Genesis Beat${quantity > 1 ? 's' : ''} - ${getTotalPrice(mintPhase, quantity)} APE`
              )}
            </Button>

            {/* Balance Display */}
            {isConnected && balance && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Balance: {formatBalanceToThreeDecimals(balance.value)} APE
              </div>
            )}

            {/* Connect Wallet Button */}
            {!isConnected && (
              <Button
                onClick={() => connect()}
                variant="outline"
                className="w-full mt-4"
              >
                Connect Wallet
              </Button>
            )}
          </Card>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </CommonPageLayout>
  )
}
