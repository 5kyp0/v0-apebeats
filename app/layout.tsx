import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import QueryProvider from "@/components/QueryProvider"
import GlyphProvider from "@/components/GlyphProvider"
import { ErrorBoundary, AsyncErrorBoundary } from "@/components/layout/ErrorBoundary"
import { ThirdwebProvider } from "thirdweb/react"
import { thirdwebClient } from "@/lib/thirdweb"
import { getPageMetadata } from "@/lib/metadata"
import "./globals.css"

// Default metadata for the root layout - can be overridden by individual pages
export const metadata: Metadata = getPageMetadata("home")

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
              description: "24/7 lo-fi hip-hop beats generated from live ApeChain data.",
              url: "https://ApeBeats.vercel.app",
            }),
          }}
        />
        <meta name="theme-color" content="#65a30d" />
        <meta name="color-scheme" content="dark light" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta
          property="og:image:secure_url"
          content="https://ApeBeats.vercel.app/apebeats-sonic-swamp-hub-dark-mystical-swamp-with-.jpg"
        />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ApeBeats - Sonic Swamp Hub - Lo-Fi Hip-Hop NFTs on ApeChain" />
        <meta name="twitter:image:alt" content="ApeBeats - Sonic Swamp Hub - Lo-Fi Hip-Hop NFTs on ApeChain" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Download protection for Genesis content
              document.addEventListener('DOMContentLoaded', function() {
                // Disable right-click context menu globally
                document.addEventListener('contextmenu', function(e) {
                  if (e.target && e.target.closest && e.target.closest('.genesis-protected')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });
                
                // Disable drag and drop
                document.addEventListener('dragstart', function(e) {
                  if (e.target && e.target.closest && e.target.closest('.genesis-protected')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });
                
                // Disable text selection
                document.addEventListener('selectstart', function(e) {
                  if (e.target && e.target.closest && e.target.closest('.genesis-protected')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });
                
                // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
                document.addEventListener('keydown', function(e) {
                  if (e.target && e.target.closest && e.target.closest('.genesis-protected')) {
                    if (e.key === 'F12' || 
                        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                        (e.ctrlKey && e.key === 'u') ||
                        (e.ctrlKey && e.key === 's')) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }
                });
                
                // Disable print screen (limited effectiveness)
                document.addEventListener('keyup', function(e) {
                  if (e.target && e.target.closest && e.target.closest('.genesis-protected')) {
                    if (e.key === 'PrintScreen') {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }
                });
              });
            `,
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <AsyncErrorBoundary>
            <ThirdwebProvider>
              <GlyphProvider>
                <QueryProvider>
                  <Suspense fallback={null}>{children}</Suspense>
                  <Analytics />
                </QueryProvider>
              </GlyphProvider>
            </ThirdwebProvider>
          </AsyncErrorBoundary>
        </ErrorBoundary>
      </body>
    </html>
  )
}
