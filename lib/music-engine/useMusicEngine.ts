/**
 * React Hook for ApeBeats Music Engine
 * 
 * Provides easy integration with React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApeBeatsMusicEngine, MusicConfig, NFTSnapshotConfig, GeneratedMusic, GenerationState, VideoVisualization, StreamingSession } from './index';

export interface UseMusicEngineOptions {
  config: MusicConfig;
  nftConfig?: NFTSnapshotConfig;
  autoStart?: boolean;
}

export interface UseMusicEngineReturn {
  // Engine state
  state: GenerationState;
  music: GeneratedMusic | null;
  isGenerating: boolean;
  error: string | null;
  
  // Engine methods
  generateFromRecent: (blockCount?: number) => Promise<GeneratedMusic>;
  generateFromBlockRange: (startBlock: number, endBlock: number) => Promise<GeneratedMusic>;
  generateFromAddresses: (addresses: string[], blockCount?: number) => Promise<GeneratedMusic>;
  generateLoFiFromRecent: (blockCount?: number) => Promise<GeneratedMusic>;
  createNFTSnapshot: (music: GeneratedMusic) => Promise<any>;
  reset: () => void;
  
  // Streaming methods
  startStreaming: () => Promise<StreamingSession>;
  stopStreaming: () => Promise<void>;
  isStreaming: boolean;
  streamingSession: StreamingSession | null;
  streamingStats: any;
  createStreamingNFT: () => Promise<any>;
  
  // Video visualization methods
  generateVideoVisualization: (music: GeneratedMusic, blockchainData: any[], canvas?: HTMLCanvasElement) => Promise<VideoVisualization>;
  startVideoVisualization: (music: GeneratedMusic, blockchainData: any[], canvas: HTMLCanvasElement) => void;
  stopVideoVisualization: () => void;
  
  // Network info
  networkStats: any | null;
  refreshNetworkStats: () => Promise<void>;
  
  // Configuration
  updateConfig: (newConfig: Partial<MusicConfig>) => void;
  config: MusicConfig;
}

export function useMusicEngine(options: UseMusicEngineOptions): UseMusicEngineReturn {
  const { config, nftConfig, autoStart = false } = options;
  
  // State
  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    progress: 0,
    currentStep: 'Initializing...'
  });
  const [music, setMusic] = useState<GeneratedMusic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkStats, setNetworkStats] = useState<any | null>(null);
  const [currentConfig, setCurrentConfig] = useState<MusicConfig>(config);
  const [streamingSession, setStreamingSession] = useState<StreamingSession | null>(null);
  const [streamingStats, setStreamingStats] = useState<any>(null);
  
  // Engine instance
  const engineRef = useRef<ApeBeatsMusicEngine | null>(null);
  
  // Initialize engine
  useEffect(() => {
    try {
      engineRef.current = new ApeBeatsMusicEngine(currentConfig, nftConfig);
      setState({
        status: 'idle',
        progress: 0,
        currentStep: 'Ready'
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize music engine');
    }
  }, [currentConfig, nftConfig]);
  
  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && engineRef.current && state.status === 'idle') {
      generateFromRecent();
    }
  }, [autoStart, state.status]);
  
  // Poll engine state
  useEffect(() => {
    if (!engineRef.current) return;
    
    const interval = setInterval(() => {
      if (engineRef.current) {
        const engineState = engineRef.current.getState();
        setState(engineState);
        
        if (engineState.status === 'error' && engineState.error) {
          setError(engineState.error);
        }
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generate from recent activity
  const generateFromRecent = useCallback(async (blockCount: number = 10): Promise<GeneratedMusic> => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      setError(null);
      const result = await engineRef.current.generateFromRecentActivity(blockCount);
      setMusic(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate music';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  // Generate from block range
  const generateFromBlockRange = useCallback(async (startBlock: number, endBlock: number): Promise<GeneratedMusic> => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      setError(null);
      const result = await engineRef.current.generateFromBlockRange(startBlock, endBlock);
      setMusic(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate music';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  // Generate from addresses
  const generateFromAddresses = useCallback(async (addresses: string[], blockCount: number = 50): Promise<GeneratedMusic> => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      setError(null);
      const result = await engineRef.current.generateFromAddresses(addresses, blockCount);
      setMusic(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate music';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Generate LoFi from recent activity
  const generateLoFiFromRecent = useCallback(async (blockCount: number = 10): Promise<GeneratedMusic> => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      setError(null);
      const result = await engineRef.current.generateLoFiFromRecentActivity(blockCount);
      setMusic(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate LoFi music';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  // Create NFT snapshot
  const createNFTSnapshot = useCallback(async (music: GeneratedMusic): Promise<any> => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      setError(null);
      const result = await engineRef.current.createNFTSnapshot(music);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create NFT snapshot';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  // Reset engine
  const reset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
    }
    setMusic(null);
    setError(null);
    setState({
      status: 'idle',
      progress: 0,
      currentStep: 'Ready'
    });
  }, []);
  
  // Refresh network stats
  const refreshNetworkStats = useCallback(async () => {
    if (!engineRef.current) return;
    
    try {
      const stats = await engineRef.current.getNetworkStats();
      setNetworkStats(stats);
    } catch (err) {
      console.error('Failed to refresh network stats:', err);
    }
  }, []);
  
  // Streaming methods
  const startStreaming = useCallback(async (): Promise<StreamingSession> => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      setError(null);
      const session = await engineRef.current.startStreaming();
      setStreamingSession(session);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start streaming';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const stopStreaming = useCallback(async (): Promise<void> => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      setError(null);
      await engineRef.current.stopStreaming();
      setStreamingSession(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop streaming';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const createStreamingNFT = useCallback(async (): Promise<any> => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      setError(null);
      const result = await engineRef.current.createStreamingNFT();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create streaming NFT';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Video visualization methods
  const generateVideoVisualization = useCallback(async (
    music: GeneratedMusic, 
    blockchainData: any[], 
    canvas?: HTMLCanvasElement
  ): Promise<VideoVisualization> => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      setError(null);
      const result = await engineRef.current.generateVideoVisualization(music, blockchainData, canvas);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate video visualization';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const startVideoVisualization = useCallback((
    music: GeneratedMusic, 
    blockchainData: any[], 
    canvas: HTMLCanvasElement
  ): void => {
    if (!engineRef.current) {
      throw new Error('Music engine not initialized');
    }
    
    try {
      engineRef.current.startVideoVisualization(music, blockchainData, canvas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start video visualization';
      setError(errorMessage);
    }
  }, []);

  const stopVideoVisualization = useCallback((): void => {
    if (!engineRef.current) {
      return;
    }
    
    try {
      engineRef.current.stopVideoVisualization();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop video visualization';
      setError(errorMessage);
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<MusicConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...newConfig }));
  }, []);
  
  // Load network stats on mount
  useEffect(() => {
    refreshNetworkStats();
  }, [refreshNetworkStats]);
  
  return {
    state,
    music,
    isGenerating: state.status === 'collecting' || state.status === 'processing' || state.status === 'generating',
    error,
    generateFromRecent,
    generateFromBlockRange,
    generateFromAddresses,
    generateLoFiFromRecent,
    createNFTSnapshot,
    reset,
    startStreaming,
    stopStreaming,
    isStreaming: engineRef.current?.isStreaming() || false,
    streamingSession,
    streamingStats: engineRef.current?.getStreamingStats() || null,
    createStreamingNFT,
    generateVideoVisualization,
    startVideoVisualization,
    stopVideoVisualization,
    networkStats,
    refreshNetworkStats,
    updateConfig,
    config: currentConfig
  };
}

// Hook for NFT snapshot management
export interface UseNFTSnapshotOptions {
  nftConfig: NFTSnapshotConfig;
}

export interface UseNFTSnapshotReturn {
  createSnapshot: (music: GeneratedMusic) => Promise<any>;
  createBatchSnapshots: (musicPieces: GeneratedMusic[]) => Promise<any[]>;
  isCreating: boolean;
  error: string | null;
}

export function useNFTSnapshot(options: UseNFTSnapshotOptions): UseNFTSnapshotReturn {
  const { nftConfig } = options;
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createSnapshot = useCallback(async (music: GeneratedMusic) => {
    setIsCreating(true);
    setError(null);
    
    try {
      // This would integrate with your NFT snapshot manager
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        tokenId: `token_${Date.now()}`,
        metadataUri: 'ipfs://simulated_metadata_hash',
        transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        contractAddress: nftConfig.contractAddress || '0x...'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create NFT snapshot';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [nftConfig]);
  
  const createBatchSnapshots = useCallback(async (musicPieces: GeneratedMusic[]) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const results = [];
      for (const music of musicPieces) {
        const result = await createSnapshot(music);
        results.push(result);
        // Add delay between snapshots
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create batch snapshots';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [createSnapshot]);
  
  return {
    createSnapshot,
    createBatchSnapshots,
    isCreating,
    error
  };
}
