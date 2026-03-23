'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCompany } from '@/context/CompanyContext';

const GLOBAL_PREFIXES = ['/project/', '/project/', '/admin', '/impressum', '/datenschutz', '/agb'];

/**
 * Drop-in replacement for useRouter() that auto-prefixes
 * push() calls with /project/{activeProjectId}.
 */
export function useProjectRouter() {
    const router = useRouter();
    const { activeCompany } = useCompany();

    const push = useCallback((path: string) => {
        if (!activeCompany || GLOBAL_PREFIXES.some(p => path.startsWith(p))) {
            router.push(path);
            return;
        }
        const base = `/project/${activeCompany.id}`;
        router.push(path === '/' ? base : `${base}${path}`);
    }, [router, activeCompany]);

    return useMemo(() => ({ ...router, push }), [router, push]);
}

/**
 * Helper to build project-prefixed paths for <Link href={...}> components.
 */
export function useProjectPath() {
    const { activeCompany } = useCompany();
    return useCallback((path: string) => {
        if (!activeCompany) return path;
        return path === '/' ? `/project/${activeCompany.id}` : `/project/${activeCompany.id}${path}`;
    }, [activeCompany]);
}

// Backward compatible aliases during transition.
export const useCompanyRouter = useProjectRouter;
export const useCompanyPath = useProjectPath;
