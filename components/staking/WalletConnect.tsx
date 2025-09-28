"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ExternalLink } from "lucide-react";

export function WalletConnect() {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>
          Connect your wallet to start staking NFTs and earning rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Wallet Not Connected</h3>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to access the staking dashboard
          </p>
          <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
