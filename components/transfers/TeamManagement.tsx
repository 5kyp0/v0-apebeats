"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"
import { useSafeGlyph } from "@/hooks/useSafeGlyph"
import { ClientOnly } from "@/components/ClientOnly"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Shield, 
  Settings, 
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"
import { useSimpleBatchTransferService } from "@/lib/simpleBatchService"
import { type WalletInfo } from "@/lib/walletTransactionService"
import { toast } from "sonner"

interface TeamMember {
  address: string
  role: 'admin' | 'team' | 'fee_manager'
  addedBy: string
  addedAt: number
}

function TeamManagementContent() {
  const account = useActiveAccount()
  const { address: wagmiAddress } = useAccount()
  const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated, sendTransaction: glyphSendTransaction } = useSafeGlyph()
  const batchService = useSimpleBatchTransferService()
  
  // Check for any wallet connection
  const isGlyphConnected = !!(glyphReady && glyphAuthenticated && glyphUser?.evmWallet)
  const hasWallet = !!(account?.address || wagmiAddress || isGlyphConnected)
  const currentAddress = account?.address || wagmiAddress || glyphUser?.evmWallet
  
  // Create wallet info object for transaction service
  const getWalletInfo = (): WalletInfo | null => {
    if (account) {
      return {
        type: 'thirdweb',
        account: account,
        address: account.address
      }
    } else if (glyphUser?.evmWallet && glyphReady && glyphAuthenticated) {
      return {
        type: 'glyph',
        address: glyphUser.evmWallet,
        signer: { 
          sendTransaction: glyphSendTransaction
        }
      }
    }
    return null
  }
  
  const walletInfo = getWalletInfo()

  // Debug logging
  console.log("🔍 TeamManagement wallet detection:", {
    accountAddress: account?.address,
    wagmiAddress,
    glyphReady,
    glyphAuthenticated,
    glyphUserEvmWallet: glyphUser?.evmWallet,
    currentAddress,
    hasWallet,
    walletInfo
  })
  
  const [newAddress, setNewAddress] = useState("")
  const [selectedRole, setSelectedRole] = useState<'team' | 'fee_manager'>('team')
  const [isLoading, setIsLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [feeBps, setFeeBps] = useState(50)
  const [newFeeBps, setNewFeeBps] = useState("")

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load current fee rate from contract
      try {
        const currentFeeBps = await batchService.getCurrentFeeBps()
        setFeeBps(currentFeeBps)
      } catch (error) {
        console.error("Error loading current fee BPS:", error)
      }
    }

    loadInitialData()

    // Mock team members data (in real implementation, this would come from contract events)
    const mockTeamMembers: TeamMember[] = [
      {
        address: "0x6481Ed1233f0d03B4d97364fE184B165FaC393e0", // Original deployer
        role: 'admin',
        addedBy: "0x0000000000000000000000000000000000000000",
        addedAt: 1700000000000 - 86400000
      },
      {
        address: "0x32cDaA9429365153Cf7BE048f42152945d99399d", // Current user
        role: 'admin',
        addedBy: "0x0000000000000000000000000000000000000000",
        addedAt: 1700000000000 - 86400000
      },
      {
        address: "0x2345678901234567890123456789012345678901",
        role: 'team',
        addedBy: "0x1234567890123456789012345678901234567890",
        addedAt: 1700000000000 - 172800000
      },
      {
        address: "0x3456789012345678901234567890123456789012",
        role: 'fee_manager',
        addedBy: "0x1234567890123456789012345678901234567890",
        addedAt: 1700000000000 - 259200000
      }
    ]
    setTeamMembers(mockTeamMembers)
  }, [])

  const addTeamMember = async () => {
    if (!newAddress || !walletInfo) {
      if (!walletInfo) {
        toast.error("Please connect a wallet (ThirdWeb or Glyph) to manage team members")
      } else {
        toast.error("Please enter a valid address")
      }
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
      toast.error("Please enter a valid Ethereum address")
      return
    }

    setIsLoading(true)
    try {
      // Call the real contract function
      const receipt = await batchService.grantTeamRole(walletInfo, newAddress)
      console.log("🔍 Team role granted with receipt:", receipt)
      
      const newMember: TeamMember = {
        address: newAddress,
        role: selectedRole,
        addedBy: currentAddress,
        addedAt: Date.now()
      }
      
      setTeamMembers([...teamMembers, newMember])
      setNewAddress("")
      toast.success(`${selectedRole === 'team' ? 'Team' : 'Fee Manager'} role granted successfully! Transaction: ${receipt.transactionHash.slice(0, 10)}...`)
    } catch (error) {
      console.error("Error adding team member:", error)
      toast.error(`Failed to add team member: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const removeTeamMember = async (address: string, role: 'team' | 'fee_manager') => {
    if (!walletInfo) {
      toast.error("Please connect a wallet (ThirdWeb or Glyph) to manage team members")
      return
    }

    setIsLoading(true)
    try {
      // Call the real contract function
      const receipt = await batchService.revokeTeamRole(walletInfo, address)
      console.log("🔍 Team role revoked with receipt:", receipt)
      
      setTeamMembers(teamMembers.filter(member => member.address !== address))
      toast.success(`${role === 'team' ? 'Team' : 'Fee Manager'} role revoked successfully! Transaction: ${receipt.transactionHash.slice(0, 10)}...`)
    } catch (error) {
      console.error("Error removing team member:", error)
      toast.error(`Failed to remove team member: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFeeBps = async () => {
    if (!newFeeBps || !walletInfo) {
      if (!walletInfo) {
        toast.error("Please connect a wallet (ThirdWeb or Glyph) to update fees")
      } else {
        toast.error("Please enter a valid fee rate")
      }
      return
    }

    const fee = parseInt(newFeeBps)
    if (isNaN(fee) || fee < 0 || fee > 1000) {
      toast.error("Fee must be between 0 and 1000 basis points (0-10%)")
      return
    }

    setIsLoading(true)
    try {
      // Call the real contract function
      const receipt = await batchService.setFeeBps(walletInfo, fee)
      console.log("🔍 Fee BPS updated with receipt:", receipt)
      
      // Refresh the fee rate from the contract to ensure accuracy
      const currentFeeBps = await batchService.getCurrentFeeBps()
      setFeeBps(currentFeeBps)
      setNewFeeBps("")
      toast.success(`Fee rate updated to ${currentFeeBps / 100}%! Transaction: ${receipt.transactionHash.slice(0, 10)}...`)
    } catch (error) {
      console.error("Error updating fee:", error)
      toast.error(`Failed to update fee rate: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>
      case 'team':
        return <Badge variant="default">Team</Badge>
      case 'fee_manager':
        return <Badge variant="secondary">Fee Manager</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isCurrentUser = (address: string) => {
    return address.toLowerCase() === currentAddress?.toLowerCase()
  }

  const canManageTeam = currentAddress && teamMembers.some(member => 
    member.address.toLowerCase() === currentAddress.toLowerCase() && (member.role === 'admin' || member.role === 'team')
  )

  const canManageFees = currentAddress && teamMembers.some(member => 
    member.address.toLowerCase() === currentAddress.toLowerCase() && (member.role === 'admin' || member.role === 'fee_manager')
  )
  
  // Debug permission check
  console.log("🔍 TeamManagement permission check:", {
    currentAddress,
    teamMembers: teamMembers.map(m => ({ address: m.address, role: m.role })),
    canManageTeam,
    canManageFees
  })

  if (!canManageTeam && !canManageFees) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Team Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>You don't have permission to manage team members or fees.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Fee Rate */}
      {canManageFees && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Fee Management
            </CardTitle>
            <CardDescription>
              Manage the fee rate for batch transfers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Fee Rate</Label>
              <div className="text-2xl font-bold text-primary">
                {feeBps / 100}%
              </div>
              <p className="text-sm text-muted-foreground">
                {feeBps} basis points
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="New fee rate (basis points)"
                value={newFeeBps}
                onChange={(e) => setNewFeeBps(e.target.value)}
                min="0"
                max="1000"
                className="flex-1"
              />
              <Button
                onClick={updateFeeBps}
                disabled={isLoading || !newFeeBps}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update Fee"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Team Member */}
      {canManageTeam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Team Member
            </CardTitle>
            <CardDescription>
              Grant team or fee manager roles to addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'team' | 'fee_manager')}
                className="w-full p-2 border rounded-md"
              >
                <option value="team">Team Member</option>
                <option value="fee_manager">Fee Manager</option>
              </select>
            </div>
            
            <Button
              onClick={addTeamMember}
              disabled={isLoading || !newAddress}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add {selectedRole === 'team' ? 'Team Member' : 'Fee Manager'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Current team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.address}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">
                      {formatAddress(member.address)}
                      {isCurrentUser(member.address) && (
                        <Badge variant="secondary" className="ml-2">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Added {new Date(member.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getRoleBadge(member.role)}
                  
                  {canManageTeam && member.role !== 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTeamMember(member.address, member.role as 'team' | 'fee_manager')}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function TeamManagement() {
  return (
    <ClientOnly fallback={
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <TeamManagementContent />
    </ClientOnly>
  )
}
