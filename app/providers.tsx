'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CompanyProvider } from '@/context/CompanyContext';
import { ContentProvider } from '@/context/ContentContext';
import { TaskProvider } from '@/context/TaskContext';
import { DataProvider } from '@/context/DataContext';
import { PublishingProvider } from '@/context/PublishingContext';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <CompanyProvider>
                <DataProvider>
                    <ContentProvider>
                        <TaskProvider>
                            <PublishingProvider>
                                {children}
                            </PublishingProvider>
                        </TaskProvider>
                    </ContentProvider>
                </DataProvider>
            </CompanyProvider>
        </AuthProvider>
    );
}
