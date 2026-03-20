import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { Task, TaskStatus } from '../types';
import { useCompany } from './CompanyContext';
import * as api from '../lib/api';
import { buildTaskPrompt, type PromptContext } from '../lib/promptBuilder';
import { generateContent } from '../lib/gemini';

interface TaskContextValue {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id'> & { id?: string }) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    updateTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
    executeAiAgent: (id: string, prompt: string, taskType: string) => void;
    sendAiFeedback: (id: string, feedback: string) => void;
    analyzeTask: (id: string) => void;
    setPromptContext: (ctx: Omit<PromptContext, 'task'>) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
    const { activeCompany } = useCompany();
    const companyId = activeCompany?.id ?? null;
    const prevCompanyId = useRef<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [promptCtx, setPromptCtx] = useState<Omit<PromptContext, 'task'> | null>(null);

    useEffect(() => {
        if (prevCompanyId.current !== companyId) {
            prevCompanyId.current = companyId;
            if (companyId) {
                api.fetchTasks(companyId).then(setTasks).catch(console.error);
            } else {
                setTasks([]);
            }
        }
    }, [companyId]);

    const addTask = useCallback(async (task: Omit<Task, 'id'> & { id?: string }) => {
        if (!companyId) return;
        const created = await api.createTask(task, companyId);
        setTasks(prev => [...prev, created]);
    }, [companyId]);

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

    const setPromptContext = useCallback((ctx: Omit<PromptContext, 'task'>) => {
        setPromptCtx(ctx);
    }, []);

    const executeAiAgent = useCallback(async (id: string, _prompt: string, _taskType: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        setTasks(prev => prev.map(c =>
            c.id === id ? { ...c, status: 'ai_generating' as TaskStatus } : c,
        ));
        await api.updateTask(id, { status: 'ai_generating' as TaskStatus });

        try {
            // Build context-aware prompt using MASTER_PROMPT_SYSTEM
            const fullPrompt = promptCtx
                ? buildTaskPrompt({ ...promptCtx, task })
                : _prompt;

            // Save the prompt used
            await api.updateTask(id, { aiPrompt: fullPrompt });

            const result = await generateContent(fullPrompt);

            if (result.error) {
                const updates = {
                    status: 'ai_ready' as TaskStatus,
                    aiSuggestion: `⚠️ KI-Fehler: ${result.error}`,
                };
                await api.updateTask(id, updates);
                setTasks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
                return;
            }

            const updates = { status: 'ai_ready' as TaskStatus, aiSuggestion: result.text };
            await api.updateTask(id, updates);
            setTasks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        } catch (err) {
            console.error('AI generation failed:', err);
            const updates = {
                status: 'ai_ready' as TaskStatus,
                aiSuggestion: `⚠️ Fehler bei der KI-Generierung: ${err instanceof Error ? err.message : String(err)}`,
            };
            await api.updateTask(id, updates);
            setTasks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        }
    }, [tasks, promptCtx]);

    const sendAiFeedback = useCallback(async (id: string, feedback: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        setTasks(prev => prev.map(c =>
            c.id === id ? { ...c, status: 'revision' as TaskStatus } : c,
        ));
        await api.updateTask(id, { status: 'revision' as TaskStatus });

        try {
            const previousSuggestion = task.aiSuggestion || '';
            const feedbackPrompt = promptCtx
                ? buildTaskPrompt({ ...promptCtx, task }) + `\n\nVORHERIGER ENTWURF:\n${previousSuggestion}\n\nFEEDBACK DES NUTZERS:\n${feedback}\n\nBitte überarbeite den Entwurf basierend auf dem Feedback.`
                : `Überarbeite folgenden Entwurf:\n${previousSuggestion}\n\nFeedback: ${feedback}`;

            const result = await generateContent(feedbackPrompt);

            const updates = {
                status: 'ai_ready' as TaskStatus,
                aiSuggestion: result.error ? `⚠️ KI-Fehler: ${result.error}` : result.text,
            };
            await api.updateTask(id, updates);
            setTasks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        } catch (err) {
            console.error('AI feedback failed:', err);
            const updates = {
                status: 'ai_ready' as TaskStatus,
                aiSuggestion: `⚠️ Fehler: ${err instanceof Error ? err.message : String(err)}`,
            };
            await api.updateTask(id, updates);
            setTasks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        }
    }, [tasks, promptCtx]);

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
        <TaskContext.Provider value={{ tasks, addTask, updateTask: updateTaskFn, deleteTask: deleteTaskFn, updateTaskStatus, executeAiAgent, sendAiFeedback, analyzeTask, setPromptContext }}>
            {children}
        </TaskContext.Provider>
    );
}

export const useTasks = (): TaskContextValue => {
    const ctx = useContext(TaskContext);
    if (!ctx) throw new Error('useTasks must be used within TaskProvider');
    return ctx;
};
