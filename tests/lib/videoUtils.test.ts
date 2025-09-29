/**
 * Tests for video utility functions
 */

import { extractVideoFrame, generateVideoPreview, getVideoPreview } from '@/lib/videoUtils'

// Mock HTML elements
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
  })),
  toDataURL: jest.fn(() => 'data:image/jpeg;base64,mock-data'),
}

const mockVideo = {
  crossOrigin: '',
  preload: '',
  currentTime: 0,
  videoWidth: 1920,
  videoHeight: 1080,
  src: '',
  onloadedmetadata: null as any,
  onseeked: null as any,
  onerror: null as any,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    if (tagName === 'video') return mockVideo
    if (tagName === 'canvas') return mockCanvas
    return {}
  }),
  writable: true,
})

describe('videoUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('extractVideoFrame', () => {
    it('should extract a frame from a video and return a data URL', async () => {
      const videoUrl = 'https://example.com/test.mp4'
      
      // Mock successful video loading
      const extractPromise = extractVideoFrame(videoUrl)
      
      // Simulate video loading events
      if (mockVideo.onloadedmetadata) {
        mockVideo.onloadedmetadata()
      }
      if (mockVideo.onseeked) {
        mockVideo.onseeked()
      }
      
      const result = await extractPromise
      
      expect(result).toBe('data:image/jpeg;base64,mock-data')
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
    })

    it('should handle video loading errors', async () => {
      const videoUrl = 'https://example.com/invalid.mp4'
      
      const extractPromise = extractVideoFrame(videoUrl)
      
      // Simulate error
      if (mockVideo.onerror) {
        mockVideo.onerror()
      }
      
      await expect(extractPromise).rejects.toThrow('Failed to load video')
    })
  })

  describe('generateVideoPreview', () => {
    it('should generate a preview and return a data URL', async () => {
      const videoUrl = 'https://example.com/test.mp4'
      
      const previewPromise = generateVideoPreview(videoUrl)
      
      // Simulate successful extraction
      if (mockVideo.onloadedmetadata) {
        mockVideo.onloadedmetadata()
      }
      if (mockVideo.onseeked) {
        mockVideo.onseeked()
      }
      
      const result = await previewPromise
      
      expect(result).toBe('data:image/jpeg;base64,mock-data')
    })

    it('should return a fallback on error', async () => {
      const videoUrl = 'https://example.com/invalid.mp4'
      
      const previewPromise = generateVideoPreview(videoUrl)
      
      // Simulate error
      if (mockVideo.onerror) {
        mockVideo.onerror()
      }
      
      const result = await previewPromise
      
      expect(result).toContain('data:image/svg+xml')
      // The fallback contains "No Preview" in the decoded SVG, not in the base64 string
      expect(result).toContain('base64,')
    })
  })

  describe('getVideoPreview', () => {
    it('should cache preview results', async () => {
      const videoUrl = 'https://example.com/test.mp4'
      
      // First call
      const previewPromise1 = getVideoPreview(videoUrl)
      if (mockVideo.onloadedmetadata) mockVideo.onloadedmetadata()
      if (mockVideo.onseeked) mockVideo.onseeked()
      const result1 = await previewPromise1
      
      // Second call should use cache
      const result2 = await getVideoPreview(videoUrl)
      
      expect(result1).toBe(result2)
      expect(mockCanvas.toDataURL).toHaveBeenCalledTimes(1) // Only called once due to caching
    })
  })
})
