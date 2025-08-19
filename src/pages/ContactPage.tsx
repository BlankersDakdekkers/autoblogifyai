import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/hooks/useSEO";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  Headphones,
  Book,
  Zap
} from "lucide-react";

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useSEO({
    title: "Contact - AutoblogifyAI Support & Verkoop",
    description: "Neem contact op met AutoblogifyAI voor support, verkoop of partnerships. Wij helpen u graag met al uw vragen over content automatisering.",
    keywords: "contact, support, verkoop, help, AutoblogifyAI"
  });

  const contactMethods = [
    {
      icon: Mail,
      title: "E-mail Support",
      description: "Voor technische vragen en support",
      contact: "support@autoblogifyai.com",
      responseTime: "< 4 uur"
    },
    {
      icon: Phone,
      title: "Telefonische Support",
      description: "Voor directe hulp en urgente zaken",
      contact: "+31 (0)20 123 4567",
      responseTime: "Direct"
    },
    {
      icon: MessageCircle,
      title: "Sales & Demo's",
      description: "Voor verkoop en productdemo's",
      contact: "sales@autoblogifyai.com",
      responseTime: "< 2 uur"
    },
    {
      icon: Headphones,
      title: "Partnerships",
      description: "Voor zakelijke partnerships",
      contact: "partners@autoblogifyai.com",
      responseTime: "1 werkdag"
    }
  ];

  const officeHours = [
    { day: "Maandag - Vrijdag", hours: "09:00 - 17:00 CET" },
    { day: "Zaterdag", hours: "10:00 - 14:00 CET" },
    { day: "Zondag", hours: "Gesloten" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Bericht verzonden!",
        description: "Wij nemen binnen 24 uur contact met u op.",
      });
      
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Fout bij verzenden",
        description: "Probeer het opnieuw of neem direct contact op.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto max-w-6xl py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-4">
            Neem Contact Op
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Heeft u vragen over AutoblogifyAI? Ons team staat klaar om u te helpen met support, 
            demo's en alle informatie die u nodig heeft.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-3 text-primary" />
                  Stuur Ons Een Bericht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Naam *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Uw volledige naam"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mailadres *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="naam@bedrijf.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Bedrijf</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Uw bedrijfsnaam"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Onderwerp *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Waar kunnen we u mee helpen?"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Bericht *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Beschrijf uw vraag of behoefte in detail..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-glow"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Bezig met verzenden...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Verstuur Bericht
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  Contact Opties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-secondary/20 transition-colors">
                      <div className="flex items-start space-x-3">
                        <method.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{method.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{method.description}</p>
                          <p className="text-sm font-medium">{method.contact}</p>
                          <p className="text-xs text-primary">Reactie: {method.responseTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  Openingstijden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {officeHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <span className="text-sm">{schedule.day}</span>
                      <span className="text-sm font-medium">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Buiten kantooruren? Stuur een e-mail en wij reageren de eerstvolgende werkdag.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-3 text-primary" />
                  Snelle Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/dashboard/help">
                      <Book className="h-4 w-4 mr-2" />
                      Help Center
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/dashboard/knowledge-base">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Kennisbank
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/pricing">
                      <Headphones className="h-4 w-4 mr-2" />
                      Prijzen & Demo
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  Bezoekadres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">AutoblogifyAI B.V.</p>
                  <p>Technologielaan 42</p>
                  <p>1082 MD Amsterdam</p>
                  <p>Nederland</p>
                  <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Op afspraak. Neem vooraf contact op om een bezoek in te plannen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;