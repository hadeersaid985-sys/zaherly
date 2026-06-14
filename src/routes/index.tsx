import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { startAnalysis } from "@/lib/analyze.functions";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { WHATSAPP_LINK } from "@/lib/contact";
import { Sparkles, Search, FileText, Bot, TrendingUp, Globe, MessageCircle, FileSearch, MousePointerClick, Clock, Languages, ArrowLeft } from "lucide-react";
import sampleReport from "@/assets/seo_report.pdf.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "فحص الظهور في ChatGPT — ظاهرلي" },
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
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center min-w-0">
            <BrandLogo className="h-10 sm:h-12 md:h-14 w-auto" />
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary font-semibold shrink-0"
          >
            <a href={sampleReport.url} target="_blank" rel="noopener noreferrer">
              <FileSearch className="size-4" />
              <span className="hidden xs:inline sm:inline">شاهد النتائج التي حققناها</span>
              <span className="xs:hidden sm:hidden">النتائج</span>
            </a>
          </Button>
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
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-aurora drop-shadow-[0_2px_20px_rgba(37,99,235,0.25)]">
              اعرف في 60 ثانية ليه موقعك مش ظاهر في Google و ChatGPT
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
                  <Label htmlFor="phone">رقم الجوال *</Label>
                  <Input
                    id="phone"
                    dir="ltr"
                    required
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
                  أوافق على تلقي عروض ظاهرلي وخدماتها عبر الواتساب أو البريد الإلكتروني.
                </span>
              </label>
              <Button
                type="submit"
                disabled={loading || !form.marketingConsent}
                className="w-full h-12 text-base font-bold text-white shadow-glow bg-gradient-hero hover:opacity-90 disabled:opacity-60"
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

      {/* Stats */}
      <StatsSection />

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

      {/* Why now — SEO → GEO */}
      <ShiftSection />


      <section className="container mx-auto px-4 pb-16">
        <Card className="p-8 md:p-10 bg-gradient-hero text-white shadow-elegant text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">للبدء في خطة العمل تواصل معنا للحجز</h3>
          <p className="opacity-95 mb-6">فريق ظاهرلي جاهز للرد على استفساراتك خلال دقائق عبر الواتساب.</p>
          <a
            href={WHATSAPP_LINK("مرحباً ظاهرلي، أرغب في الحجز والاستفسار عن خطط العمل")}
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
          © {new Date().getFullYear()} ظاهرلي — جميع الحقوق محفوظة
        </div>
      </footer>
      
    </div>
  );
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.floor(eased * target));
            if (p < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{value.toLocaleString("en-US")}</span>;
}

function StatsSection() {
  const stats = [
    { n: 3850, l: "تدقيق ظهور في الذكاء الاصطناعي" },
    { n: 3000, l: "شركة في أكثر من 30 قطاع" },
    { n: 1750, l: "شركة مسجلة" },
    { n: 900, l: "شركة نشطة" },
  ];
  return (
    <section className="relative overflow-hidden border-y border-border/50">
      <div className="absolute inset-0 bg-gradient-hero opacity-[0.08] -z-10" />
      <div className="absolute -top-20 right-1/4 size-72 rounded-full bg-primary-glow/20 blur-3xl -z-10" />
      <div className="absolute -bottom-20 left-1/4 size-72 rounded-full bg-primary/20 blur-3xl -z-10" />
      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s) => (
            <Card
              key={s.l}
              className="p-5 md:p-6 text-center bg-gradient-card border-border/60 hover:shadow-elegant hover:-translate-y-1 transition-all"
            >
              <div className="text-3xl md:text-5xl font-extrabold mb-2 text-aurora leading-none">
                +<CountUp target={s.n} />
              </div>
              <div className="text-xs md:text-sm text-muted-foreground leading-relaxed">{s.l}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShiftSection() {
  const boxes = [
    {
      icon: MousePointerClick,
      title: "60% من عمليات البحث تنتهي بدون زيارة مواقع",
      desc: "لأن المستخدم بياخد الإجابة مباشرة من أدوات الذكاء الاصطناعي.",
    },
    {
      icon: Clock,
      title: "خلال آخر 24 شهر، اعتماد المستخدمين على AI تضاعف بشكل كبير",
      desc: "وبقى مصدر أساسي للبحث واتخاذ القرار.",
    },
    {
      icon: Languages,
      title: "المحتوى العربي لسه عنده فرصة ضخمة للسيطرة",
      desc: "واللي يبدأ بدري في GEO يقدر يبني وجود قوي قبل المنافسة تزيد.",
    },
  ];
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-hero opacity-[0.06] -z-10" />
      <div className="absolute top-1/3 -right-40 size-96 rounded-full bg-primary-glow/20 blur-3xl -z-10" />
      <div className="absolute bottom-0 -left-40 size-96 rounded-full bg-primary/20 blur-3xl -z-10" />

      <div className="container mx-auto px-4 space-y-10">
        {/* Heading */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs md:text-sm">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-semibold">لماذا التصرف الآن</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            <span className="text-foreground">البحث بيتغيّر...</span>
            <br />
            <span className="text-aurora">والـ AI بقى هو الدليل الجديد.</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            السيو التقليدي كان هدفه إنك تظهر في نتائج البحث. لكن دلوقتي، الذكاء
            الاصطناعي بقى بيختصر الطريق ويجاوب مباشرة. ولو موقعك مش مجهز صح،
            ممكن المنافسين يظهروا مكانك.
          </p>
        </div>

        {/* Boxes */}
        <div className="grid md:grid-cols-3 gap-4">
          {boxes.map((b, i) => (
            <Card
              key={i}
              className="group relative overflow-hidden p-5 md:p-6 bg-gradient-card border-border/60 hover:border-primary/40 hover:shadow-elegant transition-all"
            >
              <div className="absolute inset-y-0 right-0 w-1 bg-gradient-hero opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="shrink-0 size-11 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow mb-4">
                <b.icon className="size-5 text-white" />
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2 leading-snug">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </Card>
          ))}
        </div>


        {/* SEO → GEO */}
        <Card className="p-5 md:p-6 bg-gradient-hero text-white shadow-elegant border-0">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 text-center">
            <div className="flex items-center gap-2">
              <span className="line-through opacity-70 text-lg md:text-xl font-bold">SEO</span>
              <span className="text-xs md:text-sm opacity-80">انتهى كفاية لوحده</span>
            </div>
            <ArrowLeft className="size-5 opacity-80" />
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-extrabold">GEO</span>
              <span className="text-xs md:text-sm opacity-90 font-semibold">هو المستقبل</span>
            </div>
          </div>
        </Card>
      </div>

    </section>
  );
}

function StatBlock({ kicker, value, text }: { kicker: string; value: string; text: string }) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-hero opacity-10 blur-2xl rounded-3xl -z-10" />
      <div className="flex items-center gap-2 mb-3">
        <span className="h-px w-8 bg-primary" />
        <span className="text-xs md:text-sm font-bold text-primary tracking-wide">{kicker}</span>
      </div>
      <div className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-aurora leading-none mb-4 drop-shadow-[0_2px_20px_rgba(37,99,235,0.25)]">
        {value}
      </div>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">{text}</p>
    </div>
  );
}

