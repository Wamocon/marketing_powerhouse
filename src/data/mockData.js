// Mock data for UI prototype

// ─────────────────────────────────────────────
// TEST-BENUTZER (für alle 3 Rollen)
// ─────────────────────────────────────────────

export const testUsers = [
    {
        id: 'u1',
        name: 'Alexander König',
        email: 'admin@marketing-ph.de',
        password: 'admin123',
        role: 'admin',
        jobTitle: 'System Administrator',
        avatar: 'AK',
        status: 'online',
        department: 'IT & Operations',
        phone: '+49 89 1234-100',
        joinedAt: '2024-01-01',
    },
    {
        id: 'u2',
        name: 'Sarah Müller',
        email: 'sarah@marketing-ph.de',
        password: 'manager123',
        role: 'manager',
        jobTitle: 'Marketing Manager',
        avatar: 'SM',
        status: 'online',
        department: 'Marketing',
        phone: '+49 89 1234-101',
        joinedAt: '2024-02-15',
    },
    {
        id: 'u3',
        name: 'Max Weber',
        email: 'max@marketing-ph.de',
        password: 'manager123',
        role: 'manager',
        jobTitle: 'Marketing Manager',
        avatar: 'MW',
        status: 'online',
        department: 'Marketing',
        phone: '+49 89 1234-102',
        joinedAt: '2024-03-01',
    },
    {
        id: 'u4',
        name: 'Lisa Chen',
        email: 'lisa@marketing-ph.de',
        password: 'member123',
        role: 'member',
        jobTitle: 'Content Creator',
        avatar: 'LC',
        status: 'away',
        department: 'Marketing',
        phone: '+49 89 1234-103',
        joinedAt: '2024-04-10',
    },
    {
        id: 'u5',
        name: 'Tom Schmidt',
        email: 'tom@marketing-ph.de',
        password: 'member123',
        role: 'member',
        jobTitle: 'SEA Specialist',
        avatar: 'TS',
        status: 'offline',
        department: 'Performance Marketing',
        phone: '+49 89 1234-104',
        joinedAt: '2024-05-20',
    },
    {
        id: 'u6',
        name: 'Julia Bauer',
        email: 'julia@marketing-ph.de',
        password: 'member123',
        role: 'member',
        jobTitle: 'Social Media Managerin',
        avatar: 'JB',
        status: 'online',
        department: 'Marketing',
        phone: '+49 89 1234-105',
        joinedAt: '2024-06-01',
    },
];

// Rückwärtskompatibilität (wird schrittweise ersetzt)
export const currentUser = testUsers[1];

// ─────────────────────────────────────────────
// UNTERNEHMENSPOSITIONIERUNG
// ─────────────────────────────────────────────

export const companyPositioning = {
    // Block 1: Unternehmens-DNA
    name: 'Marketing Powerhouse GmbH',
    tagline: 'Smarter Marketing. Größere Wirkung.',
    founded: '2020',
    industry: 'SaaS / Marketing Technology',
    headquarters: 'München, Deutschland',
    legalForm: 'GmbH',
    employees: '12–25',
    website: 'www.marketing-powerhouse.de',

    // Block 2: Digitale Identität
    vision: 'Wir wollen die führende europäische Marketing-Plattform sein, die Marketing-Teams in KMUs und Mittelstand so befähigt, dass Kreativität und Daten Hand in Hand gehen — DSGVO-konform, effizient und menschlich.',
    mission: 'Wir vereinen Kampagnen-Management, Content-Planung und Budget-Kontrolle in einem einzigen, intuitiven Tool, damit Marketing-Teams endlich fokussiert arbeiten können — ohne Tool-Chaos, ohne Datenverlust, ohne Compliance-Risiken.',
    values: [
        {
            id: 'v1',
            title: 'Verlässlichkeit',
            icon: '🛡️',
            description: 'Unsere Kunden können sich auf uns verlassen — bei Datenschutz, Verfügbarkeit und Support. Versprechen halten wir ein.',
        },
        {
            id: 'v2',
            title: 'Klarheit',
            icon: '💡',
            description: 'Wir kommunizieren klar, einfach und ohne Fachjargon. Komplexes machen wir greifbar — in unserem Produkt und in unserer Sprache.',
        },
        {
            id: 'v3',
            title: 'Menschlichkeit',
            icon: '🤝',
            description: 'Hinter jedem Klick steckt ein Mensch. Wir bauen Technologie mit Empathie — für Teams, nicht für Statistiken.',
        },
        {
            id: 'v4',
            title: 'Innovation',
            icon: '🚀',
            description: 'Wir denken voraus. KI, Automatisierung, neue Kanäle — wir entwickeln uns mit dem Markt, ohne unsere Kunden zu überfordern.',
        },
        {
            id: 'v5',
            title: 'Europäische Stärke',
            icon: '🇪🇺',
            description: 'Made in Europe, für Europa. DSGVO ist für uns kein Kostenfaktor, sondern ein Qualitätsmerkmal und ein Versprechen.',
        },
    ],

    // Block 3: Kommunikations-DNA
    toneOfVoice: {
        adjectives: ['Klar', 'Direkt', 'Ermächtigend', 'Warm', 'Professionell', 'Menschlich'],
        description: 'Wir sprechen auf Augenhöhe — weder überheblich akademisch noch flach-familiär. Wir duzen unsere Kunden, sind sachlich wenn nötig und persönlich wo möglich. Fachbegriffe nutzen wir bewusst und erklären sie.',
        personality: 'Vertrauenswürdiger Experte, der komplexe Themen einfach macht — wie ein erfahrener Kollege, nicht wie ein Unternehmensberater.',
    },
    dos: [
        'Konkrete Beispiele und Zahlen verwenden',
        'Kundennutzen immer vor Features stellen',
        'Aktive Sprache, kurze Sätze',
        'DSGVO-Aspekte proaktiv erwähnen',
        'Emotionen zeigen — Begeisterung, Verständnis',
    ],
    donts: [
        'Nie "revolutionary" oder "disruptive" — das sind Worthülsen',
        'Keine US-zentrischen Beispiele oder Referenzen',
        'Kein Fachjargon ohne Erklärung',
        'Keine generischen Floskeln wie "Ihre Lösung für alles"',
        'Nie Compliance als Selbstverständlichkeit abtun',
        'Nicht über Konkurrenten sprechen — nur über unsere Stärken',
    ],

    // Block 4: Zielmarkt
    primaryMarket: 'DACH-Region (Deutschland, Österreich, Schweiz)',
    secondaryMarkets: ['BeNeLux', 'Nordeuropa (Scandinavia)'],
    targetCompanySize: 'KMU & Mittelstand, 10–500 Mitarbeiter',
    targetIndustries: ['Handel & E-Commerce', 'Dienstleistungen', 'B2B Software', 'Gesundheit & Wellness'],

    lastUpdated: '2026-03-10',
    updatedBy: 'Alexander König',
};

// ─────────────────────────────────────────────
// ZIELGRUPPEN / AVATARE / PERSONAS
// ─────────────────────────────────────────────

export const audiences = [
    {
        id: 'a1',
        name: 'Digital Dave',
        type: 'buyer',
        segment: 'B2C',
        color: '#6366f1',
        initials: 'DD',
        age: '28–38',
        gender: 'Männlich',
        location: 'Großstädte DACH',
        income: '40.000 – 65.000 €/Jahr',
        education: 'Bachelor / Master',
        jobTitle: 'IT-Fachkraft / Tech-Enthusiast',
        interests: ['Technologie', 'Gaming', 'Nachhaltigkeit', 'Smart Home'],
        painPoints: ['Zu viele Tools, zu wenig Zeit', 'Informationsflut', 'Wunsch nach Effizienz'],
        goals: ['Digitalen Alltag vereinfachen', 'Produktiver werden', 'Up-to-date bleiben'],
        preferredChannels: ['Instagram', 'YouTube', 'LinkedIn', 'Newsletter'],
        buyingBehavior: 'Recherchiert intensiv vor Kauf, vergleicht Bewertungen, kauft digital',
        decisionProcess: 'Eigenständig, datengetrieben, beeinflusst von Peers',
        journeyPhase: 'Awareness → Consideration',
        description: 'Digital Dave ist technikaffin und immer auf der Suche nach smarten Lösungen. Er ist früher Adopter und teilt Empfehlungen in sozialen Netzwerken.',
        campaignIds: ['1', '2'],
        createdAt: '2026-01-15',
        updatedAt: '2026-03-01',
    },
    {
        id: 'a2',
        name: 'Manager Maria',
        type: 'buyer',
        segment: 'B2B',
        color: '#10b981',
        initials: 'MM',
        age: '38–52',
        gender: 'Weiblich',
        location: 'DACH-Region',
        income: '75.000 – 120.000 €/Jahr',
        education: 'MBA / wirtschaftliches Studium',
        jobTitle: 'Marketing-Leiterin / CMO',
        interests: ['Marketing-Trends', 'Leadership', 'Effizienzsteigerung', 'Data-driven Marketing'],
        painPoints: ['Tool-Fragmentierung im Team', 'Fehlende Übersicht über Kampagnen', 'Budget-Kontrolle', 'DSGVO-Compliance'],
        goals: ['Marketing ROI steigern', 'Team effizienter machen', 'Reporting automatisieren'],
        preferredChannels: ['LinkedIn', 'Newsletter', 'Webinare', 'Fachpresse'],
        buyingBehavior: 'Kaufentscheidung nach Evaluierung, Freigabeprozess intern, Verträge jährlich',
        decisionProcess: 'Teambasiert, Budget-getrieben, sucht Referenzen und Case Studies',
        journeyPhase: 'Consideration → Decision',
        description: 'Manager Maria verantwortet das gesamte Marketing-Budget und sucht nach Lösungen, die Transparenz, Kontrolle und Effizienz vereinen.',
        campaignIds: ['2', '3'],
        createdAt: '2026-01-15',
        updatedAt: '2026-03-02',
    },
    {
        id: 'a3',
        name: 'Kreativ-Klaus',
        type: 'user',
        segment: 'B2B',
        color: '#f59e0b',
        initials: 'KK',
        age: '25–35',
        gender: 'Männlich',
        location: 'Remote / Freelancer',
        income: '35.000 – 55.000 €/Jahr',
        education: 'Design-Studium / Selbststudium',
        jobTitle: 'Content Creator / Social Media Manager',
        interests: ['Design', 'Storytelling', 'Social Media Trends', 'Fotografie', 'Video'],
        painPoints: ['Abstimmungschaos im Team', 'Fehlende Briefings', 'Zu viele Revisionsschleifen'],
        goals: ['Kreativen Prozess beschleunigen', 'Klare Briefings erhalten', 'Portfolio aufbauen'],
        preferredChannels: ['Instagram', 'TikTok', 'Pinterest', 'Behance'],
        buyingBehavior: 'Nutzt die Tools, die das Unternehmen vorgibt, aber empfiehlt intern aktiv',
        decisionProcess: 'Beeinflusser im Kaufprozess, kein Budget-Inhaber',
        journeyPhase: 'Activation → Retention',
        description: 'Kreativ-Klaus ist der operative User, der täglich mit dem Tool arbeitet. Er schätzt Schnelligkeit, klare Kommunikation und visuelle Übersicht.',
        campaignIds: ['1', '6'],
        createdAt: '2026-02-01',
        updatedAt: '2026-03-05',
    },
    {
        id: 'a4',
        name: 'E-Commerce-Eva',
        type: 'buyer',
        segment: 'B2C',
        color: '#ec4899',
        initials: 'EE',
        age: '30–45',
        gender: 'Weiblich',
        location: 'Deutschland',
        income: '30.000 – 55.000 €/Jahr',
        education: 'Kaufmännische Ausbildung / Studium',
        jobTitle: 'Online-Shopbetreiberin / E-Commerce-Managerin',
        interests: ['Fashion', 'Interior Design', 'Nachhaltigkeit', 'Online-Shopping'],
        painPoints: ['Hoher Wettbewerb', 'Sinkende organische Reichweite', 'Saisonale Peaks managen'],
        goals: ['Umsatz steigern', 'Stammkundenbindung', 'Neue Zielgruppen erschließen'],
        preferredChannels: ['Instagram', 'Pinterest', 'Google Shopping', 'E-Mail'],
        buyingBehavior: 'Spontankäuferin bei Aktionen, loyale Wiederkäuferin bei guter Erfahrung',
        decisionProcess: 'Emotional, beeinflusst durch visuelle Inhalte und Empfehlungen',
        journeyPhase: 'Awareness → Purchase',
        description: 'Eva betreibt einen erfolgreichen Online-Shop und sucht Wege, saisonal zu wachsen und Stammkunden langfristig zu binden.',
        campaignIds: ['4', '1'],
        createdAt: '2026-02-10',
        updatedAt: '2026-03-08',
    },
];

// ─────────────────────────────────────────────
// UNTERNEHMENSWEITE SCHLÜSSELBEGRIFFE
// ─────────────────────────────────────────────

export const companyKeywords = [
    { id: 'ck1', term: 'DSGVO-konform', category: 'Compliance', description: 'Alle Kommunikation betont Datenschutz-Konformität' },
    { id: 'ck2', term: 'Made in Europe', category: 'Brand', description: 'Unterstreicht europäischen Ursprung & Werte' },
    { id: 'ck3', term: 'Nachhaltigkeit', category: 'Brand', description: 'Zentrales Markenwert-Thema' },
    { id: 'ck4', term: 'Premium-Qualität', category: 'Brand', description: 'Positionierung im Premium-Segment' },
    { id: 'ck5', term: 'Kundenfokus', category: 'Value', description: 'Customer-First Ansatz' },
    { id: 'ck6', term: 'Innovation', category: 'Brand', description: 'Technologischer Vorreiter' },
    { id: 'ck7', term: 'Vertrauen', category: 'Value', description: 'Kernversprechen der Marke' },
    { id: 'ck8', term: 'DACH-Markt', category: 'Geographic', description: 'Primäre geografische Ausrichtung' },
];

// ─────────────────────────────────────────────
// KAMPAGNEN (erweitert)
// ─────────────────────────────────────────────

