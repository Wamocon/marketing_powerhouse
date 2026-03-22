'use client';

import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CompanyProvider } from '@/context/CompanyContext';
import { ContentProvider } from '@/context/ContentContext';
import { TaskProvider } from '@/context/TaskContext';
import { DataProvider } from '@/context/DataContext';
import { PublishingProvider } from '@/context/PublishingContext';
import { NotificationProvider } from '@/context/NotificationContext';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <CompanyProvider>
                    <NotificationProvider>
                        <DataProvider>
                            <ContentProvider>
                                <TaskProvider>
                                    <PublishingProvider>
                                        {children}
                                    </PublishingProvider>
                                </TaskProvider>
                            </ContentProvider>
                        </DataProvider>
                    </NotificationProvider>
                </CompanyProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}
