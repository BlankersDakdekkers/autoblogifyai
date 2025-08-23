import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Eye, 
  Save, 
  Copy, 
  Download,
  Upload,
  Edit,
  Plus,
  Wand2,
  Code,
  Settings,
  Trash2,
  Star,
  Crown,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Target,
  ArrowLeft,
  ArrowRight,
  Zap,
  Palette,
  Layers,
  Search,
  Filter,
  Maximize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "blog" | "service" | "landing" | "email" | "social";
  content: string;
  variables: string[];
  tags: string[];
  isPublic: boolean;
  isPremium: boolean;
  usageCount: number;
  rating: number;
  author: string;
  createdAt: string;
}

const TemplateEditor = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template>>({});
  const [activeTab, setActiveTab] = useState("browse");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Template starters
  const templateStarters = {
    blog: `# {{title}} | {{city}} - Professionele {{service}}

## Inleiding
Bent u op zoek naar {{service}} in {{city}}? Dan bent u bij ons aan het juiste adres. Met meer dan {{years_experience}} jaar ervaring weten wij precies hoe we u het beste kunnen helpen.

## {{main_topic}} - Wat u Moet Weten

{{main_content}}

## Conclusie
Voor meer informatie over {{service}}, neem contact met ons op via {{phone}}.`,

    service: `# {{service_name}} {{city}} | {{company_name}}

**{{service_name}} {{city}}**? {{opening_line}}

{{intro_paragraph}}

**{{experience_statement}}**

[{{phone}}](tel:{{phone}})

## **{{service_name}}** {{city}}

{{service_description_detailed}}

### Onze **beloften**

✅ {{promise_1_title}} - {{promise_1_description}}
✅ {{promise_2_title}} - {{promise_2_description}}  
✅ {{promise_3_title}} - {{promise_3_description}}

### Werkwijze **{{company_name}}**

**1. {{step_1_title}}**  
{{step_1_description}}

**2. {{step_2_title}}**  
{{step_2_description}}

**3. {{step_3_title}}**  
{{step_3_description}}

[{{phone}}](tel:{{phone}})`,
    
    landing: `# 🎯 {{headline}}

## 😰 Herkenbaar? Dit Probleem Heeft Iedereen...

{{problem_description}}

**Gevolgen als u niets doet:**
- ❌ {{negative_consequence_1}}
- ❌ {{negative_consequence_2}}  
- ❌ {{negative_consequence_3}}

## ✨ Wij Hebben DE Oplossing!

{{solution_description}}

**Resultaat na onze aanpak:**
- ✅ {{positive_result_1}}
- ✅ {{positive_result_2}}
- ✅ {{positive_result_3}}

## 🚀 {{cta_text}}

**📞 Bel direct:** [{{phone}}](tel:{{phone}})  
**✉️ Of mail:** [{{email}}](mailto:{{email}})`,

    email: `Onderwerp: {{subject}} | {{company_name}}

Beste {{first_name}},

{{intro_text}}

## Waarom deze email?
{{reason_for_email}}

## Wat betekent dit voor u?
{{main_message}}

### Uw voordelen:
✅ {{benefit_1}}  
✅ {{benefit_2}}
✅ {{benefit_3}}

Met vriendelijke groet,

**{{sender_name}}**  
{{company_name}}`,

    social: `🔥 {{headline}}

{{description}}

💡 **Waarom dit belangrijk is:**
{{why_important}}

👆 **Actie vereist:**
{{call_to_action}}

#{{hashtag1}} #{{hashtag2}} #{{hashtag3}}`
  };

  const templates: Template[] = [
    {
      id: "seo-blog-nl",
      name: "SEO Blog Post - Nederland",
      description: "Geoptimaliseerd voor Nederlandse markt met lokale SEO focus",
      category: "blog",
      content: templateStarters.blog,
      variables: ["title", "city", "service", "main_content", "phone"],
      tags: ["seo", "nederland", "lokaal", "blog"],
      isPublic: true,
      isPremium: false,
      usageCount: 1247,
      rating: 4.8,
      author: "SEO Expert",
      createdAt: "2025-01-18"
    },
    {
      id: "service-page-pro",
      name: "Dienstenpagina Pro - Lokale Dienstverlener",
      description: "Complete servicepagina template met prijzen, werkgebied, FAQ en contactgegevens",
      category: "service",
      content: templateStarters.service,
      variables: ["service_name", "city", "company_name", "phone", "email"],
      tags: ["diensten", "lokaal", "business", "contact"],
      isPublic: true,
      isPremium: true,
      usageCount: 892,
      rating: 4.9,
      author: "Business Expert",
      createdAt: "2025-01-18"
    },
    {
      id: "service-landing-page",
      name: "Service Landing Page",
      description: "Conversie-geoptimaliseerde landingspagina voor lokale diensten",
      category: "landing",
      content: templateStarters.landing,
      variables: ["headline", "problem_description", "solution_description", "phone", "email"],
      tags: ["conversie", "landing", "service", "lokaal"],
      isPublic: true,
      isPremium: true,
      usageCount: 892,
      rating: 4.9,
      author: "Conversion Expert",
      createdAt: "2025-01-18"
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || template.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sample data voor preview
  const sampleData = {
    // Basic info
    title: "Dakdekker Schiedam - Professionele Dakwerkzaamheden & Renovatie",
    city: "Schiedam", 
    service: "dakrenovatie",
    company_name: "Mr. Dakdekker Schiedam",
    phone: "010-2345678",
    email: "info@mrdakdekkerschiedam.nl",
    business_address: "Wilhelminalaan 12, 3112 AB Schiedam",
    
    // Hero section
    service_name: "Dakrenovatie",
    service_name_lower: "dakrenovatie",
    slogan: "Uw dakspecialist in Schiedam",
    main_benefit: "Vakkundig, betrouwbaar en altijd scherp geprijsd",
    opening_question: "Op zoek naar dakrenovatie in Schiedam?",
    opening_statement: "Dan bent u bij Mr. Dakdekker Schiedam aan het juiste adres!",
    intro_paragraph: "Wij zijn gespecialiseerd in het volledig renoveren van daken in Schiedam en omstreken. Met jarenlange ervaring en gebruik van hoogwaardige materialen zorgen wij ervoor dat uw dak weer jarenlang meegaat.",
    experience_statement: "Al meer dan 15 jaar uw betrouwbare dakdekker in Schiedam.",
    
    // USPs
    usp_1_title: "Lokale dakspecialist",
    usp_1_description: "Geboren en getogen in Schiedam, wij kennen de lokale omstandigheden",
    usp_2_title: "Altijd vrijblijvende offerte",
    usp_2_description: "Transparante prijzen zonder verrassingen achteraf",
    usp_3_title: "Kwaliteitsgarantie",
    usp_3_description: "10 jaar garantie op alle uitgevoerde werkzaamheden",
    usp_4_title: "Snelle service",
    usp_4_description: "Binnen 24 uur ter plaatse voor een inspectie",
    
    // Service description
    detailed_service_description: "Bij een dakrenovatie vervangen wij uw complete dakbedekking, controleren de dakstructuur en zorgen voor optimale isolatie. Wij werken uitsluitend met kwalitatief hoogwaardige materialen en ervaren vakmensen die uw dak vakkundig renoveren volgens de nieuwste normen en technieken.",
    
    // Process steps
    step_1_title: "Gratis dakinspectie en advies",
    step_1_description: "Wij komen langs voor een uitgebreide inspectie van uw dak en geven deskundig advies over de beste aanpak. Deze inspectie is altijd kosteloos en vrijblijvend.",
    step_2_title: "Transparante offerte op maat",
    step_2_description: "Na de inspectie ontvangt u binnen 2 werkdagen een gedetailleerde offerte waarin alle werkzaamheden en materialen duidelijk staan vermeld.",
    step_3_title: "Vakkundige uitvoering",
    step_3_description: "Na akkoord voeren onze ervaren vakmensen de dakrenovatie uit volgens planning, waarbij u dagelijks wordt geïnformeerd over de voortgang.",
    
    // Reviews
    review_1_text: "Excellent werk geleverd! Binnen de afgesproken tijd en budget is ons dak perfect gerenoveerd. Zeer tevreden met de kwaliteit en service.",
    review_1_author: "Familie Van der Berg",
    review_1_location: "Schiedam Centrum",
    review_2_text: "Professionele aanpak van begin tot eind. Duidelijke communicatie en vakkundig uitgevoerde dakrenovatie. Zeker een aanrader!",
    review_2_author: "J. Hendriks",
    review_2_location: "Schiedam-Noord",
    review_3_text: "Na jaren zoeken eindelijk een betrouwbare dakdekker gevonden. Keurig werk, nette afwerking en prima prijs-kwaliteitverhouding.",
    review_3_author: "M. de Vries",
    review_3_location: "Schiedam-West",
    
    // Service areas
    service_areas: "**Schiedam** (alle wijken), **Rotterdam**, **Delft**, **Den Haag**, **Vlaardingen**, **Maassluis** en omliggende gemeenten",
    service_radius_statement: "Binnen een straal van 25 km rond Schiedam verzorgen wij al onze dakwerkzaamheden.",
    
    // FAQ
    faq_1_question: "Wat kost een dakrenovatie in Schiedam?",
    faq_1_answer: "De kosten variëren afhankelijk van de grootte van uw dak, het type dakbedekking en eventuele extra werkzaamheden. Gemiddeld rekent u voor een complete dakrenovatie tussen €8.000 en €25.000. Wij maken graag een kostenloze offerte op maat voor u.",
    faq_2_question: "Hoe lang duurt een dakrenovatie?",
    faq_2_answer: "Voor een gemiddelde woning duurt een volledige dakrenovatie 3-7 werkdagen, afhankelijk van de complexiteit en weersomstandigheden. Tijdens de offerte krijgt u een duidelijke planning.",
    faq_3_question: "Welke garantie krijg ik op de dakrenovatie?",
    faq_3_answer: "Op alle uitgevoerde werkzaamheden geven wij 10 jaar garantie. Op de gebruikte materialen geldt de fabrieksgarantie, die vaak nog langer is.",
    faq_4_question: "Kan ik tijdens de renovatie gewoon thuis blijven?",
    faq_4_answer: "Ja, in de meeste gevallen kunt u gewoon thuis blijven. Wij zorgen ervoor dat uw woning waterdicht blijft en informeren u vooraf over eventuele ongemakken.",
    
    // Contact/CTA
    final_cta_text: "Wilt u meer weten over onze dakrenovatie service of een vrijblijvende offerte aanvragen?",
    availability_statement: "Bereikbaar van maandag t/m zaterdag van 07:00 tot 18:00 uur",
    tagline: "Uw dak in vertrouwde handen sinds 2008",
    
    // Legacy variables for other templates
    headline: "🏠 Daklek? Wij Lossen Het Vandaag Nog Op!",
    problem_description: "Heeft u last van een lekkend dak, losliggende dakpannen of verouderde dakbedekking?",
    negative_consequence_1: "Waterschade kan oplopen tot €25.000+",
    negative_consequence_2: "Schimmelvorming bedreigt uw gezondheid", 
    negative_consequence_3: "Waardevermindering van uw woning met 10-15%",
    solution_description: "Onze gecertificeerde dakspecialisten komen binnen 4 uur ter plaatse.",
    positive_result_1: "100% waterdicht dak met 15 jaar garantie",
    positive_result_2: "Waardeverhoging woning tot €35.000",
    positive_result_3: "Energiebesparing tot 40% door isolatie",
    cta_text: "Bel Nu Voor Gratis Spoedinsectie",
    subject: "Uw dakprobleem opgelost binnen 24 uur - Gratis inspectie",
    first_name: "Meneer/Mevrouw",
    intro_text: "Wij begrijpen dat dakproblemen stress veroorzaken.",
    reason_for_email: "U heeft recent gezocht naar dakdekkers in Schiedam.",
    main_message: "Onze gecertificeerde dakspecialisten staan klaar om uw dakprobleem vandaag nog op te lossen.",
    benefit_1: "24/7 Spoeddienst - Ook in weekenden",
    benefit_2: "15 jaar garantie op alle werkzaamheden", 
    benefit_3: "Gratis inspectie & offerte binnen 2 uur",
    sender_name: "Piet Janssen",
    description: "🏠 Daklek in Schiedam? Onze experts lossen het binnen 4 uur op! ⚡",
    why_important: "Elke dag uitstel kan duizenden euro's extra schade betekenen",
    call_to_action: "Bel 010-2345678 voor gratis spoedinsectie",
    hashtag1: "dakdekkerschiedam",
    hashtag2: "daklekreparatie", 
    hashtag3: "spoeddienst",
    years_experience: "15",
    main_topic: "Dakrenovatie Schiedam",
    main_content: "Een professionele dakrenovatie zorgt ervoor dat uw woning weer jaren vooruit kan en verhoogt de waarde aanzienlijk."
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
  };

  const renderPreview = (content: string, withSampleData: boolean = false) => {
    if (!content) return '';
    
    let previewContent = content;
    
    if (withSampleData) {
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        previewContent = previewContent.replace(regex, `<span class="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">${value}</span>`);
      });
      
      previewContent = previewContent.replace(/\{\{([^}]+)\}\}/g, '<span class="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md border border-dashed border-orange-300">Ontbreekt: $1</span>');
    } else {
      previewContent = previewContent.replace(/\{\{([^}]+)\}\}/g, '<span class="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md font-mono text-xs">{{$1}}</span>');
    }
    
    // Convert markdown-style formatting
    previewContent = previewContent
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-foreground border-b pb-2">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 text-foreground mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2 text-foreground mt-4">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-6 mb-1 list-disc">$1</li>')
      .replace(/^✅ (.+)$/gm, '<div class="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded"><span class="text-green-600 font-medium">✅</span> <span>$1</span></div>')
      .replace(/^❌ (.+)$/gm, '<div class="flex items-center gap-2 mb-2 p-2 bg-red-50 rounded"><span class="text-red-600 font-medium">❌</span> <span>$1</span></div>')
      .replace(/👆 (.+)$/gm, '<div class="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded"><span class="text-blue-600 font-medium">👆</span> <span>$1</span></div>')
      .replace(/\n\n/g, '<div class="mb-4"></div>')
      .replace(/\n/g, '<br/>');
    
    return previewContent;
  };

  const startNewTemplate = (category?: string, withStarter: boolean = false) => {
    const content = withStarter && category ? templateStarters[category as keyof typeof templateStarters] : "";
    
    setSelectedTemplate(null);
    setEditingTemplate({
      name: "",
      description: "",
      category: (category as any) || "blog",
      content: content,
      tags: [],
      isPublic: true,
      isPremium: false
    });
    setIsEditing(true);
    setIsDialogOpen(false);
    setActiveTab("editor");
    
    toast({
      title: "Template wizard gestart!",
      description: withStarter ? 
        `Template gestart met ${category} starter` : 
        "Template gestart met leeg template"
    });
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate.name || !editingTemplate.content) {
      toast({
        title: "Ontbrekende velden",
        description: "Vul tenminste een naam en content in.",
        variant: "destructive"
      });
      return;
    }

    const variables = extractVariables(editingTemplate.content);
    
    toast({
      title: "Template opgeslagen",
      description: `"${editingTemplate.name}" is succesvol opgeslagen met ${variables.length} variabelen.`
    });
    
    setIsEditing(false);
    setEditingTemplate({});
    setActiveTab("browse");
  };

  const handleUseTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast({
      title: "Template gekopieerd",
      description: `"${template.name}" is naar het klembord gekopieerd.`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/5">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-card via-card/95 to-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                  <Layers className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Template Studio
                </h1>
                <p className="text-muted-foreground">
                  Professionele templates voor maximale conversie
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuw Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="text-center pb-6">
                    <DialogTitle className="text-2xl font-bold">
                      Template Wizard
                    </DialogTitle>
                    <DialogDescription>
                      Kies een professioneel template of begin helemaal opnieuw
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(templateStarters).map(([category, content]) => (
                        <Card 
                          key={category} 
                          className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50 bg-gradient-to-br from-card to-card/80"
                          onClick={() => startNewTemplate(category, true)}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="text-4xl mb-3">
                              {category === 'blog' ? '📝' :
                               category === 'service' ? '🏢' :
                               category === 'landing' ? '🎯' :
                               category === 'email' ? '📧' : '📱'}
                            </div>
                            <h4 className="font-semibold mb-2">
                              {category === 'blog' ? 'Blog Post Pro' :
                               category === 'service' ? 'Servicepagina' :
                               category === 'landing' ? 'Landing Page' :
                               category === 'email' ? 'Email Template' : 'Social Media'}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              {category === 'blog' ? 'SEO-geoptimaliseerde artikelen' :
                               category === 'service' ? 'Complete servicepagina met contact' :
                               category === 'landing' ? 'High-converting paginas' :
                               category === 'email' ? 'Professionele email templates' : 'Sociale media content'}
                            </p>
                            <Button size="sm" className="w-full" variant="outline">
                              Gebruik Template
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="text-center border-t pt-6">
                      <Button 
                        variant="ghost"
                        onClick={() => startNewTemplate()}
                        className="w-full max-w-md"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Start met Leeg Template
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Main Interface with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Bladeren
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Browse Templates Tab */}
          <TabsContent value="browse" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Search & Filter Sidebar */}
              <div className="lg:col-span-3">
                <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-primary" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="🔍 Zoek templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-2 focus:border-primary/50"
                      />
                      
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-sm">
                          <SelectItem value="all">🎯 Alle categorieën</SelectItem>
                          <SelectItem value="blog">📝 Blog Posts</SelectItem>
                          <SelectItem value="service">🏢 Dienstenpagina's</SelectItem>
                          <SelectItem value="landing">🎯 Landing Pages</SelectItem>
                          <SelectItem value="email">📧 Email</SelectItem>
                          <SelectItem value="social">📱 Social Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Templates Grid */}
              <div className="lg:col-span-9">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-card to-card/80 ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setActiveTab("preview");
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge 
                            variant={template.isPremium ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {template.category}
                            {template.isPremium && <Crown className="h-3 w-3 ml-1" />}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs">{template.rating}</span>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {template.name}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{template.usageCount} gebruikt</span>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {template.variables.length} variabelen
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5 text-primary" />
                      Template Editor
                    </CardTitle>
                    <CardDescription>
                      {editingTemplate.name || "Nieuw template maken"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("preview")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button onClick={handleSaveTemplate}>
                      <Save className="h-4 w-4 mr-2" />
                      Opslaan
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Template Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Naam</Label>
                      <Input
                        id="template-name"
                        value={editingTemplate.name || ""}
                        onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Bijv. SEO Blog Post - Nederland"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="template-description">Beschrijving</Label>
                      <Textarea
                        id="template-description"
                        value={editingTemplate.description || ""}
                        onChange={(e) => setEditingTemplate(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Korte beschrijving van wat dit template doet..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-category">Categorie</Label>
                      <Select value={editingTemplate.category || "blog"} onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, category: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog">📝 Blog Post</SelectItem>
                          <SelectItem value="service">🏢 Servicepagina</SelectItem>
                          <SelectItem value="landing">🎯 Landing Page</SelectItem>
                          <SelectItem value="email">📧 Email</SelectItem>
                          <SelectItem value="social">📱 Social Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-tags">Tags (gescheiden door komma's)</Label>
                      <Input
                        id="template-tags"
                        value={editingTemplate.tags?.join(', ') || ""}
                        onChange={(e) => setEditingTemplate(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        }))}
                        placeholder="seo, lokaal, dienstverlening"
                      />
                    </div>
                  </div>

                  {/* Variables Panel */}
                  <div className="space-y-4">
                    <div>
                      <Label>Gevonden Variabelen</Label>
                      <div className="mt-2 p-3 bg-muted/50 rounded-lg min-h-[100px]">
                        {extractVariables(editingTemplate.content || "").length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {extractVariables(editingTemplate.content || "").map(variable => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Geen variabelen gevonden. Gebruik {"{{"} {"}"} syntax om variabelen toe te voegen.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Variabelen Tips</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Gebruik {"{{"} {"}"} om dynamische content toe te voegen. Bijv: {"{{"}title{"}}"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label htmlFor="template-content">Template Content</Label>
                  <Textarea
                    id="template-content"
                    value={editingTemplate.content || ""}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Voer hier je template content in..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Template Preview
                    </CardTitle>
                    <CardDescription>
                      {selectedTemplate?.name || editingTemplate.name || "Selecteer een template"}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      {previewMode ? (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Sample Data
                        </>
                      ) : (
                        <>
                          <Code className="h-4 w-4 mr-1" />
                          Variabelen
                        </>
                      )}
                    </Button>
                    
                    {selectedTemplate && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseTemplate(selectedTemplate)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Kopiëren
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingTemplate({ ...selectedTemplate });
                            setIsEditing(true);
                            setActiveTab("editor");
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Bewerken
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="border rounded-lg p-6 bg-muted/30 min-h-[500px] max-h-[600px] overflow-y-auto">
                  {(selectedTemplate?.content || editingTemplate.content) ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: renderPreview(selectedTemplate?.content || editingTemplate.content || "", previewMode) 
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                      <Eye className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Geen template geselecteerd
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Selecteer een template uit de bibliotheek of maak een nieuw template
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-muted-foreground">Preview Tips:</p>
                      <p className="text-muted-foreground mt-1">
                        {previewMode ? 
                          "✨ Je ziet nu hoe de template eruit ziet met echte sample data" : 
                          "🔤 Variabelen worden getoond zoals ze in de template staan"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TemplateEditor;