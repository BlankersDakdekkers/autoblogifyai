import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Search, 
  Eye, 
  Edit,
  Crown,
  Mail,
  Phone,
  ExternalLink,
  RefreshCcw,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface Customer {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  stripe_customer_id?: string;
  onboarding_completed: boolean;
}

interface CustomerStats {
  total_customers: number;
  active_subscribers: number;
  trial_users: number;
  premium_users: number;
  total_revenue: number;
  monthly_revenue: number;
}

const AdminCustomerPortal = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    total_customers: 0,
    active_subscribers: 0,
    trial_users: 0,
    premium_users: 0,
    total_revenue: 0,
    monthly_revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Check if user is admin
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Je hebt geen admin rechten om deze pagina te bekijken.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles and subscribers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*');

      if (profilesError) throw profilesError;
      if (subscribersError) throw subscribersError;

      // Combine profiles and subscribers data
      const combinedCustomers: Customer[] = profiles?.map(profile => {
        const subscription = subscribers?.find(sub => sub.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: subscription?.email || 'Unknown',
          display_name: profile.display_name,
          created_at: profile.created_at,
          subscribed: subscription?.subscribed || false,
          subscription_tier: subscription?.subscription_tier,
          subscription_end: subscription?.subscription_end,
          stripe_customer_id: subscription?.stripe_customer_id,
          onboarding_completed: profile.onboarding_completed
        };
      }) || [];

      setCustomers(combinedCustomers);

      // Calculate stats
      const totalCustomers = combinedCustomers.length;
      const activeSubscribers = combinedCustomers.filter(c => c.subscribed).length;
      const premiumUsers = combinedCustomers.filter(c => c.subscription_tier === 'Premium').length;
      const trialUsers = totalCustomers - activeSubscribers;

      setStats({
        total_customers: totalCustomers,
        active_subscribers: activeSubscribers,
        trial_users: trialUsers,
        premium_users: premiumUsers,
        total_revenue: activeSubscribers * 49, // Mock calculation
        monthly_revenue: activeSubscribers * 49
      });

    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Fout",
        description: "Kon klantgegevens niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerPortalAccess = async (customerId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          'user-id': customerId
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Succes",
          description: "Customer portal geopend in nieuwe tab"
        });
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Fout",
        description: "Kon customer portal niet openen",
        variant: "destructive"
      });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubscriptionBadge = (customer: Customer) => {
    if (!customer.subscribed) {
      return <Badge variant="secondary">Trial</Badge>;
    }
    
    switch (customer.subscription_tier) {
      case 'Premium':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'Basic':
        return <Badge variant="default">Basic</Badge>;
      default:
        return <Badge variant="outline">Onbekend</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Klanten Portaal</h1>
          <p className="text-muted-foreground">
            Beheer en monitor alle klanten en hun abonnementen
          </p>
        </div>
        <Button onClick={fetchCustomers} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Vernieuwen
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Klanten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_customers}</div>
            <p className="text-xs text-muted-foreground">
              Geregistreerde gebruikers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Abonnees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_subscribers}</div>
            <p className="text-xs text-muted-foreground">
              Betalende klanten
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Gebruikers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premium_users}</div>
            <p className="text-xs text-muted-foreground">
              Premium abonnementen
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maandelijkse Omzet</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.monthly_revenue}</div>
            <p className="text-xs text-muted-foreground">
              Recurring revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Klanten Beheer</CardTitle>
          <CardDescription>
            Zoek en beheer alle klanten en hun abonnementen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Zoek op email of naam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abonnement</TableHead>
                <TableHead>Einddatum</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.display_name || 'Geen naam'}</div>
                    <div className="text-sm text-muted-foreground">
                      Lid sinds {new Date(customer.created_at).toLocaleDateString('nl-NL')}
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    {customer.subscribed ? (
                      <Badge variant="default">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Actief
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Trial</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getSubscriptionBadge(customer)}</TableCell>
                  <TableCell>
                    {customer.subscription_end ? 
                      new Date(customer.subscription_end).toLocaleDateString('nl-NL') : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {customer.onboarding_completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Klant Details</DialogTitle>
                            <DialogDescription>
                              Volledige informatie over {customer.display_name || customer.email}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="general">Algemeen</TabsTrigger>
                              <TabsTrigger value="subscription">Abonnement</TabsTrigger>
                              <TabsTrigger value="activity">Activiteit</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="general" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Naam</Label>
                                  <p className="text-sm">{customer.display_name || 'Niet ingesteld'}</p>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <p className="text-sm">{customer.email}</p>
                                </div>
                                <div>
                                  <Label>Registratiedatum</Label>
                                  <p className="text-sm">{new Date(customer.created_at).toLocaleDateString('nl-NL')}</p>
                                </div>
                                <div>
                                  <Label>Onboarding Status</Label>
                                  <p className="text-sm">
                                    {customer.onboarding_completed ? 'Voltooid' : 'In behandeling'}
                                  </p>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="subscription" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Abonnement Status</Label>
                                  <p className="text-sm">
                                    {customer.subscribed ? 'Actief' : 'Trial/Inactief'}
                                  </p>
                                </div>
                                <div>
                                  <Label>Abonnement Type</Label>
                                  <p className="text-sm">{customer.subscription_tier || 'Geen'}</p>
                                </div>
                                <div>
                                  <Label>Einddatum</Label>
                                  <p className="text-sm">
                                    {customer.subscription_end ? 
                                      new Date(customer.subscription_end).toLocaleDateString('nl-NL') : 
                                      'N/A'
                                    }
                                  </p>
                                </div>
                                <div>
                                  <Label>Stripe Customer ID</Label>
                                  <p className="text-sm font-mono">{customer.stripe_customer_id || 'Geen'}</p>
                                </div>
                              </div>
                              
                              {customer.stripe_customer_id && (
                                <Button 
                                  onClick={() => handleCustomerPortalAccess(customer.id)}
                                  className="w-full"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open Stripe Customer Portal
                                </Button>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="activity" className="space-y-4">
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Activiteitslogboek functionaliteit wordt binnenkort toegevoegd.
                                </AlertDescription>
                              </Alert>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                      
                      {customer.stripe_customer_id && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCustomerPortalAccess(customer.id)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Geen klanten gevonden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomerPortal;