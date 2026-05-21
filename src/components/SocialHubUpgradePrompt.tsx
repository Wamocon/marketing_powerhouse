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
  const { t } = useLanguage();
  const { activeCompany } = useCompany();
  const { currentPlan } = useSubscription();
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
            {t({ de: 'Pro Feature', en: 'Pro Feature', tr: 'Pro Özellik' })}
          </div>
          <h3 style={{ margin: 0, fontSize: compact ? 'var(--font-size-base)' : 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t({ de: 'Social Hub mit Pro oder Ultimate freischalten', en: 'Unlock Social Hub with Pro or Ultimate', tr: 'Social Hub\'ı Pro veya Ultimate ile açın' })}
          </h3>
          <p style={{ margin: '8px 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {t({
              de: 'Upgrade auf Pro, um KI-Social-Posts zu generieren, Freigaben zu steuern und Publishing in einem durchgängigen Workflow zu verwalten. Ultimate erweitert das Ganze um Instagram und mehr verbundene Accounts.',
              en: 'Upgrade to Pro to generate AI social drafts, manage approvals, and publish through one focused workflow. Ultimate adds Instagram and more connected accounts for broader reach.',
              tr: 'Yapay zeka destekli sosyal medya taslakları oluşturmak, onay süreçlerini yönetmek ve tek bir iş akışıyla yayınlamak için Pro\'ya yükseltin. Ultimate, daha geniş erişim için Instagram ve daha fazla bağlı hesap ekler.',
            })}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
            <Crown size={14} style={{ color: 'var(--color-primary)' }} />
            {t({ de: 'KI-Draft-Engine', en: 'AI Draft Engine', tr: 'Yapay Zeka Taslak Motoru' })}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            {t({ de: 'Mache aus Kampagnen, Content und Tasks direkt freigabefähige Social-Posts.', en: 'Turn campaigns, content, and tasks into ready-to-review social posts.', tr: 'Kampanyaları, içerikleri ve görevleri incelemeye hazır sosyal medya paylaşımlarına dönüştürün.' })}
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
            <Crown size={14} style={{ color: 'var(--color-primary)' }} />
            {t({ de: 'Freigabe und Publishing', en: 'Approval and Publishing', tr: 'Onay ve Yayınlama' })}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            {t({ de: 'Halte Review, Terminierung und Channel-Publishing direkt in Momentum.', en: 'Keep review, scheduling, and channel publishing inside Momentum.', tr: 'İnceleme, planlama ve kanal yayınlamayı Momentum içinde tutun.' })}
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
            <Crown size={14} style={{ color: 'var(--color-primary)' }} />
            {t({ de: 'Skalieren mit Ultimate', en: 'Scale with Ultimate', tr: 'Ultimate ile ölçeklendirin' })}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            {t({ de: 'Schalte Instagram und weitere verbundene Social Accounts frei, sobald dein Team mehr Reichweite braucht.', en: 'Unlock Instagram plus additional connected social accounts when your team is ready.', tr: 'Ekibiniz hazır olduğunda Instagram ve ek bağlı sosyal hesapları açın.' })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: compact ? 'stretch' : 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
          {t({
            de: `Aktueller Plan: ${currentPlan?.name ?? 'Starter'}. Der Social Hub ist ab Pro aktiviert.`,
            en: `Current plan: ${currentPlan?.name ?? 'Starter'}. Social Hub activates from Pro upward.`,
            tr: `Mevcut plan: ${currentPlan?.name ?? 'Starter'}. Social Hub, Pro ve üstü planlarda aktiftir.`,
          })}
        </div>
        <Link
          href={settingsUrl}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
        >
          {t({ de: 'Auf Pro upgraden', en: 'Upgrade to Pro', tr: 'Pro\'ya yükselt' })} <ArrowRight size={14} />
        </Link>
      </div>

      {showPricingCards && <PricingCards compact highlightSlug="pro" />}
    </div>
  );
}
