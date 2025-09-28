/**
 * ApeBeats Music Engine
 * 
 * Main orchestrator for the generative music engine
 * Integrates blockchain data collection, music generation, and NFT snapshot creation
 */

import { BlockchainDataCollector, MockBlockchainDataCollector } from './dataCollector';
import { MusicGenerator } from './musicGenerator';
import { LoFiHipHopGenerator } from './lofiGenerator';
import { StreamingEngine } from './streamingEngine';
import { VideoVisualizer } from './videoVisualizer';
import { NFTSnapshotManager } from './nftSnapshot';
import { 
  BlockchainData, 
  GeneratedMusic, 
  MusicConfig, 
  NFTSnapshotConfig, 
  GenerationState,
  VideoVisualization,
  StreamingSession
} from './types';

export class ApeBeatsMusicEngine {
  private dataCollector: BlockchainDataCollector;
  private musicGenerator: MusicGenerator;
  private lofiGenerator: LoFiHipHopGenerator;
  private streamingEngine?: StreamingEngine;
  private videoVisualizer?: VideoVisualizer;
  private nftSnapshotManager?: NFTSnapshotManager;
  private config: MusicConfig;
  private state: GenerationState;

  constructor(config: MusicConfig, nftConfig?: NFTSnapshotConfig) {
    this.config = config;
    this.state = {
      status: 'idle',
      progress: 0,
      currentStep: 'Initialized'
    };

    // Initialize components
    const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!alchemyApiKey) {
      console.warn('[ApeBeatsMusicEngine] NEXT_PUBLIC_ALCHEMY_API_KEY not found. Using mock data for development.');
      // Create a mock data collector for development
      this.dataCollector = new MockBlockchainDataCollector();
      console.log('[ApeBeatsMusicEngine] Mock data collector initialized');
    } else {
      console.log('[ApeBeatsMusicEngine] Using real Alchemy API');
      this.dataCollector = new BlockchainDataCollector(alchemyApiKey, config.chainId);
    }
    this.musicGenerator = new MusicGenerator(config);
    this.lofiGenerator = new LoFiHipHopGenerator(config);
    
    if (nftConfig && config.enableNFT) {
      this.nftSnapshotManager = new NFTSnapshotManager(nftConfig);
    }
    
