import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreditStatus {
  remaining: number;
  used_this_period: number;
  last_updated?: string;
  reset_due: boolean;
}

interface SubscriptionInfo {
  tier: string;
  monthly_limit: number;
  subscribed: boolean;
  next_reset?: string;
  expires?: string;
}

interface SubscriptionStats {
  credits: CreditStatus;
  subscription: SubscriptionInfo;
}

export const useSubscriptionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkCreditStatus = async (): Promise<SubscriptionStats | null> => {
    if (!user) {
      toast({
        title: "❌ Niet ingelogd",
        description: "Log eerst in om je credits te bekijken.",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'check_credit_status',
          user_id: user.id
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error checking credit status:', error);
      toast({
        title: "❌ Fout bij credit check",
        description: "Kon credit status niet ophalen. Probeer het opnieuw.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCredits = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "❌ Niet ingelogd",
        description: "Log eerst in om je credits te verversen.",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'refresh_credits',
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Credits ververst!",
        description: `Je hebt nu ${data.credits_refreshed} credits (${data.subscription_tier} plan)`,
      });

      return true;
    } catch (error) {
      console.error('Error refreshing credits:', error);
      toast({
        title: "❌ Fout bij credit refresh",
        description: "Kon credits niet verversen. Probeer het opnieuw.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async (): Promise<void> => {
    if (!user) {
      toast({
        title: "❌ Niet ingelogd",
        description: "Log eerst in om je abonnement te beheren.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      toast({
        title: "🔄 Stripe Portal wordt geladen...",
        description: "Even geduld, we openen je abonnement beheer.",
      });

      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        // Open Stripe customer portal in same tab for better UX
        window.location.href = data.url;
      } else {
        throw new Error('Geen portal URL ontvangen');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "❌ Fout bij portal openen",
        description: error instanceof Error ? error.message : "Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscriptionStats = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'get_subscription_stats'
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      toast({
        title: "❌ Fout bij statistieken",
        description: "Kon abonnement statistieken niet ophalen.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    checkCreditStatus,
    refreshCredits,
    openCustomerPortal,
    getSubscriptionStats
  };
};