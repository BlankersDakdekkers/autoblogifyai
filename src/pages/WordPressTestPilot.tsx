import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Globe, 
  Upload, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  FileText,
  Loader2,
  ArrowRight,
  Play,
  Download,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WordPressSetupWizard from "@/components/WordPressSetupWizard";

interface WordPressConfig {
  siteUrl: string;
  username: string;
  appPassword: string;
}

interface TestPost {
  title: string;
  targetKeyword: string;
  city: string;
}

const WordPressTestPilot = () => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [wordpressConfig, setWordpressConfig] = useState<WordPressConfig | null>(null);
  const [csvUrl, setCsvUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<any[]>([]);
  const [testPosts] = useState<TestPost[]>([
    {
      title: "Complete SEO Gids voor Lokale Bedrijven in Amsterdam",
      targetKeyword: "SEO Amsterdam",
      city: "Amsterdam"
    },
    {
      title: "WordPress Website Laten Maken in Rotterdam - Tips & Kosten",
      targetKeyword: "WordPress Rotterdam",
      city: "Rotterdam"
    },
    {
      title: "Online Marketing Strategie voor Utrecht Bedrijven 2025",
      targetKeyword: "online marketing Utrecht",
      city: "Utrecht"
    }
  ]);
  const [selectedTestPost, setSelectedTestPost] = useState<TestPost | null>(null);
  const { toast } = useToast();

  const phases = [
    { title: "WordPress Koppeling", description: "Verbind je WordPress site" },
    { title: "Content Generator Test", description: "Test de AI content generator" },
    { title: "CSV Upload Test", description: "Test bulk content generatie" },
    { title: "Publicatie Test", description: "Publiceer naar WordPress" },
    { title: "Resultaten", description: "Bekijk testresultaten" }
  ];

  const progress = (currentPhase / phases.length) * 100;

  // Reset function to start over
  const resetTestPilot = () => {
    // Clear localStorage
    localStorage.removeItem('wordpress-config');
    
    // Reset all state
    setCurrentPhase(1);
    setWordpressConfig(null);
    setCsvUrl("");
    setIsProcessing(false);
    setProcessingStep("");
    setGeneratedPosts([]);
    setPublishedPosts([]);
    setSelectedTestPost(null);
    
    toast({
      title: "TestPilot gereset",
      description: "Je kunt nu opnieuw beginnen met de juiste gegevens",
    });
  };

  // Load saved WordPress config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('wordpress-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setWordpressConfig(config);
        if (config.siteUrl && config.username && config.appPassword) {
          // Skip to phase 2 if config is complete
          setCurrentPhase(2);
        }
      } catch (error) {
        console.error('Failed to load saved WordPress config:', error);
      }
    }
  }, []);

  const handleWordPressSetup = (config: WordPressConfig) => {
    // Save config to localStorage
    localStorage.setItem('wordpress-config', JSON.stringify(config));
    setWordpressConfig(config);
    setCurrentPhase(2);
    toast({
      title: "WordPress gekoppeld!",
      description: "Je WordPress site is succesvol verbonden",
    });
  };

  const generateTestContent = async (testPost: TestPost) => {
    setIsProcessing(true);
    setProcessingStep("Content genereren...");
    
    try {
      console.log('Starting content generation for:', testPost);
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          title: testPost.title,
          targetKeyword: testPost.targetKeyword,
          city: testPost.city,
          contentType: 'blog',
          wordCount: 1200,
          language: 'nl',
          includeImages: true,
          includeFaq: true,
          includeCta: true,
          useNeuromarketing: true
        }
      });

      console.log('API Response:', { data, error });

      if (error) {
        console.error('API Error:', error);
        throw error;
      }

      if (!data) {
        console.error('No data received from API');
        throw new Error('Geen data ontvangen van de API');
      }

      console.log('Generated content:', data);
      
      // Check if data has the expected structure
      if (data.success && data.post) {
        console.log('Setting generated post:', data.post);
        setGeneratedPosts([data.post]);
        setCurrentPhase(3);
      } else if (data.id) {
        // Direct post data
        console.log('Setting generated post (direct):', data);
        setGeneratedPosts([data]);
        setCurrentPhase(3);  
      } else {
        console.error('Unexpected data structure:', data);
        throw new Error('Onverwachte data structuur ontvangen');
      }
      
      toast({
        title: "Content gegenereerd!",
        description: "Test artikel is succesvol aangemaakt",
      });
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Fout bij content generatie",
        description: error.message || 'Onbekende fout opgetreden',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const processCSVTest = async () => {
    if (!csvUrl.trim()) {
      toast({
        title: "CSV URL vereist",
        description: "Voer een geldige CSV URL in",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep("CSV verwerken...");
    
    try {
      console.log('Calling process-csv with URL:', csvUrl.trim());
      
      const { data, error } = await supabase.functions.invoke('process-csv', {
        body: {
          csvUrl: csvUrl.trim(),
          options: {
            wordCount: 1200,
            includeImages: true,
            includeFaq: true
          }
        }
      });

      console.log('Process-csv response:', { data, error });

      if (error) {
        console.error('Process-csv error:', error);
        throw new Error(error.message || 'Edge function error');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'CSV verwerking gefaald');
      }

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkStatus = async () => {
        const { data: job } = await supabase
          .from('csv_processing_jobs')
          .select('*')
          .eq('id', data.jobId)
          .single();
          
        if (job?.status === 'completed') {
          // Get generated posts
          const { data: posts } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
            .order('created_at', { ascending: false })
            .limit(10);
            
          setGeneratedPosts(posts || []);
          setCurrentPhase(4);
          setProcessingStep("");
          setIsProcessing(false);
          
          toast({
            title: "CSV verwerkt!",
            description: `${posts?.length || 0} artikelen gegenereerd`,
          });
        } else if (job?.status === 'failed') {
          throw new Error(job.error_message || 'CSV verwerking mislukt');
        } else if (attempts < maxAttempts) {
          attempts++;
          setProcessingStep(`CSV verwerken... (${job?.processed_rows || 0}/${job?.total_rows || '?'} rijen)`);
          setTimeout(checkStatus, 2000);
        } else {
          throw new Error('CSV verwerking time-out');
        }
      };
      
      setTimeout(checkStatus, 2000);
      
    } catch (error: any) {
      toast({
        title: "Fout bij CSV verwerking",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const publishToWordPress = async (postId: string) => {
    console.log('publishToWordPress called with postId:', postId);
    console.log('wordpressConfig:', wordpressConfig);

    if (!wordpressConfig) {
      toast({
        title: "WordPress configuratie ontbreekt",
        description: "Configureer eerst je WordPress verbinding",
        variant: "destructive",
      });
      return;
    }

    if (!postId) {
      toast({
        title: "Post ID ontbreekt",
        description: "Geen geldig artikel om te publiceren",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Publiceren naar WordPress...");
    
    try {
      console.log('Making API call with:', { postId, wordpressConfig });
      
      const { data, error } = await supabase.functions.invoke('wordpress-publish', {
        body: {
          postId: postId,
          wordpressConfig: wordpressConfig
        }
      });

      console.log('API Response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        setPublishedPosts(prev => [...prev, { postId, url: data.url }]);
        toast({
          title: "Gepubliceerd!",
          description: "Artikel is succesvol gepubliceerd naar WordPress",
        });
      } else {
        console.error('Publish failed:', data);
        throw new Error(data?.error || 'Publicatie mislukt');
      }
    } catch (error: any) {
      console.error('WordPress publish error:', error);
      toast({
        title: "Publicatie mislukt",
        description: error.message || 'Onbekende fout bij publicatie',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const generateSampleCSV = () => {
    const csvContent = `title,targetKeyword,city,status,summary
"SEO Tips voor Lokale Bedrijven","SEO tips","Amsterdam","draft","Complete gids voor lokale SEO optimalisatie"
"WordPress Website Onderhoud","WordPress onderhoud","Rotterdam","draft","Alles over WordPress website onderhoud en beveiliging"
"Online Marketing Trends 2025","online marketing trends","Utrecht","draft","De belangrijkste online marketing trends voor dit jaar"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-blog-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Sample CSV gedownload",
      description: "Upload dit bestand naar Google Sheets en deel de CSV link",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3 relative">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Play className="h-8 w-8 text-primary" />
            WordPress Testpilot
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTestPilot}
            className="absolute right-0 flex items-center gap-2"
            disabled={isProcessing}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
        <p className="text-muted-foreground text-lg">
          Test de volledige AutoblogifyAI workflow met je WordPress site
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Phase {currentPhase} van {phases.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {phases[currentPhase - 1].title} - {phases[currentPhase - 1].description}
          </p>
        </CardContent>
      </Card>

      {/* Phase 1: WordPress Setup */}
      {currentPhase === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              WordPress Koppeling
            </CardTitle>
            <CardDescription>
              Verbind je WordPress site om de testpilot te starten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WordPressSetupWizard onComplete={handleWordPressSetup} />
          </CardContent>
        </Card>
      )}

      {/* Phase 2: Content Generator Test */}
      {currentPhase === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Content Generator Test
            </CardTitle>
            <CardDescription>
              Test de AI content generator met een voorbeeldartikel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Kies een testartikel om te genereren. Dit kost 1 credit.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-3">
              {testPosts.map((post, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTestPost === post 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTestPost(post)}
                >
                  <h4 className="font-medium">{post.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Keyword: {post.targetKeyword} • Locatie: {post.city}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => selectedTestPost && generateTestContent(selectedTestPost)}
                disabled={!selectedTestPost || isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {isProcessing ? processingStep : 'Genereer Test Artikel'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setCurrentPhase(3)}
              >
                Overslaan naar CSV Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 3: CSV Test */}
      {currentPhase === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSV Upload Test
            </CardTitle>
            <CardDescription>
              Test bulk content generatie met een CSV bestand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Upload een CSV naar Google Sheets en deel de CSV export link, of gebruik onze sample CSV.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="csv-url">Google Sheets CSV URL</Label>
              <Input
                id="csv-url"
                value={csvUrl}
                onChange={(e) => setCsvUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={processCSVTest}
                disabled={isProcessing || !csvUrl.trim()}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isProcessing ? processingStep : 'Verwerk CSV'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={generateSampleCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Sample CSV
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setCurrentPhase(4)}
              >
                Overslaan naar Publicatie
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 4: Publishing Test */}
      {currentPhase === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Publicatie Test
            </CardTitle>
            <CardDescription>
              Publiceer gegenereerde artikelen naar je WordPress site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedPosts.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Geen artikelen gevonden. Ga terug naar stap 2 of 3 om content te genereren.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {generatedPosts.slice(0, 3).map((post, index) => (
                  <div key={`post-${post.id}-${index}`} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {post.word_count} woorden • {post.city}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {publishedPosts.find(p => p.postId === post.id) ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Gepubliceerd
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => publishToWordPress(post.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ExternalLink className="h-3 w-3" />
                            )}
                            Publiceer
                          </Button>
                        )}
                      </div>
                    </div>
                    {post.summary && (
                      <p className="text-sm text-muted-foreground">{post.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setCurrentPhase(5)}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Bekijk Resultaten
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 5: Results */}
      {currentPhase === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Testpilot Resultaten
            </CardTitle>
            <CardDescription>
              Overzicht van je testpilot resultaten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{generatedPosts.length}</div>
                <div className="text-sm text-muted-foreground">Artikelen Gegenereerd</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-500">{publishedPosts.length}</div>
                <div className="text-sm text-muted-foreground">Succesvol Gepubliceerd</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{wordpressConfig ? '✓' : '✗'}</div>
                <div className="text-sm text-muted-foreground">WordPress Verbonden</div>
              </div>
            </div>
            
            {publishedPosts.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Gepubliceerde Artikelen:</h4>
                <div className="space-y-2">
                  {publishedPosts.map((published, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm">Artikel gepubliceerd</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(published.url, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Bekijk
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Testpilot voltooid!</strong> Je hebt de volledige AutoblogifyAI workflow getest. 
                Je kunt nu de hoofdapplicatie gebruiken voor grootschalige content productie.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button onClick={() => setCurrentPhase(1)}>
                Nieuwe Test Starten
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Naar Hoofdapplicatie
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WordPressTestPilot;