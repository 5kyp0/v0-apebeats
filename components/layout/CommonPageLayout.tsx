"use client"

import { ReactNode } from "react"
import { CommonHeader } from "./CommonHeader"
import { CommonFooter } from "./CommonFooter"

interface CommonPageLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
  icon?: React.ReactNode
  showFooter?: boolean
  onLoginClick?: () => void
}

export function CommonPageLayout({
  children,
  title = "ApeBeats",
  subtitle,
  showBackButton = false,
  backButtonText = "Back to Home",
  backButtonHref = "/",
  icon,
  showFooter = true,
  onLoginClick
}: CommonPageLayoutProps) {
  return (
    <div className="min-h-screen text-foreground overflow-hidden transition-colors duration-300">
      {/* Background Image */}
      <div
        className="fixed inset-0 opacity-70 dark:opacity-60 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "center center",
          zIndex: -2,
          willChange: "transform",
        }}
      />

      {/* Floating Elements */}
      <div className="fixed inset-0 opacity-20 dark:opacity-15" style={{ zIndex: -1, willChange: "transform" }}>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/40 to-pink-500/40 dark:from-purple-500/25 dark:to-pink-500/25 rounded-full blur-xl float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-lg float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-500/30 to-red-500/30 dark:from-orange-500/15 dark:to-red-500/15 rounded-full blur-2xl float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-purple-500/35 to-pink-500/35 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl psychedelic-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-2xl psychedelic-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Header */}
          <CommonHeader
            title={title}
            subtitle={subtitle}
            showBackButton={showBackButton}
            backButtonText={backButtonText}
            backButtonHref={backButtonHref}
            icon={icon}
            onLoginClick={onLoginClick}
          />

      {/* Main Content */}
      <main className="relative z-20 px-6 md:px-8 pt-28 pb-12 md:pt-36 md:pb-20" role="main">
        {children}
      </main>

      {/* Footer */}
      {showFooter && <CommonFooter />}
    </div>
  )
}
