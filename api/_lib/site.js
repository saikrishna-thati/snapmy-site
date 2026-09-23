const MAX_HTML = 1_200_000;
const USER_AGENT = "SnapmySiteReader/1.0 (+https://snapmy-site.vercel.app/)";

function normalizeUrl(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    const err = new Error("Enter a valid website URL.");
    err.code = "invalid_url";
    throw err;
  }
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || !url.hostname) {
    const err = new Error("Only public http and https websites are supported.");
    err.code = "invalid_url";
    throw err;
  }
  if (isBlockedHostname(url.hostname)) {
    const err = new Error("Private and local network addresses are not supported.");
    err.code = "blocked_url";
    throw err;
  }
  url.hash = "";
  return url;
}

function isBlockedHostname(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "0.0.0.0" || host === "::1" || host === "[::1]") return true;
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168;
}

async function fetchText(url, { timeout = 10000, headers = {}, maxBytes = MAX_HTML } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, ...headers },
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      url: response.url || url,
      text: text.slice(0, maxBytes),
    };
  } catch (cause) {
    return { ok: false, status: 0, contentType: "", url, text: "", reason: cause?.name === "AbortError" ? "timeout" : "fetch_failed" };
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&#x([\da-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (_, name) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }[name.toLowerCase()]))
    .replace(/[ \t\r\f]+/g, " ");
}

function cleanText(value) {
  return decodeEntities(String(value || "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function unique(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = String(value || "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clipped(value, length) {
  const text = cleanText(value);
  return text.length > length ? `${text.slice(0, length - 1).trim()}…` : text;
}

function attr(fragment, name) {
  const match = String(fragment || "").match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decodeEntities(match[1]).trim() : "";
}

function tagTexts(html, tag) {
  const values = [];
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  for (const match of String(html || "").matchAll(re)) {
    const text = clipped(match[1], 240);
    if (text) values.push(text);
  }
  return unique(values);
}

function metaValue(html, wanted) {
  const re = /<meta\b[^>]*>/gi;
  for (const match of String(html || "").matchAll(re)) {
    const tag = match[0];
    if (attr(tag, "name").toLowerCase() === wanted || attr(tag, "property").toLowerCase() === wanted) return clipped(attr(tag, "content"), 320);
  }
  return "";
}

function absoluteUrl(value, base) {
  try {
    const url = new URL(value, base);
    if (!/^https?:$/.test(url.protocol)) return "";
    url.hash = "";
    return url.href;
  } catch {
    return "";
  }
}

function linksFrom(html, base) {
  const links = [];
  for (const match of String(html || "").matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = absoluteUrl(attr(match[0], "href"), base);
    if (!href) continue;
    links.push({ url: href, text: clipped(match[1], 100) });
  }
  return links;
}

function roleFor(url, text = "") {
  const value = `${new URL(url).pathname} ${text}`.toLowerCase();
  if (/pricing|plans|料金/.test(value)) return "pricing";
  if (/docs?|developers?|api|reference|changelog/.test(value)) return "workflow";
  if (/dashboard|app|editor|workspace|product|platform|features?/.test(value)) return "product";
  if (/customers?|case-stud|stories|testimonials?|reviews?/.test(value)) return "proof";
  if (/about|company|team|mission/.test(value)) return "brand";
  if (/security|compliance|trust/.test(value)) return "proof";
  return new URL(url).pathname === "/" ? "home" : "supporting";
}

function toRgbHex(value) {
  const match = value.match(/rgba?\(\s*([\d.]+)[, ]+\s*([\d.]+)[, ]+\s*([\d.]+)/i);
  if (!match) return "";
  return `#${[match[1], match[2], match[3]].map((part) => Math.max(0, Math.min(255, Math.round(Number(part)))).toString(16).padStart(2, "0")).join("")}`;
}

function extractAssets(html, base) {
  const assets = [];
  for (const match of String(html || "").matchAll(/<img\b[^>]*>/gi)) {
    const url = absoluteUrl(attr(match[0], "src") || attr(match[0], "data-src"), base);
    if (url) assets.push({ type: "image", url, alt: clipped(attr(match[0], "alt"), 120) });
  }
  for (const match of String(html || "").matchAll(/<(?:video|source)\b[^>]*>/gi)) {
    const url = absoluteUrl(attr(match[0], "src") || attr(match[0], "data-src"), base);
    if (url) assets.push({ type: "video", url, alt: "" });
  }
  return uniqueAssets(assets).slice(0, 40);
}

function uniqueAssets(assets) {
  const seen = new Set();
  return assets.filter((asset) => {
    if (seen.has(asset.url)) return false;
    seen.add(asset.url);
    return true;
  });
}

function parsePage(url, html, { isMarkdown = false } = {}) {
  const source = String(html || "");
  const visible = isMarkdown ? source.replace(/```[\s\S]*?```/g, " ") : source.replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, " ");
  const title = isMarkdown ? clipped((source.match(/^Title:\s*(.+)$/im) || [])[1], 160) : clipped((source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1], 160);
  const headings = isMarkdown ? unique([...source.matchAll(/^#{1,3}\s+(.+)$/gm)].map((match) => clipped(match[1], 120))) : unique(["h1", "h2", "h3"].flatMap((tag) => tagTexts(visible, tag)));
  const paragraphs = isMarkdown ? unique(source.split(/\n+/).map((line) => clipped(line.replace(/^[-*>\s]+/, ""), 320)).filter((line) => line.length > 45)) : tagTexts(visible, "p");
  const plain = cleanText(visible).slice(0, 18000);
  const anchors = isMarkdown ? [] : linksFrom(source, url);
  const images = isMarkdown ? [] : extractAssets(source, url);
  const colors = unique([
    ...source.match(/#[0-9a-f]{3,8}\b/gi) || [],
    ...source.match(/rgba?\([^)]*\)/gi) || [],
  ].map((value) => value.startsWith("rgb") ? toRgbHex(value) : value.toLowerCase()).filter(Boolean)).slice(0, 16);
  const fonts = unique([
    ...[...source.matchAll(/font-family\s*:\s*([^;}]+)/gi)].map((match) => clipped(match[1], 80)),
    ...[...source.matchAll(/family=([^&"']+)/gi)].map((match) => decodeURIComponent(match[1]).replace(/\+/g, " ")),
  ]).slice(0, 8);
  const ctaTexts = isMarkdown ? [] : unique([...source.matchAll(/<(?:a|button)\b[^>]*>([\s\S]*?)<\/(?:a|button)>/gi)].map((match) => clipped(match[1], 80)).filter((text) => text.length > 1)).slice(0, 12);
  const stats = unique((plain.match(/(?:\b\d[\d,.]*\s?[%x×+]?|[$€£]\s?\d[\d,.]*|\b\d{2,}\+?)/g) || []).map((value) => value.trim())).slice(0, 8).map((value) => ({ value, label: "" }));
  const quotes = isMarkdown ? [] : tagTexts(visible, "blockquote").slice(0, 4).map((text) => ({ text, author: "" }));
  const icon = !isMarkdown && (source.match(/<link\b[^>]*(?:rel\s*=\s*["'][^"']*icon|rel\s*=\s*["']apple-touch-icon)[^>]*>/i) || [])[0];
  const logoTag = !isMarkdown && (source.match(/<(?:img|svg)\b[^>]*(?:logo|brand|wordmark)[^>]*>/i) || [])[0];
  const logo = absoluteUrl(icon ? attr(icon, "href") : logoTag ? attr(logoTag, "src") : metaValue(source, "og:image"), url);
  const landmarkText = `${source} ${plain}`.toLowerCase();
  return {
    url,
    role: roleFor(url, `${title} ${headings.join(" ")}`),
    title: title || new URL(url).hostname,
    description: metaValue(source, "description") || metaValue(source, "og:description") || paragraphs[0] || "",
    headings: headings.slice(0, 16),
    paragraphs: paragraphs.slice(0, 10),
    anchors: anchors.filter((link) => link.url).slice(0, 40),
    assets: images,
    colors,
    fonts,
    ctaTexts,
    stats,
    quotes,
    logo,
    landmarks: {
      navigation: /<nav\b|\bnav\b/.test(landmarkText),
      hero: /<main\b|hero|headline|<h1\b/.test(landmarkText),
      cta: ctaTexts.length > 0 || /get started|sign up|try free|book a demo|learn more/.test(landmarkText),
      pricing: /pricing|plans|per month|\$\d+/.test(landmarkText),
      proof: /customer|trusted|testimonial|case stud|reviews?/.test(landmarkText),
      footer: /<footer\b|\bfooter\b/.test(landmarkText),
    },
  };
}

function pageCandidates(home, origin, limit) {
  const candidates = home.anchors
    .filter((link) => {
      try { return new URL(link.url).origin === origin && new URL(link.url).pathname !== "/"; } catch { return false; }
    })
    .map((link) => ({ ...link, score: candidateScore(link.url, link.text) }))
    .filter((link) => link.score > 0)
    .sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
  const seen = new Set();
  return candidates.filter((link) => {
    const key = new URL(link.url).pathname;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function candidateScore(url, text) {
  const value = `${url} ${text}`.toLowerCase();
  return [
    [/product|platform|features?|demo|workflow|editor/, 8],
    [/customers?|case-stud|testimonials?|reviews?/, 7],
    [/pricing|plans/, 6],
    [/docs?|developers?|api|reference/, 5],
    [/about|company|security|use-cases?/, 3],
  ].reduce((score, [re, points]) => score + (re.test(value) ? points : 0), 0);
}

function screenshotUrl(pageUrl, width, height, fullPage = false) {
  const target = new URL("https://api.microlink.io/");
  target.searchParams.set("url", pageUrl);
  target.searchParams.set("screenshot", "true");
  target.searchParams.set("meta", "false");
  target.searchParams.set("embed", "screenshot.url");
  target.searchParams.set("viewport.width", String(width));
  target.searchParams.set("viewport.height", String(height));
  if (fullPage) target.searchParams.set("screenshot.fullPage", "true");
  return target.href;
}

function screenshotCandidates(page, index) {
  const prefix = `page-${index + 1}`;
  const meta = { page: page.url, pageRole: page.role, source: "server-reader" };
  const candidates = [
    { ...meta, id: `${prefix}-desktop`, url: screenshotUrl(page.url, 1440, 900), viewport: { width: 1440, height: 900 }, kind: "screenshot", role: page.role, priority: index === 0 ? 1 : 0.78 },
    { ...meta, id: `${prefix}-mobile`, url: screenshotUrl(page.url, 390, 844), viewport: { width: 390, height: 844 }, kind: "screenshot", role: page.role, state: "responsive", priority: 0.74 },
  ];
  if (index === 0) candidates.push({ ...meta, id: `${prefix}-fullpage`, url: screenshotUrl(page.url, 1440, 900, true), viewport: { width: 1440, height: 900 }, kind: "fullpage", role: "overview", state: "fullpage", priority: 0.92 });
  return candidates;
}

function inferCategory(text) {
  const value = text.toLowerCase();
  if (/api|developer|sdk|terminal|deploy|repository|code/.test(value)) return "developer tool";
  if (/finance|bank|wealth|insurance|legal|health|wellness/.test(value)) return "professional service";
  if (/shop|store|fashion|food|creator|social|play/.test(value)) return "consumer product";
  if (/analytics|metrics|report|dashboard|data/.test(value)) return "data product";
  return "software product";
}

function buildBrief(normalized, pages, candidates, diagnostics, providerConfigured) {
  const home = pages[0];
  const allHeadings = unique(pages.flatMap((page) => page.headings));
  const headline = home.headings[0] || home.title || normalized.hostname;
  const name = clipped((home.title || normalized.hostname).split(/[|–—:-]/)[0], 48) || normalized.hostname;
  const features = allHeadings.slice(1, 9).map((title) => ({ title, desc: "" }));
  const allStats = pages.flatMap((page) => page.stats).filter((stat) => stat.value).slice(0, 6);
  const allQuotes = pages.flatMap((page) => page.quotes).slice(0, 4);
  const allLogos = unique(pages.flatMap((page) => page.ctaTexts).filter((text) => /[A-Z]{2,}|\b\w+\s+(?:teams?|companies|customers)/i.test(text))).slice(0, 8);
  const logo = home.logo || "";
  const colors = unique(pages.flatMap((page) => page.colors)).slice(0, 8);
  const fonts = unique(pages.flatMap((page) => page.fonts)).slice(0, 8);
  const primary = candidates.filter((candidate) => candidate.kind !== "fullpage").filter((candidate) => candidate.viewport.width === 1440);
  const fullpage = candidates.find((candidate) => candidate.kind === "fullpage")?.url || "";
  const pageRecords = pages.map((page) => ({ url: page.url, role: page.role, title: page.title, headline: page.headings[0] || page.title, description: page.description, headings: page.headings.slice(0, 12) }));
  const evidenceAssets = candidates.map((candidate) => ({
    id: candidate.id,
    url: candidate.url,
    page: candidate.page,
    pageRole: candidate.pageRole,
    role: candidate.role,
    kind: candidate.kind,
    fullPage: candidate.kind === "fullpage",
    viewport: candidate.viewport?.width === 390 ? "mobile" : "desktop",
    width: candidate.viewport?.width || 0,
    height: candidate.viewport?.height || 0,
    state: candidate.state || "default",
    priority: candidate.priority || 0,
    crop: "full",
    focalPoint: "center",
    safeTextRegions: ["top", "bottom"],
    source: candidate.source || "server-reader",
  }));
  const sourceAssets = pages.flatMap((page) => page.assets.map((asset, index) => ({ id: `${page.role}-asset-${index + 1}`, url: asset.url, page: page.url, role: page.role, kind: asset.type, alt: asset.alt || "" }))).slice(0, 24);
  return {
    name,
    domain: normalized.hostname.replace(/^www\./, ""),
    url: normalized.href,
    headline: clipped(headline, 140),
    description: clipped(home.description || home.paragraphs[0], 360),
    category: inferCategory(`${name} ${headline} ${home.description} ${features.map((feature) => feature.title).join(" ")}`),
    features,
    stats: allStats,
    quotes: allQuotes,
    logos: allLogos,
    colors,
    logo,
    logoAspect: 0,
    screenshots: primary.map((candidate) => candidate.url).slice(0, 8),
    fullpage,
    hookCandidates: unique([headline, ...home.headings, ...features.map((feature) => feature.title)]).slice(0, 8),
    pages: pageRecords,
    pageRoles: pageRecords.map((page) => ({ url: page.url, role: page.role })),
    screenshotCandidates: candidates,
    evidenceAssets,
    fullpages: fullpage ? [fullpage] : [],
    sourceAssets,
    interactionTrace: [],
    visualTokens: { mode: colors.some((color) => /#(?:0[0-9a-f]|1[0-9a-f]|2[0-9a-f])/i.test(color)) ? "dark-signal" : "light-signal", typography: fonts[0] || "reader-inferred" },
    evidence: {
      pages: pages.map((page, index) => ({
        url: page.url,
        role: page.role,
        title: page.title,
        headings: page.headings.slice(0, 8),
        landmarks: page.landmarks,
        screenshotIds: screenshotCandidates(page, index).map((candidate) => candidate.id),
      })),
      assets: uniqueAssets(pages.flatMap((page) => page.assets)).slice(0, 40),
      brand: { colors, fonts, logo },
      flows: pages.filter((page) => page.role === "workflow" || page.role === "product").map((page) => ({ page: page.url, cues: page.ctaTexts.slice(0, 4) })).slice(0, 6),
    },
    diagnostics: {
      reader: providerConfigured ? "jev-assisted-or-direct" : "direct-html",
      pagesAttempted: diagnostics.pagesAttempted,
      pagesRead: pages.length,
      pageErrors: diagnostics.pageErrors,
      screenshotCandidates: candidates.length,
      visualEvidence: candidates.length >= 3 ? "multiple-candidates" : "limited",
    },
  };
}

async function readWebsite(value, { maxPages = 4 } = {}) {
  const normalized = normalizeUrl(value);
  const pageLimit = Number.isFinite(Number(maxPages)) ? Math.max(1, Math.min(6, Number(maxPages))) : 4;
  const jevKey = typeof process.env.JEV_KEY === "string" ? process.env.JEV_KEY.trim() : "";
  const direct = await fetchText(normalized.href, { timeout: 12000 });
  let homeResponse = direct;
  let isMarkdown = false;
  const directPage = direct.ok ? parsePage(normalized.href, direct.text) : null;
  const needsProviderFallback = !direct.ok || !directPage?.headings.length && !directPage?.paragraphs.length;
  if (jevKey && needsProviderFallback) {
    const provider = await fetchText(`https://r.jina.ai/${normalized.href}`, { timeout: 12000, headers: { Authorization: `Bearer ${jevKey}`, Accept: "text/plain" } });
    if (provider.ok) { homeResponse = provider; isMarkdown = true; }
  }
  if (!homeResponse.ok) {
    const err = new Error("The website could not be read from the server.");
    err.code = homeResponse.reason === "timeout" ? "read_timeout" : "site_unreachable";
    err.status = homeResponse.status;
    throw err;
  }

  const home = !isMarkdown && directPage ? directPage : parsePage(normalized.href, homeResponse.text, { isMarkdown });
  const selected = isMarkdown ? [] : pageCandidates(home, normalized.origin, Math.max(0, pageLimit - 1));
  const routeResults = await Promise.all(selected.map(async (candidate) => {
    const response = await fetchText(candidate.url, { timeout: 9000 });
    return response.ok ? parsePage(candidate.url, response.text) : { url: candidate.url, role: roleFor(candidate.url, candidate.text), title: candidate.text || candidate.url, headings: [], paragraphs: [], anchors: [], assets: [], colors: [], fonts: [], ctaTexts: [], stats: [], quotes: [], logo: "", landmarks: {}, error: response.reason || `http_${response.status}` };
  }));
  const pages = [home, ...routeResults.filter((page) => !page.error)];
  const candidates = pages.flatMap((page, index) => screenshotCandidates(page, index));
  return buildBrief(normalized, pages, candidates, { pagesAttempted: 1 + selected.length, pageErrors: routeResults.filter((page) => page.error).map((page) => ({ url: page.url, error: page.error })).slice(0, 8) }, Boolean(jevKey));
}

module.exports = { normalizeUrl, readWebsite };
