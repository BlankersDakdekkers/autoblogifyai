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

// Use your live/test publishable key from Stripe Dashboard
const STRIPE_PUBLISHABLE_KEY = import.meta.env.DEV 
  ? 'pk_test_51QmwdKKdDy73xPeaK3d3hKQ4Z00Z9VoZF01N9nwBkpZNLKCf1VfwN4KGNzOqCjxUYUnVdnhJxJMUJKB6K0Cf5YY600QfCLJJ6B' // Test key
  : 'pk_live_YOUR_LIVE_KEY_HERE'; // Replace with your live key

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

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
    <div className="space-y-6">
      {/* Progress Bar */}
      {loading && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Betaling verwerken...</span>
                <span className="text-primary font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Summary - Left Column */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{tier} Plan</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Populair
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-4xl font-bold">€{(amount / 100).toFixed(0)}</span>
                  <span className="text-muted-foreground text-lg">/maand</span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Vandaag starten
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-sm">Inbegrepen:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Onbeperkte blogposts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI content generatie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>SEO optimalisatie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Automatische publicatie</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  30 dagen geld-terug-garantie
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Altijd opzegbaar
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form - Right Columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="w-5 h-5" />
                Betaalgegevens
              </CardTitle>
              <p className="text-muted-foreground">
                Voer je betaalgegevens in om je abonnement te activeren
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4">
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
                </div>
                
                {/* Trust Signals */}
                <div className="flex items-center justify-center gap-6 py-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-green-500" />
                    256-bit SSL
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Veilige betaling
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Powered by Stripe
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full h-14 text-lg font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    amount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
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

        setPaymentData({
          clientSecret: data.client_secret,
          amount: data.amount
        });
      } catch (error) {
        console.error('Error creating payment intent:', error);
        const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
        setError(errorMessage);
        toast({
          title: "Fout bij laden checkout",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [tier, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Checkout voorbereiden...</h2>
            <p className="text-muted-foreground">Even geduld terwijl we alles klaar maken</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-destructive text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-destructive">Checkout kon niet geladen worden</h2>
          <p className="text-muted-foreground">{error || 'Er is een onbekende fout opgetreden'}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={onCancel} variant="outline">
              Terug naar plannen
            </Button>
            <Button onClick={() => window.location.reload()}>
              Opnieuw proberen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret: paymentData.clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: 'hsl(var(--primary))',
        colorBackground: 'hsl(var(--background))',
        colorText: 'hsl(var(--foreground))',
        colorDanger: 'hsl(var(--destructive))',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
        spacingUnit: '6px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              ← Terug naar plannen
            </Button>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Veilige betaling
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold shadow-lg">
                  1
                </div>
                <div className="w-12 h-1 bg-primary rounded-full"></div>
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold shadow-lg">
                  2
                </div>
                <div className="w-12 h-1 bg-muted rounded-full"></div>
                <div className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
                  3
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Laatste stap!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Voer je betaalgegevens in om je <span className="font-semibold text-foreground">{tier}</span> abonnement te activeren
            </p>
          </div>

          {/* Checkout Form */}
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm
              tier={tier}
              clientSecret={paymentData.clientSecret}
              amount={paymentData.amount}
              onSuccess={onSuccess}
            />
          </Elements>

          {/* Additional Trust Signals */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-6 bg-muted/50 rounded-full px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-green-500" />
                <span>SSL Beveiligd</span>
              </div>
              <div className="w-1 h-4 bg-border"></div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>PCI Compliant</span>
              </div>
              <div className="w-1 h-4 bg-border"></div>
              <div className="text-sm text-muted-foreground">
                Powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};