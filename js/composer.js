// Snapmy.site launch-film composer
// Turns a site brief + a directed plan into a player-compatible HTML composition
// (data-composition-id root, class="clip" timed layers, one paused GSAP timeline).
// Every scene is exactly one bar (1.5 s @ 160 BPM), so every cut lands on a downbeat.

export const CUT = 1.5;
export const BEAT = CUT / 4;
export const ASPECTS = { "16:9": [1920, 1080], "9:16": [1080, 1920], "1:1": [1080, 1080], "4:5": [1080, 1350] };

export const STYLES = {
  kinetic: {
    label: "Kinetic", dark: true, display: "Inter Tight", dw: 800, ratio: 0.6, upper: true, track: -0.035,
    body: "Inter Tight", mono: "JetBrains Mono", primary: "whip", accents: ["zoom", "flash", "blocks"], grain: 0.10, hud: true,
    fonts: "Inter+Tight:wght@500;700;800;900&family=JetBrains+Mono:wght@500",
  },
  editorial: {
    label: "Editorial", dark: false, display: "Instrument Serif", dw: 400, ratio: 0.46, upper: false, track: -0.02,
    body: "Inter", mono: "JetBrains Mono", primary: "push", accents: ["wipe", "iris", "blocks"], grain: 0.07, hud: false,
    fonts: "Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500",
  },
  neon: {
    label: "Neon", dark: true, display: "Space Grotesk", dw: 700, ratio: 0.58, upper: false, track: -0.04,
    body: "Space Grotesk", mono: "JetBrains Mono", primary: "cut", accents: ["glitch", "zoom", "blocks"], grain: 0.12, hud: true,
    fonts: "Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700",
  },
  pop: {
    label: "Pop", dark: false, display: "Bricolage Grotesque", dw: 800, ratio: 0.56, upper: false, track: -0.045,
    body: "Bricolage Grotesque", mono: "JetBrains Mono", primary: "wipe", accents: ["iris", "flash", "zoom"], grain: 0.05, hud: false,
    fonts: "Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=JetBrains+Mono:wght@500",
  },
  mono: {
    label: "Minimal", dark: true, display: "Manrope", dw: 800, ratio: 0.6, upper: false, track: -0.04,
    body: "Manrope", mono: "JetBrains Mono", primary: "cut", accents: ["whip", "wipe", "push"], grain: 0.06, hud: true,
    fonts: "Manrope:wght@500;700;800&family=JetBrains+Mono:wght@500",
  },
};

// Hidden motion direction catalog. JEV/Kimi choose a profile; the composer
// turns it into camera, transition, FX, and interaction decisions internally.
const MOTION_FAMILIES = [
  { key: "precision", label: "Precision", transitions: ["push", "zoom", "cut"], camera: "linear", effects: ["clean", "glass"], interactions: ["tab", "click", "none"], pan: 0.82, depth: 0.88, tilt: 0.25, grain: 0.035, blur: 8, bridgeGain: 0.48, settle: 0.24 },
  { key: "editorial", label: "Editorial", transitions: ["wipe", "iris", "push"], camera: "drift", effects: ["paper", "soft"], interactions: ["hover", "scroll", "none"], pan: 0.66, depth: 0.76, tilt: 0.18, grain: 0.055, blur: 5, bridgeGain: 0.42, settle: 0.3 },
  { key: "signal", label: "Signal", transitions: ["glitch", "flash", "zoom"], camera: "snap", effects: ["scan", "chromatic"], interactions: ["click", "tab", "toggle"], pan: 1.18, depth: 1.12, tilt: 0.55, grain: 0.11, blur: 18, bridgeGain: 0.62, settle: 0.2 },
  { key: "glass", label: "Glass", transitions: ["iris", "zoom", "wipe"], camera: "orbit", effects: ["glass", "soft"], interactions: ["hover", "modal", "click"], pan: 0.94, depth: 1.08, tilt: 0.72, grain: 0.045, blur: 12, bridgeGain: 0.5, settle: 0.34 },
  { key: "orbit", label: "Orbit", transitions: ["whip", "push", "zoom"], camera: "orbit", effects: ["glow", "grain"], interactions: ["tab", "scroll", "click"], pan: 1.34, depth: 1.2, tilt: 1.05, grain: 0.095, blur: 16, bridgeGain: 0.58, settle: 0.28 },
  { key: "product", label: "Product", transitions: ["wipe", "push", "cut"], camera: "linear", effects: ["clean", "glow"], interactions: ["click", "modal", "tab"], pan: 0.9, depth: 0.98, tilt: 0.38, grain: 0.04, blur: 9, bridgeGain: 0.52, settle: 0.26 },
  { key: "kinetic", label: "Kinetic", transitions: ["whip", "flash", "blocks"], camera: "snap", effects: ["chromatic", "scan"], interactions: ["click", "toggle", "tab"], pan: 1.48, depth: 1.16, tilt: 1.2, grain: 0.13, blur: 24, bridgeGain: 0.68, settle: 0.2 },
  { key: "quiet", label: "Quiet", transitions: ["iris", "cut", "wipe"], camera: "drift", effects: ["soft", "paper"], interactions: ["hover", "none", "scroll"], pan: 0.48, depth: 0.68, tilt: 0.12, grain: 0.028, blur: 3, bridgeGain: 0.34, settle: 0.42 },
  { key: "neon", label: "Neon", transitions: ["glitch", "whip", "blocks"], camera: "orbit", effects: ["scan", "chromatic", "glow"], interactions: ["toggle", "click", "modal"], pan: 1.62, depth: 1.28, tilt: 1.4, grain: 0.15, blur: 26, bridgeGain: 0.72, settle: 0.18 },
  { key: "launch", label: "Launch", transitions: ["zoom", "flash", "whip"], camera: "snap", effects: ["glow", "glass", "scan"], interactions: ["click", "tab", "modal"], pan: 1.28, depth: 1.22, tilt: 0.86, grain: 0.08, blur: 20, bridgeGain: 0.66, settle: 0.22 },
];

export const MOTION_VARIATIONS = Object.fromEntries(Array.from({ length: 100 }, (_, index) => {
  const family = MOTION_FAMILIES[index % MOTION_FAMILIES.length];
  const variant = Math.floor(index / MOTION_FAMILIES.length);
  return [`mv${String(index + 1).padStart(3, "0")}`, {
    id: `mv${String(index + 1).padStart(3, "0")}`,
    label: `${family.label} ${String(variant + 1).padStart(2, "0")}`,
    family: family.key,
    primary: family.transitions[variant % family.transitions.length],
    accents: family.transitions.filter((_, i) => i !== variant % family.transitions.length),
    camera: family.camera,
    effect: family.effects[variant % family.effects.length],
    interaction: family.interactions[variant % family.interactions.length],
    pan: family.pan * (1 + variant * 0.055),
    depth: family.depth * (1 + variant * 0.04),
    tilt: family.tilt + (variant % 4) * 0.28,
    grain: Math.min(0.18, family.grain + variant * 0.006),
    blur: family.blur + (variant % 5) * 2,
    bridgeGain: family.bridgeGain + (variant % 3) * 0.035,
    settle: Math.max(0.18, family.settle + (variant % 4) * 0.035),
    soundProfile: `snd${String((index % 50) + 1).padStart(3, "0")}`,
  }];
}));

export function resolveMotionVariation(value, brief = {}, style = "kinetic") {
  const raw = typeof value === "object" && value ? value.id || value.variation || value.key : value;
  if (typeof raw === "string" && MOTION_VARIATIONS[raw]) return MOTION_VARIATIONS[raw];
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 1 && n <= 100) return MOTION_VARIATIONS[`mv${String(n).padStart(3, "0")}`];
  const key = `${brief.domain || brief.name || "snapmy-site"}:${style}`;
  return MOTION_VARIATIONS[`mv${String((hash(key) % 100) + 1).padStart(3, "0")}`];
}

export const SCENE_TYPES = ["coldopen", "hook", "statement", "flashword", "screen", "scroll", "feature", "featureStack", "stat", "quote", "logos", "marquee", "split", "cta", "endcard"];

// Product scenes share one browser window. Keeping this list deliberately small
// means the rig only persists while the viewer is looking at the product world.
const WINDOW_SCENE_TYPES = new Set(["screen", "scroll", "feature", "featureStack", "stat", "split"]);
const WINDOW_WAYPOINTS = [
  [0, 0, 0],
  [300, -150, -400],
  [600, 0, -200],
  [420, 120, -280],
];

// SFX cue each transition / scene type implies (consumed by the score engine)
const TRANSITION_SFX = { whip: "swoosh_fast", zoom: "swoosh_air", flash: "rev_glass", wipe: "swoosh_mid", iris: "swoosh_low", glitch: "glitch", push: "swoosh_mid", cut: null, blocks: "swoosh_fast" };

