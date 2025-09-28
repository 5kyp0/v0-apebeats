import { fetchApeChainStats } from '@/lib/utils'

// Mock thirdweb
const mockRpcClient = jest.fn()
jest.mock('thirdweb', () => ({
  getRpcClient: jest.fn(() => mockRpcClient),
}))

// Mock the thirdweb client and chain
jest.mock('@/lib/thirdweb', () => ({
  thirdwebClient: {},
  apeChain: {
    id: 33139,
    name: 'ApeChain',
    rpc: ['https://apechain-mainnet.g.alchemy.com/v2/test'],
  },
}))

describe('fetchApeChainStats', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.NODE_ENV = 'test'
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY = 'test-key'
    process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID = '33139'
    
    // Reset mock
    mockRpcClient.mockReset()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when ApeChain is not configured', async () => {
    // Mock apeChain to be null
    jest.doMock('@/lib/thirdweb', () => ({
      thirdwebClient: {},
      apeChain: null,
    }))

    const result = await fetchApeChainStats()
    expect(result).toBeNull()
  })

  it('should handle RPC errors gracefully', async () => {
    mockRpcClient.mockRejectedValue(new Error('RPC Error'))

    const result = await fetchApeChainStats()
    expect(result).toBeNull()
  })

  it('should return stats when RPC calls succeed', async () => {
    mockRpcClient
      .mockResolvedValueOnce('0x1234') // block number
      .mockResolvedValueOnce('0x5678') // gas price
      .mockResolvedValueOnce({ // block details
        timestamp: '0x1234567890',
        transactions: ['0x1', '0x2'],
      })

    const result = await fetchApeChainStats()
    
    expect(result).toEqual({
      blockNumber: BigInt(0x1234),
      gasPriceWei: BigInt(0x5678),
      blockTimeSeconds: null, // First call, no previous data
    })
    
    // Test BigInt values separately to avoid serialization issues
    expect(result?.blockNumber.toString()).toBe('4660')
    expect(result?.gasPriceWei.toString()).toBe('22136')
  })
})
