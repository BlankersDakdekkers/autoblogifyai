import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import WordPressPublishModal from "@/components/WordPressPublishModal";
import { 
  Crown, Brain, Globe, Search, Sparkles, Wand2, Loader2, CheckCircle, XCircle, Lock, CreditCard, AlertCircle, Send, ExternalLink, ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';

// Form schemas
const contentGenerationSchema = z.object({
  topic: z.string().min(3, 'Onderwerp moet minimaal 3 karakters bevatten'),
  contentType: z.string().min(1, 'Selecteer een content type'),
  customInstructions: z.string().optional(),
  persona: z.string().optional(),
});

const personaSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten'),
  description: z.string().min(10, 'Beschrijving moet minimaal 10 karakters bevatten'),
  tone: z.string().min(1, 'Selecteer een schrijfstijl'),
  expertise: z.string().min(5, 'Voer expertise gebieden in'),
  examples: z.string().min(20, 'Voer voorbeeldteksten in'),
});

const keywordResearchSchema = z.object({
  seedKeyword: z.string().min(2, 'Keyword moet minimaal 2 karakters bevatten'),
  location: z.string().optional(),
});

const multilingualSchema = z.object({
  sourceContent: z.string().min(10, 'Voer minimaal 10 karakters content in'),
});

// Types
interface AIPersona {
  id: string;
  name: string;
  description: string;
  tone: string;
  expertise: string[];
  examples: string[];
}

interface GeneratedContent {
  primary: {
    language: string;
    content: string;
  };
  translations: Array<{
    language: string;
    content: string;
  }>;
}

interface KeywordResult {
  keyword: string;
  searchVolume?: number;
  difficulty?: string;
  intent?: string;
}

