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
          priceId: 'price_premium', // This should be your actual Stripe price ID
          returnUrl: window.location.origin 
        }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade naar Premium
            </DialogTitle>
            <DialogDescription>
              Je hebt {creditsRemaining} credits over. Upgrade naar Premium voor onbeperkte credits en toegang tot alle functies.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">Premium Voordelen</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Onbeperkte AI blog generatie</li>
                <li>• Onbeperkte CSV processing</li>
                <li>• Priority support</li>
                <li>• Advanced SEO functies</li>
                <li>• Hero image generatie</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button 
                onClick={handleUpgrade}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Nu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};