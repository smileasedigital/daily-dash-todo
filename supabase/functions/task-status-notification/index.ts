
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log("Starting task-status-notification function");
    // Check if Mailgun API key is available
    const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY");
    const MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN");
    
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error("Mailgun configuration is not set in environment variables");
      throw new Error("Mailgun configuration is missing. Please add MAILGUN_API_KEY and MAILGUN_DOMAIN in the Supabase Edge Function configuration.");
    }
    
    // This function needs to be triggered by a webhook or database trigger
    // Parse the payload to get task information
    const payload = await req.json();
    const { record } = payload;
    
    console.log("Received task update:", record);
    
    // If the task doesn't have shared_with or it's not completed, skip
    if (!record || !record.shared_with || !record.shared_with.length || !record.completed) {
      return new Response(JSON.stringify({ message: "No notification needed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      throw new Error("Missing Supabase credentials. Please check environment variables.");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get task owner information
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', record.user_id)
      .single();
    
    if (userError) {
      console.error("Failed to fetch user data:", userError);
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }
    
    console.log("Sending completion emails using Mailgun to:", record.shared_with);
    // Send email to each shared contact using Mailgun
    for (const recipientEmail of record.shared_with) {
      try {
        console.log("Sending email to:", recipientEmail);
        
        const formData = new FormData();
        formData.append('from', `Task Accountability <mailgun@${MAILGUN_DOMAIN}>`);
        formData.append('to', recipientEmail);
        formData.append('subject', `${userData.name || userData.email} has completed a task`);
        formData.append('html', `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Task Completed!</h2>
            <p>Good news! ${userData.name || userData.email} has successfully completed a task you were keeping them accountable for:</p>
            <div style="border-left: 4px solid #10b981; padding: 12px 16px; background-color: #f9fafb; margin: 24px 0;">
              <h3 style="margin: 0; color: #064e3b;">${record.title}</h3>
            </div>
            <p>Thank you for helping keep them accountable!</p>
          </div>
        `);
        
        const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Mailgun API error: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log("Email sent successfully to", recipientEmail, ":", result);
        
      } catch (error) {
        console.error("Error sending email to", recipientEmail, ":", error);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage, stack: error.stack }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
