import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Instagram, 
  Facebook, 
  Copy, 
  Download,
  Zap,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SocialMediaAds = () => {
  const [copiedText, setCopiedText] = useState("");
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast({
      title: "Gekopieerd!",
      description: `${type} tekst is gekopieerd naar het klembord`,
    });
    setTimeout(() => setCopiedText(""), 2000);
  };

  const instagramSquareAd = {
    title: "Instagram Feed Post (1:1)",
    dimensions: "1080x1080",
    copy: `🚀 Van Google Sheets naar SEO-proof blogs in minuten!

AutoblogifyAI maakt van jouw spreadsheet automatisch professionele blogposts die converteren.

✅ Volledig geautomatiseerd
✅ SEO-geoptimaliseerd  
✅ WordPress integratie
✅ Bespaar 90% tijd

Perfect voor:
📈 Marketing bureaus
🏢 MKB ondernemers  
💻 Content creators
🎯 SEO specialisten

Start je gratis trial → Link in bio

#contentmarketing #seo #automation #wordpress #ai #marketing`,
    
    visualDescription: "Mockup van AutoblogifyAI dashboard met Google Sheets transformatie naar professionele blog, moderne UI met blauwe accenten",
    
    cta: "Start Gratis Trial"
  };

  const instagramStoryAd = {
    title: "Instagram Story (9:16)",  
    dimensions: "1080x1920",
    copy: `⚡ STOP met handmatig bloggen!

AutoblogifyAI = 
Google Sheets ➡️ SEO Blog

🕐 Van uren naar minuten
📊 Automatische SEO
🔗 Direct naar WordPress
💰 Meer conversie

Probeer GRATIS
👆 Swipe up`,
    
    visualDescription: "Verticale animatie: Google Sheets die transformeert naar een mooie blog, split-screen before/after effect",
    
    cta: "Probeer Gratis"
  };

  const facebookFeedAd = {
    title: "Facebook Feed Post",
    dimensions: "1200x630", 
    copy: `Transformeer je Google Sheets in SEO-proof blogposts binnen minuten! 🚀

Met AutoblogifyAI automatiseer je je complete content workflow:

✅ Importeer data uit Google Sheets
✅ AI genereert professionele blogs  
✅ Automatische SEO optimalisatie
✅ Directe WordPress publicatie
✅ Bespaar 90% van je tijd

Perfect voor marketing bureaus, ondernemers en content creators die schaalbaar willen groeien.

👉 Start je gratis trial vandaag nog!

#AutoblogifyAI #ContentAutomation #SEO #WordPress #MarketingTools`,
    
    visualDescription: "Professional dashboard screenshot van AutoblogifyAI met workflow visualisatie, modern design met blauwe gradient",
    
    cta: "Start Gratis Trial"
  };

  const facebookVideoAd = {
    title: "Facebook Video Ad",
    dimensions: "1200x1200",
    copy: `Van chaos naar content machine in 60 seconden! ⚡

Zie hoe AutoblogifyAI je Google Sheets omzet in krachtige SEO-blogs:

🎯 Upload je spreadsheet
🤖 AI schrijft professionele content  
📈 Automatische SEO optimalisatie
🚀 Publiceer direct naar WordPress

Resultaat? Meer traffic, minder werk!

Krijg toegang tot de tool die content teams wereldwijd gebruiken.`,
    
    visualDescription: "Screen recording van de complete workflow: CSV upload → content generatie → WordPress publicatie, smooth transitions",
    
    cta: "Bekijk Demo"
  };

  const ads = [
    { platform: "instagram-square", icon: Instagram, ...instagramSquareAd },
    { platform: "instagram-story", icon: Instagram, ...instagramStoryAd },
    { platform: "facebook-feed", icon: Facebook, ...facebookFeedAd },
    { platform: "facebook-video", icon: Facebook, ...facebookVideoAd }
  ];

  const downloadAdKit = () => {
    const adKit = ads.map(ad => (
      `=== ${ad.title.toUpperCase()} ===
Afmetingen: ${ad.dimensions}
Platform: ${ad.platform}

COPY:
${ad.copy}

VISUEEL CONCEPT:
${ad.visualDescription}

CALL-TO-ACTION:
${ad.cta}

=====================================

`
    )).join('\n');

    const blob = new Blob([adKit], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AutoblogifyAI-Social-Media-Ad-Kit.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Ad Kit Gedownload!",
      description: "Alle advertentie materialen zijn gedownload",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Instagram className="h-6 w-6 text-pink-500" />
          <Facebook className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold">Social Media Advertenties</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Klaar-voor-gebruik advertenties voor Instagram en Facebook om AutoblogifyAI te promoten
        </p>
        <Button onClick={downloadAdKit} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Complete Ad Kit
        </Button>
      </div>

      {/* Success Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">90%</div>
          <div className="text-sm text-muted-foreground">Tijd besparing</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">3x</div>
          <div className="text-sm text-muted-foreground">Sneller publiceren</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">100%</div>
          <div className="text-sm text-muted-foreground">SEO geoptimaliseerd</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">500+</div>
          <div className="text-sm text-muted-foreground">Tevreden gebruikers</div>
        </div>
      </div>

      <Tabs defaultValue="instagram-square" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="instagram-square" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            <span className="hidden sm:inline">IG Feed</span>
          </TabsTrigger>
          <TabsTrigger value="instagram-story" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            <span className="hidden sm:inline">IG Story</span>
          </TabsTrigger>
          <TabsTrigger value="facebook-feed" className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">FB Feed</span>
          </TabsTrigger>
          <TabsTrigger value="facebook-video" className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">FB Video</span>
          </TabsTrigger>
        </TabsList>

        {ads.map((ad) => (
          <TabsContent key={ad.platform} value={ad.platform}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ad.icon className="h-5 w-5" />
                    {ad.title}
                  </CardTitle>
                  <CardDescription>
                    Afmetingen: {ad.dimensions}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Visual Mockup */}
                  <div 
                    className={`
                      bg-gradient-to-br from-primary/10 to-primary/5 
                      border border-primary/20 rounded-lg p-6 mb-4 
                      flex flex-col items-center justify-center text-center
                      ${ad.platform.includes('story') ? 'aspect-[9/16] max-h-96' : 
                        ad.platform.includes('video') ? 'aspect-square' : 'aspect-video'}
                    `}
                  >
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg">AutoblogifyAI</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {ad.visualDescription}
                      </p>
                      <Button size="sm" className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        {ad.cta}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Copy & Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Advertentie Tekst</CardTitle>
                  <CardDescription>
                    Kopieer deze tekst voor je advertentie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg border max-h-80 overflow-y-auto">
{ad.copy}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 flex items-center gap-1"
                      onClick={() => copyToClipboard(ad.copy, ad.title)}
                    >
                      {copiedText === ad.copy ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copiedText === ad.copy ? "Gekopieerd!" : "Kopieer"}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Visueel Concept:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {ad.visualDescription}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Call-to-Action:</h4>
                      <Badge variant="outline" className="font-medium">
                        {ad.cta}
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    className="w-full flex items-center gap-2"
                    onClick={() => copyToClipboard(ad.copy, ad.title)}
                  >
                    <Copy className="h-4 w-4" />
                    Kopieer Advertentie Tekst
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Best Practices */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tips voor Optimale Resultaten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">📱 Instagram</h4>
              <ul className="space-y-2 text-sm">
                <li>• Gebruik visueel aantrekkelijke mockups</li>
                <li>• Voeg relevante hashtags toe (#contentmarketing, #ai)</li>
                <li>• Test verschillende story formaten</li>
                <li>• Gebruik interactieve elementen (polls, vragen)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">📘 Facebook</h4>
              <ul className="space-y-2 text-sm">
                <li>• Focus op de business value proposition</li>
                <li>• Gebruik social proof en testimonials</li>
                <li>• Test video vs. statische afbeeldingen</li>
                <li>• Optimaliseer voor verschillende doelgroepen</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaAds;