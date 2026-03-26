import Link from 'next/link';
import { ArrowRight, Crown, Lock, Radio } from 'lucide-react';

import PricingCards from './PricingCards';
import { useCompany } from '../context/CompanyContext';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';

interface SocialHubUpgradePromptProps {
  compact?: boolean;
  showPricingCards?: boolean;
}

export default function SocialHubUpgradePrompt({ compact = false, showPricingCards = false }: SocialHubUpgradePromptProps) {
  const { language } = useLanguage();
  const { activeCompany } = useCompany();
  const { currentPlan } = useSubscription();
  const isEn = language === 'en';
  const settingsUrl = activeCompany ? `/project/${activeCompany.id}/settings?tab=subscription` : '/settings?tab=subscription';

  return (
    <div style={{
      border: '1px solid rgba(193, 41, 46, 0.18)',
      borderRadius: 'var(--radius-xl)',
      padding: compact ? '16px' : '24px',
      background: 'linear-gradient(135deg, rgba(193, 41, 46, 0.06), rgba(14, 165, 233, 0.04))',
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? '12px' : '18px',
    }}>
      <div style={{ display: 'flex', alignItems: compact ? 'flex-start' : 'center', gap: '12px' }}>
        <div style={{
          width: compact ? 40 : 48,
          height: compact ? 40 : 48,
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(193, 41, 46, 0.12)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Radio size={compact ? 18 : 22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            marginBottom: '8px',
            borderRadius: '999px',
            background: 'rgba(193, 41, 46, 0.1)',
            color: 'var(--color-primary)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}>
            <Lock size={12} />
            {isEn ? 'Pro Feature' : 'Pro Feature'}
          </div>
          <h3 style={{ margin: 0, fontSize: compact ? 'var(--font-size-base)' : 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {isEn ? 'Unlock Social Hub with Pro or Ultimate' : 'Social Hub mit Pro oder Ultimate freischalten'}
          </h3>
          <p style={{ margin: '8px 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {isEn
              ? 'Upgrade to Pro to generate AI social drafts, manage approvals, and publish through one focused workflow. Ultimate adds Instagram and more connected accounts for broader reach.'
              : 'Upgrade auf Pro, um KI-Social-Posts zu generieren, Freigaben zu steuern und Publishing in einem durchgaengigen Workflow zu verwalten. Ultimate erweitert das Ganze um Instagram und mehr verbundene Accounts.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
            <Crown size={14} style={{ color: 'var(--color-primary)' }} />
            {isEn ? 'AI Draft Engine' : 'KI-Draft-Engine'}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            {isEn ? 'Turn campaigns, content, and tasks into ready-to-review social posts.' : 'Mache aus Kampagnen, Content und Tasks direkt freigabefaehige Social-Posts.'}
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
            <Crown size={14} style={{ color: 'var(--color-primary)' }} />
            {isEn ? 'Approval and Publishing' : 'Freigabe und Publishing'}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            {isEn ? 'Keep review, scheduling, and channel publishing inside Momentum.' : 'Halte Review, Terminierung und Channel-Publishing direkt in Momentum.'}
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
            <Crown size={14} style={{ color: 'var(--color-primary)' }} />
            {isEn ? 'Scale with Ultimate' : 'Skalieren mit Ultimate'}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            {isEn ? 'Unlock Instagram plus additional connected social accounts when your team is ready.' : 'Schalte Instagram und weitere verbundene Social Accounts frei, sobald dein Team mehr Reichweite braucht.'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: compact ? 'stretch' : 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
          {isEn
            ? `Current plan: ${currentPlan?.name ?? 'Starter'}. Social Hub activates from Pro upward.`
            : `Aktueller Plan: ${currentPlan?.name ?? 'Starter'}. Der Social Hub ist ab Pro aktiviert.`}
        </div>
        <Link
          href={settingsUrl}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
        >
          {isEn ? 'Upgrade to Pro' : 'Auf Pro upgraden'} <ArrowRight size={14} />
        </Link>
      </div>

      {showPricingCards && <PricingCards compact highlightSlug="pro" />}
    </div>
  );
}
