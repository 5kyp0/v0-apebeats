import type { Metadata } from "next"
import { getPageMetadata } from "@/lib/metadata"
import { NotFoundClient } from "./not-found-client"

export const metadata: Metadata = getPageMetadata("notFound")

export default function NotFound() {
  return <NotFoundClient />
}
