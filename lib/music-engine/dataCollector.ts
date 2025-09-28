/**
 * Blockchain Data Collector
 * 
 * Collects data from Apechain Network using Alchemy API
 * All data is structured for music generation and NFT metadata
 */

import { BlockchainData, BlockData, TransactionData, AlchemyResponse } from './types';

export class BlockchainDataCollector {
  private alchemyApiKey: string;
  private chainId: number;
  private baseUrl: string;

  constructor(apiKey: string, chainId: number = 33139) {
    this.alchemyApiKey = apiKey;
    this.chainId = chainId;
    this.baseUrl = `https://apechain-mainnet.g.alchemy.com/v2/${apiKey}`;
  }

  /**
   * Collect recent blockchain data for music generation
   * @param blockCount Number of recent blocks to analyze
   * @returns Array of structured blockchain data
   */
  async collectRecentData(blockCount: number = 10): Promise<BlockchainData[]> {
    try {
      const latestBlock = await this.getLatestBlockNumber();
      const blocks = await this.getBlocksInRange(
        latestBlock - blockCount + 1,
        latestBlock
      );

      const blockchainData: BlockchainData[] = [];

      for (const block of blocks) {
        const blockData = await this.processBlock(block);
        blockchainData.push(...blockData);
      }

      return blockchainData;
    } catch (error) {
      console.error('Error collecting blockchain data:', error);
      throw new Error(`Failed to collect blockchain data: ${error}`);
    }
  }

  /**
   * Collect data from specific block range
   * @param startBlock Starting block number
   * @param endBlock Ending block number
   * @returns Array of structured blockchain data
   */
  async collectBlockRangeData(startBlock: number, endBlock: number): Promise<BlockchainData[]> {
    try {
      const blocks = await this.getBlocksInRange(startBlock, endBlock);
      const blockchainData: BlockchainData[] = [];

      for (const block of blocks) {
        const blockData = await this.processBlock(block);
        blockchainData.push(...blockData);
      }

      return blockchainData;
    } catch (error) {
      console.error('Error collecting block range data:', error);
      throw new Error(`Failed to collect block range data: ${error}`);
    }
  }

  /**
   * Collect data from specific addresses
   * @param addresses Array of addresses to monitor
   * @param blockCount Number of recent blocks to check
   * @returns Array of structured blockchain data
   */
  async collectAddressData(addresses: string[], blockCount: number = 50): Promise<BlockchainData[]> {
    try {
      const latestBlock = await this.getLatestBlockNumber();
      const blockchainData: BlockchainData[] = [];

      for (let i = 0; i < blockCount; i++) {
        const blockNumber = latestBlock - i;
        const block = await this.getBlockByNumber(blockNumber);
        
        if (block) {
          const relevantTransactions = block.transactions.filter(tx => 
            addresses.includes(tx.from.toLowerCase()) || 
            addresses.includes(tx.to.toLowerCase())
          );

          for (const tx of relevantTransactions) {
            const data = await this.processTransaction(tx, block);
            blockchainData.push(data);
          }
        }
      }

      return blockchainData;
    } catch (error) {
      console.error('Error collecting address data:', error);
      throw new Error(`Failed to collect address data: ${error}`);
    }
  }

  /**
   * Get the latest block number
   */
  private async getLatestBlockNumber(): Promise<number> {
    const response = await this.makeRequest('eth_blockNumber', []);
    return parseInt(response.result, 16);
  }

