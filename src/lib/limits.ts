export const TIER_LIMITS = {
  free: {
    charts: 5,
    ai_reports_per_month: 2,
  },
  standard: {
    charts: 5,
    ai_reports_per_month: 2,
  },
  premium: {
    charts: Infinity,
    ai_reports_per_month: Infinity,
  },
  admin: {
    charts: Infinity,
    ai_reports_per_month: Infinity,
  },
  blocked: {
    charts: 0,
    ai_reports_per_month: 0,
  }
} as const;

export type Tier = keyof typeof TIER_LIMITS;

export function getTierLimits(tier: string | null | undefined) {
  const safeTier = (tier as Tier) || 'standard';
  return TIER_LIMITS[safeTier] || TIER_LIMITS.standard;
}
