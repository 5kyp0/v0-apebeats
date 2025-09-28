import { useState, useEffect, useCallback } from 'react'
import { getVideoPreview, preloadVideoPreviews } from '@/lib/utils/videoUtils'

/**
 * Hook for managing video preview images
 */
export function useVideoPreviews(videoUrls: string[]) {
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPreviews = useCallback(async () => {
    if (videoUrls.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Load previews with delay to prevent blocking the main thread
      const previewMap: Record<string, string> = {}
      
      // Process videos in batches of 2 to prevent overwhelming the browser
      const batchSize = 2
      for (let i = 0; i < videoUrls.length; i += batchSize) {
        const batch = videoUrls.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (url) => {
          try {
            const preview = await getVideoPreview(url)
            return { url, preview }
          } catch (error) {
            console.warn('Failed to load preview for:', url, error)
            return { 
              url, 
              preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFByZXZpZXc8L3RleHQ+PC9zdmc+'
            }
          }
        })

        const batchResults = await Promise.allSettled(batchPromises)
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            previewMap[result.value.url] = result.value.preview
          }
        })

        // Update state after each batch to show progress
        setPreviews({ ...previewMap })
        
        // Small delay between batches to prevent blocking
        if (i + batchSize < videoUrls.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video previews')
      console.error('Error loading video previews:', err)
    } finally {
      setLoading(false)
    }
  }, [videoUrls])

  useEffect(() => {
    loadPreviews()
  }, [loadPreviews])

  const getPreview = useCallback((videoUrl: string): string => {
    return previews[videoUrl] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFByZXZpZXc8L3RleHQ+PC9zdmc+'
  }, [previews])

  const refreshPreviews = useCallback(() => {
    loadPreviews()
  }, [loadPreviews])

  return {
    previews,
    loading,
    error,
    getPreview,
    refreshPreviews
  }
}
