import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { method: req.method });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the raw body for signature verification
    const body = await req.text();
    
    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    // Initialize Supabase client with service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different webhook events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabaseService, stripe, subscription, 'activated');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabaseService, stripe, subscription, 'cancelled');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handlePaymentSuccess(supabaseService, stripe, invoice);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabaseService, stripe, invoice);
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionChange(
  supabase: any, 
  stripe: Stripe, 
  subscription: Stripe.Subscription, 
  action: 'activated' | 'cancelled'
) {
  logStep("Handling subscription change", { 
    subscriptionId: subscription.id, 
    action, 
    status: subscription.status 
  });

  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) {
      throw new Error("Customer not found or deleted");
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Determine subscription tier from price
    let tier = 'starter';
    let creditLimit = 500;
    
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount >= 59700) { // €597
        tier = 'enterprise';
        creditLimit = 5000;
      } else if (amount >= 29700) { // €297
        tier = 'professional';
        creditLimit = 1500;
      } else {
        tier = 'starter';
        creditLimit = 500;
      }
    }

    if (action === 'cancelled') {
      tier = 'free';
      creditLimit = 5;
    }

    // Update subscriber record
    const subscriptionEnd = action === 'cancelled' 
      ? new Date().toISOString()
      : new Date(subscription.current_period_end * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('subscribers')
      .upsert({
        email: customerEmail,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        subscribed: action === 'activated' && subscription.status === 'active',
        subscription_tier: tier,
        subscription_end: subscriptionEnd,
        monthly_credit_limit: creditLimit,
        credits_reset_date: new Date().toISOString().split('T')[0], // Today's date
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (updateError) throw updateError;

    // Find user by email and update credits
    const { data: authUser } = await supabase.auth.admin.getUserByEmail(customerEmail);
    
    if (authUser?.user) {
      const { error: creditError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: authUser.user.id,
          credits_remaining: creditLimit,
          last_credit_update: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (creditError) throw creditError;
      
      logStep("Credits updated for user", { 
        userId: authUser.user.id, 
        credits: creditLimit, 
        tier 
      });
    }

    logStep("Subscription change processed successfully", { 
      email: customerEmail, 
      tier, 
      credits: creditLimit 
    });

  } catch (error) {
    console.error("Error handling subscription change:", error);
    throw error;
  }
}

async function handlePaymentSuccess(supabase: any, stripe: Stripe, invoice: Stripe.Invoice) {
  logStep("Handling successful payment", { 
    invoiceId: invoice.id, 
    subscriptionId: invoice.subscription 
  });

  try {
    // Refresh credits for this billing cycle
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    await handleSubscriptionChange(supabase, stripe, subscription, 'activated');
    
    logStep("Payment success processed - credits refreshed");
  } catch (error) {
    console.error("Error handling payment success:", error);
    throw error;
  }
}

async function handlePaymentFailed(supabase: any, stripe: Stripe, invoice: Stripe.Invoice) {
  logStep("Handling failed payment", { 
    invoiceId: invoice.id, 
    subscriptionId: invoice.subscription 
  });

  try {
    const customer = await stripe.customers.retrieve(invoice.customer as string);
    if (!customer || customer.deleted) {
      throw new Error("Customer not found");
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Optionally downgrade to free tier on payment failure
    // Or just log it for manual review
    logStep("Payment failed logged", { email: customerEmail });
    
  } catch (error) {
    console.error("Error handling payment failure:", error);
    throw error;
  }
}