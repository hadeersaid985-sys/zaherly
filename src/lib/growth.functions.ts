import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { competitorSchema, siteKey, PRIORITIES } from "./growth-rules";
import type { Database, Json } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type DB = SupabaseClient<Database>;
export type GrowthRecord = { id: string; kind: string; payload: Record<string, any>; created_at: string };
export async function requireTool(db: DB, userId: string, feature: "geo" | "seo" | "content") {
  const [{ data: enabled }, { data: admin }] = await Promise.all([
    db.from("customer_features").select("id").eq("user_id",userId).eq("feature",feature).maybeSingle(),
    db.rpc("has_role",{_user_id:userId,_role:"admin"}),
  ]);
  if (!enabled && !admin) throw new Error("هذه الأداة مقفلة لحسابك");
}
export const getGrowthWorkspace = createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {data,error} = await context.supabase.from("growth_records").select("id,kind,payload,created_at").eq("user_id",context.userId).in("kind",["competitor","evidence","task"]).order("created_at",{ascending:false}).limit(1000);
  if(error) throw new Error("تعذر تحميل أدوات المتابعة");
  return (data??[]) as GrowthRecord[];
});
export const saveCompetitors = createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>competitorSchema.parse(i)).handler(async ({data,context})=>{
  await requireTool(context.supabase,context.userId,"geo");
  const site=siteKey(data.site);
  const {validatePublicUrl}=await import("./crawler.server");
  for(const c of data.competitors) if(!validatePublicUrl(`https://${siteKey(c.url)}`)) throw new Error("رابط منافس غير مسموح");
  const {data: existing,error:readError}=await context.supabase.from("growth_records").select("id,payload").eq("user_id",context.userId).eq("kind","competitor").eq("payload->>site",site);
  if(readError) throw new Error("تعذر تحميل المنافسين");
  const wanted=data.competitors.map(c=>({...c,url:`https://${siteKey(c.url)}`,site}));
  const remove=(existing??[]).filter(r=>!wanted.some(c=>c.url===(r.payload as any)?.url)).map(r=>r.id);
  if(remove.length){const {error}=await context.supabase.from("growth_records").delete().eq("user_id",context.userId).in("id",remove); if(error) throw new Error("تعذر تعديل المنافسين");}
  for(const c of wanted){
    const old=existing?.find(r=>(r.payload as any)?.url===c.url);
    const query=old ? context.supabase.from("growth_records").update({payload:c}).eq("user_id",context.userId).eq("id",old.id) : context.supabase.from("growth_records").insert({user_id:context.userId,kind:"competitor",payload:c});
    const {error}=await query; if(error) throw new Error("تعذر حفظ المنافسين؛ الحد الأقصى 3 مواقع مختلفة");
  }
  return {ok:true};
});
export const runMentionMeasurement=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>z.object({site:z.string().min(3).max(500),name:z.string().trim().min(2).max(100),question:z.string().trim().min(10).max(600)}).parse(i)).handler(async({data,context})=>{
  await requireTool(context.supabase,context.userId,"geo");
  const site=siteKey(data.site);
  const {data:competitors,error}=await context.supabase.from("growth_records").select("payload").eq("user_id",context.userId).eq("kind","competitor").eq("payload->>site",site);
  if(error)throw new Error("تعذر تحميل المنافسين");
  const {measureQuestion}=await import("./ai/measurement.server");
  const result=await measureQuestion(data.question);
  const payload={...result,site,question:data.question,method:"api_web_search",brands:[{name:data.name,url:`https://${site}`},...(competitors??[]).map(c=>c.payload as {name:string;url:string})]};
  const {error:saveError}=await context.supabase.from("growth_records").insert({user_id:context.userId,kind:"evidence",payload:payload as Json});
  if(saveError)throw new Error("اكتمل القياس لكن تعذر حفظه");
  return {ok:true};
});
export const saveImprovementTask=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>z.object({id:z.string().uuid().optional(),site:z.string().min(3).max(500),reportId:z.string().uuid(),title:z.string().trim().min(3).max(800),priority:z.enum(PRIORITIES),done:z.boolean()}).parse(i)).handler(async({data,context})=>{
  await requireTool(context.supabase,context.userId,"seo");
  const {data:report}=await context.supabase.from("leads").select("id,website_url").eq("id",data.reportId).eq("user_id",context.userId).eq("status","completed").maybeSingle();
  if(!report||siteKey(report.website_url)!==siteKey(data.site))throw new Error("التقرير غير متاح لحسابك");
  const payload={site:siteKey(data.site),reportId:data.reportId,title:data.title,priority:data.priority,done:data.done,completedAt:data.done?new Date().toISOString():null};
  const query=data.id ? context.supabase.from("growth_records").update({payload}).eq("id",data.id).eq("user_id",context.userId).eq("kind","task").select("id").single() : context.supabase.from("growth_records").insert({user_id:context.userId,kind:"task",payload}).select("id").single();
  const {error}=await query;if(error)throw new Error("تعذر حفظ المهمة");return {ok:true};
});