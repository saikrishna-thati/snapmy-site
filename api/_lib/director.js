const STYLES = new Set(["kinetic", "editorial", "neon", "pop", "mono"]);
const SCENES = new Set(["coldopen", "hook", "statement", "flashword", "screen", "scroll", "feature", "featureStack", "stat", "quote", "logos", "marquee", "split", "cta", "endcard", "flyin", "depthReveal", "matchcut", "track"]);
const TRANSITIONS = new Set(["whip", "zoom", "flash", "wipe", "iris", "push", "glitch", "blocks", "cut"]);
const INTERACTIONS = new Set(["hover", "click", "scroll", "tab", "toggle", "modal", "none"]);
const CAMERAS = new Set(["push", "track", "orbit", "match", "reveal", "static"]);
const PRODUCT_BEATS = new Set(["screen", "scroll", "split", "flyin", "depthReveal", "matchcut", "track"]);
const STRUCTURE_BANK = [
  ["screen", "statement", "scroll", "feature", "stat", "split", "cta", "endcard"],
  ["screen", "hook", "scroll", "feature", "quote", "split", "cta", "endcard"],
  ["screen", "flashword", "feature", "scroll", "stat", "quote", "cta", "endcard"],
  ["screen", "feature", "scroll", "quote", "split", "logos", "cta", "endcard"],
  ["screen", "hook", "feature", "scroll", "matchcut", "quote", "cta", "endcard"],
  ["screen", "statement", "feature", "scroll", "stat", "logos", "cta", "endcard"],
  ["screen", "flashword", "split", "feature", "track", "quote", "cta", "endcard"],
  ["screen", "feature", "matchcut", "statement", "scroll", "quote", "cta", "endcard"],
  ["flashword", "hook", "screen", "feature", "stat", "scroll", "cta", "endcard"],
  ["flashword", "statement", "flyin", "feature", "quote", "split", "cta", "endcard"],
  ["flashword", "feature", "depthReveal", "statement", "quote", "track", "logos", "endcard"],
  ["hook", "screen", "feature", "scroll", "stat", "quote", "cta", "endcard"],
  ["hook", "statement", "split", "screen", "featureStack", "logos", "cta", "endcard"],
  ["hook", "feature", "track", "scroll", "quote", "flyin", "cta", "endcard"],
  ["flyin", "statement", "screen", "feature", "featureStack", "logos", "cta", "endcard"],
  ["flyin", "hook", "depthReveal", "feature", "quote", "track", "cta", "endcard"],
  ["flyin", "feature", "scroll", "split", "stat", "quote", "logos", "endcard"],
  ["screen", "flashword", "split", "depthReveal", "quote", "track", "cta", "endcard"],
  ["screen", "statement", "split", "feature", "stat", "quote", "cta", "endcard"],
  ["screen", "feature", "flyin", "statement", "featureStack", "logos", "cta", "endcard"],
  ["matchcut", "statement", "feature", "screen", "quote", "track", "cta", "endcard"],
  ["matchcut", "hook", "scroll", "feature", "stat", "split", "logos", "endcard"],
  ["depthReveal", "hook", "screen", "feature", "quote", "featureStack", "cta", "endcard"],
  ["depthReveal", "feature", "scroll", "statement", "stat", "matchcut", "logos", "endcard"],
  ["track", "statement", "feature", "depthReveal", "quote", "screen", "cta", "endcard"],
  ["track", "flashword", "split", "feature", "stat", "flyin", "logos", "endcard"],
  ["track", "feature", "matchcut", "scroll", "quote", "featureStack", "cta", "endcard"],
  ["screen", "feature", "stat", "hook", "scroll", "split", "cta", "endcard"],
  ["screen", "feature", "quote", "hook", "scroll", "stat", "cta", "endcard"],
  ["flyin", "feature", "matchcut", "hook", "depthReveal", "quote", "cta", "endcard"],
  ["screen", "feature", "split", "hook", "track", "stat", "logos", "endcard"],
];

function hash(value) {
  let result = 2166136261;
  for (const char of String(value || "")) { result ^= char.charCodeAt(0); result = Math.imul(result, 16777619); }
  return result >>> 0;
}

function clean(value, length) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length - 1).trim()}…` : text;
}

function briefForDirector(brief) {
  return {
    name: clean(brief.name, 60), domain: clean(brief.domain, 120), headline: clean(brief.headline, 160), description: clean(brief.description, 360), category: clean(brief.category, 80),
    cta: clean(brief.cta, 90),
    ctaCandidates: Array.isArray(brief.ctaCandidates) ? brief.ctaCandidates.slice(0, 8).map((value) => clean(value, 90)) : [],
    features: Array.isArray(brief.featureCatalog) && brief.featureCatalog.length
      ? brief.featureCatalog.slice(0, 16).map((feature) => ({ title: clean(feature.title, 80), desc: clean(feature.desc, 160), weight: Number(feature.weight) || 0 }))
      : Array.isArray(brief.features) ? brief.features.slice(0, 16).map((feature) => ({ title: clean(typeof feature === "string" ? feature : feature.title, 80), desc: clean(feature?.desc, 160) })) : [],
    stats: Array.isArray(brief.stats) ? brief.stats.slice(0, 8).map((stat) => ({ value: clean(stat.value, 20), label: clean(stat.label, 80) })) : [],
    quotes: Array.isArray(brief.quotes) ? brief.quotes.slice(0, 2).map((quote) => ({ text: clean(quote.text, 160), author: clean(quote.author, 60) })) : [],
    logos: Array.isArray(brief.logos) ? brief.logos.slice(0, 6).map((logo) => clean(logo, 40)) : [],
    screenshots: Array.isArray(brief.screenshots) ? brief.screenshots.slice(0, 24) : [],
    fullpages: Array.isArray(brief.fullpages) ? brief.fullpages.slice(0, 8) : [],
    pages: Array.isArray(brief.pages) ? brief.pages.slice(0, 8).map((page) => ({ url: clean(page.url, 240), role: clean(page.role, 32), title: clean(page.title, 120), description: clean(page.description, 240) })) : [],
    evidenceAssets: Array.isArray(brief.evidenceAssets) ? brief.evidenceAssets.slice(0, 32).map((asset) => ({ id: clean(asset.id, 80), url: clean(asset.url, 300), page: clean(asset.page, 240), pageRole: clean(asset.pageRole, 32), role: clean(asset.role, 32), kind: clean(asset.kind, 24), fullPage: Boolean(asset.fullPage), viewport: clean(asset.viewport, 20), state: clean(asset.state, 32), priority: Number(asset.priority) || 0 })) : [],
    interactionTrace: Array.isArray(brief.interactionTrace) ? brief.interactionTrace.slice(0, 6) : [],
    hookCandidates: Array.isArray(brief.hookCandidates) ? brief.hookCandidates.slice(0, 8).map((value) => clean(value, 100)) : [],
    suggested_structure: Array.isArray(brief.suggested_structure) ? brief.suggested_structure.slice(0, 14) : [],
  };
}

function reorderScenes(scenes, structure) {
  const pool = scenes.slice();
  const ordered = [];
  for (const type of structure) {
    const index = pool.findIndex((scene) => scene.type === type);
    if (index >= 0) ordered.push(pool.splice(index, 1)[0]);
  }
  return ordered;
}

function contentForward(scene) {
  return scene.type !== "coldopen";
}

function structureVariant(seed, style) {
  const styleSeed = hash(String(style || ""));
  return STRUCTURE_BANK[(hash(seed) + styleSeed) % STRUCTURE_BANK.length].slice();
}

function sanitizeStructure(list, fallback) {
  const valid = (Array.isArray(list) ? list : []).filter((type) => SCENES.has(type));
  const filtered = valid.filter((type, index) => type !== valid[index - 1]);
  return filtered.length >= 6 ? filtered.slice(0, 14) : fallback.slice();
}

function chooseStyle(brief, seed) {
  const text = `${brief.name} ${brief.category} ${brief.headline} ${brief.description} ${brief.features.map((feature) => feature.title).join(" ")}`.toLowerCase();
  if (/finance|bank|wealth|legal|insurance|health|wellness|editorial|journal/.test(text)) return "editorial";
  if (/api|developer|terminal|cli|security|crypto|web3|gaming|code/.test(text)) return "neon";
  if (/food|kids|social|creator|shop|store|fun|play|fashion/.test(text)) return "pop";
  if (/design|enterprise|hardware|minimal|studio|infrastructure/.test(text)) return "mono";
  return seed % 5 === 0 ? "mono" : "kinetic";
}

function motionVariation(brief, style) {
  const value = (hash(`${brief.domain}:${style}`) % 100) + 1;
  return `mv${String(value).padStart(3, "0")}`;
}

const CAMERA_BANK = ["push", "track", "orbit", "match", "reveal", "static"];
const PRODUCT_SCENE_TYPES = ["screen", "scroll", "split", "flyin", "depthReveal", "matchcut", "track"];

function structurePrefix(list) {
  return (Array.isArray(list) ? list : []).slice(0, 3).join(">");
}

let lastStructurePrefix = "";

function bankStructure(brief) {
  const seed = hash(String(brief.domain) + "|" + String(brief.name) + "|" + String(brief.headline || ""));
  const mixed = (hash(brief.domain) ^ Math.imul(hash(brief.name), 31) ^ Math.imul(hash(brief.headline || ""), 131)) >>> 0;
  let index = mixed % STRUCTURE_BANK.length;
  if (STRUCTURE_BANK.length > 1) {
    let step = 0;
    while (step < STRUCTURE_BANK.length && structurePrefix(STRUCTURE_BANK[index]) === lastStructurePrefix) {
      index = (index + 1) % STRUCTURE_BANK.length;
      step++;
    }
  }
  const structure = STRUCTURE_BANK[index].slice();
  lastStructurePrefix = structurePrefix(structure);
  return { seed, structure };
}

function resolveStructure(brief, decisions) {
  const picked = bankStructure(brief);
  const valid = (Array.isArray(decisions?.suggestedStructure) ? decisions.suggestedStructure : []).filter((type) => SCENES.has(type));
  return { seed: picked.seed, structure: valid.length >= 6 ? valid.slice(0, 14) : picked.structure };
}

function fallbackPlan(brief, decisions) {
  const resolved = resolveStructure(brief, decisions);
  const seed = resolved.seed;
  const resolvedStructure = resolved.structure;
  const visualCount = Math.max(1, Array.isArray(brief.screenshots) ? brief.screenshots.length : Number(brief.screenshots) || 0);
  const featurePool = brief.features.length ? brief.features : [{ title: "A clearer way to move", desc: "Built around the moments that matter." }];
  const featureAt = (index) => featurePool[Math.abs(index) % featurePool.length];
  const statementText = clean(brief.headline || brief.description || brief.name, 100);
  const hero = seed % 12 === 0;
  const camera = CAMERA_BANK[seed % CAMERA_BANK.length];
  const holds = resolvedStructure.filter((type) => PRODUCT_BEATS.has(type)).filter((type, index, list) => list.indexOf(type) === index).slice(0, 2);
  const usedFeatures = new Set();
  const nextFeature = () => {
    const index = usedFeatures.size % featurePool.length;
    const item = featureAt(index);
    usedFeatures.add(index);
    return item;
  };
  const makeScene = (index, type) => {
    const shot = Math.abs(index) % visualCount;
    const hookSource = brief.hookCandidates[0] || brief.headline || brief.name;
    switch (type) {
      case "coldopen":
      case "flashword":
        return { type, word: clean(brief.name, 28) };
      case "hook":
        return { type, words: clean(hookSource, 64).split(/\s+/).filter(Boolean).slice(0, 4) };
      case "statement":
        return { type, text: statementText || brief.name, kicker: brief.category || "Product" };
      case "screen":
      case "scroll":
      case "flyin":
      case "depthReveal":
      case "track":
        return { type, shot, caption: clean(brief.headline || brief.name, 34) };
      case "split":
        return { type, shot, text: statementText || brief.name, interaction: "none" };
      case "matchcut":
        return { type, from: shot, to: (shot + 1) % visualCount, text: statementText || brief.name };
      case "feature": {
        const picked = nextFeature();
        return { type, title: clean(picked.title || picked.desc || brief.name, 50), sub: clean(picked.desc, 90) };
      }
      case "featureStack": {
        const items = [];
        for (let step = 0; step < 3; step++) items.push(nextFeature());
        return { type, items: items.map((item) => clean(item.title || item.desc, 30)).filter(Boolean).slice(0, 3) };
      }
      case "stat":
        return { type, value: clean(brief.stats[0]?.value, 20), label: clean(brief.stats[0]?.label || "A reason to believe", 60) };
      case "quote":
        return { type, text: clean(brief.quotes[0]?.text, 140), author: clean(brief.quotes[0]?.author, 50) };
      case "logos":
        return { type, names: brief.logos.slice(0, 6), kicker: "Trusted by teams" };
      case "cta":
        return { type, text: clean(brief.headline || "See what it changes", 100), button: clean(brief.cta || brief.ctaCandidates?.[0] || "Explore the product", 24) };
      case "endcard":
        return { type, text: clean(brief.description || brief.headline || brief.domain, 100) };
      default:
        return { type: "statement", text: statementText || brief.name };
    }
  };
  const available = (type) => {
    if (type === "stat") return Boolean(brief.stats[0]?.value);
    if (type === "quote") return brief.quotes.some((quote) => quote.text && quote.text.length > 10);
    if (type === "logos") return brief.logos.length >= 3;
    if (type === "hook") return Boolean((brief.hookCandidates[0] || brief.headline || brief.name || "").trim());
    return true;
  };
  const substitute = (type) => {
    const candidates = [];
    if (brief.stats[0]?.value) candidates.push("stat");
    if (brief.quotes.some((quote) => quote.text && quote.text.length > 10)) candidates.push("quote");
    if (brief.logos.length >= 3) candidates.push("logos");
    if (!candidates.includes(type)) candidates.push(type);
    return candidates.find((candidate) => available(candidate)) || "feature";
  };
  const scenes = [];
  const types = [];
  let statUsed = false;
  resolvedStructure.forEach((type, index) => {
    if (type === "marquee") return;
    if (type === "stat" && statUsed) return;
    const finalType = available(type) ? type : substitute(type);
    if (finalType === "marquee") return;
    if (finalType === "stat" && statUsed) return;
    if (finalType === "stat") statUsed = true;
    scenes.push(makeScene(index, finalType));
    types.push(finalType);
  });
  if (!scenes.length) {
    scenes.push(makeScene(0, "statement"));
    types.push("statement");
  }
  const structure = types;
  const direction = {
    concept: clean(brief.headline || brief.description || brief.name, 160),
    structure,
    camera,
    opening: structure[0],
    hero,
    beat: hero ? 28 + (seed % 7) : 16 + (seed % 9),
    holds,
  };
  return {
    title: clean(brief.name || brief.domain, 60),
    tagline: clean(brief.headline || brief.description || brief.name, 80),
    style: decisions.style,
    motion_variation: decisions.motionVariation,
    direction,
    structure,
    panel: [
      { role: "Creative director", note: "The story opens on the product itself, then moves into visible proof and a clear next action." },
      { role: "Motion designer", note: `Use ${brief.screenshots.length > 1 ? "distinct page states" : "the strongest available page state"} as evidence; keep transitions subordinate to the product.` },
      { role: "Brand designer", note: `Let the ${decisions.style} treatment support the site's own hierarchy instead of adding decorative effects.` },
      { role: "Music editor", note: "Build toward the first product reveal, leave space for the proof beat, and resolve cleanly on the end card." },
    ],
    scenes,
    shot_direction: scenes.map((scene, index) => ({ shot: index + 1, type: scene.type, purpose: purposeFor(scene), visual: visualFor(scene), sound: soundFor(scene) })),
  };
}

