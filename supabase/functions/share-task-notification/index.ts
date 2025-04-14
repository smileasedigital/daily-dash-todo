
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

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
    console.log("Starting share-task-notification function");
    const { taskId, taskTitle, recipientEmail, senderName, senderEmail } = await req.json();
    
    if (!taskId || !taskTitle || !recipientEmail || !senderName) {
      console.error("Missing required parameters:", { taskId, taskTitle, recipientEmail, senderName });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
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
        JSON.stringify({ error: "Email service configuration error - API keys not set" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    console.log("Sending notification email to:", recipientEmail, "about task:", taskTitle);
    
    // Send email using Mailgun API
    try {
      const formData = new FormData();
      formData.append('from', `Task App <mailgun@${MAILGUN_DOMAIN}>`);
      formData.append('to', recipientEmail);
      formData.append('subject', `${senderName} wants your help staying accountable`);
      formData.append('html', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Help ${senderName} stay accountable</h2>
          <p>${senderName} has shared a task with you for accountability:</p>
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Task:</strong> ${taskTitle}
          </div>
          <p>They've asked for your support in making sure they complete this task.</p>
          <p>You'll receive updates when they complete it!</p>
          <p>Reply directly to ${senderEmail} if you have any questions.</p>
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
      console.log("Email sent successfully:", data);
      
      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully", data }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
      
    } catch (error) {
      console.error("Error sending email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
  } catch (error) {
    console.error("Error in share-task-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
