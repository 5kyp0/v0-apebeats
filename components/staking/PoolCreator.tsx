"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Factory, 
  Plus, 
  Minus, 
  Info,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { feeStructure } from "@/lib/thirdweb";

interface PoolCreatorProps {
  onCreatePool: (name: string, collection: string, apy: number, rewardToken: string) => void;
  isLoading?: boolean;
}

export function PoolCreator({ onCreatePool, isLoading = false }: PoolCreatorProps) {
  const [formData, setFormData] = useState({
    name: "",
    collection: "",
    apy: 10,
    rewardToken: "APE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Pool name is required";
    }

    if (!formData.collection.trim()) {
      newErrors.collection = "Collection address is required";
    } else if (!formData.collection.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors.collection = "Invalid Ethereum address";
    }

    if (formData.apy < 1 || formData.apy > 100) {
      newErrors.apy = "APY must be between 1% and 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCreatePool(formData.name, formData.collection, formData.apy, formData.rewardToken);
    }
  };

  const adjustAPY = (delta: number) => {
    const newAPY = Math.max(1, Math.min(100, formData.apy + delta));
    handleInputChange("apy", newAPY);
  };

  return (
    <Card className="border-2 border-dashed border-muted-foreground/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="w-6 h-6 text-chart-3" />
          Deploy Reward Pool
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a permissionless reward pool for any NFT collection with custom APY rates
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pool Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Pool Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., My Awesome Pool"
              className={`w-full p-3 border rounded-lg bg-background ${
                errors.name ? "border-red-500" : "border-border"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Collection Address */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Collection Address
            </label>
            <input
              type="text"
              value={formData.collection}
              onChange={(e) => handleInputChange("collection", e.target.value)}
              placeholder="0x..."
              className={`w-full p-3 border rounded-lg bg-background ${
                errors.collection ? "border-red-500" : "border-border"
              }`}
            />
            {errors.collection && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.collection}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              The contract address of the NFT collection
            </p>
          </div>

          {/* APY Rate */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              APY Rate (%)
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0"
                onClick={() => adjustAPY(-1)}
                disabled={formData.apy <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <input
                type="number"
                value={formData.apy}
                onChange={(e) => handleInputChange("apy", parseFloat(e.target.value) || 0)}
                min="1"
                max="100"
                step="0.1"
                className={`flex-1 p-3 border rounded-lg bg-background text-center ${
                  errors.apy ? "border-red-500" : "border-border"
                }`}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0"
                onClick={() => adjustAPY(1)}
                disabled={formData.apy >= 100}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {errors.apy && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.apy}
              </p>
            )}
          </div>

          {/* Reward Token */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Reward Token
            </label>
            <select
              value={formData.rewardToken}
              onChange={(e) => handleInputChange("rewardToken", e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background"
            >
              <option value="APE">APE Token</option>
              <option value="CUSTOM">Custom ERC-20</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              The token used for rewards (APE recommended for better adoption)
            </p>
          </div>

          {/* Fee Structure Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Fee Structure</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>• Treasury</span>
                <span>{feeStructure.treasury}%</span>
              </div>
              <div className="flex justify-between">
                <span>• ApeBeats holders</span>
                <span>{feeStructure.apebeats}%</span>
              </div>
              <div className="flex justify-between">
                <span>• Stakers</span>
                <span>{feeStructure.stakers}%</span>
              </div>
            </div>
          </div>

          {/* Pool Preview */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Pool Preview
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-medium">{formData.name || "Unnamed Pool"}</span>
              </div>
              <div className="flex justify-between">
                <span>APY:</span>
                <span className="font-medium text-primary">{formData.apy}%</span>
              </div>
              <div className="flex justify-between">
                <span>Reward Token:</span>
                <span className="font-medium">{formData.rewardToken}</span>
              </div>
              <div className="flex justify-between">
                <span>Collection:</span>
                <span className="font-medium font-mono text-xs">
                  {formData.collection ? `${formData.collection.slice(0, 6)}...${formData.collection.slice(-4)}` : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Deploying Pool...
              </>
            ) : (
              <>
                <Factory className="w-4 h-4 mr-2" />
                Deploy Pool
              </>
            )}
          </Button>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground text-center">
            <p>
              By deploying a pool, you agree to the fee structure and understand that 
              gas fees will be required for deployment.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
