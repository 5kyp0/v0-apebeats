/**
 * Music Engine Configuration
 * 
 * Centralized configuration for the ApeBeats Music Engine
 */

export const musicEngineConfig = {
  // API Keys (set these in your .env.local file)
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
  thirdwebClientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '',
  
  // Chain Configuration
  apechainChainId: parseInt(process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID || '33139'),
  
  // NFT Configuration
  nftContractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '',
  enableNFTSnapshots: process.env.NEXT_PUBLIC_ENABLE_NFT_SNAPSHOTS === 'true',
  autoMintNFTs: process.env.NEXT_PUBLIC_AUTO_MINT_NFTS === 'true',
  
  // Storage Configuration
  storageProvider: (process.env.NEXT_PUBLIC_STORAGE_PROVIDER as 'ipfs' | 'arweave' | 'both') || 'ipfs',
  pinToIPFS: process.env.NEXT_PUBLIC_PIN_TO_IPFS === 'true',
  ipfsGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  arweaveGateway: process.env.NEXT_PUBLIC_ARWEAVE_GATEWAY || 'https://arweave.net/',
  
  // Music Generation Defaults
  defaultStyle: (process.env.NEXT_PUBLIC_DEFAULT_MUSIC_STYLE as 'ambient' | 'electronic' | 'classical' | 'jazz' | 'experimental') || 'electronic',
  defaultDuration: parseInt(process.env.NEXT_PUBLIC_DEFAULT_MUSIC_DURATION || '60'),
  defaultComplexity: 'medium' as const,
  
  // Generation Limits
  maxBlockCount: 100,
  maxAddressCount: 50,
  maxDuration: 300, // 5 minutes
  
  // Audio Configuration
  sampleRate: 44100,
  bitDepth: 16,
  channels: 2,
  
  // NFT Metadata
  collectionName: 'ApeChain Symphonies',
  collectionDescription: 'Generative music pieces created from ApeChain blockchain data',
  royaltyPercentage: 5,
  
  // Error Handling
  maxRetries: 3,
  retryDelay: 1000,
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  enableDebugLogs: process.env.NODE_ENV === 'development'
};

// Validation function
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!musicEngineConfig.alchemyApiKey) {
    errors.push('NEXT_PUBLIC_ALCHEMY_API_KEY is required');
  }
  
  if (!musicEngineConfig.thirdwebClientId) {
    errors.push('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is required');
  }
  
  if (musicEngineConfig.enableNFTSnapshots && !musicEngineConfig.nftContractAddress) {
    errors.push('NEXT_PUBLIC_NFT_CONTRACT_ADDRESS is required when NFT snapshots are enabled');
  }
  
  if (musicEngineConfig.apechainChainId !== 33139) {
    console.warn('Using non-standard ApeChain chain ID:', musicEngineConfig.apechainChainId);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to get configuration for specific use cases
export function getConfigForUseCase(useCase: 'development' | 'production' | 'testing') {
  const baseConfig = { ...musicEngineConfig };
  
  switch (useCase) {
    case 'development':
      return {
        ...baseConfig,
        enableDebugLogs: true,
        maxBlockCount: 10,
        defaultDuration: 30
      };
      
    case 'testing':
      return {
        ...baseConfig,
        enableNFTSnapshots: false,
        autoMintNFTs: false,
        maxBlockCount: 5,
        defaultDuration: 10
      };
      
    case 'production':
      return {
        ...baseConfig,
        enableDebugLogs: false,
        maxRetries: 5,
        retryDelay: 2000
      };
      
    default:
      return baseConfig;
  }
}
