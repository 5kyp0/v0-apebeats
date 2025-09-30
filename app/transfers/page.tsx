import type { Metadata } from "next"
import { Suspense } from "react"
import { getPageMetadata } from "@/lib/metadata"
import { BatchTransferPage } from "@/components/transfers/BatchTransferPage"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { Send } from "lucide-react"

export const metadata: Metadata = getPageMetadata("transfers")

export default function TransfersPage() {
  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Batch Transfers"
      icon={<Send className="w-5 h-5 text-primary-foreground" />}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }>
        <BatchTransferPage />
      </Suspense>
    </CommonPageLayout>
  )
}
