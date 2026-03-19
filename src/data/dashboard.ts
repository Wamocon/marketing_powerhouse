import type {
    BudgetData, ActivityItem, TeamMember, ChartDataPoint,
    ChannelPerformanceItem, Touchpoint,
} from '../types';

export const budgetData: BudgetData = {
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

export const activityFeed: ActivityItem[] = [
    { id: '1', user: 'Lisa Bauer', action: 'hat neue Ad Creatives hochgeladen', target: 'Evergreen: Kostenloses Webinar', time: 'vor 15 Min.', icon: '📎' },
    { id: '2', user: 'Daniel Moretz', action: 'hat DiTeLe-Texte aktualisiert', target: 'Launch DiTeLe Online-Kurs', time: 'vor 1 Std.', icon: '✍️' },
    { id: '3', user: 'Waleri Moretz', action: 'hat Webinar-Start freigegeben', target: 'Evergreen: Kostenloses Webinar', time: 'vor 2 Std.', icon: '✅' },
    { id: '4', user: 'Tom Weber', action: 'hat Ads CTR optimiert', target: 'Frühlings-Kurs: Präsenz in Eschborn', time: 'vor 3 Std.', icon: '📈' },
    { id: '5', user: 'Anna Schmidt', action: 'hat LinkedIn Post geplant', target: 'B2B: Corporate Inhouse Trainings', time: 'vor 5 Std.', icon: '📅' },
    { id: '6', user: 'System', action: 'Budget-Alert: Ads Q1 Budget 75% ausgelastet', target: 'Gesamtbudget', time: 'vor 6 Std.', icon: '⚠️' },
];

export const teamMembers: TeamMember[] = [
    { id: '1', name: 'Waleri Moretz', role: 'Akkr. Trainer / Gründer', avatar: 'WM', status: 'online' },
    { id: '2', name: 'Anna Schmidt', role: 'Marketing Managerin', avatar: 'AS', status: 'online' },
    { id: '3', name: 'Lisa Bauer', role: 'Content & Social', avatar: 'LB', status: 'away' },
    { id: '4', name: 'Tom Weber', role: 'Performance Experte', avatar: 'TW', status: 'offline' },
    { id: '5', name: 'Jana Klein', role: 'Community Support', avatar: 'JK', status: 'online' },
];

export const dashboardChartData: ChartDataPoint[] = [
    { name: 'KW 5', impressions: 45000, clicks: 2100, conversions: 89 },
    { name: 'KW 6', impressions: 52000, clicks: 2800, conversions: 124 },
    { name: 'KW 7', impressions: 48000, clicks: 2400, conversions: 98 },
    { name: 'KW 8', impressions: 61000, clicks: 3100, conversions: 156 },
    { name: 'KW 9', impressions: 58000, clicks: 2900, conversions: 142 },
    { name: 'KW 10', impressions: 71000, clicks: 3600, conversions: 178 },
];

export const channelPerformance: ChannelPerformanceItem[] = [
    { name: 'Google Search Ads', value: 40, color: '#6366f1' },
    { name: 'Meta Ads', value: 25, color: '#06b6d4' },
    { name: 'Webinar (Organic)', value: 15, color: '#10b981' },
    { name: 'LinkedIn (B2B)', value: 12, color: '#f59e0b' },
    { name: 'SEO', value: 8, color: '#8b5cf6' },
];

export const touchpoints: Touchpoint[] = [
    { id: 'tp1', name: 'Google Search Ads', type: 'Paid Search', journeyPhase: 'Search', url: 'google.com/ads', status: 'active', description: 'Bezahlte Anzeigen auf Google für brand und non-brand Keywords.', kpis: { impressions: 590000, clicks: 23200, conversions: 858, ctr: 3.93, spend: 14000, cpc: 0.60, cpa: 16.32 } },
    { id: 'tp2', name: 'LinkedIn Ads', type: 'Paid Social', journeyPhase: 'Attention', url: 'linkedin.com/campaign', status: 'active', description: 'Lead Gen Forms und Sponsored Content auf LinkedIn.', kpis: { impressions: 48000, clicks: 2400, conversions: 160, ctr: 5.0, spend: 1200, cpc: 0.50, cpa: 7.50 } },
    { id: 'tp3', name: 'Webinar Landingpage', type: 'Owned Website', journeyPhase: 'Interest', url: 'test-it-academy.de/webinar', status: 'active', description: 'Die zentrale Anmeldeseite für das DiTeLe-Webinar.', kpis: { impressions: 46000, clicks: 2400, conversions: 150, ctr: 5.22, spend: 0, cpc: 0, cpa: 0 } },
    { id: 'tp4', name: 'E-Mail Automation (ActiveCampaign)', type: 'Owned CRM', journeyPhase: 'Desire', url: 'activecampaign.com', status: 'active', description: 'Follow-up Sequenz nach Webinar-Teilnahme.', kpis: { impressions: 102000, clicks: 6100, conversions: 387, ctr: 5.98, spend: 830, cpc: 0.14, cpa: 2.14 } },
    { id: 'tp5', name: 'Sales Pipeline (Telefon)', type: 'Direct Sales', journeyPhase: 'Action', url: '-', status: 'planned', description: 'Telefongespräch durch B2B-Closer nach Leadgenerierung.' },
    { id: 'tp6', name: 'Instagram Reels', type: 'Organic Social', journeyPhase: 'Awareness', url: 'instagram.com/testit', status: 'active', description: 'Kurzvideos für Awareness, um Quereinsteiger zu inspirieren.', kpis: { impressions: 505000, clicks: 21640, conversions: 692, ctr: 4.29, spend: 0, cpc: 0, cpa: 0 } },
    { id: 'tp7', name: 'Trustpilot Reviews', type: 'Earned Media', journeyPhase: 'Advocacy', url: 'trustpilot.com/review', status: 'active', description: 'Bewertungen von ehemaligen Schülern.', kpis: { impressions: 12000, clicks: 890, conversions: 34, ctr: 7.42, spend: 0, cpc: 0, cpa: 0 } },
    { id: 'tp8', name: 'Lern-Plattform (LMS)', type: 'Product', journeyPhase: 'Retention', url: 'lms.test-it-academy.de', status: 'active', description: 'Die Moodle-basierte Lernumgebung für aktive Kursteilnehmer.', kpis: { impressions: 8500, clicks: 6200, conversions: 420, ctr: 72.94, spend: 0, cpc: 0, cpa: 0 } },
];
