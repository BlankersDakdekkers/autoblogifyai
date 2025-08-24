import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, FileText, Globe, Upload, Settings, BarChart3, Clock, Loader2, Eye, Edit, Copy, ExternalLink, Zap } from "lucide-react";
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

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-fade-in border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden" style={{ animationDelay: '100ms' }}>
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Posts Gegenereerd
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                <FileText className="h-4 w-4 text-primary group-hover:text-primary transition-colors duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2 group-hover:from-primary group-hover:to-accent transition-all duration-500">
                {dashboardStats.totalPosts}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 group-hover:text-muted-foreground/80 transition-colors duration-300">
                <span className="inline-flex items-center gap-1 text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full">
                  +{Math.max(0, dashboardStats.totalPosts - 15)}
                </span> 
                deze maand
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-fade-in border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Gepubliceerd
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 group-hover:from-accent/20 group-hover:to-accent/10 transition-all duration-300 group-hover:scale-110">
                <Globe className="h-4 w-4 text-accent group-hover:text-accent transition-colors duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-2 group-hover:from-accent group-hover:to-primary transition-all duration-500">
                {dashboardStats.publishedPosts}
              </div>
              <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                <span className="inline-flex items-center gap-1 text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                  {dashboardStats.totalPosts > 0 ? Math.round((dashboardStats.publishedPosts / dashboardStats.totalPosts) * 100) : 0}%
                </span> 
                van totaal
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-fade-in border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Gemiddelde Woorden
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                <BarChart3 className="h-4 w-4 text-primary group-hover:text-primary transition-colors duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2 group-hover:from-primary group-hover:to-accent transition-all duration-500">
                {dashboardStats.averageWords.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                <span className="inline-flex items-center gap-1 text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full">
                  SEO
                </span> 
                per blogpost
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-fade-in border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                SEO Score
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 group-hover:from-accent/20 group-hover:to-accent/10 transition-all duration-300 group-hover:scale-110">
                <CheckCircle2 className="h-4 w-4 text-accent group-hover:text-accent transition-colors duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent group-hover:from-accent group-hover:to-primary transition-all duration-500">
                  {dashboardStats.seoScore}
                </div>
                <span className="text-lg font-medium text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                  dashboardStats.seoScore >= 90 
                    ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' 
                    : dashboardStats.seoScore >= 75 
                    ? 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30'
                    : 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30'
                }`}>
                  {dashboardStats.seoScore >= 90 ? 'Uitstekend' : dashboardStats.seoScore >= 75 ? 'Goed' : 'Gemiddeld'}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Posts with Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Posts - Enhanced */}
          <Card className="lg:col-span-2 animate-fade-in border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden" style={{ animationDelay: '500ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] via-transparent to-accent/[0.01]" />
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-transparent to-accent/5 relative">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold">Recente Posts</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/dashboard/blogs')}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Alle posts
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative">
              <div className="space-y-0">
                {recentPosts.length > 0 ? recentPosts.map((post, i) => (
                  <div key={post.id} className="group flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gradient-to-r hover:from-primary/[0.02] hover:via-transparent hover:to-accent/[0.02] transition-all duration-300 relative">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">{post.date}</p>
                        {post.city && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              {post.city}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge 
                        variant={post.status === "Gepubliceerd" ? "default" : "secondary"}
                        className={`text-xs ${post.status === "Gepubliceerd" 
                          ? "bg-gradient-to-r from-accent to-accent/80 text-white shadow-sm" 
                          : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {post.status}
                      </Badge>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          onClick={() => navigate(post.type === 'blog' ? '/dashboard/blogs' : '/dashboard/knowledge-base')}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-accent/10"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground mb-2">Nog geen content aangemaakt</p>
                    <p className="text-sm text-muted-foreground mb-4">Begin met het genereren van je eerste blogpost!</p>
                    <Button 
                      onClick={() => navigate('/dashboard/keywords')}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                    >
                      Start nu
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="animate-fade-in border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden" style={{ animationDelay: '600ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.01] via-transparent to-primary/[0.01]" />
            <CardHeader className="border-b bg-gradient-to-r from-accent/5 via-transparent to-primary/5 relative">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <span className="text-lg font-semibold">Snelle Acties</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 relative">
              <Button 
                onClick={() => navigate('/dashboard/keywords')}
                className="w-full justify-start bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary border-primary/20 hover:border-primary/30 transition-all duration-300 group"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                Nieuwe Blogpost
              </Button>
              
              <Button 
                onClick={() => navigate('/dashboard/csv-processor')}
                className="w-full justify-start bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 text-accent border-accent/20 hover:border-accent/30 transition-all duration-300 group"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                CSV Uploaden
              </Button>
              
              <Button 
                onClick={() => navigate('/dashboard/websites')}
                className="w-full justify-start bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary border-primary/20 hover:border-primary/30 transition-all duration-300 group"
                variant="outline"
              >
                <Globe className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                Website Maken
              </Button>
              
              <Button 
                onClick={() => navigate('/dashboard/analytics')}
                className="w-full justify-start bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 text-accent border-accent/20 hover:border-accent/30 transition-all duration-300 group"
                variant="outline"
              >
                <BarChart3 className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                Analytics Bekijken
              </Button>
              
              <div className="pt-2 border-t border-border/50">
                <Button 
                  onClick={() => navigate('/dashboard/settings')}
                  className="w-full justify-start text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                  variant="ghost"
                >
                  <Settings className="h-4 w-4 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  Instellingen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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