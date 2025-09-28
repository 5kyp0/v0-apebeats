# ApeBeats Genesis NFT Integration

This document outlines the complete NFT integration for ApeBeats Genesis, including smart contracts, deployment scripts, and frontend integration.

## 🎯 Overview

ApeBeats Genesis is a generative music NFT collection that combines:
- **Smart Contracts**: ERC721 NFTs with multi-phase minting
- **Generative Music**: Procedurally generated audio from 4 layers of 10-second loops crafted in Ableton Live
- **Visual Art**: Dynamic waveforms and visualizations
- **Royalty System**: Community-driven royalty distribution

## 📁 Project Structure

```
├── contracts/                 # Smart contracts
│   ├── ApeBeatsGenesis.sol   # Main NFT contract
│   ├── ApeBeatsMetadataLib.sol # Metadata management
│   └── ApeBeatsRoyalties.sol # Royalty distribution
├── scripts/                  # Deployment & utility scripts
│   ├── deploy.js            # Contract deployment
│   ├── generate-merkle.js   # Merkle tree generation
│   ├── test-contracts.js    # Contract testing
│   ├── reveal.js            # NFT reveal process
│   ├── generate-nft-metadata.js # Metadata generation
│   ├── update-merkle-roots.js # Merkle root updates
│   ├── withdraw-funds.js    # Funds withdrawal
│   └── setup.js             # Project setup
├── lib/                     # Frontend utilities
│   └── mint-config.ts       # Mint configuration
├── app/mint/                # Mint page
│   └── page.tsx             # Mint interface
└── deployments/             # Deployment artifacts
```

## 🚀 Quick Start

### 1. Setup Project

```bash
# Install dependencies
pnpm install

# Run setup script
pnpm run setup
```

### 2. Configure Environment

Set up your `.env.local` file with the following template:

```bash
# ApeBeats Genesis - Curtis Testnet Configuration
# Fill in the values below before deployment

# ===========================================
# DEPLOYMENT CONFIGURATION
# ===========================================
# Your wallet's private key for deployment
# ⚠️  NEVER commit this to version control!
# Get this from your wallet (MetaMask, etc.)
PRIVATE_KEY=your_private_key_here

# ===========================================
# NETWORK CONFIGURATION
# ===========================================
# Curtis Testnet settings (already configured)
NEXT_PUBLIC_CHAIN_ID=33111
NEXT_PUBLIC_CHAIN_NAME=Curtis Testnet
NEXT_PUBLIC_RPC_URL=https://rpc.curtis.apechain.xyz
NEXT_PUBLIC_EXPLORER_URL=https://explorer.curtis.apechain.xyz

# ===========================================
# CONTRACT ADDRESSES (Auto-filled after deployment)
# ===========================================
# These will be automatically filled when you run: pnpm run deploy:curtis
NEXT_PUBLIC_APEBEATS_GENESIS_ADDRESS=
NEXT_PUBLIC_APEBEATS_METADATA_LIB_ADDRESS=
NEXT_PUBLIC_APEBEATS_ROYALTIES_ADDRESS=

# ===========================================
# WHITELIST CONFIGURATION
# ===========================================
# Delegate.xyz registry (using mainnet address)
NEXT_PUBLIC_DELEGATE_REGISTRY_ADDRESS=0x00000000000000447e69651d841bd8d104bed493

# Merkle roots for whitelist phases
# Generate these by running: pnpm run generate:merkle
NEXT_PUBLIC_GTD_MERKLE_ROOT=
NEXT_PUBLIC_FCFS_MERKLE_ROOT=

# ===========================================
# PROJECT ADDRESSES
# ===========================================
# Treasury and founder addresses (usually your wallet)
# These will be auto-filled during deployment
NEXT_PUBLIC_TREASURY_ADDRESS=
NEXT_PUBLIC_FOUNDER_ADDRESS=
```

**Important Notes:**
- Replace `your_private_key_here` with your actual private key
- Get testnet APE tokens from Curtis Testnet faucet
- Contract addresses will be filled automatically after deployment
- Merkle roots will be filled after generating whitelist

### 3. Deploy to Curtis Testnet

```bash
# Deploy contracts
pnpm run deploy

# Test contracts
pnpm run test:contracts

# Start development server
pnpm dev
```

### 4. Test Mint Page

Visit `http://localhost:3000/mint` to test the minting interface.

## 🛠️ Available Scripts

### Core Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Setup | `pnpm run setup` | Initialize project and create directories |
| Deploy | `pnpm run deploy` | Deploy contracts to Curtis Testnet |
| Deploy Mainnet | `pnpm run deploy:mainnet` | Deploy contracts to ApeChain Mainnet |
| Test | `pnpm run test:contracts` | Test deployed contracts |
| Generate Assets | `pnpm run generate:assets` | Generate audio assets and waveforms |
| Generate Metadata | `pnpm run generate:metadata` | Generate NFT metadata and rarity analysis |
| Generate Merkle | `pnpm run generate:merkle` | Generate Merkle trees for whitelist |
| Update Merkle | `pnpm run update:merkle` | Update Merkle roots in contracts |
| Reveal | `pnpm run reveal` | Reveal NFTs and set metadata |
| Withdraw | `pnpm run withdraw` | Withdraw funds from contracts |
| Verify Merkle | `pnpm run verify:merkle` | Verify Merkle proof validity |

### Complete Workflow

1. **Initial Setup**:
   ```bash
   pnpm run setup
   # Add private key to .env.local
   # Get testnet APE tokens
   ```

2. **Deploy and Test**:
   ```bash
   pnpm run deploy
   pnpm run test:contracts
   ```

3. **Prepare for Launch**:
   ```bash
   pnpm run generate:assets
   pnpm run generate:metadata
   pnpm run generate:merkle
   pnpm run update:merkle
   ```

4. **After Minting**:
   ```bash
   pnpm run reveal
   ```

5. **Withdraw Funds**:
   ```bash
   pnpm run withdraw
   ```

## 🔧 Environment Variables Guide

### Where to Get Each Value

| Variable | Source | How to Get |
|----------|--------|------------|
| `PRIVATE_KEY` | Your wallet | Export from MetaMask, WalletConnect, etc. |
| `NEXT_PUBLIC_APEBEATS_GENESIS_ADDRESS` | Deployment script | Auto-filled after `pnpm run deploy:curtis` |
| `NEXT_PUBLIC_APEBEATS_METADATA_LIB_ADDRESS` | Deployment script | Auto-filled after `pnpm run deploy:curtis` |
| `NEXT_PUBLIC_APEBEATS_ROYALTIES_ADDRESS` | Deployment script | Auto-filled after `pnpm run deploy:curtis` |
| `NEXT_PUBLIC_GTD_MERKLE_ROOT` | Merkle generator | Generated by `pnpm run generate:merkle` |
| `NEXT_PUBLIC_FCFS_MERKLE_ROOT` | Merkle generator | Generated by `pnpm run generate:merkle` |
| `NEXT_PUBLIC_TREASURY_ADDRESS` | Your wallet | Your wallet address (usually same as deployer) |
| `NEXT_PUBLIC_FOUNDER_ADDRESS` | Your wallet | Your wallet address (usually same as deployer) |

### Step-by-Step Setup

1. **Get Private Key**:
   - Open MetaMask or your wallet
   - Go to Account Details → Export Private Key
   - Copy the private key (starts with 0x)

2. **Get Testnet APE**:
   - Visit Curtis Testnet faucet
   - Connect your wallet
   - Request testnet APE tokens

3. **Deploy Contracts**:
   - Run `pnpm run deploy:curtis`
   - Contract addresses will be auto-filled in `.env.local`

4. **Generate Whitelist** (Optional):
   - Update addresses in `scripts/generate-merkle.js`
   - Run `pnpm run generate:merkle`
   - Merkle roots will be auto-filled in `.env.local`

## 🔧 Smart Contracts

### ApeBeatsGenesis.sol

**Features:**
- ERC721 with upgradeable proxy pattern
- Multi-phase minting (Founder, GTD, FCFS, Public)
- Delegate.xyz integration for vault support
- Automatic phase transitions
- Royalty integration

**Minting Phases:**
1. **Founder Mint**: 4 free NFTs to founder
2. **GTD Mint**: 42 NFTs at 4.2 APE each (whitelist required)
3. **FCFS Mint**: Unlimited at 6.9 APE each (whitelist required)
4. **Public Mint**: Until sold out at 6.9 APE each

### ApeBeatsMetadataLib.sol

**Features:**
- On-chain metadata generation
- Reveal mechanism
- Audio loop management
- Rarity scoring system
- Dynamic waveform generation

### ApeBeatsRoyalties.sol

**Features:**
- 4.2% royalty on all sales
- Original minter tracking
- Community pool distribution
- Automatic royalty claims

