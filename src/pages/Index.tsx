import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Zap, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Play,
  Star,
  Globe,
  BarChart3,
  Mic,
  Search,
  Wand2,
  Rocket,
  Shield,
  Clock
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Search,
      title: "AI Keyword Research",
      description: "Ontdek high-value keywords met Google Ads API integratie",
      badge: "Nieuw"
    },
    {
      icon: Mic,
      title: "Voice-to-Text Input",
      description: "Spreek je content ideeën in voor snelle verwerking",
      badge: "AI Powered"
    },
    {
      icon: FileText,
      title: "Automatische Blog Generatie",
      description: "Van CSV naar SEO-geoptimaliseerde blogposts in minuten",
      badge: "Core"
    },
    {
      icon: BarChart3,
      title: "Content Analytics",
      description: "Real-time kwaliteitscore en SEO analyse",
      badge: "Pro"
    },
    {
      icon: Globe,
      title: "Multi-Platform Publishing",
      description: "WordPress, Webflow en andere CMS integraties",
      badge: "Coming Soon"
    },
    {
      icon: Wand2,
      title: "AI Website Builder",
      description: "Complete websites genereren met AI en publiceren",
      badge: "Beta"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Blog Posts Gegenereerd" },
    { value: "500+", label: "Actieve Gebruikers" },
    { value: "95%", label: "Tijdsbesparing" },
    { value: "4.9/5", label: "Gebruiker Rating" }
  ];

  const testimonials = [
    {
      name: "Marc van der Berg",
      role: "SEO Specialist",
      company: "Digital Growth Agency",
      content: "AutoblogifyAI heeft onze content productie 10x sneller gemaakt. We genereren nu 50+ SEO-posts per week.",
      rating: 5
    },
    {
      name: "Sarah Janssen",
      role: "Marketing Manager", 
      company: "TechStart BV",
      content: "De keyword research functie is goud waard. Echte Google data in een paar seconden.",
      rating: 5
    },
    {
      name: "Erik de Vries",
      role: "Content Creator",
      company: "Freelancer",
      content: "Voice input functie is game-changing. Ik spreek mijn ideeën in tijdens het rijden en heb thuis complete posts klaar.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AutoblogifyAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button>
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/20">
            <Zap className="mr-1 h-3 w-3" />
            Powered by AI
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Van Idee naar 
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}Gepubliceerde Content{" "}
            </span>
            in Minuten
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            AutoblogifyAI transformeert je content workflow met AI-powered keyword research, 
            voice input en automatische blog generatie. Bespaar 95% van je tijd.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                <Play className="mr-2 h-5 w-5" />
                Gratis Proberen
              </Button>
            </Link>
            <Link to="/dashboard/keywords">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Search className="mr-2 h-5 w-5" />
                Keyword Research
              </Button>
            </Link>
          </div>

          {/* Demo Video Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20 flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-lg font-medium text-primary">Demo Video</p>
                <p className="text-sm text-muted-foreground">Zie AutoblogifyAI in actie</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Alles wat je nodig hebt voor 
              <span className="text-primary"> Content Success</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Van keyword research tot publicatie - one complete content workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative hover:shadow-lg transition-shadow border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Zo Werkt Het
            </h2>
            <p className="text-xl text-muted-foreground">
              Van keyword tot gepubliceerde content in 4 eenvoudige stappen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Keyword Research",
                description: "Ontdek high-value keywords met onze AI-powered research tool",
                icon: Search
              },
              {
                step: "2", 
                title: "Content Input",
                description: "Spreek je ideeën in of upload een CSV met je content planning",
                icon: Mic
              },
              {
                step: "3",
                title: "AI Generatie",
                description: "Onze AI genereert SEO-geoptimaliseerde blogposts met afbeeldingen",
                icon: Wand2
              },
              {
                step: "4",
                title: "Publiceren",
                description: "Direct publiceren naar WordPress, of download als Markdown",
                icon: Rocket
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                  {step.step}
                </div>
                <step.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                {index < 3 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-6 w-6 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Wat Onze Gebruikers Zeggen
            </h2>
            <p className="text-xl text-muted-foreground">
              Meer dan 500+ content creators vertrouwen op AutoblogifyAI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} bij {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Klaar om je Content Workflow te Revolutioneren?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start vandaag nog met AutoblogifyAI en ervaar hoe AI je content productie transformeert
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                <Rocket className="mr-2 h-5 w-5" />
                Start Nu Gratis
              </Button>
            </Link>
            <Link to="/dashboard/academy">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <FileText className="mr-2 h-5 w-5" />
                Leer Meer
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Gratis te proberen
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              Geen creditcard vereist
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              Setup in 2 minuten
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">AutoblogifyAI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                De toekomst van content creatie, powered by AI
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard/keywords" className="hover:text-foreground">Keyword Research</Link></li>
                <li><Link to="/dashboard/voice" className="hover:text-foreground">Voice Input</Link></li>
                <li><Link to="/dashboard/generate" className="hover:text-foreground">Content Generator</Link></li>
                <li><Link to="/dashboard/ai-generator" className="hover:text-foreground">Website Builder</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard/academy" className="hover:text-foreground">Academy</Link></li>
                <li><Link to="/dashboard/analytics" className="hover:text-foreground">Analytics</Link></li>
                <li><Link to="/dashboard/affiliate" className="hover:text-foreground">Partner Program</Link></li>
                <li><Link to="/dashboard/integrations" className="hover:text-foreground">Integraties</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AutoblogifyAI. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;