/* ---------------- utils ---------------- */
export function rng(seed) {
  let s = seed >>> 0 || 2654435769;
  const next = () => { s |= 0; s = (s + 1831565813) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { next, pick: (a) => a[Math.floor(next() * a.length)], range: (a, b) => a + (b - a) * next() };
}
export function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const J = (v) => JSON.stringify(v);
const r3 = (n) => Math.round(n * 1000) / 1000;

function hexToRgb(h) { h = String(h || "").replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h, 16); if (isNaN(n) || h.length !== 6) return null; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const rgbToHex = ([r, g, b]) => "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
function lum(hex) { const c = hexToRgb(hex) || [0, 0, 0]; const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); }
export function contrast(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
function mix(a, b, t) { const x = hexToRgb(a) || [0, 0, 0], y = hexToRgb(b) || [0, 0, 0]; return rgbToHex(x.map((v, i) => v + (y[i] - v) * t)); }
function saturation(hex) { const c = hexToRgb(hex); if (!c) return 0; const mx = Math.max(...c), mn = Math.min(...c); return mx === 0 ? 0 : (mx - mn) / mx; }

export function palette(brief, style) {
  const cols = (brief.colors || []).filter((c) => hexToRgb(c));
  // most saturated brand color as accent
  let accent = cols.slice().sort((a, b) => saturation(b) - saturation(a))[0] || "#E3412B";
  if (saturation(accent) < 0.18) accent = "#E3412B";
  const second = cols.find((c) => c !== accent && saturation(c) > 0.2 && contrast(c, accent) > 1.4) || mix(accent, style.dark ? "#ffffff" : "#000000", 0.35);
  const bg = style.dark ? mix("#0A0A0B", accent, 0.06) : mix("#F4F1EA", accent, 0.05);
  const fg = style.dark ? "#F5F3EE" : "#121212";
  let acc = accent;
  // keep accent legible on bg
  let guard = 0;
  while (contrast(acc, bg) < 3 && guard++ < 8) acc = mix(acc, style.dark ? "#ffffff" : "#000000", 0.15);
  const onAccent = contrast("#ffffff", accent) >= contrast("#111111", accent) ? "#ffffff" : "#111111";
  const surface = style.dark ? mix(bg, "#ffffff", 0.07) : mix(bg, "#000000", 0.05);
  const muted = mix(fg, bg, 0.45);
  return { bg, fg, accent: acc, field: accent, onAccent, second, surface, muted };
}

// greedy line wrap
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean); const lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) lines.push(cur); return lines;
}
function fitSize(lines, width, ratio, maxFs) { const longest = Math.max(1, ...lines.map((l) => l.length)); return Math.min(maxFs, Math.floor(width / (longest * ratio))); }
function clip(text, n) { const s = String(text || "").trim(); if (s.length <= n) return s; const cut = s.slice(0, n); return cut.slice(0, cut.lastIndexOf(" ") > n * 0.5 ? cut.lastIndexOf(" ") : n).replace(/[,.;:\-–—]+$/, "") ; }

/* ---------------- transitions ---------------- */
function transitionCode(kind, O, I, T, ctx) {
  const { W, H, dir, motion = {} } = ctx; const L = [];
  const blur = motion.blur || 28;
  const x = Math.round(W * 0.38) * dir;
  switch (kind) {
    case "whip":
      L.push(`tl.fromTo(${J(O)},{x:0,filter:"blur(0px)"},{x:${-x},filter:"blur(${blur}px)",duration:.2,ease:"power3.in",immediateRender:false},${r3(T - 0.2)});`);
      L.push(`tl.fromTo(${J(I)},{x:${x},filter:"blur(${blur}px)"},{x:0,filter:"blur(0px)",duration:.34,ease:"expo.out",immediateRender:false},${r3(T - 0.02)});`);
      break;
    case "zoom":
      L.push(`tl.fromTo(${J(O)},{scale:1,filter:"blur(0px)",opacity:1},{scale:1.7,filter:"blur(${Math.round(blur * 0.65)}px)",opacity:0,duration:.24,ease:"power3.in",immediateRender:false},${r3(T - 0.22)});`);
      L.push(`tl.fromTo(${J(I)},{scale:.72,filter:"blur(${Math.round(blur * 0.58)}px)"},{scale:1,filter:"blur(0px)",duration:.42,ease:"expo.out",immediateRender:false},${r3(T - 0.04)});`);
      break;
    case "flash":
      L.push(`tl.fromTo("#fx-flash",{opacity:0},{opacity:1,duration:.12,ease:"power2.in",immediateRender:false},${r3(T - 0.12)});`);
      L.push(`tl.to("#fx-flash",{opacity:0,duration:.4,ease:"power2.out"},${r3(T)});`);
      L.push(`tl.fromTo(${J(I)},{scale:1.1},{scale:1,duration:.6,ease:"expo.out",immediateRender:false},${r3(T)});`);
      break;
    case "wipe":
      L.push(`tl.fromTo(${J(I)},{clipPath:"inset(0% 0% 0% 100%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.36,ease:"expo.inOut",immediateRender:false},${r3(T - 0.18)});`);
      L.push(`tl.fromTo(${J(O)},{x:0},{x:${Math.round(-W * 0.12)},duration:.36,ease:"expo.inOut",immediateRender:false},${r3(T - 0.18)});`);
      break;
    case "iris":
      L.push(`tl.fromTo(${J(I)},{clipPath:"circle(0% at 50% 50%)"},{clipPath:"circle(80% at 50% 50%)",duration:.46,ease:"expo.inOut",immediateRender:false},${r3(T - 0.2)});`);
      L.push(`tl.fromTo(${J(O)},{scale:1},{scale:.9,duration:.46,ease:"power2.inOut",immediateRender:false},${r3(T - 0.2)});`);
      break;
    case "push":
      L.push(`tl.fromTo(${J(O)},{yPercent:0},{yPercent:-100,duration:.4,ease:"power4.inOut",immediateRender:false},${r3(T - 0.2)});`);
      L.push(`tl.fromTo(${J(I)},{yPercent:100},{yPercent:0,duration:.4,ease:"power4.inOut",immediateRender:false},${r3(T - 0.2)});`);
      break;
    case "glitch": {
      const offs = [[-38, 14], [52, -10], [-18, 26], [0, 0]];
      offs.forEach(([a, b], k) => L.push(`tl.set(${J(k < 2 ? O : I)},{x:${a},y:${b},filter:${J(k === 3 ? "none" : `hue-rotate(${60 + k * 70}deg) saturate(2.2)`)}},${r3(T - 0.12 + k * 0.045)});`));
      L.push(`tl.fromTo("#fx-glitch",{opacity:0},{opacity:1,duration:.02,immediateRender:false},${r3(T - 0.12)});`);
      L.push(`tl.set("#fx-glitch",{backgroundPosition:"0px 37px"},${r3(T - 0.07)});`);
      L.push(`tl.set("#fx-glitch",{opacity:0},${r3(T + 0.08)});`);
      break;
    }
    case "blocks":
      L.push(`tl.fromTo("#fx-blocks i",{scaleY:0,transformOrigin:"50% 100%"},{scaleY:1,duration:.2,ease:"power3.in",stagger:.028,immediateRender:false},${r3(T - 0.3)});`);
      L.push(`tl.fromTo("#fx-blocks i",{scaleY:1,transformOrigin:"50% 0%"},{scaleY:0,duration:.28,ease:"power3.out",stagger:.028,immediateRender:false},${r3(T + 0.02)});`);
      break;
    case "cut":
    default:
      L.push(`tl.fromTo(${J(I)},{scale:1.08},{scale:1,duration:.5,ease:"expo.out",immediateRender:false},${r3(T)});`);
  }
  return L;
}

/* ---------------- scenes ---------------- */
// each builder returns { html, code: string[] } ; t0 = downbeat of the scene
function sceneBuilders(ctx) {
  const { W, H, P, S, brief, u, portrait, motion } = ctx;
  const windowed = () => Boolean(ctx.windowed);
  const up = (s) => (S.upper ? String(s).toUpperCase() : String(s));
  const padX = Math.round(W * (portrait ? 0.08 : 0.075));
  const innerW = W - padX * 2;
  const shots = (brief.screenshots || []).filter(Boolean);
  const shot = (i) => shots.length ? shots[i % shots.length] : null;
  const kicker = (id, text) => `<div class="kick" id="${id}-k"><span class="dot"></span>${esc(text)}</div>`;
  const kickerIn = (id, t0) => `tl.fromTo("#${id}-k",{opacity:0,x:-24},{opacity:1,x:0,duration:.4,ease:"expo.out"},${r3(t0 + 0.05)});`;
  const drift = (id, t0, amt = 0.045) => `tl.fromTo("#${id} .cam",{scale:1},{scale:${1 + amt},duration:${CUT + 0.4},ease:"none"},${r3(t0 - 0.2)});`;
  const interactionCode = (sc, id, t0, type) => {
    const mode = sc.interaction || (type === "scroll" ? "scroll" : type === "screen" ? motion.interaction : "none");
    const code = [];
    if (["click", "tab", "toggle", "modal"].includes(mode)) {
      code.push(`tl.to("#${id}-anchor",{scale:1.14,duration:.09,ease:"power2.in"},${r3(t0 + 0.68)});`, `tl.to("#${id}-anchor",{scale:1,duration:.3,ease:"back.out(1.7)"},${r3(t0 + 0.77)});`);
    }
    if (mode === "modal") code.push(`tl.fromTo("#${id}-b",{filter:"brightness(1)"},{filter:"brightness(1.22)",duration:.12,yoyo:true,repeat:1,ease:"power2.inOut"},${r3(t0 + 0.68)});`);
    const sfx = { click: "mouse_click_b", tab: "ui_tick", toggle: "toggle", modal: "confirm", hover: "swoosh_air", scroll: "mouse_down" }[mode];
    return { code, hits: sfx ? [{ t: t0 + (mode === "scroll" ? 0.2 : 0.68), sfx, gain: mode === "hover" ? 0.22 : 0.38 }] : [] };
  };

  return {
    coldopen(sc, id, t0) {
      const name = up(sc.word || brief.name || "Snapmy.site");
      const chars = [...name];
      const fs = Math.min(Math.round(H * (portrait ? 0.16 : 0.26)), Math.floor(innerW / (chars.length * S.ratio)));
      const html = `<div class="cam center"><div class="mono tiny" id="${id}-tag">${esc(brief.domain || "")}</div><h1 class="disp mask" style="font-size:${fs}px">${chars.map((c, i) => `<span class="ch" data-i="${i}">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("")}</h1><div class="rule" id="${id}-rule"></div></div>`;
      const code = [
        `tl.fromTo("#${id} .ch",{yPercent:120,rotate:8},{yPercent:0,rotate:0,duration:.55,ease:"expo.out",stagger:${r3(Math.min(0.05, 0.3 / chars.length))}},${r3(t0 + 0.05)});`,
        `tl.fromTo("#${id}-rule",{scaleX:0},{scaleX:1,duration:.5,ease:"expo.inOut"},${r3(t0 + BEAT * 2)});`,
        `tl.fromTo("#${id}-tag",{opacity:0,y:20},{opacity:.7,y:0,duration:.4,ease:"power3.out"},${r3(t0 + BEAT * 2)});`,
        drift(id, t0, 0.06),
      ];
      return { html, code };
    },
    hook(sc, id, t0) {
      const words = (sc.words && sc.words.length ? sc.words : String(sc.text || "").split(/\s+/)).slice(0, 4).map(up);
      const lines = words;
      const fs = fitSize(lines, innerW, S.ratio, Math.round(H * (portrait ? 0.12 : 0.2)));
      const html = `<div class="cam stack">${words.map((w, i) => `<div class="mask"><div class="disp w" id="${id}-w${i}" style="font-size:${fs}px;${i === words.length - 1 ? `color:var(--accent)` : ""}">${esc(w)}</div></div>`).join("")}</div>`;
      const code = words.map((w, i) => `tl.fromTo("#${id}-w${i}",{yPercent:110,skewY:6},{yPercent:0,skewY:0,duration:.34,ease:"expo.out"},${r3(t0 + i * BEAT)});`);
      code.push(drift(id, t0, 0.05));
      return { html, code, hits: words.map((_, i) => ({ t: t0 + i * BEAT, sfx: "perc_snap", gain: 0.5 })) };
    },
    statement(sc, id, t0) {
      const text = sc.text || brief.headline || "";
      const maxC = portrait ? 12 : 18;
      const lines = wrap(clip(text, 64), maxC).slice(0, 4);
      const fs = fitSize(lines, innerW, S.ratio, Math.round(H * (portrait ? 0.1 : 0.15)));
      const accentWord = (sc.accent || "").toLowerCase();
      const html = `<div class="cam left">${sc.kicker ? kicker(id, sc.kicker) : ""}${lines.map((l, i) => `<div class="mask"><div class="disp ln" id="${id}-l${i}" style="font-size:${fs}px">${l.split(" ").map((w) => accentWord && w.toLowerCase().replace(/[^\w]/g, "") === accentWord.replace(/[^\w]/g, "") ? `<span class="hl" id="${id}-hl"><b></b><span>${esc(up(w))}</span></span>` : esc(up(w))).join(" ")}</div></div>`).join("")}</div>`;
      const code = [
        `tl.fromTo("#${id} .ln",{yPercent:112},{yPercent:0,duration:.5,ease:"expo.out",stagger:.07},${r3(t0 + 0.02)});`,
        sc.kicker ? kickerIn(id, t0) : "",
        accentWord ? `tl.fromTo("#${id}-hl b",{scaleX:0},{scaleX:1,duration:.4,ease:"expo.inOut"},${r3(t0 + BEAT * 2)});` : "",
        drift(id, t0, 0.035),
      ];
      return { html, code };
    },
    flashword(sc, id, t0) {
      const w = up(clip(sc.word || sc.text || brief.name, 14));
      const fs = Math.min(Math.round(H * (portrait ? 0.2 : 0.42)), Math.floor(innerW / (Math.max(3, w.length) * S.ratio)));
      const html = `<div class="field"></div><div class="cam center"><div class="disp fw" id="${id}-w" style="font-size:${fs}px;color:var(--onAccent)">${esc(w)}</div></div>`;
      const code = [
        `tl.fromTo("#${id}-w",{scale:1.35,rotate:-4,opacity:0},{scale:1,rotate:0,opacity:1,duration:.45,ease:"expo.out"},${r3(t0)});`,
        `tl.to("#${id}-w",{scale:.94,duration:${CUT},ease:"none"},${r3(t0 + 0.45)});`,
      ];
      return { html, code, hits: [{ t: t0, sfx: "boom", gain: 0.55 }] };
    },
    screen(sc, id, t0, idx) {
      const src = sc.src || shot(sc.shot ?? idx);
      const fw = portrait ? W * 0.9 : W * 0.74;
      const fh = fw * (portrait ? 1.25 : 0.6);
      const cap = sc.caption ? `<div class="cap disp" id="${id}-cap" style="font-size:${Math.round(u * (portrait ? 6 : 5.2))}px">${esc(up(clip(sc.caption, 34)))}</div>` : "";
      const body = src ? `<div class="shot" style="background-image:url('${src}')"></div>` : `<div class="shot ghost"><div class="gh1"></div><div class="gh2"></div><div class="gh3"></div></div>`;
      const page = `<div class="window-page" id="${id}-b">${body}<div class="glare" id="${id}-g"></div></div>`;
      const html = windowed() ? `<div class="cam center persp window-cam">${page}${cap}<div class="shared-anchor" id="${id}-anchor"><i></i></div></div>` : `<div class="cam center persp"><div class="browser" id="${id}-b" style="width:${Math.round(fw)}px;height:${Math.round(fh)}px"><div class="chrome"><i></i><i></i><i></i><span class="url mono">${esc(brief.domain || "")}</span></div>${body}<div class="glare" id="${id}-g"></div></div>${cap}<div class="shared-anchor" id="${id}-anchor"><i></i></div></div>`;
      const code = [
        `tl.fromTo("#${id}-b",{rotateX:22,rotateY:${portrait ? 0 : -8},y:${Math.round(H * 0.12)},scale:.86},{rotateX:4,rotateY:0,y:0,scale:1,duration:.9,ease:"expo.out"},${r3(t0)});`,
        `tl.to("#${id}-b",{rotateX:0,scale:1.04,duration:${CUT - 0.6},ease:"sine.inOut"},${r3(t0 + 0.9)});`,
        `tl.fromTo("#${id}-g",{xPercent:-120},{xPercent:140,duration:1.1,ease:"power2.inOut"},${r3(t0 + 0.25)});`,
        sc.caption ? `tl.fromTo("#${id}-cap",{opacity:0,y:30},{opacity:1,y:0,duration:.45,ease:"expo.out"},${r3(t0 + BEAT * 2)});` : "",
        `tl.fromTo("#${id}-anchor",{opacity:0,scale:.72},{opacity:1,scale:1,duration:.36,ease:"power2.out"},${r3(t0 + 0.12)});`,
      ];
      const interaction = interactionCode(sc, id, t0, "screen");
      return { html, code: [...code, ...interaction.code], hits: interaction.hits };
    },
    scroll(sc, id, t0, idx) {
      const src = sc.src || brief.fullpage || shot(sc.shot ?? idx);
      const fw = portrait ? W * 0.86 : W * 0.62;
      const fh = portrait ? H * 0.7 : H * 0.8;
      const body = src ? `<img class="tall" id="${id}-img" src="${src}" alt="">` : `<div class="shot ghost tallghost" id="${id}-img"><div class="gh1"></div><div class="gh2"></div><div class="gh3"></div><div class="gh2"></div><div class="gh3"></div></div>`;
      const page = `<div class="window-page" id="${id}-b"><div class="viewport">${body}</div></div>`;
      const html = windowed() ? `<div class="cam center window-cam">${page}<div class="shared-anchor" id="${id}-anchor"><i></i></div></div>` : `<div class="cam center"><div class="browser" id="${id}-b" style="width:${Math.round(fw)}px;height:${Math.round(fh)}px"><div class="chrome"><i></i><i></i><i></i><span class="url mono">${esc(brief.domain || "")}</span></div><div class="viewport">${body}</div></div><div class="shared-anchor" id="${id}-anchor"><i></i></div></div>`;
      const code = [
        `tl.fromTo("#${id}-b",{y:${Math.round(H * 0.3)},rotate:${portrait ? 0 : -2}},{y:0,rotate:0,duration:.6,ease:"expo.out"},${r3(t0)});`,
        `tl.fromTo("#${id}-img",{yPercent:0},{yPercent:-${portrait ? 45 : 55},duration:${CUT + 0.2},ease:"power2.inOut"},${r3(t0 + 0.1)});`,
        `tl.fromTo("#${id}-anchor",{opacity:0,scale:.72},{opacity:1,scale:1,duration:.36,ease:"power2.out"},${r3(t0 + 0.12)});`,
      ];
      const interaction = interactionCode(sc, id, t0, "scroll");
      return { html, code: [...code, ...interaction.code], hits: interaction.hits };
    },
    feature(sc, id, t0, idx) {
      const n = String((sc.ordinal ?? sc.index ?? idx) + 1).padStart(2, "0");
      const title = up(clip(sc.title || sc.text, 40));
      const lines = wrap(title, portrait ? 12 : 20).slice(0, 3);
      const fs = fitSize(lines, innerW * (portrait ? 1 : 0.78), S.ratio, Math.round(H * (portrait ? 0.085 : 0.12)));
      const numFs = Math.round(H * (portrait ? 0.22 : 0.42));
      const html = `<div class="cam left feat"><div class="num disp" id="${id}-n" style="font-size:${numFs}px">${n}</div><div class="ftext">${sc.kicker ? kicker(id, sc.kicker) : ""}${lines.map((l, i) => `<div class="mask"><div class="disp ln" style="font-size:${fs}px">${esc(l)}</div></div>`).join("")}${sc.sub ? `<p class="sub" id="${id}-s" style="font-size:${Math.round(u * 2.6)}px">${esc(clip(sc.sub, 80))}</p>` : ""}</div><div class="shared-anchor" id="${id}-anchor"><i></i></div></div>`;
      const code = [
        `tl.fromTo("#${id}-n",{yPercent:30,opacity:0},{yPercent:0,opacity:1,duration:.7,ease:"expo.out"},${r3(t0)});`,
        `tl.fromTo("#${id} .ln",{yPercent:112},{yPercent:0,duration:.5,ease:"expo.out",stagger:.07},${r3(t0 + BEAT * 0.5)});`,
        sc.kicker ? kickerIn(id, t0) : "",
        sc.sub ? `tl.fromTo("#${id}-s",{opacity:0,y:16},{opacity:1,y:0,duration:.45,ease:"power3.out"},${r3(t0 + BEAT * 2)});` : "",
        drift(id, t0, 0.03),
      ];
      return { html, code };
    },
    featureStack(sc, id, t0) {
      const items = (sc.items || brief.features || []).slice(0, 3).map((x) => up(clip(typeof x === "string" ? x : x.title, 26)));
      const fs = Math.round(Math.min(u * (portrait ? 6 : 6.2), innerW / (Math.max(8, ...items.map((s) => s.length)) * S.ratio * 0.72)));
      const html = `<div class="cam center"><div class="chips">${items.map((t, i) => `<div class="chip" id="${id}-c${i}" style="font-size:${fs}px"><span class="tick">✓</span>${esc(t)}</div>`).join("")}</div><div class="shared-anchor" id="${id}-anchor"><i></i></div></div>`;
      const code = items.map((_, i) => `tl.fromTo("#${id}-c${i}",{y:${Math.round(H * 0.18)},opacity:0,rotate:${i % 2 ? 3 : -3}},{y:0,opacity:1,rotate:0,duration:.42,ease:"back.out(1.6)"},${r3(t0 + i * BEAT)});`);
      code.push(drift(id, t0, 0.03));
      return { html, code, hits: items.map((_, i) => ({ t: t0 + i * BEAT, sfx: "pop_a", gain: 0.45 })) };
    },
    stat(sc, id, t0) {
      const raw = String(sc.value || "10x");
      const m = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
      const pre = m ? m[1] : "", num = m ? parseFloat(m[2].replace(/,/g, "")) : 0, post = m ? m[3] : raw;
      const dec = m && m[2].includes(".") ? (m[2].split(".")[1] || "").length : 0;
      const fs = Math.min(Math.round(H * (portrait ? 0.2 : 0.36)), Math.floor(innerW / (Math.max(3, raw.length) * S.ratio * 1.05)));
      const html = `<div class="cam center"><div class="disp statv" style="font-size:${fs}px"><span>${esc(pre)}</span><span id="${id}-v">${m ? (0).toFixed(dec) : esc(raw)}</span><span class="acc">${esc(post)}</span></div><div class="statl" id="${id}-l" style="font-size:${Math.round(u * 3.4)}px">${esc(up(clip(sc.label || "", 48)))}</div><div class="bar"><i id="${id}-bar"></i></div><div class="shared-anchor" id="${id}-anchor"><i></i></div></div>`;
      const code = [
        `tl.fromTo("#${id} .statv",{scale:.8,opacity:0},{scale:1,opacity:1,duration:.4,ease:"expo.out"},${r3(t0)});`,
        m ? `(function(){var o={v:0},el=document.getElementById("${id}-v");tl.fromTo(o,{v:0},{v:${num},duration:1.0,ease:"power3.out",onUpdate:function(){el.textContent=o.v.toLocaleString("en-US",{minimumFractionDigits:${dec},maximumFractionDigits:${dec}})}},${r3(t0 + 0.05)});})();` : "",
        `tl.fromTo("#${id}-bar",{scaleX:0},{scaleX:1,duration:1.0,ease:"power3.out"},${r3(t0 + 0.05)});`,
        `tl.fromTo("#${id}-l",{opacity:0,y:20},{opacity:1,y:0,duration:.4,ease:"power3.out"},${r3(t0 + BEAT * 2)});`,
        drift(id, t0, 0.03),
      ];
      const hits = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ t: t0 + 0.05 + k * 0.1, sfx: "ui_tick", gain: 0.25 - k * 0.02 }));
      return { html, code, hits };
    },
    quote(sc, id, t0) {
      const text = clip(sc.text || "", 90);
      const lines = wrap(text, portrait ? 18 : 30).slice(0, 4);
      const fs = fitSize(lines, innerW, 0.5, Math.round(H * (portrait ? 0.055 : 0.075)));
      const html = `<div class="cam left quote"><div class="qm disp" id="${id}-q">“</div>${lines.map((l) => `<div class="mask"><div class="ln qt" style="font-size:${fs}px">${esc(l)}</div></div>`).join("")}<div class="who mono" id="${id}-a">— ${esc(clip(sc.author || brief.name, 40))}</div></div>`;
      const code = [
        `tl.fromTo("#${id}-q",{scale:0,rotate:-20},{scale:1,rotate:0,duration:.5,ease:"back.out(2)"},${r3(t0)});`,
        `tl.fromTo("#${id} .ln",{yPercent:110},{yPercent:0,duration:.5,ease:"expo.out",stagger:.08},${r3(t0 + 0.1)});`,
        `tl.fromTo("#${id}-a",{opacity:0,x:-20},{opacity:.75,x:0,duration:.4,ease:"power3.out"},${r3(t0 + BEAT * 2.5)});`,
        drift(id, t0, 0.025),
      ];
      return { html, code };
    },
    logos(sc, id, t0) {
      const names = (sc.names || brief.logos || []).slice(0, 6);
      const cols = portrait ? 2 : 3;
      const html = `<div class="cam center"><div class="kick" id="${id}-k"><span class="dot"></span>${esc(sc.kicker || "Trusted by")}</div><div class="logos" style="grid-template-columns:repeat(${cols},1fr)">${names.map((n, i) => `<div class="lg" id="${id}-g${i}" style="font-size:${Math.round(u * (portrait ? 5.4 : 6))}px">${esc(clip(n, 16))}</div>`).join("")}</div></div>`;
      const code = [kickerIn(id, t0), `tl.fromTo("#${id} .lg",{opacity:0,y:30,scale:.9},{opacity:1,y:0,scale:1,duration:.4,ease:"expo.out",stagger:${r3(BEAT / 2)}},${r3(t0 + 0.05)});`, drift(id, t0, 0.03)];
      return { html, code };
    },
    marquee(sc, id, t0) {
      const text = up(clip(sc.text || brief.name, 24));
      const fs = Math.round(H * (portrait ? 0.09 : 0.16));
      const row = (k) => `<div class="mrow" id="${id}-r${k}" style="font-size:${fs}px">${Array(6).fill(`<span class="${k === 1 ? "solid" : "outline"}">${esc(text)}</span><span class="star">✦</span>`).join("")}</div>`;
      const html = `<div class="cam mq">${row(0)}${row(1)}${row(2)}</div>`;
      const code = [0, 1, 2].map((k) => `tl.fromTo("#${id}-r${k}",{xPercent:${k % 2 ? -30 : -5}},{xPercent:${k % 2 ? -5 : -30},duration:${CUT + 0.4},ease:"none"},${r3(t0 - 0.2)});`);
      code.push(`tl.fromTo("#${id} .mq",{rotate:-6,scale:1.2},{rotate:-4,scale:1.05,duration:${CUT},ease:"power2.out"},${r3(t0)});`);
      return { html, code };
    },
    split(sc, id, t0, idx) {
      const src = sc.src || shot(sc.shot ?? idx);
      const lines = wrap(up(clip(sc.text || brief.headline, 48)), portrait ? 14 : 12).slice(0, 4);
      const fs = fitSize(lines, portrait ? innerW : W * 0.36, S.ratio, Math.round(H * (portrait ? 0.07 : 0.1)));
      const html = `<div class="cam splitw ${portrait ? "col" : ""}"><div class="stext">${lines.map((l) => `<div class="mask"><div class="disp ln" style="font-size:${fs}px">${esc(l)}</div></div>`).join("")}</div><div class="sframe" id="${id}-f">${src ? `<div class="shot" style="background-image:url('${src}')"></div>` : `<div class="shot ghost"><div class="gh1"></div><div class="gh2"></div><div class="gh3"></div></div>`}</div><div class="shared-anchor" id="${id}-anchor"><i></i></div></div>`;
      const code = [
        `tl.fromTo("#${id} .ln",{yPercent:112},{yPercent:0,duration:.5,ease:"expo.out",stagger:.07},${r3(t0 + 0.02)});`,
        `tl.fromTo("#${id}-f",{clipPath:"inset(0% 0% 100% 0% round 24px)"},{clipPath:"inset(0% 0% 0% 0% round 24px)",duration:.6,ease:"expo.inOut"},${r3(t0 + 0.05)});`,
        `tl.fromTo("#${id}-f .shot",{scale:1.25},{scale:1.02,duration:${CUT + 0.3},ease:"power2.out"},${r3(t0 + 0.05)});`,
      ];
      return { html, code };
    },
    cta(sc, id, t0) {
      const line = up(clip(sc.text || "Try it free", 30));
      const lines = wrap(line, portrait ? 12 : 22).slice(0, 2);
      const fs = fitSize(lines, innerW, S.ratio, Math.round(H * (portrait ? 0.1 : 0.14)));
      const btn = clip(sc.button || "Get started", 22);
      const html = `<div class="cam center">${lines.map((l) => `<div class="mask"><div class="disp ln" style="font-size:${fs}px">${esc(l)}</div></div>`).join("")}<div class="btnwrap"><div class="btn" id="${id}-btn" style="font-size:${Math.round(u * 3.2)}px">${esc(btn)} <span class="arr">→</span><i class="rip" id="${id}-rip"></i></div><div class="url2 mono" style="font-size:${Math.round(u * 2.2)}px">${esc(brief.domain || "")}</div></div><svg class="cursor" id="${id}-cur" viewBox="0 0 24 24" width="${Math.round(u * 6)}" height="${Math.round(u * 6)}"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg></div>`;
      const code = [
        `tl.fromTo("#${id} .ln",{yPercent:112},{yPercent:0,duration:.5,ease:"expo.out",stagger:.07},${r3(t0)});`,
        `tl.fromTo("#${id}-btn",{scale:.6,opacity:0},{scale:1,opacity:1,duration:.45,ease:"back.out(1.8)"},${r3(t0 + BEAT)});`,
        `tl.fromTo("#${id}-cur",{x:${Math.round(W * 0.3)},y:${Math.round(H * 0.3)},opacity:0},{x:${Math.round(u * 2)},y:${Math.round(u * 2)},opacity:1,duration:.5,ease:"power3.inOut"},${r3(t0 + BEAT * 1.6)});`,
        `tl.to("#${id}-btn",{scale:.92,duration:.08,ease:"power2.in"},${r3(t0 + BEAT * 3)});`,
        `tl.to("#${id}-btn",{scale:1,duration:.4,ease:"elastic.out(1,.4)"},${r3(t0 + BEAT * 3 + 0.08)});`,
        `tl.fromTo("#${id}-rip",{scale:0,opacity:.7},{scale:3.5,opacity:0,duration:.6,ease:"power2.out"},${r3(t0 + BEAT * 3)});`,
      ];
      return { html, code, hits: [{ t: t0 + BEAT * 3, sfx: "mouse_click_b", gain: 0.7 }] };
    },
    endcard(sc, id, t0, idx, isLast, total) {
      const name = brief.name || "Snapmy.site";
      const logo = brief.logo;
      const fs = Math.min(Math.round(H * (portrait ? 0.1 : 0.14)), Math.floor(innerW / (name.length * S.ratio)));
      const la = brief.logoAspect || 0;
      const wordmark = logo && la >= 1.8;
      const tint = S.dark ? "brightness(0) invert(1)" : "brightness(0)";
      const mark = wordmark ? `<img class="logo wm" id="${id}-m" src="${logo}" alt="" style="height:${Math.round(Math.min(fs * 1.2, (innerW * 0.6) / la))}px;max-width:${Math.round(innerW * 0.6)}px;filter:${tint}">`
        : logo && la > 0 ? `<div class="plate" id="${id}-m" style="width:${Math.round(fs * 1.15)}px;height:${Math.round(fs * 1.15)}px"><img src="${logo}" alt=""></div>`
        : `<div class="mark" id="${id}-m" style="width:${Math.round(fs * 1.1)}px;height:${Math.round(fs * 1.1)}px;font-size:${Math.round(fs * 0.6)}px">${esc(name[0] || "C")}</div>`;
      const html = `<div class="cam center"><div class="lockup">${mark}<div class="disp nm" id="${id}-nm" style="font-size:${fs}px;${wordmark ? "display:none" : ""}">${esc(name)}</div></div><div class="tagl" id="${id}-t" style="font-size:${Math.round(u * 2.8)}px">${esc(clip(sc.text || brief.tagline || brief.domain, 60))}</div><div class="url2 mono" id="${id}-u" style="font-size:${Math.round(u * 2.2)}px">${esc(brief.domain || "")}</div><div class="sweep" id="${id}-sw"></div></div>`;
      const end = total;
      const code = [
        `tl.fromTo("#${id}-m",{scale:0,rotate:-30},{scale:1,rotate:0,duration:.6,ease:"back.out(1.7)"},${r3(t0)});`,
        `tl.fromTo("#${id}-nm",{scale:1.25,opacity:0,filter:"blur(12px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:.8,ease:"expo.out"},${r3(t0 + 0.08)});`,
        `tl.fromTo("#${id}-t",{opacity:0,y:18},{opacity:.85,y:0,duration:.5,ease:"power3.out"},${r3(t0 + BEAT * 2)});`,
        `tl.fromTo("#${id}-u",{opacity:0},{opacity:.6,duration:.5},${r3(t0 + BEAT * 2.5)});`,
        `tl.fromTo("#${id}-sw",{xPercent:-150},{xPercent:150,duration:1.2,ease:"power2.inOut"},${r3(t0 + 0.3)});`,
        `tl.to("#${id} .cam",{opacity:0,scale:.97,duration:.5,ease:"power2.in"},${r3(end - 0.5)});`,
      ];
      return { html, code, hits: [{ t: t0, sfx: "boom", gain: 0.9 }, { t: t0, sfx: "crash", gain: 0.35 }] };
    },
  };
}

/* ---------------- transition planner ---------------- */
function planTransitions(scenes, S, rand, motion = {}) {
  const out = [null];
  for (let i = 1; i < scenes.length; i++) {
    const prev = scenes[i - 1].type, cur = scenes[i].type;
    let k = motion.primary || S.primary;
    if (scenes[i].transition && ["whip", "zoom", "flash", "wipe", "iris", "push", "glitch", "blocks", "cut"].includes(scenes[i].transition)) k = scenes[i].transition;
    else if (cur === "flashword") k = "cut";
    else if (cur === "screen" && !scenes.slice(0, i).some((s) => s.type === "screen")) k = (motion.accents || S.accents).includes("flash") ? "flash" : "zoom"; // hero reveal: boldest
    else if (cur === "endcard") k = S.dark ? "zoom" : "iris";
    else if ((cur === "stat" || cur === "quote" || cur === "logos") && prev !== cur) k = "blocks";
    else if (rand.next() < 0.3) k = rand.pick((motion.accents || S.accents).filter((a) => a !== "blocks"));
    if (k === out[i - 1] && k !== (motion.primary || S.primary) && rand.next() < 0.7) k = motion.primary || S.primary;
    out.push(k);
  }
  return out;
}

function planWindowGroups(scenes) {
  const groups = [];
  for (let i = 0; i < scenes.length;) {
    if (!WINDOW_SCENE_TYPES.has(scenes[i].type)) { i++; continue; }
    const start = i;
    while (i + 1 < scenes.length && WINDOW_SCENE_TYPES.has(scenes[i + 1].type) && i - start < 3) i++;
    groups.push({ start, end: i });
    i++;
  }
  return groups;
}

function waypointFor(index, W, motion = {}) {
  const scale = W / 1920;
  const p = WINDOW_WAYPOINTS[index % WINDOW_WAYPOINTS.length];
  const pan = motion.pan || 1, depth = motion.depth || 1;
  const wave = index === 0 ? 0 : Math.sin(index * 1.7) * 28 * pan;
  const camera = motion.camera || "linear";
  const x = p[0] * pan + (camera === "orbit" ? wave : camera === "drift" ? wave * 0.45 : 0);
  const y = p[1] * pan + (camera === "orbit" ? Math.cos(index * 1.35) * 24 * pan : camera === "drift" ? wave * 0.35 : 0);
  const z = p[2] * depth;
  return {
    x: Math.round(x * scale), y: Math.round(y * scale), z: Math.round(z * scale),
    scale: (index % 3 === 1 ? 1.08 : index % 3 === 2 ? 1.03 : 1) * (camera === "snap" && index > 0 ? 1.02 : 1),
    rx: Math.round((index === 0 ? 0 : (index % 2 ? 1 : -1) * (motion.tilt || 0)) * 10) / 10,
    ry: Math.round((index === 0 ? 0 : (index % 3 - 1) * (motion.tilt || 0.4)) * 10) / 10,
  };
}

function anchorCode(previousId, nextId, t) {
  const at = r3(t - 0.24);
  return [
    `tl.fromTo("#${previousId}-anchor",{opacity:1,scale:1},{opacity:0,scale:1.65,duration:.28,ease:"power2.in"},${at});`,
    `tl.fromTo("#${nextId}-anchor",{opacity:0,scale:.58,filter:"blur(5px)"},{opacity:1,scale:1,filter:"blur(0px)",duration:.42,ease:"power2.out"},${at});`,
  ];
}

/* ---------------- plan fallback (no LLM) ---------------- */
export function fallbackPlan(brief, decisions = {}) {
  const f = (brief.features || []).map((x) => (typeof x === "string" ? { title: x } : x)).filter((x) => x.title);
  const stats = (brief.stats || []).filter((s) => s.value);
  const quotes = (brief.quotes || []).filter((q) => q.text);
  const hook = (decisions.hook || brief.hookCandidates?.[0] || brief.headline || brief.name).split(/\s+/).slice(0, 4);
  const S = [];
  S.push({ type: "coldopen", word: brief.name });
  S.push({ type: "hook", words: hook });
  S.push({ type: "statement", text: brief.description || brief.headline, kicker: "The problem", accent: "" });
  S.push({ type: "flashword", word: (brief.headline || brief.name).split(/\s+/).sort((a, b) => b.length - a.length)[0] });
  S.push({ type: "screen", shot: 0, caption: clip(brief.headline, 34) });
  f.slice(0, 2).forEach((x, i) => S.push({ type: "feature", title: x.title, sub: x.desc, index: i }));
  S.push({ type: "scroll", shot: 1 });
  if (f[2]) S.push({ type: "feature", title: f[2].title, sub: f[2].desc, index: 2 });
  if (f.length >= 3) S.push({ type: "featureStack", items: f.slice(3, 6).length === 3 ? f.slice(3, 6).map((x) => x.title) : f.slice(0, 3).map((x) => x.title) });
  stats.slice(0, 2).forEach((s) => S.push({ type: "stat", value: s.value, label: s.label }));
  if (quotes[0]) S.push({ type: "quote", text: quotes[0].text, author: quotes[0].author });
  if ((brief.logos || []).length >= 3) S.push({ type: "logos", names: brief.logos.slice(0, 6) });
  S.push({ type: "marquee", text: brief.name });
  S.push({ type: "split", shot: 2, text: brief.headline });
  S.push({ type: "cta", text: "Try it today", button: "Get started" });
  S.push({ type: "endcard", text: brief.headline });
  return { style: decisions.style || "kinetic", motionVariation: decisions.motionVariation || decisions.motion_variation || decisions.motion?.variation, scenes: S.slice(0, 24), panel: [] };
}

