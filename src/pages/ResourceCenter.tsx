import { useState } from "react";
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
  Target
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'tutorial' | 'template' | 'guide' | 'video' | 'tool';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  rating: number;
  downloadUrl?: string;
  externalUrl?: string;
  featured: boolean;
}

const ResourceCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useSEO({
    title: "Resource Center - AutoblogifyAI",
    description: "Ontdek tutorials, templates en tools om het maximale uit AutoblogifyAI te halen",
    keywords: "resources, tutorials, templates, handleidingen, tools, ondersteuning"
  });

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Aan de slag met AutoblogifyAI',
      description: 'Complete gids om je eerste blogposts te genereren vanuit een Google Sheet',
      type: 'tutorial',
      category: 'Beginners',
      difficulty: 'beginner',
      duration: '15 min',
      rating: 4.8,
      externalUrl: '#',
      featured: true
    },
    {
      id: '2',
      title: 'WordPress Integratie Setup',
      description: 'Stap-voor-stap handleiding voor het koppelen van je WordPress site',
      type: 'guide',
      category: 'Integratie',
      difficulty: 'intermediate',
      duration: '20 min',
      rating: 4.7,
      externalUrl: '#',
      featured: true
    },
    {
      id: '3',
      title: 'SEO-geoptimaliseerde Content Templates',
      description: 'Kant-en-klare templates voor verschillende contenttypen',
      type: 'template',
      category: 'Templates',
      difficulty: 'beginner',
      rating: 4.9,
      downloadUrl: '#',
      featured: false
    },
    {
      id: '4',
      title: 'Geavanceerde CSV Structuren',
      description: 'Leer hoe je complexe content structuren opzet in je Google Sheets',
      type: 'video',
      category: 'Geavanceerd',
      difficulty: 'advanced',
      duration: '35 min',
      rating: 4.6,
      externalUrl: '#',
      featured: true
    },
    {
      id: '5',
      title: 'Content Automation Workflows',
      description: 'Automatiseer je content pipeline met webhooks en scheduling',
      type: 'guide',
      category: 'Automation',
      difficulty: 'advanced',
      duration: '25 min',
      rating: 4.5,
      externalUrl: '#',
      featured: false
    },
    {
      id: '6',
      title: 'FAQ Schema Generator',
      description: 'Tool voor het genereren van structured data voor je FAQ secties',
      type: 'tool',
      category: 'SEO Tools',
      difficulty: 'intermediate',
      rating: 4.4,
      externalUrl: '#',
      featured: false
    }
  ];

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
            {resource.externalUrl && (
              <Button size="sm" className="flex-1">
                <ExternalLink className="w-4 h-4 mr-1" />
                Bekijken
              </Button>
            )}
            {resource.downloadUrl && (
              <Button variant="outline" size="sm" className="flex-1">
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
        </TabsContent>

        <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutorials">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.filter(r => r.type === 'tutorial' || r.type === 'guide').map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.filter(r => r.type === 'template').map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.filter(r => r.type === 'tool').map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceCenter;