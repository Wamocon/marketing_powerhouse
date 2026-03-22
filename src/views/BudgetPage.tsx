import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Lock, X } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useLanguage } from '../context/LanguageContext';
import PageHelp from '../components/PageHelp';
import * as api from '../lib/api';

const CustomTooltip = ({ active, payload, label, locale }: any) => {
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
                        <span style={{ fontWeight: 600 }}>€{entry.value.toLocaleString(locale)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function BudgetPage() {
    const { can } = useAuth();
    const { language } = useLanguage();
    const isGerman = language === 'de';
    const locale = isGerman ? 'de-DE' : 'en-US';
    const { activeCompany } = useCompany();
    const { budgetData, refreshData } = useData();
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expenseCategory, setExpenseCategory] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseSaving, setExpenseSaving] = useState(false);
    if (!budgetData) return <div className="animate-in"><p>{isGerman ? 'Lade Budget-Daten...' : 'Loading budget data...'}</p></div>;
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

    // Access restriction for members
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
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{isGerman ? 'Kein Zugriff' : 'No Access'}</h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '360px', lineHeight: 1.6 }}>
                    {isGerman
                        ? 'Budget-Daten sind vertraulich und nur fuer Manager und Administratoren sichtbar. Wende dich an deinen Marketing Manager fuer Rueckfragen.'
                        : 'Budget data is confidential and only visible to managers and administrators. Contact your marketing manager for access questions.'}
                </p>
                <span style={{
                    padding: '4px 14px', borderRadius: 'var(--radius-full)',
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    fontSize: 'var(--font-size-xs)', fontWeight: 600,
                }}>
                    {isGerman ? 'Berechtigung erforderlich: Manager oder Admin' : 'Permission required: Manager or Admin'}
                </span>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Budget & Controlling</h1>
                    <p className="page-subtitle">{isGerman ? 'Gesamtuebersicht' : 'Overview'} - {new Date().getFullYear()}</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title={isGerman ? 'Budget & Controlling' : 'Budget & Controlling'}>
                        <p style={{ marginBottom: '12px' }}>{isGerman ? 'Behalte die volle Kontrolle ueber deine Investitionen. Dieses Modul ist das zentrale Controlling-Instrument.' : 'Keep full control over your investments. This module is your central controlling cockpit.'}</p>
                        <ul className="help-list">
                            <li><strong>{isGerman ? 'Entwicklungs-Charts:' : 'Trend charts:'}</strong> {isGerman ? 'Sieh genau, wann wie viel Budget eingesetzt wurde und welche Kategorien den groessten Anteil haben.' : 'See exactly when budget was spent and which categories take the biggest share.'}</li>
                            <li><strong>{isGerman ? 'Ausgaben erfassen:' : 'Track expenses:'}</strong> {isGerman ? 'Wenn nicht alle Plattformen per API verbunden sind, kannst du Ausgaben manuell erfassen.' : 'If not every platform is connected via API, you can log expenses manually.'}</li>
                            <li><strong>{isGerman ? 'Budget-Alerts:' : 'Budget alerts:'}</strong> {isGerman ? 'Ab 80% Auslastung erscheint eine Warnung, ab 100% ein dringender Alert.' : 'At 80% utilization the app raises a warning, at 100% an urgent alert.'}</li>
                            <li><strong>{isGerman ? 'Berechtigung:' : 'Permissions:'}</strong> {isGerman ? 'Nur Manager/Admins koennen diese Seite sehen.' : 'Only manager/admin roles can access this page.'}</li>
                        </ul>
                    </PageHelp>
                    <button className="btn btn-secondary" onClick={handleExport}>Export</button>
                    {can('canEditBudget') && (
                        <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
                            <Wallet size={16} /> {isGerman ? 'Ausgabe erfassen' : 'Add Expense'}
                        </button>
                    )}
                </div>
            </div>

            {/* Top Stats */}
            {showExpenseForm && (
                <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                    <div className="card-header">
                        <div className="card-title">{isGerman ? 'Neue Ausgabe erfassen' : 'Add New Expense'}</div>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowExpenseForm(false)}><X size={16} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end', marginTop: '12px' }}>
                        <div>
                            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{isGerman ? 'Kategorie' : 'Category'}</label>
                            <select className="form-select" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}>
                                <option value="">{isGerman ? 'Kategorie waehlen...' : 'Choose category...'}</option>
                                {budgetData.categories.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{isGerman ? 'Betrag (€)' : 'Amount (€)'}</label>
                            <input
                                className="form-input"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={isGerman ? 'z.B. 500' : 'e.g. 500'}
                                value={expenseAmount}
                                onChange={e => setExpenseAmount(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            disabled={!expenseCategory || !expenseAmount || expenseSaving}
                            onClick={async () => {
                                const cat = budgetData.categories.find(c => c.name === expenseCategory);
                                if (!cat || !cat.id) return;
                                const amount = parseFloat(expenseAmount);
                                if (isNaN(amount) || amount <= 0) return;
                                setExpenseSaving(true);
                                try {
                                    const newSpent = cat.spent + amount;
                                    await api.updateBudgetCategory(cat.id!, { spent: newSpent });
                                    const newTotalSpent = budgetData.spent + amount;
                                    await api.updateBudgetOverview({ spent: newTotalSpent, remaining: budgetData.total - newTotalSpent }, activeCompany!.id);
                                    await refreshData();
                                    setExpenseAmount('');
                                    setExpenseCategory('');
                                    setShowExpenseForm(false);
                                } catch (err) {
                                    console.error('Failed to save expense:', err);
                                } finally {
                                    setExpenseSaving(false);
                                }
                            }}
                        >
                            {expenseSaving ? (isGerman ? 'Speichere...' : 'Saving...') : (isGerman ? 'Erfassen' : 'Save')}
                        </button>
                    </div>
                </div>
            )}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card primary">
                    <div className="stat-card-header">
                        <span className="stat-card-label">{isGerman ? 'Gesamtbudget' : 'Total Budget'}</span>
                        <div className="stat-card-icon primary"><Wallet size={20} /></div>
                    </div>
                    <div className="stat-card-value">€{budgetData.total.toLocaleString(locale)}</div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{isGerman ? 'Saison 2026' : 'Season 2026'}</span>
                </div>
                <div className="stat-card success">
                    <div className="stat-card-header">
                        <span className="stat-card-label">{isGerman ? 'Ausgegeben' : 'Spent'}</span>
                        <div className="stat-card-icon success"><TrendingUp size={20} /></div>
                    </div>
                    <div className="stat-card-value">€{budgetData.spent.toLocaleString(locale)}</div>
                    <div className="stat-card-change positive">{isGerman ? `${percentSpent}% des Budgets` : `${percentSpent}% of budget`}</div>
                </div>
                <div className={`stat-card ${isOverBudget ? 'warning' : 'info'}`}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">{isGerman ? 'Verbleibend' : 'Remaining'}</span>
                        <div className={`stat-card-icon ${isOverBudget ? 'warning' : 'info'}`}>
                            {isOverBudget ? <AlertTriangle size={20} /> : <TrendingDown size={20} />}
                        </div>
                    </div>
                    <div className="stat-card-value">€{budgetData.remaining.toLocaleString(locale)}</div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{isGerman ? `${100 - percentSpent}% verbleibend` : `${100 - percentSpent}% remaining`}</span>
                </div>
            </div>

            {/* Charts */}
            <div className="content-grid-2">
                {/* Monthly Trend */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">{isGerman ? 'Monatlicher Vergleich' : 'Monthly Comparison'}</div>
                            <div className="card-subtitle">{isGerman ? 'Plan vs. tatsaechliche Ausgaben' : 'Planned vs. actual spend'}</div>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetData.monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                                <Tooltip content={<CustomTooltip locale={locale} />} />
                                <Bar dataKey="planned" name={isGerman ? 'Geplant' : 'Planned'} fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.4} />
                                <Bar dataKey="actual" name={isGerman ? 'Tatsaechlich' : 'Actual'} fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">{isGerman ? 'Verteilung nach Kategorie' : 'Category Breakdown'}</div>
                            <div className="card-subtitle">{isGerman ? 'Anteil der geplanten Ausgaben' : 'Share of planned spend'}</div>
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
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>€{cat.planned.toLocaleString(locale)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <div className="card-title">{isGerman ? 'Kategorien-Detail' : 'Category Details'}</div>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>{isGerman ? 'Kategorie' : 'Category'}</th>
                                <th>{isGerman ? 'Geplant' : 'Planned'}</th>
                                <th>{isGerman ? 'Ausgegeben' : 'Spent'}</th>
                                <th>{isGerman ? 'Verbleibend' : 'Remaining'}</th>
                                <th>{isGerman ? 'Auslastung' : 'Utilization'}</th>
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
                                        <td>€{cat.planned.toLocaleString(locale)}</td>
                                        <td style={{ fontWeight: 600 }}>€{cat.spent.toLocaleString(locale)}</td>
                                        <td>€{remaining.toLocaleString(locale)}</td>
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
                                                {pct > 80 ? (isGerman ? 'Kritisch' : 'Critical') : pct > 60 ? (isGerman ? 'Aufpassen' : 'Watch') : 'OK'}
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
