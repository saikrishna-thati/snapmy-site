const STYLES = new Set(["kinetic", "editorial", "neon", "pop", "mono"]);
const SCENES = new Set(["coldopen", "hook", "statement", "flashword", "screen", "scroll", "feature", "featureStack", "stat", "quote", "logos", "marquee", "split", "cta", "endcard"]);
const TRANSITIONS = new Set(["whip", "zoom", "flash", "wipe", "iris", "push", "glitch", "blocks", "cut"]);
const INTERACTIONS = new Set(["hover", "click", "scroll", "tab", "toggle", "modal", "none"]);

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
    features: Array.isArray(brief.features) ? brief.features.slice(0, 8).map((feature) => ({ title: clean(typeof feature === "string" ? feature : feature.title, 80), desc: clean(feature?.desc, 140) })) : [],
    stats: Array.isArray(brief.stats) ? brief.stats.slice(0, 4).map((stat) => ({ value: clean(stat.value, 20), label: clean(stat.label, 80) })) : [],
    quotes: Array.isArray(brief.quotes) ? brief.quotes.slice(0, 2).map((quote) => ({ text: clean(quote.text, 160), author: clean(quote.author, 60) })) : [],
    logos: Array.isArray(brief.logos) ? brief.logos.slice(0, 6).map((logo) => clean(logo, 40)) : [],
    screenshots: Array.isArray(brief.screenshots) ? brief.screenshots.slice(0, 24) : [],
    fullpages: Array.isArray(brief.fullpages) ? brief.fullpages.slice(0, 8) : [],
    pages: Array.isArray(brief.pages) ? brief.pages.slice(0, 8).map((page) => ({ url: clean(page.url, 240), role: clean(page.role, 32), title: clean(page.title, 120), description: clean(page.description, 240) })) : [],
    evidenceAssets: Array.isArray(brief.evidenceAssets) ? brief.evidenceAssets.slice(0, 32).map((asset) => ({ id: clean(asset.id, 80), url: clean(asset.url, 300), page: clean(asset.page, 240), pageRole: clean(asset.pageRole, 32), role: clean(asset.role, 32), kind: clean(asset.kind, 24), fullPage: Boolean(asset.fullPage), viewport: clean(asset.viewport, 20), state: clean(asset.state, 32), priority: Number(asset.priority) || 0 })) : [],
    interactionTrace: Array.isArray(brief.interactionTrace) ? brief.interactionTrace.slice(0, 6) : [],
    hookCandidates: Array.isArray(brief.hookCandidates) ? brief.hookCandidates.slice(0, 8).map((value) => clean(value, 100)) : [],
  };
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

function fallbackPlan(brief, decisions) {
  const feature = (index) => brief.features[index] || { title: "A clearer way to move", desc: "Built around the moments that matter." };
  const visualCount = Math.max(1, Array.isArray(brief.screenshots) ? brief.screenshots.length : Number(brief.screenshots) || 0);
  const shot = (index) => Math.abs(index) % visualCount;
  const proof = brief.stats[0] || brief.quotes[0];
  const scenes = [
    { type: "coldopen", word: brief.name || brief.domain },
    { type: "hook", words: clean(brief.hookCandidates[0] || brief.headline || brief.name, 64).split(/\s+/).slice(0, 4) },
    { type: "statement", text: brief.description || brief.headline || brief.name, kicker: brief.category || "Product" },
    { type: "screen", shot: shot(0), caption: clean(brief.headline, 34), interaction: brief.pages.length > 1 ? "click" : "none" },
    { type: "feature", title: feature(0).title, sub: feature(0).desc },
    { type: "scroll", shot: shot(1), interaction: "scroll" },
    { type: "feature", title: feature(1).title, sub: feature(1).desc },
  ];
  if (proof && brief.stats.length) scenes.push({ type: "stat", value: proof.value, label: proof.label || "A reason to believe" });
  else if (proof && brief.quotes.length) scenes.push({ type: "quote", text: proof.text, author: proof.author });
  else scenes.push({ type: "featureStack", items: [feature(0), feature(1), feature(2)].map((item) => item.title).filter(Boolean).slice(0, 3) });
  if (brief.logos.length >= 3) scenes.push({ type: "logos", names: brief.logos.slice(0, 6), kicker: "Trusted by teams" });
  scenes.push({ type: "split", shot: shot(2), text: brief.headline || brief.name, interaction: "none" });
  scenes.push({ type: "marquee", text: brief.name || brief.domain });
  scenes.push({ type: "cta", text: clean(brief.headline || "See what it changes", 30), button: clean(brief.cta || brief.ctaCandidates?.[0] || "Explore the product", 24) });
  scenes.push({ type: "endcard", text: clean(brief.description || brief.headline || brief.domain, 60) });
  return {
    title: clean(brief.name || brief.domain, 60),
    tagline: clean(brief.headline || brief.description || brief.name, 80),
    style: decisions.style,
    motion_variation: decisions.motionVariation,
    panel: [
      { role: "Creative director", note: "The story moves from the product promise into visible proof, then gives the viewer a clear next action." },
      { role: "Motion designer", note: `Use ${brief.screenshots.length > 1 ? "distinct page states" : "the strongest available page state"} as evidence; keep transitions subordinate to the product.` },
      { role: "Brand designer", note: `Let the ${decisions.style} treatment support the site's own hierarchy instead of adding decorative effects.` },
      { role: "Music editor", note: "Build toward the first product reveal, leave space for the proof beat, and resolve cleanly on the end card." },
    ],
    scenes,
    shot_direction: scenes.map((scene, index) => ({ shot: index + 1, type: scene.type, purpose: purposeFor(scene), visual: visualFor(scene), sound: soundFor(scene) })),
  };
}

