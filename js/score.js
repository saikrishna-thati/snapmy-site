// Cue score engine — an original, beat-synced score + sound design, rendered offline to WAV.
// 160 BPM, one bar (4 beats) = 1.5 s = one shot. Every cut lands on a downbeat.
import { CUT, BEAT } from "./composer.js";

const SR = 44100;
const KITS = {
  kinetic: { kick: "kick_909", snare: "snare_punch", hat: "hat_closed", open: "hat_open_short", clap: "clap_fat", key: 57, prog: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]], groove: "four", wave: "sawtooth", arp: "square" },
  editorial: { kick: "kick_soft", snare: "snare_lofi", hat: "shaker", open: "hat_clean", clap: "perc_snap", key: 62, prog: [[0, 4, 7, 11], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 5]], groove: "half", wave: "triangle", arp: "triangle" },
  neon: { kick: "kick_tech", snare: "snare_dnb", hat: "hat_clean", open: "hat_open", clap: "clap_dance", key: 54, prog: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]], groove: "break", wave: "sawtooth", arp: "sawtooth" },
  pop: { kick: "kick_house", snare: "clap_dance", hat: "hat_open_short", open: "hat_open", clap: "clap_dance", key: 60, prog: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], groove: "four", wave: "square", arp: "triangle" },
  mono: { kick: "kick_sub", snare: "snare_909", hat: "hat_clean", open: "hat_open_short", clap: "perc_snap", key: 52, prog: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]], groove: "half", wave: "sawtooth", arp: "triangle" },
};
const SOUND_FAMILIES = [
  { key: "air", label: "Air", bridgeSample: "swoosh_air", clickSfx: "mouse_click_b", impactSample: "sub_drop", sfxGain: 0.82, drumGain: 0.88, musicGain: 0.6, reverb: 0.3, bridgeRate: 1.1, filterStart: 520, filterEnd: 8200 },
  { key: "glass", label: "Glass", bridgeSample: "rev_glass", clickSfx: "glass_a", impactSample: "boom", sfxGain: 0.76, drumGain: 0.84, musicGain: 0.58, reverb: 0.44, bridgeRate: 1.04, filterStart: 780, filterEnd: 9800 },
  { key: "sub", label: "Sub", bridgeSample: "swoosh_low", clickSfx: "mouse_down", impactSample: "sub_drop", sfxGain: 0.7, drumGain: 1.02, musicGain: 0.52, reverb: 0.22, bridgeRate: 0.86, filterStart: 260, filterEnd: 4200 },
  { key: "tape", label: "Tape", bridgeSample: "rewind", clickSfx: "mouse_up", impactSample: "braam", sfxGain: 0.72, drumGain: 0.82, musicGain: 0.64, reverb: 0.5, bridgeRate: 0.92, filterStart: 420, filterEnd: 5600 },
  { key: "pulse", label: "Pulse", bridgeSample: "swoosh_mid", clickSfx: "ui_click", impactSample: "kick_808", sfxGain: 0.88, drumGain: 0.96, musicGain: 0.56, reverb: 0.28, bridgeRate: 1.18, filterStart: 640, filterEnd: 10500 },
  { key: "wood", label: "Wood", bridgeSample: "swoosh_low", clickSfx: "perc_snap", impactSample: "taiko_lo", sfxGain: 0.8, drumGain: 0.9, musicGain: 0.58, reverb: 0.34, bridgeRate: 0.98, filterStart: 340, filterEnd: 6400 },
  { key: "rubber", label: "Rubber", bridgeSample: "swoosh_fast", clickSfx: "pop_a", impactSample: "drop_pop", sfxGain: 0.9, drumGain: 0.9, musicGain: 0.57, reverb: 0.26, bridgeRate: 1.24, filterStart: 900, filterEnd: 11200 },
  { key: "digital", label: "Digital", bridgeSample: "glitch", clickSfx: "ui_tick", impactSample: "glitch", sfxGain: 0.78, drumGain: 0.86, musicGain: 0.62, reverb: 0.2, bridgeRate: 1.32, filterStart: 1100, filterEnd: 12500 },
  { key: "room", label: "Room", bridgeSample: "swoosh_mid", clickSfx: "mouse_rel_b", impactSample: "crash", sfxGain: 0.68, drumGain: 0.8, musicGain: 0.68, reverb: 0.62, bridgeRate: 0.9, filterStart: 460, filterEnd: 7000 },
  { key: "bright", label: "Bright", bridgeSample: "swoosh_air", clickSfx: "confirm", impactSample: "crash", sfxGain: 0.86, drumGain: 0.92, musicGain: 0.6, reverb: 0.36, bridgeRate: 1.28, filterStart: 1000, filterEnd: 11800 },
];
export const SOUND_VARIATIONS = Object.fromEntries(Array.from({ length: 50 }, (_, index) => {
  const family = SOUND_FAMILIES[index % SOUND_FAMILIES.length];
  const variant = Math.floor(index / SOUND_FAMILIES.length);
  return [`snd${String(index + 1).padStart(3, "0")}`, {
    id: `snd${String(index + 1).padStart(3, "0")}`,
    label: `${family.label} ${String(variant + 1).padStart(2, "0")}`,
    bridgeSample: family.bridgeSample,
    clickSfx: family.clickSfx,
    impactSample: family.impactSample,
    sfxGain: family.sfxGain + variant * 0.018,
    drumGain: family.drumGain + (variant % 3) * 0.035,
    musicGain: family.musicGain + (variant % 4) * 0.018,
    reverb: Math.min(0.72, family.reverb + variant * 0.025),
    bridgeRate: family.bridgeRate + variant * 0.025,
    filterStart: family.filterStart + variant * 45,
    filterEnd: family.filterEnd + variant * 260,
  }];
}));
function resolveSoundProfile(value) {
  if (typeof value === "string" && SOUND_VARIATIONS[value]) return SOUND_VARIATIONS[value];
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 50) return SOUND_VARIATIONS[`snd${String(n).padStart(3, "0")}`];
  return SOUND_VARIATIONS.snd001;
}
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const cache = new Map();

