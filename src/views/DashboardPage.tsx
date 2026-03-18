import { useState } from 'react';
import type { Task, ContentItem } from '../types';
import { Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageHelp from '../components/PageHelp';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useContents } from '../context/ContentContext';
import TaskDetailModal from '../components/TaskDetailModal';
import ContentDetailModal from '../components/ContentDetailModal';
import { AdminDashboard, ManagerDashboard, MemberDashboard } from '../components/DashboardViews';

export default function DashboardPage() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { tasks } = useTasks();
    const { contents } = useContents();

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

    const role = currentUser?.role || 'member';

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
                    <p className="page-subtitle">Dein Marketing auf einen Blick — Stand: 10. März 2026</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Das Dashboard">
                        <p style={{ marginBottom: '12px' }}>Willkommen im Kontrollzentrum! Das Dashboard passt sich deiner Rolle an.</p>
                        <ul className="help-list">
                            <li><strong>Manager:</strong> Sehen aktive Kampagnen, deren Content + detaillierte Aufgaben in Farblogik sowie das Kampagnenbudget.</li>
                            <li><strong>Member:</strong> Bekommen alle eigenen zugewiesenen Aufgaben in einer priorisierten Farblogik angezeigt (Rot = eilig, Gelb = demnächst, Grün = im Plan).</li>
                            <li><strong>Admin:</strong> Bekommen die globale Statistik und Gesamtübersicht des Performance-Trends über alle Bereiche + das Budget.</li>
                        </ul>
                    </PageHelp>
                    <button className="btn btn-secondary" onClick={() => router.push('/campaigns')}>Neue Kampagne</button>
                    {role === 'manager' || role === 'admin' ? (
                        <button className="btn btn-primary" onClick={() => router.push('/calendar')}>
                            <Megaphone size={16} /> Content Kalender
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => router.push('/calendar')}>
                            <Megaphone size={16} /> Meine To-Dos
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <span className="badge" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
                    Aktive Rolle: {role.toUpperCase()}
                </span>
            </div>

            {role === 'admin' && <AdminDashboard {...viewProps} />}
            {role === 'manager' && <ManagerDashboard {...viewProps} />}
            {role === 'member' && <MemberDashboard {...viewProps} />}

            {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
            {selectedContent && <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />}
        </div>
    );
}