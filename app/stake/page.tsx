import { StakingHeroSection } from "@/components/staking/StakingHeroSection"
import { StakingFeaturesSection } from "@/components/staking/StakingFeaturesSection"
import { StakingTiersSection } from "@/components/staking/StakingTiersSection"
import { StakingCTASection } from "@/components/staking/StakingCTASection"
import { StakingFooter } from "@/components/staking/StakingFooter"
import { CommonPageLayout } from "@/components/layout/CommonPageLayout"
import { Coins } from "lucide-react"

export default function StakePage() {
  return (
    <CommonPageLayout
      title="ApeBeats"
      subtitle="Staking"
      icon={<Coins className="w-5 h-5 text-primary-foreground" />}
    >
      <StakingHeroSection />
      <StakingFeaturesSection />
      <StakingTiersSection />
      <StakingCTASection />
      <StakingFooter />
    </CommonPageLayout>
  )
}
