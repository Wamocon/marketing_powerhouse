# 🚀 Momentum — Konzept & Umsetzungsstand

> **Letzte Aktualisierung:** 10.03.2026
> **Version:** 0.6.1 — Kanäle & Touchpoints Navigations-Integration
> **Status:** Phase 0.5 — UI-Verfeinerung & Workflows (Navigation-Optimierung)
> **Produktname:** Momentum | **Tagline:** Deine Marketing-Kampagnen mit Momentum

---

## 1. Projektziel

Eine **SaaS-Plattform zur Unterstützung und Automatisierung von Marketingprozessen**. Momentum vereint Kampagnen-Management, Content-Planung, Budget-Kontrolle und Team-Zusammenarbeit in einer DSGVO-konformen, europäischen Lösung.

---

## 2. Technologie-Stack

| Schicht | Technologie | Status |
|---|---|---|
| **Frontend** | React + Vite | ✅ Aktiv |
| **Styling** | Vanilla CSS (Design System) | ✅ Aktiv |
| **Routing** | React Router v7 | ✅ Aktiv |
| **State / Auth** | React Context (AuthContext, TaskContext, ContentContext) | ✅ Aktiv |
| **Charts** | Recharts | ✅ Aktiv |
| **Icons** | Lucide React | ✅ Aktiv |
| **Typografie** | Google Fonts (Inter) | ✅ Aktiv |
| **Backend** | Supabase (geplant) | 🔜 Ausstehend |
| **Auth (Prod)** | Supabase Auth (geplant) | 🔜 Ausstehend |
| **Hosting** | Vercel (geplant) | 🔜 Ausstehend |

---

## 3. Ordnerstruktur

```
Marketing_powerhouse/
├── index.html
├── package.json
├── vite.config.js
├── KONZEPT.md                        ← Dieses Dokument
└── src/
    ├── main.jsx
    ├── App.jsx                       ← AuthProvider-Wrapper, Routing
    ├── index.css                     ← Design System (vollständig)
    ├── context/
    │   └── AuthContext.jsx           ← 🆕 RBAC: Rollen, Permissions, useAuth()
    ├── data/
    │   └── mockData.js               ← Testnutzer, Positionierung, Kampagnen, ...
    ├── components/
    │   ├── Layout.jsx
    │   ├── Sidebar.jsx               ← Rollen-sensitiv, Navigation mit Kanäle & Touchpoints
    │   ├── Header.jsx                ← Rollen-Badge, Nutzeranzeige
    │   ├── AudienceDetailModal.jsx
    │   ├── ContentDetailModal.jsx
    │   ├── NewContentModal.jsx
    │   ├── TaskDetailModal.jsx
    │   └── PageHelp.jsx
    └── pages/
        ├── LoginPage.jsx             ← Echter Login + Dev-Panel (Schnellzugang)
        ├── DashboardPage.jsx
        ├── CampaignsPage.jsx         ← Button-Sichtbarkeit rollenbasiert
        ├── CampaignDetailPage.jsx    ← Master-Prompt, Personas, Keywords
        ├── AudiencesPage.jsx         ← Zielgruppen & Avatare
        ├── ContentCalendarPage.jsx
        ├── ContentOverviewPage.jsx   ← Content-Übersicht mit KPIs
        ├── BudgetPage.jsx            ← Zugangssperre für Members
        ├── TasksPage.jsx
        ├── CustomerJourneyPage.jsx   ← ASIDAS-Funnel mit Touchpoint-Navigation
        ├── TouchpointsPage.jsx       ← 🆕 Kanäle & Touchpoints (in Navigation)
        ├── PositioningPage.jsx       ← Digitale Positionierung
        ├── ManualPage.jsx            ← Rollenspezifische Anleitung
        └── SettingsPage.jsx          ← Admin-Tab (Benutzerverwaltung)
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
| Aufgaben zuweisen | ✅ | ✅ | ❌ |
| Aufgaben in Kampagnen erstellen | ✅ | ✅ | ❌ |
| Eigene Aufgaben bearbeiten | ✅ | ✅ | ✅ |

### Technische Umsetzung

```javascript
// src/context/AuthContext.jsx
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
- [x] E-Mail/Passwort-Formular mit Validierung gegen testUsers
- [x] Fehlermeldung bei ungültigen Credentials
- [x] **Dev-Panel**: Ausklappbarer Schnellzugang mit allen 3 Rollen
- [x] Passwort-Sichtbarkeit Toggle
- [ ] Supabase Auth (Produktion)
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
- [x] **Detailseite (3 Tabs)**: Übersicht, Creatives & Aufgaben, Performance
- [x] **Creative-Workflow (10 Stufen)**: Entwurf → KI-Generierung → KI-Vorschlag → Review → Überarbeitung → Freigabe → Einplanung → Posting → Beobachtung → KI-Analyse
- [x] Aufgaben nach Scope (Übergreifend vs. kanalspezifisch)
- [x] Modal für neues Creative (Typen: Post, Reel, Ad, Mail)
- [ ] Kampagne bearbeiten/löschen (Grunddaten)

### ✅ Zielgruppen & Avatare
- [x] Persona-Karten mit Avatar, Filter (B2B/B2C), Suche
- [x] Detail-Panel (Slide-In): Demografie, Pains, Ziele, Kanäle, Journey
- [x] Modal für neue Persona
- [ ] Persona bearbeiten/löschen / Templates

### 🆕 ✅ Customer Journey (`/journeys`)
- [x] **ASIDAS-Funnel Ansicht** (Attention, Search, Interest, Desire, Action, Share)
- [x] **Omnipräsenz-Matrix**: Search und Share werden als kontinuierliche, omnipräsente Verhaltensweisen visualisiert, die den Nutzer durchgehend begleiten.
- [x] **Deep-Linking Content**: Realer Content aus der Redaktionsplanung (`initialContents`) ist direkt in den Stages verlinkt und kann per Modal geöffnet werden.
- [x] **Touchpoint-Navigation**: Klick auf einen Journey-Touchpoint führt direkt in das Kanal-Management mit Fokus auf diesen Kanal.
- [x] **Vertriebs-Handoff**: Visueller Trigger für den Übergang von Marketing zu Sales in der Action-Phase.
- [x] **KPIs & Metriken**: Trends und Kennzahlen pro Stage zur Erfolgsmessung der Journey.

### ✅ Kanäle & Touchpoints (`/touchpoints`)
- [x] **In Navigation sichtbar**: Eigener Menüpunkt im berereich "Marketing" mit Badge (6 Kanäle)
- [x] **Single-Source-of-Truth**: Alle eingesetzten Kanäle zentral angelegt (Google Ads, LinkedIn, E-Mail CRM, Webinar-LP, Sales Pipeline, Instagram Reels)
- [x] **Bidirektionale Analyse**: Einblick, welche Kampagnen UND welcher Content gerade auf diesem Kanal ausgespielt werden
- [x] **Navigation State**: Unterstützung von Deep-Links aus anderen Modulen (Journeys/Kampagnen)
- [x] **Navigation**: Direkte Verlinkung zurück zur Kampagnen-Detailseite
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
- [x] **Manager/Admin**: "Ausgabe erfassen"-Button
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
- [ ] Echtes Speichern, API-Key Management

---

## 7. Datenmodell (Mock — `mockData.js`)

### Test-Nutzer (`testUsers`)
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

### Phase 0.5 — UI-Verfeinerung
- [ ] Responsive Design (Tablet)
- [ ] Drag & Drop im Kanban
- [ ] Wochenansicht im Kalender
- [ ] Content erstellen/bearbeiten im Kalender
- [ ] Dark/Light Mode Toggle

### Phase 1 — Backend (Supabase)
- [ ] Projekt + Datenbank-Schema aufsetzen:
  - `users` (mit `role` column)
  - `company_positioning`
  - `company_keywords`
  - `audiences` + `campaign_audiences`
  - `campaigns` (master_prompt, campaign_keywords[])
  - `tasks` + `content` + `budget_entries`
- [ ] Supabase Auth (Login, Register, Logout, Reset)
- [ ] Row Level Security (RLS) nach Rollenmatrix
- [ ] CRUD für alle Entitäten

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
| Next.js oder Vite? | Plan: Next.js, Aktuell: Vite | Vite (Prototyp) |
| E-Mail-Modul oder Integration? | Eigen vs. Mailchimp/Brevo | Offen |
| CRM eingebaut oder Connector? | Eigen vs. HubSpot/Salesforce | Offen |
| KI-Provider | OpenAI, Anthropic, Gemini? | Offen |
| Personas: Flat oder Template-System? | Freiform vs. strukturiert | Freiform (v0) |
| RLS-Granularität | Row-Level oder App-Level? | App-Level (v0), RLS (v1) |

---

> **Hinweis:** Diese Datei wird bei jedem Entwicklungsschritt aktualisiert.  
> Dev-Server: `npm run dev` → http://localhost:5173
