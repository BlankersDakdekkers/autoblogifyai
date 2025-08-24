import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, ResponsiveGrid } from "@/components/ui/responsive-components";
import { useIsMobile } from "@/utils/responsive";
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  Play, 
  FileText, 
  Database, 
  Settings, 
  TrendingUp,
  Sparkles,
  Timer,
  DollarSign,
  BarChart3,
  User,
  Target,
  Zap,
  Clock,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  action?: () => Promise<boolean> | void;
  route?: string;
  skipable?: boolean;
}

const OnboardingPage = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingProgress, setOnboardingProgress] = useState(0);
  const [showSuccessMetrics, setShowSuccessMetrics] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.display_name || '',
    bio: profile?.bio || '',
    goals: [] as string[],
  });

  const goalOptions = [
    'Content schaalbaar maken',
    'SEO verbeteren', 
    'Tijd besparen',
    'Meer organisch verkeer',
    'Brand autoriteit opbouwen',
    'Lead generatie',
  ];

  const createDemoData = async (): Promise<boolean> => {
    try {
      // Check if demo data already exists
      const { data: existingPosts } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);

      if (existingPosts && existingPosts.length > 0) {
        toast({
          title: "✅ Demo data al aanwezig!",
          description: "Je hebt al content in je account.",
        });
        return true;
      }

      const demoPosts = [
        {
          user_id: user?.id,
          title: "Dakbedekking Renovatie Amsterdam - Complete Gids 2024",
          slug: "dakbedekking-renovatie-amsterdam-2024",
          body_markdown: `# Dakbedekking Renovatie Amsterdam - Complete Gids 2024

## Waarom Dakbedekking Renovatie Belangrijk Is

Uw dak beschermt uw huis tegen weer en wind. Een goede dakbedekking voorkomt:
- Lekkages en waterschade
- Energieverlies door slechte isolatie
- Structurele schade aan uw woning

## Onze Dakbedekking Services in Amsterdam

### Bitumen Dakbedekking
Bitumen is een populaire keuze vanwege:
- Langdurige bescherming (20+ jaar)
- Uitstekende waterdichtheid
- Kosteneffectieve oplossing

### EPDM Rubber Dakbedekking
EPDM rubber biedt:
- Flexibiliteit bij temperatuurwisselingen
- UV-bestendigheid
- Milieuvriendelijke optie

## Waarom Kiezen Voor Onze Service?

✅ **15+ jaar ervaring** in Amsterdam en omgeving
✅ **Gecertificeerde dakdekkers** met vakkennis
✅ **Garantie tot 10 jaar** op alle werkzaamheden
✅ **Gratis offerte** binnen 24 uur

## Contact & Offerte

Bel vandaag nog voor een **gratis inspectie**: 020-123-4567`,
          status: "publish",
          publish_date: new Date().toISOString().split('T')[0],
          meta_title: "Dakbedekking Renovatie Amsterdam | Professionele Dakdekkers",
          meta_description: "Professionele dakbedekking renovatie in Amsterdam. ✅ 15+ jaar ervaring ✅ 10 jaar garantie ✅ Gratis offerte. Bel nu: 020-123-4567",
          hero_image_url: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&h=400&fit=crop",
          hero_image_alt: "Professionele dakdekker bezig met dakbedekking renovatie",
          city: "Amsterdam",
          tags: ["dakbedekking", "renovatie", "amsterdam", "bitumen", "epdm"],
          author: "AutoblogifyAI Demo",
          cta_heading: "Gratis Dakbedekking Offerte",
          cta_subtext: "Krijg binnen 24 uur een persoonlijke offerte van onze gecertificeerde dakdekkers",
          faq_json: [
            {
              "q": "Hoelang duurt een dakbedekking renovatie?",
              "a": "Gemiddeld 2-5 dagen, afhankelijk van de grootte en complexiteit van uw dak."
            },
            {
              "q": "Welke garantie krijg ik op het werk?",
              "a": "Wij bieden tot 10 jaar garantie op alle dakbedekking werkzaamheden."
            }
          ],
          word_count: 420
        },
        {
          user_id: user?.id,
          title: "Loodgieter Amsterdam 24/7 - Spoedservice & Reparaties",
          slug: "loodgieter-amsterdam-24-7-spoedservice",
          body_markdown: `# Loodgieter Amsterdam 24/7 - Spoedservice & Reparaties

## Loodgieter Nodig in Amsterdam? Wij Zijn Er 24/7!

Leidingproblemen kunnen op elk moment ontstaan. Onze ervaren loodgieters staan **24 uur per dag, 7 dagen per week** voor u klaar in Amsterdam en omgeving.

## Onze Loodgieter Services

### Spoedservice (24/7)
- **Lekkages** direct gestopt
- **Verstoppingen** binnen 1 uur opgelost  
- **CV-storingen** snel hersteld
- **Waterleiding problemen** direct aangepakt

### Reguliere Werkzaamheden
- Badkamer renovaties
- Keuken installaties
- CV-ketel onderhoud
- Sanitair vervangingen

## Waarom Onze Loodgieter Service?

🔧 **Binnen 30 minuten ter plaatse** (spoedservice)
🔧 **Transparante prijzen** - geen verrassingen
🔧 **Vakbekwame loodgieters** met certificaten
🔧 **2 jaar garantie** op alle werkzaamheden

## Contact

**Spoed? Bel direct: 06-12345678**
**Reguliere afspraak: 020-987-6543**`,
          status: "publish",
          publish_date: new Date().toISOString().split('T')[0],
          meta_title: "Loodgieter Amsterdam 24/7 | Spoedservice binnen 30 min",
          meta_description: "Loodgieter Amsterdam 24/7 spoedservice! ⚡ Binnen 30 min ter plaatse ⚡ 2 jaar garantie ⚡ Transparante prijzen. Spoed? Bel: 06-12345678",
          hero_image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=400&fit=crop",
          hero_image_alt: "Professionele loodgieter aan het werk in Amsterdam",
          city: "Amsterdam",
          tags: ["loodgieter", "amsterdam", "spoedservice", "24/7", "reparatie"],
          author: "AutoblogifyAI Demo",
          cta_heading: "Spoedhulp Nodig?",
          cta_subtext: "Bel nu en wij zijn binnen 30 minuten bij u voor spoedservice",
          faq_json: [
            {
              "q": "Hoe snel zijn jullie ter plaatse bij spoedservice?",
              "a": "Bij spoedservice zijn wij binnen 30 minuten ter plaatse in Amsterdam."
            },
            {
              "q": "Werken jullie ook in het weekend?",
              "a": "Ja, onze spoedservice is 24/7 beschikbaar, ook in weekenden en feestdagen."
            }
          ],
          word_count: 380
        }
      ];

      for (const post of demoPosts) {
        await supabase.from('blog_posts').insert(post);
      }

      toast({
        title: "✅ Demo data aangemaakt!",
        description: "Je hebt nu 2 voorbeeldartikelen om mee te experimenteren.",
      });

      return true;
    } catch (error) {
      console.error('Error creating demo data:', error);
      toast({
        title: "Fout bij demo data",
        description: "Er ging iets mis bij het aanmaken van demo data.",
        variant: "destructive"
      });
      return false;
    }
  };

  const saveProfile = async (): Promise<boolean> => {
    try {
      if (!formData.displayName.trim()) {
        toast({
          title: "Naam vereist",
          description: "Vul je naam in om door te gaan.",
          variant: "destructive"
        });
        return false;
      }

      await updateProfile({
        display_name: formData.displayName,
        bio: formData.bio,
      });

      toast({
        title: "✅ Profiel opgeslagen!",
        description: "Je persoonlijke informatie is bijgewerkt.",
      });

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Er ging iets mis bij het opslaan van je profiel.",
        variant: "destructive"
      });
      return false;
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welkom bij AutoblogifyAI! 🎉",
      description: "Laten we je account instellen en je eerste content genereren.",
      icon: Sparkles,
      completed: false,
    },
    {
      id: "profile",
      title: "Persoonlijke Informatie",
      description: "Vertel ons iets over jezelf en je doelen.",
      icon: User,
      completed: false,
      action: saveProfile
    },
    {
      id: "demo-data",
      title: "Demo Content Aanmaken",
      description: "Maak voorbeeldartikelen aan om de kracht van AI content te zien.",
      icon: Database,
      completed: false,
      action: createDemoData
    },
    {
      id: "explore-posts",
      title: "Verken je Content",
      description: "Bekijk je gegenereerde artikelen en leer hoe je ze kunt bewerken.",
      icon: FileText,
      completed: false,
      route: "/auto-blog-producer",
      skipable: true
    },
    {
      id: "setup-preferences",
      title: "Voorkeuren Instellen",
      description: "Personaliseer je AI instellingen voor optimale resultaten.",
      icon: Settings,
      completed: false,
      route: "/template-editor",
      skipable: true
    }
  ];

  useEffect(() => {
    if (user && profile) {
      setFormData({
        displayName: profile?.display_name || '',
        bio: profile?.bio || '',
        goals: [],
      });
    }
  }, [user, profile]);

  useEffect(() => {
    const completedSteps = steps.filter((step, index) => step.completed || index < currentStep).length;
    setOnboardingProgress((completedSteps / steps.length) * 100);
  }, [currentStep, steps]);

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleStepAction = async (step: OnboardingStep, index: number) => {
    if (step.action) {
      const success = await step.action();
      if (success) {
        steps[index].completed = true;
        setCurrentStep(index + 1);
      }
    } else if (step.route) {
      navigate(step.route);
    } else {
      setCurrentStep(index + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      await updateProfile({ onboarding_completed: true });
      setShowSuccessMetrics(true);
      
      toast({
        title: "🎉 Onboarding Compleet!",
        description: "Je bent nu klaar om duizenden artikelen te genereren!",
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (showSuccessMetrics) {
    return (
      <ResponsiveContainer className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Card className="max-w-3xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-4xl mb-4">🎉 Gefeliciteerd!</CardTitle>
            <CardDescription className="text-lg">
              Je hebt de onboarding succesvol afgerond. Hier is wat je nu kunt verwachten:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <ResponsiveGrid columns={{ xs: 1, md: 3 }} gap="md">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <Timer className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-700">95%</div>
                <div className="text-sm text-green-600 font-medium">Tijdsbesparing</div>
                <div className="text-xs text-green-500 mt-1">vs handmatig schrijven</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <DollarSign className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-700">€15k+</div>
                <div className="text-sm text-blue-600 font-medium">Maandelijkse besparing</div>
                <div className="text-xs text-blue-500 mt-1">aan content kosten</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <FileText className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-700">1000+</div>
                <div className="text-sm text-purple-600 font-medium">Artikelen per maand</div>
                <div className="text-xs text-purple-500 mt-1">volledig geautomatiseerd</div>
              </div>
            </ResponsiveGrid>
            
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-xl text-center border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">Ready to Launch! 🚀</h3>
              </div>
              <p className="text-muted-foreground text-lg mb-4">
                Je wordt doorgestuurd naar het dashboard...
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Setup: 2 minuten</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>Success rate: 98.7%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span>Time to first article: &lt;5 min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="py-4 sm:py-8">
        {/* Enhanced Header - Mobile Optimized */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welkom bij AutoblogifyAI! 🚀
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto">
              Laten we je account instellen zodat je direct kunt beginnen met het genereren van geweldige content.
            </p>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="max-w-md mx-auto mb-6 sm:mb-8 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2">
              <span className="font-medium">Voortgang</span>
              <span className="font-semibold text-primary">{Math.round(onboardingProgress)}% compleet</span>
            </div>
            <div className="relative">
              <Progress 
                value={onboardingProgress} 
                className="h-2 sm:h-3 bg-gradient-to-r from-muted/50 to-muted/30" 
              />
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
                style={{ width: `${onboardingProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Stap {currentStep + 1} van {steps.length}</p>
          </div>
        </div>

        <ResponsiveGrid 
          columns={{ xs: 1, lg: 1 }}
          gap="md"
          className="max-w-4xl mx-auto"
        >
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === currentStep;
            const isCompleted = step.completed || index < currentStep;
            
            return (
              <Card 
                key={step.id} 
                className={`transition-all duration-300 ${
                  isActive 
                    ? 'ring-2 ring-primary shadow-lg scale-[1.02] bg-gradient-to-r from-primary/5 to-accent/5' 
                    : isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'opacity-60'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <IconComponent className="h-6 w-6" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                          {step.title}
                          {isCompleted && <Badge variant="secondary" className="bg-green-100 text-green-700">Voltooid</Badge>}
                          {isActive && <Badge variant="default">Actief</Badge>}
                        </h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    
                    {isActive && !isCompleted && (
                      <div className="flex gap-2">
                        {step.skipable && (
                          <Button 
                            variant="outline" 
                            onClick={handleSkip}
                            size="sm"
                          >
                            Overslaan
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleStepAction(step, index)}
                          className="flex items-center gap-2"
                        >
                          {step.action ? <Play className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                          {step.action ? 'Uitvoeren' : 'Ga naar'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Profile form for step 1 */}
                  {isActive && step.id === 'profile' && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Weergavenaam *</Label>
                          <Input
                            id="displayName"
                            placeholder="Hoe wil je genoemd worden?"
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio (optioneel)</Label>
                          <Input
                            id="bio"
                            placeholder="Vertel iets over jezelf..."
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Wat zijn je doelen? (optioneel)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {goalOptions.map((goal) => (
                            <div
                              key={goal}
                              className={`p-2 border rounded-lg cursor-pointer transition-all text-sm ${
                                formData.goals.includes(goal)
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => handleGoalToggle(goal)}
                            >
                              <div className="flex items-center space-x-2">
                                {formData.goals.includes(goal) && (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                                <span className="font-medium">{goal}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {currentStep >= steps.length && (
            <div className="text-center mt-8">
              <Button 
                onClick={completeOnboarding} 
                size="lg" 
                className="text-lg px-8 py-4"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Onboarding Afronden
              </Button>
            </div>
          )}
        </ResponsiveGrid>
      </div>
    </ResponsiveContainer>
  );
};

export default OnboardingPage;