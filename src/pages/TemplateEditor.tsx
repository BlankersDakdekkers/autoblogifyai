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
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Palette,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "blog" | "landing" | "email" | "social";
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
  const [previewMode, setPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Wizard steps for better UX
  const steps = [
    { id: 1, title: "Template Info", description: "Basisinformatie", icon: FileText },
    { id: 2, title: "Content", description: "Template inhoud", icon: Edit },
    { id: 3, title: "Variabelen", description: "Dynamische velden", icon: Zap },
    { id: 4, title: "Instellingen", description: "Configuratie", icon: Settings },
    { id: 5, title: "Preview", description: "Voorbeeld", icon: Eye }
  ];

  // Predefined variable suggestions
  const variableSuggestions = [
    { name: "title", description: "Hoofdtitel van de content", example: "{{title}}" },
    { name: "city", description: "Stad of locatie", example: "{{city}}" },
    { name: "service", description: "Service of product", example: "{{service}}" },
    { name: "phone", description: "Telefoonnummer", example: "{{phone}}" },
    { name: "company_name", description: "Bedrijfsnaam", example: "{{company_name}}" },
    { name: "price", description: "Prijs informatie", example: "{{price}}" },
    { name: "date", description: "Datum", example: "{{date}}" },
    { name: "author", description: "Auteur naam", example: "{{author}}" }
  ];

  // Template starters for different categories
  const templateStarters = {
    blog: `# {{title}} - {{city}}

## Inleiding
Welkom bij onze gids over {{topic}}. In dit artikel behandelen we alles wat u moet weten over {{service}} in {{city}}.

## Hoofdcontent
{{main_content}}

## Conclusie
Voor meer informatie over {{service}}, neem contact met ons op via {{phone}}.`,
    
    landing: `# {{headline}}

## Het Probleem
{{problem_description}}

## De Oplossing
{{solution_description}}

## Waarom Kiezen Voor Ons?
✅ {{benefit_1}}
✅ {{benefit_2}}
✅ {{benefit_3}}

## Call to Action
{{cta_text}} - Bel {{phone}} of mail naar {{email}}`,

    email: `Onderwerp: {{subject}}

Beste {{first_name}},

{{intro_text}}

{{main_message}}

Met vriendelijke groet,
{{sender_name}}
{{company_name}}`,

    social: `🔥 {{headline}}

{{description}}

👉 {{call_to_action}}

#{{hashtag1}} #{{hashtag2}} #{{hashtag3}}`
  };

  const templates: Template[] = [
    {
      id: "seo-blog-nl",
      name: "SEO Blog Post - Nederland",
      description: "Geoptimaliseerd voor Nederlandse markt met lokale SEO focus",
      category: "blog",
      content: templateStarters.blog,
      variables: ["title", "city", "topic", "service", "main_content", "phone"],
      tags: ["seo", "nederland", "lokaal", "blog"],
      isPublic: true,
      isPremium: false,
      usageCount: 1247,
      rating: 4.8,
      author: "SEO Expert",
      createdAt: "2025-01-18"
    },
    {
      id: "service-landing-page",
      name: "Service Landing Page",
      description: "Conversie-geoptimaliseerde landingspagina voor lokale diensten",
      category: "landing",
      content: templateStarters.landing,
      variables: ["headline", "problem_description", "solution_description", "benefit_1", "benefit_2", "benefit_3", "cta_text", "phone", "email"],
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

  // Debug logging
  console.log('Templates available:', templates.length);
  console.log('Filtered templates:', filteredTemplates.length);
  console.log('IsEditing:', isEditing);
  console.log('Selected template:', selectedTemplate?.name);
  console.log('Current step:', currentStep);

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(editingTemplate.name && editingTemplate.category);
      case 2:
        return !!(editingTemplate.content && editingTemplate.content.length > 10);
      case 3:
        return true; // Variables are optional
      case 4:
        return true; // Settings are optional
      case 5:
        return true; // Preview is just viewing
      default:
        return false;
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = editingTemplate.content || '';
      const newContent = currentContent.substring(0, start) + `{{${variable}}}` + currentContent.substring(end);
      
      setEditingTemplate(prev => ({ ...prev, content: newContent }));
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
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
    setCurrentStep(1);
    setIsEditing(true);
    setIsDialogOpen(false);
    
    toast({
      title: "Wizard gestart!",
      description: withStarter ? 
        `Template wizard gestart met ${category} starter` : 
        "Template wizard gestart met leeg template"
    });
  };

  // Sample data voor preview - uitgebreidere dataset
  const sampleData = {
    title: "Dakdekker Amsterdam - Professionele Dakwerkzaamheden",
    city: "Amsterdam", 
    topic: "dakdekken",
    service: "dakdekker diensten",
    main_content: "Onze ervaren dakdekkers bieden volledige dakoplossingen in Amsterdam. Van lekkage reparatie tot complete nieuwe daken, wij zorgen voor kwaliteit en snelle service.",
    phone: "020-1234567",
    headline: "De Beste Dakdekker in Amsterdam",
    problem_description: "Uw dak lekt en u zoekt een betrouwbare dakdekker? Lekkages kunnen tot ernstige waterschade leiden.",
    solution_description: "Wij bieden snelle, professionele dakreparaties en nieuwe daken. Onze experts komen binnen 24 uur ter plaatse.",
    benefit_1: "25 jaar ervaring in dakdekken",
    benefit_2: "Gratis inspectie en offerte",
    benefit_3: "Garantie op al ons werk",
    cta_text: "Bel nu voor een gratis offerte",
    email: "info@dakdekker-amsterdam.nl",
    company_name: "Dakdekkers Amsterdam BV",
    first_name: "Jan",
    subject: "Uw dakprobleem opgelost binnen 24 uur",
    intro_text: "Heeft u last van een lekkend dak?",
    main_message: "Onze specialisten staan voor u klaar om uw dakprobleem snel op te lossen.",
    sender_name: "Piet Janssen",
    call_to_action: "Bel direct voor hulp!",
    hashtag1: "dakdekker",
    hashtag2: "amsterdam", 
    hashtag3: "dakservice",
    // Extra variabelen die ontbreken kunnen worden toegevoegd
    description: "Professionele dakwerkzaamheden in Amsterdam en omstreken"
  };

  const renderPreview = (content: string, withSampleData: boolean = false) => {
    if (!content) return '';
    
    let previewContent = content;
    
    if (withSampleData) {
      // Debug logging
      console.log('Rendering with sample data:', withSampleData);
      console.log('Original content:', content.substring(0, 100) + '...');
      
      // Replace variables with sample data
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        const beforeCount = (previewContent.match(regex) || []).length;
        previewContent = previewContent.replace(regex, `<span class="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">${value}</span>`);
        if (beforeCount > 0) {
          console.log(`Replaced ${beforeCount} instances of {{${key}}} with "${value}"`);
        }
      });
      
      // Replace any remaining variables with highlighted placeholders  
      const remainingVars = previewContent.match(/\{\{([^}]+)\}\}/g);
      if (remainingVars) {
        console.log('Remaining unmatched variables:', remainingVars);
      }
      
      previewContent = previewContent.replace(/\{\{([^}]+)\}\}/g, '<span class="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md border border-dashed border-orange-300">Ontbreekt: $1</span>');
    } else {
      // Just highlight variable names
      previewContent = previewContent.replace(/\{\{([^}]+)\}\}/g, '<span class="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md font-mono text-xs">{{$1}}</span>');
    }
    
    // Convert markdown-style formatting with better styling
    previewContent = previewContent
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-foreground border-b pb-2">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 text-foreground mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2 text-foreground mt-4">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-6 mb-1 list-disc">$1</li>')
      .replace(/^✅ (.+)$/gm, '<div class="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded"><span class="text-green-600 font-medium">✅</span> <span>$1</span></div>')
      .replace(/^👉 (.+)$/gm, '<div class="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded"><span class="text-blue-600 font-medium">👉</span> <span>$1</span></div>')
      .replace(/\n\n/g, '<div class="mb-4"></div>')
      .replace(/\n/g, '<br/>');
    
    console.log('Final preview content:', previewContent.substring(0, 200) + '...');
    return previewContent;
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
    setCurrentStep(1);
  };

  const handleUseTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast({
      title: "Template gekopieerd",
      description: `"${template.name}" is naar het klembord gekopieerd.`
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Template Editor
          </h2>
          <p className="text-muted-foreground">
            Maak, bewerk en beheer je content templates met de gebruiksvriendelijke wizard
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Template Wizard - Kies je Start
                </DialogTitle>
                <DialogDescription>
                  Begin met een vooraf gemaakte template of start helemaal opnieuw
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(templateStarters).map(([category, content]) => (
                    <Card 
                      key={category} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 hover:border-primary/50"
                      onClick={() => startNewTemplate(category, true)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-3">
                          {category === 'blog' ? '📝' :
                           category === 'landing' ? '🎯' :
                           category === 'email' ? '📧' : '📱'}
                        </div>
                        <h4 className="font-semibold mb-2">
                          {category === 'blog' ? 'Blog Post' :
                           category === 'landing' ? 'Landing Page' :
                           category === 'email' ? 'Email Template' : 'Social Media'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {category === 'blog' ? 'SEO-geoptimaliseerde artikelen met lokale focus' :
                           category === 'landing' ? 'Conversie-gerichte paginas met CTA\'s' :
                           category === 'email' ? 'Professional email templates' : 'Sociale media posts met hashtags'}
                        </p>
                        <Button size="sm" className="mt-3 w-full" variant="outline">
                          Start met {category === 'blog' ? 'Blog' : 
                                   category === 'landing' ? 'Landing' :
                                   category === 'email' ? 'Email' : 'Social'} Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Of begin helemaal opnieuw zonder voorbeeldcontent
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => startNewTemplate()}
                    className="w-full max-w-xs"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Leeg Template Maken
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template Library */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template Bibliotheek
            </CardTitle>
            <CardDescription>
              Selecteer een template om te bewerken of bekijken
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Zoek templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter categorie" />
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

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        {template.isPremium && (
                          <Crown className="h-3 w-3 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{template.rating}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.usageCount} gebruikt</span>
                      <span>{template.variables.length} variabelen</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor/Preview Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Edit className="h-5 w-5" />
                        {selectedTemplate ? 'Template Bewerken' : 'Nieuw Template'}
                      </>
                    ) : (
                      <>
                        <Eye className="h-5 w-5" />
                        Template Preview
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedTemplate?.name || editingTemplate.name || 'Selecteer een template'}
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  {!isEditing && selectedTemplate && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        {previewMode ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseTemplate(selectedTemplate)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Kopieer
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(selectedTemplate);
                          setCurrentStep(1);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Bewerk
                      </Button>
                    </>
                  )}
                  
                  {isEditing && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingTemplate({});
                          setCurrentStep(1);
                        }}
                      >
                        Annuleer
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Step Progress Indicator */}
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                          getStepStatus(step.id) === 'completed' 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : getStepStatus(step.id) === 'current'
                            ? 'bg-primary/10 text-primary border-primary'
                            : 'bg-background text-muted-foreground border-muted-foreground'
                        }`}>
                          {getStepStatus(step.id) === 'completed' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-4 w-4" />
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`w-16 h-0.5 ml-2 ${
                            getStepStatus(step.id) === 'completed' ? 'bg-primary' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Step Titles */}
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-semibold">
                      {steps[currentStep - 1]?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {steps[currentStep - 1]?.description}
                    </p>
                  </div>

                  {/* Step Content */}
                  <div className="min-h-[400px]">
                    {/* Step 1: Template Info */}
                    {currentStep === 1 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Template Starter</h4>
                              <p className="text-sm text-blue-700 mb-3">
                                Begin snel met een vooraf gemaakte template structuur
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(templateStarters).map(([category, content]) => (
                                  <Button
                                    key={category}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingTemplate(prev => ({
                                        ...prev,
                                        content: content,
                                        category: category as any
                                      }));
                                      setCurrentStep(2);
                                      toast({
                                        title: "Template starter geladen!",
                                        description: `${category} template is toegevoegd aan je content`
                                      });
                                    }}
                                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                                  >
                                    {category === 'blog' ? 'Blog Post' :
                                     category === 'landing' ? 'Landing Page' :
                                     category === 'email' ? 'Email' : 'Social Media'}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="template-name" className="flex items-center gap-2">
                              Template Naam
                              <Badge variant="destructive" className="text-xs">Verplicht</Badge>
                            </Label>
                            <Input
                              id="template-name"
                              value={editingTemplate.name || ""}
                              onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Bijv. SEO Blog Post Nederland"
                              className={`${!editingTemplate.name ? 'border-red-200 focus:border-red-500' : 'border-green-200'}`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Kies een duidelijke naam die het doel van je template beschrijft
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="template-category" className="flex items-center gap-2">
                              Categorie
                              <Badge variant="destructive" className="text-xs">Verplicht</Badge>
                            </Label>
                            <Select 
                              value={editingTemplate.category || ""} 
                              onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, category: value as any }))}
                            >
                              <SelectTrigger className={`${!editingTemplate.category ? 'border-red-200' : 'border-green-200'}`}>
                                <SelectValue placeholder="Selecteer categorie" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blog">📝 Blog Post</SelectItem>
                                <SelectItem value="landing">🎯 Landing Page</SelectItem>
                                <SelectItem value="email">📧 Email</SelectItem>
                                <SelectItem value="social">📱 Social Media</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="template-description">Beschrijving</Label>
                          <Textarea
                            id="template-description"
                            value={editingTemplate.description || ""}
                            onChange={(e) => setEditingTemplate(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Korte beschrijving van wat dit template doet en wanneer je het gebruikt"
                            rows={3}
                            className="resize-none"
                          />
                          <p className="text-xs text-muted-foreground">
                            Leg uit wanneer en hoe dit template gebruikt moet worden
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Content */}
                    {currentStep === 2 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-start gap-3">
                            <Palette className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-purple-900">Template Content Tips</h4>
                              <ul className="text-sm text-purple-700 space-y-1 mt-1">
                                <li>• Gebruik <code className="bg-purple-100 px-1 rounded">{"{{variabele}}"}</code> voor dynamische content</li>
                                <li>• Schrijf in duidelijke, simpele taal</li>
                                <li>• Gebruik koppen (# ## ###) voor structuur</li>
                                <li>• Voeg call-to-actions toe waar relevant</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          {/* Content Editor */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="template-content" className="text-base font-medium flex items-center gap-2">
                                Template Content
                                <Badge variant="destructive" className="text-xs">Verplicht</Badge>
                              </Label>
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => setShowHelp(!showHelp)}
                              >
                                <HelpCircle className="h-4 w-4 mr-1" />
                                Help
                              </Button>
                            </div>
                            
                            <Textarea
                              id="template-content"
                              value={editingTemplate.content || ""}
                              onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Schrijf hier je template content. Gebruik {{variabele}} voor dynamische velden..."
                              rows={18}
                              className={`font-mono text-sm resize-none ${!editingTemplate.content ? 'border-destructive/50 focus:border-destructive' : 'border-success/50'}`}
                            />
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {editingTemplate.content?.length || 0} karakters
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {extractVariables(editingTemplate.content || "").length} variabelen gevonden
                              </span>
                            </div>
                          </div>

                          {/* Live Preview */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Live Preview</Label>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewMode(!previewMode)}
                              >
                                {previewMode ? (
                                  <>
                                    <Code className="h-4 w-4 mr-1" />
                                    Variabelen
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Sample Data
                                  </>
                                )}
                              </Button>
                            </div>

                            <div className="border rounded-lg p-4 bg-muted/30 min-h-[430px] max-h-[430px] overflow-y-auto">
                              {editingTemplate.content ? (
                                <div 
                                  className="text-sm prose prose-sm max-w-none [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium"
                                  dangerouslySetInnerHTML={{ 
                                    __html: renderPreview(editingTemplate.content, previewMode) 
                                  }}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                  <Eye className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                  <p className="text-sm text-muted-foreground font-medium">
                                    Begin met typen om een live preview te zien
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Variabelen worden automatisch gedetecteerd
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="text-xs bg-muted/50 p-3 rounded-lg">
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
                          </div>
                        </div>

                        {showHelp && (
                          <div className="bg-muted/50 p-4 rounded-lg space-y-3 animate-fade-in">
                            <h4 className="font-medium flex items-center gap-2">
                              <HelpCircle className="h-4 w-4" />
                              Markdown Syntax Help
                            </h4>
                            <div className="grid gap-2 text-sm">
                              <div><code># Hoofdkop</code> - Grote titel</div>
                              <div><code>## Subkop</code> - Subtitel</div>
                              <div><code>**Vet tekst**</code> - Vetgedrukt</div>
                              <div><code>*Cursief*</code> - Cursieve tekst</div>
                              <div><code>- Lijst item</code> - Opsommingsteken</div>
                              <div><code>[Link tekst](url)</code> - Hyperlink</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Variables */}
                    {currentStep === 3 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-start gap-3">
                            <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-900">Variabelen Beheer</h4>
                              <p className="text-sm text-green-700">
                                Klik op een variabele om deze in je content toe te voegen
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Gevonden Variabelen
                            </h4>
                            {extractVariables(editingTemplate.content || "").length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {extractVariables(editingTemplate.content || "").map(variable => (
                                  <Badge key={variable} variant="secondary" className="text-xs py-1">
                                    {variable}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Geen variabelen gevonden. Voeg variabelen toe met {"{{naam}}"} syntax.
                              </p>
                            )}
                          </div>

                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Voorgestelde Variabelen
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {variableSuggestions.map((suggestion) => (
                                <div
                                  key={suggestion.name}
                                  className="p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => insertVariable(suggestion.name)}
                                >
                                  <div className="flex items-center justify-between">
                                    <code className="text-xs bg-muted px-1 rounded">{suggestion.example}</code>
                                    <Plus className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Settings */}
                    {currentStep === 4 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h4 className="font-medium">Organisatie</h4>
                            <div className="space-y-2">
                              <Label htmlFor="template-tags">Tags (gescheiden door komma's)</Label>
                              <Input
                                id="template-tags"
                                value={editingTemplate.tags?.join(', ') || ""}
                                onChange={(e) => setEditingTemplate(prev => ({ 
                                  ...prev, 
                                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                                }))}
                                placeholder="seo, lokaal, dienstverlening, marketing"
                              />
                              <p className="text-xs text-muted-foreground">
                                Tags helpen bij het organiseren en zoeken van templates
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium">Zichtbaarheid</h4>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="template-public"
                                  checked={editingTemplate.isPublic || false}
                                  onCheckedChange={(checked) => setEditingTemplate(prev => ({ ...prev, isPublic: !!checked }))}
                                />
                                <Label htmlFor="template-public" className="flex items-center gap-2">
                                  Publiek template
                                  <Badge variant="secondary" className="text-xs">Aanbevolen</Badge>
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground ml-6">
                                Andere gebruikers kunnen dit template gebruiken
                              </p>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="template-premium"
                                  checked={editingTemplate.isPremium || false}
                                  onCheckedChange={(checked) => setEditingTemplate(prev => ({ ...prev, isPremium: !!checked }))}
                                />
                                <Label htmlFor="template-premium" className="flex items-center gap-2">
                                  Premium template
                                  <Crown className="h-3 w-3 text-yellow-600" />
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground ml-6">
                                Alleen premium gebruikers kunnen dit template gebruiken
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Preview */}
                    {currentStep === 5 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                          <div className="flex items-start gap-3">
                            <Eye className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-amber-900">Template Voorvertoning</h4>
                              <p className="text-sm text-amber-700">
                                Controleer je template voordat je het opslaat
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-3">Template Samenvatting</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Naam:</span>
                                <span className="font-medium">{editingTemplate.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Categorie:</span>
                                <Badge variant="outline">{editingTemplate.category}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Variabelen:</span>
                                <span>{extractVariables(editingTemplate.content || "").length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Content lengte:</span>
                                <span>{editingTemplate.content?.length || 0} karakters</span>
                              </div>
                              <Separator />
                              <div>
                                <span className="text-muted-foreground block mb-1">Tags:</span>
                                <div className="flex flex-wrap gap-1">
                                  {editingTemplate.tags?.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                  )) || <span className="text-xs text-muted-foreground">Geen tags</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Preview</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {previewMode ? 'Met Sample Data' : 'Variabelen Zichtbaar'}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPreviewMode(!previewMode)}
                                >
                                  {previewMode ? (
                                    <>
                                      <Code className="h-3 w-3 mr-1" />
                                      Variabelen
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3 w-3 mr-1" />
                                      Sample Data
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            <div className="bg-card border rounded-lg p-4 max-h-80 overflow-y-auto text-sm">
                              <div 
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                  __html: renderPreview(editingTemplate.content || "", previewMode) 
                                }} 
                              />
                            </div>
                            
                            <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                              {previewMode ? 
                                "💡 Dit is hoe je template eruit ziet met echte content data" : 
                                "💡 Variabelen worden getoond zoals ze in de template staan"
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : null}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Vorige
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      Stap {currentStep} van {steps.length}
                    </div>

                    <div className="flex gap-2">
                      {currentStep < steps.length ? (
                        <Button
                          onClick={() => {
                            if (validateStep(currentStep)) {
                              setCurrentStep(currentStep + 1);
                            } else {
                              toast({
                                title: "Ontbrekende informatie",
                                description: "Vul alle verplichte velden in voordat je doorgaat.",
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={!validateStep(currentStep)}
                        >
                          Volgende
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      ) : (
                        <Button onClick={handleSaveTemplate}>
                          <Save className="h-4 w-4 mr-1" />
                          Template Opslaan
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                ) : selectedTemplate ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Template Bekijken</h4>
                        <p className="text-sm text-blue-700">
                          Bekijk de template details en variabelen. Klik 'Bewerk' om aan te passen.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-sm font-medium">Categorie</Label>
                      <Badge variant="outline" className="mt-1">
                        {selectedTemplate.category}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Rating</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{selectedTemplate.rating}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Gebruik</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTemplate.usageCount}x gebruikt
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Variabelen ({selectedTemplate.variables.length})</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTemplate.variables.map(variable => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {"{{" + variable + "}}"}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deze variabelen worden vervangen door echte content bij gebruik
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTemplate.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Content Preview</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={previewMode ? "default" : "secondary"} className="text-xs">
                          {previewMode ? 'Preview Mode' : 'Raw Mode'} 
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {selectedTemplate.content.length} karakters
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 p-4 bg-card border rounded-lg max-h-80 overflow-y-auto">
                      <div 
                        className="text-sm prose prose-sm max-w-none [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium"
                        dangerouslySetInnerHTML={{ 
                          __html: previewMode ? 
                            renderPreview(selectedTemplate.content, true) : 
                            `<pre class="text-xs font-mono whitespace-pre-wrap text-muted-foreground">${selectedTemplate.content}</pre>`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewMode(!previewMode)}
                        >
                          {previewMode ? (
                            <>
                              <Code className="h-4 w-4 mr-1" />
                              Raw Code
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </>
                          )}
                        </Button>
                        <Badge variant={previewMode ? "default" : "secondary"} className="text-xs">
                          {previewMode ? 'Met Sample Data' : 'Raw Template'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUseTemplate(selectedTemplate)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Kopieer
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingTemplate({...selectedTemplate});
                            setIsEditing(true);
                            setCurrentStep(1);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Bewerk
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground/50" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Geen template geselecteerd</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecteer een template uit de bibliotheek om te bekijken of bewerken, 
                      of maak een nieuw template met de wizard.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => startNewTemplate()}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Start Template Wizard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;