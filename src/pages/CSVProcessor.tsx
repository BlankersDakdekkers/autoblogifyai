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

      {/* Professional Post Viewer Modal */}
      {showPostViewer && selectedPost && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPostViewer(false);
              setSelectedPost(null);
            }
          }}
        >
          {/* Professional Modal Container */}
          <div className="w-full max-w-5xl bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden my-8">
            
            {/* Professional Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50 p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  {/* Article Title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                    {selectedPost.title}
                  </h1>
                  
                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {selectedPost.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">{selectedPost.author}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(selectedPost.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{selectedPost.word_count} woorden</span>
                    </div>
                    
                    <Badge 
                      variant={selectedPost.status === 'published' ? 'default' : 'secondary'}
                      className="px-3 py-1"
                    >
                      {selectedPost.status}
                    </Badge>
                  </div>
                  
                  {/* SEO Meta Description - Professional Layout */}
                  {selectedPost.meta_description && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                            SEO Meta Beschrijving
                          </h4>
                          <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                            {selectedPost.meta_description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Close Button */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowPostViewer(false);
                    setSelectedPost(null);
                  }}
                  className="shrink-0 h-10 w-10 p-0 rounded-full hover:bg-muted/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Professional Content Area */}
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="p-6 md:p-8 space-y-8">
                
                {/* Hero Image - Professional Layout */}
                {selectedPost.hero_image_url && (
                  <div className="relative">
                    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border/50 shadow-lg">
                      <img 
                        src={selectedPost.hero_image_url} 
                        alt={selectedPost.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  </div>
                )}
                
                {/* Professional Article Content */}
                <div className="max-w-none">
                  <div className="prose prose-lg max-w-none
                    prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:pb-2 prose-h1:border-b prose-h1:border-border/30
                    prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-primary
                    prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-primary/80
                    prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4
                    prose-p:text-foreground prose-p:leading-7 prose-p:mb-6 prose-p:text-base
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-em:text-foreground prose-em:italic
                    prose-ul:space-y-2 prose-ul:ml-6 prose-ol:space-y-2 prose-ol:ml-6
                    prose-li:text-foreground prose-li:leading-6
                    prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary/80
                    prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 
                    prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
                    prose-blockquote:text-foreground prose-blockquote:font-medium prose-blockquote:italic
                    prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-md 
                    prose-code:text-sm prose-code:font-mono prose-code:text-foreground
                    prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-auto
                    prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:border-border/50
                    prose-hr:border-border prose-hr:my-8
                    prose-table:border-collapse prose-table:border prose-table:border-border
                    prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:font-semibold
                    prose-td:border prose-td:border-border prose-td:p-3
                  ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedPost.body_markdown || "**Geen content beschikbaar**\n\nDeze blogpost heeft nog geen content."}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {/* Professional Tags Section */}
                {selectedPost.tags.length > 0 && (
                  <div className="border-t border-border/50 pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Tags & Categorieën</h3>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPost.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/10 to-primary/5 
                                   border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 
                                   transition-all duration-200 cursor-pointer"
                        >
                          <span className="mr-1">#</span>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
            
            {/* Professional Footer */}
            <div className="bg-muted/30 border-t border-border/50 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Gegenereerd door AutoblogifyAI • {formatDate(selectedPost.created_at)}
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowPostViewer(false);
                      setSelectedPost(null);
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Sluiten
                  </Button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVProcessor;