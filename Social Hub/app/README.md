# SocialHub Cloud Setup

SocialHub laeuft jetzt cloud-first auf Supabase Postgres. Die gemeinsame Team-Entwicklung arbeitet gegen das Schema `test`, und das Live-System gegen `public` (Supabase-Standard, identisch zum Frontend).

## Architektur

```
app/
├── main.py                     # FastAPI app + routes + dashboard
├── config.py                   # Settings aus .env
├── database.py                 # SQLModel models + Supabase Postgres engine setup
├── services/
│   ├── gemini_service.py       # Gemini Pro — Text + Recherche
│   ├── imagen_service.py       # Imagen 4 Ultra — Bildgenerierung
│   ├── linkedin_service.py     # LinkedIn OAuth + Posts API
│   └── scheduler_service.py    # APScheduler — automatische Pipeline
├── templates/                  # Jinja2 — Dashboard UI
│   ├── base.html
│   ├── dashboard.html
│   ├── posts.html
│   ├── post_detail.html
│   ├── generate.html
│   ├── settings.html
│   └── logs.html
├── data/                       # generierte Bilder und lokale App-Artefakte
├── requirements.txt
└── .env.example
```

## Setup

```bash
# 1. Python-Umgebung
cd app
python -m venv ..\.venv
..\.venv\Scripts\activate    # Windows
pip install -r requirements.txt

# 2. Konfiguration
copy .env.example .env
# .env bearbeiten: API-Keys eintragen

# 3a. Direkt vom Repo-Root starten
cd ..
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# 3b. Oder mit npm helper starten
npm run dev
```

## Dev Commands

Vom Repo-Root `D:\marketing_powerhouse\marketing_powerhouse`:

```bash
npm run dev    # FastAPI dev server, waehlt automatisch 8000-8010
npm run start  # FastAPI ohne reload auf Port 8000
npm run seed   # Beispieldaten in das konfigurierte Supabase-Schema einspielen
npm run qa     # seeded E2E QA gegen das gemeinsame Supabase-Testschema
npm run qa:smoke # nicht-destruktiver Supabase-Smoke-Test
npm run qa:live # Alias fuer den Smoke-Test
npm run qa:live:e2e # seeded E2E QA gegen das gemeinsame Supabase-Testschema
```

Dashboard öffnen: **http://localhost:8000**

Hinweis: Der Social Hub ist der Publishing-Engine-Teil des Systems. Fuer den normalen Entwicklungsfluss wird er ueber das Root-Workspace-Skript `npm run dev` gemeinsam mit Next.js gestartet.

## Datenbankstrategie

- SocialHub startet nicht mehr mit SQLite als Default. Ein Supabase-Postgres-Connection-String ist Pflicht.
- Die gemeinsame Entwicklungs- und QA-Umgebung verwendet `APP_ENV=test` und `DATABASE_SCHEMA=test`.
- Das Live-System verwendet `APP_ENV=production` und `DATABASE_SCHEMA=production`.
- Beide Umgebungen teilen sich dasselbe Supabase-Projekt, bleiben aber sauber ueber getrennte Schemas isoliert.
- `DATABASE_TABLE_PREFIX=socialhub_` bleibt fest, damit SocialHub-Tabellen eindeutig getrennt sind.
- Postgres- und Supabase-URLs werden normalisiert. Supabase-Hosts (`supabase.co`, `supabase.com`, `pooler.supabase.com`) werden als Cloud-Backend erkannt.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_SCHEMA` und `NEXT_PUBLIC_GEMINI_API_KEY` bleiben als Fallbacks fuer Frontend-kompatible Konfiguration erhalten.
- Seed- und destructive QA-Laeufe sind absichtlich auf das `test`-Schema begrenzt. Beispiel-Daten duerfen nicht versehentlich in `production` landen.

## Cloud Environments

Fuer diese FastAPI-App mit lang laufendem Scheduler gilt:

- Nutze **Direct Connection** wenn dein Host IPv6 kann.
- Nutze sonst **Supavisor Session Mode** auf Port `5432`.
- Nutze **nicht** Transaction Mode `6543` als Standard fuer diesen App-Server.

Aktuelle Supabase-Dashboard-Schritte:

1. Oeffne das Projekt `Momentum` in Supabase.
2. Nutze fuer Server-Runtimes standardmaessig den **Session pooler** auf Port `5432`.
3. Trage den Connection-String in die Repo-Root-Datei `.env` als `SUPABASE_DB_URL=...` ein.
4. Fuer Team-Entwicklung setze `APP_ENV=test`, `SUPABASE_SCHEMA=test`, `DATABASE_SCHEMA=test`.
5. Fuer das echte Deployment setze `APP_ENV=production`, `SUPABASE_SCHEMA=production`, `DATABASE_SCHEMA=production`.
6. Lasse `DATABASE_TABLE_PREFIX=socialhub_` unveraendert.
7. Starte die App neu.
8. Fuer Testschema-QA fuehre `npm run qa` aus.
9. Fuer einen nicht-destruktiven Runtime-Check fuehre `npm run qa:smoke` aus.

Beispiel fuer Session Pooler:

```bash
SUPABASE_DB_URL=postgres://postgres.<ref>:<db-password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

Der Health-Endpoint `/api/health` sollte dann melden:

- `app_env: test` oder `app_env: production`
- `database_target: supabase`
- `database: ok`
- `database_schema: test` oder `database_schema: production`
- `supabase_public_api.status: ok`

## Benötigte API-Keys

| Dienst | Wo beantragen | Was eintragen |
|--------|--------------|---------------|
| Google AI (Gemini + Imagen) | [ai.google.dev](https://ai.google.dev) | `GOOGLE_API_KEY` |
| LinkedIn | [linkedin.com/developers](https://www.linkedin.com/developers/) | `LINKEDIN_CLIENT_ID` + `LINKEDIN_CLIENT_SECRET` |

### LinkedIn-App erstellen:
1. Auf linkedin.com/developers eine neue App anlegen
2. Produkt **"Sign in with LinkedIn using OpenID Connect"** aktivieren → gibt `openid` + `profile`
3. Produkt **"Share on LinkedIn"** aktivieren → gibt `w_member_social`
4. Redirect URL eintragen: `http://localhost:8000/auth/linkedin/callback`

Hinweis: Dieses Projekt nutzt die offizielle LinkedIn-API fuer Login und Posting. Eine allgemeine LinkedIn-Benachrichtigungs-API fuer Likes, Kommentare oder Nachrichten ist damit nicht verfuegbar.

## Funktionen

| Funktion | Status |
|----------|--------|
| KI-Texterstellung (Gemini Pro + Google Search) | ✅ |
| Bildgenerierung (Imagen 4 Ultra) | ✅ |
| Dashboard (Übersicht, Bearbeiten, Freigeben) | ✅ |
| LinkedIn-Veröffentlichung (offizielle API) | ✅ |
| Wert-Kommentar (1h nach Veröffentlichung) | ✅ |
| Automatischer Zeitplan (Di + Do, 09:00) | ✅ |
| OAuth Token-Refresh (automatisch) | ✅ |
| System-Logs | ✅ |

## Posting-Zeitplan

- **Dienstag + Donnerstag** (Waleri's Entscheidung)
- 09:00 Uhr (konfigurierbar in .env)
- Manuelle Freigabe erforderlich vor Veröffentlichung
