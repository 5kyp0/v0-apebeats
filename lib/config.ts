// Secure configuration management
// This file centralizes all configuration and ensures proper environment variable handling

export const config = {
  // Thirdweb configuration
  thirdweb: {
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "demo-client-id",
  },
  
  // Blockchain configuration
  blockchain: {
    alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "",
    apechainChainId: Number(process.env.NEXT_PUBLIC_APECHAIN_CHAIN_ID || 33139),
    fallbackChainId: 1,
    fallbackRpc: "https://eth.llamarpc.com",
  },
  
  // Security configuration
  security: {
    enableCSP: process.env.NODE_ENV === 'production',
    enableHSTS: process.env.NODE_ENV === 'production',
    enableCORS: process.env.NODE_ENV === 'production',
  },
  
  // Feature flags
  features: {
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableDebugMode: process.env.NODE_ENV === 'development',
    enableGenesisProtection: true,
  },
  
  // API endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    timeout: 30000,
  },
} as const;

// Validation function to ensure required environment variables are present
export function validateConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_THIRDWEB_CLIENT_ID',
  ];
  
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
  
  return missingVars.length === 0;
}

// Secure API key validation
export function isValidApiKey(key: string): boolean {
  if (!key || key === 'demo-client-id') {
    return false;
  }
  
  // Basic validation - should be a non-empty string
  return typeof key === 'string' && key.length > 0;
}

// Environment-specific configuration
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';
