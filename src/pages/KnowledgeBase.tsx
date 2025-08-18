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
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    category: "",
    type: "article" as KnowledgeItem['type'],
    tags: ""
  });

  const { toast } = useToast();

  // Sample data - in real app this would come from database
  const [categories] = useState<Category[]>([
    { id: "setup", name: "Setup & Installatie", description: "Aan de slag met AutoblogifyAI", color: "bg-blue-100 text-blue-800", icon: "⚙️" },
    { id: "csv", name: "CSV & Data", description: "Data management en CSV verwerking", color: "bg-green-100 text-green-800", icon: "📊" },
    { id: "templates", name: "Templates", description: "Template beheer en customization", color: "bg-purple-100 text-purple-800", icon: "🎨" },
    { id: "api", name: "API & Integraties", description: "Technische documentatie", color: "bg-orange-100 text-orange-800", icon: "🔗" },
    { id: "troubleshooting", name: "Probleemoplossing", description: "Veelvoorkomende problemen", color: "bg-red-100 text-red-800", icon: "🔧" },
    { id: "advanced", name: "Geavanceerd", description: "Power user features", color: "bg-indigo-100 text-indigo-800", icon: "🚀" }
  ]);

  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([
    {
      id: "1",
      title: "Aan de slag met AutoblogifyAI",
      content: "Een complete gids om te starten met AutoblogifyAI. Leer hoe je je eerste CSV configureert en blogposts genereert.",
      category: "setup",
      type: "guide",
      author: "AutoblogifyAI Team",
      created_at: "2024-01-15",
      updated_at: "2024-01-20",
      tags: ["beginners", "setup", "csv"],
      views: 1250,
      rating: 4.8,
      status: "published"
    },
    {
      id: "2", 
      title: "CSV Schema Referentie",
      content: "Volledige documentatie van alle ondersteunde CSV kolommen en hun functies.",
      category: "csv",
      type: "article",
      author: "Tech Team",
      created_at: "2024-01-10",
      updated_at: "2024-01-18",
      tags: ["csv", "schema", "reference"],
      views: 890,
      rating: 4.9,
      status: "published"
    },
    {
      id: "3",
      title: "Custom Templates Maken",
      content: "Leer hoe je je eigen Nunjucks templates maakt en configureert voor AutoblogifyAI.",
      category: "templates",
      type: "video",
      author: "Design Team",
      created_at: "2024-01-12",
      updated_at: "2024-01-22",
      tags: ["templates", "nunjucks", "customization"],
      views: 675,
      rating: 4.7,
      status: "published"
    },
    {
      id: "4",
      title: "API Endpoint Documentatie",
      content: "Volledige API documentatie met voorbeelden voor alle beschikbare endpoints.",
      category: "api",
      type: "code",
      author: "API Team",
      created_at: "2024-01-08",
      updated_at: "2024-01-25",
      tags: ["api", "documentation", "endpoints"],
      views: 445,
      rating: 4.6,
      status: "published"
    },
    {
      id: "5",
      title: "Veelvoorkomende CSV Fouten",
      content: "Lijst van de meest voorkomende CSV validatie fouten en hoe deze op te lossen.",
      category: "troubleshooting",
      type: "faq",
      author: "Support Team",
      created_at: "2024-01-14",
      updated_at: "2024-01-21",
      tags: ["troubleshooting", "csv", "errors"],
      views: 1120,
      rating: 4.5,
      status: "published"
    }
  ]);

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesType = selectedType === "all" || item.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType && item.status === "published";
  });

  const handleAddItem = () => {
    if (!newItem.title || !newItem.content || !newItem.category) {
      toast({
        title: "Velden ontbreken",
        description: "Vul alle verplichte velden in.",
        variant: "destructive"
      });
      return;
    }

    const item: KnowledgeItem = {
      id: Date.now().toString(),
      title: newItem.title,
      content: newItem.content,
      category: newItem.category,
      type: newItem.type,
      author: "Huidige gebruiker",
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      views: 0,
      rating: 0,
      status: "published"
    };

    setKnowledgeItems([...knowledgeItems, item]);
    setNewItem({ title: "", content: "", category: "", type: "article", tags: "" });
    setIsEditMode(false);

    toast({
      title: "Item toegevoegd",
      description: "Het kennisbank item is succesvol toegevoegd.",
    });
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kennisbank</h2>
          <p className="text-muted-foreground">
            Doorzoek onze uitgebreide kennisbank en voeg nieuwe content toe
          </p>
        </div>
        <Button onClick={() => setIsEditMode(!isEditMode)}>
          <Plus className="h-4 w-4 mr-2" />
          {isEditMode ? "Annuleren" : "Nieuw Item"}
        </Button>
      </div>

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