"use client"

import { useState, useEffect, Suspense } from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import SnapshotTool from "@/components/SnapshotTool"
import { CommonPageLayout } from "@/components/CommonPageLayout"
import { Users } from "lucide-react"

export default function SnapshotPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Snapshot Tool"
      showBackButton={true}
      backButtonText="Back to Home"
      backButtonHref="/"
      icon={<Users className="w-5 h-5 text-primary-foreground" />}
    >
      <div className="max-w-6xl mx-auto">
        {isClient ? (
          <ErrorBoundary>
            <SnapshotTool />
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
