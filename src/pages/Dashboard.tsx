import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, FileText, Globe, Upload, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
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
    
    // Simuleer validatie
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
    
    // Simuleer generatie
    setTimeout(() => {
      setGenerationStatus("complete");
      toast({
        title: "Posts Gegenereerd",
        description: "12 nieuwe blogposts zijn succesvol aangemaakt"
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">AutoblogifyAI</h1>
              <p className="text-muted-foreground">CSV naar SEO-geoptimaliseerde blogposts</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Dashboard
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Genereren
            </TabsTrigger>
            <TabsTrigger value="validate" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Valideren
            </TabsTrigger>
            <TabsTrigger value="publish" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Publiceren
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Instellingen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CSV naar Blogposts</CardTitle>
                <CardDescription>
                  Genereer automatisch SEO-geoptimaliseerde blogposts vanuit je Google Sheets CSV
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

            <Card>
              <CardHeader>
                <CardTitle>Laatste Generaties</CardTitle>
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
          </TabsContent>

          <TabsContent value="validate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CSV Validatie</CardTitle>
                <CardDescription>
                  Controleer of je CSV alle verplichte velden heeft en correct geformatteerd is
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
          </TabsContent>

          <TabsContent value="publish" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publicatie & Planning</CardTitle>
                <CardDescription>
                  Beheer de publicatie van je gegenereerde blogposts
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
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AutoblogifyAI Instellingen</CardTitle>
                <CardDescription>
                  Configureer je AutoblogifyAI workflow
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;