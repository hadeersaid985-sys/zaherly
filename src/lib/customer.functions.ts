import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const FEATURES = ["geo", "seo", "content"] as const;
export type Feature = (typeof FEATURES)[number];

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function hasFeature(userId: string, feature: Feature) {
  const db = await admin();
  const { data } = await db.from("customer_features").select("id").eq("user_id", userId).eq("feature", feature).maybeSingle();
  return !!data;
}

async function isAdmin(userId: string) {
  const db = await admin();
  const { data } = await db.from("user_roles").select("id").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}

export const getMyDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const [{ data: leads }, { data: feats }, admin_] = await Promise.all([
      db.from("leads")
        .select("id, website_url, business_type, ai_visibility_score, geo_score, seo_score, content_score, authority_score, report, status, created_at")
        .eq("user_id", context.userId).order("created_at", { ascending: false }).limit(50),
      db.from("customer_features").select("feature").eq("user_id", context.userId),
      isAdmin(context.userId),
    ]);
    return {
      reports: (leads ?? []) as Array<{
        id: string; website_url: string; business_type: string; ai_visibility_score: number | null;
        geo_score: number | null; seo_score: number | null; content_score: number | null; authority_score: number | null;
        report: any; status: string; created_at: string;
      }>,
      features: (feats ?? []).map((f) => f.feature as Feature),
      isAdmin: admin_,
      email: (context.claims as { email?: string })?.email ?? "",
    };
  });

export const runMyAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ websiteUrl: z.string().trim().min(3).max(500), businessType: z.string().trim().min(2).max(200) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { crawlWebsite } = await import("./crawler.server");
    const { runAI } = await import("./analyze.functions");
    const email = (context.claims as { email?: string })?.email ?? null;
    const { data: lead, error } = await db.from("leads").insert({
      website_url: data.websiteUrl, business_type: data.businessType, name: email ?? "عميل", email,
      status: "processing", user_id: context.userId,
    }).select("id").single();
    if (error || !lead) throw new Error(error?.message ?? "تعذر الحفظ");
    try {
      const crawl = await crawlWebsite(data.websiteUrl);
      const report = await runAI(crawl, data.businessType);
      await db.from("leads").update({
        ai_visibility_score: Math.round(report.scores.aiVisibility), geo_score: Math.round(report.scores.geo),
        seo_score: Math.round(report.scores.seo), content_score: Math.round(report.scores.content),
        authority_score: Math.round(report.scores.authority), report: report as never, status: "completed",
      }).eq("id", lead.id);
      return { id: lead.id };
    } catch (e) {
      await db.from("leads").update({ status: "failed" }).eq("id", lead.id);
      throw e;
    }
  });

// ---------- AI content writer ----------
async function streamResponses(prompt: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("مفتاح الذكاء الاصطناعي غير مُهيّأ");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      instructions: "أنت كاتب محتوى عربي محترف متخصص في SEO و GEO. اكتب بالعربية بأسلوب واضح وجذاب، بعناوين Markdown، وبطول لا يتجاوز 900 كلمة.",
      input: prompt,
    }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text();
    if (res.status === 429) throw new Error("تم تجاوز الحد المسموح، حاول لاحقاً.");
    if (res.status === 402) throw new Error("نفد رصيد الذكاء الاصطناعي.");
    throw new Error(`خطأ من خدمة الذكاء الاصطناعي [${res.status}]: ${t.slice(0, 200)}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const p = line.slice(5).trim();
      if (!p || p === "[DONE]") continue;
      try {
        const ev = JSON.parse(p);
        if (ev.type === "response.output_text.delta") out += ev.delta ?? "";
        if (ev.type === "response.failed" || ev.type === "error") throw new Error("فشل توليد المحتوى");
      } catch (e) { if (e instanceof Error && e.message === "فشل توليد المحتوى") throw e; }
    }
  }
  if (!out.trim()) throw new Error("لم يتم توليد محتوى");
  return out;
}

const KINDS = { article: "مقال مدونة", faq: "أسئلة شائعة (10 أسئلة وأجوبة)", landing: "نص صفحة هبوط", social: "5 منشورات سوشيال ميديا" } as const;

export const generateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ kind: z.enum(["article", "faq", "landing", "social"]), topic: z.string().trim().min(3).max(300), business: z.string().trim().max(200).optional() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    if (!(await hasFeature(context.userId, "content")) && !(await isAdmin(context.userId))) throw new Error("هذه الأداة مقفلة لحسابك");
    const body = await streamResponses(`اكتب ${KINDS[data.kind]} عن: ${data.topic}${data.business ? `\nنوع النشاط: ${data.business}` : ""}\nاجعله محسّناً للظهور في محركات البحث وفي إجابات ChatGPT و Gemini.`);
    const db = await admin();
    const { data: row } = await db.from("content_items").insert({ user_id: context.userId, kind: data.kind, topic: data.topic, body }).select("id, kind, topic, body, created_at").single();
    return row!;
  });

export const listMyContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const { data } = await db.from("content_items").select("id, kind, topic, body, created_at").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(50);
    return data ?? [];
  });

// ---------- Admin: customers & feature unlocks ----------
export const adminListCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("صلاحيات المسؤول مطلوبة");
    const db = await admin();
    const { data: users, error } = await db.auth.admin.listUsers({ perPage: 500 });
    if (error) throw new Error(error.message);
    const { data: feats } = await db.from("customer_features").select("user_id, feature");
    return users.users.map((u) => ({
      id: u.id, email: u.email ?? "", created_at: u.created_at,
      features: (feats ?? []).filter((f) => f.user_id === u.id).map((f) => f.feature),
    }));
  });

export const adminSetFeature = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ userId: z.string().uuid(), feature: z.enum(FEATURES), enabled: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("صلاحيات المسؤول مطلوبة");
    const db = await admin();
    if (data.enabled) {
      const { error } = await db.from("customer_features").upsert({ user_id: data.userId, feature: data.feature }, { onConflict: "user_id,feature" });
      if (error) throw new Error(error.message);
    } else {
      await db.from("customer_features").delete().eq("user_id", data.userId).eq("feature", data.feature);
    }
    return { ok: true };
  });
