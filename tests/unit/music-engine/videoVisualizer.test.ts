/**
 * Video Visualizer Tests
 * 
 * Tests for the video visualization functionality
 */

import { VideoVisualizer } from '@/lib/music-engine/videoVisualizer';
import { GeneratedMusic, BlockchainData, MusicParameters } from '@/lib/music-engine/types';

// Mock canvas and context
const mockContext = {
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
  toDataURL: jest.fn(() => 'data:image/png;base64,mock-image'),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  }))
};

const mockCanvas = {
  width: 400,
  height: 200,
  getContext: jest.fn(() => mockContext),
  toDataURL: jest.fn(() => 'data:image/png;base64,mock-image')
};

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn();
const mockCancelAnimationFrame = jest.fn();

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame
});

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame
});

// Mock document.createElement
Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn((tagName) => {
      if (tagName === 'canvas') return mockCanvas;
      return {};
    })
  }
});

describe('VideoVisualizer', () => {
  let visualizer: VideoVisualizer;
  let mockMusic: GeneratedMusic;
  let mockBlockchainData: BlockchainData[];
  let mockParameters: MusicParameters;

  beforeEach(() => {
    mockParameters = {
      tempo: 80,
      timeSignature: [4, 4],
      swing: 0.3,
      key: 'C',
      scale: 'major',
      chordProgression: ['Cmaj7', 'Am7', 'Fmaj7', 'G7'],
      melodyPattern: [0, 2, 4, 2, 0, 2, 4, 2],
      noteDuration: [0.5, 0.5, 1, 0.5, 0.5, 0.5, 1, 0.5],
      octaveRange: [3, 6],
      volume: 0.5,
      reverb: 0.4,
      delay: 0.2,
      distortion: 0.1,
      introLength: 4,
      verseLength: 8,
      chorusLength: 8,
      outroLength: 4,
      seed: 'test-seed-123'
    };

    mockMusic = {
      id: 'test-music-123',
      timestamp: Date.now(),
      sourceData: {
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
      parameters: mockParameters,
      audioBuffer: new ArrayBuffer(1000),
      audioUrl: 'mock-audio-url',
      duration: 60,
      nftMetadata: {
        name: 'Test LoFi Track',
        description: 'Test description',
        image: 'data:image/png;base64,test-image',
        audio: '',
        attributes: [],
        external_url: 'https://test.com',
        background_color: '#2D1B69',
        animation_url: 'https://test.com/animation'
      },
      provenance: {
        originalDataHash: 'mock-data-hash-123',
        generationAlgorithm: 'Test Algorithm',
        version: '1.0.0',
        creator: 'Test Creator'
      }
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

    visualizer = new VideoVisualizer(mockCanvas);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with canvas element', () => {
      expect(visualizer).toBeDefined();
      expect(visualizer.getCanvas()).toBe(mockCanvas);
    });

    it('should throw error if canvas context is not available', () => {
      const invalidCanvas = {
        getContext: jest.fn(() => null)
      };

      expect(() => {
        new VideoVisualizer(invalidCanvas);
      }).toThrow('Could not get 2D context from canvas');
    });
  });

  describe('generateVisualization', () => {
    it('should generate video visualization', async () => {
      const result = await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      expect(result).toBeDefined();
      expect(result.id).toBe('viz_test-music-123');
      expect(result.musicId).toBe('test-music-123');
      expect(result.duration).toBe(60);
      expect(result.thumbnailUrl).toBeDefined();
      expect(result.videoUrl).toBeDefined();
      expect(result.elements).toBeDefined();
      expect(result.dataVisualization).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should create LoFi-specific visualization elements', async () => {
      const result = await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      expect(result.elements.waveform).toBe(true);
      expect(result.elements.blockchainData).toBe(true);
      expect(result.elements.particleSystem).toBe(true);
      expect(result.elements.animationStyle).toBe('minimal');
      expect(result.elements.colorPalette).toBeDefined();
      expect(result.elements.colorPalette.length).toBeGreaterThan(0);
    });

    it('should create blockchain data visualization elements', async () => {
      const result = await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      expect(result.dataVisualization.transactionFlow).toBe(true);
      expect(result.dataVisualization.blockTimeline).toBe(true);
      expect(result.dataVisualization.addressActivity).toBe(true);
      expect(result.dataVisualization.gasPriceGraph).toBe(true);
      expect(result.dataVisualization.networkStats).toBe(true);
    });

    it('should create proper metadata', async () => {
      const result = await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      expect(result.metadata.resolution).toBe('1920x1080');
      expect(result.metadata.frameRate).toBe(30);
      expect(result.metadata.codec).toBe('webm');
      expect(result.metadata.fileSize).toBe(0);
    });

    it('should generate thumbnail image', async () => {
      const result = await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      expect(result.thumbnailUrl).toBe('data:image/png;base64,mock-image');
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });
  });

  describe('Real-time Visualization', () => {
    it('should start real-time visualization', () => {
      visualizer.startRealTimeVisualization(mockMusic, mockBlockchainData);

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('should stop real-time visualization', () => {
      visualizer.startRealTimeVisualization(mockMusic, mockBlockchainData);
      visualizer.stopRealTimeVisualization();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('should handle multiple start/stop calls', () => {
      visualizer.startRealTimeVisualization(mockMusic, mockBlockchainData);
      visualizer.startRealTimeVisualization(mockMusic, mockBlockchainData);
      visualizer.stopRealTimeVisualization();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('should animate visualization elements', () => {
      visualizer.startRealTimeVisualization(mockMusic, mockBlockchainData);

      // Simulate animation frame
      const animationCallback = mockRequestAnimationFrame.mock.calls[0][0];
      animationCallback();

      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('Canvas Operations', () => {
    it('should resize canvas', () => {
      const newWidth = 800;
      const newHeight = 600;

      visualizer.resize(newWidth, newHeight);

      expect(mockCanvas.width).toBe(newWidth);
      expect(mockCanvas.height).toBe(newHeight);
    });

    it('should draw LoFi background', async () => {
      await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      expect(mockContext.createLinearGradient).toHaveBeenCalled();
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should draw waveform', async () => {
      await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should draw blockchain data visualization', async () => {
      await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      // Should draw transaction flow and gas price graph
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should draw LoFi elements', async () => {
      await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      // Should draw vinyl record and particles
      expect(mockContext.arc).toHaveBeenCalled();
      expect(mockContext.fill).toHaveBeenCalled();
    });
  });

  describe('Color Palette Generation', () => {
    it('should generate LoFi color palettes', async () => {
      const result = await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      expect(result.elements.colorPalette).toBeDefined();
      expect(result.elements.colorPalette.length).toBe(3);
      expect(result.elements.colorPalette[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should generate different palettes for different music', async () => {
      const result1 = await visualizer.generateVisualization(mockMusic, mockBlockchainData);

      const differentMusic = {
        ...mockMusic,
        parameters: {
          ...mockParameters,
          melodyPattern: [1, 3, 5, 3, 1, 3, 5, 3] // Different pattern
        }
      };

      const result2 = await visualizer.generateVisualization(differentMusic, mockBlockchainData);

      expect(result1.elements.colorPalette).not.toEqual(result2.elements.colorPalette);
    });
  });

  describe('Error Handling', () => {
    it('should handle canvas context errors', () => {
      const errorCanvas = {
        getContext: jest.fn(() => {
          throw new Error('Canvas context error');
        })
      };

      expect(() => {
        new VideoVisualizer(errorCanvas);
      }).toThrow('Could not get 2D context from canvas');
    });

    it('should handle visualization generation errors', async () => {
      const invalidMusic = {
        ...mockMusic,
        parameters: null as any
      };

      await expect(
        visualizer.generateVisualization(invalidMusic, mockBlockchainData)
      ).rejects.toThrow();
    });

    it('should handle empty blockchain data', async () => {
      const result = await visualizer.generateVisualization(mockMusic, []);

      expect(result).toBeDefined();
      expect(result.dataVisualization).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle large blockchain datasets', async () => {
      const largeBlockchainData = Array(100).fill(null).map((_, index) => ({
        blockNumber: 12345 + index,
        blockHash: `0x${index.toString(16).padStart(16, '0')}`,
        transactionHash: `0x${(index + 1000).toString(16).padStart(16, '0')}`,
        timestamp: 1703000000 + index,
        gasUsed: '21000',
        gasPrice: '20000000000',
        transactionCount: 5,
        fromAddress: '0x1234567890123456789012345678901234567890',
        toAddress: '0x0987654321098765432109876543210987654321',
        value: '1000000000000000000',
        dataHash: `mock-data-hash-${index}`
      }));

      const result = await visualizer.generateVisualization(mockMusic, largeBlockchainData);

      expect(result).toBeDefined();
      expect(result.dataVisualization).toBeDefined();
    });

    it('should handle long music durations', async () => {
      const longMusic = {
        ...mockMusic,
        duration: 300 // 5 minutes
      };

      const result = await visualizer.generateVisualization(longMusic, mockBlockchainData);

      expect(result).toBeDefined();
      expect(result.duration).toBe(300);
    });
  });

  describe('Animation Loop', () => {
    it('should create proper animation loop', () => {
      visualizer.startRealTimeVisualization(mockMusic, mockBlockchainData);

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
      
      // Simulate animation frame
      const animationCallback = mockRequestAnimationFrame.mock.calls[0][0];
      animationCallback();

      // Should call requestAnimationFrame again for next frame
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it('should stop animation loop when stopped', () => {
      visualizer.startRealTimeVisualization(mockMusic, mockBlockchainData);
      visualizer.stopRealTimeVisualization();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });
});