export const campaigns = [
    {
        id: '1',
        name: 'Frühlings-Launch 2026',
        status: 'active',
        startDate: '2026-03-01',
        endDate: '2026-04-15',
        budget: 15000,
        spent: 8450,
        channels: ['E-Mail', 'Social Media', 'Google Ads'],
        description: 'Produktlaunch der neuen Frühlingskollektion über alle digitalen Kanäle.',
        masterPrompt: `Du bist ein erfahrener Marketing-Texter für unsere Frühlingskollektion 2026.

**Marke & Ton:** Premium, frisch, einladend – spreche Kunden persönlich an. Nutze eine warme, enthusiastische Sprache, die Aufbruchsstimmung vermittelt.

**Kernbotschaft:** „Der Frühling beginnt jetzt – entdecke unsere neue Kollektion und bring Farbe in deinen Alltag."

**Zielgruppe:** Digital Dave (28-38 J., technikaffin) und E-Commerce-Eva (30-45 J., fashionorientiert).

**USPs dieser Kampagne:**
- Limitierte Frühlingskollektion, nur bis 15. April verfügbar
- Kostenloser Versand ab 50€
- Nachhaltig produziert (Made in Europe)

**Dos:** Emotion wecken, Saisonalität betonen, Dringlichkeit erzeugen
**Don'ts:** Kein Fachjargon, keine negativen Formulierungen, keine generischen Floskeln`,
        targetAudiences: ['a1', 'a4'],
        campaignKeywords: ['Frühlingskollektion', 'New Arrivals', 'Seasonal Sale', 'Limited Edition', 'Frühjahr 2026'],
        kpis: { impressions: 245000, clicks: 12340, conversions: 387, ctr: 5.03 },
        owner: 'Sarah Müller',
        progress: 65,
    },
    {
        id: '2',
        name: 'Brand Awareness Q1',
        status: 'active',
        startDate: '2026-01-15',
        endDate: '2026-03-31',
        budget: 25000,
        spent: 19200,
        channels: ['Social Media', 'Display', 'YouTube'],
        description: 'Langfristige Brand-Awareness-Kampagne für den DACH-Markt.',
        masterPrompt: `Du bist Markenbotschafter für unsere Brand-Awareness-Kampagne im DACH-Raum, Q1 2026.

**Marke & Ton:** Professionell, vertrauenswürdig, modern. Wir sprechen Entscheider und Tech-Affine an.

**Kernbotschaft:** „Wir sind die europäische Alternative – DSGVO-konform, leistungsstark und verlässlich."

**Zielgruppe:** Manager Maria (B2B-Entscheider) und Digital Dave (Early Adopter).

**USPs dieser Kampagne:**
- Europäischer Anbieter mit DSGVO-Compliance
- Fokus auf DACH-Markt Besonderheiten
- Case Studies & Social Proof

**Dos:** Zahlen & Fakten nutzen, Vertrauen aufbauen, professionell und klar kommunizieren
**Don'ts:** Keine Übertreibungen, keine US-zentrischen Formulierungen`,
        targetAudiences: ['a1', 'a2'],
        campaignKeywords: ['Brand Awareness', 'DACH-Markt', 'Markenbekanntheit', 'B2B Marketing', 'Thought Leadership'],
        kpis: { impressions: 890000, clicks: 34500, conversions: 1240, ctr: 3.88 },
        owner: 'Max Weber',
        progress: 85,
    },
    {
        id: '3',
        name: 'Newsletter Relaunch',
        status: 'planned',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        budget: 5000,
        spent: 0,
        channels: ['E-Mail'],
        description: 'Kompletter Relaunch des wöchentlichen Newsletters mit neuem Design.',
        masterPrompt: `Du schreibst Inhalte für unseren relaunched Newsletter (ab April 2026).

**Format & Ton:** Kurzweilig, informativ, persönlich. Subject Lines sollen neugierig machen, nicht clickbait sein.

**Kernbotschaft:** „Dein wöchentliches Update – kompakt, relevant, inspirierend."

**Zielgruppe:** Bestehende Abonnenten: Mix aus B2B-Entscheidern (Manager Maria) und kreativen Usern (Kreativ-Klaus).

**Newsletter-Elemente:**
- Opener: Persönliche Ansprache & Woche-Highlight
- Main Content: 1 Hauptartikel + 2 Shorts
- Quicklinks: 3 relevante externe Ressourcen
- CTA: Immer klar, ein CTA pro Mail

**Dos:** Scannable schreiben, Emojis sparsam einsetzen, Mehrwert vor Eigenwerbung
**Don'ts:** Kein Spam-Stil, keine irrelevante Eigenwerbung`,
        targetAudiences: ['a2', 'a3'],
        campaignKeywords: ['Newsletter', 'E-Mail Marketing', 'Abonnenten', 'Open Rate', 'Re-Engagement'],
        kpis: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 },
        owner: 'Lisa Chen',
        progress: 20,
    },
    {
        id: '4',
        name: 'Sommer-Sale Teaser',
        status: 'draft',
        startDate: '2026-05-15',
        endDate: '2026-06-30',
        budget: 18000,
        spent: 0,
        channels: ['Social Media', 'E-Mail', 'Google Ads', 'Meta Ads'],
        description: 'Vorab-Kampagne für den großen Sommer-Sale 2026.',
        masterPrompt: `Du bereitest Teaser-Inhalte für unseren Sommer-Sale 2026 vor.

**Ton:** Aufgeregt, erwartungsvoll, dringend – aber nicht aufdringlich. "Save the Date" Mentalität.

**Kernbotschaft:** „Der größte Sale des Jahres kommt. Sei dabei, wenn es losgeht."

**Zielgruppe:** E-Commerce-Eva und Digital Dave – kaufbereite Zielgruppe mit Interesse an Angeboten.

**Teaser-Elemente:**
- Countdown-Elemente nutzen
- Exklusive Early-Access-Angebote für Newsletter-Abonnenten
- "Kommt bald" – kein vollständiges Produktspektrum zeigen

**Dos:** FOMO erzeugen, Exklusivität betonen, einfache CTAs wie "Erinnere mich"
**Don'ts:** Keine finalen Preise nennen, nicht zu früh alles verraten`,
        targetAudiences: ['a4', 'a1'],
        campaignKeywords: ['Sommer-Sale', 'Deal Alert', 'Save the Date', 'Early Access', 'Summer 2026'],
        kpis: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 },
        owner: 'Sarah Müller',
        progress: 5,
    },
    {
        id: '5',
        name: 'Webinar-Serie: Marketing Trends',
        status: 'completed',
        startDate: '2026-01-01',
        endDate: '2026-02-28',
        budget: 8000,
        spent: 7200,
        channels: ['E-Mail', 'LinkedIn', 'YouTube'],
        description: 'Vierteilige Webinar-Serie zu aktuellen Marketing-Trends.',
        masterPrompt: `Du erstellst Inhalte für eine professionelle Webinar-Serie zu Marketing-Trends 2026.

**Ton:** Fachkundig, einladend, lehrreich. Wir positionieren uns als Thought Leader.

**Kernbotschaft:** „Bleib voraus – lerne von den Besten, was 2026 im Marketing zählt."

**Zielgruppe:** Manager Maria und Kreativ-Klaus – Marketing-Profis, die sich weiterentwickeln wollen.

**Content-Vorgaben:**
- Immer mit konkreten Daten und Beispielen arbeiten
- Praxisrelevanz betonen
- Sprecher/Experten vorstellen und Credibility aufbauen

**Dos:** Fachbegriffe sind ok, aber immer erklären – inklusives Niveau
**Don'ts:** Kein zu theoretischer Ansatz, immer mit Take-Aways enden`,
        targetAudiences: ['a2', 'a3'],
        campaignKeywords: ['Webinar', 'Marketing Trends 2026', 'Lead Generation', 'Thought Leadership', 'Education'],
        kpis: { impressions: 156000, clicks: 8900, conversions: 620, ctr: 5.71 },
        owner: 'Max Weber',
        progress: 100,
    },
    {
        id: '6',
        name: 'Influencer Kooperation',
        status: 'paused',
        startDate: '2026-02-15',
        endDate: '2026-03-31',
        budget: 12000,
        spent: 4500,
        channels: ['Instagram', 'TikTok'],
        description: 'Kooperation mit 5 Micro-Influencern im Lifestyle-Bereich.',
        masterPrompt: `Du briefst Influencer und erstellst Inhalte für unsere Influencer-Kooperation.

**Ton:** Authentisch, locker, lifestyle-orientiert. Wirbt, ohne wie Werbung zu wirken.

**Kernbotschaft:** „Von echten Menschen für echte Menschen – entdecke, was wirklich funktioniert."

**Zielgruppe:** Kreativ-Klaus und E-Commerce-Eva – junge, social-media-affine Konsumenten.

**Briefing-Framework für Influencer:**
- Key Message & Kernwert in 1 Satz
- Was gezeigt werden soll (Produkt in Nutzung, kein Studio-Stil)
- Hashtags & Mentions (Pflicht)
- Was NICHT kommuniziert werden darf

**Dos:** Natürlichkeit und Persönlichkeit des Influencers bewahren, Story-Format bevorzugen
**Don'ts:** Kein generischer "Werbung"-Stil, keine Fake-Testimonials`,
        targetAudiences: ['a3', 'a4'],
        campaignKeywords: ['Influencer Marketing', 'Micro-Influencer', 'UGC', 'Authentic Content', 'Lifestyle'],
        kpis: { impressions: 89000, clicks: 4200, conversions: 156, ctr: 4.72 },
        owner: 'Lisa Chen',
        progress: 40,
    },
];

export const tasks = [
    { id: '1', title: 'Ad Creatives für Frühlings-Launch', status: 'done', priority: 'high', assignee: 'Lisa Chen', dueDate: '2026-03-05', campaign: 'Frühlings-Launch 2026' },
    { id: '2', title: 'Landing Page erstellen', status: 'in-progress', priority: 'high', assignee: 'Max Weber', dueDate: '2026-03-12', campaign: 'Frühlings-Launch 2026' },
    { id: '3', title: 'E-Mail-Template designen', status: 'in-progress', priority: 'medium', assignee: 'Sarah Müller', dueDate: '2026-03-15', campaign: 'Newsletter Relaunch' },
    { id: '4', title: 'Social Media Posts planen', status: 'todo', priority: 'medium', assignee: 'Lisa Chen', dueDate: '2026-03-18', campaign: 'Brand Awareness Q1' },
    { id: '5', title: 'Google Ads Keywords recherchieren', status: 'todo', priority: 'high', assignee: 'Max Weber', dueDate: '2026-03-20', campaign: 'Frühlings-Launch 2026' },
    { id: '6', title: 'A/B Test auswerten', status: 'in-review', priority: 'medium', assignee: 'Sarah Müller', dueDate: '2026-03-10', campaign: 'Brand Awareness Q1' },
    { id: '7', title: 'Influencer Briefing schreiben', status: 'todo', priority: 'low', assignee: 'Lisa Chen', dueDate: '2026-03-25', campaign: 'Influencer Kooperation' },
    { id: '8', title: 'Webinar Aufzeichnungen schneiden', status: 'done', priority: 'low', assignee: 'Max Weber', dueDate: '2026-03-08', campaign: 'Webinar-Serie' },
    { id: '9', title: 'Budget-Review Q1', status: 'in-review', priority: 'high', assignee: 'Sarah Müller', dueDate: '2026-03-14', campaign: null },
    { id: '10', title: 'Sommer-Sale Konzept', status: 'todo', priority: 'medium', assignee: 'Sarah Müller', dueDate: '2026-03-30', campaign: 'Sommer-Sale Teaser' },
];

