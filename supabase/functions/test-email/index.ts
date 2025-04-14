
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    console.log("Starting test-email function");
    const { email } = await req.json();

    if (!email) {
      console.error("Missing email parameter");
      return new Response(
        JSON.stringify({ error: "Missing email parameter" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Initialize Mailgun with API key from environment variable
    const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY");
    const MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN");
    
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error("Mailgun configuration is missing in environment variables");
      return new Response(
        JSON.stringify({ error: "Email service configuration error - Mailgun API keys not set" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    console.log("Sending test email to:", email);
    
    // Send test email using Mailgun API
    try {
      const formData = new FormData();
      formData.append('from', `Task App <mailgun@${MAILGUN_DOMAIN}>`);
      formData.append('to', email);
      formData.append('subject', 'Test Email from Task App');
      formData.append('html', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Configuration Test</h2>
          <p>This is a test email to confirm that your Mailgun email service is correctly configured.</p>
          <p>If you're seeing this email, it means everything is working properly!</p>
          <p>Now you can use email features like task sharing and completion notifications in the Task App.</p>
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
      
      const data = await response.json();
      console.log("Test email sent successfully:", data);
      
      return new Response(
        JSON.stringify({ success: true, message: "Test email sent successfully" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (error) {
      console.error("Error sending test email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send test email", details: error.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Error in test-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
