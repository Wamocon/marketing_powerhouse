'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type AppLanguage = 'de' | 'en';

const ANON_LANGUAGE_KEY = 'momentum_language_anon';
const USER_LANGUAGE_KEY_PREFIX = 'momentum_language_user';

const FALLBACK_LANGUAGE: AppLanguage = 'de';

function isAppLanguage(value: unknown): value is AppLanguage {
    return value === 'de' || value === 'en';
}

function readLanguageFromStorage(key: string): AppLanguage | null {
    const raw = localStorage.getItem(key);
    return isAppLanguage(raw) ? raw : null;
}

function getUserLanguageKey(userId: string): string {
    return `${USER_LANGUAGE_KEY_PREFIX}:${userId}`;
}

interface LanguageContextValue {
    language: AppLanguage;
    locale: string;
    setLanguage: (next: AppLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const { currentUser } = useAuth();
    const [language, setLanguageState] = useState<AppLanguage>(FALLBACK_LANGUAGE);

    useEffect(() => {
        const anonLanguage = readLanguageFromStorage(ANON_LANGUAGE_KEY);
        if (anonLanguage) {
            setLanguageState(anonLanguage);
        }
    }, []);

    useEffect(() => {
        if (!currentUser) {
            const anonLanguage = readLanguageFromStorage(ANON_LANGUAGE_KEY);
            setLanguageState(anonLanguage ?? FALLBACK_LANGUAGE);
            return;
        }

        const userLanguageKey = getUserLanguageKey(currentUser.id);
        const storedUserLanguage = readLanguageFromStorage(userLanguageKey);
        if (storedUserLanguage) {
            setLanguageState(storedUserLanguage);
            return;
        }

        const anonLanguage = readLanguageFromStorage(ANON_LANGUAGE_KEY);
        const initialUserLanguage = anonLanguage ?? FALLBACK_LANGUAGE;
        localStorage.setItem(userLanguageKey, initialUserLanguage);
        setLanguageState(initialUserLanguage);
    }, [currentUser]);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = (next: AppLanguage) => {
        setLanguageState(next);
        if (currentUser) {
            localStorage.setItem(getUserLanguageKey(currentUser.id), next);
        } else {
            localStorage.setItem(ANON_LANGUAGE_KEY, next);
        }
    };

    const locale = useMemo(() => (language === 'en' ? 'en-US' : 'de-DE'), [language]);

    return (
        <LanguageContext.Provider value={{ language, locale, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
