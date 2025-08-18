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
  Crown
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

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "seo-blog-nl",
      name: "SEO Blog Post - Nederland",
      description: "Geoptimaliseerd voor Nederlandse markt met lokale SEO focus",
      category: "blog",
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
      variables: ["title", "city", "service", "keyword", "location", "context", "costs", "number", "company_name", "specialization", "years", "min_price", "max_price", "factors", "range", "duration", "variables"],
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
      content: `# {{headline}} - {{city}}

## Het Probleem
Heeft u last van {{problem}}? U bent niet de enige. In {{city}} worstelen veel mensen met {{issue}}.

## De Oplossing: {{service}}
Onze {{service}} lost {{problem}} definitief op. Met meer dan {{years}} jaar ervaring en {{satisfied_customers}}+ tevreden klanten.

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
      variables: ["headline", "city", "problem", "issue", "service", "years", "satisfied_customers", "guarantee", "testimonial", "customer_name", "percentage", "timeframe", "quality_measures", "offer", "number", "phone"],
      tags: ["conversie", "landing", "service", "lokaal"],
      isPublic: true,
      isPremium: true,
      usageCount: 892,
      rating: 4.9,
      author: "Conversion Expert",
      createdAt: "2025-01-18"
    }
  ]);

  const [editingTemplate, setEditingTemplate] = useState<Partial<Template>>({
    name: "",
    description: "",
    category: "blog",
    content: "",
    tags: [],
    isPublic: true,
    isPremium: false
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || template.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
  };

  const renderPreview = (content: string) => {
    // Vervang variables met voorbeeld data voor preview
    const sampleData: Record<string, string> = {
      title: "Dakdekker Amsterdam - Volledige Gids",
      city: "Amsterdam",
      service: "dakdekwerk",
      keyword: "dakdekker Amsterdam",
      location: "Amsterdam en omgeving",
      context: "woningonderhoud",
      costs: "dakvervanging",
      number: "10",
      company_name: "DakPro Amsterdam",
      specialization: "bitumen dakbedekking",
      years: "15",
      min_price: "2500",
      max_price: "8500",
      factors: "dakgrootte en materiaal",
      range: "2500-8500",
      duration: "2-5 dagen",
      variables: "weersomstandigheden"
    };

    let preview = content;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      preview = preview.replace(regex, value);
    });

    return preview;
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate.name || !editingTemplate.content) {
      toast({
        title: "Verplichte velden ontbreken",
        description: "Naam en content zijn verplicht",
        variant: "destructive"
      });
      return;
    }

    const variables = extractVariables(editingTemplate.content);
    
    if (selectedTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, ...editingTemplate, variables } as Template
          : t
      ));
      toast({
        title: "Template Bijgewerkt",
        description: `"${editingTemplate.name}" is succesvol bijgewerkt`
      });
    } else {
      // Create new template
      const newTemplate: Template = {
        id: editingTemplate.name!.toLowerCase().replace(/\s+/g, '-'),
        name: editingTemplate.name!,
        description: editingTemplate.description || "",
        category: editingTemplate.category as "blog" | "landing" | "email" | "social",
        content: editingTemplate.content!,
        variables,
        tags: editingTemplate.tags || [],
        isPublic: editingTemplate.isPublic || true,
        isPremium: editingTemplate.isPremium || false,
        usageCount: 0,
        rating: 0,
        author: "Je Account",
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      toast({
        title: "Template Aangemaakt",
        description: `"${newTemplate.name}" is succesvol aangemaakt`
      });
    }

    setIsEditing(false);
    setSelectedTemplate(null);
    setEditingTemplate({});
  };

  const handleUseTemplate = (template: Template) => {
    // Verhoog usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));

    // Kopieer template content naar clipboard
    navigator.clipboard.writeText(template.content);
    
    toast({
      title: "Template Gekopieerd",
      description: `"${template.name}" is naar je clipboard gekopieerd en klaar voor gebruik`
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
      setIsEditing(false);
    }
    
    toast({
      title: "Template Verwijderd",
      description: "Template is permanent verwijderd"
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
            Maak, bewerk en beheer je content templates
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedTemplate(null);
              setEditingTemplate({
                name: "",
                description: "",
                category: "blog",
                content: "",
                tags: [],
                isPublic: true,
                isPremium: false
              });
              setIsEditing(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template Library */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Library</CardTitle>
              <CardDescription>
                Selecteer een template om te bewerken
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="space-y-2">
                <Input
                  placeholder="Zoek templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Template List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTemplates.map(template => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setEditingTemplate(template);
                      setIsEditing(false);
                      setPreviewMode(false);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            {template.isPremium && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-current" />
                              {template.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Editor/Preview */}
        <div className="lg:col-span-2">
          {selectedTemplate || isEditing ? (
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
                      {selectedTemplate?.name || 'Nieuw template'}
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
                          Gebruik
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsEditing(true)}
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
                            if (!selectedTemplate) {
                              setEditingTemplate({});
                            }
                          }}
                        >
                          Annuleer
                        </Button>
                        <Button size="sm" onClick={handleSaveTemplate}>
                          <Save className="h-4 w-4 mr-1" />
                          Opslaan
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {isEditing ? (
                  <Tabs defaultValue="content" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="settings">Instellingen</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="template-name">Naam</Label>
                          <Input
                            id="template-name"
                            value={editingTemplate.name || ""}
                            onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Template naam"
                          />
                        </div>
                        <div>
                          <Label htmlFor="template-category">Categorie</Label>
                          <Select 
                            value={editingTemplate.category || "blog"} 
                            onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, category: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blog">Blog Post</SelectItem>
                              <SelectItem value="landing">Landing Page</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="social">Social Media</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="template-description">Beschrijving</Label>
                        <Textarea
                          id="template-description"
                          value={editingTemplate.description || ""}
                          onChange={(e) => setEditingTemplate(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Korte beschrijving van dit template"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="template-content">Template Content</Label>
                        <Textarea
                          id="template-content"
                          value={editingTemplate.content || ""}
                          onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Template content met {{variabelen}}"
                          rows={15}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Gebruik {"{{"} variabele {"}"} om dynamische content aan te duiden
                        </p>
                      </div>
                      
                      {editingTemplate.content && (
                        <div>
                          <Label>Gevonden Variabelen</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {extractVariables(editingTemplate.content).map(variable => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-4">
                      <div>
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
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="template-public"
                            checked={editingTemplate.isPublic || false}
                            onChange={(e) => setEditingTemplate(prev => ({ ...prev, isPublic: e.target.checked }))}
                          />
                          <Label htmlFor="template-public">Publiek template</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="template-premium"
                            checked={editingTemplate.isPremium || false}
                            onChange={(e) => setEditingTemplate(prev => ({ ...prev, isPremium: e.target.checked }))}
                          />
                          <Label htmlFor="template-premium">Premium template</Label>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-4">
                    {selectedTemplate && (
                      <>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <Label className="text-sm font-medium">Categorie</Label>
                            <Badge variant="outline" className="mt-1">
                              {selectedTemplate.category}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Gebruikt</Label>
                            <p className="text-sm text-muted-foreground">{selectedTemplate.usageCount}x</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Rating</Label>
                            <p className="text-sm text-muted-foreground">⭐ {selectedTemplate.rating}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Variabelen</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedTemplate.variables.map(variable => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">
                            {previewMode ? 'Preview' : 'Raw Content'}
                          </Label>
                          <div className="mt-2 p-4 bg-muted rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm">
                              {previewMode 
                                ? renderPreview(selectedTemplate.content)
                                : selectedTemplate.content
                              }
                            </pre>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Geen Template Geselecteerd</h3>
                <p className="text-muted-foreground mb-4">
                  Selecteer een template uit de library of maak een nieuw template aan
                </p>
                <Button onClick={() => setIsEditing(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuw Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;