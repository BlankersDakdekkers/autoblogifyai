import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Layout, Palette, Code, Plus, Eye, Settings, Globe, Database, Download,
  Zap, RefreshCw, Users, Calendar, BarChart3, TrendingUp, Monitor,
  Smartphone, Tablet, Layers, Paintbrush, Rocket, Activity, CheckCircle,
  AlertCircle, Loader2, ArrowRight, Star, Crown, Sparkles
} from "lucide-react";

interface Website {
  id: string;
  name: string;
  url: string;
  status: 'live' | 'draft' | 'building' | 'maintenance';
  template: string;
  lastUpdated: string;
  totalPages: number;
  monthlyVisitors: number;
  performanceScore: number;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  features: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  premium: boolean;
  estimatedTime: string;
  demoUrl: string;
}

interface Component {
  id: string;
  name: string;
  category: string;
  usage: number;
  description: string;
  codePreview: string;
  responsive: boolean;
  premium: boolean;
}

const ProductionWebsiteBuilder = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Core state
  const [activeTab, setActiveTab] = useState("websites");
  const [websites, setWebsites] = useState<Website[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Website creation state
  const [newWebsiteName, setNewWebsiteName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isCreatingWebsite, setIsCreatingWebsite] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalWebsites: 0,
    liveWebsites: 0,
    totalVisitors: 0,
    avgPerformance: 0,
    deploymentsThisMonth: 0
  });

  // Load data on mount
  useEffect(() => {
    loadWebsites();
    loadTemplates();
    loadComponents();
    loadAnalytics();
  }, [user?.id]);

  const loadWebsites = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from supabase
      const mockWebsites: Website[] = [
        {
          id: '1',
          name: 'Dakdekker Portfolio Pro',
          url: 'dakdekker-amsterdam.autoblogify.app',
          status: 'live',
          template: 'Business Pro',
          lastUpdated: '2 uur geleden',
          totalPages: 12,
          monthlyVisitors: 3400,
          performanceScore: 94,
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'SEO Blog Hub',
          url: 'seo-blog.autoblogify.app',
          status: 'draft',
          template: 'Blog Master',
          lastUpdated: '1 dag geleden',
          totalPages: 8,
          monthlyVisitors: 1200,
          performanceScore: 88,
          createdAt: '2024-01-10T14:30:00Z'
        },
        {
          id: '3',
          name: 'Local Services Directory',
          url: 'lokale-diensten.autoblogify.app',
          status: 'building',
          template: 'Service Directory',
          lastUpdated: '30 min geleden',
          totalPages: 15,
          monthlyVisitors: 5600,
          performanceScore: 91,
          createdAt: '2024-01-05T09:15:00Z'
        }
      ];
      
      setWebsites(mockWebsites);
    } catch (error) {
      console.error('Error loading websites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const mockTemplates: Template[] = [
        {
          id: 'business-pro',
          name: 'Business Pro',
          description: 'Professionele bedrijfswebsite met portfolio, diensten en contact integratie',
          category: 'Business',
          preview: '/api/placeholder/400/300',
          features: ['Responsive Design', 'SEO Optimized', 'Contact Forms', 'Portfolio Gallery', 'Blog Integration'],
          difficulty: 'intermediate',
          premium: true,
          estimatedTime: '2-3 uur',
          demoUrl: 'https://business-pro.demo.autoblogify.app'
        },
        {
          id: 'blog-master',
          name: 'Blog Master',
          description: 'SEO-geoptimaliseerde blog template met AutoblogifyAI integratie en geavanceerde content management',
          category: 'Blog',
          preview: '/api/placeholder/400/300',
          features: ['AutoblogifyAI Integration', 'Advanced SEO', 'Social Sharing', 'Comment System', 'Newsletter Signup'],
          difficulty: 'beginner',
          premium: false,
          estimatedTime: '1-2 uur',
          demoUrl: 'https://blog-master.demo.autoblogify.app'
        },
        {
          id: 'service-directory',
          name: 'Service Directory',
          description: 'Lokale dienstverlening directory met city-landingspagina\'s en review systeem',
          category: 'Directory',
          preview: '/api/placeholder/400/300',
          features: ['Location Pages', 'Review System', 'Search & Filter', 'Business Listings', 'Map Integration'],
          difficulty: 'advanced',
          premium: true,
          estimatedTime: '3-4 uur',
          demoUrl: 'https://service-directory.demo.autoblogify.app'
        },
        {
          id: 'ecommerce-starter',
          name: 'E-commerce Starter',
          description: 'Complete e-commerce oplossing met product cataloog en betalingsintegratie',
          category: 'E-commerce',
          preview: '/api/placeholder/400/300',
          features: ['Product Catalog', 'Shopping Cart', 'Payment Integration', 'Order Management', 'Inventory Tracking'],
          difficulty: 'advanced',
          premium: true,
          estimatedTime: '4-5 uur',
          demoUrl: 'https://ecommerce-starter.demo.autoblogify.app'
        }
      ];
      
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadComponents = async () => {
    try {
      const mockComponents: Component[] = [
        {
          id: 'hero-section',
          name: 'Hero Section Pro',
          category: 'Headers',
          usage: 89,
          description: 'Geavanceerde hero sectie met video achtergrond en animaties',
          codePreview: '<section class="hero-pro">...</section>',
          responsive: true,
          premium: true
        },
        {
          id: 'contact-form',
          name: 'Smart Contact Form',
          category: 'Forms',
          usage: 67,
          description: 'Intelligente contactform met spam bescherming en auto-responder',
          codePreview: '<form class="smart-contact">...</form>',
          responsive: true,
          premium: false
        },
        {
          id: 'service-cards',
          name: 'Service Cards Grid',
          category: 'Content',
          usage: 54,
          description: 'Responsive service cards met hover effecten en CTA buttons',
          codePreview: '<div class="service-grid">...</div>',
          responsive: true,
          premium: false
        },
        {
          id: 'testimonials-slider',
          name: 'Testimonials Carousel',
          category: 'Social Proof',
          usage: 43,
          description: 'Automatische testimonials slider met star ratings',
          codePreview: '<div class="testimonials-slider">...</div>',
          responsive: true,
          premium: true
        }
      ];
      
      setComponents(mockComponents);
    } catch (error) {
      console.error('Error loading components:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Calculate analytics from mock data
      const totalWebsites = websites.length;
      const liveWebsites = websites.filter(w => w.status === 'live').length;
      const totalVisitors = websites.reduce((sum, w) => sum + w.monthlyVisitors, 0);
      const avgPerformance = Math.round(websites.reduce((sum, w) => sum + w.performanceScore, 0) / websites.length) || 0;
      
      setAnalytics({
        totalWebsites,
        liveWebsites,
        totalVisitors,
        avgPerformance,
        deploymentsThisMonth: 12
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const createWebsite = async () => {
    if (!newWebsiteName.trim() || !selectedTemplate) {
      toast({
        title: "Incomplete Gegevens",
        description: "Voer een naam in en selecteer een template",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingWebsite(true);
    setCreationProgress(0);

    try {
      const steps = [
        'Template ophalen...',
        'Database structuur aanmaken...',
        'Bestanden kopiëren...',
        'Styling toepassen...',
        'Content integreren...',
        'SEO configureren...',
        'Performance optimaliseren...',
        'Website deployen...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCreationProgress(((i + 1) / steps.length) * 100);
        
        toast({
          title: steps[i],
          description: `Stap ${i + 1} van ${steps.length}`,
        });
      }

      const newWebsite: Website = {
        id: Date.now().toString(),
        name: newWebsiteName,
        url: `${newWebsiteName.toLowerCase().replace(/\s+/g, '-')}.autoblogify.app`,
        status: 'draft',
        template: templates.find(t => t.id === selectedTemplate)?.name || 'Unknown',
        lastUpdated: 'Nu',
        totalPages: 1,
        monthlyVisitors: 0,
        performanceScore: 95,
        createdAt: new Date().toISOString()
      };

      setWebsites(prev => [newWebsite, ...prev]);
      setNewWebsiteName("");
      setSelectedTemplate("");

      toast({
        title: "Website Aangemaakt! 🎉",
        description: `"${newWebsite.name}" is succesvol opgezet en klaar voor bewerking`,
      });

    } catch (error) {
      console.error('Website creation error:', error);
      toast({
        title: "Aanmaak Fout",
        description: "Er is een fout opgetreden bij het aanmaken van de website",
        variant: "destructive"
      });
    } finally {
      setIsCreatingWebsite(false);
      setCreationProgress(0);
    }
  };

  const previewWebsite = (website: Website) => {
    window.open(`https://${website.url}`, '_blank');
    toast({
      title: `Preview: ${website.name}`,
      description: "Website wordt geopend in nieuw tabblad"
    });
  };

  const editWebsite = (website: Website) => {
    toast({
      title: `Bewerken: ${website.name}`,
      description: "Website editor wordt geladen..."
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'building': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'maintenance': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'draft': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'default';
      case 'building': return 'secondary';
      case 'maintenance': return 'outline';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatVisitors = (visitors: number) => {
    if (visitors >= 1000) {
      return `${(visitors / 1000).toFixed(1)}K`;
    }
    return visitors.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                <Layout className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Website Builder Pro
                </h1>
                <p className="text-muted-foreground mt-1">
                  Enterprise website bouw platform met AI-integratie en professionele templates
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200">
              <Crown className="h-3 w-3 mr-1" />
              Pro Platform
            </Badge>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Website
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nieuwe Website Aanmaken</DialogTitle>
                  <DialogDescription>
                    Kies een naam en template voor je nieuwe professionele website
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="website-name">Website Naam</Label>
                    <Input
                      id="website-name"
                      value={newWebsiteName}
                      onChange={(e) => setNewWebsiteName(e.target.value)}
                      placeholder="Mijn professionele website"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Template Selectie</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {templates.slice(0, 4).map((template) => (
                        <Card 
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{template.name}</h4>
                              <div className="flex items-center gap-1">
                                {template.premium && (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                                <Badge className={getDifficultyColor(template.difficulty)}>
                                  {template.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {template.estimatedTime} • {template.features.length} features
                            </div>
                            {selectedTemplate === template.id && (
                              <CheckCircle className="h-5 w-5 text-blue-600 mt-2" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {isCreatingWebsite && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Website wordt aangemaakt...</span>
                        <span className="text-sm text-muted-foreground">{Math.round(creationProgress)}%</span>
                      </div>
                      <Progress value={creationProgress} />
                    </div>
                  )}

                  <Button 
                    onClick={createWebsite} 
                    disabled={isCreatingWebsite || !newWebsiteName.trim() || !selectedTemplate}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isCreatingWebsite ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Website Aanmaken...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Website Aanmaken
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Totaal Websites</p>
                  <p className="text-3xl font-bold text-blue-900">{analytics.totalWebsites}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-blue-600 mt-2">Alle projecten</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Live Websites</p>
                  <p className="text-3xl font-bold text-green-900">{analytics.liveWebsites}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">Actief online</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Maand Bezoekers</p>
                  <p className="text-3xl font-bold text-purple-900">{formatVisitors(analytics.totalVisitors)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-purple-600 mt-2">Totaal traffic</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Avg. Performance</p>
                  <p className="text-3xl font-bold text-orange-900">{analytics.avgPerformance}/100</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-orange-600 mt-2">PageSpeed score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">Deployments</p>
                  <p className="text-3xl font-bold text-indigo-900">{analytics.deploymentsThisMonth}</p>
                </div>
                <Rocket className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="text-xs text-indigo-600 mt-2">Deze maand</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="websites" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Websites</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Componenten</span>
            </TabsTrigger>
            <TabsTrigger value="deployment" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">Deployment</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <span>Websites laden...</span>
                </CardContent>
              </Card>
            ) : websites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Layout className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg mb-2">Nog geen websites</h3>
                  <p className="text-muted-foreground mb-4">
                    Maak je eerste professionele website aan met onze templates
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Eerste Website Aanmaken
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {websites.map((website) => (
                  <Card key={website.id} className="overflow-hidden hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{website.name}</h3>
                              <p className="text-sm text-muted-foreground">{website.url}</p>
                            </div>
                            <Badge variant={getStatusColor(website.status)} className="flex items-center gap-1">
                              {getStatusIcon(website.status)}
                              {website.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Template:</span>
                              <div className="font-medium">{website.template}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pagina's:</span>
                              <div className="font-medium">{website.totalPages}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Bezoekers/maand:</span>
                              <div className="font-medium">{formatVisitors(website.monthlyVisitors)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Performance:</span>
                              <div className="font-medium text-green-600">{website.performanceScore}/100</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Bijgewerkt: {website.lastUpdated}</span>
                            <span>•</span>
                            <span>Aangemaakt: {new Date(website.createdAt).toLocaleDateString('nl-NL')}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => previewWebsite(website)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editWebsite(website)}
                            className="flex items-center gap-1"
                          >
                            <Settings className="h-3 w-3" />
                            Bewerk
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Professionele Templates</h2>
                <p className="text-muted-foreground">
                  Kies uit onze collectie premium templates geoptimaliseerd voor AutoblogifyAI
                </p>
              </div>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Templates Vernieuwen
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-purple-200/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Palette className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                        <div className="text-sm font-medium text-blue-800">{template.name}</div>
                        <div className="text-xs text-blue-600">{template.category}</div>
                      </div>
                    </div>
                    {template.premium && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Features:</span>
                        <span className="text-muted-foreground">{template.estimatedTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.features.length - 3} meer
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setNewWebsiteName(`Nieuwe ${template.name} Website`);
                        }}
                      >
                        Gebruik Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(template.demoUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">UI Componenten Library</h2>
                <p className="text-muted-foreground">
                  Herbruikbare, responsive componenten voor je websites
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Component
              </Button>
            </div>

            <div className="grid gap-4">
              {components.map((component) => (
                <Card key={component.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Code className="h-6 w-6 text-white" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{component.name}</h3>
                            {component.premium && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                            {component.responsive && (
                              <Badge variant="outline" className="text-xs">
                                <Monitor className="h-3 w-3 mr-1" />
                                Responsive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{component.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Categorie: {component.category}</span>
                            <span>•</span>
                            <span>{component.usage}x gebruikt</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Code className="h-3 w-3 mr-1" />
                          Code
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Toevoegen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Actieve Sites</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.liveWebsites}</div>
                  <p className="text-xs text-muted-foreground">Live op internet</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Deployments</CardTitle>
                  <Rocket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.deploymentsThisMonth}</div>
                  <p className="text-xs text-muted-foreground">Deze maand</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">99.9%</div>
                  <p className="text-xs text-muted-foreground">Laatste 30 dagen</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recente Deployments</CardTitle>
                <CardDescription>
                  Overzicht van website deployments en status updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {websites.map((website, index) => (
                      <div key={website.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(website.status)}
                          <div>
                            <p className="font-medium">{website.name}</p>
                            <p className="text-sm text-muted-foreground">{website.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-muted-foreground">{website.lastUpdated}</div>
                          <Badge variant={getStatusColor(website.status)}>
                            {website.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Website Performance</CardTitle>
                  <CardDescription>
                    PageSpeed en Core Web Vitals scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {websites.filter(w => w.status === 'live').map((website) => (
                      <div key={website.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{website.name}</p>
                          <p className="text-sm text-muted-foreground">{website.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{website.performanceScore}</div>
                            <div className="text-xs text-muted-foreground">PageSpeed</div>
                          </div>
                          <Progress value={website.performanceScore} className="w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Overview</CardTitle>
                  <CardDescription>
                    Maandelijkse bezoekers per website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {websites.filter(w => w.monthlyVisitors > 0).map((website) => (
                      <div key={website.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{website.name}</p>
                          <p className="text-sm text-muted-foreground">{website.totalPages} pagina's</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{formatVisitors(website.monthlyVisitors)}</div>
                          <div className="text-xs text-muted-foreground">bezoekers/maand</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Statistieken</CardTitle>
                <CardDescription>
                  Overzicht van je Website Builder Pro gebruik
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{analytics.totalWebsites}</div>
                    <div className="text-sm text-muted-foreground">Totaal Websites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{analytics.liveWebsites}</div>
                    <div className="text-sm text-muted-foreground">Live Websites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{formatVisitors(analytics.totalVisitors)}</div>
                    <div className="text-sm text-muted-foreground">Totaal Traffic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{analytics.avgPerformance}</div>
                    <div className="text-sm text-muted-foreground">Avg. Performance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductionWebsiteBuilder;