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
  Info,
  FileSpreadsheet,
  FileJson,
  ChevronDown
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
// Removed chunked processor import as we're using direct sequential processing

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
  const [isClient, setIsClient] = useState(false)
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
  const [showLogs, setShowLogs] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [provider, setProvider] = useState<any>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const currentResultsRef = useRef<SnapshotResult[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

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
    setLogs(prev => {
      const newLogs = [...prev, { message, type }]
      
      // Update progress based on log content for better synchronization
      if (message.includes('% complete') && message.includes('Progress:')) {
        const progressMatch = message.match(/(\d+)% complete/)
        if (progressMatch) {
          const logProgress = parseInt(progressMatch[1])
          setProgress(logProgress)
        }
      }
      
      // Update current step based on log content
      if (message.includes('Processing contract')) {
        const contractMatch = message.match(/Processing contract (\d+\/\d+)/)
        if (contractMatch) {
          setCurrentStep(`Processing contract ${contractMatch[1]}`)
        }
      } else if (message.includes('Starting snapshot process')) {
        setCurrentStep('Initializing snapshot...')
      } else if (message.includes('Scanning tokens')) {
        setCurrentStep('Scanning token holders...')
      } else if (message.includes('Completed scanning')) {
        setCurrentStep('Finalizing results...')
      } else if (message.includes('Snapshot completed')) {
        setCurrentStep('Complete')
      }
      
      return newLogs
    })
  }

  // Function to fetch holders from a contract
  const fetchContractHolders = async (contract: Contract, rpc: any, chain: any): Promise<string[]> => {
    const holders = new Set<string>()
    
    
    // Remove the timeout wrapper that was causing issues - let the processing complete naturally
    try {
      // Auto-detect token standard if needed
      let detectedStandard = contract.standard
      if (contract.standard === 'auto') {
        addLog(`Auto-detection enabled, detecting token standard for ${contract.address}`, 'info')
        // Create a basic contract instance for detection
        const basicContractInstance = getContract({
          client: thirdwebClient,
          chain: chain,
          address: contract.address as Address,
          abi: getStandardABI('erc721') // Start with ERC721 ABI for detection
        })
        try {
          detectedStandard = await detectTokenStandard(basicContractInstance)
          addLog(`Auto-detected token standard: ${detectedStandard}`, 'success')
        } catch (error) {
          addLog(`Auto-detection failed, defaulting to ERC721: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning')
          detectedStandard = 'erc721'
        }
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
        // Get total supply without timeout
        totalSupply = await readContract({
          contract: contractInstance,
          method: "function totalSupply() view returns (uint256)",
          params: []
        })
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

      // Determine token range to scan
      let startTokenId = 0
      let endTokenId = Number(totalSupply) - 1

      // If we couldn't get total supply, scan up to 10000 tokens
      if (totalSupply === BigInt(100)) {
        endTokenId = 9999 // Scan up to 10000 tokens (0-9999)
        addLog(`No total supply available, scanning up to 10000 tokens (0-9999)`, 'info')
      }

      if (detectedStandard === 'erc1155') {
        startTokenId = contract.tokenIdStart || 0
        endTokenId = contract.tokenIdEnd || 9999 // Allow larger range for ERC1155
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
        // For ERC721 and auto-detect - optimized for larger scans
        const batchSize = Math.min(5, Math.max(2, Math.floor((endTokenId - startTokenId + 1) / 200))) // Smaller batch size for better performance
        const totalTokens = endTokenId - startTokenId + 1
        addLog(`Starting to scan ${totalTokens} tokens (${startTokenId} to ${endTokenId}) for ${contract.address}`, 'info')
        
        for (let i = startTokenId; i <= endTokenId; i += batchSize) {
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
            
            let foundInBatch = 0
            batchResults.forEach((owner, index) => {
              if (owner && owner !== '0x0000000000000000000000000000000000000000') {
                holders.add(owner.toLowerCase())
                foundInBatch++
                addLog(`Found owner for token ${i + index}: ${owner}`, 'info')
              }
            })

            // Update progress for this contract
            const progress = Math.round(((i - startTokenId + batchSize) / totalTokens) * 100)
            addLog(`Scanned tokens ${i}-${batchEnd} for ${contract.address} (${foundInBatch} found in batch, ${holders.size} unique holders total) - ${progress}% complete`, 'info')
            
            // Add periodic progress updates for large collections - more frequent updates
            if (progress % 5 === 0) {
              addLog(`🔄 Still processing... ${progress}% complete, ${holders.size} unique holders found so far`, 'info')
            }
            
            // Update the global progress state for better UI responsiveness
            setProgress(Math.min(progress, 95)) // Cap at 95% until completion
            
            // Add a small delay to avoid overwhelming the RPC
            await new Promise(resolve => setTimeout(resolve, 100)) // Reduced delay for faster processing
          } catch (error) {
            addLog(`Error in batch ${i}-${batchEnd}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
            // Continue with next batch
          }
        }
      }

      addLog(`Completed scanning for ${contract.address}. Found ${holders.size} unique holders.`, 'success')

      // Update progress to 100% for this contract
      setProgress(100)

      // Convert to array and return immediately
      const holdersArray = Array.from(holders)
      return holdersArray

    } catch (error) {
      addLog(`Error fetching holders for ${contract.address}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      // Return empty array on error
      return []
    }
  }

  // Helper function to get token owner
  const getTokenOwner = async (contract: any, standard: string, tokenId: number): Promise<string | null> => {
    try {
      if (standard === 'erc721' || standard === 'auto') {
        const owner = await readContract({
          contract,
          method: "function ownerOf(uint256 tokenId) view returns (address)",
          params: [BigInt(tokenId)]
        })
        return owner
      } else if (standard === 'erc1155') {
        // ERC1155 doesn't have ownerOf, we'll need to use a different approach
        // For now, return null and handle ERC1155 differently in the main function
        return null
      }
    } catch (error) {
      // Token doesn't exist or other error - this is normal for many token IDs
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
      // Handle error silently
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

  // Helper function to get current results (use state as primary source)
  const getCurrentResults = () => {
    return results.length > 0 ? results : currentResultsRef.current
  }

  // Helper function to check if results are available
  const hasResults = () => {
    return results.length > 0 || currentResultsRef.current.length > 0
  }


  const copyResults = () => {
    // Get the most recent results
    const currentResults = results.length > 0 ? results : currentResultsRef.current
    
    if (currentResults.length === 0) {
      addLog('No results to copy', 'warning')
      return
    }
    
    // Copy holder addresses as plain text, one per line
    const result = currentResults[0]
    const holderAddresses = result.holders || []
    
    
    if (holderAddresses.length === 0) {
      addLog('No holder addresses found in results', 'warning')
      return
    }
    
    const text = holderAddresses.join('\n')
    
    // Use a more reliable copy method
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          addLog(`Copied ${holderAddresses.length} holder addresses to clipboard`, 'success')
        }).catch(err => {
          addLog('Failed to copy results: ' + err.message, 'error')
          // Fallback to textarea method
          fallbackCopyTextToClipboard(text, holderAddresses.length)
        })
      } else {
        // Fallback for non-secure contexts
        fallbackCopyTextToClipboard(text, holderAddresses.length)
      }
    } catch (error) {
      addLog('Failed to copy results: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
      fallbackCopyTextToClipboard(text, holderAddresses.length)
    }
  }

  const fallbackCopyTextToClipboard = (text: string, count: number) => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      if (successful) {
        addLog(`Copied ${count} holder addresses to clipboard (fallback method)`, 'success')
      } else {
        addLog('Failed to copy results using fallback method', 'error')
      }
    } catch (err) {
      addLog('Failed to copy results using fallback method: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error')
    }
    
    document.body.removeChild(textArea)
  }

  const exportResults = async (format: 'text' | 'csv' | 'json') => {
    // Get the most recent results - prioritize state over ref
    const currentResults = results.length > 0 ? results : currentResultsRef.current
    
    
    if (currentResults.length === 0) {
      addLog('❌ No results to export - please run a snapshot first', 'error')
      return
    }
    
    const result = currentResults[0]
    const holderAddresses = result.holders || []
    
    if (holderAddresses.length === 0) {
      addLog('❌ No holder addresses found in results to export', 'error')
      return
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const baseFilename = `Snapshot_${result.network || 'unknown'}_${timestamp}`

    try {
      let blob: Blob
      let filename: string
      
      if (format === 'text') {
        // Export as plain text (one address per line)
        const textContent = holderAddresses.join('\n')
        blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
        filename = `${baseFilename}.txt`
        
      } else if (format === 'csv') {
        // Export as CSV for easy spreadsheet import
        const csvHeaders = ['Address', 'Network', 'ChainId', 'SnapshotDate']
        const csvRows = holderAddresses.map(holder => [
          holder,
          result.network || 'unknown',
          result.chainId || 0,
          result.timestamp || new Date().toISOString()
        ])
        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n')
        
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
        filename = `${baseFilename}.csv`
        
      } else if (format === 'json') {
        // Create comprehensive export data
        const exportData = {
          metadata: {
            tool: "ApeBeats Snapshot Tool",
            version: "1.0.0",
            exportTimestamp: new Date().toISOString(),
            totalHolders: holderAddresses.length,
            network: result.network || 'unknown',
            chainId: result.chainId || 0
          },
          contracts: result.contracts || [],
          holders: holderAddresses,
          summary: {
            totalUniqueHolders: holderAddresses.length,
            contractsScanned: (result.contracts || []).length,
            network: result.network || 'unknown',
            chainId: result.chainId || 0,
            snapshotTimestamp: result.timestamp || new Date().toISOString()
          }
        }

        const jsonContent = JSON.stringify(exportData, null, 2)
        blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
        filename = `${baseFilename}.json`
      } else {
        addLog(`❌ Unknown export format: ${format}`, 'error')
        return
      }
      
      
      // Use the improved download function
      const downloadSuccess = downloadBlob(blob, filename)
      
      if (downloadSuccess) {
        addLog(`✅ Successfully exported ${holderAddresses.length} holders as ${format.toUpperCase()} file: ${filename}`, 'success')
      } else {
        addLog(`❌ Primary download failed, trying fallback method...`, 'warning')
        
        // Fallback: Try to open in new window/tab
        try {
          const url = URL.createObjectURL(blob)
          const newWindow = window.open(url, '_blank')
          if (newWindow) {
            addLog(`✅ Opened ${format.toUpperCase()} file in new window as fallback`, 'success')
            setTimeout(() => URL.revokeObjectURL(url), 5000)
          } else {
            addLog(`❌ Fallback also failed - popup blocked or other issue`, 'error')
          }
        } catch (fallbackError) {
          addLog(`❌ Fallback method also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`, 'error')
        }
      }
      
    } catch (error) {
      addLog(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }


  const downloadBlob = (blob: Blob, filename: string): boolean => {
    try {
      // Check if blob is valid
      if (!blob) {
        addLog(`❌ ERROR: Blob is null or undefined`, 'error')
        return false
      }
      
      if (blob.size === 0) {
        addLog(`❌ ERROR: Blob is empty (0 bytes)`, 'error')
        return false
      }
      
      // Create object URL
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      // Add to DOM
      document.body.appendChild(link)
      
      // Trigger download
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
      
      addLog(`✅ Download initiated successfully for ${filename}`, 'success')
      return true
      
    } catch (error) {
      addLog(`❌ Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      return false
    }
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
    currentResultsRef.current = [] // Clear ref as well
    setProcessedContracts(0)
    setTotalHolders(0)
    setProgress(0)
    setCurrentStep('')
    setForceUpdate(prev => prev + 1) // Force UI update
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
      
      // Test connection with retry logic
      const blockNumber = await withRetry(async () => {
        return await testRpc({ method: 'eth_blockNumber', params: [] as any })
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
      
      // Process contracts using chunked processor
      const contractProcessor = async (contract: Contract) => {
        addLog(`Processing contract: ${contract.address}`, 'info')
        
        try {
          const holders = await fetchContractHolders(contract, rpc, chain)
          
          addLog(`Contract ${contract.address} completed: ${holders.length} holders found`, 'success')
          return holders
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          addLog(`Contract ${contract.address} failed: ${errorMessage}`, 'error')
          return []
        }
      }

      // Process contracts sequentially with progress tracking
      const allHolders = new Set<string>()
      let successCount = 0
      
      for (let i = 0; i < contracts.length; i++) {
        const contract = contracts[i]
        const contractProgress = Math.round(((i + 1) / contracts.length) * 100)
        addLog(`Progress: ${contractProgress}% - Processing contract ${i + 1}/${contracts.length}`, 'info')
        
        try {
          const holders = await contractProcessor(contract)
          
          // Add holders to the set
          holders.forEach(holder => allHolders.add(holder))
          successCount++
          
          setProcessedContracts(i + 1)
          addLog(`Contract ${i + 1} completed: ${holders.length} holders found`, 'success')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          addLog(`Contract ${i + 1} failed: ${errorMessage}`, 'error')
        }
      }

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
      
      // Set results in state and ref simultaneously
      setResults([result])
      currentResultsRef.current = [result]
      
      addLog(`Snapshot completed! Found ${finalHolders.length} unique holders across ${successCount}/${contracts.length} successful contracts`, 'success')
      
      // Force UI state updates to ensure proper completion
      setProgress(100)
      setCurrentStep('Complete')
      setTotalHolders(finalHolders.length)
      setIsRunning(false) // Stop the running state immediately
      setForceUpdate(prev => prev + 1) // Force UI re-render
      
    } catch (error) {
      addLog(`Snapshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      setIsRunning(false) // Stop running state on error too
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

  if (!isClient) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
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
              <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
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
              <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
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
              <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
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
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportResults('text')}
                        disabled={results.length === 0 && currentResultsRef.current.length === 0}
                        title="Export as text file"
                        key={`text-${forceUpdate}`}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportResults('csv')}
                        disabled={results.length === 0 && currentResultsRef.current.length === 0}
                        title="Export as CSV file"
                        key={`csv-${forceUpdate}`}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportResults('json')}
                        disabled={results.length === 0 && currentResultsRef.current.length === 0}
                        title="Export as JSON file"
                        key={`json-${forceUpdate}`}
                      >
                        <FileJson className="w-4 h-4" />
                      </Button>
                    </div>
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
                  {currentStep && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 text-primary">{currentStep}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Results */}
              <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Results</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {(() => {
                        const currentResults = results.length > 0 ? results : currentResultsRef.current
                        return currentResults.length > 0 ? currentResults[0].totalHolders : 0
                      })()} holders
                    </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyResults}
                        disabled={results.length === 0 && currentResultsRef.current.length === 0}
                        title="Copy holder addresses to clipboard"
                        key={`copy-${forceUpdate}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1">
                  {(() => {
                    // Get the most recent results
                    const currentResults = results.length > 0 ? results : currentResultsRef.current
                    
                    if (currentResults.length === 0) {
                      return <p className="text-muted-foreground text-sm">No results yet. Start a snapshot to see holders.</p>
                    }
                    
                    const result = currentResults[0]
                    if (!result.holders || result.holders.length === 0) {
                      return <p className="text-muted-foreground text-sm">No holders found in results.</p>
                    }
                    
                    return result.holders.map((holder, index) => (
                      <div key={index} className="p-2 bg-secondary/20 rounded text-xs font-mono">
                        {holder}
                      </div>
                    ))
                  })()}
                </div>
              </Card>
            </div>
          </div>

          {/* Logs Dropdown */}
          <Card className="mt-8 p-6 bg-card/20 backdrop-blur-sm border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
              >
                Logs
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${showLogs ? 'rotate-180' : ''}`} 
                />
              </button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear
              </Button>
            </div>
            {showLogs && (
              <div className="max-h-64 overflow-y-auto space-y-1 border-t border-border pt-4">
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
            )}
          </Card>
        </div>
    </div>
  )
}
