import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AdminSetup = () => {
  const { toast } = useToast();
  const { user, refreshCredits } = useAuth();
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const makeAdmin = async () => {
    if (!user) {
      toast({
        title: "Niet ingelogd",
        description: "Je moet ingelogd zijn om admin te worden",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Call the make_self_admin function
      const { error } = await supabase.rpc('make_self_admin');
      
      if (error) {
        console.error('Error making admin:', error);
        throw error;
      }

      setSetupComplete(true);
      toast({
        title: "Admin account aangemaakt! 🎉",
        description: "Je hebt nu admin rechten. Herlaad de pagina om de admin functies te zien.",
      });

      // Refresh the page after a short delay to show admin features
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Fout bij admin setup",
        description: error.message || "Er ging iets mis bij het aanmaken van het admin account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (setupComplete) {
    return (
      <Card className="max-w-md mx-auto border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl text-accent">Admin Setup Voltooid!</CardTitle>
          <CardDescription>
            Je admin account is succesvol aangemaakt. De pagina wordt automatisch herladen.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Account Setup
          </CardTitle>
          <CardDescription>
            Maak jezelf admin om toegang te krijgen tot alle beheerfuncties
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Deze functie is alleen beschikbaar voor de eerste admin setup. 
              Na het aanmaken van een admin account kan alleen een bestaande admin nieuwe admins aanwijzen.
            </AlertDescription>
          </Alert>

          {user ? (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Ingelogd als:</p>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <Button
                onClick={makeAdmin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                    Admin account aanmaken...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Maak mij admin
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Je moet eerst ingelogd zijn om een admin account aan te kunnen maken.
                <br />
                <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/auth'}>
                  Ga naar inlogpagina
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;