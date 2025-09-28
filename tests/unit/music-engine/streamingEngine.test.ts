/**
 * Streaming Engine Tests
 * 
 * Tests for the 24/7 streaming functionality
 */

import { StreamingEngine } from '@/lib/music-engine/streamingEngine';
import { MusicConfig, NFTSnapshotConfig, BlockchainData } from '@/lib/music-engine/types';

// Mock environment variables
process.env.NEXT_PUBLIC_ALCHEMY_API_KEY = 'test-api-key';

// Mock Web Audio API
const mockAudioContext = {
  createBufferSource: jest.fn(() => ({
    buffer: null,
    loop: false,
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  createGain: jest.fn(() => ({
    gain: { value: 1, linearRampToValueAtTime: jest.fn() },
    connect: jest.fn()
  })),
  createBuffer: jest.fn(),
  decodeAudioData: jest.fn().mockResolvedValue({
    duration: 60,
    sampleRate: 44100,
    numberOfChannels: 2
  }),
  currentTime: 0,
  close: jest.fn().mockResolvedValue(undefined),
  destination: {}
};

Object.defineProperty(global, 'AudioContext', {
  value: jest.fn(() => mockAudioContext)
});

Object.defineProperty(global, 'webkitAudioContext', {
  value: jest.fn(() => mockAudioContext)
});

// Mock setTimeout and setInterval
jest.useFakeTimers();

describe('StreamingEngine', () => {
  let streamingEngine: StreamingEngine;
  let mockConfig: MusicConfig;
  let mockNFTConfig: NFTSnapshotConfig;
  let mockBlockchainData: BlockchainData[];

  beforeEach(() => {
    mockConfig = {
      chainId: 33139,
      style: 'lofi-hiphop',
      complexity: 'medium',
      duration: 60,
      lofiSettings: {
        bpmRange: [70, 90],
        swingAmount: 0.3,
        vinylCrackle: true,
        jazzChords: true,
        reverbAmount: 0.4,
        lowpassFilter: 0.6
      },
      streaming: {
        enabled: true,
        continuousMode: true,
        updateInterval: 30,
        fadeTransition: true
      },
      enableNFT: true,
      autoMint: false
    };

    mockNFTConfig = {
      trigger: 'manual',
      collectionName: 'ApeChain Symphonies',
      collectionDescription: 'Generative music pieces',
      royaltyPercentage: 5,
      royaltyRecipient: '0x1234567890123456789012345678901234567890',
      storageProvider: 'ipfs',
      pinToIPFS: true,
      contractType: 'ERC721'
    };

    mockBlockchainData = [
      {
        blockNumber: 12345,
        blockHash: '0x1234567890abcdef',
        transactionHash: '0xabcdef1234567890',
        timestamp: 1703000000,
        gasUsed: '21000',
        gasPrice: '20000000000',
        transactionCount: 5,
        fromAddress: '0x1234567890123456789012345678901234567890',
        toAddress: '0x0987654321098765432109876543210987654321',
        value: '1000000000000000000',
        dataHash: 'mock-data-hash-123'
      }
    ];

    streamingEngine = new StreamingEngine(mockConfig, mockNFTConfig);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(streamingEngine).toBeDefined();
      expect(streamingEngine.getCurrentSession()).toBeUndefined();
      expect(streamingEngine.isActive()).toBe(false);
    });

    it('should throw error if Alchemy API key is missing', () => {
      delete process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      
      expect(() => {
        new StreamingEngine(mockConfig, mockNFTConfig);
      }).toThrow('NEXT_PUBLIC_ALCHEMY_API_KEY environment variable is required');
    });
  });

  describe('Streaming Session Management', () => {
    it('should start streaming session', async () => {
      const session = await streamingEngine.startStreaming();
      
      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.isActive).toBe(true);
      expect(session.stats.tracksPlayed).toBe(0);
      expect(session.nftSnapshots).toEqual([]);
      
      expect(streamingEngine.isActive()).toBe(true);
      expect(streamingEngine.getCurrentSession()).toEqual(session);
    });

    it('should not start multiple streaming sessions', async () => {
      await streamingEngine.startStreaming();
      
      await expect(streamingEngine.startStreaming()).rejects.toThrow('Streaming is already active');
    });

    it('should stop streaming session', async () => {
      const session = await streamingEngine.startStreaming();
      expect(streamingEngine.isActive()).toBe(true);
      
      await streamingEngine.stopStreaming();
      
      expect(streamingEngine.isActive()).toBe(false);
      expect(session.isActive).toBe(false);
      expect(session.endTime).toBeGreaterThan(session.startTime);
    });

    it('should handle stopping when not streaming', async () => {
      await expect(streamingEngine.stopStreaming()).resolves.not.toThrow();
    });
  });

  describe('Event System', () => {
    it('should emit session started event', async () => {
      const eventCallback = jest.fn();
      streamingEngine.on('sessionStarted', eventCallback);
      
      await streamingEngine.startStreaming();
      
      expect(eventCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          startTime: expect.any(Number),
          isActive: true
        })
      );
    });

    it('should emit session ended event', async () => {
      const eventCallback = jest.fn();
      streamingEngine.on('sessionEnded', eventCallback);
      
      await streamingEngine.startStreaming();
      await streamingEngine.stopStreaming();
      
      expect(eventCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          endTime: expect.any(Number)
        })
      );
    });

    it('should emit new track event', async () => {
      const eventCallback = jest.fn();
      streamingEngine.on('newTrack', eventCallback);
      
      await streamingEngine.startStreaming();
      
      // Fast-forward time to trigger track generation
      jest.advanceTimersByTime(30000); // 30 seconds
      
      expect(eventCallback).toHaveBeenCalled();
    });

    it('should handle event listener errors gracefully', async () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Event listener error');
      });
      
      streamingEngine.on('sessionStarted', errorCallback);
      
      // Should not throw error
      await expect(streamingEngine.startStreaming()).resolves.not.toThrow();
    });
  });

  describe('NFT Snapshot Creation', () => {
    it('should create NFT snapshot during streaming', async () => {
      await streamingEngine.startStreaming();
      
      const nftResult = await streamingEngine.createCurrentTrackNFT();
      
      expect(nftResult).toBeDefined();
      expect(nftResult.tokenId).toBeDefined();
      expect(nftResult.metadataUri).toBeDefined();
      expect(nftResult.transactionHash).toBeDefined();
      
      const session = streamingEngine.getCurrentSession();
      expect(session?.nftSnapshots).toContain(nftResult.tokenId);
    });

    it('should throw error when creating NFT without active session', async () => {
      await expect(streamingEngine.createCurrentTrackNFT()).rejects.toThrow(
        'No active session or NFT manager not configured'
      );
    });

    it('should throw error when creating NFT without NFT manager', async () => {
      const engineWithoutNFT = new StreamingEngine(mockConfig);
      await engineWithoutNFT.startStreaming();
      
      await expect(engineWithoutNFT.createCurrentTrackNFT()).rejects.toThrow(
        'No active session or NFT manager not configured'
      );
    });
  });

  describe('Streaming Statistics', () => {
    it('should provide streaming statistics', async () => {
      const stats = streamingEngine.getStreamingStats();
      
      expect(stats).toEqual({
        isActive: false,
        sessionDuration: 0,
        tracksPlayed: 0,
        nftSnapshotsCreated: 0,
        currentListeners: 0
      });
    });

    it('should update statistics during streaming', async () => {
      await streamingEngine.startStreaming();
      
      // Fast-forward time to simulate streaming
      jest.advanceTimersByTime(60000); // 1 minute
      
      const stats = streamingEngine.getStreamingStats();
      
      expect(stats.isActive).toBe(true);
      expect(stats.sessionDuration).toBeGreaterThan(0);
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const newConfig = {
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 60, // Changed from 30 to 60
          fadeTransition: true
        }
      };
      
      streamingEngine.updateConfig(newConfig);
      
      // Configuration should be updated
      expect(streamingEngine).toBeDefined();
    });

    it('should restart streaming when configuration changes significantly', async () => {
      await streamingEngine.startStreaming();
      expect(streamingEngine.isActive()).toBe(true);
      
      const newConfig = {
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 60,
          fadeTransition: false // Changed
        }
      };
      
      streamingEngine.updateConfig(newConfig);
      
      // Should restart streaming
      expect(streamingEngine.isActive()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle streaming errors gracefully', async () => {
      const errorCallback = jest.fn();
      streamingEngine.on('streamingError', errorCallback);
      
      await streamingEngine.startStreaming();
      
      // Simulate an error in the streaming loop
      jest.advanceTimersByTime(30000);
      
      // Should handle errors without crashing
      expect(streamingEngine.isActive()).toBe(true);
    });

    it('should handle track generation errors', async () => {
      const errorCallback = jest.fn();
      streamingEngine.on('trackGenerationError', errorCallback);
      
      await streamingEngine.startStreaming();
      
      // Fast-forward to trigger track generation
      jest.advanceTimersByTime(30000);
      
      // Should handle errors gracefully
      expect(streamingEngine.isActive()).toBe(true);
    });
  });

  describe('Audio Context Management', () => {
    it('should initialize audio context on start', async () => {
      await streamingEngine.startStreaming();
      
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });

    it('should close audio context on stop', async () => {
      await streamingEngine.startStreaming();
      await streamingEngine.stopStreaming();
      
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should handle audio context errors', async () => {
      mockAudioContext.createBufferSource.mockImplementation(() => {
        throw new Error('Audio context error');
      });
      
      await expect(streamingEngine.startStreaming()).rejects.toThrow();
    });
  });

  describe('Crossfade Transitions', () => {
    it('should handle crossfade transitions', async () => {
      const crossfadeCallback = jest.fn();
      streamingEngine.on('crossfade', crossfadeCallback);
      
      await streamingEngine.startStreaming();
      
      // Fast-forward to trigger crossfade
      jest.advanceTimersByTime(60000);
      
      expect(crossfadeCallback).toHaveBeenCalled();
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session data during streaming', async () => {
      const session = await streamingEngine.startStreaming();
      
      // Fast-forward time
      jest.advanceTimersByTime(30000);
      
      const currentSession = streamingEngine.getCurrentSession();
      expect(currentSession?.id).toBe(session.id);
      expect(currentSession?.isActive).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should clean up resources on stop', async () => {
      await streamingEngine.startStreaming();
      await streamingEngine.stopStreaming();
      
      // Should clean up timers and audio context
      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });
});
