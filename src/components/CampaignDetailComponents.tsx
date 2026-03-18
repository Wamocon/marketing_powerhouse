import { useState } from 'react';
import {
    Bot, ChevronLeft, ChevronRight, Instagram, Youtube, Linkedin, Facebook, Globe,
    Sparkles, Eye, CheckCircle2, Clock, Send, BarChart3, RefreshCw,
    FileText, Image, Video, MessageSquare, Target
} from 'lucide-react';

// ─── Status Config ───
export const statusConfig: Record<string, { label: string; badge: string; steps: number }> = {
    active: { label: 'Aktiv', badge: 'badge-success', steps: 3 },
    planned: { label: 'Geplant', badge: 'badge-info', steps: 1 },
    draft: { label: 'Entwurf', badge: 'badge-warning', steps: 0 },
    completed: { label: 'Abgeschlossen', badge: 'badge-primary', steps: 5 },
    paused: { label: 'Pausiert', badge: 'badge-danger', steps: 2 },
};
export const statusSteps = ['Entwurf', 'Geplant', 'In Review', 'Aktiv', 'Optimierung', 'Abgeschlossen'];

// ─── Creative Workflow Steps ───
export const CREATIVE_STATES: Record<string, { label: string; color: string; icon: any; step: number }> = {
    draft: { label: 'Entwurf', color: '#64748b', icon: FileText, step: 0 },
    ai_generating: { label: 'KI generiert…', color: '#f59e0b', icon: Sparkles, step: 1 },
    ai_ready: { label: 'KI-Vorschlag', color: '#8b5cf6', icon: Bot, step: 2 },
    review: { label: 'Im Review', color: '#2563eb', icon: Eye, step: 3 },
    revision: { label: 'Überarbeitung', color: '#f97316', icon: RefreshCw, step: 4 },
    approved: { label: 'Freigegeben', color: '#10b981', icon: CheckCircle2, step: 5 },
    scheduled: { label: 'Eingeplant', color: '#06b6d4', icon: Clock, step: 6 },
    posted: { label: 'Gepostet', color: '#dc2626', icon: Send, step: 7 },
    monitoring: { label: 'Beobachtung', color: '#ec4899', icon: BarChart3, step: 8 },
    analyzed: { label: 'Analysiert', color: '#10b981', icon: Target, step: 9 },
};

export const PLATFORM_ICONS: Record<string, any> = {
    'Instagram': Instagram, 'YouTube': Youtube, 'LinkedIn': Linkedin, 'LinkedIn Ads': Linkedin,
    'Facebook': Facebook, 'Meta Ads': Facebook, 'Google Ads': Globe, 'E-Mail': MessageSquare,
    'Direct Mail': MessageSquare, 'Google Search Ads': Globe,
};

export const CREATIVE_TYPES = [
    { value: 'post', label: 'Post', icon: Image },
    { value: 'reel', label: 'Reel/Video', icon: Video },
    { value: 'story', label: 'Story', icon: FileText },
    { value: 'ad', label: 'Anzeige', icon: Target },
    { value: 'email', label: 'E-Mail', icon: MessageSquare },
];

// ─── Mini Calendar Component ───
export function MiniCalendar({ startDate, endDate }: { startDate: string; endDate: string }) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const [viewMonth, setViewMonth] = useState(new Date(start.getFullYear(), start.getMonth(), 1));
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const firstDay = (() => { const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay(); return d === 0 ? 6 : d - 1; })();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isInRange = (day: number | null) => {
        if (!day) return false;
        const dt = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
        return dt >= new Date(start.toDateString()) && dt <= new Date(end.toDateString());
    };
    const isStart = (day: number | null) => day && new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day).toDateString() === start.toDateString();
    const isEnd = (day: number | null) => day && new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day).toDateString() === end.toDateString();

    return (
        <div style={{ fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <button className="btn btn-ghost" style={{ padding: '2px' }} onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}><ChevronLeft size={14} /></button>
                <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
                <button className="btn btn-ghost" style={{ padding: '2px' }} onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}><ChevronRight size={14} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '1px', textAlign: 'center' }}>
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => <div key={d} style={{ padding: '2px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{d}</div>)}
                {cells.map((day, i) => (
                    <div key={i} style={{
                        padding: '3px', borderRadius: isStart(day) ? '4px 0 0 4px' : isEnd(day) ? '0 4px 4px 0' : '0',
                        background: isInRange(day) ? 'rgba(220,38,38,0.12)' : 'transparent',
                        color: isInRange(day) ? 'var(--color-primary)' : day ? 'var(--text-secondary)' : 'transparent',
                        fontWeight: (isStart(day) || isEnd(day)) ? 700 : 400,
                    }}>{day || '·'}</div>
                ))}
            </div>
            <div style={{ marginTop: '6px', display: 'flex', gap: '8px', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                <span>📅 {start.toLocaleDateString('de-DE')} – {end.toLocaleDateString('de-DE')}</span>
            </div>
        </div>
    );
}

// ─── Creative Card ───
export function CreativeCard({ creative, onStatusChange, onAnalyze, onClick }: any) {
    const st = CREATIVE_STATES[creative.status];
    const Icon = st.icon;
    const PlatIcon = PLATFORM_ICONS[creative.platform] || Globe;

    return (
        <div onClick={onClick} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
            padding: '16px', borderLeft: `3px solid ${st.color}`, transition: 'all 0.2s', cursor: 'pointer'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '2px' }}>{creative.title}</div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        <PlatIcon size={12} />
                        <span>{creative.platform || 'Alle Plattformen'}</span>
                        <span>·</span>
                        <span>{creative.type}</span>
                    </div>
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px',
                    borderRadius: 'var(--radius-full)', fontSize: '0.65rem', fontWeight: 600,
                    background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}33`,
                }}><Icon size={10} /> {st.label}</span>
            </div>

            {creative.description && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                    {creative.description.length > 120 ? creative.description.slice(0, 120) + '…' : creative.description}
                </div>
            )}

            {creative.aiSuggestion && (creative.status === 'ai_ready' || creative.status === 'review') && (
                <div style={{ padding: '8px 10px', background: 'rgba(139,92,246,0.06)', borderRadius: 'var(--radius-sm)', marginBottom: '10px', fontSize: '0.7rem', color: 'var(--text-secondary)', borderLeft: '2px solid #8b5cf6' }}>
                    <strong style={{ color: '#8b5cf6' }}>🤖 KI-Vorschlag:</strong> {creative.aiSuggestion.slice(0, 150)}…
                </div>
            )}

            {creative.publishDate && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>📅 Geplant: {new Date(creative.publishDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            )}

            {creative.status === 'monitoring' && creative.performance && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                    {[{ l: 'Impressions', v: creative.performance.impressions }, { l: 'Clicks', v: creative.performance.clicks }, { l: 'CTR', v: creative.performance.ctr + '%' }].map(m => (
                        <div key={m.l} style={{ padding: '6px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{m.l}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{m.v.toLocaleString?.('de-DE') || m.v}</div>
                        </div>
                    ))}
                </div>
            )}

            {creative.analysisResult && (
                <div style={{
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '0.7rem',
                    background: creative.analysisResult.verdict === 'good' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    borderLeft: `2px solid ${creative.analysisResult.verdict === 'good' ? '#10b981' : '#ef4444'}`,
                }}>
                    <strong>{creative.analysisResult.verdict === 'good' ? '✅ Gute Performance' : '⚠️ Optimierungsbedarf'}</strong>
                    <div style={{ marginTop: '2px' }}>{creative.analysisResult.text}</div>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {creative.status === 'draft' && <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'ai_generating'); }}><Sparkles size={12} /> KI-Vorschlag</button>}
                {creative.status === 'ai_generating' && <button className="btn btn-sm" style={{ background: '#f59e0b22', color: '#f59e0b' }} disabled onClick={e => e.stopPropagation()}><RefreshCw size={12} className="spin" /> Generiert…</button>}
                {creative.status === 'ai_ready' && <button className="btn btn-sm" style={{ background: '#2563eb18', color: '#2563eb' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'review'); }}><Eye size={12} /> Review starten</button>}
                {creative.status === 'review' && (
                    <>
                        <button className="btn btn-sm" style={{ background: '#10b98118', color: '#10b981' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'approved'); }}><CheckCircle2 size={12} /> Freigeben</button>
                        <button className="btn btn-sm" style={{ background: '#f9731618', color: '#f97316' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'revision'); }}><RefreshCw size={12} /> Zurück an KI</button>
                    </>
                )}
                {creative.status === 'revision' && <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'ai_generating'); }}><Sparkles size={12} /> Erneut generieren</button>}
                {creative.status === 'approved' && <button className="btn btn-sm" style={{ background: '#06b6d418', color: '#06b6d4' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'scheduled'); }}><Clock size={12} /> Einplanen</button>}
                {creative.status === 'scheduled' && <button className="btn btn-sm" style={{ background: '#dc262618', color: '#dc2626' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'posted'); }}><Send size={12} /> Posten</button>}
                {creative.status === 'posted' && <button className="btn btn-sm" style={{ background: '#ec489918', color: '#ec4899' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'monitoring'); }}><BarChart3 size={12} /> Beobachtung</button>}
                {creative.status === 'monitoring' && <button className="btn btn-sm" style={{ background: '#10b98118', color: '#10b981' }} onClick={(e) => { e.stopPropagation(); onAnalyze(creative.id); }}><Target size={12} /> Analyse</button>}
            </div>
        </div>
    );
}
