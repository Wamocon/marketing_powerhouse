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
                    <p className="page-subtitle">{language === 'en' ? 'Your marketing at a glance' : 'Dein Marketing auf einen Blick'} - {language === 'en' ? 'as of' : 'Stand'}: {new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title={language === 'en' ? 'The dashboard' : 'Das Dashboard'}>
                        <p style={{ marginBottom: '12px' }}>{language === 'en' ? 'Welcome to the control center. The dashboard adapts to your role.' : 'Willkommen im Kontrollzentrum! Das Dashboard passt sich deiner Rolle an.'}</p>
                        <ul className="help-list">
                            <li><strong>Manager:</strong> {language === 'en' ? 'See active campaigns, linked content, detailed tasks and campaign budget.' : 'Sehen aktive Kampagnen, deren Content + detaillierte Aufgaben in Farblogik sowie das Kampagnenbudget.'}</li>
                            <li><strong>Member:</strong> {language === 'en' ? 'See assigned tasks prioritized by urgency.' : 'Bekommen alle eigenen zugewiesenen Aufgaben in einer priorisierten Farblogik angezeigt (Rot = eilig, Gelb = demnaechst, Gruen = im Plan).'}</li>
                            <li><strong>Admin:</strong> {language === 'en' ? 'See global stats and trend overview across all areas plus budget.' : 'Bekommen die globale Statistik und Gesamtuebersicht des Performance-Trends ueber alle Bereiche + das Budget.'}</li>
                        </ul>
                    </PageHelp>
                    <button className="btn btn-secondary" onClick={() => router.push('/campaigns')}>{language === 'en' ? 'New campaign' : 'Neue Kampagne'}</button>
                    {role === 'manager' || role === 'company_admin' ? (
                        <button className="btn btn-primary" onClick={() => router.push('/calendar')}>
                            <Megaphone size={16} /> {language === 'en' ? 'Content calendar' : 'Content Kalender'}
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => router.push('/calendar')}>
                            <Megaphone size={16} /> {language === 'en' ? 'My tasks' : 'Meine To-Dos'}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <span className="badge" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
                    {language === 'en' ? 'Active role' : 'Aktive Rolle'}: {role.toUpperCase()}
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