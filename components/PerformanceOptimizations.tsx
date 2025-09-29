"use client"

import React, { memo, Suspense, lazy, useMemo, useCallback } from 'react'
import { Skeleton } from './ui/skeleton'

// Lazy load heavy components
export const LazyMusicEngine = lazy(() => import('./music-engine/MusicEngine'))
export const LazySnapshotTool = lazy(() => import('./features/SnapshotTool'))
export const LazyHeaderUser = lazy(() => import('./auth/HeaderUser'))
export const LazyLoginInline = lazy(() => import('./auth/LoginInline'))
export const LazyNetworkSwitcher = lazy(() => import('./wallet/NetworkSwitcher'))
export const LazyMenuDropdown = lazy(() => import('./features/SimpleMenuDropdown'))

// Memoized components for better performance
export const MemoizedCard = memo(({ children, className, ...props }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
))
MemoizedCard.displayName = 'MemoizedCard'

export const MemoizedButton = memo(({ children, className, ...props }: any) => (
  <button 
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
))
MemoizedButton.displayName = 'MemoizedButton'

// Loading skeletons
export const CardSkeleton = memo(() => (
  <div className="rounded-lg border bg-card p-6">
    <Skeleton className="h-4 w-3/4 mb-4" />
    <Skeleton className="h-3 w-1/2 mb-2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
))
CardSkeleton.displayName = 'CardSkeleton'

export const ButtonSkeleton = memo(() => (
  <Skeleton className="h-10 w-24 rounded-md" />
))
ButtonSkeleton.displayName = 'ButtonSkeleton'

export const VideoThumbnailSkeleton = memo(() => (
  <div className="aspect-square rounded-lg overflow-hidden bg-secondary/20">
    <Skeleton className="w-full h-full" />
  </div>
))
VideoThumbnailSkeleton.displayName = 'VideoThumbnailSkeleton'

// Performance-optimized video component
export const OptimizedVideo = memo(({ 
  src, 
  className = "", 
  onPlay, 
  onPause, 
  isPlaying = false,
  ...props 
}: {
  src: string
  className?: string
  onPlay?: () => void
  onPause?: () => void
  isPlaying?: boolean
  [key: string]: any
}) => {
  const handlePlay = useCallback(() => {
    onPlay?.()
  }, [onPlay])

  const handlePause = useCallback(() => {
    onPause?.()
  }, [onPause])

  return (
    <video
      src={src}
      className={className}
      onPlay={handlePlay}
      onPause={handlePause}
      preload="metadata"
      playsInline
      {...props}
    />
  )
})
OptimizedVideo.displayName = 'OptimizedVideo'

// Performance-optimized image component
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = "", 
  ...props 
}: {
  src: string
  alt: string
  className?: string
  [key: string]: any
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  if (hasError) {
    return (
      <div className={`bg-secondary/20 flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">Failed to load</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && <Skeleton className="absolute inset-0" />}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...props}
      />
    </div>
  )
})
OptimizedImage.displayName = 'OptimizedImage'

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isIntersecting
}

// Debounced hook for performance
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Virtual scrolling hook for large lists
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
    }))
  }, [items, itemHeight, containerHeight, scrollTop])

  const totalHeight = items.length * itemHeight
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  }
}

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])
}

// Error boundary for performance monitoring
export class PerformanceErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Performance Error Boundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>
    }

    return this.props.children
  }
}
