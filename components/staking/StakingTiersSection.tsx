import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Users, Factory, Zap } from "lucide-react"
import { stakingTiers } from "@/lib/thirdweb"

export function StakingTiersSection() {
  const tiers = [
    {
      key: "premium",
      tier: stakingTiers.premium,
      icon: Star,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      popular: true,
    },
    {
      key: "standard", 
      tier: stakingTiers.standard,
      icon: Users,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      popular: false,
    },
    {
      key: "partner",
      tier: stakingTiers.partner,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      popular: false,
    },
    {
      key: "oss",
      tier: stakingTiers.oss,
      icon: Factory,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      popular: false,
    },
  ]

  return (
    <section id="tiers" className="py-20 px-4 relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Staking Tiers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your staking tier based on your NFT collection and commitment level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tierData, index) => (
            <Card 
              key={tierData.key} 
              className={`relative border-2 border-dashed ${tierData.borderColor} ${tierData.bgColor} transition-all hover:scale-105 ${
                tierData.popular ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              {tierData.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pulse-glow">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${tierData.color} flex items-center justify-center`}>
                  <tierData.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">{tierData.tier.name}</CardTitle>
                <CardDescription className="text-base">{tierData.tier.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* APY Display */}
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {typeof tierData.tier.apy === "object" 
                      ? `${Math.max(...Object.values(tierData.tier.apy))}%`
                      : "Variable"
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Max APY</div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {tierData.tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* APY Breakdown for numeric tiers */}
                {typeof tierData.tier.apy === "object" && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-center">APY by Duration</div>
                    <div className="space-y-1">
                      {Object.entries(tierData.tier.apy).map(([duration, apy]) => (
                        <div key={duration} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{duration} days</span>
                          <span className="font-medium">{apy}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Button 
                  className={`w-full bg-gradient-to-r ${tierData.color} text-white hover:opacity-90`}
                  asChild
                >
                  <a href="/stake/dashboard">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Staking
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">How Staking Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="text-lg font-semibold text-primary">1. Select NFTs</div>
                <p className="text-sm text-muted-foreground">Choose from your BAYC, MAYC, or ApeBeats collection</p>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-primary">2. Choose Duration</div>
                <p className="text-sm text-muted-foreground">Lock for 30, 90, or 180 days for higher rewards</p>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-primary">3. Earn Rewards</div>
                <p className="text-sm text-muted-foreground">Receive APE tokens based on your tier and duration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
