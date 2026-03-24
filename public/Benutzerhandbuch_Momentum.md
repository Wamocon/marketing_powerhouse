# Momentum Benutzerhandbuch

Version: 1.1.0
Stand: 23.03.2026
Produkt: Momentum - Marketing OS

## 1. Zweck und Zielgruppe

Dieses Handbuch beschreibt die vollstaendige Nutzung von Momentum fuer:
- Super-Admin
- Projekt-Admin (company_admin)
- Manager
- Member

Es dient als operative Grundlage fuer Setup, Kampagnensteuerung, Teamarbeit, Controlling und den taeglichen Produktionsbetrieb.

## 2. Systemueberblick

Momentum ist eine Multi-Tenancy Marketing-Plattform mit rollenbasierten Rechten und projektbezogenen Datenraeumen.

Hauptmodule:
- Dashboard
- Kampagnen
- Zielgruppen
- Customer Journey
- Kanaele und Touchpoints
- Content-Uebersicht
- Content-Kalender
- Aufgaben
- Budget und Controlling
- Digitale Positionierung
- Projekt-Setup
- Anleitung
- Einstellungen

## 3. Rollen und Berechtigungen

### 3.1 Rollenmodell

- Super-Admin: Globale Verwaltung aller Projekte und Benutzer
- Projekt-Admin: Vollzugriff innerhalb eines Projekts
- Manager: Operative Steuerung von Kampagnen, Content, Aufgaben und Budget
- Member: Umsetzung von Aufgaben, eingeschraenkte Sicht auf strategische Daten

### 3.2 Kurzmatrix

- Projekt erstellen: Super-Admin, Projekt-Admin
- Kampagnen erstellen/bearbeiten: Super-Admin, Projekt-Admin, Manager
- Budget sehen/bearbeiten: Super-Admin, Projekt-Admin, Manager
- Einstellungen bearbeiten: Super-Admin, Projekt-Admin
- Teamrollen pflegen: Super-Admin, Projekt-Admin
- Aufgaben bearbeiten (eigene): alle Rollen mit Zuweisung

## 4. Einstieg und Navigation

### 4.1 Login und Projektauswahl

1. Mit gueltigen Benutzerdaten anmelden.
2. Projekt auswaehlen.
3. Automatische Weiterleitung ins Dashboard des aktiven Projekts.
4. Projektwechsel ueber Sidebar-Funktion Projekt wechseln.

### 4.2 Sidebar-Struktur

Bereiche:
- Uebersicht
- Marketing
- Team
- Projekt
- System

Wichtig:
- Nicht verfuegbare Funktionen werden je nach Rolle ausgeblendet.
- Das Super-Admin Panel erscheint nur fuer Super-Admins.

### 4.3 Header-Funktionen

- Breadcrumb-Navigation
- Sprachauswahl DE/EN
- Notification-Glocke
- Schnellzugriff auf Anleitung

## 5. Projekt-Setup durch Admin

### 5.1 Digitale Positionierung pflegen

Pflege in Digitale Positionierung:
- DNA und Kernbotschaft
- Vision/Mission/Werte
- Kommunikationsstil (Tone of Voice)
- Unternehmensweite Keywords
- Zielmarkt und Segmente

Empfehlung:
- Kurz, praezise, konkret schreiben.
- Floskeln vermeiden, damit Briefings und KI-Vorschlaege verwertbar bleiben.

### 5.2 Kanaele und Touchpoints anlegen

Fuer jeden Kanal pflegen:
- Name
- Kanaltyp (z. B. Paid, Owned, Earned)
- Link
- Beschreibung

Ziel:
- Single Source of Truth fuer alle Marketingkanaele.

### 5.3 Team und Rollen verwalten

In Einstellungen:
1. Bestehende Benutzer per E-Mail zuweisen.
2. Rollen je Projekt festlegen.
3. Kritische Rechte nur gezielt vergeben.

Best Practice:
- Teamleiter meist als Manager statt Admin fuehren.

### 5.4 Benachrichtigungen konfigurieren

In Einstellungen > Benachrichtigungen:
- Kampagnen-Events
- Aufgaben-Events
- Content-Events
- Budget-Warnungen
- Team-Events

## 6. Manager-Workflow: Kampagne von A bis Z

### 6.1 Zielgruppen definieren

In Zielgruppen:
- Demografie
- Ziele
- Frustrationen
- bevorzugte Kanaele

### 6.2 Customer Journey skizzieren

In Customer Journey pro Persona:
- Awareness
- Consideration
- Purchase
- Retention
- Advocacy

Je Phase:
- Touchpoints zuordnen
- Content-Luecken identifizieren

### 6.3 Kampagne erstellen

In Kampagnen > Neue Kampagne:
1. Grunddaten (Name, Zeitraum, Budget, Ziel)
2. Zielgruppen und Master-Prompt
3. Keywords

Ergebnis:
- Kampagne ist strategisch an Positionierung und Personas gekoppelt.

### 6.4 Content-Kalender befuellen

In Content-Kalender:
- Inhalte terminieren
- Kanal waehlen
- Kampagnenbezug setzen
- Aufgabenhuelle aktivieren

