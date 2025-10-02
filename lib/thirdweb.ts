// thirdweb client setup
import { createThirdwebClient, getContract } from "thirdweb"
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets"
import { apeChainThirdweb } from "./chains"

export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "demo-client-id",
})

// Re-export apeChain for backward compatibility
export { apeChainThirdweb as apeChain }

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
export const APE_TOKEN_ADDRESS = "0x4c078361FC9BbB78DF910800A991C7e3DD75Ac95"

// Batch Transfer Contract ABI
export const BATCH_TRANSFER_ABI = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_apeToken", "type": "address" },
      { "name": "_feeRecipient", "type": "address" },
      { "name": "_feeBps", "type": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "batchTransfer",
    "inputs": [
      { "name": "recipients", "type": "address[]" },
      { "name": "amounts", "type": "uint256[]" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "batchTransferEqual",
    "inputs": [
      { "name": "recipients", "type": "address[]" },
      { "name": "amountPerRecipient", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "batchTransferRandom",
    "inputs": [
      { "name": "recipients", "type": "address[]" },
      { "name": "minAmount", "type": "uint256" },
      { "name": "maxAmount", "type": "uint256" },
      { "name": "seed", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "calculateFee",
    "inputs": [
      { "name": "totalAmount", "type": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "feeBps",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "feeRecipient",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setFeeBps",
    "inputs": [
      { "name": "_feeBps", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setFeeRecipient",
    "inputs": [
      { "name": "_feeRecipient", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setTrackingEnabled",
    "inputs": [
      { "name": "_enabled", "type": "bool" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "trackingEnabled",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      { "name": "newOwner", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "BatchTracked",
    "inputs": [
      { "name": "sender", "type": "address", "indexed": true },
      { "name": "totalVolume", "type": "uint256", "indexed": false },
      { "name": "numRecipients", "type": "uint256", "indexed": false },
      { "name": "fee", "type": "uint256", "indexed": false },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      { "name": "previousOwner", "type": "address", "indexed": true },
      { "name": "newOwner", "type": "address", "indexed": true }
    ],
    "anonymous": false
  }
] as const

// Contract definitions using getContract
export const getBatchTransferContract = () => {
  const contractAddress = process.env.NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Batch transfer contract address not configured. Please set NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS in your environment variables.")
  }
  
  return getContract({
    client: thirdwebClient,
    chain: apeChainThirdweb,
    address: contractAddress,
    abi: BATCH_TRANSFER_ABI,
  })
}

export const getApeTokenContract = () => {
  return getContract({
    client: thirdwebClient,
    chain: apeChainThirdweb,
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
  apeToken: "0x4d224452801ACEd8B2F0aebE155379bb5D594381", // APE token address
  
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


