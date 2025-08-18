import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Settings, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  BellRing,
  Volume2,
  VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  channel: "in-app" | "email" | "slack" | "push";
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Content Gepubliceerd",
      message: "Je blogpost 'SEO Tips voor 2024' is succesvol gepubliceerd",
      timestamp: "2 minuten geleden",
      read: false,
      channel: "in-app"
    },
    {
      id: "2", 
      type: "warning",
      title: "API Limiet Bereikt",
      message: "Je hebt 90% van je maandelijkse API calls gebruikt",
      timestamp: "1 uur geleden",
      read: false,
      channel: "email"
    },
    {
      id: "3",
      type: "info",
      title: "Nieuwe Functie Beschikbaar",
      message: "Probeer onze nieuwe Voice-to-Text functie",
      timestamp: "3 uur geleden",
      read: true,
      channel: "in-app"
    },
    {
      id: "4",
      type: "error",
      title: "CSV Validatie Gefaald",
      message: "Er zijn fouten gevonden in je CSV bestand",
      timestamp: "5 uur geleden",
      read: true,
      channel: "slack"
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    slackNotifications: false,
    soundEnabled: true,
    contentPublished: true,
    errorAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
    weeklyReports: true
  });

  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-3 w-3" />;
      case "slack":
        return <MessageSquare className="h-3 w-3" />;
      case "push":
        return <Smartphone className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const testNotification = () => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "info",
      title: "Test Notificatie",
      message: "Dit is een test notificatie om je instellingen te controleren",
      timestamp: "Nu",
      read: false,
      channel: "in-app"
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    toast({
      title: "Test notificatie verzonden",
      description: "Controleer je notificatie instellingen",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notificatie Centrum</h2>
          <p className="text-muted-foreground">
            Beheer je notificaties en waarschuwingen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testNotification}>
            Test Notificatie
          </Button>
          <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
            Alles Markeren als Gelezen
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongelezen</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              nieuwe notificaties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Vandaag</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              notificaties ontvangen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Status</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Actief</div>
            <p className="text-xs text-muted-foreground">
              {settings.emailNotifications ? "Ingeschakeld" : "Uitgeschakeld"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Push Status</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Actief</div>
            <p className="text-xs text-muted-foreground">
              {settings.pushNotifications ? "Ingeschakeld" : "Uitgeschakeld"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notificaties</TabsTrigger>
          <TabsTrigger value="settings">Instellingen</TabsTrigger>
          <TabsTrigger value="channels">Kanalen</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recente Notificaties</CardTitle>
              <CardDescription>
                Overzicht van je laatste notificaties en waarschuwingen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Geen notificaties beschikbaar</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-start space-x-4 p-4 border rounded-lg transition-all ${
                        !notification.read ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${!notification.read ? "text-primary" : ""}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {getChannelIcon(notification.channel)}
                              <span className="ml-1">{notification.channel}</span>
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp}
                          </span>
                          <div className="flex space-x-2">
                            {!notification.read && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Markeer als gelezen
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificatie Voorkeuren</CardTitle>
              <CardDescription>
                Configureer wanneer en hoe je notificaties wilt ontvangen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Algemene Instellingen</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Geluid bij notificaties</Label>
                    <p className="text-sm text-muted-foreground">
                      Speel geluid af bij nieuwe notificaties
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {settings.soundEnabled ? (
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch 
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => 
                        setSettings({...settings, soundEnabled: checked})
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Kanaal Instellingen</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notificaties</Label>
                    <p className="text-sm text-muted-foreground">
                      Ontvang notificaties via email
                    </p>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, emailNotifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notificaties</Label>
                    <p className="text-sm text-muted-foreground">
                      Browser push notificaties
                    </p>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, pushNotifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Integratie</Label>
                    <p className="text-sm text-muted-foreground">
                      Verstuur notificaties naar Slack
                    </p>
                  </div>
                  <Switch 
                    checked={settings.slackNotifications}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, slackNotifications: checked})
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notificatie Types</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Content Gepubliceerd</Label>
                    <p className="text-sm text-muted-foreground">
                      Melding wanneer content live gaat
                    </p>
                  </div>
                  <Switch 
                    checked={settings.contentPublished}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, contentPublished: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fout Meldingen</Label>
                    <p className="text-sm text-muted-foreground">
                      Waarschuwingen bij systeem fouten
                    </p>
                  </div>
                  <Switch 
                    checked={settings.errorAlerts}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, errorAlerts: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Systeem Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Nieuwe functies en updates
                    </p>
                  </div>
                  <Switch 
                    checked={settings.systemUpdates}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, systemUpdates: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Wekelijkse Rapporten</Label>
                    <p className="text-sm text-muted-foreground">
                      Analytics samenvatting elke week
                    </p>
                  </div>
                  <Switch 
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, weeklyReports: checked})
                    }
                  />
                </div>
              </div>

              <Button className="w-full">Instellingen Opslaan</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuratie</CardTitle>
                <CardDescription>Configureer email notificaties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Adres</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="jouw@email.com"
                    defaultValue="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequentie</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Direct</SelectItem>
                      <SelectItem value="hourly">Elk uur</SelectItem>
                      <SelectItem value="daily">Dagelijks</SelectItem>
                      <SelectItem value="weekly">Wekelijks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Bijwerken</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slack Integratie</CardTitle>
                <CardDescription>Verbind met je Slack workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <Input 
                    id="webhook" 
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
                <div>
                  <Label htmlFor="channel">Kanaal</Label>
                  <Input 
                    id="channel" 
                    placeholder="#notifications"
                    defaultValue="#general"
                  />
                </div>
                <Button className="w-full" variant="outline">
                  Test Slack Verbinding
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSystem;