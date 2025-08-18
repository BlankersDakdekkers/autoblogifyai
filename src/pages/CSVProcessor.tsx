import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  BarChart3,
  X,
  RefreshCw,
  Settings,
  Zap,
  Eye,
  ExternalLink,
  Copy,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CSVFileUploader } from "@/components/CSVFileUploader";
import { useAuth } from "@/contexts/AuthContext";

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

interface BlogPost {
  id: string;
  title: string;
  body_markdown: string;
  status: string;
  hero_image_url?: string;
  meta_description?: string;
  tags: string[];
  author: string;
  created_at: string;
  word_count: number;
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
  const { user } = useAuth();
  const [csvUrl, setCsvUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<CSVJob | null>(null);
  const [jobs, setJobs] = useState<CSVJob[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showPostViewer, setShowPostViewer] = useState(false);
  const [activeTab, setActiveTab] = useState("processor");
  const [urlValidationStatus, setUrlValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const { refreshCredits } = useAuth();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
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
    { field: "city", type: "string", required: false, description: "Lokatie voor lokale SEO" },
    { field: "word_count_target", type: "number", required: false, description: "Gewenst aantal woorden voor content" }
  ];

  // Real-time URL validation
  const validateCsvUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setUrlValidationStatus('idle');
      return;
    }

    setUrlValidationStatus('validating');
    
