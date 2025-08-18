import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Settings, 
  Database,
  Zap,
  Calendar,
  Globe,
  BarChart3,
  Wand2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate: string;
  wordCount: number;
  tags: string[];
  metaDescription: string;
  generatedAt: string;
}

interface CSVData {
  title: string;
  slug: string;
  status: string;
  publish_date: string;
  summary: string;
  tags: string;
  author: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  hero_image_url: string;
  hero_image_alt: string;
  body_markdown: string;
  faq_json: string;
  cta_heading: string;
  cta_subtext: string;
  city: string;
  word_count_target: number;
}

const AutoBlogProducer = () => {
  const { toast } = useToast();
  const [csvUrl, setCsvUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const processingSteps = [
    "CSV downloaden en valideren",
    "Content structuur analyseren", 
    "AI content generatie",
    "SEO optimalisatie",
    "Afbeeldingen genereren",
    "Markdown bestanden creëren",
    "Publicatie scheduling"
  ];

  const mockBlogPosts: BlogPost[] = [
    {
      id: "1",
      title: "Dakdekker Amsterdam - Complete Gids 2024",
      slug: "dakdekker-amsterdam-gids-2024",
      status: "published",
      publishDate: "2024-01-15",
      wordCount: 1250,
      tags: ["dakdekker", "amsterdam", "renovatie"],
      metaDescription: "Zoek je een betrouwbare dakdekker in Amsterdam? Lees onze complete gids met tips, prijzen en aanbevelingen.",
      generatedAt: "2024-01-14T10:30:00Z"
    },
    {
      id: "2", 
      title: "Dakisolatie Kosten 2024 - Volledige Prijsoverzicht",
      slug: "dakisolatie-kosten-2024-prijsoverzicht",
      status: "scheduled",
      publishDate: "2024-01-20",
      wordCount: 980,
      tags: ["isolatie", "kosten", "energiebesparing"],
      metaDescription: "Wat kost dakisolatie in 2024? Bekijk ons complete prijsoverzicht en bereken je besparingen.",
      generatedAt: "2024-01-14T11:15:00Z"
    },
    {
      id: "3",
      title: "Plat Dak Reparatie - Wanneer en Hoe?",
      slug: "plat-dak-reparatie-wanneer-hoe",
      status: "draft", 
      publishDate: "2024-01-25",
      wordCount: 750,
      tags: ["plat dak", "reparatie", "onderhoud"],
      metaDescription: "Plat dak reparatie nodig? Leer wanneer je moet handelen en hoe je de beste dakdekker vindt.",
      generatedAt: "2024-01-14T12:00:00Z"
    }
  ];

  const handleCsvUrlSubmit = async () => {
    if (!csvUrl.trim()) {
      toast({
        title: "Fout",
        description: "Voer een geldige CSV URL in",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);
    setValidationErrors([]);

    // Simuleer CSV verwerking
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Simuleer resultaat
    setBlogPosts(mockBlogPosts);
    setIsProcessing(false);
    
    toast({
      title: "CSV Verwerkt! 🎉",
      description: `${mockBlogPosts.length} blogposts gegenereerd en klaar voor publicatie`
    });
  };

  const handlePublishPost = (postId: string) => {
    setBlogPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, status: 'published' as const, publishDate: new Date().toISOString().split('T')[0] }
        : post
    ));
    
    toast({
      title: "Post Gepubliceerd",
      description: "Blogpost is live gegaan op je website"
    });
  };

  const handleSchedulePost = (postId: string, date: string) => {
    setBlogPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, status: 'scheduled' as const, publishDate: date }
        : post
    ));
    
    toast({
      title: "Post Ingepland",
      description: `Blogpost wordt gepubliceerd op ${date}`
    });
  };

  const getStatusBadgeVariant = (status: BlogPost['status']) => {
    switch (status) {
      case 'published': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: BlogPost['status']) => {
    switch (status) {
      case 'published': return <Globe className="h-3 w-3" />;
      case 'scheduled': return <Calendar className="h-3 w-3" />;
      case 'draft': return <FileText className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const progress = isProcessing ? (processingStep / processingSteps.length) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wand2 className="h-8 w-8 text-primary" />
            AutoblogifyAI Producer
          </h2>
          <p className="text-muted-foreground">
            Van Google Sheets naar SEO-geoptimaliseerde blogposts in minuten
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
          <Zap className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Supabase Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Backend Vereist voor Volledige Functionaliteit</h4>
              <p className="text-sm text-amber-700">
                Voor AI content generatie, CSV processing en automatische publicatie moet je Supabase connecteren. 
                Klik op de groene Supabase knop rechts bovenin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">CSV Generator</TabsTrigger>
          <TabsTrigger value="posts">Blog Posts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Instellingen</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                CSV Input & Verwerking
              </CardTitle>
              <CardDescription>
                Upload je Google Sheets CSV en laat AI je content genereren
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="csv-url">Google Sheets CSV URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="csv-url"
                    value={csvUrl}
                    onChange={(e) => setCsvUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleCsvUrlSubmit}
                    disabled={isProcessing}
                    className="min-w-[120px]"
                  >
                    {isProcessing ? (
                      <>
                        <Settings className="mr-2 h-4 w-4 animate-spin" />
                        Verwerken...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Generatie
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Zorg dat je Google Sheet gepubliceerd is als CSV (File → Share → Publish to web → CSV)
                </p>
              </div>

              {isProcessing && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Voortgang</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    {processingSteps.map((step, index) => (
                      <div key={step} className="flex items-center gap-3 p-2 border rounded">
                        {index < processingStep ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : index === processingStep ? (
                          <Settings className="h-4 w-4 text-primary animate-spin" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-muted rounded-full" />
                        )}
                        <span className={index <= processingStep ? "font-medium" : "text-muted-foreground"}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">CSV Schema Vereisten:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <div>• title (verplicht)</div>
                  <div>• slug (verplicht)</div>
                  <div>• status (publish/draft)</div>
                  <div>• publish_date (YYYY-MM-DD)</div>
                  <div>• meta_description</div>
                  <div>• tags (semicolon gescheiden)</div>
                  <div>• body_markdown</div>
                  <div>• word_count_target</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Gegenereerde Blog Posts</h3>
            <Badge variant="outline">
              {blogPosts.length} posts
            </Badge>
          </div>

          <div className="grid gap-4">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {post.title}
                        <Badge variant={getStatusBadgeVariant(post.status)} className="text-xs">
                          {getStatusIcon(post.status)}
                          <span className="ml-1 capitalize">{post.status}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {post.metaDescription}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📝 {post.wordCount} woorden</span>
                    <span>📅 {post.publishDate}</span>
                    <span>🏷️ {post.tags.join(", ")}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Slug:</strong> <code className="bg-muted px-1 rounded text-xs">{post.slug}</code>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {post.status === 'draft' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handlePublishPost(post.id)}
                          className="flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          Nu Publiceren
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Inplannen
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Post Inplannen</DialogTitle>
                              <DialogDescription>
                                Kies wanneer deze post gepubliceerd moet worden
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="schedule-date">Publicatie Datum</Label>
                                <Input
                                  id="schedule-date"
                                  type="date"
                                  onChange={(e) => handleSchedulePost(post.id, e.target.value)}
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                    
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Bewerken
                    </Button>
                    
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      Download MD
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {blogPosts.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Geen Posts Gevonden</h3>
                  <p className="text-muted-foreground">
                    Upload een CSV bestand om te beginnen met het genereren van blog content
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blogPosts.length}</div>
                <p className="text-xs text-muted-foreground">+3 deze week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gepubliceerd</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {blogPosts.filter(p => p.status === 'published').length}
                </div>
                <p className="text-xs text-muted-foreground">Live op website</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingepland</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {blogPosts.filter(p => p.status === 'scheduled').length}
                </div>
                <p className="text-xs text-muted-foreground">Wachtend op publicatie</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Woorden</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {blogPosts.reduce((acc, post) => acc + post.wordCount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Content gegenereerd</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>
                Overzicht van je blog content prestaties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics komen beschikbaar na Supabase connectie</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AutoblogifyAI Instellingen
              </CardTitle>
              <CardDescription>
                Configureer je automatische blog productie workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ai-model">AI Model</Label>
                <select
                  id="ai-model"
                  className="w-full p-2 border rounded-md"
                  defaultValue="gpt-4.1-2025-04-14"
                >
                  <option value="gpt-5-2025-08-07">GPT-5 (Beste kwaliteit)</option>
                  <option value="gpt-4.1-2025-04-14">GPT-4.1 (Betrouwbaar)</option>
                  <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Creatief)</option>
                  <option value="claude-opus-4-20250514">Claude Opus 4 (Meest capabel)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="default-author">Standaard Auteur</Label>
                <Input
                  id="default-author"
                  placeholder="Naam van de auteur"
                  defaultValue="AutoblogifyAI"
                />
              </div>

              <div>
                <Label htmlFor="output-dir">Output Directory</Label>
                <Input
                  id="output-dir"
                  placeholder="./content/blog"
                  defaultValue="./content/blog"
                />
              </div>

              <div className="space-y-2">
                <Label>Content Opties</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-images" defaultChecked />
                    <Label htmlFor="auto-images">Automatisch afbeeldingen genereren</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-seo" defaultChecked />
                    <Label htmlFor="auto-seo">SEO optimalisatie inschakelen</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-faq" defaultChecked />
                    <Label htmlFor="auto-faq">FAQ secties genereren</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Instellingen Opslaan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoBlogProducer;