'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Audience, Touchpoint, CustomerJourney, User, Campaign } from '../types';
import type { CompanyPositioning, CompanyKeyword, BudgetData, TeamMember, ActivityItem, ChartDataPoint, ChannelPerformanceItem } from '../types/dashboard';
import { useCompany } from './CompanyContext';
import { useAuth } from './AuthContext';
import * as api from '../lib/api';
import { notifyCampaignCreated, notifyCampaignStatusChanged, notifyBudgetAlert } from '../lib/notificationTriggers';

interface DataContextValue {
    // Read-only data
    users: User[];
    campaigns: Campaign[];
    audiences: Audience[];
    budgetData: BudgetData;
    teamMembers: TeamMember[];
    touchpoints: Touchpoint[];
    customerJourneys: CustomerJourney[];
    positioning: CompanyPositioning;
    companyKeywords: CompanyKeyword[];
    activityFeed: ActivityItem[];
    dashboardChartData: ChartDataPoint[];
    channelPerformance: ChannelPerformanceItem[];
    loading: boolean;

    // Mutators
    addAudience: (audience: Omit<Audience, 'id'>) => Promise<void>;
    updateAudience: (id: string, updates: Partial<Audience>) => Promise<void>;
    deleteAudience: (id: string) => Promise<void>;
    addCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<Campaign>;
    updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
    deleteCampaign: (id: string) => Promise<void>;
    addTouchpoint: (tp: Omit<Touchpoint, 'id'>) => Promise<Touchpoint>;
    updateTouchpoint: (id: string, updates: Partial<Touchpoint>) => Promise<void>;
    deleteTouchpoint: (id: string) => Promise<void>;
    savePositioning: (pos: CompanyPositioning) => Promise<void>;
    addKeyword: (kw: Omit<CompanyKeyword, 'id'>) => Promise<void>;
    deleteKeyword: (id: string) => Promise<void>;
    addJourney: (journey: Omit<CustomerJourney, 'id'>) => Promise<CustomerJourney>;
    deleteJourney: (id: string) => Promise<void>;
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const emptyBudget: BudgetData = { total: 0, spent: 0, remaining: 0, categories: [], monthlyTrend: [] };
const emptyPositioning: CompanyPositioning = {
    name: '', tagline: '', founded: '', industry: '', headquarters: '',
    legalForm: '', employees: '', website: '', vision: '', mission: '',
    values: [], toneOfVoice: { adjectives: [], description: '', personality: '' },
    dos: [], donts: [], primaryMarket: '', secondaryMarkets: [],
    targetCompanySize: '', targetIndustries: [], lastUpdated: '', updatedBy: '',
};

export function DataProvider({ children }: { children: ReactNode }) {
    const { activeCompany } = useCompany();
    const { currentUser } = useAuth();
    const companyId = activeCompany?.id ?? null;
    const currentUserId = currentUser?.id ?? null;
    const prevCompanyId = useRef<string | null>(null);
    const initialized = useRef(false);

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [audiences, setAudiences] = useState<Audience[]>([]);
    const [budgetData, setBudgetData] = useState<BudgetData>(emptyBudget);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [touchpoints, setTouchpoints] = useState<Touchpoint[]>([]);
    const [customerJourneys, setCustomerJourneys] = useState<CustomerJourney[]>([]);
    const [positioning, setPositioning] = useState<CompanyPositioning>(emptyPositioning);
    const [keywords, setKeywords] = useState<CompanyKeyword[]>([]);
    const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
    const [dashboardChartData, setDashboardChartData] = useState<ChartDataPoint[]>([]);
    const [channelPerformance, setChannelPerformance] = useState<ChannelPerformanceItem[]>([]);

    const clearAll = useCallback(() => {
        setCampaigns([]); setAudiences([]); setBudgetData(emptyBudget);
        setTeamMembers([]); setTouchpoints([]);
        setCustomerJourneys([]); setPositioning(emptyPositioning);
        setKeywords([]); setActivityFeed([]); setDashboardChartData([]);
        setChannelPerformance([]);
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const u = await api.fetchUsers();
            setUsers(u);

            if (!companyId) {
                clearAll();
                return;
            }

            const [c, a, b, tm, tp, cj, p, kw, af, cd, cp] = await Promise.all([
                api.fetchCampaigns(companyId),
                api.fetchAudiences(companyId),
                api.fetchBudgetData(companyId).catch(() => emptyBudget),
                api.fetchTeamMembers(companyId),
                api.fetchTouchpoints(companyId),
                api.fetchJourneys(companyId),
                api.fetchPositioning(companyId).catch(() => emptyPositioning),
                api.fetchKeywords(companyId),
                api.fetchActivityFeed(companyId),
                api.fetchChartData(companyId),
                api.fetchChannelPerformance(companyId),
            ]);

            setCampaigns(c); setAudiences(a); setBudgetData(b);
            setTeamMembers(tm); setTouchpoints(tp);
            setCustomerJourneys(cj); setPositioning(p); setKeywords(kw);
            setActivityFeed(af); setDashboardChartData(cd); setChannelPerformance(cp);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    }, [companyId, clearAll]);

    // Reload when company changes
    useEffect(() => {
        if (!initialized.current || prevCompanyId.current !== companyId) {
            initialized.current = true;
            prevCompanyId.current = companyId;
            loadAll();
        }
    }, [companyId, loadAll]);

    // ── Audience CRUD ──
    const addAudience = useCallback(async (audience: Omit<Audience, 'id'>) => {
        if (!companyId) return;
        const created = await api.createAudience(audience, companyId);
        setAudiences(prev => [...prev, created]);
    }, [companyId]);

    const updateAudienceFn = useCallback(async (id: string, updates: Partial<Audience>) => {
        await api.updateAudience(id, updates);
        setAudiences(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }, []);

    const deleteAudienceFn = useCallback(async (id: string) => {
        await api.deleteAudience(id);
        setAudiences(prev => prev.filter(a => a.id !== id));
    }, []);

    // ── Campaign CRUD ──
    const addCampaign = useCallback(async (campaign: Omit<Campaign, 'id'>) => {
        if (!companyId) throw new Error('Kein Projekt ausgewählt');
        const created = await api.createCampaign(campaign, companyId);
        setCampaigns(prev => [...prev, created]);

        // Notify team members about new campaign
        const recipients = [...(created.teamMemberIds ?? [])];
        if (created.responsibleManagerId) recipients.push(created.responsibleManagerId);
        if (recipients.length > 0) {
            notifyCampaignCreated({
                companyId,
                triggeredByUserId: currentUserId ?? undefined,
                recipientUserIds: recipients,
                campaignId: created.id,
                campaignName: created.name,
            });
        }

        return created;
    }, [companyId, currentUserId]);

    const updateCampaignFn = useCallback(async (id: string, updates: Partial<Campaign>) => {
        const oldCampaign = campaigns.find(c => c.id === id);
        await api.updateCampaign(id, updates);
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        // Notify on status change
        if (updates.status && oldCampaign && updates.status !== oldCampaign.status && companyId) {
            const recipients = [...(oldCampaign.teamMemberIds ?? [])];
            if (oldCampaign.responsibleManagerId) recipients.push(oldCampaign.responsibleManagerId);
            notifyCampaignStatusChanged({
                companyId,
                triggeredByUserId: currentUserId ?? undefined,
                recipientUserIds: recipients,
                campaignId: id,
                campaignName: oldCampaign.name,
                newStatus: updates.status,
            });
        }

        // Check budget alert
        if (companyId && oldCampaign) {
            const spent = updates.spent ?? oldCampaign.spent;
            const budget = updates.budget ?? oldCampaign.budget;
            if (budget > 0) {
                const pct = Math.round((spent / budget) * 100);
                if (pct >= 80) {
                    const recipients = [...(oldCampaign.teamMemberIds ?? [])];
                    if (oldCampaign.responsibleManagerId) recipients.push(oldCampaign.responsibleManagerId);
                    notifyBudgetAlert({
                        companyId,
                        recipientUserIds: recipients,
                        campaignId: id,
                        campaignName: oldCampaign.name,
                        percentUsed: pct,
                    });
                }
            }
        }
    }, [campaigns, companyId, currentUserId]);

    const deleteCampaignFn = useCallback(async (id: string) => {
        await api.deleteCampaign(id);
        setCampaigns(prev => prev.filter(c => c.id !== id));
    }, []);

    // ── Touchpoint CRUD ──
    const addTouchpoint = useCallback(async (tp: Omit<Touchpoint, 'id'>) => {
        if (!companyId) throw new Error('Kein Projekt ausgewählt');
        const created = await api.createTouchpoint(tp, companyId);
        setTouchpoints(prev => [...prev, created]);
        return created;
    }, [companyId]);

    const updateTouchpointFn = useCallback(async (id: string, updates: Partial<Touchpoint>) => {
        await api.updateTouchpoint(id, updates);
        setTouchpoints(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }, []);

    const deleteTouchpointFn = useCallback(async (id: string) => {
        await api.deleteTouchpoint(id);
        setTouchpoints(prev => prev.filter(t => t.id !== id));
    }, []);

    // ── Positioning ──
    const savePositioningFn = useCallback(async (pos: CompanyPositioning) => {
        if (!companyId) return;
        await api.savePositioning(pos, companyId);
        setPositioning(pos);
    }, [companyId]);

    // ── Keywords ──
    const addKeyword = useCallback(async (kw: Omit<CompanyKeyword, 'id'>) => {
        if (!companyId) return;
        const created = await api.createKeyword(kw, companyId);
        setKeywords(prev => [...prev, created]);
    }, [companyId]);

    const deleteKeywordFn = useCallback(async (id: string) => {
        await api.deleteKeyword(id);
        setKeywords(prev => prev.filter(k => k.id !== id));
    }, []);

    // ── Journey CRUD ──
    const addJourney = useCallback(async (journey: Omit<CustomerJourney, 'id'>) => {
        if (!companyId) throw new Error('Kein Projekt ausgewählt');
        const created = await api.createJourney(journey, companyId);
        setCustomerJourneys(prev => [...prev, created]);
        return created;
    }, [companyId]);

    const deleteJourneyFn = useCallback(async (id: string) => {
        await api.deleteJourney(id);
        setCustomerJourneys(prev => prev.filter(j => j.id !== id));
    }, []);

    return (
        <DataContext.Provider value={{
            users, campaigns, audiences, budgetData, teamMembers,
            touchpoints, customerJourneys,
            positioning, companyKeywords: keywords,
            activityFeed, dashboardChartData, channelPerformance, loading,
            addAudience, updateAudience: updateAudienceFn, deleteAudience: deleteAudienceFn,
            addCampaign, updateCampaign: updateCampaignFn, deleteCampaign: deleteCampaignFn,
            addTouchpoint, updateTouchpoint: updateTouchpointFn, deleteTouchpoint: deleteTouchpointFn,
            savePositioning: savePositioningFn,
            addKeyword, deleteKeyword: deleteKeywordFn,
            addJourney, deleteJourney: deleteJourneyFn,
            refreshData: loadAll,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData(): DataContextValue {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within DataProvider');
    return ctx;
}
