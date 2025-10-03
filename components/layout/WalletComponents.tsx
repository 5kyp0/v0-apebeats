"use client"

import { lazy, Suspense } from "react"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"

// Lazy load wallet components to prevent them from being instantiated when not needed
const HeaderUser = lazy(() => import("@/components/auth/HeaderUser"))
const NetworkSwitcher = lazy(() => import("@/components/wallet/NetworkSwitcher"))

interface WalletComponentsProps {
  onLoginClick?: () => void
}

export function WalletComponents({ onLoginClick }: WalletComponentsProps) {
  return (
    <div className="ml-4 flex items-center space-x-4">
      <ErrorBoundary>
        <Suspense fallback={<div className="w-16 h-6 bg-zinc-800 rounded animate-pulse" />}>
          <HeaderUser onLoginClick={onLoginClick} />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <NetworkSwitcher showAlways={true} className="hidden md:flex" />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
