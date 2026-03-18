import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Task, TaskStatus } from '../types';
import { initialTasks } from '../data/mockData';

interface TaskContextValue {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id'> & { id?: string }) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    updateTaskStatus: (id: string, newStatus: TaskStatus) => void;
    executeAiAgent: (id: string, prompt: string, taskType: string) => void;
    sendAiFeedback: (id: string, feedback: string) => void;
    analyzeTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    const addTask = (task: Omit<Task, 'id'> & { id?: string }) => {
        const id = task.id || 't' + Date.now();
        setTasks(prev => [...prev, { ...task, id } as Task]);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const updateTaskStatus = (id: string, newStatus: TaskStatus) => {
        setTasks(prev => prev.map(c => {
            if (c.id !== id) return c;
            const updated = { ...c, status: newStatus };
            if (newStatus === 'monitoring') {
                updated.performance = {
                    impressions: Math.floor(Math.random() * 20000) + 3000,
                    clicks: Math.floor(Math.random() * 2000) + 200,
                    ctr: +(Math.random() * 8 + 1).toFixed(1),
                };
            }
            return updated;
        }));
    };

    const executeAiAgent = (id: string, prompt: string, taskType: string) => {
        setTasks(prev => prev.map(c =>
            c.id === id ? { ...c, status: 'ai_generating' as TaskStatus, aiPrompt: prompt } : c,
        ));

        setTimeout(() => {
            setTasks(prev => prev.map(c => {
                if (c.id !== id) return c;
                const isVisual = taskType === 'Video' || taskType === 'Post (Foto)' || taskType === 'Karousell';
                const resultText = isVisual
                    ? `[KI INFO]: Asset/Konzept für "${taskType}" wurde generiert und an den verknüpften OneDrive-Ordner übergeben.`
                    : `(Generierter Entwurf basierend auf Typ '${taskType}')\n\nHeadline: Dein IT-Einstieg startet heute!\nBody: Entdecke, wie du ohne Vorkenntnisse in die Software-QA kommst. Sicher dir deinen Bildungsgutschein...\n\nCall-To-Action: Jetzt beim Webinar anmelden!`;
                return { ...c, status: 'ai_ready' as TaskStatus, aiSuggestion: resultText };
            }));
        }, 2000);
    };

    const sendAiFeedback = (id: string, feedback: string) => {
        setTasks(prev => prev.map(c =>
            c.id === id ? { ...c, status: 'revision' as TaskStatus } : c,
        ));

        setTimeout(() => {
            setTasks(prev => prev.map(c => {
                if (c.id !== id) return c;
                return {
                    ...c,
                    status: 'ai_ready' as TaskStatus,
                    aiSuggestion: `(Überarbeiteter Entwurf nach Feedback: "${feedback}")\n\nHeadline: Starte deine neue Karriere als Tester!\nBody: Einfacher, emotionaler und praxisnäher. Du brauchst keine Vorkenntnisse für diesen Job...\n\nCall-To-Action: Kostenloses Webinar sichern!`,
                };
            }));
        }, 1500);
    };

    const analyzeTask = (id: string) => {
        setTasks(prev => prev.map(c => {
            if (c.id !== id) return c;
            const isGood = c.performance && c.performance.ctr > 3;
            return {
                ...c,
                status: 'analyzed' as TaskStatus,
                analysisResult: {
                    verdict: isGood ? 'good' as const : 'needs_improvement' as const,
                    text: isGood
                        ? `CTR von ${c.performance!.ctr}% liegt über dem Benchmark (3%). Empfehlung: Budget erhöhen und ähnliche Creatives erstellen.`
                        : `CTR von ${c.performance?.ctr ?? 0}% liegt unter dem Benchmark (3%). Empfehlung: Headline A/B-Test durchführen und Visual überarbeiten.`,
                },
            };
        }));
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask, updateTaskStatus, executeAiAgent, sendAiFeedback, analyzeTask }}>
            {children}
        </TaskContext.Provider>
    );
}

export const useTasks = (): TaskContextValue => {
    const ctx = useContext(TaskContext);
    if (!ctx) throw new Error('useTasks must be used within TaskProvider');
    return ctx;
};
