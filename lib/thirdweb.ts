// thirdweb client setup
import { createThirdwebClient, getContract } from "thirdweb"
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets"
import { apeChainThirdweb, apeChainMainnetThirdweb } from "./chains"

export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "demo-client-id",
})

// Import apeChain for local use
const apeChain = apeChainThirdweb

// Re-export apeChain for backward compatibility
export { apeChain }
export { apeChainThirdweb }

// Preferred wallets for Connect UI
export const preferredWallets = [
  // Injected wallets by rdns (will only show if installed)
  createWallet("io.metamask"),
  createWallet("io.rabby"),
  createWallet("me.rainbow"),
  // Note: Glyph wallet is now handled by the native Glyph SDK, not thirdweb
  // Fallback WalletConnect to support these on mobile
  walletConnect(),
  // In-app wallet with socials
  inAppWallet({
    auth: {
      options: ["email", "google", "apple", "x"],
    },
  }),
]

// ApeCoin token address on ApeChain
export const APE_TOKEN_ADDRESS = "0x4d224452801aced8b2f0aebe155379bb5d594381"

// Import the correct ABI from the compiled contract
import batchTransferNativeABI from './batchTransferNativeABI.json'

// Batch Transfer Contract ABI (from compiled BatchTransferNative contract)
export const BATCH_TRANSFER_ABI = batchTransferNativeABI as const

// Old ABI removed - now using correct compiled ABI

// Contract definitions using getContract
export const getBatchTransferContract = () => {
  const contractAddress = process.env.NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS
  
  // Debug: Log environment variable loading
  console.log("🔍 Environment check:", {
    contractAddress,
    nodeEnv: process.env.NODE_ENV,
    hasEnvVar: !!contractAddress,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('BATCH')),
    fullContractAddress: contractAddress
  })
  
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Batch transfer contract address not configured. Please set NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS in your environment variables.")
  }
  
  // Always use Curtis testnet for batch transfer contract
  return getContract({
    client: thirdwebClient,
    chain: apeChainThirdweb, // Curtis testnet
    address: contractAddress,
    abi: BATCH_TRANSFER_ABI,
  })
}

export const getApeTokenContract = (useMainnet: boolean = false) => {
  return getContract({
    client: thirdwebClient,
    chain: useMainnet ? apeChainMainnetThirdweb : apeChainThirdweb,
    address: APE_TOKEN_ADDRESS,
    abi: [
      {
        "type": "function",
        "name": "approve",
        "inputs": [
          { "name": "spender", "type": "address" },
          { "name": "amount", "type": "uint256" }
        ],
        "outputs": [
          { "name": "", "type": "bool" }
        ],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
          { "name": "account", "type": "address" }
        ],
        "outputs": [
          { "name": "", "type": "uint256" }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "decimals",
        "inputs": [],
        "outputs": [
          { "name": "", "type": "uint8" }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "name",
        "inputs": [],
        "outputs": [
          { "name": "", "type": "string" }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "symbol",
        "inputs": [],
        "outputs": [
          { "name": "", "type": "string" }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "totalSupply",
        "inputs": [],
        "outputs": [
          { "name": "", "type": "uint256" }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "transfer",
        "inputs": [
          { "name": "to", "type": "address" },
          { "name": "amount", "type": "uint256" }
        ],
        "outputs": [
          { "name": "", "type": "bool" }
        ],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "allowance",
        "inputs": [
          { "name": "owner", "type": "address" },
          { "name": "spender", "type": "address" }
        ],
        "outputs": [
          { "name": "", "type": "uint256" }
        ],
        "stateMutability": "view"
      }
    ] as const,
  })
}

// Staking Configuration
export const contractAddresses = {
  // Main staking contract
  staking: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || "",
  
  // Pool factory contract
  poolFactory: process.env.NEXT_PUBLIC_POOL_FACTORY_CONTRACT_ADDRESS || "",
  
  // Governance contract
  governance: process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS || "",
  
  // NFT Shadow contract
  nftShadow: process.env.NEXT_PUBLIC_NFT_SHADOW_CONTRACT_ADDRESS || "",
  
  // Reward token (APE)
  apeToken: "0x4d224452801aced8b2f0aebe155379bb5d594381", // APE token address
  
  // NFT Collection addresses
  collections: {
    bayc: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    mayc: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
    otherdeed: "0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258",
    apebeats: process.env.NEXT_PUBLIC_APEBEATS_CONTRACT_ADDRESS || "",
  },
};

// Staking tiers configuration
export const stakingTiers = {
  partner: {
    name: "Partner Tier",
    apy: { "30": 5, "90": 8 },
    description: "Vetted community collections",
    features: ["Standard rewards", "Community support", "Basic dashboard access"],
    color: "blue",
  },
  standard: {
    name: "Standard Tier", 
    apy: { "30": 8, "90": 10, "180": 12 },
    description: "BAYC, MAYC, Otherdeed holders",
    features: ["DAO-approved collections", "Priority support", "Enhanced dashboard", "Governance participation"],
    color: "green",
  },
  premium: {
    name: "Premium Tier",
    apy: { "30": 12, "90": 13, "180": 15 },
    description: "ApeBeats Genesis & Live holders", 
    features: ["Vibe Tokens rewards", "Audio remix privileges", "Exclusive ApeBeats perks", "VIP community access", "Enhanced royalty pool (4.2%)"],
    color: "purple",
  },
  oss: {
    name: "OSS Tier",
    apy: "Variable",
    description: "Community-deployed pools",
    features: ["User-set APY rates", "Custom reward tokens", "Permissionless deployment", "Governance tokens", "Open-source bounties"],
    color: "orange",
  },
};

// Fee structure
export const feeStructure = {
  treasury: 10, // 10% to treasury
  apebeats: 5,  // 5% to ApeBeats holders
  stakers: 85,  // 85% to stakers
};

// Early unstaking penalties
export const unstakingPenalties = {
  "7": 20,   // 20% penalty for unstaking within 7 days
  "30": 15,  // 15% penalty for unstaking within 30 days
  "90": 10,  // 10% penalty for unstaking within 90 days
  "180": 5,  // 5% penalty for unstaking within 180 days
};


