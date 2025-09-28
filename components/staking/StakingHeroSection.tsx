import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap, Coins, Users } from "lucide-react"

export function StakingHeroSection() {
  return (
    <section className="relative py-20 px-4 min-h-screen flex items-center">
      {/* Theme-aware overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/25 via-background/20 to-background/25 backdrop-blur-sm"></div>
      
      <div className="container mx-auto text-center max-w-6xl relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 pulse-glow">
            <TrendingUp className="w-4 h-4" />
            Open-Source NFT Staking - Up to 15% APY
          </div>
        </div>

        <h1 className="text-4xl md:text-7xl font-bold mb-6 text-balance">
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Stake Your NFTs</span>
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Deploy Your Rewards</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto text-pretty">
          Soft stake your BAYC, MAYC, ApeBeats NFTs on ApeChain without losing liquidity. 
          <br />
          <span className="text-primary font-semibold">Earn up to 15% APY with tiered rewards, permissionless factories, and exclusive ApeBeats integration.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 pulse-glow" asChild>
            <a href="/stake/dashboard">
              <TrendingUp className="w-5 h-5 mr-2" />
              Start Staking Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="border-2 bg-transparent backdrop-blur-sm" asChild>
            <a href="/stake/dashboard">
              <Shield className="w-5 h-5 mr-2" />
              Deploy Pool
            </a>
          </Button>
          <Button size="lg" variant="outline" className="border-2 bg-transparent backdrop-blur-sm" asChild>
            <a href="/stake/dashboard">
              <Zap className="w-5 h-5 mr-2" />
              View Documentation
            </a>
          </Button>
        </div>

        {/* Hero Visual - Staking Stats */}
        <div className="relative">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-primary/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">15%</div>
                <div className="text-sm text-muted-foreground">Max APY</div>
              </div>
              <div className="bg-accent/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-accent mb-2">$5M</div>
                <div className="text-sm text-muted-foreground">TVL Target</div>
              </div>
              <div className="bg-chart-3/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-chart-3 mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Community Pools</div>
              </div>
              <div className="bg-chart-4/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-chart-4 mb-2">MIT</div>
                <div className="text-sm text-muted-foreground">Open Source</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Icons Animation */}
        <div className="absolute top-20 left-10">
          <Coins className="w-8 h-8 text-primary/30" />
        </div>
        <div className="absolute top-40 right-20">
          <Zap className="w-6 h-6 text-accent/30" />
        </div>
        <div className="absolute bottom-20 left-20">
          <Users className="w-6 h-6 text-chart-3/30" />
        </div>
      </div>
    </section>
  )
}
