import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import NFTCard from "@/components/NFTCard";
import FractionalizeModal from "@/components/FractionalizeModal";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type NFT = Database["public"]["Tables"]["nfts"]["Row"];

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      fetchNFTs(session.user.id);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchNFTs(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchNFTs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("nfts")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNfts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch NFTs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNFT = async () => {
    // Mock NFT creation - in production, this would connect to Hedera
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const mockNFT = {
        owner_id: user.id,
        token_id: `0.0.${Math.floor(Math.random() * 1000000)}`,
        name: `NFT #${Math.floor(Math.random() * 1000)}`,
        description: "This is a sample NFT for demonstration",
        image_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${Math.random()}`,
        network: "hedera-testnet",
      };

      const { error } = await supabase.from("nfts").insert(mockNFT);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "NFT added successfully",
      });

      fetchNFTs(user.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">My NFTs</h1>
            <p className="text-muted-foreground">
              Manage and fractionalize your NFT collection
            </p>
          </div>
          <Button onClick={handleAddNFT} variant="hero" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add NFT
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-20">
            <Wallet className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No NFTs Yet</h2>
            <p className="text-muted-foreground mb-6">
              Add your first NFT to get started with fractionalization
            </p>
            <Button onClick={handleAddNFT} variant="hero">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First NFT
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onFractionalize={() => setSelectedNFT(nft)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedNFT && (
        <FractionalizeModal
          nft={selectedNFT}
          onClose={() => setSelectedNFT(null)}
          onSuccess={() => {
            setSelectedNFT(null);
            if (user) fetchNFTs(user.id);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
