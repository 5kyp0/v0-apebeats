/**
 * Simplified Data Collector Tests
 * 
 * Basic tests for blockchain data collection functionality
 */

import { BlockchainDataCollector } from '@/lib/music-engine/dataCollector';

// Import test setup
import './setup';

describe('BlockchainDataCollector - Basic Tests', () => {
  let collector: BlockchainDataCollector;
  const mockApiKey = 'test-api-key';
  const mockChainId = 33139;

  beforeEach(() => {
    collector = new BlockchainDataCollector(mockApiKey, mockChainId);
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct parameters', () => {
      expect(collector).toBeDefined();
    });

    it('should use default chain ID if not provided', () => {
      const defaultCollector = new BlockchainDataCollector(mockApiKey);
      expect(defaultCollector).toBeDefined();
    });
  });

  describe('collectRecentData', () => {
    it('should collect recent blockchain data', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          number: '0x3039', // 12345
          hash: '0x1234567890abcdef',
          timestamp: '0x6578e8c0', // 1703000000
          gasUsed: '0x5208', // 21000
          gasLimit: '0x1c9c380', // 30000000
          transactions: [
            {
              hash: '0xabcdef1234567890',
              from: '0x1234567890123456789012345678901234567890',
              to: '0x0987654321098765432109876543210987654321',
              value: '0xde0b6b3a7640000', // 1000000000000000000
              gas: '0x5208', // 21000
              gasPrice: '0x4a817c800', // 20000000000
              input: '0x',
              blockNumber: '0x3039',
              blockHash: '0x1234567890abcdef',
              transactionIndex: '0x0'
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await collector.collectRecentData(1);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].blockNumber).toBe(12345);
      expect(result[0].transactionHash).toBe('0xabcdef1234567890');
      expect(result[0].fromAddress).toBe('0x1234567890123456789012345678901234567890');
      expect(result[0].dataHash).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      // Should return empty array instead of throwing
      const result = await collector.collectRecentData(1);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Should return empty array instead of throwing
      const result = await collector.collectRecentData(1);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('collectBlockRangeData', () => {
    it('should collect data from block range', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          number: '0x3039',
          hash: '0x1234567890abcdef',
          timestamp: '0x6578e8c0',
          gasUsed: '0x5208',
          gasLimit: '0x1c9c380',
          transactions: [
            {
              hash: '0xabcdef1234567890',
              from: '0x1234567890123456789012345678901234567890',
              to: '0x0987654321098765432109876543210987654321',
              value: '0xde0b6b3a7640000',
              gas: '0x5208',
              gasPrice: '0x4a817c800',
              input: '0x',
              blockNumber: '0x3039',
              blockHash: '0x1234567890abcdef',
              transactionIndex: '0x0'
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await collector.collectBlockRangeData(12345, 12345);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].blockNumber).toBe(12345);
    });

    it('should handle empty block range', async () => {
      const result = await collector.collectBlockRangeData(12345, 12344);

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('collectAddressData', () => {
    it('should collect data from specific addresses', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          number: '0x3039',
          hash: '0x1234567890abcdef',
          timestamp: '0x6578e8c0',
          gasUsed: '0x5208',
          gasLimit: '0x1c9c380',
          transactions: [
            {
              hash: '0xabcdef1234567890',
              from: '0x1234567890123456789012345678901234567890',
              to: '0x0987654321098765432109876543210987654321',
              value: '0xde0b6b3a7640000',
              gas: '0x5208',
              gasPrice: '0x4a817c800',
              input: '0x',
              blockNumber: '0x3039',
              blockHash: '0x1234567890abcdef',
              transactionIndex: '0x0'
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const addresses = ['0x1234567890123456789012345678901234567890'];
      const result = await collector.collectAddressData(addresses, 1);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].fromAddress).toBe(addresses[0]);
    });
  });

  describe('getNetworkStats', () => {
    it('should get network statistics', async () => {
      const mockResponses = Array(11).fill(null).map((_, index) => ({
        jsonrpc: '2.0',
        id: index + 1,
        result: {
          number: `0x${(12345 + index).toString(16)}`,
          hash: `0x${index.toString(16).padStart(16, '0')}`,
          timestamp: `0x${(1703000000 + index).toString(16)}`,
          gasUsed: '0x5208',
          gasLimit: '0x1c9c380',
          transactions: Array(5 + index).fill(null).map((_, txIndex) => ({
            hash: `0x${(index * 100 + txIndex).toString(16).padStart(16, '0')}`,
            from: '0x1234567890123456789012345678901234567890',
            to: '0x0987654321098765432109876543210987654321',
            value: '0xde0b6b3a7640000',
            gas: '0x5208',
            gasPrice: '0x4a817c800',
            input: '0x',
            blockNumber: `0x${(12345 + index).toString(16)}`,
            blockHash: `0x${index.toString(16).padStart(16, '0')}`,
            transactionIndex: `0x${txIndex}`
          }))
        }
      }));

      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponses.shift())
        })
      );

      const stats = await collector.getNetworkStats();

      expect(stats).toBeDefined();
      expect(stats.totalTransactions).toBeGreaterThan(0);
      expect(stats.averageGasPrice).toBeGreaterThan(0);
      expect(stats.averageBlockTime).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(stats.networkActivity);
    });

    it('should handle network stats errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Should return default stats instead of throwing
      const stats = await collector.getNetworkStats();
      expect(stats).toBeDefined();
      expect(stats.totalTransactions).toBe(0);
    });
  });

  describe('Data Processing', () => {
    it('should create deterministic data hash', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          number: '0x3039',
          hash: '0x1234567890abcdef',
          timestamp: '0x6578e8c0',
          gasUsed: '0x5208',
          gasLimit: '0x1c9c380',
          transactions: [
            {
              hash: '0xabcdef1234567890',
              from: '0x1234567890123456789012345678901234567890',
              to: '0x0987654321098765432109876543210987654321',
              value: '0xde0b6b3a7640000',
              gas: '0x5208',
              gasPrice: '0x4a817c800',
              input: '0x',
              blockNumber: '0x3039',
              blockHash: '0x1234567890abcdef',
              transactionIndex: '0x0'
            }
          ]
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

      const result1 = await collector.collectRecentData(1);
      const result2 = await collector.collectRecentData(1);

      expect(result1[0].dataHash).toBe(result2[0].dataHash);
    });

    it('should process transaction data correctly', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          number: '0x3039',
          hash: '0x1234567890abcdef',
          timestamp: '0x6578e8c0',
          gasUsed: '0x5208',
          gasLimit: '0x1c9c380',
          transactions: [
            {
              hash: '0xabcdef1234567890',
              from: '0x1234567890123456789012345678901234567890',
              to: '0x0987654321098765432109876543210987654321',
              value: '0xde0b6b3a7640000',
              gas: '0x5208',
              gasPrice: '0x4a817c800',
              input: '0xa9059cbb00000000000000000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000000000000000000000',
              blockNumber: '0x3039',
              blockHash: '0x1234567890abcdef',
              transactionIndex: '0x0'
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await collector.collectRecentData(1);

      expect(result[0].contractAddress).toBe('0x0987654321098765432109876543210987654321');
      expect(result[0].methodId).toBe('0xa9059cbb');
      expect(result[0].inputData).toBe('0xa9059cbb00000000000000000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000000000000000000000');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid block numbers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: null
        })
      });

      const result = await collector.collectRecentData(1);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    it('should handle malformed API responses gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: {
            // Missing required fields
            number: '0x3039'
          }
        })
      });

      // Should return empty array instead of throwing
      const result = await collector.collectRecentData(1);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });
});