/* ---------------- main composer ---------------- */
export function compose(brief, plan, opts = {}) {
  const aspect = opts.aspect || "16:9";
  const [W, H] = ASPECTS[aspect] || ASPECTS["16:9"];
  const portrait = H > W * 1.05;
  const styleKey = STYLES[plan.style] ? plan.style : "kinetic";
  const S = STYLES[styleKey];
  const motion = resolveMotionVariation(plan.motionVariation || plan.motion_variation || plan.motion?.variation, brief, styleKey);
  const P = palette(brief, S);
  const rand = rng(hash((brief.domain || "") + styleKey + (opts.seed || 0)));
  const u = Math.min(W, H) / 100;
  let scenes = (plan.scenes || []).filter((s) => SCENE_TYPES.includes(s.type));
  if (!scenes.length) scenes = fallbackPlan(brief).scenes;
  if (scenes[scenes.length - 1].type !== "endcard") scenes.push({ type: "endcard" });
  { let k = 0; scenes = scenes.map((s) => (s.type === "feature" ? { ...s, ordinal: k++ } : s)); }
  const N = scenes.length;
  const duration = N * CUT + 0.6; // tail for the end card to breathe
  const ctx = { W, H, P, S, brief, u, portrait, dir: 1, motion };
  const B = sceneBuilders(ctx);
  const trans = planTransitions(scenes, S, rand, motion);
  const windowGroups = planWindowGroups(scenes);
  const windowGroupAt = new Map();
  windowGroups.forEach((g) => { for (let i = g.start; i <= g.end; i++) windowGroupAt.set(i, g); });
  const code = [];
  const cues = []; // for the score engine
  const sceneMeta = [];
  let html = "";
  const OV = 0.3; // overlap around each cut for transitions
  let windowGroupIndex = 0;
  scenes.forEach((sc, i) => {
    const id = `s${i}`; const t0 = i * CUT;
    const isLast = i === N - 1;
    const LEAD = { whip: 0.02, zoom: 0.04, flash: 0, wipe: 0.18, iris: 0.2, push: 0.2, glitch: 0.03, blocks: 0, cut: 0 };
    const group = windowGroupAt.get(i);

    if (group) {
      if (i !== group.start) return;
      const gid = `wg${windowGroupIndex++}`;
      const groupParts = [];
      const groupStart = group.start * CUT;
      const groupEnd = group.end === N - 1 ? duration : (group.end + 1) * CUT + OV;
      const fw = portrait ? W * 0.9 : W * 0.74;
      const fh = fw * (portrait ? 1.25 : 0.6);

      ctx.windowed = true;
      for (let j = group.start; j <= group.end; j++) {
        const member = scenes[j];
        const memberId = `s${j}`;
        const memberT = j * CUT;
        const built = B[member.type](member, memberId, memberT, j, j === N - 1, duration);
        const wp = waypointFor(j - group.start, W, motion);
        groupParts.push(`<div id="${memberId}" class="window-shot" style="--wx:${wp.x}px;--wy:${wp.y}px;--wz:${wp.z}px;--ws:${wp.scale};opacity:${j === group.start ? 1 : 0}"><div class="sc" id="${memberId}-sc">${built.html}</div></div>`);
        code.push(`// ${j} ${member.type} · persistent window`, ...built.code.filter(Boolean));
        (built.hits || []).forEach((h) => cues.push({ ...h, scene: j }));
        sceneMeta.push({ i: j, type: member.type, t: memberT, transition: j === group.start ? trans[j] : "camera", label: sceneLabel(member) });
        if (j > group.start) {
          code.push(...anchorCode(`s${j - 1}`, memberId, memberT));
          cues.push({ t: memberT, gain: 0.62, scene: j, transition: "camera", bridge: true });
        }
      }
      ctx.windowed = false;

      const start = group.start === 0 ? 0 : Math.max(0, groupStart - (LEAD[trans[group.start]] ?? 0));
      const rigId = windowGroupIndex === 1 ? "camera-rig" : `${gid}-camera-rig`;
      const shots = group.end - group.start + 1;
      html += `<section id="${gid}" class="clip window-group" data-window-shots="${shots}" data-start="${r3(start)}" data-duration="${r3(groupEnd - start)}" data-track-index="1" style="z-index:${10 + group.start}"><div class="window-rig camera-rig" id="${rigId}"><div class="browser" id="${gid}-browser" style="width:${Math.round(fw)}px;height:${Math.round(fh)}px"><div class="chrome"><i></i><i></i><i></i><span class="url mono">${esc(brief.domain || "")}</span><span class="window-count mono">${shots} beats</span></div><div class="window-stage"><div class="window-camera" id="${gid}-camera"><div class="window-world" id="${gid}-world">${groupParts.join("")}</div></div><div class="glare"></div></div></div></div></section>\n`;

      const first = waypointFor(0, W, motion);
      code.push(`tl.set("#${gid}-camera",{x:${-first.x},y:${-first.y},z:${first.z},rotationX:${first.rx},rotationY:${first.ry}},${r3(groupStart)});`);
      for (let j = group.start + 1; j <= group.end; j++) {
        const wp = waypointFor(j - group.start, W, motion);
        const moveAt = j * CUT - CUT;
        const revealAt = j * CUT - 0.28;
        // A linear master-camera segment preserves velocity at every internal boundary.
        code.push(`tl.to("#${gid}-camera",{x:${-wp.x},y:${-wp.y},z:${wp.z},rotationX:${wp.rx},rotationY:${wp.ry},duration:${CUT},ease:"none"},${r3(moveAt)});`);
        code.push(`tl.fromTo("#s${j}",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.28,ease:"power2.out"},${r3(revealAt)});`);
        code.push(`tl.to("#s${j - 1}",{opacity:0,duration:.24,ease:"power2.in"},${r3(revealAt + 0.05)});`);
      }
      if (group.end > group.start) {
        const last = waypointFor(group.end - group.start, W, motion);
        code.push(`tl.to("#${gid}-camera",{x:${-last.x},y:${-last.y},z:${last.z},rotationX:${last.rx},rotationY:${last.ry},duration:${motion.settle},ease:"power2.out"},${r3((group.end + 1) * CUT)});`);
      }
      if (group.start > 0) {
        ctx.dir = group.start % 2 ? 1 : -1;
        const k = trans[group.start];
        code.push(...transitionCode(k, `#s${group.start - 1}-sc`, `#s${group.start}-sc`, groupStart, ctx));
        if (TRANSITION_SFX[k]) cues.push({ t: groupStart - 0.12, sfx: TRANSITION_SFX[k], gain: 0.5, scene: group.start, transition: k });
      }
      return;
    }

    const start = i === 0 ? 0 : Math.max(0, t0 - (LEAD[trans[i]] ?? 0));
    const end = isLast ? duration : t0 + CUT + OV;
    ctx.windowed = false;
    const built = B[sc.type](sc, id, t0, i, isLast, duration);
    html += `<section id="${id}" class="clip scene t-${sc.type}" data-start="${r3(start)}" data-duration="${r3(end - start)}" data-track-index="${1 + (i % 2)}" style="z-index:${10 + i}"><div class="sc" id="${id}-sc"><div class="ground"></div>${built.html}</div></section>\n`;
    code.push(`// ${i} ${sc.type}`, ...built.code.filter(Boolean));
    (built.hits || []).forEach((h) => cues.push({ ...h, scene: i }));
    if (i > 0) {
      ctx.dir = i % 2 ? 1 : -1;
      const k = trans[i];
      code.push(...transitionCode(k, `#s${i - 1}-sc`, `#${id}-sc`, t0, ctx));
      if (TRANSITION_SFX[k]) cues.push({ t: t0 - 0.12, sfx: TRANSITION_SFX[k], gain: 0.5, scene: i, transition: k });
    }
    sceneMeta.push({ i, type: sc.type, t: t0, transition: trans[i], label: sceneLabel(sc) });
  });

  // film grain flicker (deterministic, 12 fps steps)
  const grainSteps = [];
  for (let t = 0; t < duration; t += 1 / 12) grainSteps.push(`tl.set("#fx-grain",{backgroundPosition:"${Math.floor(rand.next() * 200)}px ${Math.floor(rand.next() * 200)}px"},${r3(t)});`);
  // HUD progress
  const hud = S.hud ? `<div id="hud" class="clip" data-start="0" data-duration="${r3(duration)}" data-track-index="5"><div class="hud-in mono"><span class="rec"></span><span>${esc((brief.name || "").toUpperCase())}</span><span class="sp"></span><span id="hud-n">01/${String(N).padStart(2, "0")}</span></div><div class="hud-bar"><i id="hud-p"></i></div></div>` : "";
  const hudCode = S.hud ? [`tl.fromTo("#hud-p",{scaleX:0},{scaleX:1,duration:${r3(N * CUT)},ease:"none"},0);`, `(function(){var hp={v:0},el=document.getElementById("hud-n");tl.fromTo(hp,{v:0},{v:${N},duration:${r3(N * CUT)},ease:"none",onUpdate:function(){var k=Math.min(${N},Math.floor(hp.v)+1);el.textContent=(k<10?"0":"")+k+"/${String(N).padStart(2, "0")}"}},0);})();`, `tl.to("#hud",{opacity:0,duration:.4},${r3((N - 1) * CUT)});`] : [];

  const blocks = Array(7).fill("<i></i>").join("");
  const fontsHref = `https://fonts.googleapis.com/css2?family=${S.fonts}&display=block`;
  const audioTag = opts.audioSrc ? `<audio id="score" data-start="0" data-duration="${r3(duration)}" data-track-index="9" data-volume="1" src="${opts.audioSrc}"></audio>` : "";

  const css = buildCSS({ W, H, P, S, u, portrait, grain: S.grain, motion });
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${W}, height=${H}">
<title>${esc(brief.name || "Snapmy.site")} — launch film</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontsHref}">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>${css}</style>
</head>
<body>
<div id="root" data-composition-id="cue" data-start="0" data-duration="${r3(duration)}" data-width="${W}" data-height="${H}" data-fps="30">
<div id="bgl" class="clip" data-start="0" data-duration="${r3(duration)}" data-track-index="0"></div>
${html}
<div id="fx" class="clip" data-start="0" data-duration="${r3(duration)}" data-track-index="6"><div id="fx-blocks">${blocks}</div><div id="fx-glitch"></div><div id="fx-flash"></div><div id="fx-grain"></div><div id="fx-vig"></div></div>
${hud}
${audioTag}
</div>
<script>
(function(){
  var tl = gsap.timeline({ paused: true });
  ${code.join("\n  ")}
  ${hudCode.join("\n  ")}
  ${grainSteps.join("")}
  tl.set({}, {}, ${r3(duration)});
  window.__timelines = window.__timelines || {};
  window.__timelines["cue"] = tl;
})();
</script>
</body>
</html>`;
  return { html: doc, duration, width: W, height: H, cues, scenes: sceneMeta, style: styleKey, palette: P, bpm: 160, soundProfile: motion.soundProfile };
}

function sceneLabel(sc) {
  return String(sc.word || (sc.words || []).join(" ") || sc.text || sc.title || sc.caption || sc.value || sc.type || "").slice(0, 40);
}

function buildCSS({ W, H, P, S, u, portrait, grain, motion = {} }) {
  const noise = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1.4 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);
  const scan = "repeating-linear-gradient(0deg, rgba(255,0,90,.5) 0 3px, transparent 3px 11px, rgba(0,220,255,.45) 11px 13px, transparent 13px 29px)";
  const effect = motion.effect || "clean";
  const stageFilter = effect === "soft" || effect === "paper" ? "saturate(.92) contrast(.98)" : effect === "chromatic" ? "saturate(1.12) contrast(1.04)" : "none";
  const stageOverlay = effect === "scan" ? `background-image:${scan};opacity:.055;` : effect === "glow" ? `background:radial-gradient(circle at 65% 42%, ${P.field}22, transparent 48%);opacity:.65;` : effect === "glass" ? `background:linear-gradient(115deg, transparent 35%, rgba(255,255,255,.12) 50%, transparent 65%);opacity:.48;` : "opacity:0;";
  return `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${P.bg}}
