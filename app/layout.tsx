import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "ApeBeats - Sonic Swamp Hub | 24/7 Lo-Fi Hip-Hop NFTs on ApeChain | ApeSounds ApeWaves Ape Music",
  description:
    "Enter the Sonic Swamp Hub. Fully onchain lo-fi hip-hop beats generated from live ApeChain data. Mint unique musical moments as NFTs in the BAYC ecosystem. Discover ApeSounds, ApeWaves, and Ape Music NFTs.",
  generator: "v0.app",
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
  authors: [{ name: "ApeBeats Team" }],
  creator: "ApeBeats",
  publisher: "ApeBeats",
  category: "Music & NFTs",
  classification: "Music NFT Platform",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apebeats.com",
    siteName: "ApeBeats - Sonic Swamp Hub",
    title: "ApeBeats - 24/7 Lo-Fi Hip-Hop NFTs on ApeChain | ApeSounds ApeWaves Ape Music",
    description:
      "Enter the Sonic Swamp Hub. Fully onchain lo-fi hip-hop beats generated from live ApeChain data. Mint unique musical moments as NFTs in the BAYC ecosystem. Discover ApeSounds, ApeWaves, and Ape Music NFTs.",
    images: [
      {
        url: "https://apebeats.com/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg",
        width: 1200,
        height: 630,
        alt: "ApeBeats - Sonic Swamp Hub - Lo-Fi Hip-Hop NFTs on ApeChain",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@CarquetE",
    creator: "@CarquetE",
    title: "ApeBeats - 24/7 Lo-Fi Hip-Hop NFTs on ApeChain | ApeSounds ApeWaves",
    description:
      "Enter the Sonic Swamp Hub. Fully onchain lo-fi hip-hop beats generated from live ApeChain data. Mint unique musical moments as NFTs. ApeSounds, ApeWaves, Ape Music NFTs.",
    images: ["https://apebeats.com/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg"],
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
    canonical: "https://apebeats.com",
  },
  other: {
    "theme-color": "#65a30d",
    "color-scheme": "dark light",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ApeBeats - Sonic Swamp Hub",
              description:
                "24/7 lo-fi hip-hop beats generated from live ApeChain data. Mint unique musical moments as NFTs in the BAYC ecosystem.",
              url: "https://apebeats.com",
              sameAs: ["https://x.com/CarquetE", "https://discord.gg/EAeFftJe"],
              potentialAction: {
                "@type": "SearchAction",
                target: "https://apebeats.com/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              about: [
                {
                  "@type": "Thing",
                  name: "ApeChain",
                  description: "Blockchain network for BAYC ecosystem",
                },
                {
                  "@type": "Thing",
                  name: "BAYC",
                  description: "Bored Ape Yacht Club NFT collection",
                },
                {
                  "@type": "Thing",
                  name: "Lo-Fi Hip-Hop",
                  description: "Chill music genre perfect for studying and relaxing",
                },
                {
                  "@type": "Thing",
                  name: "Music NFTs",
                  description: "Non-fungible tokens representing unique musical content",
                },
              ],
              keywords:
                "ApeBeats, ApeSounds, ApeWaves, Ape Music, ApeChain, BAYC, NFT Music, Lo-Fi Hip-Hop, Generative Music, Blockchain Music",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ApeBeats",
              alternateName: ["ApeSounds", "ApeWaves", "Ape Music"],
              description: "Creator of 24/7 lo-fi hip-hop NFTs on ApeChain",
              url: "https://apebeats.com",
              logo: "https://apebeats.com/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg",
              sameAs: ["https://x.com/CarquetE", "https://discord.gg/EAeFftJe"],
              foundingDate: "2024",
              industry: "Music NFTs",
              knowsAbout: [
                "ApeChain",
                "BAYC",
                "Bored Ape Yacht Club",
                "NFT Music",
                "Lo-Fi Hip-Hop",
                "Generative Music",
                "Blockchain Music",
                "Web3 Music",
              ],
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#65a30d" />
        <meta name="color-scheme" content="dark light" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta
          property="og:image:secure_url"
          content="https://apebeats.com/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg"
        />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ApeBeats - Sonic Swamp Hub - Lo-Fi Hip-Hop NFTs on ApeChain" />
        <meta name="twitter:image:alt" content="ApeBeats - Sonic Swamp Hub - Lo-Fi Hip-Hop NFTs on ApeChain" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
