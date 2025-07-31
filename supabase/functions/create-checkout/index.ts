
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { users, billing, plan = 'pro' } = await req.json();

    if (!users || users < 1) {
      throw new Error('Invalid number of users');
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate pricing based on billing cycle
    const planPricing = {
      standard: { monthly: 149, yearly: 119.20 },
      pro: { monthly: 299, yearly: 239.20 },
      business: { monthly: 699, yearly: 559.20 }
    };
    
    const pricing = planPricing[plan as keyof typeof planPricing] || planPricing.pro;
    const unitAmount = billing === 'yearly' ? Math.round(pricing.yearly * 100) : Math.round(pricing.monthly * 100);
    const interval = billing === 'yearly' ? 'year' : 'month';
    
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `ONEGO ${planName} Plan - ${users} User${users > 1 ? 's' : ''}`,
              description: `Professional learning platform for ${users} user${users > 1 ? 's' : ''}`
            },
            unit_amount: unitAmount,
            recurring: { 
              interval: interval,
              interval_count: 1
            },
          },
          quantity: users,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/upgrade?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: planName,
        users: users.toString(),
        billing: billing
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in create-checkout:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
