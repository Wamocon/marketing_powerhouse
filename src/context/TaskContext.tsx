import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Task, TaskStatus } from '../types';
import * as api from '../lib/api';

interface TaskContextValue {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id'> & { id?: string }) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    updateTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
    executeAiAgent: (id: string, prompt: string, taskType: string) => void;
    sendAiFeedback: (id: string, feedback: string) => void;
    analyzeTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        api.fetchTasks().then(setTasks).catch(console.error);
    }, []);

    const addTask = useCallback(async (task: Omit<Task, 'id'> & { id?: string }) => {
        const created = await api.createTask(task);
        setTasks(prev => [...prev, created]);
    }, []);

    const updateTaskFn = useCallback(async (id: string, updates: Partial<Task>) => {
        await api.updateTask(id, updates);
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }, []);

    const deleteTaskFn = useCallback(async (id: string) => {
        await api.deleteTask(id);
        setTasks(prev => prev.filter(t => t.id !== id));
    }, []);

    const updateTaskStatus = useCallback(async (id: string, newStatus: TaskStatus) => {
        const updates: Partial<Task> = { status: newStatus };
        if (newStatus === 'monitoring') {
            updates.performance = {
                impressions: Math.floor(Math.random() * 20000) + 3000,
                clicks: Math.floor(Math.random() * 2000) + 200,
                ctr: +(Math.random() * 8 + 1).toFixed(1),
            };
        }
        await api.updateTask(id, updates);
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }, []);

    const executeAiAgent = useCallback((id: string, prompt: string, taskType: string) => {
        setTasks(prev => prev.map(c =>
            c.id === id ? { ...c, status: 'ai_generating' as TaskStatus, aiPrompt: prompt } : c,
        ));
        api.updateTask(id, { status: 'ai_generating' as TaskStatus, aiPrompt: prompt });

        setTimeout(async () => {
            const isVisual = taskType === 'Video' || taskType === 'Post (Foto)' || taskType === 'Karousell';
            const resultText = isVisual
                ? `[KI INFO]: Asset/Konzept für "${taskType}" wurde generiert und an den verknüpften OneDrive-Ordner übergeben.`
                : `(Generierter Entwurf basierend auf Typ '${taskType}')\n\nHeadline: Dein IT-Einstieg startet heute!\nBody: Entdecke, wie du ohne Vorkenntnisse in die Software-QA kommst. Sicher dir deinen Bildungsgutschein...\n\nCall-To-Action: Jetzt beim Webinar anmelden!`;
            const updates = { status: 'ai_ready' as TaskStatus, aiSuggestion: resultText };
            await api.updateTask(id, updates);
            setTasks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        }, 2000);
    }, []);

    const sendAiFeedback = useCallback((id: string, feedback: string) => {
        setTasks(prev => prev.map(c =>
            c.id === id ? { ...c, status: 'revision' as TaskStatus } : c,
        ));
        api.updateTask(id, { status: 'revision' as TaskStatus });

        setTimeout(async () => {
            const updates = {
                status: 'ai_ready' as TaskStatus,
                aiSuggestion: `(Überarbeiteter Entwurf nach Feedback: "${feedback}")\n\nHeadline: Starte deine neue Karriere als Tester!\nBody: Einfacher, emotionaler und praxisnäher. Du brauchst keine Vorkenntnisse für diesen Job...\n\nCall-To-Action: Kostenloses Webinar sichern!`,
            };
            await api.updateTask(id, updates);
            setTasks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        }, 1500);
    }, []);

    const analyzeTask = useCallback((id: string) => {
        setTasks(prev => prev.map(c => {
            if (c.id !== id) return c;
            const isGood = c.performance && c.performance.ctr > 3;
            const updates = {
                status: 'analyzed' as TaskStatus,
                analysisResult: {
                    verdict: (isGood ? 'good' : 'needs_improvement') as 'good' | 'needs_improvement',
                    text: isGood
                        ? `CTR von ${c.performance!.ctr}% liegt über dem Benchmark (3%). Empfehlung: Budget erhöhen und ähnliche Creatives erstellen.`
                        : `CTR von ${c.performance?.ctr ?? 0}% liegt unter dem Benchmark (3%). Empfehlung: Headline A/B-Test durchführen und Visual überarbeiten.`,
                },
            };
            api.updateTask(id, updates);
            return { ...c, ...updates };
        }));
    }, []);

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask: updateTaskFn, deleteTask: deleteTaskFn, updateTaskStatus, executeAiAgent, sendAiFeedback, analyzeTask }}>
            {children}
        </TaskContext.Provider>
    );
}

export const useTasks = (): TaskContextValue => {
    const ctx = useContext(TaskContext);
    if (!ctx) throw new Error('useTasks must be used within TaskProvider');
    return ctx;
};
