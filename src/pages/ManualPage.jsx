import { useState } from 'react';
import {
    HelpCircle, LayoutDashboard, Target, Users2, Megaphone,
    Calendar, CheckSquare, Wallet, Settings, CheckCircle,
    FileText, Lightbulb, UserCheck, Search, Image as ImageIcon,
    MessageSquare, AlertTriangle, Link as LinkIcon, Map, ChevronDown,
    GitBranch, Clock, Users, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PlaceholderImage = ({ title, icon: Icon, color, description }) => (
    <div style={{
        background: 'var(--bg-hover)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-color)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '280px', color: 'var(--text-tertiary)', marginBottom: '24px', position: 'relative', overflow: 'hidden',
        padding: '24px', textAlign: 'center'
    }}>
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: color || 'var(--color-primary)'
        }} />
        <Icon size={48} style={{ marginBottom: '16px', opacity: 0.5, color: color || 'var(--text-tertiary)' }} />
        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>📸 Screenshot Platzhalter</div>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</div>
        {description && <div style={{ fontSize: 'var(--font-size-xs)', maxWidth: '400px', lineHeight: 1.5 }}>{description}</div>}
    </div>
);

const SectionTitle = ({ icon: Icon, title, color }) => (
    <h3 style={{
        fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px', marginTop: '48px'
    }}>
        <div style={{ background: `${color}15`, padding: '8px', borderRadius: '8px', color: color, display: 'flex' }}>
            <Icon size={24} />
        </div>
        {title}
    </h3>
);

