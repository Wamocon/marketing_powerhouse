import { createContext, useContext, useState } from 'react';

// ─── Rollen-Definition ───────────────────────────────────────
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    MEMBER: 'member',
};

// ─── Berechtigungs-Matrix ────────────────────────────────────
export const PERMISSIONS = {
    admin: {
        // Unternehmensebene
        canEditPositioning: true,
        canEditCompanyKeywords: true,
        canManageUsers: true,
        canManageSettings: true,
        // Kampagnen
        canCreateCampaigns: true,
        canEditCampaigns: true,
        canViewAllCampaigns: true,
        // Zielgruppen
        canEditAudiences: true,
        canViewAudiences: true,
        // Budget
        canSeeBudget: true,
        canEditBudget: true,
        // Aufgaben
        canAssignTasks: true,
        canCreateCampaignTasks: true,
        canEditAllTasks: true,
        canEditOwnTasks: true,
        // Content
        canEditContent: true,
    },
    manager: {
        canEditPositioning: false,
        canEditCompanyKeywords: false,
        canManageUsers: false,
        canManageSettings: false,
        canCreateCampaigns: true,
        canEditCampaigns: true,
        canViewAllCampaigns: true,
        canEditAudiences: true,
        canViewAudiences: true,
        canSeeBudget: true,
        canEditBudget: true,
        canAssignTasks: true,
        canCreateCampaignTasks: true,
        canEditAllTasks: true,
        canEditOwnTasks: true,
        canEditContent: true,
    },
    member: {
        canEditPositioning: false,
        canEditCompanyKeywords: false,
        canManageUsers: false,
        canManageSettings: false,
        canCreateCampaigns: false,
        canEditCampaigns: false,
        canViewAllCampaigns: false, // nur zugewiesene Kampagnen
        canEditAudiences: false,
        canViewAudiences: true,
        canSeeBudget: false,
        canEditBudget: false,
        canAssignTasks: false,
        canCreateCampaignTasks: false, // nur eigene To-Dos
        canEditAllTasks: false,
        canEditOwnTasks: true,
        canEditContent: false,
    },
};

// ─── Rollen-Labels & Farben für UI ───────────────────────────
export const ROLE_CONFIG = {
    admin: {
        label: 'Administrator',
        shortLabel: 'Admin',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.12)',
        description: 'Vollständige Lese- und Schreibrechte, User-Management',
    },
    manager: {
        label: 'Marketing Manager',
        shortLabel: 'Manager',
        color: '#6366f1',
        bgColor: 'rgba(99, 102, 241, 0.12)',
        description: 'Kampagnen und Aufgaben erstellen, Team koordinieren',
    },
    member: {
        label: 'Team-Member',
        shortLabel: 'Member',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.12)',
        description: 'Eigene Aufgaben bearbeiten, Kampagnendaten einsehen',
    },
};

// ─── Context ─────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    const login = (user) => {
        setCurrentUser(user);
    };

    const logout = () => {
        setCurrentUser(null);
    };

    // Berechtigungs-Helper
    const can = (permission) => {
        if (!currentUser) return false;
        const userPermissions = PERMISSIONS[currentUser.role] || PERMISSIONS.member;
        return userPermissions[permission] === true;
    };

    const isRole = (role) => currentUser?.role === role;

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, can, isRole, ROLE_CONFIG }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
