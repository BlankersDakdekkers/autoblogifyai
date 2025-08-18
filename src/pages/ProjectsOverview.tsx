import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderOpen, 
  FileText, 
  Globe, 
  Calendar, 
  TrendingUp, 
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  BarChart3
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface Project {
  id: string;
  name: string;
  type: 'website' | 'blog' | 'campaign';
  status: 'active' | 'draft' | 'archived';
  posts_count: number;
  last_updated: string;
  created_at: string;
  url?: string;
  description?: string;
}

const ProjectsOverview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");

  useSEO({
    title: "Projecten Overzicht - AutoblogifyAI",
    description: "Beheer al je AutoblogifyAI projecten, websites en contentcampagnes op één plek",
    keywords: "projecten, overzicht, websites, blogs, campagnes, beheer"
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      // Simulate project data based on existing blog posts
      const { data: blogPosts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group blog posts by potential projects (you can enhance this logic)
      const projectsMap = new Map<string, Project>();
      
      blogPosts?.forEach(post => {
        const projectKey = post.city || 'algemeen';
        if (!projectsMap.has(projectKey)) {
          projectsMap.set(projectKey, {
            id: `project-${projectKey}`,
            name: `${projectKey.charAt(0).toUpperCase() + projectKey.slice(1)} Project`,
            type: 'blog',
            status: 'active',
            posts_count: 0,
            last_updated: post.updated_at,
            created_at: post.created_at,
            description: `Blog project voor ${projectKey}`
          });
        }
        
        const project = projectsMap.get(projectKey)!;
        project.posts_count += 1;
        if (new Date(post.updated_at) > new Date(project.last_updated)) {
          project.last_updated = post.updated_at;
        }
      });

      // Add some mock projects for demonstration
      projectsMap.set('website-main', {
        id: 'website-main',
        name: 'Hoofdwebsite',
        type: 'website',
        status: 'active',
        posts_count: blogPosts?.length || 0,
        last_updated: new Date().toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        url: 'https://jouwsite.nl',
        description: 'Hoofdwebsite met alle blog content'
      });

      setProjects(Array.from(projectsMap.values()));
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Fout bij laden projecten",
        description: "Kon projecten niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (selectedTab === "all") return true;
    return project.type === selectedTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'website': return Globe;
      case 'blog': return FileText;
      case 'campaign': return TrendingUp;
      default: return FolderOpen;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Projecten Overzicht</h1>
          </div>
          <p className="text-muted-foreground">
            Beheer al je websites, blogs en contentcampagnes
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nieuw Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Totaal Projecten</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actieve Projecten</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Globe className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Totaal Posts</p>
                <p className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + p.posts_count, 0)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deze Maand</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => 
                    new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Alle Projecten</TabsTrigger>
          <TabsTrigger value="website">Websites</TabsTrigger>
          <TabsTrigger value="blog">Blogs</TabsTrigger>
          <TabsTrigger value="campaign">Campagnes</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Geen projecten gevonden</h3>
                <p className="text-muted-foreground mb-4">
                  Begin met het maken van je eerste project
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuw Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const Icon = getTypeIcon(project.type);
                return (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-primary" />
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      {project.description && (
                        <CardDescription>{project.description}</CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Content</span>
                          <span className="font-medium">{project.posts_count} posts</span>
                        </div>
                        <Progress 
                          value={Math.min((project.posts_count / 50) * 100, 100)} 
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Aangemaakt</p>
                          <p className="font-medium">
                            {new Date(project.created_at).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Laatste update</p>
                          <p className="font-medium">
                            {new Date(project.last_updated).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                      </div>

                      {project.url && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{project.url}</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit3 className="w-4 h-4 mr-1" />
                          Bewerken
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectsOverview;