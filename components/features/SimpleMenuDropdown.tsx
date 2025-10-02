"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
  Music, 
  Users, 
  Home, 
  ChevronDown,
  Layers,
  Coins,
  Sparkles
} from "lucide-react"

export default function SimpleMenuDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navigateTo = (path: string) => {
    console.log('Navigating to:', path)
    setIsOpen(false)
    window.location.href = path
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          console.log('Menu clicked, opening:', !isOpen)
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2"
      >
        <Menu className="w-4 h-4" />
        <span className="hidden sm:inline">Menu</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999]"
          style={{ position: 'absolute', zIndex: 9999 }}
        >
          <div className="p-2">
            <div className="space-y-1">
              <button
                onClick={() => navigateTo('/')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Home className="w-4 h-4" />
                <div>
                  <div className="font-medium text-sm">Home</div>
                  <div className="text-xs text-gray-500">Back to main page</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/music')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Music className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">Music Engine</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      BETA
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">24/7 generative music</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/snapshot')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Users className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">Snapshot Tool</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      BETA
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">Token holder snapshots</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/mint')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Sparkles className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">Mint NFTs</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Coming soon
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">Create new ApeBeats</div>
                </div>
              </button>
              
              {/* Batch Operations Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Batch Operations
                </div>
              </div>
              
              <button
                onClick={() => navigateTo('/batch/mint')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Layers className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">Batch Mint</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Coming soon
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">Mint multiple NFTs</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/batch/transfer')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Layers className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">Batch Transfer</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Coming soon
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">Transfer multiple NFTs</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/batch/approve')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Layers className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">Batch Approve</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Coming soon
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">Approve multiple NFTs</div>
                </div>
              </button>
              
              {/* Staking Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Staking
                </div>
              </div>
              
              <button
                onClick={() => navigateTo('/stake/deposit')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Coins className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">Stake NFTs</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Coming soon
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">Deposit NFTs for rewards</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/stake/withdraw')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Coins className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">Unstake NFTs</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Coming soon
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">Withdraw staked NFTs</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/stake/rewards')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Coins className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">Claim Rewards</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Coming soon
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">Claim staking rewards</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
