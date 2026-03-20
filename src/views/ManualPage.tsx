import { useState } from 'react';
import {
    HelpCircle, LayoutDashboard, Target, Users2, Megaphone,
    Calendar, CheckSquare, Wallet, Settings, CheckCircle,
    FileText, Lightbulb, UserCheck, Search, Image as ImageIcon,
    MessageSquare, AlertTriangle, Link as LinkIcon, Map,
    GitBranch, Clock, Users, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PlaceholderImage, SectionTitle, TipBox, AccordionItem, TableOfContents, WorkflowCard } from '../components/ManualComponents';
import { ManagerTab, WorkflowsTab } from '../components/ManualTabs';

export default function ManualPage() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<string>(
        currentUser?.role === 'company_admin' ? 'admin' : (currentUser?.role || 'admin')
    );

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
        'Zielgruppen (Personas) anlegen, 5-Phasen Journey skizzieren & Kampagne erstellen',
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
                                    <li><strong>Kanäle & Touchpoints (Verwaltung):</strong> Du hast Vollzugriff auf die Central-Verwaltung aller Marketing-Kanäle. Stelle sicher, dass alle verwendeten Touchpoints (Google Ads, LinkedIn, E-Mail-CRM, etc.) hier hinterlegt sind, damit Manager später darauf aufbauen können. Jeder Touchpoint zeigt automatisch seine aggregierten <strong>Kanal-KPIs</strong> (Impressions, Clicks, CTR, Spend, CPC, CPA).</li>
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
                {activeTab === 'manager' && <ManagerTab sections={managerSections} />}

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
                {activeTab === 'workflows' && <WorkflowsTab />}
            </div>
        </div>
    );
}
