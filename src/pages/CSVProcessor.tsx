import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Pause,
  FileText,
  Database,
  Loader2,
  Clock,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CSVJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  csv_url: string;
  total_rows: number;
  processed_rows: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
}

const CSVProcessor = () => {
  const { toast } = useToast();
  const [csvUrl, setCsvUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<CSVJob | null>(null);
  const [jobs, setJobs] = useState<CSVJob[]>([]);
  
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    {
      id: "download",
      name: "CSV Downloaden",
      description: "Downloaden en valideren van CSV bestand",
      status: "pending",
      progress: 0
    },
    {
      id: "validate",
      name: "Schema Validatie", 
      description: "Controleren van verplichte kolommen en data types",
      status: "pending",
      progress: 0
    },
    {
      id: "parse",
      name: "Data Parsing",
      description: "Converteren van CSV data naar interne structuur",
      status: "pending",
      progress: 0
    },
    {
      id: "generate",
      name: "Content Generatie",
      description: "AI content generatie voor elke rij",
      status: "pending",
      progress: 0
    },
    {
      id: "store",
      name: "Database Opslag",
      description: "Opslaan van gegenereerde content in database",
      status: "pending",
      progress: 0
    }
  ]);

  const csvSchema = [
    { field: "title", type: "string", required: true, description: "Hoofdtitel van de blogpost" },
    { field: "slug", type: "string", required: true, description: "URL-vriendelijke identifier" },
    { field: "status", type: "enum", required: true, description: "publish, draft, scheduled" },
    { field: "publish_date", type: "date", required: true, description: "YYYY-MM-DD formaat" },
    { field: "summary", type: "string", required: false, description: "Korte samenvatting" },
    { field: "tags", type: "string", required: false, description: "Semicolon-separated tags" },
    { field: "author", type: "string", required: false, description: "Auteur naam" },
    { field: "meta_title", type: "string", required: false, description: "SEO titel" },
    { field: "meta_description", type: "string", required: false, description: "SEO beschrijving" },
    { field: "hero_image_url", type: "string", required: false, description: "Hoofdafbeelding URL" },
    { field: "body_markdown", type: "text", required: false, description: "Markdown content" },
    { field: "faq_json", type: "json", required: false, description: "JSON array van FAQ items" },
    { field: "city", type: "string", required: false, description: "Lokatie voor lokale SEO" }
  ];

  const handleStartProcessing = async () => {
    if (!csvUrl.trim()) {
      toast({
        title: "CSV URL vereist",
        description: "Voer een geldige CSV URL in",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Reset processing steps
      setProcessingSteps(steps => steps.map(step => ({
        ...step,
        status: "pending",
        progress: 0
      })));

      // Simulate processing steps
      for (let i = 0; i < processingSteps.length; i++) {
        setProcessingSteps(steps => steps.map((step, index) => 
          index === i 
            ? { ...step, status: "running" }
            : index < i 
              ? { ...step, status: "completed", progress: 100 }
              : step
        ));

        // Simulate progress for current step
        for (let progress = 0; progress <= 100; progress += 10) {
          setProcessingSteps(steps => steps.map((step, index) => 
            index === i ? { ...step, progress } : step
          ));
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        setProcessingSteps(steps => steps.map((step, index) => 
          index === i ? { ...step, status: "completed", progress: 100 } : step
        ));
      }

      // Create mock job
      const newJob: CSVJob = {
        id: Date.now().toString(),
        status: "completed",
        csv_url: csvUrl,
        total_rows: 47,
        processed_rows: 47,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setCurrentJob(newJob);
      setJobs(prev => [newJob, ...prev]);

      toast({
        title: "CSV Verwerkt! 🎉",
        description: `${newJob.total_rows} rijen succesvol verwerkt`
      });

    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Verwerkingsfout",
        description: "Er is een fout opgetreden tijdens het verwerken van de CSV",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePauseProcessing = () => {
    setIsProcessing(false);
    toast({
      title: "Verwerking Gepauzeerd",
      description: "CSV verwerking is gepauzeerd en kan later worden hervat"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'processing': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            CSV Processor
          </h2>
          <p className="text-muted-foreground">
            Verwerk CSV bestanden naar SEO-geoptimaliseerde blogposts
          </p>
        </div>
      </div>

      <Tabs defaultValue="processor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="processor">CSV Verwerken</TabsTrigger>
          <TabsTrigger value="jobs">Verwerkingshistorie</TabsTrigger>
          <TabsTrigger value="schema">CSV Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="processor" className="space-y-6">
          {/* CSV Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                CSV Bestand Invoer
              </CardTitle>
              <CardDescription>
                Voer de URL van je Google Sheets CSV in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="csv-url">CSV URL</Label>
                  <Input
                    id="csv-url"
                    value={csvUrl}
                    onChange={(e) => setCsvUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={handleStartProcessing}
                    disabled={isProcessing || !csvUrl.trim()}
                    className="min-w-[120px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verwerken...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Verwerking
                      </>
                    )}
                  </Button>
                  {isProcessing && (
                    <Button variant="outline" onClick={handlePauseProcessing}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pauzeren
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Progress */}
          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Verwerkingsvoortgang
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {step.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                        {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {step.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                        <div>
                          <h4 className="font-medium">{step.name}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                        {step.progress}%
                      </Badge>
                    </div>
                    <Progress value={step.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Current Job Results */}
          {currentJob && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Verwerking Voltooid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{currentJob.total_rows}</div>
                    <div className="text-sm text-muted-foreground">Totaal Rijen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{currentJob.processed_rows}</div>
                    <div className="text-sm text-muted-foreground">Verwerkt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">100%</div>
                    <div className="text-sm text-muted-foreground">Succesvol</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resultaten
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Bekijk Gegenereerde Posts
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verwerkingshistorie</CardTitle>
              <CardDescription>
                Overzicht van alle CSV verwerkingsjobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nog geen verwerkingsjobs uitgevoerd</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Card key={job.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(job.status)}
                            <div>
                              <h4 className="font-medium">CSV Verwerking #{job.id}</h4>
                              <p className="text-sm text-muted-foreground">
                                {job.processed_rows}/{job.total_rows} rijen verwerkt
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={getStatusColor(job.status) as any}>
                              {job.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(job.created_at)}
                            </p>
                          </div>
                        </div>
                        {job.error_message && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {job.error_message}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Schema Specificatie</CardTitle>
              <CardDescription>
                Overzicht van alle ondersteunde CSV kolommen en data types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {csvSchema.map((field, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {field.field}
                          </code>
                          <Badge variant={field.required ? "default" : "secondary"}>
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">
                              Verplicht
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {field.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CSVProcessor;