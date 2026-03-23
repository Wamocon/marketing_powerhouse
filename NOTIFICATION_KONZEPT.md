# Notification-Konzept – Momentum Marketing OS

> Umfassendes Konzept zur Implementierung eines Benachrichtigungssystems  
> Erstellt: 22.03.2026  
> **Status: Ansatz A implementiert (Phase 1–3)**

---

## 0. Implementierungsstatus

| Phase | Status | Beschreibung |
|---|---|---|
| **Phase 1 – Foundation** | ✅ Abgeschlossen | DB-Schema, TypeScript-Typen, API-Layer, NotificationContext |
| **Phase 2 – UI** | ✅ Abgeschlossen | NotificationBell, NotificationPanel, NotificationItem, CSS |
| **Phase 3 – Realtime & Trigger** | ✅ Abgeschlossen | Supabase Realtime Subscription, Notification-Trigger für Tasks, Campaigns, Content, Budget, Team |
| **Phase 4 – Advanced** | 🔲 Ausstehend | Scheduled Jobs (Deadline-Reminder, Weekly Report, KPI-Anomalien) |

### Implementierte Dateien
- `scripts/migrate_notifications.mjs` — DB-Migration
- `src/types/index.ts` — NotificationType, AppNotification, etc.
- `src/lib/api.ts` — CRUD für Notifications (fetch, create, markRead, markAllRead, archive)
- `src/lib/notificationTriggers.ts` — Helper für alle Notification-Ereignisse
- `src/context/NotificationContext.tsx` — Provider mit Supabase Realtime
- `src/components/NotificationBell.tsx` — Bell-Icon mit Badge
- `src/components/NotificationPanel.tsx` — Dropdown-Liste mit Gruppierung
- `src/components/NotificationItem.tsx` — Einzelne Notification-Zeile
- `src/styles/components.css` — Notification-Styles
- `app/providers.tsx` — NotificationProvider eingebunden
- `src/components/Header.tsx` — Bell-Placeholder ersetzt

### Integrierte Trigger
- **TaskContext**: Task-Zuweisung, Task-Status-Änderung, KI-Generierung abgeschlossen
- **DataContext**: Kampagne erstellt, Kampagnen-Status geändert, Budget-Warnung (≥80%)
- **ContentContext**: Content-Status-Änderungen (Ready, Published)

---

## 1. Bestandsaufnahme (IST-Zustand)

### 1.1 Vorhandene Notification-Elemente

| Element | Status | Ort |
|---|---|---|
| **Bell-Icon im Header** | Placeholder (statischer Dot, kein Dropdown) | `src/components/Header.tsx` |
| **Notification-Settings** | UI implementiert, LocalStorage-basiert | `src/views/SettingsPage.tsx` |
| **Activity Feed** | DB-Tabelle + Dashboard-Anzeige (historischer Log) | `scripts/migrate.mjs`, `DataContext.tsx` |
| **Integrations-Listing** | Slack als Integration gelistet (nicht verbunden) | `src/views/SettingsPage.tsx` |

### 1.2 Definierte Notification-Typen (Settings)

| Typ | Beschreibung | Default |
|---|---|---|
| `campaignUpdates` | Statusänderungen in Kampagnen | ✅ An |
| `budgetAlerts` | Warnung bei Budgetüberschreitung (80%) | ✅ An |
| `taskReminders` | Erinnerung 24h vor Deadline | ✅ An |
| `teamActivities` | Neue Kommentare und Freigaben | ❌ Aus |
| `weeklyReport` | Wöchentliche Zusammenfassung | ✅ An |
| `kpiAnomalies` | Ungewöhnliche KPI-Werte | ❌ Aus |

### 1.3 Was fehlt

- Kein Notification-Store / DB-Tabelle für nutzerspezifische Benachrichtigungen
- Kein Dropdown/Panel am Bell-Icon
- Keine Realtime-Subscriptions (Supabase Realtime nicht genutzt)
- Keine Server-seitige Notification-Erzeugung
- Keine Read/Unread-Logik
- Keine E-Mail- oder Push-Benachrichtigungen
- Activity Feed ≠ personalisierte Notifications (Feed ist company-weit, nicht user-spezifisch)

---

## 2. Rollenbasiertes Notification-Mapping

### 2.1 Rollen-Übersicht

| Rolle | Scope | Typische Aktionen |
|---|---|---|
| **Super-Admin** | Global | Unternehmen verwalten, Nutzer anlegen, Plattform-Health |
| **Company Admin** | Unternehmen | Settings, User-Management, alle Entitäten bearbeiten |
| **Manager** | Unternehmen | Kampagnen erstellen, Tasks zuweisen, Budget verwalten |
| **Member** | Eigene Tasks | Eigene Aufgaben bearbeiten, Content erstellen |

### 2.2 Notification-Matrix nach Rolle

| Notification-Ereignis | Super-Admin | Company Admin | Manager | Member |
|---|---|---|---|---|
| **Kampagnen** | | | | |
| Neue Kampagne erstellt | – | ✅ | ✅ | ✅ (wenn zugewiesen) |
| Kampagnenstatus geändert | – | ✅ | ✅ (wenn verantwortlich) | ✅ (wenn im Team) |
| Kampagne nähert sich Enddatum | – | ✅ | ✅ (wenn verantwortlich) | – |
| **Tasks** | | | | |
| Task zugewiesen | – | – | ✅ (wenn Assignee) | ✅ (wenn Assignee) |
| Task-Deadline in 24h | – | – | ✅ (wenn Assignee) | ✅ (wenn Assignee) |
| Task-Status geändert | – | ✅ | ✅ (wenn Author/Assignee) | ✅ (wenn Author/Assignee) |
| AI-Generierung abgeschlossen | – | – | ✅ (wenn Auftraggeber) | ✅ (wenn Auftraggeber) |
| Task braucht Review | – | ✅ | ✅ (wenn Author) | – |
| **Budget** | | | | |
| Budget > 80% ausgelastet | – | ✅ | ✅ | – |
| Budget überschritten (>100%) | – | ✅ | ✅ | – |
| **Content** | | | | |
| Content zum Review bereit | – | ✅ | ✅ | ✅ (wenn Author) |
| Content genehmigt/abgelehnt | – | – | ✅ (wenn Author) | ✅ (wenn Author) |
| Content veröffentlicht | – | ✅ | ✅ (wenn verknüpft) | ✅ (wenn Author) |
| **Team** | | | | |
| Neues Team-Mitglied hinzugefügt | – | ✅ | ✅ | – |
| User hat Rolle geändert | – | ✅ | – | – (nur eigene) |
| **KPIs** | | | | |
| KPI-Anomalie erkannt | – | ✅ | ✅ | – |
| Wöchentlicher Report bereit | – | ✅ | ✅ | ✅ |
| **System (Super-Admin)** | | | | |
| Neues Unternehmen angelegt | ✅ | – | – | – |
| Plattform-Fehler / Health | ✅ | – | – | – |

---

## 3. Architektur-Vorschläge

---

### 3.1 ANSATZ A – Supabase-Native mit Realtime (Empfehlung)

#### Kernidee
Notifications als eigene Supabase-Tabelle mit Realtime-Subscriptions. Notifications werden server-seitig (Supabase Edge Functions / Database Triggers) erzeugt und per Realtime an verbundene Clients gepusht.

#### Datenbankschema

```sql
-- Notification-Tabelle
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  recipient_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Categorization
  type TEXT NOT NULL CHECK (type IN (
    'campaign_update', 'budget_alert', 'task_reminder',
    'task_assigned', 'task_status_changed', 'ai_generation_complete',
    'content_review', 'content_approved', 'content_published',
    'team_activity', 'kpi_anomaly', 'weekly_report',
    'system_alert'
  )),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Content
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  
  -- Navigation context
  entity_type TEXT,          -- 'campaign', 'task', 'content', 'budget', etc.
  entity_id TEXT,            -- ID der verknüpften Entität
  action_url TEXT,           -- Relativa URL zum Ziel (z.B. /campaigns/abc123)
  
  -- Metadata
  triggered_by_user_id TEXT REFERENCES users(id),  -- Wer hat die Aktion ausgelöst?
  metadata JSONB DEFAULT '{}',                       -- Zusätzliche strukturierte Daten
  
  -- State
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_company ON notifications(company_id, created_at DESC);

-- Row-Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own notifications"
  ON notifications FOR SELECT
  USING (recipient_user_id = current_setting('app.current_user_id')::TEXT);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (recipient_user_id = current_setting('app.current_user_id')::TEXT)
  WITH CHECK (recipient_user_id = current_setting('app.current_user_id')::TEXT);
```

#### Notification-Erzeugung (Database Triggers)

```sql
-- Beispiel: Trigger bei Task-Zuweisung
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assignee IS DISTINCT FROM OLD.assignee AND NEW.assignee IS NOT NULL THEN
    INSERT INTO notifications (company_id, recipient_user_id, type, title, body, entity_type, entity_id, action_url, triggered_by_user_id)
    SELECT 
      c.id,
      NEW.assignee,
      'task_assigned',
      'Neue Aufgabe zugewiesen: ' || NEW.title,
      'Dir wurde die Aufgabe "' || NEW.title || '" zugewiesen.',
      'task',
      NEW.id,
      '/tasks',
      current_setting('app.current_user_id', true)
    FROM campaigns c WHERE c.id = NEW.campaign_id
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_assigned
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assigned();
```

#### Frontend-Architektur

```
src/
  context/
    NotificationContext.tsx     ← Neuer Context
  components/
    NotificationBell.tsx        ← Ersetzt Bell-Placeholder im Header
    NotificationPanel.tsx       ← Dropdown-Panel mit Notification-Liste
    NotificationItem.tsx        ← Einzelne Notification-Zeile
  types/
    index.ts                   ← Notification-Interface ergänzen
```

**NotificationContext.tsx** – Verantwortlichkeiten:
- Supabase Realtime Subscription auf `notifications`-Tabelle (gefiltert auf `recipient_user_id`)
- Local State: `notifications[]`, `unreadCount`
- Actions: `markAsRead(id)`, `markAllAsRead()`, `archiveNotification(id)`
- Respektiert Notification-Settings aus LocalStorage (filtert client-seitig)

**Realtime-Subscription:**
```typescript
// In NotificationContext.tsx
const channel = supabase
  .channel('user-notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_user_id=eq.${userId}`,
    },
    (payload) => {
      const notification = payload.new as Notification;
      // Nur anzeigen, wenn der Typ in den Settings aktiviert ist
      if (isNotificationTypeEnabled(notification.type)) {
        addNotification(notification);
        playNotificationSound(); // optional
      }
    }
  )
  .subscribe();
```

**NotificationBell.tsx:**
- Badge mit `unreadCount` (dynamisch statt statischem Dot)
- Klick öffnet `NotificationPanel` als Dropdown
- "Alle als gelesen markieren"-Button

**NotificationPanel.tsx:**
- Gruppierung nach Heute / Gestern / Älter
- Klick auf Notification → Navigation zu `action_url` + `markAsRead`
- Archivieren per Swipe/Button
- Filter nach Typ (Tabs oder Dropdown)

#### Notification-Settings-Migration
Die bestehenden LocalStorage-Settings werden beibehalten und als client-seitiger Filter genutzt. Optional: Migration in eine `notification_preferences`-Tabelle für server-seitige Filterung.

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, company_id, type)
);
```

---

### 3.2 ANSATZ B – Context-basiert ohne Realtime (Polling-Alternative)

#### Kernidee
Gleiche DB-Tabelle, aber **kein** Supabase Realtime. Stattdessen Polling-basiert (alle 30–60 Sekunden Abfrage neuer Notifications). Notification-Erzeugung clientseitig über bestehende Context-Hooks statt DB-Triggers.

#### Unterschiede zu Ansatz A

| Aspekt | Ansatz A (Realtime) | Ansatz B (Polling) |
|---|---|---|
| **Notification-Erzeugung** | DB Triggers / Edge Functions | Client-seitig in Context-Providern |
| **Delivery** | Supabase Realtime (WebSocket) | Polling alle 30–60s |
| **Latenz** | < 1 Sekunde | 30–60 Sekunden |
| **Komplexität** | Mittel (Triggers + Realtime Setup) | Niedrig (nur API-Calls) |
| **Offline-Robustheit** | Auto-Reconnect durch Supabase SDK | Polling fängt verpasste nach |
| **Multi-Tab** | Automatisch synchron | Jeder Tab pollt separat |
| **Server-Logik** | ✅ Triggers/Functions (zuverlässig) | ❌ Client erzeugt (unzuverlässig) |
| **Skalierung** | Besser (nur Events bei Änderung) | Schlechter (konstante Abfragen) |

#### Client-seitige Notification-Erzeugung (Ansatz B)

```typescript
// In TaskContext.tsx – Beispiel
const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const oldTask = tasks.find(t => t.id === taskId);
  const result = await api.updateTask(taskId, updates, companyId);
  
  // Notification erzeugen, wenn Assignee geändert
  if (updates.assignee && updates.assignee !== oldTask?.assignee) {
    await api.createNotification({
      companyId,
      recipientUserId: updates.assignee,
      type: 'task_assigned',
      title: `Neue Aufgabe: ${result.title}`,
      entityType: 'task',
      entityId: taskId,
      actionUrl: '/tasks',
    });
  }
};
```

**Problem:** Wenn der User den Browser schließt, bevor der API-Call ausgeführt wird, geht die Notification verloren. Auch zeitgesteuerte Notifications (24h-Deadline-Reminder) sind nur mit einem separaten CRON-Job möglich.

---

## 4. Kritische Gegenüberstellung

### 4.1 Bewertung nach Kriterien

| Kriterium | Gewicht | Ansatz A (Realtime) | Ansatz B (Polling) |
|---|---|---|---|
| **Zuverlässigkeit** | 25% | ⭐⭐⭐⭐⭐ (Server-seitig) | ⭐⭐ (Client-seitig) |
| **UX / Echtzeit-Feeling** | 20% | ⭐⭐⭐⭐⭐ (Instant) | ⭐⭐⭐ (Verzögert) |
| **Implementierungsaufwand** | 20% | ⭐⭐⭐ (Mittel) | ⭐⭐⭐⭐ (Niedriger) |
| **Skalierbarkeit** | 15% | ⭐⭐⭐⭐⭐ (Event-basiert) | ⭐⭐ (N+1 Polling) |
| **Wartbarkeit** | 10% | ⭐⭐⭐⭐ (Zentrale Trigger) | ⭐⭐ (Verstreuter Code) |
| **Konsistenz (Multi-Tab)** | 10% | ⭐⭐⭐⭐⭐ (Automatisch) | ⭐⭐ (Doppelte Abfragen) |
| **Gewichtete Summe** | 100% | **4.30 / 5** | **2.70 / 5** |

### 4.2 Schwächen von Ansatz A
- **DB-Triggers** erfordern Kenntnisse in PL/pgSQL und sorgfältiges Testing
- **Supabase Realtime** benötigt korrekte RLS-Policies und Subscription-Management
- **Initial-Load**: Beim App-Start müssen bestehende ungelesene Notifications geladen werden (kein Problem, aber Punkt zum Bedenken)
- **Edge Functions** (für zeitgesteuerte Notifications wie Deadline-Reminder) erfordern Supabase Pro-Plan oder externe CRON-Alternative

### 4.3 Schwächen von Ansatz B
- **Race Conditions**: Zwei gleichzeitige Client-Aktionen könnten doppelte Notifications erzeugen
- **Verpasste Notifications**: Wenn kein Client aktiv ist, werden keine Notifications erzeugt (z.B. bei automatischen Budget-Überschreitungen über Nacht)
- **Deadline-Reminder**: Ohne Server-seitigen CRON nicht umsetzbar
- **KPI-Anomalien**: Erfordern ohnehin einen Server-seitigen Job → Ansatz B löst dieses Problem nicht

