// Mock data for UI prototype - Customized for WAMOCON Academy

// ─────────────────────────────────────────────
// TEST-BENUTZER (für alle 3 Rollen)
// ─────────────────────────────────────────────

export const testUsers = [
    {
        id: 'u1',
        name: 'Daniel Moretz',
        email: 'daniel@test-it-academy.de',
        password: 'admin123',
        role: 'admin',
        jobTitle: 'Akkreditierter ISTQB®-Trainer / Testmanager',
        avatar: 'DM',
        status: 'online',
        department: 'Geschäftsführung & Training',
        phone: '+49 123 456789-0',
        joinedAt: '2015-01-01',
    },
    {
        id: 'u2',
        name: 'Waleri Moretz',
        email: 'waleri@test-it-academy.de',
        password: 'manager123',
        role: 'manager',
        jobTitle: 'Gründer & Akkreditierter ISTQB®-Trainer',
        avatar: 'WM',
        status: 'online',
        department: 'Training & Qualität',
        phone: '+49 123 456789-1',
        joinedAt: '1998-01-01',
    },
    {
        id: 'u3',
        name: 'Anna Schmidt',
        email: 'anna@test-it-academy.de',
        password: 'manager123',
        role: 'manager',
        jobTitle: 'Marketing Managerin',
        avatar: 'AS',
        status: 'online',
        department: 'Marketing',
        phone: '+49 123 456789-2',
        joinedAt: '2023-05-15',
    },
    {
        id: 'u4',
        name: 'Lisa Bauer',
        email: 'lisa@test-it-academy.de',
        password: 'member123',
        role: 'member',
        jobTitle: 'Content & Social Media',
        avatar: 'LB',
        status: 'away',
        department: 'Marketing',
        phone: '+49 123 456789-3',
        joinedAt: '2024-02-10',
    },
    {
        id: 'u5',
        name: 'Tom Weber',
        email: 'tom@test-it-academy.de',
        password: 'member123',
        role: 'member',
        jobTitle: 'Performance Marketing Experte',
        avatar: 'TW',
        status: 'offline',
        department: 'Performance',
        phone: '+49 123 456789-4',
        joinedAt: '2024-05-01',
    },
    {
        id: 'u6',
        name: 'Jana Klein',
        email: 'jana@test-it-academy.de',
        password: 'member123',
        role: 'member',
        jobTitle: 'Community Support',
        avatar: 'JK',
        status: 'online',
        department: 'Kundenservice',
        phone: '+49 123 456789-5',
        joinedAt: '2024-06-15',
    },
];

// Rückwärtskompatibilität (wird schrittweise ersetzt)
export const currentUser = testUsers[1];

// ─────────────────────────────────────────────
// UNTERNEHMENSPOSITIONIERUNG
// ─────────────────────────────────────────────

