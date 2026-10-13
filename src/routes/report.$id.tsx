import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getReport, type AnalysisReport } from "@/lib/analyze.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { Bot, Download, CheckCircle2, AlertTriangle, Sparkles, FileText, Calendar, ArrowLeft, MessageCircle } from "lucide-react";

import { WHATSAPP_LINK, PRICING } from "@/lib/contact";

export const Route = createFileRoute("/report/$id")({
  head: () => ({ meta: [
    { title: "تقرير الظهور في الذكاء الاصطناعي — ظاهرلي" },
    { name: "description", content: "نتائج تحليل GEO و SEO وجاهزية موقعك للظهور في ChatGPT مع توصيات وخطة عمل من ظاهرلي." },
    { property: "og:title", content: "تقرير الظهور في الذكاء الاصطناعي — ظاهرلي" },
    { property: "og:description", content: "تقييم موقعك وتوصيات تحسين الظهور في البحث والذكاء الاصطناعي." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: async ({ params, context }) => {
    return context.queryClient.ensureQueryData(reportQueryOptions(params.id));
  },
  component: ReportPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">تعذر تحميل التقرير</h1>
        <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
        <Link to="/" className="text-primary underline">العودة للرئيسية</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">التقرير غير موجود</div>,
});

function reportQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["report", id],
    queryFn: () => {
      const fn = getReport;
      return fn({ data: { id } });
    },
  });
}

function ScoreCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-extrabold mb-2" style={{ color }}>{value}<span className="text-base text-muted-foreground">/100</span></div>
      <Progress value={value} className="h-2" />
    </Card>
  );
}

