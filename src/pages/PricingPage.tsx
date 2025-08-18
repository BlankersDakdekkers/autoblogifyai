import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Rocket, Users, TrendingUp, Shield, Clock, ArrowRight } from "lucide-react";
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
      console.log('Starting checkout for tier:', tier);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout error details:', error);
        throw error;
      }
      
      if (!data?.url) {
        throw new Error('Geen checkout URL ontvangen');
      }

      console.log('Redirecting to Stripe:', data.url);
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Fout bij checkout",
        description: error instanceof Error ? error.message : "Er ging iets mis. Probeer het opnieuw.",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-6 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-4 py-2 text-sm font-semibold">
            <Star className="h-4 w-4 mr-2 fill-current" />
            🔥 BEPERKTE TIJD: 14 Dagen Gratis + 50% Korting
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Schaal je content met 
            <span className="bg-gradient-to-r from-primary via-purple-600 to-primary/80 bg-clip-text text-transparent block mt-2">
              AutoblogifyAI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Van handmatige blog posts naar geautomatiseerde content productie. <strong className="text-foreground">Start vandaag gratis</strong> en ervaar de kracht van AI.
          </p>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>2,500+ tevreden klanten</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>500% meer content output</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>30-dagen geld terug</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = subscription.subscription_tier?.toLowerCase() === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-primary shadow-lg shadow-primary/20 scale-105 bg-gradient-to-b from-background to-primary/5' 
                    : 'border hover:border-primary/50'
                } ${isCurrentPlan ? 'border-green-500 bg-green-50/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 text-sm font-bold shadow-lg">
                      🔥 MEEST POPULAIR
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white px-3 py-1 text-xs">
                      JE HUIDIGE PLAN
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mb-4">
                    <IconComponent className={`h-16 w-16 mx-auto ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                   
                  {/* Urgency Timer */}
                  <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-lg mt-4">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-semibold">Actie eindigt over 23u 45m</span>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-xl text-muted-foreground line-through">{plan.originalPrice}</span>
                      <span className="text-5xl font-bold text-primary">{plan.price}</span>
                    </div>
                    <span className="text-muted-foreground text-lg">{plan.period}</span>
                    <div className="mt-2">
                      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm px-3 py-1">
                        ✨ {plan.trialPeriod}
                      </Badge>
                    </div>
                    <p className="text-sm text-green-600 mt-2 font-medium">Automatische verlenging na trial</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    <Button 
                      className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl' 
                          : ''
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading || isCurrentPlan}
                    >
                      {isCurrentPlan ? (
                        <span className="flex items-center gap-2">
                          <Check className="h-5 w-5" />
                          Actief Plan
                        </span>
                      ) : isLoading && selectedPlan === plan.id ? (
                        "Laden..."
                      ) : (
                        <span className="flex items-center gap-2">
                          Start GRATIS Trial
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      💳 Geen creditcard vereist • ✨ Opzeggen wanneer je wilt
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-green-500" />
              <span className="font-semibold">SSL Beveiligd</span>
              <span className="text-sm text-muted-foreground">256-bit encryptie</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              <span className="font-semibold">2,500+ Klanten</span>
              <span className="text-sm text-muted-foreground">Vertrouwen ons</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <span className="font-semibold">500% Groei</span>
              <span className="text-sm text-muted-foreground">Meer output</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <span className="font-semibold">24/7 Support</span>
              <span className="text-sm text-muted-foreground">Altijd bereikbaar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;