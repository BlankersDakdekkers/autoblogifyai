import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Star, Clock, Shield, Users, TrendingUp, Zap, ArrowRight, Play, Quote } from "lucide-react";

const SalesPage = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 47,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      name: "Sarah van der Berg",
      company: "SEO Expert & Content Creator",
      image: "/placeholder.svg",
      text: "In slechts 2 weken heb ik 150+ blogposts gegenereerd die perfect geoptimaliseerd zijn. Mijn organic traffic is met 340% gestegen!",
      rating: 5
    },
    {
      name: "Marco Jansen",
      company: "Digital Marketing Agency",
      image: "/placeholder.svg", 
      text: "AutoblogifyAI heeft onze workflow gerevolutioneerd. We kunnen nu 10x meer content produceren voor onze klanten met dezelfde resources.",
      rating: 5
    },
    {
      name: "Lisa Chen",
      company: "E-commerce Ondernemer",
      image: "/placeholder.svg",
      text: "Van 0 naar 50.000 bezoekers per maand in 3 maanden tijd. Deze tool is letterlijk geld waard!",
      rating: 5
    }
  ];

  const features = [
    "Unlimited blogpost generatie",
    "AI-gestuurde SEO optimalisatie", 
    "Automatische planning & publicatie",
    "Multi-taal ondersteuning (29 talen)",
    "Geavanceerde keyword research",
    "Voice-to-text content creatie",
    "Media bibliotheek & management",
    "White-label oplossingen",
    "Priority email support",
    "Live chat ondersteuning"
  ];

  const stats = [
    { value: "10M+", label: "Gegenereerde woorden" },
    { value: "25K+", label: "Tevreden gebruikers" },
    { value: "340%", label: "Gemiddelde traffic groei" },
    { value: "2.3s", label: "Gemiddelde response tijd" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          {/* Urgency Banner */}
          <div className="inline-flex items-center bg-destructive/10 text-destructive px-4 py-2 rounded-full mb-6 animate-pulse">
            <Clock className="h-4 w-4 mr-2" />
            <span className="font-medium">Beperkte tijd: 50% korting eindigt over {timeLeft.hours}u {timeLeft.minutes}m {timeLeft.seconds}s</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Van 0 naar 10.000+ 
            <br />
            Bezoekers in 30 Dagen
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            <strong>AutoblogifyAI</strong> genereert automatisch SEO-geoptimaliseerde blogposts die je organic traffic laten exploderen. 
            Geen technische kennis vereist. Resultaten gegarandeerd of geld terug.
          </p>

          {/* Social Proof Numbers */}
          <div className="flex justify-center gap-8 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <Zap className="mr-2 h-5 w-5" />
              Start Nu - 50% Korting
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Bekijk Demo (2 min)
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              SSL Beveiligd
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              30 Dagen Garantie
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              25.000+ Gebruikers
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Herken je dit?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-destructive/20">
                <CardContent className="p-6 text-center">
                  <div className="text-destructive text-4xl mb-4">😰</div>
                  <h3 className="font-semibold mb-2">Uren besteed aan content</h3>
                  <p className="text-muted-foreground">Je besteedt eindeloze uren aan het schrijven van blogposts, maar ziet nauwelijks resultaat</p>
                </CardContent>
              </Card>
              <Card className="border-destructive/20">
                <CardContent className="p-6 text-center">
                  <div className="text-destructive text-4xl mb-4">📉</div>
                  <h3 className="font-semibold mb-2">Geen organic traffic</h3>
                  <p className="text-muted-foreground">Je website staat stil op Google en je concurrent haalt alle klanten weg</p>
                </CardContent>
              </Card>
              <Card className="border-destructive/20">
                <CardContent className="p-6 text-center">
                  <div className="text-destructive text-4xl mb-4">💸</div>
                  <h3 className="font-semibold mb-2">Dure SEO agencies</h3>
                  <p className="text-muted-foreground">Je betaalt duizenden euro's per maand aan agencies zonder garantie op resultaat</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">De Oplossing: AutoblogifyAI</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Automatiseer je complete content strategie en laat AI het zware werk doen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Van Chaos naar Gestructureerde Groei</h3>
              <ul className="space-y-4">
                {features.slice(0, 6).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" size="lg">
                Start Gratis Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-2xl">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 mx-auto text-primary mb-4" />
                <h4 className="text-2xl font-bold mb-4">Resultaten Gegarandeerd</h4>
                <div className="text-5xl font-bold text-primary mb-2">340%</div>
                <p className="text-muted-foreground">Gemiddelde traffic stijging na 90 dagen</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Wat Onze Klanten Zeggen</h2>
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-lg font-semibold">4.9/5 sterren (2,847 reviews)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <Avatar className="mr-3">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Kies Je Plan</h2>
            <p className="text-xl text-muted-foreground">Alle plannen komen met 30 dagen geld-terug-garantie</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="relative">
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                🔥 POPULAIR
              </div>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Perfect voor beginners</CardDescription>
                <div className="text-3xl font-bold">
                  <span className="line-through text-muted-foreground">€147</span>
                  <span className="text-primary ml-2">€72</span>
                  <span className="text-sm font-normal">/maand</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    100 blogposts per maand
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Basis SEO optimalisatie
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Email support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Analytics dashboard
                  </li>
                </ul>
                <Button className="w-full">Start Gratis Trial</Button>
              </CardContent>
            </Card>

            {/* Professional Plan - Most Popular */}
            <Card className="border-primary shadow-xl scale-105 relative">
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-bounce shadow-lg">
                💎 BEST VALUE
              </div>
              <div className="bg-primary text-primary-foreground text-center py-2 rounded-t-lg">
                <Badge variant="secondary">MEEST POPULAIR - 87% kiest dit</Badge>
              </div>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>Voor serieuze ondernemers</CardDescription>
                <div className="text-3xl font-bold">
                  <span className="line-through text-muted-foreground">€447</span>
                  <span className="text-primary ml-2">€222</span>
                  <span className="text-sm font-normal">/maand</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Unlimited blogposts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Advanced AI SEO + GPT-4
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Priority support (24/7)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    White-label oplossing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    ROI tracking & reports
                  </li>
                </ul>
                <Button className="w-full bg-primary">Start Gratis Trial</Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <div className="absolute -top-2 -left-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                🚀 ENTERPRISE
              </div>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Voor agencies & teams</CardDescription>
                <div className="text-3xl font-bold">
                  <span className="line-through text-muted-foreground">€1197</span>
                  <span className="text-primary ml-2">€597</span>
                  <span className="text-sm font-normal">/maand</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Alles van Professional
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Multi-user toegang
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Custom integraties & API
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    Enterprise security
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Start Gratis Trial</Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-4">
              🔥 <strong>Beperkte tijd:</strong> 50% korting voor nieuwe klanten
            </p>
            <p className="text-sm text-muted-foreground">
              Geen setup kosten • Annuleer wanneer je wilt • 30 dagen geld-terug-garantie
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Veelgestelde Vragen</h2>
          </div>

          <div className="space-y-8">
            {[
              {
                q: "Hoe snel zie ik resultaten?",
                a: "De meeste klanten zien binnen 30-60 dagen significante stijgingen in organic traffic. Sommige klanten zien al binnen 2 weken resultaat."
              },
              {
                q: "Moet ik technische kennis hebben?",
                a: "Nee! AutoblogifyAI is ontworpen voor iedereen. Upload gewoon je Google Sheet en wij doen de rest."
              },
              {
                q: "Wat als ik niet tevreden ben?",
                a: "We bieden een 30 dagen geld-terug-garantie. Geen vragen, gewoon je geld terug."
              },
              {
                q: "Ondersteunt het mijn taal?",
                a: "Ja! We ondersteunen 29 talen waaronder Nederlands, Engels, Duits, Frans en nog veel meer."
              },
              {
                q: "Kan ik upgraden of downgraden?",
                a: "Natuurlijk! Je kunt op elk moment je plan wijzigen. Geen extra kosten."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Klaar om je Traffic te Verdubbelen?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Sluit je aan bij 25.000+ ondernemers die al succes hebben met AutoblogifyAI
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="text-2xl font-bold mb-4">🎯 Beperkte Tijd Bonus</div>
            <ul className="text-left max-w-md mx-auto space-y-2">
              <li>✅ Gratis SEO audit ter waarde van €497</li>
              <li>✅ 1-op-1 onboarding sessie</li>
              <li>✅ Premium templates pakket</li>
              <li>✅ Lifetime toegang tot updates</li>
            </ul>
          </div>

          <Button size="lg" variant="secondary" className="text-lg px-12 py-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <Zap className="mr-2 h-5 w-5" />
            Claim Je 50% Korting Nu
          </Button>
          
          <p className="text-sm mt-4 opacity-75">
            ⏰ Nog {timeLeft.hours} uur {timeLeft.minutes} minuten beschikbaar
          </p>
        </div>
      </section>
    </div>
  );
};

export default SalesPage;