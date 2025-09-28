"use client"

import React, { useState, useEffect } from "react"

// Preload all wallet icons for consistent loading
const preloadWalletIcons = () => {
  const iconUrls = [
    "https://docs.useglyph.io/glyph-logo.png",
    "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    "https://rabby.io/assets/logos/symbol-new.svg",
    "https://framerusercontent.com/images/Hml6PtJwt03gwFtTRYmbpo7EarY.png?scale-down-to=512",
    "https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Gradient/Icon.png"
  ]
  
  iconUrls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}

// Preload icons when module loads
if (typeof window !== 'undefined') {
  preloadWalletIcons()
}

// Optimized icon component with preloading and error handling
const OptimizedIcon = ({ src, alt, fallback }: { src: string; alt: string; fallback?: React.ReactNode }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setLoaded(true)
      setLoading(false)
    }
    img.onerror = () => {
      setError(true)
      setLoading(false)
    }
    img.src = src
    
    // Set a timeout to show fallback if image takes too long
    const timeout = setTimeout(() => {
      if (!loaded && !error) {
        setError(true)
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [src, loaded, error])

  if (error && fallback) {
    return <>{fallback}</>
  }

  if (loading) {
    return (
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse flex items-center justify-center">
        <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full" />
      </div>
    )
  }

  return (
    <img 
      src={src}
      alt={alt}
      width="20" 
      height="20" 
      className="rounded transition-opacity duration-200 opacity-100"
      style={{ minWidth: '20px', minHeight: '20px' }}
      onError={() => setError(true)}
    />
  )
}

// Wallet icons with official designs and colors
export const GlyphIcon = () => (
  <OptimizedIcon 
    src="https://docs.useglyph.io/glyph-logo.png" 
    alt="Glyph"
    fallback={
      <div className="w-5 h-5 bg-teal-500 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">G</span>
      </div>
    }
  />
)

export const MetaMaskIcon = () => (
  <OptimizedIcon 
    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
    alt="MetaMask"
    fallback={
      <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">M</span>
      </div>
    }
  />
)

export const RabbyIcon = () => (
  <OptimizedIcon 
    src="https://rabby.io/assets/logos/symbol-new.svg" 
    alt="Rabby"
    fallback={
      <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">R</span>
      </div>
    }
  />
)

export const RainbowIcon = () => (
  <OptimizedIcon 
    src="https://framerusercontent.com/images/Hml6PtJwt03gwFtTRYmbpo7EarY.png?scale-down-to=512" 
    alt="Rainbow"
    fallback={
      <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-purple-500 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">R</span>
      </div>
    }
  />
)

export const WalletConnectIcon = () => (
  <OptimizedIcon 
    src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Gradient/Icon.png" 
    alt="WalletConnect"
    fallback={
      <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">W</span>
      </div>
    }
  />
)

// Social login icons with official designs
export const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C15.24 23 17.95 21.87 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C8.87 18.63 6.22 16.65 5.26 13.88H1.64V16.71C2.98 19.32 7.23 23 12 23Z" fill="#34A853"/>
    <path d="M5.26 13.88C5.01 13.13 4.88 12.33 4.88 11.5C4.88 10.67 5.01 9.87 5.26 9.12V6.29H1.64C0.76 7.83 0.25 9.6 0.25 11.5C0.25 13.4 0.76 15.17 1.64 16.71L5.26 13.88Z" fill="#FBBC05"/>
    <path d="M12 4.38C13.62 4.38 15.06 4.88 16.21 5.83L19.35 2.69C17.95 1.42 15.24 0.25 12 0.25C7.23 0.25 2.98 3.93 1.64 6.54L5.26 9.37C6.22 6.6 8.87 4.62 12 4.62V4.38Z" fill="#EA4335"/>
  </svg>
)

export const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.57997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="currentColor"/>
  </svg>
)

export const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
  </svg>
)

export const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
)

// Legacy Twitter icon (keeping for backward compatibility)
export const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.95718 14.8821 3.28445C14.0247 3.61172 13.2884 4.19439 12.773 4.95372C12.2575 5.71305 11.9877 6.61198 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39524C5.36074 6.60467 4.01032 5.43866 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