#root{position:relative;width:100%;height:100%;overflow:hidden;color:${P.fg};font-family:"${S.body}",system-ui,sans-serif;
  --accent:${P.accent};--field:${P.field};--onAccent:${P.onAccent};--fg:${P.fg};--bg:${P.bg};--surface:${P.surface};--muted:${P.muted};--second:${P.second}}
#bgl{position:absolute;inset:0;background:radial-gradient(120% 90% at 20% 0%, ${S.dark ? mix(P.bg, P.field, 0.16) : mix(P.bg, P.field, 0.1)} 0%, ${P.bg} 60%)}
.scene{position:absolute;inset:0;overflow:hidden}
.sc{position:absolute;inset:0;will-change:transform,filter}
.window-group{position:absolute;inset:0;overflow:hidden}
.window-rig{position:absolute;inset:0;display:grid;place-items:center;perspective:${Math.round(W * 1.4)}px;transform-style:preserve-3d;will-change:transform}
.window-rig .browser{transform-style:preserve-3d}
.window-stage{position:absolute;left:0;right:0;top:${Math.round(u * 4.4)}px;bottom:0;overflow:hidden;background:var(--surface);transform-style:preserve-3d;filter:${stageFilter}}
.window-stage:after{content:"";position:absolute;inset:0;pointer-events:none;${stageOverlay}}
.window-camera,.window-world{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}
.window-shot{position:absolute;inset:0;transform:translate3d(var(--wx),var(--wy),var(--wz)) scale(var(--ws));transform-origin:50% 50%;transform-style:preserve-3d;will-change:transform,opacity}
.window-shot .sc{overflow:hidden}
.window-page{position:absolute;inset:0;overflow:hidden;background:var(--surface);border-radius:${Math.round(u * 0.6)}px}
.window-page .shot{top:0}
.window-page .viewport{top:0}
.window-count{margin-left:auto;font-size:${Math.round(u * 1.35)}px;color:var(--muted);opacity:.65}
.ground{position:absolute;inset:0;background:radial-gradient(110% 80% at 70% 110%, ${mix(P.bg, P.field, S.dark ? 0.2 : 0.12)} 0%, ${P.bg} 58%)}
.cam{position:absolute;inset:0;display:flex;flex-direction:column;padding:0 ${Math.round(W * (portrait ? 0.08 : 0.075))}px}
.center{align-items:center;justify-content:center;text-align:center}
.left{align-items:flex-start;justify-content:center;text-align:left}
.stack{align-items:flex-start;justify-content:center;gap:${Math.round(u * 0.2)}px}
.persp{perspective:${Math.round(W * 1.4)}px}
.window-cam{padding:0 ${Math.round(W * (portrait ? 0.05 : 0.055))}px}
.disp{font-family:"${S.display}",serif;font-weight:${S.dw};letter-spacing:${S.track}em;line-height:.92;${S.upper ? "text-transform:uppercase;" : ""}}
.mono{font-family:"${S.mono}",monospace}
.tiny{font-size:${Math.round(u * 1.9)}px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:${Math.round(u * 2)}px;opacity:.7}
.mask{overflow:hidden;padding:0 .04em .06em;margin-bottom:-.06em}
.mask>*{display:block}
.ch{display:inline-block}
.rule{width:${Math.round(u * 14)}px;height:${Math.max(3, Math.round(u * 0.5))}px;background:var(--accent);margin-top:${Math.round(u * 3)}px;transform-origin:0 50%}
.kick{display:flex;align-items:center;gap:${Math.round(u)}px;font-family:"${S.mono}",monospace;font-size:${Math.round(u * 2)}px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:${Math.round(u * 2.4)}px}
.kick .dot{width:${Math.round(u * 1.1)}px;height:${Math.round(u * 1.1)}px;border-radius:50%;background:var(--accent)}
.hl{position:relative;display:inline-block;padding:0 .08em}
.hl b{position:absolute;left:0;right:0;bottom:.08em;height:.36em;background:var(--accent);opacity:${S.dark ? 0.85 : 0.9};transform-origin:0 50%;z-index:0}
.hl span{position:relative;z-index:1;${S.dark ? "" : "color:var(--fg)"}}
.field{position:absolute;inset:0;background:var(--field)}
.fw{line-height:.85}
.browser{position:relative;border-radius:${Math.round(u * 1.6)}px;overflow:hidden;background:var(--surface);box-shadow:0 ${Math.round(u * 4)}px ${Math.round(u * 10)}px rgba(0,0,0,${S.dark ? 0.55 : 0.22}),0 0 0 1px rgba(${S.dark ? "255,255,255" : "0,0,0"},.08);transform-style:preserve-3d}
.chrome{height:${Math.round(u * 4.4)}px;display:flex;align-items:center;gap:${Math.round(u * 0.8)}px;padding:0 ${Math.round(u * 1.8)}px;background:${S.dark ? "#1b1b1d" : "#ecebe7"};border-bottom:1px solid rgba(${S.dark ? "255,255,255" : "0,0,0"},.07)}
.chrome i{width:${Math.round(u * 1.2)}px;height:${Math.round(u * 1.2)}px;border-radius:50%;background:${S.dark ? "#3a3a3d" : "#c9c6bf"}}
.chrome .url{margin-left:${Math.round(u * 2)}px;font-size:${Math.round(u * 1.6)}px;color:var(--muted);background:${S.dark ? "#262629" : "#fff"};padding:${Math.round(u * 0.5)}px ${Math.round(u * 2)}px;border-radius:99px;flex:0 1 auto}
.shot{position:absolute;left:0;right:0;top:${Math.round(u * 4.4)}px;bottom:0;background-size:cover;background-position:top center}
.ghost{background:linear-gradient(135deg,var(--surface),${mix(P.surface, P.field, 0.25)});padding:${Math.round(u * 5)}px;display:flex;flex-direction:column;gap:${Math.round(u * 2)}px}
.ghost div{border-radius:${Math.round(u)}px;background:rgba(${S.dark ? "255,255,255" : "0,0,0"},.08)}
.gh1{height:18%;width:60%;background:var(--accent)!important;opacity:.8}.gh2{height:10%;width:85%}.gh3{height:30%;width:100%}
.glare{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.22) 50%,transparent 65%);pointer-events:none}
.shared-anchor{position:absolute;right:${Math.round(u * 7)}px;bottom:${Math.round(u * 6)}px;width:${Math.round(u * 13)}px;height:${Math.round(u * 8)}px;border:2px solid var(--accent);border-radius:${Math.round(u * 1.2)}px;opacity:0;pointer-events:none;box-shadow:0 0 ${Math.round(u * 2.5)}px ${P.field}66;transform-origin:50% 50%}
.shared-anchor:before{content:"";position:absolute;inset:-${Math.round(u * 0.7)}px;border:1px solid ${P.field}55;border-radius:inherit}
.shared-anchor i{position:absolute;right:${Math.round(u * 1.2)}px;top:${Math.round(u * 1.2)}px;width:${Math.round(u * 1.1)}px;height:${Math.round(u * 1.1)}px;border-radius:50%;background:var(--accent);box-shadow:0 0 ${Math.round(u * 1.8)}px var(--accent)}
.cap{margin-top:${Math.round(u * 3.5)}px}
.viewport{position:absolute;left:0;right:0;top:${Math.round(u * 4.4)}px;bottom:0;overflow:hidden}
.tall{display:block;width:100%;height:auto}
.tallghost{position:relative!important;top:0!important;height:260%!important}
.feat{flex-direction:${portrait ? "column" : "row"};align-items:${portrait ? "flex-start" : "center"};justify-content:${portrait ? "center" : "flex-start"};gap:${Math.round(u * 4)}px}
.num{color:transparent;-webkit-text-stroke:${Math.max(2, Math.round(u * 0.25))}px var(--accent);line-height:.8;${S.upper ? "" : ""}}
.ftext{display:flex;flex-direction:column;align-items:flex-start}
.sub{margin-top:${Math.round(u * 2.2)}px;color:var(--muted);max-width:${Math.round(W * 0.5)}px;line-height:1.35;font-weight:500}
.chips{display:flex;flex-direction:column;gap:${Math.round(u * 2.2)}px;align-items:center}
.chip{display:flex;align-items:center;gap:${Math.round(u * 1.6)}px;padding:${Math.round(u * 1.6)}px ${Math.round(u * 3.2)}px;border-radius:99px;background:var(--surface);border:1px solid rgba(${S.dark ? "255,255,255" : "0,0,0"},.1);font-family:"${S.display}",sans-serif;font-weight:${Math.min(S.dw, 700)};letter-spacing:-.02em;${S.upper ? "text-transform:uppercase;" : ""}box-shadow:0 ${Math.round(u)}px ${Math.round(u * 4)}px rgba(0,0,0,${S.dark ? 0.4 : 0.1})}
.chip:nth-child(2){background:var(--field);color:var(--onAccent);border-color:transparent}
.tick{display:inline-grid;place-items:center;width:1.2em;height:1.2em;border-radius:50%;background:var(--accent);color:var(--onAccent);font-size:.6em}
.chip:nth-child(2) .tick{background:var(--onAccent);color:var(--field)}
.statv{display:flex;align-items:baseline;line-height:.9;font-variant-numeric:tabular-nums}
.statv .acc{color:var(--accent)}
.statl{margin-top:${Math.round(u * 2)}px;font-family:"${S.mono}",monospace;letter-spacing:.08em;color:var(--fg);opacity:.72}
.bar{width:${Math.round(W * (portrait ? 0.6 : 0.36))}px;height:${Math.max(3, Math.round(u * 0.45))}px;background:rgba(${S.dark ? "255,255,255" : "0,0,0"},.1);margin-top:${Math.round(u * 3)}px;border-radius:9px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--accent);transform-origin:0 50%}
.quote .qm{font-size:${Math.round(u * 22)}px;line-height:.6;color:var(--accent);height:${Math.round(u * 10)}px}
.qt{font-family:"${S.display}",serif;font-weight:${S.dw === 400 ? 400 : 600};letter-spacing:-.02em;line-height:1.08}
.who{margin-top:${Math.round(u * 3)}px;font-size:${Math.round(u * 2)}px;letter-spacing:.12em;text-transform:uppercase}
.logos{display:grid;gap:${Math.round(u * 2)}px ${Math.round(u * 5)}px;margin-top:${Math.round(u * 2)}px}
.lg{font-family:"${S.display}",sans-serif;font-weight:${Math.min(S.dw, 700)};letter-spacing:-.02em;opacity:.9;padding:${Math.round(u * 1.5)}px ${Math.round(u * 2)}px;border-top:1px solid rgba(${S.dark ? "255,255,255" : "0,0,0"},.14);text-align:left;min-width:${Math.round(u * 20)}px}
.mq{justify-content:center;gap:${Math.round(u * 1)}px;padding:0;left:-20%;right:-20%}
.mrow{display:flex;white-space:nowrap;gap:.3em;font-family:"${S.display}",sans-serif;font-weight:${S.dw};letter-spacing:${S.track}em;${S.upper ? "text-transform:uppercase;" : ""}line-height:1}
.mrow .outline{color:transparent;-webkit-text-stroke:${Math.max(2, Math.round(u * 0.2))}px var(--fg);opacity:.5}
.mrow .solid{color:var(--accent)}
.mrow .star{color:var(--accent);font-size:.5em;align-self:center}
.splitw{flex-direction:row;align-items:center;justify-content:space-between;gap:${Math.round(u * 4)}px}
.splitw.col{flex-direction:column;justify-content:center}
.stext{flex:0 0 ${portrait ? "auto" : "40%"}}
.sframe{position:relative;flex:1;height:${portrait ? "46%" : "72%"};width:${portrait ? "100%" : "auto"};border-radius:${Math.round(u * 2.4)}px;overflow:hidden;box-shadow:0 ${Math.round(u * 3)}px ${Math.round(u * 8)}px rgba(0,0,0,.35)}
.sframe .shot{top:0}
.btnwrap{display:flex;flex-direction:column;align-items:center;gap:${Math.round(u * 1.6)}px;margin-top:${Math.round(u * 4)}px;position:relative}
.btn{position:relative;overflow:visible;display:inline-flex;align-items:center;gap:.5em;padding:.7em 1.5em;border-radius:99px;background:var(--field);color:var(--onAccent);font-weight:700;letter-spacing:-.01em;box-shadow:0 ${Math.round(u)}px ${Math.round(u * 4)}px ${P.field}66}
.rip{position:absolute;left:50%;top:50%;width:${Math.round(u * 8)}px;height:${Math.round(u * 8)}px;margin:-${Math.round(u * 4)}px 0 0 -${Math.round(u * 4)}px;border-radius:50%;border:${Math.max(2, Math.round(u * 0.3))}px solid var(--accent);opacity:0}
.url2{color:var(--muted);letter-spacing:.08em}
.cursor{position:absolute;left:50%;top:${portrait ? "58%" : "66%"};filter:drop-shadow(0 4px 8px rgba(0,0,0,.4))}
.lockup{display:flex;align-items:center;gap:${Math.round(u * 2.6)}px}
.mark{display:grid;place-items:center;border-radius:28%;background:var(--field);color:var(--onAccent);font-family:"${S.display}",sans-serif;font-weight:800}
.logo{object-fit:contain}
.plate{display:grid;place-items:center;border-radius:24%;background:#fff;padding:14%;box-shadow:0 ${Math.round(u)}px ${Math.round(u * 4)}px rgba(0,0,0,.25)}
.plate img{width:100%;height:100%;object-fit:contain}
.nm{line-height:1}
.tagl{margin-top:${Math.round(u * 2.4)}px;color:var(--muted);max-width:${Math.round(W * 0.7)}px;line-height:1.3;font-weight:500}
.sweep{position:absolute;inset:0;background:linear-gradient(100deg,transparent 40%,${S.dark ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.5)"} 50%,transparent 60%);pointer-events:none}
#fx{position:absolute;inset:0;pointer-events:none;z-index:500}
#fx-blocks{position:absolute;inset:0;display:flex}
#fx-blocks i{flex:1;background:var(--field);transform:scaleY(0)}
#fx-blocks i:nth-child(even){background:${mix(P.field, S.dark ? "#000000" : "#ffffff", 0.2)}}
#fx-glitch{position:absolute;inset:0;background:${scan};mix-blend-mode:screen;opacity:0}
#fx-flash{position:absolute;inset:0;background:#fff;opacity:0}
#fx-grain{position:absolute;inset:-50px;background-image:url("${noise}");opacity:${Math.max(grain, motion.grain || 0)};mix-blend-mode:${S.dark ? "overlay" : "multiply"}}
#fx-vig{position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${S.dark ? 0.45 : 0.14}) 100%)}
#hud{position:absolute;left:0;right:0;top:0;z-index:600;pointer-events:none}
.hud-in{display:flex;align-items:center;gap:${Math.round(u * 1.2)}px;padding:${Math.round(u * 3)}px ${Math.round(W * 0.04)}px 0;font-size:${Math.round(u * 1.5)}px;letter-spacing:.2em;color:${P.fg};opacity:.55}
.hud-in .sp{flex:1}
.rec{width:${Math.round(u * 0.9)}px;height:${Math.round(u * 0.9)}px;border-radius:50%;background:var(--accent)}
.hud-bar{position:absolute;left:${Math.round(W * 0.04)}px;right:${Math.round(W * 0.04)}px;top:${Math.round(u * 6.2)}px;height:2px;background:rgba(${S.dark ? "255,255,255" : "0,0,0"},.1)}
.hud-bar i{display:block;height:100%;background:var(--accent);transform-origin:0 50%}
`;
}
