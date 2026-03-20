import type { CustomerJourney } from '../types';

export const customerJourneys: CustomerJourney[] = [
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
