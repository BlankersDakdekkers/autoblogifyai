import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wand2, 
  Globe, 
  Palette, 
  Settings, 
  Zap, 
  CheckCircle,
  Clock,
  AlertCircle,
  Rocket,
  Wrench,
  Sparkles,
  Brain,
  FileText,
  Image,
  Upload,
  Star,
  ArrowRight,
  Target,
  Users,
  Building,
  Coffee,
  Scissors,
  Home,
  Scale,
  Heart,
  Camera,
  Briefcase,
  ShoppingCart,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Share2,
  BookOpen,
  Award,
  Shield,
  Paintbrush
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebsiteRequest {
  name: string;
  description: string;
  businessType: string;
  targetAudience: string;
  colorPreference: string;
  features: string[];
  wordpressUrl: string;
  wordpressUsername: string;
  wordpressPassword: string;
}

const AIWebsiteGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [activeTab, setActiveTab] = useState("generator");
  const [websiteRequest, setWebsiteRequest] = useState<WebsiteRequest>({
    name: "",
    description: "",
    businessType: "",
    targetAudience: "",
    colorPreference: "",
    features: [],
    wordpressUrl: "",
    wordpressUsername: "",
    wordpressPassword: ""
  });

  const generationSteps = [
    { name: "Content Analysis", description: "AI analyseert je bedrijfsinformatie", icon: Brain },
    { name: "Structure Planning", description: "Website structuur wordt opgezet", icon: FileText },
    { name: "Design Generation", description: "Visueel ontwerp wordt gecreëerd", icon: Paintbrush },
    { name: "Content Creation", description: "AI schrijft professionele content", icon: Sparkles },
    { name: "Image Generation", description: "Unieke afbeeldingen worden gemaakt", icon: Image },
    { name: "WordPress Export", description: "Website wordt gepubliceerd", icon: Upload }
  ];

  const featureOptions = [
    { id: "contact", name: "Contact formulier", icon: Phone, description: "Professioneel contactformulier" },
    { id: "blog", name: "Blog sectie", icon: BookOpen, description: "Content management systeem" },
    { id: "portfolio", name: "Portfolio/Galerij", icon: Camera, description: "Showcase je werk" },
    { id: "testimonials", name: "Testimonials", icon: Award, description: "Klantbeoordelingen" },
    { id: "faq", name: "FAQ sectie", icon: MessageSquare, description: "Veelgestelde vragen" },
    { id: "booking", name: "Online booking", icon: Calendar, description: "Afspraken systeem" },
    { id: "social", name: "Social media links", icon: Share2, description: "Social media integratie" },
    { id: "maps", name: "Google Maps", icon: MapPin, description: "Locatie weergave" },
    { id: "newsletter", name: "Newsletter signup", icon: Mail, description: "E-mail lijst opbouw" },
    { id: "ecommerce", name: "E-commerce basis", icon: ShoppingCart, description: "Online verkoop" }
  ];

  const businessTypes = [
    { id: "restaurant", name: "Restaurant/Horeca", icon: Coffee },
    { id: "salon", name: "Kapperszaak/Salon", icon: Scissors },
    { id: "construction", name: "Dakdekker/Bouw", icon: Home },
    { id: "legal", name: "Advocatenkantoor", icon: Scale },
    { id: "medical", name: "Tandartspraktijk", icon: Heart },
    { id: "fitness", name: "Fitness/Yoga", icon: Target },
    { id: "marketing", name: "Marketing Bureau", icon: Users },
    { id: "photography", name: "Fotograaf", icon: Camera },
    { id: "consulting", name: "Consultant", icon: Briefcase },
    { id: "ecommerce", name: "E-commerce/Webshop", icon: ShoppingCart },
    { id: "other", name: "Anders", icon: MoreHorizontal }
  ];

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    setWebsiteRequest(prev => ({
      ...prev,
      features: checked
        ? [...prev.features, featureId]
        : prev.features.filter(f => f !== featureId)
    }));
  };

  const simulateGeneration = async () => {
    if (!websiteRequest.name.trim() || !websiteRequest.description.trim()) {
      toast({
        title: "⚠️ Ontbrekende informatie",
        description: "Vul minimaal de website naam en beschrijving in",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    setActiveTab("status");

    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    setGenerationStep(generationSteps.length);
    setIsGenerating(false);
    
    toast({
      title: "🎉 Website Succesvol Gegenereerd!",
      description: `${websiteRequest.name} is klaar en gepubliceerd op WordPress`
    });
  };

  const progress = isGenerating ? (generationStep / generationSteps.length) * 100 : 
                  generationStep === generationSteps.length ? 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary/20 to-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-2xl animate-pulse pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 p-6 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-6 py-12">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/20 backdrop-blur-sm">
                <Wand2 className="h-16 w-16 text-primary animate-bounce" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-fade-in">
              AI Website Generator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Laat onze geavanceerde AI een complete, professionele website maken en direct publiceren naar WordPress. 
              <span className="text-primary font-semibold"> Van idee naar live website in minuten.</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-6 py-3 text-base font-bold">
              <Zap className="h-5 w-5 mr-2" />
              AI Powered
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 px-6 py-3 text-base font-bold">
              <Rocket className="h-5 w-5 mr-2" />
              Direct Live
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 px-6 py-3 text-base font-bold">
              <Shield className="h-5 w-5 mr-2" />
              Professioneel
            </Badge>
          </div>
        </div>

        {/* Setup Required Alert */}
        <Alert className="max-w-4xl mx-auto border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 backdrop-blur-sm shadow-lg">
          <AlertCircle className="h-6 w-6 text-orange-600" />
          <div>
            <h4 className="font-bold text-orange-800 text-lg mb-2">🔧 Backend Setup Vereist</h4>
            <AlertDescription className="text-orange-700 text-base">
              Voor volledige AI generatie en WordPress publicatie moet je eerst de backend connecteren. 
              <span className="font-semibold"> Klik op de groene Supabase knop rechtsboven.</span>
            </AlertDescription>
          </div>
        </Alert>

        {/* Main Interface */}
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 h-16 bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg">
              <TabsTrigger value="generator" className="h-12 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
                <Wand2 className="h-5 w-5 mr-2" />
                Website Generator
              </TabsTrigger>
              <TabsTrigger value="status" className="h-12 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
                <Settings className="h-5 w-5 mr-2" />
                Generatie Status
              </TabsTrigger>
              <TabsTrigger value="wordpress" className="h-12 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
                <Rocket className="h-5 w-5 mr-2" />
                WordPress Setup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Website Basis */}
                <Card className="group bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                        <Globe className="h-8 w-8 text-primary group-hover:animate-pulse" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                          Website Basis
                        </CardTitle>
                        <CardDescription className="text-base">
                          Vertel ons over je gewenste website
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="website-name" className="text-base font-semibold flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        Website Naam *
                      </Label>
                      <Input
                        id="website-name"
                        value={websiteRequest.name}
                        onChange={(e) => setWebsiteRequest(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Dakdekker Amsterdam Pro"
                        className="h-12 text-base border-border/50 focus:border-primary/50 bg-background/80 backdrop-blur-sm"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Beschrijving & Doelen *
                      </Label>
                      <Textarea
                        id="description"
                        value={websiteRequest.description}
                        onChange={(e) => setWebsiteRequest(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Een professionele website voor dakdekkers in Amsterdam. Focus op lokale SEO, portfolio showcase en contact generatie. Moderne uitstraling die vertrouwen wekt bij potentiële klanten..."
                        rows={5}
                        className="text-base border-border/50 focus:border-primary/50 bg-background/80 backdrop-blur-sm resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        Type Bedrijf
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {businessTypes.map(type => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.id}
                              onClick={() => setWebsiteRequest(prev => ({ ...prev, businessType: type.id }))}
                              className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                                websiteRequest.businessType === type.id
                                  ? 'border-primary bg-gradient-to-r from-primary/10 to-accent/5 shadow-lg'
                                  : 'border-border/30 bg-background/50 hover:border-primary/30 hover:bg-primary/5'
                              }`}
                            >
                              <Icon className={`h-5 w-5 ${websiteRequest.businessType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
                              <span className={`text-sm font-medium ${websiteRequest.businessType === type.id ? 'text-primary' : 'text-foreground'}`}>
                                {type.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="target-audience" className="text-base font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Doelgroep
                      </Label>
                      <Input
                        id="target-audience"
                        value={websiteRequest.targetAudience}
                        onChange={(e) => setWebsiteRequest(prev => ({ ...prev, targetAudience: e.target.value }))}
                        placeholder="Huiseigenaren in Amsterdam, 30-65 jaar, midden tot hoog inkomen"
                        className="h-12 text-base border-border/50 focus:border-primary/50 bg-background/80 backdrop-blur-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Design & Features */}
                <Card className="group bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-accent/20 hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20 group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-300">
                        <Palette className="h-8 w-8 text-accent group-hover:animate-pulse" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold group-hover:text-accent transition-colors">
                          Design & Features
                        </CardTitle>
                        <CardDescription className="text-base">
                          Personaliseer uitstraling en functionaliteiten
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="color-preference" className="text-base font-semibold flex items-center gap-2">
                        <Paintbrush className="h-4 w-4 text-accent" />
                        Kleurvoorkeur
                      </Label>
                      <Input
                        id="color-preference"
                        value={websiteRequest.colorPreference}
                        onChange={(e) => setWebsiteRequest(prev => ({ ...prev, colorPreference: e.target.value }))}
                        placeholder="Blauw en wit, professioneel, modern, vertrouwenwekkend"
                        className="h-12 text-base border-border/50 focus:border-accent/50 bg-background/80 backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        Gewenste Features
                      </Label>
                      <div className="grid grid-cols-1 gap-3">
                        {featureOptions.map(feature => {
                          const Icon = feature.icon;
                          const isSelected = websiteRequest.features.includes(feature.id);
                          return (
                            <div
                              key={feature.id}
                              className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                                isSelected
                                  ? 'border-accent bg-gradient-to-r from-accent/10 to-accent/5 shadow-lg'
                                  : 'border-border/30 bg-background/50 hover:border-accent/30 hover:bg-accent/5'
                              }`}
                              onClick={() => handleFeatureToggle(feature.id, !isSelected)}
                            >
                              <div className="flex items-center gap-4">
                                <Checkbox
                                  checked={isSelected}
                                  className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                />
                                <Icon className={`h-5 w-5 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                                <div className="flex-1">
                                  <div className={`font-medium ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                                    {feature.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {feature.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-center bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20">
                        <span className="text-accent font-bold text-lg">
                          {websiteRequest.features.length} features geselecteerd
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Generate Button */}
              <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/30 shadow-2xl backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Klaar om te starten?</h3>
                      <p className="text-muted-foreground text-lg">
                        Onze AI zal een professionele website creëren gebaseerd op jouw specificaties
                      </p>
                    </div>
                    <Button 
                      onClick={simulateGeneration}
                      disabled={isGenerating}
                      className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="mr-3 h-6 w-6 animate-spin" />
                          AI aan het werk...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-3 h-6 w-6" />
                          Website Genereren & Publiceren
                          <ArrowRight className="ml-3 h-6 w-6" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-8">
              <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-border/50 shadow-2xl">
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                      <Brain className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    AI Website Generatie
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Volg de voortgang terwijl onze AI jouw website creëert
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Progress Overview */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Totale Voortgang</span>
                      <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-4 bg-muted/50" />
                  </div>

                  {/* Generation Steps */}
                  <div className="space-y-4">
                    {generationSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index < generationStep;
                      const isActive = index === generationStep && isGenerating;
                      
                      return (
                        <div key={index} className={`relative p-6 rounded-xl border transition-all duration-500 ${
                          isCompleted ? 'border-green-500/30 bg-gradient-to-r from-green-50/80 to-emerald-50/80' :
                          isActive ? 'border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg' :
                          'border-border/30 bg-background/50'
                        }`}>
                          <div className="flex items-center gap-6">
                            <div className={`p-3 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' :
                              isActive ? 'bg-gradient-to-r from-primary to-accent' :
                              'bg-muted'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-8 w-8 text-white" />
                              ) : isActive ? (
                                <Icon className="h-8 w-8 text-white animate-pulse" />
                              ) : (
                                <Icon className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-xl font-bold mb-1 ${
                                isCompleted ? 'text-green-700' :
                                isActive ? 'text-primary' :
                                'text-muted-foreground'
                              }`}>
                                {step.name}
                              </h4>
                              <p className={`${
                                isCompleted ? 'text-green-600' :
                                isActive ? 'text-foreground' :
                                'text-muted-foreground'
                              }`}>
                                {step.description}
                              </p>
                            </div>
                            {isActive && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {generationStep === generationSteps.length && !isGenerating && (
                    <div className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-700 mb-2">Website Succesvol Gegenereerd! 🎉</h3>
                      <p className="text-green-600 text-lg">Je website is klaar en gepubliceerd op WordPress</p>
                    </div>
                  )}

                  {!isGenerating && generationStep === 0 && (
                    <div className="text-center p-12 bg-muted/20 rounded-xl border border-dashed border-border/50">
                      <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-xl font-semibold text-muted-foreground mb-2">Wachtend op Start</h3>
                      <p className="text-muted-foreground">Start de generator om de AI-magie te zien gebeuren</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wordpress" className="space-y-8">
              <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-secondary/20 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/20">
                      <Rocket className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">WordPress Publicatie Setup</CardTitle>
                      <CardDescription className="text-base">
                        Configureer je WordPress site voor automatische publicatie
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="wp-url" className="text-base font-semibold flex items-center gap-2">
                        <Globe className="h-4 w-4 text-secondary" />
                        WordPress Site URL
                      </Label>
                      <Input
                        id="wp-url"
                        value={websiteRequest.wordpressUrl}
                        onChange={(e) => setWebsiteRequest(prev => ({ ...prev, wordpressUrl: e.target.value }))}
                        placeholder="https://jouwsite.com"
                        className="h-12 text-base border-border/50 focus:border-secondary/50 bg-background/80"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="wp-username" className="text-base font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-secondary" />
                        WordPress Gebruikersnaam
                      </Label>
                      <Input
                        id="wp-username"
                        value={websiteRequest.wordpressUsername}
                        onChange={(e) => setWebsiteRequest(prev => ({ ...prev, wordpressUsername: e.target.value }))}
                        placeholder="admin"
                        className="h-12 text-base border-border/50 focus:border-secondary/50 bg-background/80"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="wp-password" className="text-base font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-secondary" />
                      Application Password
                    </Label>
                    <Input
                      id="wp-password"
                      type="password"
                      value={websiteRequest.wordpressPassword}
                      onChange={(e) => setWebsiteRequest(prev => ({ ...prev, wordpressPassword: e.target.value }))}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="h-12 text-base border-border/50 focus:border-secondary/50 bg-background/80"
                    />
                    <p className="text-sm text-muted-foreground">
                      Maak een Application Password aan: WordPress → Users → Profile → Application Passwords
                    </p>
                  </div>

                  <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 backdrop-blur-sm">
                    <Wrench className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-blue-800 text-lg mb-3">WordPress Setup Checklist:</h4>
                      <AlertDescription>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-blue-700">WordPress REST API ingeschakeld</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-blue-700">Application Password aangemaakt</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-blue-700">Editor/Admin rechten</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-blue-700">HTTPS verbinding actief</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </div>
                  </Alert>

                  <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl p-6 border border-secondary/20">
                    <h4 className="font-bold text-secondary mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Pro Tips voor Optimale Resultaten:
                    </h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Zorg dat je WordPress up-to-date is voor beste compatibiliteit</li>
                      <li>• Test de connection eerst met een dummy post</li>
                      <li>• Maak een backup van je site voordat je publiceert</li>
                      <li>• Gebruik een staging environment voor eerste tests</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AIWebsiteGenerator;