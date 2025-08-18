import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebsiteRequest {
  name: string;
  description: string;
  businessType: string;
  targetAudience: string;
  colors: string;
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
    colors: "",
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

  const handleFeatureToggle = (feature: string) => {
    setWebsiteRequest(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wand2 className="h-8 w-8 text-primary" />
            AI Website Generator
          </h2>
          <p className="text-muted-foreground">
            Laat AI een complete website maken en direct publiceren in WordPress
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <Zap className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Supabase Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Backend Vereist</h4>
              <p className="text-sm text-amber-700">
                Voor volledige AI generatie en WordPress publicatie moet je eerst Supabase connecteren. 
                Klik op de groene Supabase knop rechts bovenin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Website Generator</TabsTrigger>
          <TabsTrigger value="progress">Generatie Status</TabsTrigger>
          <TabsTrigger value="settings">WordPress Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basis Informatie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Website Basis
                </CardTitle>
                <CardDescription>
                  Vertel ons over je gewenste website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="website-name">Website Naam *</Label>
                  <Input
                    id="website-name"
                    value={websiteRequest.name}
                    onChange={(e) => setWebsiteRequest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Dakdekker Amsterdam Pro"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Beschrijving & Doelen *</Label>
                  <Textarea
                    id="description"
                    value={websiteRequest.description}
                    onChange={(e) => setWebsiteRequest(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Een professionele website voor dakdekkers in Amsterdam. Focus op lokale SEO, portfolio showcase en contact generatie..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="business-type">Type Bedrijf</Label>
                  <select
                    id="business-type"
                    value={websiteRequest.businessType}
                    onChange={(e) => setWebsiteRequest(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Selecteer type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="target-audience">Doelgroep</Label>
                  <Input
                    id="target-audience"
                    value={websiteRequest.targetAudience}
                    onChange={(e) => setWebsiteRequest(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Huiseigenaren in Amsterdam, 30-65 jaar"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Design & Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design & Features
                </CardTitle>
                <CardDescription>
                  Personaliseer het uiterlijk en functionaliteiten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="colors">Kleurvoorkeur</Label>
                  <Input
                    id="colors"
                    value={websiteRequest.colors}
                    onChange={(e) => setWebsiteRequest(prev => ({ ...prev, colors: e.target.value }))}
                    placeholder="Blauw, grijs, professioneel"
                  />
                </div>

                <div>
                  <Label>Gewenste Features</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {featureOptions.map(feature => (
                      <Button
                        key={feature}
                        variant={websiteRequest.features.includes(feature) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFeatureToggle(feature)}
                        className="justify-start h-auto p-2 text-xs"
                      >
                        {feature}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Geselecteerd: {websiteRequest.features.length} features
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <Button 
                onClick={simulateGeneration}
                disabled={isGenerating}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                    Genereren... ({generationSteps[generationStep]})
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Website Genereren & Publiceren
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Generatie Voortgang
              </CardTitle>
              <CardDescription>
                Volg de AI website generatie in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Voortgang</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <div className="space-y-3">
                {generationSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 p-3 border rounded-lg">
                    {index < generationStep ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : index === generationStep && isGenerating ? (
                      <Clock className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-muted rounded-full" />
                    )}
                    <span className={index <= generationStep && isGenerating ? "font-medium" : "text-muted-foreground"}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {!isGenerating && generationStep === 0 && (
                <div className="text-center text-muted-foreground">
                  Start de generator om voortgang te zien
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                WordPress Publicatie
              </CardTitle>
              <CardDescription>
                Configureer je WordPress site voor automatische publicatie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="wp-url">WordPress Site URL</Label>
                <Input
                  id="wp-url"
                  value={websiteRequest.wordpressUrl}
                  onChange={(e) => setWebsiteRequest(prev => ({ ...prev, wordpressUrl: e.target.value }))}
                  placeholder="https://jouwsite.com"
                />
              </div>

              <div>
                <Label htmlFor="wp-username">WordPress Gebruikersnaam</Label>
                <Input
                  id="wp-username"
                  value={websiteRequest.wordpressUsername}
                  onChange={(e) => setWebsiteRequest(prev => ({ ...prev, wordpressUsername: e.target.value }))}
                  placeholder="admin"
                />
              </div>

              <div>
                <Label htmlFor="wp-password">Application Password</Label>
                <Input
                  id="wp-password"
                  type="password"
                  value={websiteRequest.wordpressPassword}
                  onChange={(e) => setWebsiteRequest(prev => ({ ...prev, wordpressPassword: e.target.value }))}
                  placeholder="xxxx xxxx xxxx xxxx"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maak een Application Password aan in WordPress → Users → Profile
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">WordPress Setup Vereisten:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• WordPress REST API ingeschakeld</li>
                  <li>• Application Password aangemaakt</li>
                  <li>• Gebruiker met Editor/Admin rechten</li>
                  <li>• HTTPS verbinding (aanbevolen)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIWebsiteGenerator;