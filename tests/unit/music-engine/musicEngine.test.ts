/**
 * Music Engine Integration Tests
 * 
 * Tests for the main ApeBeats Music Engine orchestrator
 */

import { ApeBeatsMusicEngine, defaultMusicConfig, defaultNFTSnapshotConfig } from '@/lib/music-engine/index';
import { MusicConfig, NFTSnapshotConfig, BlockchainData } from '@/lib/music-engine/types';

// Mock environment variables
process.env.NEXT_PUBLIC_ALCHEMY_API_KEY = 'test-api-key';

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32))
    }
  }
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-audio-url');

// Mock document.createElement for canvas
const mockCanvas = {
  width: 1920,
  height: 1080,
  getContext: jest.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fillRect: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({
      data: new Uint8Array(1920 * 1080 * 4)
    })),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-image'),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn()
    }))
  })),
  toDataURL: jest.fn(() => 'data:image/png;base64,mock-image')
};

Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn((tagName) => {
      if (tagName === 'canvas') return mockCanvas;
      return {};
    })
  }
});

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

describe('ApeBeatsMusicEngine', () => {
  let engine: ApeBeatsMusicEngine;
  let mockConfig: MusicConfig;
  let mockNFTConfig: NFTSnapshotConfig;
  let mockBlockchainData: BlockchainData[];

  beforeEach(() => {
    mockConfig = {
      ...defaultMusicConfig,
      enableNFT: true,
      autoMint: false
    };

    mockNFTConfig = {
      ...defaultNFTSnapshotConfig
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
      },
      {
        blockNumber: 12346,
        blockHash: '0x2345678901bcdef0',
        transactionHash: '0xbcdef01234567890',
        timestamp: 1703000001,
        gasUsed: '150000',
        gasPrice: '25000000000',
        transactionCount: 8,
        fromAddress: '0x2345678901234567890123456789012345678901',
        toAddress: '0x1876543210987654321098765432109876543210',
        value: '2000000000000000000',
        dataHash: 'mock-data-hash-456'
      }
    ];

    engine = new ApeBeatsMusicEngine(mockConfig, mockNFTConfig);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultEngine = new ApeBeatsMusicEngine(defaultMusicConfig);
      
      expect(defaultEngine).toBeDefined();
      expect(defaultEngine.getConfig()).toEqual(defaultMusicConfig);
    });

    it('should initialize with custom configuration', () => {
      expect(engine).toBeDefined();
      expect(engine.getConfig()).toEqual(mockConfig);
    });

    it('should throw error if Alchemy API key is missing', () => {
      delete process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      
      expect(() => {
        new ApeBeatsMusicEngine(mockConfig);
      }).toThrow('NEXT_PUBLIC_ALCHEMY_API_KEY environment variable is required');
    });

    it('should initialize with streaming enabled', () => {
      const streamingConfig = {
        ...mockConfig,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        }
      };
      
      const streamingEngine = new ApeBeatsMusicEngine(streamingConfig, mockNFTConfig);
      expect(streamingEngine).toBeDefined();
    });
  });

  describe('LoFi Music Generation', () => {
    it('should generate LoFi music from recent activity', async () => {
      const result = await engine.generateLoFiFromRecentActivity(10);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.parameters.tempo).toBeGreaterThanOrEqual(70);
      expect(result.parameters.tempo).toBeLessThanOrEqual(90);
      expect(result.parameters.timeSignature).toEqual([4, 4]);
      expect(result.nftMetadata.name).toContain('LoFi ApeChain Vibes');
    });

    it('should generate LoFi music from block range', async () => {
      const result = await engine.generateFromBlockRange(12340, 12350);
      
      expect(result).toBeDefined();
      expect(result.sourceData.blockNumber).toBeGreaterThanOrEqual(12340);
      expect(result.sourceData.blockNumber).toBeLessThanOrEqual(12350);
    });

    it('should generate LoFi music from addresses', async () => {
      const addresses = ['0x1234567890123456789012345678901234567890'];
      const result = await engine.generateFromAddresses(addresses, 50);
      
      expect(result).toBeDefined();
      expect(result.sourceData.fromAddress).toBe(addresses[0]);
    });
  });

  describe('Streaming Functionality', () => {
    it('should start streaming session', async () => {
      const streamingConfig = {
        ...mockConfig,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        }
      };
      
      const streamingEngine = new ApeBeatsMusicEngine(streamingConfig, mockNFTConfig);
      const session = await streamingEngine.startStreaming();
      
      expect(session).toBeDefined();
      expect(session.isActive).toBe(true);
      expect(streamingEngine.isStreaming()).toBe(true);
    });

    it('should stop streaming session', async () => {
      const streamingConfig = {
        ...mockConfig,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        }
      };
      
      const streamingEngine = new ApeBeatsMusicEngine(streamingConfig, mockNFTConfig);
      await streamingEngine.startStreaming();
      await streamingEngine.stopStreaming();
      
      expect(streamingEngine.isStreaming()).toBe(false);
    });

    it('should throw error when starting streaming without streaming config', async () => {
      await expect(engine.startStreaming()).rejects.toThrow(
        'Streaming engine not initialized. Enable streaming in config.'
      );
    });

    it('should create streaming NFT', async () => {
      const streamingConfig = {
        ...mockConfig,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        }
      };
      
      const streamingEngine = new ApeBeatsMusicEngine(streamingConfig, mockNFTConfig);
      await streamingEngine.startStreaming();
      
      const nftResult = await streamingEngine.createStreamingNFT();
      
      expect(nftResult).toBeDefined();
      expect(nftResult.tokenId).toBeDefined();
    });
  });

  describe('Video Visualization', () => {
    it('should generate video visualization', async () => {
      const music = await engine.generateLoFiFromRecentActivity(5);
      const visualization = await engine.generateVideoVisualization(music, mockBlockchainData);
      
      expect(visualization).toBeDefined();
      expect(visualization.musicId).toBe(music.id);
      expect(visualization.thumbnailUrl).toBeDefined();
      expect(visualization.elements.waveform).toBe(true);
      expect(visualization.elements.blockchainData).toBe(true);
    });

    it('should start real-time video visualization', () => {
      const music = {
        id: 'test-music',
        timestamp: Date.now(),
        sourceData: mockBlockchainData[0],
        parameters: {
          tempo: 80,
          timeSignature: [4, 4] as [number, number],
          swing: 0.3,
          key: 'C',
          scale: 'major',
          chordProgression: ['Cmaj7'],
          melodyPattern: [0, 2, 4],
          noteDuration: [0.5, 0.5, 1],
          octaveRange: [3, 6] as [number, number],
          volume: 0.5,
          reverb: 0.4,
          delay: 0.2,
          distortion: 0.1,
          introLength: 4,
          verseLength: 8,
          chorusLength: 8,
          outroLength: 4,
          seed: 'test'
        },
        audioBuffer: new ArrayBuffer(1000),
        audioUrl: 'mock-url',
        duration: 60,
        nftMetadata: {
          name: 'Test',
          description: 'Test',
          image: 'test',
          audio: '',
          attributes: [],
          external_url: 'test',
          background_color: '#000',
          animation_url: 'test'
        },
        provenance: {
          originalDataHash: 'test',
          generationAlgorithm: 'test',
          version: '1.0.0',
          creator: 'test'
        }
      };
      
      engine.startVideoVisualization(music, mockBlockchainData, mockCanvas);
      
      // Should not throw error
      expect(engine).toBeDefined();
    });

    it('should stop video visualization', () => {
      engine.stopVideoVisualization();
      
      // Should not throw error
      expect(engine).toBeDefined();
    });
  });

  describe('NFT Integration', () => {
    it('should create NFT snapshot', async () => {
      const music = await engine.generateLoFiFromRecentActivity(5);
      const nftResult = await engine.createNFTSnapshot(music);
      
      expect(nftResult).toBeDefined();
      expect(nftResult.tokenId).toBeDefined();
      expect(nftResult.metadataUri).toBeDefined();
      expect(nftResult.transactionHash).toBeDefined();
    });

    it('should throw error when creating NFT without NFT manager', async () => {
      const engineWithoutNFT = new ApeBeatsMusicEngine({
        ...mockConfig,
        enableNFT: false
      });
      
      const music = await engineWithoutNFT.generateLoFiFromRecentActivity(5);
      
      await expect(engineWithoutNFT.createNFTSnapshot(music)).rejects.toThrow();
    });
  });

  describe('State Management', () => {
    it('should track generation state', async () => {
      const initialState = engine.getState();
      expect(initialState.status).toBe('idle');
      
      // Start generation
      const generationPromise = engine.generateLoFiFromRecentActivity(5);
      
      // Check state during generation
      const generatingState = engine.getState();
      expect(['collecting', 'processing', 'generating']).toContain(generatingState.status);
      
      await generationPromise;
      
      const finalState = engine.getState();
      expect(finalState.status).toBe('complete');
    });

    it('should reset engine state', () => {
      engine.reset();
      
      const state = engine.getState();
      expect(state.status).toBe('idle');
      expect(state.progress).toBe(0);
      expect(state.currentStep).toBe('Ready');
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = {
        style: 'electronic' as const,
        duration: 120
      };
      
      engine.updateConfig(newConfig);
      
      const updatedConfig = engine.getConfig();
      expect(updatedConfig.style).toBe('electronic');
      expect(updatedConfig.duration).toBe(120);
    });

    it('should maintain existing configuration when updating', () => {
      const newConfig = {
        duration: 90
      };
      
      engine.updateConfig(newConfig);
      
      const updatedConfig = engine.getConfig();
      expect(updatedConfig.style).toBe('lofi-hiphop'); // Should remain unchanged
      expect(updatedConfig.duration).toBe(90); // Should be updated
    });
  });

  describe('Network Statistics', () => {
    it('should get network statistics', async () => {
      const stats = await engine.getNetworkStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(stats.averageGasPrice).toBeGreaterThanOrEqual(0);
      expect(stats.averageBlockTime).toBeGreaterThanOrEqual(0);
      expect(['low', 'medium', 'high']).toContain(stats.networkActivity);
    });
  });

  describe('Error Handling', () => {
    it('should handle generation errors gracefully', async () => {
      // Mock an error in the data collector
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      try {
        await engine.generateLoFiFromRecentActivity(0); // Invalid block count
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      console.error = originalConsoleError;
    });

    it('should handle streaming errors gracefully', async () => {
      const streamingConfig = {
        ...mockConfig,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        }
      };
      
      const streamingEngine = new ApeBeatsMusicEngine(streamingConfig, mockNFTConfig);
      
      // Start streaming and then stop it
      await streamingEngine.startStreaming();
      await streamingEngine.stopStreaming();
      
      // Should handle stop gracefully even if not streaming
      await expect(streamingEngine.stopStreaming()).resolves.not.toThrow();
    });
  });

  describe('Integration with All Components', () => {
    it('should work with all components together', async () => {
      const fullConfig = {
        ...mockConfig,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        }
      };
      
      const fullEngine = new ApeBeatsMusicEngine(fullConfig, mockNFTConfig);
      
      // Generate music
      const music = await fullEngine.generateLoFiFromRecentActivity(5);
      expect(music).toBeDefined();
      
      // Create NFT
      const nft = await fullEngine.createNFTSnapshot(music);
      expect(nft).toBeDefined();
      
      // Generate video visualization
      const video = await fullEngine.generateVideoVisualization(music, mockBlockchainData);
      expect(video).toBeDefined();
      
      // Start streaming
      const session = await fullEngine.startStreaming();
      expect(session).toBeDefined();
      
      // Get streaming stats
      const stats = fullEngine.getStreamingStats();
      expect(stats).toBeDefined();
      
      // Stop streaming
      await fullEngine.stopStreaming();
      expect(fullEngine.isStreaming()).toBe(false);
    });
  });
});
