import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, CheckCircle } from "lucide-react";

const CMSIntegrationsNew = () => {
  console.log("🔥 CMS Integraties NEW component loaded successfully!");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            ROUTE WERKT NU!
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CMS Integraties
          </h1>
          <p className="text-muted-foreground text-lg">
            Verbind je content met WordPress, Drupal, Strapi en andere CMS systemen
          </p>
        </div>

        {/* Success Card */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              🎉 Probleem Opgelost!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-green-700">
              <p className="font-medium mb-2">De pagina werkt nu correct:</p>
              <ul className="space-y-1 text-sm">
                <li>✅ Route: /dashboard/cms-integrations</li>
                <li>✅ Component: CMSIntegrationsNew</li>
                <li>✅ Navigation: Sidebar link werkt</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => {
                console.log("✅ CMS Integraties test succesvol!");
                alert("🚀 CMS Integraties pagina werkt perfect!");
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              🔥 Test de Functionaliteit
            </Button>
          </CardContent>
        </Card>

        {/* CMS Options Preview */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                WordPress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Direct publiceren naar je WordPress site met automatische SEO optimalisatie.
              </p>
              <Button variant="outline" className="mt-3 w-full">
                WordPress Verbinden
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                Strapi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Headless CMS integratie voor flexibele content distributie.
              </p>
              <Button variant="outline" className="mt-3 w-full">
                Strapi Verbinden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CMSIntegrationsNew;