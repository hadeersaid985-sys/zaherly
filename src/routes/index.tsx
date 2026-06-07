import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { startAnalysis } from "@/lib/analyze.functions";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { WHATSAPP_LINK } from "@/lib/contact";
import { Sparkles, Search, FileText, Bot, TrendingUp, Globe, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "فحص الظهور في ChatGPT — Swift Mind" },
      {
        name: "description",
        content: "اكتشف ما إذا كان ChatGPT يقترح موقعك. تحليل GEO و SEO وتقرير PDF احترافي مجاناً.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const analyze = useServerFn(startAnalysis);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    websiteUrl: "",
    businessType: "",
    name: "",
    email: "",
    phone: "",
    marketingConsent: false,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { id } = await analyze({ data: form });
      toast.success("اكتمل الفحص! جاري عرض التقرير...");
      navigate({ to: "/report/$id", params: { id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ أثناء الفحص");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center min-w-0">
            <BrandLogo className="h-12 md:h-14 w-auto" />
          </div>
          <a href="/login" className="text-sm text-muted-foreground hover:text-foreground">دخول المسؤول</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10 -z-10" />
        <div className="absolute top-20 -right-32 size-96 rounded-full bg-primary-glow/30 blur-3xl -z-10" />
        <div className="absolute top-40 -left-32 size-96 rounded-full bg-primary/20 blur-3xl -z-10" />

        <div className="container mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-sm">
              <Bot className="size-4 text-primary" />
              <span>أول أداة عربية لقياس الظهور في الذكاء الاصطناعي</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              هل سيقترح <span className="text-gradient">ChatGPT</span> شركتك؟
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              نقوم بزحف موقعك فعلياً وتحليله بالذكاء الاصطناعي لقياس جاهزيتك للظهور في
              ChatGPT و Gemini وبحث الذكاء الاصطناعي. تقرير شامل مع خطة عمل ٩٠ يوماً.
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { icon: Search, label: "زحف حقيقي للموقع" },
                { icon: TrendingUp, label: "تقييم GEO و SEO" },
                { icon: FileText, label: "تقرير PDF كامل" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-sm">
                  <div className="size-8 rounded-lg bg-accent flex items-center justify-center">
                    <f.icon className="size-4 text-accent-foreground" />
                  </div>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <Card className="p-6 md:p-8 shadow-elegant border-border/60 bg-gradient-card">
            <h2 className="text-2xl font-bold mb-1">ابدأ الفحص المجاني</h2>
            <p className="text-sm text-muted-foreground mb-6">
              املأ البيانات وسنرسل لك التقرير خلال أقل من دقيقة.
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="websiteUrl">رابط الموقع *</Label>
                <Input
                  id="websiteUrl"
                  required
                  dir="ltr"
                  placeholder="https://example.com"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="businessType">نوع النشاط *</Label>
                <Input
                  id="businessType"
                  required
                  placeholder="مثلاً: متجر إلكتروني، عيادة طبية، شركة محاماة"
                  value={form.businessType}
                  onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">الاسم *</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <Input
                    id="phone"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني <span className="text-muted-foreground">(اختياري)</span></Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <label className="flex items-start gap-2 text-sm leading-relaxed cursor-pointer select-none">
                <Checkbox
                  checked={form.marketingConsent}
                  onCheckedChange={(v) => setForm({ ...form, marketingConsent: v === true })}
                  className="mt-1"
                />
                <span className="text-muted-foreground">
                  أوافق على تلقي عروض Swift Mind وخدماتها عبر الواتساب أو البريد الإلكتروني.
                </span>
              </label>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-bold bg-gradient-hero hover:opacity-90 shadow-glow"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    جاري الزحف والتحليل...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-5" />
                    ابدأ الفحص
                  </span>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                قد يستغرق الفحص ٣٠-٦٠ ثانية حسب حجم الموقع
              </p>
            </form>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">ماذا يحتوي التقرير؟</h2>
          <p className="text-muted-foreground">تحليل شامل ١٣ محوراً لتعزيز ظهورك في الذكاء الاصطناعي</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Bot, t: "احتمالية اقتراح ChatGPT", d: "نسبة مئوية دقيقة لاحتمال ترشيح شركتك." },
            { icon: Globe, t: "نتيجة GEO", d: "جاهزية موقعك لمحركات البحث التوليدية." },
            { icon: TrendingUp, t: "نتيجة SEO", d: "تحليل تقني وكتابي شامل لموقعك." },
            { icon: FileText, t: "١٠ أسئلة شائعة", d: "أسئلة وأجوبة جاهزة لنشاطك التجاري." },
            { icon: Sparkles, t: "١٠ أفكار مقالات", d: "عناوين تجذب الذكاء الاصطناعي وزوارك." },
            { icon: Search, t: "خطة ٩٠ يوماً", d: "خطوات عملية شهرياً للوصول للصدارة." },
          ].map((f) => (
            <Card key={f.t} className="p-6 hover:shadow-elegant transition-all border-border/60">
              <div className="size-11 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 shadow-glow">
                <f.icon className="size-5 text-white" />
              </div>
              <h3 className="font-bold mb-2">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <Card className="p-8 md:p-10 bg-gradient-hero text-white shadow-elegant text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">للبدء في خطة العمل تواصل معنا للحجز</h3>
          <p className="opacity-95 mb-6">فريق Swift Mind جاهز للرد على استفساراتك خلال دقائق عبر الواتساب.</p>
          <a
            href={WHATSAPP_LINK("مرحباً Swift Mind، أرغب في الحجز والاستفسار عن خطط العمل")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <MessageCircle className="size-5" />
            كلمنا دلوقتي على واتساب
          </a>
        </Card>
      </section>

      <footer className="border-t border-border/50 mt-10">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Swift Mind — جميع الحقوق محفوظة
        </div>
      </footer>
      
    </div>
  );
}
