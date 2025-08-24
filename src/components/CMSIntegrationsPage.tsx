import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Settings, 
  TestTube, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock,
  Globe,
  Zap,
  History,
  RefreshCw,
  Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CMSIntegration {
  id: string;
  name: string;
  cms_type: string;
  site_url: string;
  is_active: boolean;
  last_sync_at: string;
  created_at: string;
  api_credentials: { configured: boolean };
}

interface PublishHistory {
  id: string;
  status: string;
  cms_post_url?: string;
  error_message?: string;
  published_at?: string;
  created_at: string;
  blog_posts: { title: string; slug: string };
  cms_integrations: { name: string; cms_type: string };
}

const CMSIntegrationsPage = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<CMSIntegration[]>([]);
  const [publishHistory, setPublishHistory] = useState<PublishHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    cms_type: '',
    site_url: '',
    credentials: {} as any
  });

  const cmsTypes = [
    { value: 'wordpress', label: 'WordPress', icon: Code },
    { value: 'drupal', label: 'Drupal', icon: Globe },
    { value: 'joomla', label: 'Joomla', icon: Globe },
    { value: 'contentful', label: 'Contentful', icon: Zap },
    { value: 'strapi', label: 'Strapi', icon: Zap },
    { value: 'ghost', label: 'Ghost', icon: Globe },
    { value: 'webflow', label: 'Webflow', icon: Zap }
  ];

  useEffect(() => {
    fetchIntegrations();
    fetchPublishHistory();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('cms-integration', {
        method: 'GET'
      });

      if (error) throw error;
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Fout",
        description: "Kon CMS integraties niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishHistory = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('cms-integration', {
        method: 'GET',
        body: { action: 'publish-history' }
      });

      if (error) throw error;
      setPublishHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching publish history:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.cms_type || !formData.site_url || !formData.credentials) {
      toast({
        title: "Incomplete gegevens",
        description: "Vul alle vereiste velden in",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('cms-integration', {
        method: 'POST',
        body: {
          action: 'test',
          cms_type: formData.cms_type,
          site_url: formData.site_url,
          api_credentials: formData.credentials
        }
      });

      if (error) throw error;
      setTestResult(data);
      
      if (data.success) {
        toast({
          title: "Verbinding succesvol",
          description: data.message,
        });
      } else {
        toast({
          title: "Verbinding mislukt",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Test mislukt",
        description: "Kon verbinding niet testen",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCreateIntegration = async () => {
    if (!formData.name || !formData.cms_type || !formData.site_url || !formData.credentials) {
      toast({
        title: "Incomplete gegevens",
        description: "Vul alle vereiste velden in",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('cms-integration', {
        method: 'POST',
        body: {
          action: 'create',
          name: formData.name,
          cms_type: formData.cms_type,
          site_url: formData.site_url,
          api_credentials: formData.credentials
        }
      });

      if (error) throw error;

      toast({
        title: "Integratie aangemaakt",
        description: data.message,
      });

      setShowCreateDialog(false);
      setFormData({ name: '', cms_type: '', site_url: '', credentials: {} });
      setTestResult(null);
      fetchIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Aanmaken mislukt",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center animate-fade-in">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">CMS integraties laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CMS Integraties
              </h1>
              <p className="text-muted-foreground mt-2">
                Beheer en configureer externe CMS verbindingen voor automatische publicatie
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Integratie
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>CMS Integratie Toevoegen</DialogTitle>
                  <DialogDescription>
                    Configureer een nieuwe externe CMS verbinding voor automatische publicatie
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Integratie Naam *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Mijn WordPress Site"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CMS Type *</Label>
                      <Select value={formData.cms_type} onValueChange={(value) => setFormData({ ...formData, cms_type: value, credentials: {} })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer CMS" />
                        </SelectTrigger>
                        <SelectContent>
                          {cmsTypes.map((cms) => (
                            <SelectItem key={cms.value} value={cms.value}>
                              <div className="flex items-center gap-2">
                                <cms.icon className="h-4 w-4" />
                                {cms.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {['wordpress', 'drupal', 'joomla', 'strapi', 'ghost'].includes(formData.cms_type) && (
                    <div className="space-y-2">
                      <Label>Site URL *</Label>
                      <Input
                        value={formData.site_url}
                        onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                        placeholder="https://jouwsite.com"
                      />
                    </div>
                  )}

                  {formData.cms_type === 'wordpress' && (
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium">WordPress API Authenticatie</h4>
                      <div className="space-y-2">
                        <Label>Gebruikersnaam *</Label>
                        <Input
                          value={formData.credentials.username || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            credentials: { ...formData.credentials, username: e.target.value }
                          })}
                          placeholder="je-gebruikersnaam"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Application Password *</Label>
                        <Input
                          type="password"
                          value={formData.credentials.app_password || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            credentials: { ...formData.credentials, app_password: e.target.value }
                          })}
                          placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                        />
                        <p className="text-xs text-muted-foreground">
                          Maak een Application Password aan in WordPress → Users → Profile
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.cms_type && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                      >
                        {testingConnection ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Testen...
                          </>
                        ) : (
                          <>
                            <TestTube className="h-4 w-4 mr-2" />
                            Test Verbinding
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {testResult && (
                    <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                        {testResult.success ? (
                          <>
                            <CheckCircle className="h-4 w-4 inline mr-2" />
                            {testResult.message}
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 inline mr-2" />
                            {testResult.error}
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleCreateIntegration} disabled={!testResult?.success}>
                    Integratie Aanmaken
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              CMS Integraties Overzicht
            </CardTitle>
            <CardDescription>
              Start met het configureren van je eerste CMS integratie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nog geen integraties</h3>
              <p className="text-muted-foreground mb-4">
                Begin met het toevoegen van je eerste CMS integratie om automatisch te kunnen publiceren
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Eerste Integratie Toevoegen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CMSIntegrationsPage;