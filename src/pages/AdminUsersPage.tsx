import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Search, MoreHorizontal, Mail, Calendar, Shield, UserX, UserCheck, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  role?: string;
}

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Niet geautoriseerd",
          description: "Je moet ingelogd zijn om gebruikers te bekijken",
          variant: "destructive",
        });
        return;
      }

      // Call our Edge Function to list users
      const { data, error } = await supabase.functions.invoke('admin-list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Fout bij ophalen gebruikers",
          description: error.message || "Kon gebruikersgegevens niet ophalen",
          variant: "destructive",
        });
        return;
      }

      setUsers(data.users);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het ophalen van gebruikers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Niet geautoriseerd",
          description: "Je moet ingelogd zijn om rollen bij te werken",
          variant: "destructive",
        });
        return;
      }

      // Call our Edge Function to update user role
      const { error } = await supabase.functions.invoke('admin-update-user-role', {
        body: { userId, newRole },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Fout",
          description: error.message || "Kon gebruikersrol niet bijwerken",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Rol bijgewerkt",
        description: `Gebruikersrol is bijgewerkt naar ${newRole}`,
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Fout",
        description: "Kon gebruikersrol niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3" />;
      case 'moderator': return <Shield className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center animate-fade-in">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Gebruikers laden...</p>
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
                Gebruikersbeheer
              </h1>
              <p className="text-muted-foreground mt-2">
                Beheer alle gebruikers en hun rollen
              </p>
            </div>
            <Badge variant="secondary" className="w-fit">
              {users.length} gebruikers
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Gebruikers</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <div className="p-2 rounded-lg bg-destructive/10">
                <Crown className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text text-transparent">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bevestigde Emails</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10">
                <Mail className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                {users.filter(u => u.email_confirmed_at).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Gebruikers</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {users.filter(u => u.last_sign_in_at).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Users Table */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1 rounded bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  Alle Gebruikers
                </CardTitle>
                <CardDescription>
                  Bekijk en beheer alle geregistreerde gebruikers
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek gebruikers..."
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
                    <TableHead>Gebruiker</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aangemeld op</TableHead>
                    <TableHead>Laatste login</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gradient-to-r hover:from-muted/30 hover:to-transparent">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
                            <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.email}</div>
                            <div className="text-xs text-muted-foreground">{user.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role || 'user')} className="gap-1">
                          {getRoleIcon(user.role || 'user')}
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                          {user.email_confirmed_at ? "Bevestigd" : "Onbevestigd"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString('nl-NL')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_sign_in_at ? (
                          <div className="text-sm text-muted-foreground">
                            {new Date(user.last_sign_in_at).toLocaleDateString('nl-NL')}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Nooit</span>
                        )}
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
                            <DropdownMenuItem onClick={() => handleUpdateUserRole(user.id, 'user')}>
                              <Users className="mr-2 h-4 w-4" />
                              Maak gebruiker
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateUserRole(user.id, 'moderator')}>
                              <Shield className="mr-2 h-4 w-4" />
                              Maak moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateUserRole(user.id, 'admin')}>
                              <Crown className="mr-2 h-4 w-4" />
                              Maak admin
                            </DropdownMenuItem>
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

export default AdminUsersPage;