import type { CSSProperties } from 'react';
import type { User, RoleConfig } from '../types';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ROLE_CONFIG } from '../context/AuthContext';

interface AdminSettingsProps {
    currentUser: User | null;
    statusDot: (s: string) => CSSProperties;
}

export function AdminSettings({ currentUser, statusDot }: AdminSettingsProps) {
    const { users: testUsers } = useData();
    return (
        <div className="animate-in">
            <div className="card" style={{ marginBottom: '16px', borderColor: 'rgba(239,68,68,0.25)' }}>
                <div className="card-header" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={16} style={{ color: '#ef4444' }} /> Admin — Benutzerverwaltung
                        </div>
                        <div className="card-subtitle">
                            Vollständige Kontrolle über alle Benutzer, Rollen und Berechtigungen
                        </div>
                    </div>
                    <button className="btn btn-primary btn-sm">
                        <Plus size={14} /> Neuer Benutzer
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {testUsers.map(user => {
                    const cfg = ROLE_CONFIG[user.role] as RoleConfig;
                    const isMe = user.id === currentUser?.id;
                    return (
                        <div key={user.id} className="card" style={{ padding: '16px', borderLeft: `3px solid ${cfg.color}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0,
                                    background: cfg.bgColor, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontWeight: 700, color: cfg.color,
                                    fontSize: 'var(--font-size-xs)',
                                }}>
                                    {user.avatar}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{user.name}</span>
                                        {isMe && (
                                            <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 'var(--radius-full)', background: 'rgba(220,38,38,0.1)', color: 'var(--color-primary-light)', fontWeight: 700 }}>Du</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {user.email} · {user.jobTitle} · {user.department}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                    <div style={statusDot(user.status)} />
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {user.status === 'online' ? 'Online' : user.status === 'away' ? 'Abwesend' : 'Offline'}
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
                                        defaultValue={user.role}
                                        style={{
                                            background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                                            fontSize: 'var(--font-size-xs)', padding: '4px 8px', cursor: 'pointer',
                                        }}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="member">Member</option>
                                    </select>
                                    {!isMe && (
                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)', padding: '4px 8px' }}>
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
                Rollenänderungen erfordern in der Produktion eine Bestätigung per E-Mail. Änderungen an deinem eigenen Account sind nicht möglich.
            </div>
        </div>
    );
}
