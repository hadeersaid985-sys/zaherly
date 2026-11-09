import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Home, FileText, Globe, Zap, PenTool, CreditCard, Lock, LogOut, Shield, Loader2, ExternalLink, Copy, Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { SiteSetupWizard } from "@/components/site-setup";
import { startFreeTrial, getSiteSetups } from "@/lib/setup.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WHATSAPP_LINK, PRICING } from "@/lib/contact";
import {
  getMyDashboard, runMyAnalysis, generateContent, listMyContent, adminListCustomers, adminSetFeature, type Feature,
} from "@/lib/customer.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة العميل — ظاهرلي" },
      { name: "description", content: "تابع تقاريرك وأدوات GEO و SEO وكاتب المحتوى الذكي من لوحة ظاهرلي." },
      { property: "og:title", content: "لوحة العميل — ظاهرلي" },
      { property: "og:description", content: "تقاريرك وأدواتك في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

type Tab = "overview" | "reports" | "geo" | "seo" | "content" | "billing" | "customers" | "setup";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const fetchDash = useServerFn(getMyDashboard);
  const beginTrial = useServerFn(startFreeTrial);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["my-dashboard"], queryFn: () => fetchDash() });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const has = (f: Feature) => !!data && (data.isAdmin || data.trial.active || data.features.includes(f));

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  const nav: { group: string; items: { id: Tab; label: string; icon: typeof Home; feature?: Feature }[] }[] = [
    { group: "الرئيسية", items: [{ id: "overview", label: "نظرة عامة", icon: Home }, { id: "setup", label: "إضافة موقع", icon: Globe }] },
    { group: "التقارير", items: [{ id: "reports", label: "تقاريري", icon: FileText }] },
    { group: "قياس", items: [{ id: "geo", label: "تحليل GEO", icon: Globe, feature: "geo" }, { id: "seo", label: "وكيل SEO", icon: Zap, feature: "seo" }] },
    { group: "تنفيذ", items: [{ id: "content", label: "كاتب المحتوى الذكي", icon: PenTool, feature: "content" }] },
    { group: "الحساب", items: [{ id: "billing", label: "الخطط والفوترة", icon: CreditCard }] },
  ];
  if (data?.isAdmin) nav.push({ group: "الإدارة", items: [{ id: "customers", label: "العملاء والصلاحيات", icon: Shield }] });

  const latest = data?.reports.find((r) => r.status === "completed");

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      <aside className="md:w-64 bg-card border-e md:min-h-screen flex flex-col">
        <Link to="/" className="p-4 border-b flex justify-center"><BrandLogo className="h-12 w-auto" /></Link>
        <nav className="flex-1 p-3 space-y-4 overflow-x-auto flex md:block gap-2">
          {nav.map((g) => (
            <div key={g.group} className="shrink-0">
              <div className="hidden md:block text-xs text-muted-foreground px-2 mb-1">{g.group}</div>
              {g.items.map((it) => {
                const locked = it.feature && !has(it.feature);
                return (
                  <button key={it.id} onClick={() => setTab(it.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${tab === it.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}>
                    <it.icon className="size-4" /> <span className="flex-1 text-start">{it.label}</span>
                    {locked && <Lock className="size-3 text-muted-foreground" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t text-xs space-y-2">
          <div className="text-muted-foreground truncate" dir="ltr">{data?.email}</div>
          {data?.isAdmin && <Link to="/admin" className="block text-primary hover:underline">لوحة العملاء المحتملين</Link>}
          <button onClick={signOut} className="flex items-center gap-1 text-destructive"><LogOut className="size-3" /> تسجيل الخروج</button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8">
        {data && <div className="mb-7 flex flex-wrap gap-3 items-center justify-between border-b border-primary/20 bg-primary/5 p-4 text-sm"><div>{data.trial.active ? <><strong className="text-primary">تجربتك المجانية: باقي {data.trial.daysLeft} أيام</strong><span className="text-muted-foreground"> · تنتهي {new Date(data.trial.expiresAt ?? "").toLocaleDateString("ar-EG")}</span></> : data.trial.startedAt ? <strong>انتهت تجربتك المجانية</strong> : <strong>جرّب ظاهرلي على موقعك 7 أيام ببلاش</strong>}</div>{!data.trial.startedAt ? <Button size="sm" onClick={async()=>{try{await beginTrial();await refetch();setTab("setup");}catch(e){toast.error(e instanceof Error?e.message:"تعذر بدء التجربة");}}}>ابدأ التجربة المجانية</Button> : <Button variant="outline" size="sm" onClick={()=>setTab("billing")}>الاشتراك الآن</Button>}</div>}
        {isLoading || !data ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : tab === "setup" ? (
          <SiteSetupWizard onDone={()=>{refetch();qc.invalidateQueries({queryKey:["site-setups"]});setTab("reports");}} />
        ) : tab === "overview" ? (
          <Overview latest={latest} count={data.reports.length} onNew={() => setTab("setup")} />
        ) : tab === "reports" ? (
          <Reports reports={data.reports} onDone={() => refetch()} onSetup={()=>setTab("setup")} />
        ) : tab === "geo" ? (
          has("geo") ? <RecList title="تحليل GEO" latest={latest} pick={(r) => r.geoRecommendations} score={latest?.geo_score} /> : <Locked name="تحليل GEO" />
        ) : tab === "seo" ? (
          has("seo") ? <RecList title="وكيل SEO" latest={latest} pick={(r) => r.seoRecommendations} score={latest?.seo_score} /> : <Locked name="وكيل SEO" />
        ) : tab === "content" ? (
          has("content") ? <ContentWriter business={latest?.business_type} /> : <Locked name="كاتب المحتوى الذكي" />
        ) : tab === "billing" ? (
          <Billing features={data.features} />
        ) : (
          <Customers />
        )}
      </main>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number | null | undefined }) {
  const v = value ?? 0;
  const color = v >= 70 ? "text-green-600" : v >= 40 ? "text-amber-500" : "text-destructive";
  return (
    <Card className="p-4 text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value ?? "—"}</div>
      <div className="text-xs text-muted-foreground">/100</div>
    </Card>
  );
}

function Overview({ latest, count, onNew }: { latest: any; count: number; onNew: () => void }) {
  if (!latest)
    return (
      <Card className="p-10 text-center space-y-4">
        <h1 className="text-2xl font-bold">أهلاً بك في ظاهرلي 👋</h1>
        <p className="text-muted-foreground">ابدأ أول فحص لموقعك لمعرفة مدى ظهورك في الذكاء الاصطناعي.</p>
        <Button className="bg-gradient-hero" onClick={onNew}>ابدأ الفحص</Button>
      </Card>
    );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نظرة عامة</h1>
        <p className="text-sm text-muted-foreground" dir="ltr">{latest.website_url}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Score label="الظهور في AI" value={latest.ai_visibility_score} />
        <Score label="GEO" value={latest.geo_score} />
        <Score label="SEO" value={latest.seo_score} />
        <Score label="المحتوى" value={latest.content_score} />
        <Score label="السلطة" value={latest.authority_score} />
      </div>
      {latest.report?.summary && <Card className="p-5"><h2 className="font-bold mb-2">الملخص</h2><p className="text-sm leading-7">{latest.report.summary}</p></Card>}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5"><h3 className="font-bold mb-2 text-green-600">نقاط القوة</h3><ul className="text-sm space-y-1 list-disc ps-5">{(latest.report?.strengths ?? []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></Card>
        <Card className="p-5"><h3 className="font-bold mb-2 text-destructive">نقاط الضعف</h3><ul className="text-sm space-y-1 list-disc ps-5">{(latest.report?.weaknesses ?? []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></Card>
      </div>
      <p className="text-xs text-muted-foreground">عدد التقارير: {count}</p>
    </div>
  );
}

function Reports({ reports, onDone, onSetup }: { reports: any[]; onDone: () => void; onSetup:()=>void }) {
  const run = useServerFn(runMyAnalysis);
  const fetchSetups = useServerFn(getSiteSetups);
  const {data:setups}=useQuery({queryKey:["site-setups"],queryFn:()=>fetchSetups()});
  const [url, setUrl] = useState(""); const [biz, setBiz] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await run({ data: { websiteUrl: url, businessType: biz } }); toast.success("تم إنشاء التقرير"); setUrl(""); onDone(); }
    catch (err) { toast.error(err instanceof Error ? err.message : "تعذر الفحص"); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تقاريري</h1>
      <Button variant="outline" onClick={onSetup}><Globe className="size-4"/>إعداد موقع جديد</Button>
      <Card className="p-5">
        <form onSubmit={submit} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
          <select aria-label="الموقع المُعد للتحليل" className="h-10 border rounded-md bg-background px-3 min-w-0" required value={url} onChange={e=>{setUrl(e.target.value);const setup=setups?.find(s=>`https://${s.site}`===e.target.value);const payload=setup?.payload;if(payload&&typeof payload==="object"&&!Array.isArray(payload))setBiz(typeof payload.description==="string"?payload.description:"");}}><option value="">اختر موقعًا مُعدًا للتحليل</option>{setups?.filter(s=>s.completed_at).map(s=><option value={`https://${s.site}`} key={s.id}>{s.site}</option>)}</select>
          <Input required placeholder="نوع النشاط" value={biz} onChange={(e) => setBiz(e.target.value)} />
          <Button disabled={loading} className="bg-gradient-hero">{loading ? <><Loader2 className="size-4 animate-spin" /> جاري الفحص (دقيقة تقريباً)</> : "فحص جديد"}</Button>
        </form>
      </Card>
      <div className="space-y-2">
        {reports.length === 0 && <p className="text-sm text-muted-foreground">لا توجد تقارير بعد.</p>}
        {reports.map((r) => (
          <Card key={r.id} className="p-4 flex items-center gap-4">
            <div className="text-2xl font-bold w-14 text-center">{r.ai_visibility_score ?? "—"}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate" dir="ltr">{r.website_url}</div>
              <div className="text-xs text-muted-foreground">{r.business_type} · {new Date(r.created_at).toLocaleDateString("ar-EG")} · {r.status === "completed" ? "مكتمل" : r.status === "failed" ? "فشل" : "قيد المعالجة"}</div>
            </div>
            {r.status === "completed" && <Link to="/report/$id" params={{ id: r.id }} className="text-primary text-sm inline-flex items-center gap-1">فتح <ExternalLink className="size-3" /></Link>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function RecList({ title, latest, pick, score }: { title: string; latest: any; pick: (r: any) => string[] | undefined; score: number | null | undefined }) {
  if (!latest) return <Card className="p-8 text-center text-muted-foreground">اعمل فحصاً أولاً من "تقاريري".</Card>;
  const recs = pick(latest.report) ?? [];
  const plan = latest.report?.actionPlan;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="max-w-[180px]"><Score label="النتيجة" value={score} /></div>
      <Card className="p-5"><h2 className="font-bold mb-3">التوصيات</h2>
        <ol className="space-y-2">{recs.map((r, i) => <li key={i} className="flex gap-3 text-sm"><span className="size-6 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>{r}</li>)}</ol>
      </Card>
      {plan && (
        <div className="grid md:grid-cols-3 gap-4">
          {(["days30", "days60", "days90"] as const).map((k, i) => (
            <Card key={k} className="p-5"><h3 className="font-bold mb-2">خلال {[30, 60, 90][i]} يوم</h3><ul className="text-sm list-disc ps-5 space-y-1">{(plan[k] ?? []).map((s: string, j: number) => <li key={j}>{s}</li>)}</ul></Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentWriter({ business }: { business?: string }) {
  const gen = useServerFn(generateContent);
  const list = useServerFn(listMyContent);
  const { data: items, refetch } = useQuery({ queryKey: ["my-content"], queryFn: () => list() });
  const [kind, setKind] = useState<"article" | "faq" | "landing" | "social">("article");
  const [topic, setTopic] = useState(""); const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null); const [copied, setCopied] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { const row = await gen({ data: { kind, topic, business } }); setOpen(row.id); setTopic(""); refetch(); }
    catch (err) { toast.error(err instanceof Error ? err.message : "تعذر التوليد"); }
    finally { setLoading(false); }
  };
  const kinds = { article: "مقال", faq: "أسئلة شائعة", landing: "صفحة هبوط", social: "سوشيال" };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">كاتب المحتوى الذكي</h1>
      <Card className="p-5">
        <form onSubmit={submit} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(kinds) as (keyof typeof kinds)[]).map((k) => (
              <button type="button" key={k} onClick={() => setKind(k)} className={`px-3 py-1.5 rounded-full text-sm border ${kind === k ? "bg-primary text-primary-foreground border-primary" : ""}`}>{kinds[k]}</button>
            ))}
          </div>
          <Textarea required minLength={3} placeholder="عن ماذا تريد أن نكتب؟" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <Button disabled={loading} className="bg-gradient-hero">{loading ? <><Loader2 className="size-4 animate-spin" /> جاري الكتابة...</> : "اكتب المحتوى"}</Button>
        </form>
      </Card>
      <div className="space-y-2">
        {(items ?? []).map((it) => (
          <Card key={it.id} className="p-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setOpen(open === it.id ? null : it.id)}>
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{kinds[it.kind as keyof typeof kinds] ?? it.kind}</span>
              <span className="flex-1 font-medium truncate">{it.topic}</span>
              <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(it.body); setCopied(it.id); setTimeout(() => setCopied(null), 1500); }}>
                {copied === it.id ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
              </button>
            </div>
            {open === it.id && <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 font-sans">{it.body}</pre>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Locked({ name }: { name: string }) {
  return (
    <Card className="p-10 text-center space-y-4">
      <Lock className="size-10 mx-auto text-muted-foreground" />
      <h2 className="text-xl font-bold">{name} مقفلة</h2>
      <p className="text-muted-foreground text-sm">اشترك في إحدى الخطط وتواصل معنا لفتح الأداة لحسابك.</p>
      <Button asChild className="bg-gradient-hero"><a href={WHATSAPP_LINK(`أريد فتح أداة ${name} لحسابي`)} target="_blank" rel="noreferrer">تواصل على واتساب</a></Button>
    </Card>
  );
}

function Billing({ features }: { features: string[] }) {
  const plans = [
    { name: "التجربة المجانية — 7 أيام", price: "0", items: ["إعداد موقعك", "تحليل GEO و SEO", "كاتب المحتوى الذكي"], msg: "" },
    { name: `خطة ${PRICING.plan30.days} يوم — الانطلاق`, price: `${PRICING.plan30.price.toLocaleString("ar-EG")} ${PRICING.plan30.currency}`, items: ["تحليل GEO", "وكيل SEO"], msg: "أريد الاشتراك في خطة الانطلاق" },
    { name: `خطة ${PRICING.plan60.days} يوم — التوسع`, price: `${PRICING.plan60.price.toLocaleString("ar-EG")} ${PRICING.plan60.currency} / شهرياً`, items: ["تحليل GEO", "وكيل SEO", "كاتب المحتوى الذكي"], msg: "أريد الاشتراك في خطة التوسع" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الخطط والفوترة</h1>
      <p className="text-sm text-muted-foreground">الأدوات المفعّلة لحسابك: {features.length ? features.join("، ") : "لا يوجد"}</p>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p.name} className="p-6 flex flex-col">
            <h3 className="font-bold">{p.name}</h3>
            <div className="text-2xl font-bold my-3">{p.price}</div>
            <ul className="text-sm space-y-1 flex-1 mb-4">{p.items.map((i) => <li key={i}>✓ {i}</li>)}</ul>
            {p.msg && <Button asChild className="bg-gradient-hero"><a href={WHATSAPP_LINK(p.msg)} target="_blank" rel="noreferrer">اشترك الآن</a></Button>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Customers() {
  const list = useServerFn(adminListCustomers);
  const set = useServerFn(adminSetFeature);
  const { data, refetch, isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: () => list() });
  const labels: Record<Feature, string> = { geo: "GEO", seo: "SEO", content: "المحتوى" };
  const toggle = async (userId: string, feature: Feature, enabled: boolean) => {
    try { await set({ data: { userId, feature, enabled } }); refetch(); } catch (e) { toast.error(e instanceof Error ? e.message : "خطأ"); }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">العملاء والصلاحيات</h1>
      <p className="text-sm text-muted-foreground">فعّل الأدوات لكل عميل بعد اشتراكه.</p>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <Card className="divide-y">
          {(data ?? []).map((u) => (
            <div key={u.id} className="p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]"><div className="font-medium" dir="ltr">{u.email}</div><div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("ar-EG")}</div></div>
              {(Object.keys(labels) as Feature[]).map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <Switch checked={u.features.includes(f)} onCheckedChange={(v) => toggle(u.id, f, v)} /> {labels[f]}
                </label>
              ))}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
