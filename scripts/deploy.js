#!/usr/bin/env node

/**
 * ApeBeats Genesis NFT Deployment Script
 * Deploys contracts to Curtis Testnet and configures them
 */

const { ethers } = require('hardhat');
const { getContractAddress } = require('@ethersproject/address');
const fs = require('fs');
const path = require('path');

// Curtis Testnet configuration (matching original ApeWavesProject)
const CURTIS_TESTNET = {
  chainId: 33111,
  name: 'Curtis Testnet',
  rpcUrl: 'https://curtis.rpc.caldera.xyz/http',
  explorerUrl: 'https://curtis.apescan.io'
};

// Delegate.xyz registry address (matching original)
const DELEGATE_REGISTRY = '0x00000000000000447e69651d841bD8D104Bed493';

async function main() {
  console.log('🚀 Starting ApeBeats Genesis deployment to Curtis Testnet...\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'APE\n');

  const initialNonce = await ethers.provider.getTransactionCount(deployer.address);
  console.log('📊 Initial nonce:', initialNonce);

  // Load pre-generated Merkle roots (matching original structure)
  const gtdMerkleTreePath = path.join(__dirname, '..', 'merkle', 'gtdMerkleTree.json');
  const fcfsMerkleTreePath = path.join(__dirname, '..', 'merkle', 'fcfsMerkleTree.json');
  let gtdMerkleRoot, fcfsMerkleRoot;

  try {
    const gtdMerkleData = JSON.parse(fs.readFileSync(gtdMerkleTreePath, 'utf8'));
    gtdMerkleRoot = gtdMerkleData.root;
    console.log('🌳 GTD Merkle root loaded:', gtdMerkleRoot);
  } catch (error) {
    console.error('❌ Error loading gtdMerkleTree.json:', error.message);
    gtdMerkleRoot = "0x" + "0".repeat(64); // Default value if file missing
  }

  try {
    const fcfsMerkleData = JSON.parse(fs.readFileSync(fcfsMerkleTreePath, 'utf8'));
    fcfsMerkleRoot = fcfsMerkleData.root;
    console.log('🌳 FCFS Merkle root loaded:', fcfsMerkleRoot);
  } catch (error) {
    console.error('❌ Error loading fcfsMerkleTree.json:', error.message);
    fcfsMerkleRoot = "0x" + "0".repeat(64); // Default value if file missing
  }

  const treasury = deployer.address;
  const prerevealURI = "ipfs://bafkreic4c7m7tq75mxcy7mxctt5r5crkjwsjk23fnzbkx5lyesqx5l4jai";

  // Pre-calculate addresses (matching original pattern)
  const metadataLibPredicted = getContractAddress({ from: deployer.address, nonce: initialNonce });
  const royaltiesPredicted = getContractAddress({ from: deployer.address, nonce: initialNonce + 1 });
  const genesisImplPredicted = getContractAddress({ from: deployer.address, nonce: initialNonce + 2 });
  const proxyPredicted = getContractAddress({ from: deployer.address, nonce: initialNonce + 3 });

  console.log('🔮 Predicted addresses:');
  console.log('   - ApeBeatsMetadataLib:', metadataLibPredicted);
  console.log('   - ApeBeatsRoyalties:', royaltiesPredicted);
  console.log('   - ApeBeatsGenesis Implementation:', genesisImplPredicted);
  console.log('   - LocalProxy:', proxyPredicted);

  // Deploy ApeBeatsMetadataLib
  console.log('📦 Deploying ApeBeatsMetadataLib...');
  const MetadataLib = await ethers.getContractFactory('ApeBeatsMetadataLib');
  const metadataLib = await MetadataLib.deploy();
  await metadataLib.waitForDeployment();
  const metadataLibAddress = metadataLib.target;
  console.log('✅ ApeBeatsMetadataLib deployed to:', metadataLibAddress);

  // Deploy ApeBeatsRoyalties
  console.log('📦 Deploying ApeBeatsRoyalties...');
  const Royalties = await ethers.getContractFactory('ApeBeatsRoyalties');
  const royalties = await Royalties.deploy(treasury, deployer.address);
  await royalties.waitForDeployment();
  const royaltiesAddress = royalties.target;
  console.log('✅ ApeBeatsRoyalties deployed to:', royaltiesAddress);

  // Deploy ApeBeatsGenesis Implementation
  console.log('📦 Deploying ApeBeatsGenesis Implementation...');
  const ApeBeatsGenesis = await ethers.getContractFactory('ApeBeatsGenesis');
  const genesisImpl = await ApeBeatsGenesis.deploy();
  await genesisImpl.waitForDeployment();
  const genesisImplAddress = genesisImpl.target;
  console.log('✅ ApeBeatsGenesis Implementation deployed to:', genesisImplAddress);

  // Deploy LocalProxy
  console.log('📦 Deploying LocalProxy...');
  const Proxy = await ethers.getContractFactory('LocalProxy');
  const proxy = await Proxy.deploy(genesisImplAddress);
  await proxy.waitForDeployment();
  const proxyAddress = proxy.target;
  console.log('✅ LocalProxy deployed to:', proxyAddress);

  // Initialize ApeBeatsGenesis through proxy
  console.log('🔧 Initializing ApeBeatsGenesis...');
  const genesis = ApeBeatsGenesis.attach(proxyAddress);
  const initTx = await genesis.initialize(
    gtdMerkleRoot,
    fcfsMerkleRoot,
    treasury,
    metadataLibAddress,
    royaltiesAddress,
    DELEGATE_REGISTRY,
    { gasLimit: 5000000 }
  );
  await initTx.wait();
  console.log('✅ ApeBeatsGenesis initialized');

  // Transfer ownership of ApeBeatsRoyalties to proxy
  console.log('🔄 Transferring ApeBeatsRoyalties ownership to proxy...');
  await royalties.transferOwnership(proxyAddress, { gasLimit: 5000000 });
  console.log('✅ ApeBeatsRoyalties ownership transferred to:', await royalties.owner());

  // Transfer ownership of ApeBeatsMetadataLib to proxy
  console.log('🔄 Transferring ApeBeatsMetadataLib ownership to proxy...');
  await metadataLib.transferOwnership(proxyAddress, { gasLimit: 5000000 });
  console.log('✅ ApeBeatsMetadataLib ownership transferred to:', await metadataLib.owner());

  // Set prereveal URI
  console.log('🔧 Setting prereveal URI...');
  const setTx = await genesis.setPrerevealNoiseBase64(prerevealURI, { gasLimit: 5000000 });
  await setTx.wait();
  console.log('✅ Prereveal URI set to:', prerevealURI);

  // Test founder mint (1 NFT)
  console.log('🧪 Testing founder mint (1 NFT)...');
  const mintFounderTx = await genesis.mintFounder(1, { gasLimit: 5000000 });
  await mintFounderTx.wait();
  console.log('✅ 1 NFT Founder minted, totalMinted now:', (await genesis.totalMinted()).toString());

  console.log('🔍 Token 1 URI:', await genesis.tokenURI(1));

  // Create deployment info (matching original structure)
  const deploymentInfo = {
    network: CURTIS_TESTNET,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ApeBeatsGenesis: proxyAddress, // Use proxy address as main contract
      ApeBeatsGenesisImpl: genesisImplAddress,
      ApeBeatsMetadataLib: metadataLibAddress,
      ApeBeatsRoyalties: royaltiesAddress,
      LocalProxy: proxyAddress
    },
    merkleRoots: {
      gtd: gtdMerkleRoot,
      fcfs: fcfsMerkleRoot
    },
    configuration: {
      totalSupply: 420,
      founderMintAmount: 4,
      gtdMintAmount: 42,
      gtdPrice: '4.2',
      fcfsPrice: '6.9',
      publicPrice: '6.9',
      royaltyBasisPoints: 420,
      prerevealURI: prerevealURI,
      delegateRegistry: DELEGATE_REGISTRY
    }
  };

  // Save deployment info
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'curtis-testnet.json');
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('💾 Deployment info saved to:', deploymentPath);

  // Generate .env.local content
  const envContent = `# ApeBeats Genesis - Curtis Testnet Deployment
# Generated on ${new Date().toISOString()}

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=33111
NEXT_PUBLIC_CHAIN_NAME=Curtis Testnet
NEXT_PUBLIC_RPC_URL=https://rpc.curtis.apechain.xyz
NEXT_PUBLIC_EXPLORER_URL=https://curtis.apescan.io

# Contract Addresses
NEXT_PUBLIC_APEBEATS_GENESIS_ADDRESS=${genesisAddress}
NEXT_PUBLIC_APEBEATS_METADATA_LIB_ADDRESS=${metadataLibAddress}
NEXT_PUBLIC_APEBEATS_ROYALTIES_ADDRESS=${royaltiesAddress}

# Delegate Registry
NEXT_PUBLIC_DELEGATE_REGISTRY_ADDRESS=${DELEGATE_REGISTRY}

# Merkle Roots (Update these with actual values)
NEXT_PUBLIC_GTD_MERKLE_ROOT=${emptyMerkleRoot}
NEXT_PUBLIC_FCFS_MERKLE_ROOT=${emptyMerkleRoot}

# Treasury and Founder
NEXT_PUBLIC_TREASURY_ADDRESS=${deployer.address}
NEXT_PUBLIC_FOUNDER_ADDRESS=${deployer.address}
`;

  const envPath = path.join(__dirname, '..', '.env.local');
  fs.writeFileSync(envPath, envContent);
  console.log('🔧 .env.local file generated');

  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update the Merkle roots in the contracts with actual whitelist data');
  console.log('2. Test the minting functionality');
  console.log('3. Set up the metadata library with audio loops');
  console.log('4. Configure the reveal process');
  console.log('\n🔗 Contract addresses:');
  console.log(`   ApeBeatsGenesis: ${genesisAddress}`);
  console.log(`   ApeBeatsMetadataLib: ${metadataLibAddress}`);
  console.log(`   ApeBeatsRoyalties: ${royaltiesAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
