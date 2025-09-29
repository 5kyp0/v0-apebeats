"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Menu, 
  Music, 
  Users, 
  Home, 
  ChevronDown,
  ExternalLink,
  Sparkles,
  Layers,
  Coins,
  ChevronRight,
  Send,
  BarChart3
} from "lucide-react"
import { useRouter } from "next/navigation"

interface MenuDropdownProps {
  className?: string
}

export default function MenuDropdown({ className = "" }: MenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  const handleNavigation = (href: string) => {
    console.log('Navigating to:', href) // Debug log
    setIsOpen(false)
    
    // Use router.push for client-side navigation
    router.push(href)
  }

  const menuItems = [
    {
      icon: <Home className="w-4 h-4" />,
      label: "Home",
      description: "Back to main page",
      href: "/"
    },
    {
      icon: <Music className="w-4 h-4" />,
      label: "Music Engine",
      description: "24/7 generative music",
      href: "/music"
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "Snapshot Tool",
      description: "Token holder snapshots",
      href: "/snapshot"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: "Mint NFTs",
      description: "Create new ApeBeats",
      href: "/mint"
    },
    {
      icon: <Layers className="w-4 h-4" />,
      label: "Batch Operations",
      description: "Bulk NFT operations",
      href: "/batch",
      subsections: [
        {
          label: "Batch Transfer",
          description: "Send APE to multiple addresses",
          href: "/transfers"
        },
        {
          label: "Dashboard",
          description: "View your batch history",
          href: "/dashboard"
        }
      ]
    },
    {
      icon: <Coins className="w-4 h-4" />,
      label: "Staking",
      description: "Stake your NFTs",
      href: "/stake",
      subsections: [
        {
          label: "Dashboard",
          description: "View your staking portfolio",
          href: "/stake/dashboard"
        }
      ]
    }
  ]

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          console.log('Menu button clicked, isOpen:', isOpen) // Debug log
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border-primary/30 hover:border-primary/50"
      >
        <Menu className="w-4 h-4" />
        <span className="hidden sm:inline">Menu</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-[9999] bg-card/95 backdrop-blur-md border-primary/30 shadow-xl">
          <div className="p-2">
            <div className="px-3 py-2 border-b border-border/50 mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Navigate</h3>
            </div>
            
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <div key={index}>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Menu item clicked:', item.label, item.href)
                      handleNavigation(item.href)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors text-left group cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/30 transition-colors">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                    </div>
                    {item.subsections ? (
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                  
                  {/* Render subsections if they exist */}
                  {item.subsections && (
                    <div className="ml-4 space-y-1 border-l border-border/30 pl-3">
                      {item.subsections.map((subsection, subIndex) => {
                        // Get the appropriate icon for each subsection
                        const getSubsectionIcon = (label: string) => {
                          switch (label) {
                            case "Batch Transfer":
                              return <Send className="w-3 h-3" />
                            case "Dashboard":
                              return <BarChart3 className="w-3 h-3" />
                            default:
                              return <Layers className="w-3 h-3" />
                          }
                        }
                        
                        return (
                          <button
                            key={subIndex}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log('Subsection clicked:', subsection.label, subsection.href)
                              handleNavigation(subsection.href)
                            }}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors text-left group cursor-pointer"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                              {getSubsectionIcon(subsection.label)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs">{subsection.label}</div>
                              <div className="text-xs text-muted-foreground truncate">{subsection.description}</div>
                            </div>
                            <ExternalLink className="w-2 h-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-border/50">
              <div className="px-3 py-2">
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium">ApeBeats Ecosystem</div>
                  <div>Music • NFTs • Tools</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
