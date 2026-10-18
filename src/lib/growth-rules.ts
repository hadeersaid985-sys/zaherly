import { z } from "zod";

export const PRIORITIES = ["urgent", "important", "later"] as const;
export const REVIEW_STATUSES = ["draft", "changes_requested", "approved"] as const;
export function siteKey(raw: string) {
  const url = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("رابط الموقع غير صالح");
  return url.hostname.toLowerCase().replace(/^www\./, "");
}
export const competitorSchema = z.object({
  site: z.string().min(3).max(500),
  competitors: z.array(z.object({ name: z.string().trim().min(2).max(100), url: z.string().trim().min(3).max(500) })).max(3),
}).superRefine((value, ctx) => {
  try {
    const own = siteKey(value.site);
    const hosts = value.competitors.map(c => siteKey(c.url));
    if (hosts.includes(own) || new Set(hosts).size !== hosts.length) ctx.addIssue({ code: "custom", message: "أضف مواقع مختلفة عن موقعك وبدون تكرار" });
  } catch { ctx.addIssue({ code: "custom", message: "راجع روابط المواقع" }); }
});
export function scoreDelta(current: number | null, previous: number | null) {
  return current === null || previous === null ? null : current - previous;
}
export function sameSiteReports<T extends { website_url: string; status: string; created_at: string }>(reports: T[], site: string) {
  return reports.filter(r => {
    try { return r.status === "completed" && siteKey(r.website_url) === siteKey(site); } catch { return false; }
  }).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}
export function mentionCount(answer: string, sources: string[], name: string, url: string) {
  const host = siteKey(url);
  const text = answer.toLocaleLowerCase();
  const escaped = name.toLocaleLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const named = [...text.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "gu"))].length;
  const cited = sources.some(s => { try { return siteKey(s) === host; } catch { return false; } });
  return Math.max(named, text.split(host).length - 1, cited ? 1 : 0);
}
export function contentCanExport(status: string) { return status === "approved"; }
export function taskSuggestions(report: Record<string, any>) {
  const plan = report.actionPlan ?? {};
  return ([ ["urgent", plan.days30 ?? report.geoRecommendations ?? []], ["important", plan.days60 ?? report.seoRecommendations ?? []], ["later", plan.days90 ?? []] ] as const)
    .flatMap(([priority, titles]) => (titles as string[]).map(title => ({ title, priority })))
    .filter((v, i, all) => all.findIndex(x => x.title === v.title) === i).slice(0, 24);
}