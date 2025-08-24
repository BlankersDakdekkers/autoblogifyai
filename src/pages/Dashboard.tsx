import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, FileText, Globe, Upload, Settings, BarChart3, Clock, Loader2, Eye, Edit, Copy, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { AdminSetup } from "@/components/AdminSetup";
import { NewUserDashboard } from "@/components/NewUserDashboard";
import { supabase } from "@/integrations/supabase/client";

// Dashboard Overview Component for existing users
const DashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    averageWords: 0,
    seoScore: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Optimize database queries - run in parallel and limit data
      const [blogPostsResponse, knowledgeItemsResponse] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('id, title, status, created_at, word_count, city')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10), // Limit to recent posts only
        
        supabase
          .from('knowledge_items')
          .select('id, title, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (blogPostsResponse.error) throw blogPostsResponse.error;
      if (knowledgeItemsResponse.error) throw knowledgeItemsResponse.error;

      const blogPosts = blogPostsResponse.data || [];
      const knowledgeItems = knowledgeItemsResponse.data || [];

      // Calculate stats efficiently
      const totalPosts = blogPosts.length + knowledgeItems.length;
      const publishedBlogPosts = blogPosts.filter(post => post.status === 'published').length;
      const publishedKnowledgeItems = knowledgeItems.filter(item => item.status === 'published').length;
      const totalPublished = publishedBlogPosts + publishedKnowledgeItems;
      
      // Use pre-calculated word_count from database instead of recalculating
      const totalWords = blogPosts.reduce((acc, post) => acc + (post.word_count || 0), 0);
      const averageWords = totalPosts > 0 ? Math.round(totalWords / blogPosts.length) : 0;

      // Calculate SEO score (simplified)
      const seoScore = totalPosts > 0 ? Math.min(94, 60 + (totalPublished * 3)) : 0;

      setDashboardStats({
        totalPosts,
        publishedPosts: totalPublished,
        averageWords,
        seoScore
      });

      // Format recent posts efficiently
      const recentBlogPosts = blogPosts.slice(0, 3).map(post => ({
        id: post.id,
        title: post.title,
        status: post.status === 'published' ? 'Gepubliceerd' : 'Concept',
        date: formatRelativeTime(post.created_at),
        type: 'blog',
        city: post.city,
        created_at: post.created_at
      }));

      const recentKnowledgeItems = knowledgeItems.slice(0, 2).map(item => ({
        id: item.id,
        title: item.title,
        status: item.status === 'published' ? 'Gepubliceerd' : 'Concept',
        date: formatRelativeTime(item.created_at),
        type: 'knowledge',
        created_at: item.created_at
      }));

      const allRecent = [...recentBlogPosts, ...recentKnowledgeItems]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setRecentPosts(allRecent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minuten geleden`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} uur geleden`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} dag${days === 1 ? '' : 'en'} geleden`;
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center animate-fade-in">
              <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Dashboard laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Welkom terug, <span className="font-medium text-foreground">{user?.email}!</span>
              </p>
            </div>
            <div className="animate-scale-in">
              <CreditsDisplay />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant" style={{ animationDelay: '100ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Gegenereerd</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {dashboardStats.totalPosts}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-accent font-medium">+{Math.max(0, dashboardStats.totalPosts - 15)}</span> deze maand
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant" style={{ animationDelay: '200ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gepubliceerd</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10">
                <Globe className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                {dashboardStats.publishedPosts}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.totalPosts > 0 ? Math.round((dashboardStats.publishedPosts / dashboardStats.totalPosts) * 100) : 0}% van totaal
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant" style={{ animationDelay: '300ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gemiddelde Woorden</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {dashboardStats.averageWords.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Per blogpost</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant" style={{ animationDelay: '400ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10">
                <CheckCircle2 className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                {dashboardStats.seoScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.seoScore >= 90 ? 'Uitstekende' : dashboardStats.seoScore >= 75 ? 'Goede' : 'Gemiddelde'} kwaliteit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card className="animate-fade-in border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant" style={{ animationDelay: '500ms' }}>
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1 rounded bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              Recente Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {recentPosts.length > 0 ? recentPosts.map((post, i) => (
                <div key={post.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gradient-to-r hover:from-muted/30 hover:to-transparent transition-all duration-200 group">
                  <div className="flex-1">
                    <p className="font-medium group-hover:text-primary transition-colors duration-200">
                      {post.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{post.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={post.status === "Gepubliceerd" ? "default" : "secondary"}
                      className={post.status === "Gepubliceerd" ? "bg-gradient-to-r from-accent to-accent/80" : ""}
                    >
                      {post.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => navigate(post.type === 'blog' ? '/dashboard/blogs' : '/dashboard/knowledge-base')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nog geen content aangemaakt</p>
                  <p className="text-sm text-muted-foreground mt-1">Begin met het genereren van je eerste blogpost!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user, refreshCredits } = useAuth();
  const { toast } = useToast();
  const [hasBlogPosts, setHasBlogPosts] = useState<boolean | null>(null);

  // Check for URL parameters on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const creditsPurchased = urlParams.get('credits_purchased');
    const paymentCancelled = urlParams.get('payment_cancelled');

    if (creditsPurchased) {
      toast({
        title: "Credits Gekocht! 🎉",
        description: `Je hebt ${creditsPurchased} credits toegevoegd aan je account`,
      });
      refreshCredits();
      // Clean URL
      window.history.replaceState({}, '', '/dashboard');
    }

    if (paymentCancelled) {
      toast({
        title: "Betaling Geannuleerd",
        description: "Je betaling is geannuleerd. Probeer het later opnieuw.",
        variant: "destructive",
      });
      // Clean URL  
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [toast, refreshCredits]);

  // Check if user has any blog posts - optimize query
  useEffect(() => {
    const checkForContent = async () => {
      if (!user) return;
      
      try {
        // Use count instead of fetching data for faster performance
        const { count, error } = await supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .limit(1);
        
        if (error) throw error;
        setHasBlogPosts((count || 0) > 0);
      } catch (error) {
        console.error('Error checking for blog posts:', error);
        setHasBlogPosts(false);
      }
    };

    checkForContent();
  }, [user]);

  // Show loading state while checking
  if (hasBlogPosts === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center animate-fade-in">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Dashboard laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show new user dashboard if no content
  if (hasBlogPosts === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Welkom terug, <span className="font-medium text-foreground">{user?.email}!</span>
                </p>
              </div>
              <div className="animate-scale-in">
                <CreditsDisplay />
              </div>
            </div>
          </div>
          <div className="animate-fade-in mb-6" style={{ animationDelay: '100ms' }}>
            <AdminSetup />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <NewUserDashboard />
          </div>
        </div>
      </div>
    );
  }

  // Show regular dashboard for existing users
  return <DashboardOverview />;
};

export default Dashboard;