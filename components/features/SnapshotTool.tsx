"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Square, 
  Download, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Settings,
  Network,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { BlockchainLogo } from "@/components/features/BlockchainLogos"
import { 
  getContract, 
  readContract, 
  getRpcClient,
  defineChain,
  type Address 
} from "thirdweb"
import { thirdwebClient } from "@/lib/thirdweb"
import { 
  withVercelTimeout, 
  getEnvironmentTimeout, 
  createProgressTracker, 
  updateProgress, 
  getElapsedTime,
  isVercelEnvironment 
} from "@/lib/snapshot/vercel-utils"
import { withRetry, CircuitBreaker, RateLimiter } from "@/lib/snapshot/retry-utils"
import { ChunkedProcessor, processContractsInChunks, ProgressManager } from "@/lib/snapshot/chunked-processor"

interface NetworkConfig {
  rpcUrl: string
  chainId: number
  networkName: string
}

interface Contract {
  address: string
  standard: 'auto' | 'erc721' | 'erc1155'
  customTotalSupply?: number
  tokenIdStart?: number
  tokenIdEnd?: number
}

interface SnapshotResult {
  timestamp: string
  totalHolders: number
  contracts: Array<{
    address: string
    standard: string
    holders: number
  }>
  holders: string[]
  network: string
  chainId: number
}

