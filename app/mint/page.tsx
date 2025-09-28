"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Music, Sun, Moon, ArrowLeft, Plus, Minus, ExternalLink } from "lucide-react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
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

// Lazy load components to improve initial page load
const HeaderUser = lazy(() => import("@/components/HeaderUser"))
const NetworkSwitcher = lazy(() => import("@/components/NetworkSwitcher"))
const MenuDropdown = lazy(() => import("@/components/MenuDropdown"))


export default function MintPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
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
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

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
    <div className="min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      <div
        className="fixed inset-0 opacity-30 dark:opacity-25 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "center center",
          zIndex: 2,
          willChange: "transform",
        }}
      ></div>

      <div className="fixed inset-0 opacity-20 dark:opacity-15" style={{ zIndex: 1, willChange: "transform" }}>
        {/* Floating elements matching the main page */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/40 to-pink-500/40 dark:from-purple-500/25 dark:to-pink-500/25 rounded-full blur-xl float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-lg float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-500/30 to-red-500/30 dark:from-orange-500/15 dark:to-red-500/15 rounded-full blur-2xl float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-purple-500/35 to-pink-500/35 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl psychedelic-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-2xl psychedelic-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>
      
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

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 bg-background/80 backdrop-blur border-b border-border/50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow" aria-hidden="true">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ApeBeats Genesis
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="w-8 h-8 bg-muted animate-pulse rounded" />}>
            <MenuDropdown />
          </Suspense>
          <Suspense fallback={<div className="w-8 h-8 bg-muted animate-pulse rounded" />}>
            <NetworkSwitcher />
          </Suspense>
          <Suspense fallback={<div className="w-8 h-8 bg-muted animate-pulse rounded" />}>
            <HeaderUser />
          </Suspense>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 p-0"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-8 pt-28 pb-12 md:pt-36 md:pb-20" style={{ zIndex: 10 }}>
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
                  Balance: {formatEther(balance.value)} APE
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
      </main>
    </div>
  )
}
