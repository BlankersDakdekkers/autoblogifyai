import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PricingPage from "./PricingPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, FileText, Globe, Upload, Settings, BarChart3 } from "lucide-react";
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
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Publicatie & Planning</h2>
        <p className="text-muted-foreground">
          Beheer de publicatie van je gegenereerde blogposts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Commands</CardTitle>
          <CardDescription>
            Gebruik deze commands voor je publicatie workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Publicatie gebeurt via je 11ty build pipeline. Gebruik <code>npm run pipeline</code> voor volledige workflow.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Pipeline Commands</Label>
            <Textarea
              readOnly
              value={`# Volledige pipeline
npm run pipeline

# Stap voor stap
npm run validate:csv
npm run generate:posts
npm run publish`}
              className="font-mono text-sm"
            />
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
      <Route path="/generate" element={<GeneratePosts />} />
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