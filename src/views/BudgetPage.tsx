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
    const { t, locale } = useLanguage();
    const { activeCompany } = useCompany();
    const { budgetData, refreshData } = useData();
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expenseCategory, setExpenseCategory] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseSaving, setExpenseSaving] = useState(false);
    if (!budgetData) return <div className="animate-in"><p>{t({ de: 'Lade Budget-Daten...', en: 'Loading budget data...', tr: 'Bütçe verileri yükleniyor...' })}</p></div>;
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
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{t({ de: 'Kein Zugriff', en: 'No Access', tr: 'Erişim Yok' })}</h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '360px', lineHeight: 1.6 }}>
                    {t({
                        de: 'Budget-Daten sind vertraulich und nur für Manager und Administratoren sichtbar. Wende dich an deinen Marketing Manager für Rückfragen.',
                        en: 'Budget data is confidential and only visible to managers and administrators. Contact your marketing manager for access questions.',
                        tr: 'Bütçe verileri gizlidir ve yalnızca yöneticiler tarafından görüntülenebilir. Erişim soruları için pazarlama yöneticinize başvurun.',
                    })}
                </p>
                <span style={{
                    padding: '4px 14px', borderRadius: 'var(--radius-full)',
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    fontSize: 'var(--font-size-xs)', fontWeight: 600,
                }}>
                    {t({ de: 'Berechtigung erforderlich: Manager oder Admin', en: 'Permission required: Manager or Admin', tr: 'Yetki gerekli: Yönetici veya Admin' })}
                </span>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Budget & Controlling</h1>
                    <p className="page-subtitle">{t({ de: 'Gesamtübersicht', en: 'Overview', tr: 'Genel Bakış' })} - {new Date().getFullYear()}</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Budget & Controlling">
                        <p style={{ marginBottom: '12px' }}>{t({ de: 'Behalte die volle Kontrolle über deine Investitionen. Dieses Modul ist das zentrale Controlling-Instrument.', en: 'Keep full control over your investments. This module is your central controlling cockpit.', tr: 'Yatırımlarınız üzerinde tam kontrol sağlayın. Bu modül merkezi kontrol aracınızdır.' })}</p>
                        <ul className="help-list">
                            <li><strong>{t({ de: 'Entwicklungs-Charts:', en: 'Trend charts:', tr: 'Trend grafikleri:' })}</strong> {t({ de: 'Sieh genau, wann wie viel Budget eingesetzt wurde und welche Kategorien den größten Anteil haben.', en: 'See exactly when budget was spent and which categories take the biggest share.', tr: 'Bütçenin ne zaman harcandığını ve hangi kategorilerin en büyük paya sahip olduğunu görün.' })}</li>
                            <li><strong>{t({ de: 'Ausgaben erfassen:', en: 'Track expenses:', tr: 'Harcama kaydet:' })}</strong> {t({ de: 'Wenn nicht alle Plattformen per API verbunden sind, kannst du Ausgaben manuell erfassen.', en: 'If not every platform is connected via API, you can log expenses manually.', tr: 'Tüm platformlar API ile bağlı değilse harcamaları manuel olarak kaydedebilirsiniz.' })}</li>
                            <li><strong>{t({ de: 'Budget-Alerts:', en: 'Budget alerts:', tr: 'Bütçe uyarıları:' })}</strong> {t({ de: 'Ab 80% Auslastung erscheint eine Warnung, ab 100% ein dringender Alert.', en: 'At 80% utilization the app raises a warning, at 100% an urgent alert.', tr: '%80 kullanımda uyarı, %100 kullanımda acil alarm verilir.' })}</li>
                            <li><strong>{t({ de: 'Berechtigung:', en: 'Permissions:', tr: 'Yetki:' })}</strong> {t({ de: 'Nur Manager/Admins können diese Seite sehen.', en: 'Only manager/admin roles can access this page.', tr: 'Bu sayfayı yalnızca yöneticiler/adminler görebilir.' })}</li>
                        </ul>
                    </PageHelp>
                    <button className="btn btn-secondary" onClick={handleExport}>Export</button>
                    {can('canEditBudget') && (
                        <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
                            <Wallet size={16} /> {t({ de: 'Ausgabe erfassen', en: 'Add Expense', tr: 'Harcama Ekle' })}
                        </button>
                    )}
                </div>
            </div>

            {/* Top Stats */}
            {showExpenseForm && (
                <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                    <div className="card-header">
                        <div className="card-title">{t({ de: 'Neue Ausgabe erfassen', en: 'Add New Expense', tr: 'Yeni Harcama Ekle' })}</div>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowExpenseForm(false)}><X size={16} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end', marginTop: '12px' }}>
                        <div>
                            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{t({ de: 'Kategorie', en: 'Category', tr: 'Kategori' })}</label>
                            <select className="form-select" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}>
                                <option value="">{t({ de: 'Kategorie wählen...', en: 'Choose category...', tr: 'Kategori seçin...' })}</option>
                                {budgetData.categories.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{t({ de: 'Betrag (€)', en: 'Amount (€)', tr: 'Tutar (€)' })}</label>
                            <input
                                className="form-input"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={t({ de: 'z.B. 500', en: 'e.g. 500', tr: 'örn. 500' })}
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
                            {expenseSaving ? t({ de: 'Speichere...', en: 'Saving...', tr: 'Kaydediliyor...' }) : t({ de: 'Erfassen', en: 'Save', tr: 'Kaydet' })}
                        </button>
                    </div>
                </div>
            )}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card primary">
                    <div className="stat-card-header">
                        <span className="stat-card-label">{t({ de: 'Gesamtbudget', en: 'Total Budget', tr: 'Toplam Bütçe' })}</span>
                        <div className="stat-card-icon primary"><Wallet size={20} /></div>
                    </div>
                    <div className="stat-card-value">€{budgetData.total.toLocaleString(locale)}</div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{t({ de: 'Saison 2026', en: 'Season 2026', tr: 'Sezon 2026' })}</span>
                </div>
                <div className="stat-card success">
                    <div className="stat-card-header">
                        <span className="stat-card-label">{t({ de: 'Ausgegeben', en: 'Spent', tr: 'Harcanan' })}</span>
                        <div className="stat-card-icon success"><TrendingUp size={20} /></div>
                    </div>
                    <div className="stat-card-value">€{budgetData.spent.toLocaleString(locale)}</div>
                    <div className="stat-card-change positive">{t({ de: `${percentSpent}% des Budgets`, en: `${percentSpent}% of budget`, tr: `Bütçenin %${percentSpent}'i` })}</div>
                </div>
                <div className={`stat-card ${isOverBudget ? 'warning' : 'info'}`}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">{t({ de: 'Verbleibend', en: 'Remaining', tr: 'Kalan' })}</span>
                        <div className={`stat-card-icon ${isOverBudget ? 'warning' : 'info'}`}>
                            {isOverBudget ? <AlertTriangle size={20} /> : <TrendingDown size={20} />}
                        </div>
                    </div>
                    <div className="stat-card-value">€{budgetData.remaining.toLocaleString(locale)}</div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{t({ de: `${100 - percentSpent}% verbleibend`, en: `${100 - percentSpent}% remaining`, tr: `%${100 - percentSpent} kalan` })}</span>
                </div>
            </div>

            {/* Charts */}
            <div className="content-grid-2">
                {/* Monthly Trend */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">{t({ de: 'Monatlicher Vergleich', en: 'Monthly Comparison', tr: 'Aylık Karşılaştırma' })}</div>
                            <div className="card-subtitle">{t({ de: 'Plan vs. tatsächliche Ausgaben', en: 'Planned vs. actual spend', tr: 'Planlanan ve gerçekleşen harcamalar' })}</div>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetData.monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                                <Tooltip content={<CustomTooltip locale={locale} />} />
                                <Bar dataKey="planned" name={t({ de: 'Geplant', en: 'Planned', tr: 'Planlanan' })} fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.4} />
                                <Bar dataKey="actual" name={t({ de: 'Tatsächlich', en: 'Actual', tr: 'Gerçekleşen' })} fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">{t({ de: 'Verteilung nach Kategorie', en: 'Category Breakdown', tr: 'Kategoriye Göre Dağılım' })}</div>
                            <div className="card-subtitle">{t({ de: 'Anteil der geplanten Ausgaben', en: 'Share of planned spend', tr: 'Planlanan harcamaların payı' })}</div>
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
                    <div className="card-title">{t({ de: 'Kategorien-Detail', en: 'Category Details', tr: 'Kategori Detayları' })}</div>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>{t({ de: 'Kategorie', en: 'Category', tr: 'Kategori' })}</th>
                                <th>{t({ de: 'Geplant', en: 'Planned', tr: 'Planlanan' })}</th>
                                <th>{t({ de: 'Ausgegeben', en: 'Spent', tr: 'Harcanan' })}</th>
                                <th>{t({ de: 'Verbleibend', en: 'Remaining', tr: 'Kalan' })}</th>
                                <th>{t({ de: 'Auslastung', en: 'Utilization', tr: 'Kullanım' })}</th>
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
                                                {pct > 80 ? t({ de: 'Kritisch', en: 'Critical', tr: 'Kritik' }) : pct > 60 ? t({ de: 'Aufpassen', en: 'Watch', tr: 'Dikkat' }) : 'OK'}
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
