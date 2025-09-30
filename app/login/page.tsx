import type { Metadata } from "next"
import { getPageMetadata } from "@/lib/metadata"
import { LoginPageClient } from "./LoginPageClient"

export const metadata: Metadata = getPageMetadata("login")

export default function LoginPage() {
  return <LoginPageClient />
}


