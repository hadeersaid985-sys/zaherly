import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { WHATSAPP_LINK } from "@/lib/contact";
import { MessageCircle, ArrowLeft, BarChart3, Wrench, BadgeCheck, Users, Percent, Palette, Languages, Headphones, FileText } from "lucide-react";

export const Route = createFileRoute("/agencies")({
  head: () => ({
    meta: [
      { title: "شراكة الوكالات — ظاهرلي" },
      { name: "description", content: "قدّم لعملائك ظهوراً في محركات الذكاء الاصطناعي مع ظاهرلي، بهامش ربح متكرر ينمو مع محفظتك." },
      { property: "og:title", content: "شراكة الوكالات — ظاهرلي" },
      { property: "og:description", content: "أدِر ظهور عملائك في ChatGPT وGemini وGoogle AI مع ظاهرلي، بعمولة متكررة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgenciesPage,
});

const PARTNER_MSG = "مرحباً ظاهرلي، أرغب في الانضمام لبرنامج شراكة الوكالات";

const tiers = [
  { name: "شريك مبتدئ", clients: "1 – 5 عملاء", margin: "15%" },
  { name: "شريك نمو", clients: "6 – 20 عميل", margin: "25%", featured: true },
  { name: "شريك استراتيجي", clients: "+20 عميل", margin: "35%" },
];

const steps = [
  { icon: BarChart3, title: "قِس", text: "تقرير مجاني لكل عميل يوضح ظهوره في ChatGPT وGemini وGoogle AI مقارنة بمنافسيه." },
  { icon: Wrench, title: "نفّذ", text: "خطة إصلاح مرتبة بالأولوية: محتوى، بيانات منظمة، وتحسينات SEO وGEO." },
  { icon: BadgeCheck, title: "أثبت", text: "تقارير شهرية بأرقام العميل نفسه تثبت التحسن وتبرر التجديد." },
];

const perks = [
  { icon: Percent, title: "عمولة متكررة", text: "تكسب شهرياً طول ما عميلك مشترك." },
  { icon: Palette, title: "تقارير باسمك", text: "قدّم التقارير بهوية وكالتك." },
  { icon: Languages, title: "عربي وإنجليزي", text: "مصمم للسوق العربي من الأساس." },
  { icon: Users, title: "لوحة عملاء موحدة", text: "تابع كل عملائك من مكان واحد." },
  { icon: Headphones, title: "دعم مخصص", text: "فريق ظاهرلي معاك على الواتساب." },
  { icon: FileText, title: "مواد بيع جاهزة", text: "عروض وقوالب تساعدك تقفل العميل." },
];

function AgenciesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <header className="home-header sticky top-0 z-50">
        <div className="home-container flex items-center justify-between gap-3 py-3">
          <Link to="/" aria-label="ظاهرلي — الرئيسية"><BrandLogo className="h-12 sm:h-14 w-auto" /></Link>
          <Button asChild size="sm" className="h-10"><Link to="/">تحليل مجاني<ArrowLeft className="size-4" /></Link></Button>
        </div>
      </header>

      <main>
        <section className="home-container py-20 sm:py-28 text-center">
          <span className="hero-eyebrow inline-block mb-5">للوكالات · بالعربي والإنجليزي</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight max-w-4xl mx-auto">
            أدِر ظهور عملائك في الذكاء الاصطناعي — <span className="text-primary">بهامش ربح متكرر</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            ظاهرلي يدي وكالتك القياس والتنفيذ والإثبات على أرقام عملائك أنفسهم، مع عمولة بتكبر كل ما محفظتك تكبر.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 font-bold bg-gradient-hero"><a href={WHATSAPP_LINK(PARTNER_MSG)} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-5" />قدّم لتصبح شريكاً</a></Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6"><a href="#how">إزاي بيشتغل؟</a></Button>
          </div>
        </section>

        <section className="home-container pb-20">
          <p className="section-kicker text-center">اقتصاديات الشراكة</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-center mt-2">سلّم الهوامش</h2>
          <p className="text-center text-muted-foreground mt-3">عمولتك بتزيد مع عدد العملاء النشطين.</p>
          <div className="grid gap-5 md:grid-cols-3 mt-10">
            {tiers.map((t) => (
              <Card key={t.name} className={`p-7 text-center ${t.featured ? "border-primary border-2 shadow-lg" : ""}`}>
                <h3 className="font-bold text-lg">{t.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{t.clients}</p>
                <p className="text-5xl font-extrabold text-primary my-5">{t.margin}</p>
                <p className="text-sm text-muted-foreground">عمولة شهرية متكررة</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="how" className="home-container pb-20 scroll-mt-24">
          <p className="section-kicker text-center">إزاي بيشتغل</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-center mt-2">قِس · نفّذ · أثبت</h2>
          <div className="grid gap-5 md:grid-cols-3 mt-10">
            {steps.map((s, i) => (
              <Card key={s.title} className="p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid place-items-center size-11 rounded-xl bg-primary text-primary-foreground"><s.icon className="size-5" /></span>
                  <span className="text-sm text-muted-foreground font-semibold">الخطوة {i + 1}</span>
                </div>
                <h3 className="font-bold text-xl">{s.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">{s.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="home-container pb-20">
          <h2 className="text-2xl sm:text-4xl font-bold text-center">ليه تشارك ظاهرلي؟</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-10">
            {perks.map((p) => (
              <div key={p.title} className="feature-item flex gap-4 p-5 rounded-2xl border bg-card">
                <p.icon className="size-6 text-primary shrink-0" />
                <div><h3 className="font-bold">{p.title}</h3><p className="text-sm text-muted-foreground mt-1">{p.text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-container pb-24">
          <div className="bg-gradient-hero text-primary-foreground rounded-3xl p-10 sm:p-14 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold">جاهز تكبّر دخل وكالتك؟</h2>
            <p className="mt-3 opacity-90">فريق ظاهرلي هيرد عليك خلال دقائق على الواتساب.</p>
            <Button asChild size="lg" variant="secondary" className="mt-7 h-12 px-6 font-bold"><a href={WHATSAPP_LINK(PARTNER_MSG)} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-5" />كلمنا على واتساب</a></Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} جميع الحقوق محفوظة ل شركة ظاهرلي .احدى خدمات سويفت مايند
      </footer>
    </div>
  );
}
