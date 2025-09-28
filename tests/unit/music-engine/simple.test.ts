/**
 * Simple Music Engine Tests
 * 
 * Basic tests that don't require browser APIs
 */

// Mock environment variables
process.env.NEXT_PUBLIC_ALCHEMY_API_KEY = 'test-api-key';

describe('Music Engine - Simple Tests', () => {
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
      // Restore API key for this test
      process.env.NEXT_PUBLIC_ALCHEMY_API_KEY = 'test-api-key';
      
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

  describe('Type Definitions', () => {
    it('should have valid type structure', () => {
      const types = require('@/lib/music-engine/types');
      
      expect(types).toBeDefined();
      // These are interfaces, so they won't be defined at runtime
      // But the module should exist
    });
  });
});
