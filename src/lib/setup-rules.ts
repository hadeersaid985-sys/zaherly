import { z } from "zod";
import { competitorSchema } from "./growth-rules";

export const TRIAL_DAYS = 7;
export function trialState(expiresAt: string | null, now = Date.now()) {
  const remaining = expiresAt ? Date.parse(expiresAt) - now : 0;
  return { active: remaining > 0, daysLeft: Math.max(0, Math.ceil(remaining / 86400000)) };
}
export const setupSchema = z.object({
  website: z.string().min(3).max(500),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(2).max(500),
  country: z.string().trim().min(2).max(60),
  language: z.enum(["العربية", "الإنجليزية", "الاثنان"]),
  dialect: z.string().max(60),
  questions: z.array(z.string().trim().min(10).max(600)).min(1).max(10),
  competitors: competitorSchema.innerType().shape.competitors,
}).superRefine((value, ctx) => {
  const result = competitorSchema.safeParse({ site: value.website, competitors: value.competitors });
  if (!result.success) ctx.addIssue({ code: "custom", message: "راجع مواقع المنافسين: بحد أقصى 3 مواقع مختلفة عن موقعك" });
});
export type SiteSetup = z.infer<typeof setupSchema>;