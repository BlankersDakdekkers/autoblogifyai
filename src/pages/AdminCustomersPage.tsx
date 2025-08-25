import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Calendar, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomerData {
  id: string;
  email: string;
  subscription_tier?: string;
  credits_remaining?: number;
  created_at: string;
  last_sign_in_at?: string;
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
      
      // Fetch users with their credit info and subscriptions
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          created_at
        `);
        
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Get credits for each user
      const { data: credits } = await supabase
        .from('user_credits')
        .select('user_id, credits_remaining');

      // Get subscription data
      const { data: subscriptions } = await supabase
        .from('subscribers')
        .select('user_id, email, subscription_tier');

      // Combine data
      const customerData = users?.map(user => {
        const userCredits = credits?.find(c => c.user_id === user.user_id);
        const userSub = subscriptions?.find(s => s.user_id === user.user_id);
        
        return {
          id: user.user_id,
          email: userSub?.email || 'Geen email',
          subscription_tier: userSub?.subscription_tier || 'Free',
          credits_remaining: userCredits?.credits_remaining || 0,
          created_at: user.created_at,
          last_sign_in_at: null
        };
      }) || [];

      setCustomers(customerData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Fout",
        description: "Kon klantgegevens niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'destructive';
      case 'professional': return 'secondary';
      case 'starter': return 'default';
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
              <p className="text-muted-foreground">Klanten laden...</p>
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
                Klantbeheer
              </h1>
              <p className="text-muted-foreground mt-2">
                Overzicht van alle klanten en hun abonnementen
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
              <CardTitle className="text-sm font-medium">Premium Klanten</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10">
                <CreditCard className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                {customers.filter(c => c.subscription_tier !== 'Free').length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Credits</CardTitle>
              <div className="p-2 rounded-lg bg-secondary/10">
                <CreditCard className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                {customers.reduce((sum, c) => sum + (c.credits_remaining || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
              <div className="p-2 rounded-lg bg-destructive/10">
                <Users className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text text-transparent">
                {customers.filter(c => c.subscription_tier === 'enterprise').length}
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
                  Overzicht van klanten en hun abonnementsgegevens
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
                    <TableHead>Abonnement</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Aangemeld op</TableHead>
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
                            <div className="font-medium">{customer.email}</div>
                            <div className="text-xs text-muted-foreground">{customer.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTierBadgeVariant(customer.subscription_tier || 'Free')}>
                          {customer.subscription_tier || 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customer.credits_remaining || 0}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(customer.created_at).toLocaleDateString('nl-NL')}
                        </div>
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