import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { User } from '../types';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { ROLE_CONFIG, useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import * as api from '../lib/api';

interface AdminSettingsProps {
    currentUser: User | null;
    statusDot: (s: 'online' | 'away' | 'offline' | undefined) => CSSProperties;
}

export function AdminSettings({ currentUser, statusDot }: AdminSettingsProps) {
    const { t } = useLanguage();
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
            setSuccess(t({ de: 'Rolle aktualisiert.', en: 'Role updated.', tr: 'Rol güncellendi.' }));
            setTimeout(() => setSuccess(''), 2500);
        } catch {
            setError(t({ de: 'Rolle konnte nicht geändert werden.', en: 'Role could not be changed.', tr: 'Rol değiştirilemedi.' }));
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        if (!confirm(t({ de: `${memberName} wirklich aus dem Projekt entfernen?`, en: `Really remove ${memberName} from the project?`, tr: `${memberName} gerçekten projeden kaldırılsın mı?` }))) return;
        try {
            setError('');
            await removeMember(memberId);
            setSuccess(t({ de: 'Mitglied entfernt.', en: 'Member removed.', tr: 'Üye kaldırıldı.' }));
            setTimeout(() => setSuccess(''), 2500);
        } catch {
            setError(t({ de: 'Mitglied konnte nicht entfernt werden.', en: 'Member could not be removed.', tr: 'Üye kaldırılamadı.' }));
        }
    };

    const handleInviteByEmail = async () => {
        const normalizedEmail = inviteEmail.trim().toLowerCase();
        if (!normalizedEmail || !normalizedEmail.includes('@')) {
            setError(t({ de: 'Bitte eine gültige E-Mail-Adresse eingeben.', en: 'Please enter a valid email address.', tr: 'Lütfen geçerli bir e-posta adresi girin.' }));
            return;
        }
        try {
            setInviteLoading(true);
            setError('');
            const user = await api.fetchUserByEmail(normalizedEmail);
            if (!user) {
                setError(t({ de: 'Benutzer nicht gefunden. Bitte Benutzer zuerst anlegen und erneut zuweisen.', en: 'User not found. Please create the user first and reassign.', tr: 'Kullanıcı bulunamadı. Lütfen önce kullanıcıyı oluşturun ve tekrar atayın.' }));
                return;
            }
            if (companyMembers.some(member => member.userId === user.id)) {
                setError(t({ de: 'Dieser Benutzer ist bereits Mitglied im Projekt.', en: 'This user is already a member of the project.', tr: 'Bu kullanıcı zaten projenin bir üyesi.' }));
                return;
            }
            await addMember(user.id, 'member');
            setInviteEmail('');
            setSuccess(t({ de: `Benutzer ${user.name} als Member zugewiesen.`, en: `User ${user.name} assigned as member.`, tr: `${user.name} kullanıcısı üye olarak atandı.` }));
            setTimeout(() => setSuccess(''), 2500);
        } catch {
            setError(t({ de: 'Benutzer konnte nicht zugewiesen werden.', en: 'User could not be assigned.', tr: 'Kullanıcı atanamadı.' }));
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
                            <Shield size={16} style={{ color: '#ef4444' }} /> {t({ de: 'Admin — Benutzerverwaltung', en: 'Admin — User Management', tr: 'Yönetici — Kullanıcı Yönetimi' })}
                        </div>
                        <div className="card-subtitle">
                            {t({ de: 'Vollständige Kontrolle über Benutzer, Rollen und Berechtigungen im aktiven Projekt', en: 'Full control over users, roles, and permissions in the active project', tr: 'Aktif projede kullanıcılar, roller ve izinler üzerinde tam kontrol' })}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="email"
                            className="form-input"
                            placeholder={t({ de: 'E-Mail für Zuweisung', en: 'Email for assignment', tr: 'Atama için e-posta' })}
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            style={{ minWidth: '230px' }}
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleInviteByEmail} disabled={inviteLoading}>
                            <Plus size={14} /> {inviteLoading ? t({ de: 'Prüfung...', en: 'Checking...', tr: 'Kontrol ediliyor...' }) : t({ de: 'Per E-Mail zuweisen', en: 'Assign by email', tr: 'E-posta ile ata' })}
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
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{member.userName || t({ de: 'Unbekannt', en: 'Unknown', tr: 'Bilinmiyor' })}</span>
                                        {isMe && (
                                            <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 'var(--radius-full)', background: 'rgba(220,38,38,0.1)', color: 'var(--color-primary-light)', fontWeight: 700 }}>{t({ de: 'Du', en: 'You', tr: 'Sen' })}</span>
                                        )}
                                        {member.userIsSuperAdmin && (
                                            <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 700 }}>Super-Admin</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {member.userEmail || t({ de: 'Keine E-Mail', en: 'No email', tr: 'E-posta yok' })}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                    <div style={statusDot(member.userStatus || 'offline')} />
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {member.userStatus === 'online' ? t({ de: 'Online', en: 'Online', tr: 'Çevrimiçi' }) : member.userStatus === 'away' ? t({ de: 'Abwesend', en: 'Away', tr: 'Uzakta' }) : t({ de: 'Offline', en: 'Offline', tr: 'Çevrimdışı' })}
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
                                        title={isProtectedSuperAdmin ? t({ de: 'Super-Admin-Rollen dürfen nur von Super-Admins angepasst werden.', en: 'Super admin roles can only be adjusted by super admins.', tr: 'Süper yönetici rolleri yalnızca süper yöneticiler tarafından değiştirilebilir.' }) : ''}
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
                                            onClick={() => handleRemoveMember(member.id, member.userName || t({ de: 'Mitglied', en: 'Member', tr: 'Üye' }))}
                                            title={isProtectedSuperAdmin ? t({ de: 'Super-Admin darf nicht von Projekt-Admins entfernt werden.', en: 'Super admin cannot be removed by project admins.', tr: 'Süper yönetici, proje yöneticileri tarafından kaldırılamaz.' }) : ''}
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
                {t({ de: 'Rollenänderungen erfordern in der Produktion eine Bestätigung per E-Mail. Projekt-Admins dürfen Super-Admin-Rechte nicht ändern.', en: 'Role changes require email confirmation in production. Project admins cannot change super admin privileges.', tr: 'Rol değişiklikleri üretimde e-posta onayı gerektirir. Proje yöneticileri süper yönetici yetkilerini değiştiremez.' })}
            </div>
            {(error || success) && (
                <div style={{ marginTop: '10px', fontSize: 'var(--font-size-xs)', color: error ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {error || success}
                </div>
            )}
        </div>
    );
}
