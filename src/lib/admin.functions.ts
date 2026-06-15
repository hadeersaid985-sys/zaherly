import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("صلاحيات المسؤول مطلوبة");
}

const STAGES = ["new", "contacted", "interested", "customer", "lost"] as const;
export type LeadStage = (typeof STAGES)[number];

export const listLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().max(200).optional(),
        minScore: z.number().min(0).max(100).optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        stage: z.enum(STAGES).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let q = supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.search) {
      const s = data.search.replace(/[%_]/g, "");
      q = q.or(`email.ilike.%${s}%,name.ilike.%${s}%,website_url.ilike.%${s}%,business_type.ilike.%${s}%`);
    }
    if (typeof data.minScore === "number") q = q.gte("ai_visibility_score", data.minScore);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    if (data.stage) q = q.eq("stage", data.stage);

    const { data: leads, error } = await q;
    if (error) throw new Error(error.message);

    // Stage counts (ignoring stage filter)
    const { data: allStages } = await supabaseAdmin.from("leads").select("stage");
    const counts: Record<string, number> = { all: allStages?.length ?? 0, new: 0, contacted: 0, interested: 0, customer: 0, lost: 0 };
    (allStages ?? []).forEach((r: { stage: string | null }) => {
      const s = r.stage ?? "new";
      counts[s] = (counts[s] ?? 0) + 1;
    });

    return { leads: leads ?? [], counts };
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      stage: z.enum(STAGES).optional(),
      notes: z.string().max(5000).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const patch: { stage?: LeadStage; notes?: string | null } = {};
    if (data.stage !== undefined) patch.stage = data.stage;
    if (data.notes !== undefined) patch.notes = data.notes;
    const { error } = await supabaseAdmin.from("leads").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });



export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data, userId: context.userId };
  });

export const grantAdminBootstrap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Bootstrap: first authenticated user with no existing admin becomes admin
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) {
      throw new Error("يوجد مسؤول بالفعل");
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).min(1).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("leads").delete().in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true, count: data.ids.length };
  });

