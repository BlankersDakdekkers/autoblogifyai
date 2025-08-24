import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Database, 
  Globe, 
  Mail, 
  MessageSquare, 
  Zap, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Github,
  Chrome,
  Webhook,
  CreditCard,
  BarChart3,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState({
    supabase: { connected: true, status: "active" },
    github: { connected: false, status: "disconnected" },
    openai: { connected: false, status: "disconnected" },
    google: { connected: false, status: "disconnected" },
    stripe: { connected: false, status: "disconnected" },
    mailchimp: { connected: false, status: "disconnected" },
    slack: { connected: false, status: "disconnected" },
    zapier: { connected: false, status: "disconnected" },
    wordpress: { connected: false, status: "disconnected" },
    analytics: { connected: false, status: "disconnected" }
  });

  const [apiKeys, setApiKeys] = useState({
    openai: "",
    google: "",
    elevenlabs: "",
    anthropic: ""
  });

  const { toast } = useToast();

  // Check for OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          const redirectUri = `${window.location.origin}/integrations`;
          
          const { data, error } = await supabase.functions.invoke('google-oauth', {
            body: { action: 'exchangeCode', code, redirectUri }
          });

          if (error) throw error;

          setIntegrations(prev => ({
            ...prev,
            google: { connected: true, status: "active" }
          }));

          toast({
            title: "Google Workspace verbonden!",
            description: `Succesvol verbonden als ${data.userInfo.email}`,
          });

          // Clean up URL
          window.history.replaceState({}, document.title, '/integrations');
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Verbinding mislukt",
            description: "Er ging iets mis bij het verbinden met Google Workspace.",
            variant: "destructive",
          });
        }
      }
    };

    handleOAuthCallback();
  }, [toast]);

  // Load existing Google integration
  useEffect(() => {
    const loadGoogleIntegration = async () => {
      const { data, error } = await supabase
        .from('google_integrations')
        .select('*')
        .maybeSingle();

      if (data && !error) {
        setIntegrations(prev => ({
          ...prev,
          google: { connected: true, status: "active" }
        }));
      }
    };

    loadGoogleIntegration();
  }, []);

  const handleConnect = async (integration: string) => {
    if (integration === 'google') {
      try {
        toast({
          title: "Google Workspace OAuth",
          description: "Omleiden naar Google voor autorisatie...",
        });

        const redirectUri = `${window.location.origin}/integrations`;
        
        const { data, error } = await supabase.functions.invoke('google-oauth', {
          body: { action: 'getAuthUrl', redirectUri }
        });

        if (error) throw error;

        window.location.href = data.authUrl;
      } catch (error) {
        console.error('OAuth error:', error);
        toast({
          title: "Fout",
          description: "Kon niet verbinden met Google Workspace. Controleer of de secrets zijn geconfigureerd.",
          variant: "destructive",
        });
      }
      return;
    }
    
    setIntegrations(prev => ({
      ...prev,
      [integration]: { connected: true, status: "active" }
    }));
    
    toast({
      title: "Integratie succesvol",
      description: `${integration} is succesvol verbonden!`,
    });
  };

  const handleDisconnect = (integration: string) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: { connected: false, status: "disconnected" }
    }));
    
    toast({
      title: "Integratie losgekoppeld",
      description: `${integration} is losgekoppeld.`,
    });
  };

  const coreIntegrations = [
    {
      id: "supabase",
      name: "Supabase",
      description: "Database, authenticatie en backend services",
      icon: Database,
      category: "Backend",
      required: true,
      features: ["Database", "Auth", "Storage", "Edge Functions"]
    },
    {
      id: "github",
      name: "GitHub",
      description: "Code repository en version control",
      icon: Github,
      category: "Development",
      required: true,
      features: ["Code Sync", "Version Control", "CI/CD", "Backup"]
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "AI content generatie en processing",
      icon: Chrome,
      category: "AI",
      required: false,
      features: ["GPT-4", "Content Generation", "Text Analysis"]
    },
    {
      id: "google",
      name: "Google Workspace",
      description: "Google Sheets, Drive en Analytics",
      icon: Globe,
      category: "Productivity",
      required: false,
      features: ["Sheets API", "Drive", "Analytics", "Search Console"]
    }
  ];

  const businessIntegrations = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Betalingen en abonnementen",
      icon: CreditCard,
      category: "Payments",
      features: ["Subscriptions", "One-time payments", "Invoicing"]
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Email marketing en automatie",
      icon: Mail,
      category: "Marketing",
      features: ["Email Campaigns", "Automation", "Analytics"]
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team communicatie en notificaties",
      icon: MessageSquare,
      category: "Communication",
      features: ["Notifications", "Team Chat", "Alerts"]
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Workflow automatisering",
      icon: Zap,
      category: "Automation",
      features: ["Webhooks", "Triggers", "Actions"]
    }
  ];

  const contentIntegrations = [
    {
      id: "wordpress",
      name: "WordPress",
      description: "Direct publiceren naar WordPress sites",
      icon: Globe,
      category: "CMS",
      features: ["Auto Publishing", "Media Sync", "SEO Meta"]
    },
    {
      id: "analytics",
      name: "Google Analytics",
      description: "Traffic en performance tracking",
      icon: BarChart3,
      category: "Analytics",
      features: ["Traffic Data", "Goal Tracking", "Reports"]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-700 border-green-200">Actief</Badge>;
      case "disconnected":
        return <Badge variant="secondary">Niet verbonden</Badge>;
      case "error":
        return <Badge variant="destructive">Fout</Badge>;
      default:
        return <Badge variant="secondary">Onbekend</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "disconnected":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const IntegrationCard = ({ integration, integrationData }: any) => (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:scale-105">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 group-hover:from-primary/30 group-hover:to-accent/20 transition-all duration-300 border border-primary/20">
              <integration.icon className="h-8 w-8 text-primary group-hover:animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{integration.name}</CardTitle>
              <CardDescription className="text-sm group-hover:text-muted-foreground/80 transition-colors">
                {integration.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon(integrationData.status)}
            {getStatusBadge(integrationData.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold text-foreground mb-2 block">Features:</Label>
            <div className="flex flex-wrap gap-2">
              {integration.features.map((feature: string) => (
                <Badge 
                  key={feature} 
                  variant="outline" 
                  className="text-xs border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2 border-t border-border/50">
            {integrationData.connected ? (
              <>
                <Button variant="outline" size="sm" className="flex-1 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300">
                  <Settings className="h-4 w-4 mr-2" />
                  Configureren
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDisconnect(integration.id)}
                  className="hover:bg-destructive/90 transition-all duration-300"
                >
                  Loskoppelen
                </Button>
              </>
            ) : (
              <Button 
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300" 
                size="sm"
                onClick={() => handleConnect(integration.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verbinden
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-secondary/5 to-accent/5 min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Enhanced Header */}
      <div className="relative">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
            <Settings className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Integraties
            </h2>
            <p className="text-lg text-muted-foreground mt-1">
              Verbind externe services om AutoblogifyAI krachtig te maken
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Status Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">Actieve Integraties</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
              <CheckCircle2 className="h-5 w-5 text-primary group-hover:animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary animate-fade-in">
              {Object.values(integrations).filter(i => i.connected).length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              van {Object.keys(integrations).length} beschikbaar
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${(Object.values(integrations).filter(i => i.connected).length / Object.keys(integrations).length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium group-hover:text-green-600 transition-colors">Backend Services</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10 group-hover:from-green-500/30 group-hover:to-green-500/20 transition-all duration-300">
              <Database className="h-5 w-5 text-green-600 group-hover:animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 animate-fade-in">Actief</div>
            <p className="text-sm text-muted-foreground mt-1">
              Supabase verbonden
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600">Live status</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium group-hover:text-orange-600 transition-colors">AI Services</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10 group-hover:from-orange-500/30 group-hover:to-orange-500/20 transition-all duration-300">
              <Chrome className="h-5 w-5 text-orange-600 group-hover:animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 animate-fade-in">Setup</div>
            <p className="text-sm text-muted-foreground mt-1">
              API keys configureren
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-xs text-orange-600">Configuratie vereist</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium group-hover:text-accent transition-colors">Webhooks</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-300">
              <Webhook className="h-5 w-5 text-accent group-hover:animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent animate-fade-in">3</div>
            <p className="text-sm text-muted-foreground mt-1">
              actieve endpoints
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-xs text-accent">Realtime data</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="core" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="core">Core Services</TabsTrigger>
          <TabsTrigger value="business">Business Tools</TabsTrigger>
          <TabsTrigger value="content">Content & CMS</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Essentiële Integraties</h3>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Deze integraties zijn vereist voor de kernfunctionaliteit van AutoblogifyAI.
              </AlertDescription>
            </Alert>
            <div className="grid gap-6 md:grid-cols-2">
              {coreIntegrations.map((integration) => (
                <IntegrationCard 
                  key={integration.id} 
                  integration={integration} 
                  integrationData={integrations[integration.id as keyof typeof integrations]}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Business Integraties</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {businessIntegrations.map((integration) => (
                <IntegrationCard 
                  key={integration.id} 
                  integration={integration} 
                  integrationData={integrations[integration.id as keyof typeof integrations]}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Content & Publishing</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {contentIntegrations.map((integration) => (
                <IntegrationCard 
                  key={integration.id} 
                  integration={integration} 
                  integrationData={integrations[integration.id as keyof typeof integrations]}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">API Keys Management</h3>
            <div className="space-y-6">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  API keys worden veilig opgeslagen en geëncrypteerd. Voer alleen geldige keys in.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>OpenAI API Key</CardTitle>
                    <CardDescription>Voor GPT-4 content generatie</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="openai-key">API Key</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={apiKeys.openai}
                        onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                      />
                    </div>
                    <Button>Opslaan</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Google API Key</CardTitle>
                    <CardDescription>Voor Sheets, Analytics en Search Console</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="google-key">API Key</Label>
                      <Input
                        id="google-key"
                        type="password"
                        placeholder="AIza..."
                        value={apiKeys.google}
                        onChange={(e) => setApiKeys({...apiKeys, google: e.target.value})}
                      />
                    </div>
                    <Button>Opslaan</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ElevenLabs API Key</CardTitle>
                    <CardDescription>Voor text-to-speech functionaliteit</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="elevenlabs-key">API Key</Label>
                      <Input
                        id="elevenlabs-key"
                        type="password"
                        placeholder="sk_..."
                        value={apiKeys.elevenlabs}
                        onChange={(e) => setApiKeys({...apiKeys, elevenlabs: e.target.value})}
                      />
                    </div>
                    <Button>Opslaan</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Anthropic API Key</CardTitle>
                    <CardDescription>Voor Claude AI alternatief</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="anthropic-key">API Key</Label>
                      <Input
                        id="anthropic-key"
                        type="password"
                        placeholder="sk-ant-..."
                        value={apiKeys.anthropic}
                        onChange={(e) => setApiKeys({...apiKeys, anthropic: e.target.value})}
                      />
                    </div>
                    <Button>Opslaan</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>
            Configureer webhooks voor real-time integraties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Content Published</div>
                <div className="text-sm text-muted-foreground">
                  https://api.autoblogify.ai/webhooks/content-published
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <Badge className="bg-green-500/10 text-green-700">Actief</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">User Signup</div>
                <div className="text-sm text-muted-foreground">
                  https://api.autoblogify.ai/webhooks/user-signup
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <Badge className="bg-green-500/10 text-green-700">Actief</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Payment Successful</div>
                <div className="text-sm text-muted-foreground">
                  https://api.autoblogify.ai/webhooks/payment-success
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch />
                <Badge variant="secondary">Inactief</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPage;