import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Image, Video, FileText, Tag, Eye, Edit, Trash2, Plus, Download, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MediaItem {
  id: string;
  name: string;
  file_type: string;
  file_url: string;
  category: string;
  tags: string[];
  description: string | null;
  created_at: string;
  file_size: number;
  dimensions?: { width: number; height: number } | null;
  title: string;
  alt_text: string;
  meta_description: string;
  file_path: string;
}

const MediaPortal = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  const [user, setUser] = useState<any>(null);

  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const categories = ['SEO', 'Lokaal Business', 'Content Marketing', 'Website Development', 'E-commerce'];
  
  // Load media items from database
  const loadMediaItems = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading media:', error);
        toast({
          title: "Fout bij laden",
          description: "Media bestanden konden niet geladen worden",
          variant: "destructive",
        });
        return;
      }

      // Transform data to match interface
      const transformedData = data.map(item => ({
        ...item,
        dimensions: item.dimensions ? item.dimensions as { width: number; height: number } : null
      }));
      
      setMediaItems(transformedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het laden van media",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadMediaItems();
  }, [loadMediaItems]);

  const filteredMedia = mediaItems.filter(item => {
    const description = item.description || '';
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || getFileType(item.file_type) === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getFileType = (mimeType: string): 'image' | 'video' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "Maximum bestandsgrootte is 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    // Auto-fill name from filename
    if (!newMedia.name) {
      setNewMedia(prev => ({ ...prev, name: file.name }));
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile) {
      toast({
        title: "Geen bestand geselecteerd",
        description: "Selecteer eerst een bestand om te uploaden",
        variant: "destructive",
      });
      return;
    }

    // Validatie van verplichte velden
    if (!newMedia.name || !newMedia.title || !newMedia.altText || !newMedia.metaDescription || !newMedia.category) {
      toast({
        title: "Velden ontbreken",
        description: "Vul alle verplichte velden in voordat je uploadt.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload mislukt",
          description: "Het bestand kon niet geüpload worden",
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Get image dimensions if it's an image
      let dimensions = null;
      if (selectedFile.type.startsWith('image/')) {
        try {
          dimensions = await new Promise<{width: number, height: number}>((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = URL.createObjectURL(selectedFile);
          });
        } catch (error) {
          console.warn('Could not get image dimensions:', error);
        }
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('media_items')
        .insert({
          user_id: user.id,
          name: newMedia.name,
          title: newMedia.title,
          alt_text: newMedia.altText,
          meta_description: newMedia.metaDescription,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_type: selectedFile.type,
          category: newMedia.category,
          tags: newMedia.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          description: newMedia.description || null,
          file_size: selectedFile.size,
          dimensions: dimensions
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('media').remove([filePath]);
        toast({
          title: "Database fout",
          description: "Metadata kon niet opgeslagen worden",
          variant: "destructive",
        });
        return;
      }

      // Reset form and reload data
      setNewMedia({ name: '', title: '', altText: '', metaDescription: '', category: '', tags: '', description: '' });
      setSelectedFile(null);
      setIsUploadOpen(false);
      await loadMediaItems();
      
      toast({
        title: "Upload geslaagd",
        description: "Het bestand is succesvol geüpload met alle metadata",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis tijdens het uploaden",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!user) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('media_items')
        .delete()
        .eq('id', item.id)
        .eq('user_id', user.id);

      if (dbError) {
        console.error('Database error:', dbError);
        toast({
          title: "Fout",
          description: "Bestand kon niet verwijderd worden",
          variant: "destructive",
        });
        return;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([item.file_path]);

      if (storageError) {
        console.error('Storage error:', storageError);
        // Don't show error since database delete succeeded
      }

      await loadMediaItems();
      toast({
        title: "Verwijderd",
        description: "Het bestand is succesvol verwijderd",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het verwijderen",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement('a');
    link.href = item.file_url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (fileType: string) => {
    const type = getFileType(fileType);
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Niet ingelogd</h3>
          <p className="text-muted-foreground">Log in om je media te beheren</p>
        </div>
      </div>
    );
  }

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
                <Input 
                  type="file" 
                  className="mt-4" 
                  accept="image/*,video/*,.pdf" 
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-primary mt-2">
                    Geselecteerd: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
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
                  disabled={isUploading || !selectedFile || !newMedia.name || !newMedia.title || !newMedia.altText || !newMedia.metaDescription || !newMedia.category}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploaden...
                    </>
                  ) : (
                    'Upload Media'
                  )}
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
              {mediaItems.filter(item => getFileType(item.file_type) === 'image').length}
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
              {mediaItems.filter(item => getFileType(item.file_type) === 'video').length}
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

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Media laden...</p>
            </div>
          )}

          {/* Media Grid */}
          {!isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMedia.map((item) => (
                <Card key={item.id} className="group hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    {getFileType(item.file_type) === 'image' ? (
                      <img 
                        src={item.file_url} 
                        alt={item.alt_text}
                        title={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center">
                        {getTypeIcon(item.file_type)}
                        <span className="ml-2 text-sm">{getFileType(item.file_type).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => window.open(item.file_url, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleDownload(item)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        {getTypeIcon(item.file_type)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description || item.meta_description}
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
                        <span>{formatFileSize(item.file_size)}</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredMedia.length === 0 && (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Geen media gevonden</h3>
              <p className="text-muted-foreground">
                {mediaItems.length === 0 
                  ? "Upload je eerste media bestand om te beginnen" 
                  : "Probeer je zoektermen aan te passen"
                }
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