export const companyPositioning = {
    // Block 1: Unternehmens-DNA
    name: 'WAMOCON Academy (Test-IT Academy)',
    tagline: 'In 45 Tagen vom Jobsuchenden zum IT-Tester – ganz ohne Programmieren',
    founded: '1998',
    industry: 'IT-Ausbildung & Schulungen',
    headquarters: 'Eschborn / Frankfurt am Main',
    legalForm: 'Academy',
    employees: '1-10',
    website: 'test-it-academy.com',

    // Block 2: Digitale Identität
    vision: 'Wir möchten Quereinsteigern und Jobsuchenden den einfachsten und praxisnahesten Einstieg in die IT ermöglichen, ohne dass sie programmieren können müssen.',
    mission: 'Mit über 25 Jahren Erfahrung, dem DiTeLe Praxis-Tool und 300+ Praxisübungen machen wir unsere Absolventen zu zertifizierten ISTQB®-Testern, die vom ersten Tag an Mehrwert liefern.',
    values: [
        {
            id: 'v1',
            title: 'Praxisnähe',
            icon: '💻',
            description: 'Wir bringen keine trockene Theorie bei, sondern Praxis. Unser eigens entwickeltes DiTeLe Tool ermöglicht 300+ realistische Übungen.',
        },
        {
            id: 'v2',
            title: 'Persönliche Betreuung',
            icon: '🤝',
            description: 'Unsere akkreditierten Trainer (Waleri & Daniel) begleiten jeden Lernenden persönlich — im Webinar, Online oder Präsenz.',
        },
        {
            id: 'v3',
            title: 'Anerkannte Qualität',
            icon: '🏅',
            description: 'Wir bilden nach offiziellem ISTQB® Certified Tester Foundation Level V.4.0 (CTFL) Standard aus und bringen eine hohe Erfolgsquote mit.',
        },
        {
            id: 'v4',
            title: 'Chancengleichheit',
            icon: '🚀',
            description: 'IT ist für alle da. Wir helfen Jobsuchenden, finanziert durch Bildungsgutscheine, einen sicheren und gut bezahlten Job zu finden.',
        },
        {
            id: 'v5',
            title: 'Netzwerk & Community',
            icon: '🌐',
            description: 'Wir bereiten nicht nur auf die Prüfung vor, sondern unterstützen beim Bewerbungsprozess und der Integration in IT-Projekte.',
        },
    ],

    // Block 3: Kommunikations-DNA
    toneOfVoice: {
        adjectives: ['Ermutigend', 'Praxisnah', 'Klar', 'Expertenhaft', 'Persönlich', 'Verständlich'],
        description: 'Wir duzen unsere Zielgruppe (B2C) respektvoll. Wir nehmen ihnen die Angst vor "schwerer IT" und "Programmieren" und vermitteln Zuversicht. Im B2B-Bereich bleiben wir professionell und lösungsorientiert.',
        personality: 'Der erfahrene, aber nahbare Mentor, der dich sicher und mit einem klaren Fahrplan an dein Ziel (das Zertifikat und den Job) führt.',
    },
    dos: [
        'Jobchancen und IT-Quereinstieg betonen',
        '"Ohne Programmieren" erwähnen, um Hürden zu nehmen',
        'Immer auf das kostenlose Webinar verweisen',
        'Praxisbezug (DiTeLe, reale Fälle) in den Vordergrund stellen',
        'Einfache Sprache, Komplexe IT-Begriffe erklären',
    ],
    donts: [
        'Kein trockener Uni-Vorlesungs-Stil',
        'Keine falschen Job-Garantie-Aussagen tätigen',
        'Testen nie als "langweilig" oder "zweitrangig" darstellen',
        'Programmierkenntnisse voraussetzen',
        'Den Bildungsgutschein-Prozess kompliziert aussehen lassen',
    ],

    // Block 4: Zielmarkt
    primaryMarket: 'DACH-Region (Deutschland, Österreich, Schweiz)',
    secondaryMarkets: ['Regionale Firmen im Rhein-Main-Gebiet (B2B)'],
    targetCompanySize: 'Jobsuchende (B2C) & KMU bis Enterprise (B2B Schulungen)',
    targetIndustries: ['Agentur für Arbeit Kunden', 'IT & Softwareentwicklung', 'Finanzen/Banken (Raum FFM)'],

    lastUpdated: '2026-03-10',
    updatedBy: 'Daniel Moretz',
};

// ─────────────────────────────────────────────
// ZIELGRUPPEN / AVATARE / PERSONAS
// ─────────────────────────────────────────────

