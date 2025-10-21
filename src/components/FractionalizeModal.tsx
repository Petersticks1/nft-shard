import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type NFT = Database["public"]["Tables"]["nfts"]["Row"];

interface FractionalizeModalProps {
  nft: NFT;
  onClose: () => void;
  onSuccess: () => void;
}

const FractionalizeModal = ({ nft, onClose, onSuccess }: FractionalizeModalProps) => {
  const [fractions, setFractions] = useState(100);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFractionalize = async () => {
    if (fractions < 2 || fractions > 10000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter between 2 and 10,000 fractions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // In production, this would interact with Hedera smart contracts
      const mockFractionTokenId = `0.0.${Math.floor(Math.random() * 1000000)}`;

      // Update NFT to mark as fractionalized
      const { error: updateError } = await supabase
        .from("nfts")
        .update({
          is_fractionalized: true,
          total_fractions: fractions,
          fraction_token_id: mockFractionTokenId,
        })
        .eq("id", nft.id);

      if (updateError) throw updateError;

      // Create fractional token entry for the owner
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error: tokenError } = await supabase
        .from("fractional_tokens")
        .insert({
          nft_id: nft.id,
          holder_id: user.id,
          amount: fractions,
        });

      if (tokenError) throw tokenError;

      // Record transaction
      await supabase.from("transactions").insert({
        nft_id: nft.id,
        to_user_id: user.id,
        transaction_type: "fractionalization",
        amount: fractions,
        transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "completed",
      });

      toast({
        title: "Success!",
        description: `NFT fractionalized into ${fractions} tokens`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="glass border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">
            Fractionalize NFT
          </DialogTitle>
          <DialogDescription>
            Split your NFT into fractional tokens that can be traded
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nft-name">NFT Name</Label>
            <Input
              id="nft-name"
              value={nft.name}
              disabled
              className="glass border-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fractions">Number of Fractions</Label>
            <Input
              id="fractions"
              type="number"
              min={2}
              max={10000}
              value={fractions}
              onChange={(e) => setFractions(parseInt(e.target.value) || 0)}
              className="glass border-white/20"
              placeholder="Enter number of fractions (2-10,000)"
            />
            <p className="text-xs text-muted-foreground">
              Each fraction will represent {(100 / fractions).toFixed(4)}% ownership
            </p>
          </div>

          <div className="glass p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Summary</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Fractions:</span>
              <span className="font-mono text-primary">{fractions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Share:</span>
              <span className="font-mono text-accent">100%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="glass"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleFractionalize}
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Fractionalize"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FractionalizeModal;
