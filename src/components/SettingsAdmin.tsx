import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { User } from '../types';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { ROLE_CONFIG, useAuth } from '../context/AuthContext';
import * as api from '../lib/api';

interface AdminSettingsProps {
    currentUser: User | null;
    statusDot: (s: 'online' | 'away' | 'offline' | undefined) => CSSProperties;
}

export function AdminSettings({ currentUser, statusDot }: AdminSettingsProps) {
    const { can, isSuperAdmin } = useAuth();
    const { companyMembers, addMember, updateMemberRole, removeMember } = useCompany();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);

    if (!can('canManageUsers')) {
        return null;
    }

    const handleRoleUpdate = async (memberId: string, role: 'company_admin' | 'manager' | 'member') => {
        try {
            setError('');
            await updateMemberRole(memberId, role);
            setSuccess('Rolle aktualisiert.');
            setTimeout(() => setSuccess(''), 2500);
        } catch {
            setError('Rolle konnte nicht geändert werden.');
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        if (!confirm(`${memberName} wirklich aus dem Projekt entfernen?`)) return;
        try {
            setError('');
            await removeMember(memberId);
            setSuccess('Mitglied entfernt.');
            setTimeout(() => setSuccess(''), 2500);
        } catch {
            setError('Mitglied konnte nicht entfernt werden.');
        }
    };

    const handleInviteByEmail = async () => {
        const normalizedEmail = inviteEmail.trim().toLowerCase();
        if (!normalizedEmail || !normalizedEmail.includes('@')) {
            setError('Bitte eine gültige E-Mail-Adresse eingeben.');
            return;
        }
        try {
            setInviteLoading(true);
            setError('');
            const user = await api.fetchUserByEmail(normalizedEmail);
            if (!user) {
                setError('Benutzer nicht gefunden. Bitte Benutzer zuerst anlegen und erneut zuweisen.');
                return;
            }
            if (companyMembers.some(member => member.userId === user.id)) {
                setError('Dieser Benutzer ist bereits Mitglied im Projekt.');
                return;
            }
            await addMember(user.id, 'member');
            setInviteEmail('');
            setSuccess(`Benutzer ${user.name} als Member zugewiesen.`);
            setTimeout(() => setSuccess(''), 2500);
        } catch {
            setError('Benutzer konnte nicht zugewiesen werden.');
        } finally {
            setInviteLoading(false);
        }
    };

    return (
        <div className="animate-in">
            <div className="card" style={{ marginBottom: '16px', borderColor: 'rgba(239,68,68,0.25)' }}>
                <div className="card-header" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={16} style={{ color: '#ef4444' }} /> Admin — Benutzerverwaltung
                        </div>
                        <div className="card-subtitle">
                            Vollständige Kontrolle über Benutzer, Rollen und Berechtigungen im aktiven Projekt
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="E-Mail für Zuweisung"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            style={{ minWidth: '230px' }}
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleInviteByEmail} disabled={inviteLoading}>
                            <Plus size={14} /> {inviteLoading ? 'Prüfung...' : 'Per E-Mail zuweisen'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {companyMembers.map(member => {
                    const cfg = ROLE_CONFIG[member.role];
                    const isMe = member.userId === currentUser?.id;
                    const isProtectedSuperAdmin = member.userIsSuperAdmin && !isSuperAdmin;
                    return (
                        <div key={member.id} className="card" style={{ padding: '16px', borderLeft: `3px solid ${cfg.color}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0,
                                    background: cfg.bgColor, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontWeight: 700, color: cfg.color,
                                    fontSize: 'var(--font-size-xs)',
                                }}>
                                    {member.userAvatar || member.userName?.charAt(0) || '?'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{member.userName || 'Unbekannt'}</span>
                                        {isMe && (
                                            <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 'var(--radius-full)', background: 'rgba(220,38,38,0.1)', color: 'var(--color-primary-light)', fontWeight: 700 }}>Du</span>
                                        )}
                                        {member.userIsSuperAdmin && (
                                            <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 700 }}>Super-Admin</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {member.userEmail || 'Keine E-Mail'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                    <div style={statusDot(member.userStatus || 'offline')} />
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {member.userStatus === 'online' ? 'Online' : member.userStatus === 'away' ? 'Abwesend' : 'Offline'}
                                    </span>
                                </div>
                                <span style={{
                                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                    background: cfg.bgColor, color: cfg.color,
                                    fontSize: '0.6875rem', fontWeight: 700,
                                }}>
                                    {cfg.shortLabel}
                                </span>
                                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                    <select
                                        value={member.role}
                                        onChange={e => handleRoleUpdate(member.id, e.target.value as 'company_admin' | 'manager' | 'member')}
                                        disabled={isMe || isProtectedSuperAdmin}
                                        title={isProtectedSuperAdmin ? 'Super-Admin-Rollen dürfen nur von Super-Admins angepasst werden.' : ''}
                                        style={{
                                            background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                                            fontSize: 'var(--font-size-xs)', padding: '4px 8px', cursor: 'pointer',
                                        }}
                                    >
                                        <option value="company_admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="member">Member</option>
                                    </select>
                                    {!isMe && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            style={{ color: 'var(--color-danger)', padding: '4px 8px' }}
                                            disabled={isProtectedSuperAdmin}
                                            onClick={() => handleRemoveMember(member.id, member.userName || 'Mitglied')}
                                            title={isProtectedSuperAdmin ? 'Super-Admin darf nicht von Projekt-Admins entfernt werden.' : ''}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                marginTop: '12px', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(239,68,68,0.06)', fontSize: 'var(--font-size-xs)',
                color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
                <Shield size={11} style={{ color: '#ef4444', flexShrink: 0 }} />
                Rollenänderungen erfordern in der Produktion eine Bestätigung per E-Mail. Projekt-Admins dürfen Super-Admin-Rechte nicht ändern.
            </div>
            {(error || success) && (
                <div style={{ marginTop: '10px', fontSize: 'var(--font-size-xs)', color: error ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {error || success}
                </div>
            )}
        </div>
    );
}
