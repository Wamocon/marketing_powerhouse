import { useState, useEffect } from 'react';
import { useProjectRouter } from '../hooks/useProjectRouter';
import {
    Building2, Target, Megaphone, Globe,
    Lock, Plus, X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PageHelp from '../components/PageHelp';
import { SectionHeader, Field, CommsContent } from '../components/PositioningComponents';

export default function PositioningPage() {
    const { can } = useAuth();
    const { t } = useLanguage();
    const router = useProjectRouter();
    const { positioning, companyKeywords, savePositioning, addKeyword, deleteKeyword } = useData();
    const [pos, setPos] = useState(positioning);
    const [editSection, setEditSection] = useState<string | null>(null);
    const [newKeywordTerm, setNewKeywordTerm] = useState('');
    const [newKeywordCategory, setNewKeywordCategory] = useState('');
    const [openSections, setOpenSections] = useState({
        dna: true, identity: true, comms: true, keywords: true, market: true,
    });

    useEffect(() => { if (positioning) setTimeout(() => setPos(positioning), 0); }, [positioning]);

    if (!pos) return <div className="animate-in"><p>{t({ de: 'Lade Positionierung...', en: 'Loading positioning...', tr: 'Konumlandırma yükleniyor...' })}</p></div>;

    const canEdit = can('canEditPositioning');

    const toggleSection = (key: string) =>
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    const handleEdit = (id: string) => {
        setEditSection(id);
        setOpenSections(prev => ({ ...prev, [id]: true }));
    };
    const handleSave = () => {
        savePositioning(pos);
        setEditSection(null);
    };
    const handleCancel = () => setEditSection(null);

    const sectionProps = {
        canEdit,
        editSection,
        openSections,
        onToggle: toggleSection,
        onEdit: handleEdit,
        onSave: handleSave,
        onCancel: handleCancel,
    };

    return (
        <div className="animate-in">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">{t({ de: 'Digitale Positionierung', en: 'Digital Positioning', tr: 'Dijital Konumlandırma' })}</h1>
                    <p className="page-subtitle">
                        {t({
                            de: 'Projektidentität, Markenwerte und Kommunikations-DNA - die Grundlage all eurer Kampagnen.',
                            en: 'Project identity, brand values and communication DNA - the foundation of all your campaigns.',
                            tr: 'Proje kimliği, marka değerleri ve iletişim DNA\'sı - tüm kampanyalarınızın temeli.'
                        })}
                    </p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title={t({ de: 'Digitale Positionierung', en: 'Digital Positioning', tr: 'Dijital Konumlandırma' })}>
                        <p style={{ marginBottom: '12px' }}>{t({
                            de: 'Dieses Modul ist das Gehirn eurer Marke. Es dient als "Single Source of Truth", an der sich alle Kampagnen, Creatives und KI-Assistenten messen lassen.',
                            en: 'This module is the brain of your brand. It serves as the "Single Source of Truth" against which all campaigns, creatives and AI assistants are measured.',
                            tr: 'Bu modül markanızın beynidir. Tüm kampanyaların, kreatif içeriklerin ve yapay zeka asistanlarının ölçüldüğü "Tek Doğru Kaynak" olarak hizmet eder.'
                        })}</p>
                        <ul className="help-list">
                            <li><strong>{t({ de: 'Projekt-DNA:', en: 'Project DNA:', tr: 'Proje DNA\'sı:' })}</strong> {t({ de: 'Die harten Fakten zu Eurem Business.', en: 'The hard facts about your business.', tr: 'İşinizle ilgili somut gerçekler.' })}</li>
                            <li><strong>{t({ de: 'Vision, Mission & Werte:', en: 'Vision, Mission & Values:', tr: 'Vizyon, Misyon & Değerler:' })}</strong> {t({ de: 'Das "Warum". Dies gibt später allen Copywritern die Vorlage, wie der Benefit beim Kunden ankommen muss.', en: 'The "Why". This gives all copywriters the template for how the benefit must reach the customer.', tr: '"Neden" sorusunun cevabı. Bu, tüm metin yazarlarına faydanın müşteriye nasıl ulaşması gerektiğinin şablonunu verir.' })}</li>
                            <li><strong>{t({ de: 'Tone of Voice:', en: 'Tone of Voice:', tr: 'Ses Tonu:' })}</strong> {t({ de: 'Diese Parameter (Dos & Don\'ts) ziehen sich die angeschlossenen KI-Modelle tief in ihre Prompts. Definiere die Sprache hier sehr exakt.', en: 'These parameters (Dos & Don\'ts) are deeply integrated into the connected AI models\' prompts. Define the language here very precisely.', tr: 'Bu parametreler (Yapılması ve Yapılmaması Gerekenler) bağlı yapay zeka modellerinin istemlerine derinlemesine entegre edilir. Dili burada çok kesin tanımlayın.' })}</li>
                            <li><strong>{t({ de: 'Schlüsselbegriffe:', en: 'Keywords:', tr: 'Anahtar Kelimeler:' })}</strong> {t({ de: 'Wenn es Wörter gibt, die ihr konsequent besetzen wollt (SEO relevant) kommen sie hier rein.', en: 'If there are words you want to consistently occupy (SEO relevant), they go here.', tr: 'Tutarlı bir şekilde sahiplenmek istediğiniz kelimeler (SEO ile ilgili) varsa, buraya ekleyin.' })}</li>
                            <li><strong>{t({ de: 'Admin Only:', en: 'Admin Only:', tr: 'Yalnızca Yönetici:' })}</strong> {t({ de: 'Die Pflege dieses Kernmoduls ist nur Administratoren mit der entsprechenden Berechtigung vorbehalten.', en: 'Maintaining this core module is reserved for administrators with the appropriate permissions.', tr: 'Bu çekirdek modülün bakımı yalnızca uygun izinlere sahip yöneticilere ayrılmıştır.' })}</li>
                        </ul>
                    </PageHelp>
                    {!canEdit && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', background: 'var(--bg-elevated)',
                            borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)',
                        }}>
                            <Lock size={12} /> {t({ de: 'Nur-Lese-Modus (Admin erforderlich)', en: 'Read-only mode (Admin required)', tr: 'Salt okunur mod (Yönetici gerekli)' })}
                        </div>
                    )}
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        {t({ de: 'Zuletzt aktualisiert:', en: 'Last updated:', tr: 'Son güncelleme:' })} {pos.lastUpdated} · {pos.updatedBy}
                    </div>
                </div>
            </div>

            {/* ─── BLOCK 1: Projekt-DNA ─── */}
            <SectionHeader id="dna" title={t({ de: 'Projekt-DNA', en: 'Project DNA', tr: 'Proje DNA\'sı' })} icon={Building2} {...sectionProps}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {[
                        { label: t({ de: 'Projektname', en: 'Project Name', tr: 'Proje Adı' }), value: pos.name, key: 'name' },
                        { label: 'Tagline', value: pos.tagline, key: 'tagline' },
                        { label: t({ de: 'Gegründet', en: 'Founded', tr: 'Kuruluş' }), value: pos.founded, key: 'founded' },
                        { label: t({ de: 'Branche', en: 'Industry', tr: 'Sektör' }), value: pos.industry, key: 'industry' },
                        { label: t({ de: 'Hauptsitz', en: 'Headquarters', tr: 'Genel Merkez' }), value: pos.headquarters, key: 'headquarters' },
                        { label: t({ de: 'Rechtsform', en: 'Legal Form', tr: 'Hukuki Biçim' }), value: pos.legalForm, key: 'legalForm' },
                        { label: t({ de: 'Mitarbeiter', en: 'Employees', tr: 'Çalışanlar' }), value: pos.employees, key: 'employees' },
                        { label: 'Website', value: pos.website, key: 'website' },
                    ].map(f => (
                        <div key={f.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                {f.label}
                            </div>
                            {editSection === 'dna' ? (
                                <input type="text" className="form-input" value={f.value}
                                    onChange={e => setPos({ ...pos, [f.key]: e.target.value })}
                                    style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px' }} />
                            ) : (
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{f.value}</div>
                            )}
                        </div>
                    ))}
                </div>
            </SectionHeader>

            {/* ─── BLOCK 2: Digitale Identität ─── */}
            <SectionHeader id="identity" title={t({ de: 'Digitale Identität - Vision, Mission & Werte', en: 'Digital Identity - Vision, Mission & Values', tr: 'Dijital Kimlik - Vizyon, Misyon & Değerler' })} icon={Target} {...sectionProps}>
                {/* Vision & Mission */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: t({ de: '🔭 Vision', en: '🔭 Vision', tr: '🔭 Vizyon' }), value: pos.vision, field: 'vision' },
                        { label: t({ de: '🎯 Mission', en: '🎯 Mission', tr: '🎯 Misyon' }), value: pos.mission, field: 'mission' },
                    ].map(f => (
                        <div key={f.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                                {f.label}
                            </div>
                            {editSection === 'identity' ? (
                                <textarea className="form-input form-textarea" value={f.value}
                                    onChange={e => setPos({ ...pos, [f.field]: e.target.value })}
                                    style={{ minHeight: '100px', fontSize: 'var(--font-size-xs)' }} />
                            ) : (
                                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 }}>{f.value}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Werte */}
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                    ❤️ {t({ de: 'Projektwerte', en: 'Project Values', tr: 'Proje Değerleri' })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {pos.values.map(value => (
                        <div key={value.id} style={{
                            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
                            padding: '16px', borderLeft: '3px solid var(--color-primary)',
                            transition: 'transform 0.2s ease',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '20px' }}>{value.icon}</span>
                                {editSection === 'identity' ? (
                                    <input type="text" className="form-input" value={value.title}
                                        onChange={e => setPos({ ...pos, values: pos.values.map(v => v.id === value.id ? { ...v, title: e.target.value } : v) })}
                                        style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, padding: '4px 8px' }} />
                                ) : (
                                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{value.title}</span>
                                )}
                            </div>
                            {editSection === 'identity' ? (
                                <textarea className="form-input form-textarea" value={value.description}
                                    onChange={e => setPos({ ...pos, values: pos.values.map(v => v.id === value.id ? { ...v, description: e.target.value } : v) })}
                                    style={{ fontSize: 'var(--font-size-xs)', minHeight: '60px' }} />
                            ) : (
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                    {value.description}
                                </p>
                            )}
                        </div>
                    ))}
                    {editSection === 'identity' && canEdit && (
                        <div style={{
                            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
                            padding: '16px', border: '1px dashed var(--border-color-strong)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Plus size={14} /> {t({ de: 'Wert hinzufügen', en: 'Add value', tr: 'Değer ekle' })}
                            </span>
                        </div>
                    )}
                </div>
            </SectionHeader>

            {/* ─── BLOCK 3: Kommunikations-DNA ─── */}
            <SectionHeader id="comms" title={t({ de: 'Kommunikations-DNA - Tone of Voice & Sprache', en: 'Communication DNA - Tone of Voice & Language', tr: 'İletişim DNA\'sı - Ses Tonu & Dil' })} icon={Megaphone} {...sectionProps}>
                <CommsContent pos={pos} editSection={editSection} />
            </SectionHeader>

            {/* ─── BLOCK 4: Schlüsselbegriffe ─── */}
            <SectionHeader id="keywords" title={t({ de: 'Projektweite Schlüsselbegriffe', en: 'Project-wide Keywords', tr: 'Proje Genelinde Anahtar Kelimeler' })} icon="🔑" {...sectionProps}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {companyKeywords.map(kw => (
                        <div key={kw.id} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: 'var(--radius-full)',
                            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
                            fontSize: 'var(--font-size-xs)',
                        }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{kw.term}</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>{kw.category}</span>
                            {editSection === 'keywords' && canEdit && (
                                <button onClick={() => deleteKeyword(kw.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }}>
                                    <X size={10} />
                                </button>
                            )}
                        </div>
                    ))}
                    {editSection === 'keywords' && canEdit && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', marginTop: '8px' }}>
                            <input type="text" className="form-input" placeholder={t({ de: 'Begriff', en: 'Term', tr: 'Terim' })} value={newKeywordTerm}
                                onChange={e => setNewKeywordTerm(e.target.value)}
                                style={{ fontSize: 'var(--font-size-xs)', padding: '6px 10px', flex: 1 }} />
                            <input type="text" className="form-input" placeholder={t({ de: 'Kategorie', en: 'Category', tr: 'Kategori' })} value={newKeywordCategory}
                                onChange={e => setNewKeywordCategory(e.target.value)}
                                style={{ fontSize: 'var(--font-size-xs)', padding: '6px 10px', flex: 1 }} />
                            <button className="btn btn-primary btn-sm" onClick={() => {
                                if (newKeywordTerm.trim()) {
                                    addKeyword({ term: newKeywordTerm.trim(), category: newKeywordCategory.trim() || t({ de: 'Allgemein', en: 'General', tr: 'Genel' }), description: '' });
                                    setNewKeywordTerm('');
                                    setNewKeywordCategory('');
                                }
                            }}>
                                <Plus size={12} /> {t({ de: 'Hinzufügen', en: 'Add', tr: 'Ekle' })}
                            </button>
                        </div>
                    )}
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={11} />
                    {t({
                        de: 'Diese Keywords sind in allen Kampagnen automatisch eingebunden und können dort nicht verändert werden.',
                        en: 'These keywords are automatically included in all campaigns and cannot be changed there.',
                        tr: 'Bu anahtar kelimeler tüm kampanyalara otomatik olarak dahil edilir ve orada değiştirilemez.'
                    })}
                    {!canEdit && ' ' + t({ de: 'Nur Admins können diese bearbeiten.', en: 'Only admins can edit these.', tr: 'Yalnızca yöneticiler bunları düzenleyebilir.' })}
                </div>
            </SectionHeader>

            {/* ─── BLOCK 5: Zielmarkt ─── */}
            <SectionHeader id="market" title={t({ de: 'Zielmarkt & Zielgruppen', en: 'Target Market & Audiences', tr: 'Hedef Pazar & Hedef Kitleler' })} icon={Globe} {...sectionProps}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <Field label={t({ de: 'Primärmarkt', en: 'Primary Market', tr: 'Birincil Pazar' })} value={pos.primaryMarket} section="market" editSection={editSection} />
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                                {t({ de: 'Sekundärmärkte', en: 'Secondary Markets', tr: 'İkincil Pazarlar' })}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {pos.secondaryMarkets.map(m => (
                                    <span key={m} className="keyword-tag keyword-tag--read">{m}</span>
                                ))}
                            </div>
                        </div>
                        <Field label={t({ de: 'Zielprojektgröße', en: 'Target Project Size', tr: 'Hedef Proje Büyüklüğü' })} value={pos.targetCompanySize} section="market" editSection={editSection} />
                    </div>
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                                {t({ de: 'Zielbranchen', en: 'Target Industries', tr: 'Hedef Sektörler' })}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {pos.targetIndustries.map(ind => (
                                    <div key={ind} style={{
                                        padding: '8px 12px', background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)',
                                        fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px',
                                    }}>
                                        <span style={{ color: 'var(--color-primary)' }}>▸</span> {ind}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '12px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '6px', color: '#10b981' }}>🔗 {t({ de: 'Verknüpfte Zielgruppen', en: 'Linked Audiences', tr: 'Bağlı Hedef Kitleler' })}</div>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {t({ de: 'Die detaillierten Buyer-Personas findest du im', en: 'You can find the detailed buyer personas in the', tr: 'Detaylı alıcı personalarını şurada bulabilirsiniz:' })}{' '}
                                <button
                                    onClick={() => router.push('/audiences')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-light)', fontWeight: 600, padding: 0 }}
                                >
                                    {t({ de: 'Zielgruppen-Modul →', en: 'Audiences Module →', tr: 'Hedef Kitle Modülü →' })}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionHeader>
        </div>
    );
}
