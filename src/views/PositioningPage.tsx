import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2, Target, Megaphone, Globe,
    Lock, Plus, X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import PageHelp from '../components/PageHelp';
import { SectionHeader, Field, CommsContent } from '../components/PositioningComponents';

export default function PositioningPage() {
    const { can } = useAuth();
    const router = useRouter();
    const { positioning, companyKeywords, savePositioning, addKeyword, deleteKeyword } = useData();
    const [pos, setPos] = useState(positioning);
    const [editSection, setEditSection] = useState<string | null>(null);
    const [newKeywordTerm, setNewKeywordTerm] = useState('');
    const [newKeywordCategory, setNewKeywordCategory] = useState('');
    const [openSections, setOpenSections] = useState({
        dna: true, identity: true, comms: true, keywords: true, market: true,
    });

    useEffect(() => { if (positioning) setTimeout(() => setPos(positioning), 0); }, [positioning]);

    if (!pos) return <div className="animate-in"><p>Lade Positionierung...</p></div>;

    const canEdit = can('canEditPositioning');

    const toggleSection = (key: string) =>
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    const handleEdit = (id: string) => {
        setEditSection(id);
        setOpenSections(prev => ({ ...prev, [id]: true }));
    };
    const handleSave = () => {
        savePositioning(pos);
        setEditSection(null);
    };
    const handleCancel = () => setEditSection(null);

    const sectionProps = {
        canEdit,
        editSection,
        openSections,
        onToggle: toggleSection,
        onEdit: handleEdit,
        onSave: handleSave,
        onCancel: handleCancel,
    };

    return (
        <div className="animate-in">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Digitale Positionierung</h1>
                    <p className="page-subtitle">
                        Unternehmensidentität, Markenwerte und Kommunikations-DNA — die Grundlage all eurer Kampagnen.
                    </p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Digitale Positionierung">
                        <p style={{ marginBottom: '12px' }}>Dieses Modul ist das Gehirn eurer Marke. Es dient als "Single Source of Truth", an der sich alle Kampagnen, Creatives und KI-Assistenten messen lassen.</p>
                        <ul className="help-list">
                            <li><strong>Unternehmens-DNA:</strong> Die harten Fakten zu Eurem Business.</li>
                            <li><strong>Vision, Mission & Werte:</strong> Das "Warum". Dies gibt später allen Copywritern die Vorlage, wie der Benefit beim Kunden ankommen muss.</li>
                            <li><strong>Tone of Voice:</strong> Diese Parameter (Dos & Don'ts) ziehen sich die angeschlossenen KI-Modelle tief in ihre Prompts. Definiere die Sprache hier sehr exakt.</li>
                            <li><strong>Schlüsselbegriffe:</strong> Wenn es Wörter gibt, die ihr konsequent besetzen wollt (SEO relevant) kommen sie hier rein.</li>
                            <li><strong>Admin Only:</strong> Die Pflege dieses Kernmoduls ist nur Administratoren mit der entsprechenden Berechtigung vorbehalten.</li>
                        </ul>
                    </PageHelp>
                    {!canEdit && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', background: 'var(--bg-elevated)',
                            borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)',
                        }}>
                            <Lock size={12} /> Nur-Lese-Modus (Admin erforderlich)
                        </div>
                    )}
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        Zuletzt aktualisiert: {pos.lastUpdated} · {pos.updatedBy}
                    </div>
                </div>
            </div>

            {/* ─── BLOCK 1: Unternehmens-DNA ─── */}
            <SectionHeader id="dna" title="Unternehmens-DNA" icon={Building2} {...sectionProps}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {[
                        { label: 'Unternehmensname', value: pos.name, key: 'name' },
                        { label: 'Tagline', value: pos.tagline, key: 'tagline' },
                        { label: 'Gegründet', value: pos.founded, key: 'founded' },
                        { label: 'Branche', value: pos.industry, key: 'industry' },
                        { label: 'Hauptsitz', value: pos.headquarters, key: 'headquarters' },
                        { label: 'Rechtsform', value: pos.legalForm, key: 'legalForm' },
                        { label: 'Mitarbeiter', value: pos.employees, key: 'employees' },
                        { label: 'Website', value: pos.website, key: 'website' },
                    ].map(f => (
                        <div key={f.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                {f.label}
                            </div>
                            {editSection === 'dna' ? (
                                <input type="text" className="form-input" value={f.value}
                                    onChange={e => setPos({ ...pos, [f.key]: e.target.value })}
                                    style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px' }} />
                            ) : (
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{f.value}</div>
                            )}
                        </div>
                    ))}
                </div>
            </SectionHeader>

            {/* ─── BLOCK 2: Digitale Identität ─── */}
            <SectionHeader id="identity" title="Digitale Identität — Vision, Mission & Werte" icon={Target} {...sectionProps}>
                {/* Vision & Mission */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: '🔭 Vision', value: pos.vision, field: 'vision' },
                        { label: '🎯 Mission', value: pos.mission, field: 'mission' },
                    ].map(f => (
                        <div key={f.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                                {f.label}
                            </div>
                            {editSection === 'identity' ? (
                                <textarea className="form-input form-textarea" value={f.value}
                                    onChange={e => setPos({ ...pos, [f.field]: e.target.value })}
                                    style={{ minHeight: '100px', fontSize: 'var(--font-size-xs)' }} />
                            ) : (
                                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 }}>{f.value}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Werte */}
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                    ❤️ Unternehmenswerte
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {pos.values.map(value => (
                        <div key={value.id} style={{
                            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
                            padding: '16px', borderLeft: '3px solid var(--color-primary)',
                            transition: 'transform 0.2s ease',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '20px' }}>{value.icon}</span>
                                {editSection === 'identity' ? (
                                    <input type="text" className="form-input" value={value.title}
                                        onChange={e => setPos({ ...pos, values: pos.values.map(v => v.id === value.id ? { ...v, title: e.target.value } : v) })}
                                        style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, padding: '4px 8px' }} />
                                ) : (
                                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{value.title}</span>
                                )}
                            </div>
                            {editSection === 'identity' ? (
                                <textarea className="form-input form-textarea" value={value.description}
                                    onChange={e => setPos({ ...pos, values: pos.values.map(v => v.id === value.id ? { ...v, description: e.target.value } : v) })}
                                    style={{ fontSize: 'var(--font-size-xs)', minHeight: '60px' }} />
                            ) : (
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                    {value.description}
                                </p>
                            )}
                        </div>
                    ))}
                    {editSection === 'identity' && canEdit && (
                        <div style={{
                            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
                            padding: '16px', border: '1px dashed var(--border-color-strong)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Plus size={14} /> Wert hinzufügen
                            </span>
                        </div>
                    )}
                </div>
            </SectionHeader>

            {/* ─── BLOCK 3: Kommunikations-DNA ─── */}
            <SectionHeader id="comms" title="Kommunikations-DNA — Tone of Voice & Sprache" icon={Megaphone} {...sectionProps}>
                <CommsContent pos={pos} editSection={editSection} />
            </SectionHeader>

            {/* ─── BLOCK 4: Schlüsselbegriffe ─── */}
            <SectionHeader id="keywords" title="Unternehmensweite Schlüsselbegriffe" icon="🔑" {...sectionProps}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {companyKeywords.map(kw => (
                        <div key={kw.id} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: 'var(--radius-full)',
                            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
                            fontSize: 'var(--font-size-xs)',
                        }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{kw.term}</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>{kw.category}</span>
                            {editSection === 'keywords' && canEdit && (
                                <button onClick={() => deleteKeyword(kw.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }}>
                                    <X size={10} />
                                </button>
                            )}
                        </div>
                    ))}
                    {editSection === 'keywords' && canEdit && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', marginTop: '8px' }}>
                            <input type="text" className="form-input" placeholder="Begriff" value={newKeywordTerm}
                                onChange={e => setNewKeywordTerm(e.target.value)}
                                style={{ fontSize: 'var(--font-size-xs)', padding: '6px 10px', flex: 1 }} />
                            <input type="text" className="form-input" placeholder="Kategorie" value={newKeywordCategory}
                                onChange={e => setNewKeywordCategory(e.target.value)}
                                style={{ fontSize: 'var(--font-size-xs)', padding: '6px 10px', flex: 1 }} />
                            <button className="btn btn-primary btn-sm" onClick={() => {
                                if (newKeywordTerm.trim()) {
                                    addKeyword({ term: newKeywordTerm.trim(), category: newKeywordCategory.trim() || 'Allgemein', description: '' });
                                    setNewKeywordTerm('');
                                    setNewKeywordCategory('');
                                }
                            }}>
                                <Plus size={12} /> Hinzufügen
                            </button>
                        </div>
                    )}
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={11} />
                    Diese Keywords sind in allen Kampagnen automatisch eingebunden und können dort nicht verändert werden.
                    {!canEdit && ' Nur Admins können diese bearbeiten.'}
                </div>
            </SectionHeader>

            {/* ─── BLOCK 5: Zielmarkt ─── */}
            <SectionHeader id="market" title="Zielmarkt & Zielgruppen" icon={Globe} {...sectionProps}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <Field label="Primärmarkt" value={pos.primaryMarket} section="market" editSection={editSection} />
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                                Sekundärmärkte
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {pos.secondaryMarkets.map(m => (
                                    <span key={m} className="keyword-tag keyword-tag--read">{m}</span>
                                ))}
                            </div>
                        </div>
                        <Field label="Zielunternehmensgröße" value={pos.targetCompanySize} section="market" editSection={editSection} />
                    </div>
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                                Zielbranchen
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {pos.targetIndustries.map(ind => (
                                    <div key={ind} style={{
                                        padding: '8px 12px', background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)',
                                        fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px',
                                    }}>
                                        <span style={{ color: 'var(--color-primary)' }}>▸</span> {ind}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '12px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '6px', color: '#10b981' }}>🔗 Verknüpfte Zielgruppen</div>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Die detaillierten Buyer-Personas findest du im{' '}
                                <button
                                    onClick={() => router.push('/audiences')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-light)', fontWeight: 600, padding: 0 }}
                                >
                                    Zielgruppen-Modul →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionHeader>
        </div>
    );
}
