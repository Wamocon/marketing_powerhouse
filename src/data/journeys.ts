import type { AsidasJourney } from '../types';

export const asidasJourneys: AsidasJourney[] = [
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
            { id: 's6', phase: 'Share', title: 'Erfolg teilen', description: 'Prüfung bestanden! Zertifikat wird geteilt.', touchpoints: ['tp7', 'tp8'], contentFormats: ['LinkedIn Zertifikat Template', 'Alumni Interview'], emotions: ['Stolz'], painPoints: ['Jobeinstieg'], metrics: { label: 'Trustpilot Ratings', value: '12', trend: '+2%' } },
        ],
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
            { id: 's6', phase: 'Share', title: 'Langfristige Partnerschaft', description: 'Team besteht Prüfung, Hannah lobt uns intern.', touchpoints: ['tp2'], contentFormats: ['B2B Case Study'], emotions: ['Zufrieden', 'Gut positioniert intern'], painPoints: ['Nächstes Fortbildungsjahr'], metrics: { label: 'Upsell %', value: '30%', trend: '+5%' } },
        ],
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
            { id: 's6', phase: 'Share', title: 'Prüfungszeugnis auf Social Media', description: 'Postet stolz das Zertifikat.', touchpoints: ['tp2', 'tp7'], contentFormats: ['Zertifikats-Post Vorlage'], emotions: ['Stolz', 'Gehaltserhöhung in Sicht'], painPoints: ['-'], metrics: { label: 'Mentions', value: '60', trend: '+8%' } },
        ],
    },
];

export const customerJourneys: AsidasJourney[] = [
    {
        id: 'cj1',
        name: 'Quirin (Quereinsteiger) - 5-Phasen Journey',
        audienceId: 'a1',
        description: 'Standard 5-Phasen Customer Journey von ersten Problembewusstsein bis zur Weiterempfehlung nach der Schulung.',
        stages: [
            { id: 'phs1', phase: 'Awareness', title: 'Bewusstsein für Relevanz', description: 'Erfährt über Social Media, dass IT-Quereinstieg auch ohne Programmieren möglich ist.', touchpoints: ['tp6', 'tp2'], contentFormats: ['Social Media Video', 'Anzeigen'], emotions: ['Neugierig'], painPoints: ['IT scheint zu komplex'], metrics: { label: 'Reichweite', value: '50.000', trend: '+10%' }, contentIds: ['cnt1'] },
            { id: 'phs2', phase: 'Consideration', title: 'Erwägung & Abwägung', description: 'Sucht nach Informationen zu Bildungsgutschein und Voraussetzungen.', touchpoints: ['tp1', 'tp3'], contentFormats: ['Blogbeiträge', 'Webinar'], emotions: ['Wissbegierig'], painPoints: ['Finanzierung unklar'], metrics: { label: 'Webinar Anmeldungen', value: '400', trend: '+15%' }, contentIds: ['cnt4', 'cnt2'] },
            { id: 'phs3', phase: 'Purchase', title: 'Kauf & Entscheidung', description: 'Entscheidet sich für den ISTQB-Kurs und meldet sich nach Klärung mit der Agentur für Arbeit an.', touchpoints: ['tp4', 'tp5'], contentFormats: ['E-Mail', 'Beratungsgespräch'], emotions: ['Erwartungsvoll'], painPoints: ['Antrag beim Amt dauert'], metrics: { label: 'Abschlüsse', value: '50', trend: '+5%' } },
            { id: 'phs4', phase: 'Retention', title: 'Bindung & Begleitung', description: 'Nimmt aktiv am Kurs teil und nutzt die DiTeLe Plattform.', touchpoints: ['tp8', 'tp4'], contentFormats: ['Lern-Inhalte', 'Check-ins'], emotions: ['Motiviert'], painPoints: ['Lernstress'], metrics: { label: 'Kursfortschritt', value: '85%', trend: '+2%' } },
            { id: 'phs5', phase: 'Advocacy', title: 'Loyalität & Weiterempfehlung', description: 'Bestes Testimonials – erfolgreicher Abschluss und neuer Job in der IT.', touchpoints: ['tp7', 'tp2'], contentFormats: ['Bewertung', 'Alumni-Netzwerk'], emotions: ['Stolz', 'Dankbar'], painPoints: ['Neue Jobsuche'], metrics: { label: 'Bewertungen', value: '25', trend: '+15%' } },
        ],
    },
    {
        id: 'cj2',
        name: 'Hannah (HR) - B2B 5-Phasen Journey',
        audienceId: 'a2',
        description: 'Von der Problemerkennung im eigenen Team bis zur langfristigen Partnerschaft für Inhouse-Schulungen.',
        stages: [
            { id: 'phs1', phase: 'Awareness', title: 'Bedarf erkennen', description: 'Die Qualität im QA-Team sinkt, ein Standard muss her.', touchpoints: ['tp2'], contentFormats: ['Whitepaper'], emotions: ['Gestresst'], painPoints: ['Fehlerhafte Releases'], metrics: { label: 'Impressions', value: '12.000', trend: '+5%' }, contentIds: ['cnt5'] },
            { id: 'phs2', phase: 'Consideration', title: 'Optionen prüfen', description: 'Vergleicht Anbieter von ISTQB Inhouse Schulungen.', touchpoints: ['tp1', 'tp3'], contentFormats: ['B2B Landingpage'], emotions: ['Analytisch'], painPoints: ['Zertifizierter Trainer gesucht'], metrics: { label: 'B2B Traffic', value: '900', trend: '+2%' } },
            { id: 'phs3', phase: 'Purchase', title: 'Beauftragung', description: 'Entscheidet sich für Test-IT Academy aufgrund von Praxisnähe.', touchpoints: ['tp5'], contentFormats: ['Angebot', 'Pitch'], emotions: ['Erleichtert'], painPoints: ['Budgetfreigabe'], metrics: { label: 'Won Deals', value: '5', trend: '0%' } },
            { id: 'phs4', phase: 'Retention', title: 'Schulungserfahrung', description: 'Das Inhouse-Training läuft erfolgreich und das Team wendet das Wissen an.', touchpoints: ['tp8', 'tp5'], contentFormats: ['Feedbackbogen'], emotions: ['Zufrieden'], painPoints: ['Terminkoordination intern'], metrics: { label: 'Teilnehmer Feedback', value: '4.8/5', trend: '+0.1' } },
            { id: 'phs5', phase: 'Advocacy', title: 'Folgeaufträge & Empfehlungen', description: 'Hannah bucht einen weiteren Kurs und empfiehlt die Academy intern weiter.', touchpoints: ['tp4', 'tp2'], contentFormats: ['Case Study'], emotions: ['Erfolgreich'], painPoints: ['Keine'], metrics: { label: 'Upsell', value: '2', trend: '+1' }, contentIds: ['cnt5'] },
        ],
    },
];
