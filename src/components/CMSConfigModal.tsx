import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Globe, Key, Link, User } from 'lucide-react';

interface CMSConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  cmsType: 'wordpress' | 'strapi' | 'drupal';
  onSuccess: () => void;
}

interface CMSFormData {
  name: string;
  site_url: string;
  api_credentials: {
    username?: string;
    password?: string;
    api_key?: string;
    api_token?: string;
    application_password?: string;
    endpoint?: string;
    [key: string]: any;
  };
}

const CMSConfigModal: React.FC<CMSConfigModalProps> = ({ 
  isOpen, 
  onClose, 
  cmsType, 
  onSuccess 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CMSFormData>({
    name: '',
    site_url: '',
    api_credentials: {}
  });

  const getCMSConfig = () => {
    switch (cmsType) {
      case 'wordpress':
        return {
          title: 'WordPress Configureren',
          icon: <Globe className="h-5 w-5 text-blue-600" />,
          fields: [
            { key: 'username', label: 'Username', type: 'text', required: true, icon: <User className="h-4 w-4" /> },
            { key: 'app_password', label: 'Application Password', type: 'password', required: true, icon: <Key className="h-4 w-4" /> }
          ]
        };
      case 'strapi':
        return {
          title: 'Strapi Verbinden',
          icon: <Globe className="h-5 w-5 text-purple-600" />,
          fields: [
            { key: 'api_token', label: 'API Token', type: 'password', required: true, icon: <Key className="h-4 w-4" /> },
            { key: 'endpoint', label: 'API Endpoint', type: 'text', required: false, icon: <Link className="h-4 w-4" /> }
          ]
        };
      case 'drupal':
        return {
          title: 'Drupal Instellen',
          icon: <Globe className="h-5 w-5 text-orange-600" />,
          fields: [
            { key: 'username', label: 'Username', type: 'text', required: true, icon: <User className="h-4 w-4" /> },
            { key: 'password', label: 'Password', type: 'password', required: true, icon: <Key className="h-4 w-4" /> },
            { key: 'api_key', label: 'API Key (optioneel)', type: 'password', required: false, icon: <Key className="h-4 w-4" /> }
          ]
        };
      default:
        return { title: '', icon: null, fields: [] };
    }
  };

  const config = getCMSConfig();

  const handleInputChange = (key: string, value: string) => {
    if (key === 'name' || key === 'site_url') {
      setFormData(prev => ({ ...prev, [key]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        api_credentials: { ...prev.api_credentials, [key]: value }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authenticatie vereist",
          description: "Je moet ingelogd zijn om CMS integraties te configureren.",
          variant: "destructive",
        });
        return;
      }

      // Sla de integratie op in de database via de edge function
      const { data: saveResult, error: saveError } = await supabase.functions.invoke('cms-integration', {
        method: 'POST',
        body: {
          action: 'create',
          name: formData.name || `${cmsType.charAt(0).toUpperCase() + cmsType.slice(1)} Site`,
          cms_type: cmsType,
          site_url: formData.site_url,
          api_credentials: formData.api_credentials
        }
      });

      if (saveError) {
        throw saveError;
      }

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'CMS integratie kon niet worden opgeslagen');
      }

      toast({
        title: "CMS integratie geconfigureerd!",
        description: `${config.title} is succesvol verbonden en getest.`,
      });

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        site_url: '',
        api_credentials: {}
      });

    } catch (error: any) {
      console.error('CMS configuration error:', error);
      toast({
        title: "Configuratie mislukt",
        description: error.message || "Er ging iets mis bij het configureren van de CMS integratie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Integratie naam</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={`Mijn ${cmsType.charAt(0).toUpperCase() + cmsType.slice(1)} site`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_url">Website URL *</Label>
            <Input
              id="site_url"
              type="url"
              required
              value={formData.site_url}
              onChange={(e) => handleInputChange('site_url', e.target.value)}
              placeholder="https://jouwsite.nl"
            />
          </div>

          {config.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="flex items-center gap-2">
                {field.icon}
                {field.label} {field.required && '*'}
              </Label>
              <Input
                id={field.key}
                type={field.type}
                required={field.required}
                value={formData.api_credentials[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={`Voer ${field.label.toLowerCase()} in`}
              />
            </div>
          ))}

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p><strong>Tip:</strong> Voor WordPress gebruik je Application Passwords (niet je gewone wachtwoord). 
            Deze kun je aanmaken in je WordPress admin onder Gebruikers → Profiel.</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading ? 'Testen...' : 'Verbinden'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CMSConfigModal;