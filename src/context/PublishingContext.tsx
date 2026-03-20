'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  Plan, Subscription, ConnectedAccount, ScheduledPost,
  EngagementGroup, KnowledgeDocument, AiGenerationLog,
} from '../types';
import * as api from '../lib/api';
import { useCompany } from './CompanyContext';

// ─── Types ─────────────────────────────────────────────────

interface PublishingState {
  // Subscription & Plans
  plans: Plan[];
  subscription: Subscription | null;
  // Connected accounts
  connectedAccounts: ConnectedAccount[];
  // Scheduled posts
  scheduledPosts: ScheduledPost[];
  // Engagement groups
  engagementGroups: EngagementGroup[];
  // AI Knowledge
  knowledgeDocuments: KnowledgeDocument[];
  // AI Logs
  aiLogs: AiGenerationLog[];
  // Loading states
  loading: boolean;
  plansLoading: boolean;
}

interface PublishingActions {
  // Refresh all data
  refresh: () => Promise<void>;
  // Connected accounts
  addConnectedAccount: (account: Omit<ConnectedAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ConnectedAccount>;
  removeConnectedAccount: (id: string) => Promise<void>;
  // Scheduled posts
  addScheduledPost: (post: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ScheduledPost>;
  updateScheduledPost: (id: string, updates: Partial<ScheduledPost>) => Promise<void>;
  removeScheduledPost: (id: string) => Promise<void>;
  // Knowledge documents
  addKnowledgeDocument: (doc: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<KnowledgeDocument>;
  updateKnowledgeDocument: (id: string, updates: Partial<KnowledgeDocument>) => Promise<void>;
  removeKnowledgeDocument: (id: string) => Promise<void>;
  // AI Log
  logAiGeneration: (log: Omit<AiGenerationLog, 'id' | 'createdAt'>) => Promise<AiGenerationLog>;
  rateAiGeneration: (id: string, rating: number, feedback?: string, accepted?: boolean) => Promise<void>;
  // Engagement groups
  addEngagementGroup: (group: Omit<EngagementGroup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<EngagementGroup>;
  removeEngagementGroup: (id: string) => Promise<void>;
  // Subscription
  createSubscription: (planId: string, billingCycle?: 'monthly' | 'yearly') => Promise<void>;
  // Feature flags based on subscription
  hasFeature: (feature: 'ai_pro' | 'linkedin' | 'instagram') => boolean;
  canAddSocialAccount: () => boolean;
}

type PublishingContextType = PublishingState & PublishingActions;

// ─── Context ───────────────────────────────────────────────

const PublishingContext = createContext<PublishingContextType | null>(null);

export function usePublishing() {
  const ctx = useContext(PublishingContext);
  if (!ctx) throw new Error('usePublishing must be used within PublishingProvider');
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────

export function PublishingProvider({ children }: { children: ReactNode }) {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [engagementGroups, setEngagementGroups] = useState<EngagementGroup[]>([]);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([]);
  const [aiLogs, setAiLogs] = useState<AiGenerationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);

  // Load plans once (public data, no company needed)
  useEffect(() => {
    setPlansLoading(true);
    api.fetchPlans()
      .then(setPlans)
      .catch(console.error)
      .finally(() => setPlansLoading(false));
  }, []);

  // Load company-specific data when company changes
  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [sub, accounts, posts, groups, docs, logs] = await Promise.all([
        api.fetchSubscription(companyId),
        api.fetchConnectedAccounts(companyId),
        api.fetchScheduledPosts(companyId),
        api.fetchEngagementGroups(companyId),
        api.fetchKnowledgeDocuments(companyId),
        api.fetchAiGenerationLogs(companyId),
      ]);
      setSubscription(sub);
      setConnectedAccounts(accounts);
      setScheduledPosts(posts);
      setEngagementGroups(groups);
      setKnowledgeDocuments(docs);
      setAiLogs(logs);
    } catch (err) {
      console.error('Failed to load publishing data:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { refresh(); }, [refresh]);

  // ─── Feature flags ───────────────────────────────────────

  const hasFeature = useCallback((feature: 'ai_pro' | 'linkedin' | 'instagram'): boolean => {
    if (!subscription?.plan?.features) return false;
    return !!subscription.plan.features[feature];
  }, [subscription]);

  const canAddSocialAccount = useCallback((): boolean => {
    if (!subscription?.plan) return false;
    const maxAccounts = subscription.plan.includedSocialAccounts + subscription.extraSocialAccounts;
    return connectedAccounts.length < maxAccounts;
  }, [subscription, connectedAccounts]);

  // ─── Connected Accounts ──────────────────────────────────

  const addConnectedAccount = useCallback(async (account: Omit<ConnectedAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await api.createConnectedAccount(account);
    setConnectedAccounts(prev => [...prev, created]);
    return created;
  }, []);

  const removeConnectedAccount = useCallback(async (id: string) => {
    await api.deleteConnectedAccount(id);
    setConnectedAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  // ─── Scheduled Posts ─────────────────────────────────────

  const addScheduledPost = useCallback(async (post: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await api.createScheduledPost(post);
    setScheduledPosts(prev => [created, ...prev]);
    return created;
  }, []);

  const updateScheduledPostAction = useCallback(async (id: string, updates: Partial<ScheduledPost>) => {
    await api.updateScheduledPost(id, updates);
    setScheduledPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const removeScheduledPost = useCallback(async (id: string) => {
    await api.deleteScheduledPost(id);
    setScheduledPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ─── Knowledge Documents ─────────────────────────────────

  const addKnowledgeDocument = useCallback(async (doc: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await api.createKnowledgeDocument(doc);
    setKnowledgeDocuments(prev => [created, ...prev]);
    return created;
  }, []);

  const updateKnowledgeDocumentAction = useCallback(async (id: string, updates: Partial<KnowledgeDocument>) => {
    await api.updateKnowledgeDocument(id, updates);
    setKnowledgeDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const removeKnowledgeDocument = useCallback(async (id: string) => {
    await api.deleteKnowledgeDocument(id);
    setKnowledgeDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  // ─── AI Generation Log ───────────────────────────────────

  const logAiGeneration = useCallback(async (log: Omit<AiGenerationLog, 'id' | 'createdAt'>) => {
    const created = await api.createAiGenerationLog(log);
    setAiLogs(prev => [created, ...prev]);
    return created;
  }, []);

  const rateAiGeneration = useCallback(async (id: string, rating: number, feedback?: string, accepted?: boolean) => {
    await api.updateAiGenerationLog(id, { userRating: rating, userFeedback: feedback, wasAccepted: accepted });
    setAiLogs(prev => prev.map(l =>
      l.id === id ? { ...l, userRating: rating, userFeedback: feedback, wasAccepted: accepted } : l
    ));
  }, []);

  // ─── Engagement Groups ───────────────────────────────────

  const addEngagementGroup = useCallback(async (group: Omit<EngagementGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await api.createEngagementGroup(group);
    setEngagementGroups(prev => [...prev, created]);
    return created;
  }, []);

  const removeEngagementGroup = useCallback(async (id: string) => {
    await api.deleteEngagementGroup(id);
    setEngagementGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  // ─── Subscription ────────────────────────────────────────

  const createSubscriptionAction = useCallback(async (planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    if (!companyId) return;
    const sub = await api.createSubscription(companyId, planId, billingCycle);
    setSubscription(sub);
    // Reload to get full plan data
    const full = await api.fetchSubscription(companyId);
    if (full) setSubscription(full);
  }, [companyId]);

  // ─── Context Value ───────────────────────────────────────

  const value: PublishingContextType = {
    plans, subscription, connectedAccounts, scheduledPosts,
    engagementGroups, knowledgeDocuments, aiLogs,
    loading, plansLoading,
    refresh,
    addConnectedAccount, removeConnectedAccount,
    addScheduledPost, updateScheduledPost: updateScheduledPostAction, removeScheduledPost,
    addKnowledgeDocument, updateKnowledgeDocument: updateKnowledgeDocumentAction, removeKnowledgeDocument,
    logAiGeneration, rateAiGeneration,
    addEngagementGroup, removeEngagementGroup,
    createSubscription: createSubscriptionAction,
    hasFeature, canAddSocialAccount,
  };

  return (
    <PublishingContext.Provider value={value}>
      {children}
    </PublishingContext.Provider>
  );
}
