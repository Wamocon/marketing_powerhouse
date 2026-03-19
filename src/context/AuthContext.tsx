import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, Role, PermissionKey, PermissionMap, RoleConfig } from '../types';
import * as api from '../lib/api';

const SESSION_KEY = 'momentum_session_user_id';

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

/**
 * Pure utility — testable without React context.
 * Returns whether the given role has the given permission.
 */
export function computePermission(role: Role | null | undefined, permission: PermissionKey): boolean {
    if (!role) return false;
    return PERMISSIONS[role][permission] === true;
}

interface AuthContextValue {
    currentUser: User | null;
    sessionLoading: boolean;
    login: (user: User) => void;
    loginWithCredentials: (email: string, password: string) => Promise<User | null>;
    logout: () => void;
    can: (permission: PermissionKey) => boolean;
    isRole: (role: Role) => boolean;
    ROLE_CONFIG: Record<Role, RoleConfig>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sessionLoading, setSessionLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const storedId = localStorage.getItem(SESSION_KEY);
        if (storedId) {
            api.fetchUserById(storedId)
                .then(user => {
                    if (user) {
                        setCurrentUser(user);
                        api.updateUserStatus(user.id, 'online').catch(console.error);
                    } else {
                        localStorage.removeItem(SESSION_KEY);
                    }
                })
                .catch(() => localStorage.removeItem(SESSION_KEY))
                .finally(() => setSessionLoading(false));
        } else {
            setSessionLoading(false);
        }
    }, []);

    const login = useCallback((user: User) => {
        localStorage.setItem(SESSION_KEY, user.id);
        setCurrentUser(user);
        api.updateUserStatus(user.id, 'online').catch(console.error);
    }, []);

    const loginWithCredentials = useCallback(async (email: string, password: string): Promise<User | null> => {
        const user = await api.loginUser(email, password);
        if (user) {
            localStorage.setItem(SESSION_KEY, user.id);
            setCurrentUser(user);
            api.updateUserStatus(user.id, 'online').catch(console.error);
        }
        return user;
    }, []);

    const logout = useCallback(() => {
        if (currentUser) {
            api.updateUserStatus(currentUser.id, 'offline').catch(console.error);
        }
        localStorage.removeItem(SESSION_KEY);
        setCurrentUser(null);
    }, [currentUser]);

    const can = useCallback((permission: PermissionKey): boolean =>
        computePermission(currentUser?.role, permission), [currentUser]);

    const isRole = useCallback((role: Role) => currentUser?.role === role, [currentUser]);

    return (
        <AuthContext.Provider value={{ currentUser, sessionLoading, login, loginWithCredentials, logout, can, isRole, ROLE_CONFIG }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
