import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Phone, 
  Mail,
  ExternalLink,
  Play,
  Clock,
  CheckCircle2,
  Star,
  Users,
  Zap,
  FileText,
  Video,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");

  const { toast } = useToast();

  const faqItems = [
    {
      question: "Hoe kan ik beginnen met AutoblogifyAI?",
      answer: "Start door je Google Sheet voor te bereiden met de juiste kolommen, gebruik dan onze CSV validator en genereer je eerste posts via de dashboard."
    },
    {
      question: "Welke formats ondersteunt AutoblogifyAI?",
      answer: "We ondersteunen Google Sheets CSV export, direct CSV upload, en 29 verschillende talen voor content generatie."
    },
    {
      question: "Hoe werkt de SEO optimalisatie?",
      answer: "Onze AI analyseert je content op keywords, meta descriptions, heading structuur en genereert automatisch SEO-vriendelijke URL slugs."
    },
    {
      question: "Kan ik mijn eigen templates gebruiken?",
      answer: "Ja! Je kunt custom Nunjucks templates uploaden en configureren via de instellingen pagina."
    },
    {
      question: "Wat kost AutoblogifyAI?",
      answer: "We hebben verschillende prijsplannen vanaf €24/maand. Kijk op onze pricing pagina voor details."
    },
    {
      question: "Is er een API beschikbaar?",
      answer: "Ja, we hebben een RESTful API voor enterprise klanten. Neem contact op voor toegang."
    }
  ];

  const tutorials = [
    {
      title: "Aan de slag - AutoblogifyAI Basics",
      duration: "8 min",
      type: "video",
      thumbnail: "/placeholder.svg",
      description: "Leer de basis functies kennen en maak je eerste blogpost"
    },
    {
      title: "CSV Template Setup",
      duration: "5 min", 
      type: "video",
      thumbnail: "/placeholder.svg",
      description: "Hoe je je Google Sheet correct configureert"
    },
    {
      title: "SEO Optimalisatie Tips",
      duration: "12 min",
      type: "video", 
      thumbnail: "/placeholder.svg",
      description: "Maximaliseer je organic reach met onze SEO tools"
    },
    {
      title: "Geavanceerde Workflows",
      duration: "15 min",
      type: "video",
      thumbnail: "/placeholder.svg", 
      description: "Automatiseer je complete content pipeline"
    }
  ];

  const guides = [
    {
      title: "Complete Setup Gids",
      type: "guide",
      readTime: "10 min leestijd",
      description: "Stap-voor-stap instructies om AutoblogifyAI optimaal in te stellen"
    },
    {
      title: "CSV Schema Referentie",
      type: "reference",
      readTime: "5 min leestijd", 
      description: "Volledige lijst van ondersteunde kolommen en formats"
    },
    {
      title: "API Documentatie",
      type: "technical",
      readTime: "20 min leestijd",
      description: "Technische documentatie voor developers"
    },
    {
      title: "Troubleshooting Gids",
      type: "guide",
      readTime: "8 min leestijd",
      description: "Oplossingen voor veelvoorkomende problemen"
    }
  ];

  const filteredFAQ = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSubmit = () => {
    if (!chatMessage.trim()) return;
    
    toast({
      title: "Bericht verzonden",
      description: "Ons team reageert binnen 2 uur tijdens kantooruren.",
    });
    setChatMessage("");
  };

  const handleTicketSubmit = () => {
    if (!ticketTitle.trim() || !ticketDescription.trim()) {
      toast({
        title: "Velden ontbreken", 
        description: "Vul alle velden in om een ticket aan te maken.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Ticket aangemaakt",
      description: "We hebben je ticket ontvangen en reageren binnen 24 uur.",
    });
    setTicketTitle("");
    setTicketDescription("");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
        <p className="text-muted-foreground">
          Vind antwoorden, tutorials en krijg hulp van ons team
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Search className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-1">Zoek in FAQ</h3>
            <p className="text-sm text-muted-foreground">Snelle antwoorden</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-1">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Direct contact</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Book className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-1">Documentatie</h3>
            <p className="text-sm text-muted-foreground">Uitgebreide gidsen</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Video className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-1">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground">Stap-voor-stap</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Informatie</CardTitle>
          <CardDescription>
            Verschillende manieren om hulp te krijgen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Live Chat</h4>
                <p className="text-sm text-muted-foreground">Ma-Vr 9:00-17:00</p>
                <Badge className="mt-1 bg-green-500/10 text-green-700">Online</Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Email Support</h4>
                <p className="text-sm text-muted-foreground">support@autoblogify.ai</p>
                <p className="text-xs text-muted-foreground">Reactie binnen 24u</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Enterprise Support</h4>
                <p className="text-sm text-muted-foreground">+31 20 123 4567</p>
                <p className="text-xs text-muted-foreground">Voor Pro & Enterprise</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="guides">Gidsen</TabsTrigger>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Veelgestelde Vragen</CardTitle>
              <CardDescription>
                Zoek door onze kennisbank voor snelle antwoorden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek in FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQ.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Geen resultaten gevonden voor "{searchQuery}"</p>
                  <p className="text-sm mt-2">Probeer een andere zoekterm of neem contact op via live chat</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Leer AutoblogifyAI kennen met onze stap-voor-stap video gidsen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {tutorials.map((tutorial, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative">
                      <img 
                        src={tutorial.thumbnail} 
                        alt={tutorial.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-t-lg">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/60 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {tutorial.duration}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{tutorial.title}</h4>
                      <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentatie & Gidsen</CardTitle>
              <CardDescription>
                Uitgebreide documentatie en setup gidsen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guides.map((guide, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{guide.title}</h4>
                        <p className="text-sm text-muted-foreground">{guide.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {guide.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {guide.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Chat Support</CardTitle>
              <CardDescription>
                Chat direct met ons support team voor snelle hulp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>SA</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Sarah (Support Agent)</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Online - reageert meestal binnen 5 minuten
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border mb-4">
                    <p className="text-sm">
                      Hallo! 👋 Ik ben Sarah van het AutoblogifyAI support team. 
                      Waar kan ik je mee helpen?
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Typ je vraag hier..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                    />
                    <Button onClick={handleChatSubmit}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <Button variant="outline" className="justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Snelle setup hulp
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    CSV problemen
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Account vragen
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Feature verzoek
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Ticket Aanmaken</CardTitle>
              <CardDescription>
                Maak een support ticket aan voor complexere vragen of problemen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Onderwerp</label>
                  <Input
                    placeholder="Beschrijf je probleem in één zin"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Beschrijving</label>
                  <textarea
                    className="w-full min-h-32 p-3 border rounded-lg resize-none"
                    placeholder="Geef een gedetailleerde beschrijving van je probleem..."
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                  />
                </div>

                <Button onClick={handleTicketSubmit} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Ticket Verzenden
                </Button>
              </div>

              <div className="mt-8">
                <h4 className="font-medium mb-4">Mijn Tickets</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium text-sm">CSV Upload Probleem</h5>
                      <p className="text-xs text-muted-foreground">Ticket #1234 • 2 uur geleden</p>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-700">In behandeling</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium text-sm">Feature Request: Bulk Delete</h5>
                      <p className="text-xs text-muted-foreground">Ticket #1233 • 1 dag geleden</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700">Opgelost</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpSupport;