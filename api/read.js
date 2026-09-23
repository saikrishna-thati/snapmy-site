const { error, json, methodNotAllowed, readJson } = require("./_lib/http");
const { readWebsite } = require("./_lib/site");

module.exports = async function read(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  let body;
  try {
    body = await readJson(req, 512 * 1024);
  } catch (cause) {
    return error(res, 400, cause.code || "invalid_body", cause.message);
  }
  if (!body.url || typeof body.url !== "string") return error(res, 400, "missing_url", "A website URL is required.");
  try {
    const brief = await readWebsite(body.url, { maxPages: body.maxPages });
    return json(res, 200, { ok: true, source: "server-reader", brief });
  } catch (cause) {
    const status = cause.code === "invalid_url" || cause.code === "blocked_url" ? 400 : 502;
    return error(res, status, cause.code || "read_failed", cause.message || "The website could not be read.");
  }
};
