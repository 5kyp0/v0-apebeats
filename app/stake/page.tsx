import { StakingHeader } from "@/components/staking/StakingHeader"
import { StakingHeroSection } from "@/components/staking/StakingHeroSection"
import { StakingFeaturesSection } from "@/components/staking/StakingFeaturesSection"
import { StakingTiersSection } from "@/components/staking/StakingTiersSection"
import { StakingCTASection } from "@/components/staking/StakingCTASection"
import { StakingFooter } from "@/components/staking/StakingFooter"

export default function StakePage() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "center center",
        }}
      />
      
      {/* Floating Elements */}
      <div className="fixed inset-0 opacity-20 dark:opacity-15" style={{ zIndex: 1 }}>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/40 to-pink-500/40 dark:from-purple-500/25 dark:to-pink-500/25 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-500/30 to-red-500/30 dark:from-orange-500/15 dark:to-red-500/15 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-purple-500/35 to-pink-500/35 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-cyan-500/35 to-blue-500/35 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        <StakingHeader />
        <main>
          <StakingHeroSection />
          <StakingFeaturesSection />
          <StakingTiersSection />
          <StakingCTASection />
        </main>
        <StakingFooter />
      </div>
    </div>
  )
}
