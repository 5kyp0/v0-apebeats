/**
 * 24/7 Streaming Engine
 * 
 * Manages continuous music streaming with real-time ApeChain data variations
 * Handles seamless transitions and NFT snapshot creation during streaming
 */

import { 
  BlockchainData, 
  GeneratedMusic, 
  StreamingSession, 
  MusicConfig, 
  NFTSnapshotConfig 
} from './types';
import { BlockchainDataCollector, MockBlockchainDataCollector } from './dataCollector';
import { LoFiHipHopGenerator } from './lofiGenerator';
import { NFTSnapshotManager } from './nftSnapshot';

export class StreamingEngine {
  private dataCollector: BlockchainDataCollector | MockBlockchainDataCollector;
  private musicGenerator: LoFiHipHopGenerator;
  private nftSnapshotManager?: NFTSnapshotManager;
  private config: MusicConfig;
  private nftConfig?: NFTSnapshotConfig;
  
  private currentSession?: StreamingSession;
  private isStreaming: boolean = false;
  private streamingInterval?: NodeJS.Timeout;
  private audioContext?: AudioContext;
  private currentAudioBuffer?: AudioBuffer;
  private nextAudioBuffer?: AudioBuffer;
  private crossfadeDuration: number = 2; // seconds
  
  // Event listeners
  private listeners: Map<string, Function[]> = new Map();

  constructor(config: MusicConfig, nftConfig?: NFTSnapshotConfig) {
    this.config = config;
    this.nftConfig = nftConfig;
    
    const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!alchemyApiKey) {
      console.warn('NEXT_PUBLIC_ALCHEMY_API_KEY not found. Using mock data for development.');
      // Use mock data collector for development
      this.dataCollector = new MockBlockchainDataCollector();
    } else {
      this.dataCollector = new BlockchainDataCollector(alchemyApiKey, config.chainId);
    }
    this.musicGenerator = new LoFiHipHopGenerator(config);
    
