import { Suspense } from "react"
import { DashboardPage } from "@/components/dashboard/DashboardPage"

export default function DashboardPageRoute() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }>
        <DashboardPage />
      </Suspense>
    </div>
  )
}
