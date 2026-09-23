const { error, json, methodNotAllowed, readJson } = require("./_lib/http");
const { directWebsite } = require("./_lib/director");

module.exports = async function direct(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  let body;
  try {
    body = await readJson(req, 512 * 1024);
  } catch (cause) {
    return error(res, 400, cause.code || "invalid_body", cause.message);
  }
  if (!body.brief || typeof body.brief !== "object" || Array.isArray(body.brief)) return error(res, 400, "missing_brief", "A structured website brief is required.");
  try {
    const result = await directWebsite(body.brief);
    return json(res, 200, { ok: true, ...result });
  } catch {
    return error(res, 500, "direct_failed", "The creative director could not produce a direction.");
  }
};
