
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
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
    const { taskId, taskTitle, recipientEmail, senderName, senderEmail } = await req.json();
    
    if (!taskId || !taskTitle || !recipientEmail || !senderName) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Initialize Resend with API key from environment variable
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Task Accountability <noreply@yourdomain.com>", // Update with your domain
      to: recipientEmail,
      subject: `${senderName} wants your help staying accountable`,
      html: `
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
      `,
    });
    
    if (error) {
      console.error("Error sending email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully", data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
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
