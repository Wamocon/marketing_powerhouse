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
        touchpointIds: ['tp1', 'tp6', 'tp4'],
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
        touchpointIds: ['tp6', 'tp1'],
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
        touchpointIds: ['tp4', 'tp2', 'tp3'],
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

export const initialTasks = [
    {
        id: 'cr1',
        title: 'Instagram Reel: Kursvorstellung',
        status: 'monitoring',
        assignee: 'Lisa Bauer',
        author: 'Anna Schmidt',
        dueDate: '2026-03-10',
        publishDate: '2026-03-12T10:00',
        platform: 'Instagram',
        touchpointId: 'tp6',
        type: 'Reel/Video',
        oneDriveLink: 'https://onedrive.live.com/view?id=cr1',
        description: 'Kurzes Reel, das den Ablauf des ISTQB-Kurses in 30 Sekunden zeigt.',
        campaignId: '1',
        scope: 'single',
        performance: { impressions: 14200, clicks: 890, ctr: 6.3 },
    },
    {
        id: 'cr2',
        title: 'LinkedIn Post: Erfolgsgeschichte',
        status: 'review',
        assignee: 'Anna Schmidt',
        author: 'Daniel Moretz',
        dueDate: '2026-03-14',
        publishDate: null,
        platform: 'LinkedIn',
        type: 'Post',
        oneDriveLink: 'https://onedrive.live.com/view?id=cr2',
        description: 'Testimonial eines Absolventen als LinkedIn Article.',
        campaignId: '1',
        scope: 'single',
        aiSuggestion: 'Beginne mit einem starken Hook: "Von der Arbeitslosigkeit zum IT-Tester in nur 45 Tagen — Michaels Geschichte." Nutze dann 3 Bullet Points mit konkreten Zahlen...',
    },
    {
        id: 'cr3',
        title: 'Google Search Ad: Bildungsgutschein',
        status: 'approved',
        assignee: 'Tom Weber',
        author: 'Anna Schmidt',
        dueDate: '2026-03-15',
        publishDate: null,
        platform: 'Google Ads',
        touchpointId: 'tp1',
        type: 'Anzeige',
        oneDriveLink: 'https://onedrive.live.com/view?id=cr3',
        description: 'Search Ad für Keywords rund um Bildungsgutschein + IT-Umschulung.',
        campaignId: '1',
        scope: 'single',
    },
    {
        id: 'cr4',
        title: 'Übergreifend: E-Mail Sequenz Webinar-Follow-Up',
        status: 'draft',
        assignee: 'Lisa Bauer',
        author: 'Waleri Moretz',
        dueDate: '2026-03-20',
        publishDate: null,
        platform: null,
        type: 'E-Mail',
        oneDriveLink: '',
        description: '3-teilige E-Mail Sequenz nach dem kostenlosen Webinar.',
        campaignId: '3',
        scope: 'all',
    },
];

// ─────────────────────────────────────────────
// CONTENT (für Kalender & Kampagnen)
// ─────────────────────────────────────────────
// Content = "Was publiziert wird". Jeder Content kann 0..N Aufgaben haben.
// Wenn taskIds leer → rotes Flag im Kalender.

