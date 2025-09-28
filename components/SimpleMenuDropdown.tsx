"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
  Music, 
  Users, 
  Home, 
  ChevronDown
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