export const audiences = [
    {
        id: 'a1',
        name: 'Quereinsteiger Quirin',
        type: 'buyer',
        segment: 'B2C',
        color: '#6366f1',
        initials: 'QQ',
        age: '28–45',
        gender: 'Männlich',
        location: 'Deutschland',
        income: 'Aktuell Arbeitssuchend / Umschulung',
        education: 'Abgeschlossene Ausbildung / Studium abseits IT',
        jobTitle: 'Arbeitssuchend',
        interests: ['Neue Karrierechancen', 'Stabiles Einkommen', 'Lernen am PC'],
        painPoints: ['Hat Angst, dass IT zu schwer ist', 'Kann nicht programmieren', 'Sucht berufliche Sicherheit'],
        goals: ['Einen zukunftssicheren Job in der IT', 'Schneller Einstieg (max 45 Tage)', 'Finanzierung über Bildungsgutschein'],
        preferredChannels: ['Facebook', 'Instagram', 'Jobportale', 'Google Search'],
        buyingBehavior: 'Entscheidet nach Vertrauen ins Institut und Unterstützung bei Kostenerstattung.',
        decisionProcess: 'Besucht kostenlose Webinare, spricht persönlich mit den Trainern.',
        journeyPhase: 'Awareness → Consideration',
        description: 'Quirin sucht einen Ausweg aus seiner bisherigen Branche. Er hat gehört, dass in der IT gut bezahlt wird, ist aber unsicher, ob er stark genug in Mathe oder Code ist.',
        campaignIds: ['1', '3'],
        createdAt: '2026-01-15',
        updatedAt: '2026-03-01',
    },
    {
        id: 'a2',
        name: 'HR-Hannah',
        type: 'buyer',
        segment: 'B2B',
        color: '#10b981',
        initials: 'HH',
        age: '35–50',
        gender: 'Weiblich',
        location: 'Rhein-Main Gebiet',
        income: 'k.A.',
        education: 'BWL Studium',
        jobTitle: 'Personalentwicklerin / HR Manager',
        interests: ['Mitarbeiterbindung', 'Weiterbildung', 'Zertifizierungen'],
        painPoints: ['Mitarbeiter für Softwaretests schulen', 'Fehlende Inhouse-Trainingskompetenz', 'Ausfallzeiten reduzieren'],
        goals: ['Das QA-Team standardisiert (ISTQB) schulen', 'Qualität der Software-Releases erhöhen', 'Teambuilding durch gemeinsames Training'],
        preferredChannels: ['LinkedIn', 'Persönliches Netzwerk', 'Google Search'],
        buyingBehavior: 'Bucht Inhouse-Trainings oder Gruppen-Plätze, benötigt offizielle Rechnung und Zertifikat.',
        decisionProcess: 'Vergleicht Anbieter nach ISTQB Akkreditierung und Flexibilität (Online/Vorort).',
        journeyPhase: 'Consideration → Decision',
        description: 'Hannah soll das neue Test-Team weiterbilden und sucht einen verlässlichen, akkreditierten Partner für ISTQB-Schulungen.',
        campaignIds: ['4'],
        createdAt: '2026-01-15',
        updatedAt: '2026-03-02',
    },
    {
        id: 'a3',
        name: 'Berufseinsteigerin Bea',
        type: 'buyer',
        segment: 'B2C',
        color: '#ec4899',
        initials: 'BB',
        age: '22–30',
        gender: 'Weiblich',
        location: 'DACH-Region',
        income: 'Junior Gehalt / Teilzeit',
        education: 'Studium Informatik/Wirtschaftsinformatik',
        jobTitle: 'Junior QA Tester',
        interests: ['Karriere-Aufstieg', 'Lebenslauf aufpolieren', 'Remote Work'],
        painPoints: ['Viel Theorie im Studium, wenig Praxis', 'Steckt im Junior-Level fest', 'Fehlende Zertifizierung'],
        goals: ['ISTQB Foundation Level Zertifikat erhalten', 'Selbstbewusstsein im Testing aufbauen'],
        preferredChannels: ['Instagram', 'YouTube', 'TikTok'],
        buyingBehavior: 'Sucht nach schnellen, flexiblen Online-Kursen. Zahlt ggf. selbst.',
        decisionProcess: 'Vergleicht Preise und Tools. DiTeLe ist ein starkes Argument.',
        journeyPhase: 'Consideration → Purchase',
        description: 'Bea arbeitet schon in der IT, möchte aber den offiziellen ISTQB Stempel, um in ihrem Unternehmen oder am Markt aufzusteigen.',
        campaignIds: ['2', '3'],
        createdAt: '2026-02-10',
        updatedAt: '2026-03-08',
    },
];

// ─────────────────────────────────────────────
// UNTERNEHMENSWEITE SCHLÜSSELBEGRIFFE
// ─────────────────────────────────────────────

export const companyKeywords = [
    { id: 'ck1', term: 'ISTQB®', category: 'Compliance', description: 'Nur offizielle Schreibweise nutzen: ISTQB® Certified Tester' },
    { id: 'ck2', term: 'DiTeLe', category: 'Brand', description: 'Unser exklusives Praxis-Tool für +300 Testszenarien' },
    { id: 'ck3', term: 'Ohne Programmieren', category: 'Value', description: 'Wichtigstes Verkaufsargument für Quereinsteiger' },
    { id: 'ck4', term: 'Bildungsgutschein', category: 'Value', description: 'Förderung durch die Arbeitsagentur (Kostenübernahme)' },
    { id: 'ck5', term: 'Praxisnähe', category: 'Brand', description: 'Nicht nur Folien, sondern echtes Testing' },
    { id: 'ck6', term: 'Akkreditierter Trainer', category: 'Compliance', description: 'Geprüft und zertifiziert. Vertrauenssignal.' },
];

// ─────────────────────────────────────────────
// KAMPAGNEN (erweitert)
// ─────────────────────────────────────────────

export const campaigns = [
    {
        id: '1',
        name: 'Frühlings-Kurs: Präsenz in Eschborn',
        status: 'active',
        startDate: '2026-01-19',
        endDate: '2026-03-20',
        budget: 15000,
        spent: 8450,
        channels: ['Google Ads', 'Meta Ads', 'E-Mail'],
        description: 'Bewerbung des Präsenzkurses inkl. Live-Online ab Mitte März.',
        masterPrompt: `Du bist Performance-Marketing Experte der WAMOCON Academy.

**Marke & Ton:** Ermutigend, zielgerichtet. Du sprichst Jobsuchende an.
**Kernbotschaft:** „In 45 Tagen vom Jobsuchenden zum IT-Tester – 100% gefördert."
**Zielgruppe:** Quereinsteiger Quirin (Arbeitssuchend).

**USPs dieser Kampagne:**
- Präsenzkurs in Eschborn + Flexibilität (Live Online)
- Start: Januar bis März
- 100% finanzierbar über Bildungsgutschein
- Keine Vorkenntnisse nötig

**Dos:** Dringlichkeit zum Kursstart erzeugen. Bildungsgutschein in der Headline erwähnen.
**Don'ts:** Zu technische Fachbegriffe verwenden.`,
        targetAudiences: ['a1'],
        campaignKeywords: ['Präsenzkurs', 'Eschborn', 'Bildungsgutschein', 'Arbeitsamt'],
        kpis: { impressions: 245000, clicks: 12340, conversions: 387, ctr: 5.03 },
        owner: 'Anna Schmidt',
        progress: 65,
    },
    {
        id: '2',
        name: 'Launch DiTeLe Online-Kurs',
        status: 'active',
        startDate: '2026-02-01',
        endDate: '2026-04-30',
        budget: 25000,
        spent: 19200,
        channels: ['YouTube', 'Instagram', 'Google Ads'],
        description: 'Push für den reinen 8-Wochen Online-Kurs CTFL 4.0 mit DiTeLe.',
        masterPrompt: `Du bewirbst unseren neuen 8-Wochen Online-Kurs für ISTQB CTFL 4.0.

**Marke & Ton:** Modern, dynamisch, nutzenfokussiert.
**Kernbotschaft:** „Lerne Softwaretesten. Nicht nur Folien. Hol dir das Zertifikat in 8 Wochen."
**Zielgruppe:** Berufseinsteigerin Bea und ambitionierte Quereinsteiger.

**USPs dieser Kampagne:**
- Echtes Lernen am Praxis-Tool "DiTeLe" (300+ Übungen)
- Zeitlich flexibel (8 Wochen Plan)
- Akkreditierte Trainer beantworten Fragen

**Dos:** Den "Nicht nur Folien"-Ansatz stark betonen. Praxis loben.
**Don'ts:** Den Kurs als "einfach mal durchklicken" darstellen. Qualität muss rüberkommen.`,
        targetAudiences: ['a1', 'a3'],
        campaignKeywords: ['Online-Kurs', 'Selbststudium', 'DiTeLe Tool', '8 Wochen Plan'],
        kpis: { impressions: 890000, clicks: 34500, conversions: 1240, ctr: 3.88 },
        owner: 'Tom Weber',
        progress: 85,
    },
    {
        id: '3',
        name: 'Evergreen: Kostenloses Webinar',
        status: 'active',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        budget: 12000,
        spent: 2400,
        channels: ['Meta Ads', 'LinkedIn', 'E-Mail'],
        description: 'Kontinuierliche Lead-Generierung über unser gratis Info-Webinar.',
        masterPrompt: `E-Mail Automatisierung und Ad-Texte für unser Gratis-Webinar.

**Format & Ton:** Persönliche Einladung von Daniel und Waleri. Reißt Hürden ein.
**Kernbotschaft:** „Möchtest du wissen, ob Softwaretesting das Richtige für dich ist? Finde es im Webinar heraus."
**Zielgruppe:** Quereinsteiger, die noch zögern (Quirin).

**Webinar-Inhalte:**
- Was macht ein Softwaretester?
- Ablauf der Ausbildung.
- Live-Demo: So funktioniert das Testen.

**Dos:** Niederschwellig. Kostenlos und unverbindlich klar hervorheben.
**Don'ts:** "Jetzt buchen"-Druck aufbauen. Im Webinar geht es um Beratung.`,
        targetAudiences: ['a1'],
        campaignKeywords: ['Webinar', 'Kostenlos', 'IT-Einstieg', 'Beratung'],
        kpis: { impressions: 156000, clicks: 8900, conversions: 620, ctr: 5.71 },
        owner: 'Lisa Bauer',
        progress: 100,
    },
    {
        id: '4',
        name: 'B2B: Corporate Inhouse Trainings',
        status: 'planned',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
        budget: 5000,
        spent: 0,
        channels: ['LinkedIn Ads', 'Direct Mail'],
        description: 'Gezielte Ansprache von HR & IT-Leitern für Team-Schulungen.',
        masterPrompt: `B2B Leadgewinnung für unsere ISTQB Firmenschulungen.

**Ton:** Hochprofessionell, lösungsorientiert. Fokus auf ROI und Qualitätssicherung.
**Kernbotschaft:** „Machen Sie Ihr Team fit für den ISTQB-Standard. Inhouse oder Remote."
**Zielgruppe:** HR-Hannah & QA Leads.

**Dos:** Effizienz und Akkreditierung betonen.
**Don'ts:** Zu "B2C-mäßig" oder umgangssprachlich werden.`,
        targetAudiences: ['a2'],
        campaignKeywords: ['B2B', 'Inhouse', 'Firmenschulung', 'Teambuilding', 'Teamkurse'],
        kpis: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 },
        owner: 'Anna Schmidt',
        progress: 0,
    },
];

