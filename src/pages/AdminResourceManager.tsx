import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, ExternalLink, Download, Star, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

interface Resource {
  id?: string;
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
  created_at?: string;
  updated_at?: string;
}

const AdminResourceManager = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<Resource>({
    title: '',
    description: '',
    type: 'tutorial',
    category: '',
    difficulty: 'beginner',
    duration: '',
    rating: 0,
    download_url: '',
    external_url: '',
    featured: false
  });

  useSEO({
    title: "Resource Manager - Admin",
    description: "Beheer resources, tutorials en tools",
    keywords: "admin, resources, management, tutorials"
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      // Use the improved edge function helper
      const { data, error } = await supabase.functions.invoke('resource-manager');
      
      if (error) {
        console.error('Error fetching resources:', error);
        toast.error('Kon resources niet laden');
        return;
      }

      setResources(data.resources || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Er ging iets mis bij het laden van resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingResource && editingResource.id) {
        // PUT request - update existing resource
        const { data, error } = await supabase.functions.invoke('resource-manager', {
          method: 'PUT',
          body: {
            id: editingResource.id,
            ...formData,
            rating: Number(formData.rating)
          }
        });

        if (error) {
          console.error('Error updating resource:', error);
          toast.error('Kon resource niet bijwerken');
          return;
        }
      } else {
        // POST request - create new resource
        const { data, error } = await supabase.functions.invoke('resource-manager', {
          method: 'POST',
          body: {
            ...formData,
            rating: Number(formData.rating)
          }
        });

        if (error) {
          console.error('Error creating resource:', error);
          toast.error('Kon resource niet aanmaken');
          return;
        }
      }

      toast.success(editingResource ? 'Resource bijgewerkt!' : 'Resource aangemaakt!');
      
      // Reset form and close dialogs
      setFormData({
        title: '',
        description: '',
        type: 'tutorial',
        category: '',
        difficulty: 'beginner',
        duration: '',
        rating: 0,
        download_url: '',
        external_url: '',
        featured: false
      });
      
      setIsCreateDialogOpen(false);
      setEditingResource(null);
      
      // Refresh resources
      fetchResources();
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Er ging iets mis bij het opslaan');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('resource-manager', {
        method: 'DELETE',
        body: { id }
      });

      if (error) {
        console.error('Error deleting resource:', error);
        toast.error('Kon resource niet verwijderen');
        return;
      }

      toast.success('Resource verwijderd!');
      fetchResources();
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Er ging iets mis bij het verwijderen');
    }
  };

  const handleEdit = (resource: Resource) => {
    setFormData(resource);
    setEditingResource(resource);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ResourceForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titel *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categorie *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beschrijving *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tutorial">Tutorial</SelectItem>
              <SelectItem value="guide">Guide</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="template">Template</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Moeilijkheid</Label>
          <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duur (optioneel)</Label>
          <Input
            id="duration"
            placeholder="bijv. 15 min"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="external_url">Externe URL</Label>
          <Input
            id="external_url"
            placeholder="https://..."
            value={formData.external_url}
            onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="download_url">Download URL</Label>
          <Input
            id="download_url"
            placeholder="https://..."
            value={formData.download_url}
            onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
          />
          <Label htmlFor="featured">Uitgelicht</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsCreateDialogOpen(false);
            setEditingResource(null);
            setFormData({
              title: '',
              description: '',
              type: 'tutorial',
              category: '',
              difficulty: 'beginner',
              duration: '',
              rating: 0,
              download_url: '',
              external_url: '',
              featured: false
            });
          }}
        >
          Annuleren
        </Button>
        <Button type="submit">
          {editingResource ? 'Bijwerken' : 'Aanmaken'}
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Resources laden...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Manager</h1>
          <p className="text-muted-foreground">Beheer tutorials, templates en tools</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nieuwe Resource Aanmaken</DialogTitle>
              <DialogDescription>
                Voeg een nieuwe tutorial, template of tool toe aan het Resource Center
              </DialogDescription>
            </DialogHeader>
            <ResourceForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Alle Resources ({resources.length})</TabsTrigger>
          <TabsTrigger value="featured">Uitgelicht ({resources.filter(r => r.featured).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        {resource.featured && (
                          <Badge variant="secondary">
                            <Star className="w-3 h-3 mr-1" />
                            Uitgelicht
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        <Badge className={getDifficultyColor(resource.difficulty)}>
                          {resource.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>{resource.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog open={editingResource?.id === resource.id} onOpenChange={(open) => !open && setEditingResource(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(resource)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Resource Bewerken</DialogTitle>
                            <DialogDescription>
                              Pas de resource informatie aan
                            </DialogDescription>
                          </DialogHeader>
                          <ResourceForm />
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Resource verwijderen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Deze actie kan niet ongedaan worden gemaakt. De resource wordt permanent verwijderd.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => resource.id && handleDelete(resource.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Verwijderen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Categorie: {resource.category}</span>
                      {resource.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {resource.duration}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        <span>{resource.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {resource.external_url && resource.external_url !== '#' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(resource.external_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Bekijken
                        </Button>
                      )}
                      {resource.download_url && resource.download_url !== '#' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(resource.download_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid gap-4">
            {resources.filter(r => r.featured).map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          Uitgelicht
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        <Badge className={getDifficultyColor(resource.difficulty)}>
                          {resource.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>{resource.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog open={editingResource?.id === resource.id} onOpenChange={(open) => !open && setEditingResource(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(resource)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Resource Bewerken</DialogTitle>
                            <DialogDescription>
                              Pas de resource informatie aan
                            </DialogDescription>
                          </DialogHeader>
                          <ResourceForm />
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Resource verwijderen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Deze actie kan niet ongedaan worden gemaakt. De resource wordt permanent verwijderd.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => resource.id && handleDelete(resource.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Verwijderen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Categorie: {resource.category}</span>
                      {resource.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {resource.duration}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        <span>{resource.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {resource.external_url && resource.external_url !== '#' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(resource.external_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Bekijken
                        </Button>
                      )}
                      {resource.download_url && resource.download_url !== '#' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(resource.download_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminResourceManager;