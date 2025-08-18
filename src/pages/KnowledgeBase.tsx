import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Book, 
  Plus, 
  FileText, 
  Video, 
  Code, 
  Settings,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  User,
  Tag,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'article' | 'video' | 'guide' | 'faq' | 'code';
  author: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  views: number;
  rating: number;
  status: 'draft' | 'published' | 'archived';
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    category: "",
    type: "article" as KnowledgeItem['type'],
    tags: ""
  });
  const [previewItems, setPreviewItems] = useState<KnowledgeItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { toast } = useToast();

  // Sample data - in real app this would come from database
  const [categories] = useState<Category[]>([
    { id: "seo", name: "SEO", description: "Search Engine Optimization strategieën", color: "bg-blue-100 text-blue-800", icon: "🎯" },
    { id: "marketing", name: "Marketing", description: "Content marketing en strategieën", color: "bg-green-100 text-green-800", icon: "📈" },
    { id: "techniek", name: "Techniek", description: "Technische implementatie en tools", color: "bg-purple-100 text-purple-800", icon: "⚙️" },
    { id: "workflow", name: "Workflow", description: "Workflow optimalisatie en automatisering", color: "bg-orange-100 text-orange-800", icon: "🔄" },
    { id: "planning", name: "Planning", description: "Content planning en strategie", color: "bg-cyan-100 text-cyan-800", icon: "📅" },
    { id: "tools", name: "Tools", description: "Software tools en utilities", color: "bg-yellow-100 text-yellow-800", icon: "🛠️" },
    { id: "analytics", name: "Analytics", description: "Data analyse en rapportage", color: "bg-red-100 text-red-800", icon: "📊" },
    { id: "content", name: "Content", description: "Content creatie en beheer", color: "bg-indigo-100 text-indigo-800", icon: "📝" },
    { id: "wordpress", name: "WordPress", description: "WordPress specifieke documentatie", color: "bg-emerald-100 text-emerald-800", icon: "📱" },
    { id: "automation", name: "Automation", description: "Automatisering en AI tools", color: "bg-violet-100 text-violet-800", icon: "🚀" }
  ]);

  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);

  // Load knowledge items from database
  useEffect(() => {
    if (user) {
      loadKnowledgeItems();
    }
  }, [user]);

  const loadKnowledgeItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform database format to component format
      const transformedItems: KnowledgeItem[] = data?.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        type: item.type as KnowledgeItem['type'],
        author: item.author || 'Onbekend',
        created_at: item.created_at.split('T')[0],
        updated_at: item.updated_at.split('T')[0],
        tags: item.tags || [],
        views: item.views || 0,
        rating: item.rating || 0,
        status: item.status as 'draft' | 'published' | 'archived'
      })) || [];

      setKnowledgeItems(transformedItems);
    } catch (error) {
      console.error('Error loading knowledge items:', error);
      toast({
        title: "Fout",
        description: "Kon kennisbank items niet laden",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv' // alternative csv mime type
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Upload Excel (.xlsx, .xls) of CSV bestanden",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory === 'all' ? 'content' : selectedCategory);

      const { data, error } = await supabase.functions.invoke('parse-excel', {
        body: formData
      });

      if (error) throw error;

      if (data?.preview && Array.isArray(data.preview)) {
        toast({
          title: "Afbeeldingen genereren...",
          description: "AI genereert automatisch passende afbeeldingen voor elk artikel"
        });

        toast({
          title: "Content genereren...",
          description: "AI genereert complete geoptimaliseerde blogposts met neuromarketing technieken"
        });

        // Generate AI-optimized content and images for each item
        const itemsWithAIContent = await Promise.all(
          data.preview.map(async (item: any, index: number) => {
            try {
              // Show progress
              if (index % 3 === 0) {
                toast({
                  title: `Genereren... ${index + 1}/${data.preview.length}`,
                  description: `AI werkt aan: ${item.title.substring(0, 50)}...`
                });
              }

              // Generate complete AI blog content with neuromarketing
              const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-content', {
                body: {
                  title: item.title,
                  targetKeyword: item.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim(),
                  city: "Nederland",
                  contentType: "blog",
                  language: "nl",
                  includeMetaDescription: true,
                  includeFaq: true,
                  includeCta: true
                }
              });

              if (contentError) {
                console.error('Content generation error:', contentError);
              }

              // Generate AI image
              const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-blog-images', {
                body: {
                  title: item.title,
                  content: contentData?.content || item.content || '',
                  category: item.category || 'content'
                }
              });

              if (imageError) {
                console.error('Image generation error:', imageError);
              }

              // Use AI-generated content or fallback to original
              const finalContent = contentData?.content || item.content || `
# ${item.title}

## Introductie

${item.title} is een cruciaal onderdeel van moderne digitale marketing strategieën. In dit artikel bespreken we de belangrijkste aspecten en praktische tips voor succes.

## Waarom ${item.title} Belangrijk Is

In de huidige competitieve online wereld is het essentieel om:

- **Zichtbaarheid** te vergroten in zoekmachines
- **Doelgroepgerichte** content te creëren
- **Conversies** te optimaliseren
- **Brand awareness** te verhogen

## Praktische Tips voor ${item.title}

### 1. Keyword Research
Begin altijd met grondig onderzoek naar relevante zoekwoorden die je doelgroep gebruikt.

### 2. Content Optimalisatie  
Zorg ervoor dat je content waarde toevoegt en vragen beantwoordt van je doelgroep.

### 3. Technische SEO
Optimaliseer je website technisch voor betere prestaties en gebruikerservaring.

## Conclusie

${item.title} vereist een strategische aanpak en constante optimalisatie. Door de juiste technieken toe te passen, kun je significant betere resultaten behalen.

**Wil je hulp bij ${item.title}?** Neem contact met ons op voor professioneel advies en ondersteuning.
              `.trim();

              return {
                ...item,
                id: crypto.randomUUID(),
                type: 'article' as const,
                author: "Beheerder",
                created_at: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString().split('T')[0],
                tags: item.tags || [item.category || 'SEO'],
                views: 0,
                rating: 0,
                status: 'draft' as const,
                content: finalContent,
                meta_description: contentData?.metaDescription || `Ontdek alles over ${item.title}. Complete gids met praktische tips en strategieën voor optimale resultaten.`,
                faq: contentData?.faq || '',
                cta: contentData?.cta || `Wil je hulp bij ${item.title}? Neem contact op voor professioneel advies.`,
                image_url: imageData?.imageUrl || null
              };
            } catch (error) {
              console.error('Failed to generate AI content for item:', item.title, error);
              // Always return an item, even if generation fails
              return {
                ...item,
                id: crypto.randomUUID(),
                type: 'article' as const,
                author: "Beheerder",
                created_at: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString().split('T')[0],
                tags: item.tags || [item.category || 'SEO'],
                views: 0,
                rating: 0,
                status: 'draft' as const,
                content: item.content || `# ${item.title}\n\nContent voor dit artikel wordt nog gegenereerd...`,
                image_url: null
              };
            }
          })
        );

        setPreviewItems(itemsWithAIContent);
        setShowPreview(true);
        
        toast({
          title: "Content gegenereerd! 🎉",
          description: `${itemsWithAIContent.length} complete SEO-geoptimaliseerde artikelen klaar voor preview`
        });
        
        // Reset file input
        event.target.value = '';
      } else {
        throw new Error(data?.error || 'Ongeldig bestandsformaat');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload mislukt",
        description: error instanceof Error ? error.message : "Onbekende fout",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesType = selectedType === "all" || item.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType && item.status === "published";
  });

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.content || !newItem.category) {
      toast({
        title: "Velden ontbreken",
        description: "Vul alle verplichte velden in.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Niet ingelogd",
        description: "Je moet ingelogd zijn om items toe te voegen.",
        variant: "destructive"
      });
      return;
    }

    try {
      const tags = newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('knowledge_items')
        .insert({
          user_id: user.id,
          title: newItem.title,
          content: newItem.content,
          category: newItem.category,
          type: newItem.type,
          author: "Beheerder",
          tags,
          status: 'published'
        });

      if (error) throw error;

      setNewItem({ title: "", content: "", category: "", type: "article", tags: "" });
      setIsEditMode(false);
      await loadKnowledgeItems();

      toast({
        title: "Item toegevoegd",
        description: "Het kennisbank item is succesvol toegevoegd.",
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Fout",
        description: "Kon item niet toevoegen",
        variant: "destructive"
      });
    }
  };

  const handleEditItem = (item: KnowledgeItem) => {
    setEditingItem(item);
    setNewItem({
      title: item.title,
      content: item.content,
      category: item.category,
      type: item.type,
      tags: item.tags.join(', ')
    });
    setIsEditMode(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !newItem.title || !newItem.content || !newItem.category) {
      toast({
        title: "Velden ontbreken",
        description: "Vul alle verplichte velden in.",
        variant: "destructive"
      });
      return;
    }

    const updatedItems = knowledgeItems.map(item => 
      item.id === editingItem.id 
        ? {
            ...item,
            title: newItem.title,
            content: newItem.content,
            category: newItem.category,
            type: newItem.type,
            tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            updated_at: new Date().toISOString().split('T')[0]
          }
        : item
    );

    setKnowledgeItems(updatedItems);
    setEditingItem(null);
    setNewItem({ title: "", content: "", category: "", type: "article", tags: "" });
    setIsEditMode(false);

    toast({
      title: "Item bijgewerkt",
      description: "Het kennisbank item is succesvol bijgewerkt.",
    });
  };

  const handleDeleteItem = (id: string) => {
    setKnowledgeItems(knowledgeItems.filter(item => item.id !== id));
    toast({
      title: "Item verwijderd",
      description: "Het kennisbank item is verwijderd.",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'guide': return <Book className="h-4 w-4" />;
      case 'faq': return <Search className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const handleConfirmPreview = async () => {
    if (!user) return;
    
    try {
      const itemsToInsert = previewItems.map(item => ({
        user_id: user.id,
        title: item.title,
        content: item.content,
        category: item.category,
        type: item.type,
        author: item.author,
        tags: item.tags,
        status: 'published'
      }));

      const { error } = await supabase
        .from('knowledge_items')
        .insert(itemsToInsert);

      if (error) throw error;

      toast({
        title: "Items toegevoegd",
        description: `${previewItems.length} items succesvol toegevoegd aan de kennisbank.`
      });

      setPreviewItems([]);
      setShowPreview(false);
      await loadKnowledgeItems();
    } catch (error) {
      console.error('Error confirming preview:', error);
      toast({
        title: "Fout",
        description: "Kon items niet toevoegen",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kennisbank</h2>
          <p className="text-muted-foreground">
            Doorzoek onze uitgebreide kennisbank en voeg nieuwe content toe via Excel upload
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button disabled={isUploading} variant="outline">
              {isUploading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Uploaden...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel/CSV Upload
                </>
              )}
            </Button>
          </div>
          <Button onClick={() => setIsEditMode(!isEditMode)}>
            <Plus className="h-4 w-4 mr-2" />
            {isEditMode ? "Annuleren" : "Nieuw Item"}
          </Button>
        </div>
      </div>

      {/* Excel Upload Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>AI Content Generator:</strong> Upload Excel (.xlsx, .xls) of CSV bestanden met minimaal een 'Title' kolom. 
          AI genereert automatisch complete SEO-geoptimaliseerde blogposts met neuromarketing technieken, inclusief meta beschrijvingen, FAQ's, CTA's en passende afbeeldingen. Je krijgt eerst een preview voordat items worden toegevoegd.
        </AlertDescription>
      </Alert>

      {/* Preview Modal */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview van {previewItems.length} items
            </CardTitle>
            <CardDescription>
              Controleer de geïmporteerde content voordat je deze toevoegt aan de kennisbank
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {previewItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.content.substring(0, 150)}...
                  </p>
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleConfirmPreview} className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Bevestigen & Toevoegen
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPreview(false);
                  setPreviewItems([]);
                }}
                className="flex-1"
              >
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form */}
      {isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? "Item Bewerken" : "Nieuw Kennisbank Item"}</CardTitle>
            <CardDescription>
              {editingItem ? "Bewerk het geselecteerde item" : "Voeg een nieuw item toe aan de kennisbank"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Titel *</label>
                <Input
                  placeholder="Titel van het kennisbank item"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type *</label>
                <Select 
                  value={newItem.type} 
                  onValueChange={(value: any) => setNewItem({...newItem, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Artikel</SelectItem>
                    <SelectItem value="guide">Gids</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Categorie *</label>
                <Select 
                  value={newItem.category} 
                  onValueChange={(value) => setNewItem({...newItem, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tags</label>
                <Input
                  placeholder="Tags gescheiden door komma's"
                  value={newItem.tags}
                  onChange={(e) => setNewItem({...newItem, tags: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Content *</label>
              <Textarea
                placeholder="Inhoud van het kennisbank item..."
                rows={6}
                value={newItem.content}
                onChange={(e) => setNewItem({...newItem, content: e.target.value})}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
                {editingItem ? "Bijwerken" : "Toevoegen"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditMode(false);
                  setEditingItem(null);
                  setNewItem({ title: "", content: "", category: "", type: "article", tags: "" });
                }}
              >
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map(category => {
          const itemCount = knowledgeItems.filter(item => item.category === category.id && item.status === 'published').length;
          return (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h4 className="font-medium text-sm mb-1">{category.name}</h4>
                <Badge className={category.color}>{itemCount} items</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek in kennisbank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle categorieën</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle types</SelectItem>
                  <SelectItem value="article">Artikel</SelectItem>
                  <SelectItem value="guide">Gids</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Items */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => {
          const categoryInfo = getCategoryInfo(item.category);
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    <Badge className={categoryInfo.color}>
                      {categoryInfo.icon} {categoryInfo.name}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEditItem(item)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.content}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {item.views}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {item.rating}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.updated_at}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {item.author}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Geen resultaten gevonden</h3>
            <p className="text-muted-foreground mb-4">
              Probeer je zoekopdracht aan te passen of een andere categorie te selecteren.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedType("all");
            }}>
              Reset filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Kennisbank Statistieken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{knowledgeItems.filter(item => item.status === 'published').length}</div>
              <div className="text-sm text-muted-foreground">Gepubliceerde items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categorieën</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {knowledgeItems.reduce((sum, item) => sum + item.views, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Totale weergaven</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {(knowledgeItems.reduce((sum, item) => sum + item.rating, 0) / knowledgeItems.length).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Gemiddelde rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;