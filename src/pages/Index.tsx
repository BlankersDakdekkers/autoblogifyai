import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, Star, Zap, TrendingUp, Users, CheckCircle, Globe, Rocket, Brain, Target, Clock, Award, 
  ChevronRight, Play, Sparkles, FileText, Crown, Shield, CheckCircle2, CreditCard, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>({ subscribed: false });
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [checkoutProgress, setCheckoutProgress] = useState(0);

  const testimonials = [
    {
      name: "Sarah van der Berg",
      company: "DigitalBoost Marketing",
      role: "Marketing Director",
      content: "AutoblogifyAI heeft ons 40 uur per week bespaard. We genereren nu 200+ SEO blogposts per maand die echt converteren!",
      rating: 5,
      result: "300% meer organisch verkeer"
    },
    {
      name: "Michael Jansen",
      company: "TechStart Solutions",
      role: "CEO",
      content: "Van 0 naar 50.000 bezoekers per maand in 6 maanden tijd. De AI content is van betere kwaliteit dan onze oude schrijvers.",
      rating: 5,
      result: "€180k extra omzet"
    },
    {
      name: "Linda de Vries",
      company: "E-commerce Pro",
      role: "Content Manager",
      content: "De tijd die we besparen op content creation investeren we nu in strategie. ROI van 850% binnen 3 maanden.",
      rating: 5,
      result: "850% ROI in 3 maanden"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Gegenereerde Blogposts", icon: FileText },
    { number: "2.5M+", label: "Woorden per Dag", icon: Zap },
    { number: "2,500+", label: "Tevreden Klanten", icon: Users },
    { number: "98.7%", label: "Klanttevredenheid", icon: Star }
  ];

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
      savings: "50% BESPARING",
      features: [
        "✨ 14 dagen gratis trial",
        "📝 Tot 50 AI blogposts per maand",
        "🎨 5 premium templates",
        "🔍 Basis SEO optimalisatie", 
        "📧 Email ondersteuning",
        "🔄 Automatische verlenging na trial",
        "💳 Geen setup kosten"
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
      savings: "50% BESPARING",
      features: [
        "✨ 14 dagen gratis trial",
        "🚀 Onbeperkte AI blogposts",
        "🎨 15+ premium templates",
        "🎯 Geavanceerde lokale SEO",
        "⚡ Priority support",
        "🔗 Alle integraties",
        "🔄 Automatische verlenging na trial",
        "📊 Geavanceerde analytics"
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
      savings: "50% BESPARING",
      features: [
        "✨ 14 dagen gratis trial",
        "💎 Alles van Professional",
        "🏷️ White-label oplossing",
        "👨‍💼 Dedicated account manager",
        "🤖 Custom AI training",
        "🔌 API toegang",
        "🔄 Automatische verlenging na trial",
        "🛡️ Enterprise security"
      ]
    }
  ];

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Subscription check error:', error);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      // Redirect to signup page instead of showing error
      window.location.href = "/auth?tab=signup";
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

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      {/* Hero Section - Mobile Optimized */}
      <section className="relative pt-16 md:pt-20 pb-20 md:pb-32 bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="container relative z-10 px-4">
          <div className="max-w-5xl mx-auto text-center text-white">
            {/* Enhanced Social Proof Badge */}
            <Badge className="mb-6 md:mb-8 bg-white text-primary border-0 px-4 md:px-8 py-2 md:py-4 text-sm md:text-lg font-bold animate-pulse shadow-xl">
              <Star className="h-4 md:h-6 w-4 md:w-6 mr-2 md:mr-3 fill-current" />
              🔥 14 Dagen Gratis + 50% Korting
            </Badge>

            {/* Power Headline - Mobile Optimized */}
            <h1 className="text-3xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-8 leading-tight text-white animate-fade-in">
              <span className="block">Van Excel naar</span>
              <span className="block mt-2 md:mt-4 text-yellow-300">
                Duizenden artikelen
              </span>
              <span className="block text-2xl md:text-5xl lg:text-6xl mt-3 md:mt-6">in 24 uur</span>
            </h1>

            {/* Enhanced Value Proposition - Mobile Readable */}
            <p className="text-lg md:text-2xl lg:text-3xl mb-6 md:mb-10 text-white/90 font-medium max-w-4xl mx-auto leading-relaxed px-4">
              Stop met weken besteden aan content. Onze AI schrijft 
              <span className="text-yellow-300 font-semibold bg-white/20 px-2 py-1 rounded-lg mx-1"> professionele, SEO-geoptimaliseerde blogposts</span> 
              die hoger ranken.
            </p>

            {/* Enhanced Value Stack - Mobile Stacked */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-8 mb-6 md:mb-10 border border-white/30 shadow-2xl max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 text-white font-semibold">
                <div className="flex items-center justify-center text-center">
                  <CheckCircle className="h-5 md:h-6 w-5 md:w-6 text-green-400 mr-2 md:mr-3 flex-shrink-0" />
                  <span className="text-sm md:text-lg">95% sneller</span>
                </div>
                <div className="flex items-center justify-center text-center">
                  <CheckCircle className="h-5 md:h-6 w-5 md:w-6 text-green-400 mr-2 md:mr-3 flex-shrink-0" />
                  <span className="text-sm md:text-lg">€15k+ besparing</span>
                </div>
                <div className="flex items-center justify-center text-center">
                  <CheckCircle className="h-5 md:h-6 w-5 md:w-6 text-green-400 mr-2 md:mr-3 flex-shrink-0" />
                  <span className="text-sm md:text-lg">Bewezen resultaten</span>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Stack - Mobile Optimized */}
            <div className="flex flex-col gap-4 md:gap-6 justify-center items-center mb-6 md:mb-8 px-4">
              <Button 
                size="lg" 
                className="w-full md:w-auto text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 bg-white text-primary hover:bg-white/90 shadow-2xl font-bold group transform hover:scale-105 transition-all duration-300"
                onClick={() => handleSubscribe('professional')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 md:mr-3 h-5 md:h-6 w-5 md:w-6 animate-spin" />
                    Bezig met laden...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 md:mr-3 h-5 md:h-6 w-5 md:w-6 group-hover:animate-bounce" />
                    Start GRATIS 14 Dagen Trial
                    <ArrowRight className="ml-2 md:ml-3 h-5 md:h-6 w-5 md:w-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full md:w-auto text-lg md:text-xl px-6 md:px-8 py-4 md:py-6 border-white/70 bg-white/10 text-white hover:bg-white/20 backdrop-blur-lg shadow-xl"
              >
                <Play className="mr-2 md:mr-3 h-5 md:h-6 w-5 md:w-6" />
                Bekijk 2-min Demo
              </Button>
            </div>

            {/* Enhanced Trust Indicators - Mobile Compact */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-4 max-w-3xl mx-auto">
              <p className="text-white text-sm md:text-lg font-semibold">
                💳 Geen creditcard • 🚀 Setup in 2 min • 💯 Geld terug garantie
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Social Proof Stats - Mobile Optimized */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-secondary/30 to-secondary/50 relative">
        <div className="container relative z-10 px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-4">Vertrouwd door 2.500+ succesvolle bedrijven</h2>
            <p className="text-lg md:text-xl text-muted-foreground">Proven resultaten die spreken voor zich</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-background rounded-xl md:rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border border-border">
                    <IconComponent className="h-8 md:h-12 w-8 md:w-12 text-primary mx-auto mb-2 md:mb-4 group-hover:animate-pulse" />
                    <div className="text-2xl md:text-4xl font-bold text-primary mb-1 md:mb-2">{stat.number}</div>
                    <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Revolutionary Pricing Section */}
      <section className="py-24 relative">
        <div className="container relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-8 bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-200 px-8 py-4 text-lg font-bold animate-pulse shadow-xl">
              <Clock className="h-6 w-6 mr-3 animate-spin" />
              🔥 LAATSTE KANS: Actie eindigt over {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </Badge>
            
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8 leading-tight">
              Kies je 
              <span className="bg-gradient-to-r from-primary via-accent to-primary/80 bg-clip-text text-transparent block mt-2 animate-scale-in">
                Succes Plan
              </span>
            </h2>
            <p className="text-lg md:text-2xl lg:text-3xl text-muted-foreground max-w-5xl mx-auto mb-6 md:mb-8 leading-relaxed px-4">
              Van handmatige blog posts naar geautomatiseerde content productie. <strong className="text-foreground bg-gradient-to-r from-primary/10 to-accent/10 px-2 md:px-3 py-1 md:py-2 rounded-lg">Start vandaag gratis</strong> en ervaar de kracht van AI.
            </p>
            
            {/* Enhanced Social Proof - Mobile Stacked */}
            <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 md:gap-8 text-sm md:text-lg text-muted-foreground">
              <div className="flex items-center gap-2 md:gap-3 bg-background/90 px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-border">
                <Users className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                <span className="font-bold">2,500+ klanten</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 bg-background/90 px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-border">
                <TrendingUp className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                <span className="font-bold">500% meer content</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 bg-background/90 px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-border">
                <Shield className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                <span className="font-bold">30-dagen garantie</span>
              </div>
            </div>
          </div>

          {/* Premium Pricing Cards - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 max-w-7xl mx-auto mb-12 md:mb-20 px-4">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              const isCurrentPlan = subscription.subscription_tier?.toLowerCase() === plan.id;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-700 hover:shadow-2xl hover:-translate-y-4 group ${
                    plan.popular 
                      ? 'border-primary shadow-2xl shadow-primary/25 scale-110 bg-gradient-to-b from-background to-primary/5 ring-4 ring-primary/30' 
                      : 'border hover:border-primary/50 hover:shadow-xl hover:scale-105'
                  } ${isCurrentPlan ? 'border-green-500 bg-green-50/50 shadow-green-200' : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-primary via-purple-600 to-primary text-white px-8 py-3 text-lg font-bold shadow-2xl animate-pulse">
                        <Star className="h-5 w-5 mr-3 fill-current" />
                        🔥 MEEST POPULAIR - 73% KIEST DIT
                      </Badge>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute -top-6 right-6 z-10">
                      <Badge className="bg-green-500 text-white px-4 py-2 text-sm shadow-xl animate-bounce">
                        ✅ JE HUIDIGE PLAN
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 relative">
                    <div className="mb-8 transform group-hover:scale-125 transition-transform duration-500">
                      <IconComponent className={`h-24 w-24 mx-auto ${plan.popular ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                    </div>
                    <CardTitle className="text-4xl mb-3">{plan.name}</CardTitle>
                    <CardDescription className="text-xl font-medium">{plan.description}</CardDescription>
                     
                    <div className="mt-10">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <span className="text-3xl text-muted-foreground line-through">{plan.originalPrice}</span>
                        <span className="text-7xl font-bold text-primary animate-scale-in">{plan.price}</span>
                      </div>
                      <span className="text-muted-foreground text-2xl">{plan.period}</span>
                      <div className="mt-6 space-y-3">
                        <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xl px-6 py-3 shadow-lg">
                          ✨ {plan.trialPeriod}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 text-lg px-4 py-2 animate-bounce shadow-md">
                          🔥 {plan.savings}
                        </Badge>
                      </div>
                      <p className="text-lg text-green-600 mt-4 font-bold">🎯 Automatische verlenging na trial</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-10 p-10">
                    <ul className="space-y-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-4 group/item">
                          <CheckCircle2 className="h-7 w-7 text-green-500 mt-0.5 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                          <span className="text-lg font-medium leading-relaxed group-hover/item:text-primary transition-colors">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-8">
                      {/* Enhanced Progress Bar for Loading */}
                      {isLoading && selectedPlan === plan.id && (
                        <div className="space-y-4 bg-gradient-to-r from-primary/10 to-purple-600/10 p-6 rounded-xl border-2 border-primary/30 shadow-lg">
                          <div className="flex items-center justify-between text-lg font-bold">
                            <span className="text-primary">🚀 Checkout voorbereiden...</span>
                            <span className="text-primary font-bold text-xl">{checkoutProgress}%</span>
                          </div>
                          <Progress value={checkoutProgress} className="h-4 bg-white shadow-inner" />
                          <p className="text-sm text-center text-muted-foreground animate-pulse">
                            Secure betaling via Stripe wordt geladen...
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        className={`w-full h-20 text-2xl font-bold transition-all duration-500 transform hover:scale-110 shadow-xl ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-primary via-purple-600 to-primary hover:from-primary/90 hover:via-purple-600/90 hover:to-primary/90 shadow-2xl hover:shadow-3xl animate-pulse text-white' 
                            : 'hover:scale-110 shadow-lg hover:shadow-2xl'
                        } ${isCurrentPlan ? 'bg-green-500 hover:bg-green-600' : ''}`}
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isLoading || isCurrentPlan}
                      >
                        {isCurrentPlan ? (
                          <span className="flex items-center gap-4">
                            <CheckCircle2 className="h-8 w-8" />
                            Actief Plan
                          </span>
                        ) : isLoading && selectedPlan === plan.id ? (
                          <span className="flex items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            Bezig met laden...
                          </span>
                        ) : (
                          <span className="flex items-center gap-4">
                            <CreditCard className="h-8 w-8" />
                            Start GRATIS Trial Nu
                            <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
                          </span>
                        )}
                      </Button>
                      
                      <div className="text-center space-y-3">
                        <p className="text-lg text-muted-foreground bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200/50 shadow-sm">
                          💳 <strong>Geen creditcard vereist</strong> • ✨ <strong>Opzeggen wanneer je wilt</strong>
                        </p>
                        <p className="text-lg text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-200 shadow-sm">
                          🛡️ 30 dagen geld-terug-garantie • 🔒 SSL beveiligd
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonial Carousel */}
      <section className="py-24 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container">
          <div className="max-w-5xl mx-auto text-center mb-20">
            <h2 className="text-5xl font-heading font-bold mb-6">
              Waarom 2.500+ Bedrijven Kiezen voor AutoblogifyAI
            </h2>
            <p className="text-2xl text-muted-foreground">
              Echte resultaten van echte ondernemers
            </p>
          </div>

          <Card className="max-w-5xl mx-auto shadow-2xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-8 w-8 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-3xl font-medium mb-8 text-gray-700 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="mb-6">
                  <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-2xl px-8 py-4 shadow-lg">
                    {testimonials[currentTestimonial].result}
                  </Badge>
                </div>
                <div>
                  <div className="font-bold text-2xl">{testimonials[currentTestimonial].name}</div>
                  <div className="text-xl text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                  <div className="text-xl text-primary font-bold">{testimonials[currentTestimonial].company}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container text-center relative z-10">
          <div className="max-w-4xl mx-auto text-white">
            <h3 className="text-5xl font-heading font-bold mb-8 drop-shadow-xl">
              Stop met Geld Verspillen aan Dure Copywriters
            </h3>
            <p className="text-2xl mb-10 text-white/95 drop-shadow-lg leading-relaxed">
              Word de volgende successtory. 2.500+ bedrijven gingen je voor.
            </p>
            <div className="space-y-6">
              <Button 
                size="lg" 
                className="text-2xl px-12 py-8 bg-gradient-to-r from-white to-gray-100 text-primary hover:from-gray-100 hover:to-white font-bold shadow-2xl transform hover:scale-110 transition-all duration-300"
                onClick={() => handleSubscribe('professional')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                    Bezig met laden...
                  </>
                ) : (
                  <>
                    Ja, ik wil 95% tijd besparen
                    <ArrowRight className="ml-3 h-8 w-8" />
                  </>
                )}
              </Button>
              <p className="text-xl text-white/90 drop-shadow-md">
                💳 Geen creditcard • 🚀 Direct toegang • 💯 30 dagen geld terug
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;