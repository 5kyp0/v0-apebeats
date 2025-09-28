"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { StakingDashboard } from "@/components/staking/StakingDashboard"
import { CommonPageLayout } from "@/components/CommonPageLayout"
import { Coins } from "lucide-react"

export default function StakeDashboardPage() {
  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Staking Dashboard"
      showBackButton={true}
      backButtonText="Back to Staking"
      backButtonHref="/stake"
      icon={<Coins className="w-5 h-5 text-primary-foreground" />}
    >
      <ErrorBoundary>
        <StakingDashboard />
      </ErrorBoundary>
    </CommonPageLayout>
  )
}