const TipBox = ({ title, children }) => (
    <div style={{
        padding: '16px', background: 'rgba(56, 189, 248, 0.08)', borderLeft: '4px solid #38bdf8',
        borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: 'var(--font-size-sm)'
    }}>
        <div style={{ fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Lightbulb size={16} /> {title}
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{children}</div>
    </div>
);

// Akkordeon-Komponente
const AccordionItem = ({ title, icon: Icon, color, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            overflow: 'hidden'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: 'var(--bg-surface)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.parentElement.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.target.parentElement.style.background = 'transparent'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ background: `${color}15`, padding: '6px', borderRadius: '6px', color: color, display: 'flex' }}>
                        <Icon size={18} />
                    </div>
                    <span>{title}</span>
                </div>
                <ChevronDown
                    size={20}
                    style={{
                        transition: 'transform 0.3s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: 'var(--text-tertiary)'
                    }}
                />
            </button>
            {isOpen && (
                <div style={{
                    padding: '24px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-hover)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

// Inhaltsverzeichnis-Komponente
const TableOfContents = ({ sections }) => (
    <div style={{
        padding: '24px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '32px',
        border: '1px solid var(--border-color)'
    }}>
        <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> Inhaltsverzeichnis
        </h4>
        <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sections.map((section, idx) => (
                <li key={idx}>
                    <a href={`#section-${idx}`} style={{
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontSize: 'var(--font-size-sm)',
                        transition: 'color 0.2s'
                    }} onMouseEnter={(e) => e.target.style.color = 'var(--color-primary-hover)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-primary)'}>
                        {section}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

// Workflows-Übersicht Komponente
const WorkflowCard = ({ title, duration, roles, description, steps }) => (
    <div style={{
        padding: '24px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        background: 'var(--bg-surface)'
    }}>
        <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>{title}</h4>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <Clock size={16} /> {duration}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <Users size={16} /> {roles}
                </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>{description}</p>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Schritte:</h5>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {steps.map((step, idx) => (
                    <li key={idx} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{step.title}</strong>: {step.description}
                    </li>
                ))}
            </ol>
        </div>
    </div>
);

export default function ManualPage() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState(currentUser?.role || 'admin');

    const tabs = [
        { id: 'admin', label: 'Admin (Strategie & Setup)' },
        { id: 'manager', label: 'Manager (Planung & Steuerung)' },
        { id: 'member', label: 'Member (Umsetzung)' },
        { id: 'workflows', label: 'Workflows (Übersicht)' }
    ];

    const adminSections = [
        'Die Digitale Positionierung pflegen',
        'Systemeinstellungen & Integrationen',
        'Benutzerverwaltung & Berechtigungen'
    ];

    const managerSections = [
        'Zielgruppen (Personas) anlegen',
        'Customer Journey (ASIDAS-Modell) planen',
        'Kampagnen orchestrieren',
        'Kanäle & Touchpoints verwalten',
        'Content-Kalender & Redaktionsplanung',
        'Aufgaben-Delegation (Das Briefing)',
        'Budget & Controlling'
    ];

    const memberSections = [
        'Der Start in den Tag: Das Dashboard',
        'Das Briefing lesen',
        'Umsetzung & OneDrive Link eintragen',
        'Den Kanban-Status pflegen'
    ];

    return (
        <div className="animate-in">
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div className="page-header-left">
                    <h1 className="page-title">Handbuch & Workflow Guide</h1>
                    <p className="page-subtitle">Die vollumfängliche Anleitung zur optimalen Nutzung des Marketing Powerhouse.</p>
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
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Einleitung: Die Admin-Rolle</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-md)' }}>
                                Als <strong>Administrator</strong> trägst du die Verantwortung für das grundlegende Setup und die strategische DNA des Systems.
                                Du definierst die Markenwerte, verwaltest das Team und dessen Zugriffsrechte und konfigurierst die System-Schnittstellen (APIs).
                                Nur wenn dein Setup detailliert und präzise ist, können Manager und Members effizient und markenkonform arbeiten.
                            </p>
                        </div>

                        <AccordionItem id="section-0" title="Die Digitale Positionierung pflegen" icon={Target} color="#6366f1" defaultOpen={true}>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>Die "Digitale Positionierung" (im Menü unter "Unternehmen") ist das Gehirn der App. Die hier eingegebenen Daten werden genutzt, um Content-Ideen zu generieren und Kampagnen auszurichten.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>DNA & Pitch:</strong> Definiere hier, wofür das Unternehmen in einem Satz steht.</li>
                                    <li><strong>Pain Points & USPs:</strong> Die größten Schmerzpunkte der Zielgruppe und die Alleinstellungsmerkmale deines Unternehmens. Diese müssen messerscharf formuliert sein.</li>
                                    <li><strong>Keywords:</strong> Relevante Begriffe, die in Kampagnen und im SEO genutzt werden sollen.</li>
                                    <li><strong>Tone of Voice:</strong> Wie sprecht ihr mit der Zielgruppe? (z.B. informativ, per Du, auf Augenhöhe).</li>
                                </ul>
                                <TipBox title="Best Practice: Positionierung">
                                    Halte die DNA so prägnant wie möglich. Vermeide Marketing-Floskeln. Die KI-Anbindungen (falls aktiv) und die Briefings der Manager ziehen sich exakt diese Daten, um Texte und Creatives vorzuschlagen.
                                </TipBox>
                                <PlaceholderImage
                                    title="Digitale Positionierung bearbeiten" icon={Target} color="#6366f1"
                                    description="Zeigt das Formular mit den Feldern für DNA, USPs, Tone-of-Voice im Edit-Modus."
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem id="section-1" title="Systemeinstellungen & Integrationen" icon={Settings} color="#8b5cf6">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>Unter "Einstellungen" managst du globale Parameter, Notifications und vor allem die API-Anbindungen.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Firmenprofil:</strong> Ändere den Namen und das globale Branding.</li>
                                    <li><strong>Kanäle & Touchpoints (Verwaltung):</strong> Du hast Vollzugriff auf die Central-Verwaltung aller Marketing-Kanäle. Stelle sicher, dass alle verwendeten Touchpoints (Google Ads, LinkedIn, E-Mail-CRM, etc.) hier hinterlegt sind, damit Manager später darauf aufbauen können.</li>
                                    <li><strong>Integrationen:</strong> Hier hinterlegst du in Zukunft API-Keys für OpenAI, Meta Ads, Google Analytics oder LinkedIn. Diese Keys werden systemweit verschlüsselt genutzt.</li>
                                    <li><strong>Benachrichtigungen:</strong> Lege fest, ob das System bei neuen Kampagnen oder kritischen Budget-Grenzen Warnmails versendet.</li>
                                </ul>
                                <PlaceholderImage
                                    title="Einstellungs-Dashboard" icon={Settings} color="#8b5cf6"
                                    description="Zeigt den Tab 'Integrationen' mit leeren/verborgenen API-Key Eingabefeldern für externe Plattformen."
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem id="section-2" title="Benutzerverwaltung & Berechtigungen" icon={Users2} color="#ec4899">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>Im Tab "Team" oder "Benutzerverwaltung" (innerhalb der Einstellungen) hast du als einziger die Macht, das Rollenkonzept zu steuern.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>Neuen Mitarbeitern musst du initial eine Rolle zuweisen. Standardmäßig sind neue Accounts "Member".</li>
                                    <li><strong>Manager:</strong> Dürfen Kampagnen, Zielgruppen und Budgets erstellen und verwalten. Zudem können sie Elemente (Kampagnen, Touchpoints, Personas, Content, Aufgaben etc.) löschen.</li>
                                    <li><strong>Member:</strong> Können nur Aufgaben sehen und abarbeiten. Sie sehen keine Budgets, können keine wesentlichen Elemente löschen und haben keinen Zugriff auf Einstellungen.</li>
                                </ul>
                                <TipBox title="Sicherheit">
                                    Befördere Nutzer nur zum Admin, wenn sie wirklich globale Systemeinstellungen (wie API-Keys) ändern dürfen. In 90% der Fälle ist die Manager-Rolle für Teamleiter völlig ausreichend.
                                </TipBox>
                            </div>
                        </AccordionItem>
                    </div>
                )}

                {/* ═══ MANAGER WORKFLOW ═══ */}
                {activeTab === 'manager' && (
                    <div className="animate-in" style={{ animation: 'fadeIn 0.3s' }}>
                        <TableOfContents sections={managerSections} />

                        <div style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Einleitung: Die Manager-Rolle</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-md)' }}>
                                Als <strong>Manager</strong> bist du der Taktgeber des Marketing-Teams. Du entwirfst <strong>Zielgruppen</strong>, formst <strong>Kampagnen</strong>, steuerst das <strong>Budget</strong> und befüllst den <strong>Content-Kalender</strong>.
                                Du behältst die Deadlines im Auge und delegierst konkrete <strong>Aufgaben</strong> an die Members, die dann die visuelle und textliche Umsetzung übernehmen.
                            </p>
                        </div>

                        <AccordionItem title="1. Zielgruppen (Personas) anlegen" icon={Users2} color="#10b981" defaultOpen={true}>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> `Marketing &gt; Zielgruppen`</p>
                                <p style={{ marginBottom: '16px' }}>Bevor eine Kampagne startet, musst du wissen, wen sie ansprechen soll. Unter "Marketing &gt; Zielgruppen" verwaltest du Buyer Personas.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>Pflege Demografie, Branche und Jobtitel detailliert ein.</li>
                                    <li>Definiere die <strong>Wünsche & Ziele</strong> sowie die <strong>Frustrationen</strong> der Persona, da diese als direkte Vorlage für Anzeigentexte (Ad Copy) dienen.</li>
                                    <li>Verknüpfe am Ende eine Zielgruppe fest mit einer neuen Kampagne.</li>
                                </ul>
                                <PlaceholderImage
                                    title="Zielgruppen-Detailansicht" icon={Users2} color="#10b981"
                                    description="Zeigt die Karteikarte einer Buyer Persona mit deren Zielen und Frustrationen."
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem title="2. Customer Journey (ASIDAS-Modell) planen" icon={Map} color="#ec4899">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> `Marketing &gt; Customer Journey`</p>
                                <p style={{ marginBottom: '16px' }}>Das ASIDAS-Funnel ist dein strategisches Tool, um die Customer Journey psychologisch abzubilden und die richtigen Inhalte zum richtigen Zeitpunkt bereitzustellen.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Zur Journey gehen:</strong> Klick auf "Marketing &gt; Customer Journey" und wähle eine Zielgruppe/Persona aus</li>
                                    <li><strong>ASIDAS verstehen:</strong> Die Phasen sind: Attention (Aufmerksamkeit), Search (Suche), Interest (Interesse), Desire (Verlangen), Action (Handlung), Share (Weitergabe). Search und Share sind omnipräsent.</li>
                                    <li><strong>Touchpoints zuordnen:</strong> Pro Phase siehst du, welche Kanäle aktiv sind (aus "Kanäle & Touchpoints"). So erkennst du sofort: "Für die Interest-Phase haben wir noch keinen Instagram-Content."</li>
                                    <li><strong>Content verlinken:</strong> Deep-Linking zu deinem Content (aus Content-Kalender). Mit Klick öffnet sich das Modal mit detaillierten Infos.</li>
                                    <li><strong>Performance-Insights:</strong> Jede Phase zeigt KPIs und Trends, damit du sieht, wo die Journey "stockt".</li>
                                </ul>
                                <PlaceholderImage
                                    title="Customer Journey ASIDAS Board" icon={Map} color="#ec4899"
                                    description="Zeigt das ASIDAS-Funnel mit den 6 Phasen, den Touchpoints, dem verlinkten Content und Performance-Metriken pro Phase."
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem title="3. Kampagnen orchestrieren" icon={Megaphone} color="#10b981">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> `Marketing &gt; Kampagnen &gt; Neue Kampagne`</p>
                                <p style={{ marginBottom: '16px' }}>Kampagnen sind das Herzstück. Hier laufen Budgets, Content und Performance-Daten zusammen.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Erstellung:</strong> Klicke auf "Neue Kampagne". Setze Start-/Enddatum, Zielsetzung (Brand Awareness, Lead Gen) und weise Zielgruppen zu.</li>
                                    <li><strong>Detailansicht:</strong> Öffne eine laufende Kampagne. Du siehst nun ein Dashboard mit vier Reitern: Übersicht, Creatives & Aufgaben, Content, Performance.</li>
                                    <li>Nutze die Kampagnenansicht, um exakt für dieses Thema neuen Content und neue Aufträge an dein Team zu kreieren.</li>
                                </ul>
                                <TipBox title="Kampagnen-Fokus">
                                    Kampagnen können Plattform-übergreifend sein. Du kannst z.B. eine "Q3 Webinar" Kampagne anlegen und darunter Content für E-Mail, LinkedIn und Google Ads bündeln.
                                </TipBox>
                            </div>
                        </AccordionItem>

                        <AccordionItem title="4. Kanäle & Touchpoints verwalten" icon={Megaphone} color="#14b8a6">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> `Marketing &gt; Kanäle & Touchpoints` oder Admin-Settings</p>
                                <p style={{ marginBottom: '16px' }}>Die zentrale Übersicht aller Marketing-Kanäle ist das Fundament für erfolgreiche Multi-Channel-Kampagnen.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Single-Source-of-Truth:</strong> Hier ist der zentrale Ort, wo alle Marketingkanäle konsistent gepflegt werden. Sorge dafür, dass Links, Beschreibungen und Kanaltypen aktuell sind. Manager und Admins können Touchpoints bearbeiten und überflüssige Kanäle löschen.</li>
                                    <li><strong>Bidirektionale Analyse:</strong> Klicke auf einen Kanal und sieh sofort: a) Welche Kampagnen spielen gerade auf diesem Kanal aus? b) Welche Content-Stücke sind verplant?</li>
                                    <li><strong>Tiefe Verknüpfung:</strong> Von jedem Touchpoint kannst du direkt in die zugehörigen Kampagnen und Content-Details springen.</li>
                                </ul>
                                <PlaceholderImage
                                    title="Kanäle & Touchpoints Übersicht" icon={Megaphone} color="#14b8a6"
                                    description="Zeigt eine Liste/Kartenansicht aller verfügbaren Marketing-Kanäle mit Typ-Badges (Paid, Owned, Earned) und den verlinkten Kampagnen/Inhalten."
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem title="5. Content-Kalender & Redaktionsplanung" icon={Calendar} color="#f59e0b">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> `Marketing &gt; Content-Kalender`</p>
                                <p style={{ marginBottom: '16px' }}>Der Content-Kanal ist dein Redaktionsplan. Er bündelt alle Beiträge über alle Plattformen in einer Kalender- und Listenansicht.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Content planen:</strong> Klicke auf "Content planen" oben rechts. Wähle Datum, Plattform (LinkedIn, Blog, etc.) und hänge den Content an eine Kampagne an (optional).</li>
                                    <li><strong>🚨 Kritischer Schritt - Aufgabenhüllen erstellen:</strong> Ein reiner Kalendereintrag (Idee) bedeutet noch nicht, dass jemand daran arbeitet! Wenn du Content erstellst, setze den Haken bei <strong>"Aufgabenhülle erstellen"</strong>.</li>
                                    <li><strong>Warnsystem:</strong> Content ohne verknüpfte Aufgabe erscheint im Kalender <strong style={{ color: '#ef4444' }}>rot markiert</strong> und mit einem Warn-Icon. So siehst du sofort, wo du noch ein Team-Mitglied briefen musst.</li>
                                </ul>
                                <PlaceholderImage
                                    title="Content-Kalender mit roten Warnungen" icon={Calendar} color="#f59e0b"
                                    description="Zeigt den Monatskalender. Manche Einträge sind sauber farbig, manche leuchten rot wegen fehlenden Aufgaben."
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem title="6. Aufgaben-Delegation (Das Briefing)" icon={CheckSquare} color="#f59e0b">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> `Marketing &gt; Aufgaben` (Kanban-Board)</p>
                                <p style={{ marginBottom: '16px' }}>Wenn der Content feststeht, musst du der Umsetzung (den Members) genau erklären, was zu tun ist.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>Gehe auf die Registerkarte "Aufgaben" oder wähle eine Aufgabe direkt aus der Kampagnen/Content-Ansicht.</li>
                                    <li>Öffne das Aufgaben-DetailModal. Weise die Aufgabe über das Dropdown "Zugewiesen an:" einem Member zu.</li>
                                    <li>Befülle die <strong>Beschreibung</strong> mit einem genauen Briefing. (Was für Bilder? Welcher Text? Welche Deadline?).</li>
                                    <li>Sobald die Aufgabe den Status "Draft" (Entwurf) verlässt und auf "To Do" springt, sieht das Member die Aufgabe auf seinem Dashboard.</li>
                                </ul>
                            </div>
                        </AccordionItem>

                        <AccordionItem title="7. Budget & Controlling" icon={Wallet} color="#3b82f6">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> `Marketing &gt; Budget & Controlling`</p>
                                <p style={{ marginBottom: '16px' }}>Als Manager musst du die Kosten im Blick behalten. Die Budget-Ansicht hilft dir dabei.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>Dort siehst du den Forecast ("Plan") vs. die tatsächlichen "Ist"-Kosten.</li>
                                    <li><strong>Transparenz:</strong> Klicke auf "Ausgabe erfassen", um Tools (Abo-Kosten) oder Freelancer-Rechnungen manuell zum System hinzuzufügen, falls es keine direkte API-Anbindung gibt.</li>
                                    <li>Das System warnt dich, wenn eine Kampagne zu nah an das veranschlagte Budget-Limit gerät.</li>
                                </ul>
                                <TipBox title="Members und Budgets">
                                    Keine Sorge um sensible Daten: Accounts mit der Rolle "Member" haben keinerlei Zugriff auf die Navigation "Budget & Controlling".
                                </TipBox>
                                <PlaceholderImage
                                    title="Budget-Dashboard Plan vs Ist" icon={Wallet} color="#3b82f6"
                                    description="Zeigt ein Balkendiagramm mit blauen (Plan) und türkisen (Ist) Balken und Kostenverteilungs-Kuchen."
                                />
                            </div>
                        </AccordionItem>
                    </div>
                )}

                {/* ═══ MEMBER WORKFLOW ═══ */}
                {activeTab === 'member' && (
                    <div className="animate-in" style={{ animation: 'fadeIn 0.3s' }}>
                        <TableOfContents sections={memberSections} />

                        <div style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Einleitung: Die Member-Rolle</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-md)' }}>
                                Als <strong>Member</strong> (z.B. Creator, Texter, Designer) liegt dein absoluter Fokus auf der <strong>kreativen Umsetzung</strong>.
                                Du wirst nicht durch schwerfällige Strategie-Fenster oder Budget-Zahlen abgelenkt.
                                Dein täglicher Workflow besteht aus: Dashboard checken, Briefing lesen, Aufgabe abarbeiten, Dateien ablegen und Status aktualisieren.
                            </p>
                        </div>

                        <AccordionItem title="1. Der Start in den Tag: Das Dashboard" icon={LayoutDashboard} color="#f59e0b" defaultOpen={true}>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>Dein erster Klick führt dich auf das <strong>Dashboard</strong>.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>Hier hast du das Panel <strong>"Meine Aufgabenliste"</strong>. Dort landen alle Tickets, die dir von Managern zugewiesen wurden.</li>
                                    <li>Aufgaben, die für heute oder morgen fällig sind, springen dir sofort in der Deadline-Übersicht ins Auge.</li>
                                </ul>
                                <PlaceholderImage
                                    title="Dein Persönliches Dashboard" icon={LayoutDashboard} color="#f59e0b"
                                    description="Zeigt die Dashboard-Startseite mit Fokus auf die Tabelle 'Meine letzten Tasks' und offene Tickets."
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem title="2. Das Briefing lesen" icon={FileText} color="#ec4899">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>Klicke in der Liste oder auf dem Kanban-Board auf eine Aufgabe, um das <strong>Aufgaben-Details Modal</strong> zu öffnen.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>In der Mitte liest du die ausführliche <strong>Beschreibung</strong> des Managers. Das ist dein Arbeitsauftrag.</li>
                                    <li><strong>Kontext:</strong> Oftmals hängt eine Aufgabe an einem übergeordneten Content-Plan. Unter der Sektion <strong>"Zugehöriger Content"</strong> siehst du sofort, ob dieser Post z.B. für Instagram oder LinkedIn gedacht ist und an welchem Tag es veröffentlicht wird.</li>
                                    <li>Mit einem Klick auf den verlinkten Content oder die verlinkte Kampagne kannst du dir weiteres Hintergrundwissen holen.</li>
                                </ul>
                                <TipBox title="Bei Unklarheiten">
                                    Wenn das Briefing in der Beschreibung nicht eindeutig ist, setze den Status auf "Blocked / Fehler" und schreib in dem Fall den Manager über Teams/Slack an.
                                </TipBox>
                            </div>
                        </AccordionItem>

                        <AccordionItem title="3. Umsetzung & OneDrive Link eintragen" icon={LinkIcon} color="#ec4899">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>Du produzierst nun das Video, das Bild oder schreibst den Copy-Text. Da die App absichtlich keine Filespeicherung betreibt (um Speicherplatzkosten zu sparen), passiert die Dateiablage bei euch extern:</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>Lege das fertige Creative (als PNG, MP4, PDF) auf eurem Firmen-Speicher (z.B. Microsoft OneDrive, Google Drive, SharePoint) in den korrekten Kundenordner.</li>
                                    <li>Kopiere dort den Freigabe-Link (Share-Link).</li>
                                    <li>Gehe in der App wieder in die Aufgabe rein. Klicke auf <strong>"Bearbeiten"</strong>.</li>
                                    <li>Füge den Link unten bei <strong>"Ressourcen Link (OneDrive / Drive)"</strong> ein und speichere.</li>
                                </ul>
                                <p>Jetzt hat der Manager sofortigen Zugriff auf die finale hochauflösende Datei, ohne danach suchen zu müssen.</p>
                                <PlaceholderImage
                                    title="Aufgaben-Ansicht: Dateiverlinkung" icon={LinkIcon} color="#ec4899"
                                    description="Skizziert das geöffnete Aufgaben-Fenster, besonders den Eingabebereich für den OneDrive Link."
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem title="4. Den Kanban-Status pflegen" icon={CheckSquare} color="#14b8a6">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}>Status-Hygiene ist das wichtigste in der Zusammenarbeit. Das Marketing Powerhouse arbeitet mit einem 5-Spalten-Kanban (auf der Seite "Aufgaben").</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>To Do:</strong> Hier liegt alles, was du noch anfangen musst.</li>
                                    <li><strong>In Progress:</strong> Wechsle den Status hierauf, sobald du anfängst zu bearbeiten. So weiß der Manager: "Ah, da ist er dran".</li>
                                    <li><strong>In Review:</strong> Du hast den OneDrive-Link hinzugefügt und dein Creative ist fertig? Setze den Status auf In Review. Das ist das Zeichen für den Manager, deine Arbeit freizugeben.</li>
                                    <li><strong>Done:</strong> Sobald der Manager sein OK gegeben hat (oder der Content publiziert ist), wandert das Ticket auf "Done". Das macht primär der Manager, aber auch du kannst Tickets abschließen.</li>
                                </ul>
                                <PlaceholderImage
                                    title="Das Kanban-Board" icon={CheckSquare} color="#14b8a6"
                                    description="Zeigt das Aufgaben-Board mit den Spalten 'To Do', 'In Bearbeitung', etc. und den verschiebbaren Aufgabenkarten."
                                />
                            </div>
                        </AccordionItem>
                    </div>
                )}

                {/* ═══ WORKFLOWS ÜBERSICHT ═══ */}
                {activeTab === 'workflows' && (
                    <div className="animate-in" style={{ animation: 'fadeIn 0.3s' }}>
                        <div style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Typische Workflows</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-md)' }}>
                                Diese Übersicht zeigt die im System durchgeführten Workflows. Für detaillierte Beispiele siehe das Dokument <strong>WORKFLOWS.md</strong> (im Root-Verzeichnis).
                            </p>
                        </div>

                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '24px', marginTop: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <GitBranch size={24} style={{ color: '#6366f1' }} />
                            Rollenübergreifende Workflows
                        </h3>

                        <WorkflowCard
                            title="🔧 System-Einrichtung & Initialsetup"
                            duration="2-3 Tage"
                            roles="Admin + Manager"
                            description="Vorbereitung des Systems für die erste Kampagne. Positionierung, Kanäle, Team-Setup."
                            steps={[
                                { title: 'Positionierung', description: 'Admin füllt digitale Positionierung aus (DNA, Identität, Keywords)' },
                                { title: 'Kanäle einrichten', description: 'Admin/Manager richten Touchpoints ein (Google, LinkedIn, E-Mail, etc.)' },
                                { title: 'Rollen zuweisen', description: 'Admin weist Rollen zu (Manager, Member mit spezifischen Abteilungen)' },
                                { title: 'Kickoff-Briefing', description: 'Admin + Manager diskutieren Strategie, Budget, KPIs' }
                            ]}
                        />

                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '24px', marginTop: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Users size={24} style={{ color: '#10b981' }} />
                            Manager-Workflows
                        </h3>

                        <WorkflowCard
                            title="📋 Kampagnen-Planung & Launch"
                            duration="3-5 Tage"
                            roles="Manager"
                            description="Komplette Vorbereitung einer Kampagne von Personas bis zur Aufgabendelegation."
                            steps={[
                                { title: 'Personas', description: 'Zielgruppen mit Demografie, Zielen, Frustrationen anlegen' },
                                { title: 'Journey mappen', description: 'ASIDAS-Phasen durchplanen, Touchpoints zuordnen' },
                                { title: 'Kampagne erstellen', description: 'Kampagne mit Budget, Master-Prompt, Keywords anlegen' },
                                { title: 'Content planen', description: '4-12 Wochen Content im Kalender eintragen (mit Aufgabenhüllen!)' },
                                { title: 'Tasks delegieren', description: 'Detaillierte Briefs schreiben, Members assign, Deadlines setzen' },
                                { title: 'Budget setup', description: 'Budgets pro Kanal/Kampagne festlegen, Tracking aktivieren' }
                            ]}
                        />

                        <WorkflowCard
                            title="📊 Ongoing Campaign Management"
                            duration="12 Wochen (kontinuierlich)"
                            roles="Manager"
                            description="Tägliches & wöchentliches Monitoring, Performance-Reviews, Team-Koordination."
                            steps={[
                                { title: 'Täglich (15 min)', description: 'Dashboard checken, kritische Tasks priorisieren' },
                                { title: 'Wöchentlich (1-2 Std)', description: 'Standup, Performance-Tracking, Content-Review & Approval' },
                                { title: 'Monatlich (2-3 Std)', description: 'KPI-Report, Budget-Check, Strategy-Sync mit Admin' },
                                { title: 'Laufend', description: 'Kanban-Status monitoren, Blockers auflösen, Content optimieren' }
                            ]}
                        />

                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '24px', marginTop: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Zap size={24} style={{ color: '#f59e0b' }} />
                            Member-Workflows
                        </h3>

                        <WorkflowCard
                            title="🎨 Content Production (z.B. Lisa — Social Media)"
                            duration="Daily / Pro Aufgabe 1-2 Std"
                            roles="Member (Creator/Texter)"
                            description="Aufgaben lesen, Content produzieren, Dateien verlinken, Status aktualisieren."
                            steps={[
                                { title: 'Morgen-Check', description: 'Dashboard öffnen, wöchentliche Aufgaben überfliegen' },
                                { title: 'Briefing lesen', description: 'Aufgabe öffnen, Beschreibung detailliert studieren' },
                                { title: 'Content erstellen', description: 'LinkedIn Posts, Instagram Stories, Blog-Grafiken produzieren' },
                                { title: 'Upload & Link', description: 'Datei auf OneDrive hochladen, Share-Link in App eintragen' },
                                { title: 'Status "In Review"', description: 'Manager benachrichtigen, dass Content zur Freigabe bereit ist' },
                                { title: 'Feedback-Loop', description: 'Bei Überarbeitungen: v2 hochladen, warten auf "Done"' }
                            ]}
                        />

                        <WorkflowCard
                            title="📈 Performance Tracking (z.B. Tom — Ads Specialist)"
                            duration="Weekly / Setup 1 Tag, dann 2-3 Std/Woche"
                            roles="Member (Performance Marketing)"
                            description="Ads-Kampagnen setup, Performance-Daten tracken, wöchentliche Reports erstellen."
                            steps={[
                                { title: 'Campaign Setup', description: 'Google Ads / LinkedIn Ads in Manager-Tool konfigurieren' },
                                { title: 'Budget & Bidding', description: 'Tägliche Budgets, Bid-Strategien, Landing Pages verlinken' },
                                { title: 'Wöchentliches Tracking', description: 'KPIs (Impr, Clicks, CTR, CPC, Conv.) extrahieren' },
                                { title: 'Report erstellen', description: 'Screenshots + Annotationen hochladen, Insights schreiben' },
                                { title: 'Optimierung', description: 'Underperforming Keywords ausschließen, Copy-Tests starten' }
                            ]}
                        />

                        <WorkflowCard
                            title="💌 E-Mail & Community (z.B. Jana — Support)"
                            duration="Sequences: 2-3 Std, dann laufend 5-10 Std/Woche"
                            roles="Member (Community/Support)"
                            description="E-Mail-Sequenzen schreiben, Automation konfigurieren, Support-Tickets bearbeiten."
                            steps={[
                                { title: 'Sequence Design', description: 'E-Mail-Serien schreiben (Anmeldung, Follow-up, Upsell)' },
                                { title: 'Automation Setup', description: 'E-Mail-Tool konfigurieren (Trigger, Verzögerungen, Links)' },
                                { title: 'Testing', description: 'Test-Sends an sich selbst + Manager, Feedback einholen' },
                                { title: 'Launch', description: 'Automation aktivieren, Metriken (Opens, CTR, Conversions) monitoren' },
                                { title: 'Support-Tickets', description: 'Anfragen von Leads bearbeiten, Community-Fragen im Portal beantworten' }
                            ]}
                        />

                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '24px', marginTop: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Settings size={24} style={{ color: '#8b5cf6' }} />
                            Admin-Workflows
                        </h3>

                        <WorkflowCard
                            title="🛡️ System Monitoring & Strategy"
                            duration="Weekly 1-2 Std, Monthly 2-3 Std"
                            roles="Admin"
                            description="System-Health checken, Positionierung aktualisieren, Strategic Reviews mit Management."
                            steps={[
                                { title: 'Wöchentliche Überprüfung', description: 'Positionierung review, Budget-Alerts, Team-Feedback' },
                                { title: 'Performance-Reports', description: 'KPI-Dashboards checken, Trends identifizieren' },
                                { title: 'Monthly Strategy Sync', description: 'Mit Managern besprechen: Was läuft gut? Was anpassen?' },
                                { title: 'Adjustments', description: 'Positionierung updaten, Rollen-Anpassungen, API-Integrationen' },
                                { title: 'Campaign Close-Out', description: 'Final Reports, Lessons Learned dokumentieren' }
                            ]}
                        />

                        <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
                                <strong>📖 Hinweis:</strong> Für ausführliche Workflow-Beispiele mit konkreten Schritten und Screenshots siehe das Dokument <strong>WORKFLOWS.md</strong> im Root-Verzeichnis des Projekts. Dort findest du ein komplettes fiktives Szenario (CTFL v4.0 Schulungs-Kampagne) mit realen Personen, Timings und Beispiel-Inhalten.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