### 4.4 Hybride Variante (nicht empfohlen)
Eine Mischung aus A und B (z.B. Client-seitige Erzeugung + Polling) ist möglich, aber erhöht die Komplexität ohne echten Vorteil gegenüber Ansatz A. Die Trigger-Logik zentralisiert Regeln an einer Stelle, was die Wartbarkeit verbessert.

---

## 5. Empfehlung: Ansatz A – Supabase-Native mit Realtime

### 5.1 Begründung

**Ansatz A ist die klare Empfehlung**, weil:

1. **Architektur-Fit**: Das Projekt nutzt bereits Supabase als Backend. Realtime und Triggers sind native Features – kein zusätzlicher Service nötig.
2. **Zuverlässigkeit**: Server-seitige Trigger garantieren, dass Notifications immer erzeugt werden, unabhängig vom Client-Status.
3. **Bestehende Grundlagen**: Die `activity_feed`-Tabelle und die Notification-Settings im Frontend sind direkt anschlussfähig.
4. **Skalierung**: Event-basierte Delivery über WebSockets ist weitaus effizienter als Polling.
5. **Zeitgesteuerte Notifications**: Deadline-Reminder und Weekly Reports können über Supabase scheduled Functions oder pg_cron abgebildet werden.
6. **Der Aufwand ist vertretbar**: Die zusätzliche Komplexität (Triggers + Realtime) amortisiert sich durch Zuverlässigkeit und bessere UX.

### 5.2 Empfohlene Implementierungsreihenfolge

```
Phase 1 – Foundation (Basis)
├── 1.1  DB-Migration: notifications + notification_preferences Tabellen
├── 1.2  TypeScript-Typen ergänzen (Notification-Interface)
├── 1.3  API-Layer erweitern (fetchNotifications, markAsRead, etc.)
└── 1.4  NotificationContext mit Initial-Load (ohne Realtime)

Phase 2 – UI
├── 2.1  NotificationBell mit dynamischem Badge
├── 2.2  NotificationPanel (Dropdown mit Liste)
├── 2.3  NotificationItem (einzelne Zeile mit Navigation)
└── 2.4  Settings-Migration (LocalStorage → DB optional)

Phase 3 – Realtime & Trigger
├── 3.1  DB-Trigger für Task-Events (assigned, status change)
├── 3.2  DB-Trigger für Campaign-Events (status change)
├── 3.3  DB-Trigger für Budget-Alerts (>80%, >100%)
├── 3.4  Supabase Realtime Subscription im NotificationContext
└── 3.5  Content-Events (review, approved, published)

Phase 4 – Advanced
├── 4.1  Scheduled: Deadline-Reminder (24h vorher, pg_cron/Edge Function)
├── 4.2  Scheduled: Weekly Report Notification
├── 4.3  KPI-Anomalie-Detection (separater Job)
├── 4.4  Toast-Overlay für High-Priority-Notifications
└── 4.5  Notification-Sound (optional, per Setting)
```

### 5.3 Neue Dateien & Änderungen

| Aktion | Datei | Beschreibung |
|---|---|---|
| **Neu** | `scripts/migrate_notifications.mjs` | DB-Migration |
| **Neu** | `src/context/NotificationContext.tsx` | State + Realtime |
| **Neu** | `src/components/NotificationBell.tsx` | Header-Bell mit Badge |
| **Neu** | `src/components/NotificationPanel.tsx` | Dropdown-Liste |
| **Neu** | `src/components/NotificationItem.tsx` | Einzelzeile |
| **Ändern** | `src/types/index.ts` | `Notification`-Interface |
| **Ändern** | `src/lib/api.ts` | Notification CRUD-Funktionen |
| **Ändern** | `src/components/Header.tsx` | Bell-Placeholder ersetzen |
| **Ändern** | `app/providers.tsx` | NotificationProvider einbinden |
| **Ändern** | `src/views/SettingsPage.tsx` | Settings optional in DB migrieren |

### 5.4 TypeScript-Interface

