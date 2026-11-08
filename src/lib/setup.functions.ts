import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { siteKey } from "./growth-rules";
import { setupSchema } from "./setup-rules";

export const getSiteSetups = createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data,error}=await context.supabase.from("site_setups").select("id,site,payload,completed_at").eq("user_id",context.userId).order("created_at",{ascending:false});
  if(error)throw new Error("تعذر تحميل إعدادات المواقع");
  return data ?? [];
});
export const startFreeTrial = createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
  const {error}=await supabaseAdmin.from("customer_trials").upsert({user_id:context.userId},{onConflict:"user_id",ignoreDuplicates:true});
  if(error)throw new Error("تعذر بدء التجربة المجانية");
  const {getTrial}=await import("./trial.server");
  return getTrial(context.supabase,context.userId);
});
export const suggestSiteData=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>z.object({website:z.string().min(3).max(500)}).parse(i)).handler(async({data,context})=>{
  const {getTrial}=await import("./trial.server");
  const trial=await getTrial(context.supabase,context.userId);
  const {data:feature}=await context.supabase.from("customer_features").select("id").eq("user_id",context.userId).limit(1);
  const {data:admin}=await context.supabase.rpc("has_role",{_user_id:context.userId,_role:"admin"});
  if(!trial.active&&!feature?.length&&!admin)throw new Error("ابدأ التجربة المجانية أو فعّل اشتراكك أولًا");
  const {suggestSite}=await import("./setup-ai.server");
  return suggestSite(data.website);
});
export const suggestSiteCompetitors=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>z.object({website:z.string().min(3).max(500),description:z.string().min(2).max(500),country:z.string().min(2).max(60)}).parse(i)).handler(async({data,context})=>{
  const {requireTool}=await import("./growth.functions");
  await requireTool(context.supabase,context.userId,"geo");
  const {suggestCompetitors}=await import("./setup-ai.server");
  return suggestCompetitors(siteKey(data.website),data.description,data.country);
});
export const saveSiteSetup=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>setupSchema.parse(i)).handler(async({data,context})=>{
  const site=siteKey(data.website);
  const {validatePublicUrl}=await import("./crawler.server");
  if(!validatePublicUrl(`https://${site}`)||data.competitors.some(c=>!validatePublicUrl(`https://${siteKey(c.url)}`)))throw new Error("راجع روابط المواقع");
  const {data:row,error}=await context.supabase.from("site_setups").upsert({user_id:context.userId,site,payload:data,completed_at:new Date().toISOString()},{onConflict:"user_id,site"}).select("id").single();
  if(error||!row)throw new Error("تعذر حفظ إعداد الموقع");
  return {id:row.id};
});