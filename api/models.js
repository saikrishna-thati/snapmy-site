const { json, methodNotAllowed } = require("./_lib/http");

module.exports = async function models(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const key = typeof process.env.KIMI_KEY === "string" ? process.env.KIMI_KEY.trim() : "";
  if (!key) return json(res, 200, { ok: false, configured: false, models: [] });
  const out = { ok: true, configured: true, ai: null, cn: null };
  for (const host of ["https://api.moonshot.ai", "https://api.moonshot.cn"]) {
    try {
      const r = await fetch(`${host}/v1/models`, { headers: { Authorization: `Bearer ${key}` } });
      const body = await r.json().catch(() => ({}));
      out[host.includes(".cn") ? "cn" : "ai"] = {
        status: r.status,
        ids: Array.isArray(body?.data) ? body.data.map((m) => m.id).slice(0, 40) : body,
      };
    } catch (cause) {
      out[host.includes(".cn") ? "cn" : "ai"] = { error: cause?.message || "failed" };
    }
  }
  return json(res, 200, out);
};