function purposeFor(scene) {
  return ({ coldopen: "Name the world", hook: "Create curiosity", statement: "State the promise", screen: "Reveal the product", scroll: "Show breadth", feature: "Explain a capability", stat: "Add proof", quote: "Add human proof", featureStack: "Compress the value", logos: "Establish trust", split: "Connect promise to evidence", marquee: "Create a brand breath", cta: "Invite action", endcard: "Leave a memorable lockup" }[scene.type] || "Support the story");
}

function visualFor(scene) {
  if (["screen", "scroll", "split"].includes(scene.type)) return "Use the selected website evidence with a deliberate crop; do not invent UI behavior.";
  if (scene.type === "stat" || scene.type === "quote") return "Protect a readable hold and keep the proof as the only focal point.";
  return "Use restrained typography and movement that follows the information hierarchy.";
}

function soundFor(scene) {
  if (scene.type === "screen") return "Product reveal hit with a short lift.";
  if (["stat", "quote", "logos"].includes(scene.type)) return "Reduce density and let the proof land.";
  if (scene.type === "cta" || scene.type === "endcard") return "Resolve with a confident, uncluttered landing.";
  return "Support the beat without masking the message.";
}

async function kimiPlan(brief, decisions) {
  const key = typeof process.env.KIMI_KEY === "string" ? process.env.KIMI_KEY.trim() : "";
  if (!key) return { plan: null, error: "not_configured" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16000);
  const system = "You are Snapmy.site's senior creative director. Return only JSON. Use only facts in the brief. Produce 12-20 varied scenes using the allowed scene types, preserve real stats/quotes/logos, choose a style from kinetic/editorial/neon/pop/mono, and include panel notes plus shot_direction entries with purpose, visual, and sound intent. Avoid claiming interactions that the brief cannot support.";
  const user = JSON.stringify({ brief, initial_decisions: decisions, allowed_scene_types: [...SCENES] });
  try {
    const response = await fetch("https://api.moonshot.ai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
       body: JSON.stringify({ model: "kimi-k2.6", thinking: { type: "disabled" }, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
     if (!response.ok) return { plan: null, error: `http_${response.status}` };
     const payload = await response.json();
     const content = payload?.choices?.[0]?.message?.content;
     if (!content) return { plan: null, error: "empty_response" };
     const parsed = JSON.parse(String(content).replace(/^```json\s*|\s*```$/g, ""));
     const plan = cleanPlan(parsed, brief, decisions);
     return plan ? { plan, error: null } : { plan: null, error: "invalid_plan" };
   } catch (cause) {
     return { plan: null, error: cause?.name === "AbortError" ? "timeout" : "request_failed" };
  } finally {
    clearTimeout(timer);
  }
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
     if (["screen", "scroll", "split"].includes(scene.type)) {
       const screenshotCount = Array.isArray(brief.screenshots) ? brief.screenshots.length : Number(brief.screenshots) || 0;
       output.shot = Math.abs(Number.parseInt(scene.shot, 10) || 0) % Math.max(1, screenshotCount);
       if (scene.asset_id || scene.assetId) output.asset_id = clean(scene.asset_id || scene.assetId, 80);
       if (scene.visual_reason || scene.visualReason) output.visual_reason = clean(scene.visual_reason || scene.visualReason, 140);
     }
    if (scene.type === "screen" && scene.caption) output.caption = clean(scene.caption, 40);
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
  if (scenes.length < 12) return null;
  const style = STYLES.has(raw.style) ? raw.style : decisions.style;
  return { title: clean(raw.title || brief.name, 60), tagline: clean(raw.tagline || brief.headline, 90), motion_variation: clean(raw.motion_variation || decisions.motionVariation, 8), panel: Array.isArray(raw.panel) ? raw.panel.slice(0, 4).map((note) => ({ role: clean(note.role, 32), note: clean(note.note, 260) })).filter((note) => note.role && note.note) : [], scenes: scenes.slice(0, 24), shot_direction: Array.isArray(raw.shot_direction) ? raw.shot_direction.slice(0, 24).map((entry, index) => ({ shot: index + 1, type: scenes[index]?.type || "", purpose: clean(entry.purpose, 120), visual: clean(entry.visual, 240), sound: clean(entry.sound, 160) })) : [], style };
}

async function directWebsite(input) {
  const brief = briefForDirector(input);
  const seed = hash(`${brief.domain}|${brief.name}|${brief.headline}`);
  const style = chooseStyle(brief, seed);
  const decisions = { style, energy: brief.category === "editorial" ? 1.2 : 1.8, hook: brief.hookCandidates[0] || brief.headline || brief.name, motionVariation: motionVariation(brief, style), category: brief.category || "software product", source: "fallback" };
  const fallback = fallbackPlan(brief, decisions);
   const generated = await kimiPlan(brief, decisions);
   if (generated?.plan) {
     return { decisions: { ...decisions, style: generated.plan.style || decisions.style, source: "kimi" }, plan: generated.plan, diagnostics: { director: "kimi", fallback: false, providerConfigured: true } };
   }
   const keyConfigured = Boolean(typeof process.env.KIMI_KEY === "string" && process.env.KIMI_KEY.trim());
   const reason = generated?.error || (keyConfigured ? "unknown" : "not_configured");
   return { decisions, plan: fallback, errors: { kimi: keyConfigured ? `Kimi unavailable (${reason}); deterministic server direction was used.` : "Kimi is not configured; deterministic server direction was used." }, diagnostics: { director: "deterministic-fallback", fallback: true, providerConfigured: keyConfigured, kimi: reason } };
}

module.exports = { directWebsite };
