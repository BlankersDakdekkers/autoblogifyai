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
  CheckCircle2,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AIProgressSidebar } from "@/components/AIProgressSidebar";

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
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showProgressSidebar, setShowProgressSidebar] = useState(false);
  const [progressItems, setProgressItems] = useState<any[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [approvedItems, setApprovedItems] = useState<Set<string>>(new Set());
  const [rejectedItems, setRejectedItems] = useState<Set<string>>(new Set());
  const [isPublishing, setIsPublishing] = useState(false);

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
    setShowProgressSidebar(true);
    setProgressItems([]);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory === 'all' ? 'content' : selectedCategory);

      const { data, error } = await supabase.functions.invoke('parse-excel', {
        body: formData
      });

      if (error) throw error;

      if (data?.preview && Array.isArray(data.preview)) {
        // Initialize progress items
        const initialProgressItems = data.preview.map((item: any) => ({
          id: crypto.randomUUID(),
          title: item.title,
          status: 'pending',
          progress: 0,
          step: 'Wachten op AI verwerking...',
          timestamp: new Date().toISOString()
        }));
        
        setProgressItems(initialProgressItems);

        toast({
          title: "AI Content Generator gestart",
          description: "AI genereert complete SEO-geoptimaliseerde blogposts met neuromarketing technieken"
        });

        // Generate AI-optimized content and images for each item
        const itemsWithAIContent = await Promise.all(
          data.preview.map(async (item: any, index: number) => {
            try {
              // Update progress
              setProgressItems(prev => prev.map(p => 
                p.title === item.title 
                  ? { ...p, status: 'processing', step: 'Content genereren...', progress: 10 }
                  : p
              ));

              // Show progress every few items

              // Generate complete AI blog content with neuromarketing
              setProgressItems(prev => prev.map(p => 
                p.title === item.title 
                  ? { ...p, progress: 30, step: 'AI content genereren...' }
                  : p
              ));

               console.log('Calling generate-content function with:', {
                 title: item.title,
                 targetKeyword: item.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim(),
                 city: "Nederland",
                 contentType: "blog",
                 language: "nl",
                 wordCount: 1200,
                 includeMetaDescription: true,
                 includeFaq: true,
                 includeCta: true,
                 useNeuromarketing: true
               });

               const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-content', {
                 body: {
                   title: item.title,
                   targetKeyword: item.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim(),
                   city: "Nederland",
                   contentType: "blog",
                   language: "nl",
                   wordCount: 1200,
                   includeMetaDescription: true,
                   includeFaq: true,
                   includeCta: true,
                   useNeuromarketing: true
                 }
               });

               console.log('Generate-content response:', { contentData, contentError });

                if (contentError) {
                  console.error('Content generation error:', contentError);
                  setProgressItems(prev => prev.map(p => 
                    p.title === item.title 
                      ? { ...p, status: 'error', step: `Content fout: ${contentError.message || 'Onbekende fout'}`, progress: 100 }
                     : p
                 ));
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
                   content: `# ${item.title}\n\nEr is een fout opgetreden bij het genereren van content. Probeer het opnieuw.`,
                   meta_description: `${item.title} - Er is een fout opgetreden`,
                   faq: '',
                   cta: 'Neem contact op voor hulp',
                   image_url: null
                 };
               } else {
                 setProgressItems(prev => prev.map(p => 
                   p.title === item.title 
                     ? { ...p, progress: 60, step: 'Afbeelding genereren...' }
                     : p
                 ));
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
                setProgressItems(prev => prev.map(p => 
                  p.title === item.title 
                    ? { ...p, progress: 90, step: 'Affinaliseren zonder afbeelding...' }
                    : p
                ));
              } else {
                setProgressItems(prev => prev.map(p => 
                  p.title === item.title 
                    ? { ...p, progress: 90, step: 'Affinaliseren...' }
                    : p
                ));
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

              const result = {
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

              // Mark as completed
              setProgressItems(prev => prev.map(p => 
                p.title === item.title 
                  ? { ...p, status: 'completed', progress: 100, step: 'Voltooid!' }
                  : p
              ));

              return result;
            } catch (error) {
              console.error('Failed to generate AI content for item:', item.title, error);
              
              setProgressItems(prev => prev.map(p => 
                p.title === item.title 
                  ? { ...p, status: 'error', progress: 100, step: 'Fout opgetreden' }
                  : p
              ));

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
        
        // Keep sidebar open for review
        setTimeout(() => {
          setShowProgressSidebar(false);
        }, 5000);
        
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

  const handleDeleteItem = async (id: string) => {
    try {
      // Delete from knowledge_items table
      const { error } = await supabase
        .from('knowledge_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setKnowledgeItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Item verwijderd",
        description: "Het kennisbank item is permanent verwijderd.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen",
        variant: "destructive"
      });
    }
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

  // Preview navigation functions
  const handleApproveItem = () => {
    const currentItem = previewItems[currentPreviewIndex];
    setApprovedItems(prev => new Set([...prev, currentItem.id]));
    toast({
      title: "Artikel Goedgekeurd ✅",
      description: `"${currentItem.title}" goedgekeurd voor publicatie`
    });
    
    // Move to next item
    if (currentPreviewIndex < previewItems.length - 1) {
      setCurrentPreviewIndex(prev => prev + 1);
    }
  };

  const handleRejectItem = () => {
    const currentItem = previewItems[currentPreviewIndex];
    setRejectedItems(prev => new Set([...prev, currentItem.id]));
    toast({
      title: "Artikel Afgekeurd ❌", 
      description: `"${currentItem.title}" afgekeurd`
    });
    
    // Move to next item  
    if (currentPreviewIndex < previewItems.length - 1) {
      setCurrentPreviewIndex(prev => prev + 1);
    }
  };

  const handlePublishApproved = async () => {
    setIsPublishing(true);
    
    try {
      const approvedItemsList = previewItems.filter(item => approvedItems.has(item.id));
      
      for (const item of approvedItemsList) {
        const blogPost = {
          user_id: user?.id,
          title: item.title,
          slug: item.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          status: 'publish',
          publish_date: new Date().toISOString().split('T')[0],
          summary: item.meta_description,
          meta_title: item.title,
          meta_description: item.meta_description,
          hero_image_url: item.hero_image_url,
          body_markdown: item.content,
          tags: item.tags,
          author: item.author,
          word_count: item.word_count
        };

        const { error } = await supabase
          .from('blog_posts')
          .insert(blogPost);

        if (error) {
          console.error('Error publishing post:', error);
          throw error;
        }
      }

      toast({
        title: "Publicatie Succesvol! 🚀",
        description: `${approvedItemsList.length} artikelen gepubliceerd naar je blog`
      });

      // Reset preview state
      setShowPreview(false);
      setPreviewItems([]);
      setApprovedItems(new Set());
      setRejectedItems(new Set());
      setCurrentPreviewIndex(0);
      
      // Refresh knowledge items
      loadKnowledgeItems();

    } catch (error) {
      console.error('Publishing error:', error);
      toast({
        title: "Publicatie Gefaald",
        description: "Er is een fout opgetreden bij het publiceren",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const isAllItemsReviewed = previewItems.length > 0 && 
    (approvedItems.size + rejectedItems.size) === previewItems.length;

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
          <Button 
            onClick={() => setShowProgressSidebar(!showProgressSidebar)}
            variant="outline"
            className={showProgressSidebar ? "bg-primary/10" : ""}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            AI Progress
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

      {/* Review Modal - Artikel voor artikel beoordeling */}
      {showPreview && previewItems.length > 0 && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Review Artikel {currentPreviewIndex + 1} van {previewItems.length}
                </CardTitle>
                <CardDescription>
                  Controleer elk artikel voordat je het publiceert
                </CardDescription>
              </div>
              <div className="flex gap-2 text-sm">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✅ {approvedItems.size} Goedgekeurd
                </Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  ❌ {rejectedItems.size} Afgekeurd
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {previewItems[currentPreviewIndex] && (
              <div className="space-y-4">
                {/* Article Header */}
                <div className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{previewItems[currentPreviewIndex].category}</Badge>
                    <Badge variant="secondary">{previewItems[currentPreviewIndex].type}</Badge>
                    <Badge variant="outline">
                      {previewItems[currentPreviewIndex].word_count || 0} woorden
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{previewItems[currentPreviewIndex].title}</h2>
                  {previewItems[currentPreviewIndex].meta_description && (
                    <p className="text-muted-foreground">{previewItems[currentPreviewIndex].meta_description}</p>
                  )}
                  {previewItems[currentPreviewIndex].hero_image_url && (
                    <img 
                      src={previewItems[currentPreviewIndex].hero_image_url} 
                      alt={previewItems[currentPreviewIndex].title}
                      className="w-full h-48 object-cover rounded-lg mt-3"
                    />
                  )}
                </div>

                {/* Article Content Preview */}
                <div className="max-h-96 overflow-y-auto prose prose-sm max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: previewItems[currentPreviewIndex].content
                        .replace(/^# /gm, '<h1>')
                        .replace(/^## /gm, '<h2>')
                        .replace(/^### /gm, '<h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                </div>

                {/* Tags */}
                {previewItems[currentPreviewIndex].tags && previewItems[currentPreviewIndex].tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap pt-4 border-t">
                    <span className="text-sm font-medium mr-2">Tags:</span>
                    {previewItems[currentPreviewIndex].tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation & Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))}
                  disabled={currentPreviewIndex === 0}
                >
                  ← Vorige
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPreviewIndex(Math.min(previewItems.length - 1, currentPreviewIndex + 1))}
                  disabled={currentPreviewIndex === previewItems.length - 1}
                >
                  Volgende →
                </Button>
              </div>

              <div className="flex gap-2">
                {!approvedItems.has(previewItems[currentPreviewIndex]?.id) && 
                 !rejectedItems.has(previewItems[currentPreviewIndex]?.id) && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={handleRejectItem}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Afkeuren
                    </Button>
                    <Button
                      onClick={handleApproveItem}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Goedkeuren
                    </Button>
                  </>
                )}
                
                {approvedItems.has(previewItems[currentPreviewIndex]?.id) && (
                  <Badge variant="default" className="bg-green-100 text-green-800 px-4 py-2">
                    ✅ Goedgekeurd
                  </Badge>
                )}
                
                {rejectedItems.has(previewItems[currentPreviewIndex]?.id) && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2">
                    ❌ Afgekeurd
                  </Badge>
                )}
              </div>
            </div>

            {/* Final Actions */}
            {isAllItemsReviewed && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Review Voltooid!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Je hebt alle artikelen beoordeeld. {approvedItems.size} artikelen zijn goedgekeurd voor publicatie.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePublishApproved}
                    disabled={isPublishing || approvedItems.size === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isPublishing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Publiceren...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Publiceer {approvedItems.size} Artikelen
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPreview(false);
                      setPreviewItems([]);
                      setApprovedItems(new Set());
                      setRejectedItems(new Set());
                      setCurrentPreviewIndex(0);
                    }}
                  >
                    Sluiten
                  </Button>
                </div>
              </div>
            )}
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

      {/* AI Progress Sidebar */}
      <AIProgressSidebar 
        isVisible={showProgressSidebar}
        items={progressItems}
        onClose={() => setShowProgressSidebar(false)}
      />
    </div>
  );
};

export default KnowledgeBase;