export default function SnapshotTool() {
  const [isRunning, setIsRunning] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [customNetwork, setCustomNetwork] = useState<NetworkConfig>({
    rpcUrl: "",
    chainId: 0,
    networkName: ""
  })
  const [contracts, setContracts] = useState<Contract[]>([])
  const [contractInput, setContractInput] = useState("")
  const [tokenStandard, setTokenStandard] = useState<'auto' | 'erc721' | 'erc1155'>('auto')
  const [customTotalSupply, setCustomTotalSupply] = useState("")
  const [tokenIdStart, setTokenIdStart] = useState(0)
  const [tokenIdEnd, setTokenIdEnd] = useState(99)
  const [progress, setProgress] = useState(0)
  const [processedContracts, setProcessedContracts] = useState(0)
  const [totalHolders, setTotalHolders] = useState(0)
  const [results, setResults] = useState<SnapshotResult[]>([])
  const [logs, setLogs] = useState<Array<{message: string, type: 'info' | 'success' | 'warning' | 'error'}>>([])
  const [provider, setProvider] = useState<any>(null)

  const networkConfigs = {
    ethereum: {
      rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`,
      chainId: 1,
      networkName: 'ethereum-mainnet'
    },
    polygon: {
      rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`,
      chainId: 137,
      networkName: 'polygon-mainnet'
    },
    arbitrum: {
      rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${apiKey}`,
      chainId: 42161,
      networkName: 'arbitrum-mainnet'
    },
    optimism: {
      rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${apiKey}`,
      chainId: 10,
      networkName: 'optimism-mainnet'
    },
    base: {
      rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${apiKey}`,
      chainId: 8453,
      networkName: 'base-mainnet'
    },
    apechain: {
      rpcUrl: apiKey ? `https://apechain-mainnet.g.alchemy.com/v2/${apiKey}` : 'https://apechain-mainnet.g.alchemy.com/v2/demo',
      chainId: 33139,
      networkName: 'apechain-mainnet'
    }
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setLogs(prev => [...prev, { message, type }])
  }

  // Function to fetch holders from a contract
  const fetchContractHolders = async (contract: Contract, rpc: any, chain: any): Promise<string[]> => {
    const holders = new Set<string>()
    
    // DEBUG: This should appear in logs if changes are applied
    addLog(`🔧 DEBUG: Starting fetchContractHolders for ${contract.address}`, 'info')
    
    // Add Vercel-compatible timeout wrapper
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Contract processing timeout after 8 seconds')), getEnvironmentTimeout())
    })
    
    const processPromise = (async () => {
      try {
      // Auto-detect token standard if needed
      let detectedStandard = contract.standard
      if (contract.standard === 'auto') {
        addLog(`Auto-detection enabled, defaulting to ERC721 for faster processing`, 'info')
        // Skip auto-detection for now to prevent hanging, default to ERC721
        detectedStandard = 'erc721'
        addLog(`Using ERC721 standard for contract ${contract.address}`, 'info')
      } else {
        addLog(`Using specified token standard: ${detectedStandard}`, 'info')
      }

      // Create contract instance with detected standard
      const contractInstance = getContract({
        client: thirdwebClient,
        chain: chain,
        address: contract.address as Address,
        abi: getStandardABI(detectedStandard)
      })

      // Get total supply first
      let totalSupply: bigint
      addLog(`Attempting to get total supply for contract ${contract.address}`, 'info')
      try {
        // Use Vercel-compatible timeout for totalSupply
        totalSupply = await withVercelTimeout(
          readContract({
            contract: contractInstance,
            method: "function totalSupply() view returns (uint256)",
            params: []
          }),
          3000 // 3 second timeout for totalSupply
        )
        addLog(`Successfully retrieved total supply: ${totalSupply.toString()}`, 'success')
      } catch (error) {
        addLog(`Failed to get total supply: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning')
        // If totalSupply fails, try to use custom total supply or estimate
        if (contract.customTotalSupply) {
          totalSupply = BigInt(contract.customTotalSupply)
          addLog(`Using custom total supply: ${totalSupply.toString()}`, 'info')
        } else {
          // For contracts without totalSupply, we'll scan a reasonable range
          totalSupply = BigInt(100) // Reduced default estimate for testing
          addLog(`Contract doesn't support totalSupply(), using default range: ${totalSupply.toString()}`, 'warning')
        }
      }

      addLog(`Contract ${contract.address} has total supply: ${totalSupply.toString()}`, 'info')

      // Determine token range to scan (Vercel optimized)
      let startTokenId = 0
      let endTokenId = Math.min(Number(totalSupply) - 1, 50) // Limit to 50 tokens max for Vercel

      if (detectedStandard === 'erc1155') {
        startTokenId = contract.tokenIdStart || 0
        endTokenId = contract.tokenIdEnd || 20 // Smaller limit for ERC1155
      }

      // Scan tokens to find holders
      if (detectedStandard === 'erc1155') {
        // For ERC1155, we need a different approach
        addLog(`ERC1155 contract detected. Scanning for holders using event logs...`, 'info')
        
        // For ERC1155, we'll use a simplified approach by checking recent events
        // This is not comprehensive but gives a starting point
        try {
          // Get recent TransferSingle events
          const events = await rpc({
            method: 'eth_getLogs',
            params: [{
              address: contract.address,
              topics: [
                '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', // TransferSingle
                null, // operator
                null, // from
                null  // to
              ],
              fromBlock: '0x0',
              toBlock: 'latest'
            }]
          })

          // Extract unique holders from events
          events.forEach((event: any) => {
            if (event.topics && event.topics.length >= 4) {
              const toAddress = '0x' + event.topics[3].slice(26) // Extract address from topic
              if (toAddress !== '0x0000000000000000000000000000000000000000') {
                holders.add(toAddress.toLowerCase())
              }
            }
          })

          addLog(`Found ${holders.size} holders from ERC1155 events`, 'info')
        } catch (error) {
          addLog(`Error scanning ERC1155 events: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
        }
      } else {
        // For ERC721 and auto-detect - Vercel optimized
        const batchSize = 3 // Very small batch size for Vercel
        const totalTokens = endTokenId - startTokenId + 1
        addLog(`Starting to scan ${totalTokens} tokens (${startTokenId} to ${endTokenId}) for ${contract.address}`, 'info')
        
        for (let i = startTokenId; i <= endTokenId; i += batchSize) {
          if (!isRunning) {
            addLog(`Scanning stopped by user`, 'warning')
            break
          }

          const batchEnd = Math.min(i + batchSize - 1, endTokenId)
          const batchPromises = []

          addLog(`Scanning batch: tokens ${i}-${batchEnd}`, 'info')

          for (let tokenId = i; tokenId <= batchEnd; tokenId++) {
            batchPromises.push(
              getTokenOwner(contractInstance, detectedStandard, tokenId).catch((error) => {
                // Silently handle errors for non-existent tokens
                return null
              })
            )
          }

          try {
            const batchResults = await Promise.all(batchPromises)
            
            batchResults.forEach(owner => {
              if (owner && owner !== '0x0000000000000000000000000000000000000000') {
                holders.add(owner.toLowerCase())
              }
            })

            // Update progress for this contract
            const progress = Math.round(((i - startTokenId + batchSize) / totalTokens) * 100)
            addLog(`Scanned tokens ${i}-${batchEnd} for ${contract.address} (${holders.size} unique holders so far) - ${progress}% complete`, 'info')
            
            // Add a small delay to avoid overwhelming the RPC
            await new Promise(resolve => setTimeout(resolve, 200))
          } catch (error) {
            addLog(`Error in batch ${i}-${batchEnd}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
            // Continue with next batch
          }
        }
      }

      } catch (error) {
        addLog(`Error fetching holders for ${contract.address}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      }

      return Array.from(holders)
    })()
    
    try {
      return await Promise.race([processPromise, timeoutPromise])
    } catch (error) {
      addLog(`Contract processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      return []
    }
  }

  // Helper function to get token owner
  const getTokenOwner = async (contract: any, standard: string, tokenId: number): Promise<string | null> => {
    try {
      if (standard === 'erc721' || standard === 'auto') {
        return await readContract({
          contract,
          method: "function ownerOf(uint256 tokenId) view returns (address)",
          params: [BigInt(tokenId)]
        })
      } else if (standard === 'erc1155') {
        // ERC1155 doesn't have ownerOf, we'll need to use a different approach
        // For now, return null and handle ERC1155 differently in the main function
        return null
      }
    } catch (error) {
      return null
    }
    return null
  }

  // Helper function to get ERC1155 holders (more complex approach)
  const getERC1155Holders = async (contract: any, tokenId: number, rpc: any): Promise<string[]> => {
    const holders = new Set<string>()
    
    try {
      // For ERC1155, we need to scan Transfer events to find holders
      // This is a simplified approach - in production you might want to use a more efficient method
      const fromBlock = 0
      const toBlock = 'latest'
      
      // Get TransferSingle and TransferBatch events
      const transferSingleFilter = {
        address: contract.address,
        topics: [
          '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', // TransferSingle
          null, // operator
          null, // from
          null, // to
          `0x${tokenId.toString(16).padStart(64, '0')}` // tokenId
        ],
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: toBlock
      }

      const transferBatchFilter = {
        address: contract.address,
        topics: [
          '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', // TransferBatch
          null, // operator
          null, // from
          null  // to
        ],
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: toBlock
      }

      // Get events (this is a simplified approach)
      // In a real implementation, you'd want to use a more efficient method
      // like using The Graph or Alchemy's enhanced APIs
      
      // For now, we'll use a basic approach by checking recent transfers
      // This is not comprehensive but gives a starting point
      
    } catch (error) {
      console.error('Error getting ERC1155 holders:', error)
    }
    
    return Array.from(holders)
  }

  // Helper function to detect token standard
  const detectTokenStandard = async (contract: any): Promise<'erc721' | 'erc1155'> => {
    try {
      addLog(`Testing ERC721 ownerOf function...`, 'info')
      // Try ERC721 ownerOf function
      await readContract({
        contract,
        method: "function ownerOf(uint256 tokenId) view returns (address)",
        params: [BigInt(1)]
      })
      addLog(`ERC721 detection successful`, 'success')
      return 'erc721'
    } catch (error) {
      addLog(`ERC721 detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'info')
      try {
        addLog(`Testing ERC1155 balanceOf function...`, 'info')
        // Try ERC1155 balanceOf function
        await readContract({
          contract,
          method: "function balanceOf(address account, uint256 id) view returns (uint256)",
          params: ['0x0000000000000000000000000000000000000000', BigInt(1)]
        })
        addLog(`ERC1155 detection successful`, 'success')
        return 'erc1155'
      } catch (error2) {
        addLog(`ERC1155 detection failed: ${error2 instanceof Error ? error2.message : 'Unknown error'}`, 'info')
        addLog(`Defaulting to ERC721`, 'warning')
        // Default to ERC721 if detection fails
        return 'erc721'
      }
    }
  }

  // Helper function to get standard ABI
  const getStandardABI = (standard: string) => {
    const baseABI = [
      {
        "type": "function" as const,
        "name": "totalSupply",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view" as const
      }
    ]

    if (standard === 'erc721' || standard === 'auto') {
      return [
        ...baseABI,
        {
          "type": "function" as const,
          "name": "ownerOf",
          "inputs": [{"name": "tokenId", "type": "uint256"}],
          "outputs": [{"name": "", "type": "address"}],
          "stateMutability": "view" as const
        }
      ]
    } else if (standard === 'erc1155') {
      return [
        ...baseABI,
        {
          "type": "function" as const,
          "name": "balanceOf",
          "inputs": [
            {"name": "account", "type": "address"},
            {"name": "id", "type": "uint256"}
          ],
          "outputs": [{"name": "", "type": "uint256"}],
          "stateMutability": "view" as const
        }
      ]
    }

    return baseABI
  }

  const selectNetwork = (network: string) => {
    setSelectedNetwork(network)
    if (network === 'custom') {
      addLog('Custom network configuration enabled', 'info')
      return
    }
    
    if (!apiKey && network !== 'custom') {
      addLog('Please enter your Alchemy API key first', 'warning')
      return
    }

    const config = networkConfigs[network as keyof typeof networkConfigs]
    if (config) {
      setCustomNetwork(config)
      addLog(`Selected ${network} network configuration`, 'success')
    }
  }

  const addContracts = () => {
    const addresses = contractInput
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr && /^0x[a-fA-F0-9]{40}$/.test(addr))

    const newContracts = addresses.map(address => ({
      address: address.toLowerCase(),
      standard: tokenStandard,
      customTotalSupply: customTotalSupply ? parseInt(customTotalSupply) : undefined,
      tokenIdStart: tokenStandard === 'erc1155' ? tokenIdStart : undefined,
      tokenIdEnd: tokenStandard === 'erc1155' ? tokenIdEnd : undefined
    }))

    setContracts(prev => [...prev, ...newContracts.filter(newContract => 
      !prev.some(existing => existing.address === newContract.address)
    )])
    setContractInput('')
    addLog(`Added ${newContracts.length} contract(s)`, 'success')
  }

  const removeContract = (address: string) => {
    setContracts(prev => prev.filter(contract => contract.address !== address))
    addLog(`Removed contract: ${address}`, 'info')
  }

  const clearContracts = () => {
    setContracts([])
    addLog('Cleared all contracts', 'info')
  }

  const clearLogs = () => {
    setLogs([])
  }

  const copyResults = () => {
    const text = results.join('\n')
    navigator.clipboard.writeText(text).then(() => {
      addLog('Results copied to clipboard', 'success')
    }).catch(err => {
      addLog('Failed to copy results: ' + err.message, 'error')
    })
  }

  const exportResults = () => {
    const data: SnapshotResult = {
      timestamp: new Date().toISOString(),
      totalHolders: results.length > 0 ? results[0].totalHolders : 0,
      contracts: results.length > 0 ? results[0].contracts : [],
      holders: results.length > 0 ? results[0].holders : [],
      network: results.length > 0 ? results[0].network : '',
      chainId: results.length > 0 ? results[0].chainId : 0
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `holder-snapshot-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addLog('Results exported successfully', 'success')
  }

  const startSnapshot = async () => {
    if (isRunning) return

    // Validate inputs
    if (!apiKey && selectedNetwork !== 'custom') {
      addLog('Please enter your Alchemy API key first', 'error')
      return
    }

    if (!customNetwork.rpcUrl) {
      addLog('Please enter an RPC URL or select a network preset', 'error')
      return
    }

    if (!customNetwork.chainId) {
      addLog('Please enter a Chain ID', 'error')
      return
    }

    if (contracts.length === 0) {
      addLog('Please add at least one contract address', 'error')
      return
    }

    setIsRunning(true)
    setResults([])
    setProcessedContracts(0)
    setTotalHolders(0)
    setProgress(0)
    const environment = isVercelEnvironment() ? 'Vercel' : 'Local'
    const timeoutLimit = getEnvironmentTimeout()
    addLog(`Starting snapshot process on ${environment} (timeout: ${timeoutLimit}ms)...`, 'info')

    // Test network connection first
    try {
      addLog(`Testing connection to: ${customNetwork.rpcUrl}`, 'info')
      addLog(`API Key provided: ${apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No'}`, 'info')
      
      const testChain = defineChain({
        id: customNetwork.chainId,
        name: customNetwork.networkName,
        rpc: customNetwork.rpcUrl,
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH", 
          decimals: 18,
        },
      })

      const testRpc = getRpcClient({ client: thirdwebClient, chain: testChain })
      
      // Test connection with retry logic and timeout
      const blockNumber = await withRetry(async () => {
        return await withVercelTimeout(
          testRpc({ method: 'eth_blockNumber', params: [] as any }),
          timeoutLimit
        )
      })
      addLog(`Network connection successful. Latest block: ${parseInt(blockNumber as string, 16)}`, 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLog(`Network connection failed: ${errorMessage}`, 'error')
      
      if (errorMessage.includes('401') || errorMessage.includes('Must be authenticated')) {
        addLog(`Authentication error: Please check your API key is valid and has access to ${selectedNetwork}`, 'error')
        addLog(`For ApeChain, you may need a specific Alchemy API key with ApeChain access`, 'warning')
      }
      
      setIsRunning(false)
      return
    }

    try {
      // Create chain configuration
      const chain = defineChain({
        id: customNetwork.chainId,
        name: customNetwork.networkName,
        rpc: customNetwork.rpcUrl,
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH", 
          decimals: 18,
        },
      })

      // Initialize RPC client
      const rpc = getRpcClient({ client: thirdwebClient, chain })
      addLog(`Connected to network: ${customNetwork.networkName} (chainId: ${customNetwork.chainId})`, 'success')
      
      addLog(`🚀 DEBUG: About to start processing ${contracts.length} contract(s)`, 'info')
      
      // Process contracts using chunked processor
      const contractProcessor = async (contract: Contract) => {
        addLog(`Processing contract: ${contract.address}`, 'info')
        
        try {
          const holders = await withRetry(async () => {
            return await withVercelTimeout(
              fetchContractHolders(contract, rpc, chain),
              timeoutLimit
            )
          })
          
          addLog(`Contract ${contract.address} completed: ${holders.length} holders found`, 'success')
          return holders
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          addLog(`Contract ${contract.address} failed: ${errorMessage}`, 'error')
          return []
        }
      }

      // Process contracts in chunks with progress tracking
      const results = await processContractsInChunks(
        contracts,
        contractProcessor,
        {
          chunkSize: 1, // Process 1 contract at a time for Vercel
          maxConcurrency: 1, // Sequential processing
          timeout: timeoutLimit,
          onProgress: (progress, current, elapsed) => {
            setProgress(progress)
            addLog(`Progress: ${progress}% - ${current} (${elapsed}s elapsed)`, 'info')
          },
          onChunkComplete: (chunkIndex, results) => {
            setProcessedContracts(chunkIndex + 1)
            addLog(`Chunk ${chunkIndex + 1} completed`, 'success')
          },
          onError: (error, chunkIndex) => {
            addLog(`Chunk ${chunkIndex + 1} failed: ${error.message}`, 'error')
          }
        }
      )

      // Collect all holders
      const allHolders = new Set<string>()
      let successCount = 0
      
      results.forEach(result => {
        if (result.success && result.data) {
          result.data.forEach(holder => allHolders.add(holder))
          successCount++
        }
      })
      
      const finalHolders = Array.from(allHolders)
      setTotalHolders(finalHolders.length)
      setProgress(100)
      
      // Create result
      const result: SnapshotResult = {
        timestamp: new Date().toISOString(),
        totalHolders: finalHolders.length,
        contracts: contracts.map(c => ({
          address: c.address,
          standard: c.standard,
          holders: finalHolders.length // Simplified for now
        })),
        holders: finalHolders,
        network: customNetwork.networkName,
        chainId: customNetwork.chainId
      }
      
      setResults([result])
      addLog(`Snapshot completed! Found ${finalHolders.length} unique holders across ${successCount}/${contracts.length} successful contracts`, 'success')

    } catch (error) {
      addLog(`Snapshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setIsRunning(false)
    }
  }

  const stopSnapshot = () => {
    setIsRunning(false)
    addLog('Snapshot stopped by user', 'warning')
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div
        className="fixed inset-0 opacity-30 dark:opacity-25 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "center center",
          zIndex: 2,
        }}
      ></div>

      <div className="fixed inset-0 opacity-20 dark:opacity-15" style={{ zIndex: 1 }}>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/40 to-pink-500/40 dark:from-purple-500/25 dark:to-pink-500/25 rounded-full blur-xl float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-lg float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-500/30 to-red-500/30 dark:from-orange-500/15 dark:to-red-500/15 rounded-full blur-2xl float" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 bg-background/80 backdrop-blur border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center pulse-glow">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ApeBeats Snapshot Tool</span>
        </div>
        <div className="flex items-center space-x-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 p-0"
          >
            {isDarkMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-8 pt-28 pb-12 md:pt-36 md:pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Token Holder Snapshot Tool
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
              Capture token holders from any EVM blockchain with real-time progress tracking
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Configuration */}
            <div className="space-y-6">
              {/* Network Setup */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Network Configuration
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Alchemy API Key</label>
                    <div className="flex gap-2">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Alchemy API key"
                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-background/50"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Network Presets</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(networkConfigs).map(([key, config]) => (
                        <Button
                          key={key}
                          variant={selectedNetwork === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectNetwork(key)}
                          className="text-xs flex items-center gap-1"
                        >
                          <BlockchainLogo chain={key} size={14} />
                          <span className="hidden sm:inline">
                            {key === 'apechain' ? 'ApeChain' : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span className="sm:hidden">
                            {key === 'apechain' ? '🦍' : key.charAt(0).toUpperCase() + key.slice(1, 3)}
                          </span>
                        </Button>
                      ))}
                      <Button
                        variant={selectedNetwork === 'custom' ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectNetwork('custom')}
                        className="text-xs flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        <span className="hidden sm:inline">Custom</span>
                      </Button>
                      <Button
                        variant={selectedNetwork === 'apechain-public' ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedNetwork('apechain-public')
                          setCustomNetwork({
                            rpcUrl: 'https://apechain-mainnet.g.alchemy.com/v2/demo',
                            chainId: 33139,
                            networkName: 'apechain-mainnet-public'
                          })
                          addLog('Using public ApeChain endpoint (limited functionality)', 'warning')
                        }}
                        className="text-xs flex items-center gap-1"
                      >
                        <BlockchainLogo chain="apechain" size={14} />
                        <span className="hidden sm:inline">ApeChain Public</span>
                        <span className="sm:hidden">🦍 Public</span>
                      </Button>
                    </div>
                  </div>

                  {selectedNetwork === 'custom' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={customNetwork.rpcUrl}
                        onChange={(e) => setCustomNetwork(prev => ({ ...prev, rpcUrl: e.target.value }))}
                        placeholder="RPC URL"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={customNetwork.chainId}
                          onChange={(e) => setCustomNetwork(prev => ({ ...prev, chainId: parseInt(e.target.value) || 0 }))}
                          placeholder="Chain ID"
                          className="px-3 py-2 border border-border rounded-lg bg-background/50"
                        />
                        <input
                          type="text"
                          value={customNetwork.networkName}
                          onChange={(e) => setCustomNetwork(prev => ({ ...prev, networkName: e.target.value }))}
                          placeholder="Network Name"
                          className="px-3 py-2 border border-border rounded-lg bg-background/50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Contract Setup */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Contract Configuration
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addContracts}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearContracts}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={contractInput}
                    onChange={(e) => setContractInput(e.target.value)}
                    placeholder="Enter contract addresses (one per line)"
                    className="w-full h-24 px-3 py-2 border border-border rounded-lg bg-background/50 resize-none"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Token Standard</label>
                    <select
                      value={tokenStandard}
                      onChange={(e) => setTokenStandard(e.target.value as 'auto' | 'erc721' | 'erc1155')}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background/50"
                    >
                      <option value="auto">🔍 Auto-detect</option>
                      <option value="erc721">🪙 ERC-721</option>
                      <option value="erc1155">🎯 ERC-1155</option>
                    </select>
                  </div>

                  {tokenStandard === 'erc1155' && (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={tokenIdStart}
                        onChange={(e) => setTokenIdStart(parseInt(e.target.value) || 0)}
                        placeholder="Start Token ID"
                        className="px-3 py-2 border border-border rounded-lg bg-background/50"
                      />
                      <input
                        type="number"
                        value={tokenIdEnd}
                        onChange={(e) => setTokenIdEnd(parseInt(e.target.value) || 99)}
                        placeholder="End Token ID"
                        className="px-3 py-2 border border-border rounded-lg bg-background/50"
                      />
                    </div>
                  )}

                  <input
                    type="number"
                    value={customTotalSupply}
                    onChange={(e) => setCustomTotalSupply(e.target.value)}
                    placeholder="Custom Total Supply (optional)"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background/50"
                  />
                </div>

                {contracts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Added Contracts ({contracts.length})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {contracts.map((contract, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                          <span className="text-xs font-mono">{contract.address}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContract(contract.address)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: Actions & Results */}
            <div className="space-y-6">
              {/* Actions */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Actions</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopSnapshot}
                      disabled={!isRunning}
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportResults}
                      disabled={results.length === 0}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={startSnapshot}
                  disabled={isRunning || contracts.length === 0}
                  className="w-full mb-4"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isRunning ? 'Processing...' : 'Start Snapshot'}
                </Button>

                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Contracts:</span>
                      <span className="ml-2 font-mono">{processedContracts}/{contracts.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Holders:</span>
                      <span className="ml-2 font-mono">{totalHolders}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Results */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Results</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{results.length} holders</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyResults}
                      disabled={results.length === 0}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1">
                  {results.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No results yet. Start a snapshot to see holders.</p>
                  ) : (
                    results.length > 0 && results[0].holders.map((holder, index) => (
                      <div key={index} className="p-2 bg-secondary/20 rounded text-xs font-mono">
                        {holder}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Logs */}
          <Card className="mt-8 p-6 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Logs</h3>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear
              </Button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No logs yet.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {getLogIcon(log.type)}
                    <span className="text-muted-foreground">
                      [{new Date().toLocaleTimeString()}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
