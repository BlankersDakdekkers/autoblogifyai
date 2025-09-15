import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import BackendStatus from "@/components/BackendStatus";
import ContentPlanner from "@/components/ContentPlanner";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileSpreadsheet, Upload, Download, CheckCircle, AlertCircle, Play, Pause, 
  FileText, Database, Loader2, Clock, BarChart3, RefreshCw, Settings, 
  Zap, Eye, Copy, AlertTriangle, X, List, ChevronRight, TrendingUp,
  Target, Brain, Sparkles, Globe, Calendar, Users, Activity
} from "lucide-react";

interface ProcessingJob {
  id: string;
  status: 'processing' | 'completed' | 'failed' | 'pending';
  progress: number;
  created_at: string;
  csv_url: string;
  total_rows?: number;
  processed_rows?: number;
  generated_posts?: number;
  errors?: string[];
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
  slug: string;
  publish_date: string;
}

const ProductionCSVProcessor = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState("processor");
  const [csvUrl, setCsvUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [urlValidationStatus, setUrlValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [batchSize, setBatchSize] = useState(10);
  const [aiModel, setAiModel] = useState('gpt-4o-mini');

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalProcessed: 0,
    successRate: 0,
    avgProcessingTime: 0,
    postsThisMonth: 0
  });

  // Load data on mount
  useEffect(() => {
    loadBlogPosts();
    loadProcessingJobs();
    loadAnalytics();
  }, [user?.id]);

  // Real-time updates for processing jobs
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('csv_processing_jobs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'csv_processing_jobs', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const job = payload.new as ProcessingJob;
            setJobs(prev => {
              const existing = prev.find(j => j.id === job.id);
              if (existing) {
                return prev.map(j => j.id === job.id ? job : j);
              }
              return [job, ...prev];
            });
            
            if (job.status === 'processing') {
              setCurrentJob(job);
              setIsProcessing(true);
            } else if (job.status === 'completed' || job.status === 'failed') {
              setIsProcessing(false);
              setCurrentJob(null);
              if (job.status === 'completed') {
                loadBlogPosts(); // Refresh posts after completion
                toast({
                  title: "Verwerking Voltooid! 🎉",  
                  description: `${job.generated_posts || 0} blogposts succesvol gegenereerd`
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  // Fallback polling while processing (in case Realtime events are delayed)
  useEffect(() => {
    if (!isProcessing || !currentJob?.id) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('csv_processing_jobs')
          .select('*')
          .eq('id', currentJob.id)
          .maybeSingle();
        if (error || !data || cancelled) return;
        const job = data as any;
        setCurrentJob(prev => ({
          ...(prev || job),
          ...job,
          progress: job.processed_rows && job.total_rows ? (job.processed_rows / job.total_rows) * 100 : 0,
          csv_url: job.csv_url || ''
        }));
        setJobs(prev => {
          const exists = prev.some(j => j.id === job.id);
          const mapped = {
            ...(exists ? prev.find(j => j.id === job.id)! : {}),
            ...job,
            progress: job.processed_rows && job.total_rows ? (job.processed_rows / job.total_rows) * 100 : 0,
            csv_url: job.csv_url || ''
          } as ProcessingJob;
          return exists ? prev.map(j => j.id === job.id ? mapped : j) : [mapped, ...prev];
        });
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval);
          setIsProcessing(false);
          if (job.status === 'completed') {
            loadBlogPosts();
          }
        }
      } catch {}
    }, 2000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isProcessing, currentJob?.id]);

  const loadBlogPosts = async () => {
    if (!user?.id) return;
    
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      toast({
        title: "Fout bij laden posts",
        description: "Kon blogposts niet laden",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadProcessingJobs = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('csv_processing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setJobs((data || []).map((job: any) => ({
        ...job,
        progress: job.processed_rows && job.total_rows ? (job.processed_rows / job.total_rows) * 100 : 0,
        csv_url: job.csv_url || ''
      })));
      
      // Check for active job  
      const activeJob = data?.find((job: any) => job.status === 'processing');
      if (activeJob) {
        setCurrentJob({
          ...activeJob,
          progress: activeJob.processed_rows && activeJob.total_rows ? (activeJob.processed_rows / activeJob.total_rows) * 100 : 0,
          csv_url: activeJob.csv_url || '',
          status: activeJob.status as "processing" | "completed" | "failed" | "pending"
        });
        setIsProcessing(true);
      }
    } catch (error) {
      console.error('Error loading processing jobs:', error);
    }
  };

  const loadAnalytics = async () => {
    if (!user?.id) return;
    
    try {
      // Get analytics data
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('created_at, word_count')
        .eq('user_id', user.id);
      
      const { data: jobsData } = await supabase
        .from('csv_processing_jobs')
        .select('status, created_at')
        .eq('user_id', user.id);
      
      if (posts && jobsData) {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        
        const postsThisMonth = posts.filter(post => 
          new Date(post.created_at) >= currentMonth
        ).length;
        
        const completedJobs = jobsData.filter(job => job.status === 'completed').length;
        const totalJobs = jobsData.length;
        const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
        
        setAnalytics({
          totalProcessed: posts.length,
          successRate: Math.round(successRate),
          avgProcessingTime: 2.3, // Mock data - would calculate from job times
          postsThisMonth
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const validateCsvUrl = useCallback(async (url: string) => {
    const raw = url.trim();
    if (!raw) {
      setUrlValidationStatus('idle');
      return;
    }

    setUrlValidationStatus('validating');

    try {
      // Support relative paths like "/test-blog-data.csv"
      const parsed = new URL(raw, window.location.origin);
      const normalized = parsed.toString();

      // Accept any direct CSV link
      if (normalized.toLowerCase().endsWith('.csv')) {
        setUrlValidationStatus('valid');
        return;
      }

      // Google Sheets: accept export and published CSV formats
      if (normalized.includes('docs.google.com/spreadsheets')) {
        const isExport = /\/export\?([^#]*?)format=csv/i.test(normalized);
        const isPublished = /\/pub\?([^#]*?)output=csv/i.test(normalized);
        const hasDocId = /\/d\/([a-zA-Z0-9-_]+)\//.test(normalized);
        if (isExport || isPublished || hasDocId) {
          setUrlValidationStatus('valid');
          return;
        }
        setUrlValidationStatus('invalid');
        return;
      }

      // Fallback: accept any http(s) URL
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        setUrlValidationStatus('valid');
        return;
      }

      setUrlValidationStatus('invalid');
    } catch {
      setUrlValidationStatus('invalid');
    }
  }, []);

  const handleStartProcessing = async () => {
    if (!csvUrl.trim() || urlValidationStatus !== 'valid') {
      toast({
        title: "Ongeldige CSV URL",
        description: "Voer een geldige CSV URL in",
        variant: "destructive"
      });
      return;
    }

    try {
      // Normaliseer naar absolute http(s) URL (ondersteunt ook relatieve paden)
      const normalizedCsvUrl = new URL(csvUrl.trim(), window.location.origin).toString();

      const { data, error } = await supabase.functions.invoke('process-csv', {
        body: { 
          csvUrl: normalizedCsvUrl, 
          batchSize, 
          aiModel,
          userId: user?.id 
        }
      });

      if (error) throw error;

      setIsProcessing(true);
      toast({
        title: "Verwerking Gestart! 🚀",
        description: "CSV wordt verwerkt, je ontvangt updates in real-time"
      });

      // Direct verversen (niet alleen vertrouwen op Realtime)
      await Promise.all([loadProcessingJobs(), loadBlogPosts()]);

      // Clear de URL en ga naar de Posts tab om output te tonen
      setCsvUrl("");
      setUrlValidationStatus('idle');
      setActiveTab('posts');

    } catch (error: any) {
      console.error("Processing error:", error);

      // Probeer de laatste job-fout op te halen voor detailfeedback
      try {
        if (user?.id) {
          const { data: lastJob } = await supabase
            .from('csv_processing_jobs')
            .select('id,status,error_message,created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const detailedMsg = lastJob?.error_message || (error?.context?.body ? (() => { try { const b = JSON.parse(error.context.body); return b.error || b.message; } catch { return null; } })() : null);

          toast({
            title: "Fout bij verwerking",
            description: detailedMsg || "Er is een fout opgetreden bij het starten van de verwerking",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Fout bij verwerking",
            description: "Er is een fout opgetreden bij het starten van de verwerking",
            variant: "destructive"
          });
        }
      } catch (e) {
        toast({
          title: "Fout bij verwerking",
          description: "Er is een fout opgetreden bij het starten van de verwerking",
          variant: "destructive"
        });
      }
    }
  };

  const cancelProcessing = async () => {
    if (!currentJob?.id) return;
    
    try {
      const { error } = await supabase
        .from('csv_processing_jobs')
        .update({ status: 'failed' })
        .eq('id', currentJob.id);
      
      if (error) throw error;
      
      setIsProcessing(false);
      setCurrentJob(null);
      
      toast({
        title: "Verwerking Geannuleerd",
        description: "De CSV verwerking is gestopt"
      });
    } catch (error) {
      console.error('Error cancelling processing:', error);
    }
  };

  const downloadResults = () => {
    if (blogPosts.length === 0) {
      toast({
        title: "Geen data beschikbaar",
        description: "Er zijn geen posts om te exporteren",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['ID', 'Titel', 'Slug', 'Status', 'Datum', 'Woorden', 'Tags'].join(','),
      ...blogPosts.map(post => [
        post.id,
        `"${post.title.replace(/"/g, '""')}"`,
        post.slug,
        post.status,
        post.publish_date,
        post.word_count,
        `"${post.tags.join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoblogify-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Gestart",
      description: "CSV bestand wordt gedownload"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // CSV Schema voor referentie
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
    { field: "word_count_target", type: "number", required: false, description: "Gewenst aantal woorden" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 shadow-lg">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CSV Processor Pro
                </h1>
                <p className="text-muted-foreground mt-1">
                  Enterprise-grade CSV verwerking naar SEO-geoptimaliseerde blogposts
                </p>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} 
              variant="outline"
              className="bg-white/50 backdrop-blur-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Instellingen
            </Button>
            <Button 
              onClick={loadBlogPosts}
              variant="outline"
              className="bg-white/50 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Vernieuwen
            </Button>
            {blogPosts.length > 0 && (
              <Button 
                onClick={downloadResults}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            )}
          </div>
        </div>

        {/* Credits & Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CreditsDisplay />
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Totaal Verwerkt</p>
                    <p className="text-3xl font-bold text-blue-900">{analytics.totalProcessed}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600 mt-2">+{analytics.postsThisMonth} deze maand</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Succes Ratio</p>
                    <p className="text-3xl font-bold text-green-900">{analytics.successRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-green-600 mt-2">Gemiddeld succes percentage</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Avg. Tijd</p>
                    <p className="text-3xl font-bold text-purple-900">{analytics.avgProcessingTime}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-purple-600 mt-2">Per CSV bestand</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Cards - vervangen door nieuwe sectie hierboven */}

        {/* Processing Status */}
        {isProcessing && currentJob && (
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Verwerking Actief</h3>
                    <p className="text-sm text-blue-600">
                      {currentJob.total_rows && currentJob.total_rows > 0
                        ? `${currentJob.processed_rows || 0} van ${currentJob.total_rows} rijen verwerkt`
                        : 'Initialiseren... CSV analyseren'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={cancelProcessing}
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Annuleren
                </Button>
              </div>
              <Progress value={currentJob.progress || 0} className="mb-2" />
              <p className="text-xs text-blue-600">{currentJob.progress || 0}% voltooid</p>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="processor" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Processor</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Posts ({blogPosts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Historie ({jobs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Schema</span>
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Planner</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
          </TabsList>

          {/* CSV Processor Tab */}
          <TabsContent value="processor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  CSV URL Verwerking
                </CardTitle>
                <CardDescription>
                  Voer de URL van je Google Sheets CSV in voor automatische verwerking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csv-url" className="text-base font-medium">
                      CSV URL
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Google Sheets: File → Publish to web → CSV format
                    </p>
                    <Input
                      id="csv-url"
                      value={csvUrl}
                      onChange={(e) => {
                        setCsvUrl(e.target.value);
                        setTimeout(() => validateCsvUrl(e.target.value), 500);
                      }}
                      placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                      disabled={isProcessing}
                      className={`transition-all duration-200 ${
                        urlValidationStatus === 'valid' ? 'border-green-500 bg-green-50/50' :
                        urlValidationStatus === 'invalid' ? 'border-red-500 bg-red-50/50' :
                        'border-border'
                      }`}
                    />
                    
                    {/* Validation feedback */}
                    {urlValidationStatus === 'validating' && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        URL valideren...
                      </div>
                    )}
                    {urlValidationStatus === 'valid' && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Geldige CSV URL
                      </div>
                    )}
                    {urlValidationStatus === 'invalid' && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        Ongeldige URL format
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Options */}
                {showAdvancedOptions && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-4">
                        <p className="font-medium">Geavanceerde Configuratie:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="batch-size">Batch Grootte</Label>
                            <Input
                              id="batch-size"
                              type="number"
                              value={batchSize}
                              onChange={(e) => setBatchSize(Number(e.target.value))}
                              min="5"
                              max="50"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="ai-model">AI Model</Label>
                            <select
                              id="ai-model"
                              value={aiModel}
                              onChange={(e) => setAiModel(e.target.value)}
                              className="w-full mt-1 p-2 border rounded-md"
                            >
                              <option value="gpt-4o-mini">GPT-4o Mini (Snel)</option>
                              <option value="gpt-4o">GPT-4o (Premium)</option>
                            </select>
                          </div>
                        </div>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Rate limiting: 60 requests per minuut</li>
                          <li>• Max bestandsgrootte: 50MB</li>
                          <li>• Ondersteunde formaten: CSV, TSV</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Button */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleStartProcessing}
                    disabled={isProcessing || urlValidationStatus !== 'valid'}
                    className="min-w-[180px] bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
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
                    <Button
                      onClick={cancelProcessing}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {isLoadingPosts ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <span>Blogposts laden...</span>
                </CardContent>
              </Card>
            ) : blogPosts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg mb-2">Nog geen blogposts</h3>
                  <p className="text-muted-foreground mb-4">
                    Verwerk je eerste CSV bestand om blogposts te genereren
                  </p>
                  <Button 
                    onClick={() => setActiveTab("processor")}
                    className="bg-gradient-to-r from-primary to-blue-600"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start CSV Verwerking
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                              {post.title}
                            </h3>
                            <Badge variant={post.status === 'publish' ? 'default' : 'secondary'} className="ml-3">
                              {post.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(post.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {post.word_count} woorden
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {post.author}
                            </span>
                          </div>

                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
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

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPost(post)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Bekijken
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(post.slug);
                              toast({
                                title: "Slug gekopieerd",
                                description: "Post slug staat nu in je clipboard"
                              });
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Slug
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Processing Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            {jobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Database className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg mb-2">Geen verwerkingshistorie</h3>
                  <p className="text-muted-foreground">
                    Je verwerkingsjobs verschijnen hier zodra je begint
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(job.status)}
                          <div>
                            <p className="font-medium">
                              CSV Verwerking #{job.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(job.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {job.status === 'processing' && (
                            <div className="text-sm">
                              <Progress value={job.progress || 0} className="w-24 mb-1" />
                              <span className="text-xs text-muted-foreground">
                                {job.progress || 0}%
                              </span>
                            </div>
                          )}
                          
                          <Badge variant={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          
                          {job.status === 'completed' && (
                            <div className="text-sm text-muted-foreground">
                              {job.generated_posts || 0} posts
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {job.errors && job.errors.length > 0 && (
                        <Alert className="mt-4 border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <details>
                              <summary className="cursor-pointer font-medium">
                                {job.errors.length} error(s) opgetreden
                              </summary>
                              <ul className="mt-2 space-y-1 text-sm">
                                {job.errors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </details>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CSV Schema Tab */}
          <TabsContent value="schema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  CSV Schema Referentie
                </CardTitle>
                <CardDescription>
                  Ondersteunde kolommen en data formaten voor optimale resultaten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {csvSchema.map((field, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {field.field}
                            </code>
                            <Badge variant={field.required ? 'default' : 'secondary'}>
                              {field.required ? 'Verplicht' : 'Optioneel'}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {field.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {field.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* CSV Example */}
            <Card>
              <CardHeader>
                <CardTitle>Voorbeeld CSV Structuur</CardTitle>
                <CardDescription>
                  Download dit voorbeeldbestand om te beginnen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div>title,slug,status,publish_date,tags,author</div>
                  <div>"Dakisolatie Tips","dakisolatie-tips","draft","2024-01-15","dak;isolatie","AutoblogifyAI"</div>
                  <div>"SEO Strategie","seo-strategie","publish","2024-01-16","seo;marketing","Content Team"</div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    const csvExample = `title,slug,status,publish_date,tags,author,word_count_target
"Dakisolatie Tips voor Nederlandse Huizen","dakisolatie-tips-nederlandse-huizen","draft","2024-01-15","dak;isolatie;energie","AutoblogifyAI",800
"Complete SEO Strategie 2024","complete-seo-strategie-2024","publish","2024-01-16","seo;marketing;strategie","Content Team",1200
"WordPress Snelheid Optimaliseren","wordpress-snelheid-optimaliseren","scheduled","2024-01-17","wordpress;performance;snelheid","Tech Writer",1000`;
                    
                    const blob = new Blob([csvExample], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'autoblogify-example.csv';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Voorbeeld CSV Gedownload",
                      description: "Gebruik dit bestand als template"
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Voorbeeld
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Content Planning & Scheduling
                </CardTitle>
                <CardDescription>
                  Plan en organiseer al je content strategisch vanuit je CSV verwerking
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ContentPlanner />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backend Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Backend System Status
                </CardTitle>
                <CardDescription>
                  Real-time monitoring van alle backend services en functionaliteit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BackendStatus />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductionCSVProcessor;