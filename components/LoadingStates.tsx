"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Skeleton loading component for the main page
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation skeleton */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8 bg-background/80 backdrop-blur border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex items-center space-x-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </nav>

      {/* Hero section skeleton */}
      <section className="relative z-10 px-6 md:px-8 pt-28 pb-12 md:pt-36 md:pb-20">
        <div className="max-w-6xl mx-auto text-center">
          <Skeleton className="h-6 w-48 mx-auto mb-6" />
          <Skeleton className="h-16 w-96 mx-auto mb-6" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-8" />
          
          {/* Live beat visualizer skeleton */}
          <Card className="mb-12 p-8 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 max-w-md">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-4 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </Card>
          
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
      </section>

      {/* Features section skeleton */}
      <section className="relative z-10 px-6 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-96 mx-auto mb-6" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
                <Skeleton className="w-6 h-6 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Genesis collection skeleton */}
      <section className="relative z-10 px-6 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-80 mx-auto mb-6" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
                <Skeleton className="aspect-square rounded-lg mb-4" />
                <Skeleton className="h-6 w-24 mx-auto" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Loading component for wallet connections
export function WalletLoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Connecting wallet...</p>
      </div>
    </div>
  )
}

// Loading component for ApeChain data
export function ApeChainDataSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="h-4 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-12 mx-auto" />
        </div>
      ))}
    </div>
  )
}

// Loading component for video thumbnails
export function VideoThumbnailSkeleton() {
  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-secondary/20 relative">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    </div>
  )
}

// Loading component for navigation
export function NavigationSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

// Loading component for user profile
export function UserProfileSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

// Loading component for buttons
export function ButtonSkeleton({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-10 w-24 rounded ${className}`} />
}

// Loading component for cards
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={`p-6 bg-card/50 backdrop-blur-sm border-primary/20 ${className}`}>
      <Skeleton className="w-6 h-6 mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3 mt-2" />
    </Card>
  )
}

// Loading component for lists
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading component for tables
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Loading component for modals
export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="p-8 bg-card border-primary/30 max-w-md mx-4 relative">
        <div className="text-center">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-full mb-6" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </Card>
    </div>
  )
}

// Loading component for network switcher
export function NetworkSwitcherSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <Skeleton className="w-4 h-4 rounded" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

// Loading component for profile dropdown
export function ProfileDropdownSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

// Loading component for genesis collection
export function GenesisCollectionSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
          <VideoThumbnailSkeleton />
          <div className="mt-4 text-center">
            <Skeleton className="h-6 w-24 mx-auto" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// Loading component for roadmap
export function RoadmapSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="relative p-8 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-primary/20 ml-12">
          <Skeleton className="absolute -left-12 top-8 w-12 h-12 rounded-full" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-start">
                <Skeleton className="w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
