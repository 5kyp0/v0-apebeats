import type { Metadata } from "next"
import { Suspense } from "react"
import { getPageMetadata } from "@/lib/metadata"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { StakingDashboard } from "@/components/staking/StakingDashboard"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { Coins } from "lucide-react"

export const metadata: Metadata = getPageMetadata("stake", {
  title: "Staking Dashboard - ApeBeats | Manage Your APE Staking",
  description: "Monitor and manage your APE token staking with ApeBeats. View rewards, unstake tokens, and track your staking performance.",
  url: "/stake/dashboard",
})

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
