import { useState, type ReactNode } from 'react';
import { HelpCircle, X, Info } from 'lucide-react';

interface PageHelpProps {
    title: string;
    children: ReactNode;
}

export default function PageHelp({ title, children }: PageHelpProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsOpen(true)}
                title="Hilfe zu dieser Ansicht"
                style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
                <HelpCircle size={16} /> <span className="hide-mobile">Hilfe</span>
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
                    <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{
                        margin: 0, width: '100%', maxWidth: '550px',
                        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        <div className="modal-header" style={{ background: 'var(--bg-surface)' }}>
                            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Info size={18} style={{ color: 'var(--color-primary)' }} />
                                Leitfaden: {title}
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setIsOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 'var(--font-size-sm)', background: 'var(--bg-base)', maxHeight: '70vh', overflowY: 'auto' }}>
                            {children}
                        </div>
                        <div className="modal-footer" style={{ background: 'var(--bg-surface)' }}>
                            <button className="btn btn-primary" onClick={() => setIsOpen(false)}>Alles klar!</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
