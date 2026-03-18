// Migration script: Creates all tables and seeds data in Supabase Momentum project
// Run via: node scripts/migrate.mjs

const SUPABASE_MCP_URL = 'https://mcp.supabase.com/mcp';
const SUPABASE_PAT = 'sbp_c3e67a8545c389fd0c922adc6ebad248d42f324c';
const PROJECT_ID = 'ftbkqtteavvdqmhbmzoy';

const headers = {
  Authorization: `Bearer ${SUPABASE_PAT}`,
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
};

let sessionId = null;

async function mcpCall(method, params, id = 1) {
  const body = { jsonrpc: '2.0', id, method, params };
  const h = { ...headers };
  if (sessionId) h['mcp-session-id'] = sessionId;
  const res = await fetch(SUPABASE_MCP_URL, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`MCP HTTP ${res.status}: ${await res.text()}`);
  const sid = res.headers.get('mcp-session-id');
  if (sid) sessionId = sid;
  return res.json();
}

async function executeSql(sql) {
  const result = await mcpCall('tools/call', {
    name: 'execute_sql',
    arguments: { project_id: PROJECT_ID, query: sql },
  }, Math.floor(Math.random() * 100000));
  const content = result?.result?.content?.[0]?.text;
  if (content && content.includes('"error"')) {
    throw new Error(`SQL error: ${content}`);
  }
  return content;
}

async function init() {
  await mcpCall('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'migrate-script', version: '1.0.0' },
  });
  await mcpCall('notifications/initialized', {});
  console.log('MCP session initialized');
}

// ─── Schema SQL ────────────────────────────────────────────

const SCHEMA_SQL = `
-- Drop existing tables (in dependency order)
DROP TABLE IF EXISTS journey_stages CASCADE;
DROP TABLE IF EXISTS journeys CASCADE;
DROP TABLE IF EXISTS channel_performance CASCADE;
DROP TABLE IF EXISTS dashboard_chart_data CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS activity_feed CASCADE;
DROP TABLE IF EXISTS monthly_trends CASCADE;
DROP TABLE IF EXISTS budget_categories CASCADE;
DROP TABLE IF EXISTS budget_overview CASCADE;
DROP TABLE IF EXISTS company_keywords CASCADE;
DROP TABLE IF EXISTS company_positioning CASCADE;
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS audiences CASCADE;
DROP TABLE IF EXISTS touchpoints CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── Users ──
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','manager','member')),
  job_title TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online','away','offline')),
  department TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  joined_at TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Touchpoints ──
CREATE TABLE touchpoints (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  journey_phase TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('active','planned','inactive')),
  description TEXT NOT NULL DEFAULT '',
  kpis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER touchpoints_updated_at BEFORE UPDATE ON touchpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Audiences ──
CREATE TABLE audiences (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'buyer',
  segment TEXT NOT NULL CHECK (segment IN ('B2C','B2B')),
  color TEXT NOT NULL DEFAULT '#6366f1',
  initials TEXT NOT NULL DEFAULT '',
  age TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  income TEXT NOT NULL DEFAULT '',
  education TEXT NOT NULL DEFAULT '',
  job_title TEXT NOT NULL DEFAULT '',
  interests TEXT[] DEFAULT '{}',
  pain_points TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  preferred_channels TEXT[] DEFAULT '{}',
  buying_behavior TEXT NOT NULL DEFAULT '',
  decision_process TEXT NOT NULL DEFAULT '',
  journey_phase TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  campaign_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER audiences_updated_at BEFORE UPDATE ON audiences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Campaigns ──
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('active','planned','completed','paused')),
  start_date TEXT,
  end_date TEXT,
  budget NUMERIC(12,2) DEFAULT 0,
  spent NUMERIC(12,2) DEFAULT 0,
  channels TEXT[] DEFAULT '{}',
  touchpoint_ids TEXT[] DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  master_prompt TEXT NOT NULL DEFAULT '',
  target_audiences TEXT[] DEFAULT '{}',
  campaign_keywords TEXT[] DEFAULT '{}',
  kpis JSONB DEFAULT '{"impressions":0,"clicks":0,"conversions":0,"ctr":0}',
  channel_kpis JSONB,
  owner TEXT NOT NULL DEFAULT '',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Tasks ──
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ai_generating','ai_ready','revision','review','approved','scheduled','live','monitoring','analyzed')),
  assignee TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT '',
  due_date TEXT,
  publish_date TEXT,
  platform TEXT,
  touchpoint_id TEXT,
  type TEXT NOT NULL DEFAULT '',
  one_drive_link TEXT,
  description TEXT NOT NULL DEFAULT '',
  campaign_id TEXT,
  scope TEXT,
  performance JSONB,
  ai_suggestion TEXT,
  ai_prompt TEXT,
  analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Contents ──
CREATE TABLE contents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea','planning','production','ready','scheduled','published')),
  publish_date TEXT,
  platform TEXT NOT NULL DEFAULT '',
  touchpoint_id TEXT,
  campaign_id TEXT,
  task_ids TEXT[] DEFAULT '{}',
  author TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT '',
  journey_phase TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER contents_updated_at BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Company Positioning ──
CREATE TABLE company_positioning (
  id TEXT PRIMARY KEY DEFAULT 'main',
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  founded TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  headquarters TEXT NOT NULL DEFAULT '',
  legal_form TEXT NOT NULL DEFAULT '',
  employees TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  vision TEXT NOT NULL DEFAULT '',
  mission TEXT NOT NULL DEFAULT '',
  company_values JSONB DEFAULT '[]',
  tone_of_voice JSONB DEFAULT '{}',
  dos TEXT[] DEFAULT '{}',
  donts TEXT[] DEFAULT '{}',
  primary_market TEXT NOT NULL DEFAULT '',
  secondary_markets TEXT[] DEFAULT '{}',
  target_company_size TEXT NOT NULL DEFAULT '',
  target_industries TEXT[] DEFAULT '{}',
  last_updated TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL DEFAULT ''
);

-- ── Company Keywords ──
CREATE TABLE company_keywords (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Budget ──
CREATE TABLE budget_overview (
  id TEXT PRIMARY KEY DEFAULT 'main',
  total NUMERIC(12,2) DEFAULT 0,
  spent NUMERIC(12,2) DEFAULT 0,
  remaining NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE budget_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  planned NUMERIC(12,2) DEFAULT 0,
  spent NUMERIC(12,2) DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE monthly_trends (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  planned NUMERIC(12,2) DEFAULT 0,
  actual NUMERIC(12,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- ── Activity Feed ──
CREATE TABLE activity_feed (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  created_display TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Team Members ──
CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online','away','offline'))
);

-- ── Dashboard Chart Data ──
CREATE TABLE dashboard_chart_data (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- ── Channel Performance ──
CREATE TABLE channel_performance (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value INTEGER DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0
);

-- ── Journeys ──
CREATE TABLE journeys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  audience_id TEXT,
  description TEXT NOT NULL DEFAULT '',
  journey_type TEXT NOT NULL CHECK (journey_type IN ('asidas','customer')) DEFAULT 'asidas',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER journeys_updated_at BEFORE UPDATE ON journeys FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE journey_stages (
  id TEXT PRIMARY KEY,
  journey_id TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  touchpoints TEXT[] DEFAULT '{}',
  content_formats TEXT[] DEFAULT '{}',
  emotions TEXT[] DEFAULT '{}',
  pain_points TEXT[] DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  content_ids TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0
);
`;

// ─── Seed Data SQL ─────────────────────────────────────────

const SEED_USERS = `
INSERT INTO users (id, name, email, password, role, job_title, avatar, status, department, phone, joined_at) VALUES
('u1','Daniel Moretz','daniel@test-it-academy.de','admin123','admin','Akkreditierter ISTQB®-Trainer / Testmanager','DM','online','Geschäftsführung & Training','+49 123 456789-0','2015-01-01'),
('u2','Waleri Moretz','waleri@test-it-academy.de','manager123','manager','Gründer & Akkreditierter ISTQB®-Trainer','WM','online','Training & Qualität','+49 123 456789-1','1998-01-01'),
('u3','Anna Schmidt','anna@test-it-academy.de','manager123','manager','Marketing Managerin','AS','online','Marketing','+49 123 456789-2','2023-05-15'),
('u4','Lisa Bauer','lisa@test-it-academy.de','member123','member','Content & Social Media','LB','away','Marketing','+49 123 456789-3','2024-02-10'),
('u5','Tom Weber','tom@test-it-academy.de','member123','member','Performance Marketing Experte','TW','offline','Performance','+49 123 456789-4','2024-05-01'),
('u6','Jana Klein','jana@test-it-academy.de','member123','member','Community Support','JK','online','Kundenservice','+49 123 456789-5','2024-06-15');
`;

const SEED_TOUCHPOINTS = `
INSERT INTO touchpoints (id, name, type, journey_phase, url, status, description, kpis) VALUES
('tp1','Google Search Ads','Paid Search','Search','google.com/ads','active','Bezahlte Anzeigen auf Google für brand und non-brand Keywords.','{"impressions":590000,"clicks":23200,"conversions":858,"ctr":3.93,"spend":14000,"cpc":0.60,"cpa":16.32}'),
('tp2','LinkedIn Ads','Paid Social','Attention','linkedin.com/campaign','active','Lead Gen Forms und Sponsored Content auf LinkedIn.','{"impressions":48000,"clicks":2400,"conversions":160,"ctr":5.0,"spend":1200,"cpc":0.50,"cpa":7.50}'),
('tp3','Webinar Landingpage','Owned Website','Interest','test-it-academy.de/webinar','active','Die zentrale Anmeldeseite für das DiTeLe-Webinar.','{"impressions":46000,"clicks":2400,"conversions":150,"ctr":5.22,"spend":0,"cpc":0,"cpa":0}'),
('tp4','E-Mail Automation (ActiveCampaign)','Owned CRM','Desire','activecampaign.com','active','Follow-up Sequenz nach Webinar-Teilnahme.','{"impressions":102000,"clicks":6100,"conversions":387,"ctr":5.98,"spend":830,"cpc":0.14,"cpa":2.14}'),
('tp5','Sales Pipeline (Telefon)','Direct Sales','Action','-','planned','Telefongespräch durch B2B-Closer nach Leadgenerierung.',NULL),
('tp6','Instagram Reels','Organic Social','Awareness','instagram.com/testit','active','Kurzvideos für Awareness, um Quereinsteiger zu inspirieren.','{"impressions":505000,"clicks":21640,"conversions":692,"ctr":4.29,"spend":0,"cpc":0,"cpa":0}'),
('tp7','Trustpilot Reviews','Earned Media','Advocacy','trustpilot.com/review','active','Bewertungen von ehemaligen Schülern.','{"impressions":12000,"clicks":890,"conversions":34,"ctr":7.42,"spend":0,"cpc":0,"cpa":0}'),
('tp8','Lern-Plattform (LMS)','Product','Retention','lms.test-it-academy.de','active','Die Moodle-basierte Lernumgebung für aktive Kursteilnehmer.','{"impressions":8500,"clicks":6200,"conversions":420,"ctr":72.94,"spend":0,"cpc":0,"cpa":0}');
`;

const SEED_AUDIENCES = `
INSERT INTO audiences (id, name, type, segment, color, initials, age, gender, location, income, education, job_title, interests, pain_points, goals, preferred_channels, buying_behavior, decision_process, journey_phase, description, campaign_ids, created_at, updated_at) VALUES
('a1','Quereinsteiger Quirin','buyer','B2C','#6366f1','QQ','28–45','Männlich','Deutschland','Aktuell Arbeitssuchend / Umschulung','Abgeschlossene Ausbildung / Studium abseits IT','Arbeitssuchend',ARRAY['Neue Karrierechancen','Stabiles Einkommen','Lernen am PC'],ARRAY['Hat Angst, dass IT zu schwer ist','Kann nicht programmieren','Sucht berufliche Sicherheit'],ARRAY['Einen zukunftssicheren Job in der IT','Schneller Einstieg (max 45 Tage)','Finanzierung über Bildungsgutschein'],ARRAY['Facebook','Instagram','Jobportale','Google Search'],'Entscheidet nach Vertrauen ins Institut und Unterstützung bei Kostenerstattung.','Besucht kostenlose Webinare, spricht persönlich mit den Trainern.','Awareness → Consideration','Quirin sucht einen Ausweg aus seiner bisherigen Branche. Er hat gehört, dass in der IT gut bezahlt wird, ist aber unsicher, ob er stark genug in Mathe oder Code ist.',ARRAY['1','3'],'2026-01-15','2026-03-01'),
('a2','HR-Hannah','buyer','B2B','#10b981','HH','35–50','Weiblich','Rhein-Main Gebiet','k.A.','BWL Studium','Personalentwicklerin / HR Manager',ARRAY['Mitarbeiterbindung','Weiterbildung','Zertifizierungen'],ARRAY['Mitarbeiter für Softwaretests schulen','Fehlende Inhouse-Trainingskompetenz','Ausfallzeiten reduzieren'],ARRAY['Das QA-Team standardisiert (ISTQB) schulen','Qualität der Software-Releases erhöhen','Teambuilding durch gemeinsames Training'],ARRAY['LinkedIn','Persönliches Netzwerk','Google Search'],'Bucht Inhouse-Trainings oder Gruppen-Plätze, benötigt offizielle Rechnung und Zertifikat.','Vergleicht Anbieter nach ISTQB Akkreditierung und Flexibilität (Online/Vorort).','Consideration → Decision','Hannah soll das neue Test-Team weiterbilden und sucht einen verlässlichen, akkreditierten Partner für ISTQB-Schulungen.',ARRAY['4'],'2026-01-15','2026-03-02'),
('a3','Berufseinsteigerin Bea','buyer','B2C','#ec4899','BB','22–30','Weiblich','DACH-Region','Junior Gehalt / Teilzeit','Studium Informatik/Wirtschaftsinformatik','Junior QA Tester',ARRAY['Karriere-Aufstieg','Lebenslauf aufpolieren','Remote Work'],ARRAY['Viel Theorie im Studium, wenig Praxis','Steckt im Junior-Level fest','Fehlende Zertifizierung'],ARRAY['ISTQB Foundation Level Zertifikat erhalten','Selbstbewusstsein im Testing aufbauen'],ARRAY['Instagram','YouTube','TikTok'],'Sucht nach schnellen, flexiblen Online-Kursen. Zahlt ggf. selbst.','Vergleicht Preise und Tools. DiTeLe ist ein starkes Argument.','Consideration → Purchase','Bea arbeitet schon in der IT, möchte aber den offiziellen ISTQB Stempel, um in ihrem Unternehmen oder am Markt aufzusteigen.',ARRAY['2','3'],'2026-02-10','2026-03-08');
`;

const SEED_CAMPAIGNS = `
INSERT INTO campaigns (id, name, status, start_date, end_date, budget, spent, channels, touchpoint_ids, description, master_prompt, target_audiences, campaign_keywords, kpis, channel_kpis, owner, progress) VALUES
('1','Frühlings-Kurs: Präsenz in Eschborn','active','2026-01-19','2026-03-20',15000,8450,ARRAY['Google Ads','Meta Ads','E-Mail'],ARRAY['tp1','tp6','tp4'],'Bewerbung des Präsenzkurses inkl. Live-Online ab Mitte März.','Du bist Performance-Marketing Experte der WAMOCON Academy.\n\n**Marke & Ton:** Ermutigend, zielgerichtet. Du sprichst Jobsuchende an.\n**Kernbotschaft:** „In 45 Tagen vom Jobsuchenden zum IT-Tester – 100% gefördert."\n**Zielgruppe:** Quereinsteiger Quirin (Arbeitssuchend).\n\n**USPs dieser Kampagne:**\n- Präsenzkurs in Eschborn + Flexibilität (Live Online)\n- Start: Januar bis März\n- 100% finanzierbar über Bildungsgutschein\n- Keine Vorkenntnisse nötig\n\n**Dos:** Dringlichkeit zum Kursstart erzeugen. Bildungsgutschein in der Headline erwähnen.\n**Don''ts:** Zu technische Fachbegriffe verwenden.',ARRAY['a1'],ARRAY['Präsenzkurs','Eschborn','Bildungsgutschein','Arbeitsamt'],'{"impressions":245000,"clicks":12340,"conversions":387,"ctr":5.03}','{"tp1":{"impressions":120000,"clicks":7200,"conversions":198,"ctr":6.0,"spend":4200,"cpc":0.58,"cpa":21.21},"tp6":{"impressions":85000,"clicks":3140,"conversions":112,"ctr":3.69,"spend":0,"cpc":0,"cpa":0},"tp4":{"impressions":40000,"clicks":2000,"conversions":77,"ctr":5.0,"spend":450,"cpc":0.23,"cpa":5.84}}','Anna Schmidt',65),
('2','Launch DiTeLe Online-Kurs','active','2026-02-01','2026-04-30',25000,19200,ARRAY['YouTube','Instagram','Google Ads'],ARRAY['tp6','tp1'],'Push für den reinen 8-Wochen Online-Kurs CTFL 4.0 mit DiTeLe.','Du bewirbst unseren neuen 8-Wochen Online-Kurs für ISTQB CTFL 4.0.\n\n**Marke & Ton:** Modern, dynamisch, nutzenfokussiert.\n**Kernbotschaft:** „Lerne Softwaretesten. Nicht nur Folien. Hol dir das Zertifikat in 8 Wochen."\n**Zielgruppe:** Berufseinsteigerin Bea und ambitionierte Quereinsteiger.\n\n**USPs dieser Kampagne:**\n- Echtes Lernen am Praxis-Tool DiTeLe (300+ Übungen)\n- Zeitlich flexibel (8 Wochen Plan)\n- Akkreditierte Trainer beantworten Fragen\n\n**Dos:** Den Nicht nur Folien-Ansatz stark betonen. Praxis loben.\n**Don''ts:** Den Kurs als einfach mal durchklicken darstellen. Qualität muss rüberkommen.',ARRAY['a1','a3'],ARRAY['Online-Kurs','Selbststudium','DiTeLe Tool','8 Wochen Plan'],'{"impressions":890000,"clicks":34500,"conversions":1240,"ctr":3.88}','{"tp6":{"impressions":420000,"clicks":18500,"conversions":580,"ctr":4.40,"spend":0,"cpc":0,"cpa":0},"tp1":{"impressions":470000,"clicks":16000,"conversions":660,"ctr":3.40,"spend":9800,"cpc":0.61,"cpa":14.85}}','Tom Weber',85),
('3','Evergreen: Kostenloses Webinar','active','2026-01-01','2026-12-31',12000,2400,ARRAY['Meta Ads','LinkedIn','E-Mail'],ARRAY['tp4','tp2','tp3'],'Kontinuierliche Lead-Generierung über unser gratis Info-Webinar.','E-Mail Automatisierung und Ad-Texte für unser Gratis-Webinar.\n\n**Format & Ton:** Persönliche Einladung von Daniel und Waleri. Reißt Hürden ein.\n**Kernbotschaft:** „Möchtest du wissen, ob Softwaretesting das Richtige für dich ist? Finde es im Webinar heraus."\n**Zielgruppe:** Quereinsteiger, die noch zögern (Quirin).\n\n**Dos:** Niederschwellig. Kostenlos und unverbindlich klar hervorheben.\n**Don''ts:** Jetzt buchen-Druck aufbauen. Im Webinar geht es um Beratung.',ARRAY['a1'],ARRAY['Webinar','Kostenlos','IT-Einstieg','Beratung'],'{"impressions":156000,"clicks":8900,"conversions":620,"ctr":5.71}','{"tp4":{"impressions":62000,"clicks":4100,"conversions":310,"ctr":6.61,"spend":380,"cpc":0.09,"cpa":1.23},"tp2":{"impressions":48000,"clicks":2400,"conversions":160,"ctr":5.0,"spend":1200,"cpc":0.50,"cpa":7.50},"tp3":{"impressions":46000,"clicks":2400,"conversions":150,"ctr":5.22,"spend":0,"cpc":0,"cpa":0}}','Lisa Bauer',100),
('4','B2B: Corporate Inhouse Trainings','planned','2026-04-01','2026-06-30',5000,0,ARRAY['LinkedIn Ads','Direct Mail'],ARRAY[]::TEXT[],'Gezielte Ansprache von HR & IT-Leitern für Team-Schulungen.','B2B Leadgewinnung für unsere ISTQB Firmenschulungen.\n\n**Ton:** Hochprofessionell, lösungsorientiert. Fokus auf ROI und Qualitätssicherung.\n**Kernbotschaft:** „Machen Sie Ihr Team fit für den ISTQB-Standard. Inhouse oder Remote."\n**Zielgruppe:** HR-Hannah & QA Leads.\n\n**Dos:** Effizienz und Akkreditierung betonen.\n**Don''ts:** Zu B2C-mäßig oder umgangssprachlich werden.',ARRAY['a2'],ARRAY['B2B','Inhouse','Firmenschulung','Teambuilding','Teamkurse'],'{"impressions":0,"clicks":0,"conversions":0,"ctr":0}',NULL,'Anna Schmidt',0);
`;

const SEED_TASKS = `
INSERT INTO tasks (id, title, status, assignee, author, due_date, publish_date, platform, touchpoint_id, type, one_drive_link, description, campaign_id, scope, performance, ai_suggestion) VALUES
('cr1','Instagram Reel: Kursvorstellung','monitoring','Lisa Bauer','Anna Schmidt','2026-03-10','2026-03-12T10:00','Instagram','tp6','Reel/Video','https://onedrive.live.com/view?id=cr1','Kurzes Reel, das den Ablauf des ISTQB-Kurses in 30 Sekunden zeigt.','1','single','{"impressions":14200,"clicks":890,"ctr":6.3}',NULL),
('cr2','LinkedIn Post: Erfolgsgeschichte','review','Anna Schmidt','Daniel Moretz','2026-03-14',NULL,'LinkedIn',NULL,'Post','https://onedrive.live.com/view?id=cr2','Testimonial eines Absolventen als LinkedIn Article.','1','single',NULL,'Beginne mit einem starken Hook: "Von der Arbeitslosigkeit zum IT-Tester in nur 45 Tagen — Michaels Geschichte." Nutze dann 3 Bullet Points mit konkreten Zahlen...'),
('cr3','Google Search Ad: Bildungsgutschein','approved','Tom Weber','Anna Schmidt','2026-03-15',NULL,'Google Ads','tp1','Anzeige','https://onedrive.live.com/view?id=cr3','Search Ad für Keywords rund um Bildungsgutschein + IT-Umschulung.','1','single',NULL,NULL),
('cr4','Übergreifend: E-Mail Sequenz Webinar-Follow-Up','draft','Lisa Bauer','Waleri Moretz','2026-03-20',NULL,NULL,NULL,'E-Mail','','3-teilige E-Mail Sequenz nach dem kostenlosen Webinar.','3','all',NULL,NULL);
`;

const SEED_CONTENTS = `
INSERT INTO contents (id, title, description, status, publish_date, platform, touchpoint_id, campaign_id, task_ids, author, content_type, journey_phase, created_at) VALUES
('cnt1','Insta Post: Was ist ein Bug?','Erklärender Post für Quereinsteiger: Was ein Bug in der Software ist und warum Tester wichtig sind.','published','2026-03-10','Instagram','tp6','1',ARRAY['cr1'],'Lisa Bauer','social','Awareness','2026-02-20'),
('cnt2','E-Mail Invite: Live-Webinar','Einladungs-E-Mail zur nächsten kostenlosen Live-Webinar-Session.','scheduled','2026-03-12','E-Mail','tp4','3',ARRAY['cr4'],'Anna Schmidt','email','Interest','2026-03-01'),
('cnt3','Start Google Search Ads','Launch der neuen Google Ads Kampagne für Bildungsgutschein-Keywords.','scheduled','2026-03-15','Google Ads','tp1','1',ARRAY['cr3'],'Tom Weber','ads','Search','2026-03-02'),
('cnt4','Blog: Bildungsgutschein Antrag','Schritt-für-Schritt Anleitung: So beantragst du deinen Bildungsgutschein bei der Agentur für Arbeit.','production','2026-03-17','Website',NULL,'1',ARRAY[]::TEXT[],'Daniel Moretz','content','Search','2026-03-05'),
('cnt5','LinkedIn: B2B Case Study','Fallstudie einer erfolgreichen Inhouse-ISTQB-Schulung bei einem Frankfurter Finanzunternehmen.','ready','2026-03-18','LinkedIn',NULL,'4',ARRAY['cr2'],'Anna Schmidt','social','Awareness','2026-03-03'),
('cnt6','Meta Ads Retargeting','Retargeting Ads für Website-Besucher die den Kurs noch nicht gebucht haben.','planning','2026-03-20','Meta Ads',NULL,'2',ARRAY[]::TEXT[],'Tom Weber','ads','Interest','2026-03-06'),
('cnt7','Follow-Up E-Mail Absolventen','Testimonial-Anfrage und Weiterempfehlung an erfolgreich zertifizierte Absolventen.','idea','2026-03-22','E-Mail','tp4','3',ARRAY[]::TEXT[],'Lisa Bauer','email','Advocacy','2026-03-08'),
('cnt8','TikTok: QA vs Dev','Kurzvideo im Day in the Life Format: Softwaretester vs Entwickler.','planning','2026-03-24','TikTok',NULL,'2',ARRAY[]::TEXT[],'Lisa Bauer','social','Awareness','2026-03-09'),
('cnt9','Webinar Durchführung','Live-Durchführung des kostenlosen Info-Webinars mit Daniel & Waleri.','scheduled','2026-03-26','Zoom',NULL,'3',ARRAY['cr4'],'Daniel Moretz','event','Interest','2026-02-15'),
('cnt10','Performance Review Q1','Analyse aller laufenden Kampagnen und Content-Performance im 1. Quartal.','idea','2026-03-28','Intern',NULL,NULL,ARRAY[]::TEXT[],'Anna Schmidt','content','Retention','2026-03-10');
`;

const SEED_POSITIONING = `
INSERT INTO company_positioning (id, name, tagline, founded, industry, headquarters, legal_form, employees, website, vision, mission, company_values, tone_of_voice, dos, donts, primary_market, secondary_markets, target_company_size, target_industries, last_updated, updated_by) VALUES
('main',
'WAMOCON Academy (Test-IT Academy)',
'In 45 Tagen vom Jobsuchenden zum IT-Tester – ganz ohne Programmieren',
'1998','IT-Ausbildung & Schulungen','Eschborn / Frankfurt am Main','Academy','1-10','test-it-academy.com',
'Wir möchten Quereinsteigern und Jobsuchenden den einfachsten und praxisnahesten Einstieg in die IT ermöglichen, ohne dass sie programmieren können müssen.',
'Mit über 25 Jahren Erfahrung, dem DiTeLe Praxis-Tool und 300+ Praxisübungen machen wir unsere Absolventen zu zertifizierten ISTQB®-Testern, die vom ersten Tag an Mehrwert liefern.',
'[{"id":"v1","title":"Praxisnähe","icon":"💻","description":"Wir bringen keine trockene Theorie bei, sondern Praxis. Unser eigens entwickeltes DiTeLe Tool ermöglicht 300+ realistische Übungen."},{"id":"v2","title":"Persönliche Betreuung","icon":"🤝","description":"Unsere akkreditierten Trainer (Waleri & Daniel) begleiten jeden Lernenden persönlich — im Webinar, Online oder Präsenz."},{"id":"v3","title":"Anerkannte Qualität","icon":"🏅","description":"Wir bilden nach offiziellem ISTQB® Certified Tester Foundation Level V.4.0 (CTFL) Standard aus und bringen eine hohe Erfolgsquote mit."},{"id":"v4","title":"Chancengleichheit","icon":"🚀","description":"IT ist für alle da. Wir helfen Jobsuchenden, finanziert durch Bildungsgutscheine, einen sicheren und gut bezahlten Job zu finden."},{"id":"v5","title":"Netzwerk & Community","icon":"🌐","description":"Wir bereiten nicht nur auf die Prüfung vor, sondern unterstützen beim Bewerbungsprozess und der Integration in IT-Projekte."}]',
'{"adjectives":["Ermutigend","Praxisnah","Klar","Expertenhaft","Persönlich","Verständlich"],"description":"Wir duzen unsere Zielgruppe (B2C) respektvoll. Wir nehmen ihnen die Angst vor schwerer IT und Programmieren und vermitteln Zuversicht. Im B2B-Bereich bleiben wir professionell und lösungsorientiert.","personality":"Der erfahrene, aber nahbare Mentor, der dich sicher und mit einem klaren Fahrplan an dein Ziel (das Zertifikat und den Job) führt."}',
ARRAY['Jobchancen und IT-Quereinstieg betonen','Ohne Programmieren erwähnen, um Hürden zu nehmen','Immer auf das kostenlose Webinar verweisen','Praxisbezug (DiTeLe, reale Fälle) in den Vordergrund stellen','Einfache Sprache, Komplexe IT-Begriffe erklären'],
ARRAY['Kein trockener Uni-Vorlesungs-Stil','Keine falschen Job-Garantie-Aussagen tätigen','Testen nie als langweilig oder zweitrangig darstellen','Programmierkenntnisse voraussetzen','Den Bildungsgutschein-Prozess kompliziert aussehen lassen'],
'DACH-Region (Deutschland, Österreich, Schweiz)',
ARRAY['Regionale Firmen im Rhein-Main-Gebiet (B2B)'],
'Jobsuchende (B2C) & KMU bis Enterprise (B2B Schulungen)',
ARRAY['Agentur für Arbeit Kunden','IT & Softwareentwicklung','Finanzen/Banken (Raum FFM)'],
'2026-03-10','Daniel Moretz');
`;

const SEED_KEYWORDS = `
INSERT INTO company_keywords (id, term, category, description) VALUES
('ck1','ISTQB®','Compliance','Nur offizielle Schreibweise nutzen: ISTQB® Certified Tester'),
('ck2','DiTeLe','Brand','Unser exklusives Praxis-Tool für +300 Testszenarien'),
('ck3','Ohne Programmieren','Value','Wichtigstes Verkaufsargument für Quereinsteiger'),
('ck4','Bildungsgutschein','Value','Förderung durch die Arbeitsagentur (Kostenübernahme)'),
('ck5','Praxisnähe','Brand','Nicht nur Folien, sondern echtes Testing'),
('ck6','Akkreditierter Trainer','Compliance','Geprüft und zertifiziert. Vertrauenssignal.');
`;

const SEED_BUDGET = `
INSERT INTO budget_overview (id, total, spent, remaining) VALUES ('main', 57000, 30050, 26950);

INSERT INTO budget_categories (id, name, planned, spent, color, sort_order) VALUES
('bc1','Google Ads (Search)',20000,14400,'#6366f1',0),
('bc2','Meta Ads',15000,8900,'#06b6d4',1),
('bc3','LinkedIn (B2B)',8000,2200,'#10b981',2),
('bc4','DiTeLe Content-Erweiterung',5000,1500,'#f59e0b',3),
('bc5','Webinar Software/Tools',4000,1250,'#ef4444',4),
('bc6','YouTube Video Prod.',5000,1800,'#8b5cf6',5);

INSERT INTO monthly_trends (id, month, planned, actual, sort_order) VALUES
('mt1','Jan',9000,8800,0),
('mt2','Feb',11000,12200,1),
('mt3','Mär',12000,9050,2),
('mt4','Apr',9000,0,3),
('mt5','Mai',8000,0,4),
('mt6','Jun',8000,0,5);
`;

const SEED_DASHBOARD = `
INSERT INTO activity_feed (id, user_name, action, target, created_display, icon) VALUES
('af1','Lisa Bauer','hat neue Ad Creatives hochgeladen','Evergreen: Kostenloses Webinar','vor 15 Min.','📎'),
('af2','Daniel Moretz','hat DiTeLe-Texte aktualisiert','Launch DiTeLe Online-Kurs','vor 1 Std.','✍️'),
('af3','Waleri Moretz','hat Webinar-Start freigegeben','Evergreen: Kostenloses Webinar','vor 2 Std.','✅'),
('af4','Tom Weber','hat Ads CTR optimiert','Frühlings-Kurs: Präsenz in Eschborn','vor 3 Std.','📈'),
('af5','Anna Schmidt','hat LinkedIn Post geplant','B2B: Corporate Inhouse Trainings','vor 5 Std.','📅'),
('af6','System','Budget-Alert: Ads Q1 Budget 75% ausgelastet','Gesamtbudget','vor 6 Std.','⚠️');

INSERT INTO team_members (id, name, role, avatar, status) VALUES
('tm1','Waleri Moretz','Akkr. Trainer / Gründer','WM','online'),
('tm2','Anna Schmidt','Marketing Managerin','AS','online'),
('tm3','Lisa Bauer','Content & Social','LB','away'),
('tm4','Tom Weber','Performance Experte','TW','offline'),
('tm5','Jana Klein','Community Support','JK','online');

INSERT INTO dashboard_chart_data (id, name, impressions, clicks, conversions, sort_order) VALUES
('dc1','KW 5',45000,2100,89,0),
('dc2','KW 6',52000,2800,124,1),
('dc3','KW 7',48000,2400,98,2),
('dc4','KW 8',61000,3100,156,3),
('dc5','KW 9',58000,2900,142,4),
('dc6','KW 10',71000,3600,178,5);

INSERT INTO channel_performance (id, name, value, color, sort_order) VALUES
('cp1','Google Search Ads',40,'#6366f1',0),
('cp2','Meta Ads',25,'#06b6d4',1),
('cp3','Webinar (Organic)',15,'#10b981',2),
('cp4','LinkedIn (B2B)',12,'#f59e0b',3),
('cp5','SEO',8,'#8b5cf6',4);
`;

const SEED_JOURNEYS = `
INSERT INTO journeys (id, name, audience_id, description, journey_type) VALUES
('j1','Quirin (Quereinsteiger) - B2C Full Flow','a1','Von der Frustration im alten Job bis zur Anmeldung zum ISTQB-Kurs mit Bildungsgutschein.','asidas'),
('j2','Hannah (HR) - B2B Inhouse Flow','a2','Recherche eines Weiterbildungspartners für das Inhouse QA Team.','asidas'),
('j3','Bea (Junior QA) - Upskill Flow','a3','Bereits in der Ausbildung/Job, aber benötigt den ISTQB Titel für die Gehaltsverhandlung.','asidas'),
('cj1','Quirin (Quereinsteiger) - 5-Phasen Journey','a1','Standard 5-Phasen Customer Journey von ersten Problembewusstsein bis zur Weiterempfehlung nach der Schulung.','customer'),
('cj2','Hannah (HR) - B2B 5-Phasen Journey','a2','Von der Problemerkennung im eigenen Team bis zur langfristigen Partnerschaft für Inhouse-Schulungen.','customer');
`;

const SEED_JOURNEY_STAGES = `
-- ASIDAS j1 stages
INSERT INTO journey_stages (id, journey_id, phase, title, description, touchpoints, content_formats, emotions, pain_points, metrics, content_ids, sort_order) VALUES
('j1s1','j1','Attention','Problembewusstsein','Quirin erfährt, dass IT-Jobs Quereinsteiger aufnehmen.',ARRAY['tp6','tp2'],ARRAY['Reel: 3 Mythen über IT-Jobs','LinkedIn Post: Zukunftssicher'],ARRAY['Orientierungslos','Neugierig'],ARRAY['Angst vor dem Ungewissen','Kein Programmier-Wissen'],'{"label":"Reichweite","value":"45.000","trend":"+12%"}',ARRAY['cnt1'],0),
('j1s2','j1','Search','Recherche & Info-Suche','Er sucht bei Google nach Software Tester ohne Studium.',ARRAY['tp1'],ARRAY['Blog: Was macht ein Tester?','SEO Ratgeber'],ARRAY['Wissbegierig','Leicht überfordert'],ARRAY['Wer zahlt das?','Welches Zertifikat brauche ich?'],'{"label":"SEO Clicks","value":"2.100","trend":"+5%"}',ARRAY['cnt4'],1),
('j1s3','j1','Interest','Tieferes Kaufinteresse','Meldung zum kostenlosen Webinar an.',ARRAY['tp3','tp2'],ARRAY['Webinar Anmeldung','Retargeting Case Study'],ARRAY['Hoffnungsvoll'],ARRAY['Terminfindung','Ist das seriös?'],'{"label":"Webinar Signups","value":"350","trend":"+20%"}',ARRAY['cnt2'],2),
('j1s4','j1','Desire','Persönliches Verlangen aufbauen','Erklärung der Bildungsgutschein-Förderung per Mail.',ARRAY['tp4'],ARRAY['E-Mail Nurturing','Fördermittel-Guide (PDF)'],ARRAY['Motiviert','Überzeugt'],ARRAY['Antragstellung beim Amt'],'{"label":"Open Rate","value":"48%","trend":"+3%"}',ARRAY[]::TEXT[],3),
('j1s5','j1','Action','Beratung & Buchung','Telefonische Beratung und endgültige Anmeldung.',ARRAY['tp5'],ARRAY['Consulting-Leitfaden','Anmeldeformular'],ARRAY['Erleichtert','Gutmütig nervös'],ARRAY['Amt muss final zustimmen'],'{"label":"Vertragsabschlüsse","value":"45","trend":"+8%"}',ARRAY[]::TEXT[],4),
('j1s6','j1','Share','Erfolg teilen','Prüfung bestanden! Zertifikat wird geteilt.',ARRAY['tp7','tp8'],ARRAY['LinkedIn Zertifikat Template','Alumni Interview'],ARRAY['Stolz'],ARRAY['Jobeinstieg'],'{"label":"Trustpilot Ratings","value":"12","trend":"+2%"}',ARRAY[]::TEXT[],5),
-- ASIDAS j2 stages
('j2s1','j2','Attention','Schulungsbedarf erkannt','Team wächst, Qualität der Releases sinkt.',ARRAY['tp2'],ARRAY['Whitepaper: Kosten von Bugs in Prod'],ARRAY['Gestresst'],ARRAY['Teamfehler','Budgetdruck'],'{"label":"LinkedIn Impr.","value":"15.000","trend":"+10%"}',ARRAY[]::TEXT[],0),
('j2s2','j2','Search','Anbietervergleich','Google Suche nach ISTQB Inhouse Training Frankfurt.',ARRAY['tp1','tp3'],ARRAY['B2B Landingpage','Trainer-Profilseite'],ARRAY['Analytisch'],ARRAY['ISTQB Akkreditierung wichtig'],'{"label":"B2B Traffic","value":"800","trend":"+1%"}',ARRAY[]::TEXT[],1),
('j2s3','j2','Interest','Kontaktaufnahme','Hannah kontaktiert uns für ein Angebot.',ARRAY['tp3'],ARRAY['Pitch Deck','Preisliste'],ARRAY['Erwartungsvoll'],ARRAY['Antwortzeit','Flexibilität bei Terminen'],'{"label":"Inbound Leads","value":"15","trend":"+5%"}',ARRAY[]::TEXT[],2),
('j2s4','j2','Desire','Fachlicher Austausch','Videocall zur Besprechung der Lernziele des Teams.',ARRAY['tp5'],ARRAY['Demo der Lernplattform','Custom Agenda'],ARRAY['Überzeugt'],ARRAY['Überzeugt das die GF?'],'{"label":"Sales Calls","value":"8","trend":"0%"}',ARRAY[]::TEXT[],3),
('j2s5','j2','Action','Vertragsabschluss','Rahmenvertrag für Inhouse-Schulung wird signiert.',ARRAY['tp5'],ARRAY['Vertragsdokument'],ARRAY['Erleichtert'],ARRAY['Rechtliche Prüfung im Haus'],'{"label":"Won Deals","value":"3","trend":"+1%"}',ARRAY[]::TEXT[],4),
('j2s6','j2','Share','Langfristige Partnerschaft','Team besteht Prüfung, Hannah lobt uns intern.',ARRAY['tp2'],ARRAY['B2B Case Study'],ARRAY['Zufrieden','Gut positioniert intern'],ARRAY['Nächstes Fortbildungsjahr'],'{"label":"Upsell %","value":"30%","trend":"+5%"}',ARRAY[]::TEXT[],5),
-- ASIDAS j3 stages
('j3s1','j3','Attention','Karriere-Bremse','Merkt, dass Zertifikate für Beförderung nötig sind.',ARRAY['tp6'],ARRAY['TikTok Junior vs Senior Tester'],ARRAY['Frustriert','Ambitioniert'],ARRAY['Geringes Gehalt'],'{"label":"Views","value":"110.000","trend":"+45%"}',ARRAY[]::TEXT[],0),
('j3s2','j3','Search','Vorbereitungsmöglichkeiten','Sucht nach schnellen E-Learning Kursen.',ARRAY['tp1'],ARRAY['SEO Artikel ISTQB im Selbststudium'],ARRAY['Zielorientiert'],ARRAY['Zeitaufwand neben Job'],'{"label":"Klicks","value":"1.200","trend":"-2%"}',ARRAY[]::TEXT[],1),
('j3s3','j3','Interest','Probe-Material','Lädt Mock-Exam runter.',ARRAY['tp3'],ARRAY['Mock Exam (PDF)','Syllabus Checker'],ARRAY['Fokussiert'],ARRAY['Zu viele Fachbegriffe'],'{"label":"Downloads","value":"450","trend":"+12%"}',ARRAY[]::TEXT[],2),
('j3s4','j3','Desire','Entscheidung für Premium-Kurs','Erkennt, dass Selbststudium zu schwer ist.',ARRAY['tp4'],ARRAY['E-Mail Warum 60% im 1. Versuch durchfallen'],ARRAY['Respekt vor Prüfung','Kaufbereit'],ARRAY['Prüfungsgebühr'],'{"label":"Open Rate","value":"55%","trend":"+5%"}',ARRAY[]::TEXT[],3),
('j3s5','j3','Action','Online-Buchung','Bucht per Kreditkarte das E-Learning Paket.',ARRAY['tp3'],ARRAY['Checkout-Page'],ARRAY['Erwartungsvoll'],ARRAY['Geld-zurück-Garantie?'],'{"label":"Checkouts","value":"120","trend":"+15%"}',ARRAY[]::TEXT[],4),
('j3s6','j3','Share','Prüfungszeugnis auf Social Media','Postet stolz das Zertifikat.',ARRAY['tp2','tp7'],ARRAY['Zertifikats-Post Vorlage'],ARRAY['Stolz','Gehaltserhöhung in Sicht'],ARRAY['-'],'{"label":"Mentions","value":"60","trend":"+8%"}',ARRAY[]::TEXT[],5),
-- Customer Journey cj1 stages
('cj1s1','cj1','Awareness','Bewusstsein für Relevanz','Erfährt über Social Media, dass IT-Quereinstieg auch ohne Programmieren möglich ist.',ARRAY['tp6','tp2'],ARRAY['Social Media Video','Anzeigen'],ARRAY['Neugierig'],ARRAY['IT scheint zu komplex'],'{"label":"Reichweite","value":"50.000","trend":"+10%"}',ARRAY['cnt1'],0),
('cj1s2','cj1','Consideration','Erwägung & Abwägung','Sucht nach Informationen zu Bildungsgutschein und Voraussetzungen.',ARRAY['tp1','tp3'],ARRAY['Blogbeiträge','Webinar'],ARRAY['Wissbegierig'],ARRAY['Finanzierung unklar'],'{"label":"Webinar Anmeldungen","value":"400","trend":"+15%"}',ARRAY['cnt4','cnt2'],1),
('cj1s3','cj1','Purchase','Kauf & Entscheidung','Entscheidet sich für den ISTQB-Kurs und meldet sich an.',ARRAY['tp4','tp5'],ARRAY['E-Mail','Beratungsgespräch'],ARRAY['Erwartungsvoll'],ARRAY['Antrag beim Amt dauert'],'{"label":"Abschlüsse","value":"50","trend":"+5%"}',ARRAY[]::TEXT[],2),
('cj1s4','cj1','Retention','Bindung & Begleitung','Nimmt aktiv am Kurs teil und nutzt die DiTeLe Plattform.',ARRAY['tp8','tp4'],ARRAY['Lern-Inhalte','Check-ins'],ARRAY['Motiviert'],ARRAY['Lernstress'],'{"label":"Kursfortschritt","value":"85%","trend":"+2%"}',ARRAY[]::TEXT[],3),
('cj1s5','cj1','Advocacy','Loyalität & Weiterempfehlung','Erfolgreicher Abschluss und neuer Job in der IT.',ARRAY['tp7','tp2'],ARRAY['Bewertung','Alumni-Netzwerk'],ARRAY['Stolz','Dankbar'],ARRAY['Neue Jobsuche'],'{"label":"Bewertungen","value":"25","trend":"+15%"}',ARRAY[]::TEXT[],4),
-- Customer Journey cj2 stages
('cj2s1','cj2','Awareness','Bedarf erkennen','Die Qualität im QA-Team sinkt, ein Standard muss her.',ARRAY['tp2'],ARRAY['Whitepaper'],ARRAY['Gestresst'],ARRAY['Fehlerhafte Releases'],'{"label":"Impressions","value":"12.000","trend":"+5%"}',ARRAY['cnt5'],0),
('cj2s2','cj2','Consideration','Optionen prüfen','Vergleicht Anbieter von ISTQB Inhouse Schulungen.',ARRAY['tp1','tp3'],ARRAY['B2B Landingpage'],ARRAY['Analytisch'],ARRAY['Zertifizierter Trainer gesucht'],'{"label":"B2B Traffic","value":"900","trend":"+2%"}',ARRAY[]::TEXT[],1),
('cj2s3','cj2','Purchase','Beauftragung','Entscheidet sich für Test-IT Academy aufgrund von Praxisnähe.',ARRAY['tp5'],ARRAY['Angebot','Pitch'],ARRAY['Erleichtert'],ARRAY['Budgetfreigabe'],'{"label":"Won Deals","value":"5","trend":"0%"}',ARRAY[]::TEXT[],2),
('cj2s4','cj2','Retention','Schulungserfahrung','Das Inhouse-Training läuft erfolgreich.',ARRAY['tp8','tp5'],ARRAY['Feedbackbogen'],ARRAY['Zufrieden'],ARRAY['Terminkoordination intern'],'{"label":"Teilnehmer Feedback","value":"4.8/5","trend":"+0.1"}',ARRAY[]::TEXT[],3),
('cj2s5','cj2','Advocacy','Folgeaufträge & Empfehlungen','Hannah bucht einen weiteren Kurs und empfiehlt die Academy weiter.',ARRAY['tp4','tp2'],ARRAY['Case Study'],ARRAY['Erfolgreich'],ARRAY['Keine'],'{"label":"Upsell","value":"2","trend":"+1"}',ARRAY['cnt5'],4);
`;


async function main() {
  try {
    await init();
    
    console.log('Step 1/10: Creating schema...');
    await executeSql(SCHEMA_SQL);
    console.log('  ✓ Schema created');
    
    console.log('Step 2/10: Seeding users...');
    await executeSql(SEED_USERS);
    console.log('  ✓ Users seeded');
    
    console.log('Step 3/10: Seeding touchpoints...');
    await executeSql(SEED_TOUCHPOINTS);
    console.log('  ✓ Touchpoints seeded');
    
    console.log('Step 4/10: Seeding audiences...');
    await executeSql(SEED_AUDIENCES);
    console.log('  ✓ Audiences seeded');
    
    console.log('Step 5/10: Seeding campaigns...');
    await executeSql(SEED_CAMPAIGNS);
    console.log('  ✓ Campaigns seeded');
    
    console.log('Step 6/10: Seeding tasks...');
    await executeSql(SEED_TASKS);
    console.log('  ✓ Tasks seeded');
    
    console.log('Step 7/10: Seeding contents...');
    await executeSql(SEED_CONTENTS);
    console.log('  ✓ Contents seeded');
    
    console.log('Step 8/10: Seeding positioning & keywords...');
    await executeSql(SEED_POSITIONING);
    await executeSql(SEED_KEYWORDS);
    console.log('  ✓ Positioning & keywords seeded');
    
    console.log('Step 9/10: Seeding budget & dashboard...');
    await executeSql(SEED_BUDGET);
    await executeSql(SEED_DASHBOARD);
    console.log('  ✓ Budget & dashboard seeded');
    
    console.log('Step 10/10: Seeding journeys...');
    await executeSql(SEED_JOURNEYS);
    await executeSql(SEED_JOURNEY_STAGES);
    console.log('  ✓ Journeys seeded');
    
    console.log('\n✅ Migration complete! All tables created and seeded.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

main();
