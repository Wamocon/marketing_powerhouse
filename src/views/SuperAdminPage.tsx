'use client';

import { useState, useEffect, type FormEvent } from 'react';
import {
    Shield, Building2, Users2, Plus, Trash2, Search,
    ArrowLeft, Crown, Settings, UserCheck, X, Edit3, Check,
} from 'lucide-react';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useData } from '../context/DataContext';
import type { Company, CompanyRole, User } from '../types';
import * as api from '../lib/api';

type AdminTab = 'companies' | 'users';

export default function SuperAdminPage() {
    const { currentUser, isSuperAdmin } = useAuth();
    const { allCompanies, loadAllCompanies } = useCompany();
    const { users } = useData();
    const [activeTab, setActiveTab] = useState<AdminTab>('companies');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [companyMembers, setCompanyMembers] = useState<Record<string, { userId: string; role: CompanyRole; userName: string }[]>>({});

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
                <h2 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Kein Zugriff</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Diese Seite ist nur für Super-Administratoren zugänglich.
                </p>
                <a href="/" className="btn btn-primary">
                    <ArrowLeft size={16} /> Zurück zum Dashboard
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
        if (!confirm('Soll dieses Unternehmen wirklich gelöscht werden? Alle zugehörigen Daten gehen verloren.')) return;
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
        if (!confirm('Soll dieser Benutzer wirklich gelöscht werden?')) return;
        try {
            await api.deleteUser(userId);
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const loadCompanyMembers = async (companyId: string) => {
        try {
            const members = await api.fetchCompanyMembers(companyId);
            setCompanyMembers(prev => ({
                ...prev,
                [companyId]: members.map(m => ({
                    userId: m.userId,
                    role: m.role,
                    userName: m.userName ?? 'Unbekannt',
                })),
            }));
        } catch (err) {
            console.error('Failed to load members:', err);
        }
    };

    const tabs: { id: AdminTab; label: string; icon: typeof Building2; count: number }[] = [
        { id: 'companies', label: 'Unternehmen', icon: Building2, count: allCompanies.length },
        { id: 'users', label: 'Benutzer', icon: Users2, count: users.length },
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
                    <a href="/" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
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
                            Super-Admin Panel
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: '#f59e0b', fontWeight: 600 }}>
                            Globale Verwaltung
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                            Übersicht
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Unternehmen</span>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {allCompanies.length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Benutzer</span>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {users.length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Super-Admins</span>
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
                                placeholder={activeTab === 'companies' ? 'Unternehmen suchen...' : 'Benutzer suchen...'}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                        {activeTab === 'companies' && (
                            <button className="btn btn-primary" onClick={() => setShowCreateCompanyModal(true)}>
                                <Plus size={16} /> Neues Unternehmen
                            </button>
                        )}
                        {activeTab === 'users' && (
                            <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
                                <Plus size={16} /> Neuer Benutzer
                            </button>
                        )}
                    </div>

                    {/* Companies Tab */}
                    {activeTab === 'companies' && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredCompanies.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <Building2 size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>Keine Unternehmen gefunden.</p>
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
                                                    {company.industry || 'Keine Branche'} · Erstellt {new Date(company.createdAt).toLocaleDateString('de-DE')}
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
                                                    <Users2 size={14} /> Mitglieder
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
                                                    fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                                    color: 'var(--text-tertiary)', marginBottom: '8px',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    Mitglieder ({companyMembers[company.id]?.length ?? 0})
                                                </div>
                                                {(companyMembers[company.id] ?? []).length === 0 ? (
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                        Keine Mitglieder zugewiesen.
                                                    </p>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {(companyMembers[company.id] ?? []).map((member, idx) => {
                                                            const roleCfg = ROLE_CONFIG[member.role];
                                                            return (
                                                                <div key={idx} style={{
                                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                                    padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                                                                    background: 'var(--bg-hover)',
                                                                }}>
                                                                    <span style={{ fontSize: 'var(--font-size-xs)', flex: 1 }}>
                                                                        {member.userName}
                                                                    </span>
                                                                    <span style={{
                                                                        fontSize: '0.6rem', padding: '1px 6px',
                                                                        borderRadius: 'var(--radius-full)',
                                                                        background: roleCfg.bgColor, color: roleCfg.color,
                                                                        fontWeight: 700,
                                                                    }}>
                                                                        {roleCfg.shortLabel}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
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
                                    <p style={{ color: 'var(--text-secondary)' }}>Keine Benutzer gefunden.</p>
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
                                                            }}>Du</span>
                                                        )}
                                                        {user.isSuperAdmin && (
                                                            <span style={{
                                                                display: 'flex', alignItems: 'center', gap: '3px',
                                                                fontSize: '0.6rem', padding: '1px 6px',
                                                                borderRadius: 'var(--radius-full)',
                                                                background: 'rgba(245, 158, 11, 0.12)',
                                                                color: '#f59e0b', fontWeight: 700,
                                                            }}>
                                                                <Crown size={9} /> Super-Admin
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
                                                                title={user.isSuperAdmin ? 'Super-Admin entziehen' : 'Zum Super-Admin machen'}
                                                            >
                                                                <Crown size={14} />
                                                                {user.isSuperAdmin ? 'SA entziehen' : 'SA erteilen'}
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