async function loadSample(ctx, base, name) {
  if (!name) return null;
  const key = base + name;
  if (!cache.has(key)) cache.set(key, fetch(base + name + ".mp3").then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status))).catch(() => null));
  const ab = await cache.get(key);
  if (!ab) return null;
  try { return await ctx.decodeAudioData(ab.slice(0)); } catch { return null; }
}

function impulse(ctx, secs = 2.4, decay = 3.2) {
  const len = Math.floor(SR * secs); const b = ctx.createBuffer(2, len, SR);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let s = 1234 + c * 999; for (let i = 0; i < len; i++) { s = (s * 16807) % 2147483647; d[i] = ((s / 2147483647) * 2 - 1) * Math.pow(1 - i / len, decay); } }
  return b;
}

export async function renderScore({ scenes, cues, duration, style = "kinetic", energy = 1.5, base = "./audio/", soundProfile = "snd001" }) {
  const K = KITS[style] || KITS.kinetic;
  const V = resolveSoundProfile(soundProfile);
  const len = Math.ceil((duration + 1.2) * SR);
  const ctx = new OfflineAudioContext(2, len, SR);
  const names = new Set([K.kick, K.snare, K.hat, K.open, K.clap, "riser", "boom", "crash", "sub_drop", "braam", "rev_glass", "swoosh_air", "swoosh_mid", "swoosh_low", "swoosh_fast", "hat_closed", V.bridgeSample, V.clickSfx, V.impactSample, ...cues.map((c) => c.sfx).filter(Boolean)]);
  const S = {}; await Promise.all([...names].map(async (n) => (S[n] = await loadSample(ctx, base, n))));

  // buses
  const master = ctx.createDynamicsCompressor(); master.threshold.value = -16; master.knee.value = 8; master.ratio.value = 4; master.attack.value = 0.004; master.release.value = 0.18;
  const out = ctx.createGain(); out.gain.value = 0.9; master.connect(out); out.connect(ctx.destination);
  const verb = ctx.createConvolver(); verb.buffer = impulse(ctx); const verbRet = ctx.createGain(); verbRet.gain.value = 0.28; verb.connect(verbRet); verbRet.connect(master);
  const drums = ctx.createGain(); drums.gain.value = V.drumGain; drums.connect(master);
  const music = ctx.createGain(); music.gain.value = V.musicGain; music.connect(master); // side-chained
  const sfx = ctx.createGain(); sfx.gain.value = V.sfxGain; sfx.connect(master);
  const sfxVerb = ctx.createGain(); sfxVerb.gain.value = V.reverb; sfxVerb.connect(verb);
  const delay = ctx.createDelay(1); delay.delayTime.value = BEAT * 0.75; const fb = ctx.createGain(); fb.gain.value = 0.32; const dlp = ctx.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 3200;
  delay.connect(dlp); dlp.connect(fb); fb.connect(delay); const dRet = ctx.createGain(); dRet.gain.value = 0.3; dlp.connect(dRet); dRet.connect(music);

  const hit = (name, t, gain = 1, dest = drums, rate = 1) => { const b = S[name]; if (!b || t < 0) return; const s = ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = rate; const g = ctx.createGain(); g.gain.value = gain; s.connect(g); g.connect(dest); s.start(t); };
  const bridge = (at, gain = 0.5) => {
    const b = S[V.bridgeSample] || S.swoosh_air || S.swoosh_mid || S.riser;
    if (!b || at < 0) return;
    const start = Math.max(0, at - 0.4), end = Math.min(duration + 0.08, at + 0.08);
    const source = ctx.createBufferSource(); source.buffer = b;
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.Q.value = 1.4;
    const amp = ctx.createGain();
    source.playbackRate.setValueAtTime(V.bridgeRate * 0.72, start); source.playbackRate.linearRampToValueAtTime(V.bridgeRate, at);
    filter.frequency.setValueAtTime(V.filterStart, start); filter.frequency.exponentialRampToValueAtTime(V.filterEnd, at);
    amp.gain.setValueAtTime(0.001, start); amp.gain.linearRampToValueAtTime(gain, Math.max(start + 0.02, at - 0.035)); amp.gain.exponentialRampToValueAtTime(0.001, end);
    source.connect(filter); filter.connect(amp); amp.connect(sfx);
    const offset = b === S.riser ? Math.max(0, b.duration - 0.42) : 0;
    source.start(start, offset, Math.min(b.duration - offset, end - start + 0.05));
    hit(V.impactSample, at, gain * 0.48, drums, V.bridgeRate);
  };

  const N = scenes.length;
  const types = scenes.map((s) => s.type);
  let drop = types.findIndex((t, i) => i >= 2 && (t === "screen" || t === "scroll" || t === "split"));
  if (drop < 0) drop = Math.min(4, N - 2);
  const ctaIdx = types.lastIndexOf("cta");
  const endIdx = N - 1;
  const breakdown = new Set(); types.forEach((t, i) => { if (i > drop + 1 && (t === "quote") && i < ctaIdx) breakdown.add(i); });
  const section = (i) => (i === endIdx ? "end" : i < drop ? (i < 1 ? "intro" : "build") : breakdown.has(i) ? "break" : i === ctaIdx - 1 && ctaIdx > drop + 2 ? "prelift" : "full");

  // --- drums ---
  const E = Math.max(0, Math.min(3, energy));
  for (let i = 0; i < N; i++) {
    const t0 = i * CUT, sec = section(i);
    const kicks = []; // for side-chain
    if (sec === "intro") { hit("sub_drop", t0, 0.7); hit(K.hat, t0 + BEAT * 2, 0.25); hit(K.hat, t0 + BEAT * 3, 0.3); continue; }
    if (sec === "end") { hit("boom", t0, 0.95); hit("crash", t0, 0.5); hit("rev_glass", t0 + CUT * 0.5, 0.25, sfxVerb); continue; }
    const full = sec === "full" || sec === "prelift";
    for (let b = 0; b < 4; b++) {
      const tb = t0 + b * BEAT;
      // kick
      if (sec === "build") { if (b === 0 || (b === 2 && i > 1)) { hit(K.kick, tb, 0.85); kicks.push(tb); } }
      else if (full) {
        if (K.groove === "four") { hit(K.kick, tb, 0.95); kicks.push(tb); }
        else if (K.groove === "half") { if (b === 0 || b === 2 && E > 1.2) { hit(K.kick, tb, 0.95); kicks.push(tb); } if (b === 1 && E > 2) { hit(K.kick, tb + BEAT / 2, 0.6); } }
        else { if (b === 0) { hit(K.kick, tb, 1); kicks.push(tb); } if (b === 2) { hit(K.kick, tb + BEAT / 2, 0.8); kicks.push(tb + BEAT / 2); } }
        if (b === 1 || b === 3) hit(K.snare, tb, K.groove === "half" && b === 1 ? 0 : 0.7);
        if (K.groove === "half" && b === 2) hit(K.snare, tb, 0.7);
        if (E > 1.8 && (b === 1 || b === 3)) hit(K.clap, tb, 0.35);
      }
      // hats
      if (sec !== "break") {
        hit(K.hat, tb + BEAT / 2, full ? 0.42 : 0.3);
        if (full && E > 1) hit(K.hat, tb, 0.22);
        if (full && E > 2.2) { hit(K.hat, tb + BEAT / 4, 0.14); hit(K.hat, tb + (3 * BEAT) / 4, 0.14); }
      } else if (b % 2 === 1) hit(K.hat, tb, 0.18);
    }
    if (full && i % 4 === 3) hit(K.open, t0 + BEAT * 3.5, 0.35);
    // build fill into drop: snare roll in last half bar, gap on the last 16th
    if (i === drop - 1) { for (let k = 0; k < 8; k++) hit(K.snare, t0 + CUT / 2 + k * (BEAT / 4) - (k > 5 ? 0.02 : 0), 0.18 + k * 0.07); }
    if (sec === "prelift") { for (let k = 0; k < 4; k++) hit(K.snare, t0 + CUT / 2 + k * (BEAT / 2), 0.25 + k * 0.1); }
    // side-chain duck on the music bus
    kicks.forEach((kt) => { music.gain.setValueAtTime(0.55, kt); music.gain.linearRampToValueAtTime(0.16, kt + 0.012); music.gain.setTargetAtTime(0.55, kt + 0.03, 0.09); });
  }
  // drop impact + risers (riser tail lands on the downbeat)
  const riser = (atDown, g) => { const b = S.riser; if (!b) return; hit("riser", Math.max(0, atDown - b.duration), g, sfx); };
  riser(drop * CUT, 0.55); hit("boom", drop * CUT, 0.9, drums); hit("crash", drop * CUT, 0.45, drums); hit("sub_drop", drop * CUT, 0.6, drums);
  if (ctaIdx > 0) { riser(ctaIdx * CUT, 0.4); hit("crash", ctaIdx * CUT, 0.3, drums); }
  hit("braam", 0, 0.35, sfx);

  // --- harmony: pad, bass, arp ---
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 0.8; lp.connect(music); lp.connect(verb);
  lp.frequency.setValueAtTime(500, 0); lp.frequency.exponentialRampToValueAtTime(2600, Math.max(0.1, drop * CUT)); lp.frequency.setValueAtTime(4200, drop * CUT);
  breakdown.forEach((i) => { lp.frequency.setValueAtTime(4200, i * CUT); lp.frequency.exponentialRampToValueAtTime(900, i * CUT + 0.4); lp.frequency.exponentialRampToValueAtTime(4200, (i + 1) * CUT); });
  lp.frequency.setValueAtTime(4200, endIdx * CUT); lp.frequency.exponentialRampToValueAtTime(700, endIdx * CUT + 1.6);
  const bassF = ctx.createBiquadFilter(); bassF.type = "lowpass"; bassF.frequency.value = 420; bassF.Q.value = 4; bassF.connect(music);
  const arpF = ctx.createBiquadFilter(); arpF.type = "lowpass"; arpF.frequency.value = 2800; arpF.connect(music); arpF.connect(delay);

  const voice = (type, f, t, dur, peak, dest, att = 0.01, rel = 0.12, detune = 0) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = detune;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + att); g.gain.setValueAtTime(peak, Math.max(t + att, t + dur - rel)); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  };
  for (let i = 0; i < N; i++) {
    const t0 = i * CUT, sec = section(i); const chord = K.prog[i % 4]; const root = K.key + chord[0];
    const padDur = sec === "end" ? 3.2 : CUT + 0.05;
    const padAmp = sec === "intro" ? 0.05 : sec === "break" ? 0.08 : 0.06;
    chord.forEach((n) => { [-9, 9].forEach((dt) => voice(K.wave, hz(K.key + n), t0, padDur, padAmp / chord.length * 2.2, lp, sec === "intro" ? 0.6 : 0.04, 0.3, dt)); });
    if (sec === "intro") continue;
    // bass
    const bassNote = hz(root - 24);
    if (sec === "end") { voice("sine", bassNote, t0, 2.6, 0.5, music, 0.005, 1.2); continue; }
    if (sec === "build") { voice("sine", bassNote, t0, CUT, 0.34, music, 0.01, 0.2); }
    else for (let k = 0; k < 8; k++) { const t = t0 + k * (BEAT / 2); voice("sawtooth", bassNote * (k === 7 ? 1.5 : 1), t, BEAT / 2 - 0.02, 0.22, bassF, 0.004, 0.05); voice("sine", bassNote, t, BEAT / 2 - 0.02, 0.3, music, 0.004, 0.05); }
    // arp
    if (sec === "full" || sec === "prelift" || (sec === "break" && E > 0.8)) {
      const steps = E > 1 ? 16 : 8; const tones = [...chord, chord[0] + 12, chord[1] + 12];
      for (let k = 0; k < steps; k++) { const n = K.key + 12 + tones[(k * 3 + (k >> 2)) % tones.length]; voice(K.arp, hz(n), t0 + k * (CUT / steps), CUT / steps * 0.7, sec === "break" ? 0.03 : 0.045, arpF, 0.003, 0.04); }
    }
  }

  // --- sound design cues from the composer (transitions, slams, ticks, clicks) ---
  cues.forEach((c) => {
    if (c.bridge) { bridge(c.t, c.gain ?? 0.5); return; }
    if (!c.sfx) return;
    const isInteraction = ["mouse_click_b", "mouse_down", "mouse_up", "mouse_rel_b", "ui_click", "ui_tick", "toggle", "confirm", "glass_a", "perc_snap", "pop_a"].includes(c.sfx);
    const soundName = isInteraction ? V.clickSfx : c.sfx;
    hit(soundName, c.t, (c.gain ?? 0.5) * 0.9, sfx, isInteraction ? V.bridgeRate : 1);
    if (c.transition) hit(soundName, c.t, 0.2, sfxVerb);
  });

  const buf = await ctx.startRendering();
  // normalize to -1 dBFS
  let peak = 0; for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i])); }
  const g = peak > 0 ? 0.89 / peak : 1;
  const trimmed = Math.min(buf.length, Math.ceil(duration * SR));
  const fadeLen = Math.floor(0.35 * SR);
  for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < trimmed; i++) { let v = d[i] * g; if (i > trimmed - fadeLen) v *= (trimmed - i) / fadeLen; d[i] = v; } }
  const blob = toWav(buf, trimmed);
  return { blob, url: URL.createObjectURL(blob), duration: trimmed / SR, drop, sections: scenes.map((_, i) => section(i)) };
}

function toWav(buf, frames) {
  const ch = buf.numberOfChannels, bytes = frames * ch * 2; const ab = new ArrayBuffer(44 + bytes); const v = new DataView(ab);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + bytes, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, SR, true); v.setUint32(28, SR * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, bytes, true);
  const chans = [...Array(ch)].map((_, c) => buf.getChannelData(c)); let o = 44;
  for (let i = 0; i < frames; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, chans[c][i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
  return new Blob([ab], { type: "audio/wav" });
}
