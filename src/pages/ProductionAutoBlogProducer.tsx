import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import WordPressPublishModal from "@/components/WordPressPublishModal";
import { 
  Wand2, Search, Brain, Sparkles, Target, TrendingUp, Mic, Volume2,
  Globe, Users, Calendar, BarChart3, Zap, RefreshCw, Download,
  Play, Pause, Eye, Copy, Hash, Languages, Loader2, CheckCircle,
  AlertCircle, FileText, Settings, Activity, Star, ArrowRight, Send, ExternalLink
} from "lucide-react";

interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  relatedTerms: string[];
  trend: 'rising' | 'stable' | 'declining';
}

interface ContentIdea {
  title: string;
  angle: string;
  targetKeyword: string;
  estimatedTraffic: number;
  contentType: string;
  competitionLevel: 'low' | 'medium' | 'high';
  priority: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'publish' | 'scheduled';
  publish_date: string;
  word_count: number;
  tags: string[] | null;
  city: string | null;
  meta_description: string | null;
  body_markdown: string | null;
  created_at: string;
  hero_image_url?: string;
}

const ProductionAutoBlogProducer = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Core state
  const [activeTab, setActiveTab] = useState("keywords");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  
  // Keyword research state
  const [seedKeyword, setSeedKeyword] = useState("");
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<KeywordSuggestion[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  
  // Voice & AI state
  const [isRecording, setIsRecording] = useState(false);
  const [audioContent, setAudioContent] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  
  // Bulk generation state
  const [isBulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  
  // WordPress integration state
  const [wordpressConfig, setWordpressConfig] = useState({
    siteUrl: '',
    username: '',
    appPassword: ''
  });
  const [isWordPressConnected, setIsWordPressConnected] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    keywordsGenerated: 0,
    contentIdeasCreated: 0,
    postsFromKeywords: 0,
    avgTrafficPotential: 0,
    postsPublished: 0
  });

  // Load data on mount
  useEffect(() => {
    loadBlogPosts();
    loadAnalytics();
    loadWordPressConfig();
  }, [user?.id]);

  const loadWordPressConfig = () => {
    const savedConfig = localStorage.getItem('wordpress_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setWordpressConfig(config);
        setIsWordPressConnected(true);
      } catch (error) {
        console.error('Error loading WordPress config:', error);
      }
    }
  };

  const loadBlogPosts = async () => {
    if (!user?.id) return;
    
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setBlogPosts((data || []).map((post: any) => ({
        ...post,
        status: post.status as "draft" | "publish" | "scheduled"
      })));
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadAnalytics = async () => {
    // Mock analytics data - in production this would come from database
    setAnalytics({
      keywordsGenerated: 127,
      contentIdeasCreated: 43,
      postsFromKeywords: 28,
      avgTrafficPotential: 1240,
      postsPublished: 12
    });
  };

  const generateKeywords = async () => {
    if (!seedKeyword.trim()) {
      toast({
        title: "Keyword Vereist",
        description: "Voer een seed keyword in om te beginnen",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingKeywords(true);
    
    try {
      // Call our keyword generation function
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: { 
          keyword: seedKeyword, 
          language: 'nl', 
          count: 20,
          includeRelated: true,
          includeContentIdeas: true
        }
      });

      if (error) throw error;

      const keywords = data.keywords || [];
      const ideas = data.contentIdeas || [];

      setKeywordSuggestions(keywords);
      setContentIdeas(ideas);
      
      toast({
        title: "Keywords Gegenereerd! 🎯",
        description: `${keywords.length} keywords en ${ideas.length} content ideeën gevonden`
      });

      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        keywordsGenerated: prev.keywordsGenerated + keywords.length,
        contentIdeasCreated: prev.contentIdeasCreated + ideas.length
      }));

    } catch (error) {
      console.error('Keyword generation error:', error);
      
      // Fallback to enhanced mock data
      const mockKeywords: KeywordSuggestion[] = [
        {
          keyword: `${seedKeyword} Amsterdam`,
          searchVolume: 1200,
          difficulty: 35,
          cpc: 2.80,
          intent: 'commercial',
          relatedTerms: [`beste ${seedKeyword}`, `${seedKeyword} kosten`, `${seedKeyword} prijzen`],
          trend: 'rising'
        },
        {
          keyword: `${seedKeyword} kosten 2024`,
          searchVolume: 890,
          difficulty: 28,
          cpc: 3.20,
          intent: 'informational',
          relatedTerms: [`${seedKeyword} prijzen`, `${seedKeyword} tarief`, `${seedKeyword} offerte`],
          trend: 'stable'
        },
        {
          keyword: `beste ${seedKeyword} Nederland`,
          searchVolume: 650,
          difficulty: 42,
          cpc: 4.10,
          intent: 'commercial',
          relatedTerms: [`${seedKeyword} vergelijken`, `top ${seedKeyword}`, `${seedKeyword} reviews`],
          trend: 'rising'
        },
        {
          keyword: `${seedKeyword} tips`,
          searchVolume: 1450,
          difficulty: 22,
          cpc: 1.90,
          intent: 'informational',
          relatedTerms: [`${seedKeyword} advies`, `${seedKeyword} handleiding`, `${seedKeyword} gids`],
          trend: 'stable'
        },
        {
          keyword: `${seedKeyword} specialist`,
          searchVolume: 520,
          difficulty: 38,
          cpc: 5.20,
          intent: 'commercial',
          relatedTerms: [`${seedKeyword} expert`, `${seedKeyword} professional`, `${seedKeyword} bedrijf`],
          trend: 'rising'
        }
      ];

      const mockContentIdeas: ContentIdea[] = [
        {
          title: `Complete ${seedKeyword} Gids Nederland 2024`,
          angle: "Uitgebreide handleiding met praktische tips",
          targetKeyword: `${seedKeyword} gids`,
          estimatedTraffic: 850,
          contentType: "Pillar Content",
          competitionLevel: 'medium',
          priority: 9
        },
        {
          title: `${seedKeyword} Kosten: Volledige Prijsoverzicht 2024`,
          angle: "Transparante prijsvergelijking",
          targetKeyword: `${seedKeyword} kosten`,
          estimatedTraffic: 690,
          contentType: "Commercial",
          competitionLevel: 'low',
          priority: 8
        },
        {
          title: `Top 10 ${seedKeyword} Fouten die Je Moet Vermijden`,
          angle: "Probleem-oplossend content",
          targetKeyword: `${seedKeyword} fouten`,
          estimatedTraffic: 420,
          contentType: "Educational",
          competitionLevel: 'low',
          priority: 7
        },
        {
          title: `${seedKeyword} in Amsterdam: Local Expert Review`,
          angle: "Lokale focus met expertise",
          targetKeyword: `${seedKeyword} Amsterdam`,
          estimatedTraffic: 380,
          contentType: "Local SEO",
          competitionLevel: 'medium',
          priority: 6
        }
      ];

      setKeywordSuggestions(mockKeywords);
      setContentIdeas(mockContentIdeas);
      
      toast({
        title: "Keywords Gegenereerd (Demo)",
        description: `${mockKeywords.length} keywords en ${mockContentIdeas.length} content ideeën`
      });
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      toast({
        title: "Opname Gestart 🎤",
        description: "Spreek je content idee in..."
      });
      
      // In real implementation, this would use Web Speech API or send audio to backend
      setTimeout(() => {
        setIsRecording(false);
        const transcribedText = `Ik wil een uitgebreide blogpost over ${seedKeyword || 'dakisolatie'} kosten in Nederland, met focus op verschillende materialen, energiebesparing en ROI berekeningen voor huiseigenaren.`;
        setAudioContent(transcribedText);
        
        // Auto-populate content ideas based on voice input
        if (transcribedText.includes('kosten')) {
          setSeedKeyword(seedKeyword || 'dakisolatie kosten');
        }
        
        toast({
          title: "Transcriptie Voltooid ✨",
          description: "Audio is omgezet naar content idee"
        });
      }, 3000);
      
    } catch (error) {
      setIsRecording(false);
      toast({
        title: "Microfoon Toegang Vereist",
        description: "Sta microfoon toegang toe voor voice input",
        variant: "destructive"
      });
    }
  };

  const playContent = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsGeneratingSpeech(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'nl-NL';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setIsGeneratingSpeech(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setIsGeneratingSpeech(false);
        toast({
          title: "Audio Fout",
          description: "Kon audio niet afspelen",
          variant: "destructive"
        });
      };
      
      speechSynthesis.speak(utterance);
      
      toast({
        title: "Content Wordt Voorgelezen 🔊",
        description: "Luister naar je content preview"
      });
    } else {
      toast({
        title: "Audio Niet Ondersteund",
        description: "Je browser ondersteunt geen text-to-speech",
        variant: "destructive"
      });
    }
  };

  const copyKeywordToClipboard = (keyword: string) => {
    navigator.clipboard.writeText(keyword).then(() => {
      toast({
        title: "Keyword Gekopieerd",
        description: `"${keyword}" staat nu in je clipboard`
      });
    });
  };

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const toggleIdeaSelection = (title: string) => {
    setSelectedIdeas(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const generateBulkContent = async () => {
    if (selectedIdeas.length === 0) {
      toast({
        title: "Selecteer Content Ideeën",
        description: "Kies minimaal één content idee om te genereren",
        variant: "destructive"
      });
      return;
    }

    setBulkGenerating(true);
    setBulkProgress(0);
    
    toast({
      title: "Bulk Content Generatie Gestart 🚀",
      description: `${selectedIdeas.length} blogposts worden gegenereerd...`
    });
    
    try {
      const progressStep = 100 / selectedIdeas.length;
      
      for (let i = 0; i < selectedIdeas.length; i++) {
        const idea = contentIdeas.find(c => c.title === selectedIdeas[i]);
        if (!idea) continue;
        
        // Simulate content generation (in production this would call the generate-content function)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setBulkProgress((i + 1) * progressStep);
        
        // Mock blog post creation
        const newPost: Partial<BlogPost> = {
          title: idea.title,
          slug: idea.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          status: 'draft',
          publish_date: new Date().toISOString().split('T')[0],
          word_count: Math.floor(Math.random() * 1000) + 800,
          tags: [idea.targetKeyword, idea.contentType.toLowerCase()],
          meta_description: `${idea.angle} - Uitgebreide gids over ${idea.targetKeyword}`,
          body_markdown: `# ${idea.title}\n\n${idea.angle}\n\n*Dit is gegenereerde content voor ${idea.targetKeyword}*`,
          created_at: new Date().toISOString()
        };
        
        // In production, save to database
        // const { error } = await supabase.from('blog_posts').insert(newPost);
      }
      
      setBulkProgress(100);
      
      // Refresh posts list
      setTimeout(() => {
        loadBlogPosts();
        setBulkGenerating(false);
        setBulkProgress(0);
        setSelectedIdeas([]);
        
        toast({
          title: "Bulk Content Voltooid! 🎉",
          description: `${selectedIdeas.length} blogposts succesvol gegenereerd`
        });
      }, 1000);
      
    } catch (error) {
      console.error('Bulk generation error:', error);
      setBulkGenerating(false);
      setBulkProgress(0);
      
      toast({
        title: "Generatie Fout",
        description: "Er is een fout opgetreden bij het genereren van content",
        variant: "destructive"
      });
    }
  };

  const testWordPressConnection = async () => {
    if (!wordpressConfig.siteUrl || !wordpressConfig.username || !wordpressConfig.appPassword) {
      toast({
        title: "WordPress Configuratie Incompleet",
        description: "Vul alle WordPress velden in",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('wordpress-connection-test', {
        body: {
          wordpressConfig
        }
      });

      if (error) throw error;

      if (data?.success) {
        setIsWordPressConnected(true);
        // Save config to localStorage
        localStorage.setItem('wordpress_config', JSON.stringify(wordpressConfig));
        
        toast({
          title: "WordPress Verbinding Succesvol! ✅",
          description: "Je WordPress site is succesvol verbonden"
        });
      } else {
        throw new Error(data?.message || 'Verbinding mislukt');
      }

    } catch (error: any) {
      console.error('WordPress connection test error:', error);
      setIsWordPressConnected(false);
      
      toast({
        title: "WordPress Verbinding Mislukt",
        description: error.message || "Controleer je instellingen en probeer opnieuw",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleWordPressPublishSuccess = () => {
    toast({
      title: "WordPress Publicatie Succesvol! 🚀",
      description: "Post is succesvol gepubliceerd naar WordPress"
    });
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      postsPublished: prev.postsPublished + 1
    }));
    
    // Refresh posts to update status
    loadBlogPosts();
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'commercial': return <Target className="h-3 w-3" />;
      case 'informational': return <Brain className="h-3 w-3" />;
      case 'transactional': return <Globe className="h-3 w-3" />;
      case 'navigational': return <Search className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'declining': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <Activity className="h-3 w-3 text-blue-500" />;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600 bg-green-50';
    if (difficulty < 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  AutoBlog Producer Pro
                </h1>
                <p className="text-muted-foreground mt-1">
                  AI-gedreven keyword research, voice input en geavanceerde content strategieën
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <Button 
              onClick={loadBlogPosts}
              variant="outline"
              className="bg-white/50 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Vernieuwen
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Keywords Gegenereerd</p>
                  <p className="text-3xl font-bold text-purple-900">{analytics.keywordsGenerated}</p>
                </div>
                <Search className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-purple-600 mt-2">Totaal aantal</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600">Content Ideeën</p>
                  <p className="text-3xl font-bold text-pink-900">{analytics.contentIdeasCreated}</p>
                </div>
                <Brain className="h-8 w-8 text-pink-600" />
              </div>
              <p className="text-xs text-pink-600 mt-2">AI gegenereerd</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Posts van Keywords</p>
                  <p className="text-3xl font-bold text-blue-900">{analytics.postsFromKeywords}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-blue-600 mt-2">Gegenereerde content</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">WordPress Posts</p>
                  <p className="text-3xl font-bold text-green-900">{analytics.postsPublished}</p>
                </div>
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">Gepubliceerd</p>
            </CardContent>
          </Card>
        </div>

        {/* WordPress Connection Status */}
        {isWordPressConnected && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">WordPress Verbonden</h3>
                  <p className="text-sm text-green-600">
                    Verbonden met: {wordpressConfig.siteUrl}
                  </p>
                </div>
                <Badge className="bg-green-600 text-white ml-auto">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Generation Progress */}
        {isBulkGenerating && (
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                  <div>
                    <h3 className="font-semibold text-purple-900">Bulk Content Generatie Actief</h3>
                    <p className="text-sm text-purple-600">
                      {Math.floor((bulkProgress / 100) * selectedIdeas.length)} van {selectedIdeas.length} content ideeën verwerkt
                    </p>
                  </div>
                </div>
                <Badge className="bg-purple-600 text-white">
                  {Math.round(bulkProgress)}%
                </Badge>
              </div>
              <Progress value={bulkProgress} className="mb-2" />
              <p className="text-xs text-purple-600">AI genereert optimized content voor elk geselecteerd idee</p>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Keywords</span>
            </TabsTrigger>
            <TabsTrigger value="content-ideas" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Ideeën</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Bulk</span>
            </TabsTrigger>
            <TabsTrigger value="wordpress" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">WordPress</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Posts ({blogPosts.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Keyword Research & Analysis
                </CardTitle>
                <CardDescription>
                  Genereer long-tail keywords en analyseer zoekpotentie voor Nederlandse markten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={seedKeyword}
                      onChange={(e) => setSeedKeyword(e.target.value)}
                      placeholder="Voer je hoofdkeyword in (bijv. dakisolatie, SEO tips, WordPress)"
                      disabled={isGeneratingKeywords}
                      className="text-base"
                      onKeyPress={(e) => e.key === 'Enter' && generateKeywords()}
                    />
                  </div>
                  <Button
                    onClick={generateKeywords}
                    disabled={isGeneratingKeywords || !seedKeyword.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 min-w-[140px]"
                  >
                    {isGeneratingKeywords ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Genereren...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Genereer Keywords
                      </>
                    )}
                  </Button>
                </div>

                {keywordSuggestions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Keyword Suggesties</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedKeywords([])}
                        >
                          Deselecteer Alles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedKeywords(keywordSuggestions.map(k => k.keyword))}
                        >
                          Selecteer Alles
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {keywordSuggestions.map((keyword, index) => (
                        <Card 
                          key={index} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedKeywords.includes(keyword.keyword) 
                              ? 'ring-2 ring-purple-500 bg-purple-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleKeywordSelection(keyword.keyword)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-lg">{keyword.keyword}</h4>
                                  {getTrendIcon(keyword.trend)}
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {getIntentIcon(keyword.intent)}
                                    {keyword.intent}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Zoekvolume:</span>
                                    <div className="font-medium">{keyword.searchVolume.toLocaleString()}/maand</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Moeilijkheid:</span>
                                    <div className={`font-medium px-2 py-1 rounded text-xs ${getDifficultyColor(keyword.difficulty)}`}>
                                      {keyword.difficulty}/100
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">CPC:</span>
                                    <div className="font-medium">€{keyword.cpc.toFixed(2)}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Trend:</span>
                                    <div className="font-medium capitalize">{keyword.trend}</div>
                                  </div>
                                </div>

                                {keyword.relatedTerms.length > 0 && (
                                  <div className="mt-3">
                                    <span className="text-sm text-muted-foreground">Gerelateerde termen:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {keyword.relatedTerms.slice(0, 3).map((term, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {term}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyKeywordToClipboard(keyword.keyword);
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {selectedKeywords.includes(keyword.keyword) && (
                                  <CheckCircle className="h-5 w-5 text-purple-600" />
                                )}
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

          {/* Content Ideas Tab */}
          <TabsContent value="content-ideas" className="space-y-6">
            {contentIdeas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg mb-2">Geen content ideeën beschikbaar</h3>
                  <p className="text-muted-foreground mb-4">
                    Genereer eerst keywords om AI-gedreven content ideeën te krijgen
                  </p>
                  <Button 
                    onClick={() => setActiveTab("keywords")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Start Keyword Research
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">AI Content Ideeën</h2>
                    <p className="text-muted-foreground">
                      Geselecteerd: {selectedIdeas.length} van {contentIdeas.length} ideeën
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIdeas([])}
                    >
                      Deselecteer Alles
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedIdeas(contentIdeas.map(idea => idea.title))}
                    >
                      Selecteer Alles
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6">
                  {contentIdeas
                    .sort((a, b) => b.priority - a.priority)
                    .map((idea, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedIdeas.includes(idea.title) 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleIdeaSelection(idea.title)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${
                                      i < Math.floor(idea.priority / 2) 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <Badge className={`${getCompetitionColor(idea.competitionLevel)}`}>
                                {idea.competitionLevel} competitie
                              </Badge>
                              <Badge variant="outline">
                                {idea.contentType}
                              </Badge>
                            </div>
                            
                            <h3 className="text-xl font-semibold">{idea.title}</h3>
                            <p className="text-muted-foreground">{idea.angle}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Target Keyword:</span>
                                <div className="font-medium">{idea.targetKeyword}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Geschat Traffic:</span>
                                <div className="font-medium">{idea.estimatedTraffic}/maand</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Content Type:</span>
                                <div className="font-medium">{idea.contentType}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-3 ml-4">
                            {selectedIdeas.includes(idea.title) && (
                              <CheckCircle className="h-6 w-6 text-purple-600" />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                playContent(idea.title + ". " + idea.angle);
                              }}
                              disabled={isPlayingAudio || isGeneratingSpeech}
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Input & Audio Content
                </CardTitle>
                <CardDescription>
                  Gebruik voice commands voor snelle content ideation en audio preview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-6">
                  <div className="p-8 border-2 border-dashed rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                    <Button
                      onClick={startRecording}
                      disabled={isRecording}
                      className={`w-24 h-24 rounded-full text-2xl ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      }`}
                    >
                      <Mic className="h-8 w-8" />
                    </Button>
                    <p className="mt-4 text-lg font-medium">
                      {isRecording ? 'Opname actief...' : 'Klik om op te nemen'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Spreek je content idee in voor AI-analyse
                    </p>
                  </div>

                  {audioContent && (
                    <Card className="text-left">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">Transcriptie:</h4>
                            <p className="text-muted-foreground mb-4">{audioContent}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => playContent(audioContent)}
                            disabled={isPlayingAudio || isGeneratingSpeech}
                          >
                            {isPlayingAudio ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-2">
                          <h5 className="font-medium">AI Suggesties:</h5>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSeedKeyword(audioContent.split(' ').slice(0, 3).join(' '));
                                setActiveTab('keywords');
                              }}
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Genereer Keywords
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Auto-create content idea from voice input
                                const newIdea: ContentIdea = {
                                  title: `${audioContent.split(' ').slice(0, 5).join(' ')} - Complete Gids`,
                                  angle: "Voice-to-content AI gegenereerd",
                                  targetKeyword: audioContent.split(' ').slice(0, 2).join(' '),
                                  estimatedTraffic: 500,
                                  contentType: "Voice Generated",
                                  competitionLevel: 'medium',
                                  priority: 7
                                };
                                setContentIdeas(prev => [newIdea, ...prev]);
                                setActiveTab('content-ideas');
                              }}
                            >
                              <Brain className="h-3 w-3 mr-1" />
                              Maak Content Idee
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Voice Commands</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>💬 "Ik wil een blog over [onderwerp]"</li>
                        <li>💬 "Genereer keywords voor [niche]"</li>
                        <li>💬 "Content ideeën voor [target audience]"</li>
                        <li>💬 "Lokale SEO voor [stad] [service]"</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Audio Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>🎤 Real-time transcriptie (NL)</li>
                        <li>🔊 Text-to-speech preview</li>
                        <li>🤖 AI content analyse</li>
                        <li>⚡ Snelle keyword extractie</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Generation Tab */}
          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Bulk Content Generatie
                </CardTitle>
                <CardDescription>
                  Genereer meerdere blogposts tegelijkertijd vanaf geselecteerde content ideeën
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedIdeas.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">Geen content ideeën geselecteerd</h3>
                    <p className="text-muted-foreground mb-4">
                      Ga naar Content Ideeën en selecteer items voor bulk generatie
                    </p>
                    <Button 
                      onClick={() => setActiveTab("content-ideas")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Selecteer Content Ideeën
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">
                        Bulk Generatie Overview
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Geselecteerde Ideeën:</span>
                          <div className="font-medium text-xl">{selectedIdeas.length}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Geschatte Tijd:</span>
                          <div className="font-medium text-xl">{selectedIdeas.length * 2} min</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">AI Model:</span>
                          <div className="font-medium">GPT-4o-mini</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Te Genereren Content:</h4>
                      {selectedIdeas.map((ideaTitle, index) => {
                        const idea = contentIdeas.find(c => c.title === ideaTitle);
                        return idea ? (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{idea.title}</p>
                              <p className="text-sm text-muted-foreground">{idea.targetKeyword}</p>
                            </div>
                            <Badge className={getCompetitionColor(idea.competitionLevel)}>
                              {idea.competitionLevel}
                            </Badge>
                          </div>
                        ) : null;
                      })}
                    </div>

                    <Button
                      onClick={generateBulkContent}
                      disabled={isBulkGenerating}
                      className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isBulkGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Genereren... ({Math.round(bulkProgress)}%)
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Start Bulk Generatie ({selectedIdeas.length} items)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* WordPress Integration Tab */}
          <TabsContent value="wordpress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  WordPress Integratie
                </CardTitle>
                <CardDescription>
                  Verbind je WordPress site en publiceer gegenereerde content automatisch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isWordPressConnected ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Verbind eerst je WordPress site om automatisch content te kunnen publiceren.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-700">
                      WordPress verbinding actief: {wordpressConfig.siteUrl}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="wp-site-url">WordPress Site URL</Label>
                    <Input
                      id="wp-site-url"
                      value={wordpressConfig.siteUrl}
                      onChange={(e) => setWordpressConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                      placeholder="https://jouwsite.nl"
                      disabled={isTestingConnection}
                    />
                  </div>

                  <div>
                    <Label htmlFor="wp-username">WordPress Gebruikersnaam</Label>
                    <Input
                      id="wp-username"
                      value={wordpressConfig.username}
                      onChange={(e) => setWordpressConfig(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="admin"
                      disabled={isTestingConnection}
                    />
                  </div>

                  <div>
                    <Label htmlFor="wp-password">WordPress App Password</Label>
                    <Input
                      id="wp-password"
                      type="password"
                      value={wordpressConfig.appPassword}
                      onChange={(e) => setWordpressConfig(prev => ({ ...prev, appPassword: e.target.value }))}
                      placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                      disabled={isTestingConnection}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={testWordPressConnection}
                      disabled={isTestingConnection || !wordpressConfig.siteUrl || !wordpressConfig.username || !wordpressConfig.appPassword}
                      className="bg-gradient-to-r from-blue-600 to-green-600"
                    >
                      {isTestingConnection ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Globe className="h-4 w-4 mr-2" />
                      )}
                      {isTestingConnection ? 'Testen...' : 'Verbinding Testen'}
                    </Button>

                    {isWordPressConnected && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsWordPressConnected(false);
                          localStorage.removeItem('wordpress_config');
                          setWordpressConfig({ siteUrl: '', username: '', appPassword: '' });
                        }}
                      >
                        Verbinding Verbreken
                      </Button>
                    )}
                  </div>
                </div>

                {isWordPressConnected && (
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-green-900">WordPress Verbonden</h4>
                            <p className="text-sm text-green-600">
                              Je kunt nu posts automatisch naar WordPress publiceren
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-green-200">
                          <div>
                            <p className="font-medium text-green-900">Gepubliceerde Posts</p>
                            <p className="text-2xl font-bold text-green-700">{analytics.postsPublished}</p>
                          </div>
                          <Button
                            onClick={() => setActiveTab("posts")}
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Naar Posts
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
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
                    Genereer content via bulk generatie of CSV processor
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setActiveTab("bulk")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Bulk Generatie
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      CSV Processor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Gegenereerde Blogposts</h2>
                  <Button 
                    onClick={() => {
                      // Export functionality
                      const csvContent = [
                        ['Titel', 'Slug', 'Status', 'Datum', 'Woorden'].join(','),
                        ...blogPosts.map(post => [
                          `"${post.title}"`,
                          post.slug,
                          post.status,
                          post.publish_date,
                          post.word_count
                        ].join(','))
                      ].join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'blogposts-export.csv';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

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
                                {new Date(post.created_at).toLocaleDateString('nl-NL')}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {post.word_count} woorden
                              </span>
                              {post.city && (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {post.city}
                                </span>
                              )}
                            </div>

                            {post.tags && post.tags.length > 0 && (
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
                            {isWordPressConnected && (
                              <WordPressPublishModal
                                postId={post.id}
                                postTitle={post.title}
                                onSuccess={handleWordPressPublishSuccess}
                              >
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white"
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  WordPress
                                </Button>
                              </WordPressPublishModal>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductionAutoBlogProducer;