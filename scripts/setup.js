#!/usr/bin/env node

/**
 * ApeBeats Genesis Setup Script
 * Initializes the project for deployment and testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up ApeBeats Genesis project...\n');

// Create necessary directories
const directories = [
  'deployments',
  'merkle',
  'test-reports',
  'artifacts',
  'cache'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Create .env.local if it doesn't exist
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# ApeBeats Genesis - Environment Configuration
# Fill in the values below before deployment

# ===========================================
# DEPLOYMENT CONFIGURATION
# ===========================================
# Your wallet's private key for deployment
# ⚠️  NEVER commit this to version control!
# Get this from your wallet (MetaMask, etc.)
PRIVATE_KEY=your_private_key_here

# ===========================================
# BLOCKCHAIN CONFIGURATION
# ===========================================
# RPC URLs (matching original ApeWavesProject)
RPC_URL_APECHAIN=https://apechain.rpc.caldera.xyz/http
RPC_URL_CURTIS=https://curtis.rpc.caldera.xyz/http

# ===========================================
# THIRDWEB CONFIGURATION
# ===========================================
# ThirdWeb credentials for IPFS and wallet management
THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key_here

# ===========================================
# IPFS CONFIGURATION (Pinata)
# ===========================================
# Pinata credentials for IPFS storage
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here

# ===========================================
# CONTRACT ADDRESSES (Auto-filled after deployment)
# ===========================================
# These will be automatically filled when you run: pnpm run deploy
CONTRACT_ADDRESS=
METADATA_LIB_ADDRESS=
ROYALTIES_ADDRESS=

# ===========================================
# PROJECT ADDRESSES
# ===========================================
# Treasury and founder addresses (usually your wallet)
TREASURY_ADDRESS=your_treasury_address_here
FOUNDER_ADDRESS=your_founder_address_here

# ===========================================
# DELEGATE REGISTRY
# ===========================================
# Delegate.xyz registry (ApeChain mainnet)
DELEGATE_REGISTRY=0x00000000000000447e69651d841bD8D104Bed493

# ===========================================
# PREREVEAL CONFIGURATION
# ===========================================
# Prereveal URI for NFTs before reveal
PREREVEAL_URI=ipfs://bafkreic4c7m7tq75mxcy7mxctt5r5crkjwsjk23fnzbkx5lyesqx5l4jai
`;

  fs.writeFileSync(envPath, envContent);
  console.log('🔧 Created .env.local file with comprehensive template');
}

// Create .gitignore entries for sensitive files
const gitignorePath = path.join(__dirname, '..', '.gitignore');
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

const sensitiveEntries = [
  '',
  '# ApeBeats Genesis sensitive files',
  '.env.local',
  'deployments/',
  'merkle/',
  'test-reports/',
  'artifacts/',
  'cache/',
  '*.log'
];

let needsUpdate = false;
sensitiveEntries.forEach(entry => {
  if (entry && !gitignoreContent.includes(entry)) {
    gitignoreContent += entry + '\n';
    needsUpdate = true;
  }
});

if (needsUpdate) {
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('🔒 Updated .gitignore with sensitive files');
}

// Install dependencies if package.json exists
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('pnpm install', { stdio: 'inherit', cwd: path.dirname(packageJsonPath) });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
  }
}

// Compile contracts
console.log('\n🔨 Compiling contracts...');
try {
  execSync('npx hardhat compile', { stdio: 'inherit', cwd: path.dirname(packageJsonPath) });
  console.log('✅ Contracts compiled successfully');
} catch (error) {
  console.log('❌ Failed to compile contracts:', error.message);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Add your private key to .env.local (NEVER commit this)');
console.log('2. Get testnet APE tokens from Curtis Testnet faucet');
console.log('3. Run: pnpm run deploy:curtis');
console.log('4. Run: pnpm run test:contracts');
console.log('5. Start development server: pnpm dev');
console.log('\n📖 See DEPLOYMENT_GUIDE.md for detailed instructions');
console.log('⚠️  Remember to use pnpm for all package management operations!');
