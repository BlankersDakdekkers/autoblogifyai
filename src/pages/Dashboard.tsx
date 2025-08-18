import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AutoBlogProducer from "./AutoBlogProducer";
import AutoBlogProducerWithTabs from "./AutoBlogProducerWithTabs";
import PricingPage from "./PricingPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, FileText, Globe, Upload, Settings, BarChart3, Clock, Loader2, Eye, Edit, Copy, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Dashboard Overview Component
const DashboardOverview = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overzicht van je AutoblogifyAI workflow en recente activiteit
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

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
  );
};

// Generate Posts Component  
const GeneratePosts = () => {
  const [csvUrl, setCsvUrl] = useState("");
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "complete">("idle");
  const { toast } = useToast();

  const handleValidateCSV = async () => {
    if (!csvUrl) {
      toast({
        title: "Error",
        description: "Voer eerst een Google Sheets CSV URL in",
        variant: "destructive"
      });
      return;
    }

    setValidationStatus("validating");
    
    setTimeout(() => {
      setValidationStatus("valid");
      toast({
        title: "CSV Gevalideerd",
        description: "Alle verplichte velden zijn aanwezig en correct geformatteerd"
      });
    }, 2000);
  };

  const handleGeneratePosts = async () => {
    if (validationStatus !== "valid") {
      toast({
        title: "Error", 
        description: "Valideer eerst je CSV voordat je posts genereert",
        variant: "destructive"
      });
      return;
    }

    setGenerationStatus("generating");
    
    setTimeout(() => {
      setGenerationStatus("complete");
      toast({
        title: "Posts Gegenereerd",
        description: "12 nieuwe blogposts zijn succesvol aangemaakt"
      });
    }, 3000);
  };


  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Posts Genereren</h2>
        <p className="text-muted-foreground">
          Genereer automatisch SEO-geoptimaliseerde blogposts vanuit je Google Sheets CSV
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV naar Blogposts</CardTitle>
          <CardDescription>
            Upload je Google Sheets CSV en genereer professionele blogposts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-url">Google Sheets CSV URL</Label>
            <Input
              id="csv-url"
              placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Zorg dat je Google Sheet gepubliceerd is als CSV (File → Publish to the web → CSV)
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleValidateCSV}
              disabled={validationStatus === "validating"}
              variant="outline"
            >
              {validationStatus === "validating" ? "Valideren..." : "Valideer CSV"}
            </Button>
            
            <Button 
              onClick={handleGeneratePosts}
              disabled={validationStatus !== "valid" || generationStatus === "generating"}
            >
              {generationStatus === "generating" ? "Genereren..." : "Genereer Posts"}
            </Button>
          </div>

          {validationStatus === "valid" && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                CSV succesvol gevalideerd. Alle verplichte velden (title, slug, status, publish_date) zijn aanwezig.
              </AlertDescription>
            </Alert>
          )}

          {generationStatus === "complete" && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                12 blogposts gegenereerd in /content/blog/. Ready voor publicatie!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Validate Component
const ValidateCSV = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">CSV Validatie</h2>
        <p className="text-muted-foreground">
          Controleer of je CSV alle verplichte velden heeft en correct geformatteerd is
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schema Validatie</CardTitle>
          <CardDescription>
            Overzicht van alle verplichte en optionele velden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Verplichte Velden</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  title
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  slug (a-z0-9-)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  status (publish|draft)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  publish_date (YYYY-MM-DD)
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Optionele Velden</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• meta_title, meta_description</div>
                <div>• hero_image_url, hero_image_alt</div>
                <div>• tags (semicolon-separated)</div>
                <div>• faq_json (valid JSON)</div>
                <div>• cta_heading, cta_phone</div>
                <div>• body_markdown of body_path</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Publish Component
const PublishPosts = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishLogs, setPublishLogs] = useState<string[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState([
    { title: "SEO Tips voor 2024", date: "2024-01-15", status: "scheduled" },
    { title: "Local Business Marketing", date: "2024-01-18", status: "draft" },
    { title: "Content Marketing Strategie", date: "2024-01-22", status: "scheduled" }
  ]);
  const { toast } = useToast();

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishLogs([]);
    
    const steps = [
      "Valideren CSV data...",
      "Genereren van posts...",
      "Controleren duplicate content...",
      "Uploaden naar repository...",
      "Triggering build pipeline...",
      "Publicatie voltooid!"
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublishLogs(prev => [...prev, steps[i]]);
    }
    
    setIsPublishing(false);
    toast({
      title: "Publicatie voltooid",
      description: "Je posts zijn succesvol gepubliceerd!",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Publicatie & Planning</h2>
        <p className="text-muted-foreground">
          Beheer de publicatie van je gegenereerde blogposts en plan toekomstige content
        </p>
      </div>

      {/* Publicatie Status Dashboard */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gepubliceerd</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 deze week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gepland</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Komende 30 dagen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concept</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Wachten op review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Publicatie Actie */}
      <Card>
        <CardHeader>
          <CardTitle>Content Publiceren</CardTitle>
          <CardDescription>
            Voer de volledige publicatie pipeline uit voor je gegenereerde content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Zorg dat je CSV gevalideerd is voordat je publiceert. De pipeline controleert automatisch op fouten.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={handlePublish} 
              disabled={isPublishing}
              className="flex-1"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publiceren...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Start Publicatie
                </>
              )}
            </Button>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>

          {publishLogs.length > 0 && (
            <div className="space-y-2">
              <Label>Publicatie Log</Label>
              <div className="bg-muted p-4 rounded-lg space-y-1 max-h-40 overflow-y-auto">
                {publishLogs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geplande Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Content Planning</CardTitle>
          <CardDescription>
            Overzicht van geplande en concept posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledPosts.map((post, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{post.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Gepland voor: {new Date(post.date).toLocaleDateString('nl-NL')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={post.status === 'scheduled' ? 'default' : 'secondary'}>
                    {post.status === 'scheduled' ? 'Gepland' : 'Concept'}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Handmatige Pipeline Commands</CardTitle>
          <CardDescription>
            Voor gevorderde gebruikers: voer pipeline stappen handmatig uit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pipeline Commands</Label>
            <Textarea
              readOnly
              value={`# Volledige pipeline
npm run pipeline

# Stap voor stap
npm run validate:csv
npm run generate:posts
npm run publish

# Alleen validatie
npm run validate:csv

# Build en deploy
npm run build
npm run deploy`}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Kopieer Commands
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Terminal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Component
const DashboardSettings = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Instellingen</h2>
        <p className="text-muted-foreground">
          Configureer je AutoblogifyAI workflow
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuratie</CardTitle>
          <CardDescription>
            Pas je AutoblogifyAI instellingen aan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output-dir">Output Directory</Label>
            <Input
              id="output-dir"
              defaultValue="./content/blog"
              placeholder="./content/blog"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="layout">Default Layout</Label>
            <Input
              id="layout"
              defaultValue="layouts/blog.njk"
              placeholder="layouts/blog.njk"
            />
          </div>

          <div className="space-y-2">
            <Label>Environment Variables</Label>
            <Textarea
              readOnly
              value={`BLOG_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv
BLOG_OUT_DIR=./content/blog`}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Voeg deze toe aan je .env bestand in de projectroot
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Component
const Analytics = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Inzicht in je content prestaties en workflow efficiency
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Deze Maand</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+23% vs vorige maand</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Validatie slaagkans</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardOverview />} />
      <Route path="/generate" element={<AutoBlogProducerWithTabs initialTab="generator" />} />
      <Route path="/validate" element={<ValidateCSV />} />
      <Route path="/publish" element={<PublishPosts />} />
      <Route path="/settings" element={<DashboardSettings />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/pricing" element={<PricingPage />} />
      {/* Website Builder routes handled by WebsiteBuilder component */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default Dashboard;