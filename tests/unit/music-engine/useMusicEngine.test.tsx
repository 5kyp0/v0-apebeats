/**
 * useMusicEngine Hook Tests
 * 
 * Tests for the React hook integration
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMusicEngine } from '@/lib/music-engine/useMusicEngine';
import { defaultMusicConfig, defaultNFTSnapshotConfig } from '@/lib/music-engine/index';

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

describe('useMusicEngine', () => {
  const mockConfig = {
    ...defaultMusicConfig,
    enableNFT: true,
    autoMint: false
  };

  const mockNFTConfig = {
    ...defaultNFTSnapshotConfig
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      expect(result.current.state.status).toBe('idle');
      expect(result.current.music).toBeNull();
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.streamingSession).toBeNull();
      expect(result.current.config).toEqual(mockConfig);
    });

    it('should initialize without NFT config', () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig
      }));

      expect(result.current).toBeDefined();
      expect(result.current.config).toEqual(mockConfig);
    });

    it('should handle auto-start option', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig,
        autoStart: true
      }));

      // Should start generation automatically
      await waitFor(() => {
        expect(result.current.isGenerating).toBe(true);
      });
    });
  });

  describe('Music Generation', () => {
    it('should generate music from recent activity', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        const music = await result.current.generateFromRecent(10);
        expect(music).toBeDefined();
        expect(music.id).toBeDefined();
        expect(music.parameters.tempo).toBeGreaterThanOrEqual(70);
        expect(music.parameters.tempo).toBeLessThanOrEqual(90);
      });

      expect(result.current.music).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it('should generate LoFi music from recent activity', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        const music = await result.current.generateLoFiFromRecent(10);
        expect(music).toBeDefined();
        expect(music.nftMetadata.name).toContain('LoFi ApeChain Vibes');
      });

      expect(result.current.music).toBeDefined();
    });

    it('should generate music from block range', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        const music = await result.current.generateFromBlockRange(12340, 12350);
        expect(music).toBeDefined();
        expect(music.sourceData.blockNumber).toBeGreaterThanOrEqual(12340);
        expect(music.sourceData.blockNumber).toBeLessThanOrEqual(12350);
      });

      expect(result.current.music).toBeDefined();
    });

    it('should generate music from addresses', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      const addresses = ['0x1234567890123456789012345678901234567890'];

      await act(async () => {
        const music = await result.current.generateFromAddresses(addresses, 50);
        expect(music).toBeDefined();
        expect(music.sourceData.fromAddress).toBe(addresses[0]);
      });

      expect(result.current.music).toBeDefined();
    });

    it('should handle generation errors', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        try {
          await result.current.generateFromRecent(0); // Invalid block count
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('NFT Functionality', () => {
    it('should create NFT snapshot', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      // First generate music
      await act(async () => {
        await result.current.generateFromRecent(5);
      });

      // Then create NFT
      await act(async () => {
        const nft = await result.current.createNFTSnapshot(result.current.music!);
        expect(nft).toBeDefined();
        expect(nft.tokenId).toBeDefined();
      });
    });

    it('should handle NFT creation errors', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: { ...mockConfig, enableNFT: false }
      }));

      await act(async () => {
        await result.current.generateFromRecent(5);
      });

      await act(async () => {
        try {
          await result.current.createNFTSnapshot(result.current.music!);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Streaming Functionality', () => {
    it('should start streaming', async () => {
      const streamingConfig = {
        ...mockConfig,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        }
      };

      const { result } = renderHook(() => useMusicEngine({
        config: streamingConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        const session = await result.current.startStreaming();
        expect(session).toBeDefined();
        expect(session.isActive).toBe(true);
      });

      expect(result.current.isStreaming).toBe(true);
      expect(result.current.streamingSession).toBeDefined();
    });

    it('should stop streaming', async () => {
      const streamingConfig = {
        ...mockConfig,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        }
      };

      const { result } = renderHook(() => useMusicEngine({
        config: streamingConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        await result.current.startStreaming();
        await result.current.stopStreaming();
      });

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.streamingSession).toBeNull();
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

      const { result } = renderHook(() => useMusicEngine({
        config: streamingConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        await result.current.startStreaming();
        const nft = await result.current.createStreamingNFT();
        expect(nft).toBeDefined();
        expect(nft.tokenId).toBeDefined();
      });
    });
  });

  describe('Video Visualization', () => {
    it('should generate video visualization', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        await result.current.generateFromRecent(5);
      });

      await act(async () => {
        const video = await result.current.generateVideoVisualization(
          result.current.music!,
          []
        );
        expect(video).toBeDefined();
        expect(video.musicId).toBe(result.current.music!.id);
      });
    });

    it('should start video visualization', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        await result.current.generateFromRecent(5);
      });

      act(() => {
        result.current.startVideoVisualization(
          result.current.music!,
          [],
          mockCanvas
        );
      });

      // Should not throw error
      expect(result.current).toBeDefined();
    });

    it('should stop video visualization', () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      act(() => {
        result.current.stopVideoVisualization();
      });

      // Should not throw error
      expect(result.current).toBeDefined();
    });
  });

  describe('Network Statistics', () => {
    it('should load network statistics on mount', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      await waitFor(() => {
        expect(result.current.networkStats).toBeDefined();
      });

      expect(result.current.networkStats).toBeDefined();
      expect(result.current.networkStats.totalTransactions).toBeGreaterThanOrEqual(0);
    });

    it('should refresh network statistics', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      await act(async () => {
        await result.current.refreshNetworkStats();
      });

      expect(result.current.networkStats).toBeDefined();
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      act(() => {
        result.current.updateConfig({
          duration: 120,
          style: 'electronic'
        });
      });

      expect(result.current.config.duration).toBe(120);
      expect(result.current.config.style).toBe('electronic');
    });

    it('should maintain existing configuration when updating', () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      act(() => {
        result.current.updateConfig({
          duration: 90
        });
      });

      expect(result.current.config.duration).toBe(90);
      expect(result.current.config.style).toBe('lofi-hiphop'); // Should remain unchanged
    });
  });

  describe('State Management', () => {
    it('should reset state', () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      act(() => {
        result.current.reset();
      });

      expect(result.current.music).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.state.status).toBe('idle');
    });

    it('should track generation state', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      expect(result.current.state.status).toBe('idle');

      await act(async () => {
        const generationPromise = result.current.generateFromRecent(5);
        
        // Check state during generation
        expect(['collecting', 'processing', 'generating']).toContain(result.current.state.status);
        
        await generationPromise;
      });

      expect(result.current.state.status).toBe('complete');
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', () => {
      delete process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      expect(result.current.error).toBeDefined();
    });

    it('should clear errors on successful operations', async () => {
      const { result } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      // First cause an error
      await act(async () => {
        try {
          await result.current.generateFromRecent(0);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBeDefined();

      // Then perform successful operation
      await act(async () => {
        await result.current.generateFromRecent(5);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Hook Lifecycle', () => {
    it('should clean up on unmount', () => {
      const { unmount } = renderHook(() => useMusicEngine({
        config: mockConfig,
        nftConfig: mockNFTConfig
      }));

      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('should handle configuration changes', () => {
      const { result, rerender } = renderHook(
        ({ config }) => useMusicEngine({
          config,
          nftConfig: mockNFTConfig
        }),
        {
          initialProps: { config: mockConfig }
        }
      );

      const newConfig = {
        ...mockConfig,
        duration: 120
      };

      rerender({ config: newConfig });

      expect(result.current.config.duration).toBe(120);
    });
  });
});
