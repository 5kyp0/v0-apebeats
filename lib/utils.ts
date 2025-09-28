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
  blockTimeSeconds: number | null
}

// Store previous block data for block time calculation
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
    const blockHex = await rpc({ method: 'eth_blockNumber', params: [] as any }) as string
    const [gasHex, blockDetails] = await Promise.all([
      rpc({ method: 'eth_gasPrice', params: [] as any }) as Promise<string>,
      rpc({ method: 'eth_getBlockByNumber', params: [blockHex, false] as any }) as Promise<any>,
    ])
    const blockNumber = BigInt(blockHex)
    const gasPriceWei = BigInt(gasHex)
    const currentTimestamp = parseInt(blockDetails.timestamp, 16)
    
    // Calculate block time
    let blockTimeSeconds: number | null = null
    if (previousBlockData && previousBlockData.blockNumber !== blockNumber) {
      const blockDiff = Number(blockNumber - previousBlockData.blockNumber)
      const timeDiff = currentTimestamp - previousBlockData.timestamp
      
      if (timeDiff > 0 && blockDiff > 0) {
        // Calculate average block time in seconds
        blockTimeSeconds = Math.round(timeDiff / blockDiff)
      }
    }
    
    // Update previous block data
    previousBlockData = { blockNumber, timestamp: currentTimestamp }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('ApeChain stats fetched:', { 
        blockNumber: Number(blockNumber), 
        gasPriceWei: Number(gasPriceWei),
        gasPriceGwei: Number(gasPriceWei) / 1e9,
        blockTimeSeconds,
        txCount: blockDetails.transactions?.length || 0
      })
    }
    
    return { blockNumber, gasPriceWei, blockTimeSeconds }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('ApeChain stats error:', e)
      console.log('Chain config:', apeChain)
    }
    return null
  }
}
