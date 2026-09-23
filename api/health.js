const { json, methodNotAllowed } = require("./_lib/http");

module.exports = async function health(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed(res, ["GET", "HEAD"]);
  const jevConfigured = Boolean(typeof process.env.JEV_KEY === "string" && process.env.JEV_KEY.trim());
  const kimiConfigured = Boolean(typeof process.env.KIMI_KEY === "string" && process.env.KIMI_KEY.trim());
  return json(res, 200, {
    ok: true,
    version: "1.0.0",
    providers: { reader: jevConfigured ? "configured" : "direct-html", director: kimiConfigured ? "configured" : "deterministic-fallback" },
    render: { available: false, mode: "diagnostic", reason: "No server-side browser and FFmpeg render worker is configured." },
  });
};
