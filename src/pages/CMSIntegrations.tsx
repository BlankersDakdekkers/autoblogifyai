import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, CheckCircle, Settings } from "lucide-react";

const CMSIntegrations = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
            <CheckCircle className="h-6 w-6" />
            ✅ ROUTE WERKT NU!
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            CMS Integraties
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Verbind je AutoblogifyAI content direct met populaire CMS platformen voor naadloze publicatie.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 border-blue-200 hover:border-blue-400 transform hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg">WordPress</div>
                  <div className="text-sm text-muted-foreground font-normal">Meest populair</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Direct publiceren naar WordPress met automatische SEO meta tags, featured images en categorieën.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  REST API integratie
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Bulk publicatie support
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  SEO optimalisatie
                </div>
              </div>
              <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50 font-semibold">
                <Settings className="h-4 w-4 mr-2" />
                WordPress Configureren
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-purple-200 hover:border-purple-400 transform hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg">Strapi</div>
                  <div className="text-sm text-muted-foreground font-normal">Headless CMS</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Headless CMS integratie voor flexibele content distributie naar multiple frontends.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  GraphQL/REST API
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Custom content types
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Multi-platform sync
                </div>
              </div>
              <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50 font-semibold">
                <Settings className="h-4 w-4 mr-2" />
                Strapi Verbinden
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-orange-200 hover:border-orange-400 transform hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg">Drupal</div>
                  <div className="text-sm text-muted-foreground font-normal">Enterprise</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Enterprise CMS integratie met krachtige taxonomy en workflow management.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  JSON:API integratie
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Advanced taxonomies
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Enterprise security
                </div>
              </div>
              <Button variant="outline" className="w-full border-orange-200 hover:bg-orange-50 font-semibold">
                <Settings className="h-4 w-4 mr-2" />
                Drupal Instellen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CMSIntegrations;