export const initialContents = [
    {
        id: 'cnt1',
        title: 'Insta Post: Was ist ein Bug?',
        description: 'Erklärender Post für Quereinsteiger: Was ein Bug in der Software ist und warum Tester wichtig sind.',
        status: 'published',
        publishDate: '2026-03-10',
        platform: 'Instagram',
        touchpointId: 'tp6',
        campaignId: '1',
        taskIds: ['cr1'],
        author: 'Lisa Bauer',
        contentType: 'social',
        journeyPhase: 'Awareness',
        createdAt: '2026-02-20',
    },
    {
        id: 'cnt2',
        title: 'E-Mail Invite: Live-Webinar',
        description: 'Einladungs-E-Mail zur nächsten kostenlosen Live-Webinar-Session.',
        status: 'scheduled',
        publishDate: '2026-03-12',
        platform: 'E-Mail',
        touchpointId: 'tp4',
        campaignId: '3',
        taskIds: ['cr4'],
        author: 'Anna Schmidt',
        contentType: 'email',
        journeyPhase: 'Interest',
        createdAt: '2026-03-01',
    },
    {
        id: 'cnt3',
        title: 'Start Google Search Ads',
        description: 'Launch der neuen Google Ads Kampagne für Bildungsgutschein-Keywords.',
        status: 'scheduled',
        publishDate: '2026-03-15',
        platform: 'Google Ads',
        touchpointId: 'tp1',
        campaignId: '1',
        taskIds: ['cr3'],
        author: 'Tom Weber',
        contentType: 'ads',
        journeyPhase: 'Search',
        createdAt: '2026-03-02',
    },
    {
        id: 'cnt4',
        title: 'Blog: Bildungsgutschein Antrag',
        description: 'Schritt-für-Schritt Anleitung: So beantragst du deinen Bildungsgutschein bei der Agentur für Arbeit.',
        status: 'production',
        publishDate: '2026-03-17',
        platform: 'Website',
        campaignId: '1',
        taskIds: [],
        author: 'Daniel Moretz',
        contentType: 'content',
        journeyPhase: 'Search',
        createdAt: '2026-03-05',
    },
    {
        id: 'cnt5',
        title: 'LinkedIn: B2B Case Study',
        description: 'Fallstudie einer erfolgreichen Inhouse-ISTQB-Schulung bei einem Frankfurter Finanzunternehmen.',
        status: 'ready',
        publishDate: '2026-03-18',
        platform: 'LinkedIn',
        campaignId: '4',
        taskIds: ['cr2'],
        author: 'Anna Schmidt',
        contentType: 'social',
        journeyPhase: 'Awareness',
        createdAt: '2026-03-03',
    },
    {
        id: 'cnt6',
        title: 'Meta Ads Retargeting',
        description: 'Retargeting Ads für Website-Besucher die den Kurs noch nicht gebucht haben.',
        status: 'planning',
        publishDate: '2026-03-20',
        platform: 'Meta Ads',
        campaignId: '2',
        taskIds: [],
        author: 'Tom Weber',
        contentType: 'ads',
        journeyPhase: 'Interest',
        createdAt: '2026-03-06',
    },
    {
        id: 'cnt7',
        title: 'Follow-Up E-Mail Absolventen',
        description: 'Testimonial-Anfrage und Weiterempfehlung an erfolgreich zertifizierte Absolventen.',
        status: 'idea',
        publishDate: '2026-03-22',
        platform: 'E-Mail',
        touchpointId: 'tp4',
        campaignId: '3',
        taskIds: [],
        author: 'Lisa Bauer',
        contentType: 'email',
        journeyPhase: 'Advocacy',
        createdAt: '2026-03-08',
    },
    {
        id: 'cnt8',
        title: 'TikTok: QA vs Dev',
        description: 'Kurzvideo im "Day in the Life" Format: Softwaretester vs Entwickler.',
        status: 'planning',
        publishDate: '2026-03-24',
        platform: 'TikTok',
        campaignId: '2',
        taskIds: [],
        author: 'Lisa Bauer',
        contentType: 'social',
        journeyPhase: 'Awareness',
        createdAt: '2026-03-09',
    },
    {
        id: 'cnt9',
        title: 'Webinar Durchführung',
        description: 'Live-Durchführung des kostenlosen Info-Webinars mit Daniel & Waleri.',
        status: 'scheduled',
        publishDate: '2026-03-26',
        platform: 'Zoom',
        campaignId: '3',
        taskIds: ['cr4'],
        author: 'Daniel Moretz',
        contentType: 'event',
        journeyPhase: 'Interest',
        createdAt: '2026-02-15',
    },
    {
        id: 'cnt10',
        title: 'Performance Review Q1',
        description: 'Analyse aller laufenden Kampagnen und Content-Performance im 1. Quartal.',
        status: 'idea',
        publishDate: '2026-03-28',
        platform: 'Intern',
        campaignId: null,
        taskIds: [],
        author: 'Anna Schmidt',
        contentType: 'content',
        journeyPhase: 'Retention',
        createdAt: '2026-03-10',
    },
];

// Content-Type Farbkategorien für den Kalender
export const CONTENT_TYPE_COLORS = {
    social: 'primary',
    email: 'info',
    ads: 'warning',
    content: 'success',
    event: 'success',
};

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


export const touchpoints = [
    { id: 'tp1', name: 'Google Search Ads', type: 'Paid Search', journeyPhase: 'Search', url: 'google.com/ads', status: 'active', description: 'Bezahlte Anzeigen auf Google für brand und non-brand Keywords.' },
    { id: 'tp2', name: 'LinkedIn Ads', type: 'Paid Social', journeyPhase: 'Attention', url: 'linkedin.com/campaign', status: 'active', description: 'Lead Gen Forms und Sponsored Content auf LinkedIn.' },
    { id: 'tp3', name: 'Webinar Landingpage', type: 'Owned Website', journeyPhase: 'Interest', url: 'test-it-academy.de/webinar', status: 'active', description: 'Die zentrale Anmeldeseite für das DiTeLe-Webinar.' },
    { id: 'tp4', name: 'E-Mail Automation (ActiveCampaign)', type: 'Owned CRM', journeyPhase: 'Desire', url: 'activecampaign.com', status: 'active', description: 'Follow-up Sequenz nach Webinar-Teilnahme.' },
    { id: 'tp5', name: 'Sales Pipeline (Telefon)', type: 'Direct Sales', journeyPhase: 'Action', url: '-', status: 'planned', description: 'Telefongespräch durch B2B-Closer nach Leadgenerierung.' },
    { id: 'tp6', name: 'Instagram Reels', type: 'Organic Social', journeyPhase: 'Awareness', url: 'instagram.com/testit', status: 'active', description: 'Kurzvideos für Awareness, um Quereinsteiger zu inspirieren.' },
    { id: 'tp7', name: 'Trustpilot Reviews', type: 'Earned Media', journeyPhase: 'Advocacy', url: 'trustpilot.com/review', status: 'active', description: 'Bewertungen von ehemaligen Schülern.' },
    { id: 'tp8', name: 'Lern-Plattform (LMS)', type: 'Product', journeyPhase: 'Retention', url: 'lms.test-it-academy.de', status: 'active', description: 'Die Moodle-basierte Lernumgebung für aktive Kursteilnehmer.' }
];

export const asidasJourneys = [
    {
        id: 'j1',
        name: 'Quirin (Quereinsteiger) - B2C Full Flow',
        audienceId: 'a1',
        description: 'Von der Frustration im alten Job bis zur Anmeldung zum ISTQB-Kurs mit Bildungsgutschein.',
        stages: [
            { id: 's1', phase: 'Attention', title: 'Problembewusstsein', description: 'Quirin erfährt, dass IT-Jobs Quereinsteiger aufnehmen.', touchpoints: ['tp6', 'tp2'], contentFormats: ['Reel: "3 Mythen über IT-Jobs"', 'LinkedIn Post: "Zukunftssicher"'], emotions: ['Orientierungslos', 'Neugierig'], painPoints: ['Angst vor dem Ungewissen', 'Kein Programmier-Wissen'], metrics: { label: 'Reichweite', value: '45.000', trend: '+12%' }, contentIds: ['cnt1'] },
            { id: 's2', phase: 'Search', title: 'Recherche & Info-Suche', description: 'Er sucht bei Google nach "Software Tester ohne Studium".', touchpoints: ['tp1'], contentFormats: ['Blog: "Was macht ein Tester?"', 'SEO Ratgeber'], emotions: ['Wissbegierig', 'Leicht überfordert'], painPoints: ['Wer zahlt das?', 'Welches Zertifikat brauche ich?'], metrics: { label: 'SEO Clicks', value: '2.100', trend: '+5%' }, contentIds: ['cnt4'] },
            { id: 's3', phase: 'Interest', title: 'Tieferes Kaufinteresse', description: 'Meldung zum kostenlosen Webinar an.', touchpoints: ['tp3', 'tp2'], contentFormats: ['Webinar Anmeldung', 'Retargeting Case Study'], emotions: ['Hoffnungsvoll'], painPoints: ['Terminfindung', 'Ist das seriös?'], metrics: { label: 'Webinar Signups', value: '350', trend: '+20%' }, contentIds: ['cnt2'] },
            { id: 's4', phase: 'Desire', title: 'Persönliches Verlangen aufbauen', description: 'Erklärung der Bildungsgutschein-Förderung per Mail.', touchpoints: ['tp4'], contentFormats: ['E-Mail Nurturing', 'Fördermittel-Guide (PDF)'], emotions: ['Motiviert', 'Überzeugt'], painPoints: ['Antragstellung beim Amt'], metrics: { label: 'Open Rate', value: '48%', trend: '+3%' } },
            { id: 's5', phase: 'Action', title: 'Beratung & Buchung', description: 'Telefonische Beratung und endgültige Anmeldung.', touchpoints: ['tp5'], contentFormats: ['Consulting-Leitfaden', 'Anmeldeformular'], emotions: ['Erleichtert', 'Gutmütig nervös'], painPoints: ['Amt muss final zustimmen'], metrics: { label: 'Vertragsabschlüsse', value: '45', trend: '+8%' } },
            { id: 's6', phase: 'Share', title: 'Erfolg teilen', description: 'Prüfung bestanden! Zertifikat wird geteilt.', touchpoints: ['tp7', 'tp8'], contentFormats: ['LinkedIn Zertifikat Template', 'Alumni Interview'], emotions: ['Stolz'], painPoints: ['Jobeinstieg'], metrics: { label: 'Trustpilot Ratings', value: '12', trend: '+2%' } }
        ]
    },
    {
        id: 'j2',
        name: 'Hannah (HR) - B2B Inhouse Flow',
        audienceId: 'a2',
        description: 'Recherche eines Weiterbildungspartners für das Inhouse QA Team.',
        stages: [
            { id: 's1', phase: 'Attention', title: 'Schulungsbedarf erkannt', description: 'Team wächst, Qualität der Releases sinkt.', touchpoints: ['tp2'], contentFormats: ['Whitepaper: "Kosten von Bugs in Prod"'], emotions: ['Gestresst'], painPoints: ['Teamfehler', 'Budgetdruck'], metrics: { label: 'LinkedIn Impr.', value: '15.000', trend: '+10%' } },
            { id: 's2', phase: 'Search', title: 'Anbietervergleich', description: 'Google Suche nach "ISTQB Inhouse Training Frankfurt".', touchpoints: ['tp1', 'tp3'], contentFormats: ['B2B Landingpage', 'Trainer-Profilseite'], emotions: ['Analytisch'], painPoints: ['ISTQB Akkreditierung wichtig'], metrics: { label: 'B2B Traffic', value: '800', trend: '+1%' } },
            { id: 's3', phase: 'Interest', title: 'Kontaktaufnahme', description: 'Hannah kontaktiert uns für ein Angebot.', touchpoints: ['tp3'], contentFormats: ['Pitch Deck', 'Preisliste'], emotions: ['Erwartungsvoll'], painPoints: ['Antwortzeit', 'Flexibilität bei Terminen'], metrics: { label: 'Inbound Leads', value: '15', trend: '+5%' } },
            { id: 's4', phase: 'Desire', title: 'Fachlicher Austausch', description: 'Videocall zur Besprechung der Lernziele des Teams.', touchpoints: ['tp5'], contentFormats: ['Demo der Lernplattform', 'Custom Agenda'], emotions: ['Überzeugt'], painPoints: ['Überzeugt das die GF?'], metrics: { label: 'Sales Calls', value: '8', trend: '0%' } },
            { id: 's5', phase: 'Action', title: 'Vertragsabschluss', description: 'Rahmenvertrag für Inhouse-Schulung wird signiert.', touchpoints: ['tp5'], contentFormats: ['Vertragsdokument'], emotions: ['Erleichtert'], painPoints: ['Rechtliche Prüfung im Haus'], metrics: { label: 'Won Deals', value: '3', trend: '+1%' } },
            { id: 's6', phase: 'Share', title: 'Langfristige Partnerschaft', description: 'Team besteht Prüfung, Hannah lobt uns intern.', touchpoints: ['tp2'], contentFormats: ['B2B Case Study'], emotions: ['Zufrieden', 'Gut positioniert intern'], painPoints: ['Nächstes Fortbildungsjahr'], metrics: { label: 'Upsell %', value: '30%', trend: '+5%' } }
        ]
    },
    {
        id: 'j3',
        name: 'Bea (Junior QA) - Upskill Flow',
        audienceId: 'a3',
        description: 'Bereits in der Ausbildung/Job, aber benötigt den ISTQB Titel für die Gehaltsverhandlung.',
        stages: [
            { id: 's1', phase: 'Attention', title: 'Karriere-Bremse', description: 'Merkt, dass Zertifikate für Beförderung nötig sind.', touchpoints: ['tp6'], contentFormats: ['TikTok "Junior vs Senior Tester"'], emotions: ['Frustriert', 'Ambitioniert'], painPoints: ['Geringes Gehalt'], metrics: { label: 'Views', value: '110.000', trend: '+45%' } },
            { id: 's2', phase: 'Search', title: 'Vorbereitungsmöglichkeiten', description: 'Sucht nach schnellen E-Learning Kursen.', touchpoints: ['tp1'], contentFormats: ['SEO Artikel "ISTQB im Selbststudium"'], emotions: ['Zielorientiert'], painPoints: ['Zeitaufwand neben Job'], metrics: { label: 'Klicks', value: '1.200', trend: '-2%' } },
            { id: 's3', phase: 'Interest', title: 'Probe-Material', description: 'Lädt Mock-Exam runter.', touchpoints: ['tp3'], contentFormats: ['Mock Exam (PDF)', 'Syllabus Checker'], emotions: ['Fokussiert'], painPoints: ['Zu viele Fachbegriffe'], metrics: { label: 'Downloads', value: '450', trend: '+12%' } },
            { id: 's4', phase: 'Desire', title: 'Entscheidung für Premium-Kurs', description: 'Erkennt, dass Selbststudium zu schwer ist.', touchpoints: ['tp4'], contentFormats: ['E-Mail "Warum 60% im 1. Versuch durchfallen"'], emotions: ['Respekt vor Prüfung', 'Kaufbereit'], painPoints: ['Prüfungsgebühr'], metrics: { label: 'Open Rate', value: '55%', trend: '+5%' } },
            { id: 's5', phase: 'Action', title: 'Online-Buchung', description: 'Bucht per Kreditkarte das E-Learning Paket.', touchpoints: ['tp3'], contentFormats: ['Checkout-Page'], emotions: ['Erwartungsvoll'], painPoints: ['Geld-zurück-Garantie?'], metrics: { label: 'Checkouts', value: '120', trend: '+15%' } },
            { id: 's6', phase: 'Share', title: 'Prüfungszeugnis auf Social Media', description: 'Postet stolz das Zertifikat.', touchpoints: ['tp2', 'tp7'], contentFormats: ['Zertifikats-Post Vorlage'], emotions: ['Stolz', 'Gehaltserhöhung in Sicht'], painPoints: ['-'], metrics: { label: 'Mentions', value: '60', trend: '+8%' } }
        ]
    }
];

export const customerJourneys = [
    {
        id: 'cj1',
        name: 'Quirin (Quereinsteiger) - 5-Phasen Journey',
        audienceId: 'a1',
        description: 'Standard 5-Phasen Customer Journey von ersten Problembewusstsein bis zur Weiterempfehlung nach der Schulung.',
        stages: [
            { id: 'phs1', phase: 'Awareness', title: 'Bewusstsein für Relevanz', description: 'Erfährt über Social Media, dass IT-Quereinstieg auch ohne Programmieren möglich ist.', touchpoints: ['tp6', 'tp2'], contentFormats: ['Social Media Video', 'Anzeigen'], emotions: ['Neugierig'], painPoints: ['IT scheint zu komplex'], metrics: { label: 'Reichweite', value: '50.000', trend: '+10%' }, contentIds: ['cnt1'] },
            { id: 'phs2', phase: 'Consideration', title: 'Erwägung & Abwägung', description: 'Sucht nach Informationen zu Bildungsgutschein und Voraussetzungen.', touchpoints: ['tp1', 'tp3'], contentFormats: ['Blogbeiträge', 'Webinar'], emotions: ['Wissbegierig'], painPoints: ['Finanzierung unklar'], metrics: { label: 'Webinar Anmeldungen', value: '400', trend: '+15%' }, contentIds: ['cnt4', 'cnt2'] },
            { id: 'phs3', phase: 'Purchase', title: 'Kauf & Entscheidung', description: 'Entscheidet sich für den ISTQB-Kurs und meldet sich nach Klärung mit der Agentur für Arbeit an.', touchpoints: ['tp4', 'tp5'], contentFormats: ['E-Mail', 'Beratungsgespräch'], emotions: ['Erwartungsvoll'], painPoints: ['Antrag beim Amt dauert'], metrics: { label: 'Abschlüsse', value: '50', trend: '+5%' }, contentIds: [] },
            { id: 'phs4', phase: 'Retention', title: 'Bindung & Begleitung', description: 'Nimmt aktiv am Kurs teil und nutzt die DiTeLe Plattform.', touchpoints: ['tp8', 'tp4'], contentFormats: ['Lern-Inhalte', 'Check-ins'], emotions: ['Motiviert'], painPoints: ['Lernstress'], metrics: { label: 'Kursfortschritt', value: '85%', trend: '+2%' }, contentIds: [] },
            { id: 'phs5', phase: 'Advocacy', title: 'Loyalität & Weiterempfehlung', description: 'Bestes Testimonials – erfolgreicher Abschluss und neuer Job in der IT.', touchpoints: ['tp7', 'tp2'], contentFormats: ['Bewertung', 'Alumni-Netzwerk'], emotions: ['Stolz', 'Dankbar'], painPoints: ['Neue Jobsuche'], metrics: { label: 'Bewertungen', value: '25', trend: '+15%' }, contentIds: [] }
        ]
    },
    {
        id: 'cj2',
        name: 'Hannah (HR) - B2B 5-Phasen Journey',
        audienceId: 'a2',
        description: 'Von der Problemerkennung im eigenen Team bis zur langfristigen Partnerschaft für Inhouse-Schulungen.',
        stages: [
            { id: 'phs1', phase: 'Awareness', title: 'Bedarf erkennen', description: 'Die Qualität im QA-Team sinkt, ein Standard muss her.', touchpoints: ['tp2'], contentFormats: ['Whitepaper'], emotions: ['Gestresst'], painPoints: ['Fehlerhafte Releases'], metrics: { label: 'Impressions', value: '12.000', trend: '+5%' }, contentIds: ['cnt5'] },
            { id: 'phs2', phase: 'Consideration', title: 'Optionen prüfen', description: 'Vergleicht Anbieter von ISTQB Inhouse Schulungen.', touchpoints: ['tp1', 'tp3'], contentFormats: ['B2B Landingpage'], emotions: ['Analytisch'], painPoints: ['Zertifizierter Trainer gesucht'], metrics: { label: 'B2B Traffic', value: '900', trend: '+2%' }, contentIds: [] },
            { id: 'phs3', phase: 'Purchase', title: 'Beauftragung', description: 'Entscheidet sich für Test-IT Academy aufgrund von Praxisnähe.', touchpoints: ['tp5'], contentFormats: ['Angebot', 'Pitch'], emotions: ['Erleichtert'], painPoints: ['Budgetfreigabe'], metrics: { label: 'Won Deals', value: '5', trend: '0%' }, contentIds: [] },
            { id: 'phs4', phase: 'Retention', title: 'Schulungserfahrung', description: 'Das Inhouse-Training läuft erfolgreich und das Team wendet das Wissen an.', touchpoints: ['tp8', 'tp5'], contentFormats: ['Feedbackbogen'], emotions: ['Zufrieden'], painPoints: ['Terminkoordination intern'], metrics: { label: 'Teilnehmer Feedback', value: '4.8/5', trend: '+0.1' }, contentIds: [] },
            { id: 'phs5', phase: 'Advocacy', title: 'Folgeaufträge & Empfehlungen', description: 'Hannah bucht einen weiteren Kurs und empfiehlt die Academy intern weiter.', touchpoints: ['tp4', 'tp2'], contentFormats: ['Case Study'], emotions: ['Erfolgreich'], painPoints: ['Keine'], metrics: { label: 'Upsell', value: '2', trend: '+1' }, contentIds: ['cnt5'] }
        ]
    }
];
