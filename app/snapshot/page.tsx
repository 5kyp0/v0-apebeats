import type { Metadata } from "next"
import { Suspense } from "react"
import { getPageMetadata } from "@/lib/metadata"
import { SnapshotPageClient } from "./SnapshotPageClient"

export const metadata: Metadata = getPageMetadata("snapshot")

export default function SnapshotPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <SnapshotPageClient />
    </Suspense>
  )
}
