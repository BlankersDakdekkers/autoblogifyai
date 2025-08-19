import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { 
  Star, 
  TrendingUp, 
  Users, 
  Building2, 
  Calendar,
  ExternalLink,
  Quote,
  ArrowRight,
  CheckCircle,
  BarChart3
} from "lucide-react";

const CustomerCases = () => {
  useSEO({
    title: "Klantencases - AutoblogifyAI Succesverhalen",
    description: "Ontdek hoe bedrijven hun content productie verhoogden met 300% en kosten verlaagden met 80% dankzij AutoblogifyAI.",
    keywords: "klantencases, succesverhalen, content marketing, SEO resultaten, blog automatisering"
  });

  const cases = [
    {
      id: 1,
      company: "TechStartup Pro",
      industry: "SaaS Technology",
      challenge: "Gebrek aan consistente content voor 12 verschillende markten",
      solution: "Geautomatiseerde lokale SEO content met stad-specifieke variaties",
      results: {
        content: "240+ blogposts per maand",
        time: "85% tijdsbesparing",
        traffic: "340% meer organisch verkeer",
        leads: "180% meer leads"
      },
      quote: "AutoblogifyAI transformeerde onze content strategie compleet. We gingen van 8 posts per maand naar 240+ posts, allemaal SEO-geoptimaliseerd.",
      author: "Sarah van der Berg",
      position: "Marketing Manager",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      tags: ["SaaS", "Lokale SEO", "B2B"]
    },
    {
      id: 2,
      company: "Zonnepanelen Nederland",
      industry: "Duurzame Energie",
      challenge: "Content nodig voor 50+ Nederlandse steden voor lokale SEO",
      solution: "Bulk contentgeneratie met lokale targeting en FAQ-integratie",
      results: {
        content: "500+ lokale landingspagina's",
        time: "92% minder tijd per post",
        traffic: "450% groei organisch verkeer",
        conversions: "120% meer conversies"
      },
      quote: "De ROI was onmiddellijk zichtbaar. We konden eindelijk schalen zonder een heel contentteam aan te nemen.",
      author: "Marco Jansen",
      position: "CEO",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
      tags: ["Lokale SEO", "Duurzame Energie", "B2C"]
    },
    {
      id: 3,
      company: "Digital Marketing Bureau",
      industry: "Marketing Services",
      challenge: "Content leveren voor 25+ klanten met verschillende niches",
      solution: "White-label content productie met merkaanpassing per klant",
      results: {
        content: "1200+ posts per maand",
        clients: "3x meer klanten kunnen bedienen",
        revenue: "250% omzetgroei",
        margin: "40% hogere marges"
      },
      quote: "We kunnen nu 3x zoveel klanten bedienen met hetzelfde team. AutoblogifyAI is onze geheime wapen geworden.",
      author: "Lisa Vermeulen",
      position: "Creative Director",
      image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=300&fit=crop",
      tags: ["White-label", "Bureau", "Schaling"]
    }
  ];

  const stats = [
    { label: "Actieve Klanten", value: "500+", icon: Users },
    { label: "Content Gegenereerd", value: "50,000+", icon: BarChart3 },
    { label: "Gemiddelde Tijdsbesparing", value: "87%", icon: TrendingUp },
    { label: "Klant Tevredenheid", value: "4.9/5", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-6 animate-fade-in">
            <Badge variant="outline" className="mb-4">
              <Star className="h-4 w-4 mr-2" />
              Bewezen Resultaten
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-gradient">
              Klant Succesverhalen
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ontdek hoe bedrijven hun content productie verhoogden met <span className="text-primary font-semibold">300%</span> en 
              kosten verlaagden met <span className="text-primary font-semibold">80%</span> dankzij AutoblogifyAI.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover-scale">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <div className="text-3xl font-heading font-bold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Cases */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="space-y-16">
            {cases.map((caseStudy, index) => (
              <Card key={caseStudy.id} className="overflow-hidden hover-scale">
                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                  {/* Image */}
                  <div className={`relative h-64 md:h-auto ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <img 
                      src={caseStudy.image} 
                      alt={caseStudy.company}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-heading font-bold">{caseStudy.company}</h3>
                      <p className="text-sm opacity-90">{caseStudy.industry}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-8 ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {caseStudy.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>

                    {/* Challenge & Solution */}
                    <div className="space-y-6 mb-8">
                      <div>
                        <h4 className="font-semibold mb-2 text-primary">Uitdaging</h4>
                        <p className="text-muted-foreground">{caseStudy.challenge}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-primary">Oplossing</h4>
                        <p className="text-muted-foreground">{caseStudy.solution}</p>
                      </div>
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {Object.entries(caseStudy.results).map(([key, value]) => (
                        <div key={key} className="text-center p-4 bg-secondary/30 rounded-lg">
                          <div className="text-2xl font-heading font-bold text-gradient mb-1">
                            {value}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quote */}
                    <div className="relative p-6 bg-gradient-to-r from-primary/10 to-transparent rounded-lg">
                      <Quote className="h-8 w-8 text-primary/30 absolute top-2 left-2" />
                      <blockquote className="text-lg italic leading-relaxed pl-8">
                        "{caseStudy.quote}"
                      </blockquote>
                      <div className="mt-4 pl-8">
                        <div className="font-semibold">{caseStudy.author}</div>
                        <div className="text-sm text-muted-foreground">{caseStudy.position}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 via-secondary/10 to-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Klaar om jouw eigen succesverhaal te schrijven?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sluit je aan bij meer dan 500 bedrijven die hun content strategie transformeerden met AutoblogifyAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
              Start Gratis Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Plan Demo
              <Calendar className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerCases;