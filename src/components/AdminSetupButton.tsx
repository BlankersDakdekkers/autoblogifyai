import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminSetupButton = () => {
  const { toast } = useToast();

  const handleMakeAdmin = async () => {
    try {
      const { data, error } = await supabase.rpc('make_self_admin');
      
      if (error) {
        console.error('Error making self admin:', error);
        toast({
          title: "Fout",
          description: "Kon admin rechten niet toekennen: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Admin rechten toegekend",
        description: "Je hebt nu admin rechten. Refresh de pagina om de wijzigingen te zien.",
      });
      
      // Refresh page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleMakeAdmin}
      variant="outline"
      className="gap-2"
    >
      <Crown className="h-4 w-4" />
      Maak mij admin
    </Button>
  );
};

export default AdminSetupButton;