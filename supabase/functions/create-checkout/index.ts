
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
    const { plan, billing, price, users } = await req.json();

    if (!plan || !billing || !price || !users) {
      throw new Error('Missing required parameters: plan, billing, price, users');
    }

    console.log('Checkout request:', { plan, billing, price, users });

    // Validate Stripe configuration
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Define plan details
    const planDetails = {
      'standard': {
        name: 'ONEGO Standard Plan',
        description: 'Great for small businesses',
        credits: '500 Credits per month + $0.20/extra credit',
        features: ['Up to 25 users', '20 Courses Max', 'Advanced Analytics', 'Priority Support']
      },
      'pro': {
        name: 'ONEGO Pro Plan',
        description: 'Perfect for growing companies',
        credits: '1,500 Credits per month + $0.20/extra credit',
        features: ['Up to 50 users', '40 Courses Max', 'Performance Tracking', '5 Admin Accounts']
      },
      'business': {
        name: 'ONEGO Business Plan',
        description: 'Ideal for larger organizations',
        credits: '4,000 Credits per month + $0.20/extra credit',
        features: ['Up to 250 users', 'Unlimited Courses', 'Enterprise Security', 'Dedicated Support']
      }
    };

    const selectedPlan = planDetails[plan as keyof typeof planDetails];
    if (!selectedPlan) {
      throw new Error('Invalid plan specified');
    }

    console.log('Selected plan:', selectedPlan);

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

    console.log('User authenticated:', user.email);

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('Existing customer found:', customerId);
    } else {
      console.log('New customer will be created');
    }

    // Calculate pricing based on billing cycle
    const unitAmount = Math.round(price * 100); // Convert to cents
    const interval = billing === 'yearly' ? 'year' : 'month';

    console.log('Creating checkout session with:', {
      unitAmount,
      interval,
      customerId,
      userEmail: user.email
    });

    const session = await stripe.checkout.sessions.create({
    // Create product description with features
    const productDescription = `${selectedPlan.description} - ${selectedPlan.credits}`;

      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: selectedPlan.name,
              description: productDescription,
              metadata: {
                plan: plan,
                features: selectedPlan.features.join(', ')
              }
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
        plan: plan,
        billing: billing,
        users: users.toString()
      }
    });

    console.log('Checkout session created successfully:', session.id);

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
