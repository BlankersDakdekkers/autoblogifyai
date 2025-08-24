import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Search, MoreHorizontal, CreditCard, Calendar, Crown, Coins, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomerData {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  role?: string;
  // Subscription data
  subscribed?: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  stripe_customer_id?: string;
  // Credits data
  credits_remaining?: number;
  total_credits_used?: number;
  last_credit_update?: string;
}

const AdminCustomersPage = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with their profiles, subscriptions, and credits
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          created_at,
          updated_at
        `);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Fout bij ophalen profielen",
          description: "Kon profielgegevens niet ophalen",
          variant: "destructive",
        });
        return;
      }

      // Fetch subscribers data
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select(`
          user_id,
          email,
          stripe_customer_id,
          subscribed,
          subscription_tier,
          subscription_end,
          created_at,
          updated_at
        `);

      if (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError);
      }

      // Fetch user credits
      const { data: userCredits, error: creditsError } = await supabase
        .from('user_credits')
        .select(`
          user_id,
          credits_remaining,
          total_credits_used,
          last_credit_update
        `);

      if (creditsError) {
        console.error('Error fetching credits:', creditsError);
      }

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role
        `);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      // Create maps for easy lookup
      const subscribersMap = new Map(subscribers?.map(s => [s.user_id, s]) || []);
      const creditsMap = new Map(userCredits?.map(c => [c.user_id, c]) || []);
      const rolesMap = new Map(userRoles?.map(r => [r.user_id, r.role]) || []);

      // Combine all data
      const combinedData: CustomerData[] = profiles?.map(profile => {
        const subscription = subscribersMap.get(profile.user_id);
        const credits = creditsMap.get(profile.user_id);
        const role = rolesMap.get(profile.user_id);

        return {
          id: profile.user_id,
          email: subscription?.email || 'Onbekend',
          display_name: profile.display_name,
          created_at: profile.created_at,
          role: role || 'user',
          // Subscription data
          subscribed: subscription?.subscribed || false,
          subscription_tier: subscription?.subscription_tier,
          subscription_end: subscription?.subscription_end,
          stripe_customer_id: subscription?.stripe_customer_id,
          // Credits data
          credits_remaining: credits?.credits_remaining || 0,
          total_credits_used: credits?.total_credits_used || 0,
          last_credit_update: credits?.last_credit_update,
        };
      }) || [];

      setCustomers(combinedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het ophalen van klantgegevens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.display_name && customer.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSubscriptionBadgeVariant = (subscribed: boolean, tier?: string) => {
    if (!subscribed) return 'outline';
    switch (tier) {
      case 'Premium': return 'default';
      case 'Enterprise': return 'destructive';
      default: return 'secondary';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center animate-fade-in">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Klantgegevens laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Klanten Overzicht
              </h1>
              <p className="text-muted-foreground mt-2">
                Beheer klanten, abonnementen en credits
              </p>
            </div>
            <Badge variant="secondary" className="w-fit">
              {customers.length} klanten
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Klanten</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {customers.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Betalende Klanten</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10">
                <CreditCard className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                {customers.filter(c => c.subscribed).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Gebruikers</CardTitle>
              <div className="p-2 rounded-lg bg-destructive/10">
                <Crown className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text text-transparent">
                {customers.filter(c => c.subscription_tier === 'Premium').length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Credits</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {customers.reduce((sum, c) => sum + (c.credits_remaining || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1 rounded bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  Alle Klanten
                </CardTitle>
                <CardDescription>
                  Overzicht van alle klanten met abonnement- en creditinformatie
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek klanten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Klant</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Abonnement</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Registratie</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-gradient-to-r hover:from-muted/30 hover:to-transparent">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.email}`} />
                            <AvatarFallback>{customer.email.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.display_name || customer.email}</div>
                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(customer.role || 'user')}>
                          {customer.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={getSubscriptionBadgeVariant(customer.subscribed || false, customer.subscription_tier)}>
                            {customer.subscribed ? customer.subscription_tier || 'Actief' : 'Gratis'}
                          </Badge>
                          {customer.subscription_end && (
                            <div className="text-xs text-muted-foreground">
                              Tot: {new Date(customer.subscription_end).toLocaleDateString('nl-NL')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Coins className="h-3 w-3 text-primary" />
                            <span className="font-medium">{customer.credits_remaining || 0}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Gebruikt: {customer.total_credits_used || 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(customer.created_at).toLocaleDateString('nl-NL')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Acties</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Bekijk details
                            </DropdownMenuItem>
                            {customer.stripe_customer_id && (
                              <DropdownMenuItem>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Stripe profiel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCustomersPage;