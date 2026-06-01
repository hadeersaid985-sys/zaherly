// Server-only website crawler — extracts SEO/GEO signals from a website.

export interface PageData {
  url: string;
  title: string;
  description: string;
  h1: string[];
  h2: string[];
  text: string;
  internalLinks: string[];
  imagesWithoutAlt: number;
  imagesTotal: number;
  canonical: string | null;
  ogTags: Record<string, string>;
  schemaTypes: string[];
}

export interface CrawlResult {
  homeUrl: string;
  pages: PageData[];
  hasSitemap: boolean;
  hasRobots: boolean;
  hasFAQSchema: boolean;
  hasLocalBusinessSchema: boolean;
  hasOpenGraph: boolean;
  hasCanonical: boolean;
  totalWords: number;
  totalImages: number;
  imagesMissingAlt: number;
  uniqueSchemas: string[];
}

const UA = "Mozilla/5.0 (compatible; SwiftMindBot/1.0; +https://swiftmind.ai)";
const TIMEOUT_MS = 8000;

async function fetchText(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text") && !ct.includes("xml") && !ct.includes("html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function attr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
  const m = tag.match(re);
  return m ? m[1] : null;
}

function getAll(html: string, regex: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) out.push(m[1]);
  return out;
}

function stripTags(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePage(html: string, url: string, baseHost: string): PageData {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]).slice(0, 300) : "";

  let description = "";
  const descTag = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
  if (descTag) description = attr(descTag[0], "content") || "";

  const h1 = getAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((s) => stripTags(s)).filter(Boolean).slice(0, 10);
  const h2 = getAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map((s) => stripTags(s)).filter(Boolean).slice(0, 20);

  const text = stripTags(html).slice(0, 8000);

  const linkHrefs = getAll(html, /<a[^>]+href=["']([^"']+)["']/gi);
  const internalLinks: string[] = [];
  for (const href of linkHrefs) {
    try {
      const abs = new URL(href, url).toString();
      const h = new URL(abs).host;
      if (h === baseHost && !internalLinks.includes(abs)) internalLinks.push(abs);
    } catch {}
  }

  const imgTags = html.match(/<img[^>]*>/gi) || [];
  let missing = 0;
  for (const t of imgTags) {
    const alt = attr(t, "alt");
    if (!alt || !alt.trim()) missing++;
  }

  const canonTag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  const canonical = canonTag ? attr(canonTag[0], "href") : null;

  const ogTags: Record<string, string> = {};
  const ogMatches = html.match(/<meta[^>]+property=["']og:[^"']+["'][^>]*>/gi) || [];
  for (const m of ogMatches) {
    const prop = attr(m, "property");
    const content = attr(m, "content");
    if (prop && content) ogTags[prop] = content;
  }

  const schemaBlocks = getAll(
    html,
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const schemaTypes: string[] = [];
  for (const block of schemaBlocks) {
    try {
      const data = JSON.parse(block.trim());
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const t = item?.["@type"];
        if (typeof t === "string") schemaTypes.push(t);
        else if (Array.isArray(t)) schemaTypes.push(...t.filter((x) => typeof x === "string"));
      }
    } catch {}
  }

  return {
    url,
    title,
    description,
    h1,
    h2,
    text,
    internalLinks: internalLinks.slice(0, 40),
    imagesWithoutAlt: missing,
    imagesTotal: imgTags.length,
    canonical,
    ogTags,
    schemaTypes,
  };
}

function categorize(url: string): string | null {
  const u = url.toLowerCase();
  if (/\/(about|من-نحن|about-us)\b/.test(u)) return "about";
  if (/\/(services?|خدمات|solutions?)\b/.test(u)) return "services";
  if (/\/(blog|articles?|news|مدونة|أخبار)\b/.test(u)) return "blog";
  if (/\/(faq|الأسئلة|questions)\b/.test(u)) return "faq";
  if (/\/(contact|تواصل|اتصل)\b/.test(u)) return "contact";
  return null;
}

export async function crawlWebsite(rawUrl: string): Promise<CrawlResult> {
  let homeUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(homeUrl)) homeUrl = "https://" + homeUrl;
  const home = new URL(homeUrl);
  const baseHost = home.host;
  const origin = home.origin;

  const pages: PageData[] = [];
  const visited = new Set<string>();

  const homeHtml = await fetchText(home.toString());
  if (homeHtml) {
    const p = parsePage(homeHtml, home.toString(), baseHost);
    pages.push(p);
    visited.add(home.toString());
  }

  // Pick a representative page per category
  const candidates = pages[0]?.internalLinks ?? [];
  const wanted: Record<string, string> = {};
  for (const link of candidates) {
    const cat = categorize(link);
    if (cat && !wanted[cat]) wanted[cat] = link;
  }

  // Try common Arabic / English paths if categories missing
  const fallbacks: Record<string, string[]> = {
    about: ["/about", "/about-us", "/من-نحن"],
    services: ["/services", "/خدمات"],
    blog: ["/blog", "/مدونة"],
    faq: ["/faq", "/الأسئلة-الشائعة"],
    contact: ["/contact", "/تواصل-معنا"],
  };
  for (const [cat, paths] of Object.entries(fallbacks)) {
    if (!wanted[cat]) wanted[cat] = origin + paths[0];
  }

  await Promise.all(
    Object.values(wanted).map(async (link) => {
      if (visited.has(link)) return;
      visited.add(link);
      const html = await fetchText(link);
      if (html) pages.push(parsePage(html, link, baseHost));
    }),
  );

  const sitemap = await fetchText(origin + "/sitemap.xml");
  const robots = await fetchText(origin + "/robots.txt");

  const allSchemas = new Set<string>();
  for (const p of pages) p.schemaTypes.forEach((s) => allSchemas.add(s));

  const totalWords = pages.reduce((sum, p) => sum + p.text.split(/\s+/).length, 0);
  const totalImages = pages.reduce((s, p) => s + p.imagesTotal, 0);
  const imagesMissingAlt = pages.reduce((s, p) => s + p.imagesWithoutAlt, 0);
  const hasOG = pages.some((p) => Object.keys(p.ogTags).length > 0);
  const hasCanonical = pages.some((p) => !!p.canonical);

  return {
    homeUrl: home.toString(),
    pages,
    hasSitemap: !!sitemap,
    hasRobots: !!robots,
    hasFAQSchema: [...allSchemas].some((s) => s.toLowerCase().includes("faq")),
    hasLocalBusinessSchema: [...allSchemas].some((s) => s.toLowerCase().includes("localbusiness")),
    hasOpenGraph: hasOG,
    hasCanonical,
    totalWords,
    totalImages,
    imagesMissingAlt,
    uniqueSchemas: [...allSchemas],
  };
}
