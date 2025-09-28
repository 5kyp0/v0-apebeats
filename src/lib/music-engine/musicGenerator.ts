/**
 * Music Generator
 * 
 * Converts blockchain data into musical parameters and generates audio
 * Designed with NFT snapshot integration in mind
 */

import { BlockchainData, MusicParameters, GeneratedMusic, MusicConfig } from './types';

export class MusicGenerator {
  private config: MusicConfig;

  constructor(config: MusicConfig) {
    this.config = config;
  }

  /**
   * Generate music from blockchain data
   * @param blockchainData Array of blockchain data
   * @returns Generated music with NFT metadata
   */
  async generateMusic(blockchainData: BlockchainData[]): Promise<GeneratedMusic> {
    try {
      // Step 1: Convert blockchain data to music parameters
      const parameters = this.convertToMusicParameters(blockchainData);
      
      // Step 2: Generate audio
      const audioBuffer = await this.generateAudio(parameters);
      
      // Step 3: Create NFT metadata
      const nftMetadata = this.createNFTMetadata(blockchainData, parameters);
      
      // Step 4: Create provenance data
      const provenance = this.createProvenanceData(blockchainData, parameters);
      
      // Step 5: Generate unique ID
      const id = await this.generateUniqueId(blockchainData, parameters);

      // Convert to WAV format
      const wavBuffer = this.convertToWAV(audioBuffer, 44100);
      
      return {
        id,
        timestamp: Date.now(),
        sourceData: blockchainData[0], // Primary source
        parameters,
        audioBuffer: wavBuffer,
        audioUrl: URL.createObjectURL(new Blob([wavBuffer], { type: 'audio/wav' })),
        duration: this.calculateDuration(parameters),
        nftMetadata,
        provenance
      };
    } catch (error) {
      console.error('Error generating music:', error);
      throw new Error(`Failed to generate music: ${error}`);
    }
  }

  /**
   * Convert blockchain data to music parameters
   */
  private convertToMusicParameters(blockchainData: BlockchainData[]): MusicParameters {
    const primaryData = blockchainData[0];
    
    // Calculate tempo from gas price and block time
    const avgGasPrice = blockchainData.reduce((sum, data) => 
      sum + parseInt(data.gasPrice, 16), 0) / blockchainData.length;
    const tempo = Math.min(Math.max(60 + (avgGasPrice / 1000000000), 60), 180);

    // Calculate time signature from transaction patterns
    const txCount = blockchainData.length;
    const timeSignature: [number, number] = txCount % 3 === 0 ? [3, 4] : [4, 4];

    // Calculate swing from gas usage patterns
    const avgGasUsed = blockchainData.reduce((sum, data) => 
      sum + parseInt(data.gasUsed, 16), 0) / blockchainData.length;
    const swing = Math.min(avgGasUsed / 1000000, 1);

    // Determine key and scale from addresses
    const key = this.addressToKey(primaryData.fromAddress);
    const scale = this.valueToScale(primaryData.value);

    // Generate chord progression from transaction hashes
    const chordProgression = this.generateChordProgression(blockchainData);

    // Create melody pattern from transaction data
    const melodyPattern = this.generateMelodyPattern(blockchainData);
    const noteDuration = this.generateNoteDurations(blockchainData);

    // Calculate octave range from block numbers
    const octaveRange: [number, number] = [
      Math.min(3 + (primaryData.blockNumber % 3), 6),
      Math.min(6 + (primaryData.blockNumber % 2), 8)
    ];

    // Calculate dynamics from gas usage and values
    const volume = Math.min(0.3 + (avgGasUsed / 2000000), 1);
    const reverb = Math.min(avgGasPrice / 10000000000, 1);
    const delay = Math.min(txCount / 20, 1);
    const distortion = Math.min(parseInt(primaryData.value, 16) / 1000000000000000000, 1);

    // Calculate structure from block data
    const introLength = Math.max(2, Math.floor(txCount / 10));
    const verseLength = Math.max(4, Math.floor(txCount / 5));
    const chorusLength = Math.max(4, Math.floor(txCount / 8));
    const outroLength = Math.max(2, Math.floor(txCount / 15));

    // Create deterministic seed
    const seed = this.createSeed(blockchainData);

    return {
      tempo,
      timeSignature,
      swing,
      key,
      scale,
      chordProgression,
      melodyPattern,
      noteDuration,
      octaveRange,
      volume,
      reverb,
      delay,
      distortion,
      introLength,
      verseLength,
      chorusLength,
      outroLength,
      seed
    };
  }

  /**
   * Generate audio from music parameters
   */
  private async generateAudio(parameters: MusicParameters): Promise<ArrayBuffer> {
    const sampleRate = 44100;
    const duration = this.calculateDuration(parameters);
    const samples = Math.floor(sampleRate * duration);
    
    // Create a more complex audio buffer with multiple layers
    const buffer = new ArrayBuffer(samples * 4); // 16-bit stereo
    const leftChannel = new Int16Array(buffer, 0, samples);
    const rightChannel = new Int16Array(buffer, samples * 2, samples);

    // Generate multiple audio layers
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;
      const beatTime = time * (parameters.tempo / 60);
      
      // Generate melody
      const melody = this.generateMelodyNote(time, parameters);
      
      // Generate bass line
      const bass = this.generateBassLine(beatTime, parameters);
      
      // Generate chord progression
      const chords = this.generateChordNotes(beatTime, parameters);
      
      // Generate drum pattern
      const drums = this.generateDrumPattern(beatTime, parameters);
      
      // Combine all elements
      const leftSample = (melody + bass + chords + drums) * parameters.volume;
      const rightSample = (melody * 0.8 + bass + chords * 0.9 + drums) * parameters.volume;
      
      // Apply effects
      const processedLeft = this.applyEffects(leftSample, parameters, time);
      const processedRight = this.applyEffects(rightSample, parameters, time);
      
      leftChannel[i] = Math.max(-32768, Math.min(32767, processedLeft * 32767));
      rightChannel[i] = Math.max(-32768, Math.min(32767, processedRight * 32767));
    }

