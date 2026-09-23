// Direction layer: talks to the Snapmy.site backend (direction + motion panel),
// falls back to Kimi straight from the browser, then to the built-in director.
import { API, KIMI_KEY, KIMI_BASE, KIMI_MODEL } from "./config.js";
import { SCENE_TYPES, STYLES, fallbackPlan, resolveMotionVariation } from "./composer.js";

const TRANSITIONS = ["whip", "zoom", "flash", "wipe", "iris", "push", "glitch", "blocks", "cut"];

export async function api(path, body, { timeout = 60000 } = {}) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(API + path, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal } : { signal: ctrl.signal });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "HTTP " + r.status);
    return j;
  } finally { clearTimeout(t); }
}

export async function backendAlive() { try { const j = await api("/health", null, { timeout: 3500 }); return !!j.ok; } catch { return false; } }

/* ---------- reading fallback (no backend) ---------- */
export async function readInBrowser(url) {
  const u = new URL(/^https?:/i.test(url) ? url : "https://" + url);
  const domain = u.host.replace(/^www\./, "");
  let md = "";
  try { const r = await fetch("https://r.jina.ai/" + u.href, { headers: { Accept: "text/plain" } }); if (r.ok) md = await r.text(); } catch {}
  if (/AuthenticationRequired|error/i.test(md.slice(0, 200)) && md.length < 600) md = "";
  const lines = md.split("\n").map((l) => l.trim()).filter(Boolean);
  const title = (md.match(/^Title:\s*(.+)$/m) || [])[1] || domain;
  const heads = lines.filter((l) => /^#{1,3}\s/.test(l)).map((l) => l.replace(/^#+\s*/, "").replace(/[*_`\[\]]/g, "")).filter((l) => l.length > 3 && l.length < 90);
  const paras = lines.filter((l) => !/^[#!\[*|>-]/.test(l) && l.length > 50 && l.length < 260).slice(0, 8);
  const shot = `https://api.microlink.io/?url=${encodeURIComponent(u.href)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1440&viewport.height=900`;
  const name = title.split(/[|\-–—:·]/)[0].trim().slice(0, 28) || domain;
  return { name, domain, url: u.href, headline: heads[0] || title, description: paras[0] || "", features: heads.slice(1, 9).map((t) => ({ title: t, desc: "" })), stats: [], quotes: [], logos: [], colors: [], logo: "", screenshots: [shot], fullpage: "", hookCandidates: heads.slice(0, 5), paras };
}

/* ---------- Kimi from the browser (CORS-enabled) ---------- */
const PANEL_SYSTEM = `You are the directing room of Snapmy.site, a studio that turns a website into a 30-second beat-synced launch film: a creative director plus three senior motion designers ("Kinetic typographer", "Music editor", "Brand designer").
EVERY shot lasts exactly 1.5 seconds (one bar at 160 BPM). 18-22 shots. Shot 1 "coldopen", last "endcard", the one before "cta".
Tiny text: hook words 1-2 words each (max 4 words), statement max 9 words, feature title max 5 words, sub max 9, flashword ONE word, caption max 5, stat label max 6, quote max 18.
Use ONLY facts in the brief; "stat" only with brief.stats values, "quote" only with brief.quotes, "logos" only with brief.logos (min 3 names).
Arc: hook → tension → DROP on the first product "screen" around shot 5 → features with rhythm → proof → payoff → cta → endcard. Never three text-only shots of the same type in a row.
Shot types: coldopen{word} | hook{words[]} | statement{text,accent,kicker?} | flashword{word} | screen{shot,caption,interaction?} | scroll{shot,interaction?} | feature{title,sub?,kicker?} | featureStack{items[3]} | stat{value,label} | quote{text,author} | logos{names[]} | marquee{text} | split{shot,text,interaction?} | cta{text,button} | endcard{text}
Use the supplied hidden motion direction to choose pacing, continuous camera behavior, product interactions, and sound emphasis. Return one hidden "motion_variation" id from mv001 through mv100. Use interaction values only when they fit the visible product moment: hover|click|scroll|tab|toggle|modal|none. Do not reveal implementation transition names in the title, tagline, or panel notes; the engine maps the motion direction internally.
Optional internal "transition" per shot may still be used when a hard boundary is clearly appropriate: whip|zoom|flash|wipe|iris|push|glitch|blocks|cut.
Draft, let each panelist give ONE concrete note (max 22 words, name shot numbers), apply the notes, output ONLY JSON: {"title":string,"tagline":string,"motion_variation":"mv001","panel":[{"role":string,"note":string}],"scenes":[...]}`;

export async function kimiInBrowser(brief, decisions = {}) {
  if (!KIMI_KEY) throw new Error("no browser key");
  const payload = { name: brief.name, domain: brief.domain, headline: brief.headline, description: brief.description, hook_pick: decisions.hook, features: (brief.features || []).slice(0, 8), stats: (brief.stats || []).slice(0, 4), quotes: (brief.quotes || []).slice(0, 2), logos: (brief.logos || []).slice(0, 8), screenshots_available: (brief.screenshots || []).length, style: decisions.style, motion_variation: resolveMotionVariation(decisions.motionVariation || decisions.motion_variation || decisions.motion?.variation, brief, decisions.style).id, motion_direction: decisions.motionDirective || decisions.motion || null };
  const r = await fetch(KIMI_BASE + "/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + KIMI_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ model: KIMI_MODEL, thinking: { type: "disabled" }, response_format: { type: "json_object" }, temperature: 0.6, messages: [{ role: "system", content: PANEL_SYSTEM }, { role: "user", content: "Brief:\n" + JSON.stringify(payload) }] }) });
  if (!r.ok) throw new Error("kimi " + r.status);
  const j = await r.json();
  return JSON.parse((j.choices?.[0]?.message?.content || "{}").replace(/^```json|```$/g, ""));
}

/* ---------- heuristics when JEV is unreachable ---------- */
export function guessDecisions(brief) {
  const t = [brief.name, brief.headline, brief.description, ...(brief.features || []).map((f) => f.title)].join(" ").toLowerCase();
  let style = "kinetic";
  if (/(finance|bank|wealth|legal|insur|luxury|wellness|health|journal|media|magazine)/.test(t)) style = "editorial";
  else if (/(crypto|web3|security|gaming|api|developer|terminal|cli)/.test(t)) style = "neon";
  else if (/(food|kids|social|creator|shop|store|fun|play|fashion)/.test(t)) style = "pop";
  else if (/(design|enterprise|hardware|minimal|studio)/.test(t)) style = "mono";
  return { style, energy: 1.8, hook: (brief.hookCandidates || [])[0] || brief.headline, motionVariation: resolveMotionVariation(null, brief, style).id, source: "heuristic" };
}

/* ---------- sanitize whatever the LLM returns ---------- */
export function normalizePlan(raw, brief, decisions) {
  const shotsN = Math.max(1, (brief.screenshots || []).length);
  const logos = brief.logos || [];
  const statVals = new Set((brief.stats || []).map((s) => String(s.value)));
  const clean = (s, n) => String(s ?? "").replace(/^[—–-]\s*/, "").replace(/\s+/g, " ").trim().slice(0, n);
  let scenes = (raw?.scenes || []).filter((s) => s && SCENE_TYPES.includes(s.type)).map((s) => {
    const o = { type: s.type };
    if (TRANSITIONS.includes(s.transition)) o.transition = s.transition;
    if (s.interaction && ["hover", "click", "scroll", "tab", "toggle", "modal", "none"].includes(s.interaction)) o.interaction = s.interaction;
    switch (s.type) {
      case "coldopen": o.word = clean(s.word || brief.name, 24); break;
      case "hook": o.words = (Array.isArray(s.words) ? s.words : String(s.words || s.text || "").split(/\s+/)).map((w) => clean(w, 22)).filter(Boolean).slice(0, 4); break;
      case "statement": o.text = clean(s.text, 70); o.accent = clean(s.accent, 20); if (s.kicker) o.kicker = clean(s.kicker, 24); break;
      case "flashword": o.word = clean(String(s.word || s.text || "").split(/\s+/)[0], 16); break;
      case "screen": case "scroll": o.shot = Math.abs(parseInt(s.shot) || 0) % shotsN; if (s.caption) o.caption = clean(s.caption, 34); break;
      case "split": o.shot = Math.abs(parseInt(s.shot) || 0) % shotsN; o.text = clean(s.text, 48); break;
      case "feature": o.title = clean(s.title || s.text, 40); if (s.sub) o.sub = clean(s.sub, 70); if (s.kicker) o.kicker = clean(s.kicker, 24); break;
      case "featureStack": o.items = (s.items || []).map((x) => clean(typeof x === "string" ? x : x?.title, 26)).filter(Boolean).slice(0, 3); break;
      case "stat": o.value = clean(s.value, 10); o.label = clean(s.label, 48); break;
      case "quote": o.text = clean(s.text, 120); o.author = clean(s.author, 40); break;
      case "logos": o.names = (s.names || []).map((x) => clean(x, 18)).filter(Boolean).slice(0, 6); break;
      case "marquee": o.text = clean(s.text || brief.name, 26); break;
      case "cta": o.text = clean(s.text || "Try it free", 30); o.button = clean(s.button || "Get started", 22); break;
      case "endcard": o.text = clean(s.text || raw?.tagline || brief.headline, 60); break;
    }
    return o;
  }).filter((s) => {
    if (s.type === "hook") return s.words.length > 0;
    if (s.type === "logos") return s.names.length >= 3 && s.names.every((n) => logos.length === 0 || logos.some((l) => l.toLowerCase() === n.toLowerCase()));
    if (s.type === "stat") return !!s.value && (statVals.size === 0 ? false : statVals.has(s.value));
    if (s.type === "featureStack") return s.items.length === 3;
    if (s.type === "quote") return s.text.length > 10;
    return true;
  });
  // keep at most 4 numbered features; fold the rest into a three-item stack
  const feats = scenes.filter((s) => s.type === "feature");
  if (feats.length > 4) {
    const extra = feats.slice(4); const items = extra.map((f) => f.title).slice(0, 3);
    const firstExtra = scenes.indexOf(extra[0]);
    scenes = scenes.filter((s) => !extra.includes(s));
    if (items.length === 3 && !scenes.some((s) => s.type === "featureStack")) scenes.splice(firstExtra, 0, { type: "featureStack", items });
  }
  // transitions: keep only the LLM's accents; the style's primary covers the rest
  const counts = {}; scenes.forEach((s) => s.transition && (counts[s.transition] = (counts[s.transition] || 0) + 1));
  const filler = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  scenes.forEach((s) => { if (s.transition === filler) delete s.transition; });
  const motionVariation = raw?.motion_variation || raw?.motionVariation || raw?.motion?.variation || decisions.motionVariation;
  if (scenes.length < 12) return { ...fallbackPlan(brief, { ...decisions, motionVariation }), panel: raw?.panel || [], tagline: raw?.tagline };
  if (scenes[0].type !== "coldopen") scenes.unshift({ type: "coldopen", word: brief.name });
  scenes = scenes.filter((s, i) => s.type !== "endcard" || i === scenes.length - 1);
  if (scenes[scenes.length - 1].type !== "endcard") scenes.push({ type: "endcard", text: raw?.tagline || brief.headline });
  if (!scenes.some((s) => s.type === "cta")) scenes.splice(scenes.length - 1, 0, { type: "cta", text: "Try it today", button: "Get started" });
  scenes = scenes.slice(0, 23).concat(scenes.length > 23 ? [scenes[scenes.length - 1]] : []);
  const style = STYLES[decisions.style] ? decisions.style : "kinetic";
  return { style, motionVariation, scenes, panel: (raw?.panel || []).slice(0, 4).map((p) => ({ role: clean(p.role, 30), note: clean(p.note, 260) })), tagline: clean(raw?.tagline, 60), title: clean(raw?.title, 60) };
}
