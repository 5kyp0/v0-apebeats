#!/usr/bin/env node

/**
 * ApeBeats Genesis Merkle Tree Generator
 * Generates Merkle trees for GTD and FCFS whitelist phases
 */

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const path = require('path');

// Load holders from files (matching original structure)
function loadHolders() {
  // Load FCFS holders from holders.json
  const holdersPath = path.join(__dirname, '..', 'merkle', 'holders.json');
  let fcfsHolders;
  try {
    fcfsHolders = JSON.parse(fs.readFileSync(holdersPath, 'utf8'));
    console.log(`📋 Loaded ${fcfsHolders.length} holders from ${holdersPath} for FCFS phase`);
  } catch (error) {
    console.error('❌ Error loading holders.json:', error.message);
    console.log('📝 Using example addresses for FCFS phase');
    fcfsHolders = [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
      '0x3456789012345678901234567890123456789012',
      '0x4567890123456789012345678901234567890123',
      '0x5678901234567890123456789012345678901234',
    ];
  }

  // Load GTD holders from gtdHolders.json
  const gtdHoldersPath = path.join(__dirname, '..', 'merkle', 'gtdHolders.json');
  let gtdHolders;
  try {
    gtdHolders = JSON.parse(fs.readFileSync(gtdHoldersPath, 'utf8'));
    console.log(`📋 Loaded ${gtdHolders.length} holders from ${gtdHoldersPath} for GTD phase`);
  } catch (error) {
    console.error('❌ Error loading gtdHolders.json:', error.message);
    console.log('📝 Using example addresses for GTD phase');
    gtdHolders = [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
      '0x3456789012345678901234567890123456789012',
    ];
  }

  return { gtdHolders, fcfsHolders };
}

function generateMerkleTree(addresses) {
  const leaves = addresses.map(addr => keccak256(addr));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return {
    tree,
    root: tree.getHexRoot(),
    leaves
  };
}

function generateProofs(addresses, tree) {
  const proofs = {};
  addresses.forEach(addr => {
    const leaf = keccak256(addr);
    const proof = tree.getHexProof(leaf);
    proofs[addr.toLowerCase()] = proof;
  });
  return proofs;
}

