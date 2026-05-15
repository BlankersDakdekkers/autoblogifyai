import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, Star, Zap, TrendingUp, Users, CheckCircle, Globe, Rocket, Brain, Target, Clock, Award, 
  ChevronRight, Play, Sparkles, FileText, Crown, Shield, CheckCircle2, CreditCard, Loader2,
  Menu
} from "lucide-react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// Footer is now handled by OptimizedLayout
import OptimizedHomeSections from "@/components/OptimizedHomeSections";
import ContentPlanner from "@/components/ContentPlanner";
import BackendStatus from "@/components/BackendStatus";
import { useAuth } from "@/contexts/AuthContext";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackAnalyticsEvent } from "@/components/analytics/analytics";

interface Subscription {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>({ subscribed: false });
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [checkoutProgress, setCheckoutProgress] = useState(0);
  const [liveStats, setLiveStats] = useState({
    users: 2847,
    posts: 15634,
    words: 2847365,
    satisfaction: 98.7
  });

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
      price: "€147",
      period: "/maand",
      originalPrice: "€297",
      trialPeriod: "5 dagen GRATIS",
      description: "Perfect voor kleine bedrijven",
      icon: Rocket,
      popular: false,
      savings: "50% BESPARING",
      features: [
        "✨ 5 dagen gratis trial",
        "📝 Tot 100 AI blogposts per maand",
        "🎨 10 premium templates",
        "🔍 Basis SEO optimalisatie", 
        "📧 Email ondersteuning",
        "🔄 Automatische verlenging na trial",
        "💳 Geen setup kosten",
        "🚀 2x sneller dan concurrentie"
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
      features: [
        "✨ 5 dagen gratis trial",
        "🚀 Onbeperkte AI blogposts",
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
      features: [
        "✨ 5 dagen gratis trial",
        "💎 Alles van Professional",
        "🏷️ White-label oplossing",
        "👨‍💼 Dedicated account manager",
        "🤖 Custom AI training",
        "🔌 API toegang & webhooks",
        "🔄 Automatische verlenging na trial",
        "🛡️ Enterprise security",
        "🌍 Multi-tenant architectuur",
        "📈 Custom integrations"
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
    trackAnalyticsEvent("generate_lead", {
      source: "pricing_cta",
      tier,
    });
    trackAnalyticsEvent("offerte_aanvraag", {
      source: "pricing_cta",
      tier,
    });

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
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl translate-x-96 translate-y-60 pointer-events-none animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary/10 to-primary/5 rounded-full blur-3xl -translate-x-96 -translate-y-60 pointer-events-none animate-pulse" />

      {/* Hero Section - Mobile Optimized */}
      <section className="relative pt-16 pb-20 md:pb-32 bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300/20 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-yellow-300/10 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
        
        <div className="container relative z-10 px-4 pt-8">
          <div className="max-w-6xl mx-auto text-center text-white">
            {/* Live Activity Ticker */}
            <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 inline-flex items-center gap-3 animate-pulse">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              <span className="text-sm font-bold">🔥 Live: 847 mensen bekijken dit nu</span>
            </div>

            {/* Enhanced Social Proof Badge */}
            <Badge className="mb-6 md:mb-8 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 px-6 md:px-12 py-3 md:py-5 text-lg md:text-xl font-bold animate-bounce shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer transform hover:scale-110">
              <Star className="h-5 md:h-7 w-5 md:w-7 mr-3 md:mr-4 fill-current animate-spin" />
              🚨 LAATSTE DAG: 67% Korting + Exclusieve Toegang
            </Badge>

            {/* Power Headline - Mobile Optimized */}
            <h1 className="text-4xl md:text-7xl lg:text-9xl font-black mb-6 md:mb-8 leading-[0.85] text-white animate-fade-in">
              <span className="block drop-shadow-2xl animate-pulse">Stop met</span>
              <span className="block mt-2 md:mt-4 text-red-400 drop-shadow-2xl animate-bounce">
                €25.000 WEGGOOIEN
              </span>
              <span className="block text-2xl md:text-5xl lg:text-7xl mt-4 md:mt-6 font-bold drop-shadow-xl text-yellow-300">
                aan domme copywriters 🤡
              </span>
            </h1>

            {/* Shocking Stat */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-6 md:p-8 mb-8 border-4 border-yellow-300 animate-pulse shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl md:text-5xl font-black text-white mb-2">
                🚨 SHOCKER: Gemiddeld bedrijf verspilt
              </div>
              <div className="text-5xl md:text-8xl font-black text-yellow-300 animate-bounce">
                €127.000 per jaar
              </div>
              <div className="text-xl md:text-2xl font-bold text-white/90">
                aan slechte content die NIET converteert
              </div>
            </div>

            {/* Enhanced Value Proposition - Mobile Readable */}
            <p className="text-xl md:text-3xl lg:text-4xl mb-8 md:mb-12 text-white/95 font-semibold max-w-5xl mx-auto leading-relaxed px-4 drop-shadow-lg">
              Terwijl jij <span className="bg-red-500 text-white px-3 py-2 rounded-xl font-black animate-pulse">GELD VERBRANDT</span> 
              genereren wij in <span className="bg-yellow-300 text-black px-3 py-2 rounded-xl font-black animate-bounce">24 uur</span> 
              meer kwaliteit dan een heel team in 
              <span className="bg-yellow-300 text-black px-3 py-2 rounded-xl font-black animate-pulse ml-2">1 jaar</span>
            </p>

            {/* Enhanced Value Stack with Animations */}
            <div className="bg-gradient-to-r from-white/25 to-white/20 backdrop-blur-xl rounded-3xl md:rounded-4xl p-6 md:p-10 mb-8 md:mb-12 border-2 border-white/40 shadow-2xl max-w-5xl mx-auto transform hover:scale-105 transition-all duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center group cursor-pointer">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/30 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                    <div className="text-6xl mb-3 animate-bounce">⚡</div>
                    <div className="text-2xl md:text-3xl font-black text-white mb-2 animate-pulse">2.847x</div>
                    <span className="text-lg md:text-xl font-bold text-white/90">Sneller dan handmatig</span>
                  </div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/30 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                    <div className="text-6xl mb-3 animate-bounce" style={{animationDelay: '0.2s'}}>💰</div>
                    <div className="text-2xl md:text-3xl font-black text-white mb-2 animate-pulse">€127k+</div>
                    <span className="text-lg md:text-xl font-bold text-white/90">Jaarlijkse besparing</span>
                  </div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/30 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                    <div className="text-6xl mb-3 animate-bounce" style={{animationDelay: '0.4s'}}>🎯</div>
                    <div className="text-2xl md:text-3xl font-black text-white mb-2 animate-pulse">850%</div>
                    <span className="text-lg md:text-xl font-bold text-white/90">ROI in 90 dagen</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scarcity Counter */}
            <div className="bg-red-600 rounded-2xl p-4 md:p-6 mb-8 border-4 border-yellow-300 animate-pulse shadow-2xl">
              <div className="text-lg md:text-xl font-black text-white mb-2">
                ⚠️ WAARSCHUWING: Slechts 23 plekken over van de 500
              </div>
              <div className="flex justify-center items-center gap-2">
                <div className="bg-yellow-300 text-black px-3 py-1 rounded font-black animate-bounce">23</div>
                <span className="text-white font-bold">plekken over</span>
                <div className="bg-white/20 w-32 h-2 rounded-full">
                  <div className="bg-yellow-300 h-2 rounded-full animate-pulse" style={{width: '4.6%'}}></div>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Stack with Urgency */}
            <div className="flex flex-col gap-4 md:gap-6 justify-center items-stretch mb-8 md:mb-10 px-6 max-w-md md:max-w-2xl mx-auto">
              <Button 
                size="lg" 
                className="w-full text-lg md:text-2xl px-6 md:px-16 py-6 md:py-8 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-300 shadow-2xl font-black group transition-all duration-300 min-h-[80px] md:min-h-[90px] touch-manipulation rounded-2xl transform hover:scale-110 animate-pulse border-4 border-yellow-200 relative overflow-hidden"
                onClick={() => handleSubscribe('professional')}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    <span className="text-lg md:text-xl">Bezig...</span>
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full relative z-10">
                    <Rocket className="mr-3 h-6 w-6 group-hover:animate-bounce flex-shrink-0" />
                    <span className="text-center leading-tight font-black">
                      <span className="block">🚨 CLAIM JE PLEK NU!</span>
                      <span className="block text-sm md:text-base opacity-90 font-bold">Test 5 dagen GRATIS - Bespaar €127k+</span>
                    </span>
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full text-lg md:text-xl px-6 md:px-12 py-4 md:py-6 border-3 border-white/80 bg-white/15 text-white hover:bg-white/25 backdrop-blur-xl shadow-xl min-h-[70px] md:min-h-[80px] touch-manipulation rounded-2xl font-bold group transform hover:scale-105 transition-all duration-300"
              >
                <Play className="mr-3 h-5 w-5 flex-shrink-0 group-hover:animate-bounce" />
                <span>🎬 Zie €180k case study (2 min)</span>
              </Button>
              
              {user && (
                <Button 
                  size="lg" 
                  className="w-full text-lg md:text-xl px-6 md:px-12 py-4 md:py-6 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white hover:from-blue-400 hover:via-blue-500 hover:to-blue-400 shadow-2xl font-bold group transition-all duration-300 min-h-[70px] md:min-h-[80px] touch-manipulation rounded-2xl transform hover:scale-105 border-2 border-blue-400"
                  onClick={() => navigate('/dashboard/wordpress-testpilot')}
                >
                  <Zap className="mr-3 h-5 w-5 flex-shrink-0 group-hover:animate-bounce" />
                  <span className="text-center leading-tight">
                    <span className="block">🧪 Start WordPress Testpilot</span>
                    <span className="block text-sm opacity-90">Test de volledige workflow gratis</span>
                  </span>
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Button>
              )}
            </div>

            {/* Enhanced Trust Indicators with Social Proof */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30 text-center group hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-white text-sm md:text-base font-bold">
                  💳 <span className="text-yellow-300">Geen creditcard</span>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30 text-center group hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-white text-sm md:text-base font-bold">
                  ⚡ <span className="text-yellow-300">Setup 47 sec</span>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30 text-center group hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-white text-sm md:text-base font-bold">
                  🛡️ <span className="text-yellow-300">100% garantie</span>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30 text-center group hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-white text-sm md:text-base font-bold">
                  🔥 <span className="text-yellow-300">2.847 gebruikers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Social Proof Stats - Mobile Optimized */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-secondary/20 via-background to-accent/10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
        <div className="container relative z-10 px-4">
          <div className="text-center mb-8 md:mb-12">
            <Badge className="mb-6 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-300 px-8 py-4 text-xl font-black animate-bounce shadow-2xl">
              <TrendingUp className="h-6 w-6 mr-3 animate-pulse" />
              🚀 LIVE STATISTIEKEN - Ververst elke seconde
            </Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 md:mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-scale-in">
              2.847 Bedrijven Besparen Nu al
              <span className="block text-2xl md:text-4xl lg:text-5xl mt-3 text-green-600">
                €847.000+ Per Maand 💰
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-semibold">
              Jij bent de volgende die stopt met geld weggooien aan dure copywriters
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-700 transform group-hover:scale-125 group-hover:-translate-y-4 border-2 border-border/30 hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10 cursor-pointer">
                    <div className="relative mb-4 md:mb-6">
                      <IconComponent className="h-10 md:h-16 w-10 md:w-16 text-primary mx-auto group-hover:animate-bounce transition-all duration-300 drop-shadow-lg" />
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all duration-500 animate-pulse" />
                    </div>
                    <div className="text-3xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 md:mb-3 animate-fade-in group-hover:animate-pulse">
                      {stat.number}
                    </div>
                    <div className="text-sm md:text-base lg:text-lg text-muted-foreground font-bold group-hover:text-foreground transition-colors duration-300">
                      {stat.label}
                    </div>
                    <div className="mt-3 text-xs md:text-sm text-primary font-bold opacity-0 group-hover:opacity-100 transition-all duration-300">
                      📈 +12% deze maand
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SHOCKING Cost Calculator Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container relative z-10 px-4">
          <div className="text-center mb-16">
            <Badge className="mb-8 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 px-8 py-4 text-xl font-black animate-bounce shadow-2xl">
              <TrendingUp className="h-6 w-6 mr-3 animate-pulse" />
              🚨 SHOCK CALCULATOR - Hoeveel verbrand je nu?
            </Badge>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 text-red-600 animate-fade-in">
              ELKE DAG dat je wacht
              <span className="block mt-3 text-black">
                verbranden je concurrenten jou 🔥
              </span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Daily Loss Calculator */}
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 transform hover:scale-110 transition-all duration-500 cursor-pointer group shadow-2xl">
                <CardContent className="p-8 text-center">
                  <div className="text-8xl mb-6 animate-bounce">📉</div>
                  <div className="text-5xl font-black mb-4 animate-pulse">-€347</div>
                  <div className="text-xl font-bold mb-2">PER DAG VERLIES</div>
                  <div className="text-lg opacity-90 leading-relaxed">
                    Gemiste klanten door slechte content + dure copywriter kosten
                  </div>
                </CardContent>
              </Card>

              {/* Competition Advantage */}
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 transform hover:scale-110 transition-all duration-500 cursor-pointer group shadow-2xl">
                <CardContent className="p-8 text-center">
                  <div className="text-8xl mb-6 animate-bounce" style={{animationDelay: '0.2s'}}>🏃‍♂️💨</div>
                  <div className="text-5xl font-black mb-4 animate-pulse">+2847x</div>
                  <div className="text-xl font-bold mb-2">CONCURRENT VOORSPRONG</div>
                  <div className="text-lg opacity-90 leading-relaxed">
                    Zo veel sneller zijn bedrijven die AutoblogifyAI gebruiken
                  </div>
                </CardContent>
              </Card>

              {/* Opportunity Cost */}
              <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 transform hover:scale-110 transition-all duration-500 cursor-pointer group shadow-2xl">
                <CardContent className="p-8 text-center">
                  <div className="text-8xl mb-6 animate-bounce" style={{animationDelay: '0.4s'}}>😱</div>
                  <div className="text-5xl font-black mb-4 animate-pulse">€127k</div>
                  <div className="text-xl font-bold mb-2">JAARLIJKS GEMIST</div>
                  <div className="text-lg opacity-90 leading-relaxed">
                    Hoeveel je concurrenten EXTRA verdienen door AI te gebruiken
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Table */}
            <Card className="bg-gradient-to-br from-background to-primary/5 border-2 border-red-200 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-4xl font-black text-foreground mb-4">
                  🥊 JIJ vs. Slimme Concurrenten
                </CardTitle>
                <CardDescription className="text-xl text-muted-foreground">
                  Dit is waarom zij jou voorbij streven...
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Without AutoblogifyAI */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl border-2 border-red-200">
                    <h3 className="text-2xl font-black text-red-600 mb-6 text-center">
                      😰 JIJ (Zonder AutoblogifyAI)
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">💸</span>
                        <span className="text-lg"><strong>€5.000/maand</strong> aan copywriters</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">⏰</span>
                        <span className="text-lg"><strong>40+ uur/week</strong> content management</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">📝</span>
                        <span className="text-lg"><strong>5-10 posts/maand</strong> als je geluk hebt</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">📈</span>
                        <span className="text-lg"><strong>Stagnerende traffic</strong> door slecht SEO</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">😤</span>
                        <span className="text-lg"><strong>Stress & frustratie</strong> elke dag</span>
                      </li>
                    </ul>
                  </div>

                  {/* With AutoblogifyAI */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl border-2 border-green-300 relative">
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                      🏆 WINNER
                    </div>
                    <h3 className="text-2xl font-black text-green-600 mb-6 text-center">
                      🚀 SLIMME CONCURRENTEN (Met AutoblogifyAI)
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <span className="text-lg"><strong>€297/maand</strong> - 94% goedkoper!</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <span className="text-lg"><strong>2 min/week</strong> - 2.847x efficiënter</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">🚀</span>
                        <span className="text-lg"><strong>500+ posts/maand</strong> perfecte kwaliteit</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">📈</span>
                        <span className="text-lg"><strong>340% traffic groei</strong> gegarandeerd</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-2xl">😎</span>
                        <span className="text-lg"><strong>Ontspanning & winst</strong> elke dag</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-2xl text-white">
                    <div className="text-3xl font-black mb-4">
                      ⚠️ Stop met achter de feiten aanlopen!
                    </div>
                    <Button 
                      size="lg" 
                      className="text-xl px-12 py-6 bg-white text-black hover:bg-gray-100 font-black shadow-2xl transform hover:scale-110 transition-all duration-300"
                      onClick={() => handleSubscribe('professional')}
                      disabled={isLoading}
                    >
                      🎯 Claim voorsprong NU!
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-accent/5 to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative z-10 px-4">
          <div className="text-center mb-16">
            <Badge className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 px-8 py-4 text-xl font-black animate-bounce shadow-2xl">
              <Zap className="h-6 w-6 mr-3 animate-pulse" />
              🎯 Van CHAOS naar CASHFLOW in 3 stappen
            </Badge>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Zo Simpel dat je
              <span className="block mt-3 text-blue-600">3-Jarige het Kan</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-semibold max-w-4xl mx-auto">
              Terwijl jouw concurrenten nog steeds <span className="text-red-600 font-black">€5.000 per maand</span> verspillen aan copywriters, 
              genereer jij in <span className="bg-yellow-300 text-black px-3 py-2 rounded-xl font-black">3 klikken</span> meer content dan zij in een jaar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                step: "01",
                title: "Sleep & Drop je CSV",
                description: "Geen technische poespas. Sleep je Google Sheets bestand erin en onze AI begrijpt binnen 3 seconden wat je wilt. Zelfs je oma kan dit.",
                icon: "🎯",
                gradient: "from-blue-500 to-purple-600",
                time: "5 seconden",
                difficulty: "Makkelijker dan Netflix kijken"
              },
              {
                step: "02", 
                title: "AI Schrijft Alles",
                description: "Terwijl jij koffie drinkt, schrijft onze GPT-4 AI honderden perfecte blogposts. SEO-geoptimaliseerd, FAQ's, CTA's - alles automatisch.",
                icon: "🤖",
                gradient: "from-purple-500 to-pink-600",
                time: "Volledig automatisch",
                difficulty: "AI doet letterlijk ALLES"
              },
              {
                step: "03",
                title: "Kijk je Bank Account Groeien",
                description: "Publiceer met 1 klik naar WordPress, Ghost of elk CMS. Zie binnen 14 dagen je organic traffic exploderen en de orders binnenstromen.",
                icon: "💰",
                gradient: "from-green-500 to-emerald-600",
                time: "Resultaat in 14 dagen",
                difficulty: "Money printer goes BRRRR"
              }
            ].map((item, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-6 hover:scale-105 border-0 bg-gradient-to-br from-background to-secondary/10 cursor-pointer">
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${item.gradient}`} />
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center text-2xl font-black text-black shadow-2xl animate-bounce">
                  {item.step}
                </div>
                <CardContent className="p-8 md:p-10 text-center">
                  <div className="text-8xl mb-6 animate-bounce group-hover:animate-pulse" style={{animationDelay: `${index * 0.2}s`}}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-6 text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg mb-6 group-hover:text-foreground transition-colors">
                    {item.description}
                  </p>
                  <div className="space-y-3">
                    <Badge className={`bg-gradient-to-r ${item.gradient} text-white px-4 py-2 font-bold`}>
                      ⏱️ {item.time}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 font-bold block">
                      🎯 {item.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section with Interactive Elements */}
      <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative z-10 px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200 px-6 py-3 text-lg font-bold animate-bounce shadow-2xl">
              <Star className="h-5 w-5 mr-2 fill-current animate-pulse" />
              🏆 BEWEZEN RESULTATEN van echte klanten
            </Badge>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Waarom Iedereen Overstapt
              <span className="block mt-3 text-green-600 text-3xl md:text-5xl">
                van Dure Agencies naar Ons 💸➡️💰
              </span>
            </h2>
            <div className="flex justify-center items-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-8 w-8 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
              ))}
              <span className="text-2xl font-bold text-muted-foreground ml-3">4.97/5 (2,847 reviews)</span>
            </div>
          </div>

          {/* Big Impact Numbers */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 transform hover:scale-110 transition-all duration-500 cursor-pointer group shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-black mb-4 animate-bounce">€180k</div>
                <div className="text-xl font-bold mb-2">EXTRA OMZET</div>
                <div className="text-lg opacity-90">Michael Jansen, CEO TechStart Solutions</div>
                <div className="mt-4 bg-white/20 rounded-lg p-3">
                  <div className="text-sm font-bold">"Van 0 naar 50.000 bezoekers per maand in 6 maanden"</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 transform hover:scale-110 transition-all duration-500 cursor-pointer group shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-black mb-4 animate-bounce" style={{animationDelay: '0.2s'}}>850%</div>
                <div className="text-xl font-bold mb-2">ROI IN 3 MAANDEN</div>
                <div className="text-lg opacity-90">Linda de Vries, Content Manager</div>
                <div className="mt-4 bg-white/20 rounded-lg p-3">
                  <div className="text-sm font-bold">"Tijd besparen = meer strategie = 850% ROI"</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 transform hover:scale-110 transition-all duration-500 cursor-pointer group shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-black mb-4 animate-bounce" style={{animationDelay: '0.4s'}}>40h</div>
                <div className="text-xl font-bold mb-2">PER WEEK BESPAARD</div>
                <div className="text-lg opacity-90">Sarah van der Berg, Marketing Director</div>
                <div className="mt-4 bg-white/20 rounded-lg p-3">
                  <div className="text-sm font-bold">"200+ SEO blogposts per maand die converteren"</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Testimonials */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-background to-primary/5 border-2 border-transparent hover:border-primary/20 cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-bl-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-3xl animate-bounce">⭐</span>
                </div>
                
                {/* Floating result badge */}
                <div className="absolute -top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse z-10">
                  🚀 {testimonial.result}
                </div>
                
                <CardContent className="p-8 pt-12">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                    ))}
                  </div>
                  <blockquote className="text-xl font-medium mb-8 text-foreground italic leading-relaxed group-hover:text-primary transition-colors">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">{testimonial.name}</div>
                      <div className="text-base text-muted-foreground">{testimonial.role}</div>
                      <div className="text-base font-semibold text-primary">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Video Demo Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-10 rounded-3xl border-2 border-primary/20 max-w-5xl mx-auto relative overflow-hidden group cursor-pointer transform hover:scale-105 transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse"></div>
              <div className="relative z-10">
                <div className="text-8xl mb-6 animate-bounce">🎬</div>
                <h3 className="text-3xl md:text-4xl font-black mb-6 text-foreground">
                  Zie Hoe Sarah €180k Extra Omzet Genereerde!
                </h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  Exclusive case study: van 0 naar 50.000 bezoekers in 6 maanden. 
                  Zie exact welke strategie zij gebruikte en hoe jij dit kunt kopiëren.
                </p>
                <Button size="lg" className="text-2xl px-12 py-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-black shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse border-4 border-white">
                  <Play className="mr-4 h-8 w-8 group-hover:animate-bounce" />
                  🚨 BEKIJK GRATIS CASE STUDY (2 min)
                </Button>
                <div className="mt-6 text-lg text-muted-foreground">
                  ⚡ Over 47.000 views • 98% zegt: "Dit had ik eerder moeten zien"
                </div>
              </div>
            </div>
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

      {/* FAQ Section with Interactive Cards */}
      <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-8 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 px-8 py-4 text-xl font-black animate-bounce shadow-2xl">
              <Target className="h-6 w-6 mr-3 animate-pulse" />
              🧠 SMART VRAGEN van slimme ondernemers
            </Badge>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Laatste Twijfels?
              <span className="block mt-3 text-red-600 text-3xl md:text-5xl">
                Hier zijn de antwoorden 💡
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-semibold max-w-4xl mx-auto">
              Deze vragen krijgen we van <span className="text-green-600 font-black">slimme CEO's</span> en <span className="text-blue-600 font-black">marketing directors</span>. 
              Staat jouw vraag er niet bij? <span className="bg-yellow-300 text-black px-3 py-2 rounded-xl font-black">Chat direct met ons!</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {[
              {
                q: "⚡ Hoe snel zie ik resultaten?",
                a: "RECORD BREAKING: Snelste klant zag binnen 48 uur traffic exploderen! Gemiddeld 2-4 weken voor significante stijgingen. Sarah zag na 14 dagen al 340% meer bezoekers. Waarom zo snel? Onze AI content rankt 3x sneller dan handgeschreven content door perfecte SEO.",
                icon: "🚀",
                highlight: "48 uur record"
              },
              {
                q: "🤖 Moet ik technische kennis hebben?",
                a: "ABSOLUUT NIET! Onze 87-jarige klant Gerda gebruikt het dagelijks zonder hulp. Upload je CSV, klik 'Generate' en klaar. Geen programmeren, geen technische poespas. Zelfs eenvoudiger dan Netflix opstarten. Gemiddelde setup: 47 seconden.",
                icon: "👵",
                highlight: "87-jarige gebruikt het"
              },
              {
                q: "💰 Wat als ik niet tevreden ben?",
                a: "100% geld-terug, geen vragen, geen gedoe. Waarom zo zeker? 98.7% van klanten verlengt hun abonnement. We zijn ZO confident dat je €127k+ gaat besparen dit jaar dat we het risico volledig op ons nemen. Risk-free testen!",
                icon: "🛡️",
                highlight: "98.7% verlengt"
              },
              {
                q: "🎯 Hoe zit het met SEO kwaliteit?",
                a: "GAME-CHANGER: Onze AI is getraind op 10 MILJOEN top-rankende artikelen van #1 Google positions. Elke post krijgt perfecte meta tags, H1-H6 structuur, keyword density van 1.2% en readability score 80+. Google's algoritme HOUDT letterlijk van onze content.",
                icon: "🏆",
                highlight: "10M artikelen training"
              },
              {
                q: "✏️ Kan ik content nog aanpassen?",
                a: "VOLLEDIGE CONTROLE: 100% bewerkbaar, real-time editing, bulk-edit tools, custom templates. JIJ bent de baas. Zelfs live aanpassingen tijdens generatie mogelijk. Maximum flexibiliteit, zero vendor lock-in.",
                icon: "🎨",
                highlight: "100% bewerkbaar"
              },
              {
                q: "🔌 Werkt het met mijn website?",
                a: "UNIVERSEEL COMPATIBLE: WordPress, Ghost, Webflow, Squarespace, Shopify, Wix + 15 andere platforms. Export naar CSV, JSON of direct publish. API voor custom setups. Werkt het niet? Wij bouwen de integratie GRATIS voor je binnen 48u.",
                icon: "⚡",
                highlight: "15+ platforms"
              }
            ].map((faq, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105 border-2 border-border/30 hover:border-primary/40 bg-gradient-to-br from-background to-primary/5 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-bl-full flex items-center justify-center text-2xl animate-bounce group-hover:animate-pulse">
                  {faq.icon}
                </div>
                <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  💡 {faq.highlight}
                </div>
                <CardContent className="p-8 pt-12">
                  <h3 className="text-xl md:text-2xl font-black mb-6 text-foreground group-hover:text-primary transition-colors leading-tight">
                    {faq.q}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg group-hover:text-foreground transition-colors font-medium">
                    {faq.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Emergency Contact CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-10 rounded-3xl border-2 border-red-300 max-w-5xl mx-auto relative overflow-hidden group cursor-pointer transform hover:scale-105 transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 animate-pulse"></div>
              <div className="relative z-10">
                <div className="text-8xl mb-6 animate-bounce">🚨</div>
                <h3 className="text-3xl md:text-4xl font-black mb-6 text-foreground">
                  NOODGEVAL? Vraag niet beantwoord?
                </h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-semibold">
                  Chat <span className="text-red-600 font-black">DIRECT</span> met ons expert team. 
                  Gemiddelde <span className="bg-yellow-300 text-black px-3 py-2 rounded-xl font-black">reactietijd: 23 seconden</span>. 
                  Geen bots, alleen echte mensen die je helpen binnen 1 minuut.
                </p>
                <Button size="lg" className="text-2xl px-12 py-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-black shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse border-4 border-white">
                  <Users className="mr-4 h-8 w-8 group-hover:animate-bounce" />
                  🔥 START EMERGENCY CHAT
                </Button>
                <div className="mt-6 text-lg text-muted-foreground font-bold">
                  ⚡ 2.847 mensen voor je • Allemaal super tevreden • Jij bent de volgende
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Conversion Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating money symbols */}
        <div className="absolute top-20 left-10 text-6xl animate-bounce">💰</div>
        <div className="absolute top-40 right-20 text-5xl animate-bounce" style={{animationDelay: '0.5s'}}>💸</div>
        <div className="absolute bottom-40 left-20 text-7xl animate-bounce" style={{animationDelay: '1s'}}>🤑</div>
        <div className="absolute bottom-20 right-10 text-5xl animate-bounce" style={{animationDelay: '1.5s'}}>💵</div>
        
        <div className="container text-center relative z-10">
          <div className="max-w-6xl mx-auto text-white">
            {/* Final urgency badge */}
            <Badge className="mb-8 bg-gradient-to-r from-red-600 to-orange-600 text-white border-4 border-yellow-300 px-12 py-6 text-2xl font-black animate-bounce shadow-2xl transform hover:scale-110 transition-all duration-300">
              <Clock className="h-8 w-8 mr-4 animate-spin" />
              🚨 LAATSTE KANS: 23 plekken over van 500
            </Badge>
            
            {/* Final shocking headline */}
            <h3 className="text-5xl md:text-8xl lg:text-9xl font-black mb-8 drop-shadow-2xl leading-[0.9] animate-fade-in">
              <span className="block text-red-400 animate-pulse">STOP!</span>
              <span className="block mt-4 text-white">Gooi Geen</span>
              <span className="block mt-4 text-yellow-300 animate-bounce">€127.000</span>
              <span className="block mt-4 text-2xl md:text-5xl lg:text-6xl">meer weg dit jaar 🔥</span>
            </h3>
            
            {/* Emotional pain point */}
            <div className="bg-red-600 rounded-3xl p-8 md:p-12 mb-12 border-4 border-yellow-300 shadow-2xl transform hover:scale-105 transition-all duration-500">
              <p className="text-2xl md:text-4xl font-bold text-white leading-relaxed">
                Terwijl jij dit leest, verspillen je concurrenten 
                <span className="block mt-3 text-5xl font-black text-yellow-300 animate-pulse">€10.583 PER MAAND</span>
                aan agencies die <span className="bg-black text-white px-4 py-2 rounded-xl font-black">NIET LEVEREN</span>
              </p>
            </div>

            {/* Social proof ticker */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 mb-12 border border-white/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-yellow-300 animate-pulse">2.847</div>
                  <div className="text-lg font-bold">Slimme CEO's gebruiken dit</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-yellow-300 animate-pulse">€847k</div>
                  <div className="text-lg font-bold">Bespaard deze maand</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-yellow-300 animate-pulse">23</div>
                  <div className="text-lg font-bold">Plekken nog beschikbaar</div>
                </div>
              </div>
            </div>
            
            {/* Final mega CTA */}
            <div className="space-y-8">              
              <Button 
                size="lg" 
                className="w-full max-w-4xl text-2xl md:text-4xl px-12 md:px-20 py-8 md:py-12 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-300 shadow-2xl font-black transform hover:scale-110 transition-all duration-300 min-h-[120px] rounded-3xl animate-pulse border-8 border-white relative overflow-hidden"
                onClick={() => handleSubscribe('professional')}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                {isLoading ? (
                  <div className="relative z-10">
                    <Loader2 className="mr-4 h-12 w-12 animate-spin" />
                    <span className="text-2xl">Bezig met je €127k besparing...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full relative z-10">
                    <div className="flex items-center mb-2">
                      <Rocket className="mr-4 h-12 w-12 animate-bounce" />
                      <span className="font-black leading-tight">
                        🚨 JA! Ik claim mijn plek nu!
                      </span>
                      <ArrowRight className="ml-4 h-12 w-12 animate-bounce" />
                    </div>
                    <span className="text-lg md:text-xl opacity-90 font-bold">
                      Ik wil €127.000+ besparen dit jaar
                    </span>
                  </div>
                )}
              </Button>
              
              {/* Risk reversal */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 text-center group hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-white text-lg font-bold">
                    🔒 <span className="text-yellow-300">SSL Beveiligd</span>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 text-center group hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-white text-lg font-bold">
                    💳 <span className="text-yellow-300">Geen Creditcard</span>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 text-center group hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-white text-lg font-bold">
                    ⚡ <span className="text-yellow-300">Setup 47 sec</span>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 text-center group hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-white text-lg font-bold">
                    🛡️ <span className="text-yellow-300">100% Garantie</span>
                  </div>
                </div>
              </div>
              
              {/* Final social proof */}
              <div className="text-lg md:text-xl text-white/90 drop-shadow-md font-bold space-y-2">
                <p>⭐ 4.97/5 sterren • 2.847 reviews • #1 Content Tool 2024</p>
                <p className="text-yellow-300 animate-pulse">🔥 847 mensen bekijken dit nu • 23 plekken over</p>
                <p>🏆 Gebruikt door top bedrijven zoals TechStart, DigitalBoost & E-commerce Pro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Planner Section */}
      <ContentPlanner />

      {/* Backend Status Section */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Backend Status Check</h2>
            <p className="text-muted-foreground">
              Controleer of alle backend services correct functioneren
            </p>
          </div>
          <BackendStatus />
        </div>
      </section>
      
    </div>
  );
};

export default Index;
