import { useState } from 'react';
import { FileText, Lightbulb, ChevronDown, Clock, Users } from 'lucide-react';

export const PlaceholderImage = ({ title, icon: Icon, color, description }: any) => (
    <div style={{
        background: 'var(--bg-hover)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-color)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '280px', color: 'var(--text-tertiary)', marginBottom: '24px', position: 'relative', overflow: 'hidden',
        padding: '24px', textAlign: 'center'
    }}>
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: color || 'var(--color-primary)'
        }} />
        <Icon size={48} style={{ marginBottom: '16px', opacity: 0.5, color: color || 'var(--text-tertiary)' }} />
        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>ð¸ Screenshot Platzhalter</div>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</div>
        {description && <div style={{ fontSize: 'var(--font-size-xs)', maxWidth: '400px', lineHeight: 1.5 }}>{description}</div>}
    </div>
);

export const SectionTitle = ({ icon: Icon, title, color }: any) => (
    <h3 style={{
        fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px', marginTop: '48px'
    }}>
        <div style={{ background: `${color}15`, padding: '8px', borderRadius: '8px', color: color, display: 'flex' }}>
            <Icon size={24} />
        </div>
        {title}
    </h3>
);

export const TipBox = ({ title, children }: any) => (
    <div style={{
        padding: '16px', background: 'rgba(56, 189, 248, 0.08)', borderLeft: '4px solid #38bdf8',
        borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: 'var(--font-size-sm)'
    }}>
        <div style={{ fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Lightbulb size={16} /> {title}
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{children}</div>
    </div>
);

export const AccordionItem = ({ id: _id, title, icon: Icon, color, children, defaultOpen = false }: { id?: string; title: any; icon: any; color: any; children: any; defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            overflow: 'hidden'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: 'var(--bg-surface)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).parentElement!.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => (e.target as HTMLElement).parentElement!.style.background = 'transparent'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ background: `${color}15`, padding: '6px', borderRadius: '6px', color: color, display: 'flex' }}>
                        <Icon size={18} />
                    </div>
                    <span>{title}</span>
                </div>
                <ChevronDown
                    size={20}
                    style={{
                        transition: 'transform 0.3s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: 'var(--text-tertiary)'
                    }}
                />
            </button>
            {isOpen && (
                <div style={{
                    padding: '24px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-hover)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export const TableOfContents = ({ sections }: any) => (
    <div style={{
        padding: '24px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '32px',
        border: '1px solid var(--border-color)'
    }}>
        <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> Inhaltsverzeichnis
        </h4>
        <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sections.map((section: string, idx: number) => (
                <li key={idx}>
                    <a href={`#section-${idx}`} style={{
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontSize: 'var(--font-size-sm)',
                        transition: 'color 0.2s'
                    }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--color-primary-hover)'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--color-primary)'}>
                        {section}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

export const WorkflowCard = ({ title, duration, roles, description, steps }: any) => (
    <div style={{
        padding: '24px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        background: 'var(--bg-surface)'
    }}>
        <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>{title}</h4>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <Clock size={16} /> {duration}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <Users size={16} /> {roles}
                </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>{description}</p>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Schritte:</h5>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {steps.map((step: any, idx: number) => (
                    <li key={idx} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{step.title}</strong>: {step.description}
                    </li>
                ))}
            </ol>
        </div>
    </div>
);
