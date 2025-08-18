import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Bell, Shield, Palette, Globe } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useSEO({
    title: "Instellingen - AutoblogifyAI",
    description: "Beheer je account instellingen, notificaties en voorkeuren in AutoblogifyAI",
    keywords: "instellingen, account, profiel, notificaties, voorkeuren"
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profiel bijgewerkt",
      description: "Je profielgegevens zijn succesvol opgeslagen",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notificatie-instellingen bijgewerkt",
      description: "Je notificatie voorkeuren zijn opgeslagen",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Instellingen</h1>
        </div>
        <p className="text-muted-foreground">
          Beheer je account, voorkeuren en integraties
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profiel
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificaties
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Beveiliging
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Voorkeuren
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profiel Informatie</CardTitle>
              <CardDescription>
                Update je persoonlijke informatie en profiel instellingen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xl">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Upload nieuwe foto
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG max 2MB
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Voornaam</Label>
                  <Input
                    id="firstName"
                    placeholder="Je voornaam"
                    defaultValue=""
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Achternaam</Label>
                  <Input
                    id="lastName"
                    placeholder="Je achternaam"
                    defaultValue=""
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="je@email.com"
                  defaultValue={user?.email || ""}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Contact support om je e-mailadres te wijzigen
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Vertel iets over jezelf..."
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={handleSaveProfile}>
                Profiel opslaan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificatie Instellingen</CardTitle>
              <CardDescription>
                Kies welke notificaties je wilt ontvangen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>E-mail notificaties</Label>
                  <p className="text-sm text-muted-foreground">
                    Ontvang updates en belangrijke meldingen via e-mail
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Push notificaties</Label>
                  <p className="text-sm text-muted-foreground">
                    Ontvang browser notificaties voor real-time updates
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Notificatie Types</Label>
                <div className="space-y-3">
                  {[
                    { label: "Nieuwe blog posts gegenereerd", checked: true },
                    { label: "WordPress publicatie voltooid", checked: true },
                    { label: "Systeem onderhoud", checked: false },
                    { label: "Account updates", checked: true },
                    { label: "Feature releases", checked: false }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Label className="font-normal">{item.label}</Label>
                      <Switch defaultChecked={item.checked} />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveNotifications}>
                Notificatie-instellingen opslaan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Beveiliging</CardTitle>
              <CardDescription>
                Beheer je account beveiliging en privacy instellingen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Account Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Actief
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Geregistreerd op {new Date().toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Wachtwoord wijzigen</Label>
                  <div className="space-y-3">
                    <Input type="password" placeholder="Huidig wachtwoord" />
                    <Input type="password" placeholder="Nieuw wachtwoord" />
                    <Input type="password" placeholder="Bevestig nieuw wachtwoord" />
                  </div>
                  <Button variant="outline" size="sm">
                    Wachtwoord bijwerken
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Twee-factor authenticatie</Label>
                  <p className="text-sm text-muted-foreground">
                    Voeg een extra beveiligingslaag toe aan je account
                  </p>
                  <Button variant="outline" size="sm">
                    2FA instellen
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-destructive">Gevaar Zone</Label>
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <p className="text-sm text-muted-foreground mb-3">
                      Deze actie kan niet ongedaan worden gemaakt
                    </p>
                    <Button variant="destructive" size="sm">
                      Account verwijderen
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interface Voorkeuren</CardTitle>
              <CardDescription>
                Personaliseer je AutoblogifyAI ervaring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Donkere modus</Label>
                  <p className="text-sm text-muted-foreground">
                    Schakel tussen licht en donker thema
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Taal</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="nl">Nederlands</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Tijdzone</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="Europe/Amsterdam">Europe/Amsterdam (CET)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Auto-save interval</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="30">Elke 30 seconden</option>
                  <option value="60">Elke minuut</option>
                  <option value="300">Elke 5 minuten</option>
                  <option value="0">Uitgeschakeld</option>
                </select>
              </div>

              <Button>
                Voorkeuren opslaan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;