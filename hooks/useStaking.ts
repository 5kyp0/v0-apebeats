"use client";

import { useState, useEffect } from "react";
import { contractAddresses, stakingTiers, unstakingPenalties } from "@/lib/thirdweb";
import { toast } from "sonner";

export interface StakedNFT {
  tokenId: string;
  collection: string;
  tier: keyof typeof stakingTiers;
  stakedAt: Date;
  lockPeriod: number;
  apy: number;
  rewards: string;
  canUnstake: boolean;
  penalty: number;
}

export interface PoolInfo {
  address: string;
  name: string;
  apy: number;
  tvl: string;
  stakers: number;
  creator: string;
  status: "active" | "inactive" | "paused";
  rewardToken: string;
  collection: string;
}

export function useStaking() {
  // Mock address and chainId for development
  const address = "0x1234567890123456789012345678901234567890";
  const chainId = 1; // Ethereum mainnet
  const [isLoading, setIsLoading] = useState(false);
  const [stakedNFTs, setStakedNFTs] = useState<StakedNFT[]>([]);
  const [pools, setPools] = useState<PoolInfo[]>([]);

  // Mock data for development - replace with actual contract calls when deployed
  const userStakes = null;
  const allPools = [];
  const totalTVL = "2400000"; // $2.4M in wei
  const totalStakers = 1247;

  // Mock contract functions for development
  const stakeNFT = async (tokenId: string, collection: string, tier: string, lockPeriod: number) => {
    console.log("Mock staking:", { tokenId, collection, tier, lockPeriod });
    return Promise.resolve();
  };

  const unstakeNFT = async (tokenId: string, collection: string) => {
    console.log("Mock unstaking:", { tokenId, collection });
    return Promise.resolve();
  };

  const claimRewards = async (tokenId: string, collection: string) => {
    console.log("Mock claiming rewards:", { tokenId, collection });
    return Promise.resolve();
  };

  const createPool = async (name: string, collection: string, apy: number, rewardToken: string) => {
    console.log("Mock creating pool:", { name, collection, apy, rewardToken });
    return Promise.resolve();
  };

  const refetchStakes = () => Promise.resolve();
  const refetchPools = () => Promise.resolve();

  // Load user's staked NFTs
  useEffect(() => {
    if (userStakes && address) {
      const stakes: StakedNFT[] = userStakes.map((stake: any) => ({
        tokenId: stake.tokenId.toString(),
        collection: stake.collection,
        tier: stake.tier,
        stakedAt: new Date(stake.stakedAt.toNumber() * 1000),
        lockPeriod: stake.lockPeriod.toNumber(),
        apy: stake.apy.toNumber() / 100, // Convert from basis points
        rewards: stake.rewards.toString(),
        canUnstake: stake.canUnstake,
        penalty: calculatePenalty(stake.stakedAt.toNumber(), stake.lockPeriod.toNumber()),
      }));
      setStakedNFTs(stakes);
    }
  }, [userStakes, address]);

  // Load all pools
  useEffect(() => {
    if (allPools) {
      const poolList: PoolInfo[] = allPools.map((pool: any) => ({
        address: pool.poolAddress,
        name: pool.name,
        apy: pool.apy.toNumber() / 100,
        tvl: pool.tvl.toString(),
        stakers: pool.stakers.toNumber(),
        creator: pool.creator,
        status: pool.status,
        rewardToken: pool.rewardToken,
        collection: pool.collection,
      }));
      setPools(poolList);
    }
  }, [allPools]);

  // Calculate unstaking penalty based on time staked
  const calculatePenalty = (stakedAt: number, lockPeriod: number) => {
    const now = Math.floor(Date.now() / 1000);
    const timeStaked = now - stakedAt;
    const daysStaked = timeStaked / (24 * 60 * 60);

    if (daysStaked < 7) return unstakingPenalties["7"];
    if (daysStaked < 30) return unstakingPenalties["30"];
    if (daysStaked < 90) return unstakingPenalties["90"];
    if (daysStaked < 180) return unstakingPenalties["180"];
    return 0;
  };

  // Stake an NFT
  const handleStakeNFT = async (
    tokenId: string,
    collection: string,
    tier: keyof typeof stakingTiers,
    lockPeriod: number
  ) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    try {
      const apy = stakingTiers[tier].apy[lockPeriod.toString() as keyof typeof stakingTiers[typeof tier]["apy"]] || 0;
      
      await stakeNFT(tokenId, collection, tier, lockPeriod);

      toast.success("NFT staked successfully!");
      refetchStakes();
    } catch (error: any) {
      console.error("Staking error:", error);
      toast.error(error.message || "Failed to stake NFT");
    } finally {
      setIsLoading(false);
    }
  };

  // Unstake an NFT
  const handleUnstakeNFT = async (tokenId: string, collection: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    try {
      await unstakeNFT(tokenId, collection);

      toast.success("NFT unstaked successfully!");
      refetchStakes();
    } catch (error: any) {
      console.error("Unstaking error:", error);
      toast.error(error.message || "Failed to unstake NFT");
    } finally {
      setIsLoading(false);
    }
  };

  // Claim rewards
  const handleClaimRewards = async (tokenId: string, collection: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    try {
      await claimRewards(tokenId, collection);

      toast.success("Rewards claimed successfully!");
      refetchStakes();
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(error.message || "Failed to claim rewards");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new pool
  const handleCreatePool = async (
    name: string,
    collection: string,
    apy: number,
    rewardToken: string
  ) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    try {
      await createPool(name, collection, apy, rewardToken);

      toast.success("Pool created successfully!");
      refetchPools();
    } catch (error: any) {
      console.error("Pool creation error:", error);
      toast.error(error.message || "Failed to create pool");
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's NFTs for a specific collection
  const getUserNFTs = async (collection: string) => {
    // This would typically use the ThirdWeb SDK to fetch NFTs
    // For now, return mock data
    return [];
  };

  return {
    // State
    isLoading,
    stakedNFTs,
    pools,
    totalTVL,
    totalStakers,
    
    // Actions
    stakeNFT: handleStakeNFT,
    unstakeNFT: handleUnstakeNFT,
    claimRewards: handleClaimRewards,
    createPool: handleCreatePool,
    getUserNFTs,
    
    // Utils
    calculatePenalty,
    refetchStakes,
    refetchPools,
  };
}
