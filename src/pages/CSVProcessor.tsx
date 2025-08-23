import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
  Settings,
  Zap,
  Eye,
  Copy,
  AlertTriangle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CSVFileUploader } from "@/components/CSVFileUploader";
import { ProcessingProgress } from "@/components/ProcessingProgress";
import { useCSVProcessor } from "@/hooks/useCSVProcessor";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogPosts } from "@/hooks/useOptimizedQueries";

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

const CSVProcessor = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("processor");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showPostViewer, setShowPostViewer] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [csvUrl, setCsvUrl] = useState("");
  const [urlValidationStatus, setUrlValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  // Use the enhanced CSV processor hook
  const {
    jobs,
    isLoadingJobs,
    progress,
    isProcessingCSV,
    currentJob,
    error: csvError,
    validationResult,
    processCSV,
    cancelProcessing,
    getProgressPercentage,
    getCurrentStep
  } = useCSVProcessor(user?.id || '');

  // Use optimized blog posts query
  const { data: generatedPosts = [], isLoading: isLoadingPosts, refetch: refetchPosts } = useBlogPosts(user?.id || '');

  // Handle processing completion
  const handleProcessingComplete = useCallback((jobId: string) => {
    toast({
      title: "Verwerking Voltooid! 🎉",
      description: "CSV is succesvol verwerkt en blog posts zijn gegenereerd"
    });
    
    // Refresh posts after processing
    setTimeout(() => {
      refetchPosts();
    }, 2000);
  }, [toast, refetchPosts]);

  // CSV schema definition
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

  // Handle CSV processing with the hook
  const handleStartProcessing = async () => {
    if (!csvUrl.trim()) {
      toast({
        title: "CSV URL vereist",
        description: "Voer een geldige CSV URL in",
        variant: "destructive"
      });
      return;
    }

    try {
      await processCSV({ csvUrl });
      toast({
        title: "Verwerking Gestart! 🚀",
        description: "CSV wordt nu verwerkt..."
      });
    } catch (error) {
      console.error("Processing error:", error);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <FileSpreadsheet className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent font-extrabold">
              🚀 CSV Processor Pro
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Verwerk CSV bestanden naar SEO-geoptimaliseerde blogposts met AI content generatie
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} 
            variant="outline" 
            size="sm"
            className="shrink-0"
          >
            <Settings className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Instellingen</span>
          </Button>
          <Button 
            onClick={() => refetchPosts()}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Vernieuwen</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="processor" className="flex-1 sm:flex-initial">
              <Zap className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">CSV Verwerken</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex-1 sm:flex-initial">
              <FileText className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Posts ({generatedPosts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex-1 sm:flex-initial">
              <Database className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Historie ({jobs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex-1 sm:flex-initial">
              <Settings className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Schema</span>
            </TabsTrigger>
          </TabsList>
          {activeTab === 'posts' && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadCSVResults}
                disabled={generatedPosts.length === 0}
                className="flex-1 sm:flex-initial"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchPosts()}
                className="flex-1 sm:flex-initial"
              >
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Vernieuwen</span>
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
                        onChange={(e) => {
                          setCsvUrl(e.target.value);
                          setTimeout(() => validateCsvUrl(e.target.value), 500);
                        }}
                        placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                        disabled={isProcessingCSV}
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
                      disabled={isProcessingCSV}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Test Dataset
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
                    disabled={isProcessingCSV || urlValidationStatus !== 'valid'}
                    className="min-w-[140px]"
                    size="lg"
                  >
                    {isProcessingCSV ? (
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
                  {isProcessingCSV && (
                    <Button variant="outline" onClick={cancelProcessing}>
                      <Pause className="h-4 w-4 mr-2" />
                      Stoppen
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('schema')}
                    disabled={isProcessingCSV}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Bekijk Schema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Progress */}
          {isProcessingCSV && (
            <ProcessingProgress 
              progress={progress}
              currentStep={getCurrentStep()}
              overallProgress={getProgressPercentage()}
              isProcessing={isProcessingCSV}
              onCancel={cancelProcessing}
            />
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
                    onClick={() => setActiveTab('posts')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Bekijk Posts
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {csvError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {csvError}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Gegenereerde Blog Posts
                  </CardTitle>
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
                    className="flex-1 sm:flex-initial"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchPosts()}
                    className="flex-1 sm:flex-initial"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Vernieuwen
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPosts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Posts laden...</span>
                </div>
              ) : generatedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nog geen blog posts</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                    Verwerk eerst een CSV bestand om posts te genereren
                  </p>
                  <Button 
                    onClick={() => setActiveTab('processor')}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    CSV Verwerken
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{generatedPosts.length}</span> posts gevonden
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {generatedPosts.map((post, index) => (
                      <Card 
                        key={post.id} 
                        className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Post Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                <h4 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                                  {post.title}
                                </h4>
                                <div className="flex gap-2 shrink-0">
                                  <Badge 
                                    variant={post.status === 'published' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {post.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              {post.meta_description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                                  {post.meta_description}
                                </p>
                              )}
                              
                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  <span className="font-medium">{post.word_count}</span> woorden
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    {post.author}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDate(post.created_at)}</span>
                                </div>
                              </div>
                              
                              {/* Tags */}
                              {post.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {post.tags.slice(0, 4).map((tag, tagIndex) => (
                                    <Badge 
                                      key={tagIndex} 
                                      variant="outline" 
                                      className="text-xs px-2 py-0.5 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {post.tags.length > 4 && (
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs px-2 py-0.5 bg-muted text-muted-foreground"
                                    >
                                      +{post.tags.length - 4} meer
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex sm:flex-col gap-2 shrink-0">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPost(post);
                                  setShowPostViewer(true);
                                }}
                                className="flex-1 sm:flex-initial gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">Bekijken</span>
                              </Button>
                              {post.hero_image_url && (
                                <div className="hidden sm:block w-16 h-12 rounded overflow-hidden bg-muted">
                                  <img 
                                    src={post.hero_image_url} 
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Load More Button (future enhancement) */}
                  {generatedPosts.length >= 20 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        Meer posts laden
                      </Button>
                    </div>
                  )}
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
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[100] p-2 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPostViewer(false);
              setSelectedPost(null);
            }
          }}
        >
          <Card className="w-full max-w-4xl bg-background border shadow-2xl my-4 sm:my-8">
            <CardHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl leading-tight pr-2 mb-3">
                    {selectedPost.title}
                  </CardTitle>
                  
                  {/* Meta Description - Better positioned */}
                  {selectedPost.meta_description && (
                    <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                        <div>
                          <p className="text-xs font-medium text-primary mb-1">SEO Meta Beschrijving</p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {selectedPost.meta_description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Post Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <Badge 
                      variant={selectedPost.status === 'published' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {selectedPost.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span className="font-medium">{selectedPost.word_count}</span> woorden
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{selectedPost.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(selectedPost.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowPostViewer(false);
                    setSelectedPost(null);
                  }}
                  className="shrink-0 h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6">
              {/* Hero Image */}
              {selectedPost.hero_image_url && (
                <div className="mb-6">
                  <img 
                    src={selectedPost.hero_image_url} 
                    alt={selectedPost.title}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md"
                    loading="lazy"
                  />
                </div>
              )}
              
              {/* Article Content */}
              <div className="prose prose-sm sm:prose-base max-w-none 
                prose-headings:text-foreground prose-headings:font-semibold prose-headings:leading-tight
                prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-foreground prose-strong:font-semibold
                prose-em:text-foreground prose-em:italic
                prose-ul:text-foreground prose-ul:pl-6 prose-ol:text-foreground prose-ol:pl-6
                prose-li:text-foreground prose-li:mb-1
                prose-a:text-primary prose-a:underline prose-a:decoration-primary/30 hover:prose-a:text-primary/80
                prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:pl-4 prose-blockquote:py-2
                prose-blockquote:text-muted-foreground prose-blockquote:italic
                prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-muted prose-pre:border prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-auto
                prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5
                prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedPost.body_markdown || "Geen content beschikbaar"}
                </ReactMarkdown>
              </div>
              
              {/* Tags Section */}
              {selectedPost.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <p className="text-sm font-medium text-primary">Tags</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {selectedPost.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs px-3 py-1 bg-primary/5 text-primary border-primary/30 hover:bg-primary/10 transition-colors"
                      >
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