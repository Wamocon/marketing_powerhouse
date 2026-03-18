'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Audience, CompanyPositioning, CompanyKeyword, Touchpoint, AsidasJourney, User } from '../types';
import type { BudgetData, TeamMember } from '../types/dashboard';
import type { Campaign } from '../types';

import { testUsers } from '../data/users';
import { companyPositioning, companyKeywords as initialKeywords, audiences as initialAudiences } from '../data/positioning';
import { campaigns as initialCampaigns } from '../data/campaigns';
import { budgetData as initialBudget, teamMembers as initialTeamMembers, touchpoints as initialTouchpoints } from '../data/dashboard';
import { asidasJourneys as initialAsidasJourneys, customerJourneys as initialCustomerJourneys } from '../data/journeys';

interface DataContextValue {
    // Read-only data
    users: User[];
    campaigns: Campaign[];
    audiences: Audience[];
    budgetData: BudgetData;
    teamMembers: TeamMember[];
    touchpoints: Touchpoint[];
    asidasJourneys: AsidasJourney[];
    customerJourneys: AsidasJourney[];
    positioning: CompanyPositioning;
    companyKeywords: CompanyKeyword[];

    // Mutators
    addAudience: (audience: Omit<Audience, 'id'>) => void;
    savePositioning: (pos: CompanyPositioning) => void;
    addKeyword: (kw: Omit<CompanyKeyword, 'id'>) => void;
    deleteKeyword: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
    const [audiences, setAudiences] = useState<Audience[]>(initialAudiences);
    const [positioning, setPositioning] = useState<CompanyPositioning>(companyPositioning);
    const [keywords, setKeywords] = useState<CompanyKeyword[]>(initialKeywords);

    const addAudience = useCallback((audience: Omit<Audience, 'id'>) => {
        setAudiences(prev => [
            ...prev,
            { ...audience, id: 'a' + (prev.length + 1) } as Audience,
        ]);
    }, []);

    const savePositioning = useCallback((pos: CompanyPositioning) => {
        setPositioning(pos);
    }, []);

    const addKeyword = useCallback((kw: Omit<CompanyKeyword, 'id'>) => {
        setKeywords(prev => [
            ...prev,
            { ...kw, id: 'kw' + (prev.length + 1) } as CompanyKeyword,
        ]);
    }, []);

    const deleteKeyword = useCallback((id: string) => {
        setKeywords(prev => prev.filter(k => k.id !== id));
    }, []);

    return (
        <DataContext.Provider value={{
            users: testUsers,
            campaigns: initialCampaigns,
            audiences,
            budgetData: initialBudget,
            teamMembers: initialTeamMembers,
            touchpoints: initialTouchpoints,
            asidasJourneys: initialAsidasJourneys,
            customerJourneys: initialCustomerJourneys,
            positioning,
            companyKeywords: keywords,
            addAudience,
            savePositioning,
            addKeyword,
            deleteKeyword,
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
