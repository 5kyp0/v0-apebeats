"use client"

import { useState } from "react"
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

  const navigateTo = (path: string) => {
    console.log('Navigating to:', path)
    setIsOpen(false)
    window.location.href = path
  }

  return (
    <div className="relative">
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
          className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999]"
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
                <div>
                  <div className="font-medium text-sm">Music Engine</div>
                  <div className="text-xs text-gray-500">24/7 generative music</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/snapshot')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Users className="w-4 h-4" />
                <div>
                  <div className="font-medium text-sm">Snapshot Tool</div>
                  <div className="text-xs text-gray-500">Token holder snapshots</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/mint')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Sparkles className="w-4 h-4" />
                <div>
                  <div className="font-medium text-sm">Mint NFTs</div>
                  <div className="text-xs text-gray-500">Create new ApeBeats</div>
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
                <div>
                  <div className="font-medium text-sm">Batch Mint</div>
                  <div className="text-xs text-gray-500">Mint multiple NFTs</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/batch/transfer')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Layers className="w-4 h-4" />
                <div>
                  <div className="font-medium text-sm">Batch Transfer</div>
                  <div className="text-xs text-gray-500">Transfer multiple NFTs</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/batch/approve')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Layers className="w-4 h-4" />
                <div>
                  <div className="font-medium text-sm">Batch Approve</div>
                  <div className="text-xs text-gray-500">Approve multiple NFTs</div>
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
                <div>
                  <div className="font-medium text-sm">Stake NFTs</div>
                  <div className="text-xs text-gray-500">Deposit NFTs for rewards</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/stake/withdraw')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Coins className="w-4 h-4" />
                <div>
                  <div className="font-medium text-sm">Unstake NFTs</div>
                  <div className="text-xs text-gray-500">Withdraw staked NFTs</div>
                </div>
              </button>
              
              <button
                onClick={() => navigateTo('/stake/rewards')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Coins className="w-4 h-4" />
                <div>
                  <div className="font-medium text-sm">Claim Rewards</div>
                  <div className="text-xs text-gray-500">Claim staking rewards</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