    return buffer;
  }

  /**
   * Create NFT metadata
   */
  private createNFTMetadata(blockchainData: BlockchainData[], parameters: MusicParameters) {
    const primaryData = blockchainData[0];
    const timestamp = new Date(primaryData.timestamp * 1000);
    
    return {
      name: `ApeChain Symphony #${primaryData.blockNumber}`,
      description: `Generative music piece created from ApeChain blockchain data. Generated from block ${primaryData.blockNumber} with ${blockchainData.length} transactions. Tempo: ${parameters.tempo} BPM, Key: ${parameters.key} ${parameters.scale}.`,
      image: this.generateWaveformImage(parameters), // Base64 encoded waveform
      audio: '', // Will be set when uploaded to IPFS/Arweave
      attributes: [
        { trait_type: 'Block Number', value: primaryData.blockNumber },
        { trait_type: 'Transaction Count', value: blockchainData.length },
        { trait_type: 'Tempo', value: parameters.tempo },
        { trait_type: 'Key', value: parameters.key },
        { trait_type: 'Scale', value: parameters.scale },
        { trait_type: 'Time Signature', value: `${parameters.timeSignature[0]}/${parameters.timeSignature[1]}` },
        { trait_type: 'Duration', value: `${this.calculateDuration(parameters)}s` },
        { trait_type: 'Network Activity', value: blockchainData.length > 10 ? 'High' : blockchainData.length > 5 ? 'Medium' : 'Low' },
        { trait_type: 'Generation Date', value: timestamp.toISOString() },
        { trait_type: 'Data Hash', value: primaryData.dataHash.slice(0, 16) }
      ],
      external_url: `https://apebeats.com/music/${primaryData.dataHash}`,
      background_color: this.generateBackgroundColor(parameters),
      animation_url: this.generateAnimationUrl(parameters)
    };
  }

  /**
   * Create provenance data for NFT
   */
  private createProvenanceData(blockchainData: BlockchainData[], parameters: MusicParameters) {
    return {
      originalDataHash: blockchainData[0].dataHash,
      generationAlgorithm: 'ApeChain Music Engine v1.0',
      version: '1.0.0',
      creator: 'ApeBeats Music Engine'
    };
  }

  /**
   * Generate unique ID for the music piece
   */
  private async generateUniqueId(blockchainData: BlockchainData[], parameters: MusicParameters): Promise<string> {
    const dataString = `${blockchainData[0].dataHash}-${parameters.seed}-${Date.now()}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  }

  // Helper methods for music generation

  private addressToKey(address: string): string {
    const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const keyIndex = parseInt(address.slice(-1), 16) % keys.length;
    return keys[keyIndex];
  }

  private valueToScale(value: string): string {
    const scales = ['major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'locrian'];
    const scaleIndex = parseInt(value.slice(-1), 16) % scales.length;
    return scales[scaleIndex];
  }

  private generateChordProgression(blockchainData: BlockchainData[]): string[] {
    const chords = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    const progression: string[] = [];
    
    for (let i = 0; i < Math.min(blockchainData.length, 8); i++) {
      const chordIndex = parseInt(blockchainData[i].transactionHash.slice(-1), 16) % chords.length;
      progression.push(chords[chordIndex]);
    }
    
    return progression;
  }

  private generateMelodyPattern(blockchainData: BlockchainData[]): number[] {
    const pattern: number[] = [];
    
    for (const data of blockchainData.slice(0, 16)) {
      const note = parseInt(data.transactionHash.slice(-2), 16) % 12;
      pattern.push(note);
    }
    
    return pattern;
  }

  private generateNoteDurations(blockchainData: BlockchainData[]): number[] {
    const durations: number[] = [];
    
    for (const data of blockchainData.slice(0, 16)) {
      const duration = 0.25 + (parseInt(data.gasUsed, 16) % 4) * 0.25;
      durations.push(duration);
    }
    
    return durations;
  }

  private createSeed(blockchainData: BlockchainData[]): string {
    return blockchainData[0].dataHash.slice(0, 16);
  }

  private calculateDuration(parameters: MusicParameters): number {
    const totalBars = parameters.introLength + parameters.verseLength + 
                     parameters.chorusLength + parameters.outroLength;
    const secondsPerBar = (60 / parameters.tempo) * parameters.timeSignature[0];
    const duration = totalBars * secondsPerBar;
    // Limit duration to prevent memory issues (max 5 minutes)
    return Math.min(duration, 300);
  }

  private getFrequencyFromMelody(melodyPattern: number[], time: number, parameters: MusicParameters): number {
    const noteIndex = Math.floor(time * 4) % melodyPattern.length;
    const note = melodyPattern[noteIndex];
    const octave = Math.floor(time) % (parameters.octaveRange[1] - parameters.octaveRange[0] + 1) + parameters.octaveRange[0];
    
    // Convert note number to frequency (A4 = 440Hz)
    const frequencies = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88];
    const baseFreq = frequencies[note % 12];
    return baseFreq * Math.pow(2, octave - 4);
  }

  private generateWaveformImage(parameters: MusicParameters): string {
    // Generate a simple waveform visualization
    // In a real implementation, you would create an actual waveform image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    
    // Simple waveform visualization
    ctx.fillStyle = this.generateBackgroundColor(parameters);
    ctx.fillRect(0, 0, 400, 200);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < 400; i++) {
      const x = i;
      const y = 100 + Math.sin(i * 0.1) * 50 * parameters.volume;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    
    return canvas.toDataURL();
  }

  private generateBackgroundColor(parameters: MusicParameters): string {
    const colors = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#7209b7'];
    const colorIndex = parameters.melodyPattern[0] % colors.length;
    return colors[colorIndex];
  }

  private generateAnimationUrl(parameters: MusicParameters): string {
    // Return URL to interactive NFT animation
    return `https://apebeats.com/animation/${parameters.seed}`;
  }

  // Audio generation helper methods
  private generateMelodyNote(time: number, parameters: MusicParameters): number {
    const noteIndex = Math.floor(time * 4) % parameters.melodyPattern.length;
    const note = parameters.melodyPattern[noteIndex];
    const frequency = this.getFrequencyFromMelody(parameters.melodyPattern, time, parameters);
    return Math.sin(2 * Math.PI * frequency * time) * 0.3;
  }

  private generateBassLine(beatTime: number, parameters: MusicParameters): number {
    const chordIndex = Math.floor(beatTime / 4) % parameters.chordProgression.length;
    const chord = parameters.chordProgression[chordIndex];
    const rootNote = this.chordToRootNote(chord);
    const frequency = this.noteToFrequency(rootNote, 2); // Bass octave
    return Math.sin(2 * Math.PI * frequency * beatTime) * 0.4;
  }

  private generateChordNotes(beatTime: number, parameters: MusicParameters): number {
    const chordIndex = Math.floor(beatTime / 4) % parameters.chordProgression.length;
    const chord = parameters.chordProgression[chordIndex];
    const chordNotes = this.chordToNotes(chord);
    
    let chordSound = 0;
    for (const note of chordNotes) {
      const frequency = this.noteToFrequency(note, 4); // Mid octave
      chordSound += Math.sin(2 * Math.PI * frequency * beatTime) * 0.1;
    }
    
    return chordSound;
  }

  private generateDrumPattern(beatTime: number, parameters: MusicParameters): number {
    const beatIndex = Math.floor(beatTime * 2) % 8;
    
    // Simple kick pattern
    if (beatIndex === 0 || beatIndex === 4) {
      const frequency = 60;
      const envelope = Math.exp(-(beatTime % 0.5) * 10);
      return Math.sin(2 * Math.PI * frequency * beatTime) * envelope * 0.3;
    }
    
    // Simple snare pattern
    if (beatIndex === 2 || beatIndex === 6) {
      const frequency = 200;
      const envelope = Math.exp(-(beatTime % 0.5) * 15);
      return Math.sin(2 * Math.PI * frequency * beatTime) * envelope * 0.2;
    }
    
    return 0;
  }

  private applyEffects(sample: number, parameters: MusicParameters, time: number): number {
    // Apply reverb
    let processedSample = sample * (1 + parameters.reverb * 0.1);
    
    // Apply delay
    if (parameters.delay > 0) {
      const delayTime = 0.1; // 100ms delay
      const delaySample = Math.sin(2 * Math.PI * 1000 * (time - delayTime)) * 0.1;
      processedSample += delaySample * parameters.delay;
    }
    
    // Apply distortion
    if (parameters.distortion > 0) {
      processedSample = Math.tanh(processedSample * (1 + parameters.distortion));
    }
    
    return processedSample;
  }

  private chordToRootNote(chord: string): number {
    const noteMap: { [key: string]: number } = {
      'I': 0, 'ii': 2, 'iii': 4, 'IV': 5, 'V': 7, 'vi': 9, 'vii°': 11
    };
    return noteMap[chord] || 0;
  }

  private chordToNotes(chord: string): number[] {
    const root = this.chordToRootNote(chord);
    
    if (chord.includes('maj') || chord === 'I' || chord === 'IV' || chord === 'V') {
      return [root, root + 4, root + 7]; // Major triad
    } else if (chord.includes('min') || chord === 'ii' || chord === 'iii' || chord === 'vi') {
      return [root, root + 3, root + 7]; // Minor triad
    } else {
      return [root, root + 3, root + 6]; // Diminished triad
    }
  }

  private noteToFrequency(note: number, octave: number): number {
    const A4 = 440; // A4 = 440 Hz
    const semitones = note + (octave - 4) * 12;
    return A4 * Math.pow(2, semitones / 12);
  }

  private convertToWAV(audioBuffer: ArrayBuffer, sampleRate: number): ArrayBuffer {
    const length = audioBuffer.byteLength;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Copy audio data
    const audioView = new Uint8Array(audioBuffer);
    const wavView = new Uint8Array(buffer, 44);
    wavView.set(audioView);
    
    return buffer;
  }
}
