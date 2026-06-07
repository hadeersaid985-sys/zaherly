import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { crawlWebsite } from "./crawler.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  websiteUrl: z.string().trim().min(3).max(500),
  businessType: z.string().trim().min(2).max(200),
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().min(4).max(40).optional().or(z.literal("")),
  marketingConsent: z.boolean().optional().default(false),
});

export interface AnalysisReport {
  summary: string;
  scores: {
    aiVisibility: number;
    geo: number;
    seo: number;
    content: number;
    authority: number;
  };
  chatgpt: {
    willRecommend: boolean;
    probability: number;
    reasons: string[];
  };
  strengths: string[];
  weaknesses: string[];
  missingPages: string[];
  missingFaqTopics: string[];
  recommendedBlogTopics: string[];
  geoRecommendations: string[];
  seoRecommendations: string[];
  faq: { question: string; answer: string }[];
  blogIdeas: { title: string; description: string }[];
  actionPlan: {
    days30: string[];
    days60: string[];
    days90: string[];
  };
}

const SYSTEM_PROMPT = `أنت مستشار عالمي من الدرجة الأولى في GEO (Generative Engine Optimization) و SEO.
ستحلل بيانات موقع ويب تم زحفها فعلياً وتعطي تقريراً عملياً بالعربية الفصحى.
يجب أن تكون كل النتائج بالعربية، دقيقة، عملية وقابلة للتنفيذ.
أعد الرد عبر استدعاء الأداة المقدمة فقط — لا تكتب أي نص حر.`;

const TOOL_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string", description: "ملخص عربي من 2-3 جمل عن جاهزية الموقع" },
    scores: {
      type: "object",
      properties: {
        aiVisibility: { type: "number", minimum: 0, maximum: 100 },
        geo: { type: "number", minimum: 0, maximum: 100 },
        seo: { type: "number", minimum: 0, maximum: 100 },
        content: { type: "number", minimum: 0, maximum: 100 },
        authority: { type: "number", minimum: 0, maximum: 100 },
      },
      required: ["aiVisibility", "geo", "seo", "content", "authority"],
      additionalProperties: false,
    },
    chatgpt: {
      type: "object",
      properties: {
        willRecommend: { type: "boolean" },
        probability: { type: "number", minimum: 0, maximum: 100 },
        reasons: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
      },
      required: ["willRecommend", "probability", "reasons"],
      additionalProperties: false,
    },
    strengths: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
    weaknesses: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
    missingPages: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 10 },
    missingFaqTopics: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 10 },
    recommendedBlogTopics: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 10 },
    geoRecommendations: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 10 },
    seoRecommendations: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 10 },
    faq: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
        additionalProperties: false,
      },
    },
    blogIdeas: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
    },
    actionPlan: {
      type: "object",
      properties: {
        days30: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
        days60: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
        days90: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
      },
      required: ["days30", "days60", "days90"],
      additionalProperties: false,
    },
  },
  required: [
    "summary", "scores", "chatgpt", "strengths", "weaknesses",
    "missingPages", "missingFaqTopics", "recommendedBlogTopics",
    "geoRecommendations", "seoRecommendations", "faq", "blogIdeas", "actionPlan",
  ],
  additionalProperties: false,
};

async function runAI(crawl: Awaited<ReturnType<typeof crawlWebsite>>, businessType: string): Promise<AnalysisReport> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY غير مُهيّأ");

  const compactPages = crawl.pages.map((p) => ({
    url: p.url,
    title: p.title,
    description: p.description,
    h1: p.h1,
    h2: p.h2.slice(0, 8),
    excerpt: p.text.slice(0, 1500),
    schemaTypes: p.schemaTypes,
    hasCanonical: !!p.canonical,
    ogCount: Object.keys(p.ogTags).length,
    imagesMissingAlt: p.imagesWithoutAlt,
  }));

  const userPayload = {
    businessType,
    homeUrl: crawl.homeUrl,
    technical: {
      hasSitemap: crawl.hasSitemap,
      hasRobots: crawl.hasRobots,
      hasFAQSchema: crawl.hasFAQSchema,
      hasLocalBusinessSchema: crawl.hasLocalBusinessSchema,
      hasOpenGraph: crawl.hasOpenGraph,
      hasCanonical: crawl.hasCanonical,
      uniqueSchemas: crawl.uniqueSchemas,
      totalWords: crawl.totalWords,
      totalImages: crawl.totalImages,
      imagesMissingAlt: crawl.imagesMissingAlt,
    },
    pages: compactPages,
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            "هذه نتائج زحف موقع حقيقي. حلّله من منظور GEO/SEO والظهور في ChatGPT و Gemini و AI Search.\n\n" +
            "```json\n" + JSON.stringify(userPayload, null, 2) + "\n```",
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_analysis",
            description: "إرجاع تقرير تحليل GEO/SEO بالعربية",
            parameters: TOOL_SCHEMA,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_analysis" } },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("تم تجاوز الحد المسموح. حاول لاحقاً.");
    if (res.status === 402) throw new Error("نفد رصيد الذكاء الاصطناعي. الرجاء إضافة رصيد.");
    throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const call = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) throw new Error("لم يتم إرجاع تحليل صحيح من الذكاء الاصطناعي");
  const args = JSON.parse(call.function.arguments);
  return args as AnalysisReport;
}

export const startAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    // Create pending lead first so the user gets an id immediately
    const { data: lead, error: insertErr } = await supabaseAdmin
      .from("leads")
      .insert({
        website_url: data.websiteUrl,
        business_type: data.businessType,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertErr || !lead) throw new Error(insertErr?.message || "تعذر حفظ البيانات");

    try {
      const crawl = await crawlWebsite(data.websiteUrl);
      const report = await runAI(crawl, data.businessType);

      await supabaseAdmin
        .from("leads")
        .update({
          ai_visibility_score: Math.round(report.scores.aiVisibility),
          geo_score: Math.round(report.scores.geo),
          seo_score: Math.round(report.scores.seo),
          content_score: Math.round(report.scores.content),
          authority_score: Math.round(report.scores.authority),
          report: report as unknown as never,
          crawl_data: {
            homeUrl: crawl.homeUrl,
            pagesCount: crawl.pages.length,
            hasSitemap: crawl.hasSitemap,
            hasRobots: crawl.hasRobots,
            hasFAQSchema: crawl.hasFAQSchema,
            hasLocalBusinessSchema: crawl.hasLocalBusinessSchema,
            hasOpenGraph: crawl.hasOpenGraph,
            uniqueSchemas: crawl.uniqueSchemas,
            totalWords: crawl.totalWords,
            imagesMissingAlt: crawl.imagesMissingAlt,
          },
          status: "completed",
        })
        .eq("id", lead.id);

      return { id: lead.id };
    } catch (err) {
      await supabaseAdmin
        .from("leads")
        .update({ status: "failed", report: { error: String(err) } })
        .eq("id", lead.id);
      throw err;
    }
  });

export const getReport = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !lead) throw new Error("التقرير غير موجود");
    return lead;
  });
