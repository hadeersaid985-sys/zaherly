export const LEAD_STAGES = ["new", "contacted", "interested", "not_interested", "customer", "lost"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];