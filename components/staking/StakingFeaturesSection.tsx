import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Shield, Zap, Coins, Users, Clock, Factory, Globe } from "lucide-react"

export function StakingFeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "Premium Yields Up to 15% APY",
      description:
        "Earn industry-leading yields on your NFT collection. Tiered rewards based on commitment duration - stake longer for higher returns with our innovative soft staking mechanism.",
      color: "text-primary",
    },
    {
      icon: Shield,
      title: "Soft Staking - Keep Your NFTs",
      description:
        "Stake your BAYC, MAYC, and ApeBeats NFTs without losing liquidity. NFT Shadows technology allows you to earn rewards while maintaining full ownership and control.",
      color: "text-accent",
    },
    {
      icon: Zap,
      title: "ApeBeats Integration",
      description:
        "Exclusive integration with ApeBeats generative music NFTs. Premium tier holders earn Vibe Tokens for audio remixes and enhanced rewards tied to chain data.",
      color: "text-chart-3",
    },
    {
      icon: Factory,
      title: "Permissionless Reward Factories",
      description:
        "Deploy custom reward pools for any collection. Set your own APY rates, fund with APE or ERC-20 tokens, and earn from community staking with transparent fee splits.",
      color: "text-chart-4",
    },
    {
      icon: Globe,
      title: "Open-Source & Community Driven",
      description:
        "Fully open-source platform with community-driven development. Contribute, build custom features, and participate in governance with transparent development processes.",
      color: "text-chart-5",
    },
    {
      icon: Coins,
      title: "APE Hard Staking Pool",
      description:
        "Community-funded yield pool powered by hard-staked ApeCoin. 80% of yields go to soft stakers, creating a sustainable flywheel for all participants.",
      color: "text-primary",
    },
    {
      icon: Users,
      title: "Multi-Tier System",
      description:
        "Four distinct tiers: Premium (ApeBeats), Standard (BAYC/MAYC), Partner (vetted collections), and OSS (community pools). Each tier offers different benefits and reward structures.",
      color: "text-accent",
    },
    {
      icon: Globe,
      title: "Community Governance",
      description:
        "Pool Governor tokens for DAO voting on platform parameters. Quadratic voting system ensures fair representation and community-driven decision making.",
      color: "text-chart-3",
    },
    {
      icon: Clock,
      title: "Flexible Duration Options",
      description:
        "Choose your commitment: 30 days (5% APY), 90 days (8% APY), 180 days (12% APY), or 365 days (15% APY). Early unstaking includes progressive penalties.",
      color: "text-chart-4",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-sm"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Open-Source Staking Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for the ApeChain ecosystem with innovative soft staking technology, permissionless factories, and community governance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-muted/50 backdrop-blur-sm ${feature.color} pulse-glow`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
