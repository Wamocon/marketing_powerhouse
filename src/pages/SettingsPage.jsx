import { useState } from 'react';
import {
    Settings, Users, Plug, Bell, Shield,
    Plus, Check, X, Lock, UserCheck, Trash2,
} from 'lucide-react';
import { teamMembers, testUsers } from '../data/mockData';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';

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

const statusDot = (s) => ({
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
    background: s === 'online' ? 'var(--color-success)' : s === 'away' ? 'var(--color-warning)' : 'var(--text-tertiary)',
});

export default function SettingsPage() {
    const { can, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

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
                                <div className="card-title">Workspace-Einstellungen</div>
                                {!can('canManageSettings') && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        <Lock size={11} /> Nur-Lese-Modus
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Workspace-Name</label>
                                <input type="text" className="form-input" defaultValue="Marketing Powerhouse GmbH" disabled={!can('canManageSettings')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Beschreibung</label>
                                <textarea className="form-input form-textarea" defaultValue="Zentraler Workspace für alle Marketing-Aktivitäten unseres Teams." disabled={!can('canManageSettings')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Standard-Währung</label>
                                <select className="form-select" disabled={!can('canManageSettings')}>
                                    <option>EUR (€)</option><option>USD ($)</option><option>CHF (CHF)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Zeitzone</label>
                                <select className="form-select" disabled={!can('canManageSettings')}>
                                    <option>Europe/Berlin (UTC+1)</option>
                                    <option>Europe/Zurich (UTC+1)</option>
                                    <option>Europe/Vienna (UTC+1)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sprache</label>
                                <select className="form-select" disabled={!can('canManageSettings')}>
                                    <option>Deutsch</option><option>English</option>
                                </select>
                            </div>
                            {can('canManageSettings') && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                                    <button className="btn btn-secondary">Verwerfen</button>
                                    <button className="btn btn-primary">Speichern</button>
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
                                    <div className="card-subtitle">{teamMembers.length} Mitglieder</div>
                                </div>
                                {can('canManageUsers') && (
                                    <button className="btn btn-primary btn-sm"><Plus size={14} /> Einladen</button>
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
                                        {teamMembers.map(member => (
                                            <tr key={member.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: 'var(--radius-full)',
                                                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: 'var(--font-size-xs)', color: 'white', fontWeight: 600,
                                                        }}>
                                                            {member.avatar}
                                                        </div>
                                                        <span style={{ fontWeight: 500 }}>{member.name}</span>
                                                    </div>
                                                </td>
                                                <td>{member.role}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={statusDot(member.status)} />
                                                        <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'capitalize' }}>
                                                            {member.status === 'online' ? 'Online' : member.status === 'away' ? 'Abwesend' : 'Offline'}
                                                        </span>
                                                    </div>
                                                </td>
                                                {can('canManageUsers') && (
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <button className="btn btn-ghost btn-sm">Bearbeiten</button>
                                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}>Entfernen</button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
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
                                    const cfg = ROLE_CONFIG[user.role];
                                    const isMe = user.id === currentUser?.id;
                                    return (
                                        <div key={user.id} className="card" style={{ padding: '16px', borderLeft: `3px solid ${cfg.color}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                {/* Avatar */}
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0,
                                                    background: cfg.bgColor, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontWeight: 700, color: cfg.color,
                                                    fontSize: 'var(--font-size-xs)',
                                                }}>
                                                    {user.avatar}
                                                </div>
                                                {/* Info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{user.name}</span>
                                                        {isMe && (
                                                            <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)', fontWeight: 700 }}>Du</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                        {user.email} · {user.jobTitle} · {user.department}
                                                    </div>
                                                </div>
                                                {/* Status */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                    <div style={statusDot(user.status)} />
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                        {user.status === 'online' ? 'Online' : user.status === 'away' ? 'Abwesend' : 'Offline'}
                                                    </span>
                                                </div>
                                                {/* Rolle */}
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                                    background: cfg.bgColor, color: cfg.color,
                                                    fontSize: '0.6875rem', fontWeight: 700,
                                                }}>
                                                    {cfg.shortLabel}
                                                </span>
                                                {/* Aktionen */}
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

                            <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Shield size={11} style={{ color: '#ef4444', flexShrink: 0 }} />
                                Rollenänderungen erfordern in der Produktion eine Bestätigung per E-Mail. Änderungen an deinem eigenen Account sind nicht möglich.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
