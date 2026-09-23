const DEFAULT_BODY_LIMIT = 6 * 1024 * 1024;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (res.req?.method === "HEAD") return res.end();
  return res.end(JSON.stringify(payload));
}

function error(res, status, code, message, extra = {}) {
  return json(res, status, { ok: false, error: message, code, ...extra });
}

function methodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  return error(res, 405, "method_not_allowed", `Use ${allowed.join(" or ")}.`);
}

async function readJson(req, limit = DEFAULT_BODY_LIMIT) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return parseBody(req.body);

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > limit) {
      const err = new Error("Request body is too large.");
      err.code = "body_too_large";
      throw err;
    }
    chunks.push(chunk);
  }
  return parseBody(Buffer.concat(chunks).toString("utf8"));
}

function parseBody(value) {
  if (!value) return {};
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    const err = new Error("Request body must be valid JSON.");
    err.code = "invalid_json";
    throw err;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    const err = new Error("Request body must be a JSON object.");
    err.code = "invalid_body";
    throw err;
  }
  return parsed;
}

function pathParts(req) {
  return new URL(req.url || "/", "http://vercel.local").pathname.split("/").filter(Boolean);
}

module.exports = { error, json, methodNotAllowed, pathParts, readJson };