function purposeFor(scene) {
  return ({ coldopen: "Name the world", hook: "Create curiosity", statement: "State the promise", screen: "Reveal the product", scroll: "Show breadth", feature: "Explain a capability", stat: "Add proof", quote: "Add human proof", featureStack: "Compress the value", logos: "Establish trust", split: "Connect promise to evidence", marquee: "Create a brand breath", cta: "Invite action", endcard: "Leave a memorable lockup", flyin: "Fly into the product", depthReveal: "Expose the product behind the type", matchcut: "Carry motion across the cut", track: "Truck across the product" }[scene.type] || "Support the story");
}

function visualFor(scene) {
  if (PRODUCT_BEATS.has(scene.type)) return "Use the selected website evidence with a deliberate crop; do not invent UI behavior.";
  if (scene.type === "stat" || scene.type === "quote") return "Protect a readable hold and keep the proof as the only focal point.";
  return "Use restrained typography and movement that follows the information hierarchy.";
}

function soundFor(scene) {
  if (scene.type === "screen") return "Product reveal hit with a short lift.";
  if (["stat", "quote", "logos"].includes(scene.type)) return "Reduce density and let the proof land.";
  if (scene.type === "cta" || scene.type === "endcard") return "Resolve with a confident, uncluttered landing.";
  return "Support the beat without masking the message.";
}

