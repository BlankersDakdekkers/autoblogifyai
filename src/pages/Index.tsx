import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Zap, TrendingUp, Users, CheckCircle, Globe, Rocket, Brain, Target, Clock, Award, ChevronRight, Play, Sparkles, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah van der Berg",
      company: "DigitalBoost Marketing",
      role: "Marketing Director",
      content: "AutoblogifyAI heeft ons 40 uur per week bespaard. We genereren nu 200+ SEO blogposts per maand die echt converteren!",
      rating: 5,
      result: "300% meer organisch verkeer"
    },
    {
      name: "Michael Jansen",
      company: "TechStart Solutions",
      role: "CEO",
      content: "Van 0 naar 50.000 bezoekers per maand in 6 maanden tijd. De AI content is van betere kwaliteit dan onze oude schrijvers.",
      rating: 5,
      result: "€180k extra omzet"
    },
    {
      name: "Linda de Vries",
      company: "E-commerce Pro",
      role: "Content Manager",
      content: "De tijd die we besparen op content creation investeren we nu in strategie. ROI van 850% binnen 3 maanden.",
      rating: 5,
      result: "850% ROI in 3 maanden"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Gegenereerde Blogposts", icon: FileText },
    { number: "2.5M+", label: "Woorden per Dag", icon: Zap },
    { number: "450+", label: "Tevreden Klanten", icon: Users },
    { number: "98.7%", label: "Klanttevredenheid", icon: Star }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - Marketing Optimized */}
      <section className="relative pt-20 pb-32 hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Social Proof Badge */}
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300">
              <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
              #1 AI Content Platform Nederland - 450+ bedrijven vertrouwen ons
            </Badge>

            {/* Power Headline - Improved Contrast */}
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight drop-shadow-xl">
              <span className="text-white drop-shadow-lg">Van Excel naar</span>
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
                1000+ SEO Blogposts
              </span>
              <span className="block text-4xl md:text-5xl mt-4 text-white drop-shadow-lg">in 24 uur</span>
            </h1>

            {/* Emotional Benefit - Improved Readability */}
            <p className="text-xl md:text-2xl mb-8 text-white font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Stop met weken besteden aan het schrijven van content. Onze AI schrijft 
              <span className="text-yellow-300 font-semibold drop-shadow-md"> professionele, SEO-geoptimaliseerde blogposts</span> 
              die hoger ranken dan handgeschreven content - voor een fractie van de kosten.
            </p>

            {/* Urgency + Value Stack - Better Contrast */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30 shadow-xl">
              <div className="flex flex-wrap justify-center gap-4 text-sm text-white font-medium">
                <div className="flex items-center drop-shadow-md">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 drop-shadow-sm" />
                  95% sneller dan handmatig schrijven
                </div>
                <div className="flex items-center drop-shadow-md">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 drop-shadow-sm" />
                  €500+ besparing per artikel
                </div>
                <div className="flex items-center drop-shadow-md">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 drop-shadow-sm" />
                  Bewezen conversie-resultaten
                </div>
              </div>
            </div>

            {/* CTA Stack */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/pricing">
                <Button size="lg" className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90 shadow-xl pulse-glow font-semibold group">
                  <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  Start GRATIS 14 dagen
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-6 py-4 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                <Play className="mr-2 h-5 w-5" />
                Bekijk 2-min Demo
              </Button>
            </div>

            {/* Trust Indicators - Better Visibility */}
            <p className="mt-6 text-white text-sm drop-shadow-md font-medium">
              💳 Geen creditcard vereist • 🚀 Setup in 2 minuten • 💯 30 dagen geld terug garantie
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Agitation Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-gradient">
              Het probleem dat ieder bedrijf heeft...
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Content marketing werkt, maar het kost een fortuin en veel tijd
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <Clock className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-red-700">Tijdrovend</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">Een professionele blogpost kost 6-8 uur schrijftijd. Voor 50 posts per maand betekent dit 300+ uur werk.</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <Target className="h-12 w-12 text-orange-500 mb-4" />
                <CardTitle className="text-orange-700">Duur</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">Professionele copywriters kosten €75-200 per uur. Voor 50 artikelen betaal je €15.000-40.000 per maand.</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle className="text-yellow-700">Inconsistent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-600">Verschillende schrijvers = verschillende kwaliteit. SEO wordt vaak vergeten, waardoor artikelen niet ranken.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
              <Sparkles className="h-4 w-4 mr-2" />
              De Oplossing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              AutoblogifyAI: Van 1 Excel naar 
              <span className="text-gradient block mt-2">1000+ Perfecte Blogposts</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Upload je lijst met onderwerpen. Onze AI schrijft professionele, SEO-geoptimaliseerde content die hoger rankt dan handgeschreven artikelen.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "95% Sneller",
                description: "1000 blogposts in 24 uur in plaats van 6 maanden handmatig werk",
                color: "text-blue-500"
              },
              {
                icon: Target,
                title: "97% Goedkoper", 
                description: "€49/maand in plaats van €15.000+ voor professionele copywriters",
                color: "text-green-500"
              },
              {
                icon: Award,
                title: "Betere SEO",
                description: "Geoptimaliseerd voor Google met bewezen ranking verbeteringen",
                color: "text-purple-500"
              },
              {
                icon: Zap,
                title: "Consistente Kwaliteit",
                description: "Elke post heeft dezelfde professionele standaard en tone-of-voice",
                color: "text-orange-500"
              },
              {
                icon: Globe,
                title: "Direct Publiceren",
                description: "Automatische integratie met WordPress, Webflow en andere CMS",
                color: "text-cyan-500"
              },
              {
                icon: Users,
                title: "Bewezen Resultaten",
                description: "450+ bedrijven zien gemiddeld 300% meer organisch verkeer",
                color: "text-red-500"
              }
            ].map((benefit, index) => (
              <Card key={index} className="card-glow hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <benefit.icon className={`h-12 w-12 ${benefit.color} mb-4`} />
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Waarom 450+ Bedrijven Kiezen voor AutoblogifyAI
            </h2>
            <p className="text-xl text-muted-foreground">
              Echte resultaten van echte ondernemers
            </p>
          </div>

          <Card className="max-w-4xl mx-auto premium-shadow">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl font-medium mb-6 text-gray-700 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="mb-4">
                  <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                    {testimonials[currentTestimonial].result}
                  </Badge>
                </div>
                <div>
                  <div className="font-semibold text-lg">{testimonials[currentTestimonial].name}</div>
                  <div className="text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                  <div className="text-primary font-medium">{testimonials[currentTestimonial].company}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold mb-6">
              Klaar om 95% Tijd en €15.000+ per Maand te Besparen?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Doe mee met 450+ succesvolle bedrijven die hun content marketing volledig hebben getransformeerd
            </p>
            
            <div className="bg-white rounded-2xl p-8 premium-shadow max-w-md mx-auto mb-8">
              <div className="text-6xl font-bold text-primary mb-2">€49</div>
              <div className="text-muted-foreground mb-4">/maand • Bespaar €15.000+</div>
              <div className="space-y-2 text-left">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Onbeperkte AI blogposts</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Premium SEO templates</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>WordPress integratie</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>24/7 priority support</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link to="/pricing">
                <Button size="lg" className="text-lg px-8 py-4 pulse-glow">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Gratis - 14 Dagen Proberen
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                💳 Geen creditcard • 🚀 Direct toegang • 💯 30 dagen geld terug
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 hero-gradient">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h3 className="text-3xl font-heading font-bold mb-4">
              Stop met Geld Verspillen aan Dure Copywriters
            </h3>
            <p className="text-xl mb-6 text-white/90">
              Word de volgende successtory. 450+ bedrijven gingen je voor.
            </p>
            <Link to="/pricing">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                Ja, ik wil 95% tijd besparen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;