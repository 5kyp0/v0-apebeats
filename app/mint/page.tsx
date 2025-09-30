import type { Metadata } from "next"
import { Suspense } from "react"
import { getPageMetadata } from "@/lib/metadata"
import { MintPageClient } from "./MintPageClient"

export const metadata: Metadata = getPageMetadata("mint")

export default function MintPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <MintPageClient />
    </Suspense>
  )
}
