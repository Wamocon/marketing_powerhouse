import type { Plan, Subscription } from '../types';
import { hasFeature, PLAN_SLUGS, planTierOrder } from './pricing';

export const SOCIAL_HUB_REQUIRED_PLAN = PLAN_SLUGS.PRO;

type PlanLike = Pick<Plan, 'slug' | 'features'> | null | undefined;

export function hasSocialHubPlanEntitlementFromPlan(plan: PlanLike): boolean {
  const slug = plan?.slug ?? PLAN_SLUGS.STARTER;
  return hasFeature(plan?.features, 'ai_pro') && planTierOrder(slug) >= planTierOrder(SOCIAL_HUB_REQUIRED_PLAN);
}

export function hasSocialHubPlanEntitlement(subscription: Subscription | null | undefined): boolean {
  return hasSocialHubPlanEntitlementFromPlan(subscription?.plan);
}
