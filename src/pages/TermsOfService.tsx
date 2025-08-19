import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { FileText, Calendar, Shield, AlertTriangle } from "lucide-react";

const TermsOfService = () => {
  useSEO({
    title: "Algemene Voorwaarden - AutoblogifyAI",
    description: "Lees de algemene voorwaarden voor het gebruik van AutoblogifyAI. Informatie over rechten, plichten en voorwaarden.",
    keywords: "algemene voorwaarden, terms of service, gebruiksvoorwaarden, juridisch"
  });

  const lastUpdated = "15 januari 2025";

  const sections = [
    {
      title: "1. Algemene Bepalingen",
      content: [
        "Deze algemene voorwaarden zijn van toepassing op alle diensten van AutoblogifyAI.",
        "Door gebruik te maken van onze diensten accepteert u deze voorwaarden volledig.",
        "AutoblogifyAI behoudt zich het recht voor deze voorwaarden te wijzigen met voorafgaande kennisgeving.",
        "Wijzigingen worden van kracht na publicatie op onze website."
      ]
    },
    {
      title: "2. Dienstverlening",
      content: [
        "AutoblogifyAI biedt AI-gestuurde content generatie en blog automatisering services.",
        "Wij streven naar een uptime van 99.9%, maar kunnen geen absolute garantie geven.",
        "Onderhoudswerkzaamheden worden vooraf aangekondigd via e-mail of dashboard notificaties.",
        "Support is beschikbaar tijdens kantooruren (09:00-17:00 CET) op werkdagen."
      ]
    },
    {
      title: "3. Gebruikersverplichtingen",
      content: [
        "Gebruikers zijn verantwoordelijk voor de veiligheid van hun account en logingegevens.",
        "Het is verboden om de dienst te gebruiken voor illegale, schadelijke of misleidende content.",
        "Gebruikers mogen geen spam, malware of virussen verspreiden via onze diensten.",
        "Het delen van account toegang met derden is niet toegestaan.",
        "Gebruikers zijn zelf verantwoordelijk voor backup van hun content en data."
      ]
    },
    {
      title: "4. Intellectueel Eigendom",
      content: [
        "Door gebruikers gegenereerde content blijft eigendom van de gebruiker.",
        "AutoblogifyAI behoudt eigendomsrechten op de software, algoritmes en technologie.",
        "Gebruikers verlenen AutoblogifyAI beperkte rechten om content te verwerken voor dienstverlening.",
        "Het is verboden om onze technologie te reverse-engineeren of te kopiëren."
      ]
    },
    {
      title: "5. Betaling en Abonnementen",
      content: [
        "Abonnementskosten worden maandelijks of jaarlijks vooraf gefactureerd.",
        "Betalingen worden automatisch afgeschreven via de geregistreerde betaalmethode.",
        "Bij niet-betaling kan de dienstverlening worden opgeschort of beëindigd.",
        "Restituties worden alleen verleend conform ons restitutiebeleid.",
        "Prijswijzigingen worden 30 dagen vooraf aangekondigd."
      ]
    },
    {
      title: "6. Aansprakelijkheid",
      content: [
        "AutoblogifyAI is niet aansprakelijk voor indirecte, incidentele of gevolgschade.",
        "Onze totale aansprakelijkheid is beperkt tot het bedrag betaald in de laatste 12 maanden.",
        "Gebruikers zijn zelf verantwoordelijk voor de inhoud die zij genereren en publiceren.",
        "Wij garanderen niet dat gegenereerde content vrij is van plagiaat of inbreuk op auteursrechten.",
        "Force majeure omstandigheden vallen buiten onze aansprakelijkheid."
      ]
    },
    {
      title: "7. Privacy en Gegevensverwerking",
      content: [
        "Uw privacy is belangrijk voor ons. Zie ons privacybeleid voor details.",
        "Wij verwerken persoonlijke gegevens conform de AVG/GDPR wetgeving.",
        "Gebruikersdata wordt veilig opgeslagen en niet gedeeld met derden zonder toestemming.",
        "Gebruikers hebben recht op inzage, correctie en verwijdering van hun gegevens."
      ]
    },
    {
      title: "8. Beëindiging",
      content: [
        "Beide partijen kunnen het abonnement beëindigen met inachtneming van de opzegtermijn.",
        "AutoblogifyAI kan accounts opschorten bij schending van deze voorwaarden.",
        "Na beëindiging blijven gegenereerde content en data nog 30 dagen beschikbaar voor export.",
        "Na deze periode worden alle gegevens permanent verwijderd."
      ]
    },
    {
      title: "9. Toepasselijk Recht",
      content: [
        "Op deze overeenkomst is Nederlands recht van toepassing.",
        "Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.",
        "Bij tegenstrijdigheid tussen deze voorwaarden en lokale wetgeving, prevaleert de lokale wetgeving."
      ]
    },
    {
      title: "10. Contact",
      content: [
        "Voor vragen over deze voorwaarden kunt u contact opnemen via:",
        "E-mail: legal@autoblogifyai.com",
        "Postadres: AutoblogifyAI B.V., Postbus 1234, 1000 AB Amsterdam"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-4">
            Algemene Voorwaarden
          </h1>
          <div className="flex items-center justify-center text-muted-foreground space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Laatst bijgewerkt: {lastUpdated}
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Belangrijk: Lees deze voorwaarden zorgvuldig
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  Door gebruik te maken van AutoblogifyAI accepteert u automatisch deze algemene voorwaarden. 
                  Neem bij vragen contact met ons op voordat u onze diensten gebruikt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index} className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Shield className="h-5 w-5 mr-3 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Notice */}
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold mb-3">Vragen over deze voorwaarden?</h3>
              <p className="text-muted-foreground mb-4">
                Ons juridisch team staat klaar om al uw vragen te beantwoorden.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                <span>📧 legal@autoblogifyai.com</span>
                <span className="hidden sm:inline">•</span>
                <span>📞 +31 (0)20 123 4567</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;