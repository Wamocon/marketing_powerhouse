import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Target, Heart, Megaphone, Globe,
    Edit, Check, X, Lock, ChevronDown, ChevronUp, Plus, Trash2,
} from 'lucide-react';
import { companyPositioning, companyKeywords } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const sectionIcons = {
    dna: Building2,
    identity: Target,
    comms: Megaphone,
    keywords: '🔑',
    market: Globe,
};

export default function PositioningPage() {
    const { can } = useAuth();
    const navigate = useNavigate();
    const [pos, setPos] = useState(companyPositioning);
    const [editSection, setEditSection] = useState(null); // which section is in edit mode
    const [openSections, setOpenSections] = useState({
        dna: true, identity: true, comms: true, keywords: true, market: true,
    });

    const canEdit = can('canEditPositioning');

    const toggleSection = (key) =>
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    const SectionHeader = ({ id, title, icon, children }) => (
        <div className="card" style={{ marginBottom: '16px' }}>
            <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => toggleSection(id)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-elevated)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                    }}>
                        {typeof icon === 'string' ? icon : (() => { const I = icon; return <I size={16} style={{ color: 'var(--color-primary-light)' }} />; })()}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>{title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {canEdit && editSection !== id && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => { e.stopPropagation(); setEditSection(id); setOpenSections(prev => ({ ...prev, [id]: true })); }}
                        >
                            <Edit size={13} /> Bearbeiten
                        </button>
                    )}
                    {canEdit && editSection === id && (
                        <>
                            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setEditSection(null); }}>
                                <Check size={13} /> Speichern
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setEditSection(null); }}>
                                <X size={13} />
                            </button>
                        </>
                    )}
                    {openSections[id] ? <ChevronUp size={16} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />}
                </div>
            </div>
            {openSections[id] && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                    {children}
                </div>
            )}
        </div>
    );

    const Field = ({ label, value, field, multiline = false, section }) => {
        const isEditing = editSection === section;
        return (
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                    {label}
                </div>
                {isEditing ? (
                    multiline ? (
                        <textarea
                            className="form-input form-textarea"
                            defaultValue={value}
                            style={{ minHeight: '80px', fontSize: 'var(--font-size-sm)' }}
                        />
                    ) : (
                        <input type="text" className="form-input" defaultValue={value} style={{ fontSize: 'var(--font-size-sm)' }} />
                    )
                ) : (
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                        {value || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Nicht angegeben</span>}
                    </div>
                )}
            </div>
        );
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
            <SectionHeader id="dna" title="Unternehmens-DNA" icon={Building2}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {[
                        { label: 'Unternehmensname', value: pos.name },
                        { label: 'Tagline', value: pos.tagline },
                        { label: 'Gegründet', value: pos.founded },
                        { label: 'Branche', value: pos.industry },
                        { label: 'Hauptsitz', value: pos.headquarters },
                        { label: 'Rechtsform', value: pos.legalForm },
                        { label: 'Mitarbeiter', value: pos.employees },
                        { label: 'Website', value: pos.website },
                    ].map(f => (
                        <div key={f.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                {f.label}
                            </div>
                            {editSection === 'dna' ? (
                                <input type="text" className="form-input" defaultValue={f.value}
                                    style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px' }} />
                            ) : (
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{f.value}</div>
                            )}
                        </div>
                    ))}
                </div>
            </SectionHeader>

            {/* ─── BLOCK 2: Digitale Identität ─── */}
            <SectionHeader id="identity" title="Digitale Identität — Vision, Mission & Werte" icon={Target}>
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
                                <textarea className="form-input form-textarea" defaultValue={f.value} style={{ minHeight: '100px', fontSize: 'var(--font-size-xs)' }} />
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
                                    <input type="text" className="form-input" defaultValue={value.title}
                                        style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, padding: '4px 8px' }} />
                                ) : (
                                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{value.title}</span>
                                )}
                            </div>
                            {editSection === 'identity' ? (
                                <textarea className="form-input form-textarea" defaultValue={value.description}
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
            <SectionHeader id="comms" title="Kommunikations-DNA — Tone of Voice & Sprache" icon={Megaphone}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Tone of Voice */}
                    <div>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                            🎭 Tone of Voice — Adjektive
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {pos.toneOfVoice.adjectives.map(adj => (
                                <span key={adj} style={{
                                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                                    background: 'rgba(99,102,241,0.12)', color: 'var(--color-primary-light)',
                                    border: '1px solid rgba(99,102,241,0.25)', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                }}>
                                    {adj}
                                </span>
                            ))}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                            Beschreibung
                        </div>
                        {editSection === 'comms' ? (
                            <textarea className="form-input form-textarea" defaultValue={pos.toneOfVoice.description} style={{ minHeight: '80px', fontSize: 'var(--font-size-xs)' }} />
                        ) : (
                            <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{pos.toneOfVoice.description}</p>
                        )}
                        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px', fontWeight: 600 }}>Markenpersönlichkeit</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                                „{pos.toneOfVoice.personality}"
                            </div>
                        </div>
                    </div>

                    {/* Dos & Don'ts */}
                    <div>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#10b981', marginBottom: '10px' }}>
                            ✅ Dos
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                            {pos.dos.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                                    padding: '8px 12px', background: 'rgba(16,185,129,0.08)',
                                    borderRadius: 'var(--radius-sm)', borderLeft: '2px solid #10b981',
                                    fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5,
                                }}>
                                    <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>+</span>
                                    {editSection === 'comms' ? (
                                        <input type="text" className="form-input" defaultValue={item} style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px' }} />
                                    ) : item}
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#ef4444', marginBottom: '10px' }}>
                            ❌ Don'ts
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {pos.donts.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                                    padding: '8px 12px', background: 'rgba(239,68,68,0.08)',
                                    borderRadius: 'var(--radius-sm)', borderLeft: '2px solid #ef4444',
                                    fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5,
                                }}>
                                    <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>−</span>
                                    {editSection === 'comms' ? (
                                        <input type="text" className="form-input" defaultValue={item} style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px' }} />
                                    ) : item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionHeader>

            {/* ─── BLOCK 4: Schlüsselbegriffe ─── */}
            <SectionHeader id="keywords" title="Unternehmensweite Schlüsselbegriffe" icon="🔑">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {companyKeywords.map(kw => (
                        <div key={kw.id} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: 'var(--radius-full)',
                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
                            fontSize: 'var(--font-size-xs)',
                        }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{kw.term}</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>{kw.category}</span>
                            {editSection === 'keywords' && canEdit && (
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }}>
                                    <X size={10} />
                                </button>
                            )}
                        </div>
                    ))}
                    {editSection === 'keywords' && canEdit && (
                        <button style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-full)',
                            border: '1px dashed var(--border-color-strong)', background: 'transparent',
                            fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                            <Plus size={10} /> Hinzufügen
                        </button>
                    )}
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={11} />
                    Diese Keywords sind in allen Kampagnen automatisch eingebunden und können dort nicht verändert werden.
                    {!canEdit && ' Nur Admins können diese bearbeiten.'}
                </div>
            </SectionHeader>

            {/* ─── BLOCK 5: Zielmarkt ─── */}
            <SectionHeader id="market" title="Zielmarkt & Zielgruppen" icon={Globe}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <Field label="Primärmarkt" value={pos.primaryMarket} section="market" />
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
                        <Field label="Zielunternehmensgröße" value={pos.targetCompanySize} section="market" />
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
                                    onClick={() => navigate('/audiences')}
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
