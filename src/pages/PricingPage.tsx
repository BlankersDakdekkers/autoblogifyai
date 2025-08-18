import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CustomCheckout } from '@/components/CustomCheckout';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Loader2, Shield, Users, Zap, Star, Crown, Rocket, ArrowRight, CreditCard } from 'lucide-react';

// Subscription interface
interface Subscription {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const PricingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>({ subscribed: false });
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour countdown
  const [showCustomCheckout, setShowCustomCheckout] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
        description: "Log eerst in om een abonnement te kiezen.",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlan(tier);
    setShowCustomCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCustomCheckout(false);
    setSelectedPlan(null);
    checkSubscriptionStatus();
    toast({
      title: "🎉 Welkom bij AutoblogifyAI!",
      description: "Je abonnement is succesvol geactiveerd.",
    });
  };

  const handleCheckoutCancel = () => {
    setShowCustomCheckout(false);
    setSelectedPlan(null);
  };

  // Pricing plans data with all tiers available
  const plans = [
    {
      name: "Starter",
      price: "7.99",
      description: "Perfect voor kleine bedrijven en starters",
      features: [
        "Tot 10 blogposts per maand",
        "Basis AI content generatie",
        "Standard SEO optimalisatie",
        "Email ondersteuning",
        "1 website integratie"
      ],
      badge: null,
      popular: false,
      gradient: "from-blue-500/10 to-blue-600/10",
      borderColor: "border-blue-200",
      buttonVariant: "outline" as const,
      icon: Rocket
    },
    {
      name: "Professional", 
      price: "19.99",
      description: "Ideaal voor groeiende bedrijven en agencies",
      features: [
        "Onbeperkte blogposts",
        "Premium AI content generatie", 
        "Geavanceerde SEO optimalisatie",
        "Automatische publicatie",
        "5 website integraties",
        "Priority ondersteuning",
        "Content planning tools",
        "Analytics & rapportages"
      ],
      badge: "Populair",
      popular: true,
      gradient: "from-primary/10 to-primary/20",
      borderColor: "border-primary/30",
      buttonVariant: "default" as const,
      icon: Zap
    },
    {
      name: "Enterprise",
      price: "49.99", 
      description: "Voor grote organisaties met specifieke behoeften",
      features: [
        "Onbeperkte blogposts",
        "Enterprise AI content generatie",
        "Custom SEO strategieën", 
        "Multi-website beheer",
        "Onbeperkte integraties",
        "24/7 dedicated ondersteuning",
        "Custom templates & workflows",
        "White-label oplossing",
        "API toegang",
        "Custom trainingen"
      ],
      badge: "Enterprise",
      popular: false,
      gradient: "from-purple-500/10 to-purple-600/10", 
      borderColor: "border-purple-200",
      buttonVariant: "outline" as const,
      icon: Crown
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {showCustomCheckout && (
        <CustomCheckout
          tier={selectedPlan!}
          onSuccess={handleCheckoutSuccess}
          onCancel={handleCheckoutCancel}
        />
      )}

      {!showCustomCheckout && (
        <>
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
            <div className="container mx-auto px-4 pt-20 pb-16 text-center relative">
              {/* Countdown Timer */}
              {timeLeft > 0 && (
                <div className="mb-8 animate-fade-in">
                  <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-semibold">
                    <Clock className="w-4 h-4" />
                    Beperkte tijd: {Math.floor(timeLeft / 3600)}u {Math.floor((timeLeft % 3600) / 60)}m {timeLeft % 60}s
                  </div>
                </div>
              )}

              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Kies je perfecte plan
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in">
                Automatiseer je content creatie en laat AI je blogposts schrijven. 
                Van starter tot enterprise - er is altijd een plan dat bij jou past.
              </p>
              
              {/* Plan Toggle */}
              <div className="flex items-center justify-center gap-4 mb-12 animate-fade-in">
                <span className="text-sm text-muted-foreground">Maandelijks</span>
                <div className="relative">
                  <div className="w-12 h-6 bg-primary rounded-full"></div>
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
                <span className="text-sm font-semibold">Jaarlijks</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  2 maanden gratis
                </Badge>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="container mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan, index) => {
                const IconComponent = plan.icon;
                const isCurrentPlan = subscription?.subscribed && subscription?.subscription_tier?.toLowerCase() === plan.name.toLowerCase();
                
                return (
                  <div
                    key={plan.name}
                    className={`
                      relative group animate-fade-in hover-scale
                      ${plan.popular ? 'lg:scale-105 lg:-mt-4' : ''}
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Glow Effect for Popular Plan */}
                    {plan.popular && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60"></div>
                    )}
                    
                    <Card className={`
                      relative h-full bg-gradient-to-br ${plan.gradient} backdrop-blur-sm
                      ${plan.borderColor} border-2 transition-all duration-300
                      ${plan.popular ? 'shadow-2xl shadow-primary/20' : 'hover:shadow-xl'}
                      ${isCurrentPlan ? 'ring-2 ring-green-500 border-green-300' : ''}
                      group-hover:border-primary/50
                    `}>
                      {/* Popular Badge */}
                      {plan.badge && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className={`
                            px-4 py-1 text-sm font-semibold shadow-lg
                            ${plan.popular 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-purple-500 text-white'
                            }
                          `}>
                            {plan.badge}
                          </Badge>
                        </div>
                      )}

                      {/* Current Plan Badge */}
                      {isCurrentPlan && (
                        <div className="absolute -top-4 right-4">
                          <Badge className="bg-green-500 text-white px-3 py-1 text-xs">
                            Actief
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-4 pt-8">
                        <div className="mb-4">
                          <IconComponent className={`w-12 h-12 mx-auto ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                        <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                        
                        <div className="mb-4">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold">€{plan.price}</span>
                            <span className="text-muted-foreground">/maand</span>
                          </div>
                          {plan.popular && (
                            <p className="text-sm text-green-600 font-medium mt-2">
                              Meest gekozen door bedrijven
                            </p>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <ul className="space-y-3 mb-8">
                          {plan.features.map((feature, featureIndex) => (
                            <li 
                              key={featureIndex} 
                              className="flex items-start gap-3 animate-fade-in"
                              style={{ animationDelay: `${(index * 100) + (featureIndex * 50)}ms` }}
                            >
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => handleSubscribe(plan.name.toLowerCase())}
                          disabled={loading || isCurrentPlan}
                          variant={plan.buttonVariant}
                          className={`
                            w-full h-14 text-lg font-semibold transition-all duration-300
                            ${plan.popular 
                              ? 'shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40' 
                              : 'hover:bg-primary hover:text-primary-foreground'
                            }
                            ${isCurrentPlan ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                            ${loading ? 'opacity-50' : 'hover-scale'}
                          `}
                        >
                          {loading && selectedPlan === plan.name.toLowerCase() ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Laden...
                            </>
                          ) : isCurrentPlan ? (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Huidige plan
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              Start met {plan.name}
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>

                        {isCurrentPlan && subscription?.subscription_end && (
                          <p className="text-center text-sm text-muted-foreground mt-3">
                            Actief tot {new Date(subscription.subscription_end).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Trust Section */}
            <div className="text-center mt-20 animate-fade-in">
              <h3 className="text-2xl font-semibold mb-8">Waarom AutoblogifyAI?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">30 dagen geld-terug-garantie</h4>
                  <p className="text-sm text-muted-foreground">Niet tevreden? Krijg je geld terug, geen vragen gesteld.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Vertrouwd door 10,000+ bedrijven</h4>
                  <p className="text-sm text-muted-foreground">Van startups tot enterprise, wereldwijd gebruikt.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Altijd opzegbaar</h4>
                  <p className="text-sm text-muted-foreground">Geen verborgen kosten, stop wanneer je wilt.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-20 max-w-4xl mx-auto animate-fade-in">
              <h3 className="text-2xl font-semibold text-center mb-8">Veelgestelde vragen</h3>
              <div className="grid gap-4">
                <Card className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">Kan ik van plan wisselen?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Ja, je kunt altijd upgraden of downgraden. Wijzigingen gaan direct in en worden pro-rata verrekend.</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">Hoe werkt de AI content generatie?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Onze AI gebruikt de nieuwste taalmodellen om unieke, SEO-geoptimaliseerde content te genereren op basis van jouw onderwerpen en doelgroep.</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">Is er een setup fee?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Nee, er zijn geen setup kosten. Je betaalt alleen je maandelijkse abonnement en kunt direct starten.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PricingPage;