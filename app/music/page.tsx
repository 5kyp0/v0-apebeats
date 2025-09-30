import type { Metadata } from "next"
import { Suspense } from "react"
import { getPageMetadata } from "@/lib/metadata"
import { MusicPageClient } from "./MusicPageClient"

export const metadata: Metadata = getPageMetadata("music")

export default function MusicPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <MusicPageClient />
    </Suspense>
  )
}
