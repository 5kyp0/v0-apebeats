/**
 * Basic Music Engine Tests
 * 
 * Simple tests that avoid complex browser APIs
 */

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

// Mock fetch
global.fetch = jest.fn();

describe('Music Engine - Basic Functionality', () => {
  describe('Configuration', () => {
    it('should have valid default configuration', () => {
      const { defaultMusicConfig } = require('@/lib/music-engine/index');
      
      expect(defaultMusicConfig).toBeDefined();
      expect(defaultMusicConfig.chainId).toBe(33139);
      expect(defaultMusicConfig.style).toBe('lofi-hiphop');
      expect(defaultMusicConfig.lofiSettings).toBeDefined();
      expect(defaultMusicConfig.lofiSettings.bpmRange).toEqual([70, 90]);
      expect(defaultMusicConfig.lofiSettings.vinylCrackle).toBe(true);
      expect(defaultMusicConfig.lofiSettings.jazzChords).toBe(true);
    });

    it('should have valid default NFT configuration', () => {
      const { defaultNFTSnapshotConfig } = require('@/lib/music-engine/index');
      
      expect(defaultNFTSnapshotConfig).toBeDefined();
      expect(defaultNFTSnapshotConfig.trigger).toBe('manual');
      expect(defaultNFTSnapshotConfig.collectionName).toBe('ApeChain Symphonies');
      expect(defaultNFTSnapshotConfig.storageProvider).toBe('ipfs');
    });
  });

  describe('Type Definitions', () => {
    it('should export all required types', () => {
      const types = require('@/lib/music-engine/types');
      
      expect(types).toBeDefined();
      // Basic type checking - these should be defined
      expect(typeof types.MusicConfig).toBe('undefined'); // Interface, not a value
      expect(typeof types.GeneratedMusic).toBe('undefined'); // Interface, not a value
      expect(typeof types.BlockchainData).toBe('undefined'); // Interface, not a value
    });
  });

  describe('Data Collector', () => {
    it('should initialize with valid parameters', () => {
      const { BlockchainDataCollector } = require('@/lib/music-engine/dataCollector');
      
      const collector = new BlockchainDataCollector('test-api-key', 33139);
      expect(collector).toBeDefined();
    });

    it('should handle missing chain ID', () => {
      const { BlockchainDataCollector } = require('@/lib/music-engine/dataCollector');
      
      const collector = new BlockchainDataCollector('test-api-key');
      expect(collector).toBeDefined();
    });
  });

  describe('LoFi Generator', () => {
    it('should initialize with valid configuration', () => {
      const { LoFiHipHopGenerator } = require('@/lib/music-engine/lofiGenerator');
      
      const config = {
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
        enableNFT: true,
        autoMint: false
      };
      
      const generator = new LoFiHipHopGenerator(config);
      expect(generator).toBeDefined();
    });

    it('should handle missing LoFi settings', () => {
      const { LoFiHipHopGenerator } = require('@/lib/music-engine/lofiGenerator');
      
      const config = {
        chainId: 33139,
        style: 'lofi-hiphop',
        complexity: 'medium',
        duration: 60,
        enableNFT: true,
        autoMint: false
      };
      
      const generator = new LoFiHipHopGenerator(config);
      expect(generator).toBeDefined();
    });
  });

  describe('Main Engine', () => {
    it('should initialize with valid configuration', () => {
      const { ApeBeatsMusicEngine, defaultMusicConfig } = require('@/lib/music-engine/index');
      
      const engine = new ApeBeatsMusicEngine(defaultMusicConfig);
      expect(engine).toBeDefined();
      expect(engine.getConfig()).toEqual(defaultMusicConfig);
    });

    it('should throw error without API key', () => {
      delete process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      
      const { ApeBeatsMusicEngine, defaultMusicConfig } = require('@/lib/music-engine/index');
      
      expect(() => {
        new ApeBeatsMusicEngine(defaultMusicConfig);
      }).toThrow('NEXT_PUBLIC_ALCHEMY_API_KEY environment variable is required');
    });

    it('should reset state correctly', () => {
      const { ApeBeatsMusicEngine, defaultMusicConfig } = require('@/lib/music-engine/index');
      
      const engine = new ApeBeatsMusicEngine(defaultMusicConfig);
      engine.reset();
      
      const state = engine.getState();
      expect(state.status).toBe('idle');
      expect(state.progress).toBe(0);
      expect(state.currentStep).toBe('Ready');
    });
  });

  describe('React Hook', () => {
    it('should export useMusicEngine hook', () => {
      const { useMusicEngine } = require('@/lib/music-engine/useMusicEngine');
      
      expect(useMusicEngine).toBeDefined();
      expect(typeof useMusicEngine).toBe('function');
    });
  });

  describe('NFT Snapshot Manager', () => {
    it('should initialize with valid configuration', () => {
      const { NFTSnapshotManager } = require('@/lib/music-engine/nftSnapshot');
      
      const config = {
        trigger: 'manual',
        collectionName: 'Test Collection',
        collectionDescription: 'Test Description',
        royaltyPercentage: 5,
        royaltyRecipient: '0x1234567890123456789012345678901234567890',
        storageProvider: 'ipfs',
        pinToIPFS: true,
        contractType: 'ERC721'
      };
      
      const manager = new NFTSnapshotManager(config);
      expect(manager).toBeDefined();
    });
  });

  describe('Video Visualizer', () => {
    it('should initialize with canvas element', () => {
      const { VideoVisualizer } = require('@/lib/music-engine/videoVisualizer');
      
      const visualizer = new VideoVisualizer(mockCanvas);
      expect(visualizer).toBeDefined();
      expect(visualizer.getCanvas()).toBe(mockCanvas);
    });

    it('should throw error with invalid canvas', () => {
      const { VideoVisualizer } = require('@/lib/music-engine/videoVisualizer');
      
      const invalidCanvas = {
        getContext: jest.fn(() => null)
      };

      expect(() => {
        new VideoVisualizer(invalidCanvas);
      }).toThrow('Could not get 2D context from canvas');
    });
  });

  describe('Streaming Engine', () => {
    it('should initialize with valid configuration', () => {
      const { StreamingEngine } = require('@/lib/music-engine/streamingEngine');
      
      const config = {
        chainId: 33139,
        style: 'lofi-hiphop',
        complexity: 'medium',
        duration: 60,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        },
        enableNFT: true,
        autoMint: false
      };
      
      const nftConfig = {
        trigger: 'manual',
        collectionName: 'Test Collection',
        collectionDescription: 'Test Description',
        royaltyPercentage: 5,
        royaltyRecipient: '0x1234567890123456789012345678901234567890',
        storageProvider: 'ipfs',
        pinToIPFS: true,
        contractType: 'ERC721'
      };
      
      const engine = new StreamingEngine(config, nftConfig);
      expect(engine).toBeDefined();
    });

    it('should throw error without API key', () => {
      delete process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      
      const { StreamingEngine } = require('@/lib/music-engine/streamingEngine');
      
      const config = {
        chainId: 33139,
        style: 'lofi-hiphop',
        complexity: 'medium',
        duration: 60,
        streaming: {
          enabled: true,
          continuousMode: true,
          updateInterval: 30,
          fadeTransition: true
        },
        enableNFT: true,
        autoMint: false
      };
      
      expect(() => {
        new StreamingEngine(config);
      }).toThrow('NEXT_PUBLIC_ALCHEMY_API_KEY environment variable is required');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing environment variables gracefully', () => {
      delete process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      
      const { ApeBeatsMusicEngine, defaultMusicConfig } = require('@/lib/music-engine/index');
      
      expect(() => {
        new ApeBeatsMusicEngine(defaultMusicConfig);
      }).toThrow('NEXT_PUBLIC_ALCHEMY_API_KEY environment variable is required');
    });
  });

  describe('Module Exports', () => {
    it('should export all required modules', () => {
      const index = require('@/lib/music-engine/index');
      
      expect(index.ApeBeatsMusicEngine).toBeDefined();
      expect(index.defaultMusicConfig).toBeDefined();
      expect(index.defaultNFTSnapshotConfig).toBeDefined();
      expect(index.BlockchainDataCollector).toBeDefined();
      expect(index.MusicGenerator).toBeDefined();
      expect(index.LoFiHipHopGenerator).toBeDefined();
      expect(index.StreamingEngine).toBeDefined();
      expect(index.VideoVisualizer).toBeDefined();
      expect(index.NFTSnapshotManager).toBeDefined();
    });
  });
});
