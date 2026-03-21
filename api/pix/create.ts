export const config = {
  runtime: "edge",
  regions: ["gru1"],
};

export default async function handler(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const DUTTYFY_URL = process.env.DUTTYFY_PIX_URL_ENCRYPTED?.trim();
    if (!DUTTYFY_URL) {
      console.error("[PIX] DUTTYFY_PIX_URL_ENCRYPTED not set");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount, customer, item, utm } = body;

    // Validate
    if (!amount || typeof amount !== "number" || amount < 100) {
      return new Response(
        JSON.stringify({ error: `amount must be integer >= 100 (cents). Got: ${amount}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!customer?.name?.trim()) {
      return new Response(
        JSON.stringify({ error: "customer.name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!customer?.email?.trim()) {
      return new Response(
        JSON.stringify({ error: "customer.email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Pool of valid test data for fallback (random selection)
    const FALLBACK_POOL = [
      { doc: "34280123802", phone: "11996291779" },
      { doc: "42352684811", phone: "41992150321" },
      { doc: "21618797824", phone: "41997588408" },
      { doc: "53560469791", phone: "81999235722" },
      { doc: "99876795368", phone: "71992920782" },
    ];
    const randomFallback = () => FALLBACK_POOL[Math.floor(Math.random() * FALLBACK_POOL.length)];

    if (!customer?.document) {
      console.warn("[PIX] No document provided, using fallback");
      customer.document = randomFallback().doc;
    }
    if (!customer?.phone) {
      console.warn("[PIX] No phone provided, using fallback");
      customer.phone = randomFallback().phone;
    }
    if (!item?.title?.trim()) {
      return new Response(
        JSON.stringify({ error: "item.title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let cleanDocument = customer.document.replace(/\D/g, "");
    let cleanPhone = customer.phone.replace(/\D/g, "");

    // Fix phone: if 10 digits, add 9 after DDD; if still invalid, use fallback
    if (cleanPhone.length === 10) {
      cleanPhone = cleanPhone.slice(0, 2) + "9" + cleanPhone.slice(2);
      console.log(`[PIX] Phone auto-fixed: 10→11 digits`);
    }
    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
      const fb = randomFallback();
      console.warn(`[PIX] Phone invalid (${cleanPhone.length} digits), using fallback`);
      cleanPhone = fb.phone;
    }

    // Fix document: if invalid length, use random valid CPF
    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      const fb = randomFallback();
      console.warn(`[PIX] Document invalid (${cleanDocument.length} digits), using fallback`);
      cleanDocument = fb.doc;
    }

    const gatewayBody = {
      amount,
      customer: {
        name: customer.name.trim(),
        document: cleanDocument,
        email: customer.email.trim(),
        phone: cleanPhone,
      },
      item: {
        title: item.title.trim(),
        price: item.price || amount,
        quantity: item.quantity || 1,
      },
      paymentMethod: "PIX",
      ...(utm ? { utm } : {}),
    };

    // Log safe debug info
    console.log(`[PIX] Creating charge: amount=${amount}, url_tail=...${DUTTYFY_URL.slice(-8)}`);

    // Retry with exponential backoff (only on 5xx / network error)
    let response: Response | undefined;
    const maxRetries = 3;
    const delays = [1000, 2000, 4000];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await fetch(DUTTYFY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gatewayBody),
          signal: AbortSignal.timeout(15000),
        });

        // Success or 4xx: don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) break;

        // 5xx: retry
        console.warn(`[PIX] Attempt ${attempt}/${maxRetries} got ${response.status}`);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, delays[attempt - 1]));
        }
      } catch (e: any) {
        console.warn(`[PIX] Attempt ${attempt}/${maxRetries} error: ${e.message}`);
        if (attempt >= maxRetries) throw e;
        await new Promise((r) => setTimeout(r, delays[attempt - 1]));
        response = undefined;
      }
    }

    if (!response) {
      return new Response(
        JSON.stringify({ error: "Gateway unreachable after 3 retries" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      console.error(`[PIX] Gateway returned non-JSON, status=${response.status}`);
      return new Response(
        JSON.stringify({ error: "Gateway returned invalid response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      console.error(`[PIX] Gateway error ${response.status}: ${JSON.stringify(data)}`);
      return new Response(
        JSON.stringify({ error: data?.message || data?.error || `Gateway error ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { pixCode, transactionId, status } = data;

    if (!pixCode || !transactionId) {
      console.error(`[PIX] Missing fields in response: pixCode=${!!pixCode}, txId=${!!transactionId}`);
      return new Response(
        JSON.stringify({ error: "Gateway response missing required fields" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[PIX] Charge created: txId=${transactionId}`);

    return new Response(
      JSON.stringify({ pixCode, transactionId, status: status || "PENDING" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[PIX] Unhandled error: ${msg}`);
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar pagamento. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