export const tasks = [
    { id: '1', title: 'Ad Creatives für Webinar', status: 'done', priority: 'high', assignee: 'Lisa Bauer', dueDate: '2026-03-05', campaign: 'Evergreen: Kostenloses Webinar' },
    { id: '2', title: 'Webinar Landingpage updaten', status: 'in-progress', priority: 'high', assignee: 'Tom Weber', dueDate: '2026-03-12', campaign: 'Evergreen: Kostenloses Webinar' },
    { id: '3', title: 'LinkedIn Leads kontaktieren', status: 'in-progress', priority: 'medium', assignee: 'Anna Schmidt', dueDate: '2026-03-15', campaign: 'B2B: Corporate Inhouse Trainings' },
    { id: '4', title: 'DiTeLe Demo für Ads abfilmen', status: 'todo', priority: 'medium', assignee: 'Daniel Moretz', dueDate: '2026-03-18', campaign: 'Launch DiTeLe Online-Kurs' },
    { id: '5', title: 'Google Ads Keyword-Analyse', status: 'todo', priority: 'high', assignee: 'Tom Weber', dueDate: '2026-03-20', campaign: 'Frühlings-Kurs: Präsenz in Eschborn' },
    { id: '6', title: 'Trustpilot Reviews einholen', status: 'in-review', priority: 'medium', assignee: 'Jana Klein', dueDate: '2026-03-10', campaign: null },
    { id: '7', title: 'Broschüre Bildungsgutschein neu', status: 'todo', priority: 'low', assignee: 'Lisa Bauer', dueDate: '2026-03-25', campaign: 'Frühlings-Kurs: Präsenz in Eschborn' },
    { id: '8', title: 'Webinar Termine anlegen (April)', status: 'done', priority: 'low', assignee: 'Waleri Moretz', dueDate: '2026-03-08', campaign: 'Evergreen: Kostenloses Webinar' },
];

export const calendarEvents = [
    { id: '1', title: 'Insta Post: Was ist ein Bug?', date: '2026-03-10', type: 'primary', channel: 'Social Media' },
    { id: '2', title: 'E-Mail Invite: Live-Webinar', date: '2026-03-12', type: 'info', channel: 'E-Mail' },
    { id: '3', title: 'Start Google Search Ads', date: '2026-03-15', type: 'warning', channel: 'Ads' },
    { id: '4', title: 'Blog: Bildungsgutschein Antrag', date: '2026-03-17', type: 'success', channel: 'Content' },
    { id: '5', title: 'LinkedIn: B2B Case Study', date: '2026-03-18', type: 'primary', channel: 'Social Media' },
    { id: '6', title: 'Meta Ads Retargeting', date: '2026-03-20', type: 'info', channel: 'Social Media' },
    { id: '7', title: 'Follow-Up E-Mail Absolventen', date: '2026-03-22', type: 'info', channel: 'E-Mail' },
    { id: '8', title: 'TikTok: QA vs Dev', date: '2026-03-24', type: 'warning', channel: 'Social Media' },
    { id: '9', title: 'Webinar Durchführung', date: '2026-03-26', type: 'success', channel: 'Event' },
    { id: '10', title: 'Performance Review', date: '2026-03-28', type: 'primary', channel: 'Ads' },
];

export const budgetData = {
    total: 57000,
    spent: 30050,
    remaining: 26950,
    categories: [
        { name: 'Google Ads (Search)', planned: 20000, spent: 14400, color: '#6366f1' },
        { name: 'Meta Ads', planned: 15000, spent: 8900, color: '#06b6d4' },
        { name: 'LinkedIn (B2B)', planned: 8000, spent: 2200, color: '#10b981' },
        { name: 'DiTeLe Content-Erweiterung', planned: 5000, spent: 1500, color: '#f59e0b' },
        { name: 'Webinar Software/Tools', planned: 4000, spent: 1250, color: '#ef4444' },
        { name: 'YouTube Video Prod.', planned: 5000, spent: 1800, color: '#8b5cf6' },
    ],
    monthlyTrend: [
        { month: 'Jan', planned: 9000, actual: 8800 },
        { month: 'Feb', planned: 11000, actual: 12200 },
        { month: 'Mär', planned: 12000, actual: 9050 },
        { month: 'Apr', planned: 9000, actual: 0 },
        { month: 'Mai', planned: 8000, actual: 0 },
        { month: 'Jun', planned: 8000, actual: 0 },
    ],
};

export const activityFeed = [
    { id: '1', user: 'Lisa Bauer', action: 'hat neue Ad Creatives hochgeladen', target: 'Evergreen: Kostenloses Webinar', time: 'vor 15 Min.', icon: '📎' },
    { id: '2', user: 'Daniel Moretz', action: 'hat DiTeLe-Texte aktualisiert', target: 'Launch DiTeLe Online-Kurs', time: 'vor 1 Std.', icon: '✍️' },
    { id: '3', user: 'Waleri Moretz', action: 'hat Webinar-Start freigegeben', target: 'Evergreen: Kostenloses Webinar', time: 'vor 2 Std.', icon: '✅' },
    { id: '4', user: 'Tom Weber', action: 'hat Ads CTR optimiert', target: 'Frühlings-Kurs: Präsenz in Eschborn', time: 'vor 3 Std.', icon: '📈' },
    { id: '5', user: 'Anna Schmidt', action: 'hat LinkedIn Post geplant', target: 'B2B: Corporate Inhouse Trainings', time: 'vor 5 Std.', icon: '📅' },
    { id: '6', user: 'System', action: 'Budget-Alert: Ads Q1 Budget 75% ausgelastet', target: 'Gesamtbudget', time: 'vor 6 Std.', icon: '⚠️' },
];

export const teamMembers = [
    { id: '1', name: 'Waleri Moretz', role: 'Akkr. Trainer / Gründer', avatar: 'WM', status: 'online' },
    { id: '2', name: 'Anna Schmidt', role: 'Marketing Managerin', avatar: 'AS', status: 'online' },
    { id: '3', name: 'Lisa Bauer', role: 'Content & Social', avatar: 'LB', status: 'away' },
    { id: '4', name: 'Tom Weber', role: 'Performance Experte', avatar: 'TW', status: 'offline' },
    { id: '5', name: 'Jana Klein', role: 'Community Support', avatar: 'JK', status: 'online' },
];

export const dashboardChartData = [
    { name: 'KW 5', impressions: 45000, clicks: 2100, conversions: 89 },
    { name: 'KW 6', impressions: 52000, clicks: 2800, conversions: 124 },
    { name: 'KW 7', impressions: 48000, clicks: 2400, conversions: 98 },
    { name: 'KW 8', impressions: 61000, clicks: 3100, conversions: 156 },
    { name: 'KW 9', impressions: 58000, clicks: 2900, conversions: 142 },
    { name: 'KW 10', impressions: 71000, clicks: 3600, conversions: 178 },
];

export const channelPerformance = [
    { name: 'Google Search Ads', value: 40, color: '#6366f1' },
    { name: 'Meta Ads', value: 25, color: '#06b6d4' },
    { name: 'Webinar (Organic)', value: 15, color: '#10b981' },
    { name: 'LinkedIn (B2B)', value: 12, color: '#f59e0b' },
    { name: 'SEO', value: 8, color: '#8b5cf6' },
];
