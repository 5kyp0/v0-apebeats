"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Clock, 
  TrendingUp, 
  Coins,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";
import { stakingTiers } from "@/lib/thirdweb";

interface NFT {
  tokenId: string;
  name: string;
  image: string;
  collection: string;
  collectionName: string;
  tier: keyof typeof stakingTiers;
  isStaked: boolean;
}

interface NFTGridProps {
  collection: string;
  onStake: (tokenId: string, collection: string, tier: keyof typeof stakingTiers, lockPeriod: number) => void;
  isLoading?: boolean;
}

export function NFTGrid({ collection, onStake, isLoading = false }: NFTGridProps) {
  // Mock address for development
  const address = "0x1234567890123456789012345678901234567890";
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set());
  const [selectedTier, setSelectedTier] = useState<keyof typeof stakingTiers>("standard");
  const [selectedLockPeriod, setSelectedLockPeriod] = useState<number>(90);

  // Mock NFT data - in real implementation, this would fetch from the blockchain
  useEffect(() => {
    if (address && collection) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockNFTs: NFT[] = [
          {
            tokenId: "1",
            name: `#${Math.floor(Math.random() * 10000)}`,
            image: "/placeholder.jpg",
            collection,
            collectionName: getCollectionName(collection),
            tier: getTierForCollection(collection),
            isStaked: false,
          },
          {
            tokenId: "2", 
            name: `#${Math.floor(Math.random() * 10000)}`,
            image: "/placeholder.jpg",
            collection,
            collectionName: getCollectionName(collection),
            tier: getTierForCollection(collection),
            isStaked: false,
          },
          {
            tokenId: "3",
            name: `#${Math.floor(Math.random() * 10000)}`,
            image: "/placeholder.jpg", 
            collection,
            collectionName: getCollectionName(collection),
            tier: getTierForCollection(collection),
            isStaked: false,
          },
        ];
        setNfts(mockNFTs);
        setLoading(false);
      }, 1000);
    }
  }, [address, collection]);

  const getCollectionName = (collection: string) => {
    switch (collection) {
      case "bayc": return "Bored Ape Yacht Club";
      case "mayc": return "Mutant Ape Yacht Club";
      case "apebeats": return "ApeBeats";
      default: return "Unknown Collection";
    }
  };

  const getTierForCollection = (collection: string): keyof typeof stakingTiers => {
    switch (collection) {
      case "bayc":
      case "mayc":
        return "standard";
      case "apebeats":
        return "premium";
      default:
        return "partner";
    }
  };

  const handleNFTSelect = (tokenId: string) => {
    const newSelected = new Set(selectedNFTs);
    if (newSelected.has(tokenId)) {
      newSelected.delete(tokenId);
    } else {
      newSelected.add(tokenId);
    }
    setSelectedNFTs(newSelected);
  };

  const handleStakeSelected = () => {
    selectedNFTs.forEach(tokenId => {
      onStake(tokenId, collection, selectedTier, selectedLockPeriod);
    });
    setSelectedNFTs(new Set());
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

  if (!address) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to view your NFTs
        </p>
      </div>
    );
  }

  if (loading || isLoading) {
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

  return (
    <div className="space-y-6">
      {/* Staking Controls */}
      {nfts.length > 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="space-y-2">
                <h3 className="font-medium">Staking Options</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedNFTs.size} NFT{selectedNFTs.size !== 1 ? 's' : ''} selected
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Tier:</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as keyof typeof stakingTiers)}
                    className="px-3 py-1 border border-border rounded bg-background text-sm"
                  >
                    {Object.entries(stakingTiers).map(([key, tier]) => (
                      <option key={key} value={key}>
                        {tier.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Lock Period:</label>
                  <select
                    value={selectedLockPeriod}
                    onChange={(e) => setSelectedLockPeriod(Number(e.target.value))}
                    className="px-3 py-1 border border-border rounded bg-background text-sm"
                  >
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                  </select>
                </div>
                
                <Button
                  onClick={handleStakeSelected}
                  disabled={selectedNFTs.size === 0 || isLoading}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Stake Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NFT Grid */}
      {nfts.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No NFTs Found</h3>
          <p className="text-muted-foreground">
            You don't have any NFTs in this collection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <Card
              key={nft.tokenId}
              className={`border-2 border-dashed border-muted-foreground/30 cursor-pointer transition-all hover:scale-105 ${
                selectedNFTs.has(nft.tokenId) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleNFTSelect(nft.tokenId)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-4 relative overflow-hidden">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.jpg";
                    }}
                  />
                  {selectedNFTs.has(nft.tokenId) && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-bold">
                          {Array.from(selectedNFTs).indexOf(nft.tokenId) + 1}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{nft.name}</h4>
                    <Badge className={getTierColor(nft.tier)}>
                      {stakingTiers[nft.tier].name}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {nft.collectionName}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>
                        {typeof stakingTiers[nft.tier].apy === "object" 
                          ? `${stakingTiers[nft.tier].apy[selectedLockPeriod.toString() as keyof typeof stakingTiers[typeof nft.tier]["apy"]]}% APY`
                          : "Variable APY"
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{selectedLockPeriod}d</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
