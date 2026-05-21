'use client';

import { useState, useEffect, type FormEvent } from 'react';
import {
    Shield, Building2, Users2, Plus, Trash2, Search,
    ArrowLeft, Crown, Settings, UserCheck, X, Edit3, Check,
} from 'lucide-react';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import type { Company, CompanyRole, User } from '../types';
import * as api from '../lib/api';
import PageHelp from '../components/PageHelp';

type AdminTab = 'companies' | 'users';

export default function SuperAdminPage() {
    const { currentUser, isSuperAdmin } = useAuth();
    const { allCompanies, loadAllCompanies, activeCompany } = useCompany();
    const { users } = useData();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<AdminTab>('companies');
    const [searchQuery, setSearchQuery] = useState('');
    const [_showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
    const [_showAddUserModal, setShowAddUserModal] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [companyMembers, setCompanyMembers] = useState<Record<string, { memberId: string; userId: string; role: CompanyRole; userName: string; userEmail: string }[]>>({});
    const [assignByCompany, setAssignByCompany] = useState<Record<string, { userId: string; role: CompanyRole }>>({});
    const [companyFeedback, setCompanyFeedback] = useState<Record<string, { error?: string; success?: string }>>({});

    useEffect(() => {
        if (isSuperAdmin) {
            loadAllCompanies();
        }
    }, [isSuperAdmin, loadAllCompanies]);

    if (!isSuperAdmin) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-base)',
                flexDirection: 'column', gap: '16px',
            }}>
                <Shield size={48} style={{ color: 'var(--color-danger)' }} />
                <h2 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{t({ de: 'Kein Zugriff', en: 'No Access', tr: 'Erişim Yok' })}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {t({ de: 'Diese Seite ist nur für Super-Administratoren zugänglich.', en: 'This page is only accessible to super administrators.', tr: 'Bu sayfa yalnızca süper yöneticiler için erişilebilir.' })}
                </p>
                <a href="/dashboard" className="btn btn-primary">
                    <ArrowLeft size={16} /> {t({ de: 'Zurück zum Dashboard', en: 'Back to Dashboard', tr: 'Panele Dön' })}
                </a>
            </div>
        );
    }

    const filteredCompanies = allCompanies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteCompany = async (id: string) => {
        if (!confirm(t({ de: 'Soll dieses Projekt wirklich gelöscht werden? Alle zugehörigen Daten gehen verloren.', en: 'Do you really want to delete this project? All associated data will be lost.', tr: 'Bu proje gerçekten silinsin mi? Tüm ilişkili veriler kaybolacak.' }))) return;
        try {
            await api.deleteCompany(id);
            loadAllCompanies();
        } catch (err) {
            console.error('Failed to delete company:', err);
        }
    };

    const handleToggleSuperAdmin = async (userId: string, currentStatus: boolean) => {
        if (userId === currentUser?.id) return;
        try {
            await api.updateUserSuperAdmin(userId, !currentStatus);
            // Reload users would be needed - for now we stay synced with DataContext
        } catch (err) {
            console.error('Failed to update super-admin status:', err);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === currentUser?.id) return;
        if (!confirm(t({ de: 'Soll dieser Benutzer wirklich gelöscht werden?', en: 'Do you really want to delete this user?', tr: 'Bu kullanıcı gerçekten silinsin mi?' }))) return;
        try {
            await api.deleteUser(userId);
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const loadCompanyMembers = async (companyId: string) => {
        try {
            const members = await api.fetchCompanyMembers(companyId);
            const assignedUserIds = new Set(members.map(m => m.userId));
            const firstUnassignedUser = users.find(u => !assignedUserIds.has(u.id));
            setCompanyMembers(prev => ({
                ...prev,
                [companyId]: members.map(m => ({
                    memberId: m.id,
                    userId: m.userId,
                    role: m.role,
                    userName: m.userName ?? t({ de: 'Unbekannt', en: 'Unknown', tr: 'Bilinmeyen' }),
                    userEmail: m.userEmail ?? '',
                })),
            }));
            setAssignByCompany(prev => ({
                ...prev,
                [companyId]: prev[companyId] ?? {
                    userId: firstUnassignedUser?.id ?? '',
                    role: 'member',
                },
            }));
        } catch (err) {
            console.error('Failed to load members:', err);
        }
    };

    const setCompanyMessage = (companyId: string, payload: { error?: string; success?: string }) => {
        setCompanyFeedback(prev => ({
            ...prev,
            [companyId]: payload,
        }));
    };

    const handleAssignUserToCompany = async (companyId: string) => {
        const selectedUserId = assignByCompany[companyId]?.userId;
        const selectedRole = assignByCompany[companyId]?.role ?? 'member';
        if (!selectedUserId) {
            setCompanyMessage(companyId, { error: t({ de: 'Bitte zuerst einen Benutzer auswählen.', en: 'Please select a user first.', tr: 'Lütfen önce bir kullanıcı seçin.' }) });
            return;
        }
        try {
            setCompanyMessage(companyId, {});
            await api.addCompanyMember(companyId, selectedUserId, selectedRole);
            await loadCompanyMembers(companyId);
            setCompanyMessage(companyId, { success: t({ de: 'Benutzer erfolgreich zum Projekt zugewiesen.', en: 'User successfully assigned to project.', tr: 'Kullanıcı projeye başarıyla atandı.' }) });
        } catch {
            setCompanyMessage(companyId, { error: t({ de: 'Zuweisung fehlgeschlagen. Benutzer ist ggf. bereits Mitglied.', en: 'Assignment failed. User may already be a member.', tr: 'Atama başarısız. Kullanıcı zaten üye olabilir.' }) });
        }
    };

    const handleUpdateCompanyMemberRole = async (companyId: string, memberId: string, role: CompanyRole) => {
        try {
            setCompanyMessage(companyId, {});
            await api.updateCompanyMemberRole(memberId, role);
            setCompanyMembers(prev => ({
                ...prev,
                [companyId]: (prev[companyId] ?? []).map(member =>
                    member.memberId === memberId ? { ...member, role } : member,
                ),
            }));
            setCompanyMessage(companyId, { success: t({ de: 'Projektrolle aktualisiert.', en: 'Project role updated.', tr: 'Proje rolü güncellendi.' }) });
        } catch {
            setCompanyMessage(companyId, { error: t({ de: 'Rolle konnte nicht aktualisiert werden.', en: 'Role could not be updated.', tr: 'Rol güncellenemedi.' }) });
        }
    };

    const handleRemoveCompanyMember = async (companyId: string, memberId: string, userName: string) => {
        const companyList = companyMembers[companyId] ?? [];
        const targetMember = companyList.find(m => m.memberId === memberId);
        if (!targetMember) {
            setCompanyMessage(companyId, { error: t({ de: 'Mitglied nicht gefunden.', en: 'Member not found.', tr: 'Üye bulunamadı.' }) });
            return;
        }

        const isCurrentUserInActiveCompany =
            targetMember.userId === currentUser?.id && activeCompany?.id === companyId;
        if (isCurrentUserInActiveCompany) {
            setCompanyMessage(companyId, { error: t({ de: 'Du kannst deinen eigenen Account nicht aus dem aktiven Projekt entfernen.', en: 'You cannot remove your own account from the active project.', tr: 'Aktif projeden kendi hesabınızı kaldıramazsınız.' }) });
            return;
        }

        const adminCount = companyList.filter(m => m.role === 'company_admin').length;
        const isLastAdmin = targetMember.role === 'company_admin' && adminCount <= 1;
        if (isLastAdmin) {
            setCompanyMessage(companyId, { error: t({ de: 'Der letzte Admin eines Projekts kann nicht entfernt werden.', en: 'The last admin of a project cannot be removed.', tr: 'Bir projenin son admini kaldırılamaz.' }) });
            return;
        }

        const confirmed = confirm(t({ de: `Soll ${userName} wirklich aus diesem Projekt entfernt werden?`, en: `Do you really want to remove ${userName} from this project?`, tr: `${userName} bu projeden gerçekten kaldırılsın mı?` }));
        if (!confirmed) return;
        try {
            setCompanyMessage(companyId, {});
            await api.removeCompanyMember(memberId);
            await loadCompanyMembers(companyId);
            setCompanyMessage(companyId, { success: t({ de: `${userName} wurde aus dem Projekt entfernt.`, en: `${userName} was removed from the project.`, tr: `${userName} projeden kaldırıldı.` }) });
        } catch {
            setCompanyMessage(companyId, { error: t({ de: 'Mitglied konnte nicht entfernt werden.', en: 'Member could not be removed.', tr: 'Üye kaldırılamadı.' }) });
        }
    };

    const tabs: { id: AdminTab; label: string; icon: typeof Building2; count: number }[] = [
        { id: 'companies', label: t({ de: 'Projekte', en: 'Projects', tr: 'Projeler' }), icon: Building2, count: allCompanies.length },
        { id: 'users', label: t({ de: 'Benutzer', en: 'Users', tr: 'Kullanıcılar' }), icon: Users2, count: users.length },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            {/* Header */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 32px', borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <a href="/dashboard" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
                        <ArrowLeft size={20} />
                    </a>
                    <div style={{
                        width: 36, height: 36, borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', color: 'white', fontWeight: 700,
                    }}>
                        <Shield size={18} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
                            {t({ de: 'Super-Admin Panel', en: 'Super Admin Panel', tr: 'Süper Admin Paneli' })}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: '#f59e0b', fontWeight: 600 }}>
                            {t({ de: 'Globale Verwaltung', en: 'Global Management', tr: 'Genel Yönetim' })}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PageHelp title={t({ de: 'Super-Admin: Benutzer und Projekte', en: 'Super Admin: Users and Projects', tr: 'Süper Admin: Kullanıcılar ve Projeler' })}>
                        <p><strong>{t({ de: 'Projekt-Tab:', en: 'Projects tab:', tr: 'Projeler sekmesi:' })}</strong> {t({ de: 'Bestehende Benutzer können einem Projekt zugewiesen und ihre Rolle pro Projekt direkt angepasst werden.', en: 'Existing users can be assigned to a project and their role per project can be adjusted directly.', tr: 'Mevcut kullanıcılar bir projeye atanabilir ve proje başına rolleri doğrudan ayarlanabilir.' })}</p>
                        <ul style={{ marginTop: '8px', paddingLeft: '18px' }}>
                            <li>{t({ de: '"Benutzer wählen" zeigt nur Benutzer, die noch nicht Mitglied des Projekts sind.', en: '"Select user" shows only users who are not yet members of the project.', tr: '"Kullanıcı seç" yalnızca henüz projenin üyesi olmayan kullanıcıları gösterir.' })}</li>
                            <li>{t({ de: 'Rollen sind projektbezogen und können als Admin, Manager oder Member gesetzt werden.', en: 'Roles are project-specific and can be set as Admin, Manager, or Member.', tr: 'Roller projeye özeldir ve Admin, Manager veya Member olarak ayarlanabilir.' })}</li>
                            <li>{t({ de: 'Änderungen wirken sofort auf den Zugriff des Benutzers im jeweiligen Projekt.', en: 'Changes immediately affect the user\'s access in the respective project.', tr: 'Değişiklikler, kullanıcının ilgili projedeki erişimini hemen etkiler.' })}</li>
                        </ul>
                        <p style={{ marginTop: '10px' }}><strong>{t({ de: 'Benutzer-Tab:', en: 'Users tab:', tr: 'Kullanıcılar sekmesi:' })}</strong> {t({ de: 'Hier werden globale Benutzer gepflegt, inkl. Super-Admin-Status.', en: 'Global users are managed here, including super admin status.', tr: 'Burada global kullanıcılar yönetilir, süper admin statüsü dahil.' })}</p>
                    </PageHelp>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {currentUser?.name}
                    </span>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '0', maxWidth: '1400px', margin: '0 auto', padding: '24px 32px' }}>
                {/* Sidebar */}
                <div style={{ width: '220px', flexShrink: 0, marginRight: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                    <span style={{
                                        marginLeft: 'auto', fontSize: 'var(--font-size-xs)',
                                        background: 'var(--bg-hover)', padding: '1px 7px',
                                        borderRadius: 'var(--radius-full)', color: 'var(--text-tertiary)',
                                        fontWeight: 600,
                                    }}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Stats */}
                    <div style={{
                        marginTop: '24px', padding: '16px',
                        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                    }}>
                        <div style={{
                            fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)',
                            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                            marginBottom: '12px',
                        }}>
                            {t({ de: 'Übersicht', en: 'Overview', tr: 'Genel Bakış' })}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{t({ de: 'Projekte', en: 'Projects', tr: 'Projeler' })}</span>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {allCompanies.length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{t({ de: 'Benutzer', en: 'Users', tr: 'Kullanıcılar' })}</span>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {users.length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{t({ de: 'Super-Admins', en: 'Super Admins', tr: 'Süper Adminler' })}</span>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#f59e0b' }}>
                                    {users.filter(u => u.isSuperAdmin).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1 }}>
                    {/* Search Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute', left: '12px', top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                            }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder={activeTab === 'companies' ? t({ de: 'Projekt suchen...', en: 'Search projects...', tr: 'Proje ara...' }) : t({ de: 'Benutzer suchen...', en: 'Search users...', tr: 'Kullanıcı ara...' })}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                        {activeTab === 'companies' && (
                            <button className="btn btn-primary" onClick={() => setShowCreateCompanyModal(true)}>
                                <Plus size={16} /> {t({ de: 'Neues Projekt', en: 'New Project', tr: 'Yeni Proje' })}
                            </button>
                        )}
                        {activeTab === 'users' && (
                            <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
                                <Plus size={16} /> {t({ de: 'Neuer Benutzer', en: 'New User', tr: 'Yeni Kullanıcı' })}
                            </button>
                        )}
                    </div>

                    {/* Companies Tab */}
                    {activeTab === 'companies' && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredCompanies.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <Building2 size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>{t({ de: 'Keine Projekte gefunden.', en: 'No projects found.', tr: 'Proje bulunamadı.' })}</p>
                                </div>
                            ) : (
                                filteredCompanies.map(company => (
                                    <div key={company.id} className="card" style={{
                                        padding: '16px',
                                        borderLeft: '3px solid var(--color-primary)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
                                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, color: 'white', fontSize: 'var(--font-size-base)',
                                            }}>
                                                {company.logo || company.name.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                                                    {company.name}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    {company.industry || t({ de: 'Keine Branche', en: 'No industry', tr: 'Sektör yok' })} · {t({ de: 'Erstellt', en: 'Created', tr: 'Oluşturulma' })} {new Date(company.createdAt).toLocaleDateString('de-DE')}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={async () => {
                                                        setSelectedCompanyId(company.id === selectedCompanyId ? null : company.id);
                                                        if (company.id !== selectedCompanyId) {
                                                            await loadCompanyMembers(company.id);
                                                        }
                                                    }}
                                                >
                                                    <Users2 size={14} /> {t({ de: 'Mitglieder', en: 'Members', tr: 'Üyeler' })}
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--color-danger)' }}
                                                    onClick={() => handleDeleteCompany(company.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expandable Members */}
                                        {selectedCompanyId === company.id && (
                                            <div style={{
                                                marginTop: '12px', paddingTop: '12px',
                                                borderTop: '1px solid var(--border-color)',
                                            }}>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    marginBottom: '10px', flexWrap: 'wrap',
                                                }}>
                                                    <select
                                                        className="form-select"
                                                        value={assignByCompany[company.id]?.userId ?? ''}
                                                        onChange={e => setAssignByCompany(prev => ({
                                                            ...prev,
                                                            [company.id]: {
                                                                userId: e.target.value,
                                                                role: prev[company.id]?.role ?? 'member',
                                                            },
                                                        }))}
                                                        style={{ minWidth: '250px' }}
                                                    >
                                                        <option value="">{t({ de: 'Benutzer wählen', en: 'Select user', tr: 'Kullanıcı seç' })}</option>
                                                        {users
                                                            .filter(user => !(companyMembers[company.id] ?? []).some(member => member.userId === user.id))
                                                            .map(user => (
                                                                <option key={user.id} value={user.id}>
                                                                    {user.name} ({user.email})
                                                                </option>
                                                            ))}
                                                    </select>
                                                    <select
                                                        className="form-select"
                                                        value={assignByCompany[company.id]?.role ?? 'member'}
                                                        onChange={e => setAssignByCompany(prev => ({
                                                            ...prev,
                                                            [company.id]: {
                                                                userId: prev[company.id]?.userId ?? '',
                                                                role: e.target.value as CompanyRole,
                                                            },
                                                        }))}
                                                        style={{ minWidth: '130px' }}
                                                    >
                                                        <option value="company_admin">Admin</option>
                                                        <option value="manager">Manager</option>
                                                        <option value="member">Member</option>
                                                    </select>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleAssignUserToCompany(company.id)}
                                                    >
                                                        <UserCheck size={14} /> {t({ de: 'Zuweisen', en: 'Assign', tr: 'Ata' })}
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                                                    {t({ de: 'Hier weist du vorhandene Benutzer einem Projekt zu und setzt direkt ihre Projektrolle.', en: 'Here you assign existing users to a project and set their project role directly.', tr: 'Burada mevcut kullanıcıları bir projeye atar ve proje rollerini doğrudan ayarlarsınız.' })}
                                                </div>
                                                <div style={{
                                                    fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                                    color: 'var(--text-tertiary)', marginBottom: '8px',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    {t({ de: 'Mitglieder', en: 'Members', tr: 'Üyeler' })} ({companyMembers[company.id]?.length ?? 0})
                                                </div>
                                                {(companyMembers[company.id] ?? []).length === 0 ? (
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                        {t({ de: 'Keine Mitglieder zugewiesen.', en: 'No members assigned.', tr: 'Üye atanmadı.' })}
                                                    </p>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {(companyMembers[company.id] ?? []).map((member, idx) => {
                                                            const roleCfg = ROLE_CONFIG[member.role];
                                                            const adminCount = (companyMembers[company.id] ?? []).filter(m => m.role === 'company_admin').length;
                                                            const isLastAdmin = member.role === 'company_admin' && adminCount <= 1;
                                                            const isCurrentUserInActiveCompany =
                                                                member.userId === currentUser?.id && activeCompany?.id === company.id;
                                                            const removeDisabled = isLastAdmin || isCurrentUserInActiveCompany;
                                                            const removeTitle = isLastAdmin
                                                                ? t({ de: 'Letzten Admin kann man nicht entfernen', en: 'Cannot remove the last admin', tr: 'Son admin kaldırılamaz' })
                                                                : isCurrentUserInActiveCompany
                                                                    ? t({ de: 'Eigenen Account im aktiven Projekt kann man nicht entfernen', en: 'Cannot remove your own account from the active project', tr: 'Aktif projeden kendi hesabınızı kaldıramazsınız' })
                                                                    : t({ de: 'Mitglied entfernen', en: 'Remove member', tr: 'Üyeyi kaldır' });
                                                            return (
                                                                <div key={idx} style={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: 'minmax(0, 1fr) auto auto auto',
                                                                    alignItems: 'center',
                                                                    gap: '10px',
                                                                    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                                                                    background: 'var(--bg-hover)',
                                                                }}>
                                                                    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                        <div style={{
                                                                            fontSize: 'var(--font-size-xs)',
                                                                            fontWeight: 600,
                                                                            color: 'var(--text-primary)',
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                        }}>
                                                                            {member.userName}
                                                                        </div>
                                                                        {member.userEmail && (
                                                                            <div style={{
                                                                                fontSize: '0.68rem',
                                                                                color: 'var(--text-tertiary)',
                                                                                whiteSpace: 'nowrap',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                            }}>
                                                                                {member.userEmail}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <select
                                                                        className="form-select"
                                                                        value={member.role}
                                                                        onChange={e => handleUpdateCompanyMemberRole(company.id, member.memberId, e.target.value as CompanyRole)}
                                                                        style={{ minWidth: '130px', fontSize: '0.72rem', width: '130px' }}
                                                                    >
                                                                        <option value="company_admin">Admin</option>
                                                                        <option value="manager">Manager</option>
                                                                        <option value="member">Member</option>
                                                                    </select>
                                                                    <span style={{
                                                                        fontSize: '0.6rem', padding: '1px 6px',
                                                                        borderRadius: 'var(--radius-full)',
                                                                        background: roleCfg.bgColor, color: roleCfg.color,
                                                                        fontWeight: 700,
                                                                    }}>
                                                                        {roleCfg.shortLabel}
                                                                    </span>
                                                                    <button
                                                                        className="btn btn-ghost btn-sm"
                                                                        style={{ color: 'var(--color-danger)', padding: '4px 6px', justifySelf: 'end' }}
                                                                        onClick={() => handleRemoveCompanyMember(company.id, member.memberId, member.userName)}
                                                                        title={removeTitle}
                                                                        disabled={removeDisabled}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {(companyFeedback[company.id]?.error || companyFeedback[company.id]?.success) && (
                                                    <div style={{
                                                        marginTop: '8px',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: companyFeedback[company.id]?.error ? 'var(--color-danger)' : 'var(--color-success)',
                                                    }}>
                                                        {companyFeedback[company.id]?.error || companyFeedback[company.id]?.success}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredUsers.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <Users2 size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>{t({ de: 'Keine Benutzer gefunden.', en: 'No users found.', tr: 'Kullanıcı bulunamadı.' })}</p>
                                </div>
                            ) : (
                                filteredUsers.map(user => {
                                    const isMe = user.id === currentUser?.id;
                                    return (
                                        <div key={user.id} className="card" style={{
                                            padding: '16px',
                                            borderLeft: user.isSuperAdmin ? '3px solid #f59e0b' : '3px solid var(--border-color)',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                                    background: user.isSuperAdmin
                                                        ? 'rgba(245, 158, 11, 0.12)'
                                                        : 'var(--bg-hover)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: 'var(--font-size-xs)', flexShrink: 0,
                                                    color: user.isSuperAdmin ? '#f59e0b' : 'var(--text-secondary)',
                                                }}>
                                                    {user.avatar}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                                            {user.name}
                                                        </span>
                                                        {isMe && (
                                                            <span style={{
                                                                fontSize: '0.6rem', padding: '1px 5px',
                                                                borderRadius: 'var(--radius-full)',
                                                                background: 'rgba(220,38,38,0.1)',
                                                                color: 'var(--color-primary-light)', fontWeight: 700,
                                                            }}>{t({ de: 'Du', en: 'You', tr: 'Sen' })}</span>
                                                        )}
                                                        {user.isSuperAdmin && (
                                                            <span style={{
                                                                display: 'flex', alignItems: 'center', gap: '3px',
                                                                fontSize: '0.6rem', padding: '1px 6px',
                                                                borderRadius: 'var(--radius-full)',
                                                                background: 'rgba(245, 158, 11, 0.12)',
                                                                color: '#f59e0b', fontWeight: 700,
                                                            }}>
                                                                <Crown size={9} /> {t({ de: 'Super-Admin', en: 'Super Admin', tr: 'Süper Admin' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                        {user.email} · {user.jobTitle} · {user.department}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                                                    {!isMe && (
                                                        <>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                style={{
                                                                    color: user.isSuperAdmin ? '#f59e0b' : 'var(--text-tertiary)',
                                                                    fontSize: 'var(--font-size-xs)',
                                                                }}
                                                                onClick={() => handleToggleSuperAdmin(user.id, user.isSuperAdmin)}
                                                                title={user.isSuperAdmin ? t({ de: 'Super-Admin entziehen', en: 'Revoke Super Admin', tr: 'Süper Admin\'i Kaldır' }) : t({ de: 'Zum Super-Admin machen', en: 'Make Super Admin', tr: 'Süper Admin Yap' })}
                                                            >
                                                                <Crown size={14} />
                                                                {user.isSuperAdmin ? t({ de: 'SA entziehen', en: 'Revoke SA', tr: 'SA Kaldır' }) : t({ de: 'SA erteilen', en: 'Grant SA', tr: 'SA Ata' })}
                                                            </button>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                style={{ color: 'var(--color-danger)' }}
                                                                onClick={() => handleDeleteUser(user.id)}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