    if (config.streaming?.enabled) {
      this.streamingEngine = new StreamingEngine(config, nftConfig);
    }
  }

  /**
   * Generate music from recent blockchain activity
   * @param blockCount Number of recent blocks to analyze
   * @returns Generated music piece
   */
  async generateFromRecentActivity(blockCount: number = 10): Promise<GeneratedMusic> {
    try {
      this.updateState('collecting', 10, 'Collecting recent blockchain data...');
      
      // Step 1: Collect blockchain data
      const blockchainData = await this.dataCollector.collectRecentData(blockCount);
      
      this.updateState('processing', 30, 'Processing blockchain data...');
      
      // Step 2: Generate LoFi music (always use LoFi now)
      const music = await this.lofiGenerator.generateLoFiMusic(blockchainData);
      
      this.updateState('generating', 70, 'Generating LoFi audio...');
      
      // Step 3: Create NFT snapshot if enabled
      if (this.config.enableNFT && this.nftSnapshotManager) {
        this.updateState('generating', 90, 'Creating NFT snapshot...');
        
        if (this.config.autoMint) {
          const nftResult = await this.nftSnapshotManager.createSnapshot(music);
          console.log('NFT created:', nftResult);
        }
      }
      
      this.updateState('complete', 100, 'LoFi music generation complete!');
      
      return music;
    } catch (error) {
      this.updateState('error', 0, 'Error occurred', error as string);
      throw error;
    }
  }

  /**
   * Generate music from specific block range
   * @param startBlock Starting block number
   * @param endBlock Ending block number
   * @returns Generated music piece
   */
  async generateFromBlockRange(startBlock: number, endBlock: number): Promise<GeneratedMusic> {
    try {
      this.updateState('collecting', 10, 'Collecting block range data...');
      
      const blockchainData = await this.dataCollector.collectBlockRangeData(startBlock, endBlock);
      
      this.updateState('processing', 30, 'Processing blockchain data...');
      const music = await this.lofiGenerator.generateLoFiMusic(blockchainData);
      
      this.updateState('generating', 70, 'Generating LoFi audio...');
      
      if (this.config.enableNFT && this.nftSnapshotManager && this.config.autoMint) {
        this.updateState('generating', 90, 'Creating NFT snapshot...');
        await this.nftSnapshotManager.createSnapshot(music);
      }
      
      this.updateState('complete', 100, 'LoFi music generation complete!');
      
      return music;
    } catch (error) {
      this.updateState('error', 0, 'Error occurred', error as string);
      throw error;
    }
  }

  /**
   * Generate music from specific addresses
   * @param addresses Array of addresses to monitor
   * @param blockCount Number of recent blocks to check
   * @returns Generated music piece
   */
  async generateFromAddresses(addresses: string[], blockCount: number = 50): Promise<GeneratedMusic> {
    try {
      this.updateState('collecting', 10, 'Collecting address data...');
      
      const blockchainData = await this.dataCollector.collectAddressData(addresses, blockCount);
      
      this.updateState('processing', 30, 'Processing blockchain data...');
      const music = await this.lofiGenerator.generateLoFiMusic(blockchainData);
      
      this.updateState('generating', 70, 'Generating LoFi audio...');
      
      if (this.config.enableNFT && this.nftSnapshotManager && this.config.autoMint) {
        this.updateState('generating', 90, 'Creating NFT snapshot...');
        await this.nftSnapshotManager.createSnapshot(music);
      }
      
      this.updateState('complete', 100, 'LoFi music generation complete!');
      
      return music;
    } catch (error) {
      this.updateState('error', 0, 'Error occurred', error as string);
      throw error;
    }
  }

  /**
   * Create NFT snapshot from existing music
   * @param music Generated music piece
   * @returns NFT creation result
   */
  async createNFTSnapshot(music: GeneratedMusic): Promise<{
    tokenId: string;
    metadataUri: string;
    transactionHash: string;
    contractAddress: string;
  }> {
    if (!this.nftSnapshotManager) {
      throw new Error('NFT snapshot manager not initialized');
    }

    return await this.nftSnapshotManager.createSnapshot(music);
  }

  /**
   * Get current generation state
   */
  getState(): GenerationState {
    return { ...this.state };
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<{
    totalTransactions: number;
    averageGasPrice: number;
    averageBlockTime: number;
    networkActivity: 'low' | 'medium' | 'high';
  }> {
    return await this.dataCollector.getNetworkStats();
  }

  /**
   * Update generation state
   */
  private updateState(
    status: GenerationState['status'], 
    progress: number, 
    currentStep: string, 
    error?: string
  ): void {
    this.state = {
      status,
      progress,
      currentStep,
      error
    };
  }

  /**
   * Reset engine state
   */
  reset(): void {
    this.state = {
      status: 'idle',
      progress: 0,
      currentStep: 'Ready'
    };
  }

  /**
   * Get engine configuration
   */
  getConfig(): MusicConfig {
    return { ...this.config };
  }

  /**
   * Generate LoFi Hip Hop music from recent blockchain activity
   */
  async generateLoFiFromRecentActivity(blockCount: number = 10): Promise<GeneratedMusic> {
    try {
      this.updateState('collecting', 10, 'Collecting recent blockchain data...');
      console.log('[ApeBeatsMusicEngine] Starting LoFi generation with blockCount:', blockCount);
      
      const blockchainData = await this.dataCollector.collectRecentData(blockCount);
      console.log('[ApeBeatsMusicEngine] Collected blockchain data:', blockchainData.length, 'entries');
      
      this.updateState('processing', 30, 'Processing blockchain data...');
      const music = await this.lofiGenerator.generateLoFiMusic(blockchainData);
      
      this.updateState('generating', 70, 'Generating LoFi audio...');
      
      if (this.config.enableNFT && this.nftSnapshotManager && this.config.autoMint) {
        this.updateState('generating', 90, 'Creating NFT snapshot...');
        await this.nftSnapshotManager.createSnapshot(music);
      }
      
      this.updateState('complete', 100, 'LoFi music generation complete!');
      
      return music;
    } catch (error) {
      this.updateState('error', 0, 'Error occurred', error as string);
      throw error;
    }
  }

  /**
   * Start 24/7 streaming
   */
  async startStreaming(): Promise<StreamingSession> {
    if (!this.streamingEngine) {
      throw new Error('Streaming engine not initialized. Enable streaming in config.');
    }
    
    return await this.streamingEngine.startStreaming();
  }

  /**
   * Stop 24/7 streaming
   */
  async stopStreaming(): Promise<void> {
    if (this.streamingEngine) {
      await this.streamingEngine.stopStreaming();
    }
  }

  /**
   * Get current streaming session
   */
  getCurrentStreamingSession(): StreamingSession | undefined {
    return this.streamingEngine?.getCurrentSession();
  }

  /**
   * Check if streaming is active
   */
  isStreaming(): boolean {
    return this.streamingEngine?.isActive() || false;
  }

  /**
   * Create NFT snapshot of current streaming track
   */
  async createStreamingNFT(): Promise<any> {
    if (!this.streamingEngine) {
      throw new Error('Streaming engine not initialized');
    }
    
    return await this.streamingEngine.createCurrentTrackNFT();
  }

  /**
   * Generate video visualization
   */
  async generateVideoVisualization(
    music: GeneratedMusic, 
    blockchainData: BlockchainData[],
    canvas?: HTMLCanvasElement
  ): Promise<VideoVisualization> {
    if (!canvas) {
      // Create a temporary canvas if none provided
      canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
    }
    
    if (!this.videoVisualizer) {
      this.videoVisualizer = new VideoVisualizer(canvas);
    }
    
    return await this.videoVisualizer.generateVisualization(music, blockchainData);
  }

  /**
   * Start real-time video visualization
   */
  startVideoVisualization(
    music: GeneratedMusic, 
    blockchainData: BlockchainData[],
    canvas: HTMLCanvasElement
  ): void {
    if (!this.videoVisualizer) {
      this.videoVisualizer = new VideoVisualizer(canvas);
    }
    
    this.videoVisualizer.startRealTimeVisualization(music, blockchainData);
  }

  /**
   * Stop real-time video visualization
   */
  stopVideoVisualization(): void {
    if (this.videoVisualizer) {
      this.videoVisualizer.stopRealTimeVisualization();
    }
  }

  /**
   * Get streaming statistics
   */
  getStreamingStats(): any {
    return this.streamingEngine?.getStreamingStats() || {
      isActive: false,
      sessionDuration: 0,
      tracksPlayed: 0,
      nftSnapshotsCreated: 0,
      currentListeners: 0
    };
  }

  /**
   * Update engine configuration
   */
  updateConfig(newConfig: Partial<MusicConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update streaming engine config if it exists
    if (this.streamingEngine) {
      this.streamingEngine.updateConfig(newConfig);
    }
  }
}

