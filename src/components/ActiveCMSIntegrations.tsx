import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Trash2, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react';

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

interface ActiveCMSIntegrationsProps {
  refreshTrigger: number;
}

const ActiveCMSIntegrations: React.FC<ActiveCMSIntegrationsProps> = ({ refreshTrigger }) => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<CMSIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('cms-integration', {
        method: 'GET'
      });

      if (error) {
        throw error;
      }

      setIntegrations(data.integrations || []);
    } catch (error: any) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Fout bij ophalen integraties",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [refreshTrigger]);

  const handleTestConnection = async (integration: CMSIntegration) => {
    setTestingIntegration(integration.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('cms-integration', {
        method: 'POST',
        body: {
          action: 'test',
          cms_type: integration.cms_type,
          site_url: integration.site_url,
          // We can't get actual credentials, so we'll test with the stored ones
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Verbinding succesvol!",
          description: data.message || `${integration.name} werkt correct.`,
        });
      } else {
        toast({
          title: "Verbinding mislukt",
          description: data.error || "Er is een probleem met de verbinding.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      toast({
        title: "Test mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTestingIntegration(null);
    }
  };

  const handleDeleteIntegration = async (integration: CMSIntegration) => {
    if (!confirm(`Weet je zeker dat je de integratie "${integration.name}" wilt verwijderen?`)) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('cms-integration', {
        method: 'DELETE',
        body: { id: integration.id }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Integratie verwijderd",
        description: `${integration.name} is succesvol verwijderd.`,
      });

      fetchIntegrations();
    } catch (error: any) {
      console.error('Delete integration error:', error);
      toast({
        title: "Verwijderen mislukt",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCMSIcon = (cmsType: string) => {
    const iconClass = "h-5 w-5";
    switch (cmsType) {
      case 'wordpress':
        return <Globe className={`${iconClass} text-blue-600`} />;
      case 'strapi':
        return <Globe className={`${iconClass} text-purple-600`} />;
      case 'drupal':
        return <Globe className={`${iconClass} text-orange-600`} />;
      default:
        return <Globe className={`${iconClass} text-gray-600`} />;
    }
  };

  const getCMSTypeLabel = (cmsType: string) => {
    switch (cmsType) {
      case 'wordpress':
        return 'WordPress';
      case 'strapi':
        return 'Strapi';
      case 'drupal':
        return 'Drupal';
      default:
        return cmsType.charAt(0).toUpperCase() + cmsType.slice(1);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Actieve Integraties</h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Actieve Integraties</h3>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">Geen integraties gevonden</h4>
            <p className="text-muted-foreground mb-4">
              Configureer je eerste CMS integratie om te beginnen met publiceren.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Actieve Integraties ({integrations.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchIntegrations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Vernieuwen
        </Button>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCMSIcon(integration.cms_type)}
                  <div>
                    <div className="text-base font-medium">{integration.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {getCMSTypeLabel(integration.cms_type)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={integration.is_active ? "default" : "secondary"}>
                    {integration.is_active ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Actief
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactief
                      </>
                    )}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href={integration.site_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {integration.site_url}
                  </a>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Laatst gesynchroniseerd: {integration.last_sync_at ? 
                    new Date(integration.last_sync_at).toLocaleString('nl-NL') : 
                    'Nog niet gesynchroniseerd'
                  }
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestConnection(integration)}
                    disabled={testingIntegration === integration.id}
                    className="flex-1"
                  >
                    {testingIntegration === integration.id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="h-4 w-4 mr-2" />
                    )}
                    {testingIntegration === integration.id ? 'Testen...' : 'Test Verbinding'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteIntegration(integration)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActiveCMSIntegrations;