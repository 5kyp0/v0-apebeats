/**
 * LoFi Hip Hop Generator Tests
 * 
 * Tests for the LoFi music generation functionality
 */

import { LoFiHipHopGenerator } from '@/lib/music-engine/lofiGenerator';
import { MusicConfig, BlockchainData } from '@/lib/music-engine/types';

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
  width: 400,
  height: 200,
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
      data: new Uint8Array(400 * 200 * 4)
    })),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-image')
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

describe('LoFiHipHopGenerator', () => {
  let generator: LoFiHipHopGenerator;
  let mockConfig: MusicConfig;
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
      enableNFT: true,
      autoMint: false
    };

    mockBlockchainData = [
      {
        blockNumber: 12345,
        blockHash: '0x1234567890abcdef',
        transactionHash: '0xabcdef1234567890',
        timestamp: 1703000000,
        gasUsed: '21000',
        gasPrice: '20000000000', // 20 Gwei
        transactionCount: 5,
        fromAddress: '0x1234567890123456789012345678901234567890',
        toAddress: '0x0987654321098765432109876543210987654321',
        value: '1000000000000000000', // 1 ETH
        dataHash: 'mock-data-hash-123'
      },
      {
        blockNumber: 12346,
        blockHash: '0x2345678901bcdef0',
        transactionHash: '0xbcdef01234567890',
        timestamp: 1703000001,
        gasUsed: '150000',
        gasPrice: '25000000000', // 25 Gwei
        transactionCount: 8,
        fromAddress: '0x2345678901234567890123456789012345678901',
        toAddress: '0x1876543210987654321098765432109876543210',
        value: '2000000000000000000', // 2 ETH
        dataHash: 'mock-data-hash-456'
      }
    ];

    generator = new LoFiHipHopGenerator(mockConfig);
  });

  describe('generateLoFiMusic', () => {
    it('should generate LoFi music from blockchain data', async () => {
      const result = await generator.generateLoFiMusic(mockBlockchainData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.sourceData).toEqual(mockBlockchainData[0]);
      expect(result.parameters).toBeDefined();
      expect(result.audioBuffer).toBeInstanceOf(ArrayBuffer);
      expect(result.audioUrl).toBe('mock-audio-url');
      expect(result.duration).toBeGreaterThan(0);
      expect(result.nftMetadata).toBeDefined();
      expect(result.provenance).toBeDefined();
    });

    it('should create LoFi-specific music parameters', async () => {
      const result = await generator.generateLoFiMusic(mockBlockchainData);
      const params = result.parameters;

      // Check LoFi characteristics
      expect(params.tempo).toBeGreaterThanOrEqual(70);
      expect(params.tempo).toBeLessThanOrEqual(90);
      expect(params.timeSignature).toEqual([4, 4]);
      expect(params.swing).toBeGreaterThanOrEqual(0.3);
      expect(params.swing).toBeLessThanOrEqual(0.4);
      expect(params.octaveRange).toEqual([3, 6]); // Lower range for LoFi
      expect(params.volume).toBeLessThan(0.6); // Quieter than other genres
      expect(params.reverb).toBeGreaterThan(0.3);
      expect(params.distortion).toBeLessThan(0.2); // Minimal distortion
    });

    it('should generate jazz-inspired chord progressions', async () => {
      const result = await generator.generateLoFiMusic(mockBlockchainData);
      const params = result.parameters;

      expect(params.chordProgression).toBeDefined();
      expect(params.chordProgression.length).toBeGreaterThan(0);
      
      // Check for jazz chords
      const hasJazzChords = params.chordProgression.some(chord => 
        chord.includes('maj7') || chord.includes('m7') || chord.includes('7')
      );
      expect(hasJazzChords).toBe(true);
    });

    it('should create LoFi-specific NFT metadata', async () => {
      const result = await generator.generateLoFiMusic(mockBlockchainData);
      const metadata = result.nftMetadata;

      expect(metadata.name).toContain('LoFi ApeChain Vibes');
      expect(metadata.description).toContain('LoFi Hip Hop');
      expect(metadata.description).toContain('Chill');
      expect(metadata.attributes).toBeDefined();
      
      // Check for LoFi-specific attributes
      const genreAttr = metadata.attributes.find(attr => attr.trait_type === 'Genre');
      expect(genreAttr?.value).toBe('LoFi Hip Hop');
      
      const bpmAttr = metadata.attributes.find(attr => attr.trait_type === 'BPM');
      expect(bpmAttr?.value).toBeGreaterThanOrEqual(70);
      expect(bpmAttr?.value).toBeLessThanOrEqual(90);
      
      const vinylAttr = metadata.attributes.find(attr => attr.trait_type === 'Vinyl Crackle');
      expect(vinylAttr?.value).toBe('Yes');
      
      const jazzAttr = metadata.attributes.find(attr => attr.trait_type === 'Jazz Chords');
      expect(jazzAttr?.value).toBe('Yes');
    });

    it('should handle empty blockchain data gracefully', async () => {
      const emptyData: BlockchainData[] = [];
      
      await expect(generator.generateLoFiMusic(emptyData)).rejects.toThrow();
    });

    it('should generate different music for different blockchain data', async () => {
      const result1 = await generator.generateLoFiMusic(mockBlockchainData);
      
      const differentData = [
        {
          ...mockBlockchainData[0],
          gasPrice: '50000000000', // 50 Gwei - much higher
          transactionHash: '0xdifferent1234567890'
        }
      ];
      
      const result2 = await generator.generateLoFiMusic(differentData);
      
      // Should have different parameters due to different gas price
      expect(result1.parameters.tempo).not.toBe(result2.parameters.tempo);
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('LoFi characteristics validation', () => {
    it('should respect BPM range configuration', async () => {
      const customConfig = {
        ...mockConfig,
        lofiSettings: {
          ...mockConfig.lofiSettings!,
          bpmRange: [80, 85] as [number, number]
        }
      };
      
      const customGenerator = new LoFiHipHopGenerator(customConfig);
      const result = await customGenerator.generateLoFiMusic(mockBlockchainData);
      
      expect(result.parameters.tempo).toBeGreaterThanOrEqual(80);
      expect(result.parameters.tempo).toBeLessThanOrEqual(85);
    });

    it('should respect swing amount configuration', async () => {
      const customConfig = {
        ...mockConfig,
        lofiSettings: {
          ...mockConfig.lofiSettings!,
          swingAmount: 0.5
        }
      };
      
      const customGenerator = new LoFiHipHopGenerator(customConfig);
      const result = await customGenerator.generateLoFiMusic(mockBlockchainData);
      
      expect(result.parameters.swing).toBeGreaterThanOrEqual(0.5);
      expect(result.parameters.swing).toBeLessThanOrEqual(0.6);
    });

    it('should handle vinyl crackle configuration', async () => {
      const customConfig = {
        ...mockConfig,
        lofiSettings: {
          ...mockConfig.lofiSettings!,
          vinylCrackle: false
        }
      };
      
      const customGenerator = new LoFiHipHopGenerator(customConfig);
      const result = await customGenerator.generateLoFiMusic(mockBlockchainData);
      
      const vinylAttr = result.nftMetadata.attributes.find(attr => attr.trait_type === 'Vinyl Crackle');
      expect(vinylAttr?.value).toBe('No');
    });

    it('should handle jazz chords configuration', async () => {
      const customConfig = {
        ...mockConfig,
        lofiSettings: {
          ...mockConfig.lofiSettings!,
          jazzChords: false
        }
      };
      
      const customGenerator = new LoFiHipHopGenerator(customConfig);
      const result = await customGenerator.generateLoFiMusic(mockBlockchainData);
      
      const jazzAttr = result.nftMetadata.attributes.find(attr => attr.trait_type === 'Jazz Chords');
      expect(jazzAttr?.value).toBe('No');
    });
  });

  describe('Audio generation', () => {
    it('should generate audio buffer with correct properties', async () => {
      const result = await generator.generateLoFiMusic(mockBlockchainData);
      
      expect(result.audioBuffer).toBeInstanceOf(ArrayBuffer);
      expect(result.audioBuffer.byteLength).toBeGreaterThan(0);
      
      // Should be stereo 16-bit audio
      const expectedSamples = Math.floor(44100 * result.duration);
      const expectedSize = expectedSamples * 2 * 2; // 2 channels * 2 bytes per sample
      expect(result.audioBuffer.byteLength).toBe(expectedSize);
    });

    it('should generate different audio for different parameters', async () => {
      const result1 = await generator.generateLoFiMusic(mockBlockchainData);
      
      const highGasData = [
        {
          ...mockBlockchainData[0],
          gasPrice: '100000000000' // 100 Gwei - very high
        }
      ];
      
      const result2 = await generator.generateLoFiMusic(highGasData);
      
      // Should have different audio due to different tempo
      expect(result1.audioBuffer).not.toEqual(result2.audioBuffer);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid blockchain data', async () => {
      const invalidData = [
        {
          ...mockBlockchainData[0],
          gasPrice: 'invalid',
          gasUsed: 'invalid'
        }
      ];
      
      await expect(generator.generateLoFiMusic(invalidData)).rejects.toThrow();
    });

    it('should handle missing configuration gracefully', () => {
      const configWithoutLoFi = {
        chainId: 33139,
        style: 'lofi-hiphop' as const,
        complexity: 'medium' as const,
        duration: 60,
        enableNFT: true,
        autoMint: false
      };
      
      const generatorWithoutConfig = new LoFiHipHopGenerator(configWithoutLoFi);
      expect(generatorWithoutConfig).toBeDefined();
    });
  });

  describe('Provenance and uniqueness', () => {
    it('should create unique IDs for different inputs', async () => {
      const result1 = await generator.generateLoFiMusic(mockBlockchainData);
      
      const differentData = [
        {
          ...mockBlockchainData[0],
          transactionHash: '0xcompletelydifferent123'
        }
      ];
      
      const result2 = await generator.generateLoFiMusic(differentData);
      
      expect(result1.id).not.toBe(result2.id);
      expect(result1.provenance.originalDataHash).not.toBe(result2.provenance.originalDataHash);
    });

    it('should maintain provenance data', async () => {
      const result = await generator.generateLoFiMusic(mockBlockchainData);
      
      expect(result.provenance.originalDataHash).toBe(mockBlockchainData[0].dataHash);
      expect(result.provenance.generationAlgorithm).toBe('ApeBeats LoFi Hip Hop Engine v1.0');
      expect(result.provenance.version).toBe('1.0.0');
      expect(result.provenance.creator).toBe('ApeBeats LoFi Generator');
    });
  });
});
