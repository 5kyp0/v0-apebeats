import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getRpcClient } from 'thirdweb'
import { apeChain, thirdwebClient } from './thirdweb'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple ApeChain stats fetcher using raw RPC
export type ApeChainStats = {
  blockNumber: bigint
  gasPriceWei: bigint
  txPerMinute: number | null
}

// Store previous block data for TXN/min calculation
let previousBlockData: { blockNumber: bigint; timestamp: number } | null = null

export async function fetchApeChainStats(): Promise<ApeChainStats | null> {
  try {
    if (!apeChain) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('ApeChain not configured. Check NEXT_PUBLIC_ALCHEMY_API_KEY')
        console.log('Current env values:', {
          alchemyKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? 'Set' : 'Not set',
          chainId: process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID || '33139 (default)'
        })
      }
      return null
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Fetching ApeChain stats from:', apeChain.name, 'at', apeChain.rpc)
    }
    
    const rpc = getRpcClient({ client: thirdwebClient, chain: apeChain })
    // Fetch current block number first to use in subsequent calls
    const blockHex = await rpc({ method: 'eth_blockNumber', params: [] }) as string
    const [gasHex, blockDetails] = await Promise.all([
      rpc({ method: 'eth_gasPrice', params: [] }) as Promise<string>,
      rpc({ method: 'eth_getBlockByNumber', params: [blockHex, false] }) as Promise<any>,
    ])
    const blockNumber = BigInt(blockHex)
    const gasPriceWei = BigInt(gasHex)
    const currentTimestamp = parseInt(blockDetails.timestamp, 16)
    
    // Calculate TXN/min
    let txPerMinute: number | null = null
    if (previousBlockData && previousBlockData.blockNumber !== blockNumber) {
      const blockDiff = Number(blockNumber - previousBlockData.blockNumber)
      const timeDiff = currentTimestamp - previousBlockData.timestamp
      const txCount = blockDetails.transactions?.length || 0
      
      if (timeDiff > 0 && blockDiff > 0) {
        // Calculate transactions per minute based on block time
        const avgBlockTime = timeDiff / blockDiff
        const txPerBlock = txCount / blockDiff
        txPerMinute = Math.round((txPerBlock * 60) / avgBlockTime)
      }
    }
    
    // Update previous block data
    previousBlockData = { blockNumber, timestamp: currentTimestamp }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('ApeChain stats fetched:', { 
        blockNumber: Number(blockNumber), 
        gasPriceWei: Number(gasPriceWei),
        gasPriceGwei: Number(gasPriceWei) / 1e9,
        txPerMinute,
        txCount: blockDetails.transactions?.length || 0
      })
    }
    
    return { blockNumber, gasPriceWei, txPerMinute }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('ApeChain stats error:', e)
      console.log('Chain config:', apeChain)
    }
    return null
  }
}
