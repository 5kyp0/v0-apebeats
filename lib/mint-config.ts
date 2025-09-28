/**
 * ApeBeats Genesis Mint Configuration
 * Centralized configuration for the mint page
 */

// Contract configuration from environment variables
export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_APEBEATS_GENESIS_ADDRESS || "0xF18e678Da91c01B1B94aaBA7feE3E273F27923C3",
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "33111"),
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME || "Curtis Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.curtis.apechain.xyz",
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://explorer.curtis.apechain.xyz",
} as const;

// Mint configuration
export const MINT_CONFIG = {
  totalSupply: 420,
  founderMintAmount: 4,
  gtdMintAmount: 42,
  prices: {
    founder: 0,
    gtd: 4.2,
    fcfs: 6.9,
    public: 6.9,
  },
  maxQuantities: {
    founder: 4,
    gtd: 1,
    fcfs: 4,
    public: 5,
  },
  durations: {
    gtd: 15 * 60 * 1000, // 15 minutes in milliseconds
    fcfs: 30 * 60 * 1000, // 30 minutes in milliseconds
  },
} as const;

// Merkle configuration
export const MERKLE_CONFIG = {
  gtdRoot: process.env.NEXT_PUBLIC_GTD_MERKLE_ROOT || "",
  fcfsRoot: process.env.NEXT_PUBLIC_FCFS_MERKLE_ROOT || "",
} as const;

// Contract ABI (simplified for frontend)
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "totalMinted",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isFounderMintActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isGTDMintActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isFCFSMintActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isPublicMintActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "mintFounder",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "vault", "type": "address"}, {"internalType": "bytes32[]", "name": "merkleProof", "type": "bytes32[]"}],
    "name": "mintGTD",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "address", "name": "vault", "type": "address"}, {"internalType": "bytes32[]", "name": "merkleProof", "type": "bytes32[]"}],
    "name": "mintFCFS",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "mintPublic",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "GTD_PRICE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "FCFS_PRICE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PUBLIC_PRICE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Mint phase types
export type MintPhase = 'founder' | 'gtd' | 'fcfs' | 'public';

// Utility functions
export const getMintPhase = (totalMinted: number): MintPhase => {
  if (totalMinted < MINT_CONFIG.founderMintAmount) return 'founder';
  if (totalMinted < MINT_CONFIG.founderMintAmount + MINT_CONFIG.gtdMintAmount) return 'gtd';
  if (totalMinted < MINT_CONFIG.totalSupply) return 'fcfs';
  return 'public';
};

export const getMaxQuantity = (phase: MintPhase): number => {
  return MINT_CONFIG.maxQuantities[phase];
};

export const getPrice = (phase: MintPhase): number => {
  return MINT_CONFIG.prices[phase];
};

export const getTotalPrice = (phase: MintPhase, quantity: number): number => {
  return getPrice(phase) * quantity;
};

// Validation functions
export const validateMintParams = (
  phase: MintPhase,
  quantity: number,
  userAddress?: string
): { valid: boolean; error?: string } => {
  if (!userAddress) {
    return { valid: false, error: "Wallet not connected" };
  }

  if (quantity <= 0) {
    return { valid: false, error: "Quantity must be greater than 0" };
  }

  const maxQuantity = getMaxQuantity(phase);
  if (quantity > maxQuantity) {
    return { valid: false, error: `Maximum ${maxQuantity} per wallet for ${phase} phase` };
  }

  return { valid: true };
};
