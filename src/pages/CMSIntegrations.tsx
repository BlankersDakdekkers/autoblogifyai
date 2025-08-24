import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Plus } from "lucide-react";

const CMSIntegrations = () => {
  console.log("CMS Integraties pagina wordt geladen - vanuit pages folder");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CMS Integraties - Werkende Pagina!
              </h1>
              <p className="text-muted-foreground mt-2">
                Deze pagina test of de routing werkt voor CMS integraties (vanuit pages folder)
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
              Routing Test - FIXED!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg text-green-600 font-semibold">
                ✅ SUCCESS! Deze pagina werkt nu correct!
              </p>
              <p className="text-muted-foreground">
                URL: /dashboard/cms-integrations
              </p>
              <p className="text-muted-foreground">
                Component locatie: src/pages/CMSIntegrations.tsx
              </p>
              
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-green-800">🎉 Probleem Opgelost!</h3>
                <ul className="text-sm space-y-1 text-green-700">
                  <li>• Component: CMSIntegrations</li>
                  <li>• Locatie: src/pages/CMSIntegrations.tsx (correct!)</li>
                  <li>• Route: /dashboard/cms-integrations ✅</li>
                  <li>• Import in App.tsx: Bijgewerkt ✅</li>
                </ul>
              </div>

              <Button 
                onClick={() => {
                  console.log("Test button geklikt - alles werkt!");
                  alert("🎉 CMS Integraties pagina werkt perfect!");
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                🚀 Test de Functionaliteit
              </Button>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Volgende Stappen:</h4>
                <p className="text-sm text-blue-700">
                  Nu de routing werkt, kunnen we de volledige CMS integratie functionaliteit toevoegen 
                  met WordPress, Drupal, Strapi en andere CMS systemen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CMSIntegrations;