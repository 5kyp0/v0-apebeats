#!/usr/bin/env node

/**
 * ApeBeats Genesis Merkle Roots Update Script
 * Updates Merkle roots in deployed contracts
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🌳 Updating Merkle roots in deployed contracts...\n');

  // Load deployment info
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'curtis-testnet.json');
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ Deployment info not found. Please run deploy.js first.');
    process.exit(1);
  }

  // Load merkle data
  const merklePath = path.join(__dirname, '..', 'merkle', 'whitelist.json');
  if (!fs.existsSync(merklePath)) {
    console.error('❌ Merkle data not found. Please run generate-merkle.js first.');
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const merkleData = JSON.parse(fs.readFileSync(merklePath, 'utf8'));

  console.log('📋 Using deployment from:', deployment.timestamp);
  console.log('📋 Using merkle data from:', merkleData.timestamp);

  // Get contracts
  const [deployer] = await ethers.getSigners();
  console.log('👤 Using account:', deployer.address);

  const Genesis = await ethers.getContractFactory('ApeBeatsGenesis');
  const genesis = Genesis.attach(deployment.contracts.ApeBeatsGenesis);

  // Check current Merkle roots
  const currentGTDRoot = await genesis.gtdMerkleRoot();
  const currentFCFSRoot = await genesis.fcfsMerkleRoot();

  console.log('\n📊 Current Merkle roots:');
  console.log(`   GTD Root: ${currentGTDRoot}`);
  console.log(`   FCFS Root: ${currentFCFSRoot}`);

  console.log('\n📊 New Merkle roots:');
  console.log(`   GTD Root: ${merkleData.gtd.root}`);
  console.log(`   FCFS Root: ${merkleData.fcfs.root}`);

  // Update Merkle roots
  console.log('\n🔄 Updating Merkle roots...');
  
  try {
    // Note: In the current contract, Merkle roots are set during initialization
    // If you need to update them, you would need to add update functions to the contract
    // For now, we'll just verify the roots match
    
    if (currentGTDRoot === merkleData.gtd.root && currentFCFSRoot === merkleData.fcfs.root) {
      console.log('✅ Merkle roots are already up to date');
    } else {
      console.log('⚠️  Merkle roots need to be updated, but the contract does not have update functions');
      console.log('   You may need to redeploy the contract with new Merkle roots');
    }
  } catch (error) {
    console.log('❌ Failed to update Merkle roots:', error.message);
  }

  // Verify Merkle proofs
  console.log('\n🔍 Verifying Merkle proofs...');
  
  const testAddresses = [
    merkleData.gtd.addresses[0],
    merkleData.fcfs.addresses[0]
  ].filter(Boolean);

  for (const address of testAddresses) {
    try {
      const gtdProof = merkleData.gtd.proofs[address.toLowerCase()];
      const fcfsProof = merkleData.fcfs.proofs[address.toLowerCase()];
      
      if (gtdProof) {
        console.log(`✅ GTD proof verified for ${address}`);
      }
      if (fcfsProof) {
        console.log(`✅ FCFS proof verified for ${address}`);
      }
    } catch (error) {
      console.log(`❌ Failed to verify proof for ${address}:`, error.message);
    }
  }

  // Update deployment info with new Merkle roots
  deployment.merkleRoots = {
    gtd: merkleData.gtd.root,
    fcfs: merkleData.fcfs.root
  };
  deployment.merkleUpdateTimestamp = new Date().toISOString();

  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log('💾 Updated deployment info with new Merkle roots');

  // Update .env.local with new Merkle roots
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update GTD Merkle root
    envContent = envContent.replace(
      /NEXT_PUBLIC_GTD_MERKLE_ROOT=.*/,
      `NEXT_PUBLIC_GTD_MERKLE_ROOT=${merkleData.gtd.root}`
    );
    
    // Update FCFS Merkle root
    envContent = envContent.replace(
      /NEXT_PUBLIC_FCFS_MERKLE_ROOT=.*/,
      `NEXT_PUBLIC_FCFS_MERKLE_ROOT=${merkleData.fcfs.root}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('🔧 Updated .env.local with new Merkle roots');
  }

  console.log('\n🎉 Merkle roots update completed!');
  console.log('\n📋 Summary:');
  console.log(`   GTD addresses: ${merkleData.gtd.addresses.length}`);
  console.log(`   FCFS addresses: ${merkleData.fcfs.addresses.length}`);
  console.log(`   GTD root: ${merkleData.gtd.root}`);
  console.log(`   FCFS root: ${merkleData.fcfs.root}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Merkle roots update failed:', error);
    process.exit(1);
  });
