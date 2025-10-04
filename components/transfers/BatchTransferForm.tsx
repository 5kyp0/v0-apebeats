"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Upload, 
  Users, 
  Coins, 
  Calculator, 
  Send, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Shuffle,
  Equal,
  Edit3
} from "lucide-react"
import { useSimpleBatchTransferService, type BatchTransferRecipient, type BatchTransferOptions } from "@/lib/simpleBatchService"
import { type WalletInfo } from "@/lib/walletTransactionService"
import { useApeCoinBalance } from "@/hooks/useApeCoinBalance"
import { TokenSelector } from "./TokenSelector"
import { APE_TOKEN_ADDRESS } from "@/lib/thirdweb"
import { toast } from "sonner"

interface BatchTransferFormProps {
  onTransferComplete?: (receipt: any) => void
}

function BatchTransferFormContent({ onTransferComplete }: BatchTransferFormProps) {
  const account = useActiveAccount()
  const { address: wagmiAddress } = useAccount()
  const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated, sendTransaction: glyphSendTransaction } = useSafeGlyph()
  const batchService = useSimpleBatchTransferService()
  const { balance: apeBalance, rawBalance: apeRawBalance, loading: balanceLoading, error: balanceError, refetch: refetchBalance } = useApeCoinBalance()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Check for any wallet connection
  const isGlyphConnected = !!(glyphReady && glyphAuthenticated && glyphUser?.evmWallet)
  const hasWallet = !!(account?.address || wagmiAddress || isGlyphConnected)
  const currentAddress = account?.address || wagmiAddress || glyphUser?.evmWallet
  
  // Create wallet info object for transaction service
  const getWalletInfo = (): WalletInfo | null => {
    if (account) {
      return {
        type: 'thirdweb',
        account: account,
        address: account.address
      }
    } else if (glyphUser?.evmWallet && glyphReady && glyphAuthenticated) {
      return {
        type: 'glyph',
        address: glyphUser.evmWallet,
        signer: { 
          sendTransaction: glyphSendTransaction
        },
        sendTransaction: glyphSendTransaction
      }
    }
    return null
  }
  
  const walletInfo = getWalletInfo()
  
  
  
  
  const [mode, setMode] = useState<'equal' | 'custom' | 'random'>('equal')
  const [recipients, setRecipients] = useState<BatchTransferRecipient[]>([])
  const [equalAmount, setEqualAmount] = useState("")
  const [equalTotalAmount, setEqualTotalAmount] = useState("") // New: total amount for equal distribution
  const [randomMin, setRandomMin] = useState("")
  const [randomMax, setRandomMax] = useState("")
  const [randomTotalAmount, setRandomTotalAmount] = useState("") // New: total amount for random distribution
  const [csvInput, setCsvInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [estimate, setEstimate] = useState<any>(null)
  const [feeBps, setFeeBps] = useState(50)
  const [selectedToken, setSelectedToken] = useState<string | undefined>(undefined) // Native APE by default

  // Load fee rate
  useEffect(() => {
    if (currentAddress) {
      loadFeeData()
    }
  }, [currentAddress, selectedToken])


  // Update estimate when inputs change
  useEffect(() => {
    if (recipients.length > 0) {
      updateEstimate()
    }
  }, [recipients, equalAmount, equalTotalAmount, randomMin, randomMax, randomTotalAmount, mode, selectedToken])

  const loadFeeData = async () => {
    if (!currentAddress) return
    
    try {
      const currentFeeBps = await batchService.getFeeBps(selectedToken as any)
      setFeeBps(currentFeeBps)
    } catch (error) {
      console.error("Error loading fee data:", error)
      // Set default values if contract is not configured
      setFeeBps(50)
    }
  }

  const updateEstimate = async () => {
    console.log("🔍 updateEstimate called with recipients:", recipients.length)
    if (recipients.length === 0) {
      setEstimate(null)
      return
    }

    try {
      const options: BatchTransferOptions = {
        recipients,
        mode,
        equalAmount: mode === 'equal' ? (equalTotalAmount ? undefined : equalAmount) : undefined,
        equalTotalAmount: mode === 'equal' ? equalTotalAmount : undefined,
        randomMin: mode === 'random' ? randomMin : undefined,
        randomMax: mode === 'random' ? randomMax : undefined,
        randomTotalAmount: mode === 'random' ? randomTotalAmount : undefined,
        tokenAddress: selectedToken as any,
      }
      
      console.log("🔍 Calling batchService.estimateTransfer with options:", options)
      const estimateResult = await batchService.estimateTransfer(options)
      console.log("🔍 Got estimate result:", estimateResult)
      setEstimate(estimateResult)
    } catch (error) {
      console.error("Error updating estimate:", error)
      // Handle error gracefully with fallback calculation
      let totalAmount = BigInt(0)
      
      if (mode === 'equal') {
        if (equalTotalAmount && !isNaN(parseFloat(equalTotalAmount))) {
          // Use total amount and divide by recipients
          const totalInWei = BigInt(Math.floor(parseFloat(equalTotalAmount) * 1e18))
          totalAmount = totalInWei
        } else if (equalAmount && !isNaN(parseFloat(equalAmount))) {
          // Use per-recipient amount
          const amountInWei = BigInt(Math.floor(parseFloat(equalAmount) * 1e18))
          totalAmount = amountInWei * BigInt(recipients.length)
        }
      } else if (mode === 'custom') {
        for (const recipient of recipients) {
          if (recipient.amount && !isNaN(parseFloat(recipient.amount))) {
            const amountInWei = BigInt(Math.floor(parseFloat(recipient.amount) * 1e18))
            totalAmount += amountInWei
          }
        }
      } else if (mode === 'random') {
        if (randomTotalAmount && !isNaN(parseFloat(randomTotalAmount))) {
          // Use total amount for random distribution
          const totalInWei = BigInt(Math.floor(parseFloat(randomTotalAmount) * 1e18))
          totalAmount = totalInWei
        } else if (randomMin && randomMax && !isNaN(parseFloat(randomMin)) && !isNaN(parseFloat(randomMax))) {
          // Use min/max range
          const minInWei = BigInt(Math.floor(parseFloat(randomMin) * 1e18))
          const maxInWei = BigInt(Math.floor(parseFloat(randomMax) * 1e18))
          const avgAmount = (minInWei + maxInWei) / BigInt(2)
          totalAmount = avgAmount * BigInt(recipients.length)
        }
      }
      
      const fee = (totalAmount * BigInt(50)) / BigInt(10000) // 0.5% fee
      setEstimate({
        totalAmount: totalAmount.toString(),
        fee: fee.toString(),
        totalRequired: (totalAmount + fee).toString(),
        tokenSymbol: "APE",
        tokenDecimals: 18
      })
    }
  }

  const parseCsvInput = (csv: string): BatchTransferRecipient[] => {
    const lines = csv.trim().split('\n')
    const parsed: BatchTransferRecipient[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      
      const parts = trimmed.split(',').map(p => p.trim())
      if (parts.length >= 1) {
        const address = parts[0]
        const amount = parts[1] || (mode === 'equal' ? equalAmount : '0')
        
        // Basic address validation
        if (address.startsWith('0x') && address.length === 42) {
          parsed.push({ address, amount })
        }
      }
    }
    
    return parsed
  }

  const handleCsvUpload = () => {
    const parsed = parseCsvInput(csvInput)
    setRecipients(parsed)
    setCsvInput("")
    toast.success(`Loaded ${parsed.length} recipients`)
  }

  const addRecipient = () => {
    setRecipients([...recipients, { address: "", amount: "" }])
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index: number, field: 'address' | 'amount', value: string) => {
    const updated = [...recipients]
    updated[index][field] = value
    setRecipients(updated)
  }

  const generateRandomAmounts = () => {
    if (mode !== 'random' || !randomMin || !randomMax) return
    
    const min = parseFloat(randomMin)
    const max = parseFloat(randomMax)
    
    const updated = recipients.map(recipient => ({
      ...recipient,
      amount: (Math.random() * (max - min) + min).toFixed(6)
    }))
    
    setRecipients(updated)
    toast.success("Generated random amounts")
  }

  const executeTransfer = async () => {
    console.log("🔍 executeTransfer called")
    console.log("🔍 Wallet info:", {
      type: walletInfo?.type,
      address: walletInfo?.address || walletInfo?.account?.address,
      hasAccount: !!walletInfo?.account,
      hasSigner: !!walletInfo?.signer,
      isGlyphConnected,
      glyphReady,
      glyphAuthenticated
    })
    
    if (!walletInfo || recipients.length === 0) {
      if (!walletInfo) {
        toast.error("Please connect a wallet (ThirdWeb or Glyph) to execute transactions")
      } else {
        toast.error("Please add recipients")
      }
      return
    }

    // Check for duplicate recipients
    const recipientAddresses = recipients.map(r => r.address.toLowerCase())
    const uniqueAddresses = new Set(recipientAddresses)
    if (recipientAddresses.length !== uniqueAddresses.size) {
      toast.error("Duplicate recipient addresses detected. Please use unique addresses for each recipient.")
      return
    }

    // Check if contract is configured
    const contractAddress = process.env.NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS
    console.log("🔍 Contract address:", contractAddress)
    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      toast.error("Batch transfer contract not configured. Please set up your environment variables.")
      return
    }

    setIsLoading(true)
    
    try {
      const options: BatchTransferOptions = {
        recipients,
        mode,
        equalAmount: mode === 'equal' ? (equalTotalAmount ? undefined : equalAmount) : undefined,
        equalTotalAmount: mode === 'equal' ? equalTotalAmount : undefined,
        randomMin: mode === 'random' ? randomMin : undefined,
        randomMax: mode === 'random' ? randomMax : undefined,
        randomTotalAmount: mode === 'random' ? randomTotalAmount : undefined,
        randomSeed: mode === 'random' ? Math.floor(Math.random() * 1000000) : undefined,
        tokenAddress: selectedToken as any, // Use ERC20 APE token
      }

      console.log("🔍 Executing transfer with options:", options)
      toast.loading("Executing batch transfer...")
      const receipt = await batchService.executeBatchTransfer(walletInfo, options)
      console.log("🔍 Transfer completed with receipt:", receipt)
      
      toast.success("Batch transfer completed successfully!")
      onTransferComplete?.(receipt)
      
      // Reset form
      setRecipients([])
      setEqualAmount("")
      setEqualTotalAmount("")
      setRandomMin("")
      setRandomMax("")
      setRandomTotalAmount("")
      setEstimate(null)
      
    } catch (error: any) {
      console.error("🔍 Transfer error:", error)
      console.error("🔍 Error message:", error.message)
      console.error("🔍 Error stack:", error.stack)
      toast.error(error.message || "Transfer failed")
    } finally {
      setIsLoading(false)
    }
  }

  const formatBalance = (balance: string) => {
    // Balance is already formatted from useApeCoinBalance hook
    return balance
  }

  const formatEstimate = (amount: string, isFee: boolean = false) => {
    // Use 5 decimal places for fees to show minimum fee details, 3 for other amounts
    return batchService.formatAmount(amount, 18, isFee ? 5 : 3)
  }


  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Token Selector - Temporarily disabled */}
      {/* <TokenSelector
        selectedToken={selectedToken}
        onTokenSelect={setSelectedToken}
        disabled={isLoading}
      /> */}
      
      {/* Temporary token selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Selection
          </CardTitle>
          <CardDescription>
            {isGlyphConnected 
              ? "ERC20 APE token is selected for Glyph wallet batch transfer" 
              : "Native APE token is selected for ThirdWeb wallet batch transfer"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Coins className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">APE</div>
                <div className="text-sm text-muted-foreground">ApeCoin</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Your Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {apeBalance} {estimate?.tokenSymbol || "APE"}
          </div>
          <div className="text-sm text-muted-foreground">
            Fee rate: {feeBps / 100}% per transaction
          </div>
        </CardContent>
      </Card>

      {/* Transfer Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Mode</CardTitle>
          <CardDescription>
            Choose how you want to distribute APE tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="equal" className="flex items-center gap-2">
                <Equal className="h-4 w-4" />
                Equal Amounts
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Custom Amounts
              </TabsTrigger>
              <TabsTrigger value="random" className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                Random Amounts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="equal" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="equalTotalAmount">Total amount to distribute (APE)</Label>
                  <Input
                    id="equalTotalAmount"
                    type="number"
                    step="0.000001"
                    placeholder="10.0"
                    value={equalTotalAmount}
                    onChange={(e) => {
                      setEqualTotalAmount(e.target.value)
                      if (e.target.value) {
                        setEqualAmount("") // Clear per-recipient amount when total is set
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This amount will be divided equally among all recipients
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">OR</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="equalAmount">Amount per recipient (APE)</Label>
                  <Input
                    id="equalAmount"
                    type="number"
                    step="0.000001"
                    placeholder="1.0"
                    value={equalAmount}
                    onChange={(e) => {
                      setEqualAmount(e.target.value)
                      if (e.target.value) {
                        setEqualTotalAmount("") // Clear total amount when per-recipient is set
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Each recipient will receive this exact amount
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="random" className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Feature Under Development</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Random batch transfers are currently disabled while we work on improving the feature. 
                  Please use Equal or Custom distribution for now.
                </p>
              </div>
              
              <div className="space-y-4 opacity-50 pointer-events-none">
                <div>
                  <Label htmlFor="randomTotalAmount">Total amount to distribute (APE)</Label>
                  <Input
                    id="randomTotalAmount"
                    type="number"
                    step="0.000001"
                    placeholder="10.0"
                    value={randomTotalAmount}
                    onChange={(e) => {
                      setRandomTotalAmount(e.target.value)
                      if (e.target.value) {
                        setRandomMin("")
                        setRandomMax("")
                      }
                    }}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This amount will be distributed randomly among all recipients
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">OR</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="randomMin">Minimum amount (APE)</Label>
                    <Input
                      id="randomMin"
                      type="number"
                      step="0.000001"
                      placeholder="0.1"
                      value={randomMin}
                      onChange={(e) => {
                        setRandomMin(e.target.value)
                        if (e.target.value) {
                          setRandomTotalAmount("")
                        }
                      }}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="randomMax">Maximum amount (APE)</Label>
                    <Input
                      id="randomMax"
                      type="number"
                      step="0.000001"
                      placeholder="10.0"
                      value={randomMax}
                      onChange={(e) => {
                        setRandomMax(e.target.value)
                        if (e.target.value) {
                          setRandomTotalAmount("")
                        }
                      }}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recipients Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recipients ({recipients.length})
          </CardTitle>
          <CardDescription>
            Add wallet addresses to send APE tokens to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CSV Upload */}
          <div className="space-y-2">
            <Label>Bulk Upload (CSV format)</Label>
            <Textarea
              placeholder="0x1234...,1.5&#10;0x5678...,2.0&#10;0x9abc...,0.5"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              rows={3}
            />
            <Button onClick={handleCsvUpload} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Load from CSV
            </Button>
          </div>

          {/* Individual Recipients */}
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="0x..."
                  value={recipient.address}
                  onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                  className="flex-1"
                />
                {mode === 'custom' && (
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="Amount"
                    value={recipient.amount}
                    onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                    className="w-32"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRecipient(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button onClick={addRecipient} variant="outline" size="sm">
              Add Recipient
            </Button>
          </div>

          {/* Random Amount Generator */}
          {mode === 'random' && recipients.length > 0 && (
            <Button onClick={generateRandomAmounts} variant="outline" size="sm">
              <Shuffle className="h-4 w-4 mr-2" />
              Generate Random Amounts
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Transfer Estimate */}
      {estimate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Transfer Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total to recipients:</span>
              <span className="font-mono">{formatEstimate(estimate.totalAmount)} {estimate.tokenSymbol || "APE"}</span>
            </div>
            <div className="flex justify-between">
              <span>Fee ({feeBps / 100}%):</span>
              <span className="font-mono text-orange-500">{formatEstimate(estimate.fee, true)} {estimate.tokenSymbol || "APE"}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total required:</span>
              <span className="font-mono">{formatEstimate(estimate.totalRequired, true)} {estimate.tokenSymbol || "APE"}</span>
            </div>
            
            {BigInt(apeRawBalance) < BigInt(estimate.totalRequired) && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Insufficient balance</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Execute Transfer */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={executeTransfer}
            disabled={!walletInfo || recipients.length === 0 || isLoading || !estimate}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Execute Batch Transfer
              </>
            )}
          </Button>
          
          {isClient && !hasWallet && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Please connect your wallet to continue
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function BatchTransferForm({ onTransferComplete }: BatchTransferFormProps) {
  return (
    <ErrorBoundary fallback={
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-500 mb-2">Component Error</h3>
          <p className="text-sm text-muted-foreground">There was an error loading the batch transfer form.</p>
        </div>
      </div>
    }>
      <BatchTransferFormContent onTransferComplete={onTransferComplete} />
    </ErrorBoundary>
  )
}
