"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { MusicEngine } from '@/components/music-engine/MusicEngine'
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { Music } from "lucide-react"

export default function MusicPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Music Engine"
      showBackButton={true}
      backButtonText="Back to Home"
      backButtonHref="/"
      icon={<Music className="w-5 h-5 text-primary-foreground" />}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              24/7 Music Engine
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
            Experience the live generative music engine powered by ApeChain data
          </p>
        </div>

        {isClient ? (
          <ErrorBoundary
            fallback={({ error, retry }) => (
              <div className="text-center py-20">
                <div className="text-red-500 mb-4">
                  <h2 className="text-2xl font-bold mb-2">Music Engine Unavailable</h2>
                  <p className="text-lg mb-4">
                    The music engine is currently experiencing issues. This might be due to:
                  </p>
                  <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
                    <li>• Missing environment configuration</li>
                    <li>• Network connectivity issues</li>
                    <li>• Browser compatibility problems</li>
                  </ul>
                  {error && (
                    <div className="text-sm text-red-400 mb-4 p-3 bg-red-50 rounded">
                      <strong>Error:</strong> {error.message}
                    </div>
                  )}
                  <div className="space-x-4">
                    <Button 
                      onClick={retry} 
                      variant="outline"
                    >
                      Try Again
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline"
                    >
                      Refresh Page
                    </Button>
                    <Button 
                      onClick={() => router.push('/')} 
                      variant="default"
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              </div>
            )}
          >
            <MusicEngine />
          </ErrorBoundary>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </CommonPageLayout>
  )
}
