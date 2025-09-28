"use client"

import React from 'react'

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
            <path fill="#627EEA" d="M12 0L5.5 12.5L12 8.5L18.5 12.5L12 0Z"/>
            <path fill="#627EEA" d="M12 15.5L5.5 19.5L12 24L18.5 19.5L12 15.5Z"/>
          </svg>
        )
      case 'polygon':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <path fill="#8247E5" d="M12 0L24 8.5V15.5L12 24L0 15.5V8.5L12 0Z"/>
            <path fill="#8247E5" d="M12 2L2 9V15L12 22L22 15V9L12 2Z"/>
          </svg>
        )
      case 'arbitrum':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <path fill="#28A0F0" d="M12 0L24 6V18L12 24L0 18V6L12 0Z"/>
            <path fill="#28A0F0" d="M12 2L2 7V17L12 22L22 17V7L12 2Z"/>
          </svg>
        )
      case 'optimism':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <path fill="#FF0420" d="M12 0L24 6V18L12 24L0 18V6L12 0Z"/>
            <path fill="#FF0420" d="M12 2L2 7V17L12 22L22 17V7L12 2Z"/>
          </svg>
        )
      case 'base':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <path fill="#0052FF" d="M12 0L24 6V18L12 24L0 18V6L12 0Z"/>
            <path fill="#0052FF" d="M12 2L2 7V17L12 22L22 17V7L12 2Z"/>
          </svg>
        )
      case 'apechain':
        return (
          <svg viewBox="0 0 24 24" style={logoStyle} className={className}>
            <path fill="#FF6B35" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            <path fill="#FF6B35" d="M12 4C7.589 4 4 7.589 4 12s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/>
            <circle fill="#FF6B35" cx="12" cy="12" r="3"/>
          </svg>
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