function ReportPage() {
  const { id } = Route.useParams();
  const fetchReport = useServerFn(getReport);
  const { data: lead } = useSuspenseQuery(
    queryOptions({
      queryKey: ["report", id],
      queryFn: () => fetchReport({ data: { id } }),
    }),
  );

  const report = lead.report as unknown as AnalysisReport | null;

  if (!report || lead.status !== "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <div className="size-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <h2 className="text-xl font-bold mb-2">جاري إعداد التقرير...</h2>
          <p className="text-muted-foreground text-sm">
            {lead.status === "failed" ? "فشل التحليل. حاول مرة أخرى." : "يرجى تحديث الصفحة بعد قليل."}
          </p>
        </Card>
      </div>
    );
  }

  const radarData = [
    { axis: "AI", value: report.scores.aiVisibility },
    { axis: "GEO", value: report.scores.geo },
    { axis: "SEO", value: report.scores.seo },
    { axis: "محتوى", value: report.scores.content },
    { axis: "موثوقية", value: report.scores.authority },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-50 no-print">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-1 sm:gap-2 text-sm text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>
          <div className="flex items-center min-w-0">
            <BrandLogo className="h-10 sm:h-12 md:h-14 w-auto" />
          </div>
          <Button onClick={() => window.print()} size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
            <Download className="size-4" />
            <span className="hidden sm:inline">تحميل PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/30">تقرير تحليل GEO + SEO</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold">{lead.name}</h1>
          <p className="text-muted-foreground" dir="ltr">{lead.website_url}</p>
          <p className="text-sm text-muted-foreground">{lead.business_type} • {new Date(lead.created_at).toLocaleDateString("ar")}</p>
        </div>

        {/* Hero ChatGPT */}
        <Card className="p-8 bg-gradient-hero text-white shadow-elegant">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="size-32 rounded-full bg-white/15 border-4 border-white/30 flex flex-col items-center justify-center backdrop-blur">
              <div className="text-4xl font-extrabold">{report.chatgpt.probability}%</div>
              <div className="text-xs opacity-90">احتمالية الاقتراح</div>
            </div>
            <div className="flex-1 text-center md:text-right">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Bot className="size-6" />
                <h2 className="text-2xl font-bold">اعرف في 60 ثانية ليه موقعك مش ظاهر في Google و ChatGPT</h2>
              </div>
              <p className="text-lg mb-4 opacity-95">{report.summary}</p>
              <ul className="space-y-1 text-sm opacity-90">
                {report.chatgpt.reasons.map((r, i) => (
                  <li key={i} className="flex gap-2"><span>•</span><span>{r}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Scores */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ScoreCard label="ظهور AI" value={report.scores.aiVisibility} color="oklch(0.55 0.22 285)" />
          <ScoreCard label="GEO" value={report.scores.geo} color="oklch(0.65 0.20 200)" />
          <ScoreCard label="SEO" value={report.scores.seo} color="oklch(0.70 0.18 155)" />
          <ScoreCard label="جودة المحتوى" value={report.scores.content} color="oklch(0.78 0.17 75)" />
          <ScoreCard label="الموثوقية" value={report.scores.authority} color="oklch(0.65 0.22 15)" />
        </div>

        {/* Radar */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">نظرة شاملة على الأداء</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar dataKey="value" stroke="oklch(0.48 0.22 275)" fill="oklch(0.65 0.24 295)" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Strengths / Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" />
              نقاط القوة
            </h3>
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm"><span className="text-success">✓</span><span>{s}</span></li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              نقاط الضعف
            </h3>
            <ul className="space-y-2">
              {report.weaknesses.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm"><span className="text-warning">!</span><span>{s}</span></li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Action plan — two paid plans (shown before recommendations) */}
        <Card className="p-6 print-break">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            خطط العمل مع ظاهرلي
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                t: "خطة ٣٠ يوم — الأساسيات",
                price: PRICING.plan30.price,
                currency: PRICING.plan30.currency,
                items: report.actionPlan.days30,
                color: "bg-primary/10 border-primary/30",
                msg: `مرحباً ظاهرلي، أرغب في حجز خطة الـ ٣٠ يوم (${PRICING.plan30.price} ${PRICING.plan30.currency})`,
              },
              {
                t: "خطة ٣٠ يوم — التوسع",
                price: PRICING.plan60.price,
                currency: PRICING.plan60.currency,
                monthly: true,
                items: [...report.actionPlan.days30, ...report.actionPlan.days60],
                color: "bg-chart-2/10 border-chart-2/30",
                msg: `مرحباً ظاهرلي، أرغب في حجز خطة الـ ٣٠ يوم (${PRICING.plan60.price} ${PRICING.plan60.currency} شهرياً)`,
              },
            ].map((p) => (
              <div key={p.t} className={`p-5 rounded-xl border-2 ${p.color} flex flex-col`}>
                <div className="font-bold text-lg mb-1">{p.t}</div>
                <div className="text-3xl font-extrabold text-primary mb-3">
                  {p.price.toLocaleString("ar-EG")} <span className="text-base font-normal text-muted-foreground">{p.currency}{p.monthly ? " / شهرياً" : ""}</span>
                </div>
                <ul className="space-y-2 text-sm flex-1 mb-4">
                  {p.items.slice(0, 8).map((it, i) => (
                    <li key={i} className="flex gap-2"><span>◉</span><span>{it}</span></li>
                  ))}
                </ul>
                <a
                  href={WHATSAPP_LINK(p.msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-print inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#FF3D7F] to-[#FF8A00] text-white font-bold py-3 rounded-lg shadow-lg shadow-[#FF3D7F]/30 hover:scale-[1.02] transition-transform"
                >
                  <MessageCircle className="size-5" />
                  للبدء في خطة العمل تواصل معنا للحجز
                </a>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-lg border-2 border-dashed border-[#FF3D7F]/40 bg-[#FF3D7F]/5 text-center">
            <p className="text-sm md:text-base font-semibold">
              لو حابب أبعتلك خطة الإصلاح أو أشرح النتيجة في مكالمة ١٥ دقيقة، ابعت{" "}
              <span className="text-[#FF3D7F] font-extrabold">"موافق"</span>
            </p>
          </div>
        </Card>


        {/* Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">توصيات GEO</h3>
            <ul className="space-y-2 text-sm">
              {report.geoRecommendations.map((r, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary font-bold">{i + 1}.</span><span>{r}</span></li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">توصيات SEO</h3>
            <ul className="space-y-2 text-sm">
              {report.seoRecommendations.map((r, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary font-bold">{i + 1}.</span><span>{r}</span></li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Missing pages */}
        {report.missingPages.length > 0 && (
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">صفحات مقترح إضافتها</h3>
            <div className="flex flex-wrap gap-2">
              {report.missingPages.map((p, i) => (
                <Badge key={i} variant="secondary" className="text-sm">{p}</Badge>
              ))}
            </div>
          </Card>
        )}

        {/* FAQ */}
        <Card className="p-6 print-break">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            ١٠ أسئلة شائعة جاهزة للنشر
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {report.faq.map((q, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger className="text-right">{i + 1}. {q.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{q.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Blog ideas */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">١٠ أفكار مقالات تجذب الذكاء الاصطناعي</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {report.blogIdeas.map((b, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/60 hover:border-primary/40 transition-colors">
                <div className="font-bold mb-1">{i + 1}. {b.title}</div>
                <div className="text-sm text-muted-foreground">{b.description}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact CTA */}
        <Card className="p-8 bg-gradient-hero text-white text-center no-print">
          <h3 className="text-2xl font-bold mb-2">مزيد من التحليل المفصل؟ كلمنا دلوقتي</h3>
          <p className="opacity-95 mb-5">احصل على استشارة مفصلة من فريق ظاهرلي وخطة مخصصة لنشاطك.</p>
          <a
            href={WHATSAPP_LINK("مرحباً ظاهرلي، أحتاج تحليلاً أكثر تفصيلاً لموقعي")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <MessageCircle className="size-5" />
            للتواصل معنا كلمنا دلوقتي
          </a>
        </Card>

        <div className="text-center text-sm text-muted-foreground py-6 border-t border-border/50">
          تم إعداد هذا التقرير بواسطة ظاهرلي • {new Date().toLocaleDateString("ar")}
        </div>
      </div>
      
    </div>
  );
}
