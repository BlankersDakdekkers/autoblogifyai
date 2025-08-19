import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { Shield, Calendar, Lock, Eye, UserCheck, Database, AlertTriangle } from "lucide-react";

const PrivacyPolicy = () => {
  useSEO({
    title: "Privacy Policy - AutoblogifyAI",
    description: "Lees ons privacybeleid. Transparante informatie over hoe wij uw gegevens verzamelen, gebruiken en beschermen conform AVG/GDPR.",
    keywords: "privacy policy, privacybeleid, AVG, GDPR, gegevensbescherming, data privacy"
  });

  const lastUpdated = "15 januari 2025";

  const dataTypes = [
    {
      category: "Account Gegevens",
      description: "Naam, e-mailadres, wachtwoord (gehashed)",
      retention: "Tot account verwijdering",
      purpose: "Account beheer en authenticatie"
    },
    {
      category: "Gebruiksdata",
      description: "Features gebruikt, generaties, klikgedrag",
      retention: "24 maanden",
      purpose: "Product verbetering en analytics"
    },
    {
      category: "Content Data",
      description: "Door u gegenereerde content en prompts",
      retention: "Tot u het verwijdert",
      purpose: "Dienstverlening en content generatie"
    },
    {
      category: "Technische Data",
      description: "IP-adres, browser info, device type",
      retention: "12 maanden",
      purpose: "Beveiliging en technische ondersteuning"
    }
  ];

  const rights = [
    {
      right: "Recht op Inzage",
      description: "U kunt opvragen welke gegevens wij van u hebben",
      icon: Eye
    },
    {
      right: "Recht op Rectificatie",
      description: "U kunt onjuiste gegevens laten corrigeren",
      icon: UserCheck
    },
    {
      right: "Recht op Verwijdering",
      description: "U kunt verzoeken uw gegevens te verwijderen",
      icon: Database
    },
    {
      right: "Recht op Overdraagbaarheid",
      description: "U kunt uw gegevens in machine-leesbaar formaat ontvangen",
      icon: Shield
    }
  ];

  const securityMeasures = [
    "End-to-end encryptie voor gevoelige data",
    "Regelmatige beveiligingsaudits en penetratietests",
    "Twee-factor authenticatie voor admin accounts",
    "Geautomatiseerde backup en disaster recovery",
    "SOC 2 Type II gecertificeerde hosting providers",
    "GDPR-compliant dataverwerking en opslag"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto max-w-5xl py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-4">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center text-muted-foreground space-x-4 mb-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Laatst bijgewerkt: {lastUpdated}
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Lock className="h-3 w-3 mr-1" />
            GDPR Compliant
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-primary" />
              Inleiding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Bij AutoblogifyAI nemen wij uw privacy zeer serieus. Dit privacybeleid legt uit hoe wij uw persoonlijke gegevens 
              verzamelen, gebruiken, delen en beschermen wanneer u onze AI-gestuurde content generatie diensten gebruikt. 
              Wij handelen volledig conform de Algemene Verordening Gegevensbescherming (AVG/GDPR) en andere relevante 
              privacywetgeving.
            </p>
          </CardContent>
        </Card>

        {/* Data We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-3 text-primary" />
              Welke Gegevens Verzamelen Wij
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dataTypes.map((type, index) => (
                <div key={index} className="p-4 border rounded-lg bg-secondary/20">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{type.category}</h4>
                    <Badge variant="outline" className="text-xs">
                      {type.retention}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                  <p className="text-xs text-primary">Doel: {type.purpose}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-3 text-primary" />
              Hoe Wij Uw Gegevens Gebruiken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Primaire Doeleinden</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Account beheer en authenticatie</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Content generatie en AI-processing</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Facturering en betalingsverwerking</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Technische ondersteuning</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Secundaire Doeleinden</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Product verbetering en analyse</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Marketing communicatie (opt-in)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Compliance en juridische verplichtingen</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Beveiliging en fraude preventie</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-3 text-primary" />
              Uw Rechten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {rights.map((right, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <right.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">{right.right}</h4>
                    <p className="text-sm text-muted-foreground">{right.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Hoe uw rechten uitoefenen?</strong> Stuur een e-mail naar privacy@autoblogifyai.com met uw verzoek. 
                Wij reageren binnen 30 dagen conform GDPR vereisten.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-primary" />
              Beveiligingsmaatregelen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {securityMeasures.map((measure, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{measure}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-3 text-primary" />
              Delen van Gegevens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-950/20">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Wij verkopen NOOIT uw gegevens
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  AutoblogifyAI verkoopt, verhuurt of verhandelt nooit uw persoonlijke gegevens aan derden voor commerciële doeleinden.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Beperkt Delen Met:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Service Providers:</span>
                      <span className="text-muted-foreground ml-2">
                        Hosting, betalingen, e-mail services (allen GDPR-compliant)
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Juridische Vereisten:</span>
                      <span className="text-muted-foreground ml-2">
                        Alleen wanneer wettelijk verplicht door overheidsinstanties
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Changes */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-3 text-primary" />
                Wijzigingen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Wij kunnen dit privacybeleid van tijd tot tijd bijwerken. Belangrijke wijzigingen communeren wij via:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• E-mail notificatie (30 dagen vooraf)</li>
                <li>• Dashboard melding</li>
                <li>• Website banner</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-3 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Data Protection Officer:</strong><br />
                  privacy@autoblogifyai.com
                </div>
                <div>
                  <strong>Postadres:</strong><br />
                  AutoblogifyAI B.V.<br />
                  t.a.v. Privacy Officer<br />
                  Postbus 1234<br />
                  1000 AB Amsterdam
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;