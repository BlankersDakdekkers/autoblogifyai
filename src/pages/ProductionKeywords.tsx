import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/responsive-components';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  Target,
  TrendingUp,
  BarChart3,
  Eye,
  Users,
  DollarSign,
  Award,
  Lightbulb,
  Zap,
  Download,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Globe,
  Brain,
  Rocket,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Crown,
  Database,
  LineChart
} from 'lucide-react';

interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trend: 'up' | 'down' | 'stable';
  competitorCount: number;
  opportunity: number;
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional';
  seasonality?: string;
  relatedQuestions: string[];
  topCompetitors: string[];
}

const ProductionKeywords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    volume: 'all',
    intent: 'all',
    trend: 'all'
  });
  const [sortBy, setSortBy] = useState<'volume' | 'difficulty' | 'opportunity' | 'cpc'>('opportunity');

  // Mock data for demonstration
  const mockKeywordData: KeywordData[] = [
    {
      keyword: 'dakbedekking amsterdam',
      searchVolume: 1200,
      difficulty: 45,
      cpc: 3.20,
      trend: 'up',
      competitorCount: 8,
      opportunity: 85,
      intent: 'commercial',
      seasonality: 'Consistent',
      relatedQuestions: [
        'Hoeveel kost dakbedekking per m2?',
        'Welke dakbedekking is het beste?',
        'Hoe lang gaat dakbedekking mee?'
      ],
      topCompetitors: ['dakdekker-amsterdam.nl', 'dak-expert.nl', 'amsterdam-dakbedekking.com']
    },
    {
      keyword: 'loodgieter amsterdam spoedservice',
      searchVolume: 890,
      difficulty: 38,
      cpc: 4.50,
      trend: 'up',
      competitorCount: 12,
      opportunity: 92,
      intent: 'transactional',
      seasonality: 'Peak: Winter',
      relatedQuestions: [
        'Loodgieter amsterdam 24/7?',
        'Spoedservice loodgieter kosten?',
        'Betrouwbare loodgieter amsterdam?'
      ],
      topCompetitors: ['loodgieter-amsterdam-24-7.nl', 'spoed-loodgieter.com']
    },
    {
      keyword: 'cv ketel onderhoud',
      searchVolume: 2100,
      difficulty: 52,
      cpc: 2.80,
      trend: 'stable',
      competitorCount: 15,
      opportunity: 78,
      intent: 'commercial',
      seasonality: 'Peak: September-November',
      relatedQuestions: [
        'Hoe vaak cv ketel onderhoud?',
        'Cv ketel onderhoud kosten?',
        'Cv ketel onderhoud checklist?'
      ],
      topCompetitors: ['cv-onderhoud.nl', 'warmte-service.com', 'ketel-expert.nl']
    },
    {
      keyword: 'zonnepanelen installatie',
      searchVolume: 3200,
      difficulty: 68,
      cpc: 5.20,
      trend: 'up',
      competitorCount: 25,
      opportunity: 65,
      intent: 'commercial',
      seasonality: 'Peak: March-August',
      relatedQuestions: [
        'Zonnepanelen installatie kosten?',
        'Hoelang duurt zonnepanelen installatie?',
        'Zonnepanelen op plat dak?'
      ],
      topCompetitors: ['zonnepanelen-nederland.nl', 'solar-installatie.com']
    }
  ];

  const performKeywordResearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Zoekterm vereist",
        description: "Voer een zoekterm in om keyword research te starten.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Filter mock data based on search term
      const filteredKeywords = mockKeywordData.filter(kw => 
        kw.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerm.toLowerCase().split(' ').some(term => 
          kw.keyword.toLowerCase().includes(term)
        )
      );

      setKeywords(filteredKeywords);
      
      toast({
        title: "Keyword research voltooid!",
        description: `${filteredKeywords.length} keywords gevonden voor "${searchTerm}"`,
      });
    } catch (error) {
      toast({
        title: "Fout bij keyword research",
        description: "Er ging iets mis bij het ophalen van keyword data.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const filteredAndSortedKeywords = useMemo(() => {
    let filtered = keywords.filter(kw => {
      if (filters.difficulty !== 'all') {
        const diff = kw.difficulty;
        switch (filters.difficulty) {
          case 'easy': if (diff > 30) return false; break;
          case 'medium': if (diff <= 30 || diff > 60) return false; break;
          case 'hard': if (diff <= 60) return false; break;
        }
      }
      
      if (filters.volume !== 'all') {
        const vol = kw.searchVolume;
        switch (filters.volume) {
          case 'low': if (vol > 500) return false; break;
          case 'medium': if (vol <= 500 || vol > 2000) return false; break;
          case 'high': if (vol <= 2000) return false; break;
        }
      }
      
      if (filters.intent !== 'all' && kw.intent !== filters.intent) return false;
      if (filters.trend !== 'all' && kw.trend !== filters.trend) return false;
      
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'volume': return b.searchVolume - a.searchVolume;
        case 'difficulty': return a.difficulty - b.difficulty;
        case 'cpc': return b.cpc - a.cpc;
        case 'opportunity': return b.opportunity - a.opportunity;
        default: return 0;
      }
    });
  }, [keywords, filters, sortBy]);

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'text-green-700 bg-green-100 border-green-200';
    if (difficulty <= 60) return 'text-orange-700 bg-orange-100 border-orange-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 30) return 'Makkelijk';
    if (difficulty <= 60) return 'Gemiddeld';
    return 'Moeilijk';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-600" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'commercial': return 'bg-blue-100 text-blue-700';
      case 'transactional': return 'bg-green-100 text-green-700';
      case 'informational': return 'bg-purple-100 text-purple-700';
      case 'navigational': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ResponsiveContainer maxWidth="7xl">
      <div className="py-8 space-y-8">
        {/* Professional Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur">
                  <Target className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">AI Keyword Research</h1>
                  <p className="text-white/90 text-lg">
                    Ontdek high-impact keywords met AI-powered analyse en concurrent intelligence
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge className="bg-green-500/20 text-green-100 border-green-300/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Live Data
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5" />
                  <span className="font-medium">Database</span>
                </div>
                <div className="text-2xl font-bold">500M+</div>
                <div className="text-sm text-white/80">Keywords</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">Coverage</span>
                </div>
                <div className="text-2xl font-bold">25+</div>
                <div className="text-sm text-white/80">Landen</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-5 w-5" />
                  <span className="font-medium">Updates</span>
                </div>
                <div className="text-2xl font-bold">Real-time</div>
                <div className="text-sm text-white/80">Data refresh</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Accuracy</span>
                </div>
                <div className="text-2xl font-bold">95%+</div>
                <div className="text-sm text-white/80">Data precision</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Keyword Research Starten
            </CardTitle>
            <CardDescription>
              Voer je primaire zoekterm in om gerelateerde keywords, concurrentie-analyse en trends te ontdekken
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search-term">Zoekterm</Label>
                <Input
                  id="search-term"
                  placeholder="bijv. dakbedekking amsterdam, loodgieter, cv ketel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performKeywordResearch()}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={performKeywordResearch}
                  disabled={isSearching}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-glow"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyseren...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Research
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {isSearching && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>AI analyse in uitvoering...</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Analyseren van zoekvolume, concurrentie en trends...
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {keywords.length > 0 && (
          <Tabs defaultValue="keywords" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="keywords">Keywords ({filteredAndSortedKeywords.length})</TabsTrigger>
              <TabsTrigger value="analysis">Analyse</TabsTrigger>
              <TabsTrigger value="competitors">Concurrenten</TabsTrigger>
              <TabsTrigger value="opportunities">Kansen</TabsTrigger>
            </TabsList>

            <TabsContent value="keywords" className="space-y-6">
              {/* Filters */}
              <Card className="border-0 bg-gradient-to-br from-card to-card/80">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Filter className="h-4 w-4" />
                    Filters & Sortering
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveGrid columns={{ xs: 2, sm: 4, lg: 5 }} gap="sm">
                    <div>
                      <Label className="text-xs">Moeilijkheid</Label>
                      <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle</SelectItem>
                          <SelectItem value="easy">Makkelijk (≤30)</SelectItem>
                          <SelectItem value="medium">Gemiddeld (31-60)</SelectItem>
                          <SelectItem value="hard">Moeilijk ({`>`}60)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Zoekvolume</Label>
                      <Select value={filters.volume} onValueChange={(value) => setFilters(prev => ({ ...prev, volume: value }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle</SelectItem>
                          <SelectItem value="low">Laag (≤500)</SelectItem>
                          <SelectItem value="medium">Gemiddeld (501-2K)</SelectItem>
                          <SelectItem value="high">Hoog ({`>`}2K)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Intent</Label>
                      <Select value={filters.intent} onValueChange={(value) => setFilters(prev => ({ ...prev, intent: value }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="transactional">Transactional</SelectItem>
                          <SelectItem value="informational">Informational</SelectItem>
                          <SelectItem value="navigational">Navigational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Trend</Label>
                      <Select value={filters.trend} onValueChange={(value) => setFilters(prev => ({ ...prev, trend: value }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle</SelectItem>
                          <SelectItem value="up">Stijgend</SelectItem>
                          <SelectItem value="stable">Stabiel</SelectItem>
                          <SelectItem value="down">Dalend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Sorteren op</Label>
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="opportunity">Kans Score</SelectItem>
                          <SelectItem value="volume">Zoekvolume</SelectItem>
                          <SelectItem value="difficulty">Moeilijkheid</SelectItem>
                          <SelectItem value="cpc">CPC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </ResponsiveGrid>
                </CardContent>
              </Card>

              {/* Keyword Results */}
              <div className="space-y-4">
                {filteredAndSortedKeywords.map((keyword, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {keyword.keyword}
                            </h3>
                            <Badge className={getIntentColor(keyword.intent)}>
                              {keyword.intent}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(keyword.trend)}
                              <span className="text-xs text-muted-foreground capitalize">
                                {keyword.trend === 'up' ? 'Stijgend' : keyword.trend === 'down' ? 'Dalend' : 'Stabiel'}
                              </span>
                            </div>
                          </div>
                          
                          <ResponsiveGrid columns={{ xs: 2, sm: 4, lg: 6 }} gap="sm">
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">Zoekvolume</div>
                              <div className="font-semibold text-primary">{keyword.searchVolume.toLocaleString()}</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">Moeilijkheid</div>
                              <Badge className={`${getDifficultyColor(keyword.difficulty)} border`}>
                                {keyword.difficulty}/100
                              </Badge>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">CPC</div>
                              <div className="font-semibold text-green-600">€{keyword.cpc.toFixed(2)}</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">Concurrenten</div>
                              <div className="font-semibold">{keyword.competitorCount}</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">Kans Score</div>
                              <div className="flex items-center justify-center gap-1">
                                <div className="font-semibold text-orange-600">{keyword.opportunity}/100</div>
                                {keyword.opportunity >= 80 && <Star className="h-3 w-3 text-orange-500" />}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">Seizoen</div>
                              <div className="text-xs font-medium">{keyword.seasonality}</div>
                            </div>
                          </ResponsiveGrid>
                          
                          {keyword.relatedQuestions.length > 0 && (
                            <div className="pt-3 border-t">
                              <div className="text-xs text-muted-foreground mb-2">Gerelateerde vragen:</div>
                              <div className="flex flex-wrap gap-2">
                                {keyword.relatedQuestions.slice(0, 2).map((question, qIndex) => (
                                  <Badge key={qIndex} variant="outline" className="text-xs">
                                    {question}
                                  </Badge>
                                ))}
                                {keyword.relatedQuestions.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{keyword.relatedQuestions.length - 2} meer
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const isSelected = selectedKeywords.includes(keyword.keyword);
                              if (isSelected) {
                                setSelectedKeywords(prev => prev.filter(k => k !== keyword.keyword));
                              } else {
                                setSelectedKeywords(prev => [...prev, keyword.keyword]);
                              }
                            }}
                            className={selectedKeywords.includes(keyword.keyword) ? 'bg-primary text-primary-foreground' : ''}
                          >
                            {selectedKeywords.includes(keyword.keyword) ? 'Geselecteerd' : 'Selecteer'}
                          </Button>
                          
                          <Button size="sm" variant="ghost">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis">
              <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
                <Card className="border-0 bg-gradient-to-br from-card to-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-primary" />
                      Trend Analyse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          85% van de gevonden keywords toont een stijgende trend in de afgelopen 3 maanden.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Gemiddelde moeilijkheid</span>
                          <Badge className="bg-orange-100 text-orange-700">
                            {Math.round(keywords.reduce((acc, kw) => acc + kw.difficulty, 0) / keywords.length)}/100
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Totaal zoekvolume</span>
                          <span className="font-semibold text-primary">
                            {keywords.reduce((acc, kw) => acc + kw.searchVolume, 0).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Gemiddelde CPC</span>
                          <span className="font-semibold text-green-600">
                            €{(keywords.reduce((acc, kw) => acc + kw.cpc, 0) / keywords.length).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-card to-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      AI Aanbevelingen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-800">High Opportunity</h4>
                            <p className="text-sm text-green-700">
                              Focus op "loodgieter amsterdam spoedservice" - hoge kans score met goede conversie potentie.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-800">Content Strategy</h4>
                            <p className="text-sm text-blue-700">
                              Creëer FAQ-gerichte content voor informatieve keywords om featured snippets te targeten.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-orange-800">Seasonal Timing</h4>
                            <p className="text-sm text-orange-700">
                              CV ketel gerelateerde content optimaliseren voor september-november piek periode.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ResponsiveGrid>
            </TabsContent>

            <TabsContent value="competitors">
              <Alert className="mb-6">
                <Crown className="h-4 w-4" />
                <AlertDescription>
                  Concurrentie-analyse toont de top spelers voor je geselecteerde keywords.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {keywords.slice(0, 2).map((keyword, index) => (
                  <Card key={index} className="border-0 bg-gradient-to-br from-card to-card/80">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Concurrenten voor "{keyword.keyword}"
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {keyword.topCompetitors.map((competitor, cIndex) => (
                          <div key={cIndex} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">#{cIndex + 1}</Badge>
                              <span className="font-medium">{competitor}</span>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4 mr-2" />
                              Analyseren
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="opportunities">
              <div className="space-y-6">
                <Alert>
                  <Rocket className="h-4 w-4" />
                  <AlertDescription>
                    Keywords gerangschikt op kans score - de beste mogelijkheden om snel resultaat te behalen.
                  </AlertDescription>
                </Alert>
                
                <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
                  {keywords
                    .filter(kw => kw.opportunity >= 80)
                    .map((keyword, index) => (
                      <Card key={index} className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-green-800 mb-1">{keyword.keyword}</h3>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-200 text-green-800">
                                  {keyword.opportunity}/100 Kans Score
                                </Badge>
                                <Star className="h-4 w-4 text-orange-500" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-green-700">
                            <div className="flex justify-between">
                              <span>Zoekvolume:</span>
                              <span className="font-medium">{keyword.searchVolume.toLocaleString()}/maand</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Moeilijkheid:</span>
                              <span className="font-medium">{getDifficultyLabel(keyword.difficulty)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Potentieel verkeer:</span>
                              <span className="font-medium">~{Math.round(keyword.searchVolume * 0.3).toLocaleString()}/maand</span>
                            </div>
                          </div>
                          
                          <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" size="sm">
                            Content Maken
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </ResponsiveGrid>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Action Bar */}
        {selectedKeywords.length > 0 && (
          <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 border-0 bg-gradient-to-r from-primary to-primary-glow text-white shadow-xl z-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedKeywords.length} keyword{selectedKeywords.length !== 1 ? 's' : ''} geselecteerd
                </span>
                <Separator orientation="vertical" className="h-6 bg-white/30" />
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exporteren
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Content Genereren
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default ProductionKeywords;