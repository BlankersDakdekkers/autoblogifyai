import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Rocket, 
  Star,
  Zap,
  ArrowRight,
  Users,
  Globe,
  BarChart3,
  Shield,
  Clock,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PricingPage = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "€9",
      period: "/maand",
      description: "Perfect voor kleine blogs en beginnende ondernemers",
      icon: Star,
      color: "from-blue-500 to-blue-600",
      popular: false,
      features: [
        "Tot 50 blogposts per maand",
        "5 website templates",
        "Basis SEO optimalisatie", 
        "CSV naar blog generator",
        "Email support",
        "1 website project"
      ],
      limitations: [
        "Beperkte templates",
        "Basis analytics"
      ]
    },
    {
      id: "professional",
      name: "Professional",
      price: "€29",
      period: "/maand",
      description: "Ideaal voor groeiende bedrijven en marketing teams",
      icon: Rocket,
      color: "from-purple-500 to-purple-600",
      popular: true,
      features: [
        "Onbeperkte blogposts",
        "Alle premium templates",
        "Geavanceerde SEO tools",
        "AutoblogifyAI + Website Builder",
        "Priority support",
        "10 website projecten",
        "Custom domain support",
        "Analytics dashboard",
        "API integraties"
      ],
      limitations: []
    },
    {
      id: "enterprise",
      name: "Enterprise", 
      price: "€99",
      period: "/maand",
      description: "Voor agencies en grote organisaties met custom behoeften",
      icon: Crown,
      color: "from-gold-500 to-yellow-600",
      popular: false,
      features: [
        "Alles van Professional",
        "Onbeperkte websites",
        "White-label oplossing",
        "Custom integraties",
        "Dedicated account manager",
        "Advanced analytics & reporting",
        "Multi-team collaboration",
        "SLA garantie",
        "Custom training"
      ],
      limitations: []
    }
  ];

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    
    // TODO: Implement Stripe checkout
    toast({
      title: "Abonnement Selectie",
      description: `Je hebt het ${plans.find(p => p.id === planId)?.name} plan geselecteerd. Stripe checkout wordt geladen...`
    });
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Stripe Integratie",
        description: "Stripe checkout sessie wordt voorbereid. Even geduld..."
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Upgrade van Trial naar Pro
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Schaal je Content Op
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Van 10 posts per maand naar onbeperkte content productie. 
            Kies het plan dat past bij jouw groeiambities.
          </p>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">2.500+ tevreden klanten</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">15.000+ websites gebouwd</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">3M+ posts gegenereerd</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.popular 
                    ? 'ring-2 ring-primary shadow-xl scale-105' 
                    : 'hover:ring-1 hover:ring-primary/50'
                } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-purple-600 text-white text-center py-2 text-sm font-semibold">
                    🔥 MEEST POPULAIR
                  </div>
                )}
                
                <CardHeader className={plan.popular ? "pt-12" : "pt-6"}>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl' 
                        : ''
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={selectedPlan === plan.id}
                  >
                    {selectedPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verwerken...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {plan.popular ? 'Upgrade Nu' : 'Kies Dit Plan'}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>

                  {/* Guarantee */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                    <Shield className="h-3 w-3" />
                    30 dagen geld-terug-garantie
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Signals */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-8">Waarom kiezen 2.500+ bedrijven voor AutoblogifyAI?</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">95% Tijdsbesparing</h4>
              <p className="text-muted-foreground">Van uren naar minuten per blogpost</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">200% Meer Traffic</h4>
              <p className="text-muted-foreground">SEO-geoptimaliseerde content die werkt</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">€10K+ Extra Omzet</h4>
              <p className="text-muted-foreground">Gemiddelde ROI van onze klanten</p>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Veel Gestelde Vragen</h3>
          
          <div className="space-y-4">
            {[
              {
                q: "Kan ik altijd upgraden of downgraden?",
                a: "Ja, je kunt je abonnement op elk moment wijzigen. Wijzigingen gaan in bij de volgende factuurperiode."
              },
              {
                q: "Wat gebeurt er met mijn trial data?",
                a: "Al je trial data blijft bewaard en wordt automatisch overgenomen in je betaalde plan."
              },
              {
                q: "Is er een setup fee?",
                a: "Nee, er zijn geen setup kosten. Je betaalt alleen het maandelijkse abonnement."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-4">
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;