import { useEffect, useState } from 'react';
import {
    Settings, Users, Plug, Bell, Shield,
    Plus, Check, X, Lock, Trash2,
} from 'lucide-react';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';

import { AdminSettings } from '../components/SettingsAdmin';
const integrations = [
    { name: 'Google Analytics 4', status: 'connected', icon: '📊', desc: 'Website Traffic & Conversions' },
    { name: 'Google Ads', status: 'connected', icon: '🔍', desc: 'Suchmaschinenwerbung' },
    { name: 'Meta Business Suite', status: 'disconnected', icon: '📘', desc: 'Facebook & Instagram Ads' },
    { name: 'LinkedIn Ads', status: 'disconnected', icon: '💼', desc: 'B2B Werbung' },
    { name: 'Mailchimp', status: 'connected', icon: '📧', desc: 'E-Mail Marketing' },
    { name: 'Slack', status: 'connected', icon: '💬', desc: 'Team-Benachrichtigungen' },
    { name: 'HubSpot CRM', status: 'disconnected', icon: '🏢', desc: 'Kontakt-Synchronisierung' },
    { name: 'Zapier', status: 'disconnected', icon: '⚡', desc: 'Workflow-Automatisierung' },
];

const statusDot = (s: 'online' | 'away' | 'offline' | undefined) => ({
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
    background: s === 'online' ? 'var(--color-success)' : s === 'away' ? 'var(--color-warning)' : 'var(--text-tertiary)',
});

export default function SettingsPage() {
    const { can, currentUser, isSuperAdmin } = useAuth();
    const {
        activeCompany,
        companyMembers,
        updateCompany,
        updateMemberRole,
        removeMember,
    } = useCompany();
    const [activeTab, setActiveTab] = useState('general');
    const [wsName, setWsName] = useState('');
    const [wsDesc, setWsDesc] = useState('');
    const [savedMsg, setSavedMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        setWsName(activeCompany?.name ?? '');
        setWsDesc(activeCompany?.description ?? '');
        setSavedMsg('');
        setErrorMsg('');
    }, [activeCompany]);

    const handleSaveSettings = async () => {
        if (!activeCompany || !can('canManageSettings')) return;
        const trimmedName = wsName.trim();
        if (!trimmedName) {
            setErrorMsg('Bitte einen gueltigen Unternehmensnamen eingeben.');
            return;
        }
        try {
            setErrorMsg('');
            await updateCompany(activeCompany.id, {
                name: trimmedName,
                description: wsDesc.trim(),
                slug: trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            });
            setSavedMsg('Unternehmensdaten gespeichert.');
            setTimeout(() => setSavedMsg(''), 3000);
        } catch {
            setErrorMsg('Speichern fehlgeschlagen. Bitte erneut versuchen.');
        }
    };

    const handleDiscardSettings = () => {
        setWsName(activeCompany?.name ?? '');
        setWsDesc(activeCompany?.description ?? '');
        setErrorMsg('');
    };

    const handleRoleUpdate = async (memberId: string, role: 'company_admin' | 'manager' | 'member') => {
        try {
            setErrorMsg('');
            await updateMemberRole(memberId, role);
            setSavedMsg('Rolle aktualisiert.');
            setTimeout(() => setSavedMsg(''), 2500);
        } catch {
            setErrorMsg('Rolle konnte nicht geaendert werden.');
        }
    };

    const handleMemberRemove = async (memberId: string, memberName: string) => {
        if (!confirm(`${memberName} wirklich aus dem Unternehmen entfernen?`)) return;
        try {
            setErrorMsg('');
            await removeMember(memberId);
            setSavedMsg('Mitglied entfernt.');
            setTimeout(() => setSavedMsg(''), 2500);
        } catch {
            setErrorMsg('Mitglied konnte nicht entfernt werden.');
        }
    };

    const tabs = [
        { id: 'general', label: 'Allgemein', icon: Settings },
        { id: 'team', label: 'Team-Übersicht', icon: Users },
        { id: 'integrations', label: 'Integrationen', icon: Plug },
        { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
        ...(can('canManageUsers') ? [{ id: 'admin', label: 'Benutzerverwaltung', icon: Shield, adminOnly: true }] : []),
    ];

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Einstellungen</h1>
                    <p className="page-subtitle">Workspace- und Kontoeinstellungen verwalten</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
                {/* Settings Sidebar */}
                <div style={{ width: '240px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={tab.adminOnly ? { borderLeft: '2px solid rgba(239,68,68,0.6)' } : {}}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                    {tab.adminOnly && (
                                        <span style={{
                                            marginLeft: 'auto', fontSize: '0.58rem', padding: '1px 5px',
                                            borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.12)',
                                            color: '#ef4444', fontWeight: 700, textTransform: 'uppercase',
                                        }}>Admin</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Settings Content */}
                <div style={{ flex: 1 }}>

                    {/* ─── Allgemein ─── */}
                    {activeTab === 'general' && (
                        <div className="card animate-in">
                            <div className="card-header">
                                <div className="card-title">Unternehmens-Einstellungen</div>
                                {(!can('canManageSettings') || !activeCompany) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        <Lock size={11} /> {!activeCompany ? 'Kein Unternehmen ausgewaehlt' : 'Nur-Lese-Modus'}
                                    </div>
                                )}
                            </div>
                            {activeCompany && (
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '12px',
                                }}>
                                    Aktives Unternehmen: {activeCompany.name}
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Unternehmensname (Workspace-Name)</label>
                                <input type="text" className="form-input" value={wsName} onChange={e => setWsName(e.target.value)} disabled={!can('canManageSettings') || !activeCompany} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Beschreibung</label>
                                <textarea className="form-input form-textarea" value={wsDesc} onChange={e => setWsDesc(e.target.value)} disabled={!can('canManageSettings') || !activeCompany} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Standard-Währung</label>
                                <select className="form-select" disabled={!can('canManageSettings') || !activeCompany}>
                                    <option>EUR (€)</option><option>USD ($)</option><option>CHF (CHF)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Zeitzone</label>
                                <select className="form-select" disabled={!can('canManageSettings') || !activeCompany}>
                                    <option>Europe/Berlin (UTC+1)</option>
                                    <option>Europe/Zurich (UTC+1)</option>
                                    <option>Europe/Vienna (UTC+1)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sprache</label>
                                <select className="form-select" disabled={!can('canManageSettings') || !activeCompany}>
                                    <option>Deutsch</option><option>English</option>
                                </select>
                            </div>
                            {(savedMsg || errorMsg) && (
                                <div style={{ fontSize: 'var(--font-size-xs)', marginTop: '8px', color: errorMsg ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                    {errorMsg || savedMsg}
                                </div>
                            )}
                            {can('canManageSettings') && activeCompany && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px', alignItems: 'center' }}>
                                    {savedMsg && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', marginRight: 'auto' }}><Check size={14} /> {savedMsg}</span>}
                                    <button className="btn btn-secondary" onClick={handleDiscardSettings}>Verwerfen</button>
                                    <button className="btn btn-primary" onClick={handleSaveSettings}>Speichern</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Team-Übersicht ─── */}
                    {activeTab === 'team' && (
                        <div className="card animate-in">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Team-Mitglieder</div>
                                    <div className="card-subtitle">{companyMembers.length} Mitglieder im aktiven Unternehmen</div>
                                </div>
                                {can('canManageUsers') && (
                                    <button className="btn btn-primary btn-sm" onClick={() => alert('Einladungsfunktion wird in der nächsten Version verfügbar sein.')}><Plus size={14} /> Einladen</button>
                                )}
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Mitglied</th>
                                            <th>Rolle</th>
                                            <th>Status</th>
                                            {can('canManageUsers') && <th>Aktionen</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companyMembers.map(member => {
                                            const cfg = ROLE_CONFIG[member.role];
                                            const isMe = member.userId === currentUser?.id;
                                            const isProtectedSuperAdmin = member.userIsSuperAdmin && !isSuperAdmin;
                                            return (
                                            <tr key={member.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: 'var(--radius-full)',
                                                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: 'var(--font-size-xs)', color: 'white', fontWeight: 600,
                                                        }}>
                                                            {member.userAvatar || member.userName?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                {member.userName || 'Unbekannt'}
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
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: cfg.bgColor,
                                                        color: cfg.color,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                    }}>
                                                        {cfg.shortLabel}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={statusDot(member.userStatus)} />
                                                        <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'capitalize' }}>
                                                            {member.userStatus === 'online' ? 'Online' : member.userStatus === 'away' ? 'Abwesend' : 'Offline'}
                                                        </span>
                                                    </div>
                                                </td>
                                                {can('canManageUsers') && (
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <select
                                                                value={member.role}
                                                                onChange={e => handleRoleUpdate(member.id, e.target.value as 'company_admin' | 'manager' | 'member')}
                                                                disabled={isMe || isProtectedSuperAdmin}
                                                                className="form-select"
                                                                style={{ minWidth: '125px' }}
                                                                title={isProtectedSuperAdmin ? 'Super-Admin Rollen duerfen nur von Super-Admins angepasst werden.' : ''}
                                                            >
                                                                <option value="company_admin">Admin</option>
                                                                <option value="manager">Manager</option>
                                                                <option value="member">Member</option>
                                                            </select>
                                                            {!isMe && (
                                                                <button
                                                                    className="btn btn-ghost btn-sm"
                                                                    style={{ color: 'var(--color-danger)' }}
                                                                    disabled={isProtectedSuperAdmin}
                                                                    onClick={() => handleMemberRemove(member.id, member.userName || 'Mitglied')}
                                                                    title={isProtectedSuperAdmin ? 'Super-Admin darf nicht von Unternehmens-Admins entfernt werden.' : ''}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ─── Integrationen ─── */}
                    {activeTab === 'integrations' && (
                        <div className="animate-in">
                            <div className="card" style={{ marginBottom: '16px' }}>
                                <div className="card-header">
                                    <div>
                                        <div className="card-title">Integrationen</div>
                                        <div className="card-subtitle">Verbinde deine Marketing-Tools</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                                {integrations.map(integration => (
                                    <div key={integration.name} className="card" style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                                background: 'var(--bg-elevated)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                                            }}>
                                                {integration.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{integration.name}</span>
                                                    {integration.status === 'connected' ? (
                                                        <span className="badge badge-success"><Check size={10} /> Verbunden</span>
                                                    ) : (
                                                        <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}>Nicht verbunden</span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    {integration.desc}
                                                </p>
                                                <button className={`btn btn-sm ${integration.status === 'connected' ? 'btn-secondary' : 'btn-primary'}`} style={{ marginTop: '8px' }}>
                                                    {integration.status === 'connected' ? 'Konfigurieren' : 'Verbinden'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── Benachrichtigungen ─── */}
                    {activeTab === 'notifications' && (
                        <div className="card animate-in">
                            <div className="card-header">
                                <div className="card-title">Benachrichtigungs-Einstellungen</div>
                            </div>
                            {[
                                { title: 'Kampagnen-Updates', desc: 'Benachrichtigung bei Statusänderungen', enabled: true },
                                { title: 'Budget-Alerts', desc: 'Warnung bei Budgetüberschreitung (80%)', enabled: true },
                                { title: 'Aufgaben-Erinnerungen', desc: 'Erinnerung 24h vor Deadline', enabled: true },
                                { title: 'Team-Aktivitäten', desc: 'Neue Kommentare und Freigaben', enabled: false },
                                { title: 'Wöchentlicher Report', desc: 'Zusammenfassung per E-Mail', enabled: true },
                                { title: 'KPI-Anomalien', desc: 'Benachrichtigung bei ungewöhnlichen KPI-Werten', enabled: false },
                            ].map((setting, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 0', borderBottom: idx < 5 ? '1px solid var(--border-color)' : 'none',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{setting.title}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>{setting.desc}</div>
                                    </div>
                                    <button style={{
                                        width: '44px', height: '24px', borderRadius: 'var(--radius-full)',
                                        background: setting.enabled ? 'var(--color-primary)' : 'var(--bg-elevated)',
                                        border: `1px solid ${setting.enabled ? 'var(--color-primary)' : 'var(--border-color-strong)'}`,
                                        position: 'relative', cursor: 'pointer', transition: 'all var(--transition-fast)',
                                    }}>
                                        <div style={{
                                            width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                                            position: 'absolute', top: '2px',
                                            left: setting.enabled ? '22px' : '2px', transition: 'left var(--transition-fast)',
                                        }} />
                                    </button>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                                <button className="btn btn-primary">Einstellungen speichern</button>
                            </div>
                        </div>
                    )}


                    {/* ─── Admin: Benutzerverwaltung ─── */}
                    {activeTab === 'admin' && can('canManageUsers') && (
                        <AdminSettings currentUser={currentUser} statusDot={statusDot} />
                    )}
                </div>
            </div>
        </div>
    );
}