const SYSTEM = [
  "You are Snapmy.site's senior creative director. Return only JSON, no prose.",
  "Use only facts present in the brief. Never invent pricing, customers, or features.",
  "Produce 12-20 scenes as {\"scenes\":[...]}. Allowed scene types: coldopen, hook, statement, flashword, screen, scroll, feature, featureStack, stat, quote, logos, marquee, split, cta, endcard, flyin, depthReveal, matchcut, track.",
  "Also return a \"direction\" record: {\"concept\": one sentence creative idea, \"structure\": ordered array of scene types, \"camera\": push|track|orbit|match|reveal|static, \"opening\": flashword|hook|screen|flyin|depthReveal|matchcut|track, \"hero\": boolean, \"beat\": target runtime in seconds, \"holds\": [one or two scene types]}. \"structure\" is the film's unique skeleton and must match the order of the scenes you return.",
  "CONTENT RULES: never use the marquee scene type; never run a mandatory 01/02/03 numbered feature sequence; use at most one stat scene and only when the number is genuinely strong; never recap the opening headline in a later scene; the \"opening\" must be the FIRST entry of \"structure\" and must put real content on screen immediately with no empty field; the film must contain at least one product-subject beat among screen, scroll, split, flyin, depthReveal, matchcut, track.",
  "The user message gives \"suggested_structure\", a curated ordered skeleton. Your returned \"structure\" must stay within one edit of it (reorder, add, remove or replace at most one entry) and remain unique to this film.",
  "The brief's \"features\" catalog may contain more entries than you need. Read all of them, then pick only the strongest 3-5 for the video: prefer specific, differentiated capabilities over generic marketing phrases. Cover the product's most important capabilities and drop the rest. Never invent features that are not in the catalog.",
  "Use feature scenes for the ones you pick, and use featureStack to compress related capabilities into one beat.",
  "INCLUDE AT LEAST 3 scenes of type screen, scroll, or split so the real website screenshots are used as evidence. Set their \"shot\" to the index of the most relevant screenshot (0-based, within the count given in the brief).",
  "SCENE FIELD RULES (a scene must use exactly the fields for its type):",
  "coldopen/flashword -> {\"type\",\"word\"}",
  "hook -> {\"type\",\"words\":[4 short strings]}",
  "statement/marquee/split/cta/endcard -> {\"type\",\"text\"}",
  "screen -> {\"type\",\"shot\":<int index of a screenshot>,\"caption\"}",
  "scroll -> {\"type\",\"shot\":<int index of a screenshot>}",
  "feature -> {\"type\",\"title\",\"sub\"}",
  "featureStack -> {\"type\",\"items\":[3 short strings]}",
  "stat -> {\"type\",\"value\",\"label\"} copied from the brief stats",
  "quote -> {\"type\",\"text\",\"author\"} copied from the brief quotes",
  "logos -> {\"type\",\"names\":[3-6 strings]} copied from the brief logos",
  "flyin -> {\"type\",\"shot\":<int index of a screenshot>,\"caption\"}",
  "depthReveal -> {\"type\",\"shot\":<int index of a screenshot>,\"text\"}",
  "matchcut -> {\"type\",\"from\":<int index of a screenshot>,\"to\":<int index of a screenshot>,\"text\"}",
  "track -> {\"type\",\"shot\":<int index of a screenshot>,\"caption\"}",
  "Also return \"style\" from kinetic/editorial/neon/pop/mono, \"panel\" as an array of 4 {role,note}, and \"shot_direction\" with one {purpose,visual,sound} entry per scene.",
].join(" ");

function envKey(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function groqKeys() {
  const primary = envKey("GROQ_KEYS") || envKey("GROQ_KEY") || envKey("DIRECTOR_KEY");
  const single = [envKey("GROQ_KEY_1"), envKey("GROQ_KEY_2"), envKey("GROQ_KEY_3"), envKey("GROQ_KEY_4"), envKey("GROQ_KEY_5"), envKey("GROQ_KEY_6")];
  const all = [...primary.split(/[\s,]+/), ...single].map((key) => key.trim()).filter(Boolean);
  return [...new Set(all)];
}

function parsePlanContent(content, brief, decisions) {
  if (!content) return { plan: null, error: "empty_response" };
  let parsed;
  try {
    parsed = JSON.parse(String(content).replace(/^```json\s*|\s*```$/g, ""));
  } catch {
    return { plan: null, error: "invalid_json" };
  }
  const plan = cleanPlan(parsed, brief, decisions);
  return plan ? { plan, error: null } : { plan: null, error: "invalid_plan" };
}

async function requestGroq({ key, model, brief, decisions }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  const user = JSON.stringify({ brief, initial_decisions: decisions, allowed_scene_types: [...SCENES], suggested_structure: decisions.suggestedStructure || [] });
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, temperature: 0.6, max_completion_tokens: 3500, response_format: { type: "json_object" }, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }] }),
    });
    if (!response.ok) return { plan: null, error: `http_${response.status}`, retryable: response.status === 429 || response.status === 401 || response.status === 403 || response.status >= 500 };
    const payload = await response.json();
    const result = parsePlanContent(payload?.choices?.[0]?.message?.content, brief, decisions);
    return { ...result, retryable: result.error === "invalid_json" || result.error === "invalid_plan" };
  } catch (cause) {
    return { plan: null, error: cause?.name === "AbortError" ? "timeout" : "request_failed", retryable: true };
  } finally {
    clearTimeout(timer);
  }
}

async function groqPlan(brief, decisions) {
  const keys = groqKeys();
  if (!keys.length) return { provider: "groq", plan: null, error: "not_configured" };
  const models = (envKey("GROQ_MODEL") || "openai/gpt-oss-120b").split(",").map((value) => value.trim()).filter(Boolean);
  const offset = hash(`${brief.domain}|${brief.name}`) % keys.length;
  let lastError = "unknown";
  for (let step = 0; step < keys.length; step++) {
    const key = keys[(offset + step) % keys.length];
    const result = await requestGroq({ key, model: models[0], brief, decisions });
    if (result.plan) return { provider: "groq", model: models[0], keyIndex: (offset + step) % keys.length, plan: result.plan, error: null };
    lastError = result.error;
    if (!result.retryable) return { provider: "groq", plan: null, error: lastError };
  }
  return { provider: "groq", plan: null, error: lastError };
}

function cleanPlan(raw, brief, decisions) {
  if (!raw || !Array.isArray(raw.scenes)) return null;
  const scenes = raw.scenes.filter((scene) => scene && SCENES.has(scene.type)).map((scene) => {
    const output = { type: scene.type };
    if (TRANSITIONS.has(scene.transition)) output.transition = scene.transition;
    if (INTERACTIONS.has(scene.interaction)) output.interaction = scene.interaction;
    if (scene.type === "coldopen" || scene.type === "flashword") output.word = clean(scene.word || brief.name, 28);
    if (scene.type === "hook") output.words = (Array.isArray(scene.words) ? scene.words : String(scene.words || "").split(/\s+/)).map((word) => clean(word, 24)).filter(Boolean).slice(0, 4);
    if (["statement", "marquee", "split", "cta", "endcard"].includes(scene.type)) { output.text = clean(scene.text || brief.headline, 100); if (scene.kicker) output.kicker = clean(scene.kicker, 30); if (scene.button) output.button = clean(scene.button, 24); if (scene.accent) output.accent = clean(scene.accent, 24); }
     if (["screen", "scroll", "split", "flyin", "depthReveal", "track"].includes(scene.type)) {
       const screenshotCount = Array.isArray(brief.screenshots) ? brief.screenshots.length : Number(brief.screenshots) || 0;
       output.shot = Math.abs(Number.parseInt(scene.shot, 10) || 0) % Math.max(1, screenshotCount);
       if (scene.asset_id || scene.assetId) output.asset_id = clean(scene.asset_id || scene.assetId, 80);
       if (scene.visual_reason || scene.visualReason) output.visual_reason = clean(scene.visual_reason || scene.visualReason, 140);
     }
     if (scene.type === "matchcut") {
       const screenshotCount = Array.isArray(brief.screenshots) ? brief.screenshots.length : Number(brief.screenshots) || 0;
       output.from = Math.abs(Number.parseInt(scene.from, 10) || 0) % Math.max(1, screenshotCount);
       output.to = Math.abs(Number.parseInt(scene.to, 10) || 0) % Math.max(1, screenshotCount);
     }
    if (scene.type === "screen" && scene.caption) output.caption = clean(scene.caption, 40);
    if (scene.type === "flyin" || scene.type === "track") { if (scene.caption) output.caption = clean(scene.caption, 40); if (scene.asset_id || scene.assetId) output.asset_id = clean(scene.asset_id || scene.assetId, 80); }
    if (scene.type === "depthReveal") { output.text = clean(scene.text || brief.headline, 100); if (scene.asset_id || scene.assetId) output.asset_id = clean(scene.asset_id || scene.assetId, 80); }
    if (scene.type === "matchcut") output.text = clean(scene.text || brief.headline, 100);
    if (scene.type === "feature") { output.title = clean(scene.title || scene.text, 50); if (scene.sub) output.sub = clean(scene.sub, 90); }
    if (scene.type === "featureStack") output.items = (Array.isArray(scene.items) ? scene.items : []).map((item) => clean(typeof item === "string" ? item : item?.title, 30)).filter(Boolean).slice(0, 3);
    if (scene.type === "stat") { output.value = clean(scene.value, 20); output.label = clean(scene.label, 60); }
    if (scene.type === "quote") { output.text = clean(scene.text, 140); output.author = clean(scene.author, 50); }
    if (scene.type === "logos") output.names = (Array.isArray(scene.names) ? scene.names : []).map((name) => clean(name, 24)).filter(Boolean).slice(0, 6);
    return output;
  }).filter((scene) => {
    if (scene.type === "hook") return scene.words?.length;
    if (scene.type === "feature") return scene.title;
    if (scene.type === "featureStack") return scene.items?.length === 3;
    if (scene.type === "logos") return scene.names?.length >= 3;
    if (scene.type === "stat") return brief.stats.some((stat) => stat.value === scene.value);
    if (scene.type === "quote") return scene.text?.length > 10;
    return true;
  });
  const suggested = resolveStructure(brief, decisions);
  const rawDirection = raw.direction && typeof raw.direction === "object" ? raw.direction : {};
  const structure = sanitizeStructure(rawDirection.structure, suggested);
  const matched = reorderScenes(scenes, structure);
  const matchedTypes = new Set(matched.map((scene) => scene.type));
  const extras = scenes.filter((scene) => !matchedTypes.has(scene.type) && PRODUCT_BEATS.has(scene.type));
  let ordered = matched.length >= 8 ? matched : [...matched, ...extras];
  ordered = ordered.filter((scene) => scene.type !== "marquee");
  let firstStat = true;
  ordered = ordered.filter((scene) => {
    if (scene.type !== "stat") return true;
    if (firstStat) { firstStat = false; return true; }
    return false;
  });
  const firstContent = ordered.findIndex(contentForward);
  if (!ordered.length || ordered[0].type === "coldopen") {
    if (firstContent > 0) {
      const [content] = ordered.splice(firstContent, 1);
      ordered.unshift(content);
    } else if (ordered[0]?.type === "coldopen") {
      ordered[0] = { ...ordered[0], type: "flashword", word: clean(ordered[0].word || brief.name, 28) };
    }
  }
  const finalStructure = ordered.map((scene) => scene.type);
  if (ordered.length < 8) return null;
  ordered = ordered.slice(0, 24);
  const opening = PRODUCT_BEATS.has(finalStructure[0]) ? finalStructure[0] : (finalStructure.find((type) => PRODUCT_BEATS.has(type)) || finalStructure[0]);
  const holds = (Array.isArray(rawDirection.holds) ? rawDirection.holds : []).filter((type, index, list) => SCENES.has(type) && list.indexOf(type) === index).slice(0, 2);
  const direction = {
    concept: clean(rawDirection.concept || raw.tagline || brief.headline || brief.description, 160),
    structure: finalStructure.length ? finalStructure : suggested,
    camera: CAMERAS.has(rawDirection.camera) ? rawDirection.camera : "push",
    opening,
    hero: Boolean(rawDirection.hero),
    beat: Math.min(34, Math.max(16, Number.parseInt(rawDirection.beat, 10) || (rawDirection.hero ? 30 : 20))),
    holds,
  };
  if (direction.opening !== direction.structure[0]) direction.opening = direction.structure[0];
  const style = STYLES.has(raw.style) ? raw.style : decisions.style;
  return { title: clean(raw.title || brief.name, 60), tagline: clean(raw.tagline || brief.headline, 90), motion_variation: clean(raw.motion_variation || decisions.motionVariation, 8), panel: Array.isArray(raw.panel) ? raw.panel.slice(0, 4).map((note) => ({ role: clean(note.role, 32), note: clean(note.note, 260) })).filter((note) => note.role && note.note) : [], scenes: ordered, direction, structure: direction.structure, shot_direction: Array.isArray(raw.shot_direction) ? raw.shot_direction.slice(0, 24).map((entry, index) => ({ shot: index + 1, type: ordered[index]?.type || "", purpose: clean(entry.purpose, 120), visual: clean(entry.visual, 240), sound: clean(entry.sound, 160) })) : [], style };
}

