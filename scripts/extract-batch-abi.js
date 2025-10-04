#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const artifactPath = path.join(process.cwd(), 'artifacts/contracts/BatchTransferSecure.sol/BatchTransferSecure.json');

function extractBatchTransferABI() {
  console.log('🔄 Extracting BatchTransferSecure ABI...');
  
  if (!fs.existsSync(artifactPath)) {
    console.error('❌ BatchTransferSecure artifact not found!');
    return;
  }
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = artifact.abi;
  
  // Filter for the functions we need
  const requiredFunctions = [
    'batchTransfer',
    'batchTransferEqual',
    'batchTransferToken',
    'batchTransferTokenEqual',
    'calculateFee',
    'feeBps',
    'getTokenFee',
    'isTokenSupported',
    'getUserStats',
    'getGlobalStats',
    'getCurrentBlock'
  ];
  
  const filteredABI = abi.filter(item => {
    if (item.type === 'function') {
      return requiredFunctions.includes(item.name);
    }
    if (item.type === 'error') {
      return true; // Include all errors
    }
    if (item.type === 'constructor') {
      return true;
    }
    return false;
  });
  
  console.log('✅ Extracted ABI with', filteredABI.length, 'items');
  console.log('📋 Functions found:', filteredABI.filter(item => item.type === 'function').map(item => item.name));
  
  // Write to a new file
  const outputPath = path.join(process.cwd(), 'lib/batchTransferABI.json');
  fs.writeFileSync(outputPath, JSON.stringify(filteredABI, null, 2));
  console.log('✅ ABI saved to lib/batchTransferABI.json');
  
  return filteredABI;
}

if (require.main === module) {
  extractBatchTransferABI();
}

module.exports = { extractBatchTransferABI };

