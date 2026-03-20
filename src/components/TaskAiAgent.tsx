import type { Task } from '../types';
import { Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { type ReactNode } from 'react';

/** Lightweight markdown → JSX for AI output (handles headings, bold, italic, lists, dividers) */
function renderMarkdown(text: string): ReactNode[] {
    const lines = text.split('\n');
    const elements: ReactNode[] = [];
    let listItems: ReactNode[] = [];
    let key = 0;

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={key++} style={{ margin: '8px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {listItems}
                </ul>
            );
            listItems = [];
        }
    };

    const inlineFormat = (str: string): ReactNode => {
        // Process bold (**text**) and italic (*text*) 
        const parts: ReactNode[] = [];
        let remaining = str;
        let i = 0;
        const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
        let match;
        let lastIndex = 0;
        regex.lastIndex = 0;
        while ((match = regex.exec(remaining)) !== null) {
            if (match.index > lastIndex) {
                parts.push(remaining.slice(lastIndex, match.index));
            }
            if (match[1]) {
                parts.push(<strong key={i++} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{match[1]}</strong>);
            } else if (match[2]) {
                parts.push(<em key={i++} style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{match[2]}</em>);
            }
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < remaining.length) {
            parts.push(remaining.slice(lastIndex));
        }
        return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
    };

    for (const line of lines) {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
            flushList();
            elements.push(<div key={key++} style={{ height: '8px' }} />);
            continue;
        }

        // Horizontal rule
        if (/^\*{3,}$|^-{3,}$/.test(trimmed)) {
            flushList();
            elements.push(<hr key={key++} style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0' }} />);
            continue;
        }

        // Headings
        const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
        if (headingMatch) {
            flushList();
            const level = headingMatch[1].length;
            const sizes: Record<number, string> = { 1: '1rem', 2: '0.925rem', 3: '0.875rem', 4: '0.8125rem' };
            elements.push(
                <div key={key++} style={{
                    fontSize: sizes[level] || '0.875rem',
                    fontWeight: 700,
                    color: level <= 2 ? 'var(--color-primary)' : 'var(--text-primary)',
                    marginTop: level <= 2 ? '16px' : '12px',
                    marginBottom: '6px',
                    letterSpacing: level <= 2 ? '0.01em' : undefined,
                }}>
                    {inlineFormat(headingMatch[2])}
                </div>
            );
            continue;
        }

        // List items (* or -)
        const listMatch = trimmed.match(/^[*\-]\s+(.+)/);
        if (listMatch) {
            listItems.push(
                <li key={key++} style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    {inlineFormat(listMatch[1])}
                </li>
            );
            continue;
        }

        // Regular paragraph
        flushList();
        elements.push(
            <p key={key++} style={{ margin: '4px 0', fontSize: 'var(--font-size-sm)', lineHeight: 1.65, color: 'var(--text-primary)' }}>
                {inlineFormat(trimmed)}
            </p>
        );
    }
    flushList();
    return elements;
}

interface TaskAiAgentProps {
    task: Task;
    aiFeedbackText: string;
    setAiFeedbackText: (v: string) => void;
    updateTask: (id: string, data: Partial<Task>) => void;
    executeAiAgent: (id: string, prompt: string, type: string) => void;
    sendAiFeedback: (id: string, feedback: string) => void;
    getCampaignName: (id: string | null) => string;
}

export function TaskAiAgent({
    task, aiFeedbackText, setAiFeedbackText,
    updateTask, executeAiAgent, sendAiFeedback, getCampaignName,
}: TaskAiAgentProps) {
    return (
        <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid #10b981' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: '#10b981' }} /> KI-Assistent
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {task.status === 'ai_generating' ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <RefreshCw size={24} style={{ margin: '0 auto 8px', color: '#10b981', animation: 'spin 2s linear infinite' }} />
                        <div>KI generiert Inhalte basierend auf Kampagne und Aufgabentyp...</div>
                    </div>
                ) : task.aiSuggestion ? (
                    <div style={{ background: 'var(--bg-hover)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={14} style={{ color: '#10b981' }} /> Generiertes Ergebnis:
                        </div>
                        <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
                            {renderMarkdown(task.aiSuggestion)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}><MessageSquare size={12} style={{ display: 'inline', marginRight: '4px' }}/> Feedback für nächste Iteration</div>
                            <textarea
                                className="form-textarea"
                                placeholder="Z.B.: Mach es kürzer und emotionaler..."
                                style={{ minHeight: '60px', fontSize: 'var(--font-size-sm)' }}
                                value={aiFeedbackText}
                                onChange={e => setAiFeedbackText(e.target.value)}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                        updateTask(task.id, { description: (task.description ? task.description + '\n\n---\nKI-VORSCHLAG:\n' : '') + task.aiSuggestion });
                                    }}
                                >In Aufgabe übernehmen</button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    disabled={!aiFeedbackText.trim()}
                                    onClick={() => {
                                        sendAiFeedback(task.id, aiFeedbackText);
                                        setAiFeedbackText('');
                                    }}
                                >
                                    <RefreshCw size={14} /> KI aktualisieren
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                            Lass die KI einen ersten Entwurf erstellen. Der Agent nutzt die Kampagnendaten ({getCampaignName(task.campaignId)}), die Zielgruppe und den Aufgabentyp ({task.type || 'Kein Typ gewählt'}), um passgenaue Inhalte zu generieren.
                        </p>
                        <button
                            className="btn btn-primary btn-sm"
                            style={{ background: '#10b981', borderColor: '#10b981', color: '#fff' }}
                            onClick={() => {
                                const promptMock = `Generiere Inhalt für ${task.title}`;
                                executeAiAgent(task.id, promptMock, task.type || 'Post (Beschreibung)');
                            }}
                        >
                            <Sparkles size={14} /> Mit KI generieren
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
