import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import WordPressPublishModal from "@/components/WordPressPublishModal";
import BlogViewModal from "@/components/BlogViewModal";
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Edit,
  Globe,
  ExternalLink,
  Plus,
  Loader2,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  publish_date: string;
  summary: string;
  author: string;
  city: string;
  canonical_url?: string;
  word_count: number;
  created_at: string;
  meta_title?: string;
  meta_description?: string;
  hero_image_url?: string;
  hero_image_alt?: string;
  body_markdown?: string;
  tags?: string[];
  faq_json?: any;
  cta_heading?: string;
  cta_subtext?: string;
}

const BlogManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalWords: 0
  });

  // Real-time subscription voor live updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for blog posts');
    
    const channel = supabase
      .channel('blog-management-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'blog_posts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setPosts(prev => [payload.new as BlogPost, ...prev]);
            toast({
              title: "Nieuwe Blog Toegevoegd",
              description: `"${(payload.new as BlogPost).title}" is toegevoegd`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(post => 
              post.id === payload.new.id ? payload.new as BlogPost : post
            ));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(post => post.id !== payload.old.id));
          }
          
          // Herbereken stats na wijzigingen
          calculateStats();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Bereken statistieken
  const calculateStats = useCallback(() => {
    const total = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    const totalWords = posts.reduce((sum, post) => sum + (post.word_count || 0), 0);
    
    setStats({ total, published, drafts, totalWords });
  }, [posts]);

  useEffect(() => {
    calculateStats();
  }, [posts, calculateStats]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    if (!user) {
      console.log('No user found, skipping fetchPosts');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching blog posts for user:', user.id);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched posts:', data?.length || 0, 'posts');
      setPosts(data || []);
      
      if ((data || []).length === 0) {
        console.log('No blog posts found for this user');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Fout bij laden",
        description: error instanceof Error ? error.message : "Kon blogposts niet laden",
        variant: "destructive",
      });
      
      // Zet posts naar lege array bij fout
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return "bg-green-100 text-green-800 border-green-200";
      case 'draft':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Refresh functie voor handmatige refresh  
  const handleRefresh = async () => {
    toast({
      title: "Blogs Vernieuwen",
      description: "Bezig met ophalen van de nieuwste blogs...",
    });
    await fetchPosts();
  };

  // Delete functionaliteit
  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postToDelete.id);

      if (error) throw error;

      toast({
        title: "Blog Verwijderd",
        description: `"${postToDelete.title}" is succesvol verwijderd`,
      });

      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Fout bij verwijderen",
        description: error instanceof Error ? error.message : "Kon blog niet verwijderen",
        variant: "destructive",
      });
    }
  };

  // Debug component - alleen zichtbaar in development
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-sm text-yellow-800">Debug Informatie</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-yellow-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>User ID:</strong> {user?.id || 'Geen gebruiker'}
            </div>
            <div>
              <strong>Posts geladen:</strong> {posts.length}
            </div>
            <div>
              <strong>Loading status:</strong> {loading ? 'Aan het laden...' : 'Klaar'}
            </div>
            <div>
              <strong>Filter term:</strong> {searchTerm || 'Geen filter'}
            </div>
            <div>
              <strong>Status filter:</strong> {statusFilter}
            </div>
            <div>
              <strong>Gefilterde posts:</strong> {filteredPosts.length}
            </div>
          </div>
          <div className="mt-4">
            <strong>Stats:</strong> Totaal: {stats.total}, Gepubliceerd: {stats.published}, Concepten: {stats.drafts}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog Management</h2>
          <p className="text-muted-foreground">
            Beheer en publiceer je blogs naar WordPress
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/dashboard/generate')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nieuwe Blog
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Ververs Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Zoek blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Alle statussen</option>
                <option value="draft">Draft</option>
                <option value="published">Gepubliceerd</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <DebugInfo />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Totaal Blogs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gepubliceerd</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <Globe className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concepten</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Totaal Woorden</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalWords.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blog Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center p-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Geen blogs gevonden</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Geen blogs komen overeen met je filters" 
                  : "Je hebt nog geen blogs aangemaakt"}
              </p>
              <Button onClick={() => navigate('/dashboard/generate')}>
                <Plus className="h-4 w-4 mr-2" />
                Eerste Blog Maken
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-2">{post.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                          {post.summary}
                        </p>
                      </div>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publish_date)}
                      </div>
                      {post.city && (
                        <div>📍 {post.city}</div>
                      )}
                      {post.author && (
                        <div>👤 {post.author}</div>
                      )}
                      <div>📝 {post.word_count || 0} woorden</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <BlogViewModal post={post}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Bekijken
                      </Button>
                    </BlogViewModal>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Bewerken
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteClick(post)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Verwijderen
                    </Button>
                    {post.canonical_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={post.canonical_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          WordPress
                        </a>
                      </Button>
                    )}
                    <WordPressPublishModal
                      postId={post.id}
                      postTitle={post.title}
                      onSuccess={fetchPosts}
                    >
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Globe className="h-4 w-4 mr-1" />
                        {post.canonical_url ? 'Hernieuwen' : 'Publiceren'}
                      </Button>
                    </WordPressPublishModal>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blog Verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je "{postToDelete?.title}" wilt verwijderen? 
              Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setPostToDelete(null);
            }}>
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogManagement;