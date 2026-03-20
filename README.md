# 🚀 Momentum

Eine **Multi-Tenancy SaaS-Plattform zur Unterstützung und Automatisierung von Marketingprozessen**. Momentum vereint Kampagnen-Management, Content-Planung, Budget-Kontrolle und Team-Zusammenarbeit in einer DSGVO-konformen, europäischen Lösung — mit Unterstützung für **mehrere Unternehmen pro Benutzer**.

> **Tagline:** Deine Marketing-Kampagnen mit Momentum

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-Multi--Tenancy%20(Phase%202)-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 Features

✅ **Multi-Tenancy** — Mehrere Unternehmen pro Benutzer, Unternehmens-Auswahl nach Login  
✅ **4-Rollen-System** — Super-Admin, Unternehmens-Admin, Manager, Member mit granularen Berechtigungen  
✅ **Super-Admin Panel** — Globale Verwaltung aller Unternehmen und Benutzer  
✅ **Unternehmens-Verwaltung** — Unternehmen erstellen, bearbeiten, Mitglieder verwalten  
✅ **Projekt-Zuweisung & Rollenwechsel** — Super-Admin weist bestehende Benutzer Unternehmen zu und ändert Rollen pro Unternehmen  
✅ **Admin-Einladung per E-Mail** — Unternehmens-Admins weisen bestehende Benutzer per E-Mail zu (Default-Rolle: Member)  
✅ **Benachrichtigungs-Einstellungen** — Schaltbare Benachrichtigungs-Typen pro Unternehmen, im Browser gespeichert  
✅ **Kampagnen-Management** — Multi-Channel-Kampagnen mit 3-Schritt-Erstellung, Master-Prompt, Zielgruppen und Keywords  
✅ **Creative-Workflow (10 Stufen)** — Entwurf → KI-Vorschlag → Review → Freigabe → Posting → KI-Analyse  
✅ **Customer Journey (5-Phasen + ASIDAS)** — Awareness bis Advocacy mit Content-Deep-Links und Touchpoint-Integration  
✅ **Kanäle & Touchpoints** — Single-Source-of-Truth mit bidirektionaler Kampagnen- und Content-Analyse sowie aggregierten KPIs  
✅ **Content-System** — Kalender- und Kartenansicht, 6-stufiger Status-Workflow, bidirektionale Aufgaben-Verknüpfung  
✅ **Zielgruppen-Management** — Persona-Avatare, B2B/B2C-Filter, Journey-Integration, CRUD via Supabase  
✅ **Budget & Controlling** — Plan/Ist-Vergleich, Kategorie-Pie, CSV-Export, rollenbasierter Zugriff  
✅ **Digitale Positionierung** — Unternehmens-DNA, Vision/Mission/Werte, Kommunikations-DNA, Keywords, Zielmarkt  
✅ **Aufgaben (Kanban + Liste)** — 5 Kanban-Spalten, Zuweisung, OneDrive-Links, Content-Verknüpfung  
✅ **Supabase Backend** — 19 Tabellen (inkl. `companies`, `company_members`), vollständige CRUD-API, RLS aktiviert  
✅ **Dark Theme** — Modulares CSS Design-System mit Tailwind CSS v4 und CSS Custom Properties  

---

## 🚀 Quick Start

### Anforderungen
- Node.js 18+
- npm

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd marketing_powerhouse

# Dependencies installieren
npm install
```

### Umgebungsvariablen

Erstelle eine `.env.local`-Datei im Projektstamm:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<dein-projekt>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dein-anon-key>
```

### Supabase Upgrade (ein Skript)

Für bestehende Datenbanken sind **alle Multi-Tenancy-DB-Änderungen** in einem Skript gebündelt:

```bash
node scripts/migrate_multi_tenant.mjs
```

Das Skript enthält:
- Tabellen `companies` und `company_members`
- Spalte `users.is_super_admin`
- Rollen-Constraint-Umstellung auf `company_admin|manager|member`
- `company_id`-Spalten + Indizes für alle relevanten Datentabellen
- Seed/Mapping für **WAMOCON Academy** inkl. Rollenzuweisung aller bestehenden Benutzer

### Starten

```bash
npm run dev
```

Dev-Server läuft unter: **http://localhost:3000**

---

## 👥 Test-Accounts

> Ein Dev-Panel auf der Login-Seite (gelber „Dev-Schnellzugang"-Button) ermöglicht Schnellzugang zu allen Rollen.

| Rolle | Name | E-Mail | Passwort | Abteilung | Super-Admin |
|---|---|---|---|---|---|
| 🟡 **Super-Admin + Unternehmens-Admin** | Daniel Moretz | `daniel@test-it-academy.de` | `admin123` | Geschäftsführung & Training | ✅ |
| 🔴 **Unternehmens-Admin** | Waleri Moretz | `waleri@test-it-academy.de` | `manager123` | Training & Qualität | ❌ |
| 🟣 **Manager** | Anna Schmidt | `anna@test-it-academy.de` | `manager123` | Marketing | ❌ |
| 🟢 **Member** | Lisa Bauer | `lisa@test-it-academy.de` | `member123` | Marketing | ❌ |
| 🟢 **Member** | Tom Weber | `tom@test-it-academy.de` | `member123` | Performance Marketing | ❌ |
| 🟢 **Member** | Jana Klein | `jana@test-it-academy.de` | `member123` | Kundenservice | ❌ |

### Demo-Unternehmen

| Unternehmen | Branche | Mitglieder |
|---|---|---|
| **WAMOCON Academy** | IT & Training | Daniel (Super-Admin + U-Admin), Waleri (U-Admin), Anna (Manager), Lisa/Tom/Jana (Member) |

### Was jede Rolle sieht

**Als Super-Admin (`daniel@test-it-academy.de`)**
- Nach Login: Unternehmens-Auswahl + Link zum **Super-Admin Panel**
- Super-Admin Panel: Alle Unternehmen verwalten, Benutzer verwalten, Super-Admin-Status vergeben
- Unternehmen-Tab: Bestehende Benutzer einem Unternehmen zuweisen und deren Rolle pro Unternehmen direkt ändern
- In jedem Unternehmen: Vollständige Kontrolle (wie Unternehmens-Admin)

**Als Unternehmens-Admin (Rolle: `company_admin`)**
- Nach Login: Unternehmens-Auswahl, Unternehmen erstellen
- Im Unternehmen: Vollständige Navigation inkl. Budget & Einstellungen
- In Einstellungen: Team-Zuweisung per E-Mail für bestehende Benutzer (bei Erfolg Default-Rolle Member)
- In Einstellungen: Tab „Benutzerverwaltung" mit Rollen-Dropdown pro User
- Digitale Positionierung: **inline editierbar** (alle 5 Blöcke)
- „Neue Kampagne"-Button: **sichtbar**

**Als Manager (`anna@test-it-academy.de`)**
- Nach Login: Unternehmens-Auswahl (nur zugewiesene Unternehmen)
- Im Unternehmen: Vollständige Navigation inkl. Budget
- In Einstellungen: kein Benutzerverwaltungs-Tab, Felder read-only
- Digitale Positionierung: **read-only**
- „Neue Kampagne"-Button: **sichtbar**

**Als Member (`lisa@test-it-academy.de`, `tom@test-it-academy.de` oder `jana@test-it-academy.de`)**
- Nach Login: Unternehmens-Auswahl (nur zugewiesene Unternehmen)
- Im Unternehmen: Navigation: **Budget ausgeblendet**
- Budget-Seite: „Kein Zugriff"-Sperrseite
- Einstellungen: alle Felder deaktiviert, kein Admin-Tab
- Digitale Positionierung: **read-only**
- „Neue Kampagne"-Button: **ausgeblendet**

---

## 📁 Projektstruktur

```
marketing_powerhouse/
├── next.config.ts                    ← Next.js Konfiguration
├── postcss.config.mjs                ← PostCSS mit Tailwind CSS v4
├── tsconfig.json                     ← TypeScript (strict mode)
├── .env.local                        ← Supabase-Credentials (nicht in Git)
├── scripts/
│   ├── migrate.mjs                   ← DB-Schema + Seed-Daten (Original)
│   └── migrate_multi_tenant.mjs      ← Einmaliges Supabase-Upgrade-Skript (alle Multi-Tenancy DB-Änderungen)
├── app/                              ← Next.js App Router (dateibasiertes Routing)
│   ├── layout.tsx                    ← Root-Layout (Fonts, Providers)
│   ├── providers.tsx                 ← Client-seitiger Context-Provider-Wrapper (5 Provider)
│   ├── client-shell.tsx              ← Auth-Gate + Company-Gate + App-Shell
│   ├── page.tsx                      ← Dashboard (/)
│   ├── admin/page.tsx                ← Super-Admin Panel (/admin)
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
    │   ├── api.ts                    ← Vollständige CRUD-API (~700 Zeilen, inkl. Company-API)
    │   └── constants.ts              ← Content-Type-Farben
    ├── types/
    │   ├── index.ts                  ← Zentrale TypeScript-Typdefinitionen (User, Company, etc.)
    │   └── dashboard.ts              ← Dashboard-spezifische Typen
    ├── context/
    │   ├── AuthContext.tsx            ← RBAC: 4 Rollen, Permissions, Login via Supabase
    │   ├── CompanyContext.tsx         ← NEU: Multi-Tenancy, Unternehmens-Auswahl/-Verwaltung
    │   ├── DataContext.tsx            ← Zentraler Daten-Provider (Supabase CRUD)
    │   ├── ContentContext.tsx         ← Content-State-Management (async)
    │   └── TaskContext.tsx            ← Aufgaben-State-Management (async)
    ├── components/                    ← Wiederverwendbare UI-Komponenten
    │   ├── Layout.tsx / Sidebar.tsx / Header.tsx
    │   ├── DashboardViews.tsx / DashboardComponents.tsx
    │   ├── CampaignDetailComponents.tsx / CampaignDetailTabs.tsx
    │   ├── ChannelKpiSection.tsx
    │   ├── NewCampaignModal.tsx
    │   ├── AudienceDetailModal.tsx / ContentDetailModal.tsx
    │   ├── TaskDetailModal.tsx / TouchpointDetailModal.tsx
    │   ├── TaskAiAgent.tsx
    │   ├── PositioningComponents.tsx / ManualComponents.tsx
    │   ├── SettingsAdmin.tsx / PageHelp.tsx
    │   └── ui/
    ├── styles/                        ← Modulares CSS (8 Dateien)
    │   ├── variables.css / base.css / layout.css
    │   ├── components.css / ui.css / features.css
    │   └── pages.css / pages-extra.css
    └── views/                         ← Seiten-Komponenten (von app/ importiert)
        ├── DashboardPage.tsx / LoginPage.tsx
        ├── CompanySelectPage.tsx       ← NEU: Unternehmens-Auswahl nach Login
        ├── SuperAdminPage.tsx          ← NEU: Super-Admin Panel
        ├── CampaignsPage.tsx / CampaignDetailPage.tsx
        ├── AudiencesPage.tsx / CustomerJourneyPage.tsx
        ├── AsidasFunnelPage.tsx / TouchpointsPage.tsx
        ├── ContentCalendarPage.tsx / ContentOverviewPage.tsx
        ├── BudgetPage.tsx / TasksPage.tsx
        ├── PositioningPage.tsx / ManualPage.tsx
        └── SettingsPage.tsx
```

---

## 🔐 Rollenmodell (RBAC) — 4 Rollen

### Rollen-Hierarchie

```
Super-Admin (globale Ebene)
  └── Kann alle Unternehmen und Benutzer verwalten
       └── Hat in jedem Unternehmen automatisch Unternehmens-Admin-Rechte

Unternehmens-Admin (pro Unternehmen)
  └── Vollständige Kontrolle über ein Unternehmen
  └── Kann bestehende Benutzer per E-Mail zuweisen und Rollen verwalten

Manager (pro Unternehmen)
  └── Kampagnen, Content, Budget, Touchpoints verwalten

Member (pro Unternehmen)
  └── Eigene Aufgaben bearbeiten, Kampagnendaten einsehen
```

### Berechtigungsmatrix

| Berechtigung | Super-Admin | Unternehmens-Admin | Manager | Member |
|---|:---:|:---:|:---:|:---:|
| **Unternehmen verwalten (global)** | ✅ | ❌ | ❌ | ❌ |
| **Benutzer verwalten (global)** | ✅ | ❌ | ❌ | ❌ |
| **Super-Admin-Rechte vergeben** | ✅ | ❌ | ❌ | ❌ |
| **Unternehmen erstellen** | ✅ | ✅ | ❌ | ❌ |
| **Positionierung bearbeiten** | ✅ | ✅ | ❌ | ❌ |
| **Keywords (unternehmensw.) bearbeiten** | ✅ | ✅ | ❌ | ❌ |
| **Mitglieder im Unternehmen verwalten** | ✅ | ✅ | ❌ | ❌ |
| **Einstellungen bearbeiten** | ✅ | ✅ | ❌ | ❌ |
| **Kampagne erstellen / bearbeiten** | ✅ | ✅ | ✅ | ❌ |
| **Zielgruppen bearbeiten** | ✅ | ✅ | ✅ | ❌ |
| **Budget einsehen / bearbeiten** | ✅ | ✅ | ✅ | ❌ |
| **Aufgaben erstellen & zuweisen** | ✅ | ✅ | ✅ | ❌ |
| **Touchpoints verwalten** | ✅ | ✅ | ✅ | ❌ |
| **Elemente löschen** | ✅ | ✅ | ✅ | ❌ |
| **Eigene Aufgaben bearbeiten** | ✅ | ✅ | ✅ | ✅ |
| **Zielgruppen / Content einsehen** | ✅ | ✅ | ✅ | ✅ |

Technische Nutzung im Code:
```typescript
const { can, isRole, isSuperAdmin, activeCompanyRole } = useAuth();
{can('canCreateCampaigns') && <button>Neue Kampagne</button>}
{isSuperAdmin && <Link href="/admin">Super-Admin Panel</Link>}
```

---

## 📚 Navigation

### App-Flow

```
Login → Unternehmens-Auswahl → Dashboard (unternehmensgebunden)
                │
                ├── Super-Admin → /admin (globale Verwaltung)
                └── Unternehmen wechseln (jederzeit via Sidebar)
```

Die Sidebar ist nach Bereichen gegliedert:

| Bereich | Seiten |
|---|---|
| **Unternehmens-Kontext** | Aktives Unternehmen + Wechsel-Button |
| **Super-Admin** | Super-Admin Panel (nur für Super-Admins) |
| **Übersicht** | Dashboard |
| **Marketing** | Kampagnen, Zielgruppen, Customer Journey, ASIDAS-Funnel, Kanäle & Touchpoints, Content-Übersicht, Content-Kalender, Budget & Controlling |
| **Team** | Aufgaben |
| **Unternehmen** | Digitale Positionierung |
| **System** | Handbuch, Einstellungen |

---

## 🔧 Technologie-Stack

| Schicht | Technologie | Version / Status |
|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | ^16.1.6 |
| **Sprache** | TypeScript (strict mode) | ✅ Aktiv |
| **Frontend** | React | ^19.2.0 |
| **Styling** | Tailwind CSS v4 + CSS Custom Properties | ^4.2.1 |
| **State / Auth** | React Context (Auth-, Company-, Data-, Task-, ContentContext) | ✅ Aktiv |
| **Charts** | Recharts | ^3.8.0 |
| **Icons** | Lucide React | ^0.577.0 |
| **Backend / DB** | Supabase (PostgreSQL, eu-central-1) | ✅ Aktiv |
| **API-Schicht** | `src/lib/api.ts` — CRUD-Funktionen (~500 Zeilen) | ✅ Aktiv |
| **Auth** | Datenbank-Login (Passwortvergleich, Supabase RLS) | ✅ Aktiv |
| **Linting** | ESLint + @typescript-eslint | ^9.39.1 |
| **Testing** | Vitest + Testing Library | ✅ Aktiv |
| **Hosting** | Vercel | 🔜 Geplant |

---

## 📝 Verfügbare Scripts

```bash
npm run dev          # Dev-Server (Turbopack) → http://localhost:3000
npm run build        # Produktions-Build
npm run start        # Produktions-Server starten
npm run lint         # ESLint
npm run typecheck    # TypeScript-Typenprüfung (tsc --noEmit)
npm run test         # Tests (Vitest, Watch-Modus)
npm run test:run     # Tests einmalig ausführen
npm run test:coverage  # Test-Coverage-Report
```

---

## 🗃️ Datenbank (Supabase PostgreSQL)

19 Tabellen mit vollständiger CRUD-API und aktiviertem RLS (Row Level Security):

| Tabelle | Beschreibung |
|---|---|
| `users` | Benutzer mit Rollen + `is_super_admin`-Flag |
| `companies` | **NEU** — Unternehmen/Tenants |
| `company_members` | **NEU** — Benutzer↔Unternehmen-Zuordnung mit Rolle |
| `campaigns` | Kampagnen-Daten (mit `company_id`) |
| `audiences` | Zielgruppen/Personas (mit `company_id`) |
| `touchpoints` | Kanäle & Touchpoints (mit `company_id`) |
| `tasks` | Aufgaben/Creatives (mit `company_id`) |
| `contents` | Content-Einträge (mit `company_id`) |
| `company_positioning` | Unternehmenspositionierung (mit `company_id`) |
| `company_keywords` | Unternehmensweite Keywords (mit `company_id`) |
| `budget_overview` | Budget-Gesamtübersicht (mit `company_id`) |
| `budget_categories` | Budget-Kategorien (mit `company_id`) |
| `monthly_trends` | Monatliche Budget-Trends (mit `company_id`) |
| `activity_feed` | Aktivitäts-Feed (mit `company_id`) |
| `team_members` | Team-Mitglieder (mit `company_id`) |
| `dashboard_chart_data` | Dashboard-Diagramm-Daten (mit `company_id`) |
| `channel_performance` | Kanal-Performance-Daten (mit `company_id`) |
| `journeys` | Customer Journeys (mit `company_id`) |
| `journey_stages` | Journey-Phasen/Stages |

Alle Datentabellen verwenden `company_id` als Foreign Key zur `companies`-Tabelle für Multi-Tenancy-Isolation.

---

## 🏗️ Fünf-Ebenen-Modell

```
Globale Ebene (Super-Admin)
├── Alle Unternehmen einsehen und verwalten
├── Benutzer global verwalten + Super-Admin-Status vergeben
└── In jedes Unternehmen eintreten mit vollen Rechten

Unternehmensebene (Unternehmens-Admin)
├── Unternehmen erstellen und konfigurieren
├── Mitglieder einladen und Rollen zuweisen
├── Unternehmens-Einstellungen (Währung, Zeitzone, Sprache)

Systemebene (Unternehmens-Admin schreibt, alle lesen)
├── Digitale Positionierung (Vision, Mission, Werte, Tone-of-Voice)
├── Unternehmensweite Keywords (global, read-only in Kampagnen)
└── Zielgruppen-Bibliothek (Personas, company-wide)
      │
      ↓ Zuweisung
Kampagnenebene (Manager erstellt)
├── Kampagne
│   ├── Master-Prompt (KI-Kontext-Basis)
│   ├── Kampagnen-Keywords (ergänzend)
│   └── Zugewiesene Zielgruppen (aus Bibliothek)

Inhaltsebene (Member arbeitet)
└── Content, Aufgaben, Budget (einer Kampagne zugeordnet)
```

---

## 🎨 Design-System

- **Dark Theme** mit CSS Custom Properties (Farben, Spacing, Typografie, Radii, Schatten)
- **Tailwind CSS v4** via `@tailwindcss/postcss` PostCSS-Plugin
- **Modulares CSS**: 8 Dateien (`variables`, `base`, `layout`, `components`, `ui`, `features`, `pages`, `pages-extra`)
- **Komponenten-Klassen**: Sidebar, Header, Cards, Stats, Buttons, Badges, Tables, Modals, Kanban, Kalender, Tabs
- **Animationen**: `fadeIn`, `slideUp`, `slideInRight`
- **Responsive**: Desktop optimiert, Tablet in Arbeit

---

## 🚧 Roadmap

### Phase 1 — Backend ✅ Abgeschlossen
- Supabase PostgreSQL (17 Tabellen, RLS, eu-central-1)
- Vollständige CRUD-API, snake_case ↔ camelCase
- 4 Contexts auf Supabase migriert
- Login via Datenbank (`loginUser`)

### Phase 2 — Multi-Tenancy ✅ Abgeschlossen
- 4-Rollen-System: Super-Admin, Unternehmens-Admin, Manager, Member
- Multi-Unternehmen pro Benutzer
- `companies` + `company_members` Tabellen
- `company_id` FK auf allen Datentabellen
- Super-Admin Panel (/admin)
- Unternehmens-Auswahl nach Login
- CompanyContext für Unternehmens-Verwaltung
- DB-Migration-Skript (`migrate_multi_tenant.mjs`)

### Phase 3 — Kernfunktionalität
- [ ] Supabase Auth (JWT-basiert, statt Klartext-Passwort)
- [ ] Echtzeit-Updates (Supabase Realtime)
- [ ] Responsive Design (Tablet)
- [ ] Drag & Drop (Kanban, Kalender)
- [ ] Budget-Eingaben & Forecast

### Phase 4 — KI-Integration
- [ ] Master-Prompt → KI-Content-Generator (OpenAI/Anthropic)
- [ ] Personas-basierte Content-Vorschläge
- [ ] Keyword-Analyse & -Empfehlungen
- [ ] Automatische Performance-Insights

---

## 📖 Dokumentation

- **[KONZEPT.md](KONZEPT.md)** — Ausführliche technische Dokumentation, Feature-Status, Datenmodell, Roadmap
- **In-App Hilfe** — Kontextuelle `PageHelp`-Komponente auf allen Hauptseiten
- **Handbuch** (`/manual`) — Rollenspezifische Anleitung für Admin, Manager und Member
- **Dev-Login Panel** — Schnellzugang zu allen Test-Accounts direkt auf der Login-Seite

---

## 🤝 Support

Für Fragen oder Probleme:
1. [KONZEPT.md](KONZEPT.md) konsultieren
2. In-App Hilfe-Sektion öffnen
3. Issue im Repository erstellen

---

## 📄 Lizenz

MIT © 2026 Momentum / Marketing Powerhouse