## 🎵 Music Generation

The music generation system creates unique audio combinations using:

- **Bass Loops**: 5 different bass patterns
- **Drum Loops**: 5 different drum patterns  
- **Melody Loops**: 5 different melody patterns
- **FX Loops**: 5 different effect patterns
- **Color Schemes**: 11 different color combinations

Each NFT gets a unique combination of these elements, creating 3,125 possible combinations.

## 🎨 Visual Generation

Visual elements include:
- **Waveform Visualizations**: Dynamic audio waveforms
- **Color Schemes**: Procedurally generated color palettes
- **Background Effects**: Psychedelic visual effects
- **Rarity Indicators**: Visual rarity scoring

## 🔐 Security Features

- **Merkle Tree Whitelisting**: Gas-efficient whitelist verification
- **Reentrancy Protection**: Prevents reentrancy attacks
- **Access Control**: Proper ownership and role management
- **Upgrade Safety**: Safe upgradeable proxy pattern
- **Delegate.xyz Integration**: Secure vault delegation

## 📊 Deployment Process

### Curtis Testnet Deployment

1. **Setup Environment**:
   ```bash
   pnpm run setup
   ```

2. **Configure Environment**:
   - Add private key to `.env.local`
   - Get testnet APE tokens from faucet

3. **Deploy Contracts**:
   ```bash
   pnpm run deploy:curtis
   ```

4. **Test Deployment**:
   ```bash
   pnpm run test:contracts
   ```

5. **Start Frontend**:
   ```bash
   pnpm dev
   ```

### Mainnet Deployment

1. **Prepare Whitelist**:
   ```bash
   pnpm run generate:merkle
   ```

2. **Update Configuration**:
   - Update Merkle roots in contracts
   - Configure IPFS for metadata
   - Set up audio loop data

3. **Deploy to Mainnet**:
   ```bash
   pnpm run deploy:mainnet
   ```

4. **Verify Contracts**:
   - Verify on block explorer
   - Test all functionality
   - Monitor deployment

## 🧪 Testing

### Contract Testing

```bash
# Test deployed contracts
pnpm run test:contracts

# Test Merkle proofs
pnpm run verify:merkle

# Run unit tests
pnpm test
```

### Frontend Testing

```bash
# Start development server
pnpm dev

# Test mint page
# Visit http://localhost:3000/mint

# Test wallet connection
# Test minting functionality
# Test different phases
```

## 🔄 Minting Flow

1. **User connects wallet**
2. **System checks current phase**
3. **User selects quantity**
4. **System validates parameters**
5. **User confirms transaction**
6. **NFT is minted and revealed**
7. **Metadata is generated**
8. **Royalties are recorded**

## 📈 Analytics & Monitoring

Track important metrics:
- **Mint Progress**: Total minted vs. supply
- **Phase Transitions**: Automatic phase changes
- **Revenue Tracking**: APE collected per phase
- **User Engagement**: Unique minters
- **Gas Usage**: Transaction costs

## 🛠️ Troubleshooting

### Common Issues

1. **Deployment Fails**:
   - Check private key in `.env.local`
   - Ensure sufficient APE balance
   - Verify network configuration

2. **Minting Fails**:
   - Check wallet connection
   - Verify sufficient balance
   - Check Merkle proof validity

3. **Metadata Issues**:
   - Verify IPFS configuration
   - Check audio loop data
   - Test reveal mechanism

### Debug Commands

```bash
# Check deployment status
cat deployments/curtis-testnet.json

# Verify environment
cat .env.local

# Check contract compilation
pnpm run compile

# Clean artifacts
pnpm run clean
```

## 🔮 Future Enhancements

- **Dynamic Pricing**: Adjustable mint prices
- **Staking System**: NFT staking for rewards
- **Marketplace Integration**: Built-in trading
- **Cross-chain Support**: Multi-chain deployment
- **AI Generation**: AI-powered music generation

## 📞 Support

For technical support:
1. Check deployment logs
2. Verify contract addresses
3. Test on Curtis Testnet first
4. Review smart contract code
5. Check frontend configuration

## 🎉 Success Metrics

A successful deployment should achieve:
- ✅ All contracts deployed and verified
- ✅ Mint page functional and responsive
- ✅ All minting phases working
- ✅ Metadata generation working
- ✅ Royalty system operational
- ✅ Frontend integration complete

---

**Remember**: Always use `pnpm` for package management and test thoroughly on Curtis Testnet before mainnet deployment!
