import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Webhook, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Globe,
  Zap,
  Copy,
  Play,
  Eye,
  Clock,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  method: "POST" | "GET" | "PUT";
  description: string;
  active: boolean;
  lastTriggered?: string;
  totalCalls: number;
}

const WebhookIntegration = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [customPayload, setCustomPayload] = useState(JSON.stringify({
    event: "blog_post_generated",
    timestamp: new Date().toISOString(),
    data: {
      title: "Sample Blog Post",
      slug: "sample-blog-post",
      status: "published",
      word_count: 1250
    }
  }, null, 2));

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: "zapier-blog",
      name: "Zapier - Blog Automation",
      url: "https://hooks.zapier.com/hooks/catch/...",
      method: "POST",
      description: "Triggers Zapier workflow when new blog posts are generated",
      active: true,
      lastTriggered: "2025-01-18T10:30:00Z",
      totalCalls: 156
    },
    {
      id: "slack-notifications",
      name: "Slack Notifications",
      url: "https://hooks.slack.com/services/...",
      method: "POST", 
      description: "Sends notifications to Slack channel when content is published",
      active: true,
      lastTriggered: "2025-01-18T09:15:00Z",
      totalCalls: 89
    },
    {
      id: "analytics-webhook",
      name: "Analytics Tracker",
      url: "https://api.analytics.com/events",
      method: "POST",
      description: "Tracks content generation events for analytics dashboard",
      active: false,
      lastTriggered: "2025-01-17T16:45:00Z",
      totalCalls: 234
    }
  ]);

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "URL vereist",
        description: "Voer een geldige webhook URL in",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log("Testing webhook:", webhookUrl);

    try {
      let payload;
      try {
        payload = JSON.parse(customPayload);
      } catch (e) {
        throw new Error("Ongeldige JSON payload");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          ...payload,
          test: true,
          triggered_from: window.location.origin,
        }),
      });

      toast({
        title: "Webhook Test Verstuurd",
        description: "Het request is verzonden. Controleer je webhook service voor de ontvangst.",
      });
    } catch (error) {
      console.error("Webhook test error:", error);
      toast({
        title: "Test Mislukt",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden bij het testen van de webhook.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === webhookId 
        ? { ...webhook, active: !webhook.active }
        : webhook
    ));
    
    const webhook = webhooks.find(w => w.id === webhookId);
    toast({
      title: webhook?.active ? "Webhook Gedeactiveerd" : "Webhook Geactiveerd",
      description: `"${webhook?.name}" is ${webhook?.active ? 'uitgeschakeld' : 'ingeschakeld'}`
    });
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Gekopieerd",
      description: "Webhook URL is naar je clipboard gekopieerd"
    });
  };

  const formatLastTriggered = (timestamp?: string) => {
    if (!timestamp) return "Nooit";
    return new Date(timestamp).toLocaleString('nl-NL');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Webhook className="h-8 w-8 text-primary" />
            Webhook Integraties
          </h2>
          <p className="text-muted-foreground">
            Verbind AutoblogifyAI met externe services via webhooks
          </p>
        </div>
      </div>

      {/* Test Webhook Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Webhook Tester
          </CardTitle>
          <CardDescription>
            Test een webhook endpoint met aangepaste data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                  />
                  <Button
                    onClick={handleTestWebhook}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Testen...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="payload">Test Payload (JSON)</Label>
                <Textarea
                  id="payload"
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Beschikbare Webhook Events
          </CardTitle>
          <CardDescription>
            Deze events kunnen webhooks triggeren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                event: "blog_post_generated",
                description: "Wanneer een nieuwe blogpost wordt gegenereerd",
                icon: FileText,
                color: "text-blue-500"
              },
              {
                event: "content_published",
                description: "Wanneer content wordt gepubliceerd",
                icon: Globe,
                color: "text-green-500"
              },
              {
                event: "csv_processed",
                description: "Wanneer CSV verwerking is voltooid",
                icon: CheckCircle,
                color: "text-purple-500"
              },
              {
                event: "template_used",
                description: "Wanneer een template wordt gebruikt",
                icon: Copy,
                color: "text-orange-500"
              },
              {
                event: "ab_test_completed",
                description: "Wanneer een A/B test is afgerond",
                icon: Eye,
                color: "text-red-500"
              },
              {
                event: "user_subscription_changed",
                description: "Bij wijzigingen in gebruikersabonnement",
                icon: Zap,
                color: "text-yellow-500"
              }
            ].map((eventType, index) => (
              <Card key={index} className="border-2 border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <eventType.icon className={`h-4 w-4 ${eventType.color}`} />
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {eventType.event}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {eventType.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configured Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Geconfigureerde Webhooks
          </CardTitle>
          <CardDescription>
            Beheer je actieve webhook integraties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{webhook.name}</h4>
                        <Badge variant={webhook.active ? "default" : "secondary"}>
                          {webhook.active ? "Actief" : "Inactief"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {webhook.method}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {webhook.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Laatste trigger: {formatLastTriggered(webhook.lastTriggered)}</span>
                        <span>Totaal calls: {webhook.totalCalls}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyWebhookUrl(webhook.url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={webhook.active ? "destructive" : "default"}
                        onClick={() => handleToggleWebhook(webhook.id)}
                      >
                        {webhook.active ? "Deactiveren" : "Activeren"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Integratie Instructies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Zapier Setup</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Ga naar Zapier en maak een nieuwe Zap aan</li>
                <li>Kies "Webhooks by Zapier" als trigger</li>
                <li>Selecteer "Catch Hook" en kopieer de webhook URL</li>
                <li>Plak de URL in het test veld hierboven en test de verbinding</li>
                <li>Configureer je gewenste actie (bv. Google Sheets, Slack, Email)</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Slack Setup</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Ga naar je Slack workspace en maak een nieuwe app aan</li>
                <li>Activeer "Incoming Webhooks" en maak een nieuwe webhook</li>
                <li>Selecteer het kanaal waar notificaties moeten verschijnen</li>
                <li>Kopieer de webhook URL en test de verbinding</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Custom Webhooks</h4>
              <p className="text-sm text-muted-foreground">
                Voor aangepaste integraties accepteren we POST requests met JSON payload. 
                Alle webhooks bevatten standaard metadata zoals timestamp, event type en gebruikersgegevens.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookIntegration;