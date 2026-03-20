'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CompanyProvider } from '@/context/CompanyContext';
import { ContentProvider } from '@/context/ContentContext';
import { TaskProvider } from '@/context/TaskContext';
import { DataProvider } from '@/context/DataContext';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <CompanyProvider>
                <DataProvider>
                    <ContentProvider>
                        <TaskProvider>
                            {children}
                        </TaskProvider>
                    </ContentProvider>
                </DataProvider>
            </CompanyProvider>
        </AuthProvider>
    );
}
