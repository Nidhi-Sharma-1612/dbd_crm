export const LEAD_STATUSES = ["NEW", "INTERESTED", "NOT_INTERESTED", "DO_NOT_CALL", "CALLBACK"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  INTERESTED: "Interested",
  NOT_INTERESTED: "Not Interested",
  DO_NOT_CALL: "Do Not Call",
  CALLBACK: "Callback",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-zinc-100 text-zinc-700",
  INTERESTED: "bg-green-100 text-green-700",
  NOT_INTERESTED: "bg-zinc-200 text-zinc-600",
  DO_NOT_CALL: "bg-red-100 text-red-700",
  CALLBACK: "bg-amber-100 text-amber-700",
};

// Softer tint used for icon badges (page headers, KPI cards) — same hue family
// as STATUS_COLORS but lighter, since those badges sit on white cards.
export const STATUS_ICON_BG: Record<LeadStatus, string> = {
  NEW: "bg-zinc-100 text-zinc-600",
  INTERESTED: "bg-green-50 text-green-600",
  NOT_INTERESTED: "bg-zinc-100 text-zinc-500",
  DO_NOT_CALL: "bg-red-50 text-red-600",
  CALLBACK: "bg-amber-50 text-amber-600",
};

// URL slug <-> enum mapping for /lists/[status] routes. Excludes NEW since it's a
// pre-triage state, not one of the four list views requested in the doc.
export const LIST_SLUGS: Record<string, LeadStatus> = {
  interested: "INTERESTED",
  "not-interested": "NOT_INTERESTED",
  "do-not-call": "DO_NOT_CALL",
  callback: "CALLBACK",
};

export function slugToStatus(slug: string): LeadStatus | null {
  return LIST_SLUGS[slug] ?? null;
}

export function statusToSlug(status: LeadStatus): string {
  const entry = Object.entries(LIST_SLUGS).find(([, v]) => v === status);
  return entry ? entry[0] : status.toLowerCase();
}