async function main() {
  console.log('🌳 Generating Merkle trees for ApeBeats Genesis...\n');

  // Load holders from files
  const { gtdHolders, fcfsHolders } = loadHolders();

  // Generate GTD Merkle tree
  console.log('📝 Generating GTD Merkle tree...');
  const gtdTree = generateMerkleTree(gtdHolders);
  const gtdProofs = generateProofs(gtdHolders, gtdTree.tree);
  console.log(`✅ GTD tree generated with ${gtdHolders.length} addresses`);
  console.log(`   Root: ${gtdTree.root}`);

  // Generate FCFS Merkle tree
  console.log('📝 Generating FCFS Merkle tree...');
  const fcfsTree = generateMerkleTree(fcfsHolders);
  const fcfsProofs = generateProofs(fcfsHolders, fcfsTree.tree);
  console.log(`✅ FCFS tree generated with ${fcfsHolders.length} addresses`);
  console.log(`   Root: ${fcfsTree.root}`);

  // Create merkle data structure (matching original format)
  const merkleData = {
    timestamp: new Date().toISOString(),
    gtd: {
      root: gtdTree.root,
      addresses: gtdHolders,
      proofs: gtdProofs
    },
    fcfs: {
      root: fcfsTree.root,
      addresses: fcfsHolders,
      proofs: fcfsProofs
    }
  };

  // Save individual Merkle tree files (matching original structure)
  const gtdMerkleData = {
    root: gtdTree.root,
    leaves: gtdHolders
  };
  const fcfsMerkleData = {
    root: fcfsTree.root,
    leaves: fcfsHolders
  };

  const gtdPath = path.join(__dirname, '..', 'merkle', 'gtdMerkleTree.json');
  const fcfsPath = path.join(__dirname, '..', 'merkle', 'fcfsMerkleTree.json');
  
  fs.writeFileSync(gtdPath, JSON.stringify(gtdMerkleData, null, 2));
  fs.writeFileSync(fcfsPath, JSON.stringify(fcfsMerkleData, null, 2));
  
  console.log('💾 GTD Merkle tree saved to:', gtdPath);
  console.log('💾 FCFS Merkle tree saved to:', fcfsPath);

  // Save merkle data
  const merklePath = path.join(__dirname, '..', 'merkle', 'whitelist.json');
  fs.mkdirSync(path.dirname(merklePath), { recursive: true });
  fs.writeFileSync(merklePath, JSON.stringify(merkleData, null, 2));
  console.log('💾 Merkle data saved to:', merklePath);

  // Generate TypeScript types for frontend
  const typesContent = `// Generated Merkle tree types for ApeBeats Genesis
export interface MerkleProof {
  address: string;
  proof: string[];
}

export interface MerkleData {
  gtd: {
    root: string;
    addresses: string[];
    proofs: Record<string, string[]>;
  };
  fcfs: {
    root: string;
    addresses: string[];
    proofs: Record<string, string[]>;
  };
}

export const MERKLE_ROOTS = {
  GTD: "${gtdTree.root}",
  FCFS: "${fcfsTree.root}"
} as const;

export const GTD_WHITELIST = ${JSON.stringify(GTD_WHITELIST, null, 2)};

export const FCFS_WHITELIST = ${JSON.stringify(FCFS_WHITELIST, null, 2)};
`;

  const typesPath = path.join(__dirname, '..', 'lib', 'merkle.ts');
  fs.writeFileSync(typesPath, typesContent);
  console.log('📝 TypeScript types generated at:', typesPath);

  // Generate verification script
  const verifyScript = `#!/usr/bin/env node

/**
 * Merkle Proof Verification Script
 * Verifies that addresses and proofs are valid
 */

const { MerkleTree } = require('merkletreejs');
const { keccak256 } = require('ethers');
const merkleData = require('../merkle/whitelist.json');

function verifyProof(address, proof, root) {
  const leaf = keccak256(address);
  const tree = new MerkleTree([leaf], keccak256, { sortPairs: true });
  return tree.verify(proof, leaf, root);
}

async function main() {
  console.log('🔍 Verifying Merkle proofs...\\n');

  // Verify GTD proofs
  console.log('📝 Verifying GTD proofs...');
  let gtdValid = 0;
  let gtdInvalid = 0;
  
  merkleData.gtd.addresses.forEach(addr => {
    const proof = merkleData.gtd.proofs[addr.toLowerCase()];
    const isValid = verifyProof(addr, proof, merkleData.gtd.root);
    if (isValid) {
      gtdValid++;
    } else {
      gtdInvalid++;
      console.log(\`❌ Invalid GTD proof for \${addr}\`);
    }
  });
  
  console.log(\`✅ GTD: \${gtdValid} valid, \${gtdInvalid} invalid\`);

  // Verify FCFS proofs
  console.log('📝 Verifying FCFS proofs...');
  let fcfsValid = 0;
  let fcfsInvalid = 0;
  
  merkleData.fcfs.addresses.forEach(addr => {
    const proof = merkleData.fcfs.proofs[addr.toLowerCase()];
    const isValid = verifyProof(addr, proof, merkleData.fcfs.root);
    if (isValid) {
      fcfsValid++;
    } else {
      fcfsInvalid++;
      console.log(\`❌ Invalid FCFS proof for \${addr}\`);
    }
  });
  
  console.log(\`✅ FCFS: \${fcfsValid} valid, \${fcfsInvalid} invalid\`);
  
  if (gtdInvalid === 0 && fcfsInvalid === 0) {
    console.log('\\n🎉 All Merkle proofs are valid!');
  } else {
    console.log('\\n❌ Some Merkle proofs are invalid!');
    process.exit(1);
  }
}

main().catch(console.error);
`;

  const verifyPath = path.join(__dirname, 'verify-merkle.js');
  fs.writeFileSync(verifyPath, verifyScript);
  fs.chmodSync(verifyPath, '755');
  console.log('🔍 Verification script generated at:', verifyPath);

  console.log('\n🎉 Merkle tree generation completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Update the whitelist addresses in this script with actual data');
  console.log('2. Run the verification script: node scripts/verify-merkle.js');
  console.log('3. Update the contract deployment with the new Merkle roots');
  console.log('4. Test the whitelist functionality');
}

main().catch(console.error);