Wichtig:
- Content ohne Aufgabe fuehrt zu Umsetzungslaecken.

### 6.5 Aufgaben delegieren

In Aufgaben (Kanban oder Liste):
- Verantwortliche Person zuweisen
- klares Briefing schreiben
- Deadline setzen
- Ressourcen-Link nutzen (z. B. OneDrive)

### 6.6 Budget und Controlling steuern

In Budget und Controlling:
- Plan/Ist-Vergleich
- Ausgaben erfassen
- Priorisierung nach KPI und Kosten

Alerts:
- Warnung ab ca. 80 Prozent Budgetauslastung
- Kritisch ab Ueberschreitung

## 7. Member-Workflow: Umsetzung im Tagesgeschaeft

### 7.1 Dashboard-Check

- Eigene Aufgaben und Fristen pruefen
- Prioritaeten fuer den Tag festlegen

### 7.2 Briefing verstehen

Vor Umsetzung sicherstellen:
- Zielgruppe klar
- Format klar
- Kanal klar
- Deadline klar
- Erfolgsdefinition klar

### 7.3 Produktion und Link-Rueckgabe

- Asset extern erstellen und speichern
- Freigabelink in Aufgabe eintragen
- Status auf In Review setzen

### 7.4 Kanban-Hygiene

Empfohlene Statuslogik:
- Draft
- To Do
- In Progress
- In Review
- Done

## 8. Benachrichtigungssystem (Notification Center)

### 8.1 Nutzung

- Glocke im Header oeffnen
- Ungelesene Eintraege priorisieren
- Relevante Meldung anklicken und direkt zur Entitaet springen

### 8.2 Typische Ereignisse

- Neue Aufgabe zugewiesen
- Statuswechsel einer Aufgabe
- Content zur Freigabe bereit
- Kampagnen-Update
- Budget-Warnung

### 8.3 Pflege

- Einzelne Meldungen archivieren
- Alle gelesen markieren

## 9. Import und Export

Admin-relevante Funktionen:
- Projekt-Import/Export
- Kampagnen-Import/Export
- Zielgruppen-Import/Export

JSON-Vorlagen im public-Ordner:
- fragebogen_projekt_vorlage.json
- fragebogen_kampagne_vorlage.json
- fragebogen_zielgruppe_vorlage.json

Empfohlener Ablauf Projektimport:
1. Vorlage ausfuellen
2. Daten validieren
3. Import in Einstellungen starten
4. Ergebnis kontrollieren

## 10. Standardprozesse (SOP)

### 10.1 Tagesroutine Manager (15-30 Minuten)

1. Dashboard und Notifications prüfen
2. Kritische Fristen priorisieren
3. Blocker im Team loesen
4. In-Review Inhalte freigeben

### 10.2 Wochenroutine (60-120 Minuten)

1. Kampagnen-KPIs reviewen
2. Budget-Status und Forecast aktualisieren
3. Content-Plan nachjustieren
4. Team-Feedback einsammeln

### 10.3 Monatsroutine (2-3 Stunden)

1. Strategische Auswertung je Kampagne
2. Kanal-/Touchpoint-Performance vergleichen
3. Positionierung und Keywords justieren
4. Lessons Learned dokumentieren

## 11. Troubleshooting

### Problem: Ich sehe ein Modul nicht

Ursache:
- Rolle hat keinen Zugriff
- falsches aktives Projekt

Loesung:
1. Aktives Projekt pruefen
2. Rolle in Einstellungen pruefen lassen
3. erneut anmelden

### Problem: Content erscheint ohne Umsetzung

Ursache:
- keine Aufgabenhuelle erstellt

Loesung:
1. Content-Eintrag oeffnen
2. Aufgabe erstellen und zuweisen
3. Deadline setzen

### Problem: Budgetzahlen wirken unvollstaendig

Ursache:
- Ausgaben nicht erfasst
- Zeitraumfilter passt nicht

Loesung:
1. Ausgaben nachtragen
2. Filter und Zeitraum pruefen
3. KPI-Quelle je Kanal kontrollieren

### Problem: Benachrichtigungen fehlen

Ursache:
- Praeferenzen deaktiviert

Loesung:
1. Einstellungen > Benachrichtigungen oeffnen
2. relevante Typen aktivieren
3. Seite neu laden

## 12. Governance und Sicherheit

- Rollen nach Minimalprinzip vergeben.
- API- und Integrationszugriffe nur fuer Admins.
- Regelmaessige Pruefung der Teamzuordnungen.
- Sensible Freigabelinks nur intern teilen.

## 13. Glossar

- Persona: Modellhafte Zielgruppenbeschreibung
- Touchpoint: Kundenkontaktpunkt pro Kanal
- Master-Prompt: Strategischer Prompt fuer KI-gestuetzte Content-Ideen
- Aufgabenhuelle: Automatisch erzeugte Task-Struktur zu Content
- Plan/Ist: Geplante vs. reale Kosten

## 14. Abschluss

Wenn die Prozesse aus diesem Handbuch konsequent angewendet werden, entsteht ein stabiler Marketing-Workflow mit klaren Rollen, hoher Transparenz und reproduzierbarer Qualitaet.

Ende des Handbuchs.
