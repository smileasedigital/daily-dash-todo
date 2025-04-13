
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@0.16.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      console.error("Missing email address");
      return new Response(
        JSON.stringify({ error: "Email address is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Get API key from environment variable
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Email service configuration error - API key not set" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    console.log("Initializing Resend with API key:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5));
    // Initialize Resend with API key
    const resend = new Resend(apiKey);
    
    console.log("Sending test email to:", email);
    // Send test email
    const { data, error } = await resend.emails.send({
      from: "Task App <onboarding@resend.dev>", // Using Resend's default domain for testing
      to: email,
      subject: "Test Email from Task App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email System Test</h2>
          <p>This is a test email to verify that the email notification system is working correctly.</p>
          <p>If you're receiving this, the Resend integration is working properly!</p>
          <p>Current time: ${new Date().toISOString()}</p>
        </div>
      `,
    });
    
    if (error) {
      console.error("Error sending test email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send test email", details: error }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    console.log("Test email sent successfully:", data);
    return new Response(
      JSON.stringify({ success: true, message: "Test email sent successfully", data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
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
