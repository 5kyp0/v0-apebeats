const fs = require('fs');
const path = require('path');

async function extractABI() {
  console.log('🔄 Extracting BatchTransferNative ABI...');
  
  try {
    // Read the compiled artifact
    const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'BatchTransferNative.sol', 'BatchTransferNative.json');
    
    if (!fs.existsSync(artifactPath)) {
      console.error('❌ Artifact not found. Please compile the contract first.');
      process.exit(1);
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const abi = artifact.abi;
    
    console.log(`✅ Extracted ABI with ${abi.length} items`);
    
    // List the functions
    const functions = abi
      .filter(item => item.type === 'function')
      .map(item => item.name);
    
    console.log('📋 Functions found:', functions);
    
    // Save ABI to lib directory
    const outputPath = path.join(__dirname, '..', 'lib', 'batchTransferNativeABI.json');
    fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));
    
    console.log('✅ ABI saved to lib/batchTransferNativeABI.json');
    
  } catch (error) {
    console.error('❌ Error extracting ABI:', error.message);
    process.exit(1);
  }
}

extractABI();
