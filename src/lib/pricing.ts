import type { Plan, PlanFeatures } from '../types';

// ─── Pricing Plan Definitions ──────────────────────────────
// Aligned with the per-seat pricing model (March 2026).
// Prices in cents. Features encode what each tier unlocks.

export const PLAN_SLUGS = {
  STARTER: 'starter',
  PRO: 'pro',
  ULTIMATE: 'ultimate',
} as const;

export type PlanSlug = (typeof PLAN_SLUGS)[keyof typeof PLAN_SLUGS];

/** Extra-seat / extra-project / extra-account add-on prices (cents / month) */
export const ADD_ON_PRICES = {
  extraSeat: 900,        // +€9/seat
  extraProject: 1500,    // +€15/project
  extraSocialAccount: 900,  // +€9/account
} as const;

/** Static plan definitions used for display & seeding. */
export const PLAN_DEFINITIONS: Omit<Plan, 'id' | 'isActive'>[] = [
  {
    name: 'Starter',
    slug: PLAN_SLUGS.STARTER,
    description: 'Ideal for solo marketers and small teams getting started.',
    priceMonthly: 2900,
    priceYearly: 29000,
    maxSeats: 2,
    maxProjects: 1,
    includedSocialAccounts: 0,
    sortOrder: 1,
    features: {
      core: true,
      ai_pro: false,
      linkedin: false,
      instagram: false,
      max_ai_generations_month: 0,
    },
  },
  {
    name: 'Pro',
    slug: PLAN_SLUGS.PRO,
    description: 'For growing teams with AI-powered content and LinkedIn publishing.',
    priceMonthly: 7900,
    priceYearly: 79000,
    maxSeats: 5,
    maxProjects: 3,
    includedSocialAccounts: 1,
    sortOrder: 2,
    features: {
      core: true,
      ai_pro: true,
      linkedin: true,
      instagram: false,
      max_ai_generations_month: -1,
    },
  },
  {
    name: 'Ultimate',
    slug: PLAN_SLUGS.ULTIMATE,
    description: 'Full power for agencies and large marketing departments.',
    priceMonthly: 14900,
    priceYearly: 149000,
    maxSeats: 10,
    maxProjects: 10,
    includedSocialAccounts: 4,  // 3 LinkedIn + 1 Instagram
    sortOrder: 3,
    features: {
      core: true,
      ai_pro: true,
      linkedin: true,
      instagram: true,
      max_ai_generations_month: -1,
    },
  },
];

// ─── Feature Gate Helpers ──────────────────────────────────

export type FeatureKey = keyof PlanFeatures;

/**
 * Check if the given plan features allow a specific capability.
 * Returns true if the feature is enabled, false otherwise.
 */
export function hasFeature(features: PlanFeatures | undefined | null, key: FeatureKey): boolean {
  if (!features) return false;
  if (key === 'max_ai_generations_month') {
    return (features.max_ai_generations_month ?? 0) !== 0;
  }
  return features[key] === true;
}

/**
 * Determines the plan tier order for comparison.
 * Higher = more features.
 */
export function planTierOrder(slug: string): number {
  switch (slug) {
    case PLAN_SLUGS.STARTER: return 1;
    case PLAN_SLUGS.PRO: return 2;
    case PLAN_SLUGS.ULTIMATE: return 3;
    default: return 0;
  }
}

/**
 * Check if a plan can be upgraded to a higher tier.
 */
export function canUpgrade(currentSlug: string, targetSlug: string): boolean {
  return planTierOrder(targetSlug) > planTierOrder(currentSlug);
}

/**
 * Format cents as Euro currency string.
 */
export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`;
}

/** Human-readable feature list for a plan (bilingual). */
export function getPlanHighlights(plan: Pick<Plan, 'slug' | 'maxSeats' | 'maxProjects' | 'features' | 'includedSocialAccounts'>, lang: 'de' | 'en'): string[] {
  const h: string[] = [];
  h.push(lang === 'de' ? `${plan.maxSeats} Plätze inklusive` : `${plan.maxSeats} seats included`);
  h.push(lang === 'de' ? `${plan.maxProjects} ${plan.maxProjects === 1 ? 'Projekt' : 'Projekte'}` : `${plan.maxProjects} ${plan.maxProjects === 1 ? 'project' : 'projects'}`);
  if (plan.features.core) h.push(lang === 'de' ? 'Dashboard, Kampagnen, Content, Tasks' : 'Dashboard, Campaigns, Content, Tasks');
  if (plan.features.ai_pro) h.push(lang === 'de' ? 'KI Pro (RAG, Wissensbasis, Bildgenerierung)' : 'AI Pro (RAG, knowledge base, image gen)');
  if (plan.features.linkedin) {
    const count = plan.slug === 'ultimate' ? 3 : 1;
    h.push(lang === 'de' ? `LinkedIn Publishing (${count} ${count === 1 ? 'Konto' : 'Konten'})` : `LinkedIn Publishing (${count} ${count === 1 ? 'account' : 'accounts'})`);
  }
  if (plan.features.instagram) h.push(lang === 'de' ? 'Instagram Publishing (1 Konto)' : 'Instagram Publishing (1 account)');
  return h;
}
