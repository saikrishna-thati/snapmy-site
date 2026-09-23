const { error, json, methodNotAllowed, pathParts, readJson } = require("./_lib/http");

const DIAGNOSTIC = {
  code: "render_worker_unavailable",
  error: "Rendering is unavailable: this deployment has no server-side browser and FFmpeg worker.",
  rendered: false,
  supported: false,
  diagnostic: "The current composition is browser HTML with CDN-loaded GSAP/fonts and optional audio. It needs a pinned browser capture and MP4 encoder; this API does not pretend to create a file without those services.",
};

module.exports = async function render(req, res) {
  const parts = pathParts(req);
  if (req.method === "GET" && parts.length > 2) return error(res, 501, DIAGNOSTIC.code, DIAGNOSTIC.error, { id: parts[2], status: "error", diagnostic: DIAGNOSTIC.diagnostic });
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  let body;
  try {
    body = await readJson(req, 8 * 1024 * 1024);
  } catch (cause) {
    return error(res, 400, cause.code || "invalid_body", cause.message);
  }
  if (typeof body.html !== "string" || !body.html.includes('data-composition-id="cue"')) return error(res, 400, "invalid_composition", "Render expects the static Snapmy composition HTML with data-composition-id=cue.");
  return json(res, 501, { ok: false, ...DIAGNOSTIC, requested: { fps: body.fps || 30, quality: body.quality || "standard" } });
};
