/**
 * Video Visualization Engine
 * 
 * Creates video visualizations based on generated music and blockchain data
 * Generates waveforms, data visualizations, and LoFi-style animations
 */

import { 
  GeneratedMusic, 
  BlockchainData, 
  VideoVisualization,
  MusicParameters 
} from './types';

export class VideoVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId?: number;
  private isAnimating: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
  }

  /**
   * Generate video visualization for music and blockchain data
   */
  async generateVisualization(
    music: GeneratedMusic, 
    blockchainData: BlockchainData[]
  ): Promise<VideoVisualization> {
    try {
      const visualization: VideoVisualization = {
        id: `viz_${music.id}`,
        musicId: music.id,
        videoUrl: '',
        thumbnailUrl: '',
        duration: music.duration,
        elements: {
          waveform: true,
          blockchainData: true,
          particleSystem: true,
          colorPalette: this.generateLoFiColorPalette(music.parameters),
          animationStyle: 'minimal'
        },
        dataVisualization: {
          transactionFlow: true,
          blockTimeline: true,
          addressActivity: true,
          gasPriceGraph: true,
          networkStats: true
        },
        metadata: {
          resolution: '1920x1080',
          frameRate: 30,
          codec: 'webm',
          fileSize: 0
        }
      };

      // Generate thumbnail
      visualization.thumbnailUrl = await this.generateThumbnail(music, blockchainData);
      
      // Generate video (in a real implementation, this would create an actual video file)
      visualization.videoUrl = await this.generateVideo(music, blockchainData, visualization);
      
      return visualization;
    } catch (error) {
      console.error('Error generating visualization:', error);
      throw new Error(`Failed to generate visualization: ${error}`);
    }
  }

  /**
   * Start real-time visualization
   */
  startRealTimeVisualization(
    music: GeneratedMusic, 
    blockchainData: BlockchainData[]
  ): void {
    if (this.isAnimating) {
      this.stopRealTimeVisualization();
    }

    this.isAnimating = true;
    this.animate(music, blockchainData);
  }

  /**
   * Stop real-time visualization
   */
  stopRealTimeVisualization(): void {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  /**
   * Generate thumbnail image
   */
  private async generateThumbnail(
    music: GeneratedMusic, 
    blockchainData: BlockchainData[]
  ): Promise<string> {
    const width = 400;
    const height = 300;
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Clear canvas
    this.ctx.fillStyle = this.generateLoFiColorPalette(music.parameters)[0];
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw LoFi-style background
    this.drawLoFiBackground(width, height, music.parameters);
    
    // Draw waveform
    this.drawWaveform(width, height, music.parameters);
    
    // Draw blockchain data visualization
    this.drawBlockchainDataVisualization(width, height, blockchainData);
    
    // Draw LoFi elements
    this.drawLoFiElements(width, height, music.parameters);
    
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Generate video (simplified - in real implementation would use WebCodecs or similar)
   */
  private async generateVideo(
    music: GeneratedMusic, 
    blockchainData: BlockchainData[],
    visualization: VideoVisualization
  ): Promise<string> {
    // In a real implementation, this would:
    // 1. Create a MediaRecorder
    // 2. Record the animation frames
    // 3. Save as video file
    // 4. Upload to IPFS/Arweave
    // 5. Return the URL
    
    // For now, we'll return a placeholder URL
    return `https://apebeats.com/videos/${visualization.id}.webm`;
  }

  /**
   * Main animation loop
   */
  private animate(music: GeneratedMusic, blockchainData: BlockchainData[]): void {
    if (!this.isAnimating) return;

    const animate = () => {
      if (!this.isAnimating) return;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw background
      this.drawLoFiBackground(this.canvas.width, this.canvas.height, music.parameters);
      
      // Draw animated elements
      this.drawAnimatedWaveform(this.canvas.width, this.canvas.height, music.parameters);
      this.drawAnimatedParticles(this.canvas.width, this.canvas.height, music.parameters);
      this.drawAnimatedBlockchainData(this.canvas.width, this.canvas.height, blockchainData);
      
      // Continue animation
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Draw LoFi-style background
   */
  private drawLoFiBackground(width: number, height: number, parameters: MusicParameters): void {
    const colors = this.generateLoFiColorPalette(parameters);
    
    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
    
    // Add subtle noise texture
    this.drawNoiseTexture(width, height);
  }

  /**
   * Draw waveform visualization
   */
  private drawWaveform(width: number, height: number, parameters: MusicParameters): void {
    const centerY = height / 2;
    const amplitude = height * 0.3;
    
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
      const frequency = (x / width) * 10;
      const y = centerY + Math.sin(frequency + Date.now() * 0.001) * amplitude * parameters.volume;
      
      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
  }

  /**
   * Draw animated waveform
   */
  private drawAnimatedWaveform(width: number, height: number, parameters: MusicParameters): void {
    const centerY = height / 2;
    const amplitude = height * 0.2;
    const time = Date.now() * 0.001;
    
    // Draw multiple waveform layers for depth
    for (let layer = 0; layer < 3; layer++) {
      const alpha = 1 - (layer * 0.3);
      const layerAmplitude = amplitude * (1 - layer * 0.2);
      
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.lineWidth = 2 - layer;
      this.ctx.beginPath();
      
      for (let x = 0; x < width; x++) {
        const frequency = (x / width) * 8 + layer;
        const y = centerY + Math.sin(frequency + time) * layerAmplitude * parameters.volume;
        
        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.stroke();
    }
  }

  /**
   * Draw blockchain data visualization
   */
  private drawBlockchainDataVisualization(
    width: number, 
    height: number, 
    blockchainData: BlockchainData[]
  ): void {
    const dataHeight = height * 0.3;
    const startY = height - dataHeight;
    
    // Draw transaction flow
    this.drawTransactionFlow(width, dataHeight, startY, blockchainData);
    
    // Draw gas price graph
    this.drawGasPriceGraph(width, dataHeight, startY, blockchainData);
  }

  /**
   * Draw animated blockchain data
   */
  private drawAnimatedBlockchainData(
    width: number, 
    height: number, 
    blockchainData: BlockchainData[]
  ): void {
    const time = Date.now() * 0.001;
    
    // Animated transaction flow
    this.drawAnimatedTransactionFlow(width, height, blockchainData, time);
    
    // Animated gas price graph
    this.drawAnimatedGasPriceGraph(width, height, blockchainData, time);
  }

  /**
   * Draw transaction flow
   */
  private drawTransactionFlow(
    width: number, 
    height: number, 
    startY: number, 
    blockchainData: BlockchainData[]
  ): void {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.fillRect(0, startY, width, height);
    
    // Draw transaction bars
    const barWidth = width / blockchainData.length;
    
    for (let i = 0; i < blockchainData.length; i++) {
      const data = blockchainData[i];
      const barHeight = (parseInt(data.gasUsed, 16) / 1000000) * height;
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (barHeight / height) * 0.7})`;
      this.ctx.fillRect(i * barWidth, startY + height - barHeight, barWidth - 1, barHeight);
    }
  }

  /**
   * Draw animated transaction flow
   */
  private drawAnimatedTransactionFlow(
    width: number, 
    height: number, 
    blockchainData: BlockchainData[],
    time: number
  ): void {
    const dataHeight = height * 0.2;
    const startY = height - dataHeight;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.fillRect(0, startY, width, dataHeight);
    
    const barWidth = width / blockchainData.length;
    
    for (let i = 0; i < blockchainData.length; i++) {
      const data = blockchainData[i];
      const baseHeight = (parseInt(data.gasUsed, 16) / 1000000) * dataHeight;
      const animatedHeight = baseHeight + Math.sin(time + i) * 10;
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + (animatedHeight / dataHeight) * 0.8})`;
      this.ctx.fillRect(i * barWidth, startY + dataHeight - animatedHeight, barWidth - 1, animatedHeight);
    }
  }

  /**
   * Draw gas price graph
   */
  private drawGasPriceGraph(
    width: number, 
    height: number, 
    startY: number, 
    blockchainData: BlockchainData[]
  ): void {
    const graphHeight = height * 0.4;
    const graphStartY = startY - graphHeight;
    
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    const maxGasPrice = Math.max(...blockchainData.map(d => parseInt(d.gasPrice, 16)));
    
    for (let i = 0; i < blockchainData.length; i++) {
      const data = blockchainData[i];
      const x = (i / (blockchainData.length - 1)) * width;
      const y = graphStartY + graphHeight - (parseInt(data.gasPrice, 16) / maxGasPrice) * graphHeight;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
  }

  /**
   * Draw animated gas price graph
   */
  private drawAnimatedGasPriceGraph(
    width: number, 
    height: number, 
    blockchainData: BlockchainData[],
    time: number
  ): void {
    const graphHeight = height * 0.3;
    const graphStartY = height - graphHeight;
    
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    const maxGasPrice = Math.max(...blockchainData.map(d => parseInt(d.gasPrice, 16)));
    
    for (let i = 0; i < blockchainData.length; i++) {
      const data = blockchainData[i];
      const x = (i / (blockchainData.length - 1)) * width;
      const baseY = graphStartY + graphHeight - (parseInt(data.gasPrice, 16) / maxGasPrice) * graphHeight;
      const y = baseY + Math.sin(time * 2 + i * 0.5) * 5;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
  }

  /**
   * Draw LoFi elements
   */
  private drawLoFiElements(width: number, height: number, parameters: MusicParameters): void {
    // Draw vinyl record
    this.drawVinylRecord(width * 0.1, height * 0.1, Math.min(width, height) * 0.15, parameters);
    
    // Draw floating particles
    this.drawFloatingParticles(width, height, parameters);
  }

  /**
   * Draw vinyl record
   */
  private drawVinylRecord(x: number, y: number, radius: number, parameters: MusicParameters): void {
    // Outer ring
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // Inner rings
    for (let i = 1; i <= 3; i++) {
      const innerRadius = radius * (1 - i * 0.2);
      this.ctx.beginPath();
      this.ctx.arc(x, y, innerRadius, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
    
    // Center hole
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * 0.1, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  /**
   * Draw floating particles
   */
  private drawFloatingParticles(width: number, height: number, parameters: MusicParameters): void {
    const time = Date.now() * 0.001;
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const x = (i * width / particleCount + time * 10) % width;
      const y = height * 0.3 + Math.sin(time + i) * 20;
      const size = 2 + Math.sin(time * 2 + i) * 1;
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time + i) * 0.2})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  /**
   * Draw animated particles
   */
  private drawAnimatedParticles(width: number, height: number, parameters: MusicParameters): void {
    const time = Date.now() * 0.001;
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const x = (i * width / particleCount + time * 20) % (width + 50) - 25;
      const y = height * 0.2 + Math.sin(time * 0.5 + i * 0.3) * 30;
      const size = 1 + Math.sin(time * 3 + i) * 0.5;
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(time + i) * 0.3})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  /**
   * Draw noise texture for LoFi effect
   */
  private drawNoiseTexture(width: number, height: number): void {
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 0.1;
      data[i] = noise * 255;     // Red
      data[i + 1] = noise * 255; // Green
      data[i + 2] = noise * 255; // Blue
      data[i + 3] = 50;          // Alpha
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Generate LoFi color palette
   */
  private generateLoFiColorPalette(parameters: MusicParameters): string[] {
    const palettes = [
      ['#2D1B69', '#11998E', '#38EF7D'], // Purple to green
      ['#667eea', '#764ba2', '#f093fb'], // Blue to pink
      ['#f093fb', '#f5576c', '#4facfe'], // Pink to blue
      ['#43e97b', '#38f9d7', '#667eea'], // Green to blue
      ['#fa709a', '#fee140', '#fa709a'], // Pink to yellow
    ];
    
    const paletteIndex = parameters.melodyPattern[0] % palettes.length;
    return palettes[paletteIndex];
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
