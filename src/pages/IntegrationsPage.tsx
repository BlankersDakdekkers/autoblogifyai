import { useState } from "react";
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

  const handleConnect = (integration: string) => {
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
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <integration.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(integrationData.status)}
            {getStatusBadge(integrationData.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Features:</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {integration.features.map((feature: string) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            {integrationData.connected ? (
              <>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Configureren
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDisconnect(integration.id)}
                >
                  Loskoppelen
                </Button>
              </>
            ) : (
              <Button 
                className="flex-1" 
                size="sm"
                onClick={() => handleConnect(integration.id)}
              >
                Verbinden
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integraties</h2>
        <p className="text-muted-foreground">
          Verbind externe services om AutoblogifyAI krachtig te maken
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Integraties</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(integrations).filter(i => i.connected).length}
            </div>
            <p className="text-xs text-muted-foreground">
              van {Object.keys(integrations).length} beschikbaar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backend Services</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Actief</div>
            <p className="text-xs text-muted-foreground">
              Supabase verbonden
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Services</CardTitle>
            <Chrome className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Setup</div>
            <p className="text-xs text-muted-foreground">
              API keys configureren
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              actieve endpoints
            </p>
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