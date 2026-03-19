import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Lock, X } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import PageHelp from '../components/PageHelp';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: 'var(--font-size-xs)',
            }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
                {payload.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || entry.fill }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
                        <span style={{ fontWeight: 600 }}>€{entry.value.toLocaleString('de-DE')}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function BudgetPage() {
    const { can } = useAuth();
    const { budgetData } = useData();
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    if (!budgetData) return <div className="animate-in"><p>Lade Budget-Daten...</p></div>;
    const percentSpent = budgetData.total > 0 ? Math.round(budgetData.spent / budgetData.total * 100) : 0;
    const isOverBudget = percentSpent > 90;

    const handleExport = () => {
        const rows = [
            ['Kategorie', 'Geplant', 'Ausgegeben', 'Verbleibend', 'Auslastung %'],
            ...budgetData.categories.map(cat => [
                cat.name,
                cat.planned.toString(),
                cat.spent.toString(),
                (cat.planned - cat.spent).toString(),
                (cat.planned > 0 ? Math.round(cat.spent / cat.planned * 100) : 0).toString(),
            ]),
            [],
            ['Gesamt', budgetData.total.toString(), budgetData.spent.toString(), budgetData.remaining.toString(), percentSpent.toString()],
        ];
        const csv = rows.map(r => r.join(';')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Zugriffsbeschränkung für Members
    if (!can('canSeeBudget')) {
        return (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
                <div style={{
                    width: 72, height: 72, borderRadius: 'var(--radius-xl, 20px)',
                    background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginBottom: '8px',
                }}>
                    <Lock size={28} style={{ color: '#ef4444' }} />
                </div>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Kein Zugriff</h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '360px', lineHeight: 1.6 }}>
                    Budget-Daten sind vertraulich und nur für Manager und Administratoren sichtbar.
                    Wende dich an deinen Marketing Manager für Rückfragen.
                </p>
                <span style={{
                    padding: '4px 14px', borderRadius: 'var(--radius-full)',
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    fontSize: 'var(--font-size-xs)', fontWeight: 600,
                }}>
                    Berechtigung erforderlich: Manager oder Admin
                </span>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Budget & Controlling</h1>
                    <p className="page-subtitle">Gesamtübersicht Q1/Q2 2026</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Budget & Controlling">
                        <p style={{ marginBottom: '12px' }}>Behalte die volle Kontrolle über deine Investitionen. Dieses Modul ist das Haupt-Controlling-Instrumentarium.</p>
                        <ul className="help-list">
                            <li><strong>Entwicklungs-Charts:</strong> Sieh genau, wann du wie viel Budget eingesetzt hast und welche Kategorien (Ads, TV, Print) den größten Share haben.</li>
                            <li><strong>Ausgaben erfassen:</strong> Sollten nicht alle Plattformen per API-Schnittstelle angebunden sein, kannst du Rechnungen und laufende Abos (wie dein SEM-Budget) manuell verbuchen, um das Controlling 100% sauber zu halten.</li>
                            <li><strong>Berechtigung:</strong> Nur berechtige Rollen (Manager/Admins) können diese Seite einsehen, normale Mitarbeiter haben keine Einsicht in diese Datenstrukturen.</li>
                        </ul>
                    </PageHelp>
                    <button className="btn btn-secondary" onClick={handleExport}>Export</button>
                    {can('canEditBudget') && (
                        <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
                            <Wallet size={16} /> Ausgabe erfassen
                        </button>
                    )}
                </div>
            </div>

            {/* Top Stats */}
            {showExpenseForm && (
                <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                    <div className="card-header">
                        <div className="card-title">Neue Ausgabe erfassen</div>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowExpenseForm(false)}><X size={16} /></button>
                    </div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Feature wird in der nächsten Version mit API-Anbindung verfügbar sein.
                        Aktuell können Ausgaben direkt in der Supabase-Datenbank verwaltet werden.
                    </p>
                    <button className="btn btn-secondary" onClick={() => setShowExpenseForm(false)}>Schließen</button>
                </div>
            )}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card primary">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Gesamtbudget</span>
                        <div className="stat-card-icon primary"><Wallet size={20} /></div>
                    </div>
                    <div className="stat-card-value">€{budgetData.total.toLocaleString('de-DE')}</div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Saison 2026</span>
                </div>
                <div className="stat-card success">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Ausgegeben</span>
                        <div className="stat-card-icon success"><TrendingUp size={20} /></div>
                    </div>
                    <div className="stat-card-value">€{budgetData.spent.toLocaleString('de-DE')}</div>
                    <div className="stat-card-change positive">{percentSpent}% des Budgets</div>
                </div>
                <div className={`stat-card ${isOverBudget ? 'warning' : 'info'}`}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Verbleibend</span>
                        <div className={`stat-card-icon ${isOverBudget ? 'warning' : 'info'}`}>
                            {isOverBudget ? <AlertTriangle size={20} /> : <TrendingDown size={20} />}
                        </div>
                    </div>
                    <div className="stat-card-value">€{budgetData.remaining.toLocaleString('de-DE')}</div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{100 - percentSpent}% verbleibend</span>
                </div>
            </div>

            {/* Charts */}
            <div className="content-grid-2">
                {/* Monthly Trend */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Monatlicher Vergleich</div>
                            <div className="card-subtitle">Plan vs. tatsächliche Ausgaben</div>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetData.monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="planned" name="Geplant" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.4} />
                                <Bar dataKey="actual" name="Tatsächlich" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Verteilung nach Kategorie</div>
                            <div className="card-subtitle">Anteil der geplanten Ausgaben</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <div style={{ width: 200, height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={budgetData.categories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="planned"
                                        stroke="none"
                                    >
                                        {budgetData.categories.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1 }}>
                            {budgetData.categories.map((cat) => (
                                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 'var(--font-size-xs)', flex: 1, color: 'var(--text-secondary)' }}>{cat.name}</span>
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>€{cat.planned.toLocaleString('de-DE')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <div className="card-title">Kategorien-Detail</div>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kategorie</th>
                                <th>Geplant</th>
                                <th>Ausgegeben</th>
                                <th>Verbleibend</th>
                                <th>Auslastung</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgetData.categories.map((cat) => {
                                const pct = Math.round(cat.spent / cat.planned * 100);
                                const remaining = cat.planned - cat.spent;
                                return (
                                    <tr key={cat.name}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                                                <span style={{ fontWeight: 500 }}>{cat.name}</span>
                                            </div>
                                        </td>
                                        <td>€{cat.planned.toLocaleString('de-DE')}</td>
                                        <td style={{ fontWeight: 600 }}>€{cat.spent.toLocaleString('de-DE')}</td>
                                        <td>€{remaining.toLocaleString('de-DE')}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="progress-bar" style={{ flex: 1, maxWidth: '100px' }}>
                                                    <div
                                                        className={`progress-bar-fill ${pct > 80 ? 'danger' : pct > 60 ? 'warning' : 'success'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', minWidth: '35px' }}>{pct}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${pct > 80 ? 'badge-danger' : pct > 60 ? 'badge-warning' : 'badge-success'}`}>
                                                {pct > 80 ? 'Kritisch' : pct > 60 ? 'Aufpassen' : 'OK'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
