/**
 * Video utility functions for extracting frames and generating preview images
 */

/**
 * Extracts the first frame from a video and returns it as a data URL
 * @param videoUrl - URL of the video
 * @returns Promise<string> - Data URL of the extracted frame
 */
export async function extractVideoFrame(videoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Seek to the first frame (0.1 seconds to ensure we get a frame)
      video.currentTime = 0.1
    }
    
    video.onseeked = () => {
      try {
        // Draw the current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataUrl)
      } catch (error) {
        reject(error)
      }
    }
    
    video.onerror = () => {
      reject(new Error(`Failed to load video: ${videoUrl}`))
    }
    
    // Start loading the video
    video.src = videoUrl
  })
}

/**
 * Generates a preview image URL for a video by extracting its first frame
 * @param videoUrl - URL of the video
 * @returns Promise<string> - Data URL of the preview image
 */
export async function generateVideoPreview(videoUrl: string): Promise<string> {
  try {
    return await extractVideoFrame(videoUrl)
  } catch (error) {
    console.warn('Failed to generate preview for video:', videoUrl, error)
    // Return a placeholder or fallback
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFByZXZpZXc8L3RleHQ+PC9zdmc+'
  }
}

/**
 * Cache for storing generated preview images
 */
const previewCache = new Map<string, string>()

/**
 * Gets or generates a preview image for a video with caching
 * @param videoUrl - URL of the video
 * @returns Promise<string> - Data URL of the preview image
 */
export async function getVideoPreview(videoUrl: string): Promise<string> {
  // Check cache first
  if (previewCache.has(videoUrl)) {
    return previewCache.get(videoUrl)!
  }
  
  try {
    const preview = await generateVideoPreview(videoUrl)
    previewCache.set(videoUrl, preview)
    return preview
  } catch (error) {
    console.warn('Failed to get video preview:', videoUrl, error)
    // Return a fallback placeholder
    const fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFByZXZpZXc8L3RleHQ+PC9zdmc+'
    previewCache.set(videoUrl, fallback)
    return fallback
  }
}

/**
 * Preloads preview images for multiple videos
 * @param videoUrls - Array of video URLs
 * @returns Promise<void>
 */
export async function preloadVideoPreviews(videoUrls: string[]): Promise<void> {
  const promises = videoUrls.map(url => getVideoPreview(url))
  await Promise.allSettled(promises)
}

/**
 * Clears the preview cache
 */
export function clearPreviewCache(): void {
  previewCache.clear()
}
