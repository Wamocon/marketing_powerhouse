import type { Task } from '../types';
import { Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

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
                    <div style={{ background: 'var(--bg-hover)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary)' }}>Generiertes Ergebnis:</div>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--font-size-sm)', lineHeight: 1.5, marginBottom: '12px' }}>
                            {task.aiSuggestion}
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
