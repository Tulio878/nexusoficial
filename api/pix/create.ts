export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  // CORS
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
    const DUTTYFY_URL =
      process.env.DUTTYFY_PIX_URL_ENCRYPTED ||
      "https://www.pagamentos-seguros.app/api-pix/gh95YVcsVRPx_fLllqowP201WFl-x8fXSBybaKG9K9m_fxBwNwuBRLsevdJb68q-_4pe8cz14aPSoNJJVAVNRA";

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
        });

        // Don't retry on 4xx or success
        if (response.ok || (response.status >= 400 && response.status < 500)) break;

        // 5xx — retry if not last attempt
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, delays[attempt - 1]));
        }
      } catch (e) {
        if (attempt >= maxRetries) throw e;
        await new Promise((r) => setTimeout(r, delays[attempt - 1]));
        response = undefined;
      }
    }

    const data = await response!.json();

    if (!response!.ok) {
      return new Response(
        JSON.stringify({ error: `Duttyfy API error: ${JSON.stringify(data)}` }),
        { status: response!.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { pixCode, transactionId, status } = data;

    return new Response(
      JSON.stringify({ pixCode, transactionId, status: status || "PENDING" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
