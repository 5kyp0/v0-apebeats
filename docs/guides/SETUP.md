# ApeBeats Music Engine Setup Guide

## Quick Start

The music engine is now configured to work with mock data for development, so you can test it immediately without API keys. However, for full functionality, you'll need to set up the following:

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Required for blockchain data collection
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# Required for wallet connection and NFT functionality  
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here

# ApeChain Configuration
NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139

# Optional NFT Configuration
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=
NEXT_PUBLIC_ENABLE_NFT_SNAPSHOTS=true
NEXT_PUBLIC_AUTO_MINT_NFTS=false

# Storage Configuration
NEXT_PUBLIC_STORAGE_PROVIDER=ipfs
NEXT_PUBLIC_PIN_TO_IPFS=true
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net/

# Music Generation Defaults
NEXT_PUBLIC_DEFAULT_MUSIC_STYLE=electronic
NEXT_PUBLIC_DEFAULT_MUSIC_DURATION=60

# Development Settings
NODE_ENV=development
```

## Getting API Keys

### 1. Alchemy API Key (Required for real blockchain data)
1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. Create a new app
3. Select "ApeChain" as the chain
4. Copy the API key and add it to your `.env.local` file

### 2. Thirdweb Client ID (Required for wallet connection)
1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Create a new project
3. Copy the Client ID and add it to your `.env.local` file

## Development Mode

If you don't have API keys yet, the music engine will automatically use mock blockchain data for development. You can:

1. Generate music from mock recent activity
2. Generate music from mock block ranges  
3. Generate music from mock addresses
4. Test all the UI functionality

## Testing the Music Engine

1. Navigate to `/music` in your app
2. Try the "Generate Electronic" button - it should work with mock data
3. Try the "Generate LoFi Hip Hop" button - it should also work
4. The generated music should be playable in the audio player

## Troubleshooting

### "Cannot read properties of undefined (reading 'chainId')" Error
This has been fixed! The music engine now handles missing environment variables gracefully.

### Music not playing
The audio generation has been improved with proper WAV format headers. If you still have issues:
1. Check the browser console for errors
2. Make sure your browser supports Web Audio API
3. Try refreshing the page

### Wallet connection issues
Make sure you have the required environment variables set up, especially `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`.

## Features Working in Development Mode

✅ Music generation from mock blockchain data  
✅ LoFi Hip Hop generation  
✅ Audio playback  
✅ NFT metadata generation  
✅ Network statistics display  
✅ All UI components and controls  

## Features Requiring API Keys

🔑 Real blockchain data collection  
🔑 Wallet connection  
🔑 NFT minting  
🔑 IPFS storage  

## Next Steps

1. Set up your API keys for full functionality
2. Test with real ApeChain data
3. Deploy to production with proper environment variables
4. Customize the music generation parameters
5. Add your own NFT contract addresses

The music engine is now ready to use! 🎵
