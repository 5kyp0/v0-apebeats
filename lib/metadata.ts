import type { Metadata } from "next"

export interface SocialMediaMetadata {
  title: string
  description: string
  image?: string
  imageAlt?: string
  url?: string
  type?: "website" | "article" | "music.song" | "video.movie"
  siteName?: string
  locale?: string
  twitterCard?: "summary" | "summary_large_image" | "app" | "player"
  twitterSite?: string
  twitterCreator?: string
  keywords?: string[]
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

const defaultMetadata: Partial<SocialMediaMetadata> = {
  siteName: "ApeBeats - Sonic Swamp Hub",
  locale: "en_US",
  twitterCard: "summary_large_image",
  twitterSite: "@CarquetE",
  twitterCreator: "@CarquetE",
  keywords: [
    "ApeBeats",
    "ApeSounds",
    "ApeWaves",
    "Ape Music",
    "ApeChain",
    "BAYC",
    "Bored Ape Yacht Club",
    "NFT Music",
    "Lo-Fi Hip-Hop",
    "Generative Music",
    "Blockchain Music",
    "Onchain Beats",
    "Music NFTs",
    "Hip-Hop NFTs",
    "Ape NFTs",
    "Yuga Labs",
    "Otherside",
    "Koda",
    "Genesis Collection",
    "Live Beats",
    "24/7 Music Stream",
    "Crypto Music",
    "Web3 Music",
    "Decentralized Music",
    "Sonic Swamp",
    "Music Generation",
    "Real-time Music",
    "Data-driven Music",
    "APE Token",
    "Music Royalties",
  ],
}

export function generateSocialMediaMetadata(
  pageMetadata: SocialMediaMetadata,
  baseUrl: string = "https://ApeBeats.vercel.app"
): Metadata {
  const {
    title,
    description,
    image,
    imageAlt,
    url,
    type = "website",
    siteName,
    locale,
    twitterCard,
    twitterSite,
    twitterCreator,
    keywords,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
  } = { ...defaultMetadata, ...pageMetadata }

  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg`
  const fullImageAlt = imageAlt || `${title} - ApeBeats Sonic Swamp Hub`

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords || defaultMetadata.keywords,
    authors: author ? [{ name: author }] : [{ name: "ApeBeats Team" }],
    creator: "ApeBeats",
    publisher: "ApeBeats",
    category: "Music & NFTs",
    classification: "Music NFT Platform",
    openGraph: {
      type,
      locale,
      url: fullUrl,
      siteName,
      title,
      description,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullImageAlt,
          type: "image/jpeg",
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    twitter: {
      card: twitterCard,
      site: twitterSite,
      creator: twitterCreator,
      title,
      description,
      images: [fullImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
    other: {
      "theme-color": "#65a30d",
      "color-scheme": "dark light",
    },
  }

  return metadata
}

// Predefined metadata for common pages
export const pageMetadata = {
  home: {
    title: "ApeBeats - Sonic Swamp Hub | 24/7 Lo-Fi Hip-Hop NFTs on ApeChain | ApeSounds ApeWaves Ape Music",
    description: "Enter the Sonic Swamp Hub. Fully onchain lo-fi hip-hop beats generated from live ApeChain data. Mint unique musical moments as NFTs in the BAYC ecosystem. Discover ApeSounds, ApeWaves, and Ape Music NFTs.",
    url: "/",
    type: "website" as const,
  },
  
  music: {
    title: "Music Engine - ApeBeats | Generate Lo-Fi Hip-Hop from ApeChain Data",
    description: "Try the ApeBeats Music Engine. Generate unique lo-fi hip-hop beats using live ApeChain data. Experience the future of onchain music generation.",
    url: "/music",
    type: "website" as const,
  },
  
  dashboard: {
    title: "Dashboard - ApeBeats | Your Music NFT Collection",
    description: "View and manage your ApeBeats NFT collection. Track your Genesis NFTs, royalty earnings, and music generation history.",
    url: "/dashboard",
    type: "website" as const,
  },
  
  mint: {
    title: "Mint NFTs - ApeBeats | Create Your Own Music NFTs",
    description: "Mint unique music NFTs with the ApeBeats platform. Capture live ApeChain data as musical moments and own them forever.",
    url: "/mint",
    type: "website" as const,
  },
  
  stake: {
    title: "Staking - ApeBeats | Stake APE Tokens for Rewards",
    description: "Stake your APE tokens with ApeBeats and earn rewards. Support the Sonic Swamp ecosystem while earning passive income.",
    url: "/stake",
    type: "website" as const,
  },
  
  snapshot: {
    title: "Snapshot Tool - ApeBeats | Capture Live Music Moments",
    description: "Use the ApeBeats Snapshot Tool to capture unique musical moments from live ApeChain data. Create 5-60 second music NFTs.",
    url: "/snapshot",
    type: "website" as const,
  },
  
  transfers: {
    title: "Batch Transfers - ApeBeats | Transfer Multiple NFTs",
    description: "Efficiently transfer multiple ApeBeats NFTs at once. Save gas fees with our batch transfer functionality.",
    url: "/transfers",
    type: "website" as const,
  },
  
  login: {
    title: "Login - ApeBeats | Connect Your Wallet",
    description: "Connect your wallet to access the ApeBeats platform. Join the Sonic Swamp community and start creating music NFTs.",
    url: "/login",
    type: "website" as const,
  },
  
  notFound: {
    title: "Page Not Found - ApeBeats | Sonic Swamp Hub",
    description: "The page you're looking for doesn't exist in the Sonic Swamp. Return to the ApeBeats hub to continue your musical journey.",
    url: "/404",
    type: "website" as const,
  },
} as const

// Helper function to get metadata for a specific page
export function getPageMetadata(pageKey: keyof typeof pageMetadata, customMetadata?: Partial<SocialMediaMetadata>) {
  const baseMetadata = pageMetadata[pageKey]
  return generateSocialMediaMetadata({ ...baseMetadata, ...customMetadata })
}
