#!/usr/bin/env node

/**
 * ApeBeats Genesis NFT Reveal Script
 * Reveals NFTs and sets up metadata for the collection
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🎭 Starting ApeBeats Genesis NFT reveal process...\n');

  // Load deployment info
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'curtis-testnet.json');
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ Deployment info not found. Please run deploy.js first.');
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log('📋 Using deployment from:', deployment.timestamp);

  // Get contracts
  const [deployer] = await ethers.getSigners();
  console.log('👤 Using account:', deployer.address);

  const Genesis = await ethers.getContractFactory('ApeBeatsGenesis');
  const genesis = Genesis.attach(deployment.contracts.ApeBeatsGenesis);

  const MetadataLib = await ethers.getContractFactory('ApeBeatsMetadataLib');
  const metadataLib = MetadataLib.attach(deployment.contracts.ApeBeatsMetadataLib);

  // Check current state
  const totalMinted = await genesis.totalMinted();
  const isRevealed = await metadataLib.revealed();
  
  console.log(`📊 Current state:`);
  console.log(`   Total minted: ${totalMinted}`);
  console.log(`   Revealed: ${isRevealed}`);

  if (totalMinted === 0) {
    console.log('❌ No NFTs minted yet. Please mint some NFTs first.');
    return;
  }

  // Set up audio loops in metadata library
  console.log('\n🎵 Setting up audio loops...');
  
  const bassLoops = [
    'Deep Bass Loop 1',
    'Deep Bass Loop 2', 
    'Deep Bass Loop 3',
    'Deep Bass Loop 4',
    'Deep Bass Loop 5'
  ];

  const drumLoops = [
    'Hip Hop Drums 1',
    'Hip Hop Drums 2',
    'Hip Hop Drums 3', 
    'Hip Hop Drums 4',
    'Hip Hop Drums 5'
  ];

  const melodyLoops = [
    'Ambient Melody 1',
    'Ambient Melody 2',
    'Ambient Melody 3',
    'Ambient Melody 4', 
    'Ambient Melody 5'
  ];

  const fxLoops = [
    'Psychedelic FX 1',
    'Psychedelic FX 2',
    'Psychedelic FX 3',
    'Psychedelic FX 4',
    'Psychedelic FX 5'
  ];

  // Note: In a real implementation, you would set these loops in the metadata library
  // For now, we'll just log what would be set
  console.log('✅ Audio loops configured (simulated)');

  // Enable reveal
  console.log('\n🔓 Enabling reveal...');
  await metadataLib.setRevealed(true);
  console.log('✅ Reveal enabled');

  // Reveal each minted NFT
  console.log('\n🎭 Revealing NFTs...');
  for (let tokenId = 1; tokenId <= totalMinted; tokenId++) {
    try {
      const owner = await genesis.ownerOf(tokenId);
      await genesis.reveal(tokenId);
      console.log(`✅ Revealed token ${tokenId} (owner: ${owner})`);
    } catch (error) {
      console.log(`❌ Failed to reveal token ${tokenId}:`, error.message);
    }
  }

  // Set up metadata URIs for each revealed NFT
  console.log('\n📝 Setting up metadata URIs...');
  for (let tokenId = 1; tokenId <= totalMinted; tokenId++) {
    try {
      // In a real implementation, you would generate and upload:
      // - Waveform images to IPFS
      // - Mixed audio files to IPFS
      // - Set the URIs in the metadata library
      
      const waveformURI = `https://ipfs.io/ipfs/QmWaveform${tokenId}`;
      const mixedAudioURI = `https://ipfs.io/ipfs/QmAudio${tokenId}`;
      
      await metadataLib.setWaveformURI(tokenId, waveformURI);
      await metadataLib.setMixedAudioURI(tokenId, mixedAudioURI);
      
      console.log(`✅ Set metadata URIs for token ${tokenId}`);
    } catch (error) {
      console.log(`❌ Failed to set metadata for token ${tokenId}:`, error.message);
    }
  }

  // Test token URI generation
  console.log('\n🧪 Testing token URI generation...');
  try {
    const tokenURI = await genesis.tokenURI(1);
    console.log('✅ Token URI generated successfully');
    console.log('📄 Sample token URI:', tokenURI.substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ Failed to generate token URI:', error.message);
  }

  // Create reveal report
  const revealReport = {
    timestamp: new Date().toISOString(),
    network: deployment.network,
    totalRevealed: totalMinted,
    contracts: deployment.contracts,
    audioLoops: {
      bass: bassLoops,
      drums: drumLoops,
      melody: melodyLoops,
      fx: fxLoops
    }
  };

  const reportPath = path.join(__dirname, '..', 'test-reports', 'reveal-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(revealReport, null, 2));
  console.log('💾 Reveal report saved to:', reportPath);

  console.log('\n🎉 NFT reveal process completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Upload actual waveform images to IPFS');
  console.log('2. Upload actual audio files to IPFS');
  console.log('3. Update metadata URIs with real IPFS hashes');
  console.log('4. Test token metadata on OpenSea or similar');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Reveal process failed:', error);
    process.exit(1);
  });
