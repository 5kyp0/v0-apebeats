"use client"

import { useState, useEffect } from "react"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import SnapshotTool from "@/components/features/SnapshotTool"
import DonationSection from "@/components/features/DonationSection"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { Users } from "lucide-react"

export function SnapshotPageClient() {
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
        
        {/* Donation Section - Discrete footer */}
        <div className="mt-16 pt-8 border-t border-border/20">
          <DonationSection />
        </div>
      </div>
    </CommonPageLayout>
  )
}