const AdvancedAIFeatures = () => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('models');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState('gpt-5-2025-08-07');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['nl']);
  const [customPersonas, setCustomPersonas] = useState<AIPersona[]>([]);
  const [keywordResults, setKeywordResults] = useState<KeywordResult[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  // WordPress integration state
  const [wordpressConfig, setWordpressConfig] = useState({
    siteUrl: '',
    username: '',
    appPassword: ''
  });
  const [isWordPressConnected, setIsWordPressConnected] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Check if user has premium access (admin role for now, can be extended)
  const hasPremiumAccess = userRole === 'admin';

  // Load WordPress config on mount
  useEffect(() => {
    loadWordPressConfig();
    if (hasPremiumAccess) {
      loadBlogPosts();
    }
  }, [hasPremiumAccess]);

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
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const testWordPressConnection = async () => {
    if (!wordpressConfig.siteUrl || !wordpressConfig.username || !wordpressConfig.appPassword) {
      toast.error('Vul alle WordPress velden in');
      return;
    }

    setIsTestingConnection(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('wordpress-connection-test', {
        body: { wordpressConfig }
      });

      if (error) throw error;

      if (data?.success) {
        setIsWordPressConnected(true);
        localStorage.setItem('wordpress_config', JSON.stringify(wordpressConfig));
        toast.success('WordPress Verbinding Succesvol! ✅');
      } else {
        throw new Error(data?.message || 'Verbinding mislukt');
      }

    } catch (error: any) {
      console.error('WordPress connection test error:', error);
      setIsWordPressConnected(false);
      toast.error(`WordPress Verbinding Mislukt: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleWordPressPublishSuccess = () => {
    toast.success('WordPress Publicatie Succesvol! 🚀');
    loadBlogPosts();
  };

  // Form instances
  const contentForm = useForm<z.infer<typeof contentGenerationSchema>>({
    resolver: zodResolver(contentGenerationSchema),
    defaultValues: {
      topic: '',
      contentType: '',
      customInstructions: '',
      persona: '',
    },
  });

  const personaForm = useForm<z.infer<typeof personaSchema>>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      name: '',
      description: '',
      tone: '',
      expertise: '',
      examples: '',
    },
  });

  const keywordForm = useForm<z.infer<typeof keywordResearchSchema>>({
    resolver: zodResolver(keywordResearchSchema),
    defaultValues: {
      seedKeyword: '',
      location: '',
    },
  });

  const multilingualForm = useForm<z.infer<typeof multilingualSchema>>({
    resolver: zodResolver(multilingualSchema),
    defaultValues: {
      sourceContent: '',
    },
  });

  // Premium AI Models
  const aiModels = [
    { id: 'gpt-5-2025-08-07', name: 'GPT-5', description: 'Nieuwste en meest geavanceerde GPT model', badge: 'Nieuw' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Meest intelligente Claude model', badge: 'Premium' },
    { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1', description: 'Betrouwbare flagship GPT-4 variant' },
    { id: 'o3-2025-04-16', name: 'OpenAI o3', description: 'Krachtig reasoning model voor complexe analyses', badge: 'Reasoning' }
  ];

  // Supported Languages
  const supportedLanguages = [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  ];

  const handleAdvancedGeneration = useCallback(async (formData: z.infer<typeof contentGenerationSchema>) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedContent(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      // Check if we have the advanced-ai-generation function, if not use generate-content as fallback
      let functionName = 'advanced-ai-generation';
      let body = {
        model: selectedModel,
        languages: selectedLanguages,
        persona: formData.persona || 'Professional',
        topic: formData.topic,
        contentType: formData.contentType,
        customInstructions: formData.customInstructions || ''
      };

      const { data, error } = await supabase.functions.invoke(functionName, { body });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (error) {
        // If the advanced function fails, try fallback with generate-content
        console.log('Advanced AI generation failed, trying fallback:', error);
        const fallbackData = await supabase.functions.invoke('generate-content', {
          body: {
            prompt: `Schrijf een ${formData.contentType} over ${formData.topic}. ${formData.customInstructions || ''}`,
            language: selectedLanguages[0] || 'nl'
          }
        });
        
        if (fallbackData.error) {
          throw new Error(fallbackData.error.message || 'Beide AI functies faalden');
        }
        
        // Format fallback response to match expected structure
        setGeneratedContent({
          primary: {
            language: selectedLanguages[0] || 'nl',
            content: fallbackData.data?.content || 'Content generatie gefaald'
          },
          translations: []
        });
        toast.success('Content succesvol gegenereerd (fallback modus)!');
      } else if (data?.success) {
        // Format content for display
        const formattedContent = {
          primary: {
            language: selectedLanguages[0] || 'nl',
            content: data.content || data.generatedContent || 'Content generatie gefaald'
          },
          translations: []
        };
        setGeneratedContent(formattedContent);
        toast.success(`Content succesvol gegenereerd met ${selectedModel}!`);
      } else {
        // No successful data, show demo content
        const demoContent = {
          primary: {
            language: selectedLanguages[0] || 'nl',
            content: `[DEMO CONTENT]\n\nOnderwerp: ${formData.topic}\nType: ${formData.contentType}\nModel: ${selectedModel}\n\nDit is een demo van geavanceerde AI content generatie. De echte functionaliteit vereist configuratie van AI API keys.\n\nConfigueer de AI services in je Supabase dashboard voor volledige functionaliteit.`
          },
          translations: []
        };
        setGeneratedContent(demoContent);
        toast.success('Demo content gegenereerd - configureer AI services voor volledige functionaliteit');
      }

    } catch (error: any) {
      console.error('AI Generation error:', error);
      toast.error(`Fout bij genereren: ${error.message || 'Onbekende fout'}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  }, [selectedModel, selectedLanguages]);

  const handleKeywordResearch = useCallback(async (formData: z.infer<typeof keywordResearchSchema>) => {
    setIsGenerating(true);
    setKeywordResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-keyword-research', {
        body: {
          seedKeyword: formData.seedKeyword,
          location: formData.location || '',
          language: selectedLanguages[0] || 'nl',
          model: selectedModel
        }
      });

      if (error) {
        // Fallback: generate demo keywords
        console.log('AI keyword research failed, using demo data:', error);
        const demoKeywords = [
          { keyword: `${formData.seedKeyword} ${formData.location || 'Nederland'}`.trim(), searchVolume: 1200, difficulty: '25', intent: 'Commercial' },
          { keyword: `beste ${formData.seedKeyword}`, searchVolume: 800, difficulty: '30', intent: 'Informational' },
          { keyword: `${formData.seedKeyword} kosten`, searchVolume: 650, difficulty: '20', intent: 'Commercial' },
          { keyword: `${formData.seedKeyword} service`, searchVolume: 450, difficulty: '35', intent: 'Commercial' },
          { keyword: `${formData.seedKeyword} tips`, searchVolume: 320, difficulty: '15', intent: 'Informational' }
        ];
        setKeywordResults(demoKeywords);
        toast.success(`${demoKeywords.length} demo keywords gegenereerd!`);
        return;
      }

      if (data?.success) {
        setKeywordResults(data.keywords || []);
        toast.success(`${data.keywords?.length || 0} keywords gevonden!`);
      } else {
        throw new Error(data?.error || 'Geen keywords gevonden');
      }

    } catch (error: any) {
      console.error('Keyword research error:', error);
      toast.error(`Fout bij keyword research: ${error.message || 'Onbekende fout'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedModel, selectedLanguages]);

  const createCustomPersona = useCallback(async (formData: z.infer<typeof personaSchema>) => {
    try {
      const { data, error } = await supabase.functions.invoke('custom-persona-manager', {
        body: {
          action: 'create',
          personaData: {
            name: formData.name,
            description: formData.description,
            tone: formData.tone,
            expertise: formData.expertise.split(',').map(e => e.trim()),
            examples: formData.examples.split('\n').filter(e => e.trim())
          }
        }
      });

      if (error) {
        // Fallback: create local persona
        console.log('Custom persona manager failed, creating local persona:', error);
        const localPersona: AIPersona = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          tone: formData.tone,
          expertise: formData.expertise.split(',').map(e => e.trim()),
          examples: formData.examples.split('\n').filter(e => e.trim())
        };

        setCustomPersonas(prev => [...prev, localPersona]);
        personaForm.reset();
        toast.success('AI persona lokaal aangemaakt (demo modus)!');
        return;
      }

      if (data?.success) {
        const newPersona: AIPersona = {
          id: data.persona.id,
          name: formData.name,
          description: formData.description,
          tone: formData.tone,
          expertise: formData.expertise.split(',').map(e => e.trim()),
          examples: formData.examples.split('\n').filter(e => e.trim())
        };

        setCustomPersonas(prev => [...prev, newPersona]);
        personaForm.reset();
        toast.success('Custom AI persona succesvol aangemaakt!');
      } else {
        throw new Error(data?.error || 'Persona kon niet worden aangemaakt');
      }

    } catch (error: any) {
      console.error('Persona creation error:', error);
      toast.error(`Fout bij aanmaken persona: ${error.message || 'Onbekende fout'}`);
    }
  }, [personaForm]);

  const handleMultilingualTranslation = useCallback(async (formData: z.infer<typeof multilingualSchema>) => {
    if (selectedLanguages.length <= 1) {
      toast.error('Selecteer minimaal 2 talen voor vertaling');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('multilingual-translator', {
        body: {
          sourceContent: formData.sourceContent,
          sourceLanguage: selectedLanguages[0],
          targetLanguages: selectedLanguages.slice(1),
          model: selectedModel
        }
      });

      if (error) {
        // Fallback: create demo translations
        console.log('Multilingual translator failed, using demo translations:', error);
        const demoTranslations = selectedLanguages.slice(1).map(lang => ({
          language: lang,
          content: `[DEMO VERTALING NAAR ${lang.toUpperCase()}]\n\n${formData.sourceContent}\n\n[Dit is een demo vertaling. Voor echte vertalingen configureer de AI services.]`
        }));

        setGeneratedContent({
          primary: {
            language: selectedLanguages[0],
            content: formData.sourceContent
          },
          translations: demoTranslations
        });
        toast.success(`Demo vertalingen aangemaakt voor ${selectedLanguages.length - 1} talen!`);
        return;
      }

      if (data?.success) {
        setGeneratedContent({
          primary: {
            language: selectedLanguages[0],
            content: formData.sourceContent
          },
          translations: data.translations || []
        });
        toast.success(`Content vertaald naar ${selectedLanguages.length - 1} talen!`);
      } else {
        throw new Error(data?.error || 'Vertaling mislukt');
      }

    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error(`Fout bij vertalen: ${error.message || 'Onbekende fout'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedLanguages, selectedModel]);

  // Premium access gate component
  const PremiumGate = ({ children }: { children: React.ReactNode }) => {
    if (!hasPremiumAccess) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <Card className="mx-auto max-w-md">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Premium Functionaliteit</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Deze geavanceerde AI-functies zijn alleen beschikbaar voor Premium gebruikers
                  </p>
                </div>
                <Button className="w-full" onClick={() => toast.info('Upgrade naar Premium voor toegang tot deze functies')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade naar Premium
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="opacity-30">
            {children}
          </div>
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
        <Crown className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Enterprise AI Features</h1>
          <p className="text-muted-foreground">Geavanceerde AI-tools exclusief voor Enterprise klanten</p>
        </div>
        <Badge variant={hasPremiumAccess ? "default" : "secondary"} className="ml-auto">
          <Sparkles className="h-4 w-4 mr-1" />
          {hasPremiumAccess ? "Premium Actief" : "Premium Vereist"}
        </Badge>
      </div>

      <PremiumGate>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="models" className="flex items-center gap-2" disabled={!hasPremiumAccess}>
              <Brain className="h-4 w-4" />
              AI Modellen
            </TabsTrigger>
            <TabsTrigger value="personas" className="flex items-center gap-2" disabled={!hasPremiumAccess}>
              <Wand2 className="h-4 w-4" />
              AI Personas
            </TabsTrigger>
            <TabsTrigger value="multilingual" className="flex items-center gap-2" disabled={!hasPremiumAccess}>
              <Globe className="h-4 w-4" />
              Meertalig
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2" disabled={!hasPremiumAccess}>
              <Search className="h-4 w-4" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="wordpress" className="flex items-center gap-2" disabled={!hasPremiumAccess}>
              <Send className="h-4 w-4" />
              WordPress
            </TabsTrigger>
          </TabsList>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Premium AI Modellen</CardTitle>
              <CardDescription>
                Toegang tot de meest geavanceerde AI-modellen voor superieure content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiModels.map((model) => (
                  <Card key={model.id} className={`cursor-pointer transition-all ${
                    selectedModel === model.id ? 'ring-2 ring-primary' : ''
                  }`} onClick={() => setSelectedModel(model.id)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {model.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t">
              <Form {...contentForm}>
                <form onSubmit={contentForm.handleSubmit(handleAdvancedGeneration)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={contentForm.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Onderwerp</FormLabel>
                          <FormControl>
                            <Input placeholder="Bijv. Duurzame energie oplossingen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contentForm.control}
                      name="contentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecteer type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="blog">Blog Post</SelectItem>
                              <SelectItem value="article">Artikel</SelectItem>
                              <SelectItem value="social">Social Media</SelectItem>
                              <SelectItem value="newsletter">Newsletter</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={contentForm.control}
                    name="customInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aangepaste instructies (optioneel)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Aangepaste instructies voor de AI..." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bezig met genereren...</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <Progress value={generationProgress} />
                    </div>
                  )}

                  <Button type="submit" disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Genereren...' : `Genereer met ${selectedModel.toUpperCase()}`}
                  </Button>
                </form>
              </Form>

              {generatedContent && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Gegenereerde Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Badge variant="outline">{generatedContent.primary.language.toUpperCase()}</Badge>
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{generatedContent.primary.content}</p>
                        </div>
                      </div>
                      {generatedContent.translations.map((translation, index) => (
                        <div key={index}>
                          <Badge variant="outline">{translation.language.toUpperCase()}</Badge>
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{translation.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom AI Personas</CardTitle>
              <CardDescription>
                Train je eigen AI schrijfstijlen en merkvoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...personaForm}>
                <form onSubmit={personaForm.handleSubmit(createCustomPersona)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={personaForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Persona Naam</FormLabel>
                          <FormControl>
                            <Input placeholder="Bijv. Marketing Expert" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personaForm.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schrijfstijl</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecteer toon" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="professional">Professioneel</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="authoritative">Gezaghebbend</SelectItem>
                              <SelectItem value="friendly">Vriendelijk</SelectItem>
                              <SelectItem value="technical">Technisch</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={personaForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschrijving & Expertise</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Beschrijf de expertise en schrijfstijl van deze persona..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personaForm.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expertise gebieden (kommagescheiden)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Bijv. Marketing, SEO, Content Strategy"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personaForm.control}
                    name="examples"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voorbeeldteksten</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Voeg voorbeeldteksten toe om de AI te trainen..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Aanmaken...' : 'Persona Aanmaken'}
                  </Button>
                </form>
              </Form>

              {customPersonas.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold">Je Custom Personas:</h4>
                  {customPersonas.map((persona) => (
                    <Card key={persona.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{persona.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {persona.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multilingual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meertalige Content Generatie</CardTitle>
              <CardDescription>
                Automatisch vertalen naar 25+ talen met native-level kwaliteit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Selecteer Doeltalen</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {supportedLanguages.map((lang) => (
                    <div key={lang.code} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={lang.code}
                        checked={selectedLanguages.includes(lang.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLanguages(prev => [...prev, lang.code]);
                          } else {
                            setSelectedLanguages(prev => prev.filter(l => l !== lang.code));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={lang.code} className="text-sm cursor-pointer">
                        {lang.flag} {lang.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Geselecteerde Talen:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedLanguages.map((code) => {
                    const lang = supportedLanguages.find(l => l.code === code);
                    return lang ? (
                      <Badge key={code} variant="secondary">
                        {lang.flag} {lang.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              <Form {...multilingualForm}>
                <form onSubmit={multilingualForm.handleSubmit(handleMultilingualTranslation)} className="space-y-4">
                  <FormField
                    control={multilingualForm.control}
                    name="sourceContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bron Content ({supportedLanguages.find(l => l.code === selectedLanguages[0])?.name || 'Nederlands'})</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Voer je content in om te vertalen..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isGenerating || selectedLanguages.length <= 1} className="w-full">
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Vertalen...' : `Vertaal naar ${selectedLanguages.length - 1} talen`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Gedreven Keyword Research</CardTitle>
              <CardDescription>
                Geavanceerde SEO suggesties met AI-analyse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...keywordForm}>
                <form onSubmit={keywordForm.handleSubmit(handleKeywordResearch)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={keywordForm.control}
                      name="seedKeyword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hoofd Keyword</FormLabel>
                          <FormControl>
                            <Input placeholder="Bijv. dakdekker" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={keywordForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Locatie (optioneel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Bijv. Amsterdam" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Zoeken...' : 'Start AI Keyword Research'}
                  </Button>
                </form>
              </Form>

              {keywordResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold">Gevonden Keywords:</h4>
                  <div className="grid gap-3">
                    {keywordResults.slice(0, 10).map((keyword, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{keyword.keyword}</h5>
                              <p className="text-sm text-muted-foreground">
                                Volume: {keyword.searchVolume} | Difficulty: {keyword.difficulty}%
                              </p>
                            </div>
                            <Badge variant={
                              keyword.difficulty && parseInt(keyword.difficulty) < 30 
                                ? 'default' 
                                : 'secondary'
                            }>
                              {keyword.intent}
                            </Badge>
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

        {/* WordPress Integration Tab */}
        <TabsContent value="wordpress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                WordPress Integratie
                <Badge variant="secondary" className="ml-2">Enterprise</Badge>
              </CardTitle>
              <CardDescription>
                Exclusieve WordPress automatisering voor Enterprise klanten - Verbind je site en publiceer automatisch
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Maak een App Password aan in je WordPress dashboard onder Gebruikers → Profiel
                  </p>
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
                            Je Enterprise account kan nu automatisch content publiceren naar WordPress
                          </p>
                        </div>
                      </div>
                      
                      {blogPosts.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-green-900">Recente Blog Posts</h5>
                          <div className="grid gap-2">
                            {blogPosts.slice(0, 3).map((post) => (
                              <div key={post.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-green-200">
                                <div>
                                  <p className="font-medium text-green-900 text-sm">{post.title}</p>
                                  <p className="text-xs text-green-600">
                                    {new Date(post.created_at).toLocaleDateString('nl-NL')}
                                  </p>
                                </div>
                                <WordPressPublishModal
                                  postId={post.id}
                                  postTitle={post.title}
                                  onSuccess={handleWordPressPublishSuccess}
                                >
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-600 to-green-600 text-white"
                                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    Publiceren
                                  </Button>
                                </WordPressPublishModal>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </PremiumGate>
    </div>
  );
};

export default AdvancedAIFeatures;