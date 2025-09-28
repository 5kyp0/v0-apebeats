#!/usr/bin/env node

/**
 * ApeBeats Genesis Funds Withdrawal Script
 * Withdraws funds from contracts to treasury
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('💰 Starting ApeBeats Genesis funds withdrawal...\n');

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

  const Royalties = await ethers.getContractFactory('ApeBeatsRoyalties');
  const royalties = Royalties.attach(deployment.contracts.ApeBeatsRoyalties);

  // Check balances
  const genesisBalance = await ethers.provider.getBalance(await genesis.getAddress());
  const royaltiesBalance = await ethers.provider.getBalance(await royalties.getAddress());
  const treasuryBalance = await ethers.provider.getBalance(deployment.contracts.treasury || deployer.address);

  console.log('📊 Current balances:');
  console.log(`   Genesis contract: ${ethers.formatEther(genesisBalance)} APE`);
  console.log(`   Royalties contract: ${ethers.formatEther(royaltiesBalance)} APE`);
  console.log(`   Treasury: ${ethers.formatEther(treasuryBalance)} APE`);

  // Withdraw from Genesis contract
  if (genesisBalance > 0) {
    console.log('\n💸 Withdrawing from Genesis contract...');
    try {
      const tx = await genesis.withdraw();
      await tx.wait();
      console.log('✅ Genesis contract withdrawal successful');
    } catch (error) {
      console.log('❌ Genesis contract withdrawal failed:', error.message);
    }
  } else {
    console.log('ℹ️  Genesis contract has no funds to withdraw');
  }

  // Check if user can claim royalties
  console.log('\n👑 Checking royalty claims...');
  try {
    const userRoyaltyBalance = await royalties.royaltyBalances(deployer.address);
    const poolRoyalties = await royalties.poolRoyalties();
    
    console.log(`   User royalty balance: ${ethers.formatEther(userRoyaltyBalance)} APE`);
    console.log(`   Pool royalties: ${ethers.formatEther(poolRoyalties)} APE`);
    
    if (userRoyaltyBalance > 0) {
      console.log('💸 Claiming user royalties...');
      const tx = await royalties.claimRoyalties();
      await tx.wait();
      console.log('✅ User royalties claimed successfully');
    }
    
    if (poolRoyalties > 0) {
      console.log('💸 Claiming pool royalties...');
      const tx = await royalties.claimPoolRoyalties();
      await tx.wait();
      console.log('✅ Pool royalties claimed successfully');
    }
  } catch (error) {
    console.log('❌ Royalty claim failed:', error.message);
  }

  // Check final balances
  const finalGenesisBalance = await ethers.provider.getBalance(await genesis.getAddress());
  const finalRoyaltiesBalance = await ethers.provider.getBalance(await royalties.getAddress());
  const finalTreasuryBalance = await ethers.provider.getBalance(deployment.contracts.treasury || deployer.address);

  console.log('\n📊 Final balances:');
  console.log(`   Genesis contract: ${ethers.formatEther(finalGenesisBalance)} APE`);
  console.log(`   Royalties contract: ${ethers.formatEther(finalRoyaltiesBalance)} APE`);
  console.log(`   Treasury: ${ethers.formatEther(finalTreasuryBalance)} APE`);

  // Calculate total withdrawn
  const totalWithdrawn = genesisBalance - finalGenesisBalance + royaltiesBalance - finalRoyaltiesBalance;
  console.log(`\n💰 Total withdrawn: ${ethers.formatEther(totalWithdrawn)} APE`);

  // Create withdrawal report
  const withdrawalReport = {
    timestamp: new Date().toISOString(),
    network: deployment.network,
    withdrawer: deployer.address,
    contracts: deployment.contracts,
    balances: {
      before: {
        genesis: ethers.formatEther(genesisBalance),
        royalties: ethers.formatEther(royaltiesBalance),
        treasury: ethers.formatEther(treasuryBalance)
      },
      after: {
        genesis: ethers.formatEther(finalGenesisBalance),
        royalties: ethers.formatEther(finalRoyaltiesBalance),
        treasury: ethers.formatEther(finalTreasuryBalance)
      }
    },
    totalWithdrawn: ethers.formatEther(totalWithdrawn)
  };

  const reportPath = path.join(__dirname, '..', 'test-reports', 'withdrawal-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(withdrawalReport, null, 2));
  console.log('💾 Withdrawal report saved to:', reportPath);

  console.log('\n🎉 Funds withdrawal completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Funds withdrawal failed:', error);
    process.exit(1);
  });
