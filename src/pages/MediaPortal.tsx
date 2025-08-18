import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Image, Video, FileText, Tag, Filter, Eye, Edit, Trash2, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  category: string;
  tags: string[];
  description: string;
  uploadDate: string;
  size: number;
  dimensions?: { width: number; height: number };
}

const MediaPortal = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      name: 'seo-hero-image.jpg',
      type: 'image',
      url: '/placeholder.svg',
      category: 'SEO',
      tags: ['hero', 'seo', 'marketing'],
      description: 'Hero afbeelding voor SEO gerelateerde blog posts',
      uploadDate: '2024-01-10',
      size: 245760,
      dimensions: { width: 1200, height: 630 }
    },
    {
      id: '2',
      name: 'lokaal-bedrijf-foto.jpg',
      type: 'image',
      url: '/placeholder.svg',
      category: 'Lokaal Business',
      tags: ['lokaal', 'bedrijf', 'winkel'],
      description: 'Stockfoto voor lokale business artikelen',
      uploadDate: '2024-01-12',
      size: 189440,
      dimensions: { width: 800, height: 600 }
    },
    {
      id: '3',
      name: 'content-marketing-video.mp4',
      type: 'video',
      url: '/placeholder.svg',
      category: 'Content Marketing',
      tags: ['video', 'content', 'marketing', 'uitleg'],
      description: 'Explainer video over content marketing strategieën',
      uploadDate: '2024-01-15',
      size: 15728640
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newMedia, setNewMedia] = useState({
    name: '',
    title: '',
    altText: '',
    metaDescription: '',
    category: '',
    tags: '',
    description: ''
  });

  const { toast } = useToast();

  const categories = ['SEO', 'Lokaal Business', 'Content Marketing', 'Website Development', 'E-commerce'];
  
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleUpload = () => {
    // Validatie van verplichte velden
    if (!newMedia.name || !newMedia.title || !newMedia.altText || !newMedia.metaDescription || !newMedia.category) {
      toast({
        title: "Velden ontbreken",
        description: "Vul alle verplichte velden in voordat je uploadt.",
        variant: "destructive",
      });
      return;
    }

    const newItem: MediaItem = {
      id: (mediaItems.length + 1).toString(),
      name: newMedia.name,
      type: 'image',
      url: '/placeholder.svg',
      category: newMedia.category,
      tags: newMedia.tags.split(',').map(tag => tag.trim()),
      description: newMedia.description,
      uploadDate: new Date().toISOString().split('T')[0],
      size: Math.random() * 1000000,
      dimensions: { width: 1200, height: 630 }
    };

    setMediaItems([...mediaItems, newItem]);
    setNewMedia({ name: '', title: '', altText: '', metaDescription: '', category: '', tags: '', description: '' });
    setIsUploadOpen(false);
    
    toast({
      title: "Media geüpload",
      description: "Het bestand is succesvol toegevoegd met alle SEO metadata.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Media Portaal</h2>
          <p className="text-muted-foreground">
            Beheer en categoriseer media voor je blog content
          </p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Media Uploaden
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nieuwe Media Uploaden</DialogTitle>
              <DialogDescription>
                Voeg nieuwe media toe met volledige SEO metadata voor optimale vindbaarheid
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Sleep bestanden hier of klik om te uploaden
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ondersteunt JPG, PNG, MP4, PDF (Max 10MB)
                </p>
                <Input type="file" className="mt-4" accept="image/*,video/*,.pdf" />
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="media-name">Bestandsnaam *</Label>
                  <Input
                    id="media-name"
                    value={newMedia.name}
                    onChange={(e) => setNewMedia({...newMedia, name: e.target.value})}
                    placeholder="Bijv. seo-hero-afbeelding.jpg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="media-title">Titel * (voor HTML title attribute)</Label>
                  <Input
                    id="media-title"
                    value={newMedia.title}
                    onChange={(e) => setNewMedia({...newMedia, title: e.target.value})}
                    placeholder="Beschrijvende titel die bij hover wordt getoond"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="media-alt">Alt Tekst * (voor toegankelijkheid)</Label>
                  <Input
                    id="media-alt"
                    value={newMedia.altText}
                    onChange={(e) => setNewMedia({...newMedia, altText: e.target.value})}
                    placeholder="Beschrijf wat er in de afbeelding te zien is"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="media-meta">Meta Omschrijving * (voor SEO)</Label>
                  <Textarea
                    id="media-meta"
                    value={newMedia.metaDescription}
                    onChange={(e) => setNewMedia({...newMedia, metaDescription: e.target.value})}
                    placeholder="SEO-vriendelijke omschrijving van de afbeelding (max 160 tekens)"
                    maxLength={160}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {newMedia.metaDescription.length}/160 tekens
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="media-category">Categorie *</Label>
                  <Select value={newMedia.category} onValueChange={(value) => setNewMedia({...newMedia, category: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="media-tags">Tags (komma gescheiden)</Label>
                  <Input
                    id="media-tags"
                    value={newMedia.tags}
                    onChange={(e) => setNewMedia({...newMedia, tags: e.target.value})}
                    placeholder="Bijv. hero, seo, marketing"
                  />
                </div>
                
                <div>
                  <Label htmlFor="media-description">Interne Beschrijving</Label>
                  <Textarea
                    id="media-description"
                    value={newMedia.description}
                    onChange={(e) => setNewMedia({...newMedia, description: e.target.value})}
                    placeholder="Interne notities over dit mediabestand"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload} 
                  className="flex-1"
                  disabled={!newMedia.name || !newMedia.title || !newMedia.altText || !newMedia.metaDescription || !newMedia.category}
                >
                  Upload Media
                </Button>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Annuleren</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistieken */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Media</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaItems.length}</div>
            <p className="text-xs text-muted-foreground">
              bestanden in bibliotheek
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afbeeldingen</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mediaItems.filter(item => item.type === 'image').length}
            </div>
            <p className="text-xs text-muted-foreground">
              afbeelding bestanden
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video's</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mediaItems.filter(item => item.type === 'video').length}
            </div>
            <p className="text-xs text-muted-foreground">
              video bestanden
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorieën</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              actieve categorieën
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Zoek en Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Media Bibliotheek</CardTitle>
          <CardDescription>Zoek en filter je media bestanden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek op naam, beschrijving of tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle categorieën" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Alle types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle types</SelectItem>
                <SelectItem value="image">Afbeeldingen</SelectItem>
                <SelectItem value="video">Video's</SelectItem>
                <SelectItem value="document">Documenten</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMedia.map((item) => (
              <Card key={item.id} className="group hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      {getTypeIcon(item.type)}
                      <span className="ml-2 text-sm">{item.type.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      {getTypeIcon(item.type)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      {item.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(item.size)}</span>
                      <span>{item.uploadDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMedia.length === 0 && (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Geen media gevonden</h3>
              <p className="text-muted-foreground">
                Probeer je zoektermen aan te passen of upload nieuwe media
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Integratie */}
      <Card>
        <CardHeader>
          <CardTitle>Media Integratie met Blog Posts</CardTitle>
          <CardDescription>
            Configureer hoe media automatisch gekoppeld wordt aan blog content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auto-matching" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="auto-matching">Auto Matching</TabsTrigger>
              <TabsTrigger value="manual-selection">Handmatige Selectie</TabsTrigger>
              <TabsTrigger value="ai-suggestions">AI Suggesties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto-matching" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Automatische koppeling op basis van:</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Categorie matching</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Tag overlap</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Titel gelijkenis</span>
                    </label>
                  </div>
                </div>
                <Button>Instellingen Opslaan</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="manual-selection" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bij het genereren van blog posts krijg je de optie om handmatig media te selecteren uit je bibliotheek.
              </p>
              <Button>Handmatige Selectie Activeren</Button>
            </TabsContent>
            
            <TabsContent value="ai-suggestions" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gebruik AI om automatisch de meest relevante media voor je blog posts voor te stellen.
              </p>
              <Button>AI Suggesties Inschakelen</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaPortal;