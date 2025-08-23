import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Calendar as CalendarIcon, 
  Clock, 
  Copy, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  Target,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Eye,
  TrendingUp,
  Users,
  MousePointer,
  Zap,
  Globe,
  Star,
  Crown,
  PenTool
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: "blog" | "landing" | "email" | "social";
  tags: string[];
  content: string;
  createdAt: string;
  usageCount: number;
  author: string;
  isPremium: boolean;
  cta?: {
    enabled: boolean;
    type: "phone" | "form" | "button" | "none";
    title?: string;
    description?: string;
    phone?: string;
    buttonText?: string;
    buttonUrl?: string;
    formFields?: Array<{
      name: string;
      type: "text" | "email" | "phone" | "textarea";
      placeholder: string;
      required: boolean;
    }>;
  };
}

interface ScheduledPost {
  id: string;
  title: string;
  status: "scheduled" | "published" | "draft" | "failed";
  scheduledDate: string;
  publishedDate?: string;
  category: string;
  template?: string;
  views?: number;
}

interface ABTest {
  id: string;
  name: string;
  status: "running" | "completed" | "paused" | "draft";
  variant_a: {
    title: string;
    content: string;
    views: number;
    clicks: number;
    ctr: number;
  };
  variant_b: {
    title: string;
    content: string;
    views: number;
    clicks: number;
    ctr: number;
  };
  startDate: string;
  endDate?: string;
  winner?: "a" | "b" | "none";
  confidence: number;
}

const ContentFeatures = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [bulkAction, setBulkAction] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();

  const { toast } = useToast();
  const navigate = useNavigate();

  const templates: ContentTemplate[] = [
    {
      id: "seo-blog-nl",
      name: "SEO Blog Post - Nederland",
      description: "Geoptimaliseerd voor Nederlandse markt met lokale SEO focus",
      category: "blog",
      tags: ["seo", "nederland", "lokaal", "blog"],
      content: `# {{title}} - {{city}}

## Inleiding
Zoekt u naar {{service}} in {{city}}? In deze uitgebreide gids vindt u alles wat u moet weten over {{keyword}} in {{location}}. Van kosten tot kwaliteit, wij helpen u de beste keuze te maken.

## Waarom {{service}} belangrijk is
{{keyword}} speelt een cruciale rol in {{context}}. Hier zijn de belangrijkste voordelen:

- **Kosteneffectief**: Bespaar tot 30% op {{costs}}
- **Kwaliteit**: Ervaren professionals in {{city}}
- **Service**: 24/7 ondersteuning en garantie
- **Lokaal**: Bekend met {{city}} regelgeving

## Top {{number}} {{service}} in {{city}}

### 1. {{company_name}}
Gespecialiseerd in {{specialization}} met meer dan {{years}} jaar ervaring.

## Kosten voor {{service}} in {{city}}
De gemiddelde kosten voor {{keyword}} in {{city}} variëren tussen €{{min_price}} en €{{max_price}}, afhankelijk van {{factors}}.

## Veelgestelde vragen

**Wat kost {{service}} in {{city}}?**
De kosten variëren van €{{range}}. Een gratis offerte kunt u aanvragen via ons contactformulier.

**Hoe lang duurt {{service}}?**
Gemiddeld duurt {{keyword}} {{duration}}, afhankelijk van {{variables}}.

## Conclusie
Voor betrouwbare {{service}} in {{city}} bent u bij ons aan het juiste adres. Neem vandaag nog contact op voor een vrijblijvende offerte.`,
      createdAt: "2025-01-18",
      usageCount: 1247,
      author: "SEO Expert",
      isPremium: false,
      cta: {
        enabled: true,
        type: "phone",
        title: "Gratis Offerte Aanvragen?",
        description: "Bel direct voor een vrijblijvende offerte en professioneel advies",
        phone: "{{phone_number}}"
      }
    },
    {
      id: "service-landing-page",
      name: "Service Landing Page",
      description: "Conversie-geoptimaliseerde landingspagina voor lokale diensten",
      category: "landing",
      tags: ["conversie", "landing", "service", "lokaal"],
      content: `# {{headline}} - {{city}}

## Het Probleem
Heeft u last van {{problem}}? U bent niet de enige. In {{city}} worstelen veel mensen met {{issue}}.

## De Oplossing: {{service}}
Onze {{service}} lost {{problem}} definitief op. Met meer dan {{years}} jaar ervering en {{satisfied_customers}}+ tevreden klanten.

### Waarom Kiezen Voor Ons?
✅ **{{years}}+ Jaar Ervaring** - Bewezen track record
✅ **Lokaal in {{city}}** - Snelle service, persoonlijk contact  
✅ **{{guarantee}} Garantie** - 100% tevredenheidsgarantie
✅ **Transparante Prijzen** - Geen verborgen kosten

## Wat Onze Klanten Zeggen
*"{{testimonial}}"* - {{customer_name}}, {{city}}

## Uw Voordelen
- **Besparing**: Tot {{percentage}}% goedkoper dan de concurrentie
- **Snelheid**: Service binnen {{timeframe}}
- **Kwaliteit**: {{quality_measures}}

## Actie Vereist!
**Beperkte tijd:** {{offer}} voor de eerste {{number}} klanten uit {{city}}.

### Bel Nu: {{phone}}
Of vul ons contactformulier in voor een gratis offerte binnen 24 uur.`,
      createdAt: "2025-01-18",
      usageCount: 892,
      author: "Conversion Expert",
      isPremium: true,
      cta: {
        enabled: true,
        type: "form",
        title: "Start Nu - 50% Korting!",
        description: "Vul onderstaand formulier in en ontvang binnen 24 uur een gratis offerte",
        formFields: [
          { name: "name", type: "text", placeholder: "Uw volledige naam", required: true },
          { name: "email", type: "email", placeholder: "E-mailadres", required: true },
          { name: "phone", type: "phone", placeholder: "Telefoonnummer", required: true },
          { name: "message", type: "textarea", placeholder: "Beschrijf uw situatie kort", required: false }
        ]
      }
    },
    {
      id: "product-review-deep",
      name: "Diepgaande Product Review",
      description: "Uitgebreide product review met voor/nadelen en vergelijkingen",
      category: "blog",
      tags: ["review", "product", "vergelijking", "test"],
      content: `# {{product_name}} Review 2025: {{verdict}}

## Eerste Indruk
Na {{test_period}} testen van {{product_name}} kunnen we zeggen: {{initial_verdict}}.

## Technische Specificaties
- **Model**: {{model}}
- **Afmetingen**: {{dimensions}}
- **Gewicht**: {{weight}}
- **Kenmerken**: {{features}}
- **Prijs**: {{price}}

## Verpakking en Design
{{product_name}} komt verpakt in {{packaging}}. Het design is {{design_verdict}} met {{design_features}}.

## Performance Test
### {{test_category_1}}
{{performance_results_1}}

### {{test_category_2}}  
{{performance_results_2}}

## Voor- en Nadelen

### ✅ Voordelen
- {{pro_1}}
- {{pro_2}}
- {{pro_3}}
- {{pro_4}}

### ❌ Nadelen
- {{con_1}}
- {{con_2}}
- {{con_3}}

## Vergelijking met Concurrenten
| Feature | {{product_name}} | {{competitor_1}} | {{competitor_2}} |
|---------|------------------|------------------|------------------|
| Prijs | {{price}} | {{comp1_price}} | {{comp2_price}} |
| {{feature_1}} | {{score_1}} | {{comp1_score1}} | {{comp2_score1}} |
| {{feature_2}} | {{score_2}} | {{comp1_score2}} | {{comp2_score2}} |

## Prijs-Kwaliteit Verhouding
Voor {{price}} krijg je {{value_proposition}}. Vergeleken met {{competitors}} is dit {{price_verdict}}.

## Voor Wie is {{product_name}} Geschikt?
✅ **Ideaal voor**: {{target_audience_1}}
✅ **Ook goed voor**: {{target_audience_2}}
❌ **Minder geschikt voor**: {{not_target_audience}}

## Eindconclusie
{{product_name}} scoort een {{rating}}/10. {{final_verdict}} 

**Aanbeveling**: {{recommendation}}`,
      createdAt: "2025-01-18",
      usageCount: 634,
      author: "Product Reviewer",
      isPremium: false,
      cta: {
        enabled: true,
        type: "button",
        title: "Beste Prijs Gevonden!",
        description: "Klik hier voor de laagste prijs bij onze partner",
        buttonText: "Bekijk Aanbieding",
        buttonUrl: "{{affiliate_link}}"
      }
    },
    {
      id: "how-to-guide-expert",
      name: "Expert How-To Gids",
      description: "Stap-voor-stap handleiding met professionele tips",
      category: "blog",
      tags: ["tutorial", "howto", "gids", "stappen"],
      content: `# Hoe {{action}} in {{steps}} Stappen (2025 Gids)

## Waarom {{action}}?
{{reason}} is essentieel omdat {{importance}}. In deze gids leer je {{learning_outcome}}.

## Wat Heb Je Nodig?
### Materialen
- {{material_1}}
- {{material_2}}
- {{material_3}}

### Tools
- {{tool_1}}
- {{tool_2}}
- {{tool_3}}

### Geschatte Tijd
⏱️ **{{total_time}}** ({{beginner_time}} voor beginners)

## Stap-voor-Stap Handleiding

### Stap 1: {{step_1_title}}
{{step_1_description}}

**💡 Pro Tip**: {{step_1_tip}}

**⚠️ Let Op**: {{step_1_warning}}

### Stap 2: {{step_2_title}}
{{step_2_description}}

**💡 Pro Tip**: {{step_2_tip}}

### Stap 3: {{step_3_title}}
{{step_3_description}}

**💡 Pro Tip**: {{step_3_tip}}

### Stap 4: {{step_4_title}}
{{step_4_description}}

**💡 Pro Tip**: {{step_4_tip}}

## Veelgemaakte Fouten
❌ **Fout 1**: {{mistake_1}}
✅ **Oplossing**: {{solution_1}}

❌ **Fout 2**: {{mistake_2}}
✅ **Oplossing**: {{solution_2}}

## Expert Tips
🔥 **Geheim 1**: {{expert_tip_1}}
🔥 **Geheim 2**: {{expert_tip_2}}
🔥 **Geheim 3**: {{expert_tip_3}}

## Troubleshooting
**Probleem**: {{problem_1}}
**Oplossing**: {{fix_1}}

**Probleem**: {{problem_2}}
**Oplossing**: {{fix_2}}

## Veelgestelde Vragen

**{{faq_1_q}}**
{{faq_1_a}}

**{{faq_2_q}}**
{{faq_2_a}}

## Conclusie
{{action}} is {{difficulty_level}} als je deze stappen volgt. Het belangrijkste is {{key_takeaway}}.

**Volgende Stappen**: {{next_steps}}`,
      createdAt: "2025-01-18",
      usageCount: 1156,
      author: "Tutorial Expert",
      isPremium: false
    },
    {
      id: "competitor-analysis",
      name: "Concurrentie Analyse Template",
      description: "Complete analyse van concurrenten en marktpositie",
      category: "blog",
      tags: ["analyse", "concurrenten", "markt", "strategie"],
      content: `# {{industry}} Concurrentie Analyse 2025: {{company}} vs {{competitors}}

## Markt Overzicht
De {{industry}} markt in {{location}} wordt gedomineerd door {{market_leaders}}. Met een marktwaarde van {{market_value}} en groei van {{growth_rate}}% is dit een dynamische sector.

## Hoofdconcurrenten

### 1. {{competitor_1}}
- **Marktaandeel**: {{market_share_1}}%
- **Sterke Punten**: {{strengths_1}}
- **Zwakke Punten**: {{weaknesses_1}}
- **Prijsstrategie**: {{pricing_1}}

### 2. {{competitor_2}}
- **Marktaandeel**: {{market_share_2}}%
- **Sterke Punten**: {{strengths_2}}
- **Zwakke Punten**: {{weaknesses_2}}
- **Prijsstrategie**: {{pricing_2}}

### 3. {{competitor_3}}
- **Marktaandeel**: {{market_share_3}}%
- **Sterke Punten**: {{strengths_3}}
- **Zwakke Punten**: {{weaknesses_3}}
- **Prijsstrategie**: {{pricing_3}}

## Feature Vergelijking
| Feature | {{company}} | {{comp_1}} | {{comp_2}} | {{comp_3}} |
|---------|-------------|------------|------------|------------|
| {{feature_1}} | {{our_score_1}} | {{comp1_score_1}} | {{comp2_score_1}} | {{comp3_score_1}} |
| {{feature_2}} | {{our_score_2}} | {{comp1_score_2}} | {{comp2_score_2}} | {{comp3_score_2}} |
| {{feature_3}} | {{our_score_3}} | {{comp1_score_3}} | {{comp2_score_3}} | {{comp3_score_3}} |

## SWOT Analyse

### {{company}}
**Strengths**: {{our_strengths}}
**Weaknesses**: {{our_weaknesses}}
**Opportunities**: {{opportunities}}
**Threats**: {{threats}}

## Marktpositionering
{{positioning_analysis}}

## Prijsstrategie Vergelijking
{{pricing_comparison}}

## Klanttevredenheid
- **{{company}}**: {{our_satisfaction}}/10
- **{{competitor_1}}**: {{comp1_satisfaction}}/10  
- **{{competitor_2}}**: {{comp2_satisfaction}}/10

## Aanbevelingen
1. {{recommendation_1}}
2. {{recommendation_2}}
3. {{recommendation_3}}

## Conclusie
{{market_conclusion}}`,
      createdAt: "2025-01-18",
      usageCount: 445,
      author: "Market Analyst",
      isPremium: true
    }
  ];

  const scheduledPosts: ScheduledPost[] = [
    {
      id: "1",
      title: "SEO Tips voor 2024",
      status: "scheduled",
      scheduledDate: "2024-01-25T10:00:00Z",
      category: "SEO",
      template: "SEO Blog Post Template"
    },
    {
      id: "2",
      title: "Content Marketing Strategieën",
      status: "published",
      scheduledDate: "2024-01-20T14:00:00Z",
      publishedDate: "2024-01-20T14:00:00Z",
      category: "Marketing",
      views: 1247
    },
    {
      id: "3",
      title: "Local Business Marketing Guide",
      status: "scheduled",
      scheduledDate: "2024-01-28T09:00:00Z",
      category: "Local Business",
      template: "How-To Guide Template"
    },
    {
      id: "4",
      title: "AI Tools Review",
      status: "failed",
      scheduledDate: "2024-01-22T16:00:00Z",
      category: "Reviews"
    }
  ];

  const abTests: ABTest[] = [
    {
      id: "1",
      name: "Homepage Headlines Test",
      status: "running",
      variant_a: {
        title: "Automatiseer je Content Marketing",
        content: "Genereer SEO-geoptimaliseerde blogposts in minuten",
        views: 2847,
        clicks: 142,
        ctr: 4.99
      },
      variant_b: {
        title: "10x Snellere Content Productie",
        content: "Van spreadsheet naar gepubliceerde blog in 3 stappen",
        views: 2953,
        clicks: 176,
        ctr: 5.96
      },
      startDate: "2024-01-15",
      confidence: 78
    },
    {
      id: "2",
      name: "CTA Button Test",
      status: "completed",
      variant_a: {
        title: "Start Gratis Trial",
        content: "Probeer 14 dagen gratis",
        views: 5420,
        clicks: 324,
        ctr: 5.98
      },
      variant_b: {
        title: "Claim Je Korting",
        content: "50% korting - beperkte tijd",
        views: 5380,
        clicks: 387,
        ctr: 7.19
      },
      startDate: "2024-01-08",
      endDate: "2024-01-22",
      winner: "b",
      confidence: 95
    }
  ];

  const handleTemplateUse = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast({
        title: "Template geladen",
        description: `"${template.name}" is geladen in de editor.`,
      });
    }
  };

  const handleBulkAction = () => {
    if (selectedPosts.length === 0) {
      toast({
        title: "Geen posts geselecteerd",
        description: "Selecteer eerst posts om een bulk actie uit te voeren.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bulk actie uitgevoerd",
      description: `${bulkAction} toegepast op ${selectedPosts.length} posts.`,
    });
    setSelectedPosts([]);
  };

  const handleSchedulePost = () => {
    if (!selectedDate) {
      toast({
        title: "Datum vereist",
        description: "Selecteer een datum en tijd voor publicatie.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Post ingepland",
      description: "Je post is succesvol ingepland voor publicatie.",
    });
  };

  const startABTest = (testId: string) => {
    toast({
      title: "A/B test gestart",
      description: "De test loopt nu en verzamelt data voor analyse.",
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "published": return "bg-green-500/10 text-green-700 border-green-200";
      case "failed": return "bg-red-500/10 text-red-700 border-red-200";
      case "running": return "bg-orange-500/10 text-orange-700 border-orange-200";
      case "completed": return "bg-green-500/10 text-green-700 border-green-200";
      case "paused": return "bg-gray-500/10 text-gray-700 border-gray-200";
      default: return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <Clock className="h-4 w-4" />;
      case "published": return <CheckCircle2 className="h-4 w-4" />;
      case "failed": return <AlertTriangle className="h-4 w-4" />;
      case "running": return <Play className="h-4 w-4" />;
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "paused": return <Pause className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Content Features</h2>
        <p className="text-muted-foreground">
          Geavanceerde tools voor content management en optimalisatie
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              beschikbare templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geplande Posts</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledPosts.filter(p => p.status === "scheduled").length}
            </div>
            <p className="text-xs text-muted-foreground">
              wachten op publicatie
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve A/B Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {abTests.filter(t => t.status === "running").length}
            </div>
            <p className="text-xs text-muted-foreground">
              tests lopen momenteel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              publicatie succes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates">Template Library</TabsTrigger>
          <TabsTrigger value="scheduler">Content Scheduler</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="cta-preview">CTA Previews</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Template Bibliotheek</CardTitle>
                  <CardDescription>
                    Herbruikbare content templates voor snellere creatie
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => navigate('/dashboard/template-editor')}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Template Editor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Alle categorieën" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle categorieën</SelectItem>
                    <SelectItem value="blog">Blog Posts</SelectItem>
                    <SelectItem value="landing">Landing Pages</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {template.isPremium && (
                            <Badge className="bg-yellow-500/10 text-yellow-700">
                              <Star className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      
                      <h4 className="font-semibold mb-2">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>{template.usageCount} keer gebruikt</span>
                        <span>Door {template.author}</span>
                      </div>

                      {template.cta?.enabled && (
                        <div className="mb-3 p-2 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-1 text-xs font-medium text-primary mb-1">
                            <Target className="h-3 w-3" />
                            CTA: {template.cta.type === 'phone' ? 'Telefoon' : 
                                  template.cta.type === 'form' ? 'Formulier' : 'Button'}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {template.cta.title}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleTemplateUse(template.id)}
                        >
                          Gebruiken
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate('/dashboard/template-editor')}
                        >
                          <PenTool className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Post Inplannen</CardTitle>
                <CardDescription>
                  Plan je content voor automatische publicatie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="post-title">Post Titel</Label>
                  <Input id="post-title" placeholder="Titel van je blogpost" />
                </div>
                
                <div>
                  <Label htmlFor="post-category">Categorie</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seo">SEO</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Publicatie Datum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? selectedDate.toLocaleDateString() : "Selecteer datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="post-time">Tijd</Label>
                  <Input id="post-time" type="time" defaultValue="10:00" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="auto-social" />
                  <Label htmlFor="auto-social">Auto delen op social media</Label>
                </div>
                
                <Button onClick={handleSchedulePost} className="w-full">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Post Inplannen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geplande Posts</CardTitle>
                <CardDescription>
                  Overzicht van je geplande content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{post.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{new Date(post.scheduledDate).toLocaleString()}</span>
                          <span>•</span>
                          <span>{post.category}</span>
                          {post.views && (
                            <>
                              <span>•</span>
                              <span>{post.views} views</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(post.status)}>
                          {getStatusIcon(post.status)}
                          <span className="ml-1 capitalize">{post.status}</span>
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operaties</CardTitle>
              <CardDescription>
                Voer acties uit op meerdere posts tegelijk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Selecteer actie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publish">Publiceren</SelectItem>
                      <SelectItem value="draft">Naar Concept</SelectItem>
                      <SelectItem value="delete">Verwijderen</SelectItem>
                      <SelectItem value="duplicate">Dupliceren</SelectItem>
                      <SelectItem value="update-seo">SEO Bijwerken</SelectItem>
                      <SelectItem value="export">Exporteren</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkAction} disabled={selectedPosts.length === 0}>
                    Uitvoeren ({selectedPosts.length})
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Selectie
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Button>
                </div>

                <div className="space-y-3">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedPosts.includes(post.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPosts([...selectedPosts, post.id]);
                          } else {
                            setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{post.category}</span>
                          <span>•</span>
                          <span>{new Date(post.scheduledDate).toLocaleDateString()}</span>
                          {post.views && (
                            <>
                              <span>•</span>
                              <span>{post.views} views</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={selectedPosts.length === scheduledPosts.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPosts(scheduledPosts.map(p => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                  />
                  <span>Selecteer alle {scheduledPosts.length} posts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>A/B Testing</CardTitle>
                  <CardDescription>
                    Test verschillende versies van je content voor optimale performance
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {abTests.map((test) => (
                  <Card key={test.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{test.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Start: {new Date(test.startDate).toLocaleDateString()}</span>
                            {test.endDate && (
                              <>
                                <span>•</span>
                                <span>Eind: {new Date(test.endDate).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(test.status)}>
                            {getStatusIcon(test.status)}
                            <span className="ml-1 capitalize">{test.status}</span>
                          </Badge>
                          {test.status === "running" && (
                            <Button size="sm" variant="outline">
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Card className={test.winner === "a" ? "border-green-200 bg-green-50" : ""}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm">Variant A</CardTitle>
                              {test.winner === "a" && (
                                <Badge className="bg-green-500/10 text-green-700">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Winner
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <h5 className="font-medium mb-2">{test.variant_a.title}</h5>
                            <p className="text-sm text-muted-foreground mb-3">
                              {test.variant_a.content}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="font-medium">{test.variant_a.views.toLocaleString()}</div>
                                <div className="text-muted-foreground">Views</div>
                              </div>
                              <div>
                                <div className="font-medium">{test.variant_a.clicks}</div>
                                <div className="text-muted-foreground">Clicks</div>
                              </div>
                              <div>
                                <div className="font-medium">{test.variant_a.ctr}%</div>
                                <div className="text-muted-foreground">CTR</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className={test.winner === "b" ? "border-green-200 bg-green-50" : ""}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm">Variant B</CardTitle>
                              {test.winner === "b" && (
                                <Badge className="bg-green-500/10 text-green-700">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Winner
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <h5 className="font-medium mb-2">{test.variant_b.title}</h5>
                            <p className="text-sm text-muted-foreground mb-3">
                              {test.variant_b.content}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="font-medium">{test.variant_b.views.toLocaleString()}</div>
                                <div className="text-muted-foreground">Views</div>
                              </div>
                              <div>
                                <div className="font-medium">{test.variant_b.clicks}</div>
                                <div className="text-muted-foreground">Clicks</div>
                              </div>
                              <div>
                                <div className="font-medium">{test.variant_b.ctr}%</div>
                                <div className="text-muted-foreground">CTR</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {test.status === "running" && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Statistische Zekerheid</span>
                            <span className="text-sm font-bold">{test.confidence}%</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${test.confidence}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {test.confidence >= 95 ? 
                              "Test is statistisch significant. Je kunt de winnaar implementeren." :
                              "Test loopt nog. Wacht op meer data voor betrouwbare resultaten."
                            }
                          </p>
                        </div>
                      )}

                      {test.status === "draft" && (
                        <div className="mt-4">
                          <Button onClick={() => startABTest(test.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Test Starten
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cta-preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CTA Preview Galerij</CardTitle>
              <CardDescription>
                Bekijk hoe verschillende CTA types eruit zien in je content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                
                {/* Phone CTA Example */}
                <Card className="border-2 border-dashed border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">Telefoon CTA</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2">Gratis Offerte Aanvragen?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Bel direct voor een vrijblijvende offerte en professioneel advies
                      </p>
                      <Button className="w-full">
                        📞 Bel Nu: 085-1234567
                      </Button>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      <strong>Gebruikt in:</strong> SEO Blog Post - Nederland
                    </div>
                  </CardContent>
                </Card>

                {/* Form CTA Example */}
                <Card className="border-2 border-dashed border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">Formulier CTA</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2">Start Nu - 50% Korting!</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Vul onderstaand formulier in en ontvang binnen 24 uur een gratis offerte
                      </p>
                      <div className="space-y-2">
                        <Input placeholder="Uw volledige naam" size={10} />
                        <Input placeholder="E-mailadres" size={10} />
                        <Input placeholder="Telefoonnummer" size={10} />
                        <Textarea placeholder="Beschrijf uw situatie kort" className="min-h-[60px]" />
                        <Button className="w-full">
                          Aanvraag Verzenden
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      <strong>Gebruikt in:</strong> Service Landing Page
                    </div>
                  </CardContent>
                </Card>

                {/* Button CTA Example */}
                <Card className="border-2 border-dashed border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">Button CTA</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2">Beste Prijs Gevonden!</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Klik hier voor de laagste prijs bij onze partner
                      </p>
                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                        🔥 Bekijk Aanbieding
                      </Button>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      <strong>Gebruikt in:</strong> Product Review
                    </div>
                  </CardContent>
                </Card>

                {/* Custom CTA Builder */}
                <Card className="border-2 border-primary/50 md:col-span-2 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      CTA Builder
                    </CardTitle>
                    <CardDescription>
                      Ontwerp je eigen CTA en preview het resultaat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cta-type">CTA Type</Label>
                          <Select defaultValue="phone">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="phone">Telefoon</SelectItem>
                              <SelectItem value="form">Formulier</SelectItem>
                              <SelectItem value="button">Button/Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="cta-title">Titel</Label>
                          <Input 
                            id="cta-title" 
                            placeholder="Bijv. Gratis Offerte Krijgen?" 
                            defaultValue="Neem Contact Op!"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cta-description">Omschrijving</Label>
                          <Textarea 
                            id="cta-description" 
                            placeholder="Korte uitleg van de actie..."
                            defaultValue="Bel nu voor een vrijblijvende offerte binnen 24 uur"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="button-text">Button Tekst</Label>
                          <Input 
                            id="button-text" 
                            placeholder="Bijv. Bel Nu, Verstuur, etc."
                            defaultValue="Bel Direct"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Live Preview</Label>
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
                          <h4 className="font-semibold text-primary mb-2">Neem Contact Op!</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Bel nu voor een vrijblijvende offerte binnen 24 uur
                          </p>
                          <Button className="w-full">
                            📞 Bel Direct
                          </Button>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Button variant="outline" className="w-full">
                            <Copy className="h-4 w-4 mr-2" />
                            Kopieer CTA Code
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Exporteer als Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentFeatures;