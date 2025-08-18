import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, FileText, Globe, Upload, Settings, BarChart3, Clock, Loader2, Eye, Edit, Copy, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { NewUserDashboard } from "@/components/NewUserDashboard";
import { supabase } from "@/integrations/supabase/client";

// Dashboard Overview Component for existing users
const DashboardOverview = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welkom terug, {user?.email}!</p>
            </div>
            <CreditsDisplay />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Gegenereerd</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">+12 sinds gisteren</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gepubliceerd</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">70% van totaal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gemiddelde Woorden</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Per blogpost</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">Gemiddelde kwaliteit</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recente Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Dakbedekking Services Amsterdam", status: "Gepubliceerd", date: "15 minuten geleden" },
                { title: "Bitumen Dakdekker Rotterdam", status: "Concept", date: "1 uur geleden" },
                { title: "Dakgoot Reparatie Utrecht", status: "Gepubliceerd", date: "2 uur geleden" },
              ].map((post, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground">{post.date}</p>
                  </div>
                  <Badge variant={post.status === "Gepubliceerd" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
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
  const { user } = useAuth();
  const [hasBlogPosts, setHasBlogPosts] = useState<boolean | null>(null);

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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welkom terug, {user?.email}!</p>
              </div>
              <CreditsDisplay />
            </div>
          </div>
          <NewUserDashboard />
        </div>
      </div>
    );
  }

  // Show regular dashboard for existing users
  return <DashboardOverview />;
};

export default Dashboard;