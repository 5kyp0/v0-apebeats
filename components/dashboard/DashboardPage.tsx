"use client"

import { useActiveAccount } from "thirdweb/react"
import { UserDashboard } from "./UserDashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { ArrowLeft, ExternalLink, BarChart3 } from "lucide-react"
import Link from "next/link"

export function DashboardPage() {
  const account = useActiveAccount()

  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Dashboard"
      showBackButton={true}
      backButtonText="Back to Home"
      backButtonHref="/"
      icon={<BarChart3 className="w-5 h-5 text-primary-foreground" />}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            View your batch transfer history and monitor transaction analytics.
          </p>
        </div>

        {/* Wallet Connection Status */}
        {!account?.address && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="text-orange-700 dark:text-orange-300">
                Connect Your Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 dark:text-orange-300">
                Please connect your wallet to view your dashboard and track your activity.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {account?.address && <UserDashboard />}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </CommonPageLayout>
  )
}
