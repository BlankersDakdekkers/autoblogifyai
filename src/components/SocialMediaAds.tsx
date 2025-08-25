import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  CheckCircle2,
  Target,
  BarChart3,
  DollarSign,
  Eye,
  UserPlus,
  RefreshCw,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SocialMediaAds = () => {
  const [copiedText, setCopiedText] = useState("");
  const [selectedCampaignType, setSelectedCampaignType] = useState("conversion");
  const [selectedAudience, setSelectedAudience] = useState("mkb");
  const [selectedVariant, setSelectedVariant] = useState("A");
  const { toast } = useToast();

  const campaignTypes = [
    { id: "awareness", label: "Brand Awareness", icon: Eye, color: "blue" },
    { id: "leadgen", label: "Lead Generation", icon: UserPlus, color: "green" },
    { id: "conversion", label: "Conversion", icon: DollarSign, color: "orange" },
    { id: "retargeting", label: "Retargeting", icon: RefreshCw, color: "purple" }
  ];

  const audiences = [
    { id: "mkb", label: "MKB Ondernemers", description: "Kleine en middelgrote bedrijven" },
    { id: "agencies", label: "Marketing Bureaus", description: "Digital marketing agencies" },
    { id: "freelancers", label: "Freelancers", description: "Zelfstandige content creators" },
    { id: "enterprise", label: "Enterprise", description: "Grote organisaties" }
  ];

  const variants = ["A", "B", "C"];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast({
      title: "Gekopieerd!",
      description: `${type} tekst is gekopieerd naar het klembord`,
    });
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Dynamic ad content based on selections
  const getAdContent = (platform: string, format: string) => {
    const campaignType = selectedCampaignType;
    const audience = selectedAudience;
    const variant = selectedVariant;

    const contentMatrix = {
      // Instagram Feed Posts
      "instagram-feed": {
        awareness: {
          mkb: {
            A: {
              copy: `🚀 Kennis je AutoblogifyAI al?

Van Google Sheets naar SEO-proof blogs in minuten! Perfect voor drukke ondernemers die geen tijd hebben voor handmatig bloggen.

✅ 90% sneller dan traditioneel bloggen
✅ Automatische SEO optimalisatie  
✅ Direct naar WordPress
✅ Professionele resultaten

Over 500+ MKB bedrijven gebruiken AutoblogifyAI al voor hun content marketing.

Ontdek waarom → Link in bio

#mkb #contentmarketing #automatisering #seo #wordpress`,
              cta: "Ontdek AutoblogifyAI",
              targeting: "MKB eigenaren, 25-55 jaar, geïnteresseerd in marketing automation"
            },
            B: {
              copy: `📊 Nog steeds handmatig blogs schrijven?

AutoblogifyAI transformeert je spreadsheet data in complete SEO artikelen. Binnen 5 minuten heb je professionele content klaar voor publicatie.

🎯 Perfect voor MKB:
• Bespaar 15+ uur per week
• Consistente content kwaliteit  
• Automatische WordPress sync
• ROI tracking ingebouwd

"Onze content output is verdrievoudigd!" - Johan, MKB eigenaar

Start vandaag → Link in bio

#mkbgroei #contentautomation #tijdbesparing`,
              cta: "Probeer Gratis",
              targeting: "MKB eigenaren met 5-50 medewerkers, marketing budget €1000+"
            },
            C: {
              copy: `⚡ STOP met content chaos!

MKB ondernemers kiezen AutoblogifyAI omdat het:
→ Hun marketing tijd halveert
→ Meer leads genereert  
→ Professioneler oogt dan de concurrentie

Vandaag nog 50% korting voor nieuwe MKB klanten!
Gebruik code: MKB50

Claim je deal → Link in bio
⏰ Geldig t/m vrijdag

#mkbaanbieding #contentmarketing #specialedeal`,
              cta: "Claim 50% Korting",
              targeting: "Warme leads, bezoekers website laatste 30 dagen"
            }
          },
          agencies: {
            A: {
              copy: `🎯 Schaal je content productie op zonder extra overhead

AutoblogifyAI helpt agencies 10x meer content produceren met hetzelfde team. Van client spreadsheets naar publishable blogs in minuten.

✅ White-label oplossing
✅ Bulk processing voor meerdere clients
✅ API integratie mogelijk
✅ Marge-vriendelijke pricing

Bekijk onze agency case studies → Link in bio

#digitalagency #contentscaling #whitelabel #automation`,
              cta: "Bekijk Agency Oplossing",
              targeting: "Digital marketing agencies, 10-100 medewerkers"
            }
          }
        },
        leadgen: {
          mkb: {
            A: {
              copy: `🎁 GRATIS Content Audit voor MKB bedrijven!

Ontdek hoeveel tijd en geld je bespaart door je content te automatiseren. Onze experts analyseren je huidige workflow en tonen je het potentieel van AutoblogifyAI.

Wat krijg je:
✅ Persoonlijke demo (15 min)
✅ Content strategie review  
✅ ROI calculatie
✅ Implementatie roadmap

Slechts 10 plekken beschikbaar deze maand!

Claim je gratis audit ↓`,
              cta: "Claim Gratis Audit",
              targeting: "MKB beslissers, marketing managers"
            }
          }
        },
        conversion: {
          mkb: {
            A: {
              copy: `⚡ Laatste kans: 7 dagen gratis trial + setup

Duizenden MKB bedrijven automatiseren al hun content met AutoblogifyAI. Wordt jij de volgende?

🚀 Start vandaag met:
✅ Volledige setup door ons team
✅ 7 dagen unlimited gebruik
✅ Persoonlijke onboarding call
✅ Geld-terug-garantie

⏰ Aanbieding eindigt za 23:59

Waarom wachten? Start nu →`,
              cta: "Start 7-Dagen Trial",
              targeting: "Warme leads, demo bezoekers laatste 14 dagen"
            },
            B: {
              copy: `🔥 Dit weekend alleen: 60% korting + bonus

Als MKB ondernemer weet je hoe duur content kan zijn. Met AutoblogifyAI krijg je enterprise-level content voor een fractie van de kosten.

💰 Weekend Deal:
• 60% korting eerste jaar
• Gratis WordPress setup  
• Bonus: 50 premium templates
• Priority support

Timer loopt... ⏰

Mis deze deal niet →`,
              cta: "Pak De Deal",
              targeting: "Pricing page bezoekers, cart abandoners"
            }
          }
        }
      },
      // Facebook Feed Posts
      "facebook-feed": {
        conversion: {
          mkb: {
            A: {
              copy: `🚀 Stop met dure contentbureaus - Automatiseer je content productie!

Als MKB ondernemer betaal je waarschijnlijk €2000+ per maand voor content. AutoblogifyAI doet hetzelfde voor minder dan €100.

💡 Resultaat na 30 dagen:
→ 75% minder content kosten
→ 3x sneller publiceren  
→ Betere SEO rankings
→ Meer website traffic

"We besparen €30.000 per jaar op content kosten!" - Sarah, webshop eigenaar

🎯 Speciale MKB actie: Eerste maand gratis + persoonlijke setup

Bereken je besparing in 2 minuten →

#mkbbesparing #contentautomation #kostenreductie #roi`,
              cta: "Bereken Je Besparing",
              targeting: "MKB, marketing budget €1000+, contentkosten"
            }
          }
        }
      }
    };

    const defaultContent = {
      copy: "Content wordt geladen...",
      cta: "Meer Info",
      targeting: "Algemene doelgroep"
    };

    return contentMatrix[platform]?.[campaignType]?.[audience]?.[variant] || defaultContent;
  };

  const getCurrentAds = () => {
    const baseAds = [
      {
        platform: "instagram-feed",
        icon: Instagram,
        title: "Instagram Feed Post",
        dimensions: "1080x1080",
        visualDescription: "Moderne carousel met AutoblogifyAI dashboard screenshots, voor/na vergelijking, testimonial quotes overlay"
      },
      {
        platform: "instagram-story", 
        icon: Instagram,
        title: "Instagram Story",
        dimensions: "1080x1920",
        visualDescription: "Verticale animatie met swipe-up CTA, progress indicators, urgentie timer"
      },
      {
        platform: "facebook-feed",
        icon: Facebook,
        title: "Facebook Feed Post", 
        dimensions: "1200x630",
        visualDescription: "Professional hero image met conversion-focus, testimonials sidebar, duidelijke value proposition"
      },
      {
        platform: "facebook-video",
        icon: Facebook,
        title: "Facebook Video Ad",
        dimensions: "1200x1200", 
        visualDescription: "Screen recording met voice-over, pain points visualization, solution demo, strong CTA overlay"
      }
    ];

    return baseAds.map(ad => {
      const content = getAdContent(ad.platform, "");
      return {
        ...ad,
        ...content,
        campaignType: selectedCampaignType,
        audience: selectedAudience,
        variant: selectedVariant
      };
    });
  };

  const currentAds = getCurrentAds();

  const downloadAdKit = () => {
    const selectedCampaign = campaignTypes.find(c => c.id === selectedCampaignType);
    const selectedAud = audiences.find(a => a.id === selectedAudience);
    
    const adKit = currentAds.map(ad => (
      `=== ${ad.title.toUpperCase()} - ${selectedCampaign?.label} - ${selectedAud?.label} - Variant ${selectedVariant} ===
Afmetingen: ${ad.dimensions}
Platform: ${ad.platform}
Campagne Type: ${selectedCampaign?.label}
Doelgroep: ${selectedAud?.label}
Variant: ${selectedVariant}

COPY:
${ad.copy}

VISUEEL CONCEPT:
${ad.visualDescription}

CALL-TO-ACTION:
${ad.cta}

TARGETING SUGGESTIE:
${ad.targeting}

VERWACHTE METRICS:
- CTR: ${getCTREstimate(ad.platform, selectedCampaignType)}%
- CPC: €${getCPCEstimate(ad.platform, selectedCampaignType)}
- Conversion Rate: ${getConversionEstimate(selectedCampaignType)}%

=====================================

`
    )).join('\n');

    const blob = new Blob([adKit], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutoblogifyAI-${selectedCampaign?.label}-${selectedAud?.label}-Variant-${selectedVariant}-Ad-Kit.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Ad Kit Gedownload!",
      description: `${selectedCampaign?.label} advertenties voor ${selectedAud?.label} zijn gedownload`,
    });
  };

  const getCTREstimate = (platform: string, campaignType: string) => {
    const estimates = {
      'instagram-feed': { awareness: 1.2, leadgen: 2.1, conversion: 3.8, retargeting: 5.2 },
      'instagram-story': { awareness: 1.8, leadgen: 3.2, conversion: 4.5, retargeting: 6.1 },
      'facebook-feed': { awareness: 1.1, leadgen: 1.9, conversion: 3.2, retargeting: 4.8 },
      'facebook-video': { awareness: 2.1, leadgen: 3.8, conversion: 5.2, retargeting: 7.3 }
    };
    return estimates[platform]?.[campaignType] || 2.0;
  };

  const getCPCEstimate = (platform: string, campaignType: string) => {
    const estimates = {
      'instagram-feed': { awareness: 0.85, leadgen: 1.25, conversion: 2.10, retargeting: 1.85 },
      'instagram-story': { awareness: 0.92, leadgen: 1.35, conversion: 2.25, retargeting: 1.95 },
      'facebook-feed': { awareness: 0.78, leadgen: 1.15, conversion: 1.95, retargeting: 1.75 },
      'facebook-video': { awareness: 1.05, leadgen: 1.45, conversion: 2.35, retargeting: 2.05 }
    };
    return estimates[platform]?.[campaignType] || 1.50;
  };

  const getConversionEstimate = (campaignType: string) => {
    const estimates = { awareness: 0.8, leadgen: 2.1, conversion: 4.5, retargeting: 8.2 };
    return estimates[campaignType] || 2.0;
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

      {/* Campaign Configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campagne Configuratie
          </CardTitle>
          <CardDescription>
            Kies je campagne type, doelgroep en variant voor gepersonaliseerde advertenties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Campaign Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Campagne Doel</label>
              <Select value={selectedCampaignType} onValueChange={setSelectedCampaignType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audience */}
            <div>
              <label className="text-sm font-medium mb-2 block">Doelgroep</label>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map(audience => (
                    <SelectItem key={audience.id} value={audience.id}>
                      <div>
                        <div className="font-medium">{audience.label}</div>
                        <div className="text-xs text-muted-foreground">{audience.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variant */}
            <div>
              <label className="text-sm font-medium mb-2 block">A/B Test Variant</label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variants.map(variant => (
                    <SelectItem key={variant} value={variant}>
                      Variant {variant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campaign Type Info */}
          <div className="grid md:grid-cols-4 gap-4">
            {campaignTypes.map(type => (
              <div 
                key={type.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedCampaignType === type.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedCampaignType(type.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <type.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{type.label}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {type.id === 'awareness' && 'Vergroot merkbekendheid'}
                  {type.id === 'leadgen' && 'Genereer kwaliteit leads'}
                  {type.id === 'conversion' && 'Directe verkoop focus'}
                  {type.id === 'retargeting' && 'Heractiveer bezoekers'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Estimates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">
            {getCTREstimate('facebook-feed', selectedCampaignType)}%
          </div>
          <div className="text-sm text-muted-foreground">Verwachte CTR</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">
            €{getCPCEstimate('facebook-feed', selectedCampaignType)}
          </div>
          <div className="text-sm text-muted-foreground">Gemiddelde CPC</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">
            {getConversionEstimate(selectedCampaignType)}%
          </div>
          <div className="text-sm text-muted-foreground">Conversie Ratio</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">
            {audiences.find(a => a.id === selectedAudience)?.label.split(' ')[0]}
          </div>
          <div className="text-sm text-muted-foreground">Doelgroep</div>
        </div>
      </div>

      <Tabs defaultValue="instagram-feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {currentAds.map(ad => (
            <TabsTrigger key={ad.platform} value={ad.platform} className="flex items-center gap-2">
              <ad.icon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {ad.platform === 'instagram-feed' ? 'IG Feed' :
                 ad.platform === 'instagram-story' ? 'IG Story' :
                 ad.platform === 'facebook-feed' ? 'FB Feed' : 'FB Video'}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {currentAds.map((ad) => (
          <TabsContent key={ad.platform} value={ad.platform}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ad.icon className="h-5 w-5" />
                      {ad.title}
                    </div>
                    <Badge variant="outline">
                      {campaignTypes.find(c => c.id === selectedCampaignType)?.label} - Variant {selectedVariant}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Afmetingen: {ad.dimensions} • {audiences.find(a => a.id === selectedAudience)?.label}
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
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="font-semibold text-blue-600">
                        {getCTREstimate(ad.platform, selectedCampaignType)}%
                      </div>
                      <div className="text-muted-foreground">CTR</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">
                        €{getCPCEstimate(ad.platform, selectedCampaignType)}
                      </div>
                      <div className="text-muted-foreground">CPC</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-600">
                        {getConversionEstimate(selectedCampaignType)}%
                      </div>
                      <div className="text-muted-foreground">Conv</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Copy & Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Advertentie Tekst
                    <Badge className={`
                      ${selectedCampaignType === 'conversion' ? 'bg-orange-100 text-orange-700' :
                        selectedCampaignType === 'leadgen' ? 'bg-green-100 text-green-700' :
                        selectedCampaignType === 'retargeting' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'}
                    `}>
                      {campaignTypes.find(c => c.id === selectedCampaignType)?.label}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Geoptimaliseerd voor {audiences.find(a => a.id === selectedAudience)?.description?.toLowerCase()}
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
                      <h4 className="font-medium text-sm mb-2">Targeting Suggestie:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {ad.targeting}
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