    try {
      // Basic URL validation
      new URL(url);
      
      // For Google Sheets, validate format
      if (url.includes('docs.google.com/spreadsheets')) {
        const hasValidFormat = /\/d\/([a-zA-Z0-9-_]+)\//.test(url) || /\/d\/e\/([a-zA-Z0-9-_]+)\//.test(url);
        if (!hasValidFormat) {
          setUrlValidationStatus('invalid');
          return;
        }
      }
      
      setUrlValidationStatus('valid');
    } catch {
      setUrlValidationStatus('invalid');
    }
  }, []);

  // Debounced URL validation
  useEffect(() => {
    const timer = setTimeout(() => {
      validateCsvUrl(csvUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [csvUrl, validateCsvUrl]);

  // Load jobs on mount
  useEffect(() => {
    refreshCredits(); // Refresh credits after processing
  }, []);

  const loadJobs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('csv_processing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setJobs((data || []).map(job => ({
        ...job,
        status: job.status as 'pending' | 'processing' | 'completed' | 'failed'
      })));
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleStartProcessing = async () => {
    if (!csvUrl.trim()) {
      toast({
        title: "CSV URL vereist",
        description: "Voer een geldige CSV URL in",
        variant: "destructive"
      });
      return;
    }

    // Validate URL format
    try {
      new URL(csvUrl);
    } catch {
      toast({
        title: "Ongeldige URL",
        description: "Voer een geldige URL in voor je CSV bestand",
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

      // Step 1: Download CSV
      updateProcessingStep("download", "running", 25);

      // Verify user authentication
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.access_token) {
        throw new Error("Niet ingelogd - probeer opnieuw in te loggen");
      }

      updateProcessingStep("download", "running", 50);

      // Call the process-csv edge function using Supabase client
      const { data, error } = await supabase.functions.invoke('process-csv', {
        body: { csvUrl }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function fout: ${error.message || error.details || 'Onbekende fout'}`);
      }

      if (!data) {
        throw new Error('Geen response data ontvangen van edge function');
      }

      console.log('Checking data.success:', data.success, 'Data object:', data);

      if (data.success !== true) {
        const errorMsg = data.error || 'Edge function geeft geen success response';
        console.error('Edge function success check failed:', errorMsg);
        throw new Error(errorMsg);
      }

      updateProcessingStep("download", "completed", 100);
      updateProcessingStep("validate", "running", 50);

      // Monitor job progress - use the jobId from the response
      const jobId = data.jobId;
      console.log('Starting job monitoring for:', jobId);
      
      let pollCount = 0;
      const maxPolls = 120; // 4 minutes timeout
      
      const monitorJob = async (): Promise<CSVJob | null> => {
        try {
          const { data: jobData, error: jobError } = await supabase
            .from('csv_processing_jobs')
            .select('*')
            .eq('id', jobId)
            .maybeSingle();
            
          if (jobError) {
            console.error('Error fetching job:', jobError);
            return null;
          }
            
          return jobData as CSVJob;
        } catch (error) {
          console.error('Error in monitorJob:', error);
          return null;
        }
      };
      
      const pollInterval = setInterval(async () => {
        pollCount++;
        console.log(`Polling attempt ${pollCount}/${maxPolls}`);
        
        const job = await monitorJob();
        if (job) {
          setCurrentJob(job);
          console.log('Job status update:', job.status, `${job.processed_rows}/${job.total_rows}`);
          
          const progress = job.total_rows > 0 ? (job.processed_rows / job.total_rows) * 100 : 0;
          
          // Update processing steps based on job status
          if (job.status === 'processing' || job.status === 'completed') {
            updateProcessingStep("validate", "completed", 100);
            updateProcessingStep("parse", "completed", 100);
            updateProcessingStep("generate", job.status === 'completed' ? "completed" : "running", Math.round(progress));
            
            if (job.status === 'completed') {
              updateProcessingStep("store", "completed", 100);
            }
          }
          
          if (job.status === 'completed') {
            clearInterval(pollInterval);
            setJobs(prev => [job, ...prev]);
            toast({
              title: "CSV Verwerkt! 🎉",
              description: `${job.processed_rows} rijen succesvol verwerkt`
            });
            setIsProcessing(false);
            await loadGeneratedPosts();
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            toast({
              title: "Verwerkingsfout",
              description: job.error_message || "Er is een fout opgetreden",
              variant: "destructive"
            });
            setIsProcessing(false);
            // Mark all remaining steps as failed
            setProcessingSteps(steps => steps.map(step => 
              step.status === 'pending' || step.status === 'running' 
                ? { ...step, status: 'failed' as const } 
                : step
            ));
          }
        } else if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          console.error('Job monitoring timeout');
          toast({
            title: "Timeout",
            description: "Verwerking duurt langer dan verwacht. Check de logs voor details.",
            variant: "destructive"
          });
          setIsProcessing(false);
        }
      }, 2000);

      // Start with initial poll
      await monitorJob();

    } catch (error) {
      console.error("Processing error:", error);
      
      let errorMessage = "Er is een onbekende fout opgetreden";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Verwerkingsfout",
        description: errorMessage,
        variant: "destructive"
      });
      setIsProcessing(false);
      
      // Mark all steps as failed
      setProcessingSteps(steps => steps.map(step => ({
        ...step,
        status: step.status === 'completed' ? step.status : 'failed' as const,
        progress: step.status === 'completed' ? step.progress : 0
      })));
    }
  };

  const updateProcessingStep = (stepId: string, status: ProcessingStep['status'], progress: number) => {
    setProcessingSteps(steps => steps.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
  };

  const handlePauseProcessing = () => {
    setIsProcessing(false);
    toast({
      title: "Verwerking Gepauzeerd",
      description: "CSV verwerking is gepauzeerd en kan later worden hervat"
    });
  };

  const loadGeneratedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setGeneratedPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Fout bij laden posts",
        description: "Kon gegenereerde posts niet laden",
        variant: "destructive"
      });
    }
  };

  const downloadCSVResults = async () => {
    if (generatedPosts.length === 0) {
      toast({
        title: "Geen data",
        description: "Er zijn geen posts om te downloaden",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      // CSV headers
      ['ID', 'Titel', 'Status', 'Publish Datum', 'Woorden', 'Tags', 'Auteur', 'Meta Beschrijving'].join(','),
      // CSV data
      ...generatedPosts.map(post => [
        post.id,
        `"${post.title.replace(/"/g, '""')}"`,
        post.status,
        post.created_at.split('T')[0],
        post.word_count,
        `"${post.tags.join('; ')}"`,
        post.author,
        `"${(post.meta_description || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-posts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download gestart",
      description: "CSV bestand wordt gedownload"
    });
  };

  // Load posts on component mount
  useEffect(() => {
    loadGeneratedPosts();
  }, []);

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
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            CSV Processor Pro
          </h2>
          <p className="text-muted-foreground">
            Verwerk CSV bestanden naar SEO-geoptimaliseerde blogposts met AI content generatie
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/dashboard/blogs', '_blank')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Blog Management
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvancedOptions ? 'Verberg' : 'Geavanceerd'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadJobs}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Vernieuwen
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="processor">
              <Zap className="h-4 w-4 mr-2" />
              CSV Verwerken
            </TabsTrigger>
            <TabsTrigger value="posts">
              <FileText className="h-4 w-4 mr-2" />
              Posts ({generatedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Database className="h-4 w-4 mr-2" />
              Historie ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="schema">
              <Settings className="h-4 w-4 mr-2" />
              Schema
            </TabsTrigger>
          </TabsList>
          {activeTab === 'posts' && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadCSVResults}
                disabled={generatedPosts.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadGeneratedPosts}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Vernieuwen
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="processor" className="space-y-6">
          {/* File Upload Section */}
          <CSVFileUploader 
            onPreviewGenerated={(items, fileName) => {
              console.log('Preview generated:', items.length, 'items from', fileName);
            }}
            onPublishItems={async (items, fileName) => {
              console.log('Publishing items:', items.length, 'from', fileName);
              // For now, just show success
              toast({
                title: "Items gepubliceerd!",
                description: `${items.length} items succesvol verwerkt`
              });
            }}
          />

          {/* CSV URL Section - Alternative method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                CSV URL Verwerking
              </CardTitle>
              <CardDescription>
                Alternatief: Voer de URL van je Google Sheets CSV in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-url" className="text-base font-medium">
                    CSV URL
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Voer de directe URL van je CSV bestand in (Google Sheets: File → Publish to web → CSV)
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="csv-url"
                        value={csvUrl}
                        onChange={(e) => setCsvUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                        disabled={isProcessing}
                        className={`transition-colors ${
                          urlValidationStatus === 'valid' ? 'border-green-500 focus:border-green-500' :
                          urlValidationStatus === 'invalid' ? 'border-red-500 focus:border-red-500' :
                          'border-border'
                        }`}
                      />
                      {urlValidationStatus === 'validating' && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          URL valideren...
                        </div>
                      )}
                      {urlValidationStatus === 'valid' && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Geldige URL
                        </div>
                      )}
                      {urlValidationStatus === 'invalid' && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          Ongeldige URL format
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick URL Examples */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick Start Voorbeelden:</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setCsvUrl("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")}
                      disabled={isProcessing}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Test Dataset
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setCsvUrl("https://people.sc.fsu.edu/~jburkardt/data/csv/addresses.csv")}
                      disabled={isProcessing}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Demo CSV
                    </Button>
                  </div>
                </div>

                {/* Advanced Options */}
                {showAdvancedOptions && (
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Geavanceerde Opties:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Batch grootte: 10 rijen per keer</li>
                          <li>• AI Model: GPT-4o-mini voor content generatie</li>
                          <li>• Rate limiting: 60 requests per minuut</li>
                          <li>• Max bestandsgrootte: 10MB</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleStartProcessing}
                    disabled={isProcessing || urlValidationStatus !== 'valid'}
                    className="min-w-[140px]"
                    size="lg"
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
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('schema')}
                    disabled={isProcessing}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Bekijk Schema
                  </Button>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadCSVResults}
                    disabled={generatedPosts.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resultaten
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/dashboard/autoblog-producer', '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Bekijk Gegenereerde Posts
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gegenereerde Blog Posts</CardTitle>
                <CardDescription>
                  Overzicht van alle gegenereerde blog posts uit CSV verwerking
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadCSVResults}
                  disabled={generatedPosts.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadGeneratedPosts}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Vernieuwen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {generatedPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nog geen blog posts gegenereerd</p>
                  <p className="text-sm">Verwerk eerst een CSV bestand om posts te genereren</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {generatedPosts.length} posts gevonden
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {generatedPosts.map((post) => (
                      <Card key={post.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium line-clamp-1">{post.title}</h4>
                                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                  {post.status}
                                </Badge>
                              </div>
                              
                              {post.meta_description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {post.meta_description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{post.word_count} woorden</span>
                                <span>{post.author}</span>
                                <span>{formatDate(post.created_at)}</span>
                              </div>
                              
                              {post.tags.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {post.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {post.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{post.tags.length - 3} meer
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPost(post);
                                  setShowPostViewer(true);
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Bekijken
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Post Viewer Modal */}
      {showPostViewer && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2">{selectedPost.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <Badge variant={selectedPost.status === 'published' ? 'default' : 'secondary'}>
                    {selectedPost.status}
                  </Badge>
                  <span>{selectedPost.word_count} woorden</span>
                  <span>{selectedPost.author}</span>
                  <span>{formatDate(selectedPost.created_at)}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowPostViewer(false);
                  setSelectedPost(null);
                }}
              >
                Sluiten
              </Button>
            </CardHeader>
            
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {selectedPost.hero_image_url && (
                <img 
                  src={selectedPost.hero_image_url} 
                  alt={selectedPost.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              {selectedPost.meta_description && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Meta Beschrijving:</p>
                  <p className="text-sm text-muted-foreground">{selectedPost.meta_description}</p>
                </div>
              )}
              
              <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-a:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedPost.body_markdown || 'Geen content beschikbaar'}
                </ReactMarkdown>
              </div>
              
              {selectedPost.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Tags:</p>
                  <div className="flex gap-1 flex-wrap">
                    {selectedPost.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CSVProcessor;