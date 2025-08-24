import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Download,
  Eye,
  Rocket,
  Wrench
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
    "Content planning en structuur",
    "AI tekstgeneratie",
    "Design template selectie", 
    "Afbeeldingen genereren",
    "Website assemblage",
    "WordPress publicatie"
  ];

  const featureOptions = [
    "Contact formulier",
    "Blog sectie", 
    "Portfolio/Galerij",
    "Testimonials",
    "FAQ sectie",
    "Online booking",
    "Social media links",
    "Google Maps",
    "Newsletter signup",
    "E-commerce basis"
  ];

  const businessTypes = [
    "Restaurant/Horeca",
    "Kapperszaak/Salon", 
    "Dakdekker/Bouw",
    "Advocatenkantoor",
    "Tandartspraktijk",
    "Fitness/Yoga",
    "Marketing Bureau",
    "Fotograaf",
    "Consultant",
    "E-commerce/Webshop",
    "Anders"
  ];

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    setWebsiteRequest(prev => ({
      ...prev,
      features: checked
        ? [...prev.features, feature]
        : prev.features.filter(f => f !== feature)
    }));
  };

  const simulateGeneration = async () => {
    setIsGenerating(true);
    setGenerationStep(0);

    // Validatie
    if (!websiteRequest.name.trim() || !websiteRequest.description.trim()) {
      toast({
        title: "Ontbrekende informatie",
        description: "Vul minimaal de website naam en beschrijving in",
        variant: "destructive"
      });
      setIsGenerating(false);
      return;
    }

    // Simuleer stappen
    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsGenerating(false);
    toast({
      title: "Website Gegenereerd! 🎉",
      description: `${websiteRequest.name} is klaar en gepubliceerd op WordPress`
    });
  };

  const progress = isGenerating ? (generationStep / generationSteps.length) * 100 : 0;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-secondary/5 to-accent/5 min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
                <Wand2 className="h-8 w-8 text-primary animate-pulse" />
              </div>
              AI Website Generator
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Laat AI een complete website maken en direct publiceren in WordPress
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 px-4 py-2 text-sm font-bold">
            <Zap className="h-4 w-4 mr-2" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Backend Vereist Alert */}
      <Alert className="border-orange-200 bg-orange-50/80 backdrop-blur-sm">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <div>
          <h4 className="font-semibold text-orange-800 mb-1">Backend Vereist</h4>
          <AlertDescription className="text-orange-700">
            Voor volledige AI generatie en WordPress publicatie moet je eerst Supabase connecteren. Klik op de groene Supabase knop rechts bovenin.
          </AlertDescription>
        </div>
      </Alert>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm">
          <TabsTrigger value="generator" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Website Generator
          </TabsTrigger>
          <TabsTrigger value="status" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Generatie Status
          </TabsTrigger>
          <TabsTrigger value="wordpress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            WordPress Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Website Basis */}
            <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  Website Basis
                </CardTitle>
                <CardDescription className="text-sm">
                  Vertel ons over je gewenste website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="website-name" className="text-sm font-medium">
                    Website Naam *
                  </Label>
                  <Input
                    id="website-name"
                    value={websiteRequest.name}
                    onChange={(e) => setWebsiteRequest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Dakdekker Amsterdam Pro"
                    className="border-border/50 focus:border-primary/50 bg-background/80"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Beschrijving & Doelen *
                  </Label>
                  <Textarea
                    id="description"
                    value={websiteRequest.description}
                    onChange={(e) => setWebsiteRequest(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Een professionele website voor dakdekkers in Amsterdam. Focus op lokale SEO, portfolio showcase en contact generatie..."
                    rows={4}
                    className="border-border/50 focus:border-primary/50 bg-background/80 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-type" className="text-sm font-medium">
                    Type Bedrijf
                  </Label>
                  <Select
                    value={websiteRequest.businessType}
                    onValueChange={(value) => setWebsiteRequest(prev => ({ ...prev, businessType: value }))}
                  >
                    <SelectTrigger className="border-border/50 focus:border-primary/50 bg-background/80">
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/50">
                      {businessTypes.map(type => (
                        <SelectItem key={type} value={type} className="hover:bg-primary/10">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-audience" className="text-sm font-medium">
                    Doelgroep
                  </Label>
                  <Input
                    id="target-audience"
                    value={websiteRequest.targetAudience}
                    onChange={(e) => setWebsiteRequest(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Huiseigenaren in Amsterdam, 30-65 jaar"
                    className="border-border/50 focus:border-primary/50 bg-background/80"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Design & Features */}
            <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20">
                    <Palette className="h-6 w-6 text-accent" />
                  </div>
                  Design & Features
                </CardTitle>
                <CardDescription className="text-sm">
                  Personaliseer het uiterlijk en functionaliteiten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="color-preference" className="text-sm font-medium">
                    Kleurvoorkeur
                  </Label>
                  <Input
                    id="color-preference"
                    value={websiteRequest.colorPreference}
                    onChange={(e) => setWebsiteRequest(prev => ({ ...prev, colorPreference: e.target.value }))}
                    placeholder="Blauw, grijs, professioneel"
                    className="border-border/50 focus:border-accent/50 bg-background/80"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Gewenste Features</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {featureOptions.map(feature => (
                      <div key={feature} className="flex items-center space-x-2 p-2 rounded-lg border border-border/30 bg-background/50 hover:bg-primary/5 transition-colors">
                        <Checkbox
                          id={feature}
                          checked={websiteRequest.features.includes(feature)}
                          onCheckedChange={(checked) => handleFeatureToggle(feature, checked as boolean)}
                          className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label 
                          htmlFor={feature} 
                          className="text-xs font-medium cursor-pointer flex-1 leading-tight"
                        >
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/30">
                    Geselecteerd: {websiteRequest.features.length} features
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate Button */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <Button 
                onClick={simulateGeneration}
                disabled={isGenerating}
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Clock className="mr-3 h-6 w-6 animate-spin" />
                    Genereren... ({generationSteps[generationStep]})
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-3 h-6 w-6" />
                    Website Genereren & Publiceren
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                Generatie Voortgang
              </CardTitle>
              <CardDescription>
                Volg de AI website generatie in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-3 font-medium">
                  <span>Voortgang</span>
                  <span className="text-primary">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-muted/50" />
              </div>

              <div className="space-y-3">
                {generationSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-4 p-4 border border-border/30 rounded-xl bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/30">
                    {index < generationStep ? (
                      <CheckCircle className="h-6 w-6 text-emerald-500 animate-pulse" />
                    ) : index === generationStep && isGenerating ? (
                      <Clock className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <div className="h-6 w-6 border-2 border-muted-foreground/30 rounded-full" />
                    )}
                    <span className={`font-medium ${index <= generationStep && isGenerating ? "text-foreground" : "text-muted-foreground"}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {!isGenerating && generationStep === 0 && (
                <div className="text-center text-muted-foreground bg-muted/20 rounded-xl p-8 border border-dashed border-border/50">
                  <Wand2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Start de generator om voortgang te zien</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wordpress" className="space-y-6">
          <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/20">
                  <Rocket className="h-6 w-6 text-secondary" />
                </div>
                WordPress Publicatie
              </CardTitle>
              <CardDescription>
                Configureer je WordPress site voor automatische publicatie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="wp-url" className="text-sm font-medium">
                  WordPress Site URL
                </Label>
                <Input
                  id="wp-url"
                  value={websiteRequest.wordpressUrl}
                  onChange={(e) => setWebsiteRequest(prev => ({ ...prev, wordpressUrl: e.target.value }))}
                  placeholder="https://jouwsite.com"
                  className="border-border/50 focus:border-secondary/50 bg-background/80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wp-username" className="text-sm font-medium">
                  WordPress Gebruikersnaam
                </Label>
                <Input
                  id="wp-username"
                  value={websiteRequest.wordpressUsername}
                  onChange={(e) => setWebsiteRequest(prev => ({ ...prev, wordpressUsername: e.target.value }))}
                  placeholder="admin"
                  className="border-border/50 focus:border-secondary/50 bg-background/80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wp-password" className="text-sm font-medium">
                  Application Password
                </Label>
                <Input
                  id="wp-password"
                  type="password"
                  value={websiteRequest.wordpressPassword}
                  onChange={(e) => setWebsiteRequest(prev => ({ ...prev, wordpressPassword: e.target.value }))}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="border-border/50 focus:border-secondary/50 bg-background/80"
                />
                <p className="text-xs text-muted-foreground">
                  Maak een Application Password aan in WordPress → Users → Profile
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
                <Wrench className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">WordPress Setup Vereisten:</h4>
                  <AlertDescription>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li>WordPress REST API ingeschakeld</li>
                      <li>Application Password aangemaakt</li>
                      <li>Gebruiker met Editor/Admin rechten</li>
                      <li>HTTPS verbinding (aanbevolen)</li>
                    </ul>
                  </AlertDescription>
                </div>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIWebsiteGenerator;