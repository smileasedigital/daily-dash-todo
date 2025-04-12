
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const resend = new Resend(apiKey);
    
    const { taskId, taskTitle, recipientEmail, senderName, senderEmail }: ShareTaskRequest = await req.json();

    // Validate inputs
    if (!taskId || !taskTitle || !recipientEmail || !senderName || !senderEmail) {
      throw new Error("Missing required fields");
    }

    const { data, error } = await resend.emails.send({
      from: "Task Accountability <onboarding@resend.dev>",
      to: recipientEmail,
      subject: `${senderName} has shared a task with you for accountability`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Task Accountability Request</h2>
          <p>${senderName} (${senderEmail}) has asked you to help them stay accountable for a task:</p>
          <div style="border-left: 4px solid #3b82f6; padding: 12px 16px; background-color: #f9fafb; margin: 24px 0;">
            <h3 style="margin: 0; color: #1e3a8a;">${taskTitle}</h3>
          </div>
          <p>You'll receive updates when this task is completed or if it's missed.</p>
          <p>Thank you for helping keep ${senderName} accountable!</p>
        </div>
      `
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return new Response(JSON.stringify({ success: true, messageId: data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
