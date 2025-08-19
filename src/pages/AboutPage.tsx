import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { 
  Zap, 
  Users, 
  Target, 
  Award,
  Lightbulb,
  TrendingUp,
  Globe,
  Shield,
  Heart,
  Rocket,
  Code,
  Brain
} from "lucide-react";

const AboutPage = () => {
  useSEO({
    title: "Over AutoblogifyAI - Onze Missie & Visie",
    description: "Leer meer over AutoblogifyAI, ons team en onze missie om content creatie te revolutionaliseren met AI. Opgericht in 2024 voor content automatisering.",
    keywords: "over ons, about, AutoblogifyAI team, missie, visie, AI content, bedrijfsinfo"
  });

  const values = [
    {
      icon: Lightbulb,
      title: "Innovatie",
      description: "Wij pushen de grenzen van wat mogelijk is met AI en automatisering"
    },
    {
      icon: Users,
      title: "Klantgericht",
      description: "Onze klanten staan centraal in alles wat wij doen en ontwikkelen"
    },
    {
      icon: Shield,
      title: "Transparantie",
      description: "Open communicatie over onze technologie, processen en pricing"
    },
    {
      icon: TrendingUp,
      title: "Kwaliteit",
      description: "Wij leveren alleen content van de hoogste kwaliteit en standaarden"
    }
  ];

  const milestones = [
    {
      year: "2024",
      quarter: "Q1",
      title: "Bedrijf Opgericht",
      description: "AutoblogifyAI werd opgericht met de visie om content creatie te democratiseren"
    },
    {
      year: "2024",
      quarter: "Q2",
      title: "MVP Gelanceerd",
      description: "Eerste versie van ons platform ging live met basis AI content generatie"
    },
    {
      year: "2024",
      quarter: "Q3",
      title: "100+ Klanten",
      description: "Bereikte 100 actieve klanten en lanceerde bulk content processing"
    },
    {
      year: "2024",
      quarter: "Q4",
      title: "Internationale Uitbreiding",
      description: "Uitbreiding naar meerdere talen en markten, waaronder Duits en Engels"
    }
  ];

  const team = [
    {
      name: "Alex van der Berg",
      position: "CEO & Co-Founder",
      expertise: "AI Strategy & Business Development",
      description: "10+ jaar ervaring in AI en SaaS. Voormalig Head of AI bij TechCorp.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Sarah Janssen",
      position: "CTO & Co-Founder",
      expertise: "Machine Learning & Architecture",
      description: "PhD in Machine Learning. Expert in NLP en content generatie algoritmes.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Mike de Vries",
      position: "Head of Product",
      expertise: "UX Design & Product Strategy",
      description: "15 jaar ervaring in product design voor SaaS platforms en AI tools.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Lisa Chen",
      position: "Lead AI Engineer",
      expertise: "NLP & Deep Learning",
      description: "Specialist in natural language processing en content optimalisatie.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
    }
  ];

  const stats = [
    { label: "Klanten Wereldwijd", value: "500+", icon: Users },
    { label: "Content Gegenereerd", value: "1M+", icon: Code },
    { label: "Talen Ondersteund", value: "12", icon: Globe },
    { label: "Tevredenheidscore", value: "4.9/5", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <Badge variant="outline" className="mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Opgericht in 2024
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-gradient mb-6">
              Over AutoblogifyAI
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Wij geloven dat elke ondernemer toegang moet hebben tot hoogwaardige content, 
              ongeacht budget of technische kennis. Daarom ontwikkelden wij de meest intuïtive 
              en krachtige AI content platform.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="h-6 w-6 mr-3 text-primary" />
                  Onze Missie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  AutoblogifyAI democratiseert content creatie door AI-gestuurde tools aan te bieden 
                  die iedereen kan gebruiken. Wij maken het mogelijk voor bedrijven van elke grootte 
                  om professionele, SEO-geoptimaliseerde content te creëren zonder technische expertise.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">Toegankelijke AI voor iedereen</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">Tijdsbesparing van 80%+ voor content teams</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">Betaalbare enterprise-grade functionaliteit</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Rocket className="h-6 w-6 mr-3 text-primary" />
                  Onze Visie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Wij streven naar een wereld waarin content creatie volledig geautomatiseerd is, 
                  maar toch persoonlijk en authentiek blijft. Onze visie is om de #1 AI content 
                  platform te worden voor MKB en enterprise klanten wereldwijd.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span className="text-sm">Marktleider in AI content automatisering</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span className="text-sm">1 miljoen gebruikers in 2027</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span className="text-sm">Wereldwijde beschikbaarheid in 25+ talen</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 via-secondary/10 to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Onze Waarden</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              De principes die ons dagelijks werk en beslissingen sturen
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover-scale">
                <CardContent className="pt-8">
                  <value.icon className="h-12 w-12 mx-auto mb-6 text-primary" />
                  <h3 className="text-xl font-heading font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Onze Reis</h2>
            <p className="text-xl text-muted-foreground">
              Van startup tot marktleider in minder dan een jaar
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-6 hover-scale">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center text-white font-bold">
                    {milestone.quarter}
                  </div>
                </div>
                <Card className="flex-1">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-heading font-bold">{milestone.title}</h3>
                      <Badge variant="outline">{milestone.year}</Badge>
                    </div>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-gradient-to-r from-secondary/5 to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Ons Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gedreven experts in AI, technologie en business die samen de toekomst van content bouwen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover-scale">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-heading font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium text-sm mb-2">{member.position}</p>
                  <Badge variant="outline" className="mb-3 text-xs">{member.expertise}</Badge>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/10">
            <CardContent className="pt-12 pb-12">
              <Brain className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                Sluit Je Aan Bij Onze Missie
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Klaar om deel uit te maken van de content revolutie? Start vandaag nog met 
                AutoblogifyAI en ervaar de kracht van AI-gestuurde content creatie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                  Start Gratis Trial
                  <Rocket className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  Neem Contact Op
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;