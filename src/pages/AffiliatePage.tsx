import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Copy, 
  Download,
  Share2,
  Gift,
  Target,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AffiliatePage = () => {
  const { toast } = useToast();
  const [affiliateCode] = useState("AUTOBLOG-PARTNER-2024");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliateCode);
    toast({
      title: "Affiliate code gekopieerd!",
      description: "Je kunt nu je unieke code delen"
    });
  };

  const stats = [
    { title: "Totaal verdiend", value: "€2.847", icon: DollarSign, change: "+18.2%" },
    { title: "Actieve referrals", value: "42", icon: Users, change: "+12%" },
    { title: "Conversie ratio", value: "8.4%", icon: TrendingUp, change: "+2.1%" },
    { title: "Deze maand", value: "€428", icon: Gift, change: "+24%" }
  ];

  const commissionTiers = [
    { tier: "Bronze", referrals: "0-10", commission: "25%", perks: ["Basis marketing materialen", "Maandelijkse uitbetaling"] },
    { tier: "Silver", referrals: "11-25", commission: "30%", perks: ["Premium marketing kit", "Tweewekelijkse uitbetaling", "Dedicated support"] },
    { tier: "Gold", referrals: "26-50", commission: "35%", perks: ["Custom landing pages", "Wekelijkse uitbetaling", "Early access features"] },
    { tier: "Platinum", referrals: "50+", commission: "40%", perks: ["White-label opties", "Direct uitbetaling", "Co-marketing kansen"] }
  ];

  const recentActivity = [
    { type: "Nieuwe referral", customer: "Dakdekker Pro Amsterdam", amount: "€29", date: "2 uur geleden" },
    { type: "Commissie uitbetaald", customer: "Marketing Bureau X", amount: "€145", date: "1 dag geleden" },
    { type: "Upgrade", customer: "SEO Expert Lisa", amount: "€58", date: "3 dagen geleden" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AutoblogifyAI Partner Programma
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verdien tot <span className="font-semibold text-primary">40% commissie</span> door AutoblogifyAI te promoten. 
            Help anderen succesvol te worden met geautomatiseerde content.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
              <Share2 className="mr-2 h-4 w-4" />
              Start met delen
            </Button>
            <Button variant="outline" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Marketing materialen
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-emerald-600 font-medium">
                  {stat.change} vs vorige maand
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="commission">Commissie</TabsTrigger>
            <TabsTrigger value="materials">Materialen</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Affiliate Code Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Jouw Affiliate Code
                </CardTitle>
                <CardDescription>
                  Deel deze unieke code om commissies te verdienen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={affiliateCode} readOnly className="font-mono" />
                  <Button onClick={handleCopyCode} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Affiliate Link:</strong> https://autoblogifyai.com/signup?ref={affiliateCode}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recente Activiteit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-emerald-600">{activity.amount}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commission" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Commissie Tiers
                </CardTitle>
                <CardDescription>
                  Hoe meer je verwijst, hoe hoger je commissie wordt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {commissionTiers.map((tier, index) => (
                    <Card key={index} className={`${tier.tier === 'Gold' ? 'ring-2 ring-primary' : ''}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{tier.tier}</CardTitle>
                          <Badge variant={tier.tier === 'Gold' ? 'default' : 'outline'}>
                            {tier.commission}
                          </Badge>
                        </div>
                        <CardDescription>{tier.referrals} referrals</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {tier.perks.map((perk, perkIndex) => (
                            <li key={perkIndex} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Materialen</CardTitle>
                  <CardDescription>
                    Download professionele marketing assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Email templates (5 varianten)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Social media graphics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Product demo video's
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Landing page templates
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Tips</CardTitle>
                  <CardDescription>
                    Maximaliseer je affiliate inkomsten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <h4 className="font-medium">1. Target de juiste audience</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus op SEO bureaus, content marketers en lokale bedrijven
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <h4 className="font-medium">2. Deel je ervaring</h4>
                    <p className="text-sm text-muted-foreground">
                      Persoonlijke case studies converteren 3x beter
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <h4 className="font-medium">3. Timing is belangrijk</h4>
                    <p className="text-sm text-muted-foreground">
                      Q1 en Q4 zijn de beste periodes voor B2B tools
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Click Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Totaal clicks</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unieke bezoekers</span>
                      <span className="font-medium">892</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversie ratio</span>
                      <span className="font-medium text-emerald-600">8.4%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>LinkedIn</span>
                      <span className="font-medium">34%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email marketing</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Direct links</span>
                      <span className="font-medium">23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Social media</span>
                      <span className="font-medium">15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AffiliatePage;