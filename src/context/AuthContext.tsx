import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Role, PermissionKey, PermissionMap, RoleConfig } from '../types';

export const ROLES = {
    ADMIN: 'admin' as const,
    MANAGER: 'manager' as const,
    MEMBER: 'member' as const,
};

export const PERMISSIONS: Record<Role, PermissionMap> = {
    admin: {
        canEditPositioning: true, canEditCompanyKeywords: true, canManageUsers: true,
        canManageSettings: true, canCreateCampaigns: true, canEditCampaigns: true,
        canViewAllCampaigns: true, canDeleteItems: true, canManageTouchpoints: true,
        canEditAudiences: true, canViewAudiences: true, canSeeBudget: true,
        canEditBudget: true, canAssignTasks: true, canCreateCampaignTasks: true,
        canEditAllTasks: true, canEditOwnTasks: true, canEditContent: true,
    },
    manager: {
        canEditPositioning: false, canEditCompanyKeywords: false, canManageUsers: false,
        canManageSettings: false, canCreateCampaigns: true, canEditCampaigns: true,
        canViewAllCampaigns: true, canDeleteItems: true, canManageTouchpoints: true,
        canEditAudiences: true, canViewAudiences: true, canSeeBudget: true,
        canEditBudget: true, canAssignTasks: true, canCreateCampaignTasks: true,
        canEditAllTasks: true, canEditOwnTasks: true, canEditContent: true,
    },
    member: {
        canEditPositioning: false, canEditCompanyKeywords: false, canManageUsers: false,
        canManageSettings: false, canCreateCampaigns: false, canEditCampaigns: false,
        canViewAllCampaigns: false, canDeleteItems: false, canManageTouchpoints: false,
        canEditAudiences: false, canViewAudiences: true, canSeeBudget: false,
        canEditBudget: false, canAssignTasks: false, canCreateCampaignTasks: false,
        canEditAllTasks: false, canEditOwnTasks: true, canEditContent: false,
    },
};

export const ROLE_CONFIG: Record<Role, RoleConfig> = {
    admin: {
        label: 'Administrator', shortLabel: 'Admin',
        color: '#c1292e', bgColor: 'rgba(193, 41, 46, 0.12)',
        description: 'Vollständige Lese- und Schreibrechte, User-Management',
    },
    manager: {
        label: 'Marketing Manager', shortLabel: 'Manager',
        color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.12)',
        description: 'Kampagnen und Aufgaben erstellen, Team koordinieren',
    },
    member: {
        label: 'Team-Member', shortLabel: 'Member',
        color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.12)',
        description: 'Eigene Aufgaben bearbeiten, Kampagnendaten einsehen',
    },
};

interface AuthContextValue {
    currentUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    can: (permission: PermissionKey) => boolean;
    isRole: (role: Role) => boolean;
    ROLE_CONFIG: Record<Role, RoleConfig>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const login = (user: User) => setCurrentUser(user);
    const logout = () => setCurrentUser(null);

    const can = (permission: PermissionKey): boolean => {
        if (!currentUser) return false;
        const userPermissions = PERMISSIONS[currentUser.role] || PERMISSIONS.member;
        return userPermissions[permission] === true;
    };

    const isRole = (role: Role) => currentUser?.role === role;

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, can, isRole, ROLE_CONFIG }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
