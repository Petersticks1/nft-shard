import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, Download, KeyRound } from "lucide-react";
import { hashPackWallet, type WalletData } from "@/services/hashPackWallet";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WalletConnect = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [manualAccountId, setManualAccountId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Initialize wallet service
    hashPackWallet.initialize().catch((error) => {
      console.error("Failed to initialize HashPack:", error);
    });

    // Subscribe to wallet changes
    const unsubscribe = hashPackWallet.subscribe((data) => {
      setWalletData(data);
    });

    return () => unsubscribe();
  }, []);

  const handleConnectExtension = async () => {
    try {
      setConnecting(true);
      const data = await hashPackWallet.connect();
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${data.accountIds[0]}`,
      });
      setShowDialog(false);
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      
      // Check if HashPack is installed
      if (error.message?.includes("failed to load")) {
        toast({
          title: "HashPack Not Found",
          description: "Please install the HashPack wallet extension",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect wallet",
          variant: "destructive",
        });
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleManualConnect = () => {
    if (!manualAccountId.trim()) {
      toast({
        title: "Invalid Account ID",
        description: "Please enter a valid Hedera account ID",
        variant: "destructive",
      });
      return;
    }

    // Validate format (0.0.xxxxx)
    if (!/^0\.0\.\d+$/.test(manualAccountId.trim())) {
      toast({
        title: "Invalid Format",
        description: "Account ID must be in format: 0.0.xxxxx",
        variant: "destructive",
      });
      return;
    }

    // Create mock wallet data for manual entry
    const mockData: WalletData = {
      accountIds: [manualAccountId.trim()],
      network: "testnet",
      topic: "manual",
    };
    
    setWalletData(mockData);
    setShowDialog(false);
    setManualAccountId("");
    
    toast({
      title: "Account ID Added",
      description: `Viewing account ${manualAccountId.trim()}. Install HashPack to sign transactions.`,
    });
  };

  const handleDisconnect = () => {
    hashPackWallet.disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  if (walletData) {
    return (
      <Button
        variant="glass"
        onClick={handleDisconnect}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline font-mono text-xs">
          {walletData.accountIds[0].substring(0, 10)}...
        </span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="hero"
        onClick={() => setShowDialog(true)}
        disabled={connecting}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose how you want to connect your Hedera account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Connect via Extension */}
            <div className="space-y-2">
              <Button
                onClick={handleConnectExtension}
                disabled={connecting}
                className="w-full gap-2"
                variant="default"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Connect HashPack Extension
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Manual Account ID Entry */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="accountId">Enter Account ID Manually</Label>
                <Input
                  id="accountId"
                  placeholder="0.0.xxxxx"
                  value={manualAccountId}
                  onChange={(e) => setManualAccountId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleManualConnect();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  View-only mode. You'll need HashPack to sign transactions.
                </p>
              </div>
              <Button
                onClick={handleManualConnect}
                variant="outline"
                className="w-full gap-2"
              >
                <KeyRound className="h-4 w-4" />
                Use Manual Entry
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Don't have HashPack?
                </span>
              </div>
            </div>

            {/* Download HashPack */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.open("https://www.hashpack.app/download", "_blank")}
            >
              <Download className="h-4 w-4" />
              Download HashPack Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnect;
