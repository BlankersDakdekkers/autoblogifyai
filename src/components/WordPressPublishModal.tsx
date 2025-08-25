import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Globe, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Key,
  Settings,
  Loader2,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WordPressConfig {
  siteUrl: string;
  username: string;
  appPassword: string;
}

interface WordPressPublishModalProps {
  postId: string;
  postTitle: string;
  children: React.ReactNode;
  onSuccess?: () => void;
}

const WordPressPublishModal = ({ postId, postTitle, children, onSuccess }: WordPressPublishModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [config, setConfig] = useState<WordPressConfig>({
    siteUrl: "",
    username: "",
    appPassword: ""
  });
  const [lastUsedConfig, setLastUsedConfig] = useState<WordPressConfig | null>(null);
  const { toast } = useToast();

  // Load saved WordPress config from localStorage
  const loadSavedConfig = () => {
    try {
      const saved = localStorage.getItem('wordpress_config');
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        setConfig(parsedConfig);
        setLastUsedConfig(parsedConfig);
      }
    } catch (error) {
      console.error('Error loading WordPress config:', error);
    }
  };

  // Save WordPress config to localStorage
  const saveConfig = (newConfig: WordPressConfig) => {
    try {
      localStorage.setItem('wordpress_config', JSON.stringify(newConfig));
      setLastUsedConfig(newConfig);
    } catch (error) {
      console.error('Error saving WordPress config:', error);
    }
  };

  const handlePublish = async () => {
    if (!config.siteUrl || !config.username || !config.appPassword) {
      toast({
        title: "Ontbrekende gegevens",
        description: "Vul alle WordPress gegevens in",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('wordpress-publish', {
        body: {
          postId,
          wordpressConfig: config
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        // Save successful config
        saveConfig(config);
        
        toast({
          title: "Succesvol Gepubliceerd! 🎉",
          description: `"${postTitle}" is gepubliceerd op WordPress`,
        });
        
        setIsOpen(false);
        onSuccess?.();
      } else {
        throw new Error(data.error || 'Onbekende fout bij publiceren');
      }
    } catch (error) {
      console.error('Error publishing to WordPress:', error);
      toast({
        title: "Publicatie Mislukt",
        description: error instanceof Error ? error.message : "Kon niet publiceren naar WordPress",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !lastUsedConfig) {
      loadSavedConfig();
    }
  };

  const isConfigValid = config.siteUrl && config.username && config.appPassword;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Publiceer naar WordPress
          </DialogTitle>
          <DialogDescription>
            Publiceer "{postTitle}" rechtstreeks naar je WordPress website
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* WordPress Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-4 w-4" />
                WordPress Instellingen
              </CardTitle>
              <CardDescription>
                Voer je WordPress site gegevens in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="wp-url">WordPress Site URL *</Label>
                <Input
                  id="wp-url"
                  value={config.siteUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                  placeholder="https://jouwwordpresssite.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="wp-username">Gebruikersnaam *</Label>
                <Input
                  id="wp-username"
                  value={config.username}
                  onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="wp-password">Application Password *</Label>
                <Input
                  id="wp-password"
                  type="password"
                  value={config.appPassword}
                  onChange={(e) => setConfig(prev => ({ ...prev, appPassword: e.target.value }))}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maak een Application Password aan in WordPress → Users → Profile
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          {/* WordPress Layout Options Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Uitgebreide WordPress Layout</AlertTitle>
            <AlertDescription className="text-sm space-y-2">
              <p><strong>Automatische Features:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Uitgelichte foto:</strong> Wordt automatisch geüpload naar WordPress media library</li>
                <li><strong>CTA blokken:</strong> Professioneel gestyled volgens WordPress block editor</li>
                <li><strong>FAQ sectie:</strong> Met Schema.org markup voor betere SEO rankings</li>
                <li><strong>Tags:</strong> Worden automatisch aangemaakt in WordPress</li>
                <li><strong>SEO meta:</strong> Yoast SEO compatible fields voor optimale vindbaarheid</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Status Indicator */}
          {lastUsedConfig && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Laatst succesvol gepubliceerd naar: {lastUsedConfig.siteUrl}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPublishing}
            >
              Annuleren
            </Button>
            <Button
              onClick={handlePublish}
              disabled={!isConfigValid || isPublishing}
              className="flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publiceren...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Publiceer naar WordPress
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WordPressPublishModal;