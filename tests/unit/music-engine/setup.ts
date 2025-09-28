/**
 * Test Setup for Music Engine Tests
 * 
 * Common mocks and setup for all music engine tests
 */

// Mock environment variables
process.env.NEXT_PUBLIC_ALCHEMY_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID = 'test-client-id';

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

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn();
const mockCancelAnimationFrame = jest.fn();

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame
});

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame
});

// Mock fetch
global.fetch = jest.fn();

// Mock setTimeout and setInterval
jest.useFakeTimers();

// Suppress console errors in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  jest.clearAllMocks();
});

export { mockCanvas, mockAudioContext, mockRequestAnimationFrame, mockCancelAnimationFrame };
