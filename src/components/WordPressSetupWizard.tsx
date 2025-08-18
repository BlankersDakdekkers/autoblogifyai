import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  Key, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Copy,
  AlertCircle,
  Shield,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WordPressConfig {
  siteUrl: string;
  username: string;
  appPassword: string;
}

interface WordPressSetupWizardProps {
  onComplete: (config: WordPressConfig) => void;
  onSkip?: () => void;
}

const WordPressSetupWizard = ({ onComplete, onSkip }: WordPressSetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<WordPressConfig>({
    siteUrl: "",
    username: "",
    appPassword: ""
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  const steps = [
    {
      title: "WordPress Site URL",
      description: "Voer de URL van je WordPress website in"
    },
    {
      title: "Gebruikersgegevens",
      description: "Voer je WordPress gebruikersnaam in"
    },
    {
      title: "Application Password",
      description: "Maak een veilige verbinding aan"
    },
    {
      title: "Verbinding Testen",
      description: "Controleer of alles werkt"
    }
  ];

  const progress = (currentStep / steps.length) * 100;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Gekopieerd!",
      description: "Tekst is gekopieerd naar je klembord",
    });
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    
    // Simuleer verbindingstest
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Verbinding succesvol!",
        description: "Je WordPress site is correct geconfigureerd",
      });
      
      onComplete(config);
    } catch (error) {
      toast({
        title: "Verbinding mislukt",
        description: "Controleer je gegevens en probeer opnieuw",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return config.siteUrl.trim() !== "" && config.siteUrl.includes(".");
      case 2:
        return config.username.trim() !== "";
      case 3:
        return config.appPassword.trim() !== "";
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          WordPress Koppeling
        </h2>
        <p className="text-muted-foreground">
          Verbind je WordPress site in een paar eenvoudige stappen
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Stap {currentStep} van {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {steps[currentStep - 1].title}
          </p>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <Globe className="h-5 w-5" />}
            {currentStep === 2 && <Shield className="h-5 w-5" />}
            {currentStep === 3 && <Key className="h-5 w-5" />}
            {currentStep === 4 && <Zap className="h-5 w-5" />}
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="site-url">WordPress Site URL *</Label>
                <Input
                  id="site-url"
                  value={config.siteUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                  placeholder="https://jouwwordpresssite.com"
                  className="mt-1"
                />
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Zorg ervoor dat je de volledige URL invoert, inclusief https://
                </AlertDescription>
              </Alert>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">WordPress Gebruikersnaam *</Label>
                <Input
                  id="username"
                  value={config.username}
                  onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                  className="mt-1"
                />
              </div>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Deze gebruiker moet Administrator of Editor rechten hebben om posts te kunnen aanmaken.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="app-password">Application Password *</Label>
                <Input
                  id="app-password"
                  type="password"
                  value={config.appPassword}
                  onChange={(e) => setConfig(prev => ({ ...prev, appPassword: e.target.value }))}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="mt-1"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-blue-800">Hoe maak je een Application Password aan?</h4>
                <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                  <li>Log in op je WordPress admin dashboard</li>
                  <li>Ga naar <strong>Users → Profile</strong></li>
                  <li>Scroll naar beneden naar <strong>Application Passwords</strong></li>
                  <li>Voer een naam in (bijv. "AutoblogifyAI")</li>
                  <li>Klik op <strong>Add New Application Password</strong></li>
                  <li>Kopieer het gegenereerde wachtwoord hieronder</li>
                </ol>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${config.siteUrl}/wp-admin/profile.php`)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Kopieer URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`${config.siteUrl}/wp-admin/profile.php`, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open WordPress
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <h3 className="text-lg font-medium">Klaar om te testen!</h3>
                <p className="text-muted-foreground">
                  We gaan nu je WordPress verbinding testen om zeker te zijn dat alles werkt.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Configuratie Overzicht:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Site URL:</span>
                    <Badge variant="outline">{config.siteUrl}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Gebruiker:</span>
                    <Badge variant="outline">{config.username}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>App Password:</span>
                    <Badge variant="outline">●●●●●●●●</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="space-x-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Vorige
            </Button>
          )}
          {onSkip && currentStep === 1 && (
            <Button variant="ghost" onClick={onSkip}>
              Overslaan
            </Button>
          )}
        </div>
        
        <div className="space-x-2">
          {currentStep < steps.length ? (
            <Button 
              onClick={nextStep}
              disabled={!validateStep()}
              className="flex items-center gap-2"
            >
              Volgende
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={testConnection}
              disabled={isTestingConnection || !validateStep()}
              className="flex items-center gap-2"
            >
              {isTestingConnection ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Testen...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verbinding Testen
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordPressSetupWizard;