import React, { useState, memo } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { ResponsiveContainer, ResponsiveGrid } from "@/components/ui/responsive-components";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Camera,
  Key,
  Smartphone,
  Mail,
  Moon,
  Sun,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Crown,
  Zap,
  Database,
  Lock,
  Unlock,
  RefreshCw,
  Save,
  Edit3,
  Users,
  BarChart3,
  Calendar,
  Clock,
  Languages,
  MapPin,
  CreditCard
} from "lucide-react";

// Enhanced Settings Card Component
const SettingsCard = memo(({ 
  title, 
  description, 
  icon: Icon,
  children,
  headerAction,
  variant = 'default'
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'premium' | 'warning' | 'success';
}) => {
  const variantClasses = {
    default: 'border-border',
    premium: 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50',
    warning: 'border-red-200 bg-gradient-to-br from-red-50 to-red-50',
    success: 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${variantClasses[variant]}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
});

SettingsCard.displayName = 'SettingsCard';

// Profile Stats Component
const ProfileStatsCard = memo(() => {
  const stats = [
    { label: 'Blog Posts', value: 247, icon: BarChart3 },
    { label: 'Total Views', value: '125K', icon: Eye },
    { label: 'Dagen Actief', value: 89, icon: Calendar },
    { label: 'Credits Used', value: 1240, icon: Zap }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex justify-center mb-2">
            <stat.icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-800">{stat.value}</div>
          <div className="text-xs text-blue-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
});

ProfileStatsCard.displayName = 'ProfileStatsCard';

// Usage Monitor Component
const UsageMonitorCard = memo(() => {
  const usageData = [
    { label: 'Credits gebruikt', used: 756, total: 1000, color: 'bg-blue-500' },
    { label: 'Storage gebruikt', used: 2.3, total: 10, color: 'bg-green-500', unit: 'GB' },
    { label: 'API calls', used: 1240, total: 5000, color: 'bg-purple-500' },
    { label: 'Team leden', used: 3, total: 10, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-4">
      {usageData.map((item, index) => {
        const percentage = (item.used / item.total) * 100;
        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm text-muted-foreground">
                {item.used}{item.unit || ''} / {item.total}{item.unit || ''}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      })}
    </div>
  );
});

UsageMonitorCard.displayName = 'UsageMonitorCard';

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [firstName, setFirstName] = useState(profile?.display_name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(profile?.display_name?.split(' ')[1] || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [timezone, setTimezone] = useState('Europe/Amsterdam');
  const [language, setLanguage] = useState('nl');

  useSEO({
    title: "Instellingen - AutoblogifyAI",
    description: "Beheer je account instellingen, notificaties en voorkeuren in AutoblogifyAI",
    keywords: "instellingen, account, profiel, notificaties, voorkeuren"
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "✅ Profiel bijgewerkt",
        description: "Je profielgegevens zijn succesvol opgeslagen",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast({
        title: "🔔 Notificaties bijgewerkt",
        description: "Je notificatie voorkeuren zijn opgeslagen",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: "📥 Export gestart",
      description: "Je data wordt voorbereid voor download...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <ResponsiveContainer maxWidth="7xl">
        <div className="py-8 space-y-8">
          {/* Premium Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white animate-fade-in">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Account Instellingen</h1>
                    <p className="text-white/90 text-lg">
                      Beheer je profiel, voorkeuren en integraties
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro Plan
                  </Badge>
                  <Button variant="secondary" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
              
              <ProfileStatsCard />
            </div>
          </div>

          {/* Enhanced Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-muted/50 p-1">
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
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Gebruik
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Integraties
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="lg">
                <SettingsCard
                  title="Profiel Informatie"
                  description="Update je persoonlijke gegevens en profielfoto"
                  icon={User}
                  headerAction={
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Bewerken
                    </Button>
                  }
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <Button 
                          size="sm" 
                          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Geverifieerd
                          </Badge>
                          <Badge variant="outline">
                            <Star className="h-3 w-3 mr-1" />
                            Pro Member
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Lid sinds {new Date().toLocaleDateString('nl-NL', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Voornaam</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Je voornaam"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Achternaam</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Je achternaam"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mailadres</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="pr-10"
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Contact support om je e-mailadres te wijzigen
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Vertel iets over jezelf..."
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-muted-foreground">
                        {bio.length}/160 karakters
                      </p>
                    </div>

                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Opslaan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Profiel opslaan
                        </>
                      )}
                    </Button>
                  </div>
                </SettingsCard>

                <SettingsCard
                  title="Account Statistieken"
                  description="Je activiteit en prestaties overzicht"
                  icon={BarChart3}
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Success Rate</span>
                        </div>
                        <div className="text-2xl font-bold text-green-800">99.2%</div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Efficiency</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-800">94%</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label>Recente Activiteit</Label>
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {[
                            { action: 'Blog post gegenereerd', time: '2 min geleden', icon: Edit3 },
                            { action: 'Profiel bijgewerkt', time: '1 uur geleden', icon: User },
                            { action: 'WordPress sync', time: '3 uur geleden', icon: RefreshCw },
                            { action: 'Analytics bekeken', time: '1 dag geleden', icon: BarChart3 }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="p-1 rounded bg-primary/10">
                                <item.icon className="h-3 w-3 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.action}</p>
                                <p className="text-xs text-muted-foreground">{item.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </SettingsCard>
              </ResponsiveGrid>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <SettingsCard
                title="Notificatie Voorkeuren"
                description="Beheer welke meldingen en updates je wilt ontvangen"
                icon={Bell}
                headerAction={
                  <Button variant="outline" size="sm" onClick={handleSaveNotifications}>
                    <Save className="h-4 w-4 mr-2" />
                    Opslaan
                  </Button>
                }
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <div>
                            <Label className="text-blue-900">E-mail notificaties</Label>
                            <p className="text-sm text-blue-700">Updates via e-mail ontvangen</p>
                          </div>
                        </div>
                        <Switch
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-purple-600" />
                          <div>
                            <Label className="text-purple-900">Push notificaties</Label>
                            <p className="text-sm text-purple-700">Browser meldingen</p>
                          </div>
                        </div>
                        <Switch
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <Label className="text-green-900">Auto-save</Label>
                            <p className="text-sm text-green-700">Automatisch opslaan</p>
                          </div>
                        </div>
                        <Switch
                          checked={autoSave}
                          onCheckedChange={setAutoSave}
                        />
                      </div>

                      <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-50 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <Label className="text-orange-900">Systeem Updates</Label>
                        </div>
                        <p className="text-sm text-orange-700">
                          Belangrijke meldingen over onderhoud
                        </p>
                        <Switch defaultChecked className="mt-2" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-lg">Gedetailleerde Instellingen</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Nieuwe blog posts gegenereerd", checked: true, icon: Edit3 },
                        { label: "WordPress publicatie voltooid", checked: true, icon: Globe },
                        { label: "Analytics rapporten", checked: false, icon: BarChart3 },
                        { label: "Systeem onderhoud", checked: false, icon: Settings },
                        { label: "Account updates", checked: true, icon: User },
                        { label: "Feature releases", checked: false, icon: Star }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <Label className="font-normal cursor-pointer">{item.label}</Label>
                          </div>
                          <Switch defaultChecked={item.checked} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SettingsCard>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="lg">
                <SettingsCard
                  title="Account Beveiliging" 
                  description="Beheer je wachtwoord en beveiligingsinstellingen"
                  icon={Shield}
                  variant="success"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="space-y-1">
                        <Label>Account Status</Label>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Beveiligd
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Laatste login: vandaag
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Wachtwoord wijzigen</Label>
                      <div className="space-y-3">
                        <div className="relative">
                          <Input type="password" placeholder="Huidig wachtwoord" />
                          <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" />
                        </div>
                        <div className="relative">
                          <Input type="password" placeholder="Nieuw wachtwoord" />
                          <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" />
                        </div>
                        <div className="relative">
                          <Input type="password" placeholder="Bevestig nieuw wachtwoord" />
                          <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" />
                        </div>
                      </div>
                      <Button className="w-full">
                        <Key className="h-4 w-4 mr-2" />
                        Wachtwoord bijwerken
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Twee-factor authenticatie</Label>
                          <p className="text-sm text-muted-foreground">
                            Extra beveiligingslaag voor je account
                          </p>
                        </div>
                        <Switch
                          checked={twoFactorEnabled}
                          onCheckedChange={setTwoFactorEnabled}
                        />
                      </div>
                      {twoFactorEnabled && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 mb-2">
                            ✅ 2FA is ingeschakeld
                          </p>
                          <Button variant="outline" size="sm">
                            Backup codes tonen
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard
                  title="Gevaar Zone"
                  description="Belangrijke account acties - gebruik met voorzichtigheid"
                  icon={AlertTriangle}
                  variant="warning"
                >
                  <div className="space-y-6">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="space-y-2">
                          <Label className="text-red-900">Data Export</Label>
                          <p className="text-sm text-red-700">
                            Download al je data voordat je het account verwijdert
                          </p>
                          <Button variant="outline" size="sm" onClick={handleExportData}>
                            <Download className="h-4 w-4 mr-2" />
                            Data exporteren
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="space-y-2">
                          <Label className="text-red-900">Account Verwijderen</Label>
                          <p className="text-sm text-red-700">
                            Deze actie kan niet ongedaan worden gemaakt. Al je data wordt permanent verwijderd.
                          </p>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Account verwijderen
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="space-y-2">
                          <Label className="text-orange-900">Account Deactiveren</Label>
                          <p className="text-sm text-orange-700">
                            Tijdelijk je account uitschakelen (kan later weer geactiveerd worden)
                          </p>
                          <Button variant="outline" size="sm">
                            Account deactiveren
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SettingsCard>
              </ResponsiveGrid>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <SettingsCard
                title="Interface & Gedrag"
                description="Personaliseer je AutoblogifyAI ervaring"
                icon={Palette}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          {darkMode ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-yellow-600" />}
                          <div>
                            <Label>Donkere modus</Label>
                            <p className="text-sm text-muted-foreground">
                              {darkMode ? 'Donker thema actief' : 'Licht thema actief'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          Taal
                        </Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nl">🇳🇱 Nederlands</SelectItem>
                            <SelectItem value="en">🇺🇸 English</SelectItem>
                            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Tijdzone
                        </Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Amsterdam">🇳🇱 Amsterdam (CET)</SelectItem>
                            <SelectItem value="Europe/London">🇬🇧 London (GMT)</SelectItem>
                            <SelectItem value="America/New_York">🇺🇸 New York (EST)</SelectItem>
                            <SelectItem value="Asia/Tokyo">🇯🇵 Tokyo (JST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Auto-save interval
                        </Label>
                        <Select defaultValue="60">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">Elke 30 seconden</SelectItem>
                            <SelectItem value="60">Elke minuut</SelectItem>
                            <SelectItem value="300">Elke 5 minuten</SelectItem>
                            <SelectItem value="0">Uitgeschakeld</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="text-center">
                        <div className="mb-2">📊</div>
                        <Label className="text-blue-900">Dashboard Layout</Label>
                        <p className="text-xs text-blue-700 mt-1">Compacte weergave</p>
                        <Switch defaultChecked className="mt-2" />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="text-center">
                        <div className="mb-2">🔔</div>
                        <Label className="text-green-900">Geluid</Label>
                        <p className="text-xs text-green-700 mt-1">Notificatie geluiden</p>
                        <Switch className="mt-2" />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-50 rounded-lg border border-purple-100">
                      <div className="text-center">
                        <div className="mb-2">⚡</div>
                        <Label className="text-purple-900">Animaties</Label>
                        <p className="text-xs text-purple-700 mt-1">Interface effecten</p>
                        <Switch defaultChecked className="mt-2" />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Voorkeuren opslaan
                  </Button>
                </div>
              </SettingsCard>
            </TabsContent>

            {/* Usage Tab */}
            <TabsContent value="usage" className="space-y-6">
              <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="lg">
                <SettingsCard
                  title="Gebruik & Limieten"
                  description="Overzicht van je account gebruik en beschikbare resources"
                  icon={BarChart3}
                  variant="premium"
                  headerAction={
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro Plan
                    </Badge>
                  }
                >
                  <UsageMonitorCard />
                </SettingsCard>

                <SettingsCard
                  title="Facturatie & Billing"
                  description="Beheer je abonnement en betalingsgegevens"
                  icon={CreditCard}
                >
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-green-900">Huidig Plan</Label>
                          <p className="text-sm text-green-700">Pro Plan - €29/maand</p>
                        </div>
                        <Crown className="h-8 w-8 text-amber-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Volgende betaling</span>
                        <span className="text-sm font-medium">15 februari 2024</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Betalingsmethode</span>
                        <span className="text-sm font-medium">•••• 4242</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Betalingsmethode wijzigen
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Facturen downloaden
                      </Button>
                    </div>
                  </div>
                </SettingsCard>
              </ResponsiveGrid>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <SettingsCard
                title="Verbonden Services"
                description="Beheer je externe integraties en API koppelingen"
                icon={Zap}
              >
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'WordPress', status: 'connected', icon: Globe, color: 'green' },
                    { name: 'Google Analytics', status: 'connected', icon: BarChart3, color: 'green' },
                    { name: 'OpenAI API', status: 'connected', icon: Zap, color: 'green' },
                    { name: 'Stripe', status: 'disconnected', icon: CreditCard, color: 'gray' },
                    { name: 'Slack', status: 'disconnected', icon: Bell, color: 'gray' },
                    { name: 'Zapier', status: 'disconnected', icon: Zap, color: 'gray' }
                  ].map((service, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${service.color === 'green' ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <service.icon className={`h-5 w-5 ${service.color === 'green' ? 'text-green-600' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <Label>{service.name}</Label>
                            <p className="text-xs text-muted-foreground">
                              {service.status === 'connected' ? 'Verbonden' : 'Niet verbonden'}
                            </p>
                          </div>
                        </div>
                        <Badge className={service.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {service.status === 'connected' ? 'Actief' : 'Inactief'}
                        </Badge>
                      </div>
                      <Button 
                        variant={service.status === 'connected' ? 'outline' : 'default'} 
                        size="sm" 
                        className="w-full"
                      >
                        {service.status === 'connected' ? 'Configureren' : 'Verbinden'}
                      </Button>
                    </div>
                  ))}
                </div>
              </SettingsCard>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default SettingsPage;