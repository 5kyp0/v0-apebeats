# ApeBeats Music Engine Setup Guide

## Quick Start (Development Mode)

The music engine is configured to work out of the box with mock data for development. No API keys are required to get started!

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to the Music Engine

Visit `http://localhost:3000/music` to access the ApeBeats Music Engine.

### 3. Generate Music

- Click "Generate LoFi Hip Hop" to create music from mock blockchain data
- Try the "Start 24/7 Stream" for continuous music generation
- Use "Create NFT" to simulate NFT creation

## Production Setup (Optional)

For production use with real ApeChain data, you'll need to set up API keys:

### 1. Create Environment File

Create a `.env.local` file in the project root:

```bash
# Alchemy API Key for ApeChain data collection
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# Thirdweb Configuration (optional)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key_here

# NFT Contract Configuration (optional)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=your_nft_contract_address_here
```

### 2. Get Alchemy API Key

1. Visit [Alchemy](https://www.alchemy.com/)
2. Create a free account
3. Create a new app for ApeChain
4. Copy your API key to the environment file

### 3. Restart the Server

```bash
npm run dev
```

## Features

### Music Generation
- **Recent Activity**: Generate music from recent blockchain activity
- **Block Range**: Generate from specific block ranges
- **Address Monitoring**: Generate from specific wallet addresses
- **LoFi Hip Hop**: Specialized LoFi generator with jazz chords and vinyl crackle

### 24/7 Streaming
- Continuous music generation with real-time data variations
- Seamless transitions between tracks
- NFT snapshot creation during streaming

### NFT Integration
- Automatic NFT metadata generation
- IPFS/Arweave storage simulation
- Smart contract integration ready

### Video Visualization
- Real-time blockchain data visualization
- Waveform generation
- Particle systems and animations

## Troubleshooting

### Common Issues

1. **"Music engine not initialized" error**
   - This usually means the engine failed to start
   - Check the browser console for detailed error messages
   - Ensure all dependencies are installed: `npm install`

2. **Audio not playing**
   - Check browser audio permissions
   - Ensure Web Audio API is supported
   - Try refreshing the page

3. **NFT creation fails**
   - In development mode, NFT creation is simulated
   - Check console for mock transaction details
   - For real NFT creation, set up proper API keys

### Development Mode

The engine automatically uses mock data when API keys are not configured. This includes:
- Mock blockchain data generation
- Simulated audio synthesis
- Mock NFT creation with fake transaction hashes
- Simulated network statistics

## Architecture

```
lib/music-engine/
├── index.ts              # Main engine orchestrator
├── useMusicEngine.ts     # React hook for UI integration
├── dataCollector.ts      # Blockchain data collection
├── musicGenerator.ts     # Electronic music generation
├── lofiGenerator.ts      # LoFi Hip Hop generation
├── streamingEngine.ts    # 24/7 streaming management
├── nftSnapshot.ts        # NFT creation and management
├── videoVisualizer.ts    # Video visualization
├── types.ts              # TypeScript definitions
└── config.ts             # Configuration management
```

## Next Steps

1. **Customize Music Styles**: Modify the generators in `musicGenerator.ts` and `lofiGenerator.ts`
2. **Add Real NFT Integration**: Implement actual smart contract calls in `nftSnapshot.ts`
3. **Enhance Visualizations**: Extend the video visualizer with more effects
4. **Add More Data Sources**: Integrate additional blockchain data sources
5. **Optimize Performance**: Add caching and optimization for production use

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review the test files in `__tests__/lib/music-engine/`
3. Check the component tests for usage examples