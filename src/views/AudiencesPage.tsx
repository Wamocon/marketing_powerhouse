import { useState } from 'react';
import type { Audience } from '../types';
import { Plus, Search, Users, Target, Megaphone, ChevronRight, Tag, MapPin, Briefcase, Heart } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { AppLanguage } from '../context/LanguageContext';
import PageHelp from '../components/PageHelp';
import AudienceDetailModal from '../components/AudienceDetailModal';
import ImportExportPanel from '../components/ImportExportPanel';
import { downloadAudienceExport } from '../lib/importExport';
import type { AudienceExportData } from '../types/importExport';

const segmentConfig = {
    'B2C': { badge: 'badge-info', label: 'B2C' },
    'B2B': { badge: 'badge-primary', label: 'B2B' },
};

const typeConfig: Record<string, { label: Record<AppLanguage, string>; icon: string }> = {
    'buyer': { label: { de: 'Buyer Persona', en: 'Buyer Persona', tr: 'Alıcı Profili' }, icon: '🎯' },
    'user': { label: { de: 'User Persona', en: 'User Persona', tr: 'Kullanıcı Profili' }, icon: '🧑‍💻' },
};

export default function AudiencesPage() {
    const { audiences, campaigns, addAudience } = useData();
    const { can, isSuperAdmin, activeCompanyRole } = useAuth();
    const { language, t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [segmentFilter, setSegmentFilter] = useState('all');
    const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);
    const [showNewAudienceModal, setShowNewAudienceModal] = useState(false);
    const [newAud, setNewAud] = useState({
        name: '', type: 'buyer' as string, segment: 'B2C' as 'B2C' | 'B2B', age: '', location: '', jobTitle: '',
        gender: '', income: '', education: '', journeyPhase: 'Awareness', preferredChannels: [] as string[],
        decisionProcess: '', description: '', painPoints: [] as string[], goals: [] as string[],
    });

    const resetNewAud = () => setNewAud({
        name: '', type: 'buyer', segment: 'B2C', age: '', location: '', jobTitle: '',
        gender: '', income: '', education: '', journeyPhase: 'Awareness', preferredChannels: [],
        decisionProcess: '', description: '', painPoints: [], goals: [],
    });

    const hasUnsavedNewAudienceChanges = Boolean(
        newAud.name.trim() ||
        newAud.age.trim() ||
        newAud.location.trim() ||
        newAud.jobTitle.trim() ||
        newAud.gender.trim() ||
        newAud.income.trim() ||
        newAud.education.trim() ||
        newAud.decisionProcess.trim() ||
        newAud.description.trim() ||
        newAud.preferredChannels.length ||
        newAud.painPoints.length ||
        newAud.goals.length
    );

    const requestCloseNewAudienceModal = () => {
        if (hasUnsavedNewAudienceChanges && !window.confirm(t({ de: 'Es gibt ungespeicherte Eingaben. Möchtest du das Modal wirklich schließen?', en: 'There are unsaved changes. Do you really want to close the modal?', tr: 'Kaydedilmemiş değişiklikler var. Modalı gerçekten kapatmak istiyor musunuz?' }))) {
            return;
        }
        setShowNewAudienceModal(false);
        resetNewAud();
    };

    const handleCreateAudience = () => {
        const initials = newAud.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const colors = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        addAudience({
            initials,
            color,
            ...newAud,
            interests: [],
            campaignIds: [],
            buyingBehavior: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        setShowNewAudienceModal(false);
        resetNewAud();
    };

    const filtered = audiences
        .filter(a => segmentFilter === 'all' || a.segment === segmentFilter)
        .filter(a =>
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const getLinkedCampaigns = (audienceId: string) =>
        campaigns.filter(c => c.targetAudiences?.includes(audienceId));

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">{t({ de: 'Zielgruppen & Avatare', en: 'Audiences & Personas', tr: 'Hedef Kitleler & Kişi Profilleri' })}</h1>
                    <p className="page-subtitle">
                        {t({ de: `${audiences.length} Personas definiert`, en: `${audiences.length} personas defined`, tr: `${audiences.length} kişi profili tanımlandı` })} · {audiences.filter(a => a.segment === 'B2B').length} B2B · {audiences.filter(a => a.segment === 'B2C').length} B2C
                    </p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title={t({ de: 'Zielgruppen & Avatare', en: 'Audiences & Personas', tr: 'Hedef Kitleler & Kişi Profilleri' })}>
                        <p style={{ marginBottom: '12px' }}>{t({ de: 'Werbt nicht ins Leere. Ohne klare Zielgruppen ist jedes Budget vergeudet. Erstelle hier eure Traumkunden.', en: 'Do not market blindly. Without clear audiences, every budget gets wasted. Build your ideal customer profiles here.', tr: 'Körü körüne pazarlama yapmayın. Net hedef kitleler olmadan her bütçe boşa gider. İdeal müşteri profillerinizi burada oluşturun.' })}</p>
                        <ul className="help-list">
                            <li><strong>{t({ de: 'Personas anlegen:', en: 'Create personas:', tr: 'Kişi profili oluştur:' })}</strong> {t({ de: 'Generiere "Buyer Personas" (Käufer) oder "User Personas" (Nutzer) basierend auf echten demografischen Daten.', en: 'Generate buyer or user personas based on real demographic data.', tr: 'Gerçek demografik verilere dayalı alıcı veya kullanıcı profilleri oluşturun.' })}</li>
                            <li><strong>{t({ de: 'Schmerzpunkte (Pain Points):', en: 'Pain points:', tr: 'Sorunlar (Pain Points):' })}</strong> {t({ de: 'Das wichtigste Feld! Formuliere extrem genau, welche Alltagsprobleme die Persona hat, damit eure Ads genau in diese Wunde treffen können.', en: 'This is the most important field. Be very specific about daily problems so your ads hit exactly the right need.', tr: 'En önemli alan! Reklamlarınızın doğru ihtiyaca ulaşması için günlük sorunları çok net ifade edin.' })}</li>
                            <li><strong>{t({ de: 'Ziele:', en: 'Goals:', tr: 'Hedefler:' })}</strong> {t({ de: 'Was will die Persona erreichen? Das wird euer Angebot.', en: 'What does the persona want to achieve? This should directly shape your offer.', tr: 'Kişi profili ne elde etmek istiyor? Bu doğrudan teklifinizi şekillendirmelidir.' })}</li>
                            <li><strong>{t({ de: 'Kampagnen-Kopplung:', en: 'Campaign linkage:', tr: 'Kampanya bağlantısı:' })}</strong> {t({ de: 'Wenn du auf eine Persona klickst, siehst du im Detail-Bereich, in welchen Kampagnen diese Person beworben wird.', en: 'Click a persona to see which active campaigns currently target this profile.', tr: 'Hangi aktif kampanyaların bu profili hedeflediğini görmek için bir kişi profiline tıklayın.' })}</li>
                        </ul>
                    </PageHelp>
                    {can('canEditAudiences') && (
                        <button className="btn btn-primary" onClick={() => setShowNewAudienceModal(true)}>
                            <Plus size={16} />
                            {t({ de: 'Neue Persona', en: 'New Persona', tr: 'Yeni Kişi Profili' })}
                        </button>
                    )}
                </div>
            </div>

            {/* Filter & Search */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder={t({ de: 'Personas durchsuchen...', en: 'Search personas...', tr: 'Kişi profillerinde ara...' })}
                        style={{ paddingLeft: '36px', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                    {[
                        { key: 'all', label: t({ de: 'Alle', en: 'All', tr: 'Tümü' }) },
                        { key: 'B2B', label: 'B2B' },
                        { key: 'B2C', label: 'B2C' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`tab ${segmentFilter === tab.key ? 'active' : ''}`}
                            onClick={() => setSegmentFilter(tab.key)}
                            style={{
                                borderBottom: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 16px',
                                background: segmentFilter === tab.key ? 'var(--bg-hover)' : 'transparent',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            
                {/* Personas Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    {filtered.map(audience => {
                        const linkedCampaigns = getLinkedCampaigns(audience.id);
                        const isSelected = selectedAudience?.id === audience.id;
                        return (
                            <div
                                key={audience.id}
                                className="card"
                                style={{
                                    cursor: 'pointer',
                                    padding: '20px',
                                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)',
                                    transition: 'all 0.2s ease',
                                }}
                                onClick={() => setSelectedAudience(isSelected ? null : audience)}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                                    <div className="persona-avatar" style={{ background: audience.color }}>
                                        {audience.initials}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>{audience.name}</h3>
                                            <span className={`badge ${segmentConfig[audience.segment].badge}`}>{audience.segment}</span>
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                {typeConfig[audience.type].icon} {typeConfig[audience.type].label[language]}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                            {audience.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Info Row */}
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={11} /> {audience.age} J.
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={11} /> {audience.location}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Briefcase size={11} /> {audience.jobTitle}
                                    </span>
                                </div>

                                {/* Interests */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                    {audience.interests.slice(0, 3).map(interest => (
                                        <span key={interest} className="keyword-tag keyword-tag--read">
                                            {interest}
                                        </span>
                                    ))}
                                    {audience.interests.length > 3 && (
                                        <span className="keyword-tag keyword-tag--read" style={{ color: 'var(--text-tertiary)' }}>
                                            +{audience.interests.length - 3}
                                        </span>
                                    )}
                                </div>

                                {/* Footer */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '12px',
                                    borderTop: '2px solid var(--border-color)',
                                    fontSize: 'var(--font-size-xs)',
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)' }}>
                                        <Megaphone size={11} />
                                        {t({ de: `${linkedCampaigns.length} Kampagne${linkedCampaigns.length !== 1 ? 'n' : ''}`, en: `${linkedCampaigns.length} campaign${linkedCampaigns.length !== 1 ? 's' : ''}`, tr: `${linkedCampaigns.length} kampanya` })}
                                    </span>
                                    <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                                        {t({ de: 'Details', en: 'Details', tr: 'Detaylar' })} <ChevronRight size={12} />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                            {/* Detail Modal */}
            {selectedAudience && (
                <AudienceDetailModal
                    audience={selectedAudience}
                    onClose={() => setSelectedAudience(null)}
                />
            )}

            {/* New Audience Modal */}
            {showNewAudienceModal && (
                <div className="modal-overlay" onClick={requestCloseNewAudienceModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{t({ de: 'Neue Persona erstellen', en: 'Create New Persona', tr: 'Yeni Kişi Profili Oluştur' })}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={requestCloseNewAudienceModal}>✕</button>
                        </div>
                        <div className="modal-body" style={{ overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">{t({ de: 'Persona-Name', en: 'Persona Name', tr: 'Kişi Profili Adı' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. Digital Dave', en: 'e.g. Digital Dave', tr: 'ör. Digital Dave' })} value={newAud.name} onChange={e => setNewAud({...newAud, name: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t({ de: 'Typ', en: 'Type', tr: 'Tür' })}</label>
                                    <select className="form-input" value={newAud.type} onChange={e => setNewAud({...newAud, type: e.target.value})}>
                                        <option value="buyer">Buyer Persona</option>
                                        <option value="user">User Persona</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Segment</label>
                                    <select className="form-input" value={newAud.segment} onChange={e => setNewAud({...newAud, segment: e.target.value as 'B2C'|'B2B'})}>
                                        <option value="B2C">B2C</option>
                                        <option value="B2B">B2B</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t({ de: 'Altersgruppe', en: 'Age Group', tr: 'Yaş Grubu' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. 28-38', en: 'e.g. 28-38', tr: 'ör. 28-38' })} value={newAud.age} onChange={e => setNewAud({...newAud, age: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t({ de: 'Standort', en: 'Location', tr: 'Konum' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. DACH-Region', en: 'e.g. DACH region', tr: 'ör. DACH bölgesi' })} value={newAud.location} onChange={e => setNewAud({...newAud, location: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">{t({ de: 'Berufsfeld / Job Title', en: 'Role / Job Title', tr: 'Meslek / İş Unvanı' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. Marketing Manager', en: 'e.g. Marketing Manager', tr: 'ör. Pazarlama Müdürü' })} value={newAud.jobTitle} onChange={e => setNewAud({...newAud, jobTitle: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t({ de: 'Geschlecht', en: 'Gender', tr: 'Cinsiyet' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. Weiblich, Divers', en: 'e.g. Female, Diverse', tr: 'ör. Kadın, Çeşitli' })} value={newAud.gender} onChange={e => setNewAud({...newAud, gender: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t({ de: 'Einkommen', en: 'Income', tr: 'Gelir' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. Mittel-Hoch', en: 'e.g. Medium-high', tr: 'ör. Orta-Yüksek' })} value={newAud.income} onChange={e => setNewAud({...newAud, income: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t({ de: 'Bildung', en: 'Education', tr: 'Eğitim' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. Master', en: 'e.g. Master degree', tr: 'ör. Yüksek lisans' })} value={newAud.education} onChange={e => setNewAud({...newAud, education: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t({ de: 'Customer-Journey-Phase', en: 'Customer Journey Phase', tr: 'Müşteri Yolculuğu Aşaması' })}</label>
                                    <select className="form-input" value={newAud.journeyPhase} onChange={e => setNewAud({...newAud, journeyPhase: e.target.value})}>
                                        <option value="Awareness">Awareness</option>
                                        <option value="Consideration">Consideration</option>
                                        <option value="Purchase">Purchase</option>
                                        <option value="Retention">Retention</option>
                                        <option value="Advocacy">Advocacy</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">{t({ de: 'Bevorzugte Kanäle (kommagetrennt)', en: 'Preferred Channels (comma-separated)', tr: 'Tercih Edilen Kanallar (virgülle ayrılmış)' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. LinkedIn, Magazin, Podcast', en: 'e.g. LinkedIn, magazine, podcast', tr: 'ör. LinkedIn, dergi, podcast' })} value={newAud.preferredChannels.join(', ')} onChange={e => setNewAud({...newAud, preferredChannels: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">{t({ de: 'Entscheidungsprozess', en: 'Decision Process', tr: 'Karar Süreci' })}</label>
                                    <textarea className="form-input form-textarea" placeholder={t({ de: 'Wie trifft diese Persona Kaufentscheidungen?...', en: 'How does this persona make purchase decisions?...', tr: 'Bu kişi profili satın alma kararlarını nasıl veriyor?...' })} style={{ minHeight: '60px' }} value={newAud.decisionProcess} onChange={e => setNewAud({...newAud, decisionProcess: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">{t({ de: 'Beschreibung', en: 'Description', tr: 'Açıklama' })}</label>
                                    <textarea className="form-input form-textarea" placeholder={t({ de: 'Beschreibe diese Persona in 2-3 Sätzen...', en: 'Describe this persona in 2-3 sentences...', tr: 'Bu kişi profilini 2-3 cümleyle tanımlayın...' })} value={newAud.description} onChange={e => setNewAud({...newAud, description: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">{t({ de: 'Pain Points (kommagetrennt)', en: 'Pain Points (comma-separated)', tr: 'Sorunlar (virgülle ayrılmış)' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. Zu viele Tools, Zeitmangel, ...', en: 'e.g. Too many tools, no time, ...', tr: 'ör. Çok fazla araç, zaman yetersizliği, ...' })} value={newAud.painPoints.join(', ')} onChange={e => setNewAud({...newAud, painPoints: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">{t({ de: 'Ziele (kommagetrennt)', en: 'Goals (comma-separated)', tr: 'Hedefler (virgülle ayrılmış)' })}</label>
                                    <input type="text" className="form-input" placeholder={t({ de: 'z.B. Produktivität steigern, ...', en: 'e.g. increase productivity, ...', tr: 'ör. verimliliği artırmak, ...' })} value={newAud.goals.join(', ')} onChange={e => setNewAud({...newAud, goals: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={requestCloseNewAudienceModal}>{t({ de: 'Abbrechen', en: 'Cancel', tr: 'İptal' })}</button>
                            <button className="btn btn-primary" onClick={handleCreateAudience}>{t({ de: 'Persona erstellen', en: 'Create Persona', tr: 'Kişi Profili Oluştur' })}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import / Export – Audience Level */}
            {(isSuperAdmin || activeCompanyRole === 'company_admin') && (
                <ImportExportPanel
                    level="audience"
                    onImport={async (raw) => {
                        const data = raw as AudienceExportData;
                        const a = data.audience;
                        const initials = a.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'XX';
                        const colors = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];
                        const color = colors[Math.floor(Math.random() * colors.length)];
                        await addAudience({
                            name: a.name,
                            type: a.type || 'buyer',
                            segment: a.segment || 'B2B',
                            color,
                            initials,
                            age: a.age || '',
                            gender: a.gender || '',
                            location: a.location || '',
                            income: a.income || '',
                            education: a.education || '',
                            jobTitle: a.jobTitle || '',
                            interests: a.interests || [],
                            painPoints: a.painPoints || [],
                            goals: a.goals || [],
                            preferredChannels: a.preferredChannels || [],
                            buyingBehavior: a.buyingBehavior || '',
                            decisionProcess: a.decisionProcess || '',
                            journeyPhase: a.journeyPhase || 'Awareness',
                            description: a.description || '',
                            campaignIds: [],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });
                    }}
                    onExport={() => {
                        if (audiences.length > 0) downloadAudienceExport(audiences[0]);
                    }}
                    exportDisabled={audiences.length === 0}
                />
            )}
        </div>
    );
}
