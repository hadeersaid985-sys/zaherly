import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { trialState } from "./setup-rules";

export async function getTrial(db: SupabaseClient<Database>, userId: string) {
  const { data, error } = await db.from("customer_trials").select("started_at,expires_at").eq("user_id", userId).maybeSingle();
  if (error) throw new Error("تعذر قراءة التجربة المجانية");
  return { ...trialState(data?.expires_at ?? null), startedAt: data?.started_at ?? null, expiresAt: data?.expires_at ?? null };
}