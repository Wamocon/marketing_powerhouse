import { useState } from 'react';
import { Check, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';
import type { Plan } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
  formatPrice,
  getPlanHighlights,
  planTierOrder,
  ADD_ON_PRICES,
  PLAN_SLUGS,
  type PlanSlug,
} from '../lib/pricing';

const PLAN_ICONS: Record<string, typeof Zap> = {
  starter: Zap,
  pro: Crown,
  ultimate: Rocket,
};

const PLAN_ACCENT: Record<string, string> = {
  starter: 'var(--color-neutral)',
  pro: 'var(--color-primary)',
  ultimate: 'var(--color-accent)',
};

interface PricingCardsProps {
  /** Called when a plan is selected/upgraded. */
  onSelect?: (plan: Plan) => void | Promise<void>;
  /** If true, show a compact version (e.g. for registration step). */
  compact?: boolean;
  /** Highlight a specific plan slug. */
  highlightSlug?: PlanSlug;
}

export default function PricingCards({ onSelect, compact, highlightSlug }: PricingCardsProps) {
  const { language } = useLanguage();
  const { plans, currentPlanSlug, loading } = useSubscription();
  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
  const isEn = language === 'en';
  const highlight = highlightSlug ?? PLAN_SLUGS.PRO;

  if (loading && plans.length === 0) {
    return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      {isEn ? 'Loading plans...' : 'Pläne werden geladen...'}
    </div>;
  }

  const handleSelect = async (plan: Plan) => {
    if (!onSelect) return;
    setChangingPlanId(plan.id);
    try {
      await onSelect(plan);
    } finally {
      setChangingPlanId(null);
    }
  };

  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: compact ? 'repeat(auto-fit, minmax(240px, 1fr))' : 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: compact ? '12px' : '20px',
      width: '100%',
    }}>
      {sortedPlans.map((plan) => {
        const Icon = PLAN_ICONS[plan.slug] ?? Zap;
        const accent = PLAN_ACCENT[plan.slug] ?? 'var(--color-neutral)';
        const isHighlighted = plan.slug === highlight;
        const isCurrent = plan.slug === currentPlanSlug;
        const canSelect = planTierOrder(plan.slug) !== planTierOrder(currentPlanSlug);
        const isUpgrade = planTierOrder(plan.slug) > planTierOrder(currentPlanSlug);
        const highlights = getPlanHighlights(plan, language);
        const isChanging = changingPlanId === plan.id;

        return (
          <div
            key={plan.id}
            style={{
              position: 'relative',
              border: isHighlighted
                ? `2px solid ${accent}`
                : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: compact ? '16px' : '24px',
              background: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: compact ? '10px' : '16px',
              transition: 'box-shadow 0.2s, transform 0.15s',
              ...(isHighlighted ? {
                boxShadow: `0 0 0 1px ${accent}, 0 8px 24px rgba(0,0,0,0.08)`,
              } : {}),
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = isHighlighted
                ? `0 0 0 1px ${accent}, 0 8px 24px rgba(0,0,0,0.08)` : '';
            }}
          >
            {/* Popular badge */}
            {isHighlighted && !compact && (
              <div style={{
                position: 'absolute', top: '-12px', left: '50%',
                transform: 'translateX(-50%)',
                background: accent, color: 'white',
                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                padding: '3px 14px', borderRadius: 'var(--radius-full)',
                letterSpacing: '0.05em',
              }}>
                {isEn ? 'Most Popular' : 'Beliebteste Wahl'}
              </div>
            )}

            {/* Current badge */}
            {isCurrent && (
              <div style={{
                position: 'absolute', top: compact ? '8px' : '12px', right: compact ? '8px' : '12px',
                background: 'rgba(16,185,129,0.12)', color: '#10b981',
                fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                padding: '2px 8px', borderRadius: 'var(--radius-full)',
              }}>
                {isEn ? 'Current' : 'Aktuell'}
              </div>
            )}

            {/* Plan header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: compact ? 32 : 40, height: compact ? 32 : 40,
                borderRadius: 'var(--radius-md)',
                background: `${accent}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accent,
              }}>
                <Icon size={compact ? 16 : 20} />
              </div>
              <div>
                <div style={{
                  fontWeight: 700,
                  fontSize: compact ? 'var(--font-size-base)' : 'var(--font-size-lg)',
                  color: 'var(--text-primary)',
                }}>
                  {plan.name}
                </div>
                {!compact && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                    {plan.description}
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{
                fontSize: compact ? '1.5rem' : '2rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {formatPrice(plan.priceMonthly)}
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                /{isEn ? 'month' : 'Monat'}
              </span>
            </div>

            {/* Feature list */}
            <ul style={{
              listStyle: 'none', margin: 0, padding: 0,
              display: 'flex', flexDirection: 'column',
              gap: compact ? '4px' : '8px',
              flex: 1,
            }}>
              {highlights.map((h, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)',
                }}>
                  <Check size={14} style={{ color: accent, flexShrink: 0, marginTop: '2px' }} />
                  {h}
                </li>
              ))}
            </ul>

            {/* Add-on info */}
            {!compact && (
              <div style={{
                fontSize: '0.65rem', color: 'var(--text-tertiary)',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '8px',
                display: 'flex', flexDirection: 'column', gap: '2px',
              }}>
                <span>+ {formatPrice(ADD_ON_PRICES.extraSeat)}/{isEn ? 'extra seat' : 'extra Platz'}</span>
                {plan.slug !== PLAN_SLUGS.STARTER && (
                  <span>+ {formatPrice(ADD_ON_PRICES.extraProject)}/{isEn ? 'extra project' : 'extra Projekt'}</span>
                )}
                {plan.slug !== PLAN_SLUGS.STARTER && (
                  <span>+ {formatPrice(ADD_ON_PRICES.extraSocialAccount)}/{isEn ? 'extra account' : 'extra Konto'}</span>
                )}
              </div>
            )}

            {/* CTA button */}
            {onSelect && (
              <button
                className={`btn ${isUpgrade ? 'btn-primary' : isCurrent ? 'btn-ghost' : 'btn-secondary'}`}
                disabled={isCurrent || isChanging}
                onClick={() => handleSelect(plan)}
                style={{
                  width: '100%',
                  ...(isHighlighted && isUpgrade ? {
                    background: accent,
                    borderColor: accent,
                  } : {}),
                }}
              >
                {isChanging
                  ? (isEn ? 'Switching...' : 'Wird gewechselt...')
                  : isCurrent
                    ? (isEn ? 'Current plan' : 'Aktueller Plan')
                    : isUpgrade
                      ? <>
                          {isEn ? 'Upgrade' : 'Upgraden'} <ArrowRight size={14} />
                        </>
                      : (isEn ? 'Switch' : 'Wechseln')
                }
              </button>
            )}
          </div>
        );
      })}

      {/* Enterprise CTA */}
      {!compact && (
        <div style={{
          gridColumn: '1 / -1',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-surface)',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
              Enterprise
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
              {isEn
                ? '20+ seats, custom features, dedicated support — contact us.'
                : '20+ Plätze, individuelle Features, dedizierter Support — kontaktieren Sie uns.'}
            </div>
          </div>
          <button className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}>
            {isEn ? 'Contact sales' : 'Vertrieb kontaktieren'}
          </button>
        </div>
      )}
    </div>
  );
}
