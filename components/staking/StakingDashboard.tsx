"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  Coins, 
  Users, 
  Settings, 
  ExternalLink,
  Plus,
  Minus,
  Info,
  CheckCircle,
  AlertCircle,
  Github,
  Factory
} from "lucide-react"
import { useState } from "react"
import { useStaking } from "@/hooks/useStaking"
import { WalletConnect } from "@/components/staking/WalletConnect"
import { NFTGrid } from "@/components/staking/NFTGrid"
import { StakedNFTs } from "@/components/staking/StakedNFTs"
import { PoolCreator } from "@/components/staking/PoolCreator"
import { contractAddresses } from "@/lib/thirdweb"

export function StakingDashboard() {
  const [activeTab, setActiveTab] = useState<"stake" | "pools" | "create">("stake");
  const [selectedCollection, setSelectedCollection] = useState<string>("apebeats");
  
  const {
    isLoading,
    stakedNFTs,
    pools,
    totalTVL,
    totalStakers,
    stakeNFT,
    unstakeNFT,
    claimRewards,
    createPool,
  } = useStaking();

  const formatTVL = (tvl: any) => {
    if (!tvl) return "$2.4M";
    const num = parseFloat(tvl.toString());
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ApeBeats Staking
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stake your ApeBeats NFTs to earn rewards and participate in the ecosystem. 
            Deploy permissionless reward pools and earn governance tokens.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 border-dashed border-muted-foreground/30 text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">15%</div>
              <div className="text-sm text-muted-foreground">Max APY</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-dashed border-muted-foreground/30 text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-chart-2 mx-auto mb-3" />
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {totalStakers ? totalStakers.toString() : "1,247"}
              </div>
              <div className="text-sm text-muted-foreground">Active Stakers</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-dashed border-muted-foreground/30 text-center">
            <CardContent className="pt-6">
              <Coins className="w-8 h-8 text-chart-3 mx-auto mb-3" />
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {formatTVL(totalTVL)}
              </div>
              <div className="text-sm text-muted-foreground">Total Value Locked</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-dashed border-muted-foreground/30 text-center">
            <CardContent className="pt-6">
              <Factory className="w-8 h-8 text-chart-4 mx-auto mb-3" />
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {pools.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Pools</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-muted/50 rounded-lg p-1">
            <Button
              variant={activeTab === "stake" ? "default" : "ghost"}
              onClick={() => setActiveTab("stake")}
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Stake NFTs
            </Button>
            <Button
              variant={activeTab === "pools" ? "default" : "ghost"}
              onClick={() => setActiveTab("pools")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Browse Pools
            </Button>
            <Button
              variant={activeTab === "create" ? "default" : "ghost"}
              onClick={() => setActiveTab("create")}
            >
              <Factory className="w-4 h-4 mr-2" />
              Create Pool
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "stake" && (
          <div className="space-y-8">
            {/* Collection Selection */}
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-primary" />
                  Select Collection to Stake
                </CardTitle>
                <CardDescription>
                  Choose an NFT collection to view and stake your NFTs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "bayc", name: "Bored Ape Yacht Club", apy: "8-12%", icon: Users },
                    { key: "mayc", name: "Mutant Ape Yacht Club", apy: "8-12%", icon: TrendingUp },
                    { key: "apebeats", name: "ApeBeats NFTs", apy: "12-15%", icon: Coins },
                  ].map((collection) => (
                    <Card
                      key={collection.key}
                      className={`cursor-pointer transition-all hover:scale-105 border-2 border-dashed border-muted-foreground/30 ${
                        selectedCollection === collection.key ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedCollection(collection.key)}
                    >
                      <CardContent className="p-4 text-center">
                        <collection.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h3 className="font-medium">{collection.name}</h3>
                        <p className="text-sm text-muted-foreground">{collection.apy} APY</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* NFT Grid */}
            <NFTGrid
              collection={selectedCollection}
              onStake={stakeNFT}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === "pools" && (
          <div className="space-y-8">
            {/* Active Pools */}
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Active Reward Pools
                </CardTitle>
                <CardDescription>
                  Browse and join existing permissionless reward pools
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pools.length === 0 ? (
                  <div className="text-center py-12">
                    <Factory className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Pools</h3>
                    <p className="text-muted-foreground">
                      Be the first to create a reward pool for your collection!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pools.map((pool, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{pool.name}</div>
                            <div className="text-sm text-muted-foreground">Created by {pool.creator.slice(0, 6)}...{pool.creator.slice(-4)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{pool.apy}%</div>
                            <div className="text-xs text-muted-foreground">APY</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">{formatTVL(pool.tvl)}</div>
                            <div className="text-xs text-muted-foreground">TVL</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">{pool.stakers}</div>
                            <div className="text-xs text-muted-foreground">Stakers</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {pool.status}
                            </Badge>
                            <Button size="sm" variant="outline">
                              Join Pool
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "create" && (
          <div className="max-w-2xl mx-auto">
            <PoolCreator
              onCreatePool={createPool}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Your Stakes */}
        <Card className="border-2 border-dashed border-muted-foreground/30 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary" />
              Your Active Stakes
            </CardTitle>
            <CardDescription>
              Manage your staked NFTs and claim rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StakedNFTs
              stakedNFTs={stakedNFTs}
              onUnstake={unstakeNFT}
              onClaimRewards={claimRewards}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-muted-foreground/30 text-center">
            <CardContent className="pt-6">
              <Github className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">GitHub Repository</h4>
              <p className="text-sm text-muted-foreground mb-4">
                View the open-source code and contribute to the project
              </p>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-muted-foreground/30 text-center">
            <CardContent className="pt-6">
              <Settings className="w-8 h-8 text-chart-2 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Documentation</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Learn how to deploy pools and integrate with your dApp
              </p>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Read Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-muted-foreground/30 text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-chart-3 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Community</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Join our Discord and Twitter for updates and support
              </p>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Community
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
