import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Zap, MessageCircle, Twitter } from "lucide-react"

export function StakingCTASection() {
  return (
    <section className="py-20 px-4 relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-sm"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Ready to Start Staking?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of NFT holders earning rewards on ApeChain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - CTA */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Start Earning Today</h3>
              <p className="text-muted-foreground text-lg">
                Connect your wallet, select your NFTs, and start earning up to 15% APY with our innovative soft staking technology.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 pulse-glow" asChild>
                <a href="/stake/dashboard">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Launch Staking Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-2" asChild>
                <a href="/stake/dashboard">
                  <Zap className="w-5 h-5 mr-2" />
                  View Documentation
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$2.4M</div>
                <div className="text-sm text-muted-foreground">Total Value Locked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1,247</div>
                <div className="text-sm text-muted-foreground">Active Stakers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15%</div>
                <div className="text-sm text-muted-foreground">Max APY</div>
              </div>
            </div>
          </div>

          {/* Right Side - Community */}
          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Join Our Community</h3>
                  <p className="text-muted-foreground">
                    Connect with other stakers, get support, and stay updated on new features
                  </p>
                </div>

                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="https://discord.gg/EAeFftJe" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5 mr-3" />
                      Join Discord Community
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="https://x.com/CarquetE" target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-5 h-5 mr-3" />
                      Follow on Twitter
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/stake/dashboard">
                      <Zap className="w-5 h-5 mr-3" />
                      View Documentation
                    </a>
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Need help? Our community is here to support you every step of the way.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
