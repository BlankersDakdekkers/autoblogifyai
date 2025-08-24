import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Crown, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const AdminSetup = () => {
  const { toast } = useToast();
  const { user, refreshCredits } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAutoChecking, setIsAutoChecking] = useState(true);
  const [adminExists, setAdminExists] = useState<boolean>(false);

  // Automatically check and assign admin if no admin exists
  useEffect(() => {
    const autoAssignAdmin = async () => {
      if (!user) return;
      
      try {
        setIsAutoChecking(true);
        
        // Check if any admin exists
        const { data: adminCheck } = await supabase.rpc('admin_exists');
        setAdminExists(adminCheck);
        
        if (!adminCheck) {
          // No admin exists, manually make this user admin
          await supabase.rpc('make_self_admin');
          
          toast({
            title: "Automatisch Admin Gemaakt! 👑",
            description: "Je bent automatisch admin geworden als eerste gebruiker",
          });
          
          // Refresh and reload to show admin features
          refreshCredits();
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (error) {
        console.error('Error in auto admin setup:', error);
      } finally {
        setIsAutoChecking(false);
      }
    };

    autoAssignAdmin();
  }, [user, refreshCredits, toast]);

  const handleMakeAdmin = async () => {
    if (!user) {
      toast({
        title: "Niet ingelogd",
        description: "Je moet ingelogd zijn om admin te worden",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call the function to make current user admin
      const { error } = await supabase.rpc('make_self_admin');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Admin rechten toegekend! 👑",
        description: "Je hebt nu admin toegang tot het systeem",
      });

      // Refresh credits and user data
      refreshCredits();
      
      // Reload the page to update sidebar and permissions
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Error making user admin:', error);
      toast({
        title: "Fout bij admin setup",
        description: error.message || "Er ging iets mis bij het toekennen van admin rechten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Niet Ingelogd
          </CardTitle>
          <CardDescription>
            Je moet eerst ingelogd zijn om admin rechten aan te kunnen vragen.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isAutoChecking) {
    return (
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            Admin Setup Controleren...
          </CardTitle>
          <CardDescription>
            Controleren of admin rechten automatisch toegekend kunnen worden...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // If admin already exists, don't show the setup
  if (adminExists) {
    return (
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            Admin Setup Voltooid
          </CardTitle>
          <CardDescription>
            Er is al een admin account ingesteld in het systeem.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Admin Account Setup
        </CardTitle>
        <CardDescription>
          Geef jezelf admin rechten voor volledig toegang tot het systeem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
          <Shield className="h-5 w-5 text-accent mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Huidige gebruiker</h4>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Admin rechten geven:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Toegang tot gebruikersbeheer</li>
            <li>• System monitoring dashboard</li>
            <li>• Klanten portaal beheer</li>
            <li>• Volledige database toegang</li>
          </ul>
        </div>

        <Button
          onClick={handleMakeAdmin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
              Admin rechten toekennen...
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Maak mij Admin
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};