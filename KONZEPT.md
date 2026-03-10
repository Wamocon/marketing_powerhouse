# 🚀 Marketing Powerhouse — Konzept & Umsetzungsstand

> **Letzte Aktualisierung:** 10.03.2026  
> **Version:** 0.3.0 — RBAC, Digitale Positionierung & Unternehmensebene  
> **Status:** Phase 0 — UI-Skeleton vollständig (Rollen & Positionierung)

---

## 1. Projektziel

Eine **SaaS-Plattform zur Unterstützung und Automatisierung von Marketingprozessen**. Das Tool vereint Kampagnen-Management, Content-Planung, Budget-Kontrolle und Team-Zusammenarbeit in einer DSGVO-konformen, europäischen Lösung.

---

## 2. Technologie-Stack

| Schicht | Technologie | Status |
|---|---|---|
| **Frontend** | React + Vite | ✅ Aktiv |
| **Styling** | Vanilla CSS (Design System) | ✅ Aktiv |
| **Routing** | React Router v7 | ✅ Aktiv |
| **State / Auth** | React Context (AuthContext) | ✅ Aktiv |
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
    │   ├── Sidebar.jsx               ← Rollen-sensitiv, neue Sektionen
    │   └── Header.jsx                ← Rollen-Badge, Nutzeranzeige
    └── pages/
        ├── LoginPage.jsx             ← Echter Login + Dev-Panel (Schnellzugang)
        ├── DashboardPage.jsx
        ├── CampaignsPage.jsx         ← Button-Sichtbarkeit rollenbasiert
        ├── CampaignDetailPage.jsx    ← Master-Prompt, Personas, Keywords
        ├── AudiencesPage.jsx         ← Zielgruppen & Avatare
        ├── ContentCalendarPage.jsx
        ├── BudgetPage.jsx            ← Zugangssperre für Members
        ├── TasksPage.jsx
        ├── PositioningPage.jsx       ← 🆕 Digitale Positionierung
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

| Rolle | Name | E-Mail | Passwort | Abteilung |
|---|---|---|---|---|
| 🔴 **Admin** | Alexander König | `admin@marketing-ph.de` | `admin123` | IT & Operations |
| 🟣 **Manager** | Sarah Müller | `sarah@marketing-ph.de` | `manager123` | Marketing |
| 🟣 **Manager** | Max Weber | `max@marketing-ph.de` | `manager123` | Marketing |
| 🟢 **Member** | Lisa Chen | `lisa@marketing-ph.de` | `member123` | Marketing (Content) |
| 🟢 **Member** | Tom Schmidt | `tom@marketing-ph.de` | `member123` | Performance Marketing |
| 🟢 **Member** | Julia Bauer | `julia@marketing-ph.de` | `member123` | Marketing (Social) |

### Was jede Rolle sieht

**Als Admin (`admin@marketing-ph.de`)**
- Vollständige Navigation inkl. Budget & Einstellungen
- In Einstellungen: Tab "Benutzerverwaltung" mit Rollenzuweisung
- Digitale Positionierung: **editierbar** (alle 5 Blöcke)
- "Neue Kampagne"-Button: sichtbar

**Als Manager (`sarah@marketing-ph.de`)**
- Vollständige Navigation inkl. Budget
- In Einstellungen: kein Benutzerverwaltungs-Tab, Felder read-only
- Digitale Positionierung: read-only
- "Neue Kampagne"-Button: sichtbar

**Als Member (`lisa@marketing-ph.de`)**
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

### ✅ Kampagnen-Management
- [x] Kampagnen-Karten mit Status, Fortschritt, Budget
- [x] Quick-Badges (Master-Prompt, Personas, Keywords)
- [x] **"Neue Kampagne"-Button** nur für Admin & Manager sichtbar
- [x] 3-Schritt-Modal: Grunddaten / Master-Prompt + Zielgruppen / Keywords
- [x] Kampagnen-Detailseite mit Master-Prompt, Personas, Keywords
- [ ] Kampagne bearbeiten/löschen

### ✅ Zielgruppen & Avatare
- [x] Persona-Karten mit Avatar, Filter (B2B/B2C), Suche
- [x] Detail-Panel (Slide-In): Demografie, Pains, Ziele, Kanäle, Journey
- [x] Modal für neue Persona
- [ ] Persona bearbeiten/löschen / Templates

### 🆕 ✅ Digitale Positionierung (`/positioning`)
- [x] **Block 1: Unternehmens-DNA** (Name, Tagline, Gründung, Branche, Standort, ...)
- [x] **Block 2: Digitale Identität** (Vision, Mission, 5 Unternehmenswerte mit Icons)
- [x] **Block 3: Kommunikations-DNA** (Tone-of-Voice-Adjektive, Beschreibung, Markenpersönlichkeit, Dos & Don'ts)
- [x] **Block 4: Unternehmensweite Keywords** (verlinkt aus `companyKeywords`)
- [x] **Block 5: Zielmarkt** (Primär-/Sekundärmärkte, Branchen, Link zu Personas)
- [x] Alle Sektionen einzeln ausklappbar
- [x] **Admin**: inline-editierbar, Speichern-Button
- [x] **Manager & Member**: vollständig read-only

### ✅ Content-Kalender
- [x] Monatsansicht, Events farbcodiert
- [x] Monat-Navigation, Listen-Ansicht
- [ ] Drag & Drop, Wochenansicht, Content erstellen

### ✅ Budget & Controlling
- [x] KPIs, Plan vs. Ist Chart, Kategorie-Pie, Detail-Tabelle
- [x] **Members**: Zugangssperre mit Erklärung
- [x] **Manager/Admin**: "Ausgabe erfassen"-Button
- [ ] Echte Eingaben, Budget-Forecast

### ✅ Aufgaben-Management
- [x] Kanban-Board, Listen-Ansicht, Prioritäts-Badges
- [ ] Drag & Drop, Erstellen & Bearbeiten

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
