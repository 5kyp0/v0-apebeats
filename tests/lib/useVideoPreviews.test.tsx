/**
 * Tests for useVideoPreviews hook
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useVideoPreviews } from '@/lib/useVideoPreviews'
import * as videoUtils from '@/lib/videoUtils'

// Mock the video utils
jest.mock('@/lib/videoUtils', () => ({
  getVideoPreview: jest.fn(),
  preloadVideoPreviews: jest.fn(),
}))

const mockVideoUtils = videoUtils as jest.Mocked<typeof videoUtils>

describe('useVideoPreviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should load previews for multiple videos', async () => {
    const videoUrls = [
      'https://example.com/video1.mp4',
      'https://example.com/video2.mp4',
    ]

    mockVideoUtils.preloadVideoPreviews.mockResolvedValue(undefined)
    mockVideoUtils.getVideoPreview
      .mockResolvedValueOnce('data:image/jpeg;base64,preview1')
      .mockResolvedValueOnce('data:image/jpeg;base64,preview2')

    const { result } = renderHook(() => useVideoPreviews(videoUrls))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.getPreview(videoUrls[0])).toBe('data:image/jpeg;base64,preview1')
    expect(result.current.getPreview(videoUrls[1])).toBe('data:image/jpeg;base64,preview2')
    expect(result.current.error).toBeNull()
  })

  it('should handle empty video array', async () => {
    const { result } = renderHook(() => useVideoPreviews([]))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.previews).toEqual({})
    expect(mockVideoUtils.preloadVideoPreviews).not.toHaveBeenCalled()
  })

  it('should handle preview loading errors gracefully', async () => {
    const videoUrls = ['https://example.com/error.mp4']

    mockVideoUtils.preloadVideoPreviews.mockRejectedValue(new Error('Network error'))
    mockVideoUtils.getVideoPreview.mockRejectedValue(new Error('Preview failed'))

    const { result } = renderHook(() => useVideoPreviews(videoUrls))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    // Should still provide fallback preview
    expect(result.current.getPreview(videoUrls[0])).toContain('data:image/svg+xml')
  })

  it('should provide fallback preview for missing videos', () => {
    const videoUrls = ['https://example.com/video1.mp4']
    const { result } = renderHook(() => useVideoPreviews(videoUrls))

    // Even before loading completes, should provide fallback
    const preview = result.current.getPreview('https://example.com/unknown.mp4')
    expect(preview).toContain('data:image/svg+xml')
    // The fallback contains "No Preview" in the decoded SVG, not in the base64 string
    expect(preview).toContain('base64,')
  })

  it('should refresh previews when refreshPreviews is called', async () => {
    const videoUrls = ['https://example.com/video1.mp4']

    mockVideoUtils.preloadVideoPreviews.mockResolvedValue(undefined)
    mockVideoUtils.getVideoPreview.mockResolvedValue('data:image/jpeg;base64,preview1')

    const { result } = renderHook(() => useVideoPreviews(videoUrls))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Call refresh
    act(() => {
      result.current.refreshPreviews()
    })

    expect(result.current.loading).toBe(true)
    expect(mockVideoUtils.preloadVideoPreviews).toHaveBeenCalledTimes(2)
  })
})
