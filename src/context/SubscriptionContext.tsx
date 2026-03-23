import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from 'react';
import type { Plan, Subscription, PlanFeatures } from '../types';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';
import * as api from '../lib/api';
import { PLAN_SLUGS, hasFeature, planTierOrder, type PlanSlug } from '../lib/pricing';

// ─── Context value shape ───────────────────────────────────

interface SubscriptionContextValue {
  /** All active plans from the DB (cached). */
  plans: Plan[];
  /** The active subscription for the current company. null = no subscription. */
  subscription: Subscription | null;
  /** Resolved plan object for the current subscription. */
  currentPlan: Plan | null;
  /** Slug shortcut, e.g. 'starter' | 'pro' | 'ultimate'. Falls back to 'starter'. */
  currentPlanSlug: PlanSlug;
  /** True while loading subscription data. */
  loading: boolean;
  /** Check if the current plan has a specific feature. */
  can: (feature: keyof PlanFeatures) => boolean;
  /** True if the current plan is lower than the given slug. */
  isBelow: (slug: PlanSlug) => boolean;
  /** True if current plan is strictly below 'pro'. */
  needsUpgrade: boolean;
  /** Switch the company to a different plan. */
  changePlan: (planId: string) => Promise<void>;
  /** Re-fetch subscription from the server. */
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { activeCompany } = useCompany();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all plans once on mount
  useEffect(() => {
    let cancelled = false;
    api.fetchPlans()
      .then(data => { if (!cancelled) setPlans(data); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, []);

  // Fetch subscription whenever the active company changes
  useEffect(() => {
    if (!currentUser || !activeCompany) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.fetchSubscription(activeCompany.id)
      .then(sub => { if (!cancelled) setSubscription(sub); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentUser?.id, activeCompany?.id]);

  // ── Derived state ──

  const currentPlan: Plan | null =
    subscription?.plan ??
    plans.find(p => p.id === subscription?.planId) ??
    null;

  const currentPlanSlug: PlanSlug =
    (currentPlan?.slug as PlanSlug) ?? PLAN_SLUGS.STARTER;

  const can = useCallback(
    (feature: keyof PlanFeatures): boolean => hasFeature(currentPlan?.features, feature),
    [currentPlan],
  );

  const isBelow = useCallback(
    (slug: PlanSlug): boolean => planTierOrder(currentPlanSlug) < planTierOrder(slug),
    [currentPlanSlug],
  );

  const needsUpgrade = isBelow(PLAN_SLUGS.PRO);

  const [changing, setChanging] = useState(false);

  const changePlan = useCallback(async (planId: string) => {
    if (!activeCompany || changing) return;
    setChanging(true);
    try {
      if (subscription) {
        await api.updateSubscription(subscription.id, { planId });
      } else {
        await api.createSubscription(activeCompany.id, planId);
      }
      // Re-fetch to get joined plan data
      const refreshed = await api.fetchSubscription(activeCompany.id);
      setSubscription(refreshed);
    } finally {
      setChanging(false);
    }
  }, [activeCompany, subscription, changing]);

  const refresh = useCallback(async () => {
    if (!activeCompany) return;
    const refreshed = await api.fetchSubscription(activeCompany.id);
    setSubscription(refreshed);
  }, [activeCompany]);

  return (
    <SubscriptionContext.Provider value={{
      plans, subscription, currentPlan, currentPlanSlug,
      loading, can, isBelow, needsUpgrade, changePlan, refresh,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
