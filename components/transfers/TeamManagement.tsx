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
import { useBatchTransferService } from "@/lib/batchTransferService"
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
  const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated } = useSafeGlyph()
  const batchService = useBatchTransferService()
  
  // Check for any wallet connection
  const isGlyphConnected = !!(glyphReady && glyphAuthenticated && glyphUser?.evmWallet)
  const hasWallet = !!(account?.address || wagmiAddress || isGlyphConnected)
  const currentAddress = account?.address || wagmiAddress || glyphUser?.evmWallet
  
  const [newAddress, setNewAddress] = useState("")
  const [selectedRole, setSelectedRole] = useState<'team' | 'fee_manager'>('team')
  const [isLoading, setIsLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [feeBps, setFeeBps] = useState(50)
  const [newFeeBps, setNewFeeBps] = useState("")

  // Mock team members data (in real implementation, this would come from contract events)
  useEffect(() => {
    const mockTeamMembers: TeamMember[] = [
      {
        address: "0x1234567890123456789012345678901234567890",
        role: 'admin',
        addedBy: "0x0000000000000000000000000000000000000000",
        addedAt: Date.now() - 86400000
      },
      {
        address: "0x2345678901234567890123456789012345678901",
        role: 'team',
        addedBy: "0x1234567890123456789012345678901234567890",
        addedAt: Date.now() - 172800000
      },
      {
        address: "0x3456789012345678901234567890123456789012",
        role: 'fee_manager',
        addedBy: "0x1234567890123456789012345678901234567890",
        addedAt: Date.now() - 259200000
      }
    ]
    setTeamMembers(mockTeamMembers)
  }, [])

  const addTeamMember = async () => {
    if (!newAddress || !account?.address) {
      toast.error("Please enter a valid address")
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
      toast.error("Please enter a valid Ethereum address")
      return
    }

    setIsLoading(true)
    try {
      // In a real implementation, you would call the contract function here
      // await batchService.grantTeamRole(newAddress)
      
      const newMember: TeamMember = {
        address: newAddress,
        role: selectedRole,
        addedBy: account.address,
        addedAt: Date.now()
      }
      
      setTeamMembers([...teamMembers, newMember])
      setNewAddress("")
      toast.success(`${selectedRole === 'team' ? 'Team' : 'Fee Manager'} role granted successfully`)
    } catch (error) {
      console.error("Error adding team member:", error)
      toast.error("Failed to add team member")
    } finally {
      setIsLoading(false)
    }
  }

  const removeTeamMember = async (address: string, role: 'team' | 'fee_manager') => {
    if (!account?.address) return

    setIsLoading(true)
    try {
      // In a real implementation, you would call the contract function here
      // await batchService.revokeTeamRole(address)
      
      setTeamMembers(teamMembers.filter(member => member.address !== address))
      toast.success(`${role === 'team' ? 'Team' : 'Fee Manager'} role revoked successfully`)
    } catch (error) {
      console.error("Error removing team member:", error)
      toast.error("Failed to remove team member")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFeeBps = async () => {
    if (!newFeeBps || !account?.address) {
      toast.error("Please enter a valid fee rate")
      return
    }

    const fee = parseInt(newFeeBps)
    if (isNaN(fee) || fee < 0 || fee > 1000) {
      toast.error("Fee must be between 0 and 1000 basis points (0-10%)")
      return
    }

    setIsLoading(true)
    try {
      // In a real implementation, you would call the contract function here
      // await batchService.setFeeBps(fee)
      
      setFeeBps(fee)
      setNewFeeBps("")
      toast.success(`Fee rate updated to ${fee / 100}%`)
    } catch (error) {
      console.error("Error updating fee:", error)
      toast.error("Failed to update fee rate")
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
    return address === account?.address
  }

  const canManageTeam = account?.address && teamMembers.some(member => 
    member.address === account.address && (member.role === 'admin' || member.role === 'team')
  )

  const canManageFees = account?.address && teamMembers.some(member => 
    member.address === account.address && (member.role === 'admin' || member.role === 'fee_manager')
  )

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
