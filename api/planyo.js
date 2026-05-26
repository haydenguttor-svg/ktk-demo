/* Vercel Serverless Function — Proxy mellom KTK-appen og Planyo API.
   Korrekt Planyo REST-endpoint: https://www.planyo.com/rest/

   Hvis Hash-key er aktivert i Planyo-kontoen, krever hvert kall:
   - hash_timestamp (UTC Unix timestamp)
   - hash_key (MD5 av: secret_hash_key + timestamp + method_name)
*/

import crypto from "crypto";

const PLANYO_URL = "https://www.planyo.com/rest/";

export default async function handler(req, res) {
  // CORS — tillat at appen kaller proxyen fra samme domene
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Hent ut method + params fra GET (query) eller POST (body)
  const isPost = req.method === "POST";
  const body = isPost ? (req.body || {}) : req.query;
  const planyoMethod = body.method;
  let params = body.params || {};

  // Hvis GET med flat query (?method=X&resource_id=Y), bruk hele query som params
  if (!Object.keys(params).length && !isPost) {
    params = {};
    for (const [k, v] of Object.entries(body)) {
      if (k === "method") continue;
      params[k] = v;
    }
  }

  if (!planyoMethod) {
    return res.status(400).json({
      response_code: 1,
      response_message: "Missing 'method' parameter. Example: /api/planyo?method=api_test",
    });
  }

  const apiKey = process.env.PLANYO_API_KEY;
  const siteId = process.env.PLANYO_SITE_ID;
  const hashKey = process.env.PLANYO_HASH_KEY;

  // api_test krever ingen API-nøkkel — alle andre metoder gjør det
  const isApiTest = planyoMethod === "api_test";

  if (!isApiTest && (!apiKey || !siteId)) {
    return res.status(500).json({
      response_code: 1,
      response_message: "Server not configured. Set PLANYO_API_KEY and PLANYO_SITE_ID in Vercel.",
    });
  }

  // Bygg URL
  const url = new URL(PLANYO_URL);
  url.searchParams.set("method", planyoMethod);
  if (apiKey) url.searchParams.set("api_key", apiKey);
  if (siteId) url.searchParams.set("site_id", siteId);

  // Brukerleverte parametre (resource_id, start_time osv.)
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    url.searchParams.set(k, String(v));
  }

  // Hash-key-autentisering: MD5(hashKey + timestamp + method)
  if (hashKey) {
    const timestamp = Math.floor(Date.now() / 1000);
    const md5Input = hashKey + timestamp + planyoMethod;
    const computedHash = crypto.createHash("md5").update(md5Input).digest("hex");
    url.searchParams.set("hash_timestamp", String(timestamp));
    url.searchParams.set("hash_key", computedHash);
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
