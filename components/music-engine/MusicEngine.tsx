/**
 * Music Engine Component
 * 
 * Main UI component for the ApeBeats Music Engine
 * Provides controls for generating music from blockchain data
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useMusicEngine } from '@/lib/music-engine/useMusicEngine';
import { defaultMusicConfig, defaultNFTSnapshotConfig } from '@/lib/music-engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Download, Music, Zap, Users, Clock, Activity } from 'lucide-react';

interface MusicEngineProps {
  className?: string;
}

export function MusicEngine({ className }: MusicEngineProps) {
  const [isClient, setIsClient] = useState(false);
  const [blockCount, setBlockCount] = useState(10);
  const [startBlock, setStartBlock] = useState(0);
  const [endBlock, setEndBlock] = useState(0);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    state,
    music,
    isGenerating,
    error,
    generateFromRecent,
    generateFromBlockRange,
    generateFromAddresses,
    generateLoFiFromRecent,
    createNFTSnapshot,
    reset,
    startStreaming,
    stopStreaming,
    isStreaming,
    streamingSession,
    streamingStats,
    createStreamingNFT,
    generateVideoVisualization,
    startVideoVisualization,
    stopVideoVisualization,
    networkStats,
    refreshNetworkStats,
    updateConfig,
    config
  } = useMusicEngine({
    config: defaultMusicConfig,
    nftConfig: defaultNFTSnapshotConfig
  });

  // Handle initialization errors
  if (state.status === 'error' && state.error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <strong>Music Engine Error:</strong> {state.error}
            </div>
            <div className="mt-4 text-sm text-red-500">
              <p>The music engine failed to initialize. This might be due to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Missing environment variables</li>
                <li>Network connectivity issues</li>
                <li>Browser compatibility problems</li>
              </ul>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGenerateRecent = async () => {
    try {
      console.log('Starting music generation...');
      const result = await generateFromRecent(blockCount);
      console.log('Music generated successfully:', result);
    } catch (err) {
      console.error('Failed to generate music:', err);
    }
  };

  const handleGenerateLoFi = async () => {
    try {
      console.log('Starting LoFi music generation...');
      const result = await generateLoFiFromRecent(blockCount);
      console.log('LoFi music generated successfully:', result);
    } catch (err) {
      console.error('Failed to generate LoFi music:', err);
    }
  };

  const handleStartStreaming = async () => {
    try {
      await startStreaming();
    } catch (err) {
      console.error('Failed to start streaming:', err);
    }
  };

  const handleStopStreaming = async () => {
    try {
      await stopStreaming();
    } catch (err) {
      console.error('Failed to stop streaming:', err);
    }
  };

  const handleCreateStreamingNFT = async () => {
    try {
      const result = await createStreamingNFT();
      console.log('Streaming NFT created:', result);
      alert(`Streaming NFT created successfully! Token ID: ${result.tokenId}`);
    } catch (err) {
      console.error('Failed to create streaming NFT:', err);
    }
  };

  const handleGenerateBlockRange = async () => {
    if (startBlock <= 0 || endBlock <= 0 || startBlock >= endBlock) {
      alert('Please enter valid block numbers');
      return;
    }
    try {
      await generateFromBlockRange(startBlock, endBlock);
    } catch (err) {
      console.error('Failed to generate music:', err);
    }
  };

  const handleGenerateFromAddresses = async () => {
    if (addresses.length === 0) {
      alert('Please add at least one address');
      return;
    }
    try {
      await generateFromAddresses(addresses, 50);
    } catch (err) {
      console.error('Failed to generate music:', err);
    }
  };

  const handleCreateNFT = async () => {
    if (!music) return;
    try {
      const result = await createNFTSnapshot(music);
      console.log('NFT created:', result);
      alert(`NFT created successfully! Token ID: ${result.tokenId}`);
    } catch (err) {
      console.error('Failed to create NFT:', err);
    }
  };

  const handleDownload = () => {
    if (!music) return;
    const link = document.createElement('a');
    link.href = music.audioUrl;
    link.download = `apechain-symphony-${music.id}.wav`;
    link.click();
  };

  const addAddress = () => {
    if (newAddress && !addresses.includes(newAddress)) {
      setAddresses([...addresses, newAddress]);
      setNewAddress('');
    }
  };

  const removeAddress = (address: string) => {
    setAddresses(addresses.filter(addr => addr !== address));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'generating': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'collecting': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isClient) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎵 ApeBeats LoFi Music Engine</h1>
        <p className="text-muted-foreground">
          Generate unique LoFi Hip Hop music from ApeChain blockchain data
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Badge variant="secondary">24/7 Streaming</Badge>
          <Badge variant="secondary">NFT Snapshots</Badge>
          <Badge variant="secondary">Video Visualization</Badge>
        </div>
      </div>

      {/* Network Stats */}
      {networkStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{networkStats.totalTransactions}</div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(networkStats.averageGasPrice / 1000000000)} Gwei
                </div>
                <div className="text-sm text-muted-foreground">Avg Gas Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{networkStats.averageBlockTime}s</div>
                <div className="text-sm text-muted-foreground">Block Time</div>
              </div>
              <div className="text-center">
                <Badge variant={
                  networkStats.networkActivity === 'high' ? 'destructive' :
                  networkStats.networkActivity === 'medium' ? 'default' : 'secondary'
                }>
                  {networkStats.networkActivity.toUpperCase()}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Activity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaming Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            24/7 Streaming
          </CardTitle>
          <CardDescription>
            Start continuous LoFi streaming with real-time ApeChain data variations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {!isStreaming ? (
              <Button onClick={handleStartStreaming} disabled={isGenerating} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start 24/7 Stream
              </Button>
            ) : (
              <Button onClick={handleStopStreaming} variant="destructive" className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Stop Stream
              </Button>
            )}
            {isStreaming && (
              <Button onClick={handleCreateStreamingNFT} variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Create NFT
              </Button>
            )}
          </div>
          
          {streamingStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Session Duration</div>
                <div className="font-semibold">
                  {Math.floor(streamingStats.sessionDuration / 1000 / 60)}m
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Tracks Played</div>
                <div className="font-semibold">{streamingStats.tracksPlayed}</div>
              </div>
              <div>
                <div className="text-muted-foreground">NFTs Created</div>
                <div className="font-semibold">{streamingStats.nftSnapshotsCreated}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Listeners</div>
                <div className="font-semibold">{streamingStats.currentListeners}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Generate music from recent blockchain activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Block Count</label>
              <input
                type="number"
                value={blockCount}
                onChange={(e) => setBlockCount(parseInt(e.target.value) || 10)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                min="1"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleGenerateLoFi} 
                disabled={isGenerating}
                className="w-full"
              >
                <Music className="h-4 w-4 mr-2" />
                Generate LoFi Hip Hop
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Block Range */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Block Range
            </CardTitle>
            <CardDescription>
              Generate music from specific block range
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Start Block</label>
              <input
                type="number"
                value={startBlock}
                onChange={(e) => setStartBlock(parseInt(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Block</label>
              <input
                type="number"
                value={endBlock}
                onChange={(e) => setEndBlock(parseInt(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                min="0"
              />
            </div>
            <Button 
              onClick={handleGenerateBlockRange} 
              disabled={isGenerating}
              className="w-full"
            >
              <Music className="h-4 w-4 mr-2" />
              Generate LoFi from Range
            </Button>
          </CardContent>
        </Card>

        {/* Address Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Address Monitoring
            </CardTitle>
            <CardDescription>
              Generate music from specific addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Addresses</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={addAddress} size="sm">
                  Add
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {addresses.map((address) => (
                  <div key={address} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm font-mono">{address.slice(0, 10)}...</span>
                    <Button 
                      onClick={() => removeAddress(address)} 
                      size="sm" 
                      variant="ghost"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Button 
              onClick={handleGenerateFromAddresses} 
              disabled={isGenerating || addresses.length === 0}
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Generate LoFi from Addresses
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(state.status)}`} />
              {state.currentStep}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={state.progress} className="w-full" />
            <div className="text-sm text-muted-foreground mt-2">
              {state.progress}% complete
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <strong>Error:</strong> {typeof error === 'string' ? error : error.message || 'An unknown error occurred'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Music */}
      {music && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Generated Music
            </CardTitle>
            <CardDescription>
              {music.nftMetadata.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Music Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Tempo</div>
                <div className="font-semibold">{music.parameters.tempo} BPM</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Key</div>
                <div className="font-semibold">{music.parameters.key} {music.parameters.scale}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="font-semibold">{music.duration.toFixed(1)}s</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Transactions</div>
                <div className="font-semibold">{music.sourceData.transactionCount}</div>
              </div>
            </div>

            {/* Audio Player */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Audio Preview</div>
              <audio controls className="w-full">
                <source src={music.audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {config.enableNFT && (
                <Button onClick={handleCreateNFT}>
                  <Zap className="h-4 w-4 mr-2" />
                  Create NFT
                </Button>
              )}
              <Button onClick={reset} variant="ghost">
                <Pause className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* NFT Metadata Preview */}
            {config.enableNFT && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">NFT Metadata Preview</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div><strong>Name:</strong> {music.nftMetadata.name}</div>
                  <div><strong>Description:</strong> {music.nftMetadata.description}</div>
                  <div><strong>Attributes:</strong> {music.nftMetadata.attributes.length} traits</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
