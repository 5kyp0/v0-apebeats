import type { Metadata } from "next"
import { Suspense } from "react"
import { getPageMetadata } from "@/lib/metadata"
import { DashboardPage } from "@/components/dashboard/DashboardPage"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { BarChart3 } from "lucide-react"

export const metadata: Metadata = getPageMetadata("dashboard")

export default function DashboardPageRoute() {
  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Dashboard"
      icon={<BarChart3 className="w-5 h-5 text-primary-foreground" />}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }>
        <DashboardPage />
      </Suspense>
    </CommonPageLayout>
  )
}
