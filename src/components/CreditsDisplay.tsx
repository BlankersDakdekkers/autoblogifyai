import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, Zap, Crown, RefreshCw, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionManager } from "@/hooks/useSubscriptionManager";

interface CreditsData {
  credits_remaining: number;
  total_credits_used: number;
}

interface SubscriptionInfo {
  subscription_tier?: string;
  subscribed: boolean;
  monthly_credit_limit?: number;
  next_reset?: string;
}

interface CreditsDisplayProps {
  compact?: boolean;
  showUpgradeButton?: boolean;
  className?: string;
}

export const CreditsDisplay = ({ compact = false, showUpgradeButton = true, className = "" }: CreditsDisplayProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkCreditStatus, refreshCredits, openCustomerPortal } = useSubscriptionManager();
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({ subscribed: false });
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const fetchCredits = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Use the new subscription manager for comprehensive data
      const status = await checkCreditStatus();
      if (status) {
        setCredits({
          credits_remaining: status.credits.remaining,
          total_credits_used: status.credits.used_this_period
        });
        setSubscription({
          subscription_tier: status.subscription.tier,
          subscribed: status.subscription.subscribed,
          monthly_credit_limit: status.subscription.monthly_limit,
          next_reset: status.subscription.next_reset
        });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      // Fallback to old method if new one fails
      try {
        const { data, error } = await supabase.functions.invoke('check-credits');
        if (error) throw error;
        setCredits(data);
      } catch (fallbackError) {
        toast({
          title: "⚠️ Fout bij ophalen credits",
          description: "Kon credits niet ophalen",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const handleRefreshCredits = async () => {
    const success = await refreshCredits();
    if (success) {
      fetchCredits(); // Refresh the display
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "❌ Fout bij upgrade",
        description: "Kon niet upgraden. Probeer het opnieuw.",
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

      window.location.href = data.url;
      setShowUpgradeModal(false);
    } catch (error) {
      console.error('Error buying credits:', error);
      toast({
        title: "❌ Fout bij credit aankoop",
        description: "Kon credits niet kopen. Probeer het opnieuw.",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card className={`transition-all ${compact ? 'w-auto' : 'w-full max-w-sm'} ${className}`}>
        <CardContent className={compact ? "p-2" : "p-4"}>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground animate-pulse" />
            <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Laden...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const creditsRemaining = credits?.credits_remaining || 0;
  const isLowCredits = creditsRemaining <= (subscription.monthly_credit_limit ? Math.floor(subscription.monthly_credit_limit * 0.1) : 1);
  const isOutOfCredits = creditsRemaining === 0;

  // Compact version for navigation/header
  if (compact) {
    return (
      <>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
          isLowCredits ? 'bg-orange-50 border border-orange-200' : 'bg-muted/50'
        } ${className}`} onClick={() => setShowUpgradeModal(true)}>
          <Coins className={`h-4 w-4 ${isLowCredits ? 'text-orange-600' : 'text-primary'}`} />
          <span className={`text-sm font-medium ${isLowCredits ? 'text-orange-700' : 'text-foreground'}`}>
            {creditsRemaining}
          </span>
          {subscription.subscribed && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {subscription.subscription_tier?.toUpperCase()}
            </Badge>
          )}
          {isOutOfCredits && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0">
              OP
            </Badge>
          )}
        </div>

        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-lg">
            {/* ... keep existing modal content */}
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Credits & Abonnement
              </DialogTitle>
              <DialogDescription>
                Je hebt {creditsRemaining} van {subscription.monthly_credit_limit || 5} credits over.
                {subscription.subscribed && subscription.subscription_tier && (
                  <span className="block mt-1 text-sm">
                    <Badge className="mr-2">{subscription.subscription_tier.toUpperCase()}</Badge>
                    {subscription.next_reset && `Reset op: ${new Date(subscription.next_reset).toLocaleDateString('nl-NL')}`}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRefreshCredits}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Ververs Credits
                </Button>
                
                {subscription.subscribed ? (
                  <Button 
                    variant="outline" 
                    onClick={openCustomerPortal}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Beheer Abonnement
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleUpgrade('professional')}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
              
              {!subscription.subscribed && (
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpgrade('starter')}
                    className="justify-between"
                  >
                    <span>Starter (500 credits/maand)</span>
                    <span className="font-bold">€147/maand</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpgrade('professional')}
                    className="justify-between border-primary bg-primary/5"
                  >
                    <span>Professional (1500 credits/maand)</span>
                    <span className="font-bold text-primary">€297/maand</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpgrade('enterprise')}
                    className="justify-between border-accent bg-accent/5"
                  >
                    <span>Enterprise (5000 credits/maand)</span>
                    <span className="font-bold text-accent">€597/maand</span>
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

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
                onClick={() => handleUpgrade('professional')}
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