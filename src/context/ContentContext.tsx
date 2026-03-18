import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ContentItem, ContentStatus } from '../types';
import { initialContents } from '../data/mockData';

export const CONTENT_STATUSES: Record<ContentStatus, { label: string; color: string; icon: string }> = {
    idea: { label: 'Idee', color: '#94a3b8', icon: '💡' },
    planning: { label: 'In Planung', color: '#8b5cf6', icon: '📋' },
    production: { label: 'In Produktion', color: '#f59e0b', icon: '🔧' },
    ready: { label: 'Bereit', color: '#06b6d4', icon: '✅' },
    scheduled: { label: 'Eingeplant', color: '#6366f1', icon: '📅' },
    published: { label: 'Veröffentlicht', color: '#10b981', icon: '🚀' },
};

export const CONTENT_STATUS_ORDER: ContentStatus[] = [
    'idea', 'planning', 'production', 'ready', 'scheduled', 'published',
];

interface ContentContextValue {
    contents: ContentItem[];
    addContent: (content: Omit<ContentItem, 'id' | 'createdAt'>) => string;
    updateContent: (id: string, updates: Partial<ContentItem>) => void;
    deleteContent: (id: string) => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
    const [contents, setContents] = useState<ContentItem[]>(initialContents);

    const addContent = (content: Omit<ContentItem, 'id' | 'createdAt'>): string => {
        const newContent: ContentItem = {
            id: 'cnt' + Date.now(),
            createdAt: new Date().toISOString(),
            ...content,
        };
        setContents(prev => [...prev, newContent]);
        return newContent.id;
    };

    const updateContent = (id: string, updates: Partial<ContentItem>) => {
        setContents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const deleteContent = (id: string) => {
        setContents(prev => prev.filter(c => c.id !== id));
    };

    return (
        <ContentContext.Provider value={{ contents, addContent, updateContent, deleteContent }}>
            {children}
        </ContentContext.Provider>
    );
}

export const useContents = (): ContentContextValue => {
    const ctx = useContext(ContentContext);
    if (!ctx) throw new Error('useContents must be used within ContentProvider');
    return ctx;
};
