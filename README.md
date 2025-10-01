# 🎵 ApeBeats — Sonic Swamp Hub

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/yancastet-9701s-projects/v0-ape-beat-landing-page)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/XGCNimLcz9k)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-70%25-brightgreen?style=for-the-badge)](https://github.com/your-username/apebeats)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

> **Enter the Sonic Swamp Hub** — Where 24/7 lo-fi hip-hop beats are generated from live ApeChain data, creating unique musical moments as NFTs in the BAYC ecosystem.

## 🌟 What is ApeBeats?

**ApeBeats** is a revolutionary Web3 application that combines generative music, blockchain technology, and NFT creation. It generates continuous lo-fi hip-hop music from live ApeChain blockchain data and allows users to capture unique musical moments as NFTs.

### 🎯 Key Features

- 🎶 **24/7 Generative Music**: Continuous lo-fi hip-hop generation from live blockchain data
- 🎨 **Two NFT Collections**: Genesis ApeBeats (420 limited) + ApeChain Live Beats (unlimited)
- 💰 **Batch Transfer System**: Efficient APE token distribution with up to 70% gas savings
- 🏆 **ApeStake Integration**: Multi-tier NFT staking with 5-15% APY rewards
- 🔧 **Smart Wallet Support**: ERC-4337 smart wallets with social login
- 🌐 **Multi-chain Ready**: Support for 6 major blockchain networks
- 🧪 **Production Ready**: 70% test coverage with comprehensive error handling

## Collections Overview

### Genesis ApeBeats Collection (420 NFTs)
- **Source**: 4 layers of 10-second loops crafted in Ableton Live
- **Type**: Hand-crafted, original compositions
- **Supply**: Limited edition of 420 NFTs
- **Features**: Procedurally generated audio-visual combinations from original Ableton loops

### ApeChain Live Beats Collection
- **Source**: Real-time blockchain data from ApeChain network
- **Type**: Generative music created from live blockchain activity
- **Features**: 24/7 streaming engine that generates music from transaction data, gas prices, and network activity

## Tech

- Next.js 14.2.16 App Router
- TypeScript
- TailwindCSS
- thirdweb v5 SDK
- React Query
- **NEW**: Jest + React Testing Library
- **NEW**: Error Boundaries & Loading States
- **NEW**: Video Processing & Preview Generation
- **NEW**: Performance Optimizations
- **NEW**: Generative Music Engine (Web Audio API)
- **NEW**: LoFi Hip Hop Generator with blockchain data
- **NEW**: Multi-chain Token Holder Snapshot Tool
- **NEW**: Real-time Streaming Engine
- **NEW**: NFT Creation & Video Visualization
- **NEW**: Batch Transfer System with CSV upload and multiple transfer modes
- **NEW**: ApeStake Integration with multi-tier staking system
- **NEW**: Professional staking dashboard with NFT grid and pool creation
- **NEW**: Multi-tier staking (Partner, Standard, Premium, OSS) with different APY rates
- **NEW**: Social Media Previews with Open Graph and Twitter Card meta tags

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Version 18 or higher
- **Package Manager**: pnpm (recommended) or npm
- **Thirdweb Account**: Create at [thirdweb.com](https://thirdweb.com) for client ID
- **Alchemy Account**: Create at [alchemy.com](https://alchemy.com) for ApeChain RPC access

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/your-username/apebeats.git
cd apebeats

# Install dependencies
pnpm install
```

### 2. Environment Setup
Create a `.env.local` file in the project root:
```bash
# Required - Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# Required - ApeChain RPC Access
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139

# Optional - Batch Transfer Contract
NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=0x...

# Optional - Staking Contracts
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_POOL_FACTORY_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NFT_SHADOW_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_APEBEATS_CONTRACT_ADDRESS=0x...
```

### 3. Get API Keys

#### Thirdweb Client ID
1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Navigate to Settings → API Keys
3. Create a new "Client ID" (not secret key)
4. Copy the client ID to your `.env.local`

#### Alchemy API Key
1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com)
2. Create a new app
3. Select "ApeChain" network
4. Copy the API key from app details
5. Add to your `.env.local`

### 4. Start Development
```bash
# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

### 5. Build & Test
```bash
# Run tests
pnpm test                    # Run all tests
pnpm test:coverage          # Run with coverage report
pnpm test:watch             # Watch mode for development

# Build for production
pnpm build && pnpm start
```

### 6. Explore Features
- 🏠 **Homepage**: View Genesis collection previews and live ApeChain data
- 🎵 **Music Engine**: Try the generative music at `/music`
- 💰 **Batch Transfers**: Efficient token distribution at `/transfers`
- 🏆 **Staking**: NFT staking interface at `/stake`
- 📊 **Dashboard**: User analytics at `/dashboard`
- 📸 **Snapshot Tool**: Token holder snapshots at `/snapshot`

### 7. Test Social Media Previews
```bash
# Test social media previews
pnpm run test:social

# Open manual testing interface
open public/social-preview-test.html
```

## Environment Variables
Create a `.env.local` at the repo root with:
```bash
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139
NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=0x... # Optional: Batch transfer contract address
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x... # Optional: Staking contract address
NEXT_PUBLIC_POOL_FACTORY_CONTRACT_ADDRESS=0x... # Optional: Pool factory contract address
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS=0x... # Optional: Governance contract address
NEXT_PUBLIC_NFT_SHADOW_CONTRACT_ADDRESS=0x... # Optional: NFT shadow contract address
NEXT_PUBLIC_APEBEATS_CONTRACT_ADDRESS=0x... # Optional: ApeBeats contract address
```

### Required Environment Variables

#### NEXT_PUBLIC_THIRDWEB_CLIENT_ID
- **What**: Public client id for Thirdweb client
- **Where to get**:
  1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard) → Settings → API Keys
  2. Create a "Client ID" (not secret key) and copy its value
- **Used in**: `lib/thirdweb.ts` to initialize `createThirdwebClient`
- **Example**: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID=abc123def456...`

#### NEXT_PUBLIC_ALCHEMY_API_KEY
- **What**: Alchemy API key for ApeChain RPC access
- **Where to get**:
  1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com)
  2. Create a new app → Select "ApeChain" network
  3. Copy the API key from the app details
- **Used in**: Construct ApeChain RPC URL: `https://apechain-mainnet.g.alchemy.com/v2/{API_KEY}`
- **Example**: `NEXT_PUBLIC_ALCHEMY_API_KEY=alcht_abc123...`

#### NEXT_PUBLIC_APECHAIN_CHAIN_ID
- **What**: ApeChain mainnet chain ID
- **Value**: `33139` (ApeChain mainnet)
- **Used in**: `lib/thirdweb.ts` with `defineChain`
- **Example**: `NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139`

#### NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS
- **What**: Batch transfer smart contract address on ApeChain
- **Where to get**: Deploy the batch transfer contract to ApeChain
- **Used in**: `lib/thirdweb.ts` and `lib/batchTransferService.ts` for batch transfers
- **Example**: `NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=0x1234567890abcdef...`
- **Note**: Optional - batch transfer features will show configuration error if not set

#### NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS
- **What**: Main staking smart contract address on ApeChain
- **Where to get**: Deploy the staking contract to ApeChain
- **Used in**: `lib/thirdweb.ts` and staking components for staking operations
- **Example**: `NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x1234567890abcdef...`
- **Note**: Optional - staking features will show configuration error if not set

#### NEXT_PUBLIC_POOL_FACTORY_CONTRACT_ADDRESS
- **What**: Pool factory smart contract address on ApeChain
- **Where to get**: Deploy the pool factory contract to ApeChain
- **Used in**: `lib/thirdweb.ts` and staking components for pool creation
- **Example**: `NEXT_PUBLIC_POOL_FACTORY_CONTRACT_ADDRESS=0x1234567890abcdef...`
- **Note**: Optional - pool creation features will show configuration error if not set

#### NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS
- **What**: Governance smart contract address on ApeChain
- **Where to get**: Deploy the governance contract to ApeChain
- **Used in**: `lib/thirdweb.ts` and staking components for governance participation
- **Example**: `NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS=0x1234567890abcdef...`
- **Note**: Optional - governance features will show configuration error if not set

#### NEXT_PUBLIC_NFT_SHADOW_CONTRACT_ADDRESS
- **What**: NFT shadow smart contract address on ApeChain
- **Where to get**: Deploy the NFT shadow contract to ApeChain
- **Used in**: `lib/thirdweb.ts` and staking components for NFT staking
- **Example**: `NEXT_PUBLIC_NFT_SHADOW_CONTRACT_ADDRESS=0x1234567890abcdef...`
- **Note**: Optional - NFT staking features will show configuration error if not set

#### NEXT_PUBLIC_APEBEATS_CONTRACT_ADDRESS
- **What**: ApeBeats NFT collection contract address on ApeChain
- **Where to get**: Deploy the ApeBeats NFT contract to ApeChain
- **Used in**: `lib/thirdweb.ts` and staking components for ApeBeats NFT staking
- **Example**: `NEXT_PUBLIC_APEBEATS_CONTRACT_ADDRESS=0x1234567890abcdef...`
- **Note**: Optional - ApeBeats NFT staking features will show configuration error if not set

> **Tip**: If you fork this repo, generate your own Thirdweb Client ID and Alchemy key.

## Network Setup

This application is configured to use **ApeChain** as the default network. The app will automatically prompt users to switch to ApeChain if they're connected to a different network.

### Network Features
- 🔄 **Automatic Network Detection**: Detects when users are on the wrong network
- 🚀 **One-Click Network Switching**: Users can switch to ApeChain with a single click
- 📱 **Network Status Indicators**: Real-time network status updates
- ✅ **Supported Wallets**: MetaMask, Rabby, Rainbow, WalletConnect, Glyph, and in-app wallets

### ApeChain Configuration
```typescript
// Chain ID: 33139 (ApeChain Mainnet)
// RPC URL: https://apechain-mainnet.g.alchemy.com/v2/{API_KEY}
// Native Currency: APE (18 decimals)
// Block Explorer: https://explorer.apechain.com
```

See `NETWORK_SETUP.md` for detailed network configuration and troubleshooting.

## 🎯 Features Overview

### 🎶 **Generative Music Engine**
The heart of ApeBeats is its advanced music generation system that creates lo-fi hip-hop from live blockchain data.

#### How It Works
- **Real-time Data Collection**: Continuously monitors ApeChain for:
  - Block numbers and timing
  - Gas prices and network congestion
  - Transaction volumes and activity
  - APE token price movements
- **Music Generation**: Converts blockchain data into musical parameters:
  - Tempo based on transaction frequency
  - Melody from gas price fluctuations
  - Rhythm from block timing
  - Harmony from network activity
- **24/7 Streaming**: Continuous music generation with real-time updates
- **Video Visualization**: Synchronized visual elements that respond to music

#### Try It Out
1. Navigate to `/music` in the application
2. Click "Start Streaming" to begin music generation
3. Watch as live ApeChain data creates unique beats
4. Capture moments as NFTs with the snapshot tool

### 📸 **Token Holder Snapshot Tool**
Professional-grade utility for capturing token holders across multiple blockchain networks.

#### Features
- **Multi-chain Support**: Works with Ethereum, Polygon, Arbitrum, Optimism, Base, and ApeChain
- **Token Standard Detection**: Automatically detects ERC-721 and ERC-1155 tokens
- **Batch Processing**: Efficiently processes large token collections
- **Real-time Progress**: Live progress tracking with detailed logging
- **Export Functionality**: Export results in JSON and CSV formats
- **Copy to Clipboard**: Quick copy of holder addresses
- **Vercel Optimized**: Designed for serverless deployment with timeout protection

#### How to Use
1. Navigate to `/snapshot` or use the menu
2. Configure network and add API key
3. Add contract addresses (one per line)
4. Choose token standard or auto-detect
5. Start snapshot and monitor progress
6. Export results in JSON or CSV format

#### Export Formats
**JSON Export** includes comprehensive metadata:
```json
{
  "metadata": {
    "tool": "ApeBeats Snapshot Tool",
    "version": "1.0.0",
    "exportTimestamp": "2024-01-15T21:31:46.000Z",
    "totalHolders": 45,
    "network": "apechain-mainnet",
    "chainId": 33139
  },
  "contracts": [...],
  "holders": [...],
  "summary": {...}
}
```

**CSV Export** for spreadsheet compatibility:
```csv
"Address","Network","ChainId","SnapshotDate"
"0x8544a547366eBfA8711ccF60667Cbf7c8b0943f1","apechain-mainnet",33139,"2024-01-15T21:31:46.000Z"
```

### 🎨 **NFT Collections**

#### Genesis ApeBeats Collection (420 NFTs)
- **Hand-crafted Originals**: Created from 4 layers of 10-second Ableton Live loops
- **Limited Supply**: Only 420 NFTs will ever exist
- **Premium Features**: 
  - 4.2% royalty shares on all collections
  - Monthly free mint credits (10 seconds/month)
  - Founding Voyager status
  - Exclusive community access
- **Price**: 6.9 APE per NFT
- **Status**: Coming Soon

#### ApeChain Live Beats Collection
- **Unlimited Supply**: Generate as many as you want
- **Real-time Generation**: Created from live blockchain data
- **Flexible Duration**: Capture 5-60 second musical moments
- **Dynamic Pricing**: 0.5 APE per second of music
- **Onchain Generation**: 100% verifiable and immutable
- **Status**: Available after Genesis launch

### 💰 **Batch Transfer System**
Efficiently distribute APE tokens to multiple recipients with significant gas savings.

#### Transfer Modes
1. **Equal Amounts**: Perfect for airdrops and equal distribution
2. **Custom Amounts**: Ideal for rewards, payments, and custom distributions  
3. **Random Amounts**: Great for gamification and surprise distributions

#### Features
- **CSV Upload**: Bulk recipient management via CSV files
- **Real-time Validation**: Live balance checking and gas estimation
- **Gas Optimization**: Up to 70% savings compared to individual transfers
- **Transaction Tracking**: Complete history and status monitoring
- **Error Handling**: Comprehensive validation and user-friendly messages

#### Getting Started
1. Navigate to `/transfers`
2. Choose your transfer mode
3. Add recipients manually or upload CSV
4. Review estimates and execute transfer
5. Monitor progress in the dashboard

### 🏆 **ApeStake Integration**
Multi-tier NFT staking system with different APY rates and features.

#### Staking Tiers
1. **Partner Tier (5-8% APY)**
   - For vetted community collections
   - Standard rewards and community support
   - Basic dashboard access

2. **Standard Tier (8-12% APY)**
   - For BAYC, MAYC, Otherdeed holders
   - DAO-approved collections
   - Priority support and enhanced dashboard
   - Governance participation

3. **Premium Tier (12-15% APY)**
   - For ApeBeats Genesis & Live holders
   - Vibe Tokens rewards
   - Audio remix privileges
   - Exclusive ApeBeats perks
   - VIP community access
   - Enhanced royalty pool (4.2%)

4. **OSS Tier (Variable APY)**
   - For community-deployed pools
   - User-set APY rates
   - Custom reward tokens
   - Permissionless deployment
   - Governance tokens
   - Open-source bounties

#### Features
- **NFT Grid Interface**: Display and manage your NFT collection
- **Pool Creation**: Create custom staking pools with user-defined parameters
- **Reward System**: Transparent distribution with penalty calculations
- **Governance Integration**: Participate in DAO decisions as a staker
- **Fee Structure**: Transparent fees (10% treasury, 5% ApeBeats, 85% stakers)
- **Early Unstaking Penalties**: 7-180 day penalty system

#### Getting Started
1. Navigate to `/stake`
2. Connect your wallet with NFTs
3. View your available NFTs in the grid
4. Choose appropriate staking tier
5. Stake your NFTs and start earning rewards
6. Monitor performance in the dashboard

### Core Features
- Thirdweb provider in `app/layout.tsx` using `thirdwebClient`
- Chain config in `lib/thirdweb.ts` via `defineChain`
- Preferred wallets list in `lib/thirdweb.ts` (Glyph, Rabby, MetaMask, Rainbow; WalletConnect and in-app wallet)
- Login UI at `app/login/page.tsx`:
  - Email code flow using `preAuthenticate` and `inAppWallet`
  - Connect buttons: Glyph, Rabby, MetaMask, Rainbow, WalletConnect
  - Smart wallet deployment on first connect via `deploySmartAccount`
- Header short connect/disconnect in `components/HeaderUser.tsx`
- Live ApeChain data in `app/page.tsx` powered by `fetchApeChainStats` from `lib/utils.ts`

### **NEW**: Enhanced Features (v0.4.7)
- **Enhanced Wallet Integration**: Improved Glyph wallet connection with browser detection and popup guidance
- **Browser Detection**: Intelligent browser detection with popup blocking resolution
- **Popup Guidance System**: Browser-specific popup guidance modal with step-by-step instructions
- **Enhanced Authentication**: Improved login flows and user experience across all authentication methods
- **New UI Components**: Alert components and enhanced user interface elements
- **Improved Wallet Service**: Enhanced wallet connection handling with better error recovery

### **NEW**: Enhanced Features (Previous)
- **Error Handling**: Comprehensive error boundaries in `components/ErrorBoundary.tsx`
- **Loading States**: Optimized loading components in `components/LoadingStates.tsx`
- **Video Processing**: Genesis NFT video preview generation in `lib/videoUtils.ts` and `lib/useVideoPreviews.ts`
- **Performance**: Lazy loading, optimized animations, and reduced bundle size
- **Testing**: Complete test suite with unit, integration, and E2E tests
- **Network Switching**: Dynamic network detection and switching in `components/NetworkSwitcher.tsx`

### **NEW**: Music Engine Features
- **Generative Music Engine**: Complete music generation system in `lib/music-engine/`
- **LoFi Hip Hop Generator**: Specialized LoFi music generation from blockchain data
- **24/7 Streaming**: Continuous music streaming with real-time blockchain data updates
- **NFT Creation**: Automatic NFT snapshot creation for generated music pieces
- **Video Visualization**: Real-time video visualization synchronized with music
- **Multi-chain Support**: Support for Ethereum, Polygon, Arbitrum, Optimism, Base, and ApeChain
- **Token Holder Snapshot Tool**: Professional-grade tool for capturing token holders across chains
- **Batch Transfer System**: Efficient APE token distribution with CSV upload and multiple transfer modes

## Batch Transfer System

### How Batch Transfers Work

The batch transfer system allows you to efficiently send APE tokens to multiple addresses in a single transaction, saving up to 70% on gas fees compared to individual transfers.

#### Transfer Modes

1. **Equal Amounts Mode**
   - Send the same amount of APE tokens to all recipients
   - Perfect for airdrops and equal distribution
   - Specify one amount, applied to all addresses

2. **Custom Amounts Mode**
   - Specify individual amounts for each recipient
   - Ideal for rewards, payments, or custom distributions
   - Add recipients manually or via CSV upload

3. **Random Amounts Mode**
   - Generate random amounts within a specified range
   - Great for gamification and surprise distributions
   - Set minimum and maximum amounts, system generates random values

#### CSV Upload Format

Upload recipients in CSV format:
```csv
0x1234567890abcdef1234567890abcdef12345678,1.5
0xabcdef1234567890abcdef1234567890abcdef12,2.0
0x9876543210fedcba9876543210fedcba98765432,0.5
```

#### Features

- **Real-time Balance Checking**: See your APE balance and estimated costs
- **Gas Estimation**: Preview gas costs before executing
- **Transaction Tracking**: Monitor transaction status and history
- **Error Handling**: Comprehensive validation and error messages
- **Mobile Responsive**: Works on all devices

#### Getting Started

1. **Connect Your Wallet**: Use any supported wallet (MetaMask, Rabby, etc.)
2. **Navigate to Batch Transfer**: Go to `/transfers` or use the menu
3. **Choose Transfer Mode**: Select equal, custom, or random amounts
4. **Add Recipients**: Upload CSV or add addresses manually
5. **Review & Execute**: Check estimates and execute the batch transfer

#### Dashboard Analytics

Access your dashboard at `/dashboard` to:
- View your APE balance
- Track transfer history
- Monitor transaction status
- Access quick actions

## ApeStake Integration System

### How Staking Works

The ApeStake integration system allows you to stake your NFTs and earn rewards through a multi-tier staking system. The system supports different NFT collections with varying APY rates and features.

#### Staking Tiers

1. **Partner Tier (5-8% APY)**
   - For vetted community collections
   - Standard rewards and community support
   - Basic dashboard access

2. **Standard Tier (8-12% APY)**
   - For BAYC, MAYC, Otherdeed holders
   - DAO-approved collections
   - Priority support and enhanced dashboard
   - Governance participation

3. **Premium Tier (12-15% APY)**
   - For ApeBeats Genesis & Live holders
   - Vibe Tokens rewards
   - Audio remix privileges
   - Exclusive ApeBeats perks
   - VIP community access
   - Enhanced royalty pool (4.2%)

4. **OSS Tier (Variable APY)**
   - For community-deployed pools
   - User-set APY rates
   - Custom reward tokens
   - Permissionless deployment
   - Governance tokens
   - Open-source bounties

#### Features

- **NFT Grid**: Display and manage your NFT collection for staking
- **Staked NFTs**: View and manage your currently staked NFTs
- **Pool Creation**: Create custom staking pools with user-defined parameters
- **Reward System**: Transparent reward distribution with penalty calculations
- **Governance Integration**: Participate in governance decisions as a staker
- **Fee Structure**: Transparent fee structure (10% treasury, 5% ApeBeats, 85% stakers)
- **Early Unstaking Penalties**: 7-180 day penalty system for early unstaking

#### Getting Started with Staking

1. **Connect Your Wallet**: Use any supported wallet (MetaMask, Rabby, etc.)
2. **Navigate to Staking**: Go to `/stake` or use the menu
3. **View Your NFTs**: See your available NFTs in the NFT grid
4. **Choose Staking Tier**: Select the appropriate tier for your NFTs
5. **Stake Your NFTs**: Click to stake your NFTs and start earning rewards
6. **Monitor Rewards**: Track your staking rewards and performance
7. **Unstake When Ready**: Unstake your NFTs (with penalties for early unstaking)

#### Staking Dashboard

Access your staking dashboard at `/stake` to:
- View your NFT collection
- See currently staked NFTs
- Monitor staking rewards
- Create custom staking pools
- Participate in governance
- Track staking performance

## 👥 User Guide

### 🔐 **Wallet Connection**

ApeBeats supports multiple wallet connection methods for maximum accessibility:

#### Social Login (Email)
1. Click "Connect Wallet" in the header
2. Select "Email" option
3. Enter your email address
4. Check your email for verification code
5. Enter the code to complete connection
6. Your smart wallet will be automatically deployed on first use

#### Browser Wallets
Connect using your preferred browser wallet:
- **MetaMask**: Most popular Ethereum wallet
- **Rabby**: Advanced DeFi wallet with gas optimization
- **Rainbow**: Beautiful, user-friendly wallet
- **Glyph**: Secure, non-custodial wallet with enhanced integration

#### Enhanced Wallet Features (v0.4.7)
- **🦁 Browser Detection**: Intelligent detection of Chrome, Brave, Firefox, Safari, and Edge
- **🚫 Popup Guidance**: Smart popup blocking detection with browser-specific resolution instructions
- **🛡️ Error Handling**: Enhanced error handling and user feedback for wallet connection issues
- **🔄 Safe Rendering**: Client-side rendering protection for wallet components
- **📱 Mobile Support**: Enhanced mobile browser compatibility

#### Mobile Wallets
- **WalletConnect**: Connect any mobile wallet (Coinbase, Trust, etc.)
- **In-app Wallet**: Use the built-in wallet for seamless experience

#### Smart Wallet Features
- **ERC-4337 Compatible**: Modern smart wallet standard
- **Gasless Transactions**: Some operations don't require gas
- **Social Recovery**: Recover access using social connections
- **Batch Transactions**: Multiple operations in single transaction

### 🎵 **Using the Music Engine**

#### Getting Started
1. **Navigate to Music**: Go to `/music` or click "Try the Music Engine"
2. **Connect Wallet**: Ensure your wallet is connected
3. **Start Streaming**: Click "Start Streaming" to begin music generation
4. **Watch Live Data**: See real-time ApeChain data influence the music
5. **Capture Moments**: Use the snapshot tool to create NFTs

#### Understanding the Interface
- **Live Data Display**: Shows current block, gas price, and network activity
- **Music Controls**: Play/pause, volume, and streaming controls
- **Visualizer**: Real-time visualization synchronized with music
- **Snapshot Tool**: Capture unique moments as NFTs

#### Creating Music NFTs
1. **Start Streaming**: Begin music generation
2. **Wait for Unique Moment**: Let the music evolve with blockchain data
3. **Click Snapshot**: Capture the current musical moment
4. **Set Duration**: Choose 5-60 seconds for your NFT
5. **Review & Mint**: Preview and mint your unique music NFT
6. **Pay with APE**: Cost is 0.5 APE per second

### 💰 **Batch Transfer Guide**

#### When to Use Batch Transfers
- **Airdrops**: Distribute tokens to community members
- **Rewards**: Pay multiple users for participation
- **Payments**: Send different amounts to various recipients
- **Gamification**: Random distributions for contests

#### Step-by-Step Process
1. **Navigate to Transfers**: Go to `/transfers`
2. **Choose Mode**: Select equal, custom, or random amounts
3. **Add Recipients**:
   - **Manual**: Add addresses one by one
   - **CSV Upload**: Upload a CSV file with addresses and amounts
4. **Review Estimates**: Check gas costs and total amounts
5. **Execute Transfer**: Confirm and send the batch transaction
6. **Monitor Progress**: Track status in the dashboard

#### CSV Format
```csv
0x1234567890abcdef1234567890abcdef12345678,1.5
0xabcdef1234567890abcdef1234567890abcdef12,2.0
0x9876543210fedcba9876543210fedcba98765432,0.5
```

### 🏆 **Staking Guide**

#### Understanding Staking Tiers
Choose the right tier based on your NFT collection:

- **Partner Tier**: For community collections (5-8% APY)
- **Standard Tier**: For BAYC, MAYC, Otherdeed (8-12% APY)
- **Premium Tier**: For ApeBeats NFTs (12-15% APY)
- **OSS Tier**: For custom pools (Variable APY)

#### Staking Process
1. **Navigate to Staking**: Go to `/stake`
2. **Connect Wallet**: Ensure your wallet with NFTs is connected
3. **View NFT Grid**: See all your available NFTs
4. **Select NFTs**: Choose which NFTs to stake
5. **Choose Tier**: Select appropriate staking tier
6. **Stake NFTs**: Confirm and stake your NFTs
7. **Monitor Rewards**: Track earnings in the dashboard

#### Unstaking Process
1. **Go to Staked NFTs**: View your currently staked NFTs
2. **Select NFTs**: Choose which NFTs to unstake
3. **Check Penalties**: Review any early unstaking penalties
4. **Confirm Unstaking**: Complete the unstaking process
5. **Receive Rewards**: Get your earned rewards

### 📸 **Token Holder Snapshot Tool**

The Token Holder Snapshot Tool is a professional-grade utility for capturing token holders across multiple blockchain networks. It's perfect for airdrops, community analysis, and token distribution planning.

#### Features
- **Multi-chain Support**: Works with Ethereum, Polygon, Arbitrum, Optimism, Base, and ApeChain
- **Token Standard Detection**: Automatically detects ERC-721 and ERC-1155 tokens
- **Batch Processing**: Efficiently processes large token collections
- **Real-time Progress**: Live progress tracking with detailed logging
- **Export Functionality**: Export results in JSON and CSV formats
- **Copy to Clipboard**: Quick copy of holder addresses
- **Vercel Optimized**: Designed for serverless deployment with timeout protection

#### How to Use
1. **Navigate to Snapshot Tool**: Go to `/snapshot` or use the menu
2. **Configure Network**: Select your target blockchain network
3. **Add API Key**: Enter your Alchemy API key for RPC access
4. **Add Contracts**: Enter contract addresses (one per line)
5. **Choose Token Standard**: Select ERC-721, ERC-1155, or auto-detect
6. **Start Snapshot**: Click "Start Snapshot" to begin processing
7. **Monitor Progress**: Watch real-time progress and detailed logs
8. **Export Results**: Download results in JSON or CSV format

#### Supported Networks
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon Mainnet** (Chain ID: 137)
- **Arbitrum One** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **Base** (Chain ID: 8453)
- **ApeChain** (Chain ID: 33139)

#### Export Formats

**JSON Export** includes comprehensive metadata:
```json
{
  "metadata": {
    "tool": "ApeBeats Snapshot Tool",
    "version": "1.0.0",
    "exportTimestamp": "2024-01-15T21:31:46.000Z",
    "totalHolders": 45,
    "network": "apechain-mainnet",
    "chainId": 33139
  },
  "contracts": [
    {
      "address": "0x6d45bf0a7c9a3747f3d2e1c278ab81db89069837",
      "standard": "erc721",
      "holdersFound": 45
    }
  ],
  "holders": [
    "0x8544a547366eBfA8711ccF60667Cbf7c8b0943f1",
    "0xb33D2474B0Dc85c33c13E49Fe49a34F2dF9e22a8"
  ],
  "summary": {
    "totalUniqueHolders": 45,
    "contractsScanned": 1,
    "network": "apechain-mainnet",
    "chainId": 33139,
    "snapshotTimestamp": "2024-01-15T21:31:46.000Z"
  }
}
```

**CSV Export** for spreadsheet compatibility:
```csv
"Address","Network","ChainId","SnapshotDate"
"0x8544a547366eBfA8711ccF60667Cbf7c8b0943f1","apechain-mainnet",33139,"2024-01-15T21:31:46.000Z"
"0xb33D2474B0Dc85c33c13E49Fe49a34F2dF9e22a8","apechain-mainnet",33139,"2024-01-15T21:31:46.000Z"
```

#### Use Cases
- **Airdrops**: Get holder lists for token distribution
- **Community Analysis**: Analyze token holder distribution
- **Reward Distribution**: Identify eligible holders for rewards
- **Governance**: Get voter lists for governance proposals
- **Analytics**: Study token holder patterns and trends

#### Technical Details
- **Timeout Protection**: 8-second timeout for Vercel compatibility
- **Sequential Processing**: Processes contracts one at a time for reliability
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Progress Tracking**: Real-time progress updates with detailed logging
- **Memory Efficient**: Optimized for large token collections
- **Rate Limiting**: Built-in rate limiting to respect RPC limits

### 📊 **Dashboard Features**

#### Overview
- **Balance Display**: See your APE token balance
- **Transaction History**: View all your transactions
- **Staking Performance**: Track staking rewards and performance
- **Music Activity**: See your music generation history
- **Quick Actions**: Fast access to common operations

#### Analytics
- **Gas Savings**: See how much you've saved with batch transfers
- **Staking Rewards**: Track your staking earnings over time
- **Music Generation**: View your music creation activity
- **Network Activity**: Monitor ApeChain network statistics

## ApeChain data under the player

- We fetch via Alchemy ApeChain API through Thirdweb RPC client:
  - `eth_blockNumber` → displayed as BLOCK
  - `eth_gasPrice` → displayed as GAS in gwei
- **Rate Limiting**: Updates every 30 seconds to stay within Alchemy free tier limits
  - Free tier: 100M compute units/month, 25 RPS
  - Each request: ~10 CUs (eth_blockNumber) + ~10 CUs (eth_gasPrice) = 20 CUs
  - 30-second intervals = ~86,400 requests/month = ~1.7M CUs/month (well within limits)
- `TXN/MIN` is currently shown as "-" placeholder. To enable it:
  - Poll latest block number every N seconds
  - Fetch block details for the latest and previous block(s)
  - Derive tx/min from tx count and expected block time
  - Or integrate a subgraph/indexer that provides a rolling tx rate

## Testing

The project includes a comprehensive testing suite with 70% coverage:

### Test Structure
```
__tests__/
├── components/          # Component unit tests
│   ├── ErrorBoundary.test.tsx
│   └── LoadingStates.test.tsx
├── lib/                # Utility function tests
│   ├── utils.test.ts
│   ├── videoUtils.test.ts
│   └── useVideoPreviews.test.tsx
├── integration/        # Integration tests
│   └── walletConnection.test.tsx
└── e2e/               # End-to-end tests
    └── criticalUserFlows.test.tsx
```

### Test Types
- **Unit Tests**: Individual components and utilities
- **Integration Tests**: Wallet connections and API integrations
- **E2E Tests**: Complete user workflows and critical paths

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode for development
npm run test:watch

# Run specific test file
npm test -- ErrorBoundary.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="wallet"
```

### Test Configuration
- **Jest**: Next.js integrated testing setup with proper module transformation
- **React Testing Library**: Component testing with user-centric approach
- **Mocking**: Comprehensive mocking for thirdweb, navigation, and browser APIs
- **BigInt Support**: Proper handling of blockchain data types
- **ESM Support**: Modern module system compatibility
- **Coverage**: 70% minimum threshold maintained

### Test Examples
```bash
# Test wallet connection flow
npm test -- walletConnection.test.tsx

# Test error handling
npm test -- ErrorBoundary.test.tsx

# Test video processing
npm test -- videoUtils.test.ts

# Run integration tests only
npm test -- --testPathPattern="integration"
```

See `TESTING.md` for detailed testing documentation, best practices, and troubleshooting.

## Deployment tips

- Vercel
  - Add env vars in Project Settings → Environment Variables
  - Redeploy

- Security
  - Never commit secret keys. Only the Thirdweb client id is public.
  - RPC URLs can be public if rate-limited; consider private RPCs for production.

## 🛠️ Troubleshooting

### 🔧 **Common Issues & Solutions**

#### Network Connection Problems
**Problem**: Seeing "-" for all ApeChain stats
- ✅ **Solution**: Check your environment variables
  ```bash
  # Verify these are set correctly in .env.local
  NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
  NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139
  ```
- ✅ **Test RPC Connection**:
  ```bash
  curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://apechain-mainnet.g.alchemy.com/v2/{YOUR_API_KEY}
  ```

**Problem**: Network switching not working
- ✅ **Solution**: Ensure wallet is connected and unlocked
- ✅ **Add ApeChain to Wallet**: Chain ID: 33139
- ✅ **Refresh and Reconnect**: Try refreshing the page and reconnecting wallet

#### Wallet Connection Issues
**Problem**: Wallet buttons do nothing
- ✅ **Check Wallet Installation**: Ensure browser wallet is installed
- ✅ **Try WalletConnect**: Use mobile wallet connection as fallback
- ✅ **Check Console**: Look for wallet connection errors in browser console
- ✅ **Verify Network**: Ensure wallet is on the correct network

**Problem**: Email code not received
- ✅ **Check Spam Folder**: Look in spam/junk folder
- ✅ **Re-trigger Code**: Click "Send Code" button again
- ✅ **Verify Email**: Double-check email address spelling
- ✅ **Check Thirdweb Client ID**: Ensure it's correct in environment variables

**Problem**: Smart wallet not deploying
- ✅ **Check RPC**: Verify RPC URL and client ID are valid
- ✅ **Check Balance**: Ensure you have sufficient APE tokens for gas
- ✅ **Check Network**: Make sure you're on ApeChain (Chain ID: 33139)
- ✅ **Check Console**: Look for detailed error messages

#### Music Engine Issues
**Problem**: Music not generating
- ✅ **Check Wallet Connection**: Ensure wallet is connected
- ✅ **Check Network**: Must be on ApeChain
- ✅ **Check Console**: Look for Web Audio API errors
- ✅ **Try Refresh**: Refresh the page and try again

**Problem**: Video visualization not working
- ✅ **Check Browser Support**: Ensure browser supports Web Audio API
- ✅ **Check Console**: Look for canvas or video errors
- ✅ **Try Different Browser**: Test in Chrome, Firefox, or Safari
- ✅ **Check Network**: Ensure stable internet connection

#### Batch Transfer Issues
**Problem**: Batch transfer contract not configured
- ✅ **Set Environment Variable**: Add `NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS`
- ✅ **Deploy Contract**: Deploy batch transfer contract to ApeChain
- ✅ **Verify Address**: Ensure contract address is correct

**Problem**: Insufficient balance
- ✅ **Check APE Balance**: Verify you have enough APE tokens
- ✅ **Include Gas Fees**: Ensure balance covers transfer + gas fees
- ✅ **Check Network**: Must be on ApeChain

**Problem**: CSV upload not working
- ✅ **Check Format**: Ensure CSV format is `address,amount` (one per line)
- ✅ **Validate Addresses**: Check addresses are valid Ethereum addresses (42 chars, 0x prefix)
- ✅ **Check Amounts**: Verify amounts are valid numbers
- ✅ **Check File Size**: Ensure CSV file isn't too large

#### Staking Issues
**Problem**: Staking contracts not configured
- ✅ **Set Environment Variables**: Add all staking contract addresses
- ✅ **Deploy Contracts**: Deploy staking contracts to ApeChain
- ✅ **Verify Addresses**: Ensure all contract addresses are correct

**Problem**: NFTs not showing in staking grid
- ✅ **Check Wallet**: Ensure wallet with NFTs is connected
- ✅ **Check Network**: Must be on ApeChain
- ✅ **Check NFT Ownership**: Verify you own the NFTs
- ✅ **Check Contract**: Ensure NFT contract addresses are correct

**Problem**: Staking rewards not updating
- ✅ **Check Staking Period**: Ensure minimum staking period is met
- ✅ **Check Governance Contract**: Verify governance contract is configured
- ✅ **Check Penalties**: Review any early unstaking penalties
- ✅ **Refresh Dashboard**: Try refreshing the staking dashboard

### 🧪 **Testing Issues**
**Problem**: Tests failing
- ✅ **Run Tests**: `pnpm test` to see specific error messages
- ✅ **Check Dependencies**: Ensure all dependencies are installed
- ✅ **Clear Cache**: `pnpm test -- --clearCache`
- ✅ **Check BigInt Issues**: Look for BigInt serialization problems

**Problem**: Test coverage below 70%
- ✅ **Run Coverage**: `pnpm test:coverage` to see coverage report
- ✅ **Add Tests**: Write tests for uncovered components
- ✅ **Check Test Files**: Ensure test files are in correct locations

### 🏗️ **Build Issues**
**Problem**: Build failures
- ✅ **Clear Build**: `rm -rf .next && pnpm build`
- ✅ **Check TypeScript**: `npx tsc --noEmit`
- ✅ **Check Environment**: Verify all environment variables are set
- ✅ **Check Dependencies**: `pnpm install`

**Problem**: Production build issues
- ✅ **Check Environment**: Ensure all environment variables are set
- ✅ **Check Server Components**: Look for client-side code in server components
- ✅ **Check Imports**: Verify all imports are correct

### 🚀 **Performance Issues**
**Problem**: Slow loading
- ✅ **Check Network**: Look for failed requests in network tab
- ✅ **Check Video Previews**: Verify video previews are loading
- ✅ **Check Memory**: Look for memory leaks in dev tools
- ✅ **Check Lazy Loading**: Ensure lazy loading is working

**Problem**: Video preview issues
- ✅ **Check URLs**: Verify video URLs are accessible
- ✅ **Check Canvas**: Ensure canvas-based frame extraction is working
- ✅ **Check Console**: Look for video loading errors
- ✅ **Check Fallbacks**: Ensure fallback images are displaying

### 📞 **Getting Help**

#### Self-Help Resources
1. **Check Documentation**: Review this README and other docs
2. **Check Console**: Look for error messages in browser console
3. **Check Network Tab**: Look for failed requests
4. **Check Environment**: Verify all environment variables are set
5. **Check Dependencies**: Ensure all packages are installed

#### Community Support
- **Discord**: Join our Discord community for help
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the comprehensive docs in the repo
- **Testing Guide**: See `TESTING.md` for testing issues
- **Network Setup**: See `NETWORK_SETUP.md` for network problems

#### Professional Support
- **Enterprise Support**: Contact us for enterprise support
- **Custom Development**: Hire us for custom features
- **Consulting**: Get help with integration and deployment

## 🏗️ Project Architecture

### 📁 **Project Structure**

```
v0-apebeats/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main landing page
│   ├── login/             # Login page
│   ├── music/             # Music Engine page
│   ├── snapshot/          # Token Holder Snapshot Tool page
│   ├── batch/             # Batch Operations hub page
│   ├── transfers/         # Batch Transfer page
│   ├── dashboard/         # User Dashboard page
│   └── stake/             # Staking page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx    # Button component
│   │   ├── card.tsx      # Card component
│   │   ├── input.tsx     # Input component
│   │   ├── tabs.tsx      # Tabs component
│   │   └── ...           # Other UI components
│   ├── features/         # Feature-specific components
│   │   ├── SnapshotTool.tsx # Token holder snapshot tool
│   │   ├── BlockchainLogos.tsx # Blockchain logo components
│   │   └── MenuDropdown.tsx # Menu dropdown component
│   ├── music-engine/     # Music Engine components
│   │   └── MusicEngine.tsx # Main music engine component
│   ├── transfers/        # Batch Transfer components
│   │   ├── BatchTransferPage.tsx # Batch transfer page
│   │   └── BatchTransferForm.tsx # Batch transfer form
│   ├── dashboard/        # Dashboard components
│   │   ├── DashboardPage.tsx # Dashboard page
│   │   └── UserDashboard.tsx # User dashboard content
│   ├── staking/          # Staking components
│   │   ├── StakingHeader.tsx # Staking page header
│   │   ├── StakingHeroSection.tsx # Staking hero section
│   │   ├── StakingFeaturesSection.tsx # Staking features
│   │   ├── StakingTiersSection.tsx # Staking tiers
│   │   ├── StakingCTASection.tsx # Call-to-action section
│   │   ├── StakingFooter.tsx # Staking footer
│   │   ├── StakingDashboard.tsx # Main staking dashboard
│   │   ├── NFTGrid.tsx # NFT grid component
│   │   ├── StakedNFTs.tsx # Staked NFTs display
│   │   ├── PoolCreator.tsx # Pool creation component
│   │   └── WalletConnect.tsx # Wallet connection
│   ├── auth/             # Authentication components
│   │   ├── HeaderUser.tsx # Header user component
│   │   ├── LoginInline.tsx # Inline login component
│   │   └── ProfileDropdown.tsx # Profile dropdown
│   ├── layout/           # Layout components
│   │   ├── CommonHeader.tsx # Common header
│   │   ├── CommonFooter.tsx # Common footer
│   │   ├── CommonPageLayout.tsx # Common page layout
│   │   ├── ErrorBoundary.tsx # Error handling
│   │   └── LoadingStates.tsx # Loading components
│   ├── wallet/           # Wallet components
│   │   ├── NetworkSwitcher.tsx # Network detection
│   │   └── WalletIcons.tsx # Wallet icon components
│   ├── GlyphProvider.tsx # Glyph wallet integration
│   ├── QueryProvider.tsx # React Query provider
│   ├── theme-provider.tsx # Theme provider
│   └── PerformanceOptimizations.tsx # Performance optimizations
├── lib/                  # Utilities and services
│   ├── music-engine/     # Music generation engine
│   │   ├── index.ts      # Main music engine orchestrator
│   │   ├── dataCollector.ts # Blockchain data collection
│   │   ├── musicGenerator.ts # Music generation logic
│   │   ├── lofiGenerator.ts # LoFi Hip Hop generator
│   │   ├── streamingEngine.ts # 24/7 streaming engine
│   │   ├── videoVisualizer.ts # Video visualization
│   │   ├── nftSnapshot.ts # NFT creation system
│   │   └── types.ts      # Type definitions
│   ├── snapshot/         # Snapshot tool utilities
│   │   ├── vercel-utils.ts # Vercel-specific utilities
│   │   └── retry-utils.ts # Retry and error handling
│   ├── thirdweb.ts       # Thirdweb configuration
│   ├── batchTransferService.ts # Batch transfer service
│   ├── utils.ts          # General utilities
│   ├── videoUtils.ts     # Video processing
│   ├── useVideoPreviews.ts # Video preview hook
│   ├── validation.ts     # Validation utilities
│   ├── securityMonitor.ts # Security monitoring
│   └── walletService.ts  # Wallet service utilities
├── hooks/                # Custom React hooks
│   └── useStaking.ts     # Staking operations hook
├── stores/               # State management
│   ├── index.ts          # Store exports
│   └── userStore.ts      # User state store
├── __tests__/            # Test suite
│   ├── components/       # Component tests
│   ├── lib/             # Utility tests
│   ├── integration/     # Integration tests
│   ├── e2e/            # End-to-end tests
│   └── security/        # Security tests
├── public/              # Static assets
│   ├── apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg
│   ├── Apechain.svg     # ApeChain logo
│   └── ...              # Other static assets
├── styles/              # Global styles
│   └── globals.css      # Global CSS
├── docs/               # Documentation
│   ├── README.md       # This file
│   ├── TESTING.md      # Testing guide
│   ├── CHANGELOG.md    # Release notes
│   ├── NETWORK_SETUP.md # Network setup guide
│   └── architecture/   # Architecture documentation
├── contracts/          # Smart contracts
│   ├── ApeBeatsGenesis.sol # Genesis NFT contract
│   ├── ApeBeatsMetadataLib.sol # Metadata library
│   ├── ApeBeatsRoyalties.sol # Royalties contract
│   └── ...            # Other contracts
├── scripts/            # Deployment and utility scripts
│   ├── deploy.js       # Deployment script
│   ├── generate-assets.js # Asset generation
│   └── ...            # Other scripts
└── config/             # Configuration files
    ├── next.config.mjs # Next.js configuration
    ├── tailwind.config.js # Tailwind configuration
    ├── tsconfig.json   # TypeScript configuration
    └── jest.config.js  # Jest configuration
```

### 🔧 **Technical Architecture**

#### **Frontend Architecture**
- **Next.js 14.2.16**: App Router with server-side rendering
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Strict type checking and enhanced developer experience
- **TailwindCSS**: Utility-first CSS framework with custom components
- **Radix UI**: Accessible component primitives

#### **Web3 Integration**
- **Thirdweb v5 SDK**: Complete Web3 infrastructure
- **Smart Wallets**: ERC-4337 compatible smart wallet deployment
- **Multi-chain Support**: Ethereum, Polygon, Arbitrum, Optimism, Base, ApeChain
- **Wallet Integration**: MetaMask, Rabby, Rainbow, WalletConnect, Glyph

#### **State Management**
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **Custom Hooks**: Specialized hooks for different features

#### **Testing Architecture**
- **Jest**: Testing framework with Next.js integration
- **React Testing Library**: Component testing with user-centric approach
- **70% Coverage**: Comprehensive test coverage across all features

#### **Performance Optimization**
- **Code Splitting**: Dynamic imports and lazy loading
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Image Optimization**: Next.js Image component with optimization
- **Caching**: Strategic caching for improved performance

#### **Deployment Architecture**
- **Vercel**: Serverless deployment with edge functions
- **Environment Variables**: Secure configuration management
- **CI/CD**: Automated testing and deployment pipeline

## Key Files

### Core Application
- `app/layout.tsx` — Thirdweb provider wrapper with error boundaries
- `lib/thirdweb.ts` — Thirdweb client, ApeChain config, preferred wallets
- `app/login/page.tsx` — Social + wallet login UI and smart wallet deployment
- `components/HeaderUser.tsx` — Quick connect/disconnect and email display
- `app/page.tsx` — Landing page with live ApeChain metrics and Genesis collection previews
- `lib/utils.ts` — `fetchApeChainStats` via Thirdweb RPC

### **NEW**: Enhanced Components
- `components/ErrorBoundary.tsx` — Comprehensive error handling
- `components/LoadingStates.tsx` — Optimized loading components
- `components/NetworkSwitcher.tsx` — Dynamic network detection
- `components/GlyphProvider.tsx` — Glyph wallet integration
- `components/WalletIcons.tsx` — Wallet icon components

### **NEW**: Video & Performance
- `lib/videoUtils.ts` — Video processing and preview generation
- `lib/useVideoPreviews.ts` — React hook for video preview management
- `lib/walletService.ts` — Wallet service utilities
- `lib/wagmi.ts` — Wagmi configuration

### **NEW**: Music Engine & Tools
- `lib/music-engine/index.ts` — Main music engine orchestrator
- `lib/music-engine/dataCollector.ts` — Blockchain data collection system
- `lib/music-engine/lofiGenerator.ts` — LoFi Hip Hop music generator
- `lib/music-engine/streamingEngine.ts` — 24/7 streaming engine
- `lib/music-engine/videoVisualizer.ts` — Video visualization system
- `lib/music-engine/nftSnapshot.ts` — NFT creation and management
- `components/music-engine/MusicEngine.tsx` — Music engine UI component
- `components/SnapshotTool.tsx` — Token holder snapshot tool
- `components/BlockchainLogos.tsx` — Multi-chain logo components
- `components/transfers/BatchTransferPage.tsx` — Batch transfer page component
- `components/transfers/BatchTransferForm.tsx` — Batch transfer form component
- `components/dashboard/DashboardPage.tsx` — User dashboard page component
- `components/dashboard/UserDashboard.tsx` — User dashboard content component

### **NEW**: Staking System
- `app/stake/page.tsx` — Complete staking page with new functionality
- `components/staking/StakingHeader.tsx` — Staking page header component
- `components/staking/StakingHeroSection.tsx` — Staking hero section component
- `components/staking/StakingFeaturesSection.tsx` — Staking features section component
- `components/staking/StakingTiersSection.tsx` — Staking tiers section component
- `components/staking/StakingCTASection.tsx` — Staking call-to-action section component
- `components/staking/StakingFooter.tsx` — Staking footer component
- `hooks/useStaking.ts` — Custom React hook for staking operations
- `lib/thirdweb.ts` — Extended with staking configuration and contract addresses

### **NEW**: Social Media Previews
- `lib/metadata.ts` — Centralized metadata management system
- `lib/social-preview-tester.ts` — Testing utilities for social media previews
- `scripts/test-social-previews.js` — Automated testing script
- `public/social-preview-test.html` — Manual testing interface
- `SOCIAL_MEDIA_PREVIEWS.md` — Comprehensive documentation

### **NEW**: Testing
- `__tests__/` — Complete test suite
- `jest.config.js` — Jest configuration with Next.js integration
- `jest.setup.js` — Test environment setup and mocks
- `TESTING.md` — Comprehensive testing documentation

## Recent Improvements

### v0.2.1 - Testing & Performance Update
- ✅ **Testing Suite**: Added comprehensive Jest + React Testing Library setup
- ✅ **Error Handling**: Implemented error boundaries and graceful error recovery
- ✅ **Loading States**: Optimized loading components with skeletons
- ✅ **Video Processing**: Genesis NFT video preview generation system
- ✅ **Performance**: Lazy loading, optimized animations, reduced bundle size
- ✅ **Build Optimization**: Enhanced Next.js configuration and build process
- ✅ **Network Detection**: Dynamic network switching and detection
- ✅ **Code Quality**: ESLint configuration and TypeScript improvements

### v0.3.0 - Music Engine & Tools Update
- ✅ **Generative Music Engine**: Complete LoFi Hip Hop music generation from blockchain data
- ✅ **24/7 Streaming Engine**: Continuous music streaming with real-time blockchain updates
- ✅ **Token Holder Snapshot Tool**: Professional multi-chain token holder capture tool
- ✅ **NFT Creation System**: Automatic NFT snapshot creation for generated music
- ✅ **Video Visualization**: Real-time video visualization synchronized with music
- ✅ **Multi-chain Support**: Support for Ethereum, Polygon, Arbitrum, Optimism, Base, and ApeChain
- ✅ **Music Engine UI**: Complete user interface for music generation and streaming
- ✅ **Blockchain Data Collection**: Advanced blockchain data collection and processing

### v0.3.1 - Batch Transfer System Update
- ✅ **Batch Transfer System**: Complete APE token batch transfer functionality
- ✅ **Multiple Transfer Modes**: Equal amounts, custom amounts, and random amount distribution
- ✅ **CSV Upload Support**: Bulk recipient management via CSV file upload
- ✅ **Gas Optimization**: Efficient batch transfers with up to 70% gas savings
- ✅ **Real-time Balance Checking**: Live APE balance display and validation
- ✅ **Transaction Tracking**: Complete transaction history and status monitoring
- ✅ **User Dashboard**: Comprehensive dashboard for batch transfer analytics
- ✅ **Smart Contract Integration**: Full thirdweb integration with batch transfer contracts
- ✅ **Enhanced Batch Landing Page**: Beautiful mystical swamp background with floating animations
- ✅ **Improved UI/UX**: Professional landing page design with proper branding and animations

### v0.4.0 - ApeStake Integration System
- ✅ **Complete Staking System**: Professional staking interface with NFT grid and staked NFTs display
- ✅ **Multi-Tier Staking**: Partner, Standard, Premium, and OSS staking tiers with different APY rates
- ✅ **Staking Dashboard**: Beautiful staking page with mystical swamp background and floating animations
- ✅ **Staking Components**: Complete component library for staking functionality
- ✅ **Staking Hooks**: Custom React hooks for staking operations and state management
- ✅ **Staking Configuration**: Comprehensive staking contract addresses and configuration
- ✅ **Pool Creation**: User-friendly pool creation interface with fee structure display
- ✅ **Reward System**: Comprehensive reward distribution system with penalty calculations
- ✅ **Governance Integration**: Governance participation for stakers
- ✅ **Fee Structure**: Transparent fee structure (10% treasury, 5% ApeBeats, 85% stakers)

### v0.4.6 - Social Media Previews
- ✅ **Complete Social Media Previews**: Rich previews for all pages with Open Graph and Twitter Card meta tags
- ✅ **Centralized Metadata System**: Unified metadata management with page-specific customization
- ✅ **Comprehensive Testing Infrastructure**: Automated testing tools and manual testing guides
- ✅ **Server Component Architecture**: Optimized Next.js server components for better SEO and performance
- ✅ **Multi-Platform Support**: Optimized for X, Discord, WhatsApp, LinkedIn, and other social platforms
- ✅ **Developer Experience**: Easy-to-use metadata system with TypeScript support
- ✅ **SEO Enhancement**: Improved search engine optimization with structured metadata

### v0.3.2 - Background Styling Consistency Fix
- ✅ **Background Consistency**: Fixed background display across all pages (dashboard, stake, transfers)
- ✅ **Visual Uniformity**: All pages now display the same mystical swamp background with floating elements
- ✅ **Enhanced User Experience**: Consistent visual experience across the entire application
- ✅ **Background Image Fix**: Properly displays the ApeBeats sonic swamp hub background image
- ✅ **Floating Elements**: Added consistent floating gradient elements with animations
- ✅ **Z-index Layering**: Proper layering for background elements and content
- ✅ **Performance Optimization**: Optimized background rendering with hardware acceleration

### Build Status
- ✅ **Production Build**: Working perfectly with optimized output
- ✅ **Test Coverage**: 70% minimum threshold maintained
- ✅ **Performance**: Optimized for Core Web Vitals
- ✅ **Accessibility**: Enhanced ARIA labels and keyboard navigation

## Contributing

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork**: `git clone <your-fork-url>`
3. **Install dependencies**: `pnpm install`
4. **Set up environment variables** (see Environment Variables section above)
5. **Run development server**: `pnpm dev`
6. **Run tests**: `pnpm test`

### Development Workflow
```bash
# 1. Start development server
pnpm dev

# 2. Run tests in watch mode (in another terminal)
pnpm run test:watch

# 3. Check code quality
pnpm run lint

# 4. Build for production
pnpm build

# 5. Run full test suite
pnpm test
```

### Environment Setup Checklist
- [ ] Node.js 18+ installed
- [ ] pnpm package manager installed
- [ ] Thirdweb Client ID obtained and set
- [ ] Alchemy API key obtained and set
- [ ] ApeChain Chain ID set (33139)
- [ ] Environment variables in `.env.local`
- [ ] Wallet extension installed (MetaMask, Rabby, etc.)
- [ ] Tests passing: `pnpm test`
- [ ] Build successful: `pnpm build`

### Code Quality
- Follow TypeScript best practices
- Write tests for new features
- Maintain 70% test coverage
- Use ESLint and Prettier for code formatting
- Follow the existing component structure

### Testing
- Write unit tests for new components
- Add integration tests for wallet connections
- Update E2E tests for critical user flows
- Ensure all tests pass before submitting PR

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes with tests
3. Run `pnpm test` and `pnpm build` to ensure everything works
4. Submit a pull request with a clear description
5. Ensure CI passes (tests, build, linting)

## Changelog

### Current Version: v0.4.7
**Latest Release**: January 27, 2025

**Key Features in v0.4.7:**
- 🔗 **Enhanced Glyph Wallet Integration**: Improved Glyph wallet connection with better error handling and user guidance
- 🦁 **Browser Detection & Popup Guidance**: Intelligent popup blocking detection with browser-specific guidance
- 🎯 **Enhanced Authentication Components**: Improved login flows and user experience across all authentication methods
- 🎨 **New UI Components**: Alert components and enhanced user interface elements
- 🛡️ **Improved Wallet Service**: Enhanced wallet connection handling with better error recovery
- 📚 **Documentation Cleanup**: Removal of outdated documentation files and improved project organization

**Previous Features (v0.4.6):**
- 📱 **Complete Social Media Previews**: Rich previews for all pages with Open Graph and Twitter Card meta tags
- 🎯 **Centralized Metadata System**: Unified metadata management with page-specific customization
- 🧪 **Comprehensive Testing Infrastructure**: Automated testing tools and manual testing guides
- 🚀 **Server Component Architecture**: Optimized Next.js server components for better SEO and performance
- 📊 **Multi-Platform Support**: Optimized for X, Discord, WhatsApp, LinkedIn, and other social platforms
- 🔧 **Developer Experience**: Easy-to-use metadata system with TypeScript support
- 📈 **SEO Enhancement**: Improved search engine optimization with structured metadata

**Previous Features (v0.4.5):**
- 🔧 **Enhanced Progress Tracking**: Real-time progress updates with detailed status information
- 📊 **Improved Export System**: Multiple export formats (TXT, CSV, JSON) with comprehensive error handling
- 🎯 **Better Result Processing**: Fixed result display and state management issues
- 🛡️ **Enhanced Error Handling**: Comprehensive error handling with fallback mechanisms
- 🎨 **Improved User Interface**: Collapsible logs, better status indicators, and enhanced UX
- ⚡ **Performance Optimizations**: Reduced batch sizes and improved processing efficiency
- 🔍 **Debug Logging**: Enhanced debugging capabilities for troubleshooting

**Previous Features (v0.4.4):**
- 🔧 **Snapshot Tool Overhaul**: Complete rewrite with improved result processing and export functionality
- 💰 **ApeCoin Balance Integration**: Real-time ApeCoin balance display in user profile
- ❤️ **Donation System**: New donation section to support project development
- 🎨 **Enhanced UI/UX**: Improved user interface with better feedback and interactions
- 🔐 **Authentication Improvements**: Enhanced login flows and user experience
- 📊 **Export Enhancements**: Multiple export formats (TXT, CSV, JSON) with improved reliability
- 🛡️ **Error Handling**: Better error handling and user feedback throughout the application

**Previous Features (v0.4.3):**
- 📚 **Comprehensive Documentation Update**: Complete overhaul of CHANGELOG.md and README.md
- 🎯 **Detailed Project Information**: Enhanced project overview with comprehensive feature descriptions
- 🛠️ **Setup Instructions**: Detailed installation and configuration guides
- 📊 **Feature Documentation**: Complete documentation of all current features and capabilities
- 🚀 **Developer Experience**: Improved developer onboarding and contribution guidelines
- 📈 **Project Status**: Clear project status and roadmap information
- 🔧 **Technical Specifications**: Detailed technical documentation and architecture overview

**Previous Features (v0.4.2):**
- 🔧 **Snapshot Tool Result Processing**: Fixed critical issue where holders were found but not displayed in results
- 📊 **Enhanced Export Functionality**: Added dual-format export (JSON + CSV) with comprehensive data
- 📋 **Improved Copy Functionality**: Fixed clipboard functionality for holder addresses
- 🎯 **Sequential Processing**: Replaced complex chunked processor with reliable sequential processing
- 🛡️ **Better Error Handling**: Enhanced error handling and user feedback throughout the process
- 🚀 **Performance Optimization**: Streamlined processing for better reliability and speed

**Previous Features (v0.4.1):**
- 🔧 **Snapshot Tool Fixes**: Resolved hanging issue with comprehensive timeout mechanisms
- 🎨 **Official Blockchain Logos**: Replaced placeholder logos with official blockchain designs
- 🛡️ **Enhanced Error Handling**: Improved error messages and user feedback
- ⚡ **Performance Improvements**: Optimized snapshot tool performance and reliability
- 🔍 **Debug Logging**: Enhanced logging for better troubleshooting
- 🌐 **API Key Validation**: Improved API key handling and validation

**Previous Features (v0.4.0):**
- 🎯 **Complete Staking System**: Professional staking interface with NFT grid and staked NFTs display
- 🏆 **Multi-Tier Staking**: Partner, Standard, Premium, and OSS staking tiers with different APY rates
- 🎨 **Staking Dashboard**: Beautiful staking page with mystical swamp background and floating animations
- 🔧 **Staking Components**: Complete component library for staking functionality
- 🎣 **Staking Hooks**: Custom React hooks for staking operations and state management
- ⚙️ **Staking Configuration**: Comprehensive staking contract addresses and configuration
- 🎭 **Enhanced UI/UX**: Professional staking interface with ApeBeats branding
- 🚀 **Seamless Integration**: Full integration with existing ApeBeats ecosystem

**Previous Features (v0.3.1):**
- 💸 **Batch Transfer System**: Complete APE token batch transfer functionality
- 📊 **Multiple Transfer Modes**: Equal amounts, custom amounts, and random distribution
- 📁 **CSV Upload Support**: Bulk recipient management via CSV file upload
- ⛽ **Gas Optimization**: Efficient batch transfers with up to 70% gas savings
- 💰 **Real-time Balance Checking**: Live APE balance display and validation
- 📈 **Transaction Tracking**: Complete transaction history and status monitoring
- 🎛️ **User Dashboard**: Comprehensive dashboard for batch transfer analytics
- 🔗 **Smart Contract Integration**: Full thirdweb integration with batch transfer contracts

**Previous Features (v0.3.0):**
- 🎵 **Generative Music Engine**: Complete LoFi Hip Hop music generation from blockchain data
- 🔄 **24/7 Streaming Engine**: Continuous music streaming with real-time blockchain updates
- 📊 **Token Holder Snapshot Tool**: Professional multi-chain token holder capture tool
- 🎨 **NFT Creation System**: Automatic NFT snapshot creation for generated music
- 🎬 **Video Visualization**: Real-time video visualization synchronized with music
- 🌐 **Multi-chain Support**: Support for Ethereum, Polygon, Arbitrum, Optimism, Base, and ApeChain
- 🧪 **Complete Testing Suite**: Jest + React Testing Library with 70% coverage
- 🚀 **Performance Optimizations**: 15% smaller bundle size, lazy loading

### View Full Changelog
See [`CHANGELOG.md`](./CHANGELOG.md) for:
- **Detailed Release Notes**: Complete list of changes, fixes, and improvements
- **Migration Guides**: How to upgrade between versions
- **Breaking Changes**: Any breaking changes and how to handle them
- **Performance Metrics**: Bundle size, loading time, and coverage statistics
- **Contributors**: Who contributed to each release
- **Future Roadmap**: Planned features and improvements

### Quick Links
- **Latest Release**: [v0.3.1](./CHANGELOG.md#031---2025-01-27)
- **Previous Release**: [v0.3.0](./CHANGELOG.md#030---2025-01-27)
- **Unreleased Features**: [Planned](./CHANGELOG.md#unreleased)

## Documentation

### Core Documentation
- **README.md** (this file) - Project overview, setup, and quick start guide
- **CHANGELOG.md** - Detailed release notes and version history
- **TESTING.md** - Comprehensive testing guide and best practices
- **NETWORK_SETUP.md** - ApeChain network configuration and troubleshooting

### Documentation Structure
```
docs/
├── README.md           # Main project documentation
├── CHANGELOG.md        # Release notes and version history
├── TESTING.md          # Testing guide and best practices
└── NETWORK_SETUP.md    # Network configuration guide
```

### Getting Help
1. **Start Here**: Read this README for setup and quick start
2. **Testing Issues**: Check `TESTING.md` for testing problems
3. **Network Issues**: See `NETWORK_SETUP.md` for network problems
4. **Version History**: Review `CHANGELOG.md` for recent changes
5. **Still Stuck**: Check the troubleshooting section above

## Use Cases & Scenarios

### For Developers
- **Setting up development environment**: Follow the Development Setup section
- **Adding new features**: Check Contributing guidelines and write tests
- **Debugging issues**: Use the Troubleshooting section and check console logs
- **Testing changes**: Run `pnpm test` and check coverage with `pnpm run test:coverage`

### For Users
- **Connecting wallet**: Use the wallet connection buttons in the header
- **Switching networks**: The app will automatically prompt to switch to ApeChain
- **Viewing Genesis NFTs**: Scroll to the Genesis Collection Preview section
- **Joining waitlist**: Click the "Join the Waitlist" button

### For Contributors
- **Forking the project**: Follow the Contributing section
- **Running tests**: Use the Testing section for test commands
- **Building for production**: Run `pnpm build` to verify everything works
- **Submitting PRs**: Ensure all tests pass and follow the PR process

### For Deployers
- **Environment setup**: Set all required environment variables
- **Build verification**: Run `pnpm build` to ensure production build works
- **Testing**: Run `pnpm test` to verify functionality
- **Deployment**: Follow the Deployment tips section

## 📊 Project Status

### ✅ **Production Ready**
- **Build Status**: ✅ Working perfectly with optimized output
- **Test Coverage**: ✅ 70% coverage maintained with comprehensive test suite
- **Performance**: ✅ Optimized for Core Web Vitals
- **Accessibility**: ✅ Enhanced ARIA labels and keyboard navigation
- **Documentation**: ✅ Complete with setup guides and troubleshooting
- **Security**: ✅ Comprehensive security audit completed

### 📈 **Version Information**
- **Current Version**: v0.4.7
- **Release Date**: January 27, 2025
- **Next.js Version**: 14.2.16
- **TypeScript**: Latest with strict mode
- **Testing**: Jest + React Testing Library
- **Coverage**: 70% minimum threshold
- **Music Engine**: LoFi Hip Hop generation with blockchain data
- **Multi-chain Support**: 6 supported networks
- **Batch Transfer**: Complete APE token batch transfer system
- **Staking System**: Multi-tier staking with NFT grid and pool creation
- **Snapshot Tool**: Professional token holder capture with export functionality

### 🎯 **Feature Status**
- ✅ **Core Features**: All implemented and tested
- ✅ **Music Engine**: Fully functional with real-time generation
- ✅ **NFT Collections**: Genesis and Live Beats collections ready
- ✅ **Batch Transfers**: Complete with CSV upload and multiple modes
- ✅ **Staking System**: Multi-tier staking with governance integration
- ✅ **Snapshot Tool**: Professional token holder capture with enhanced progress tracking and multiple export formats (TXT, CSV, JSON)
- ✅ **Wallet Integration**: Smart wallets with social login
- ✅ **Testing Suite**: Comprehensive test coverage
- ✅ **Documentation**: Complete user and developer guides

### 🚀 **Performance Metrics**
- **Bundle Size**: Optimized with code splitting and lazy loading
- **Loading Time**: Fast initial page load with optimized assets
- **Memory Usage**: Efficient memory management for long-running sessions
- **Core Web Vitals**: Optimized for LCP, FID, and CLS scores
- **Test Coverage**: 70% minimum threshold maintained
- **Build Time**: Fast builds with optimized Next.js configuration
- **Snapshot Tool**: Optimized sequential processing with enhanced progress tracking, export functionality, and comprehensive error handling

### 🔧 **Technical Stack**
- **Frontend**: Next.js 14.2.16 with App Router
- **Styling**: TailwindCSS with custom components
- **Web3**: Thirdweb v5 SDK with smart wallet support
- **Blockchain**: ApeChain integration with multi-chain support
- **Testing**: Jest + React Testing Library with 70% coverage
- **Type Safety**: TypeScript with strict mode
- **Performance**: Optimized with lazy loading and code splitting
- **Deployment**: Vercel-optimized with serverless functions

### 📊 **Current Capabilities**
- **Music Generation**: 24/7 LoFi Hip Hop generation from blockchain data
- **NFT Creation**: Genesis (420 limited) + Live Beats (unlimited) collections
- **Batch Operations**: APE token distribution with up to 70% gas savings
- **Staking System**: Multi-tier NFT staking with 5-15% APY
- **Snapshot Tool**: Professional token holder capture across 6 networks with enhanced progress tracking and multiple export formats
- **Wallet Support**: Smart wallets with social login and multi-wallet support
- **Multi-chain**: Support for Ethereum, Polygon, Arbitrum, Optimism, Base, and ApeChain

## 🤝 Contributing

### **How to Contribute**
We welcome contributions from the community! Here's how you can help:

#### **For Developers**
1. **Fork the Repository**: Create your own fork of the project
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Implement your feature or fix
4. **Write Tests**: Add tests for new functionality
5. **Run Tests**: Ensure all tests pass
6. **Submit Pull Request**: Create a PR with clear description

#### **For Users**
1. **Report Bugs**: Use GitHub Issues to report problems
2. **Request Features**: Suggest new features via GitHub Issues
3. **Improve Documentation**: Help improve our docs
4. **Share Feedback**: Let us know what you think

### **Development Guidelines**
- **Code Quality**: Follow TypeScript best practices
- **Testing**: Write tests for new features
- **Documentation**: Update docs for new features
- **Performance**: Consider performance impact of changes
- **Accessibility**: Ensure changes are accessible

### **Pull Request Process**
1. **Create Feature Branch**: From `main` branch
2. **Make Changes**: With tests and documentation
3. **Run Tests**: `pnpm test` and `pnpm build`
4. **Submit PR**: With clear description and screenshots
5. **Code Review**: Address feedback from maintainers
6. **Merge**: After approval and CI passes

### **Issue Guidelines**
- **Bug Reports**: Include steps to reproduce
- **Feature Requests**: Explain the use case
- **Documentation**: Help improve our guides
- **Questions**: Use GitHub Discussions

## 📞 Support & Community

### **Getting Help**
- **Documentation**: Check this README and other docs
- **Troubleshooting**: See the troubleshooting section above
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our community for real-time help
- **Email**: Contact us for enterprise support

### **Community Resources**
- **Discord**: [Join our Discord](https://discord.gg/EAeFftJe)
- **Twitter**: [Follow @CarquetE](https://x.com/CarquetE)
- **GitHub**: [Star the repository](https://github.com/your-username/apebeats)
- **Documentation**: Comprehensive guides in the repo

### **Professional Support**
- **Enterprise Support**: Custom solutions for businesses
- **Custom Development**: Hire us for custom features
- **Consulting**: Get help with integration and deployment
- **Training**: Learn how to use ApeBeats effectively

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **BAYC Community**: For inspiration and support
- **Yuga Labs**: For the amazing ecosystem
- **Thirdweb**: For the excellent Web3 infrastructure
- **Next.js Team**: For the amazing framework
- **Open Source Community**: For all the amazing tools and libraries

## 🗺️ Roadmap

### 🚀 **Upcoming Features (v0.5.0)**
- **Advanced Music Engine**: Enhanced LoFi generation with more blockchain data sources
- **Mobile App**: Native iOS and Android applications for ApeBeats
- **Real-time Collaboration**: Multi-user music creation and sharing
- **Advanced Analytics**: Detailed staking and music generation analytics
- **Governance Integration**: Full DAO governance for ApeBeats ecosystem

### 🔧 **Planned Technical Improvements**
- **Playwright E2E Testing**: Comprehensive end-to-end testing suite
- **Visual Regression Testing**: Automated UI consistency testing
- **Performance Monitoring**: Real-time performance metrics dashboard
- **Advanced Accessibility**: Enhanced screen reader and keyboard navigation
- **Next.js 15 Upgrade**: Latest Next.js features and performance improvements

### 🎯 **Future Features**
- **Advanced NFT Marketplace**: Integrated marketplace for ApeBeats NFTs
- **Music Collaboration Tools**: Real-time collaborative music creation
- **Advanced Royalty System**: Sophisticated royalty distribution mechanisms
- **Cross-platform Integration**: Integration with major music platforms
- **AI-Powered Curation**: AI-driven music discovery and curation

### 📊 **Development Timeline**
- **Q1 2025**: Advanced music engine and mobile app development
- **Q2 2025**: Real-time collaboration and governance integration
- **Q3 2025**: Advanced analytics and performance monitoring
- **Q4 2025**: AI-powered features and cross-platform integration

## 🎉 Getting Started

### **For Users**
1. **Visit the Application**: Go to the deployed ApeBeats application
2. **Connect Your Wallet**: Use any supported wallet or social login
3. **Explore Features**: Try the music engine, batch transfers, and staking
4. **Join the Community**: Connect with other ApeBeats users

### **For Developers**
1. **Fork the Repository**: Create your own fork of the project
2. **Set Up Environment**: Follow the setup instructions above
3. **Run the Application**: Start the development server
4. **Contribute**: Submit pull requests and help improve the project

### **For Contributors**
1. **Read the Documentation**: Familiarize yourself with the project
2. **Check Issues**: Look for issues you can help with
3. **Follow Guidelines**: Read the contributing guidelines
4. **Submit PRs**: Create pull requests with your improvements

## 📞 Support & Community

### **Getting Help**
- **Documentation**: Check this README and other docs
- **Troubleshooting**: See the troubleshooting section above
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our community for real-time help

### **Community Resources**
- **Discord**: [Join our Discord](https://discord.gg/EAeFftJe)
- **Twitter**: [Follow @CarquetE](https://x.com/CarquetE)
- **GitHub**: [Star the repository](https://github.com/your-username/apebeats)
- **Documentation**: Comprehensive guides in the repo

### **Professional Support**
- **Enterprise Support**: Custom solutions for businesses
- **Custom Development**: Hire us for custom features
- **Consulting**: Get help with integration and deployment
- **Training**: Learn how to use ApeBeats effectively

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **BAYC Community**: For inspiration and support
- **Yuga Labs**: For the amazing ecosystem
- **Thirdweb**: For the excellent Web3 infrastructure
- **Next.js Team**: For the amazing framework
- **Open Source Community**: For all the amazing tools and libraries

---

**Built with ❤️ for the BAYC community and Web3 music lovers everywhere.**

**Version**: v0.4.7 | **Last Updated**: January 27, 2025 | **Status**: ✅ Production Ready
