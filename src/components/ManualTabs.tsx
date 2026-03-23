import {
    Target, Users2, Megaphone, Calendar, CheckSquare, Wallet,
    Map, GitBranch, Users, Zap, LayoutDashboard, FileText,
    LinkIcon, Settings, Bell
} from 'lucide-react';
import { PlaceholderImage, TipBox, AccordionItem, TableOfContents, WorkflowCard } from './ManualComponents';
interface TabProps {
    sections: string[];
}

export function ManagerTab({ sections }: TabProps) {
    return (
        <div className="animate-in" style={{ animation: 'fadeIn 0.3s' }}>
                        <TableOfContents sections={sections} />

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

                        <AccordionItem title="2. Customer Journey (5-Phasen-Modell) planen" icon={Map} color="#ec4899">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> `Marketing &gt; Customer Journey`</p>
                                <p style={{ marginBottom: '16px' }}>Das 5-Phasen-Modell ist dein strategisches Tool, um die Customer Journey psychologisch abzubilden und die richtigen Inhalte zum richtigen Zeitpunkt bereitzustellen.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Zur Journey gehen:</strong> Klick auf "Marketing &gt; Customer Journey" und wähle eine Zielgruppe/Persona aus</li>
                                    <li><strong>Die 5 Phasen verstehen:</strong> Die Phasen sind: Awareness (Aufmerksamkeit), Consideration (Abwägung), Purchase (Kauf), Retention (Kundenbindung) und Advocacy (Empfehlung).</li>
                                    <li><strong>Touchpoints zuordnen:</strong> Pro Phase siehst du, welche Kanäle aktiv sind (aus "Kanäle & Touchpoints"). So erkennst du sofort: "Für die Interest-Phase haben wir noch keinen Instagram-Content."</li>
                                    <li><strong>Content verlinken:</strong> Deep-Linking zu deinem Content (aus Content-Kalender). Mit Klick öffnet sich das Modal mit detaillierten Infos.</li>
                                    <li><strong>Performance-Insights:</strong> Jede Phase zeigt KPIs und Trends, damit du sieht, wo die Journey "stockt".</li>
                                </ul>
                                <PlaceholderImage
                                    title="Customer Journey 5-Phasen Board" icon={Map} color="#ec4899"
                                    description="Zeigt das Journey-Board mit den 5 Phasen, den Touchpoints, dem verlinkten Content und Performance-Metriken pro Phase."
                                />
                            </div>
                        </AccordionItem>

                        <AccordionItem title="3. Kampagnen orchestrieren" icon={Megaphone} color="#10b981">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> `Marketing &gt; Kampagnen &gt; Neue Kampagne`</p>
                                <p style={{ marginBottom: '16px' }}>Kampagnen sind das Herzstück. Hier laufen Budgets, Content und Performance-Daten zusammen.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Erstellung:</strong> Klicke auf "Neue Kampagne". Setze Start-/Enddatum, Zielsetzung (Brand Awareness, Lead Gen) und weise Zielgruppen zu.</li>
                                    <li><strong>Verantwortlicher Manager:</strong> Weise jeder Kampagne einen verantwortlichen Manager zu. Dieser dient als Hauptansprechpartner und Entscheider für die Kampagne.</li>
                                    <li><strong>Team-Mitglieder:</strong> Plane Team-Mitglieder für die Kampagne ein. Auf der Kampagnen-Karte und in der Detailansicht siehst du sofort, wer an der Kampagne arbeitet.</li>
                                    <li><strong>Detailansicht:</strong> Öffne eine laufende Kampagne. Du siehst nun ein Dashboard mit vier Reitern: Übersicht, Creatives & Aufgaben, Content, Performance. In der Übersicht werden Manager und Team prominent angezeigt.</li>
                                    <li><strong>Kanal-KPIs (Performance-Tab):</strong> Im Performance-Reiter siehst du neben den aggregierten Kampagnen-KPIs auch eine <strong>Aufschlüsselung pro Kanal/Touchpoint</strong>. So erkennst du sofort, welcher Kanal die meisten Conversions bringt und wo der CPC am effizientesten ist.</li>
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
                                    <li><strong>Kanal-KPIs:</strong> Jeder aktive Touchpoint zeigt <strong>aggregierte Performance-Daten</strong> (Impressions, Clicks, CTR, Spend, CPC, CPA) direkt auf der Karte und im Detail-Modal. Im Detail-Modal siehst du zudem die <strong>Aufschlüsselung nach Kampagne</strong>, damit du weißt, welche Kampagne auf diesem Kanal besonders gut performt.</li>
                                    <li><strong>Bidirektionale Analyse:</strong> Klicke auf einen Kanal und sieh sofort: a) Welche Kampagnen spielen gerade auf diesem Kanal aus? b) Welche Content-Stücke sind verplant? c) Wie performt der Kanal insgesamt und pro Kampagne?</li>
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
                                    <li><strong>Notification-Center nutzen:</strong> Neue Zuweisungen und Statuswechsel erscheinen in Echtzeit über das Glocken-Symbol oben rechts. So bleiben Manager und Member synchron, ohne manuelles Refresh.</li>
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
                                    <li>Ab kritischen Schwellwerten erhältst du zusätzlich <strong>Budget-Alerts</strong> im Notification-Center (&gt;=80% Warnung, &gt;=100% dringender Alert).</li>
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
                        <AccordionItem title="8. Notification-Center (Glocke)" icon={Bell} color="#ef4444">
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '16px' }}><strong>Navigation:</strong> Header oben rechts → Glocke</p>
                                <p style={{ marginBottom: '16px' }}>Das Notification-Center zeigt dir alle wichtigen Ereignisse in Echtzeit und reduziert Abstimmungsaufwand im Team.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Badge:</strong> Zahl auf der Glocke zeigt ungelesene Benachrichtigungen.</li>
                                    <li><strong>Filter durch Settings:</strong> Sichtbarkeit folgt den Einstellungen in <strong>Einstellungen → Benachrichtigungen</strong>.</li>
                                    <li><strong>Direktnavigation:</strong> Klick auf einen Eintrag führt zur relevanten Seite (Aufgabe, Kampagne, Budget, Content).</li>
                                    <li><strong>Pflege:</strong> Einzelne Einträge können archiviert werden (X), alle auf einmal als gelesen via "Alle gelesen".</li>
                                </ul>
                            </div>
                        </AccordionItem>

                    </div>
    );
}

export function WorkflowsTab() {
    return (
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
                                { title: 'Journey mappen', description: 'Die 5 Phasen durchplanen, Touchpoints zuordnen' },
                                { title: 'Kampagne erstellen', description: 'Kampagne mit Budget, Master-Prompt, Keywords anlegen' },
                                { title: 'Content planen', description: '4-12 Wochen Content im Kalender eintragen (mit Aufgabenhüllen!)' },
                                { title: 'Tasks delegieren', description: 'Detaillierte Briefs schreiben, Members assign, Deadlines setzen' },
                                { title: 'Budget setup', description: 'Budgets pro Kanal/Kampagne festlegen, Tracking aktivieren' },
                                { title: 'Notifications steuern', description: 'Notification-Settings prüfen und Echtzeit-Alerts aktiv für kritische Signale nutzen' }
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
                            description="Ads-Kampagnen setup, Performance-Daten tracken, wöchentliche Reports erstellen. Nutze die Kanal-KPIs in der Kampagnen-Detailansicht und der Touchpoint-Übersicht für einen schnellen Überblick."
                            steps={[
                                { title: 'Campaign Setup', description: 'Google Ads / LinkedIn Ads in Manager-Tool konfigurieren' },
                                { title: 'Budget & Bidding', description: 'Tägliche Budgets, Bid-Strategien, Landing Pages verlinken' },
                                { title: 'Wöchentliches Tracking', description: 'KPIs (Impr, Clicks, CTR, CPC, Conv.) extrahieren – auch kanalspezifisch in der Performance-Ansicht der Kampagne' },
                                { title: 'Report erstellen', description: 'Screenshots + Annotationen hochladen, Insights schreiben' },
                                { title: 'Optimierung', description: 'Underperforming Keywords ausschließen, Copy-Tests starten, Kanäle mit schlechtem CPA/CPC identifizieren' }
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
    );
}
