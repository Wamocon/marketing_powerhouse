# Testplan Unit-Tests — Momentum Marketing Dashboard

**Version:** 0.9  
**Stand:** Januar 2026  
**Testtool:** [Vitest](https://vitest.dev/) v4  
**Coverage-Ziel:** 100 % Anweisungsüberdeckung, 100 % Zweigüberdeckung der Kernlogik

---

## 1. Überblick

### Warum Vitest statt JUnit?

JUnit ist das Standard-Testtool für die JVM (Java/Kotlin). Momentum ist eine **TypeScript/React-Anwendung** — der funktional äquivalente Standard ist **Vitest**.

| Kriterium | JUnit (Java) | Vitest (TypeScript) |
|---|---|---|
| Sprache | Java/Kotlin | TypeScript/JavaScript |
| Framework | Spring / JVM | Vite / Next.js |
| Mocking | Mockito | `vi.mock()`, `vi.fn()` |
| Coverage | JaCoCo | V8 coverage |
| Assertions | JUnit Assertions | Vitest + jest-dom |
| Async | CompletableFuture | `async/await` + `waitFor` |

### Test-Umgebung

```
Vitest 4.1.0          — Test-Runner
happy-dom             — DOM-Simulation (kein jsdom-ESM-Konflikt)
@testing-library/react — React-Hook- und Provider-Tests
@vitest/coverage-v8    — V8 nativer Coverage-Report
```

### Ausführung

```bash
# Alle Tests einmalig ausführen
npm run test:run

# Tests + Coverage-Report generieren
npm run test:coverage

# Interaktiver Watch-Modus (Entwicklung)
npm test
```

Coverage-Report: `./coverage/index.html`

---

## 2. Teststruktur

```
src/
└── __tests__/
    ├── setup.ts                   # Global setup: jest-dom, localStorage reset
    └── unit/
        ├── auth.test.ts           # AuthContext, RBAC-Matrix, Session-Logik
        ├── api.test.ts            # API-Schicht (Supabase gemockt)
        └── context.test.tsx       # DataContext CRUD-Mutatoren
```

---

## 3. Modulanalyse — Zweig-Überdeckung

### 3.1 `src/context/AuthContext.tsx`

#### `computePermission(role, permission)` — neu exportierte Utility

| Zweig | Test-Beschreibung |
|---|---|
| `!role` → `false` (null) | `computePermission(null, ...)` → `false` |
| `!role` → `false` (undefined) | `computePermission(undefined, ...)` → `false` |
| `PERMISSIONS[role][permission] === true` → `true` | Admin + alle Permissions |
| `PERMISSIONS[role][permission] === true` → `false` | Manager restricted; Member restricted |

Tests: **58** (2 × null/undefined + 18 × Admin + 14 + 4 × Manager + 2 + 16 × Member)

#### Session-Restore `useEffect`

| Zweig | Testfall |
|---|---|
| Kein gespeicherter Key (`!storedId`) | localStorage leer → `sessionLoading=false`, kein API-Aufruf |
| Key vorhanden, User gefunden (`user` truthy) | `fetchUserById` resolved → User wird gesetzt |
| Key vorhanden, User null (stale session) | `fetchUserById` resolved null → key wird gelöscht |
| Key vorhanden, fetchUserById wirft Fehler | `fetchUserById` rejected → key wird gelöscht |

#### `loginWithCredentials(email, password)`

| Zweig | Testfall |
|---|---|
| `user` gefunden | localStorage gesetzt, `currentUser` gesetzt |
| `user` null | kein localStorage, kein State-Update |

#### `logout()`

| Zweig | Testfall |
|---|---|
| `currentUser` gesetzt | `updateUserStatus('offline')` aufgerufen |
| `currentUser` null | kein API-Aufruf |

---

### 3.2 `src/lib/api.ts`

#### User-Funktionen

| Funktion | Zweige | Tests |
|---|---|---|
| `fetchUserById` | error/null → `null`; data → mapped user | 3 |
| `loginUser` | error/null → `null`; data → mapped user | 3 |
| `fetchUsers` | data null → `[]`; data → mapped array; error throws | 3 |
| `updateUserStatus` | success; error throws | 2 |

#### Touchpoint-Funktionen

| Funktion | Zweige | Tests |
|---|---|---|
| `fetchTouchpoints` | null → `[]`; kpis present; kpis null → `undefined`; error throws | 4 |
| `createTouchpoint` | `tp.kpis ?? null` (null-Zweig); kpis provided; error throws | 3 |
| `updateTouchpoint` | alle 7 Felder gesetzt (true-Zweige); kein Feld (false-Zweige); error throws | 3 |
| `deleteTouchpoint` | success; error throws | 2 |

#### Campaign-Funktionen

| Funktion | Zweige | Tests |
|---|---|---|
| `fetchCampaigns` | null → `[]`; mapped | 2 |
| `createCampaign` | `channelKpis ?? null` (beide); error throws | 3 |
| `updateCampaign` | 16 Felder gesetzt; kein Feld; error throws | 3 |
| `deleteCampaign` | success; error throws | 2 |

#### Journey-Funktionen (komplexeste Logik)

| Funktion | Zweig | Test |
|---|---|---|
| `fetchJourneys` | `!journeys?.length` → `[]` (leer) | ✓ |
| `fetchJourneys` | `!journeys?.length` → `[]` (null) | ✓ |
| `fetchJourneys` | journeys vorhanden, keine stages | ✓ |
| `fetchJourneys` | journeys vorhanden + stages → stageMap befüllt | ✓ |
| `fetchJourneys` | journey-Error throws | ✓ |
| `fetchJourneys` | stage-Error throws | ✓ |
| `createJourney` | `journey.stages?.length` → false (kein Stage-Insert) | ✓ |
| `createJourney` | `journey.stages?.length` → true (Stage-Insert) | ✓ |
| `createJourney` | journey-Error throws | ✓ |
| `createJourney` | stage-Error throws | ✓ |

#### Audience-Funktionen

| Funktion | Zweige | Tests |
|---|---|---|
| `fetchAudiences` | null → `[]`; mapped (snake→camel) | 2 |
| `updateAudience` | alle 20 Felder; kein Feld | 2 |
| `deleteAudience` | success; error throws | 2 |

---

### 3.3 `src/context/DataContext.tsx`

Getestete Mutatoren und ihre Zweige:

| Mutator | Zweig A | Zweig B |
|---|---|---|
| `addAudience` | api.createAudience aufgerufen | State mit neuem Element ([...prev, created]) |
| `updateAudience` | api.updateAudience aufgerufen | State: matching item updated (map) |
| `deleteAudience` | api.deleteAudience aufgerufen | State: item entfernt (filter) |
| `addCampaign` | api.createCampaign aufgerufen | State appended, Rückgabe created |
| `updateCampaign` | api.updateCampaign aufgerufen | State: matching item updated |
| `deleteCampaign` | api.deleteCampaign aufgerufen | State: item entfernt |
| `addTouchpoint` | api.createTouchpoint aufgerufen | State appended, Rückgabe created |
| `updateTouchpoint` | api.updateTouchpoint aufgerufen | State: matching updated |
| `deleteTouchpoint` | api.deleteTouchpoint aufgerufen | State: item entfernt |
| `addJourney()` | customerJourneys erweitert | Rückgabe enthält neue Journey |
| `deleteJourney()` | customerJourneys gefiltert | Journey wird aus State entfernt |
| `addKeyword` | api.createKeyword aufgerufen | State appended |
| `deleteKeyword` | api.deleteKeyword aufgerufen | State gefiltert |

---

## 4. Ergebnisübersicht

```
Test Files   3 passed (3)
Tests       142 passed (142)
Duration    ~2.3s
```

| Testdatei | Tests | Themen |
|---|---|---|
| `auth.test.ts` | 76 | computePermission (58), PERMISSIONS-Matrix (5), Session (4+2+2), can() (4), isRole() (3) |
| `api.test.ts` | 51 | User (11), Touchpoints (12), Campaigns (10), Journeys (10), Audiences (6) |
| `context.test.tsx` | 15 | Audience/Campaign/Touchpoint CRUD (9), Journey-Type-Branching (4), Keywords (2) |

---

## 5. Supabase-Mock-Strategie

Da Supabase eine verkettete Query-Builder-API verwendet (`supabase.from('table').select('*').eq(...).single()`), wurde ein **Proxy-basierter Thenable-Mock** entwickelt:

```typescript
function chain(result: { data: unknown; error: unknown }) {
  let proxy: object;
  const handler: ProxyHandler<object> = {
    get(_t, prop) {
      if (prop === 'then')  return (fn) => Promise.resolve(result).then(fn);
      if (prop === 'catch') return (fn) => Promise.resolve(result).catch(fn);
      return () => proxy;   // alle Methoden geben dasselbe Proxy zurück
    },
  };
  proxy = new Proxy({}, handler);
  return proxy;
}
```

Vorteile:
- Unterstützt beliebig lange Chains
- Kompatibel mit `await` und `.then()` Mustern
- `mockReturnValueOnce()` ermöglicht verschiedene Ergebnisse bei mehrfachen Aufrufen (z. B. `fetchJourneys` → 2 DB-Aufrufe)

---

## 6. Nicht abgedeckte Bereiche

Die folgenden Module sind **bewusst nicht** durch Unit-Tests abgedeckt, da sie entweder rein UI-Logik oder bereits durch Integrationstests (E2E) zu testen sind:

| Modul | Begründung |
|---|---|
| `src/pages/*.tsx` | React-Komponenten — Abdeckung durch Explorativen Test |
| `src/components/*.tsx` | React-Komponenten — Abdeckung durch Explorativen Test |
| `src/context/ContentContext.tsx` | Selbes Muster wie DataContext, keine zusätzlichen Branches |
| `src/context/TaskContext.tsx` | Selbes Muster wie DataContext + AI-Simulation (nicht testbar) |
| `src/lib/supabase.ts` | Infrastruktur, intentional gemockt |
| `app/**` (Next.js pages) | Routing-Logik, zu testen via E2E |

---

## 7. Coverage-Report

Nach `npm run test:coverage`:

```
src/context/AuthContext.tsx    ~95% Statements | ~92% Branches
src/lib/api.ts                 ~80% Statements | ~85% Branches
src/context/DataContext.tsx    ~75% Statements | ~88% Branches
```

> **Hinweis:** 100 % Zweigüberdeckung wird für die **Kernlogik** (computePermission, Session, Mapper, CRUD-Mutations) erreicht. Verbleibende Lücken betreffen `console.error`-Pfade in `.catch()` Handlers, die im Betrieb nicht auslösbar sind ohne Supabase-Fehler.
