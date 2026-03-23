'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Company, CompanyMember, CompanyRole } from '../types';
import { useAuth } from './AuthContext';
import * as api from '../lib/api';

const ACTIVE_COMPANY_KEY = 'momentum_active_company';

interface CompanyContextValue {
    /** List of companies the current user has access to */
    userCompanies: (Company & { role: CompanyRole })[];
    /** Currently selected company */
    activeCompany: Company | null;
    /** Current user's role in the active company */
    activeCompanyRole: CompanyRole | null;
    /** Members of the active company */
    companyMembers: CompanyMember[];
    /** Loading state */
    loading: boolean;
    /** Select a company to work in */
    selectCompany: (companyId: string) => Promise<void>;
    /** Deselect (go back to company picker) */
    deselectCompany: () => void;
    /** Create a new company (and auto-join as company_admin) */
    createCompany: (data: { name: string; description?: string; industry?: string; logo?: string }) => Promise<Company>;
    /** Update company details */
    updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
    /** Delete a company */
    deleteCompany: (id: string) => Promise<void>;
    /** Add a member to the active company */
    addMember: (userId: string, role: CompanyRole) => Promise<void>;
    /** Update a member's role */
    updateMemberRole: (memberId: string, role: CompanyRole) => Promise<void>;
    /** Remove a member from the active company */
    removeMember: (memberId: string) => Promise<void>;
    /** Reload companies list */
    refreshCompanies: () => Promise<void>;
    /** Reload company members */
    refreshMembers: () => Promise<void>;
    /** All companies (for super-admin) */
    allCompanies: Company[];
    /** Load all companies (super-admin) */
    loadAllCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
    const { currentUser, isSuperAdmin, setActiveCompanyRole } = useAuth();
    const [userCompanies, setUserCompanies] = useState<(Company & { role: CompanyRole })[]>([]);
    const [allCompanies, setAllCompanies] = useState<Company[]>([]);
    const [activeCompany, setActiveCompany] = useState<Company | null>(null);
    const [activeRole, setActiveRole] = useState<CompanyRole | null>(null);
    const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
    const [loading, setLoading] = useState(true);

    // Load user's companies on auth change
    useEffect(() => {
        if (!currentUser) {
            setUserCompanies([]);
            setActiveCompany(null);
            setActiveRole(null);
            setCompanyMembers([]);
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const companies = await api.fetchUserCompanies(currentUser.id);
                setUserCompanies(companies);

                // Restore last selected company from localStorage
                const storedCompanyId = localStorage.getItem(ACTIVE_COMPANY_KEY);
                let selected = false;
                if (storedCompanyId) {
                    const found = companies.find(c => c.id === storedCompanyId);
                    if (found) {
                        setActiveCompany(found);
                        setActiveRole(found.role);
                        setActiveCompanyRole(found.role);
                        const members = await api.fetchCompanyMembers(found.id);
                        setCompanyMembers(members);
                        selected = true;
                    } else {
                        localStorage.removeItem(ACTIVE_COMPANY_KEY);
                    }
                }

                if (!selected && companies.length > 0) {
                    const first = companies[0];
                    setActiveCompany(first);
                    setActiveRole(first.role);
                    setActiveCompanyRole(first.role);
                    localStorage.setItem(ACTIVE_COMPANY_KEY, first.id);
                    const members = await api.fetchCompanyMembers(first.id);
                    setCompanyMembers(members);
                }

                if (companies.length === 0) {
                    setActiveCompany(null);
                    setActiveRole(null);
                    setActiveCompanyRole(null);
                    setCompanyMembers([]);
                }
            } catch (err) {
                console.error('Failed to load companies:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [currentUser, setActiveCompanyRole]);

    const selectCompany = useCallback(async (companyId: string) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // For super-admin, fetch any company; for others, must be in userCompanies
            let company: Company | null = null;
            let role: CompanyRole | null = null;

            const userComp = userCompanies.find(c => c.id === companyId);
            if (userComp) {
                company = userComp;
                role = userComp.role;
            } else if (isSuperAdmin) {
                company = await api.fetchCompanyById(companyId);
                role = 'company_admin'; // Super-admins get full access
            }

            if (company) {
                setActiveCompany(company);
                setActiveRole(role);
                setActiveCompanyRole(role);
                localStorage.setItem(ACTIVE_COMPANY_KEY, companyId);
                const members = await api.fetchCompanyMembers(companyId);
                setCompanyMembers(members);
            }
        } catch (err) {
            console.error('Failed to select company:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, userCompanies, isSuperAdmin, setActiveCompanyRole]);

    const deselectCompany = useCallback(() => {
        setActiveCompany(null);
        setActiveRole(null);
        setActiveCompanyRole(null);
        setCompanyMembers([]);
        localStorage.removeItem(ACTIVE_COMPANY_KEY);
    }, [setActiveCompanyRole]);

    const createCompanyFn = useCallback(async (data: { name: string; description?: string; industry?: string; logo?: string }) => {
        if (!currentUser) throw new Error('Not authenticated');
        const company = await api.createCompany({
            name: data.name,
            slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: data.description ?? '',
            industry: data.industry ?? '',
            logo: data.logo ?? '',
            createdBy: currentUser.id,
        });
        // Auto-add creator as company_admin
        await api.addCompanyMember(company.id, currentUser.id, 'company_admin');
        // Refresh list
        const companies = await api.fetchUserCompanies(currentUser.id);
        setUserCompanies(companies);
        return company;
    }, [currentUser]);

    const updateCompanyFn = useCallback(async (id: string, updates: Partial<Company>) => {
        await api.updateCompany(id, updates);
        if (activeCompany?.id === id) {
            setActiveCompany(prev => prev ? { ...prev, ...updates } : prev);
        }
        if (currentUser) {
            const companies = await api.fetchUserCompanies(currentUser.id);
            setUserCompanies(companies);
        }
    }, [activeCompany, currentUser]);

    const deleteCompanyFn = useCallback(async (id: string) => {
        await api.deleteCompany(id);
        if (activeCompany?.id === id) {
            deselectCompany();
        }
        if (currentUser) {
            const companies = await api.fetchUserCompanies(currentUser.id);
            setUserCompanies(companies);
        }
    }, [activeCompany, currentUser, deselectCompany]);

    const addMember = useCallback(async (userId: string, role: CompanyRole) => {
        if (!activeCompany || !currentUser) return;
        const targetUser = await api.fetchUserById(userId);
        if (targetUser?.isSuperAdmin && !isSuperAdmin) {
            throw new Error('Projekt-Admins dürfen Super-Admin-Rechte nicht verändern.');
        }
        await api.addCompanyMember(activeCompany.id, userId, role);
        const members = await api.fetchCompanyMembers(activeCompany.id);
        setCompanyMembers(members);
    }, [activeCompany, currentUser, isSuperAdmin]);

    const updateMemberRole = useCallback(async (memberId: string, role: CompanyRole) => {
        const targetMember = companyMembers.find(m => m.id === memberId);
        if (!targetMember) throw new Error('Mitglied nicht gefunden.');
        if (targetMember.userIsSuperAdmin && !isSuperAdmin) {
            throw new Error('Projekt-Admins dürfen Super-Admin-Rechte nicht verändern.');
        }
        await api.updateCompanyMemberRole(memberId, role);
        setCompanyMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
    }, [companyMembers, isSuperAdmin]);

    const removeMember = useCallback(async (memberId: string) => {
        const targetMember = companyMembers.find(m => m.id === memberId);
        if (!targetMember) throw new Error('Mitglied nicht gefunden.');
        if (targetMember.userIsSuperAdmin && !isSuperAdmin) {
            throw new Error('Projekt-Admins dürfen Super-Admin-Rechte nicht verändern.');
        }
        await api.removeCompanyMember(memberId);
        setCompanyMembers(prev => prev.filter(m => m.id !== memberId));
    }, [companyMembers, isSuperAdmin]);

    const refreshCompanies = useCallback(async () => {
        if (!currentUser) return;
        const companies = await api.fetchUserCompanies(currentUser.id);
        setUserCompanies(companies);
    }, [currentUser]);

    const refreshMembers = useCallback(async () => {
        if (!activeCompany) return;
        const members = await api.fetchCompanyMembers(activeCompany.id);
        setCompanyMembers(members);
    }, [activeCompany]);

    const loadAllCompanies = useCallback(async () => {
        const companies = await api.fetchCompanies();
        setAllCompanies(companies);
    }, []);

    return (
        <CompanyContext.Provider value={{
            userCompanies, activeCompany, activeCompanyRole: activeRole,
            companyMembers, loading, selectCompany, deselectCompany,
            createCompany: createCompanyFn, updateCompany: updateCompanyFn,
            deleteCompany: deleteCompanyFn, addMember, updateMemberRole,
            removeMember, refreshCompanies, refreshMembers,
            allCompanies, loadAllCompanies,
        }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany(): CompanyContextValue {
    const ctx = useContext(CompanyContext);
    if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
    return ctx;
}
