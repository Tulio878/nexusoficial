export const config = {
  runtime: "edge",
  regions: ["gru1"],
};

export default async function handler(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const DUTTYFY_URL = process.env.DUTTYFY_PIX_URL_ENCRYPTED;
    if (!DUTTYFY_URL) {
      return new Response(
        JSON.stringify({ error: "DUTTYFY_PIX_URL_ENCRYPTED is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    const response = await fetch(statusUrl, { method: "GET" });
    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Duttyfy status error [${response.status}]` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: data.status,
        ...(data.paidAt ? { paidAt: data.paidAt } : {}),
      }),
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
