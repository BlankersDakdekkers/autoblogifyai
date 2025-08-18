import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { 
  Layout, 
  Palette, 
  Code, 
  Zap, 
  Plus, 
  Eye, 
  Settings,
  Globe,
  Database,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Websites Overview Component
const WebsitesOverview = () => {
  const { toast } = useToast();
  const [newWebsiteName, setNewWebsiteName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("business-pro");

  const mockWebsites = [
    { 
      id: 1, 
      name: "Dakdekker Portfolio", 
      url: "dakdekker-amsterdam.nl", 
      status: "Live", 
      lastUpdated: "2 uur geleden",
      template: "Business Pro"
    },
    { 
      id: 2, 
      name: "SEO Blog Hub", 
      url: "seo-blog.com", 
      status: "Draft", 
      lastUpdated: "1 dag geleden",
      template: "Blog Starter"
    },
    { 
      id: 3, 
      name: "Local Services", 
      url: "lokale-diensten.nl", 
      status: "Live", 
      lastUpdated: "3 dagen geleden",
      template: "Service Directory"
    },
  ];

  const templates = [
    { id: "business-pro", name: "Business Pro" },
    { id: "blog-starter", name: "Blog Starter" },
    { id: "service-directory", name: "Service Directory" }
  ];

  const handleCreateWebsite = () => {
    if (!newWebsiteName.trim()) {
      toast({
        title: "Fout",
        description: "Voer een website naam in",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Website Aangemaakt! 🎉",
      description: `"${newWebsiteName}" wordt nu opgezet met het ${templates.find(t => t.id === selectedTemplate)?.name} template`
    });
    
    setNewWebsiteName("");
  };

  const handlePreview = (website: any) => {
    toast({
      title: `Preview: ${website.name}`,
      description: "Opening preview in new tab..."
    });
    // In real app: window.open(website.url, '_blank');
  };

  const handleEdit = (website: any) => {
    toast({
      title: `Bewerken: ${website.name}`,
      description: "Website editor wordt geladen..."
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Websites</h2>
          <p className="text-muted-foreground">
            Beheer al je websites en projecten op één plek
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nieuwe Website
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Website Aanmaken</DialogTitle>
              <DialogDescription>
                Kies een naam en template voor je nieuwe website
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="website-name">Website Naam</Label>
                <Input
                  id="website-name"
                  value={newWebsiteName}
                  onChange={(e) => setNewWebsiteName(e.target.value)}
                  placeholder="Mijn geweldige website"
                />
              </div>
              <div>
                <Label htmlFor="template-select">Template</Label>
                <select
                  id="template-select"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCreateWebsite} className="w-full">
                Website Aanmaken
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockWebsites.map((website) => (
          <Card key={website.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{website.name}</CardTitle>
                <Badge variant={website.status === "Live" ? "default" : "secondary"}>
                  {website.status}
                </Badge>
              </div>
              <CardDescription>{website.url}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div>Template: {website.template}</div>
                <div>Bijgewerkt: {website.lastUpdated}</div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handlePreview(website)}
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleEdit(website)}
                >
                  <Settings className="h-3 w-3" />
                  Bewerk
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Templates Component
const Templates = () => {
  const { toast } = useToast();

  const handleUseTemplate = (template: any) => {
    toast({
      title: `Template: ${template.name}`,
      description: "Website wordt aangemaakt met dit template..."
    });
  };

  const handlePreviewTemplate = (template: any) => {
    toast({
      title: `Preview: ${template.name}`,
      description: "Template preview wordt geladen..."
    });
  };

  const templates = [
    {
      id: 1,
      name: "Business Pro",
      description: "Professionele bedrijfswebsite met portfolio en contact",
      category: "Business",
      preview: "/api/placeholder/300/200"
    },
    {
      id: 2,
      name: "Blog Starter",
      description: "SEO-geoptimaliseerde blog template met AutoblogifyAI integratie",
      category: "Blog",
      preview: "/api/placeholder/300/200"
    },
    {
      id: 3,
      name: "Service Directory",
      description: "Lokale dienstverlening met city-landingspagina's",
      category: "Directory",
      preview: "/api/placeholder/300/200"
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
        <p className="text-muted-foreground">
          Professionele website templates ready voor AutoblogifyAI
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20" />
              <div className="relative z-10 text-center">
                <Palette className="h-12 w-12 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium text-primary">{template.name}</div>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleUseTemplate(template)}
                >
                  Gebruik Template
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handlePreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Components Component
const ComponentsLibrary = () => {
  const { toast } = useToast();

  const handleCreateComponent = () => {
    toast({
      title: "Nieuw Component",
      description: "Component editor wordt geladen..."
    });
  };

  const handlePreviewComponent = (component: any) => {
    toast({
      title: `Preview: ${component.name}`,
      description: "Component preview wordt getoond..."
    });
  };

  const handleEditComponent = (component: any) => {
    toast({
      title: `Bewerken: ${component.name}`,
      description: "Component editor wordt geladen..."
    });
  };

  const components = [
    { name: "Hero Sectie", category: "Headers", usage: 45 },
    { name: "Contact Form", category: "Forms", usage: 32 },
    { name: "Service Cards", category: "Content", usage: 28 },
    { name: "Testimonials", category: "Social Proof", usage: 19 },
    { name: "FAQ Sectie", category: "Content", usage: 15 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Componenten</h2>
          <p className="text-muted-foreground">
            Herbruikbare UI componenten voor je websites
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={handleCreateComponent}
        >
          <Plus className="h-4 w-4" />
          Nieuw Component
        </Button>
      </div>

      <div className="grid gap-4">
        {components.map((component, index) => (
          <Card key={index}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{component.name}</h3>
                  <p className="text-sm text-muted-foreground">{component.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {component.usage}x gebruikt
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreviewComponent(component)}
                  >
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditComponent(component)}
                  >
                    Bewerk
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

// Deployment Component
const Deployment = () => {
  const deployments = [
    { site: "Dakdekker Portfolio", status: "Success", time: "2 min geleden", url: "dakdekker-amsterdam.nl" },
    { site: "SEO Blog Hub", status: "Building", time: "Nu bezig", url: "seo-blog.com" },
    { site: "Local Services", status: "Success", time: "1 uur geleden", url: "lokale-diensten.nl" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Deployment</h2>
        <p className="text-muted-foreground">
          Beheer je website deployments en hosting
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Sites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 deze week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Deze maand</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recente Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deployments.map((deployment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{deployment.site}</p>
                  <p className="text-sm text-muted-foreground">{deployment.url}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">{deployment.time}</div>
                  <Badge variant={deployment.status === "Success" ? "default" : "secondary"}>
                    {deployment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Integrations Component  
const Integrations = () => {
  const { toast } = useToast();

  const handleConnectIntegration = (name: string) => {
    toast({
      title: `${name} Integratie`,
      description: "Configuratie wizard geopend"
    });
  };

  const integrations = [
    { name: "Google Sheets", status: "Connected", description: "CSV data voor AutoblogifyAI" },
    { name: "Netlify", status: "Connected", description: "Website hosting en deployment" },
    { name: "GitHub", status: "Disconnected", description: "Code repository en version control" },
    { name: "Google Analytics", status: "Connected", description: "Website analytics en tracking" },
    { name: "Google Search Console", status: "Disconnected", description: "SEO prestaties en indexatie monitoring" },
    { name: "Bing Webmaster Tools", status: "Disconnected", description: "Bing zoekresultaten en crawling data" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integraties</h2>
        <p className="text-muted-foreground">
          Beheer je externe services en API verbindingen
        </p>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration, index) => (
          <Card key={index}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={integration.status === "Connected" ? "default" : "secondary"}>
                  {integration.status}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleConnectIntegration(integration.name)}
                >
                  {integration.status === "Connected" ? "Configureer" : "Verbind"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main Website Builder Component
const WebsiteBuilder = () => {
  const location = useLocation();
  const path = location.pathname;

  // Determine which component to render based on current path
  if (path.includes('/deployment')) return <Deployment />;
  if (path.includes('/integrations')) return <Integrations />;
  
  // Default to websites overview
  return <WebsitesOverview />;
};

export default WebsiteBuilder;