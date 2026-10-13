import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
import searchBackground from "@/assets/search-background.jpg";
import sampleReport from "@/assets/seo_report.pdf.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "فحص الظهور في ChatGPT — ظاهرلي" },
      {
        name: "description",
        content: "اكتشف ما إذا كان ChatGPT يقترح موقعك. تحليل GEO و SEO وتقرير PDF احترافي مجاناً.",
      },
      { property: "og:title", content: "فحص الظهور في ChatGPT — ظاهرلي" },
      { property: "og:description", content: "اكتشف جاهزية موقعك للظهور في Google و ChatGPT مع تقرير GEO و SEO مجاني." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <header className="home-header sticky top-0 z-50">
        <div className="home-nav mx-auto flex items-center justify-between gap-3">
          <Link to="/" aria-label="ظاهرلي — الرئيسية" className="shrink-0"><BrandLogo className="h-12 sm:h-14 w-auto" /></Link>
          <nav aria-label="القائمة الرئيسية" className="hidden md:flex items-center gap-7 text-sm font-semibold text-muted-foreground">
            <a href="#report-features" className="hover:text-primary">ماذا يحتوي التقرير؟</a>
            <a href="#why-now" className="hover:text-primary">لماذا ظاهرلي؟</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/login">تسجيل الدخول</Link></Button>
            <Button asChild size="sm" className="h-10 px-3 sm:px-4"><a href={sampleReport.url} target="_blank" rel="noopener noreferrer"><FileSearch className="size-4" /><span className="hidden sm:inline">شاهد النتائج التي حققناها</span><span className="sm:hidden">النتائج</span></a></Button>
          </div>
        </div>
      </header>

      <section className="home-hero relative isolate overflow-hidden">
        <img src={searchBackground} alt="" width={1920} height={1024} fetchPriority="high" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="mx-auto max-w-3xl px-5 text-center">
          <div className="hero-eyebrow inline-flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="size-4" />الظهور في الذكاء الاصطناعي يبدأ من هنا</div>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.4]">ظاهرلي<span className="block text-primary">خلّي موقعك الإجابة</span><span className="block">في Google و ChatGPT</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">اعرف في 60 ثانية ليه موقعك مش ظاهر. تحليل حقيقي لموقعك وتقرير شامل يساعدك تظهر قدّام عملائك في عصر الذكاء الاصطناعي.</p>
          <div className="hero-search mx-auto mt-7 flex max-w-xl items-center gap-2 p-2">
            <Globe className="ms-2 hidden sm:block size-5 shrink-0 text-muted-foreground" />
            <Input aria-label="رابط موقعك للفحص" dir="ltr" placeholder="https://yourwebsite.com" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0" />
            <Button type="button" className="h-11 shrink-0 px-4" onClick={() => { document.getElementById("free-analysis")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); document.getElementById(form.websiteUrl ? "businessType" : "websiteUrl")?.focus({ preventScroll: true }); }}>تحليل مجاني<ArrowLeft className="size-4" /></Button>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground"><span className="flex items-center gap-1.5"><Search className="size-4 text-primary" />زحف حقيقي للموقع</span><span className="flex items-center gap-1.5"><TrendingUp className="size-4 text-primary" />تقييم GEO و SEO</span><span className="flex items-center gap-1.5"><FileText className="size-4 text-primary" />تقرير PDF كامل</span></div>
          <div className="mt-8 flex justify-center items-center gap-5 text-sm font-semibold text-muted-foreground" dir="ltr"><span>ChatGPT</span><span className="h-4 border-s border-border" /><span>Gemini</span><span className="h-4 border-s border-border" /><span>Google</span></div>
        </div>
      </section>

      <StatsSection />

      <section id="free-analysis" className="home-analysis scroll-mt-24">
        <div className="home-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 items-start">
          <div className="lg:sticky lg:top-28">
            <span className="section-kicker">خطوتك الأولى للظهور</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold leading-relaxed">كل إجابة فرصة.<br /><span className="text-primary">هل موقعك جزء منها؟</span></h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">نقوم بزحف موقعك فعلياً وتحليله بالذكاء الاصطناعي لقياس جاهزيتك للظهور في ChatGPT و Gemini وبحث الذكاء الاصطناعي.</p>
            <div className="mt-8 space-y-5">{[{ n: "01", t: "أضف موقعك وبيانات نشاطك", d: "نبدأ بتحليل صفحات موقعك ومحتواه." }, { n: "02", t: "اكتشف فرصك في الظهور", d: "تقييم GEO و SEO واحتمالية اقتراح ChatGPT." }, { n: "03", t: "استلم تقريرك وخطة العمل", d: "تقرير PDF شامل مع خطة عمل ٩٠ يوماً." }].map(item => <div key={item.n} className="flex gap-4"><span className="pt-1 text-sm font-semibold text-primary" dir="ltr">{item.n}</span><div><h3 className="font-bold">{item.t}</h3><p className="mt-1 text-sm text-muted-foreground">{item.d}</p></div></div>)}</div>
          </div>
          {/* Form */}
          <div className="analysis-form">
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
                className="w-full h-12 text-base font-bold text-primary-foreground bg-gradient-hero hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
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
          </div>
        </div>
      </section>


      {/* Features */}
      <section id="report-features" className="home-features scroll-mt-24"><div className="home-container">
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
            <Card key={f.t} className="feature-item p-6 md:p-7 transition-all hover:-translate-y-1">
              <div className="size-11 rounded-lg bg-accent flex items-center justify-center mb-5">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="font-bold mb-2">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </Card>
          ))}
        </div>
      </div></section>

      {/* Why now — SEO → GEO */}
      <ShiftSection />


      <section className="home-contact bg-primary text-primary-foreground">
        <div className="home-container flex flex-col md:flex-row items-start md:items-center justify-between gap-7">
          <div><span className="text-sm opacity-80">جاهز للخطوة الجاية؟</span><h3 className="mt-3 text-2xl md:text-3xl font-bold leading-relaxed">للبدء في خطة العمل تواصل معنا للحجز</h3><p className="mt-3 opacity-90">فريق ظاهرلي جاهز للرد على استفساراتك خلال دقائق عبر الواتساب.</p></div>
          <Button asChild variant="secondary" className="h-12 px-6 shrink-0 font-bold"><a href={WHATSAPP_LINK("مرحباً ظاهرلي، أرغب في الحجز والاستفسار عن خطط العمل")} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-5" />كلمنا دلوقتي على واتساب<ArrowLeft className="size-4" /></a></Button>
        </div>
      </section>

      <footer className="border-t border-border/50">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} جميع الحقوق محفوظة ل شركة ظاهرلي .احدى خدمات سويفت مايند
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setValue(target); return; }
    let frame = 0;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.floor(eased * target));
            if (p < 1) frame = requestAnimationFrame(tick);
            else setValue(target);
          };
          frame = requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
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
    <section className="home-stats border-y border-border/60">
      <div className="home-container grid grid-cols-2 md:grid-cols-4 gap-y-7 py-9 md:py-11">
        {stats.map((stat) => <div key={stat.l} className="stat-item text-center px-3"><div className="text-3xl md:text-4xl font-extrabold text-primary leading-none" dir="ltr"><CountUp target={stat.n} />+</div><p className="mt-3 text-xs sm:text-sm text-muted-foreground">{stat.l}</p></div>)}
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
    <section id="why-now" className="home-shift scroll-mt-24 py-16 md:py-24">
      <div className="home-container space-y-10">
        {/* Heading */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs md:text-sm">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-semibold">لماذا التصرف الآن</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            <span className="text-foreground">البحث بيتغيّر...</span>
            <br />
            <span className="text-primary">والـ AI بقى هو الدليل الجديد.</span>
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
              className="group relative overflow-hidden p-5 md:p-6 bg-card border-border/60 hover:border-primary/40 transition-all"
            >
              <div className="absolute inset-y-0 right-0 w-1 bg-gradient-hero opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="shrink-0 size-11 rounded-lg bg-accent flex items-center justify-center mb-4">
                <b.icon className="size-5 text-primary" />
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2 leading-snug">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </Card>
          ))}
        </div>


        {/* SEO → GEO */}
        <div className="p-5 md:p-6 border-y border-border text-foreground">
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
        </div>
      </div>

    </section>
  );
}
