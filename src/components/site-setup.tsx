import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, Globe, Loader2, Sparkles, ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { saveSiteSetup, suggestSiteData, suggestSiteCompetitors, startFreeTrial } from "@/lib/setup.functions";
import { runMyAnalysis } from "@/lib/customer.functions";
import type { SiteSetup } from "@/lib/setup-rules";

const steps = ["الموقع", "السوق", "الأسئلة", "المنافسون", "ربط Google"];
const countries = ["مصر", "السعودية", "الإمارات", "الكويت", "قطر", "البحرين", "عُمان", "الأردن", "العراق", "لبنان", "المغرب", "تونس", "الجزائر", "ليبيا", "اليمن"];
export function SiteSetupWizard({ onDone }: {onDone:()=>void}) {
  const [step,setStep]=useState(0); const [busy,setBusy]=useState(false); const [confirmed,setConfirmed]=useState(false);
  const [prepared,setPrepared]=useState(false); const [sources,setSources]=useState<string[]>([]); const [custom,setCustom]=useState("");
  const [competitor,setCompetitor]=useState("");
  const [form,setForm]=useState<SiteSetup>({website:"",name:"",description:"",country:"مصر",language:"العربية",dialect:"مصرية",questions:[],competitors:[]});
  const suggest=useServerFn(suggestSiteData); const suggestRivals=useServerFn(suggestSiteCompetitors); const save=useServerFn(saveSiteSetup); const run=useServerFn(runMyAnalysis); const trial=useServerFn(startFreeTrial);
  const update=(patch:Partial<SiteSetup>)=>setForm(f=>({...f,...patch}));
  const act=async(fn:()=>Promise<void>)=>{setBusy(true);try{await fn();}catch(e){toast.error(e instanceof Error?e.message:"تعذر إكمال الخطوة");}finally{setBusy(false);}};
  const next=()=>act(async()=>{
    if(step===0){
      if(!confirmed)throw new Error("أكد أن الموقع يخصك أو يخص عميلًا تعمل له");
      await trial();
      if(!prepared){const result=await suggest({data:{website:form.website}});update({website:result.website,name:result.name,description:result.description,country:result.country||"مصر",questions:result.questions});setSources(result.sources);setPrepared(true);return;}
      if(form.name.trim().length<2||form.description.trim().length<2)throw new Error("أضف اسم النشاط ووصفه");
    }
    if(step===2&&!form.questions.length)throw new Error("اختر سؤالًا واحدًا على الأقل");
    if(step<4){setStep(step+1);return;}
    await save({data:form});
    toast.success("تم حفظ إعداد الموقع");
    await run({data:{websiteUrl:form.website,businessType:`${form.description} — ${form.country} — ${form.language} (${form.dialect})`}});
    toast.success("اكتمل أول تحليل");onDone();
  });
  return <div className="space-y-7 w-full max-w-4xl mx-auto">
    <div><p className="text-primary text-sm font-semibold mb-2">موقعك · بداية جديدة</p><h1 className="text-3xl font-bold">إعداد الموقع</h1></div>
    <ol className="grid grid-cols-5 border-b" aria-label="خطوات إعداد الموقع">{steps.map((s,i)=><li key={s} className={`pb-4 border-b-2 text-center ${i===step?"border-primary text-primary":"border-transparent text-muted-foreground"}`}><span className={`mx-auto mb-2 flex size-8 items-center justify-center rounded-md ${i<=step?"bg-primary text-primary-foreground":"bg-muted"}`}>{i<step?<Check className="size-4"/>:i+1}</span><span className="text-xs sm:text-sm">{s}</span></li>)}</ol>
    <div className="bg-card border rounded-lg p-5 sm:p-8 space-y-5">
      {step===0&&<><Globe className="size-7 text-primary"/><h2 className="text-xl font-bold">أي موقع تريد متابعته؟</h2><label className="block text-sm space-y-2"><span>عنوان موقعك</span><Input dir="ltr" placeholder="https://example.com" value={form.website} onChange={e=>{update({website:e.target.value});setPrepared(false);}}/></label><label className="flex gap-2 items-center text-sm text-muted-foreground"><Checkbox checked={confirmed} onCheckedChange={v=>setConfirmed(v===true)}/>الموقع يخصني أو يخص عميلًا أعمل له</label>
      {prepared&&<><label className="block text-sm space-y-2"><span>اسم النشاط</span><Input value={form.name} onChange={e=>update({name:e.target.value})}/></label><label className="block text-sm space-y-2"><span>ماذا يقدم موقعك؟</span><Textarea value={form.description} onChange={e=>update({description:e.target.value})}/></label><p className="text-xs text-muted-foreground">مقترح من صفحات موقعك — راجعه قبل المتابعة</p><div className="flex gap-3 flex-wrap">{sources.map((s,i)=><a className="text-primary text-xs underline" href={s} target="_blank" rel="noreferrer" key={s}>المصدر {i+1}</a>)}</div></>}
      {!prepared&&<Button variant="ghost" disabled={busy} onClick={()=>setPrepared(true)}>إدخال البيانات يدويًا</Button>}</>}
      {step===1&&<><h2 className="text-xl font-bold">أين عملاؤك، وبأي لغة يسألون؟</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{countries.map(c=><Button key={c} variant={form.country===c?"default":"outline"} onClick={()=>update({country:c})}>{c}{form.country===c&&<Check className="size-4"/>}</Button>)}</div><div className="space-y-3"><p className="text-sm font-medium">اللغة</p><div className="flex flex-wrap gap-2">{(["العربية","الإنجليزية","الاثنان"] as const).map(l=><Button key={l} size="sm" variant={form.language===l?"default":"outline"} onClick={()=>update({language:l})}>{l}</Button>)}</div><p className="text-sm font-medium">اللهجة</p><div className="flex flex-wrap gap-2">{["مصرية","فصحى","خليجية","شامية","مغاربية"].map(d=><Button key={d} size="sm" variant={form.dialect===d?"default":"outline"} onClick={()=>update({dialect:d})}>{d}</Button>)}</div></div></>}
      {step===2&&<><h2 className="text-xl font-bold">ماذا يسأل عملاؤك؟</h2><div className="space-y-2">{form.questions.map(q=><label key={q} className="flex items-start gap-3 p-3 border rounded-md bg-primary/5 text-sm"><Checkbox checked onCheckedChange={()=>update({questions:form.questions.filter(x=>x!==q)})}/><span>{q}</span></label>)}</div><label className="text-sm block space-y-2"><span>سؤالك الخاص</span><Textarea value={custom} onChange={e=>setCustom(e.target.value)}/></label><Button variant="outline" disabled={custom.trim().length<10||form.questions.length>=10} onClick={()=>{update({questions:[...new Set([...form.questions,custom.trim()])]});setCustom("");}}><Plus className="size-4"/>إضافة سؤال</Button><p className="text-xs text-muted-foreground">{form.questions.length} / 10 أسئلة</p></>}
      {step===3&&<><h2 className="text-xl font-bold">أي منافسين تريد متابعتهم؟</h2><Button variant="outline" disabled={busy} onClick={()=>act(async()=>{const rivals=await suggestRivals({data:{website:form.website,description:form.description,country:form.country}});update({competitors:rivals});toast.success(rivals.length?"راجع المنافسين المقترحين":"لم نجد منافسين موثقين؛ يمكنك إضافتهم يدويًا");})}><Sparkles className="size-4"/>اقتراح منافسين</Button><div className="flex gap-2"><Input aria-label="موقع المنافس" dir="ltr" placeholder="competitor.com" value={competitor} onChange={e=>setCompetitor(e.target.value)}/><Button variant="outline" disabled={!competitor.trim()||form.competitors.length>=3} onClick={()=>{try{const host=new URL(/^https?:/.test(competitor)?competitor:`https://${competitor}`).hostname;update({competitors:[...form.competitors,{name:host,url:`https://${host}`}]});setCompetitor("");}catch{toast.error("راجع رابط المنافس");}}}><Plus className="size-4"/>إضافة</Button></div>{form.competitors.map((c,i)=><div key={c.url} className="border-b pb-3 flex items-center gap-3"><div className="flex-1 min-w-0"><Input aria-label="اسم المنافس" value={c.name} onChange={e=>update({competitors:form.competitors.map((x,j)=>j===i?{...x,name:e.target.value}:x)})}/><a href={c.url} target="_blank" rel="noreferrer" dir="ltr" className="block text-xs text-primary mt-1 truncate">{c.url}</a></div><Button aria-label="حذف المنافس" variant="ghost" size="icon" onClick={()=>update({competitors:form.competitors.filter((_,j)=>j!==i)})}><X className="size-4"/></Button></div>)}<p className="text-xs text-muted-foreground">{form.competitors.length} / 3 · يمكنك تخطي هذه الخطوة</p></>}
      {step===4&&<><h2 className="text-xl font-bold">ربط Google</h2><div className="grid sm:grid-cols-2 gap-4">{["Google Search Console","Google Analytics"].map(s=><div key={s} className="border rounded-md p-4 space-y-3"><Globe className="size-6 text-primary"/><h3 className="font-semibold">{s}</h3><Button variant="outline" disabled>بانتظار إعداد Google</Button></div>)}</div><p className="text-sm text-muted-foreground">الربط اختياري ويحتاج موافقتك على حساب Google. يمكنك بدء التحليل بدون الربط.</p><div className="border-t pt-4 text-sm space-y-2"><p dir="ltr">{form.website}</p><p>{form.country} · {form.language} · {form.questions.length} أسئلة · {form.competitors.length} منافسين</p></div></>}
    </div>
    <div className="flex justify-between gap-3"><Button variant="outline" disabled={step===0||busy} onClick={()=>setStep(s=>s-1)}><ArrowRight className="size-4"/>رجوع</Button><Button disabled={busy} onClick={next}>{busy?<><Loader2 className="size-4 animate-spin"/>جاري {step===4?"التحليل":"التجهيز"}…</>:step===4?"ابدأ أول تحليل":step===0&&!prepared?"اقرأ بيانات موقعي":"التالي"}<ArrowLeft className="size-4"/></Button></div>
  </div>;
}