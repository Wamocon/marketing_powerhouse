# 🚀 Momentum — Konzept & Umsetzungsstand

> **Letzte Aktualisierung:** 16.07.2025
> **Version:** 0.8.0 — Supabase Backend-Integration (vollständig)
> **Status:** Phase 1 — Backend-Anbindung (Supabase)
> **Produktname:** Momentum | **Tagline:** Deine Marketing-Kampagnen mit Momentum

---

## 1. Projektziel

Eine **SaaS-Plattform zur Unterstützung und Automatisierung von Marketingprozessen**. Momentum vereint Kampagnen-Management, Content-Planung, Budget-Kontrolle und Team-Zusammenarbeit in einer DSGVO-konformen, europäischen Lösung.

---

## 2. Technologie-Stack

| Schicht | Technologie | Status |
|---|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) | ✅ Aktiv |
| **Sprache** | TypeScript (strict mode) | ✅ Aktiv |
| **Frontend** | React 19 | ✅ Aktiv |
| **Styling** | Tailwind CSS v4 + Design System (CSS Custom Properties) | ✅ Aktiv |
| **Routing** | Next.js App Router (dateibasiert) | ✅ Aktiv |
| **State / Auth** | React Context (AuthContext, DataContext, TaskContext, ContentContext) | ✅ Aktiv |
| **Charts** | Recharts | ✅ Aktiv |
| **Icons** | Lucide React | ✅ Aktiv |
| **Typografie** | Google Fonts (Inter) | ✅ Aktiv |
| **Build-Tool** | Turbopack (integriert in Next.js) | ✅ Aktiv |
| **Linting** | ESLint + @typescript-eslint | ✅ Aktiv |
| **Backend / DB** | Supabase (PostgreSQL, eu-central-1) | ✅ Aktiv |
| **API-Schicht** | `src/lib/api.ts` — vollständige CRUD-Funktionen | ✅ Aktiv |
| **Auth** | Datenbank-Login (Supabase RLS) | ✅ Aktiv |
| **Hosting** | Vercel (geplant) | 🔜 Ausstehend |

---

## 3. Ordnerstruktur

```
Marketing_powerhouse/
├── next.config.ts                    ← Next.js Konfiguration
├── postcss.config.mjs                ← PostCSS mit Tailwind CSS v4
├── tsconfig.json                     ← TypeScript-Konfiguration
├── package.json
├── .env.local                        ← Supabase-Credentials (nicht im Git)
├── KONZEPT.md                        ← Dieses Dokument
├── scripts/
│   └── migrate.mjs                   ← DB-Schema + Seed-Daten Migrationsskript
├── app/                              ← Next.js App Router (Seiten-Routing)
│   ├── layout.tsx                    ← Root-Layout (HTML, Fonts, Providers)
│   ├── providers.tsx                 ← Client-seitiger Context-Provider-Wrapper
│   ├── client-shell.tsx              ← Auth-Gate + Layout (Sidebar/Header)
│   ├── page.tsx                      ← Dashboard (/)
│   ├── campaigns/
│   │   ├── page.tsx                  ← Kampagnen-Liste (/campaigns)
│   │   └── [id]/page.tsx             ← Kampagnen-Detail (/campaigns/:id)
│   ├── audiences/page.tsx            ← Zielgruppen (/audiences)
│   ├── journeys/page.tsx             ← Customer Journey (/journeys)
│   ├── asidas/page.tsx               ← ASIDAS Funnel (/asidas)
│   ├── touchpoints/page.tsx          ← Kanäle & Touchpoints (/touchpoints)
│   ├── content/page.tsx              ← Content-Kalender (/content)
│   ├── content-overview/page.tsx     ← Content-Übersicht (/content-overview)
│   ├── budget/page.tsx               ← Budget (/budget)
│   ├── tasks/page.tsx                ← Aufgaben (/tasks)
│   ├── positioning/page.tsx          ← Digitale Positionierung (/positioning)
│   ├── settings/page.tsx             ← Einstellungen (/settings)
│   └── manual/page.tsx               ← Handbuch (/manual)
└── src/
    ├── index.css                     ← Tailwind CSS v4 + Design System
    ├── lib/
    │   ├── supabase.ts               ← Supabase-Client (Singleton)
    │   ├── api.ts                    ← Vollständige CRUD-API (~500 Zeilen)
    │   └── constants.ts              ← Content-Type-Farben
    ├── types/
    │   ├── index.ts                  ← Zentrale TypeScript-Typdefinitionen
    │   └── dashboard.ts              ← Dashboard-spezifische Typen
    ├── context/
    │   ├── AuthContext.tsx            ← RBAC: Rollen, Permissions, Login via Supabase
    │   ├── DataContext.tsx            ← Zentraler Daten-Provider (Supabase CRUD)
    │   ├── ContentContext.tsx         ← Content-State-Management (async)
    │   └── TaskContext.tsx            ← Aufgaben-State-Management (async)
    ├── data/
    │   └── mockData.ts               ← (Legacy, nicht mehr verwendet)
    ├── styles/
    │   ├── variables.css              ← CSS Custom Properties (Farben, Spacing)
    │   ├── base.css                  ← Reset & Basis-Stile
    │   ├── layout.css                ← App-Layout, Sidebar, Header
    │   ├── components.css            ← Karten, Buttons, Badges, Forms
    │   ├── ui.css                    ← Tabs, Modals, Tooltips
    │   ├── features.css              ← Kanban, Kalender, Charts
    │   ├── pages.css                 ← Seitenspezifische Stile
    │   └── pages-extra.css           ← Persona/Avatar-Stile
    ├── components/                   ← Wiederverwendbare UI-Komponenten
    │   ├── Layout.tsx                ← App-Shell (Sidebar + Header + Content)
    │   ├── Sidebar.tsx               ← Navigation (next/link, usePathname)
    │   ├── Header.tsx                ← Breadcrumb, Rollen-Badge
    │   ├── PageHelp.tsx              ← Kontextuelle Hilfe-Komponente
    │   ├── DashboardViews.tsx        ← Admin/Manager/Member Dashboard-Ansichten
    │   ├── DashboardComponents.tsx   ← Dashboard-Statistiken, BudgetOverview
    │   ├── CampaignDetailComponents.tsx ← Kampagnen-UI-Bausteine
    │   ├── CampaignDetailTabs.tsx    ← OverviewTab, NewCreativeModal
    │   ├── ChannelKpiSection.tsx     ← Kanal-KPI Aufschlüsselung (reusable)
    │   ├── PositioningComponents.tsx ← SectionHeader, Field, CommsContent
    │   ├── ManualComponents.tsx      ← Handbuch-UI-Bausteine
    │   ├── ManualTabs.tsx            ← ManagerTab, WorkflowsTab
    │   ├── SettingsAdmin.tsx         ← Admin-Einstellungen-Tab
    │   ├── TaskAiAgent.tsx           ← KI-Assistent für Aufgaben
    │   ├── ContentLinkedTasks.tsx    ← Verknüpfte Aufgaben im Content-Modal
    │   ├── AudienceDetailModal.tsx
    │   ├── ContentDetailModal.tsx
    │   ├── TaskDetailModal.tsx
    │   ├── TouchpointDetailModal.tsx
    │   ├── NewCampaignModal.tsx      ← 3-Schritt Kampagnen-Erstellung
    │   ├── NewContentModal.tsx
    │   ├── NewTaskModal.tsx
    │   └── NewTouchpointModal.tsx
    └── views/                        ← Seiten-Komponenten (von app/ importiert)
        ├── LoginPage.tsx
        ├── DashboardPage.tsx
        ├── CampaignsPage.tsx
        ├── CampaignDetailPage.tsx
        ├── AudiencesPage.tsx
        ├── ContentCalendarPage.tsx
        ├── ContentOverviewPage.tsx
        ├── BudgetPage.tsx
        ├── TasksPage.tsx
        ├── CustomerJourneyPage.tsx
        ├── AsidasFunnelPage.tsx
        ├── TouchpointsPage.tsx
        ├── PositioningPage.tsx
        ├── ManualPage.tsx
        └── SettingsPage.tsx
```

---

## 4. 🔐 Rollen & Berechtigungen (RBAC)

### Rollen-Definition

| Rolle | Label | Farbe | Beschreibung |
|---|---|---|---|
| `admin` | Administrator | 🔴 Rot | Vollzugriff, User-Management, Positionierung bearbeiten |
| `manager` | Marketing Manager | 🟣 Indigo | Kampagnen & Aufgaben erstellen, Budget sehen |
| `member` | Team-Member | 🟢 Grün | Eigene Aufgaben bearbeiten, Lesen (keine Budget-Einsicht) |

### Berechtigungs-Matrix

| Berechtigung | Admin | Manager | Member |
|---|:---:|:---:|:---:|
| Positionierung bearbeiten | ✅ | ❌ | ❌ |
| Unternehmensweite Keywords bearbeiten | ✅ | ❌ | ❌ |
| User-Management | ✅ | ❌ | ❌ |
| Einstellungen bearbeiten | ✅ | ❌ | ❌ |
| Kampagne erstellen | ✅ | ✅ | ❌ |
| Kampagne bearbeiten | ✅ | ✅ | ❌ |
| Alle Kampagnen einsehen | ✅ | ✅ | 👁 (zugew.) |
| Zielgruppen bearbeiten | ✅ | ✅ | ❌ |
| Zielgruppen einsehen | ✅ | ✅ | ✅ |
| Budget einsehen | ✅ | ✅ | ❌ |
| Budget bearbeiten | ✅ | ✅ | ❌ |
| Aufgaben in Kampagnen erstellen | ✅ | ✅ | ❌ |
| Aufgaben zuweisen | ✅ | ✅ | ❌ |
| Eigene Aufgaben bearbeiten | ✅ | ✅ | ✅ |
| Touchpoints verwalten | ✅ | ✅ | ❌ |
| Elemente löschen (Kampagnen, Personas, etc.) | ✅ | ✅ | ❌ |
| Eigene Aufgaben bearbeiten | ✅ | ✅ | ✅ |

### Technische Umsetzung

```typescript
// src/context/AuthContext.tsx
const { can, isRole, currentUser } = useAuth();

// Beispiel-Nutzung im UI:
{can('canCreateCampaigns') && <button>Neue Kampagne</button>}
{can('canSeeBudget') ? <BudgetDaten /> : <ZugriffVerweigert />}
```

---

## 5. 🧪 Testdaten & Logins

> Der Dev-Login-Panel ist auf der Login-Seite aufklappbar (gelber "Dev-Schnellzugang"-Button unten).  
> Alternativ können diese Zugänge manuell ins Formular eingegeben werden.

### Test-Accounts

| Rolle | Name | E-Mail | Passwort | Abteilung | Status |
|---|---|---|---|---|---|
| 🔴 **Admin** | Daniel Moretz | `daniel@test-it-academy.de` | `admin123` | Geschäftsführung & Training | online |
| 🟣 **Manager** | Waleri Moretz | `waleri@test-it-academy.de` | `manager123` | Training & Qualität | online |
| 🟣 **Manager** | Anna Schmidt | `anna@test-it-academy.de` | `manager123` | Marketing | online |
| 🟢 **Member** | Lisa Bauer | `lisa@test-it-academy.de` | `member123` | Marketing | away |
| 🟢 **Member** | Tom Weber | `tom@test-it-academy.de` | `member123` | Performance Marketing | offline |
| 🟢 **Member** | Jana Klein | `jana@test-it-academy.de` | `member123` | Kundenservice | online |

### Was jede Rolle sieht

**Als Admin (`daniel@test-it-academy.de`)**
- Vollständige Navigation inkl. Budget & Einstellungen
- In Einstellungen: Tab "Benutzerverwaltung" mit Rollenzuweisung
- Digitale Positionierung: **editierbar** (alle 5 Blöcke)
- "Neue Kampagne"-Button: sichtbar

**Als Manager (`waleri@test-it-academy.de` oder `anna@test-it-academy.de`)**
- Vollständige Navigation inkl. Budget
- In Einstellungen: kein Benutzerverwaltungs-Tab, Felder read-only
- Digitale Positionierung: read-only
- "Neue Kampagne"-Button: sichtbar

**Als Member (`lisa@test-it-academy.de`, `tom@test-it-academy.de` oder `jana@test-it-academy.de`)**
- Navigation: **Budget ausgeblendet**
- Budget-Seite: "Kein Zugriff"-Sperrseite
- Einstellungen: alle Felder deaktiviert, kein Admin-Tab
- Digitale Positionierung: read-only
- "Neue Kampagne"-Button: **ausgeblendet**

---

## 6. Implementierte Seiten & Features

### ✅ Login-Seite
- [x] Split-Screen Layout
- [x] E-Mail/Passwort-Formular mit Validierung gegen Supabase-Datenbank
- [x] Fehlermeldung bei ungültigen Credentials
- [x] **Dev-Panel**: Ausklappbarer Schnellzugang mit allen 3 Rollen
- [x] Passwort-Sichtbarkeit Toggle
- [x] Login via Datenbank (Supabase, `api.loginUser`)
- [x] Nutzer-Status (online/offline) bei Login/Logout
- [ ] Supabase Auth (JWT-basiert, Produktion)
- [ ] Registrierung & Passwort-Reset

### ✅ Dashboard
- [x] 4 KPI-Stat-Karten (Impressionen, Klicks, Conversions, Ausgaben)
- [x] Performance-Trend (Area Chart)
- [x] Kanal-Performance (Pie Chart)
- [x] Aktive Kampagnen mit Fortschrittsbalken
- [x] Aktivitäts-Feed
- [x] Budget-Schnellübersicht
- [ ] Echte Datenquellen / Zeitraum-Filter

### ✅ Kampagnen-Management & Creative-Workflow
- [x] Kampagnen-Karten mit Status, Fortschritt, Budget
- [x] Quick-Badges (Master-Prompt, Personas, Keywords)
- [x] **"Neue Kampagne"-Button** nur für Admin & Manager sichtbar
- [x] 3-Schritt-Modal: Grunddaten / Master-Prompt + Zielgruppen / Keywords
- [x] **Erweiterte Felder bei Erstellung**: Touchpoints direkte Auswahl bei Kampagnen-Anlage
- [x] **Detailseite (3 Tabs)**: Übersicht, Creatives & Aufgaben, Performance
- [x] **Creative-Workflow (10 Stufen)**: Entwurf → KI-Generierung → KI-Vorschlag → Review → Überarbeitung → Freigabe → Einplanung → Posting → Beobachtung → KI-Analyse
- [x] Aufgaben nach Scope (Übergreifend vs. kanalspezifisch)
- [x] **Kanal-KPIs (Performance-Tab)**: Aufschlüsselung der Campaign-KPIs nach verknüpftem Touchpoint/Kanal (Impressions, Clicks, Conversions, CTR, Spend, CPC, CPA) direkt im Performance-Reiter der Kampagnendetailseite
- [x] Modal für neues Creative (Typen: Post, Reel, Ad, Mail)
- [x] **Kampagne löschen**: Über delete-Button in der Detailansicht (Supabase CRUD)
- [x] **Kampagne erstellen**: Formular-State → `addCampaign()` → Supabase

### ✅ Zielgruppen & Avatare
- [x] Persona-Karten mit Avatar, Filter (B2B/B2C), Suche
- [x] Detail-Panel (Slide-In): Demografie, Pains, Ziele, Kanäle, Journey
- [x] Modal für neue Persona (Synchronisiert mit allen Detail-Ansichts-Feldern)
- [x] **Persona bearbeiten**: `updateAudience()` via Supabase
- [x] **Persona löschen**: `deleteAudience()` via Supabase

### 🆕 ✅ Customer Journey (`/journeys`) — 5-Phasen-Modell
- [x] **Customer Journey (5-Phasen)**: (Awareness, Consideration, Purchase, Retention, Advocacy) als primäres Modell
- [x] **ASIDAS-Funnel Ansicht** (Attention, Search, Interest, Desire, Action, Share) als alternatives Analyse-Modell / Sekundär
- [x] **Omnipräsenz-Matrix (ASIDAS)**: Search und Share werden als kontinuierliche, omnipräsente Verhaltensweisen visualisiert, die den Nutzer durchgehend begleiten.
- [x] **Deep-Linking Content**: Realer Content aus der Redaktionsplanung (`initialContents`) ist direkt in den Stages verlinkt und kann per Modal geöffnet werden.
- [x] **Touchpoint-Integration**: Klick auf einen Journey-Touchpoint öffnet nun direkt das Detail-Modal ohne Seitenwechsel.
- [x] **Vertriebs-Handoff**: Visueller Trigger für den Übergang von Marketing zu Sales in der Action-Phase.
- [x] **KPIs & Metriken**: Trends und Kennzahlen pro Stage zur Erfolgsmessung der Journey.
- [x] **Neue Journey erstellen**: Inline-Formular in beiden Ansichten (ASIDAS + 5-Phasen) mit Zielgruppen-Auswahl und automatischer Stage-Erzeugung

### ✅ Kanäle & Touchpoints (`/touchpoints`)
- [x] **In Navigation sichtbar**: Eigener Menüpunkt im Bereich "Marketing" mit Badge
- [x] **Single-Source-of-Truth**: Alle eingesetzten Kanäle zentral angelegt und bearbeitbar (für Admin & Manager)
- [x] **Bidirektionale Analyse**: Einblick, welche Kampagnen UND welcher Content auf diesem Kanal ausgespielt werden
- [x] **Kanal-KPIs (aggregiert)**: Jeder Touchpoint zeigt seine Gesamt-Performance (Impressions, Clicks, CTR, Conversions, Spend, CPC, CPA) in der Kartenübersicht und im Detail-Modal
- [x] **KPI-Aufschlüsselung nach Kampagne**: Im Touchpoint-Detail-Modal sieht man, welche Kampagne welche KPI-Werte auf diesem Kanal erzielt
- [x] **Journey-Einordnung**: Touchpoints und Content besitzen nun das Attribut `journeyPhase` für die 1:n Zuordnung zu Phasen in der Customer Journey (5-Phasen). Dropdowns wurden auf dieses Modell vereinheitlicht.
- [x] **Navigation State**: Unterstützung von Deep-Links aus anderen Modulen
- [x] **Datenverwaltung**: Löschen und Bearbeiten von Touchpoints (nur Admin/Manager)
- [x] **Suche & Filter**: Nach Touchpoint-Name/Description und Typ (Paid, Owned, Earned, Direct)

### 🆕 ✅ Digitale Positionierung (`/positioning`)
- [x] **Block 1: Unternehmens-DNA** (Name, Tagline, Gründung, Branche, Standort, ...)
- [x] **Block 2: Digitale Identität** (Vision, Mission, 5 Unternehmenswerte mit Icons)
- [x] **Block 3: Kommunikations-DNA** (Tone-of-Voice-Adjektive, Beschreibung, Markenpersönlichkeit, Dos & Don'ts)
- [x] **Block 4: Unternehmensweite Keywords** (verlinkt aus `companyKeywords`)
- [x] **Block 5: Zielmarkt** (Primär-/Sekundärmärkte, Branchen, Link zu Personas)
- [x] Alle Sektionen einzeln ausklappbar
- [x] **Admin**: inline-editierbar, Speichern-Button
- [x] **Manager & Member**: vollständig read-only

### ✅ Content-System (NEU in v0.6)
- [x] **Eigener Datentyp `Content`** mit 6-stufigem Statusmodell:
  - Idee → Planung → Produktion → Bereit → Eingeplant → Veröffentlicht
- [x] **Content-Kalender** (`/content`): Monatsansicht, Listenansicht, farbcodiert nach Typ
- [x] **Content-Übersicht** (`/content-overview`): Globale Karten-Übersicht mit Filtern (Status, Aufgaben-Status)
- [x] **Bidirektionale Verknüpfung Content ↔ Aufgaben**:
  - Content zeigt verlinkte Aufgaben im Detail-Modal
  - Aufgaben-Detail-Modal zeigt zugehörigen Content („Zugehöriger Content“-Sektion)
- [x] **Rotes Flag**: Content ohne Aufgaben erscheint rot im Kalender + Warnbanner
- [x] **Synchronisierte Formulare**: Erstellungs-Modal für Content (und Aufgaben) fragt nun dediziert Touchpoints/Journey-Phasen (5 Phasen), OneDrive-Links, u.v.m. ab, parallel zur Detail-Ansicht.
- [x] **Aufgabenhüllen-Erstellung**: Beim Erstellen von Content kann direkt eine Entwurfs-Aufgabe generiert werden
- [x] **ContentContext**: Globaler State für Content-Management (`addContent`, `updateContent`, `deleteContent`)
- [x] **Detail-Modal (zentral)**: Reusable Modal (`ContentDetailModal`) zur Bearbeitung (Titel, Status, Datum, Plattform, uvm.)
- [x] **Inline Aufgaben-Erstellung**: Direkt aus der Content-Ansicht können neue Aufgaben für den Content angelegt werden.
- [x] KPI-Stats in der Content-Übersicht (Gesamt, Eingeplant, Veröffentlicht, Ohne Aufgaben)
- [x] **Kampagnen-Integration**: Neuer Reiter "Content" in der Kampagnen-Ansicht, der den referenzierten Content anzeigt und die direkte Erstellung ermöglicht.
- [ ] Drag & Drop im Kalender

### ✅ Budget & Controlling
- [x] KPIs, Plan vs. Ist Chart, Kategorie-Pie, Detail-Tabelle
- [x] **Members**: Zugangssperre mit Erklärung
- [x] **Manager/Admin**: "Ausgabe erfassen"-Button (Info-Placeholder)
- [x] **CSV-Export**: Alle Budget-Daten als CSV mit Semikolon-Separator
- [ ] Echte Eingaben, Budget-Forecast

### ✅ Aufgaben-Management & Creatives (Unified Model)
- [x] Einheitlicher `TaskContext` für übergreifende Datenhaltung
- [x] Globale Aufgabenübersicht (`/tasks`) mit 5 Kanban-Spalten & Listenansicht
- [x] **Detail-Modal (zentral)**: Bearbeitbar je nach Berechtigung (Admin/Manager/Bearbeiter)
- [x] Verknüpfung von Aufgaben zu Kampagnen mit direktem Navigations-Link
- [x] **Verknüpfung zu Content**: Aufgaben-Modal zeigt zugehörigen Content mit Status
- [x] Integration von OneDrive/Ablage-Links
- [ ] Drag & Drop zwischen Kanban-Spalten

### ✅ System / Anleitung
- [x] **Handbuch & Workflow** (`/manual`): Rollenspezifische Anleitung für Admin, Manager und Member
- [x] Interaktive Reiter pro Rolle (Strategie, Planung, Umsetzung)
- [x] Visuelle Platzhalter-Illustartionen für Screenshots
- [x] **Kontextuelle Hilfe (`PageHelp`)**: Einheitliche `PageHelp.jsx` Komponente auf allen Hauptseiten (Dashboard, Kampagnen, SEO, Budget, etc.) zur detaillierten Erklärung der jeweiligen Screen-Funktionen.

### ✅ Einstellungen
- [x] Allgemein, Team-Übersicht, Integrationen, Benachrichtigungen
- [x] Felder disabled für Members
- [x] **Admin**: Tab "Benutzerverwaltung" mit Rollen-Dropdown pro User
- [x] **Speichern/Verwerfen**: Workspace-Einstellungen (lokal)
- [x] **Team-Aktionen**: Placeholder für Einladen, Bearbeiten, Entfernen
- [ ] Echtes Speichern in DB, API-Key Management

---

## 7. Datenmodell (Supabase PostgreSQL)

> Alle Daten liegen in einer Supabase PostgreSQL-Datenbank (EU-Central-1).
> Row Level Security (RLS) ist auf allen Tabellen aktiviert.
> Die API-Schicht (`src/lib/api.ts`) übernimmt die CRUD-Operationen inkl. snake_case ↔ camelCase Konvertierung.

### Datenbank-Tabellen (17 Tabellen)

| Tabelle | Beschreibung | CRUD-Funktionen |
|---|---|---|
| `users` | Testnutzer mit Rollen | `fetchUsers`, `loginUser`, `updateUserStatus` |
| `campaigns` | Kampagnen-Daten | `fetchCampaigns`, `createCampaign`, `updateCampaign`, `deleteCampaign` |
| `audiences` | Zielgruppen/Personas | `fetchAudiences`, `createAudience`, `updateAudience`, `deleteAudience` |
| `touchpoints` | Kanäle & Touchpoints | `fetchTouchpoints`, `createTouchpoint`, `updateTouchpoint`, `deleteTouchpoint` |
| `tasks` | Aufgaben/Creatives | `fetchTasks`, `createTask`, `updateTask`, `deleteTask` |
| `contents` | Content-Einträge | `fetchContents`, `createContent`, `updateContent`, `deleteContent` |
| `company_positioning` | Unternehmenspositionierung | `fetchPositioning`, `savePositioning` |
| `company_keywords` | Unternehmensweite Keywords | `fetchKeywords`, `createKeyword`, `deleteKeyword` |
| `budget_overview` | Budget-Gesamtübersicht | `fetchBudgetData`, `updateBudgetOverview` |
| `budget_categories` | Budget-Kategorien | `updateBudgetCategory`, `createBudgetCategory` |
| `monthly_trends` | Monatliche Budget-Trends | (via `fetchBudgetData`) |
| `activity_feed` | Aktivitäts-Feed | `fetchActivityFeed`, `createActivity` |
| `team_members` | Team-Mitglieder | `fetchTeamMembers` |
| `dashboard_chart_data` | Dashboard-Diagramm-Daten | `fetchChartData` |
| `channel_performance` | Kanal-Performance-Daten | `fetchChannelPerformance` |
| `journeys` | Customer Journeys (5-Phasen + ASIDAS) | `fetchJourneys`, `createJourney`, `deleteJourney` |
| `journey_stages` | Journey-Phasen/Stages | (via `fetchJourneys`, `createJourney`) |

### Supabase-Konfiguration

```
Projekt: Momentum
Region: eu-central-1
URL: ftbkqtteavvdqmhbmzoy.supabase.co
RLS: Aktiviert auf allen 17 Tabellen
Policies: "Allow all for anon" (Entwicklungsmodus)
```

### Umgebungsvariablen (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://ftbkqtteavvdqmhbmzoy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### Test-Nutzer (in `users`-Tabelle)
```
{ id, name, email, password, role ('admin'|'manager'|'member'),
  jobTitle, avatar, status, department, phone, joinedAt }
```

### Unternehmenspositionierung (`companyPositioning`)
```
{
  // Block 1: DNA
  name, tagline, founded, industry, headquarters, legalForm, employees, website,
  // Block 2: Identität
  vision, mission, values[{ id, title, icon, description }],
  // Block 3: Kommunikation
  toneOfVoice: { adjectives[], description, personality },
  dos[], donts[],
  // Block 5: Markt
  primaryMarket, secondaryMarkets[], targetCompanySize, targetIndustries[],
  lastUpdated, updatedBy
}
```

### Zielgruppen / Personas (`audiences`)
```
{ id, name, type, segment ('B2B'|'B2C'), color, initials,
  age, gender, location, income, education, jobTitle,
  interests[], painPoints[], goals[], preferredChannels[],
  buyingBehavior, decisionProcess, journeyPhase,
  description, campaignIds[], createdAt, updatedAt }
```

### Unternehmensweite Keywords (`companyKeywords`)
```
{ id, term, category ('Compliance'|'Brand'|'Value'|'Geographic'), description }
```

### Kampagnen (`campaigns`)
```
{ id, name, status, startDate, endDate, budget, spent, channels,
  description, masterPrompt, targetAudiences[], campaignKeywords[],
  kpis, owner, progress }
```

### Content (`initialContents`)
```
{ id, title, description, status ('idea'|'planning'|'production'|'ready'|'scheduled'|'published'),
  publishDate, platform, campaignId, taskIds[],
  author, contentType ('social'|'email'|'ads'|'content'|'event'), createdAt }
```

### Aufgaben / Creatives (`initialTasks`)
```
{ id, title, status (10-stufiger Workflow), assignee, author,
  dueDate, publishDate, platform, type, oneDriveLink,
  description, campaignId, scope ('single'|'all'),
  performance, aiSuggestion, analysisResult }
```

---

## 8. Design-System (`src/index.css`)

- **Dark Theme** mit CSS Custom Properties (Farben, Spacing, Typografie, Radii, Schatten)
- **Tailwind CSS v4**: Integriert über `@tailwindcss/postcss` PostCSS-Plugin
- **Modulares CSS**: Aufgeteilt in 8 Dateien (variables, base, layout, components, ui, features, pages, pages-extra)
- **Komponenten-Klassen**: Sidebar, Header, Cards, Stats, Buttons, Badges, Tables, Modal, Form, Progress, Kanban, Calendar, Tabs
- **Persona-Avatare**: `.persona-avatar`, `.persona-avatar--lg`, `.persona-avatar--sm`
- **Keyword-Tags**: `.keyword-tag--read`, `.keyword-tag--company`, `.keyword-tag--campaign`, `.keyword-tag--add`
- **Master-Prompt**: `.master-prompt-card`, `.master-prompt-content`, `.master-prompt-textarea`
- **Detail-Sections**: `.detail-section`, `.detail-section-title`
- **Animationen**: fadeIn, slideUp, slideInRight

---

## 9. Konzept: Vier-Ebenen-Modell

```
Systemebene (Admin)
├── 👤 Benutzerverwaltung (Rollen & Rechte)
└── ⚙️  Workspace-Einstellungen (Währung, Zeitzone, Sprache)

Unternehmensebene (Admin schreibt, alle lesen)
├── 🏛️  Digitale Positionierung (Vision, Mission, Werte, Tone-of-Voice)
├── 🔒 Unternehmensweite Keywords (global, read-only in Kampagnen)
└── 👥 Zielgruppen-Bibliothek (Personas, company-wide)
      │
      ↓ Zuweisung
Kampagnenebene (Manager erstellt)
├── 📋 Kampagne
│   ├── Beschreibung (Freitext)
│   ├── 🤖 Master-Prompt (KI-Kontext-Basis)
│   ├── 🔑 Kampagnen-Keywords (ergänzend)
│   └── 👤 Zugewiesene Zielgruppen (aus Bibliothek)

Inhaltsebene (Member arbeitet)
└── 📅 Content, Aufgaben, Budget (einer Kampagne zugeordnet)
```

---

## 10. Nächste Schritte

### Phase 0.5 — UI-Verfeinerung ✅
- [x] TypeScript-Migration (vollständig, strict mode)
- [x] Tailwind CSS v4 Integration
- [x] Migration auf Next.js App Router (Turbopack)
- [x] Dateibasiertes Routing (kein React Router mehr)
- [x] Wiederverwendbare Komponenten extrahiert (max. 300 Zeilen/Datei)
- [ ] Responsive Design (Tablet)
- [ ] Drag & Drop im Kanban
- [ ] Wochenansicht im Kalender
- [ ] Content erstellen/bearbeiten im Kalender
- [ ] Dark/Light Mode Toggle

### Phase 1 — Backend (Supabase) ✅
- [x] Supabase-Projekt + 17 Datenbank-Tabellen erstellt
- [x] Migrationsskript (`scripts/migrate.mjs`) für Schema + Seed-Daten
- [x] Supabase-Client (`src/lib/supabase.ts`)
- [x] Vollständige CRUD-API-Schicht (`src/lib/api.ts`, ~500 Zeilen)
- [x] snake_case ↔ camelCase Konvertierung
- [x] Row Level Security (RLS) auf allen Tabellen aktiviert
- [x] 4 Contexts refactored zu Supabase (DataContext, ContentContext, TaskContext, AuthContext)
- [x] Mock-Daten-Imports in 14 Dateien durch `useData()` Context ersetzt
- [x] Login via Datenbank (`loginUser` + Passworvergleich)
- [x] CRUD für: Kampagnen, Zielgruppen, Touchpoints, Content, Aufgaben, Positionierung, Keywords, Journeys
- [ ] Supabase Auth (JWT-basiert, statt Klartext-Passwort)
- [ ] Echtzeit-Updates (Supabase Realtime subscriptions)

### Phase 2 — Kernfunktionalität
- [ ] Kampagnen-Workflow (Statusübergänge)
- [ ] Aufgaben-Zuweisung & Deadlines (E-Mail-Benachrichtigung)
- [ ] Budget-Tracking mit echten Eingaben
- [ ] Echtzeit-Updates (Supabase Realtime)

### Phase 3 — KI-Integration
- [ ] Master-Prompt → KI-Content-Generator (OpenAI/Anthropic)
- [ ] Personas-basierte Content-Vorschläge
- [ ] Keyword-Analyse & -Empfehlungen
- [ ] Automatische Performance-Insights

---

## 11. Offene architektonische Entscheidungen

| Frage | Optionen | Status |
|---|---|---|
| Next.js oder Vite? | Plan: Next.js, Aktuell: Next.js 16 | ✅ Next.js (App Router) |
| Backend/DB? | Supabase PostgreSQL (eu-central-1) | ✅ Supabase |
| Auth-Methode? | DB-Login (aktuell) vs. Supabase Auth (JWT) | DB-Login (v0.8), JWT geplant |
| E-Mail-Modul oder Integration? | Eigen vs. Mailchimp/Brevo | Offen |
| CRM eingebaut oder Connector? | Eigen vs. HubSpot/Salesforce | Offen |
| KI-Provider | OpenAI, Anthropic, Gemini? | Offen |
| Personas: Flat oder Template-System? | Freiform vs. strukturiert | Freiform (v0) |
| RLS-Granularität | Row-Level oder App-Level? | RLS aktiviert (anon-all), rollenbasiert geplant |

---

> **Hinweis:** Diese Datei wird bei jedem Entwicklungsschritt aktualisiert.
> Dev-Server: `npm run dev` → http://localhost:3000
> Build: `npm run build` (Turbopack)
> Typencheck: `npm run typecheck`
