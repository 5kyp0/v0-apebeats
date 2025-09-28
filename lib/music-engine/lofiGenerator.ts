/**
 * LoFi Hip Hop Music Generator
 * 
 * Specialized generator for creating LoFi Hip Hop music from blockchain data
 * Implements characteristic LoFi elements: 70-90 BPM, jazz chords, vinyl crackle, swing
 */

import { BlockchainData, MusicParameters, GeneratedMusic, MusicConfig } from './types';

export class LoFiHipHopGenerator {
  private config: MusicConfig;

  constructor(config: MusicConfig) {
    this.config = config;
  }

  /**
   * Generate LoFi Hip Hop music from blockchain data
   */
  async generateLoFiMusic(blockchainData: BlockchainData[]): Promise<GeneratedMusic> {
    try {
      // Validate input data
      if (!blockchainData || blockchainData.length === 0) {
        throw new Error('No blockchain data provided for music generation');
      }

      // Step 1: Convert blockchain data to LoFi-specific parameters
      const parameters = this.convertToLoFiParameters(blockchainData);
      
      // Step 2: Generate LoFi audio with characteristic elements
      const audioBuffer = await this.generateLoFiAudio(parameters, blockchainData);
      
      // Step 3: Create NFT metadata with LoFi-specific attributes
      const nftMetadata = this.createLoFiNFTMetadata(blockchainData, parameters);
      
      // Step 4: Create provenance data
      const provenance = this.createProvenanceData(blockchainData, parameters);
      
      // Step 5: Generate unique ID
      const id = await this.generateUniqueId(blockchainData, parameters);

      // Convert to WAV format
      const wavBuffer = this.convertToWAV(audioBuffer, 44100);
      
      return {
        id,
        timestamp: Date.now(),
        sourceData: blockchainData[0],
        parameters,
        audioBuffer: wavBuffer,
        audioUrl: URL.createObjectURL(new Blob([wavBuffer], { type: 'audio/wav' })),
        duration: this.calculateDuration(parameters),
        nftMetadata,
        provenance
      };
    } catch (error) {
      console.error('Error generating LoFi music:', error);
      throw new Error(`Failed to generate LoFi music: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Convert blockchain data to LoFi-specific music parameters
   */
  private convertToLoFiParameters(blockchainData: BlockchainData[]): MusicParameters {
    const primaryData = blockchainData[0];
    const lofiSettings = this.config.lofiSettings || this.getDefaultLoFiSettings();
    
    // LoFi BPM range: 70-90, influenced by gas price
    const avgGasPrice = blockchainData.reduce((sum, data) => 
      sum + parseInt(data.gasPrice, 16), 0) / blockchainData.length;
    const gasInfluence = Math.min(avgGasPrice / 10000000000, 1); // Normalize gas price
    const tempo = lofiSettings.bpmRange[0] + 
      (gasInfluence * (lofiSettings.bpmRange[1] - lofiSettings.bpmRange[0]));

    // LoFi time signature is almost always 4/4
    const timeSignature: [number, number] = [4, 4];

    // Swing amount from LoFi settings, influenced by transaction patterns
    const txVariation = this.calculateTransactionVariation(blockchainData);
    const swing = lofiSettings.swingAmount + (txVariation * 0.15); // Increased swing variation

    // Jazz-inspired key and scale selection
    const key = this.selectJazzKey(primaryData.fromAddress);
    const scale = this.selectJazzScale(primaryData.value);

    // LoFi chord progressions (jazz-inspired)
    const chordProgression = this.generateLoFiChordProgression(blockchainData);

    // LoFi melody patterns (simple, repetitive, nostalgic)
    const melodyPattern = this.generateLoFiMelodyPattern(blockchainData);
    const noteDuration = this.generateLoFiNoteDurations(blockchainData);

    // LoFi octave range (lower, more mellow) - fixed high pitch issue
    const octaveRange: [number, number] = [1, 3]; // Even lower range for authentic LoFi sound

    // Enhanced LoFi dynamics with better reverb and atmospheric elements
    const volume = 0.4 + (gasInfluence * 0.2); // Quieter than other genres
    const reverb = lofiSettings.reverbAmount + (txVariation * 0.15); // Increased reverb variation
    const delay = 0.25 + (txVariation * 0.15); // Increased delay for more atmosphere
    const distortion = 0.1; // Minimal distortion for LoFi

    // LoFi structure (longer, more repetitive)
    const introLength = 4; // 4 bars intro
    const verseLength = 8; // 8 bars verse
    const chorusLength = 8; // 8 bars chorus
    const outroLength = 4; // 4 bars outro

    // Create deterministic seed
    const seed = this.createLoFiSeed(blockchainData);

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
   * Generate LoFi audio with characteristic elements
   */
  private async generateLoFiAudio(parameters: MusicParameters, blockchainData: BlockchainData[]): Promise<ArrayBuffer> {
    const sampleRate = 44100;
    const duration = this.calculateDuration(parameters);
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(samples * 4); // 16-bit stereo (2 bytes per sample, 2 channels)
    const leftChannel = new Int16Array(buffer, 0, samples);
    const rightChannel = new Int16Array(buffer, samples * 2, samples);

    // Generate LoFi elements
    const kickPattern = this.generateLoFiKickPattern(parameters);
    const snarePattern = this.generateLoFiSnarePattern(parameters);
    const hihatPattern = this.generateLoFiHihatPattern(parameters);
    const chordProgression = this.generateLoFiChordProgression(blockchainData);
    const melody = this.generateLoFiMelody(parameters);

    // Generate audio samples
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;
      const beatTime = time * (parameters.tempo / 60);
      
      // Generate kick drum
      const kick = this.generateKickDrum(beatTime, kickPattern, parameters);
      
      // Generate snare drum
      const snare = this.generateSnareDrum(beatTime, snarePattern, parameters);
      
      // Generate hihat
      const hihat = this.generateHihat(beatTime, hihatPattern, parameters);
      
      // Generate bass line
      const bass = this.generateLoFiBass(beatTime, chordProgression, parameters);
      
      // Generate chord progression
      const chords = this.generateLoFiChords(beatTime, chordProgression, parameters);
      
      // Generate melody
      const melodyNote = this.generateMelodyNote(beatTime, melody, parameters);
      
      // Generate vinyl crackle
      const crackle = this.generateVinylCrackle(time, parameters);
      
      // Enhanced stereo mixing with better balance
      const leftSample = this.applyLoFiEffects(
        kick * 0.7 + snare * 0.7 + hihat * 0.7 + bass * 1.0 + chords * 0.8 + melodyNote * 0.9 + crackle,
        parameters,
        time
      );
      
      // Stereo spread with enhanced balance
      const rightSample = this.applyLoFiEffects(
        kick * 0.7 + snare * 0.7 + hihat * 0.7 + bass * 1.0 + chords * 0.9 + melodyNote * 0.8 + crackle * 0.8,
        parameters,
        time
      );
      
      leftChannel[i] = Math.max(-32768, Math.min(32767, leftSample * 32767));
      rightChannel[i] = Math.max(-32768, Math.min(32767, rightSample * 32767));
    }

    return buffer;
  }

  /**
   * Generate LoFi kick drum pattern (expanded variety)
   */
  private generateLoFiKickPattern(parameters: MusicParameters): number[] {
    // Validate parameters
    if (!parameters) {
      console.warn('No parameters provided, using default kick pattern');
      return [1, 0, 0, 0, 1, 0, 0, 0]; // Default basic 4/4 pattern
    }

    // Ensure we have valid lofiSettings
    const lofiSettings = this.config?.lofiSettings || this.getDefaultLoFiSettings();

    // Extensive LoFi kick patterns with more variations and boom bap style
    const patterns = [
      // Basic patterns
      [1, 0, 0, 0, 1, 0, 0, 0], // Basic 4/4
      [1, 0, 0, 1, 0, 0, 1, 0], // Variation 1
      [1, 0, 1, 0, 0, 0, 1, 0], // Variation 2
      [1, 0, 0, 0, 1, 0, 0, 1], // Variation 3
      
      // Syncopated patterns
      [1, 0, 0, 1, 0, 1, 0, 0], // Syncopated 1
      [1, 0, 1, 0, 1, 0, 0, 0], // Syncopated 2
      [0, 0, 1, 0, 1, 0, 0, 1], // Syncopated 3
      [1, 0, 0, 0, 0, 1, 0, 1], // Syncopated 4
      
      // Complex patterns
      [1, 0, 1, 1, 0, 0, 1, 0], // Complex 1
      [1, 0, 0, 1, 1, 0, 0, 1], // Complex 2
      [1, 1, 0, 0, 1, 0, 1, 0], // Complex 3
      [0, 1, 0, 1, 0, 1, 0, 1], // Off-beat pattern
      
      // Minimal patterns
      [1, 0, 0, 0, 0, 0, 1, 0], // Minimal 1
      [1, 0, 0, 0, 0, 0, 0, 1], // Minimal 2
      [0, 0, 1, 0, 0, 0, 1, 0], // Minimal 3
      [1, 0, 0, 0, 0, 1, 0, 0], // Minimal 4
      
      // NEW: More boom bap style patterns
      [1, 0, 0, 0, 0, 0, 1, 0], // Classic boom bap
      [1, 0, 0, 0, 0, 0, 0, 0], // Sparse boom bap
      [1, 0, 0, 0, 1, 0, 0, 0], // Double kick
      [1, 0, 0, 1, 0, 0, 0, 0], // Early second kick
      [0, 0, 1, 0, 0, 0, 1, 0], // Off-beat emphasis
      [1, 0, 0, 0, 0, 1, 0, 0], // Late second kick
      [1, 0, 0, 0, 0, 0, 1, 0], // Standard boom bap
      [1, 0, 0, 0, 0, 0, 0, 1], // End-of-bar kick
      
      // Advanced patterns
      [1, 0, 0, 1, 0, 0, 1, 0], // Triple kick
      [1, 0, 1, 0, 0, 0, 0, 0], // Double early
      [0, 0, 0, 0, 1, 0, 0, 1], // Double late
      [1, 0, 0, 0, 0, 0, 1, 0], // Classic pattern
    ];
    
    // Safe seed handling with fallback and more variation
    const seed = parameters.seed || 'default_seed_123';
    const patternIndex = parseInt(seed.slice(-2), 16) % patterns.length; // Use more hash bits
    return patterns[patternIndex];
  }

  /**
   * Generate LoFi snare drum pattern
   */
  private generateLoFiSnarePattern(parameters: MusicParameters): number[] {
    // Validate parameters
    if (!parameters) {
      console.warn('No parameters provided, using default snare pattern');
      return [0, 1, 0, 0, 0, 1, 0, 0]; // Default basic 2 and 4 pattern
    }

    // Ensure we have valid lofiSettings
    const lofiSettings = this.config?.lofiSettings || this.getDefaultLoFiSettings();

    // Extensive LoFi snare patterns with more variations
    const patterns = [
      // Basic patterns
      [0, 1, 0, 0, 0, 1, 0, 0], // Basic 2 and 4
      [0, 1, 0, 1, 0, 1, 0, 0], // Variation 1
      [0, 1, 0, 0, 0, 1, 0, 1], // Variation 2
      [0, 0, 1, 0, 0, 1, 0, 0], // Variation 3
      
      // Ghost note patterns
      [0, 1, 0, 0, 0, 1, 0, 0], // Basic with ghost notes
      [0, 1, 0, 0, 0, 1, 0, 0], // Ghost on 3
      [0, 1, 0, 0, 0, 1, 0, 0], // Ghost on 7
      [0, 1, 0, 0, 0, 1, 0, 0], // Multiple ghosts
      
      // Syncopated patterns
      [0, 1, 0, 1, 0, 0, 1, 0], // Syncopated 1
      [0, 0, 1, 0, 0, 1, 0, 1], // Syncopated 2
      [0, 1, 0, 0, 1, 0, 0, 1], // Syncopated 3
      [0, 0, 1, 1, 0, 1, 0, 0], // Syncopated 4
      
      // Complex patterns
      [0, 1, 0, 1, 0, 1, 0, 1], // 8th note pattern
      [0, 1, 0, 0, 0, 1, 0, 0], // Sparse pattern
      [0, 1, 1, 0, 0, 1, 1, 0], // Double hits
      [0, 1, 0, 0, 1, 0, 0, 1], // Off-beat emphasis
      
      // Minimal patterns
      [0, 1, 0, 0, 0, 0, 0, 0], // Minimal 1
      [0, 0, 0, 0, 0, 1, 0, 0], // Minimal 2
      [0, 1, 0, 0, 0, 0, 0, 1], // Minimal 3
      [0, 0, 0, 1, 0, 1, 0, 0], // Minimal 4
    ];
    
    // Safe seed handling with fallback
    const seed = parameters.seed || 'default_seed_123';
    const patternIndex = parseInt(seed.slice(-2, -1), 16) % patterns.length;
    return patterns[patternIndex];
  }

  /**
   * Generate LoFi hihat pattern
   */
  private generateLoFiHihatPattern(parameters: MusicParameters): number[] {
    // Validate parameters
    if (!parameters) {
      console.warn('No parameters provided, using default hihat pattern');
      return [0, 0, 1, 0, 0, 0, 1, 0]; // Default basic off-beat pattern
    }

    // Ensure we have valid lofiSettings
    const lofiSettings = this.config?.lofiSettings || this.getDefaultLoFiSettings();

    // Extensive LoFi hihat patterns with more variations
    const patterns = [
      // Basic patterns
      [0, 0, 1, 0, 0, 0, 1, 0], // Basic off-beat
      [0, 1, 0, 1, 0, 1, 0, 1], // 8th notes
      [0, 0, 1, 0, 0, 1, 0, 0], // Variation 1
      [1, 0, 1, 0, 1, 0, 1, 0], // 16th notes
      
      // Swung patterns
      [0, 0, 1, 0, 0, 0, 1, 0], // Swung 1
      [0, 1, 0, 0, 0, 1, 0, 0], // Swung 2
      [0, 0, 0, 1, 0, 0, 0, 1], // Swung 3
      [0, 1, 0, 0, 1, 0, 0, 0], // Swung 4
      
      // Sparse patterns
      [0, 0, 1, 0, 0, 0, 0, 0], // Sparse 1
      [0, 0, 0, 0, 0, 0, 1, 0], // Sparse 2
      [0, 1, 0, 0, 0, 0, 0, 0], // Sparse 3
      [0, 0, 0, 1, 0, 0, 0, 0], // Sparse 4
      
      // Complex patterns
      [0, 1, 0, 1, 0, 0, 1, 0], // Complex 1
      [0, 0, 1, 0, 1, 0, 0, 1], // Complex 2
      [1, 0, 0, 1, 0, 1, 0, 0], // Complex 3
      [0, 1, 1, 0, 0, 1, 1, 0], // Complex 4
      
      // Minimal patterns
      [0, 0, 0, 0, 0, 0, 1, 0], // Minimal 1
      [0, 1, 0, 0, 0, 0, 0, 0], // Minimal 2
      [0, 0, 0, 0, 0, 1, 0, 0], // Minimal 3
      [0, 0, 1, 0, 0, 0, 0, 0], // Minimal 4
    ];
    
    // Safe seed handling with fallback
    const seed = parameters.seed || 'default_seed_123';
    const patternIndex = parseInt(seed.slice(-3, -2), 16) % patterns.length;
    return patterns[patternIndex];
  }

  /**
   * Generate enhanced LoFi bass line with improved ghost notes and syncopation
   */
  private generateLoFiBass(beatTime: number, chordProgression: string[], parameters: MusicParameters): number {
    const chordIndex = Math.floor(beatTime / 4) % chordProgression.length;
    const chord = chordProgression[chordIndex];
    const rootNote = this.chordToRootNote(chord);
    const frequency = this.noteToFrequency(rootNote, 1); // Sub-bass octave for authentic LoFi
    
    // Enhanced boom bap bass patterns with better ghost notes and syncopation
    const beatInMeasure = beatTime % 4;
    const sixteenthNote = Math.floor(beatTime * 4) % 16; // 16th note resolution
    
    // Enhanced boom bap bass patterns with ghost notes and syncopation
    const patterns = [
      // Pattern 1: Classic boom bap with ghost notes
      [1, 0, 0.3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.2, 0, 0],
      // Pattern 2: Syncopated with off-beat emphasis and ghosts
      [1, 0, 0, 0, 0, 0.4, 1, 0, 0, 0, 1, 0, 0, 0, 0.3, 0],
      // Pattern 3: Complex with slides, variations, and ghost notes
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.2, 1, 0, 0, 0, 0.4],
      // Pattern 4: Sparse but impactful with strategic ghosts
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.3, 0],
      // Pattern 5: Double-time feel with ghost notes
      [1, 0, 0.2, 0, 1, 0, 0, 0, 1, 0, 0.3, 0, 1, 0, 0, 0],
      // Pattern 6: Ghost note heavy with syncopation
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0.2],
      // Pattern 7: Advanced syncopation with off-beat ghosts
      [1, 0, 0, 0.3, 0, 0, 1, 0, 0, 0.2, 1, 0, 0, 0, 0, 0.4],
      // Pattern 8: Minimal with strategic ghost placement
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0.3],
    ];
    
    // Select pattern based on seed for consistency
    const patternIndex = parseInt(parameters.seed.slice(-1), 16) % patterns.length;
    const pattern = patterns[patternIndex];
    
    let bassVolume = 0;
    const noteValue = pattern[sixteenthNote];
    
    if (noteValue === 1) {
      // Main bass hits - strong and punchy
      bassVolume = 0.9;
    } else if (noteValue > 0 && noteValue < 1) {
      // Ghost notes - subtle and varied
      bassVolume = noteValue * 0.4; // Scale ghost note volume
    }
    
    if (bassVolume === 0) return 0;
    
    // Enhanced pitch variation for character and movement
    const pitchVariation = Math.sin(beatTime * 0.15) * 0.03; // More pronounced pitch bend
    const slideVariation = Math.sin(beatTime * 0.8) * 0.01; // Subtle slide effect
    const finalFreq = frequency + pitchVariation + slideVariation;
    
    // Enhanced bass sound with better harmonics and sub-bass
    const fundamental = Math.sin(2 * Math.PI * finalFreq * beatTime);
    const subBass = Math.sin(2 * Math.PI * (finalFreq * 0.5) * beatTime) * 0.7; // Stronger sub-bass
    const harmonic2 = Math.sin(2 * Math.PI * finalFreq * 2 * beatTime) * 0.4; // More prominent 2nd harmonic
    const harmonic3 = Math.sin(2 * Math.PI * finalFreq * 3 * beatTime) * 0.15; // Subtle 3rd harmonic
    
    // Enhanced envelope for more realistic attack/decay
    const envelope = Math.exp(-(beatTime % 0.6) * 2.2); // Slightly longer decay
    
    // Enhanced distortion for warmth and character
    const distortedBass = Math.tanh((fundamental + subBass + harmonic2 + harmonic3) * 1.4) * 0.8;
    
    // Apply subtle compression for punch
    const compressedBass = Math.tanh(distortedBass * 1.1) * 0.9;
    
    return compressedBass * bassVolume * envelope * 0.75;
  }

  /**
   * Generate LoFi chord progression
   */
  private generateLoFiChords(beatTime: number, chordProgression: string[], parameters: MusicParameters): number {
    const chordIndex = Math.floor(beatTime / 4) % chordProgression.length;
    const chord = chordProgression[chordIndex];
    const chordNotes = this.chordToNotes(chord);
    
    let chordSound = 0;
    for (const note of chordNotes) {
      const frequency = this.noteToFrequency(note, 3); // Lower mid octave for LoFi
      chordSound += Math.sin(2 * Math.PI * frequency * beatTime) * 0.1;
    }
    
    return chordSound;
  }

  /**
   * Generate enhanced LoFi melody with pentatonic scales and better spacing
   */
  private generateLoFiMelody(parameters: MusicParameters): number[] {
    // Enhanced LoFi melody patterns with pentatonic scales and better spacing
    const patterns = [
      // Pentatonic major patterns (C-D-E-G-A)
      [0, 2, 4, 7, 4, 2, 0, 2], // C-D-E-G-E-D-C-D (pentatonic major)
      [0, 4, 7, 2, 0, 4, 7, 2], // C-E-G-D-C-E-G-D (arpeggio style)
      [0, 2, 0, 7, 4, 0, 2, 4], // C-D-C-G-E-C-D-E (sparse, spaced)
      [0, 7, 4, 0, 2, 7, 4, 0], // C-G-E-C-D-G-E-C (descending with space)
      
      // Pentatonic minor patterns (C-Eb-F-G-Bb)
      [0, 3, 5, 7, 5, 3, 0, 3], // C-Eb-F-G-F-Eb-C-Eb (pentatonic minor)
      [0, 5, 7, 3, 0, 5, 7, 3], // C-F-G-Eb-C-F-G-Eb (minor arpeggio)
      [0, 3, 0, 7, 5, 0, 3, 5], // C-Eb-C-G-F-C-Eb-F (sparse minor)
      [0, 7, 5, 0, 3, 7, 5, 0], // C-G-F-C-Eb-G-F-C (minor descending)
      
      // Blues pentatonic patterns (C-Eb-F-Gb-G-Bb)
      [0, 3, 5, 6, 7, 5, 3, 0], // C-Eb-F-Gb-G-F-Eb-C (blues scale)
      [0, 5, 6, 7, 3, 0, 5, 6], // C-F-Gb-G-Eb-C-F-Gb (blues arpeggio)
      [0, 3, 0, 6, 7, 0, 3, 5], // C-Eb-C-Gb-G-C-Eb-F (sparse blues)
      
      // Sparse, contemplative patterns (more space)
      [0, 0, 4, 0, 7, 0, 2, 0], // C-C-E-C-G-C-D-C (very sparse)
      [0, 0, 0, 7, 0, 0, 4, 0], // C-C-C-G-C-C-E-C (minimal)
      [0, 2, 0, 0, 7, 0, 0, 4], // C-D-C-C-G-C-C-E (spaced out)
      [0, 0, 0, 0, 0, 7, 0, 0], // C-C-C-C-C-G-C-C (ultra minimal)
      
      // Repetitive, hypnotic patterns
      [0, 2, 4, 2, 0, 2, 4, 2], // C-D-E-D-C-D-E-D (classic repetitive)
      [0, 4, 0, 4, 7, 4, 0, 4], // C-E-C-E-G-E-C-E (arpeggio repetitive)
      [0, 7, 0, 7, 4, 7, 0, 7], // C-G-C-G-E-G-C-G (fifth repetitive)
    ];
    
    // Use more hash bits for better pattern distribution
    const patternIndex = parseInt(parameters.seed.slice(-2), 16) % patterns.length;
    return patterns[patternIndex];
  }

  /**
   * Generate enhanced melody note with better spacing and dynamics
   */
  private generateMelodyNote(beatTime: number, melody: number[], parameters: MusicParameters): number {
    const noteIndex = Math.floor(beatTime * 2) % melody.length; // 8th notes
    const note = melody[noteIndex];
    
    // Skip notes for better spacing (leave space, don't overcrowd)
    if (note === 0 && Math.random() > 0.3) return 0; // More space for zero notes
    
    // Use lower octaves for authentic LoFi sound (octave 2-3)
    const octave = 2 + (noteIndex % 2); // Alternate between octave 2 and 3
    const frequency = this.noteToFrequency(note, octave);
    
    // Enhanced vibrato and envelope for more realistic sound
    const vibrato = Math.sin(beatTime * 3.5) * 0.025; // Slightly more pronounced vibrato
    const envelope = Math.exp(-(beatTime % 0.75) * 2.5); // Longer decay for sustained notes
    
    // Add subtle pitch bend for character
    const pitchBend = Math.sin(beatTime * 0.8) * 0.01;
    
    // Dynamic volume based on note position for musical phrasing
    const dynamicVolume = 0.12 + Math.sin(beatTime * 0.5) * 0.05; // Subtle volume variation
    
    return Math.sin(2 * Math.PI * (frequency + vibrato + pitchBend) * beatTime) * dynamicVolume * envelope;
  }

  /**
   * Generate enhanced vinyl crackle effect with pops and background noise
   */
  private generateVinylCrackle(time: number, parameters: MusicParameters): number {
    const lofiSettings = this.config.lofiSettings || this.getDefaultLoFiSettings();
    
    if (!lofiSettings.vinylCrackle) return 0;
    
    let crackle = 0;
    
    // More frequent and authentic crackle patterns (every 0.3-1.5 seconds)
    const crackleInterval = 0.3 + Math.random() * 1.2; // 0.3-1.5 seconds
    const crackleTime = time % crackleInterval;
    
    if (crackleTime < 0.08) { // Slightly longer crackle burst
      // Create more realistic crackle with multiple frequencies
      const noise = (Math.random() - 0.5) * 2;
      const highFreq = Math.sin(2 * Math.PI * 8000 * time) * 0.12; // Increased
      const midFreq = Math.sin(2 * Math.PI * 2000 * time) * 0.06; // Increased
      const lowFreq = Math.sin(2 * Math.PI * 500 * time) * 0.025; // Increased
      
      crackle += (noise + highFreq + midFreq + lowFreq) * 0.025; // Increased volume
    }
    
    // Enhanced pop sounds (more frequent and varied)
    if (lofiSettings.vinylPops) {
      const popInterval = 3 + Math.random() * 6; // 3-9 seconds
      const popTime = time % popInterval;
      if (popTime < 0.02) {
        const popNoise = (Math.random() - 0.5) * 6;
        const popFreq = Math.sin(2 * Math.PI * 1000 * time) * 0.1;
        crackle += (popNoise + popFreq) * 0.03; // Increased pop volume
      }
    }
    
    // Enhanced background noise (constant low-level hiss)
    if (lofiSettings.backgroundNoise) {
      const backgroundCrackle = (Math.random() - 0.5) * 0.008; // Increased background noise
      const hissFreq = Math.sin(2 * Math.PI * 3000 * time) * 0.005;
      crackle += backgroundCrackle + hissFreq;
    }
    
    // Add subtle rhythmic crackle for character
    const beatCrackle = Math.sin(time * 1.5) * 0.002; // Very subtle rhythmic element
    crackle += beatCrackle;
    
    return crackle;
  }

  /**
   * Apply enhanced LoFi effects with improved filtering and resonance
   */
  private applyLoFiEffects(sample: number, parameters: MusicParameters, time: number): number {
    const lofiSettings = this.config.lofiSettings || this.getDefaultLoFiSettings();
    
    // Enhanced lowpass filter with subtle automation and resonance
    const baseCutoff = 1500 + Math.sin(time * 0.3) * 400; // 1.1-1.9kHz range with movement
    const resonance = 1.2 + Math.sin(time * 0.2) * 0.3; // Subtle resonance boost at cutoff
    
    // Apply frequency-dependent filtering with resonance
    let filteredSample = sample;
    const filterAmount = Math.min(1, baseCutoff / 3000);
    filteredSample *= filterAmount;
    
    // Add resonance boost at cutoff frequency for warmth
    const resonanceBoost = Math.sin(2 * Math.PI * baseCutoff * time) * 0.1 * resonance;
    filteredSample += resonanceBoost * Math.abs(sample);
    
    // Enhanced bitcrushing for authentic digital LoFi sound
    const bitDepth = 6; // 6-bit for vintage feel
    const sampleRate = 32000; // Slight sample rate reduction
    filteredSample = Math.round(filteredSample * bitDepth) / bitDepth;
    
    // Enhanced reverb with better atmospheric character
    const reverbAmount = parameters.reverb * 0.7; // Increased reverb for more atmosphere
    const preDelay = 0.04; // 40ms pre-delay for better depth
    const decayTime = 3.0; // 3 second decay for longer tails
    const roomSize = 0.8; // Large, warm room
    
    // Apply reverb with room size and decay characteristics
    const reverbEffect = reverbAmount * (1 + Math.sin(time * 0.08) * 0.25); // Subtle modulation
    filteredSample *= (1 + reverbEffect * roomSize);
    
    // Enhanced distortion for warmth and character
    filteredSample = Math.tanh(filteredSample * (1 + parameters.distortion * 1.5));
    
    // Improved saturation and tube warmth
    filteredSample = Math.tanh(filteredSample * 1.8) * 0.7;
    
    // Enhanced compression with musical character
    if (Math.abs(filteredSample) > 0.25) {
      filteredSample = Math.sign(filteredSample) * (0.25 + (Math.abs(filteredSample) - 0.25) * 0.2);
    }
    
    // Enhanced tape saturation with wow and flutter
    const tapeSaturation = Math.tanh(filteredSample * 1.4) * 0.8;
    filteredSample = filteredSample * 0.6 + tapeSaturation * 0.4;
    
    // Enhanced wow and flutter (pitch modulation)
    const wow = Math.sin(time * 0.4) * 0.015; // Slower, more pronounced wow
    const flutter = Math.sin(time * 8) * 0.008; // Faster flutter
    const pitchMod = 1 + wow + flutter;
    filteredSample *= pitchMod;
    
    // Add subtle high-frequency roll-off for darker reverb tails
    const highFreqRolloff = Math.exp(-time * 0.1) * 0.3;
    filteredSample *= (1 - highFreqRolloff);
    
    return filteredSample;
  }

  /**
   * Generate LoFi chord progression from blockchain data (expanded variety)
   */
  private generateLoFiChordProgression(blockchainData: BlockchainData[]): string[] {
    // Extensive collection of authentic LoFi chord progressions with more variety
    const progressions = [
      // Classic LoFi progressions
      ['Cmaj7', 'Am7', 'Fmaj7', 'G7'], // I-vi-IV-V (most common)
      ['Am7', 'Dm7', 'G7', 'Cmaj7'],   // vi-ii-V-I
      ['Fmaj7', 'G7', 'Em7', 'Am7'],   // IV-V-iii-vi
      ['Cmaj7', 'Em7', 'Am7', 'Dm7'],  // I-iii-vi-ii
      
      // Jazz-influenced progressions with extended chords
      ['Cmaj9', 'Am9', 'Dm9', 'G9'],   // I-vi-ii-V with 9ths
      ['Am11', 'Fmaj9', 'Cmaj9', 'G9'], // vi-IV-I-V with extensions
      ['Fmaj11', 'Em9', 'Dm9', 'G9'],   // IV-iii-ii-V with extensions
      ['Cmaj9', 'Fmaj9', 'Am9', 'G9'], // I-IV-vi-V with 9ths
      
      // Extended progressions
      ['Cmaj7', 'Am7', 'Fmaj7', 'G7', 'Em7', 'Am7', 'Dm7', 'G7'], // 8-bar progression
      ['Am7', 'Dm7', 'G7', 'Cmaj7', 'Fmaj7', 'Em7', 'Am7', 'Dm7'], // 8-bar variation
      
      // Minor key progressions
      ['Am7', 'Dm7', 'G7', 'Cmaj7'],   // Am key
      ['Dm7', 'G7', 'Cmaj7', 'Fmaj7'], // Dm key
      ['Em7', 'Am7', 'Dm7', 'G7'],     // Em key
      
      // Modal progressions
      ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7'], // Dorian feel
      ['Fmaj7', 'G7', 'Am7', 'Bb7'],    // Mixolydian feel
      ['Cmaj7', 'Fmaj7', 'G7', 'Am7'],  // Lydian feel
      
      // Complex jazz progressions with extended harmony
      ['Cmaj9', 'Am9', 'Dm9', 'G9', 'Em9', 'Am9', 'Dm9', 'G9'], // ii-V chains with 9ths
      ['Am11', 'D9', 'Dm9', 'G9', 'Cmaj9', 'A9', 'Dm9', 'G9'],   // Secondary dominants with extensions
      ['Cmaj11', 'Am9', 'Fmaj9', 'G9'], // I-vi-IV-V with 11th
      ['Am9', 'Dm9', 'G9', 'Cmaj9'],     // vi-ii-V-I with 9ths
      
      // NEW: More diverse progressions for variety
      ['Fmaj7', 'Am7', 'Dm7', 'G7'],   // IV-vi-ii-V
      ['Cmaj7', 'Am7', 'Fmaj7', 'Am7'], // I-vi-IV-vi
      ['Am7', 'Fmaj7', 'Dm7', 'G7'],   // vi-IV-ii-V
      ['Dm7', 'G7', 'Cmaj7', 'Am7'],   // ii-V-I-vi
      ['Em7', 'Am7', 'Dm7', 'G7'],     // iii-vi-ii-V
      ['G7', 'Cmaj7', 'Am7', 'Fmaj7'], // V-I-vi-IV
      ['Bb7', 'Am7', 'Dm7', 'G7'],     // bVII-vi-ii-V
      ['Cmaj7', 'Bb7', 'Am7', 'G7'],   // I-bVII-vi-V
      ['Fmaj7', 'Bb7', 'Am7', 'Dm7'],  // IV-bVII-vi-ii
      ['Am7', 'Bb7', 'Fmaj7', 'G7'],   // vi-bVII-IV-V
      
      // Extended 8-bar progressions
      ['Cmaj7', 'Am7', 'Fmaj7', 'G7', 'Am7', 'Dm7', 'G7', 'Cmaj7'], // Extended I-vi-IV-V
      ['Am7', 'Dm7', 'G7', 'Cmaj7', 'Fmaj7', 'Em7', 'Am7', 'Dm7'], // Extended vi-ii-V-I
      ['Fmaj7', 'G7', 'Em7', 'Am7', 'Dm7', 'G7', 'Cmaj7', 'Am7'], // Extended IV-V-iii-vi
      
      // Chromatic progressions
      ['Cmaj7', 'C#m7', 'Dm7', 'D#m7'], // Chromatic ascending
      ['Am7', 'Ab7', 'G7', 'Gb7'],       // Chromatic descending
      
      // Unusual but musical progressions
      ['Cmaj7', 'F#m7', 'Bm7', 'Em7'],  // Tritone substitution
      ['Am7', 'D7', 'Gm7', 'C7'],       // Circle of fifths
      ['Fmaj7', 'Bbmaj7', 'Ebmaj7', 'Abmaj7'], // Major key circle
    ];
    
    // Add more variation to progression selection
    const timeComponent = Math.floor(Date.now() / 20000); // Changes every 20 seconds (faster)
    const hashComponent = parseInt(blockchainData[0].transactionHash.slice(-2), 16); // Use more hash bits
    const progressionIndex = (hashComponent + timeComponent) % progressions.length;
    return progressions[progressionIndex];
  }

  /**
   * Generate LoFi melody pattern
   */
  private generateLoFiMelodyPattern(blockchainData: BlockchainData[]): number[] {
    // Simple, repetitive patterns typical of LoFi
    const patterns = [
      [0, 2, 4, 2, 0, 2, 4, 2], // C-D-E-D-C-D-E-D
      [0, 4, 7, 4, 0, 4, 7, 4], // C-E-G-E-C-E-G-E
      [0, 2, 0, 4, 2, 0, 2, 4], // C-D-C-E-D-C-D-E
      [0, 7, 4, 2, 0, 7, 4, 2], // C-G-E-D-C-G-E-D
    ];
    
    // Add time-based variation to melody pattern selection
    const timeComponent = Math.floor(Date.now() / 20000); // Changes every 20 seconds
    const hashComponent = parseInt(blockchainData[0].transactionHash.slice(-2), 16);
    const patternIndex = (hashComponent + timeComponent) % patterns.length;
    return patterns[patternIndex];
  }

  /**
   * Generate LoFi note durations
   */
  private generateLoFiNoteDurations(blockchainData: BlockchainData[]): number[] {
    // LoFi uses longer, more sustained notes
    return [0.5, 0.5, 1, 0.5, 0.5, 0.5, 1, 0.5]; // Mix of quarter and half notes
  }

  /**
   * Select jazz-inspired key (expanded variety)
   */
  private selectJazzKey(address: string): string {
    // Expanded key selection including more jazz-friendly keys
    const jazzKeys = [
      'C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', // Flat keys (jazz favorites)
      'B', 'E', 'A', 'D', 'G',                // Sharp keys
      'C#', 'F#', 'Bb', 'Eb', 'Ab',           // Additional enharmonic equivalents
      'G#', 'C#', 'F#', 'B', 'E'              // More sharp keys for variety
    ];
    
    // Use more hash bits for better distribution
    const keyIndex = parseInt(address.slice(-2), 16) % jazzKeys.length;
    return jazzKeys[keyIndex];
  }

  /**
   * Select jazz-inspired scale (expanded variety)
   */
  private selectJazzScale(value: string): string {
    // Expanded scale selection for more variety
    const jazzScales = [
      'major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', // Basic modes
      'locrian', 'harmonic-minor', 'melodic-minor', 'pentatonic-major', 'pentatonic-minor', // Extended scales
      'blues', 'diminished', 'whole-tone', 'chromatic' // Jazz-specific scales
    ];
    
    // Use more hash bits for better distribution
    const scaleIndex = parseInt(value.slice(-2), 16) % jazzScales.length;
    return jazzScales[scaleIndex];
  }

  /**
   * Calculate transaction variation for swing
   */
  private calculateTransactionVariation(blockchainData: BlockchainData[]): number {
    if (blockchainData.length < 2) return 0;
    
    const gasPrices = blockchainData.map(data => parseInt(data.gasPrice, 16));
    const avg = gasPrices.reduce((sum, price) => sum + price, 0) / gasPrices.length;
    const variance = gasPrices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / gasPrices.length;
    
    return Math.min(variance / (avg * avg), 1); // Normalized variance
  }

  /**
   * Generate kick drum sound with boom bap characteristics and humanization
   */
  private generateKickDrum(beatTime: number, pattern: number[], parameters: MusicParameters): number {
    // Defensive programming: handle undefined or empty patterns
    if (!pattern || !Array.isArray(pattern) || pattern.length === 0) {
      console.warn('Invalid kick pattern provided, using default pattern');
      pattern = [1, 0, 0, 0, 1, 0, 0, 0]; // Default basic 4/4 pattern
    }
    
    const lofiSettings = this.config.lofiSettings || this.getDefaultLoFiSettings();
    
    // Apply humanization with subtle timing variations
    let humanizedBeatTime = beatTime;
    if (lofiSettings.humanization) {
      const timingVariation = (Math.sin(beatTime * 0.7) * 0.015) + (Math.sin(beatTime * 1.3) * 0.008); // ±10-20ms variation
      humanizedBeatTime = beatTime + timingVariation;
    }
    
    const beatIndex = Math.floor(humanizedBeatTime * 2) % pattern.length;
    if (pattern[beatIndex] === 0) return 0;
    
    // More realistic kick drum with boom bap characteristics
    const time = humanizedBeatTime % 0.5; // Reset every half beat
    const envelope = Math.exp(-time * 12); // Faster decay for punch
    
    // Low frequency boom (sub-bass)
    const lowFreq = 50;
    const lowSound = Math.sin(2 * Math.PI * lowFreq * time) * envelope;
    
    // Mid frequency punch (more prominent)
    const midFreq = 100;
    const midSound = Math.sin(2 * Math.PI * midFreq * time) * envelope * 0.6;
    
    // High frequency click/attack
    const highFreq = 180;
    const highSound = Math.sin(2 * Math.PI * highFreq * time) * envelope * 0.2;
    
    // Add some saturation for warmth
    const combined = lowSound + midSound + highSound;
    const saturated = Math.tanh(combined * 1.3) * 0.8;
    
    return saturated * 0.8; // Stronger kick presence
  }

  /**
   * Generate snare drum sound with boom bap characteristics and humanization
   */
  private generateSnareDrum(beatTime: number, pattern: number[], parameters: MusicParameters): number {
    // Defensive programming: handle undefined or empty patterns
    if (!pattern || !Array.isArray(pattern) || pattern.length === 0) {
      console.warn('Invalid snare pattern provided, using default pattern');
      pattern = [0, 0, 1, 0, 0, 0, 1, 0]; // Default snare pattern
    }
    
    const lofiSettings = this.config.lofiSettings || this.getDefaultLoFiSettings();
    
    // Apply humanization with subtle timing variations
    let humanizedBeatTime = beatTime;
    if (lofiSettings.humanization) {
      const timingVariation = (Math.sin(beatTime * 0.9) * 0.012) + (Math.sin(beatTime * 1.7) * 0.006); // ±8-15ms variation
      humanizedBeatTime = beatTime + timingVariation;
    }
    
    const beatIndex = Math.floor(humanizedBeatTime * 2) % pattern.length;
    if (pattern[beatIndex] === 0) return 0;
    
    const time = humanizedBeatTime % 0.5; // Reset every half beat
    const envelope = Math.exp(-time * 15); // Quick decay for crisp snare
    
    // Snare body (low frequency - more prominent)
    const bodyFreq = 200;
    const bodySound = Math.sin(2 * Math.PI * bodyFreq * time) * envelope;
    
    // Snare wires (high frequency noise - more crack)
    const noise = (Math.random() - 0.5) * 2;
    const wireSound = noise * envelope * 0.6; // More prominent
    
    // Mid frequency crack (more aggressive)
    const crackFreq = 500;
    const crackSound = Math.sin(2 * Math.PI * crackFreq * time) * envelope * 0.4;
    
    // Add some harmonic content for more character
    const harmonic = Math.sin(2 * Math.PI * bodyFreq * 2 * time) * envelope * 0.2;
    
    // Combine and add slight compression
    const combined = bodySound + wireSound + crackSound + harmonic;
    const compressed = Math.tanh(combined * 1.2) * 0.8;
    
    return compressed * 0.7; // Stronger snare presence
  }

  /**
   * Generate hihat sound with humanization (reduced noise)
   */
  private generateHihat(beatTime: number, pattern: number[], parameters: MusicParameters): number {
    // Defensive programming: handle undefined or empty patterns
    if (!pattern || !Array.isArray(pattern) || pattern.length === 0) {
      // Only warn in development mode to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.warn('Invalid hihat pattern provided, using default pattern');
      }
      pattern = [0, 0, 1, 0, 0, 0, 1, 0]; // Default hihat pattern
    }
    
    const lofiSettings = this.config.lofiSettings || this.getDefaultLoFiSettings();
    
    // Apply humanization with subtle timing variations
    let humanizedBeatTime = beatTime;
    if (lofiSettings.humanization) {
      const timingVariation = (Math.sin(beatTime * 1.1) * 0.008) + (Math.sin(beatTime * 2.3) * 0.004); // ±5-10ms variation
      humanizedBeatTime = beatTime + timingVariation;
    }
    
    const beatIndex = Math.floor(humanizedBeatTime * 2) % pattern.length;
    if (pattern[beatIndex] === 0) return 0;
    
    const time = humanizedBeatTime % 0.25; // Reset every quarter beat
    const envelope = Math.exp(-time * 25); // Very quick decay
    
    // High frequency sizzle (reduced)
    const sizzleFreq = 8000;
    const sizzleSound = Math.sin(2 * Math.PI * sizzleFreq * time) * envelope * 0.7; // Reduced
    
    // Mid frequency body (more prominent)
    const bodyFreq = 2000;
    const bodySound = Math.sin(2 * Math.PI * bodyFreq * time) * envelope * 0.5; // Increased
    
    // Reduced noise component
    const noise = (Math.random() - 0.5) * 2;
    const noiseSound = noise * envelope * 0.1; // Much reduced noise
    
    return (sizzleSound + bodySound + noiseSound) * 0.15; // Overall reduced volume
  }

  /**
   * Convert chord to root note
   */
  private chordToRootNote(chord: string): number {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    const root = chord.replace(/[^A-G#b]/g, '');
    return noteMap[root] || 0;
  }

  /**
   * Convert chord to notes with extended harmony support
   */
  private chordToNotes(chord: string): number[] {
    const root = this.chordToRootNote(chord);
    const lofiSettings = this.config.lofiSettings || this.getDefaultLoFiSettings();
    
    // Base chord structure
    let notes: number[] = [];
    
    if (chord.includes('maj7')) {
      notes = [root, root + 4, root + 7, root + 11]; // Major 7th
      // Add 9th and 11th for extended harmony
      if (lofiSettings.extendedChords) {
        notes.push(root + 14, root + 17); // 9th and 11th
      }
    } else if (chord.includes('m7')) {
      notes = [root, root + 3, root + 7, root + 10]; // Minor 7th
      // Add 9th and 11th for extended harmony
      if (lofiSettings.extendedChords) {
        notes.push(root + 14, root + 17); // 9th and 11th
      }
    } else if (chord.includes('7')) {
      notes = [root, root + 4, root + 7, root + 10]; // Dominant 7th
      // Add 9th and 11th for extended harmony
      if (lofiSettings.extendedChords) {
        notes.push(root + 14, root + 17); // 9th and 11th
      }
    } else if (chord.includes('maj9')) {
      notes = [root, root + 4, root + 7, root + 11, root + 14]; // Major 9th
    } else if (chord.includes('m9')) {
      notes = [root, root + 3, root + 7, root + 10, root + 14]; // Minor 9th
    } else if (chord.includes('9')) {
      notes = [root, root + 4, root + 7, root + 10, root + 14]; // Dominant 9th
    } else if (chord.includes('maj11')) {
      notes = [root, root + 4, root + 7, root + 11, root + 14, root + 17]; // Major 11th
    } else if (chord.includes('m11')) {
      notes = [root, root + 3, root + 7, root + 10, root + 14, root + 17]; // Minor 11th
    } else if (chord.includes('11')) {
      notes = [root, root + 4, root + 7, root + 10, root + 14, root + 17]; // Dominant 11th
    } else {
      notes = [root, root + 4, root + 7]; // Triad
    }
    
    // Apply voice leading - keep notes within reasonable octave range
    return notes.map(note => note % 12); // Normalize to single octave for voice leading
  }

  /**
   * Convert note number to frequency
   */
  private noteToFrequency(note: number, octave: number): number {
    const A4 = 440; // A4 = 440 Hz
    const semitones = note + (octave - 4) * 12;
    return A4 * Math.pow(2, semitones / 12);
  }

  /**
   * Create LoFi-specific seed with time-based variation for evolution
   */
  private createLoFiSeed(blockchainData: BlockchainData[]): string {
    const timeComponent = Math.floor(Date.now() / 10000); // Changes every 10 seconds
    const randomComponent = Math.random().toString(36).substr(2, 4);
    return `lofi_${blockchainData[0].dataHash.slice(0, 8)}_${timeComponent}_${randomComponent}`;
  }

  /**
   * Calculate duration for LoFi track
   */
  private calculateDuration(parameters: MusicParameters): number {
    const totalBars = parameters.introLength + parameters.verseLength + 
                     parameters.chorusLength + parameters.outroLength;
    const secondsPerBar = (60 / parameters.tempo) * parameters.timeSignature[0];
    const duration = totalBars * secondsPerBar;
    // Limit duration to prevent memory issues (max 5 minutes)
    return Math.min(duration, 300);
  }

  /**
   * Create LoFi-specific NFT metadata
   */
  private createLoFiNFTMetadata(blockchainData: BlockchainData[], parameters: MusicParameters) {
    const primaryData = blockchainData[0];
    const timestamp = new Date(primaryData.timestamp * 1000);
    
    return {
      name: `LoFi ApeChain Vibes #${primaryData.blockNumber}`,
      description: `Chill LoFi Hip Hop track generated from ApeChain blockchain data. Perfect for studying, relaxing, or coding. Generated from block ${primaryData.blockNumber} with ${blockchainData.length} transactions. BPM: ${parameters.tempo}, Key: ${parameters.key} ${parameters.scale}.`,
      image: this.generateLoFiWaveformImage(parameters),
      audio: '',
      attributes: [
        { trait_type: 'Genre', value: 'LoFi Hip Hop' },
        { trait_type: 'Block Number', value: primaryData.blockNumber },
        { trait_type: 'Transaction Count', value: blockchainData.length },
        { trait_type: 'BPM', value: Math.round(parameters.tempo) },
        { trait_type: 'Key', value: parameters.key },
        { trait_type: 'Scale', value: parameters.scale },
        { trait_type: 'Time Signature', value: `${parameters.timeSignature[0]}/${parameters.timeSignature[1]}` },
        { trait_type: 'Duration', value: `${this.calculateDuration(parameters).toFixed(1)}s` },
        { trait_type: 'Swing', value: `${(parameters.swing * 100).toFixed(1)}%` },
        { trait_type: 'Vinyl Crackle', value: this.config.lofiSettings?.vinylCrackle ? 'Yes' : 'No' },
        { trait_type: 'Jazz Chords', value: this.config.lofiSettings?.jazzChords ? 'Yes' : 'No' },
        { trait_type: 'Network Activity', value: blockchainData.length > 10 ? 'High' : blockchainData.length > 5 ? 'Medium' : 'Low' },
        { trait_type: 'Generation Date', value: timestamp.toISOString() },
        { trait_type: 'Data Hash', value: primaryData.dataHash.slice(0, 16) }
      ],
      external_url: `https://apebeats.com/lofi/${primaryData.dataHash}`,
      background_color: this.generateLoFiBackgroundColor(parameters),
      animation_url: this.generateLoFiAnimationUrl(parameters)
    };
  }

  /**
   * Create provenance data
   */
  private createProvenanceData(blockchainData: BlockchainData[], parameters: MusicParameters) {
    return {
      originalDataHash: blockchainData[0].dataHash,
      generationAlgorithm: 'ApeBeats LoFi Hip Hop Engine v1.0',
      version: '1.0.0',
      creator: 'ApeBeats LoFi Generator'
    };
  }

  /**
   * Generate unique ID
   */
  private async generateUniqueId(blockchainData: BlockchainData[], parameters: MusicParameters): Promise<string> {
    const dataString = `lofi_${blockchainData[0].dataHash}-${parameters.seed}-${Date.now()}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  }

  /**
   * Generate LoFi waveform image
   */
  private generateLoFiWaveformImage(parameters: MusicParameters): string {
    // Return a simple placeholder for now to avoid canvas issues
    // In a real implementation, this would generate a proper waveform
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmQxYjY5Ii8+PC9zdmc+';
  }

  /**
   * Generate LoFi background color
   */
  private generateLoFiBackgroundColor(parameters: MusicParameters): string {
    const colors = ['#2D1B69', '#11998E', '#38EF7D', '#FF6B6B', '#4ECDC4'];
    return colors[parameters.melodyPattern[0] % colors.length];
  }

  /**
   * Generate LoFi animation URL
   */
  private generateLoFiAnimationUrl(parameters: MusicParameters): string {
    return `https://apebeats.com/lofi-animation/${parameters.seed}`;
  }

  /**
   * Get default LoFi settings (optimized for boom bap style)
   */
  private getDefaultLoFiSettings() {
    return {
      bpmRange: [70, 90] as [number, number], // Expanded range for more variety
      swingAmount: 0.65, // Enhanced swing for more authentic lofi feel
      vinylCrackle: true, // Keep but reduced in volume
      jazzChords: true,
      reverbAmount: 0.6, // Increased reverb for better atmosphere
      lowpassFilter: 0.35, // Less aggressive filtering to preserve punch
      humanization: true, // Enable timing variations
      extendedChords: true, // Enable 9ths and 11ths
      vinylPops: true, // Enable vinyl pops
      backgroundNoise: true // Enable subtle background hiss
    } as const;
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
