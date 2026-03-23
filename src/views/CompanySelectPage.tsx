'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2, Plus, ArrowRight, Shield, Crown,
    Users2, Settings, Trash2, Search, X,
} from 'lucide-react';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import type { CompanyRole } from '../types';

export default function CompanySelectPage() {
    const router = useRouter();
    const { currentUser, isSuperAdmin, logout } = useAuth();
    const { userCompanies, loading, selectCompany, createCompany } = useCompany();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCompanies = userCompanies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleIcon = (role: CompanyRole) => {
        switch (role) {
            case 'company_admin': return <Crown size={12} />;
            case 'manager': return <Users2 size={12} />;
            default: return null;
        }
    };

    const getRoleConfig = (role: CompanyRole) => {
        return ROLE_CONFIG[role] || ROLE_CONFIG.member;
    };

    const handleCreateCompany = async (data: { name: string; description?: string; industry?: string }) => {
        const createdCompany = await createCompany(data);
        await selectCompany(createdCompany.id);
        router.push(`/project/${createdCompany.id}/setup?new=1`);
        return createdCompany;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex', height: '100vh', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-base)',
                flexDirection: 'column', gap: '16px',
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', color: 'white', fontWeight: 700,
                }}>M</div>
                <div style={{
                    width: 32, height: 32, border: '3px solid var(--border-color)',
                    borderTopColor: 'var(--color-primary)', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-base)',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Header */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 32px', borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', color: 'white', fontWeight: 700,
                    }}>M</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
                            Momentum
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Marketing OS
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isSuperAdmin && (
                        <a href="/admin" style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: 'var(--radius-md)',
                            background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b',
                            fontSize: 'var(--font-size-xs)', fontWeight: 600,
                            textDecoration: 'none', border: '1px solid rgba(245, 158, 11, 0.25)',
                        }}>
                            <Shield size={14} /> Super-Admin
                        </a>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--color-primary)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 'var(--font-size-xs)', color: 'white', fontWeight: 700,
                        }}>
                            {currentUser?.avatar}
                        </div>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {currentUser?.name}
                        </span>
                    </div>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={logout}
                        style={{ color: 'var(--color-danger)' }}
                    >
                        Abmelden
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', padding: '48px 32px',
            }}>
                <div style={{ maxWidth: '800px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{
                            fontSize: '1.75rem', fontWeight: 800,
                            color: 'var(--text-primary)', marginBottom: '8px',
                        }}>
                            Projekt auswählen
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)' }}>
                            Wähle ein Projekt aus, um mit der Arbeit zu beginnen.
                        </p>
                    </div>

                    {/* Search & Actions */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px',
                    }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute', left: '12px', top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                            }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Projekt suchen..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                                        padding: 0,
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {(isSuperAdmin || userCompanies.some(c => c.role === 'company_admin')) && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <Plus size={16} /> Neues Projekt
                            </button>
                        )}
                    </div>

                    {/* Company Grid */}
                    {filteredCompanies.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '60px 20px',
                            background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)',
                        }}>
                            <Building2 size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
                            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                {searchQuery ? 'Keine Ergebnisse' : 'Noch keine Projekte'}
                            </h3>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginBottom: '24px' }}>
                                {searchQuery
                                    ? 'Versuche einen anderen Suchbegriff.'
                                    : 'Erstelle dein erstes Projekt, um loszulegen.'}
                            </p>
                            {!searchQuery && (isSuperAdmin || userCompanies.some(c => c.role === 'company_admin')) && (
                                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={16} /> Projekt erstellen
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: '16px',
                        }}>
                            {filteredCompanies.map(company => {
                                const roleCfg = getRoleConfig(company.role);
                                return (
                                    <button
                                        key={company.id}
                                        onClick={async () => {
                                            await selectCompany(company.id);
                                            router.push(`/project/${company.id}`);
                                        }}
                                        style={{
                                            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-lg)', padding: '20px',
                                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
                                            display: 'flex', flexDirection: 'column', gap: '12px',
                                        }}
                                        className="card"
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
                                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                                            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.1rem', fontWeight: 700, color: 'white', flexShrink: 0,
                                                }}>
                                                    {company.logo || company.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
                                                        {company.name}
                                                    </div>
                                                    {company.industry && (
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                                            {company.industry}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                        </div>
                                        {company.description && (
                                            <p style={{
                                                fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)',
                                                lineHeight: 1.5, margin: 0,
                                                overflow: 'hidden', textOverflow: 'ellipsis',
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                            }}>
                                                {company.description}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                                background: roleCfg.bgColor, color: roleCfg.color,
                                                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                                            }}>
                                                {getRoleIcon(company.role)} {roleCfg.shortLabel}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Company Modal */}
            {showCreateModal && (
                <CreateCompanyModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateCompany}
                />
            )}
        </div>
    );
}

function CreateCompanyModal({
    onClose,
    onCreate,
}: {
    onClose: () => void;
    onCreate: (data: { name: string; description?: string; industry?: string }) => Promise<unknown>;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [industry, setIndustry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Bitte gib einen Projektnamen ein.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await onCreate({ name: name.trim(), description: description.trim(), industry: industry.trim() });
            onClose();
        } catch {
            setError('Fehler beim Erstellen. Bitte versuche es erneut.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)', padding: '28px',
                width: '100%', maxWidth: '480px',
            }} className="animate-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Neues Projekt erstellen
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-tertiary)', padding: '4px',
                    }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Projektname *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="z.B. WAMOCON Academy"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Branche</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="z.B. IT & Training"
                            value={industry}
                            onChange={e => setIndustry(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Beschreibung</label>
                        <textarea
                            className="form-input form-textarea"
                            placeholder="Kurze Beschreibung des Projekt..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                            fontSize: 'var(--font-size-xs)', color: '#ef4444', marginBottom: '16px',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Abbrechen
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Wird erstellt...' : 'Projekt erstellen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
