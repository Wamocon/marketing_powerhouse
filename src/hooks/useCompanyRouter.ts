'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCompany } from '@/context/CompanyContext';

const GLOBAL_PREFIXES = ['/company/', '/admin', '/impressum', '/datenschutz', '/agb'];

/**
 * Drop-in replacement for useRouter() that auto-prefixes
 * push() calls with /company/{activeCompanyId}.
 */
export function useCompanyRouter() {
    const router = useRouter();
    const { activeCompany } = useCompany();

    const push = useCallback((path: string) => {
        if (!activeCompany || GLOBAL_PREFIXES.some(p => path.startsWith(p))) {
            router.push(path);
            return;
        }
        const base = `/company/${activeCompany.id}`;
        router.push(path === '/' ? base : `${base}${path}`);
    }, [router, activeCompany]);

    return useMemo(() => ({ ...router, push }), [router, push]);
}

/**
 * Helper to build company-prefixed paths for <Link href={…}> components.
 */
export function useCompanyPath() {
    const { activeCompany } = useCompany();
    return useCallback((path: string) => {
        if (!activeCompany) return path;
        return path === '/' ? `/company/${activeCompany.id}` : `/company/${activeCompany.id}${path}`;
    }, [activeCompany]);
}
