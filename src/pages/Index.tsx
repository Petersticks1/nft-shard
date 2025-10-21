import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Split, Lock, TrendingUp, Users, Zap, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: Split,
      title: "Fractionalize NFTs",
      description: "Split your NFTs into tradeable fractional tokens on Hedera",
    },
    {
      icon: Lock,
      title: "Secure Smart Contracts",
      description: "Your NFTs are safely locked in audited Hedera smart contracts",
    },
    {
      icon: TrendingUp,
      title: "Increase Liquidity",
      description: "Make high-value NFTs accessible to more collectors",
    },
    {
      icon: Users,
      title: "Community Ownership",
      description: "Enable shared ownership of premium digital assets",
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description: "Leverage Hedera's high-speed, low-cost network",
    },
    {
      icon: Shield,
      title: "Full Transparency",
      description: "All transactions recorded on-chain with complete visibility",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6 animate-float">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">Powered by Hedera Network</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Fractionalize</span>
              <br />
              Your NFTs
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Unlock liquidity and democratize ownership by splitting your NFTs into
              fractional tokens on the Hedera network
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="hero" className="text-lg px-8 animate-glow">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth?mode=signup">
                    <Button size="lg" variant="hero" className="text-lg px-8 animate-glow">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="lg" variant="glass" className="text-lg px-8">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">
              Why Fractionalize?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform how you own and trade NFTs with our powerful platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="glass border-white/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to fractionalize your NFTs
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Link your Hedera wallet to access your NFTs",
              },
              {
                step: "02",
                title: "Select & Lock",
                description: "Choose an NFT and lock it in our smart contract",
              },
              {
                step: "03",
                title: "Issue Fractions",
                description: "Mint fractional HTS tokens representing ownership",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass border-2 border-primary mb-4">
                  <span className="text-2xl font-bold gradient-text">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <Card className="glass border-primary/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20" />
            <CardContent className="relative z-10 p-12 text-center">
              <h2 className="text-4xl font-bold mb-4 gradient-text">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the future of NFT ownership and unlock new possibilities
              </p>
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="hero" className="text-lg px-8">
                    Open Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth?mode=signup">
                  <Button size="lg" variant="hero" className="text-lg px-8">
                    Create Free Account
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 FractioNFT. Built on Hedera Network.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
