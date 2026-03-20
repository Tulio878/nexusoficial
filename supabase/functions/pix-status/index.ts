import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DUTTYFY_URL = Deno.env.get("DUTTYFY_PIX_URL_ENCRYPTED");
    if (!DUTTYFY_URL) {
      throw new Error("DUTTYFY_PIX_URL_ENCRYPTED is not configured");
    }

    const url = new URL(req.url);
    const transactionId = url.searchParams.get("transactionId");

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: "transactionId query param is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusUrl = `${DUTTYFY_URL}?transactionId=${encodeURIComponent(transactionId)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(statusUrl, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      console.error(`Duttyfy status error [${response.status}]:`, JSON.stringify(data));
      throw new Error(`Duttyfy status error [${response.status}]`);
    }

    // If COMPLETED, update DB
    if (data.status === "COMPLETED") {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        await supabase
          .from("pix_transactions")
          .update({
            status: "COMPLETED",
            paid_at: data.paidAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("transaction_id", transactionId)
          .eq("status", "PENDING"); // conditional update — don't overwrite if already completed
      }
    }

    return new Response(
      JSON.stringify({ status: data.status, ...(data.paidAt ? { paidAt: data.paidAt } : {}) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error checking PIX status:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
