#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

// The batch transfer contract address we deployed earlier
const batchContractAddress = '0xe1b88C51FB8be17BBaB21923Db03C50aFabbD801';

function addBatchContractEnv() {
  console.log('🔄 Adding batch transfer contract address to .env.local...');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    return;
  }
  
  // Read current content
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Check if the variable already exists
  if (content.includes('NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS')) {
    console.log('✅ NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS already exists in .env.local');
    return;
  }
  
  // Add the batch contract address
  const batchContractLine = `NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=${batchContractAddress}`;
  
  // Add it after the chain configuration section
  if (content.includes('NEXT_PUBLIC_EXPLORER_URL=')) {
    content = content.replace(
      /(NEXT_PUBLIC_EXPLORER_URL=.*\n)/,
      `$1\n# Batch Transfer Contract\n${batchContractLine}\n`
    );
  } else {
    // If we can't find the right place, just append it
    content += `\n# Batch Transfer Contract\n${batchContractLine}\n`;
  }
  
  // Write back to file
  fs.writeFileSync(envPath, content);
  console.log('✅ Added NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS to .env.local');
  console.log(`📍 Contract address: ${batchContractAddress}`);
  console.log('\n🔄 Please restart your development server for changes to take effect.');
}

if (require.main === module) {
  addBatchContractEnv();
}

module.exports = { addBatchContractEnv };

