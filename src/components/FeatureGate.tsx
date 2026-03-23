import type { ReactNode } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';
import { useCompany } from '../context/CompanyContext';
import type { PlanFeatures } from '../types';

interface FeatureGateProps {
  /** The plan feature required. */
  feature: keyof PlanFeatures;
  /** Content shown when the feature is available. */
  children: ReactNode;
  /** Optional custom fallback. If not provided, a default upgrade prompt is shown. */
  fallback?: ReactNode;
  /** If true, renders children but wrapped in a disabled visual state instead of hiding. */
  dimmed?: boolean;
}

/**
 * Conditionally renders children based on the current subscription's features.
 * Shows an upgrade prompt if the feature is not available.
 */
export default function FeatureGate({ feature, children, fallback, dimmed }: FeatureGateProps) {
  const { can, currentPlan, loading } = useSubscription();
  const { language } = useLanguage();
  const { activeCompany } = useCompany();
  const isEn = language === 'en';
  const settingsUrl = activeCompany ? `/project/${activeCompany.id}/settings?tab=subscription` : '/settings?tab=subscription';

  // While loading, show children to avoid flash of upgrade prompt
  if (loading || can(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (dimmed) {
    return (
      <div style={{ position: 'relative', opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(0.4)' }}>
        {children}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--bg-surface)', padding: '6px 14px',
            borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)',
            fontWeight: 600, color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <Lock size={12} />
            {isEn ? 'Upgrade required' : 'Upgrade erforderlich'}
          </div>
        </div>
      </div>
    );
  }

  // Default: compact upgrade prompt
  return (
    <div style={{
      border: '1px dashed var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: '12px',
      background: 'var(--bg-surface)',
    }}>
      <Lock size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
          {isEn ? 'Feature not available on your plan' : 'Feature im aktuellen Plan nicht verfügbar'}
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
          {isEn
            ? `Upgrade from ${currentPlan?.name ?? 'Starter'} to unlock this feature.`
            : `Upgrade von ${currentPlan?.name ?? 'Starter'}, um dieses Feature freizuschalten.`}
        </div>
      </div>
      <Link
        href={settingsUrl}
        className="btn btn-primary btn-sm"
        style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        {isEn ? 'Upgrade' : 'Upgraden'} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
