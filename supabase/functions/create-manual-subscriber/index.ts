import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { plan = 'Pro', licenses = 25 } = await req.json();

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

    console.log('Creating manual subscriber for user:', user.id, user.email);

    // Create or update subscriber record
    const { data: subscriber, error: subError } = await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: `manual_${user.id}`,
        subscribed: true,
        subscription_tier: plan,
        licenses_purchased: licenses,
        licenses_used: 1,
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (subError) {
      console.error('Error creating subscriber:', subError);
      throw new Error(`Failed to create subscriber: ${subError.message}`);
    }

    // Update profile plan
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        plan: plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    console.log('Successfully created subscriber and updated profile');

    return new Response(JSON.stringify({ 
      success: true, 
      subscriber,
      message: `${plan} subscription activated successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in create-manual-subscriber:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});