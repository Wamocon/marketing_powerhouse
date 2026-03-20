# 🧪 Explorativer Abnahmetest-Plan — Momentum Marketing Dashboard

**Version:** 0.9  
**Stand:** Januar 2026  
**Testziel:** Validierung aller Kernprozesse und des Rollen-Rechte-Konzepts gegen KONZEPT.md  
**Teststrategie:** Explorativ-strukturiert — alle Kernprozesse für alle 4 Rollen werden manuell durchgeführt

---

## Testumgebung

| Parameter | Wert |
|---|---|
| URL (Dev) | http://localhost:3000 |
| Browser | Chromium oder Firefox (aktuell, keine Erweiterungen) |
| Auflösung | min. 1280 × 800 |
| Netzwerk | Supabase-Verbindung aktiv |

## Zugangsdaten

| Rolle | E-Mail | Passwort |
|---|---|---|
| **Super-Admin** | daniel@test-it-academy.de | admin123 |
| **Unternehmens-Admin** | waleri@test-it-academy.de | manager123 |
| **Manager** | anna@test-it-academy.de | manager123 |
| **Member** | lisa@test-it-academy.de | member123 |

## Konventionen

| Symbol | Bedeutung |
|---|---|
| ✅ | Bestanden |
| ❌ | Fehlgeschlagen |
| ⚠️ | Abweichung / Hinweis |
| 🔲 | Nicht getestet |

---

## BLOCK T1 — Authentifizierung & Session-Management

> Gilt für alle Rollen. Für jede Rolle separat durchführen.

### T1.1 Login

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T1.1.1 | http://localhost:3000 aufrufen | Login-Seite erscheint (kein DEV-Panel) | | 🔲 |
| T1.1.2 | Falsche E-Mail + Passwort eingeben, „Anmelden" klicken | Fehlermeldung „Ungültige Anmeldedaten" — kein Redirect | | 🔲 |
| T1.1.3 | Richtige Zugangsdaten der jeweiligen Rolle eingeben | Dashboard lädt, Nutzerrolle in Sidebar sichtbar | | 🔲 |
| T1.1.4 | URL direkt auf `/dashboard` ändern ohne Login | Redirect zur Login-Seite | | 🔲 |

### T1.2 Session-Persistenz (kritischer Sicherheitstest)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T1.2.1 | Nach Login: Seite mit F5 aktualisieren | Nutzer bleibt angemeldet, kein Flackern | | 🔲 |
| T1.2.2 | Browser-Tab schließen, neu öffnen, URL eingeben | Nutzer bleibt angemeldet (localStorage-Session) | | 🔲 |
| T1.2.3 | Browser-Tab 30 Minuten inaktiv | Session bleibt bestehen (kein Auto-Logout) | | 🔲 |

### T1.3 Logout

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T1.3.1 | „Abmelden"-Button in Sidebar klicken | Redirect zur Login-Seite | | 🔲 |
| T1.3.2 | Nach Logout: Browser-Zurück-Button | Login-Seite, kein Zugriff auf Dashboard | | 🔲 |
| T1.3.3 | Nach Logout neu einloggen | Sauberer State, korrekte Rolle | | 🔲 |

---

## BLOCK T2 — Dashboard

### T2.1 Admin-Dashboard

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T2.1.1 | Als Admin einloggen, Dashboard öffnen | KPI-Karten laden (Kampagnen, Leads, Budget, Engagement) | | 🔲 |
| T2.1.2 | Charts prüfen | Performance-Chart und Channel-Donut-Chart sichtbar | | 🔲 |
| T2.1.3 | Aktivitäts-Feed prüfen | Letzte Aktivitäten aus DB sichtbar | | 🔲 |
| T2.1.4 | Team-Mitglieder-Panel prüfen | Alle 3 Nutzer mit korrektem Status | | 🔲 |

### T2.2 Manager-Dashboard

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T2.2.1 | Als Manager einloggen, Dashboard öffnen | Gleicher Aufbau wie Admin | | 🔲 |
| T2.2.2 | Budget-Widget prüfen | Budget sichtbar (`canSeeBudget = true`) | | 🔲 |

### T2.3 Member-Dashboard

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T2.3.1 | Als Member einloggen, Dashboard öffnen | Dashboard lädt | | 🔲 |
| T2.3.2 | Budget-Karte prüfen | **Kein Budget-Widget** (`canSeeBudget = false`) | | 🔲 |

---

## BLOCK T3 — Kampagnen-Management

### T3.1 Kampagnen-Übersicht (alle Rollen)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T3.1.1 | Sidebar → „Kampagnen" klicken | Liste aller Kampagnen lädt | | 🔲 |
| T3.1.2 | Kampagne in der Liste anklicken | Kampagnen-Detail-Seite öffnet | | 🔲 |

### T3.2 Kampagne erstellen (Admin/Manager)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T3.2.1 | Als Admin: „+ Neue Kampagne" Button klicken | Modal „Neue Kampagne" erscheint | | 🔲 |
| T3.2.2 | Formular ausfüllen (Name, Zeitraum, Budget, Kanäle) | Alle Pflichtfelder akzeptiert | | 🔲 |
| T3.2.3 | „Speichern" klicken | Kampagne erscheint in der Liste, DB-Eintrag ✓ | | 🔲 |
| T3.2.4 | Als Manager: gleichen Ablauf wiederholen | Gleiche Funktionalität wie Admin | | 🔲 |

### T3.3 Kampagne erstellen — Member (gesperrt)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T3.3.1 | Als Member: Kampagnen-Seite öffnen | Keine „+ Neue Kampagne"-Schaltfläche sichtbar | | 🔲 |

### T3.4 Kampagnen-Detail (alle Rollen)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T3.4.1 | Kampagnen-Detail öffnen, Tab „Übersicht" | KPI-Karten, Fortschritt sichtbar | | 🔲 |
| T3.4.2 | Tab „Aufgaben" | Aufgaben der Kampagne sichtbar | | 🔲 |
| T3.4.3 | Tab „Content" | Zugehörige Content-Elemente sichtbar | | 🔲 |
| T3.4.4 | Tab „Zielgruppen" | Zugeordnete Personas sichtbar | | 🔲 |

### T3.5 Kampagne löschen (Admin/Manager)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T3.5.1 | Als Admin: Kampagne → Löschen-Icon | Bestätigungsdialog erscheint | | 🔲 |
| T3.5.2 | Bestätigen | Kampagne verschwindet aus der Liste | | 🔲 |
| T3.5.3 | Als Member: Kampagne aufrufen | Kein Löschen-Button sichtbar (`canDeleteItems = false`) | | 🔲 |

---

## BLOCK T4 — Zielgruppen (Personas)

### T4.1 Zielgruppen-Übersicht (alle Rollen)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T4.1.1 | Sidebar → „Zielgruppen" klicken | Personas-Karten laden | | 🔲 |
| T4.1.2 | Persona-Karte anklicken | Detail-Modal mit allen Feldern | | 🔲 |

### T4.2 Persona erstellen (Admin/Manager)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T4.2.1 | Als Admin: „+ Neue Persona" klicken | Formular-Modal öffnet | | 🔲 |
| T4.2.2 | Pflichtfelder ausfüllen, speichern | Persona erscheint in Liste | | 🔲 |
| T4.2.3 | Als Manager: gleichen Ablauf | Gleiche Funktionalität | | 🔲 |

### T4.3 Persona erstellen — Member (gesperrt)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T4.3.1 | Als Member: Zielgruppen-Seite öffnen | Kein „+ Neue Persona"-Button (`canEditAudiences = false`) | | 🔲 |
| T4.3.2 | Member kann Detail-Modal öffnen | Lesezugriff vorhanden (`canViewAudiences = true`) | | 🔲 |

### T4.4 Persona bearbeiten/löschen

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T4.4.1 | Als Admin: Persona öffnen, Felder bearbeiten, speichern | Änderungen in DB gespeichert, Karte aktualisiert | | 🔲 |
| T4.4.2 | Als Admin: Persona löschen | Bestätigung, dann aus Liste entfernt | | 🔲 |

---

## BLOCK T5 — Customer Journey

### T5.1 Journey-Ansicht (alle Rollen)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T5.1.1 | Sidebar → „Customer Journey" | Journey-Karten laden | | 🔲 |
| T5.1.2 | Journey-Detail aufklappen | Phasen mit Touchpoints, Emotionen, Metriken sichtbar | | 🔲 |

### T5.2 Journey erstellen (Admin/Manager)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T5.2.1 | Als Admin: „+ Neue Journey" | Modal mit Feldern öffnet | | 🔲 |
| T5.2.2 | Journey ohne Stages speichern | In der Liste sichtbar, stages = [] | | 🔲 |
| T5.2.3 | Journey mit Stages erstellen | Stages in der Detailansicht sichtbar | | 🔲 |

### T5.3 Journey löschen

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T5.3.1 | Als Admin: Journey löschen | Aus Liste entfernt | | 🔲 |
| T5.3.2 | Als Member: Journey aufrufen | Kein Löschen-Button | | 🔲 |

---

## BLOCK T6 — Kanäle & Touchpoints

### T6.1 Touchpoints-Übersicht (alle Rollen)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T6.1.1 | Sidebar → „Touchpoints" | Liste aller Kanäle und Touchpoints | | 🔲 |
| T6.1.2 | Touchpoint-Karte anklicken | Detail-Modal mit KPI-Daten | | 🔲 |

### T6.2 Neuer Touchpoint (Admin/Manager)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T6.2.1 | Als Admin: „+ Neuer Kanal" klicken | Modal erscheint | | 🔲 |
| T6.2.2 | Felder ausfüllen (Name, Typ, Phase, URL) | Validierung greift bei leeren Pflichtfeldern | | 🔲 |
| T6.2.3 | Speichern-Button klicken | **Async-Speicherung** — kein vorzeitiges Schließen, Ladestatus sichtbar | | 🔲 |
| T6.2.4 | Nach Speichern | Modal schließt sich, neuer Touchpoint in Liste sichtbar | | 🔲 |
| T6.2.5 | Als Manager: gleichen Ablauf | Gleiche Funktionalität | | 🔲 |

### T6.3 Touchpoint bearbeiten/löschen

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T6.3.1 | Als Admin: Touchpoint öffnen, KPIs bearbeiten, speichern | Änderungen persistiert | | 🔲 |
| T6.3.2 | Als Admin: Touchpoint löschen | Aus Liste entfernt | | 🔲 |
| T6.3.3 | Als Member: Touchpoints-Seite | Kein „+ Neuer Kanal"-Button (`canManageTouchpoints = false`) | | 🔲 |

---

## BLOCK T7 — Content-Management

### T7.1 Content-Übersicht (alle Rollen)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T7.1.1 | Sidebar → „Content-Übersicht" | Content-Karten mit Status laden | | 🔲 |
| T7.1.2 | Sidebar → „Content-Kalender" | Kalenderansicht mit geplanten Inhalten | | 🔲 |
| T7.1.3 | Content-Item anklicken | Detail-Modal mit Plattform, Datum, Beschreibung | | 🔲 |

### T7.2 Content erstellen (Admin/Manager)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T7.2.1 | Als Admin: „+ Neuer Content" | Erstell-Modal öffnet | | 🔲 |
| T7.2.2 | Felder ausfüllen (Titel, Kanal, Phase, Datum), speichern | Neues Content-Item erscheint in Liste | | 🔲 |
| T7.2.3 | Als Manager: gleichen Ablauf | Gleiche Funktionalität | | 🔲 |

### T7.3 Content-Berechtigungen für Member

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T7.3.1 | Als Member: Content-Seite | Kein „+ Erstellen"-Button (`canEditContent = false`) | | 🔲 |
| T7.3.2 | Member kann bestehende Inhalte lesen | Leserechte vorhanden | | 🔲 |

---

## BLOCK T8 — Aufgaben-Management (Tasks)

### T8.1 Aufgaben-Übersicht (alle Rollen)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T8.1.1 | Sidebar → „Aufgaben" | Task-Liste mit Status-Spalten | | 🔲 |
| T8.1.2 | Aufgabe anklicken | Detail-Modal öffnet | | 🔲 |
| T8.1.3 | Als Member: eigene Aufgaben sichtbar | Member sieht nur eigene Tasks | | 🔲 |

### T8.2 Aufgabe erstellen (Admin/Manager)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T8.2.1 | Als Admin: „+ Neue Aufgabe" | Modal erscheint | | 🔲 |
| T8.2.2 | Aufgabe mit Zuweisung, Fälligkeitsdatum erstellen | Task erscheint in Liste | | 🔲 |
| T8.2.3 | Als Manager: Aufgabe erstellen und zuweisen | Aufgabe korrekt erstellt | | 🔲 |

### T8.3 Aufgabe erstellen — Member (gesperrt)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T8.3.1 | Als Member: Aufgaben-Seite | Kein „+ Neue Aufgabe"-Button (`canCreateCampaignTasks = false`) | | 🔲 |

### T8.4 Aufgaben-Status aktualisieren (Member-Kernprozess)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T8.4.1 | Als Member: eigene Aufgabe öffnen | Bearbeitungs-Option verfügbar (`canEditOwnTasks = true`) | | 🔲 |
| T8.4.2 | Status auf „In Bearbeitung" setzen | Status-Update wird gespeichert | | 🔲 |
| T8.4.3 | OneDrive-Link eintragen und speichern | Link persistiert | | 🔲 |
| T8.4.4 | Fremde Aufgabe als Member öffnen | Kein Bearbeiten-Button für fremde Tasks | | 🔲 |

### T8.5 KI-Assistent (Admin/Manager)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T8.5.1 | Aufgabe öffnen → KI-Tab | KI-Prompt-Bereich sichtbar | | 🔲 |
| T8.5.2 | „Analyse starten" | KI-Simulation läuft, Ergebnis erscheint | | 🔲 |

---

## BLOCK T9 — Budget & Controlling

### T9.1 Budget-Seite (Admin/Manager)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T9.1.1 | Als Admin: Sidebar → „Budget" | Budget-Seite lädt mit Gesamtübersicht | | 🔲 |
| T9.1.2 | Budget-Kategorien prüfen | Balkendiagramm und Tabelle korrekt | | 🔲 |
| T9.1.3 | Monatlicher Trend | Liniendiagramm sichtbar | | 🔲 |
| T9.1.4 | Als Admin: Budget-Übersicht bearbeiten und speichern | Änderungen persistiert (`canEditBudget = true`) | | 🔲 |
| T9.1.5 | Als Manager: Budget anzeigen | Lesezugriff (`canSeeBudget = true`) | | 🔲 |
| T9.1.6 | Als Manager: Budget bearbeiten | Bearbeitung möglich (`canEditBudget = true`) | | 🔲 |

### T9.2 Budget — Member (gesperrt)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T9.2.1 | Als Member: Sidebar → „Budget" | Budget-Seite **nicht** in der Sidebar sichtbar (`canSeeBudget = false`) | | 🔲 |
| T9.2.2 | URL `/budget` direkt aufrufen | Redirect oder leere Seite (kein Zugriff) | | 🔲 |

---

## BLOCK T10 — Digitale Positionierung

### T10.1 Positionierung lesen (alle Rollen)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T10.1.1 | Sidebar → „Positionierung" | Unternehmensdaten laden (Vision, Mission, Werte) | | 🔲 |
| T10.1.2 | Tab „Unternehmen" | Stammdaten sichtbar | | 🔲 |
| T10.1.3 | Tab „Keywords" | Unternehmens-Keywords sichtbar | | 🔲 |

### T10.2 Positionierung bearbeiten (Admin)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T10.2.1 | Als Admin: Bearbeiten-Button klicken | Formular editierbar | | 🔲 |
| T10.2.2 | Felder ändern, speichern | Änderungen in DB persistiert | | 🔲 |
| T10.2.3 | Keyword hinzufügen | Neues Keyword erscheint in der Liste | | 🔲 |
| T10.2.4 | Keyword löschen | Keyword aus der Liste entfernt | | 🔲 |

### T10.3 Positionierung bearbeiten — Manager/Member (gesperrt)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T10.3.1 | Als Manager: Positionierungs-Seite öffnen | Kein Bearbeiten-Button (`canEditPositioning = false`) | | 🔲 |
| T10.3.2 | Als Manager: Keywords-Tab | Kein Hinzufügen/Löschen (`canEditCompanyKeywords = false`) | | 🔲 |
| T10.3.3 | Als Member: Positionierungs-Seite | Reine Leseansicht | | 🔲 |

---

## BLOCK T11 — Einstellungen

### T11.1 Einstellungen-Seite (alle Rollen)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T11.1.1 | Sidebar → „Einstellungen" für Admin | Seite lädt — User-Verwaltung sichtbar | | 🔲 |
| T11.1.2 | Sidebar → „Einstellungen" für Manager | Seite lädt — kein User-Management-Tab | | 🔲 |
| T11.1.3 | Sidebar → „Einstellungen" für Member | Settings-Link **sichtbar** (alle Rollen dürfen Einstellungen aufrufen) | | 🔲 |

### T11.2 User-Management (nur Admin)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T11.2.1 | Als Admin: User-Liste anzeigen | Alle 3 Nutzer sichtbar | | 🔲 |
| T11.2.2 | Als Admin: Nutzer-Rolle bearbeiten | Änderung möglich (`canManageUsers = true`) | | 🔲 |
| T11.2.3 | Als Manager: User-Management aufrufen | Zugriff verweigert (`canManageUsers = false`) | | 🔲 |

### T11.3 System-Einstellungen (Admin)

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T11.3.1 | Als Admin: System-Einstellungen | Konfigurierbar (`canManageSettings = true`) | | 🔲 |
| T11.3.2 | Als Manager: System-Einstellungen | Nicht bearbeitbar (`canManageSettings = false`) | | 🔲 |

---

## BLOCK T12 — Bedienungsanleitung

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T12.1 | Sidebar → „Anleitung" | Anleitung/Handbuch-Seite öffnet | | 🔲 |
| T12.2 | Als Member: Anleitung prüfen | Sichtbar für alle Rollen | | 🔲 |

---

## BLOCK T13 — Querschnittliche Tests & Fehlerfälle

### T13.1 Navigation und Routing

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T13.1.1 | Sidebar-Links nacheinander klicken (alle Rollen) | Alle Seiten laden ohne 404 | | 🔲 |
| T13.1.2 | Browser-Zurück nach mehreren Navigationen | Korrekte Seite, kein White Screen | | 🔲 |
| T13.1.3 | Seite, die nur Admin sehen darf, als Manager aufrufen | Redirect oder Fehlerseite | | 🔲 |

### T13.2 Formular-Validierung

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T13.2.1 | Neues Formular öffnen, leer absenden | Pflichtfeld-Validierungsfehler ohne Crash | | 🔲 |
| T13.2.2 | XSS-Test: `<script>alert(1)</script>` in Textfeld | Eingabe wird als Text gespeichert, kein Script-Execution | | 🔲 |

### T13.3 Gleichzeitige Aktionen

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T13.3.1 | Modal öffnen, Speichern-Button doppelt schnell klicken | Kein doppelter DB-Eintrag (Button deaktiviert während Load) | | 🔲 |
| T13.3.2 | Als Admin: Item erstellen, sofort refreshen | Item erscheint nach Refresh (Session-Persistenz) | | 🔲 |

### T13.4 Rollen-Wechsel-Test

| ID | Schritt | Erwartet | Ergebnis | Status |
|---|---|---|---|---|
| T13.4.1 | Als Admin einloggen → Logout → Als Manager einloggen | Frischer State, Admin-Buttons weg | | 🔲 |
| T13.4.2 | Als Manager einloggen → Logout → Als Member einloggen | Budget-Seite nicht mehr sichtbar | | 🔲 |
| T13.4.3 | Selben Browser — verschiedene Tabs mit verschiedenen Sessions | Nicht unterstützt — jeder Tab hat dieselbe localStorage-Session | | 🔲 |

---

## Rollen-Rechte-Matrix — Abnahme-Checkliste

Die folgende Matrix fasst alle sichtbaren UI-Elemente und deren Erwartung je Rolle zusammen:

| Funktion / UI-Element | Admin | Manager | Member |
|---|---|---|---|
| Dashboard anzeigen | ✅ Vollständig | ✅ Mit Budget | ✅ Ohne Budget |
| Kampagne erstellen (`+`) | ✅ | ✅ | ❌ kein Button |
| Kampagne löschen | ✅ | ✅ | ❌ kein Button |
| Zielgruppe erstellen (`+`) | ✅ | ✅ | ❌ kein Button |
| Zielgruppe anzeigen | ✅ | ✅ | ✅ |
| Touchpoint erstellen (`+`) | ✅ | ✅ | ❌ kein Button |
| Content erstellen (`+`) | ✅ | ✅ | ❌ kein Button |
| Aufgabe erstellen (`+`) | ✅ | ✅ | ❌ kein Button |
| Eigene Aufgabe bearbeiten | ✅ | ✅ | ✅ |
| Fremde Aufgabe bearbeiten | ✅ | ✅ | ❌ |
| Budget anzeigen | ✅ | ✅ | ❌ kein Menü-Eintrag |
| Budget bearbeiten | ✅ | ✅ | ❌ |
| Positionierung lesen | ✅ | ✅ | ✅ |
| Positionierung bearbeiten | ✅ | ❌ | ❌ |
| Keywords bearbeiten | ✅ | ❌ | ❌ |
| Einstellungen öffnen | ✅ | ✅ | ✅ |
| User-Management | ✅ | ❌ | ❌ |
| System-Einstellungen | ✅ | ❌ | ❌ |
| Journey erstellen | ✅ | ✅ | ❌ |
| Anleitung lesen | ✅ | ✅ | ✅ |

---

## Testergebnis-Zusammenfassung

| Block | Tester | Datum | Admin | Manager | Member | Gesamt |
|---|---|---|---|---|---|---|
| T1 Auth | | | / | / | / | |
| T2 Dashboard | | | / | / | / | |
| T3 Kampagnen | | | / | / | / | |
| T4 Zielgruppen | | | / | / | / | |
| T5 Journeys | | | / | / | / | |
| T6 Touchpoints | | | / | / | / | |
| T7 Content | | | / | / | / | |
| T8 Aufgaben | | | / | / | / | |
| T9 Budget | | | / | / | / | |
| T10 Positionierung | | | / | / | / | |
| T11 Einstellungen | | | / | / | / | |
| T12 Anleitung | | | — | — | — | |
| T13 Querschnitt | | | / | / | / | |

**Abnahmeentscheidung:** ☐ freigegeben &nbsp;&nbsp; ☐ bedingt freigegeben &nbsp;&nbsp; ☐ abgelehnt

**Unterschrift Testverantwortlicher:** ___________________________

**Datum:** ___________________________
