import { useState } from 'react';
import type { Task, ContentItem } from '../types';
import { Megaphone } from 'lucide-react';
import { useProjectRouter } from '../hooks/useProjectRouter';
import PageHelp from '../components/PageHelp';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTasks } from '../context/TaskContext';
import { useContents } from '../context/ContentContext';
import TaskDetailModal from '../components/TaskDetailModal';
import ContentDetailModal from '../components/ContentDetailModal';
import { AdminDashboard, ManagerDashboard, MemberDashboard } from '../components/DashboardViews';

export default function DashboardPage() {
    const router = useProjectRouter();
    const { currentUser, activeCompanyRole } = useAuth();
    const { locale, language } = useLanguage();
    const t = (tr: { de: string; en: string; tr: string }) => tr[language];
    const { tasks } = useTasks();
    const { contents } = useContents();

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

    const role = activeCompanyRole || currentUser?.role || 'member';

    const viewProps = {
        navigate: router.push,
        tasks,
        contents,
        currentUser,
        setSelectedTask: (t: Task) => setSelectedTask(t),
        setSelectedContent: (c: ContentItem) => setSelectedContent(c),
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">{t({ de: 'Dein Marketing auf einen Blick', en: 'Your marketing at a glance', tr: 'Pazarlamanız bir bakı\u015fta' })} - {t({ de: 'Stand', en: 'as of', tr: 'tarih' })}: {new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title={t({ de: 'Das Dashboard', en: 'The dashboard', tr: 'Kontrol paneli' })}>
                        <p style={{ marginBottom: '12px' }}>{t({ de: 'Willkommen im Kontrollzentrum! Das Dashboard passt sich deiner Rolle an.', en: 'Welcome to the control center. The dashboard adapts to your role.', tr: 'Kontrol merkezine ho\u015f geldiniz. Pano rolünüze göre uyarlanır.' })}</p>
                        <ul className="help-list">
                            <li><strong>Manager:</strong> {t({ de: 'Sehen aktive Kampagnen, deren Content + detaillierte Aufgaben in Farblogik sowie das Kampagnenbudget.', en: 'See active campaigns, linked content, detailed tasks and campaign budget.', tr: 'Aktif kampanyaları, ba\u011flı içerikleri, detaylı görevleri ve kampanya bütçesini görün.' })}</li>
                            <li><strong>Member:</strong> {t({ de: 'Bekommen alle eigenen zugewiesenen Aufgaben in einer priorisierten Farblogik angezeigt.', en: 'See assigned tasks prioritized by urgency.', tr: 'Aciliyete göre önceliklendirilmi\u015f atanmı\u015f görevleri görün.' })}</li>
                            <li><strong>Admin:</strong> {t({ de: 'Bekommen die globale Statistik und Gesamtübersicht des Performance-Trends über alle Bereiche + das Budget.', en: 'See global stats and trend overview across all areas plus budget.', tr: 'Tüm alanlardaki global istatistikleri, trend genel bakı\u015fını ve bütçeyi görün.' })}</li>
                        </ul>
                    </PageHelp>
                    <button className="btn btn-secondary" onClick={() => router.push('/campaigns')}>{t({ de: 'Neue Kampagne', en: 'New campaign', tr: 'Yeni kampanya' })}</button>
                    {role === 'manager' || role === 'company_admin' ? (
                        <button className="btn btn-primary" onClick={() => router.push('/calendar')}>
                            <Megaphone size={16} /> {t({ de: 'Content Kalender', en: 'Content calendar', tr: 'İçerik takvimi' })}
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => router.push('/calendar')}>
                            <Megaphone size={16} /> {t({ de: 'Meine To-Dos', en: 'My tasks', tr: 'Görevlerim' })}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <span className="badge" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
                    {t({ de: 'Aktive Rolle', en: 'Active role', tr: 'Aktif rol' })}: {role.toUpperCase()}
                </span>
            </div>

            {role === 'company_admin' && <AdminDashboard {...viewProps} />}
            {role === 'manager' && <ManagerDashboard {...viewProps} />}
            {role === 'member' && <MemberDashboard {...viewProps} />}

            {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
            {selectedContent && <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />}
        </div>
    );
}