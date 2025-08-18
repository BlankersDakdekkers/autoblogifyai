import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, Zap, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreditsData {
  credits_remaining: number;
  total_credits_used: number;
}

export const CreditsDisplay = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const fetchCredits = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-credits');
      
      if (error) throw error;
      
      setCredits(data);
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast({
        title: "Fout bij ophalen credits",
        description: "Kon credits niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: 'price_premium',
          returnUrl: window.location.origin 
        }
      });

      if (error) throw error;

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Fout bij upgrade",
        description: "Kon niet upgraden naar premium",
        variant: "destructive"
      });
    }
  };

  const handleBuyCredits = async (creditPackage: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('buy-credits', {
        body: { creditPackage }
      });

      if (error) throw error;

      window.open(data.url, '_blank');
      setShowUpgradeModal(false);
    } catch (error) {
      console.error('Error buying credits:', error);
      toast({
        title: "Fout bij aankoop",
        description: "Kon credits niet kopen",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Laden...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const creditsRemaining = credits?.credits_remaining || 0;
  const isLowCredits = creditsRemaining <= 1;
  const isOutOfCredits = creditsRemaining === 0;

  return (
    <>
      <Card className={`w-full max-w-sm transition-colors ${isLowCredits ? 'border-orange-200 bg-orange-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isLowCredits ? 'bg-orange-100' : 'bg-blue-100'}`}>
                <Coins className={`h-4 w-4 ${isLowCredits ? 'text-orange-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Credits</span>
                  {isOutOfCredits && (
                    <Badge variant="destructive" className="text-xs">
                      Op
                    </Badge>
                  )}
                  {isLowCredits && !isOutOfCredits && (
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                      Laag
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${isLowCredits ? 'text-orange-600' : 'text-foreground'}`}>
                    {creditsRemaining}
                  </span>
                  <span className="text-xs text-muted-foreground">resterend</span>
                </div>
              </div>
            </div>
            
            {isLowCredits && (
              <Button 
                size="sm" 
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
          
          {credits?.total_credits_used > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-muted-foreground">
                Gebruikt: {credits.total_credits_used} credits
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Credits Bijkopen of Premium Upgrade
            </DialogTitle>
            <DialogDescription>
              Je hebt {creditsRemaining} credits over. Kies een optie om door te gaan met bloggen.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Credit Packages */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">💰 Credits Pakket (Eenmalig)</h4>
              <div className="grid gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleBuyCredits(50)}
                  className="justify-between p-4 h-auto"
                >
                  <div className="text-left">
                    <div className="font-medium">50 Credits</div>
                    <div className="text-sm text-muted-foreground">€30.00 (€0.60 per credit)</div>
                  </div>
                  <Coins className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleBuyCredits(100)}
                  className="justify-between p-4 h-auto border-green-200 bg-green-50"
                >
                  <div className="text-left">
                    <div className="font-medium">100 Credits</div>
                    <div className="text-sm text-muted-foreground">€55.00 (€0.55 per credit) <span className="text-green-600 font-medium">Populair!</span></div>
                  </div>
                  <Coins className="h-4 w-4 text-green-600" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleBuyCredits(250)}
                  className="justify-between p-4 h-auto border-purple-200 bg-purple-50"
                >
                  <div className="text-left">
                    <div className="font-medium">250 Credits</div>
                    <div className="text-sm text-muted-foreground">€125.00 (€0.50 per credit) <span className="text-purple-600 font-medium">Beste deal!</span></div>
                  </div>
                  <Coins className="h-4 w-4 text-purple-600" />
                </Button>
              </div>
            </div>

            {/* Premium Option */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">Premium Abonnement</span>
                <Badge className="bg-blue-100 text-blue-800">Beste waarde</Badge>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground mb-3">
                <li>• <strong>Onbeperkte</strong> AI blog generatie</li>
                <li>• Onbeperkte CSV processing</li>
                <li>• Priority support & nieuwe functies</li>
                <li>• Advanced SEO + neuromarketing</li>
                <li>• Hero image generatie</li>
              </ul>
              <Button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade naar Premium
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1"
              >
                Annuleren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};