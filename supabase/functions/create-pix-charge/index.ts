import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase env vars not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { amount, customer, item, utm } = body;

    // Validate required fields
    if (!amount || amount < 100) throw new Error("amount must be >= 100 (cents)");
    if (!customer?.name) throw new Error("customer.name is required");
    if (!customer?.email) throw new Error("customer.email is required");
    if (!customer?.document) throw new Error("customer.document is required");
    if (!customer?.phone) throw new Error("customer.phone is required");
    if (!item?.title) throw new Error("item.title is required");

    // Strip non-digits from document and phone
    const cleanDocument = customer.document.replace(/\D/g, "");
    const cleanPhone = customer.phone.replace(/\D/g, "");

    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      throw new Error("document must be 11 (CPF) or 14 (CNPJ) digits");
    }
    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
      throw new Error("phone must be 10 or 11 digits with area code");
    }

    const gatewayBody = {
      amount,
      customer: {
        name: customer.name,
        document: cleanDocument,
        email: customer.email,
        phone: cleanPhone,
      },
      item: {
        title: item.title,
        price: item.price || amount,
        quantity: item.quantity || 1,
      },
      paymentMethod: "PIX",
      ...(utm ? { utm } : {}),
    };

    console.log(`Calling Duttyfy PIX API (url ending: ...${DUTTYFY_URL.slice(-8)})`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    let attempts = 0;
    const maxRetries = 3;
    const delays = [1000, 2000, 4000];

    while (true) {
      attempts++;
      try {
        response = await fetch(DUTTYFY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gatewayBody),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        // Don't retry on 4xx
        if (response.status >= 400 && response.status < 500) break;
        // Don't retry on success
        if (response.ok) break;
        // Retry on 5xx
        if (attempts >= maxRetries) break;

        console.log(`Attempt ${attempts} failed with ${response.status}, retrying...`);
        await new Promise((r) => setTimeout(r, delays[attempts - 1]));
      } catch (e) {
        clearTimeout(timeout);
        if (attempts >= maxRetries) throw e;
        console.log(`Attempt ${attempts} failed with network error, retrying...`);
        await new Promise((r) => setTimeout(r, delays[attempts - 1]));
        response = undefined as any;
      }
    }

    const data = await response!.json();

    if (!response!.ok) {
      console.error(`Duttyfy API error [${response!.status}]:`, JSON.stringify(data));
      throw new Error(`Duttyfy API error [${response!.status}]: ${JSON.stringify(data)}`);
    }

    const { pixCode, transactionId, status } = data;

    // Persist to DB immediately
    const { error: dbError } = await supabase.from("pix_transactions").insert({
      transaction_id: transactionId,
      amount,
      status: status || "PENDING",
      pix_code: pixCode,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_document: cleanDocument,
      customer_phone: cleanPhone,
      item_title: item.title,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Don't fail the request — transaction was created at gateway
    }

    return new Response(
      JSON.stringify({ pixCode, transactionId, status: status || "PENDING" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating PIX charge:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