// Export types and classes for external use
export * from './types';
export { BlockchainDataCollector } from './dataCollector';
export { MusicGenerator } from './musicGenerator';
export { LoFiHipHopGenerator } from './lofiGenerator';
export { StreamingEngine } from './streamingEngine';
export { VideoVisualizer } from './videoVisualizer';
export { NFTSnapshotManager } from './nftSnapshot';

// Default configuration
export const defaultMusicConfig: MusicConfig = {
  chainId: 33139, // ApeChain mainnet
  style: 'lofi-hiphop',
  complexity: 'medium',
  duration: 60, // 1 minute
  lofiSettings: {
    bpmRange: [70, 90],
    swingAmount: 0.4, // More swing for authentic LoFi feel
    vinylCrackle: true,
    jazzChords: true,
    reverbAmount: 0.6, // More reverb for atmospheric sound
    lowpassFilter: 0.4 // More aggressive filtering for LoFi character
  },
  streaming: {
    enabled: true,
    continuousMode: true,
    updateInterval: 15, // 15 seconds for more frequent updates
    fadeTransition: true
  },
  enableNFT: true,
  autoMint: false
};

export const defaultNFTSnapshotConfig: NFTSnapshotConfig = {
  trigger: 'manual',
  collectionName: 'ApeChain Symphonies',
  collectionDescription: 'Generative music pieces created from ApeChain blockchain data',
  royaltyPercentage: 5,
  royaltyRecipient: '',
  storageProvider: 'ipfs',
  pinToIPFS: true,
  contractType: 'ERC721'
};
