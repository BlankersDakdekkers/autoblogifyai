import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Video, 
  Download, 
  ExternalLink, 
  Search,
  Clock,
  Star,
  PlayCircle,
  FileText,
  Lightbulb,
  Target,
  Loader2,
  Sparkles,
  Brain,
  Rocket,
  Award,
  Users,
  TrendingUp
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'tutorial' | 'template' | 'guide' | 'video' | 'tool';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  rating: number;
  download_url?: string;
  external_url?: string;
  featured: boolean;
}

const ResourceCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Resource Center - AutoblogifyAI",
    description: "Ontdek tutorials, templates en tools om het maximale uit AutoblogifyAI te halen",
    keywords: "resources, tutorials, templates, handleidingen, tools, ondersteuning"
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resources:', error);
        toast.error('Kon resources niet laden');
        return;
      }

      // Map database data to our interface format
      const mappedResources: Resource[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type as 'tutorial' | 'template' | 'guide' | 'video' | 'tool',
        category: item.category,
        difficulty: item.difficulty as 'beginner' | 'intermediate' | 'advanced',
        duration: item.duration || undefined,
        rating: Number(item.rating),
        download_url: item.download_url || undefined,
        external_url: item.external_url || undefined,
        featured: item.featured
      }));

      setResources(mappedResources);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Er ging iets mis bij het laden van resources');
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(resources.map(r => r.category)))];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResources = resources.filter(r => r.featured);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tutorial': return BookOpen;
      case 'video': return PlayCircle;
      case 'template': return FileText;
      case 'guide': return Lightbulb;
      case 'tool': return Target;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleViewResource = (resource: Resource) => {
    if (!resource.external_url) {
      toast.error('Geen externe URL beschikbaar');
      return;
    }

    // Check for placeholder/dummy URLs
    const placeholderPatterns = [
      /docs\.google\.com\/document\/d\/1234567890/,
      /youtube\.com\/watch\?v=.*_tutorial$/,
      /example\.com/,
      /placeholder/i,
      /dummy/i
    ];

    const isPlaceholder = placeholderPatterns.some(pattern => pattern.test(resource.external_url!));
    
    if (isPlaceholder) {
      toast.error('Deze resource is momenteel niet beschikbaar. We werken eraan om deze toe te voegen.');
      return;
    }

    if (!isValidUrl(resource.external_url)) {
      toast.error('Ongeldige URL format');
      return;
    }

    try {
      window.open(resource.external_url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening URL:', error);
      toast.error('Kan de resource niet openen');
    }
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const Icon = getTypeIcon(resource.type);
    
    return (
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                {resource.type}
              </Badge>
            </div>
            <Badge className={getDifficultyColor(resource.difficulty)}>
              {resource.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
          <CardDescription className="text-sm">
            {resource.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {resource.duration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {resource.duration}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="font-medium">{resource.rating}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {resource.category}
            </Badge>
          </div>

          <div className="flex gap-2">
            {resource.external_url && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => handleViewResource(resource)}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Bekijken
              </Button>
            )}
            {resource.download_url && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = resource.download_url!;
                  link.download = '';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Resource Center</h1>
        </div>
        <p className="text-muted-foreground">
          Tutorials, templates en tools om het maximale uit AutoblogifyAI te halen
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Zoek in resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === "all" ? "Alle categorieën" : category}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Alle Resources</TabsTrigger>
          <TabsTrigger value="featured">Uitgelicht</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Resources laden...</span>
            </div>
          ) : (
            <>
              {/* Featured Section */}
              {featuredResources.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Uitgelichte Resources</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredResources.map(resource => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Resources */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Alle Resources</h2>
                {filteredResources.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Geen resources gevonden</h3>
                      <p className="text-muted-foreground">
                        Probeer je zoekopdracht aan te passen
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map(resource => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="featured">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tutorials">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.filter(r => r.type === 'tutorial' || r.type === 'guide').map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.filter(r => r.type === 'template').map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.filter(r => r.type === 'tool').map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceCenter;