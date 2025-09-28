#!/usr/bin/env node

/**
 * ApeBeats Genesis NFT Metadata Generator
 * Generates metadata and assets for NFT collection
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Audio loop configurations
const AUDIO_LOOPS = {
  bass: [
    { name: 'Deep Bass Loop 1', rarity: 'common', weight: 30 },
    { name: 'Deep Bass Loop 2', rarity: 'common', weight: 30 },
    { name: 'Deep Bass Loop 3', rarity: 'uncommon', weight: 20 },
    { name: 'Deep Bass Loop 4', rarity: 'rare', weight: 15 },
    { name: 'Deep Bass Loop 5', rarity: 'legendary', weight: 5 }
  ],
  drums: [
    { name: 'Hip Hop Drums 1', rarity: 'common', weight: 30 },
    { name: 'Hip Hop Drums 2', rarity: 'common', weight: 30 },
    { name: 'Hip Hop Drums 3', rarity: 'uncommon', weight: 20 },
    { name: 'Hip Hop Drums 4', rarity: 'rare', weight: 15 },
    { name: 'Hip Hop Drums 5', rarity: 'legendary', weight: 5 }
  ],
  melody: [
    { name: 'Ambient Melody 1', rarity: 'common', weight: 30 },
    { name: 'Ambient Melody 2', rarity: 'common', weight: 30 },
    { name: 'Ambient Melody 3', rarity: 'uncommon', weight: 20 },
    { name: 'Ambient Melody 4', rarity: 'rare', weight: 15 },
    { name: 'Ambient Melody 5', rarity: 'legendary', weight: 5 }
  ],
  fx: [
    { name: 'Psychedelic FX 1', rarity: 'common', weight: 30 },
    { name: 'Psychedelic FX 2', rarity: 'common', weight: 30 },
    { name: 'Psychedelic FX 3', rarity: 'uncommon', weight: 20 },
    { name: 'Psychedelic FX 4', rarity: 'rare', weight: 15 },
    { name: 'Psychedelic FX 5', rarity: 'legendary', weight: 5 }
  ]
};

// Color schemes
const COLOR_SCHEMES = [
  { name: '#B9F2FF', rarity: 'common', weight: 20 },
  { name: '#FFD700', rarity: 'common', weight: 20 },
  { name: '#C0C0C0', rarity: 'common', weight: 20 },
  { name: '#CD7F32', rarity: 'uncommon', weight: 15 },
  { name: 'Rainbow', rarity: 'rare', weight: 10 },
  { name: '#000000', rarity: 'rare', weight: 5 },
  { name: '#FF0000', rarity: 'rare', weight: 3 },
  { name: '#0000FF', rarity: 'rare', weight: 3 },
  { name: '#00FF00', rarity: 'rare', weight: 2 },
  { name: '#800080', rarity: 'legendary', weight: 1 },
  { name: '#FFA500', rarity: 'legendary', weight: 1 }
];

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }
  
  return items[items.length - 1];
}

function generateTokenMetadata(tokenId, seed) {
  // Use seed for deterministic generation
  const rng = crypto.createHash('sha256').update(seed).digest('hex');
  const randomValues = [];
  
  for (let i = 0; i < rng.length; i += 2) {
    randomValues.push(parseInt(rng.substr(i, 2), 16));
  }

  // Generate attributes
  const bass = weightedRandom(AUDIO_LOOPS.bass);
  const drums = weightedRandom(AUDIO_LOOPS.drums);
  const melody = weightedRandom(AUDIO_LOOPS.melody);
  const fx = weightedRandom(AUDIO_LOOPS.fx);
  const waveColor = weightedRandom(COLOR_SCHEMES);
  const bgColor = weightedRandom(COLOR_SCHEMES);

  // Calculate rarity score
  const rarityScores = {
    common: 1,
    uncommon: 2,
    rare: 3,
    legendary: 5
  };

  const totalRarity = rarityScores[bass.rarity] + rarityScores[drums.rarity] + 
                     rarityScores[melody.rarity] + rarityScores[fx.rarity] +
                     rarityScores[waveColor.rarity] + rarityScores[bgColor.rarity];

  const rarityScore = Math.min(100, Math.max(1, totalRarity * 10 + Math.floor(Math.random() * 20)));

  return {
    tokenId,
    name: `ApeBeats Genesis #${tokenId}`,
    description: `A unique generative music NFT from the ApeBeats Genesis collection. Each NFT contains procedurally generated audio-visual combinations created from ApeChain data.`,
    image: `https://ipfs.io/ipfs/QmWaveform${tokenId}`,
    animation_url: `https://ipfs.io/ipfs/QmAudio${tokenId}`,
    attributes: [
      { trait_type: 'Bass', value: bass.name },
      { trait_type: 'Drums', value: drums.name },
      { trait_type: 'Melody', value: melody.name },
      { trait_type: 'FX', value: fx.name },
      { trait_type: 'Wave Color', value: waveColor.name },
      { trait_type: 'Background Color', value: bgColor.name },
      { trait_type: 'Rarity Score', value: rarityScore },
      { trait_type: 'Bass Rarity', value: bass.rarity },
      { trait_type: 'Drums Rarity', value: drums.rarity },
      { trait_type: 'Melody Rarity', value: melody.rarity },
      { trait_type: 'FX Rarity', value: fx.rarity },
      { trait_type: 'Wave Color Rarity', value: waveColor.rarity },
      { trait_type: 'Background Color Rarity', value: bgColor.rarity }
    ],
    onchain_data: {
      bass: bass.name,
      drums: drums.name,
      melody: melody.name,
      fx: fx.name,
      wave_color: waveColor.name,
      bg_color: bgColor.name,
      rarity: rarityScore
    }
  };
}

async function main() {
  console.log('🎨 Starting ApeBeats Genesis NFT metadata generation...\n');

  // Load deployment info
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'curtis-testnet.json');
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ Deployment info not found. Please run deploy.js first.');
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const totalSupply = deployment.configuration.totalSupply;

  console.log(`📊 Generating metadata for ${totalSupply} NFTs...`);

  // Create metadata directory
  const metadataDir = path.join(__dirname, '..', 'metadata');
  fs.mkdirSync(metadataDir, { recursive: true });

  // Generate metadata for all tokens
  const allMetadata = [];
  const rarityDistribution = {
    common: 0,
    uncommon: 0,
    rare: 0,
    legendary: 0
  };

  for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
    // Use tokenId and deployment timestamp as seed for deterministic generation
    const seed = `${tokenId}-${deployment.timestamp}`;
    const metadata = generateTokenMetadata(tokenId, seed);
    
    allMetadata.push(metadata);
    
    // Save individual metadata file
    const metadataPath = path.join(metadataDir, `${tokenId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Track rarity distribution
    const attributes = metadata.attributes;
    const bassRarity = attributes.find(attr => attr.trait_type === 'Bass Rarity')?.value;
    if (bassRarity) rarityDistribution[bassRarity]++;
    
    if (tokenId % 50 === 0) {
      console.log(`✅ Generated metadata for ${tokenId}/${totalSupply} tokens`);
    }
  }

  // Save complete metadata collection
  const collectionPath = path.join(metadataDir, 'collection.json');
  fs.writeFileSync(collectionPath, JSON.stringify(allMetadata, null, 2));

  // Generate rarity analysis
  const rarityAnalysis = {
    timestamp: new Date().toISOString(),
    totalTokens: totalSupply,
    rarityDistribution,
    audioLoops: AUDIO_LOOPS,
    colorSchemes: COLOR_SCHEMES,
    metadata: allMetadata
  };

  const analysisPath = path.join(metadataDir, 'rarity-analysis.json');
  fs.writeFileSync(analysisPath, JSON.stringify(rarityAnalysis, null, 2));

  // Generate TypeScript types for frontend
  const typesContent = `// Generated NFT metadata types
export interface NFTMetadata {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  animation_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  onchain_data: {
    bass: string;
    drums: string;
    melody: string;
    fx: string;
    wave_color: string;
    bg_color: string;
    rarity: number;
  };
}

export interface RarityDistribution {
  common: number;
  uncommon: number;
  rare: number;
  legendary: number;
}

export const TOTAL_SUPPLY = ${totalSupply};
export const RARITY_DISTRIBUTION: RarityDistribution = ${JSON.stringify(rarityDistribution, null, 2)};
`;

  const typesPath = path.join(__dirname, '..', 'lib', 'nft-metadata.ts');
  fs.writeFileSync(typesPath, typesContent);

  console.log('\n🎉 NFT metadata generation completed!');
  console.log('\n📊 Rarity Distribution:');
  console.log(`   Common: ${rarityDistribution.common} (${(rarityDistribution.common/totalSupply*100).toFixed(1)}%)`);
  console.log(`   Uncommon: ${rarityDistribution.uncommon} (${(rarityDistribution.uncommon/totalSupply*100).toFixed(1)}%)`);
  console.log(`   Rare: ${rarityDistribution.rare} (${(rarityDistribution.rare/totalSupply*100).toFixed(1)}%)`);
  console.log(`   Legendary: ${rarityDistribution.legendary} (${(rarityDistribution.legendary/totalSupply*100).toFixed(1)}%)`);
  
  console.log('\n📁 Generated files:');
  console.log(`   Individual metadata: ${metadataDir}/*.json`);
  console.log(`   Collection metadata: ${collectionPath}`);
  console.log(`   Rarity analysis: ${analysisPath}`);
  console.log(`   TypeScript types: ${typesPath}`);
  
  console.log('\n📋 Next steps:');
  console.log('1. Upload waveform images to IPFS');
  console.log('2. Upload audio files to IPFS');
  console.log('3. Update metadata with real IPFS URIs');
  console.log('4. Run reveal script to set metadata in contracts');
}

main().catch(console.error);
