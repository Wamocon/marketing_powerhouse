import { useState } from 'react';
import {
    HelpCircle, LayoutDashboard, Target, Users2, Megaphone,
    Calendar, CheckSquare, Wallet, Settings, CheckCircle,
    FileText, Lightbulb, UserCheck, Search, Image as ImageIcon,
    MessageSquare, AlertTriangle, Link as LinkIcon, Map,
    GitBranch, Clock, Users, Zap, Bell, FileJson
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PlaceholderImage, SectionTitle, TipBox, AccordionItem, TableOfContents, WorkflowCard } from '../components/ManualComponents';
import { ManagerTab, WorkflowsTab } from '../components/ManualTabs';

export default function ManualPage() {
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<string>(
        currentUser?.role === 'company_admin' ? 'admin' : (currentUser?.role || 'admin')
    );

    const tabs = [
        { id: 'admin', label: t({ de: 'Admin (Strategie & Setup)', en: 'Admin (Strategy & Setup)', tr: 'Yönetici (Strateji & Kurulum)' }) },
        { id: 'manager', label: t({ de: 'Manager (Planung & Steuerung)', en: 'Manager (Planning & Control)', tr: 'Yönetici (Planlama & Kontrol)' }) },
        { id: 'member', label: t({ de: 'Member (Umsetzung)', en: 'Member (Execution)', tr: 'Üye (Uygulama)' }) },
        { id: 'workflows', label: t({ de: 'Workflows (Übersicht)', en: 'Workflows (Overview)', tr: 'İş Akışları (Genel Bakış)' }) }
    ];

    const adminSections = [
        t({ de: 'Die Digitale Positionierung pflegen', en: 'Maintaining the Digital Positioning', tr: 'Dijital Konumlandırmayı Yönetme' }),
        t({ de: 'Systemeinstellungen & Integrationen', en: 'System Settings & Integrations', tr: 'Sistem Ayarları & Entegrasyonlar' }),
        t({ de: 'Benachrichtigungssystem', en: 'Notification System', tr: 'Bildirim Sistemi' }),
        t({ de: 'Benutzerverwaltung & Berechtigungen', en: 'User Management & Permissions', tr: 'Kullanıcı Yönetimi & İzinler' }),
        t({ de: 'Import / Export & Projekt-Fragebogen', en: 'Import / Export & Project Questionnaire', tr: 'İçe/Dışa Aktarma & Proje Anketi' })
    ];

    const managerSections = [
        t({ de: 'Zielgruppen (Personas) anlegen, 5-Phasen Journey skizzieren & Kampagne erstellen', en: 'Create audiences (personas), sketch 5-phase journey & create campaign', tr: 'Hedef kitle (persona) oluşturma, 5 aşamalı yolculuk çizme & kampanya oluşturma' }),
        t({ de: 'Kampagnen orchestrieren', en: 'Orchestrate campaigns', tr: 'Kampanyaları yönetme' }),
        t({ de: 'Kanäle & Touchpoints verwalten', en: 'Manage channels & touchpoints', tr: 'Kanalları & temas noktalarını yönetme' }),
        t({ de: 'Content-Kalender & Redaktionsplanung', en: 'Content calendar & editorial planning', tr: 'İçerik takvimi & editoryal planlama' }),
        t({ de: 'Aufgaben-Delegation (Das Briefing)', en: 'Task delegation (The Briefing)', tr: 'Görev delegasyonu (Brifing)' }),
        t({ de: 'Budget & Controlling', en: 'Budget & Controlling', tr: 'Bütçe & Kontrol' })
    ];

    const memberSections = [
        t({ de: 'Der Start in den Tag: Das Dashboard', en: 'Starting the day: The Dashboard', tr: 'Güne başlangıç: Kontrol Paneli' }),
        t({ de: 'Das Briefing lesen', en: 'Reading the briefing', tr: 'Brifingi okuma' }),
        t({ de: 'Umsetzung & OneDrive Link eintragen', en: 'Implementation & enter OneDrive link', tr: 'Uygulama & OneDrive bağlantısı girme' }),
        t({ de: 'Den Kanban-Status pflegen', en: 'Maintaining the Kanban status', tr: 'Kanban durumunu güncelleme' })
    ];

    return (
        <div className="animate-in">
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div className="page-header-left">
                    <h1 className="page-title">{t({ de: 'Handbuch & Workflow Guide', en: 'Manual & Workflow Guide', tr: 'Kılavuz & İş Akışı Rehberi' })}</h1>
                    <p className="page-subtitle">{t({ de: 'Die vollumfängliche Anleitung zur optimalen Nutzung des Marketing Powerhouse.', en: 'The comprehensive guide to optimal use of the Marketing Powerhouse.', tr: 'Marketing Powerhouse\'un optimal kullanımı için kapsamlı kılavuz.' })}</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '32px', overflowX: 'auto' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ flex: 1, padding: '12px', fontSize: 'var(--font-size-md)', minWidth: '180px' }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══ ADMIN WORKFLOW ═══ */}
                {activeTab === 'admin' && (
                    <div className="animate-in" style={{ animation: 'fadeIn 0.3s' }}>
                        <TableOfContents sections={adminSections} />

                        <div style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>{t({ de: 'Einleitung: Die Admin-Rolle', en: 'Introduction: The Admin Role', tr: 'Giriş: Yönetici Rolü' })}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-md)' }}>
                                {t({
                                    de: 'Als Administrator trägst du die Verantwortung für das grundlegende Setup und die strategische DNA des Systems. Du definierst die Markenwerte, verwaltest das Team und dessen Zugriffsrechte und konfigurierst die System-Schnittstellen (APIs). Nur wenn dein Setup detailliert und präzise ist, können Manager und Members effizient und markenkonform arbeiten.',
                                    en: 'As an administrator, you are responsible for the basic setup and the strategic DNA of the system. You define brand values, manage the team and their access rights, and configure the system interfaces (APIs). Only when your setup is detailed and precise can managers and members work efficiently and in line with the brand.',
                                    tr: 'Yönetici olarak, sistemin temel kurulumundan ve stratejik DNA\'sından sorumlusunuz. Marka değerlerini tanımlar, ekibi ve erişim haklarını yönetir, sistem arayüzlerini (API\'ler) yapılandırırsınız. Yalnızca kurulumunuz ayrıntılı ve kesin olduğunda, yöneticiler ve üyeler verimli ve markaya uygun çalışabilir.'
                                })}
                            </p>
                        </div>

                        <AccordionItem id="section-0" title={t({ de: 'Die Digitale Positionierung pflegen', en: 'Maintaining the Digital Positioning', tr: 'Dijital Konumlandırmayı Yönetme' })} icon={Target} color="#6366f1" defaultOpen={true}>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>{t({
                                    de: 'Die "Digitale Positionierung" (im Menü unter "Projekt") ist das Gehirn der App. Die hier eingegebenen Daten werden genutzt, um Content-Ideen zu generieren und Kampagnen auszurichten.',
                                    en: 'The "Digital Positioning" (in the menu under "Project") is the brain of the app. The data entered here is used to generate content ideas and align campaigns.',
                                    tr: '"Dijital Konumlandırma" (menüde "Proje" altında) uygulamanın beynidir. Buraya girilen veriler içerik fikirleri üretmek ve kampanyaları yönlendirmek için kullanılır.'
                                })}</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>{t({ de: 'DNA & Pitch:', en: 'DNA & Pitch:', tr: 'DNA & Pitch:' })}</strong> {t({ de: 'Definiere hier, wofür das Projekt in einem Satz steht.', en: 'Define here what the project stands for in one sentence.', tr: 'Projenin tek bir cümlede neyi temsil ettiğini burada tanımlayın.' })}</li>
                                    <li><strong>{t({ de: 'Pain Points & USPs:', en: 'Pain Points & USPs:', tr: 'Sorunlar & Benzersiz Satış Noktaları:' })}</strong> {t({ de: 'Die größten Schmerzpunkte der Zielgruppe und die Alleinstellungsmerkmale deines Projekt. Diese müssen messerscharf formuliert sein.', en: 'The biggest pain points of the target audience and your project\'s unique selling propositions. These must be razor-sharp.', tr: 'Hedef kitlenin en büyük sorunları ve projenizin benzersiz satış noktaları. Bunlar çok keskin formüle edilmelidir.' })}</li>
                                    <li><strong>{t({ de: 'Keywords:', en: 'Keywords:', tr: 'Anahtar Kelimeler:' })}</strong> {t({ de: 'Relevante Begriffe, die in Kampagnen und im SEO genutzt werden sollen.', en: 'Relevant terms to be used in campaigns and SEO.', tr: 'Kampanyalarda ve SEO\'da kullanılacak ilgili terimler.' })}</li>
                                    <li><strong>{t({ de: 'Tone of Voice:', en: 'Tone of Voice:', tr: 'Ses Tonu:' })}</strong> {t({ de: 'Wie sprecht ihr mit der Zielgruppe? (z.B. informativ, per Du, auf Augenhöhe).', en: 'How do you speak to the target audience? (e.g. informative, informal, at eye level).', tr: 'Hedef kitleyle nasıl konuşuyorsunuz? (ör. bilgilendirici, samimi, göz hizasında).' })}</li>
                                </ul>
                                <TipBox title={t({ de: 'Best Practice: Positionierung', en: 'Best Practice: Positioning', tr: 'En İyi Uygulama: Konumlandırma' })}>
                                    {t({
                                        de: 'Halte die DNA so prägnant wie möglich. Vermeide Marketing-Floskeln. Die KI-Anbindungen (falls aktiv) und die Briefings der Manager ziehen sich exakt diese Daten, um Texte und Creatives vorzuschlagen.',
                                        en: 'Keep the DNA as concise as possible. Avoid marketing clichés. The AI integrations (if active) and manager briefings pull exactly this data to suggest copy and creatives.',
                                        tr: 'DNA\'yı mümkün olduğunca kısa tutun. Pazarlama klişelerinden kaçının. Yapay zeka entegrasyonları (aktifse) ve yönetici brifingleri metin ve kreatif önermek için tam olarak bu verileri çeker.'
                                    })}
                                </TipBox>
                                <PlaceholderImage
                                    title={t({ de: 'Digitale Positionierung bearbeiten', en: 'Edit Digital Positioning', tr: 'Dijital Konumlandırmayı Düzenle' })} icon={Target} color="#6366f1"
                                    description={t({ de: 'Zeigt das Formular mit den Feldern für DNA, USPs, Tone-of-Voice im Edit-Modus.', en: 'Shows the form with fields for DNA, USPs, Tone-of-Voice in edit mode.', tr: 'DNA, USP\'ler, Ses Tonu alanlarını düzenleme modunda gösterir.' })}
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem id="section-1" title={t({ de: 'Systemeinstellungen & Integrationen', en: 'System Settings & Integrations', tr: 'Sistem Ayarları & Entegrasyonlar' })} icon={Settings} color="#8b5cf6">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>{t({
                                    de: 'Unter "Einstellungen" managst du globale Parameter, Benachrichtigungen und vor allem die API-Anbindungen.',
                                    en: 'Under "Settings" you manage global parameters, notifications and above all the API connections.',
                                    tr: '"Ayarlar" altında global parametreleri, bildirimleri ve özellikle API bağlantılarını yönetirsiniz.'
                                })}</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>{t({ de: 'Firmenprofil:', en: 'Company Profile:', tr: 'Şirket Profili:' })}</strong> {t({ de: 'Ändere den Namen und das globale Branding.', en: 'Change the name and global branding.', tr: 'Adı ve global markalaşmayı değiştirin.' })}</li>
                                    <li><strong>{t({ de: 'Kanäle & Touchpoints (Verwaltung):', en: 'Channels & Touchpoints (Management):', tr: 'Kanallar & Temas Noktaları (Yönetim):' })}</strong> {t({
                                        de: 'Du hast Vollzugriff auf die Central-Verwaltung aller Marketing-Kanäle. Stelle sicher, dass alle verwendeten Touchpoints (Google Ads, LinkedIn, E-Mail-CRM, etc.) hier hinterlegt sind, damit Manager später darauf aufbauen können. Jeder Touchpoint zeigt automatisch seine aggregierten Kanal-KPIs (Impressions, Clicks, CTR, Spend, CPC, CPA).',
                                        en: 'You have full access to the central management of all marketing channels. Make sure all used touchpoints (Google Ads, LinkedIn, Email CRM, etc.) are stored here so managers can build on them later. Each touchpoint automatically shows its aggregated channel KPIs (Impressions, Clicks, CTR, Spend, CPC, CPA).',
                                        tr: 'Tüm pazarlama kanallarının merkezi yönetimine tam erişiminiz var. Kullanılan tüm temas noktalarının (Google Ads, LinkedIn, E-posta CRM vb.) burada kayıtlı olduğundan emin olun, böylece yöneticiler daha sonra bunların üzerine inşa edebilir. Her temas noktası otomatik olarak toplu kanal KPI\'larını (Gösterimler, Tıklamalar, TO, Harcama, TBM, EBM) gösterir.'
                                    })}</li>
                                    <li><strong>{t({ de: 'Integrationen:', en: 'Integrations:', tr: 'Entegrasyonlar:' })}</strong> {t({
                                        de: 'Hier hinterlegst du in Zukunft API-Keys für OpenAI, Meta Ads, Google Analytics oder LinkedIn. Diese Keys werden systemweit verschlüsselt genutzt.',
                                        en: 'Here you will store API keys for OpenAI, Meta Ads, Google Analytics or LinkedIn in the future. These keys are used encrypted system-wide.',
                                        tr: 'Gelecekte OpenAI, Meta Ads, Google Analytics veya LinkedIn için API anahtarlarını burada saklayacaksınız. Bu anahtarlar sistem genelinde şifreli olarak kullanılır.'
                                    })}</li>
                                    <li><strong>{t({ de: 'Benachrichtigungen:', en: 'Notifications:', tr: 'Bildirimler:' })}</strong> {t({
                                        de: 'Lege fest, welche Hinweise (z.B. Kampagnen-Updates, Budget-Alerts, Deadline-Erinnerungen) im System aktiv sind. Die Einstellungen werden pro aktivem Projekt gespeichert und steuern, welche Benachrichtigungen im Notification-Center (Glocke oben rechts) angezeigt werden.',
                                        en: 'Define which notifications (e.g. campaign updates, budget alerts, deadline reminders) are active in the system. Settings are saved per active project and control which notifications are displayed in the Notification Center (bell icon top right).',
                                        tr: 'Sistemde hangi bildirimlerin (ör. kampanya güncellemeleri, bütçe uyarıları, son tarih hatırlatmaları) aktif olduğunu belirleyin. Ayarlar aktif proje bazında kaydedilir ve Bildirim Merkezinde (sağ üstteki zil simgesi) hangi bildirimlerin gösterileceğini kontrol eder.'
                                    })}</li>
                                </ul>
                                <PlaceholderImage
                                    title={t({ de: 'Einstellungs-Dashboard', en: 'Settings Dashboard', tr: 'Ayarlar Paneli' })} icon={Settings} color="#8b5cf6"
                                    description={t({ de: 'Zeigt den Tab \'Integrationen\' mit leeren/verborgenen API-Key Eingabefeldern für externe Plattformen.', en: 'Shows the \'Integrations\' tab with empty/hidden API key input fields for external platforms.', tr: 'Dış platformlar için boş/gizli API anahtarı giriş alanlarıyla \'Entegrasyonlar\' sekmesini gösterir.' })}
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem id="section-2" title={t({ de: 'Benachrichtigungssystem', en: 'Notification System', tr: 'Bildirim Sistemi' })} icon={Bell} color="#f59e0b">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>{t({
                                    de: 'Das Benachrichtigungssystem hält alle Teammitglieder in Echtzeit über relevante Änderungen informiert. Es ist über das Glocken-Symbol oben rechts im Header erreichbar.',
                                    en: 'The notification system keeps all team members informed in real-time about relevant changes. It is accessible via the bell icon in the top right of the header.',
                                    tr: 'Bildirim sistemi tüm ekip üyelerini ilgili değişiklikler hakkında gerçek zamanlı olarak bilgilendirir. Başlığın sağ üst köşesindeki zil simgesi aracılığıyla erişilebilir.'
                                })}</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>{t({ de: 'Automatische Benachrichtigungen:', en: 'Automatic Notifications:', tr: 'Otomatik Bildirimler:' })}</strong> {t({ de: 'Das System erzeugt automatisch Benachrichtigungen bei wichtigen Aktionen:', en: 'The system automatically generates notifications for important actions:', tr: 'Sistem önemli eylemler için otomatik olarak bildirimler oluşturur:' })}
                                        <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <li>{t({ de: 'Kampagnen-Updates (Status-Änderungen, neue Kampagnen)', en: 'Campaign updates (status changes, new campaigns)', tr: 'Kampanya güncellemeleri (durum değişiklikleri, yeni kampanyalar)' })}</li>
                                            <li>{t({ de: 'Budget-Alerts (ab 80% Auslastung und bei Überschreitung)', en: 'Budget alerts (from 80% utilization and upon exceeding)', tr: 'Bütçe uyarıları (%80 kullanımdan itibaren ve aşıldığında)' })}</li>
                                            <li>{t({ de: 'Aufgaben-Benachrichtigungen (Zuweisung, Status-Änderung, KI-Generierung)', en: 'Task notifications (assignment, status change, AI generation)', tr: 'Görev bildirimleri (atama, durum değişikliği, yapay zeka üretimi)' })}</li>
                                            <li>{t({ de: 'Content-Updates (Review-Bereitschaft, Freigabe, Veröffentlichung)', en: 'Content updates (review readiness, approval, publication)', tr: 'İçerik güncellemeleri (inceleme hazırlığı, onay, yayınlama)' })}</li>
                                            <li>{t({ de: 'Team-Aktivitäten (neue Mitglieder)', en: 'Team activities (new members)', tr: 'Ekip aktiviteleri (yeni üyeler)' })}</li>
                                        </ul>
                                    </li>
                                    <li><strong>{t({ de: 'Notification-Center:', en: 'Notification Center:', tr: 'Bildirim Merkezi:' })}</strong> {t({
                                        de: 'Klick auf die Glocke öffnet ein Dropdown mit allen Benachrichtigungen, gruppiert nach Datum (Heute, Gestern, Älter). Ungelesene Einträge sind farblich hervorgehoben.',
                                        en: 'Clicking the bell opens a dropdown with all notifications, grouped by date (Today, Yesterday, Older). Unread entries are color-highlighted.',
                                        tr: 'Zile tıklamak tarihe göre gruplandırılmış (Bugün, Dün, Daha Eski) tüm bildirimleri içeren bir açılır menü açar. Okunmamış girişler renkli olarak vurgulanır.'
                                    })}</li>
                                    <li><strong>{t({ de: 'Steuerung:', en: 'Control:', tr: 'Kontrol:' })}</strong> {t({
                                        de: 'Unter Einstellungen → Benachrichtigungen kann jeder Nutzer individuell festlegen, welche Benachrichtigungs-Typen er erhalten möchte.',
                                        en: 'Under Settings → Notifications, each user can individually define which notification types they want to receive.',
                                        tr: 'Ayarlar → Bildirimler altında her kullanıcı hangi bildirim türlerini almak istediğini bireysel olarak belirleyebilir.'
                                    })}</li>
                                    <li><strong>{t({ de: 'Navigation:', en: 'Navigation:', tr: 'Navigasyon:' })}</strong> {t({
                                        de: 'Ein Klick auf eine Benachrichtigung navigiert direkt zur betroffenen Entität (z.B. Kampagne, Aufgabe, Content).',
                                        en: 'Clicking a notification navigates directly to the affected entity (e.g. campaign, task, content).',
                                        tr: 'Bir bildirime tıklamak doğrudan ilgili varlığa (ör. kampanya, görev, içerik) yönlendirir.'
                                    })}</li>
                                    <li><strong>{t({ de: 'Prioritäten:', en: 'Priorities:', tr: 'Öncelikler:' })}</strong> {t({
                                        de: 'Budget-Überschreitungen werden als dringende (rote) Benachrichtigungen dargestellt, Budget-Warnungen als hoch (orange).',
                                        en: 'Budget overruns are displayed as urgent (red) notifications, budget warnings as high (orange).',
                                        tr: 'Bütçe aşımları acil (kırmızı) bildirimler olarak, bütçe uyarıları yüksek (turuncu) olarak gösterilir.'
                                    })}</li>
                                </ul>
                                <TipBox title={t({ de: 'Tipp: Benachrichtigungen verwalten', en: 'Tip: Managing Notifications', tr: 'İpucu: Bildirimleri Yönetme' })}>
                                    {t({
                                        de: 'Du kannst einzelne Benachrichtigungen archivieren (X-Button) oder alle auf einmal als gelesen markieren ("Alle gelesen"-Button). Dies hält dein Notification-Center übersichtlich.',
                                        en: 'You can archive individual notifications (X button) or mark all as read at once ("Mark all read" button). This keeps your Notification Center tidy.',
                                        tr: 'Tek tek bildirimleri arşivleyebilir (X düğmesi) veya tümünü bir kerede okundu olarak işaretleyebilirsiniz ("Tümünü okundu işaretle" düğmesi). Bu, Bildirim Merkezinizi düzenli tutar.'
                                    })}
                                </TipBox>
                            </div>
                        </AccordionItem>

                        <AccordionItem id="section-3" title={t({ de: 'Benutzerverwaltung & Berechtigungen', en: 'User Management & Permissions', tr: 'Kullanıcı Yönetimi & İzinler' })} icon={Users2} color="#ec4899">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>{t({
                                    de: 'Im Tab "Team" oder "Benutzerverwaltung" (innerhalb der Einstellungen) steuerst du das Rollenkonzept und die Team-Zuweisung.',
                                    en: 'In the "Team" or "User Management" tab (within Settings) you control the role concept and team assignment.',
                                    tr: '"Ekip" veya "Kullanıcı Yönetimi" sekmesinde (Ayarlar içinde) rol konseptini ve ekip atamasını kontrol edersiniz.'
                                })}</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>{t({
                                        de: 'Bestehende Benutzer können im Team-Tab per E-Mail zum aktiven Projekt zugewiesen werden. Neue Zuweisungen starten standardmäßig als Member.',
                                        en: 'Existing users can be assigned to the active project via email in the Team tab. New assignments start as Member by default.',
                                        tr: 'Mevcut kullanıcılar Ekip sekmesinde e-posta yoluyla aktif projeye atanabilir. Yeni atamalar varsayılan olarak Üye olarak başlar.'
                                    })}</li>
                                    <li>{t({
                                        de: 'Wenn eine E-Mail noch nicht als Benutzer existiert, zeigt das System eine Fehlermeldung mit dem Hinweis, den Benutzer zuerst anzulegen.',
                                        en: 'If an email does not yet exist as a user, the system shows an error message advising to create the user first.',
                                        tr: 'Bir e-posta henüz kullanıcı olarak mevcut değilse, sistem önce kullanıcıyı oluşturmanızı öneren bir hata mesajı gösterir.'
                                    })}</li>
                                    <li><strong>Manager:</strong> {t({
                                        de: 'Dürfen Kampagnen, Zielgruppen und Budgets erstellen und verwalten. Zudem können sie Elemente (Kampagnen, Touchpoints, Personas, Content, Aufgaben etc.) löschen.',
                                        en: 'Can create and manage campaigns, audiences and budgets. They can also delete elements (campaigns, touchpoints, personas, content, tasks etc.).',
                                        tr: 'Kampanyalar, hedef kitleler ve bütçeler oluşturabilir ve yönetebilir. Ayrıca öğeleri (kampanyalar, temas noktaları, personalar, içerik, görevler vb.) silebilirler.'
                                    })}</li>
                                    <li><strong>Member:</strong> {t({
                                        de: 'Können nur Aufgaben sehen und abarbeiten. Sie sehen keine Budgets, können keine wesentlichen Elemente löschen und haben keinen Zugriff auf Einstellungen.',
                                        en: 'Can only view and complete tasks. They cannot see budgets, delete essential elements, or access settings.',
                                        tr: 'Yalnızca görevleri görebilir ve tamamlayabilir. Bütçeleri göremez, temel öğeleri silemez veya ayarlara erişemezler.'
                                    })}</li>
                                </ul>
                                <p style={{ marginBottom: '16px' }}>
                                    {t({
                                        de: 'Als Super-Admin kannst du zusätzlich im Super-Admin-Panel Benutzer direkt bestehenden Projekt zuweisen und ihre Rolle pro Projekt sofort ändern.',
                                        en: 'As a Super Admin, you can additionally assign users directly to existing projects in the Super Admin Panel and change their role per project immediately.',
                                        tr: 'Süper Yönetici olarak, Super Admin Panelinde kullanıcıları doğrudan mevcut projelere atayabilir ve proje bazında rollerini hemen değiştirebilirsiniz.'
                                    })}
                                </p>
                                <TipBox title={t({ de: 'Sicherheit', en: 'Security', tr: 'Güvenlik' })}>
                                    {t({
                                        de: 'Befördere Nutzer nur zum Admin, wenn sie wirklich globale Systemeinstellungen (wie API-Keys) ändern dürfen. In 90% der Fälle ist die Manager-Rolle für Teamleiter völlig ausreichend.',
                                        en: 'Only promote users to Admin if they truly need to change global system settings (like API keys). In 90% of cases, the Manager role is perfectly sufficient for team leaders.',
                                        tr: 'Kullanıcıları yalnızca gerçekten global sistem ayarlarını (API anahtarları gibi) değiştirmeleri gerekiyorsa Yöneticiye yükseltin. Vakaların %90\'ında Yönetici rolü ekip liderleri için tamamen yeterlidir.'
                                    })}
                                </TipBox>
                            </div>
                        </AccordionItem>

                        <AccordionItem id="section-4" title={t({ de: 'Import / Export & Projekt-Fragebogen', en: 'Import / Export & Project Questionnaire', tr: 'İçe/Dışa Aktarma & Proje Anketi' })} icon={FileJson} color="#0ea5e9">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>{t({
                                    de: 'Die Import/Export-Funktionen ermöglichen die schnelle Einrichtung neuer Projekte und den Austausch von Marketing-Daten zwischen Momentum-Instanzen.',
                                    en: 'The import/export functions enable quick setup of new projects and exchange of marketing data between Momentum instances.',
                                    tr: 'İçe/dışa aktarma işlevleri yeni projelerin hızlı kurulumunu ve Momentum örnekleri arasında pazarlama verilerinin alışverişini sağlar.'
                                })}</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>{t({ de: 'Berechtigung:', en: 'Permission:', tr: 'İzin:' })}</strong> {t({
                                        de: 'Nur Super-Admin und Projekt-Admin können Import/Export nutzen.',
                                        en: 'Only Super Admin and Project Admin can use Import/Export.',
                                        tr: 'Yalnızca Süper Yönetici ve Proje Yöneticisi İçe/Dışa Aktarmayı kullanabilir.'
                                    })}</li>
                                    <li><strong>{t({ de: '3 Ebenen:', en: '3 Levels:', tr: '3 Seviye:' })}</strong>
                                        <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <li><strong>{t({ de: 'Projekt-Import/Export', en: 'Project Import/Export', tr: 'Proje İçe/Dışa Aktarma' })}</strong> ({t({ de: 'Einstellungen → Import/Export', en: 'Settings → Import/Export', tr: 'Ayarlar → İçe/Dışa Aktarma' })}): {t({ de: 'Exportiert/importiert Projektdaten, Positionierung, Keywords und Budget-Kategorien.', en: 'Exports/imports project data, positioning, keywords and budget categories.', tr: 'Proje verilerini, konumlandırmayı, anahtar kelimeleri ve bütçe kategorilerini dışa/içe aktarır.' })}</li>
                                            <li><strong>{t({ de: 'Kampagnen-Import/Export', en: 'Campaign Import/Export', tr: 'Kampanya İçe/Dışa Aktarma' })}</strong> ({t({ de: 'Kampagnen-Seite', en: 'Campaigns page', tr: 'Kampanyalar sayfası' })}): {t({ de: 'Importiert eine einzelne Kampagne inkl. Budget, Kanäle, Keywords und Zielgruppen.', en: 'Imports a single campaign incl. budget, channels, keywords and audiences.', tr: 'Bütçe, kanallar, anahtar kelimeler ve hedef kitleler dahil tek bir kampanyayı içe aktarır.' })}</li>
                                            <li><strong>{t({ de: 'Zielgruppen-Import/Export', en: 'Audience Import/Export', tr: 'Hedef Kitle İçe/Dışa Aktarma' })}</strong> ({t({ de: 'Zielgruppen-Seite', en: 'Audiences page', tr: 'Hedef Kitleler sayfası' })}): {t({ de: 'Importiert eine vollständige Persona mit Demographics, Pain Points, Goals etc.', en: 'Imports a complete persona with demographics, pain points, goals etc.', tr: 'Demografik bilgiler, sorunlar, hedefler vb. ile eksiksiz bir persona içe aktarır.' })}</li>
                                        </ul>
                                    </li>
                                    <li><strong>{t({ de: 'Validierung:', en: 'Validation:', tr: 'Doğrulama:' })}</strong> {t({
                                        de: 'Jede Import-Datei wird automatisch validiert. Pflichtfelder müssen vorhanden sein, bevor der Import bestätigt werden kann. Warnungen werden für fehlende optionale Felder angezeigt.',
                                        en: 'Every import file is automatically validated. Required fields must be present before the import can be confirmed. Warnings are shown for missing optional fields.',
                                        tr: 'Her içe aktarma dosyası otomatik olarak doğrulanır. İçe aktarma onaylanmadan önce zorunlu alanlar mevcut olmalıdır. Eksik isteğe bağlı alanlar için uyarılar gösterilir.'
                                    })}</li>
                                    <li><strong>{t({ de: 'JSON-Vorlagen:', en: 'JSON Templates:', tr: 'JSON Şablonları:' })}</strong> {t({
                                        de: 'Über den "Vorlage (JSON)"-Button kann eine leere Vorlage heruntergeladen werden. Im /public-Ordner liegen außerdem umfangreiche Fragebogen-Vorlagen (fragebogen_projekt_vorlage.json, fragebogen_kampagne_vorlage.json, fragebogen_zielgruppe_vorlage.json).',
                                        en: 'An empty template can be downloaded via the "Template (JSON)" button. The /public folder also contains comprehensive questionnaire templates (fragebogen_projekt_vorlage.json, fragebogen_kampagne_vorlage.json, fragebogen_zielgruppe_vorlage.json).',
                                        tr: '"Şablon (JSON)" düğmesi aracılığıyla boş bir şablon indirilebilir. /public klasöründe ayrıca kapsamlı anket şablonları (fragebogen_projekt_vorlage.json, fragebogen_kampagne_vorlage.json, fragebogen_zielgruppe_vorlage.json) bulunur.'
                                    })}</li>
                                    <li><strong>{t({ de: 'Fragebogen für andere Apps:', en: 'Questionnaire for other apps:', tr: 'Diğer uygulamalar için anket:' })}</strong> {t({
                                        de: 'Die Projekt-Fragebogen-Vorlage enthält alle Pflicht- und Optionalfragen, die andere Teams/Bots ausfüllen können, um ein Projekt-Import-JSON zu generieren.',
                                        en: 'The project questionnaire template contains all required and optional questions that other teams/bots can fill out to generate a project import JSON.',
                                        tr: 'Proje anketi şablonu, diğer ekiplerin/botların bir proje içe aktarma JSON\'u oluşturmak için doldurabileceği tüm zorunlu ve isteğe bağlı soruları içerir.'
                                    })}</li>
                                </ul>
                                <TipBox title={t({ de: 'Workflow: Neues Projekt per Import einrichten', en: 'Workflow: Set up new project via import', tr: 'İş Akışı: İçe aktarma ile yeni proje kurulumu' })}>
                                    {t({
                                        de: '1. Fragebogen-Vorlage herunterladen (fragebogen_projekt_vorlage.json). 2. Alle Fragen beantworten und die Werte im "importData"-Block eintragen. 3. Das "importData"-Objekt als eigenständige JSON speichern. 4. In Momentum: Einstellungen → Import/Export → Projekt importieren.',
                                        en: '1. Download questionnaire template (fragebogen_projekt_vorlage.json). 2. Answer all questions and enter values in the "importData" block. 3. Save the "importData" object as a standalone JSON. 4. In Momentum: Settings → Import/Export → Import project.',
                                        tr: '1. Anket şablonunu indirin (fragebogen_projekt_vorlage.json). 2. Tüm soruları cevaplayın ve değerleri "importData" bloğuna girin. 3. "importData" nesnesini bağımsız bir JSON olarak kaydedin. 4. Momentum\'da: Ayarlar → İçe/Dışa Aktarma → Proje içe aktar.'
                                    })}
                                </TipBox>
                            </div>
                        </AccordionItem>
                    </div>
                )}

                {/* ═══ MANAGER WORKFLOW ═══ */}
                {activeTab === 'manager' && <ManagerTab sections={managerSections} />}

                {/* ═══ MEMBER WORKFLOW ═══ */}
                {activeTab === 'member' && (
                    <div className="animate-in" style={{ animation: 'fadeIn 0.3s' }}>
                        <TableOfContents sections={memberSections} />

                        <div style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>{t({ de: 'Einleitung: Die Member-Rolle', en: 'Introduction: The Member Role', tr: 'Giriş: Üye Rolü' })}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-md)' }}>
                                {t({
                                    de: 'Als Member (z.B. Creator, Texter, Designer) liegt dein absoluter Fokus auf der kreativen Umsetzung. Du wirst nicht durch schwerfällige Strategie-Fenster oder Budget-Zahlen abgelenkt. Dein täglicher Workflow besteht aus: Dashboard checken, Briefing lesen, Aufgabe abarbeiten, Dateien ablegen und Status aktualisieren.',
                                    en: 'As a Member (e.g. creator, copywriter, designer) your absolute focus is on creative execution. You won\'t be distracted by heavy strategy windows or budget figures. Your daily workflow consists of: check dashboard, read briefing, complete task, store files and update status.',
                                    tr: 'Üye olarak (ör. içerik üretici, metin yazarı, tasarımcı) mutlak odağınız yaratıcı uygulamadadır. Ağır strateji pencereleri veya bütçe rakamlarıyla dikkatiniz dağılmaz. Günlük iş akışınız şunlardan oluşur: kontrol panelini kontrol et, brifingi oku, görevi tamamla, dosyaları kaydet ve durumu güncelle.'
                                })}
                            </p>
                        </div>

                        <AccordionItem title={t({ de: '1. Der Start in den Tag: Das Dashboard', en: '1. Starting the day: The Dashboard', tr: '1. Güne başlangıç: Kontrol Paneli' })} icon={LayoutDashboard} color="#f59e0b" defaultOpen={true}>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>{t({ de: 'Dein erster Klick führt dich auf das Dashboard.', en: 'Your first click takes you to the Dashboard.', tr: 'İlk tıklamanız sizi Kontrol Paneline götürür.' })}</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>{t({
                                        de: 'Hier hast du das Panel "Meine Aufgabenliste". Dort landen alle Tickets, die dir von Managern zugewiesen wurden.',
                                        en: 'Here you have the "My Task List" panel. All tickets assigned to you by managers land there.',
                                        tr: 'Burada "Görev Listem" paneli var. Yöneticiler tarafından size atanan tüm biletler buraya gelir.'
                                    })}</li>
                                    <li>{t({
                                        de: 'Aufgaben, die für heute oder morgen fällig sind, springen dir sofort in der Deadline-Übersicht ins Auge.',
                                        en: 'Tasks due today or tomorrow immediately catch your eye in the deadline overview.',
                                        tr: 'Bugün veya yarın teslim tarihi olan görevler, son tarih genel bakışında hemen dikkatinizi çeker.'
                                    })}</li>
                                </ul>
                                <PlaceholderImage
                                    title={t({ de: 'Dein Persönliches Dashboard', en: 'Your Personal Dashboard', tr: 'Kişisel Kontrol Paneliniz' })} icon={LayoutDashboard} color="#f59e0b"
                                    description={t({ de: 'Zeigt die Dashboard-Startseite mit Fokus auf die Tabelle \'Meine letzten Tasks\' und offene Tickets.', en: 'Shows the dashboard homepage focused on the \'My Recent Tasks\' table and open tickets.', tr: '\'Son Görevlerim\' tablosu ve açık biletlere odaklanan kontrol paneli ana sayfasını gösterir.' })}
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem title={t({ de: '2. Das Briefing lesen', en: '2. Reading the briefing', tr: '2. Brifingi okuma' })} icon={FileText} color="#ec4899">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>{t({
                                    de: 'Klicke in der Liste oder auf dem Kanban-Board auf eine Aufgabe, um das Aufgaben-Details Modal zu öffnen.',
                                    en: 'Click on a task in the list or on the Kanban board to open the task details modal.',
                                    tr: 'Görev detayları modalını açmak için listede veya Kanban panosunda bir göreve tıklayın.'
                                })}</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>{t({
                                        de: 'In der Mitte liest du die ausführliche Beschreibung des Managers. Das ist dein Arbeitsauftrag.',
                                        en: 'In the center you read the manager\'s detailed description. This is your work assignment.',
                                        tr: 'Ortada yöneticinin ayrıntılı açıklamasını okursunuz. Bu sizin iş görevinizdir.'
                                    })}</li>
                                    <li><strong>{t({ de: 'Kontext:', en: 'Context:', tr: 'Bağlam:' })}</strong> {t({
                                        de: 'Oftmals hängt eine Aufgabe an einem übergeordneten Content-Plan. Unter der Sektion "Zugehöriger Content" siehst du sofort, ob dieser Post z.B. für Instagram oder LinkedIn gedacht ist und an welchem Tag es veröffentlicht wird.',
                                        en: 'Often a task is attached to a higher-level content plan. Under the "Related Content" section you can immediately see whether this post is intended for Instagram or LinkedIn and on which day it will be published.',
                                        tr: 'Genellikle bir görev üst düzey bir içerik planına bağlıdır. "İlgili İçerik" bölümünde bu gönderinin Instagram veya LinkedIn için mi tasarlandığını ve hangi gün yayınlanacağını hemen görebilirsiniz.'
                                    })}</li>
                                    <li>{t({
                                        de: 'Mit einem Klick auf den verlinkten Content oder die verlinkte Kampagne kannst du dir weiteres Hintergrundwissen holen.',
                                        en: 'By clicking on the linked content or campaign you can get additional background knowledge.',
                                        tr: 'Bağlantılı içeriğe veya kampanyaya tıklayarak ek arka plan bilgisi edinebilirsiniz.'
                                    })}</li>
                                </ul>
                                <TipBox title={t({ de: 'Bei Unklarheiten', en: 'When in doubt', tr: 'Belirsizlik durumunda' })}>
                                    {t({
                                        de: 'Wenn das Briefing in der Beschreibung nicht eindeutig ist, setze den Status auf "Blocked / Fehler" und schreib in dem Fall den Manager über Teams/Slack an.',
                                        en: 'If the briefing in the description is not clear, set the status to "Blocked / Error" and contact the manager via Teams/Slack.',
                                        tr: 'Açıklamadaki brifing net değilse, durumu "Engellendi / Hata" olarak ayarlayın ve yöneticiyle Teams/Slack üzerinden iletişime geçin.'
                                    })}
                                </TipBox>
                            </div>
                        </AccordionItem>

                        <AccordionItem title={t({ de: '3. Umsetzung & OneDrive Link eintragen', en: '3. Implementation & enter OneDrive link', tr: '3. Uygulama & OneDrive bağlantısı girme' })} icon={LinkIcon} color="#ec4899">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>{t({
                                    de: 'Du produzierst nun das Video, das Bild oder schreibst den Copy-Text. Da die App absichtlich keine Filespeicherung betreibt (um Speicherplatzkosten zu sparen), passiert die Dateiablage bei euch extern:',
                                    en: 'You now produce the video, image or write the copy text. Since the app intentionally does not store files (to save storage costs), file storage happens externally:',
                                    tr: 'Şimdi videoyu, görseli üretiyorsunuz veya metni yazıyorsunuz. Uygulama kasıtlı olarak dosya depolamadığından (depolama maliyetlerinden tasarruf etmek için), dosya depolama harici olarak gerçekleşir:'
                                })}</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>{t({
                                        de: 'Lege das fertige Creative (als PNG, MP4, PDF) auf eurem Firmen-Speicher (z.B. Microsoft OneDrive, Google Drive, SharePoint) in den korrekten Kundenordner.',
                                        en: 'Place the finished creative (as PNG, MP4, PDF) on your company storage (e.g. Microsoft OneDrive, Google Drive, SharePoint) in the correct client folder.',
                                        tr: 'Bitmiş kreatifi (PNG, MP4, PDF olarak) şirket depolama alanınıza (ör. Microsoft OneDrive, Google Drive, SharePoint) doğru müşteri klasörüne yerleştirin.'
                                    })}</li>
                                    <li>{t({
                                        de: 'Kopiere dort den Freigabe-Link (Share-Link).',
                                        en: 'Copy the share link there.',
                                        tr: 'Paylaşım bağlantısını oradan kopyalayın.'
                                    })}</li>
                                    <li>{t({
                                        de: 'Gehe in der App wieder in die Aufgabe rein. Klicke auf "Bearbeiten".',
                                        en: 'Go back to the task in the app. Click "Edit".',
                                        tr: 'Uygulamada göreve geri dönün. "Düzenle"ye tıklayın.'
                                    })}</li>
                                    <li>{t({
                                        de: 'Füge den Link unten bei "Ressourcen Link (OneDrive / Drive)" ein und speichere.',
                                        en: 'Paste the link at the bottom under "Resource Link (OneDrive / Drive)" and save.',
                                        tr: 'Bağlantıyı altta "Kaynak Bağlantısı (OneDrive / Drive)" alanına yapıştırın ve kaydedin.'
                                    })}</li>
                                </ul>
                                <p>{t({
                                    de: 'Jetzt hat der Manager sofortigen Zugriff auf die finale hochauflösende Datei, ohne danach suchen zu müssen.',
                                    en: 'Now the manager has immediate access to the final high-resolution file without having to search for it.',
                                    tr: 'Artık yönetici, aramak zorunda kalmadan nihai yüksek çözünürlüklü dosyaya anında erişebilir.'
                                })}</p>
                                <PlaceholderImage
                                    title={t({ de: 'Aufgaben-Ansicht: Dateiverlinkung', en: 'Task View: File Linking', tr: 'Görev Görünümü: Dosya Bağlama' })} icon={LinkIcon} color="#ec4899"
                                    description={t({ de: 'Skizziert das geöffnete Aufgaben-Fenster, besonders den Eingabebereich für den OneDrive Link.', en: 'Sketches the open task window, especially the input area for the OneDrive link.', tr: 'Açık görev penceresini, özellikle OneDrive bağlantısı giriş alanını taslak olarak gösterir.' })}
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem title={t({ de: '4. Den Kanban-Status pflegen', en: '4. Maintaining the Kanban status', tr: '4. Kanban durumunu güncelleme' })} icon={CheckSquare} color="#14b8a6">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>{t({
                                    de: 'Status-Hygiene ist das wichtigste in der Zusammenarbeit. Das Marketing Powerhouse arbeitet mit einem 5-Spalten-Kanban (auf der Seite "Aufgaben").',
                                    en: 'Status hygiene is the most important thing in collaboration. The Marketing Powerhouse works with a 5-column Kanban (on the "Tasks" page).',
                                    tr: 'Durum hijyeni işbirliğinde en önemli şeydir. Marketing Powerhouse, 5 sütunlu bir Kanban ile çalışır ("Görevler" sayfasında).'
                                })}</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>To Do:</strong> {t({ de: 'Hier liegt alles, was du noch anfangen musst.', en: 'Everything you still need to start is here.', tr: 'Henüz başlamanız gereken her şey burada.' })}</li>
                                    <li><strong>In Progress:</strong> {t({
                                        de: 'Wechsle den Status hierauf, sobald du anfängst zu bearbeiten. So weiß der Manager: "Ah, da ist er dran".',
                                        en: 'Switch the status to this as soon as you start working. This way the manager knows: "Ah, they\'re on it".',
                                        tr: 'Çalışmaya başlar başlamaz durumu buna geçirin. Böylece yönetici bilir: "Ah, üzerinde çalışıyor".'
                                    })}</li>
                                    <li><strong>In Review:</strong> {t({
                                        de: 'Du hast den OneDrive-Link hinzugefügt und dein Creative ist fertig? Setze den Status auf In Review. Das ist das Zeichen für den Manager, deine Arbeit freizugeben.',
                                        en: 'You\'ve added the OneDrive link and your creative is done? Set the status to In Review. This is the signal for the manager to approve your work.',
                                        tr: 'OneDrive bağlantısını eklediniz ve kreatifiniz hazır mı? Durumu In Review olarak ayarlayın. Bu, yöneticinin çalışmanızı onaylaması için işarettir.'
                                    })}</li>
                                    <li><strong>Done:</strong> {t({
                                        de: 'Sobald der Manager sein OK gegeben hat (oder der Content publiziert ist), wandert das Ticket auf "Done". Das macht primär der Manager, aber auch du kannst Tickets abschließen.',
                                        en: 'Once the manager has given the OK (or the content is published), the ticket moves to "Done". This is primarily done by the manager, but you can also close tickets.',
                                        tr: 'Yönetici onay verdiğinde (veya içerik yayınlandığında), bilet "Done"a taşınır. Bu öncelikle yönetici tarafından yapılır, ancak siz de biletleri kapatabilirsiniz.'
                                    })}</li>
                                </ul>
                                <PlaceholderImage
                                    title={t({ de: 'Das Kanban-Board', en: 'The Kanban Board', tr: 'Kanban Panosu' })} icon={CheckSquare} color="#14b8a6"
                                    description={t({ de: 'Zeigt das Aufgaben-Board mit den Spalten \'To Do\', \'In Bearbeitung\', etc. und den verschiebbaren Aufgabenkarten.', en: 'Shows the task board with columns \'To Do\', \'In Progress\', etc. and the draggable task cards.', tr: '\'To Do\', \'In Progress\' vb. sütunları ve sürüklenebilir görev kartlarıyla görev panosunu gösterir.' })}
                                />
                            </div>
                        </AccordionItem>
                    </div>
                )}

                {/* ═══ WORKFLOWS ÜBERSICHT ═══ */}
                {activeTab === 'workflows' && <WorkflowsTab />}
            </div>
        </div>
    );
}
