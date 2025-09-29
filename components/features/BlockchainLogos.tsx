"use client"

import React from 'react'
import Image from 'next/image'

interface BlockchainLogoProps {
  chain: string
  size?: number
  className?: string
}

export const BlockchainLogo: React.FC<BlockchainLogoProps> = ({ 
  chain, 
  size = 20, 
  className = "" 
}) => {
  const logoStyle = {
    width: size,
    height: size,
  }

  const getLogo = () => {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <g fill="#627EEA">
              <path d="M12 0l6.5 10.5L12 8l-6.5 2.5L12 0z"/>
              <path d="M12 16l6.5-3L12 24l-6.5-11 6.5 3z"/>
            </g>
          </svg>
        )
      case 'polygon':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <g fill="#8247E5">
              <path d="M12 0l10.39 6v12L12 24 1.61 18V6L12 0z"/>
              <path d="M12 2.25L3.36 7.5v9L12 21.75l8.64-5.25v-9L12 2.25z"/>
              <path d="M12 5l5.196 3v6L12 17l-5.196-3V8L12 5z"/>
            </g>
          </svg>
        )
      case 'arbitrum':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <g fill="#28A0F0">
              <circle cx="12" cy="12" r="11" fill="#28A0F0"/>
              <path d="M8 16l4-8 4 8h-8z" fill="white"/>
              <path d="M10 14h4l-2-4-2 4z" fill="#28A0F0"/>
            </g>
          </svg>
        )
      case 'optimism':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <g fill="#FF0420">
              <circle cx="12" cy="12" r="11" fill="#FF0420"/>
              <path d="M7 12c0-1.5 1-2.5 2.5-2.5S12 10.5 12 12s-1 2.5-2.5 2.5S7 13.5 7 12z" fill="white"/>
              <path d="M12 12c0-1.5 1-2.5 2.5-2.5S17 10.5 17 12s-1 2.5-2.5 2.5S12 13.5 12 12z" fill="white"/>
            </g>
          </svg>
        )
      case 'base':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <g fill="#0052FF">
              <circle cx="12" cy="12" r="11" fill="#0052FF"/>
              <path d="M12 6c3.3 0 6 2.7 6 6 0 3.3-2.7 6-6 6s-6-2.7-6-6c0-3.3 2.7-6 6-6zm0 2c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="white"/>
            </g>
          </svg>
        )
      case 'apechain':
        return (
          <div style={logoStyle} className={className}>
            <Image
              src="/Apechain.svg"
              alt="ApeChain"
              width={size}
              height={size}
              className="w-full h-full"
            />
          </div>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <circle fill="#6B7280" cx="12" cy="12" r="10"/>
            <text x="12" y="16" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">
              {chain.charAt(0).toUpperCase()}
            </text>
          </svg>
        )
    }
  }

  return getLogo()
}

export const BlockchainLogos: React.FC<{ chains: string[], size?: number, className?: string }> = ({ 
  chains, 
  size = 16, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {chains.map((chain, index) => (
        <BlockchainLogo 
          key={index} 
          chain={chain} 
          size={size} 
          className="flex-shrink-0"
        />
      ))}
    </div>
  )
}