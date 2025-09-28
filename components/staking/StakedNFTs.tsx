"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Clock, 
  TrendingUp, 
  Coins,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon
} from "lucide-react";
import { StakedNFT } from "@/hooks/useStaking";
import { stakingTiers } from "@/lib/thirdweb";

interface StakedNFTsProps {
  stakedNFTs: StakedNFT[];
  onUnstake: (tokenId: string, collection: string) => void;
  onClaimRewards: (tokenId: string, collection: string) => void;
  isLoading?: boolean;
}

export function StakedNFTs({ stakedNFTs, onUnstake, onClaimRewards, isLoading = false }: StakedNFTsProps) {
  const getCollectionName = (collection: string) => {
    switch (collection) {
      case "bayc": return "Bored Ape Yacht Club";
      case "mayc": return "Mutant Ape Yacht Club";
      case "apebeats": return "ApeBeats";
      default: return "Unknown Collection";
    }
  };

  const getTierColor = (tier: keyof typeof stakingTiers) => {
    switch (tier) {
      case "partner": return "bg-blue-500/20 text-blue-600";
      case "standard": return "bg-green-500/20 text-green-600";
      case "premium": return "bg-purple-500/20 text-purple-600";
      case "oss": return "bg-orange-500/20 text-orange-600";
      default: return "bg-gray-500/20 text-gray-600";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRewards = (rewards: string) => {
    const num = parseFloat(rewards);
    return num.toFixed(4);
  };

  const getTimeRemaining = (stakedAt: Date, lockPeriod: number) => {
    const now = new Date();
    const unlockDate = new Date(stakedAt.getTime() + lockPeriod * 24 * 60 * 60 * 1000);
    const timeRemaining = unlockDate.getTime() - now.getTime();
    
    if (timeRemaining <= 0) {
      return "Unlocked";
    }
    
    const days = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-2 border-dashed border-muted-foreground/30 animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stakedNFTs.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Active Stakes</h3>
        <p className="text-muted-foreground">
          You don't have any staked NFTs. Start staking to earn rewards!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stakedNFTs.map((nft) => (
        <Card key={`${nft.collection}-${nft.tokenId}`} className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="p-4">
            <div className="aspect-square bg-muted rounded-lg mb-4 relative overflow-hidden">
              <img
                src="/placeholder.jpg"
                alt={`NFT #${nft.tokenId}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className={getTierColor(nft.tier)}>
                  {stakingTiers[nft.tier].name}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">#{nft.tokenId}</h4>
                <p className="text-sm text-muted-foreground">
                  {getCollectionName(nft.collection)}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>APY</span>
                  </div>
                  <span className="font-medium">{nft.apy}%</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    <span>Rewards</span>
                  </div>
                  <span className="font-medium">{formatRewards(nft.rewards)} APE</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Staked</span>
                  </div>
                  <span className="font-medium">{formatDate(nft.stakedAt)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    {nft.canUnstake ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                    )}
                    <span>Status</span>
                  </div>
                  <span className="font-medium">
                    {nft.canUnstake ? "Unlocked" : getTimeRemaining(nft.stakedAt, nft.lockPeriod)}
                  </span>
                </div>
                
                {!nft.canUnstake && nft.penalty > 0 && (
                  <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Early unstaking penalty: {nft.penalty}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onClaimRewards(nft.tokenId, nft.collection)}
                  disabled={parseFloat(nft.rewards) === 0}
                  className="flex-1"
                >
                  <Coins className="w-3 h-3 mr-1" />
                  Claim
                </Button>
                <Button
                  size="sm"
                  onClick={() => onUnstake(nft.tokenId, nft.collection)}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                >
                  <Unlock className="w-3 h-3 mr-1" />
                  Unstake
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