    if (nftConfig && config.enableNFT) {
      this.nftSnapshotManager = new NFTSnapshotManager(nftConfig);
    }
  }

  /**
   * Start 24/7 streaming
   */
  async startStreaming(): Promise<StreamingSession> {
    if (this.isStreaming) {
      throw new Error('Streaming is already active');
    }

    try {
      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create new streaming session
      this.currentSession = {
        id: this.generateSessionId(),
        startTime: Date.now(),
        isActive: true,
        currentTrack: {
          musicId: '',
          startTime: 0,
          duration: 0,
          blockchainData: {} as BlockchainData
        },
        stats: {
          totalListeners: 0,
          averageListeners: 0,
          peakListeners: 0,
          totalDuration: 0,
          tracksPlayed: 0
        },
        nftSnapshots: []
      };

      this.isStreaming = true;
      
      // Generate first track
      await this.generateNextTrack();
      
      // Start streaming loop
      this.startStreamingLoop();
      
      // Emit session started event
      this.emit('sessionStarted', this.currentSession);
      
      return this.currentSession;
    } catch (error) {
      this.isStreaming = false;
      throw new Error(`Failed to start streaming: ${error}`);
    }
  }

  /**
   * Stop streaming
   */
  async stopStreaming(): Promise<void> {
    if (!this.isStreaming || !this.currentSession) {
      return;
    }

    try {
      this.isStreaming = false;
      
      if (this.streamingInterval) {
        clearInterval(this.streamingInterval);
        this.streamingInterval = undefined;
      }

      // Update session end time
      this.currentSession.endTime = Date.now();
      this.currentSession.isActive = false;
      
      // Stop audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = undefined;
      }
      
      // Emit session ended event
      this.emit('sessionEnded', this.currentSession);
      
    } catch (error) {
      console.error('Error stopping streaming:', error);
    }
  }

  /**
   * Get current streaming session
   */
  getCurrentSession(): StreamingSession | undefined {
    return this.currentSession;
  }

  /**
   * Check if streaming is active
   */
  isActive(): boolean {
    return this.isStreaming;
  }

  /**
   * Get current track information
   */
  getCurrentTrack(): GeneratedMusic | null {
    if (!this.currentSession) return null;
    
    // In a real implementation, you would return the actual current track
    // For now, we'll return null as the track data would be managed differently
    return null;
  }

  /**
   * Create NFT snapshot of current track
   */
  async createCurrentTrackNFT(): Promise<any> {
    if (!this.currentSession || !this.nftSnapshotManager) {
      throw new Error('No active session or NFT manager not configured');
    }

    try {
      // Generate a snapshot of the current track
      const currentData = await this.dataCollector.collectRecentData(5);
      const music = await this.musicGenerator.generateLoFiMusic(currentData);
      
      const nftResult = await this.nftSnapshotManager.createSnapshot(music);
      
      // Add to session snapshots
      this.currentSession.nftSnapshots.push(nftResult.tokenId);
      
      // Emit NFT created event
      this.emit('nftCreated', nftResult);
      
      return nftResult;
    } catch (error) {
      console.error('Error creating NFT snapshot:', error);
      throw error;
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Start the streaming loop
   */
  private startStreamingLoop(): void {
    const updateInterval = this.config.streaming?.updateInterval || 30; // 30 seconds default
    
    this.streamingInterval = setInterval(async () => {
      try {
        await this.updateStreaming();
      } catch (error) {
        console.error('Error in streaming loop:', error);
        this.emit('streamingError', error);
      }
    }, updateInterval * 1000);
  }

  /**
   * Update streaming with new data
   */
  private async updateStreaming(): Promise<void> {
    if (!this.isStreaming || !this.currentSession) return;

    try {
      // Collect fresh blockchain data
      const newData = await this.dataCollector.collectRecentData(10);
      
      // Check if we should create an NFT snapshot
      if (this.shouldCreateNFTSnapshot(newData)) {
        await this.createCurrentTrackNFT();
      }
      
      // Check if we should generate a new track
      if (this.shouldGenerateNewTrack(newData)) {
        await this.generateNextTrack();
      }
      
      // Update session statistics
      this.updateSessionStats();
      
      // Emit update event
      this.emit('streamingUpdate', {
        session: this.currentSession,
        newData,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Error updating streaming:', error);
      this.emit('streamingError', error);
    }
  }

  /**
   * Generate next track for streaming
   */
  private async generateNextTrack(): Promise<void> {
    try {
      // Collect fresh blockchain data
      const blockchainData = await this.dataCollector.collectRecentData(10);
      
      // Evolve the music configuration based on streaming duration and activity
      this.evolveMusicConfiguration(blockchainData);
      
      // Generate new LoFi track with evolved configuration
      const music = await this.musicGenerator.generateLoFiMusic(blockchainData);
      
      // Update current session track info
      if (this.currentSession) {
        this.currentSession.currentTrack = {
          musicId: music.id,
          startTime: Date.now(),
          duration: music.duration,
          blockchainData: blockchainData[0]
        };
        this.currentSession.stats.tracksPlayed++;
      }
      
      // Prepare audio for streaming
      await this.prepareAudioForStreaming(music);
      
      // Emit new track event
      this.emit('newTrack', music);
      
    } catch (error) {
      console.error('Error generating next track:', error);
      this.emit('trackGenerationError', error);
    }
  }

  /**
   * Evolve music configuration over time for continuous variation
   */
  private evolveMusicConfiguration(blockchainData: BlockchainData[]): void {
    if (!this.currentSession) return;
    
    const sessionDuration = Date.now() - this.currentSession.startTime;
    const sessionDurationMinutes = sessionDuration / (1000 * 60);
    
    // Gradually evolve BPM based on session duration and blockchain activity
    const baseBPM = this.config.lofiSettings?.bpmRange[0] || 70;
    const maxBPM = this.config.lofiSettings?.bpmRange[1] || 90;
    
    // Calculate activity-based BPM variation
    const avgGasPrice = blockchainData.reduce((sum, data) => 
      sum + parseInt(data.gasPrice, 16), 0) / blockchainData.length;
    const activityFactor = Math.min(avgGasPrice / 10000000000, 1); // Normalize gas price
    
    // Evolve BPM over time with some randomness
    const timeVariation = Math.sin(sessionDurationMinutes * 0.1) * 5; // Slow BPM variation
    const activityVariation = activityFactor * 10; // Activity-based variation
    const randomVariation = (Math.random() - 0.5) * 8; // Random variation
    
    const newBPM = Math.max(baseBPM, Math.min(maxBPM, 
      baseBPM + timeVariation + activityVariation + randomVariation));
    
    // Update configuration with evolved parameters
    this.config = {
      ...this.config,
      lofiSettings: {
        ...this.config.lofiSettings,
        bpmRange: [newBPM - 5, newBPM + 5] as [number, number],
        swingAmount: Math.max(0.2, Math.min(0.6, 
          (this.config.lofiSettings?.swingAmount || 0.4) + (Math.random() - 0.5) * 0.1)),
        reverbAmount: Math.max(0.3, Math.min(0.8, 
          (this.config.lofiSettings?.reverbAmount || 0.6) + (Math.random() - 0.5) * 0.1)),
        lowpassFilter: Math.max(0.2, Math.min(0.7, 
          (this.config.lofiSettings?.lowpassFilter || 0.4) + (Math.random() - 0.5) * 0.1))
      }
    };
    
    // Update the music generator with new configuration
    this.musicGenerator = new LoFiHipHopGenerator(this.config);
    
    // Emit configuration evolution event
    this.emit('configurationEvolved', {
      sessionDuration: sessionDurationMinutes,
      newBPM,
      activityFactor,
      config: this.config
    });
  }

  /**
   * Prepare audio for streaming
   */
  private async prepareAudioForStreaming(music: GeneratedMusic): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Convert ArrayBuffer to AudioBuffer
      const audioBuffer = await this.audioContext.decodeAudioData(music.audioBuffer.slice(0));
      
      // Set as next buffer for crossfading
      this.nextAudioBuffer = audioBuffer;
      
      // If no current buffer, set immediately
      if (!this.currentAudioBuffer) {
        this.currentAudioBuffer = audioBuffer;
        this.startAudioPlayback();
      } else {
        // Crossfade to new track
        this.crossfadeToNewTrack();
      }
      
    } catch (error) {
      console.error('Error preparing audio for streaming:', error);
    }
  }

  /**
   * Start audio playback
   */
  private startAudioPlayback(): void {
    if (!this.audioContext || !this.currentAudioBuffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.currentAudioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
    
    // Loop the track
    source.loop = true;
    
    // Emit playback started event
    this.emit('playbackStarted', {
      track: this.currentSession?.currentTrack,
      timestamp: Date.now()
    });
  }

  /**
   * Crossfade to new track
   */
  private crossfadeToNewTrack(): void {
    if (!this.audioContext || !this.nextAudioBuffer) return;

    // Create crossfade effect
    const currentSource = this.audioContext.createBufferSource();
    const nextSource = this.audioContext.createBufferSource();
    
    currentSource.buffer = this.currentAudioBuffer!;
    nextSource.buffer = this.nextAudioBuffer;
    
    // Create gain nodes for crossfading
    const currentGain = this.audioContext.createGain();
    const nextGain = this.audioContext.createGain();
    
    currentSource.connect(currentGain);
    nextSource.connect(nextGain);
    currentGain.connect(this.audioContext.destination);
    nextGain.connect(this.audioContext.destination);
    
    // Set initial gain values
    currentGain.gain.value = 1;
    nextGain.gain.value = 0;
    
    // Start both sources
    currentSource.start();
    nextSource.start();
    
    // Crossfade over the specified duration
    const crossfadeTime = this.audioContext.currentTime + this.crossfadeDuration;
    currentGain.gain.linearRampToValueAtTime(0, crossfadeTime);
    nextGain.gain.linearRampToValueAtTime(1, crossfadeTime);
    
    // Update current buffer after crossfade
    setTimeout(() => {
      this.currentAudioBuffer = this.nextAudioBuffer;
      this.nextAudioBuffer = undefined;
    }, this.crossfadeDuration * 1000);
    
    // Emit crossfade event
    this.emit('crossfade', {
      from: this.currentSession?.currentTrack,
      to: this.nextAudioBuffer,
      duration: this.crossfadeDuration
    });
  }

  /**
   * Check if we should create an NFT snapshot
   */
  private shouldCreateNFTSnapshot(newData: BlockchainData[]): boolean {
    if (!this.nftSnapshotManager || !this.config.enableNFT) return false;
    
    // Create NFT snapshot based on significant network activity
    const avgGasPrice = newData.reduce((sum, data) => 
      sum + parseInt(data.gasPrice, 16), 0) / newData.length;
    
    // Create NFT if gas price spikes significantly
    const gasPriceThreshold = 50000000000; // 50 Gwei
    return avgGasPrice > gasPriceThreshold;
  }

  /**
   * Check if we should generate a new track
   */
  private shouldGenerateNewTrack(newData: BlockchainData[]): boolean {
    if (!this.currentSession) return false;
    
    const currentTrackDuration = Date.now() - this.currentSession.currentTrack.startTime;
    const trackDurationMs = this.currentSession.currentTrack.duration * 1000;
    
    // Generate new track if current track is almost finished
    const shouldEnd = currentTrackDuration >= trackDurationMs * 0.9; // 90% through current track
    
    // Also generate new track if there's significant blockchain activity change
    const activityChange = this.detectSignificantActivityChange(newData);
    
    return shouldEnd || activityChange;
  }

  /**
   * Detect significant changes in blockchain activity that warrant a new track
   */
  private detectSignificantActivityChange(newData: BlockchainData[]): boolean {
    if (!this.currentSession) return false;
    
    // Calculate current activity metrics
    const currentGasPrice = newData.reduce((sum, data) => 
      sum + parseInt(data.gasPrice, 16), 0) / newData.length;
    const currentTxCount = newData.length;
    
    // Get previous activity metrics (stored in session)
    const previousGasPrice = this.currentSession.currentTrack.blockchainData.gasPrice 
      ? parseInt(this.currentSession.currentTrack.blockchainData.gasPrice, 16) 
      : currentGasPrice;
    const previousTxCount = this.currentSession.currentTrack.blockchainData.transactionCount || currentTxCount;
    
    // Check for significant changes
    const gasPriceChange = Math.abs(currentGasPrice - previousGasPrice) / previousGasPrice;
    const txCountChange = Math.abs(currentTxCount - previousTxCount) / Math.max(previousTxCount, 1);
    
    // Generate new track if there's a significant change (20% or more)
    return gasPriceChange > 0.2 || txCountChange > 0.2;
  }

  /**
   * Update session statistics
   */
  private updateSessionStats(): void {
    if (!this.currentSession) return;
    
    const now = Date.now();
    const sessionDuration = now - this.currentSession.startTime;
    
    this.currentSession.stats.totalDuration = sessionDuration;
    
    // In a real implementation, you would track actual listener counts
    // For now, we'll simulate some basic stats
    this.currentSession.stats.totalListeners = Math.floor(Math.random() * 100) + 10;
    this.currentSession.stats.averageListeners = Math.floor(this.currentSession.stats.totalListeners * 0.8);
    this.currentSession.stats.peakListeners = Math.max(
      this.currentSession.stats.peakListeners,
      this.currentSession.stats.totalListeners
    );
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get streaming statistics
   */
  getStreamingStats(): {
    isActive: boolean;
    sessionDuration: number;
    tracksPlayed: number;
    nftSnapshotsCreated: number;
    currentListeners: number;
  } {
    if (!this.currentSession) {
      return {
        isActive: false,
        sessionDuration: 0,
        tracksPlayed: 0,
        nftSnapshotsCreated: 0,
        currentListeners: 0
      };
    }

    const sessionDuration = this.currentSession.endTime 
      ? this.currentSession.endTime - this.currentSession.startTime
      : Date.now() - this.currentSession.startTime;

    return {
      isActive: this.isStreaming,
      sessionDuration,
      tracksPlayed: this.currentSession.stats.tracksPlayed,
      nftSnapshotsCreated: this.currentSession.nftSnapshots.length,
      currentListeners: this.currentSession.stats.totalListeners
    };
  }

  /**
   * Update streaming configuration
   */
  updateConfig(newConfig: Partial<MusicConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart streaming if configuration changed significantly
    if (newConfig.streaming && this.isStreaming) {
      this.stopStreaming().then(() => {
        this.startStreaming();
      });
    }
  }
}
