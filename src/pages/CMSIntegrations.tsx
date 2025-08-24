import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const CMSIntegrations = () => {
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

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze integratie wilt verwijderen?')) return;

    try {
      const { error } = await supabase.functions.invoke('cms-integration', {
        method: 'DELETE',
        body: { id }
      });

      if (error) throw error;

      toast({
        title: "Integratie verwijderd",
        description: "CMS integratie is succesvol verwijderd",
      });

      fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Verwijderen mislukt",
        description: "Kon integratie niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const renderCredentialsForm = () => {
    switch (formData.cms_type) {
      case 'wordpress':
        return (
          <>
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
          </>
        );

      case 'drupal':
        return (
          <>
            <div className="space-y-2">
              <Label>Gebruikersnaam *</Label>
              <Input
                value={formData.credentials.username || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, username: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Wachtwoord *</Label>
              <Input
                type="password"
                value={formData.credentials.password || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, password: e.target.value }
                })}
              />
            </div>
          </>
        );

      case 'joomla':
        return (
          <div className="space-y-2">
            <Label>API Token *</Label>
            <Input
              type="password"
              value={formData.credentials.api_token || ''}
              onChange={(e) => setFormData({
                ...formData,
                credentials: { ...formData.credentials, api_token: e.target.value }
              })}
              placeholder="jouw-api-token"
            />
          </div>
        );

      case 'contentful':
        return (
          <>
            <div className="space-y-2">
              <Label>Space ID *</Label>
              <Input
                value={formData.credentials.space_id || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, space_id: e.target.value }
                })}
                placeholder="jouw-space-id"
              />
            </div>
            <div className="space-y-2">
              <Label>Content Management API Access Token *</Label>
              <Input
                type="password"
                value={formData.credentials.access_token || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, access_token: e.target.value }
                })}
                placeholder="CFPAT-..."
              />
            </div>
          </>
        );

      case 'strapi':
        return (
          <div className="space-y-2">
            <Label>API Token *</Label>
            <Input
              type="password"
              value={formData.credentials.api_token || ''}
              onChange={(e) => setFormData({
                ...formData,
                credentials: { ...formData.credentials, api_token: e.target.value }
              })}
              placeholder="jouw-api-token"
            />
          </div>
        );

      case 'ghost':
        return (
          <div className="space-y-2">
            <Label>Admin API Key *</Label>
            <Input
              type="password"
              value={formData.credentials.admin_api_key || ''}
              onChange={(e) => setFormData({
                ...formData,
                credentials: { ...formData.credentials, admin_api_key: e.target.value }
              })}
              placeholder="jouw-admin-api-key"
            />
          </div>
        );

      case 'webflow':
        return (
          <div className="space-y-2">
            <Label>API Token *</Label>
            <Input
              type="password"
              value={formData.credentials.api_token || ''}
              onChange={(e) => setFormData({
                ...formData,
                credentials: { ...formData.credentials, api_token: e.target.value }
              })}
              placeholder="jouw-api-token"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
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

                  {formData.cms_type && (
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium">API Authenticatie</h4>
                      {renderCredentialsForm()}
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

        {/* Tabs */}
        <Tabs defaultValue="integrations" className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="integrations">Integraties</TabsTrigger>
            <TabsTrigger value="history">Publicatie Historie</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-4">
            {integrations.length === 0 ? (
              <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
                <CardContent className="p-8 text-center">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Geen CMS integraties</h3>
                  <p className="text-muted-foreground mb-4">
                    Begin met het toevoegen van je eerste CMS integratie om automatisch te kunnen publiceren
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Eerste Integratie Toevoegen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => {
                  const cmsType = cmsTypes.find(t => t.value === integration.cms_type);
                  const Icon = cmsType?.icon || Globe;

                  return (
                    <Card key={integration.id} className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                              <CardDescription className="capitalize">
                                {integration.cms_type}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={integration.is_active ? "default" : "secondary"}>
                            {integration.is_active ? "Actief" : "Inactief"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">URL:</span> {integration.site_url}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Aangemaakt:</span> {' '}
                          {new Date(integration.created_at).toLocaleDateString('nl-NL')}
                        </div>
                        {integration.last_sync_at && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Laatste sync:</span> {' '}
                            {new Date(integration.last_sync_at).toLocaleDateString('nl-NL')}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4 mr-1" />
                            Bewerken
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Bekijken
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteIntegration(integration.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Publicatie Historie
                    </CardTitle>
                    <CardDescription>
                      Overzicht van alle publicaties naar externe CMS systemen
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchPublishHistory}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Vernieuwen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {publishHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Geen publicatie historie</h3>
                    <p className="text-muted-foreground">
                      Zodra je posts publiceert naar CMS systemen, verschijnen ze hier
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Post</TableHead>
                          <TableHead>CMS</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Gepubliceerd</TableHead>
                          <TableHead>Acties</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {publishHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.blog_posts.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  /{item.blog_posts.slug}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="capitalize">{item.cms_integrations.cms_type}</div>
                                <div className="text-sm text-muted-foreground">
                                  ({item.cms_integrations.name})
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}
                                <Badge variant={getStatusBadgeVariant(item.status)}>
                                  {item.status === 'success' ? 'Succesvol' : 
                                   item.status === 'failed' ? 'Mislukt' : 'Bezig'}
                                </Badge>
                              </div>
                              {item.error_message && (
                                <div className="text-xs text-red-600 mt-1">
                                  {item.error_message}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.published_at ? 
                                new Date(item.published_at).toLocaleDateString('nl-NL') : 
                                '-'
                              }
                            </TableCell>
                            <TableCell>
                              {item.cms_post_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={item.cms_post_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CMSIntegrations;