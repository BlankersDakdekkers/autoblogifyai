import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, CheckCircle, Clock, CreditCard } from 'lucide-react';

const stripePromise = loadStripe('pk_test_51QmwdKKdDy73xPeaK3d3hKQ4Z00Z9VoZF01N9nwBkpZNLKCf1VfwN4KGNzOqCjxUYUnVdnhJxJMUJKB6K0Cf5YY600QfCLJJ6B');

interface CheckoutFormProps {
  tier: string;
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
}

const CheckoutForm = ({ tier, clientSecret, amount, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setProgress(20);

    try {
      setProgress(60);
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required'
      });

      setProgress(80);

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setProgress(100);
        toast({
          title: "Betaling succesvol! 🎉",
          description: `Je ${tier} abonnement is geactiveerd.`,
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Betaling mislukt",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Betaling verwerken...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Plan Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{tier} Plan</CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Populair
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold">€{(amount / 100).toFixed(0)}</span>
              <span className="text-muted-foreground">/maand</span>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Vandaag starten
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5" />
            Betaalgegevens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement 
              options={{
                layout: "tabs",
                fields: {
                  billingDetails: {
                    address: {
                      country: 'auto'
                    }
                  }
                }
              }}
            />
            
            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-4 py-4 border-t border-border/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="w-3 h-3 text-green-500" />
                256-bit SSL
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Veilige betaling
              </div>
              <div className="text-xs text-muted-foreground">
                Powered by Stripe
              </div>
            </div>

            <Button
              type="submit"
              disabled={!stripe || loading}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Betaling verwerken...
                </>
              ) : (
                <>
                  Betaal €{(amount / 100).toFixed(0)} en start vandaag
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Guarantees */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-green-500" />
          30 dagen geld-terug-garantie
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Altijd opzegbaar
        </div>
      </div>
    </div>
  );
};

interface CustomCheckoutProps {
  tier: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomCheckout = ({ tier, onSuccess, onCancel }: CustomCheckoutProps) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Niet ingelogd');
        }

        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: { tier },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        setClientSecret(data.client_secret);
        setAmount(data.amount);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Fout bij laden checkout",
          description: "Probeer het opnieuw of neem contact op",
          variant: "destructive",
        });
        onCancel();
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [tier, onCancel, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checkout laden...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Kon checkout niet laden</p>
        <Button onClick={onCancel} variant="outline" className="mt-4">
          Terug naar plannen
        </Button>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: 'hsl(var(--primary))',
        colorBackground: 'hsl(var(--background))',
        colorText: 'hsl(var(--foreground))',
        colorDanger: 'hsl(var(--destructive))',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="mb-4"
          >
            ← Terug naar plannen
          </Button>
          <h1 className="text-3xl font-bold">Laatste stap!</h1>
          <p className="text-muted-foreground mt-2">
            Voer je betaalgegevens in om je {tier} abonnement te activeren
          </p>
        </div>

        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            tier={tier}
            clientSecret={clientSecret}
            amount={amount}
            onSuccess={onSuccess}
          />
        </Elements>
      </div>
    </div>
  );
};