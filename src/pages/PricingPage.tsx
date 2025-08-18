import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Rocket, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const PricingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>({ subscribed: false });

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Subscription check error:', error);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      toast({
        title: "Inloggen vereist",
        description: "Log eerst in om een abonnement af te sluiten.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSelectedPlan(tier);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) throw error;
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Fout bij checkout",
        description: "Er ging iets mis. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "€49",
      period: "/maand",
      originalPrice: "€99",
      trialPeriod: "14 dagen GRATIS",
      description: "Perfect voor kleine bedrijven",
      icon: Rocket,
      popular: false,
      features: [
        "14 dagen gratis trial",
        "Tot 50 AI blogposts per maand",
        "5 premium templates",
        "Basis SEO optimalisatie", 
        "Email ondersteuning",
        "Automatische verlenging na trial"
      ]
    },
    {
      id: "professional", 
      name: "Professional",
      price: "€99",
      period: "/maand",
      originalPrice: "€199",
      trialPeriod: "14 dagen GRATIS",
      description: "Voor groeiende bedrijven",
      icon: Zap,
      popular: true,
      features: [
        "14 dagen gratis trial",
        "Onbeperkte AI blogposts",
        "15+ premium templates",
        "Geavanceerde lokale SEO",
        "Priority support",
        "Alle integraties",
        "Automatische verlenging na trial"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise", 
      price: "€199",
      period: "/maand",
      originalPrice: "€399",
      trialPeriod: "14 dagen GRATIS",
      description: "Voor grote organisaties",
      icon: Crown,
      popular: false,
      features: [
        "14 dagen gratis trial",
        "Alles van Professional",
        "White-label oplossing",
        "Dedicated account manager",
        "Custom AI training",
        "API toegang",
        "Automatische verlenging na trial"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
            <Star className="h-4 w-4 mr-2" />
            14 Dagen Gratis Trial - Automatische Verlenging
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Premium <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">AutoblogifyAI</span> Abonnementen
          </h1>
          <p className="text-xl text-muted-foreground">
            Start vandaag gratis en ervaar professionele AI content generatie
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Populairste
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <IconComponent className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  {/* Trial Badge */}
                  <Badge className="bg-green-100 text-green-800 mb-2">
                    {plan.trialPeriod}
                  </Badge>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl text-muted-foreground line-through">{plan.originalPrice}</span>
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    </div>
                    <span className="text-muted-foreground">{plan.period}</span>
                    <p className="text-xs text-green-600 mt-1 font-medium">Na gratis trial</p>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                  >
                    {isLoading && selectedPlan === plan.id ? "Verwerken..." : "Start 14 dagen GRATIS"}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Geen creditcard vereist • Automatische verlenging
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;