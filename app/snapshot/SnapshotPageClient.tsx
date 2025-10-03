"use client"

import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import SnapshotTool from "@/components/features/SnapshotTool"
import DonationSection from "@/components/features/DonationSection"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { Users } from "lucide-react"

export function SnapshotPageClient() {
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
        <div className="space-y-8">
          <ErrorBoundary>
            <SnapshotTool />
          </ErrorBoundary>
        </div>
        
        {/* Donation Section - Discrete footer */}
        <div className="mt-16 pt-8 border-t border-border/20">
          <DonationSection />
        </div>
      </div>
        </CommonPageLayout>
  )
}