async function directWebsite(input) {
  const brief = briefForDirector(input);
  const seedInfo = bankStructure(brief);
  const seed = seedInfo.seed;
  const style = chooseStyle(brief, seed);
  const suggestedStructure = resolveStructure(brief, {});
  brief.suggested_structure = suggestedStructure;
  const decisions = { style, energy: brief.category === "editorial" ? 1.2 : 1.8, hook: brief.hookCandidates[0] || brief.headline || brief.name, motionVariation: motionVariation(brief, style), category: brief.category || "software product", suggestedStructure, source: "fallback" };
  const fallback = fallbackPlan(brief, decisions);
   const providers = [groqPlan];
  const attempts = [];
  for (const provider of providers) {
    const generated = await provider(brief, decisions);
    if (generated?.plan) {
      return { decisions: { ...decisions, style: generated.plan.style || decisions.style, source: generated.provider }, plan: generated.plan, diagnostics: { director: generated.provider, model: generated.model || null, fallback: false, providerConfigured: true, attempts } };
    }
    attempts.push({ provider: generated?.provider || "unknown", error: generated?.error || "unknown" });
  }
  const providerConfigured = groqKeys().length > 0;
  const errors = {};
  for (const attempt of attempts) {
    if (attempt.error === "not_configured") continue;
    errors[attempt.provider] = `${attempt.provider} unavailable (${attempt.error}); deterministic server direction was used.`;
  }
  return { decisions, plan: fallback, errors: Object.keys(errors).length ? errors : { director: "No director provider is configured; deterministic server direction was used." }, diagnostics: { director: "deterministic-fallback", fallback: true, providerConfigured, attempts } };
}

module.exports = { directWebsite };