export const calendarEvents = [
    { id: '1', title: 'Instagram Post: Frühling', date: '2026-03-10', type: 'primary', channel: 'Social Media' },
    { id: '2', title: 'Newsletter Versand', date: '2026-03-12', type: 'info', channel: 'E-Mail' },
    { id: '3', title: 'Google Ads Start', date: '2026-03-15', type: 'warning', channel: 'Ads' },
    { id: '4', title: 'Blog Post veröffentlichen', date: '2026-03-17', type: 'success', channel: 'Content' },
    { id: '5', title: 'LinkedIn Artikel', date: '2026-03-18', type: 'primary', channel: 'Social Media' },
    { id: '6', title: 'Facebook Kampagne', date: '2026-03-20', type: 'info', channel: 'Social Media' },
    { id: '7', title: 'Newsletter #13', date: '2026-03-22', type: 'info', channel: 'E-Mail' },
    { id: '8', title: 'TikTok Video Launch', date: '2026-03-24', type: 'warning', channel: 'Social Media' },
    { id: '9', title: 'Webinar: SEO Trends', date: '2026-03-26', type: 'success', channel: 'Content' },
    { id: '10', title: 'Meta Ads Review', date: '2026-03-28', type: 'primary', channel: 'Ads' },
    { id: '11', title: 'Monatsreport erstellen', date: '2026-03-31', type: 'warning', channel: 'Reporting' },
    { id: '12', title: 'YouTube Video', date: '2026-03-14', type: 'success', channel: 'Content' },
    { id: '13', title: 'Twitter/X Post', date: '2026-03-11', type: 'primary', channel: 'Social Media' },
    { id: '14', title: 'Story Kampagne', date: '2026-03-19', type: 'info', channel: 'Social Media' },
];

export const budgetData = {
    total: 83000,
    spent: 39350,
    remaining: 43650,
    categories: [
        { name: 'Google Ads', planned: 20000, spent: 12400, color: '#6366f1' },
        { name: 'Meta Ads', planned: 18000, spent: 8900, color: '#06b6d4' },
        { name: 'Content Produktion', planned: 15000, spent: 7200, color: '#10b981' },
        { name: 'Influencer', planned: 12000, spent: 4500, color: '#f59e0b' },
        { name: 'E-Mail Marketing', planned: 8000, spent: 3250, color: '#ef4444' },
        { name: 'Tools & Software', planned: 5000, spent: 2100, color: '#8b5cf6' },
        { name: 'Events & Webinare', planned: 5000, spent: 1000, color: '#ec4899' },
    ],
    monthlyTrend: [
        { month: 'Jan', planned: 12000, actual: 10800 },
        { month: 'Feb', planned: 13000, actual: 14200 },
        { month: 'Mär', planned: 14000, actual: 14350 },
        { month: 'Apr', planned: 12000, actual: 0 },
        { month: 'Mai', planned: 11000, actual: 0 },
        { month: 'Jun', planned: 10500, actual: 0 },
    ],
};

export const activityFeed = [
    { id: '1', user: 'Lisa Chen', action: 'hat Ad Creatives hochgeladen', target: 'Frühlings-Launch 2026', time: 'vor 15 Min.', icon: '📎' },
    { id: '2', user: 'Max Weber', action: 'hat Landing Page erstellt', target: 'Frühlings-Launch 2026', time: 'vor 1 Std.', icon: '🌐' },
    { id: '3', user: 'Sarah Müller', action: 'hat Budget genehmigt', target: 'Newsletter Relaunch', time: 'vor 2 Std.', icon: '💰' },
    { id: '4', user: 'Max Weber', action: 'hat A/B Test gestartet', target: 'Brand Awareness Q1', time: 'vor 3 Std.', icon: '🧪' },
    { id: '5', user: 'Lisa Chen', action: 'hat Kampagne pausiert', target: 'Influencer Kooperation', time: 'vor 5 Std.', icon: '⏸️' },
    { id: '6', user: 'System', action: 'Budget-Alert: 80% erreicht', target: 'Brand Awareness Q1', time: 'vor 6 Std.', icon: '⚠️' },
];

export const teamMembers = [
    { id: '1', name: 'Sarah Müller', role: 'Marketing Manager', avatar: 'SM', status: 'online' },
    { id: '2', name: 'Max Weber', role: 'Content Specialist', avatar: 'MW', status: 'online' },
    { id: '3', name: 'Lisa Chen', role: 'Social Media Manager', avatar: 'LC', status: 'away' },
    { id: '4', name: 'Tom Schmidt', role: 'SEA Expert', avatar: 'TS', status: 'offline' },
];

export const dashboardChartData = [
    { name: 'KW 5', impressions: 45000, clicks: 2100, conversions: 89 },
    { name: 'KW 6', impressions: 52000, clicks: 2800, conversions: 124 },
    { name: 'KW 7', impressions: 48000, clicks: 2400, conversions: 98 },
    { name: 'KW 8', impressions: 61000, clicks: 3100, conversions: 156 },
    { name: 'KW 9', impressions: 58000, clicks: 2900, conversions: 142 },
    { name: 'KW 10', impressions: 71000, clicks: 3600, conversions: 178 },
    { name: 'KW 11', impressions: 65000, clicks: 3300, conversions: 163 },
];

export const channelPerformance = [
    { name: 'Google Ads', value: 35, color: '#6366f1' },
    { name: 'Meta Ads', value: 25, color: '#06b6d4' },
    { name: 'E-Mail', value: 20, color: '#10b981' },
    { name: 'Social Organic', value: 12, color: '#f59e0b' },
    { name: 'SEO', value: 8, color: '#8b5cf6' },
];
