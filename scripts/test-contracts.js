#!/usr/bin/env node

/**
 * ApeBeats Genesis Contract Testing Script
 * Tests all contract functionality on Curtis Testnet
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🧪 Starting ApeBeats Genesis contract tests...\n');

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
  console.log('👤 Deployer:', deployer.address);
  
  // Use deployer as test user for now
  const testUser = deployer;

  const Genesis = await ethers.getContractFactory('ApeBeatsGenesis');
  const genesis = Genesis.attach(deployment.contracts.ApeBeatsGenesis);

  const MetadataLib = await ethers.getContractFactory('ApeBeatsMetadataLib');
  const metadataLib = MetadataLib.attach(deployment.contracts.ApeBeatsMetadataLib);

  const Royalties = await ethers.getContractFactory('ApeBeatsRoyalties');
  const royalties = Royalties.attach(deployment.contracts.ApeBeatsRoyalties);

  console.log('\n🔍 Testing contract states...');

  // Test 1: Check initial state
  console.log('\n1️⃣ Testing initial contract state...');
  const totalMinted = await genesis.totalMinted();
  const isFounderActive = await genesis.isFounderMintActive();
  const isGTDActive = await genesis.isGTDMintActive();
  const isFCFSActive = await genesis.isFCFSMintActive();
  const isPublicActive = await genesis.isPublicMintActive();

  console.log(`   Total minted: ${totalMinted}`);
  console.log(`   Founder mint active: ${isFounderActive}`);
  console.log(`   GTD mint active: ${isGTDActive}`);
  console.log(`   FCFS mint active: ${isFCFSActive}`);
  console.log(`   Public mint active: ${isPublicActive}`);

  // Test 2: Founder mint (if active)
  if (isFounderActive) {
    console.log('\n2️⃣ Testing founder mint...');
    try {
      const tx = await genesis.connect(deployer).mintFounder(1);
      await tx.wait();
      console.log('✅ Founder mint successful');
      
      const newTotalMinted = await genesis.totalMinted();
      console.log(`   New total minted: ${newTotalMinted}`);
    } catch (error) {
      console.log('❌ Founder mint failed:', error.message);
    }
  }

  // Test 3: Check token URI
  console.log('\n3️⃣ Testing token URI...');
  try {
    const tokenURI = await genesis.tokenURI(1);
    console.log('✅ Token URI retrieved:', tokenURI.substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ Token URI failed:', error.message);
  }

  // Test 4: Test metadata library
  console.log('\n4️⃣ Testing metadata library...');
  try {
    const revealed = await metadataLib.revealed();
    console.log(`   Revealed state: ${revealed}`);
    
    // Test setting revealed (only owner)
    if (deployer.address === await metadataLib.owner()) {
      await metadataLib.setRevealed(true);
      console.log('✅ Set revealed to true');
    }
  } catch (error) {
    console.log('❌ Metadata library test failed:', error.message);
  }

  // Test 5: Test royalties contract
  console.log('\n5️⃣ Testing royalties contract...');
  try {
    const treasury = await royalties.treasury();
    const founder = await royalties.founder();
    const totalMintedRoyalties = await royalties.totalMinted();
    
    console.log(`   Treasury: ${treasury}`);
    console.log(`   Founder: ${founder}`);
    console.log(`   Total minted (royalties): ${totalMintedRoyalties}`);
    console.log('✅ Royalties contract state verified');
  } catch (error) {
    console.log('❌ Royalties contract test failed:', error.message);
  }

  // Test 6: Test public mint (if active)
  if (isPublicActive) {
    console.log('\n6️⃣ Testing public mint...');
    try {
      const price = await genesis.PUBLIC_PRICE();
      const tx = await genesis.connect(testUser).mintPublic(1, { value: price });
      await tx.wait();
      console.log('✅ Public mint successful');
      
      const newTotalMinted = await genesis.totalMinted();
      console.log(`   New total minted: ${newTotalMinted}`);
    } catch (error) {
      console.log('❌ Public mint failed:', error.message);
    }
  }

  // Test 7: Test contract ownership
  console.log('\n7️⃣ Testing contract ownership...');
  try {
    const genesisOwner = await genesis.owner();
    const metadataOwner = await metadataLib.owner();
    const royaltiesOwner = await royalties.owner();
    
    console.log(`   Genesis owner: ${genesisOwner}`);
    console.log(`   Metadata owner: ${metadataOwner}`);
    console.log(`   Royalties owner: ${royaltiesOwner}`);
    
    if (genesisOwner === deployer.address && 
        metadataOwner === deployer.address && 
        royaltiesOwner === deployer.address) {
      console.log('✅ All contracts owned by deployer');
    } else {
      console.log('❌ Ownership mismatch detected');
    }
  } catch (error) {
    console.log('❌ Ownership test failed:', error.message);
  }

  // Test 8: Test contract balances
  console.log('\n8️⃣ Testing contract balances...');
  try {
    const genesisBalance = await ethers.provider.getBalance(await genesis.getAddress());
    const royaltiesBalance = await ethers.provider.getBalance(await royalties.getAddress());
    
    console.log(`   Genesis balance: ${ethers.formatEther(genesisBalance)} APE`);
    console.log(`   Royalties balance: ${ethers.formatEther(royaltiesBalance)} APE`);
    console.log('✅ Contract balances retrieved');
  } catch (error) {
    console.log('❌ Balance test failed:', error.message);
  }

  // Generate test report
  const testReport = {
    timestamp: new Date().toISOString(),
    network: deployment.network,
    contracts: deployment.contracts,
    tests: {
      initialState: {
        totalMinted: totalMinted.toString(),
        founderActive: isFounderActive,
        gtdActive: isGTDActive,
        fcfsActive: isFCFSActive,
        publicActive: isPublicActive
      },
      deployer: deployer.address,
      testUser: testUser.address
    }
  };

  const reportPath = path.join(__dirname, '..', 'test-reports', 'contract-test.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
  console.log('💾 Test report saved to:', reportPath);

  console.log('\n🎉 Contract testing completed!');
  console.log('\n📋 Test Summary:');
  console.log(`   Network: ${deployment.network.name}`);
  console.log(`   Total Minted: ${totalMinted}`);
  console.log(`   Founder Mint Active: ${isFounderActive}`);
  console.log(`   GTD Mint Active: ${isGTDActive}`);
  console.log(`   FCFS Mint Active: ${isFCFSActive}`);
  console.log(`   Public Mint Active: ${isPublicActive}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });
