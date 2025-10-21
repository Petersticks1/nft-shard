import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Split } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type NFT = Database["public"]["Tables"]["nfts"]["Row"];

interface NFTCardProps {
  nft: NFT;
  onFractionalize: () => void;
}

const NFTCard = ({ nft, onFractionalize }: NFTCardProps) => {
  return (
    <Card className="glass border-white/20 overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={nft.image_url || "https://via.placeholder.com/400"}
            alt={nft.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {nft.is_fractionalized && (
            <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm">
              Fractionalized
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-2">{nft.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {nft.description || "No description available"}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Token ID</span>
          <span className="font-mono text-primary">{nft.token_id}</span>
        </div>
        {nft.is_fractionalized && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Fractions</span>
            <span className="font-bold text-accent">{nft.total_fractions}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={onFractionalize}
          variant={nft.is_fractionalized ? "glass" : "hero"}
          className="w-full"
          disabled={nft.is_fractionalized}
        >
          <Split className="mr-2 h-4 w-4" />
          {nft.is_fractionalized ? "Already Fractionalized" : "Fractionalize"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NFTCard;
