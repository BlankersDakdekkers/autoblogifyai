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
import { Upload, Search, Image, Video, FileText, Tag, Eye, Edit, Trash2, Plus, Download, Loader2, AlertCircle, Sparkles, Brain, Globe, Star, Filter, Grid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  useSEO({
    title: "Media Portal - AutoblogifyAI Asset Management",
    description: "Beheer al je media bestanden, afbeeldingen en video's voor content creatie. Upload, organiseer en optimaliseer je media assets.",
    keywords: "media, bestanden, afbeeldingen, video, upload, asset management, content"
  });

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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary/20 to-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-2xl animate-pulse pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 p-6 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-6 py-12">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/20 backdrop-blur-sm">
                <Image className="h-16 w-16 text-primary animate-bounce" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/20 text-primary bg-primary/5 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Media Management
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
              Media Portal
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Beheer, organiseer en optimaliseer al je media assets met geavanceerde AI-gestuurde 
              categorisatie en SEO-metadata voor maximale impact.
            </p>
            
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 px-8 py-4 text-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Upload Media
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-gradient-to-br from-background to-secondary/10 backdrop-blur-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-2xl">
                    <Brain className="h-6 w-6 mr-3 text-primary" />
                    Nieuwe Media Uploaden
                  </DialogTitle>
                  <DialogDescription>
                    Voeg nieuwe media toe met volledige SEO metadata voor optimale vindbaarheid en AI-gestuurde categorisatie
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <p className="text-lg font-medium mb-2">Sleep bestanden hier of klik om te uploaden</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ondersteunt JPG, PNG, MP4, PDF (Max 10MB)
                      </p>
                      <Input 
                        type="file" 
                        className="bg-background/50 backdrop-blur-sm" 
                        accept="image/*,video/*,.pdf" 
                        onChange={handleFileSelect}
                      />
                      {selectedFile && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ Geselecteerd: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
              
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
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200/50 hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Totaal Media</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Image className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{mediaItems.length}</div>
              <p className="text-xs text-blue-600 mt-1">
                bestanden in bibliotheek
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200/50 hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Afbeeldingen</CardTitle>
              <div className="p-2 bg-green-500/20 rounded-full">
                <Image className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {mediaItems.filter(item => getFileType(item.file_type) === 'image').length}
              </div>
              <p className="text-xs text-green-600 mt-1">
                afbeelding bestanden
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200/50 hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Video's</CardTitle>
              <div className="p-2 bg-purple-500/20 rounded-full">
                <Video className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {mediaItems.filter(item => getFileType(item.file_type) === 'video').length}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                video bestanden
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200/50 hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Categorieën</CardTitle>
              <div className="p-2 bg-orange-500/20 rounded-full">
                <Tag className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{categories.length}</div>
              <p className="text-xs text-orange-600 mt-1">
                actieve categorieën
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Media Library Card */}
        <Card className="bg-gradient-to-r from-background/80 to-secondary/10 backdrop-blur-lg border-primary/20 shadow-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Media Bibliotheek</CardTitle>
                  <CardDescription className="text-base">Zoek, filter en beheer je media collectie</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek op naam, beschrijving of tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50 backdrop-blur-sm border-primary/20"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-52 bg-background/50 backdrop-blur-sm border-primary/20">
                  <Filter className="h-4 w-4 mr-2" />
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
                <SelectTrigger className="w-44 bg-background/50 backdrop-blur-sm border-primary/20">
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
    </div>
  );
};

export default MediaPortal;