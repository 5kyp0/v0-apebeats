# Staking Environment Variables Setup

## Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# ThirdWeb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-thirdweb-client-id

# ApeChain Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-api-key
NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139

# Contract Addresses
NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_APEBEATS_CONTRACT_ADDRESS=0x...

# Staking Configuration (Optional - for future deployment)
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_POOL_FACTORY_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NFT_SHADOW_CONTRACT_ADDRESS=0x...
```

## Getting Started

1. **ThirdWeb Client ID**: Get from [ThirdWeb Dashboard](https://thirdweb.com/dashboard)
2. **Alchemy API Key**: Get from [Alchemy Dashboard](https://dashboard.alchemy.com)
3. **Contract Addresses**: These will be provided when contracts are deployed

## Current Status

The staking functionality is currently implemented with mock data for development and testing. To connect to real contracts:

1. Deploy the staking contracts
2. Update the contract addresses in the environment variables
3. Update the `useStaking` hook to use real contract calls instead of mock functions

## Features Implemented

✅ **Staking Dashboard** - Complete UI with tabs for staking, pools, and pool creation
✅ **NFT Grid** - Display and select NFTs for staking
✅ **Staked NFTs** - View and manage staked NFTs
✅ **Pool Creator** - Create new reward pools
✅ **Tier System** - Different staking tiers with varying APY rates
✅ **Fee Structure** - Configurable fee distribution
✅ **Penalty System** - Early unstaking penalties
✅ **Responsive Design** - Works on all device sizes
✅ **Theme Integration** - Matches ApeBeats design system

## Next Steps

1. Deploy smart contracts for staking functionality
2. Update environment variables with real contract addresses
3. Replace mock functions with real contract interactions
4. Test with real NFTs and transactions
5. Deploy to production
