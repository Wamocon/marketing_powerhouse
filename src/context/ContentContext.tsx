import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { ContentItem, ContentStatus } from '../types';
import { useCompany } from './CompanyContext';
import { useAuth } from './AuthContext';
import * as api from '../lib/api';
import { notifyContentStatusChanged } from '../lib/notificationTriggers';

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
    addContent: (content: Omit<ContentItem, 'id' | 'createdAt'>) => Promise<string>;
    updateContent: (id: string, updates: Partial<ContentItem>) => Promise<void>;
    deleteContent: (id: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
    const { activeCompany } = useCompany();
    const { currentUser } = useAuth();
    const companyId = activeCompany?.id ?? null;
    const currentUserId = currentUser?.id ?? null;
    const prevCompanyId = useRef<string | null>(null);
    const [contents, setContents] = useState<ContentItem[]>([]);

    useEffect(() => {
        if (prevCompanyId.current !== companyId) {
            prevCompanyId.current = companyId;
            if (companyId) {
                api.fetchContents(companyId).then(setContents).catch(console.error);
            } else {
                setContents([]);
            }
        }
    }, [companyId]);

    const addContent = useCallback(async (content: Omit<ContentItem, 'id' | 'createdAt'>): Promise<string> => {
        if (!companyId) throw new Error('Kein Unternehmen ausgewählt');
        const created = await api.createContent(content, companyId);
        setContents(prev => [...prev, created]);
        return created.id;
    }, [companyId]);

    const updateContent = useCallback(async (id: string, updates: Partial<ContentItem>) => {
        const oldContent = contents.find(c => c.id === id);
        await api.updateContent(id, updates);
        setContents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        // Notify author on relevant status changes
        if (updates.status && oldContent && updates.status !== oldContent.status && companyId) {
            const recipients: string[] = [];
            if (oldContent.author && oldContent.author !== currentUserId) {
                recipients.push(oldContent.author);
            }
            if (recipients.length > 0) {
                notifyContentStatusChanged({
                    companyId,
                    triggeredByUserId: currentUserId ?? undefined,
                    recipientUserIds: recipients,
                    contentId: id,
                    contentTitle: oldContent.title,
                    newStatus: updates.status,
                });
            }
        }
    }, [contents, companyId, currentUserId]);

    const deleteContent = useCallback(async (id: string) => {
        await api.deleteContent(id);
        setContents(prev => prev.filter(c => c.id !== id));
    }, []);

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
