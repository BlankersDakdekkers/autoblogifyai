import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, FileText, Globe, Upload, Settings, BarChart3, Clock, Loader2, Eye, Edit, Copy, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { AdminSetup } from "@/components/AdminSetup";
import { NewUserDashboard } from "@/components/NewUserDashboard";
import { supabase } from "@/integrations/supabase/client";

// Dashboard Overview Component for existing users
const DashboardOverview = () => {
  const { user } = useAuth();

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
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">127</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-accent font-medium">+12</span> sinds gisteren
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
              <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">89</div>
              <p className="text-xs text-muted-foreground">70% van totaal</p>
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
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">1,247</div>
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
              <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">94%</div>
              <p className="text-xs text-muted-foreground">Gemiddelde kwaliteit</p>
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
              {[
                { title: "Dakbedekking Services Amsterdam", status: "Gepubliceerd", date: "15 minuten geleden" },
                { title: "Bitumen Dakdekker Rotterdam", status: "Concept", date: "1 uur geleden" },
                { title: "Dakgoot Reparatie Utrecht", status: "Gepubliceerd", date: "2 uur geleden" },
              ].map((post, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gradient-to-r hover:from-muted/30 hover:to-transparent transition-all duration-200 group">
                  <div className="flex-1">
                    <p className="font-medium group-hover:text-primary transition-colors duration-200">{post.title}</p>
                    <p className="text-sm text-muted-foreground">{post.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={post.status === "Gepubliceerd" ? "default" : "secondary"}
                      className={post.status === "Gepubliceerd" ? "bg-gradient-to-r from-accent to-accent/80" : ""}
                    >
                      {post.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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

  // Check if user has any blog posts
  useEffect(() => {
    const checkForContent = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (error) throw error;
        setHasBlogPosts(data && data.length > 0);
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