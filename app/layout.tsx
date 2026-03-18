import type { Metadata } from 'next';
import Providers from './providers';
import ClientShell from './client-shell';
import '@/index.css';

export const metadata: Metadata = {
    title: 'Momentum | Marketing OS',
    description: 'Momentum Marketing OS — Vom Jobsuchenden zum IT-Tester in 45 Tagen. Die offizielle Lern- und Verwaltungsplattform der WAMOCON Academy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <Providers>
                    <ClientShell>{children}</ClientShell>
                </Providers>
            </body>
        </html>
    );
}
