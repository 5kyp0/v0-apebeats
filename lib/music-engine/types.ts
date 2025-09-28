/**
 * Music Engine Types
 * 
 * All types are designed with NFT snapshot integration in mind.
 * Every generated piece must be traceable back to its source data.
 */

// Core blockchain data that will generate music
export interface BlockchainData {
  // Transaction data
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  timestamp: number;
  
  // Network activity
  gasUsed: string;
  gasPrice: string;
  transactionCount: number;
  
  // Wallet activity
  fromAddress: string;
  toAddress: string;
  value: string;
  
  // Contract interactions
  contractAddress?: string;
  methodId?: string;
  inputData?: string;
  
  // Unique identifier for NFT metadata
  dataHash: string;
}

// Musical parameters derived from blockchain data
export interface MusicParameters {
  // Tempo and rhythm (derived from gas price, block time)
  tempo: number; // BPM
  timeSignature: [number, number]; // [numerator, denominator]
  swing: number; // 0-1
  
  // Harmony (derived from addresses, values)
  key: string; // Musical key
  scale: string; // Scale type
  chordProgression: string[];
  
  // Melody (derived from transaction data)
  melodyPattern: number[];
  noteDuration: number[];
  octaveRange: [number, number];
  
  // Dynamics and effects (derived from gas usage, value)
  volume: number; // 0-1
  reverb: number; // 0-1
  delay: number; // 0-1
  distortion: number; // 0-1
  
  // Structure (derived from block structure)
  introLength: number; // bars
  verseLength: number; // bars
  chorusLength: number; // bars
  outroLength: number; // bars
  
  // Unique seed for reproducibility
  seed: string;
}

// Generated music piece with NFT metadata
export interface GeneratedMusic {
  // Audio data
  audioBuffer: ArrayBuffer;
  audioUrl: string;
  duration: number; // seconds
  
  // Generation metadata (for NFT)
  id: string;
  timestamp: number;
  sourceData: BlockchainData;
  parameters: MusicParameters;
  
  // NFT-specific metadata
  nftMetadata: {
    name: string;
    description: string;
    image: string; // Waveform visualization
    audio: string; // IPFS/Arweave URL
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
    external_url: string;
    background_color: string;
    animation_url?: string; // For interactive NFTs
  };
  
  // Provenance data
  provenance: {
    originalDataHash: string;
    generationAlgorithm: string;
    version: string;
    creator: string;
  };
}

// Music generation configuration
export interface MusicConfig {
  // Data source
  chainId: number;
  blockRange?: [number, number];
  addressFilter?: string[];
  
  // Generation settings
  style: 'lofi-hiphop' | 'ambient' | 'electronic' | 'classical' | 'jazz' | 'experimental';
  complexity: 'simple' | 'medium' | 'complex';
  duration: number; // target duration in seconds
  
  // LoFi Hip Hop specific settings
  lofiSettings?: {
    bpmRange: [number, number]; // Default: [70, 90]
    swingAmount: number; // 0-1, default: 0.65
    vinylCrackle: boolean; // Default: true
    jazzChords: boolean; // Default: true
    reverbAmount: number; // 0-1, default: 0.6
    lowpassFilter: number; // 0-1, default: 0.35
    humanization: boolean; // Default: true
    extendedChords: boolean; // Default: true
    vinylPops: boolean; // Default: true
    backgroundNoise: boolean; // Default: true
  };
  
  // Streaming settings
  streaming?: {
    enabled: boolean;
    continuousMode: boolean;
    updateInterval: number; // seconds
    fadeTransition: boolean;
  };
  
  // NFT settings
  enableNFT: boolean;
  nftName?: string;
  nftDescription?: string;
  autoMint?: boolean;
}

// Real-time generation state
export interface GenerationState {
  status: 'idle' | 'collecting' | 'processing' | 'generating' | 'complete' | 'error';
  progress: number; // 0-100
  currentStep: string;
  error?: string;
  
  // Collected data
  blockchainData?: BlockchainData[];
  musicParameters?: MusicParameters;
  generatedMusic?: GeneratedMusic;
}

// NFT snapshot configuration
export interface NFTSnapshotConfig {
  // Snapshot trigger
  trigger: 'manual' | 'time' | 'event' | 'threshold';
  triggerValue?: string | number;
  
  // NFT metadata
  collectionName: string;
  collectionDescription: string;
  royaltyPercentage: number;
  royaltyRecipient: string;
  
  // Storage
  storageProvider: 'ipfs' | 'arweave' | 'both';
  pinToIPFS: boolean;
  
  // Smart contract
  contractType: 'ERC721' | 'ERC1155';
  contractAddress?: string;
}

// API response types
export interface AlchemyResponse {
  jsonrpc: string;
  id: number;
  result: any;
}

export interface BlockData {
  number: string;
  hash: string;
  parentHash: string;
  timestamp: string;
  gasUsed: string;
  gasLimit: string;
  transactions: TransactionData[];
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  blockNumber: string;
  blockHash: string;
  transactionIndex: string;
}

// Video visualization types
export interface VideoVisualization {
  id: string;
  musicId: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  
  // Visualization elements
  elements: {
    waveform: boolean;
    blockchainData: boolean;
    particleSystem: boolean;
    colorPalette: string[];
    animationStyle: 'minimal' | 'dynamic' | 'abstract';
  };
  
  // Data visualization
  dataVisualization: {
    transactionFlow: boolean;
    blockTimeline: boolean;
    addressActivity: boolean;
    gasPriceGraph: boolean;
    networkStats: boolean;
  };
  
  // Metadata
  metadata: {
    resolution: string; // e.g., "1920x1080"
    frameRate: number;
    codec: string;
    fileSize: number;
  };
}

// Streaming session data
export interface StreamingSession {
  id: string;
  startTime: number;
  endTime?: number;
  isActive: boolean;
  
  // Current track info
  currentTrack: {
    musicId: string;
    startTime: number;
    duration: number;
    blockchainData: BlockchainData;
  };
  
  // Session statistics
  stats: {
    totalListeners: number;
    averageListeners: number;
    peakListeners: number;
    totalDuration: number;
    tracksPlayed: number;
  };
  
  // NFT snapshots created during session
  nftSnapshots: string[]; // Array of NFT token IDs
}

// Error types
export interface MusicEngineError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}
