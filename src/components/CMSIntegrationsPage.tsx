import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Plus } from "lucide-react";

const CMSIntegrationsPage = () => {
  console.log("CMS Integraties pagina wordt geladen");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CMS Integraties - Test Pagina
              </h1>
              <p className="text-muted-foreground mt-2">
                Deze pagina test of de routing werkt voor CMS integraties
              </p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Test Button
            </Button>
          </div>
        </div>

        {/* Test Content */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Routing Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg">
                ✅ Als je deze pagina ziet, werkt de routing correct!
              </p>
              <p className="text-muted-foreground">
                URL: /dashboard/cms-integrations
              </p>
              <p className="text-muted-foreground">
                Check de console voor debug informatie.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Debug Informatie:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Component: CMSIntegrationsPage</li>
                  <li>• Locatie: src/components/CMSIntegrationsPage.tsx</li>
                  <li>• Route: /dashboard/cms-integrations</li>
                  <li>• Import in App.tsx: ✅</li>
                </ul>
              </div>

              <Button 
                onClick={() => {
                  console.log("Test button geklikt!");
                  alert("CMS Integraties pagina werkt!");
                }}
                className="w-full"
              >
                Test Functionaliteit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CMSIntegrationsPage;