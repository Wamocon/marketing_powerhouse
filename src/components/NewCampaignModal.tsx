import { useState } from 'react';
import { Plus, Users, Bot, Tag, MapPin, UserCheck, UsersRound } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

interface NewCampaignModalProps {
    onClose: () => void;
}

export default function NewCampaignModal({ onClose }: NewCampaignModalProps) {
    const { t } = useLanguage();
    const { audiences: allAudiences, touchpoints, addCampaign, users, companyKeywords } = useData();
    const [modalStep, setModalStep] = useState(1);
    const [campaignName, setCampaignName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
    const [campaignKeywords, setCampaignKeywords] = useState('');
    const [masterPrompt, setMasterPrompt] = useState('');
    const [selectedTouchpoints, setSelectedTouchpoints] = useState<string[]>([]);
    const [responsibleManagerId, setResponsibleManagerId] = useState('');
    const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>([]);

    const hasUnsavedChanges = Boolean(
        campaignName.trim() ||
        description.trim() ||
        startDate ||
        endDate ||
        budget ||
        masterPrompt.trim() ||
        campaignKeywords.trim() ||
        responsibleManagerId ||
        selectedAudiences.length ||
        selectedTouchpoints.length ||
        selectedTeamMemberIds.length
    );

    const requestClose = () => {
        if (hasUnsavedChanges && !window.confirm(t({ de: 'Es gibt ungespeicherte Eingaben. Möchtest du das Modal wirklich schließen?', en: 'There are unsaved changes. Do you really want to close the modal?', tr: 'Kaydedilmemiş değişiklikler var. Modalı gerçekten kapatmak istiyor musunuz?' }))) {
            return;
        }
        onClose();
    };

    const managers = users.filter(u => u.role === 'company_admin' || u.role === 'manager');
    const allMembers = users;

    const toggleTeamMember = (id: string) => {
        setSelectedTeamMemberIds(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };
    const toggleAudience = (id: string) => {
        setSelectedAudiences(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const toggleTouchpoint = (id: string) => {
        setSelectedTouchpoints(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    return (
        <div className="modal-overlay" onClick={requestClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">{t({ de: 'Neue Kampagne erstellen', en: 'Create New Campaign', tr: 'Yeni Kampanya Oluştur' })}</h2>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                            {[1, 2, 3].map(step => (
                                <div key={step} style={{
                                    height: '3px', flex: 1, borderRadius: 'var(--radius-full)',
                                    background: step <= modalStep ? 'var(--color-primary)' : 'var(--bg-elevated)',
                                    transition: 'background 0.3s',
                                }} />
                            ))}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                            {t({ de: 'Schritt', en: 'Step', tr: 'Adım' })} {modalStep} {t({ de: 'von', en: 'of', tr: '/' })} 3: {modalStep === 1 ? t({ de: 'Grunddaten', en: 'Basic Data', tr: 'Temel Bilgiler' }) : modalStep === 2 ? t({ de: 'Master-Prompt & Zielgruppen', en: 'Master Prompt & Audiences', tr: 'Ana Prompt ve Hedef Kitleler' }) : t({ de: 'Schlüsselbegriffe', en: 'Keywords', tr: 'Anahtar Kelimeler' })}
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={requestClose}>✕</button>
                </div>

                <div className="modal-body">
                    {modalStep === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            <div className="form-group">
                                <label className="form-label">{t({ de: 'Kampagnenname', en: 'Campaign Name', tr: 'Kampanya Adı' })}</label>
                                <input type="text" className="form-input" placeholder={t({ de: 'z.B. Sommer-Sale 2026', en: 'e.g. Summer Sale 2026', tr: 'örn. Yaz İndirimi 2026' })} value={campaignName} onChange={e => setCampaignName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t({ de: 'Beschreibung', en: 'Description', tr: 'Açıklama' })}</label>
                                <textarea className="form-input form-textarea" placeholder={t({ de: 'Beschreibe das Ziel der Kampagne…', en: 'Describe the campaign goal…', tr: 'Kampanyanın amacını açıklayın…' })} value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">{t({ de: 'Startdatum', en: 'Start Date', tr: 'Başlangıç Tarihi' })}</label>
                                    <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t({ de: 'Enddatum', en: 'End Date', tr: 'Bitiş Tarihi' })}</label>
                                    <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t({ de: 'Budget (€)', en: 'Budget (€)', tr: 'Bütçe (€)' })}</label>
                                <input type="number" className="form-input" placeholder={t({ de: 'z.B. 15000', en: 'e.g. 15000', tr: 'örn. 15000' })} value={budget} onChange={e => setBudget(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <UserCheck size={14} style={{ color: '#8b5cf6' }} />
                                    {t({ de: 'Verantwortlicher Manager', en: 'Responsible Manager', tr: 'Sorumlu Yönetici' })}
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                                    {t({ de: 'Wähle den verantwortlichen Manager für diese Kampagne.', en: 'Select the responsible manager for this campaign.', tr: 'Bu kampanya için sorumlu yöneticiyi seçin.' })}
                                </p>
                                <select className="form-input" value={responsibleManagerId} onChange={e => setResponsibleManagerId(e.target.value)}>
                                    <option value="">{t({ de: 'Bitte wählen…', en: 'Please select…', tr: 'Lütfen seçin…' })}</option>
                                    {managers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.jobTitle})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <UsersRound size={14} style={{ color: '#0ea5e9' }} />
                                    {t({ de: 'Team-Mitglieder', en: 'Team Members', tr: 'Ekip Üyeleri' })}
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                                    {t({ de: 'Wähle die Mitglieder, die für diese Kampagne eingeplant sind.', en: 'Select the members assigned to this campaign.', tr: 'Bu kampanya için görevlendirilmiş üyeleri seçin.' })}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {allMembers.map(member => (
                                        <div
                                            key={member.id}
                                            onClick={() => toggleTeamMember(member.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '8px 12px', borderRadius: 'var(--radius-md)',
                                                background: selectedTeamMemberIds.includes(member.id) ? 'rgba(14,165,233,0.1)' : 'var(--bg-elevated)',
                                                border: `1px solid ${selectedTeamMemberIds.includes(member.id) ? '#0ea5e9' : 'transparent'}`,
                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                                fontSize: 'var(--font-size-xs)'
                                            }}
                                        >
                                            <div style={{
                                                width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                                                border: `2px solid ${selectedTeamMemberIds.includes(member.id) ? '#0ea5e9' : 'var(--border-color)'}`,
                                                background: selectedTeamMemberIds.includes(member.id) ? '#0ea5e9' : 'var(--bg-surface)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {selectedTeamMemberIds.includes(member.id) && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                    background: 'var(--color-primary)', color: '#fff',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
                                                }}>{member.avatar}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600 }}>{member.name}</span>
                                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>{member.jobTitle}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                                    {t({ de: 'Touchpoints / Kanäle', en: 'Touchpoints / Channels', tr: 'Temas Noktaları / Kanallar' })}
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                                    {t({ de: 'Wähle die vordefinierten Touchpoints für deine Kampagne aus.', en: 'Select the predefined touchpoints for your campaign.', tr: 'Kampanyanız için önceden tanımlanmış temas noktalarını seçin.' })}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {touchpoints.map(tp => (
                                        <div
                                            key={tp.id}
                                            onClick={() => toggleTouchpoint(tp.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '8px 12px', borderRadius: 'var(--radius-md)',
                                                background: selectedTouchpoints.includes(tp.id) ? 'rgba(37,99,235,0.1)' : 'var(--bg-elevated)',
                                                border: `1px solid ${selectedTouchpoints.includes(tp.id) ? 'var(--color-primary)' : 'transparent'}`,
                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                                fontSize: 'var(--font-size-xs)'
                                            }}
                                        >
                                            <div style={{
                                                width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                                                border: `2px solid ${selectedTouchpoints.includes(tp.id) ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                                background: selectedTouchpoints.includes(tp.id) ? 'var(--color-primary)' : 'var(--bg-surface)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {selectedTouchpoints.includes(tp.id) && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>{tp.name}</span>
                                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>{tp.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {modalStep === 2 && (
                        <div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Bot size={14} style={{ color: 'var(--color-primary)' }} />
                                    {t({ de: 'Master-Prompt', en: 'Master Prompt', tr: 'Ana Prompt' })}
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px', lineHeight: 1.5 }}>
                                    {t({ de: 'Der Master-Prompt ist die allgemeingültige KI-Zusammenfassung deiner Kampagne. Er wird als Kontextbasis für alle KI-generierten Inhalte genutzt.', en: 'The master prompt is the universal AI summary of your campaign. It serves as the context base for all AI-generated content.', tr: 'Ana prompt, kampanyanızın genel yapay zeka özetidir. Tüm yapay zeka tarafından oluşturulan içerikler için bağlam temeli olarak kullanılır.' })}
                                </p>
                                <textarea
                                    className="form-input form-textarea"
                                    placeholder={t({ de: 'Beschreibe Ton, Zielgruppe, USPs, Kernbotschaft und Dos & Don\'ts dieser Kampagne…', en: 'Describe tone, target audience, USPs, core message and dos & don\'ts of this campaign…', tr: 'Bu kampanyanın tonunu, hedef kitlesini, USP\'lerini, ana mesajını ve yapılması/yapılmaması gerekenleri açıklayın…' })}
                                    style={{ minHeight: '160px', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}
                                    value={masterPrompt}
                                    onChange={e => setMasterPrompt(e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Users size={14} style={{ color: '#10b981' }} />
                                    {t({ de: 'Zielgruppen zuweisen', en: 'Assign Audiences', tr: 'Hedef Kitleleri Ata' })}
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                                    {t({ de: 'Wähle eine oder mehrere Personas aus der Zielgruppen-Bibliothek.', en: 'Select one or more personas from the audience library.', tr: 'Hedef kitle kütüphanesinden bir veya daha fazla persona seçin.' })}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {allAudiences.map(a => (
                                        <div
                                            key={a.id}
                                            onClick={() => toggleAudience(a.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '12px', borderRadius: 'var(--radius-md)',
                                                background: selectedAudiences.includes(a.id) ? 'rgba(220,38,38,0.1)' : 'var(--bg-elevated)',
                                                border: `1px solid ${selectedAudiences.includes(a.id) ? 'var(--color-primary)' : 'transparent'}`,
                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <div className="persona-avatar persona-avatar--sm" style={{ background: a.color, flexShrink: 0 }}>
                                                {a.initials}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{a.name}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    {a.segment} · {a.age} J. · {a.jobTitle}
                                                </div>
                                            </div>
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                                                border: `2px solid ${selectedAudiences.includes(a.id) ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                                background: selectedAudiences.includes(a.id) ? 'var(--color-primary)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {selectedAudiences.includes(a.id) && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {modalStep === 3 && (
                        <div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Tag size={14} style={{ color: '#f59e0b' }} />
                                    {t({ de: 'Kampagnenspezifische Keywords', en: 'Campaign-Specific Keywords', tr: 'Kampanyaya Özel Anahtar Kelimeler' })}
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px', lineHeight: 1.5 }}>
                                    {t({ de: 'Ergänze Keywords, die spezifisch für diese Kampagne sind. Projektweite Keywords werden automatisch hinzugefügt.', en: 'Add keywords specific to this campaign. Project-wide keywords are included automatically.', tr: 'Bu kampanyaya özel anahtar kelimeler ekleyin. Proje genelindeki anahtar kelimeler otomatik olarak dahil edilir.' })}
                                </p>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={t({ de: 'Keywords kommagetrennt eingeben, z.B. Sommer-Sale, New Arrivals, …', en: 'Enter keywords separated by commas, e.g. Summer Sale, New Arrivals, …', tr: 'Anahtar kelimeleri virgülle ayırarak girin, örn. Yaz İndirimi, Yeni Gelenler, …' })}
                                    value={campaignKeywords}
                                    onChange={(e) => setCampaignKeywords(e.target.value)}
                                />
                                {campaignKeywords && (
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                                        {campaignKeywords.split(',').filter(k => k.trim()).map(k => (
                                            <span key={k} className="keyword-tag keyword-tag--campaign">{k.trim()}</span>
                                        ))}
                                    </div>
                                )}
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {t({ de: '🔒 Projektweite Keywords (werden automatisch eingebunden)', en: '🔒 Project-wide keywords (included automatically)', tr: '🔒 Proje geneli anahtar kelimeler (otomatik dahil edilir)' })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {companyKeywords.length > 0 ? (
                                            companyKeywords.map(kw => (
                                                <span key={kw.id} className="keyword-tag keyword-tag--company">🔒 {kw.term}</span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                {t({ de: 'Keine projektweiten Keywords vorhanden.', en: 'No project-wide keywords available.', tr: 'Proje genelinde anahtar kelime bulunmuyor.' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {modalStep > 1 && (
                        <button className="btn btn-secondary" onClick={() => setModalStep(prev => prev - 1)}>
                            ← {t({ de: 'Zurück', en: 'Back', tr: 'Geri' })}
                        </button>
                    )}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" onClick={requestClose}>{t({ de: 'Abbrechen', en: 'Cancel', tr: 'İptal' })}</button>
                        {modalStep < 3 ? (
                            <button className="btn btn-primary" onClick={() => setModalStep(prev => prev + 1)}>
                                {t({ de: 'Weiter', en: 'Next', tr: 'İleri' })} →
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={async () => {
                                await addCampaign({
                                    name: campaignName || t({ de: 'Neue Kampagne', en: 'New Campaign', tr: 'Yeni Kampanya' }),
                                    status: 'planned',
                                    startDate,
                                    endDate,
                                    budget: Number(budget) || 0,
                                    spent: 0,
                                    channels: selectedTouchpoints.map(tpId => touchpoints.find(t => t.id === tpId)?.name || ''),
                                    touchpointIds: selectedTouchpoints,
                                    description,
                                    masterPrompt,
                                    targetAudiences: selectedAudiences,
                                    campaignKeywords: campaignKeywords.split(',').map(k => k.trim()).filter(Boolean),
                                    kpis: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 },
                                    owner: responsibleManagerId ? (users.find(u => u.id === responsibleManagerId)?.name || '') : '',
                                    progress: 0,
                                    responsibleManagerId,
                                    teamMemberIds: selectedTeamMemberIds,
                                });
                                onClose();
                            }}>
                                {t({ de: 'Kampagne erstellen', en: 'Create Campaign', tr: 'Kampanya Oluştur' })}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
