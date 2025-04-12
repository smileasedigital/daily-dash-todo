
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ShareTaskRequest {
  taskId: string;
  taskTitle: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, taskTitle, recipientEmail, senderName, senderEmail }: ShareTaskRequest = await req.json();

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Accountability <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `${senderName} would like your help with accountability`,
      html: `
        <h1>Accountability Request</h1>
        <p>${senderName} has shared a task with you for accountability:</p>
        <div style="padding: 15px; border-left: 4px solid #7C3AED; background-color: #F5F3FF; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">${taskTitle}</p>
        </div>
        <p>They're counting on you to help them stay accountable! When they mark this task as complete (or if they miss it), you'll receive a notification.</p>
        <p>Thank you for supporting ${senderName} on their journey to building better habits!</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in share-task-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
