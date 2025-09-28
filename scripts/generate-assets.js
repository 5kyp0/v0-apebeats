#!/usr/bin/env node

/**
 * ApeBeats Genesis Asset Generator
 * Generates audio assets and waveforms for NFT collection
 * Based on original ApeWavesProject GenerateAssets.js
 */

require('dotenv').config({ path: '.env.local' });
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const WaveFile = require("wavefile").WaveFile;
const ffmpeg = require("fluent-ffmpeg");
const sharp = require("sharp");

// Initialize ffmpeg path
try {
  ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
} catch (error) {
  console.log('⚠️  FFmpeg not found, some audio processing features may be limited');
}

// Initialize ThirdWeb SDK for IPFS management (if available)
let sdk = null;
try {
  const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
  if (process.env.THIRDWEB_CLIENT_ID && process.env.THIRDWEB_SECRET_KEY) {
    sdk = new ThirdwebSDK("apechain", {
      clientId: process.env.THIRDWEB_CLIENT_ID,
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    });
    console.log('✅ ThirdWeb SDK initialized');
  }
} catch (error) {
  console.log('⚠️  ThirdWeb SDK not available, using local storage only');
}

// Fallback to Pinata if ThirdWeb is not configured
let pinata = null;
if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
  try {
    const pinataSDK = require("@pinata/sdk");
    pinata = new pinataSDK({
      pinataApiKey: process.env.PINATA_API_KEY,
      pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
    });
    console.log('✅ Pinata SDK initialized');
  } catch (error) {
    console.log('⚠️  Pinata SDK not available');
  }
}

// Create output directories
const audioDir = path.join(__dirname, '..', 'generated', 'audio');
const waveformDir = path.join(__dirname, '..', 'generated', 'waveforms');
const metadataDir = path.join(__dirname, '..', 'generated', 'metadata');

[audioDir, waveformDir, metadataDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Audio loop configurations (matching original)
const AUDIO_LOOPS = {
  bass: [
    { name: 'Deep Bass Loop 1', file: 'bass0.wav', rarity: 'common' },
    { name: 'Deep Bass Loop 2', file: 'bass1.wav', rarity: 'common' },
    { name: 'Deep Bass Loop 3', file: 'bass2.wav', rarity: 'uncommon' },
    { name: 'Deep Bass Loop 4', file: 'bass3.wav', rarity: 'rare' },
    { name: 'Deep Bass Loop 5', file: 'bass4.wav', rarity: 'legendary' }
  ],
  drums: [
    { name: 'Hip Hop Drums 1', file: 'drum0.wav', rarity: 'common' },
    { name: 'Hip Hop Drums 2', file: 'drum1.wav', rarity: 'common' },
    { name: 'Hip Hop Drums 3', file: 'drum2.wav', rarity: 'uncommon' },
    { name: 'Hip Hop Drums 4', file: 'drum3.wav', rarity: 'rare' },
    { name: 'Hip Hop Drums 5', file: 'drum4.wav', rarity: 'legendary' }
  ],
  melody: [
    { name: 'Ambient Melody 1', file: 'melody0.wav', rarity: 'common' },
    { name: 'Ambient Melody 2', file: 'melody1.wav', rarity: 'common' },
    { name: 'Ambient Melody 3', file: 'melody2.wav', rarity: 'uncommon' },
    { name: 'Ambient Melody 4', file: 'melody3.wav', rarity: 'rare' },
    { name: 'Ambient Melody 5', file: 'melody4.wav', rarity: 'legendary' }
  ],
  fx: [
    { name: 'Psychedelic FX 1', file: 'fx0.wav', rarity: 'common' },
    { name: 'Psychedelic FX 2', file: 'fx1.wav', rarity: 'common' },
    { name: 'Psychedelic FX 3', file: 'fx2.wav', rarity: 'uncommon' },
    { name: 'Psychedelic FX 4', file: 'fx3.wav', rarity: 'rare' },
    { name: 'Psychedelic FX 5', file: 'fx4.wav', rarity: 'legendary' }
  ]
};

// Function to load WAV samples
function loadWavSamples(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}, using placeholder`);
    return new Int16Array(44100); // 1 second of silence at 44.1kHz
  }
  
  console.log(`📁 Loading WAV samples from ${filePath}`);
  const buffer = fs.readFileSync(filePath);
  const wav = new WaveFile();
  wav.fromBuffer(buffer);
  let samples = wav.getSamples();
  const isStereo = wav.fmt.numChannels > 1;
  let channelSamples = isStereo ? samples[0] : samples;
  
  if (channelSamples instanceof Float64Array || channelSamples instanceof Float32Array) {
    channelSamples = Int16Array.from(channelSamples, sample => Math.round(sample * 32767));
  }
  
  console.log(`✅ Loaded ${channelSamples.length} samples from ${filePath}`);
  return channelSamples;
}

// Function to generate waveform image
async function generateWaveformImage(samples, outputPath, width = 800, height = 200) {
  try {
    const canvas = require('canvas');
    const { createCanvas } = canvas;
    
    const canvasElement = createCanvas(width, height);
    const ctx = canvasElement.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw waveform
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const step = width / samples.length;
    const centerY = height / 2;
    const amplitude = height * 0.4;
    
    for (let i = 0; i < samples.length; i += Math.max(1, Math.floor(samples.length / width))) {
      const x = i * step;
      const y = centerY + (samples[i] / 32767) * amplitude;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Save image
    const buffer = canvasElement.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Generated waveform image: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.log(`❌ Failed to generate waveform: ${error.message}`);
    return null;
  }
}

// Function to mix audio loops
async function mixAudioLoops(bassFile, drumsFile, melodyFile, fxFile, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const command = ffmpeg();
      
      // Add input files
      if (fs.existsSync(bassFile)) command.input(bassFile);
      if (fs.existsSync(drumsFile)) command.input(drumsFile);
      if (fs.existsSync(melodyFile)) command.input(melodyFile);
      if (fs.existsSync(fxFile)) command.input(fxFile);
      
      // Mix audio
      command
        .complexFilter([
          '[0:a][1:a][2:a][3:a]amix=inputs=4:duration=longest[aout]'
        ])
        .outputOptions(['-map', '[aout]'])
        .output(outputPath)
        .on('end', () => {
          console.log(`✅ Mixed audio saved: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.log(`❌ Audio mixing failed: ${err.message}`);
          reject(err);
        })
        .run();
    } catch (error) {
      console.log(`❌ Audio mixing setup failed: ${error.message}`);
      reject(error);
    }
  });
}

