import { type ReactNode } from 'react';
import { Edit, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface SectionHeaderProps {
    id: string;
    title: string;
    icon: any;
    children: ReactNode;
    canEdit: boolean;
    editSection: string | null;
    openSections: Record<string, boolean>;
    onToggle: (key: string) => void;
    onEdit: (id: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export function SectionHeader({
    id, title, icon, children,
    canEdit, editSection, openSections,
    onToggle, onEdit, onSave, onCancel,
}: SectionHeaderProps) {
    return (
        <div className="card" style={{ marginBottom: '16px' }}>
            <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => onToggle(id)}
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
                            onClick={(e) => { e.stopPropagation(); onEdit(id); }}
                        >
                            <Edit size={13} /> Bearbeiten
                        </button>
                    )}
                    {canEdit && editSection === id && (
                        <>
                            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onSave(); }}>
                                <Check size={13} /> Speichern
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onCancel(); }}>
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
}

interface FieldProps {
    label: string;
    value: any;
    multiline?: boolean;
    editSection: string | null;
    section: string;
}

export function Field({ label, value, multiline = false, editSection, section }: FieldProps) {
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
}

interface CommsContentProps {
    pos: { toneOfVoice: { adjectives: string[]; description: string; personality: string }; dos: string[]; donts: string[] };
    editSection: string | null;
}

export function CommsContent({ pos, editSection }: CommsContentProps) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                    🎭 Tone of Voice — Adjektive
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {pos.toneOfVoice.adjectives.map(adj => (
                        <span key={adj} style={{
                            padding: '4px 12px', borderRadius: 'var(--radius-full)',
                            background: 'rgba(220,38,38,0.12)', color: 'var(--color-primary)',
                            border: '1px solid rgba(220,38,38,0.25)', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                        }}>{adj}</span>
                    ))}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Beschreibung</div>
                {editSection === 'comms' ? (
                    <textarea className="form-input form-textarea" defaultValue={pos.toneOfVoice.description} style={{ minHeight: '80px', fontSize: 'var(--font-size-xs)' }} />
                ) : (
                    <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{pos.toneOfVoice.description}</p>
                )}
                <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px', fontWeight: 600 }}>Markenpersönlichkeit</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontStyle: 'italic', color: 'var(--text-primary)' }}>„{pos.toneOfVoice.personality}"</div>
                </div>
            </div>
            <div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#10b981', marginBottom: '10px' }}>✅ Dos</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                    {pos.dos.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid #10b981', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>+</span>
                            {editSection === 'comms' ? <input type="text" className="form-input" defaultValue={item} style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px' }} /> : item}
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#ef4444', marginBottom: '10px' }}>❌ Don'ts</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pos.donts.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid #ef4444', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>−</span>
                            {editSection === 'comms' ? <input type="text" className="form-input" defaultValue={item} style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px' }} /> : item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
