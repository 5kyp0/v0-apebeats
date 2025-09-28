"use client"
import { useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import useUserStore from "@/stores/userStore"
import ProfileDropdown from "@/components/features/auth/ProfileDropdown"

interface HeaderUserProps {
  onLoginClick?: () => void
}

export default function HeaderUser({ onLoginClick }: HeaderUserProps) {
  const account = useActiveAccount()
  const email = useUserStore((s: any) => s.email)
  const setEmail = useUserStore((s: any) => s.setEmail)

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("apebeats_email") : null
    if (saved && !email) setEmail(saved)
  }, [email, setEmail])

  // Show login button if no email and no wallet
  if (!email && !account?.address) {
    return (
      <button
        onClick={onLoginClick}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
      >
        Login
      </button>
    )
  }

  // Show profile dropdown if logged in
  return <ProfileDropdown />
}