  /**
   * Get blocks in a specific range
   */
  private async getBlocksInRange(startBlock: number, endBlock: number): Promise<BlockData[]> {
    const blocks: BlockData[] = [];
    
    for (let i = startBlock; i <= endBlock; i++) {
      const block = await this.getBlockByNumber(i);
      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }

  /**
   * Get a specific block by number
   */
  private async getBlockByNumber(blockNumber: number): Promise<BlockData | null> {
    try {
      const response = await this.makeRequest('eth_getBlockByNumber', [
        `0x${blockNumber.toString(16)}`,
        true // include transactions
      ]);
      
      return response.result;
    } catch (error) {
      console.warn(`Failed to get block ${blockNumber}:`, error);
      return null;
    }
  }

  /**
   * Process a block and extract relevant data
   */
  private async processBlock(block: BlockData): Promise<BlockchainData[]> {
    const blockchainData: BlockchainData[] = [];

    for (const tx of block.transactions) {
      const data = await this.processTransaction(tx, block);
      blockchainData.push(data);
    }

    return blockchainData;
  }

  /**
   * Process a transaction and create structured data
   */
  private async processTransaction(tx: TransactionData, block: BlockData): Promise<BlockchainData> {
    // Create deterministic hash for NFT metadata
    const dataString = `${tx.hash}-${tx.from}-${tx.to}-${tx.value}-${block.timestamp}`;
    const dataHash = await this.createHash(dataString);

    return {
      blockNumber: parseInt(block.number, 16),
      blockHash: block.hash,
      transactionHash: tx.hash,
      timestamp: parseInt(block.timestamp, 16),
      gasUsed: tx.gas,
      gasPrice: tx.gasPrice,
      transactionCount: block.transactions.length,
      fromAddress: tx.from,
      toAddress: tx.to,
      value: tx.value,
      contractAddress: tx.to !== '0x' ? tx.to : undefined,
      methodId: tx.input.length >= 10 ? tx.input.slice(0, 10) : undefined,
      inputData: tx.input,
      dataHash
    };
  }

  /**
   * Make a request to Alchemy API
   */
  private async makeRequest(method: string, params: any[]): Promise<AlchemyResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Alchemy API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a deterministic hash for data
   */
  private async createHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get network statistics for additional context
   */
  async getNetworkStats(): Promise<{
    totalTransactions: number;
    averageGasPrice: number;
    averageBlockTime: number;
    networkActivity: 'low' | 'medium' | 'high';
  }> {
    try {
      const latestBlock = await this.getLatestBlockNumber();
      const blocks = await this.getBlocksInRange(latestBlock - 10, latestBlock);
      
      const totalTransactions = blocks.reduce((sum, block) => sum + block.transactions.length, 0);
      const averageGasPrice = blocks.reduce((sum, block) => {
        const blockGasPrice = block.transactions.reduce((blockSum, tx) => 
          blockSum + parseInt(tx.gasPrice, 16), 0
        );
        return sum + (blockGasPrice / block.transactions.length);
      }, 0) / blocks.length;

      const blockTimes = [];
      for (let i = 1; i < blocks.length; i++) {
        const timeDiff = parseInt(blocks[i].timestamp, 16) - parseInt(blocks[i-1].timestamp, 16);
        blockTimes.push(timeDiff);
      }
      const averageBlockTime = blockTimes.reduce((sum, time) => sum + time, 0) / blockTimes.length;

      let networkActivity: 'low' | 'medium' | 'high' = 'low';
      if (totalTransactions > 100) networkActivity = 'high';
      else if (totalTransactions > 50) networkActivity = 'medium';

      return {
        totalTransactions,
        averageGasPrice,
        averageBlockTime,
        networkActivity
      };
    } catch (error) {
      console.error('Error getting network stats:', error);
      throw new Error(`Failed to get network stats: ${error}`);
    }
  }
}

/**
 * Mock Blockchain Data Collector for Development
 * 
 * Provides mock blockchain data when Alchemy API is not available
 */
export class MockBlockchainDataCollector {
  private chainId: number;

  constructor(chainId: number = 33139) {
    this.chainId = chainId;
  }

  /**
   * Generate mock blockchain data for development
   */
  async collectRecentData(blockCount: number = 10): Promise<BlockchainData[]> {
    console.log(`[MockDataCollector] Generating mock blockchain data for ${blockCount} blocks`);
    
    try {
      const mockData: BlockchainData[] = [];
      const currentTime = Math.floor(Date.now() / 1000);
      
      for (let i = 0; i < blockCount; i++) {
        const blockNumber = 1000000 + i;
        const timestamp = currentTime - (blockCount - i) * 2; // 2 seconds per block
        
        const mockEntry: BlockchainData = {
          blockNumber,
          blockHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          timestamp,
          gasUsed: `0x${Math.floor(Math.random() * 1000000).toString(16)}`,
          gasPrice: `0x${Math.floor(Math.random() * 1000000000).toString(16)}`,
          transactionCount: Math.floor(Math.random() * 50) + 10,
          fromAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
          toAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
          value: `0x${Math.floor(Math.random() * 1000000000000000000).toString(16)}`,
          contractAddress: Math.random() > 0.5 ? `0x${Math.random().toString(16).slice(2, 42)}` : undefined,
          methodId: Math.random() > 0.5 ? `0x${Math.random().toString(16).slice(2, 10)}` : undefined,
          inputData: `0x${Math.random().toString(16).slice(2, 100)}`,
          dataHash: `0x${Math.random().toString(16).slice(2, 66)}`
        };
        
        mockData.push(mockEntry);
        console.log(`[MockDataCollector] Generated mock entry ${i + 1}:`, mockEntry);
      }
      
      console.log(`[MockDataCollector] Generated ${mockData.length} mock blockchain data entries`);
      return mockData;
    } catch (error) {
      console.error('[MockDataCollector] Error generating mock blockchain data:', error);
      throw new Error(`Failed to generate mock blockchain data: ${error}`);
    }
  }

  async collectBlockRangeData(startBlock: number, endBlock: number): Promise<BlockchainData[]> {
    const blockCount = endBlock - startBlock + 1;
    return this.collectRecentData(blockCount);
  }

  async collectAddressData(addresses: string[], blockCount: number = 50): Promise<BlockchainData[]> {
    return this.collectRecentData(blockCount);
  }

  async getNetworkStats(): Promise<{
    totalTransactions: number;
    averageGasPrice: number;
    averageBlockTime: number;
    networkActivity: 'low' | 'medium' | 'high';
  }> {
    return {
      totalTransactions: Math.floor(Math.random() * 100) + 50,
      averageGasPrice: Math.floor(Math.random() * 1000000000) + 1000000000,
      averageBlockTime: 2,
      networkActivity: 'medium'
    };
  }
}
