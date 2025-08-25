import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Star, Zap, Crown, Rocket, Users, TrendingUp, Shield, Clock, ArrowRight, Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionManager } from "@/hooks/useSubscriptionManager";

interface Subscription {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const PricingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { openCustomerPortal } = useSubscriptionManager();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>({ subscribed: false });
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [checkoutProgress, setCheckoutProgress] = useState(0);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.warn('Subscription check failed:', error);
        return; // Silently continue without subscription data
      }
      setSubscription(data);
    } catch (error) {
      console.warn('Subscription check error:', error);
      // Don't throw error, just continue without subscription data
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      toast({
        title: "🔐 Inloggen vereist",
        description: "Log eerst in om je gratis trial te starten.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSelectedPlan(tier);
    setCheckoutProgress(0);
    
    try {
      // Progress animation
      const progressInterval = setInterval(() => {
        setCheckoutProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 150);

      console.log('Starting checkout for tier:', tier);
      
      toast({
        title: "🚀 Checkout wordt voorbereid...",
        description: "Moment geduld, we maken je Stripe sessie klaar.",
      });

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

      setCheckoutProgress(100);
      
      toast({
        title: "✅ Checkout klaar!",
        description: "Je wordt doorgestuurd naar Stripe...",
      });

      console.log('Redirecting to Stripe:', data.url);
      
      // Open in same tab for better conversion
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "❌ Fout bij checkout",
        description: error instanceof Error ? error.message : "Er ging iets mis. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
      setCheckoutProgress(0);
    }
  };

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "€147",
      period: "/maand",
      originalPrice: "€297",
      trialPeriod: "5 dagen GRATIS",
      description: "Perfect voor kleine bedrijven",
      icon: Rocket,
      popular: false,
      savings: "50% BESPARING",
      credits: "500 credits/maand",
      features: [
        "✨ 5 dagen gratis trial",
        "🪙 500 credits per maand (~100 AI blogposts)",
        "📝 Tot 100 AI blogposts per maand",
        "🎨 10 premium templates",
        "🔍 Basis SEO optimalisatie", 
        "📧 Email ondersteuning",
        "🔄 Automatische verlenging na trial",
        "💳 Geen setup kosten",
        "📊 Basic analytics dashboard"
      ]
    },
    {
      id: "professional", 
      name: "Professional",
      price: "€297",
      period: "/maand",
      originalPrice: "€597",
      trialPeriod: "5 dagen GRATIS",
      description: "Voor groeiende bedrijven",
      icon: Zap,
      popular: true,
      savings: "50% BESPARING",
      credits: "1500 credits/maand",
      features: [
        "✨ 5 dagen gratis trial",
        "🪙 1500 credits per maand (~300 AI blogposts)",
        "🚀 Onbeperkte AI blogposts (binnen credits)",
        "🎨 25+ premium templates",
        "🎯 Geavanceerde lokale SEO",
        "⚡ Priority support (24/7)",
        "🔗 Alle integraties",
        "🔄 Automatische verlenging na trial",
        "📊 Geavanceerde analytics",
        "🧠 GPT-4 & Claude toegang",
        "💰 ROI tracking & rapportage"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise", 
      price: "€597",
      period: "/maand",
      originalPrice: "€1197",
      trialPeriod: "5 dagen GRATIS",
      description: "Voor grote organisaties",
      icon: Crown,
      popular: false,
      savings: "50% BESPARING",
      credits: "5000 credits/maand",
      features: [
        "✨ 5 dagen gratis trial",
        "🪙 5000 credits per maand (~1000 AI blogposts)",
        "💎 Alles van Professional",
        "🧠 GPT-4o/Claude Opus toegang - Meest geavanceerde AI modellen",
        "🎭 Custom AI personas - Train je eigen schrijfstijl en merkvoice", 
        "🌍 Meertalige content generatie - Automatisch vertalen naar 25+ talen",
        "📊 AI-gedreven keyword research - Geavanceerde SEO suggesties",
        "🏷️ White-label oplossing",
        "👨‍💼 Dedicated account manager",
        "🔌 API toegang & webhooks",
        "🛡️ Enterprise security & compliance",
        "🚀 Custom integrations & API limits"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl translate-x-96 translate-y-60 pointer-events-none animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary/10 to-primary/5 rounded-full blur-3xl -translate-x-96 -translate-y-60 pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-accent/5 to-primary/5 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-8 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-8 py-4 text-base font-bold animate-pulse shadow-xl hover:shadow-2xl transition-all duration-300">
              <Star className="h-6 w-6 mr-3 fill-current animate-spin" />
              🚨 BEPERKTE TIJD: 5 Dagen Gratis + 67% Korting
            </Badge>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
            Schaal je content met 
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent block mt-4 animate-scale-in drop-shadow-lg">
              AutoblogifyAI
            </span>
          </h1>
          <p className="text-xl md:text-3xl text-muted-foreground max-w-5xl mx-auto mb-12 leading-relaxed">
            Van handmatige blog posts naar geautomatiseerde content productie. 
            <strong className="text-foreground bg-gradient-to-r from-primary/20 to-accent/20 px-3 py-2 rounded-lg mx-2 border border-primary/20">
              Start vandaag gratis
            </strong> 
            en ervaar de kracht van AI.
          </p>
          
          {/* Enhanced Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-3 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/20 hover:border-primary/40 group">
              <Users className="h-6 w-6 text-primary group-hover:animate-pulse" />
              <span className="font-bold text-lg group-hover:text-primary transition-colors">2,500+ tevreden klanten</span>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-accent/20 hover:border-accent/40 group">
              <TrendingUp className="h-6 w-6 text-accent group-hover:animate-pulse" />
              <span className="font-bold text-lg group-hover:text-accent transition-colors">500% meer content output</span>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-secondary/20 hover:border-secondary/40 group">
              <Shield className="h-6 w-6 text-secondary group-hover:animate-pulse" />
              <span className="font-bold text-lg group-hover:text-secondary transition-colors">30-dagen geld terug</span>
            </div>
          </div>
        </div>

        {/* Subscription Management for existing customers */}
        {subscription.subscribed && (
          <div className="max-w-2xl mx-auto mb-16 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-lg">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 text-green-800">✅ Je hebt een actief abonnement!</h3>
              <p className="text-green-700 mb-6">
                <strong>{subscription.subscription_tier?.toUpperCase()}</strong> plan 
                {subscription.subscription_end && ` • Verloopt op ${new Date(subscription.subscription_end).toLocaleDateString('nl-NL')}`}
              </p>
              <Button 
                onClick={openCustomerPortal}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-bold"
                disabled={isLoading}
              >
                🔧 Beheer je Abonnement
              </Button>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = subscription.subscription_tier?.toLowerCase() === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 animate-fade-in group ${
                  plan.popular 
                    ? 'border-primary shadow-xl shadow-primary/20 scale-105 bg-gradient-to-b from-background to-primary/5 ring-2 ring-primary/20' 
                    : 'border hover:border-primary/50 hover:shadow-lg'
                } ${isCurrentPlan ? 'border-green-500 bg-green-50/50 shadow-green-100' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-2 text-sm font-bold shadow-xl animate-pulse">
                      <Star className="h-4 w-4 mr-2 fill-current" />
                      🔥 MEEST POPULAIR
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4 z-10">
                    <Badge className="bg-green-500 text-white px-3 py-1 text-xs shadow-lg animate-bounce">
                      ✅ JE HUIDIGE PLAN
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6 relative">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`h-20 w-20 mx-auto ${plan.popular ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                  </div>
                   <CardTitle className="text-3xl mb-2">{plan.name}</CardTitle>
                   <CardDescription className="text-lg font-medium">{plan.description}</CardDescription>
                   
                   {/* Credits Display */}
                   <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg mt-4 border border-primary/20">
                     <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg">
                       <CreditCard className="h-5 w-5" />
                       {(plan as any).credits}
                     </div>
                     <p className="text-xs text-muted-foreground text-center mt-1">
                       Credits worden maandelijks ververst
                     </p>
                   </div>
                   
                  {/* Urgency Timer */}
                  <div className="flex items-center justify-center gap-2 text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl mt-6 border border-orange-200 shadow-sm animate-pulse">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-bold">
                      ⏰ Actie eindigt over {String(timeLeft.hours).padStart(2, '0')}:
                      {String(timeLeft.minutes).padStart(2, '0')}:
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                  
                  <div className="mt-8">
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <span className="text-2xl text-muted-foreground line-through">{plan.originalPrice}</span>
                      <span className="text-6xl font-bold text-primary animate-scale-in">{plan.price}</span>
                    </div>
                    <span className="text-muted-foreground text-xl">{plan.period}</span>
                    <div className="mt-4 space-y-2">
                      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-base px-4 py-2 shadow-sm">
                        ✨ {plan.trialPeriod}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 text-sm px-3 py-1 animate-bounce">
                        🔥 {plan.savings}
                      </Badge>
                    </div>
                    <p className="text-sm text-green-600 mt-3 font-semibold">🎯 Automatische verlenging na trial</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8 p-8">
                  <ul className="space-y-5">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-4 group">
                        <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-base font-medium leading-relaxed group-hover:text-primary transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-6">
                    {/* Progress Bar for Loading */}
                    {isLoading && selectedPlan === plan.id && (
                      <div className="space-y-3 bg-gradient-to-r from-primary/5 to-purple-600/5 p-4 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span className="text-primary">🚀 Checkout voorbereiden...</span>
                          <span className="text-primary font-bold">{checkoutProgress}%</span>
                        </div>
                        <Progress value={checkoutProgress} className="h-3 bg-white" />
                        <p className="text-xs text-center text-muted-foreground animate-pulse">
                          Secure betaling via Stripe wordt geladen...
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      className={`w-full h-16 text-xl font-bold transition-all duration-500 transform hover:scale-105 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-primary via-purple-600 to-primary hover:from-primary/90 hover:via-purple-600/90 hover:to-primary/90 shadow-xl hover:shadow-2xl animate-pulse' 
                          : 'hover:scale-105 shadow-lg hover:shadow-xl'
                      } ${isCurrentPlan ? 'bg-green-500 hover:bg-green-600' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading || isCurrentPlan}
                    >
                      {isCurrentPlan ? (
                        <span className="flex items-center gap-3">
                          <CheckCircle2 className="h-6 w-6" />
                          Actief Plan
                        </span>
                      ) : isLoading && selectedPlan === plan.id ? (
                        <span className="flex items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Bezig met laden...
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6" />
                          Start GRATIS Trial Nu
                          <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                    
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200/50">
                        💳 <strong>Geen creditcard vereist</strong> • ✨ <strong>Opzeggen wanneer je wilt</strong>
                      </p>
                      <p className="text-sm text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-200">
                        🛡️ 30 dagen geld-terug-garantie • 🔒 SSL beveiligd
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="text-center animate-fade-in">
          <h3 className="text-2xl font-bold mb-8 text-foreground">Waarom kiezen voor AutoblogifyAI?</h3>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center gap-4 p-6 bg-white/60 rounded-xl shadow-lg hover-scale border border-green-200/50">
              <Shield className="h-12 w-12 text-green-500" />
              <span className="font-bold text-lg">SSL Beveiligd</span>
              <span className="text-sm text-muted-foreground text-center">Enterprise-grade 256-bit encryptie voor maximale veiligheid</span>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 bg-white/60 rounded-xl shadow-lg hover-scale border border-blue-200/50">
              <Users className="h-12 w-12 text-blue-500" />
              <span className="font-bold text-lg">2,500+ Klanten</span>
              <span className="text-sm text-muted-foreground text-center">Succesvolle bedrijven vertrouwen ons dagelijks</span>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 bg-white/60 rounded-xl shadow-lg hover-scale border border-purple-200/50">
              <TrendingUp className="h-12 w-12 text-purple-500" />
              <span className="font-bold text-lg">500% Groei</span>
              <span className="text-sm text-muted-foreground text-center">Gemiddelde toename in content productie</span>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 bg-white/60 rounded-xl shadow-lg hover-scale border border-orange-200/50">
              <Clock className="h-12 w-12 text-orange-500" />
              <span className="font-bold text-lg">24/7 Support</span>
              <span className="text-sm text-muted-foreground text-center">Persoonlijke hulp wanneer je het nodig hebt</span>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="mt-16 max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-2xl border border-primary/20 shadow-xl">
            <h4 className="text-3xl font-bold mb-4 text-foreground">Start je gratis trial vandaag!</h4>
            <p className="text-lg text-muted-foreground mb-6">Geen risico, geen verplichtingen. Ervaar de kracht van AI-gestuurde content.</p>
            <div className="flex items-center justify-center gap-4 text-sm text-green-600 font-semibold">
              <span>✅ 5 dagen gratis</span>
              <span>✅ Geen creditcard</span>
              <span>✅ Direct opzegbaar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;