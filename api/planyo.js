/* Vercel Serverless Function — Proxy mellom KTK-appen og Planyo API.
   Filen ligger i /api/planyo.js og blir automatisk en endpoint på:
   https://ktk-demo.vercel.app/api/planyo

   API-nøkkelen leses fra Vercels miljøvariabler (ALDRI hardkodet).
   Frontend kaller denne i stedet for Planyo direkte, så nøkkelen aldri eksponeres. */

export default async function handler(req, res) {
  // CORS: tillat appen å kalle proxyen
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Plukk ut Planyo-metode og parametre — kan komme via GET (?method=) eller POST (body)
  const isPost = req.method === "POST";
  const body = isPost ? (req.body || {}) : req.query;
  const planyoMethod = body.method;
  const params = body.params || {};

  if (!planyoMethod) {
    return res.status(400).json({
      response_code: 1,
      response_message: "Missing 'method' parameter. Example: /api/planyo?method=list_resources",
    });
  }

  // Les hemmeligheter fra miljøvariabler
  const apiKey = process.env.PLANYO_API_KEY;
  const siteId = process.env.PLANYO_SITE_ID;
  const hashKey = process.env.PLANYO_HASH_KEY;

  if (!apiKey || !siteId) {
    return res.status(500).json({
      response_code: 1,
      response_message: "Server not configured. Set PLANYO_API_KEY and PLANYO_SITE_ID in Vercel environment variables.",
    });
  }

  // Bygg URL-en til Planyo
  const planyoBase = process.env.PLANYO_API_URL || "https://api.planyo.com/rest/";
  const url = new URL(planyoBase);
  url.searchParams.set("method", planyoMethod);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("site_id", siteId);
  if (hashKey) url.searchParams.set("hash_key", hashKey);

  // Bruker-leverte parametre (f.eks. resource_id, start_time, end_time)
  if (params && typeof params === "object") {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  // Eller — hvis params kom rett som query-string (ikke nestet under "params")
  if (!Object.keys(params).length && !isPost) {
    for (const [k, v] of Object.entries(body)) {
      if (k === "method") continue;
      url.searchParams.set(k, String(v));
    }
  }

  // Kall Planyo
  try {
    const r = await fetch(url.toString());
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch { data = { raw: text, parseError: true }; }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      response_code: 1,
      response_message: "Planyo request failed",
      error: err.message,
    });
  }
}
