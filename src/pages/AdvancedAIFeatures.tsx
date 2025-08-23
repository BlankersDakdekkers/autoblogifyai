import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Brain, Globe, Search, Sparkles, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIPersona {
  id: string;
  name: string;
  description: string;
  tone: string;
  expertise: string[];
  examples: string[];
}

const AdvancedAIFeatures = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['nl']);
  const [customPersonas, setCustomPersonas] = useState<AIPersona[]>([]);
  const [keywordResults, setKeywordResults] = useState<any[]>([]);

  // Premium AI Models
  const aiModels = [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Meest geavanceerd voor complexe taken' },
    { id: 'claude-opus', name: 'Claude Opus', description: 'Uitstekend voor creatieve en analytische content' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Snelle en accurate contentgeneratie' }
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

  const handleAdvancedGeneration = async (formData: any) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.functions.invoke('advanced-ai-generation', {
        body: {
          model: selectedModel,
          languages: selectedLanguages,
          persona: formData.persona,
          topic: formData.topic,
          contentType: formData.contentType,
          customInstructions: formData.customInstructions
        }
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (error) throw error;

      toast.success(`Content gegenereerd met ${selectedModel.toUpperCase()}!`);
      
      // Handle the generated content
      console.log('Generated content:', data);

    } catch (error) {
      console.error('AI Generation error:', error);
      toast.error('Er ging iets mis bij het genereren van content');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const handleKeywordResearch = async (seedKeyword: string) => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-keyword-research', {
        body: {
          seedKeyword,
          language: selectedLanguages[0] || 'nl',
          model: selectedModel
        }
      });

      if (error) throw error;

      setKeywordResults(data.keywords || []);
      toast.success(`${data.keywords?.length || 0} keywords gevonden!`);

    } catch (error) {
      console.error('Keyword research error:', error);
      toast.error('Er ging iets mis bij keyword research');
    } finally {
      setIsGenerating(false);
    }
  };

  const createCustomPersona = async (personaData: Partial<AIPersona>) => {
    try {
      const newPersona: AIPersona = {
        id: Date.now().toString(),
        name: personaData.name || '',
        description: personaData.description || '',
        tone: personaData.tone || '',
        expertise: personaData.expertise || [],
        examples: personaData.examples || []
      };

      setCustomPersonas(prev => [...prev, newPersona]);
      toast.success('Custom AI persona aangemaakt!');

    } catch (error) {
      console.error('Persona creation error:', error);
      toast.error('Er ging iets mis bij het aanmaken van persona');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <Crown className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Enterprise AI Features</h1>
          <p className="text-muted-foreground">Geavanceerde AI-tools exclusief voor Enterprise klanten</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          <Sparkles className="h-4 w-4 mr-1" />
          Premium
        </Badge>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Modellen
          </TabsTrigger>
          <TabsTrigger value="personas" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            AI Personas
          </TabsTrigger>
          <TabsTrigger value="multilingual" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Meertalig
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Keyword Research
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
                <Label>Test Premium AI Generatie</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Onderwerp</Label>
                    <Input id="topic" placeholder="Bijv. Duurzame energie oplossingen" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="article">Artikel</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Textarea placeholder="Aangepaste instructies voor de AI..." rows={3} />
                
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Bezig met genereren...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} />
                  </div>
                )}

                <Button 
                  onClick={() => handleAdvancedGeneration({
                    topic: 'test',
                    contentType: 'blog',
                    customInstructions: 'test'
                  })}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Genereer met {selectedModel.toUpperCase()}
                </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personaName">Persona Naam</Label>
                  <Input id="personaName" placeholder="Bijv. Marketing Expert" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personaTone">Schrijfstijl</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer toon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professioneel</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="authoritative">Gezaghebbend</SelectItem>
                      <SelectItem value="friendly">Vriendelijk</SelectItem>
                      <SelectItem value="technical">Technisch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personaDescription">Beschrijving & Expertise</Label>
                <Textarea 
                  id="personaDescription" 
                  placeholder="Beschrijf de expertise en schrijfstijl van deze persona..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personaExamples">Voorbeeldteksten</Label>
                <Textarea 
                  id="personaExamples" 
                  placeholder="Voeg voorbeeldteksten toe om de AI te trainen..."
                  rows={4}
                />
              </div>

              <Button onClick={() => createCustomPersona({
                name: 'Test Persona',
                description: 'Test description'
              })}>
                <Wand2 className="h-4 w-4 mr-2" />
                Persona Aanmaken
              </Button>

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

              <div className="space-y-2">
                <Label htmlFor="sourceContent">Bron Content (Nederlands)</Label>
                <Textarea 
                  id="sourceContent"
                  placeholder="Voer je Nederlandse content in om te vertalen..."
                  rows={5}
                />
              </div>

              <Button className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Vertaal naar {selectedLanguages.length} talen
              </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seedKeyword">Hoofd Keyword</Label>
                  <Input id="seedKeyword" placeholder="Bijv. dakdekker" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Locatie (optioneel)</Label>
                  <Input id="location" placeholder="Bijv. Amsterdam" />
                </div>
              </div>

              <Button 
                onClick={() => handleKeywordResearch('dakdekker')}
                disabled={isGenerating}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {isGenerating ? 'Zoeken...' : 'Start AI Keyword Research'}
              </Button>

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
                            <Badge variant={keyword.difficulty < 30 ? 'default' : 'secondary'}>
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
      </Tabs>
    </div>
  );
};

export default AdvancedAIFeatures;