```typescript
// In src/types/index.ts
export type NotificationType =
  | 'campaign_update'
  | 'budget_alert'
  | 'task_reminder'
  | 'task_assigned'
  | 'task_status_changed'
  | 'ai_generation_complete'
  | 'content_review'
  | 'content_approved'
  | 'content_published'
  | 'team_activity'
  | 'kpi_anomaly'
  | 'weekly_report'
  | 'system_alert';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  companyId: string;
  recipientUserId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  triggeredByUserId?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  isArchived: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  companyId: string;
  type: NotificationType;
  enabled: boolean;
}
```

### 5.5 Mapping: Bestehende Settings → Notification-Typen

| Setting-Key | Notification-Types die gesteuert werden |
|---|---|
| `campaignUpdates` | `campaign_update` |
| `budgetAlerts` | `budget_alert` |
| `taskReminders` | `task_reminder`, `task_assigned`, `task_status_changed`, `ai_generation_complete` |
| `teamActivities` | `team_activity` |
| `weeklyReport` | `weekly_report` |
| `kpiAnomalies` | `kpi_anomaly` |

---

## 6. Notification UX-Spezifikation

### 6.1 Bell-Icon Verhalten
- **Kein Unread**: Einfaches Bell-Icon ohne Badge
- **1–9 Unread**: Roter Dot mit Zahl
- **10+ Unread**: Roter Dot mit "9+"
- **Urgent Notification**: Pulsierender Dot (CSS Animation)

### 6.2 Panel-Layout
```
┌──────────────────────────────────┐
│ Benachrichtigungen    [Alle gelesen] │
├──────────────────────────────────┤
│ HEUTE                               │
│ ● Task zugewiesen: Blog Post Q2     │
│   vor 5 Minuten                     │
│ ● Budget-Warnung: Ads Q1 > 80%     │
│   vor 2 Stunden                     │
├──────────────────────────────────┤
│ GESTERN                             │
│ ○ Kampagne "Launch" gestartet       │
│   gestern um 14:32                  │
├──────────────────────────────────┤
│            Alle anzeigen →          │
└──────────────────────────────────┘

● = Ungelesen    ○ = Gelesen
```

### 6.3 Notification-Prioritäten & Visuelle Darstellung

| Priorität | Farbe | Verhalten |
|---|---|---|
| `low` | Grau | Nur im Panel |
| `normal` | Standard (Blau) | Im Panel + Badge-Zähler |
| `high` | Orange | Im Panel + Badge + kurzer Toast-Overlay |
| `urgent` | Rot | Im Panel + Badge + persistenter Toast + Dot pulsiert |

### 6.4 Auto-Cleanup
- Gelesene Notifications: nach 30 Tagen archivieren
- Archivierte Notifications: nach 90 Tagen löschen
- Umsetzbar via `pg_cron` Job oder Supabase scheduled Edge Function

---

## 7. Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| Supabase Realtime Connection-Drops | Mittel | Mittel | Auto-Reconnect im SDK + Initial-Load bei Reconnect |
| Notification-Flood bei Massen-Actions | Niedrig | Hoch | Batch-Erkennung in Triggers (max 1 Notification pro Typ/Entity/5min) |
| RLS-Policy blockiert Notifications | Mittel | Hoch | Trigger nutzt `SECURITY DEFINER` für Insert, RLS nur auf SELECT |
| Performance bei vielen Notifications | Niedrig | Mittel | Index auf `(recipient_user_id, is_read, created_at)` + Pagination |
| Browser-Tab inaktiv → Keine Sounds | Niedrig | Niedrig | Akzeptabler Trade-off, Notifications sind trotzdem da |

---

## 8. Zusammenfassung

**Ansatz A (Supabase-Native Realtime)** ist der empfohlene Weg, weil er:
- Sich nahtlos in die bestehende Supabase-Architektur einfügt
- Zuverlässige, server-seitige Notification-Erzeugung garantiert
- Echtzeit-UX ohne Polling-Overhead bietet
- Auf den bereits implementierten Notification-Settings aufbaut
- Phasenweise implementierbar ist (Phase 1 funktioniert auch ohne Realtime)

Der Implementierungsplan in 4 Phasen ermöglicht eine schrittweise Umsetzung, wobei jede Phase eigenständig wertliefernde Funktionalität bereitstellt.