// Function to upload to IPFS
async function uploadToIPFS(filePath, fileName) {
  try {
    if (sdk) {
      const file = fs.readFileSync(filePath);
      const uri = await sdk.storage.upload(file, {
        name: fileName,
        description: `ApeBeats Genesis ${fileName}`
      });
      console.log(`✅ Uploaded to IPFS via ThirdWeb: ${uri}`);
      return uri;
    } else if (pinata) {
      const file = fs.readFileSync(filePath);
      const result = await pinata.pinFileToIPFS(file, {
        pinataMetadata: {
          name: fileName,
          description: `ApeBeats Genesis ${fileName}`
        }
      });
      const uri = `ipfs://${result.IpfsHash}`;
      console.log(`✅ Uploaded to IPFS via Pinata: ${uri}`);
      return uri;
    } else {
      console.log(`⚠️  No IPFS service configured, using local path: ${filePath}`);
      return filePath;
    }
  } catch (error) {
    console.log(`❌ IPFS upload failed: ${error.message}`);
    return filePath;
  }
}

// Main asset generation function
async function generateAssets() {
  console.log('🎵 Starting ApeBeats Genesis asset generation...\n');

  const assetsDir = path.join(__dirname, '..', 'assets', 'loops');
  const generatedAssets = [];

  // Generate assets for each combination
  for (const bass of AUDIO_LOOPS.bass) {
    for (const drums of AUDIO_LOOPS.drums) {
      for (const melody of AUDIO_LOOPS.melody) {
        for (const fx of AUDIO_LOOPS.fx) {
          const combinationId = `${bass.file}_${drums.file}_${melody.file}_${fx.file}`.replace(/\.wav/g, '');
          
          console.log(`\n🎼 Generating assets for combination: ${combinationId}`);
          
          // File paths
          const bassPath = path.join(assetsDir, bass.file);
          const drumsPath = path.join(assetsDir, drums.file);
          const melodyPath = path.join(assetsDir, melody.file);
          const fxPath = path.join(assetsDir, fx.file);
          
          // Generate mixed audio
          const mixedAudioPath = path.join(audioDir, `${combinationId}.wav`);
          try {
            await mixAudioLoops(bassPath, drumsPath, melodyPath, fxPath, mixedAudioPath);
          } catch (error) {
            console.log(`⚠️  Audio mixing failed for ${combinationId}, skipping...`);
            continue;
          }
          
          // Generate waveform
          const bassSamples = loadWavSamples(bassPath);
          const waveformPath = path.join(waveformDir, `${combinationId}.png`);
          await generateWaveformImage(bassSamples, waveformPath);
          
          // Upload to IPFS
          const audioURI = await uploadToIPFS(mixedAudioPath, `${combinationId}.wav`);
          const waveformURI = await uploadToIPFS(waveformPath, `${combinationId}.png`);
          
          // Store asset info
          generatedAssets.push({
            id: combinationId,
            bass: bass.name,
            drums: drums.name,
            melody: melody.name,
            fx: fx.name,
            audioURI,
            waveformURI,
            localAudioPath: mixedAudioPath,
            localWaveformPath: waveformPath
          });
        }
      }
    }
  }

  // Save asset manifest
  const manifestPath = path.join(metadataDir, 'assets-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(generatedAssets, null, 2));
  console.log(`\n💾 Asset manifest saved: ${manifestPath}`);

  console.log(`\n🎉 Asset generation completed!`);
  console.log(`📊 Generated ${generatedAssets.length} unique combinations`);
  console.log(`📁 Assets saved to: ${path.join(__dirname, '..', 'generated')}`);
  
  return generatedAssets;
}

// Run asset generation
if (require.main === module) {
  generateAssets()
    .then(() => {
      console.log('\n✅ Asset generation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Asset generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateAssets, AUDIO_LOOPS };
