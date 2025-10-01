"use client"

import { useEffect } from "react"
import useUserStore from "@/stores/userStore"

export function useSafeUserStore() {
  // Use the store directly with error handling
  let email: string | null = null
  let setEmail: (email: string | null) => void = () => {}
  let isClient = false

  try {
    email = useUserStore((state) => state.email)
    setEmail = useUserStore((state) => state.setEmail)
    isClient = true
  } catch (error) {
    console.warn("Error accessing user store:", error)
  }

  useEffect(() => {
    if (!isClient) return

    try {
      // Load from localStorage
      const saved = window.localStorage.getItem("apebeats_email")
      if (saved && !email) {
        setEmail(saved)
      }
    } catch (error) {
      console.warn("Error loading email from localStorage:", error)
    }
  }, [email, setEmail, isClient])

  return {
    email,
    setEmail,
    isClient
  }
}
