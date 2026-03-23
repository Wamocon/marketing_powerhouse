# 📋 Marketing Powerhouse — Typische Workflows & Anwendungsbeispiele

> **Erstellt:** 10.03.2026  
> **Aktualisiert:** 22.03.2026  
> **Für:** Momentum v1.1.0  
> **Kontext:** WAMOCON Academy (Test-IT Academy)

---

## Übersicht: Workflows nach Rolle & Szenario

Dieses Dokument beschreibt **realistische Arbeitsabläufe** für das 4-Rollen-Modell (Super-Admin, Unternehmens-Admin, Manager, Member) und zeigt, wie diese in einem konkreten Projekt zusammenarbeiten.

### Fiktives Szenario: 🎬 "CTFL v4.0 Schulung — Kampagne Q2 2026"

**Kontext:**  
WAMOCON Academy möchte im Q2 2026 die neue **ISTQB Certified Tester Foundation Level v4.0 (CTFL)**-Schulung prominent vermarkten. Dies ist eine strategische Kampagne mit:
- Budget: €15.000
- Start: 01.04.2026
- Zeitraum: 12 Wochen
- Zielgruppen: Jobsuchende (B2C) + IT-Manager (B2B)
- Kanäle: LinkedIn Ads, Google Ads, E-Mail CRM, Website, Instagram

**Team:**
- 🟡 **Super-Admin:** Daniel Moretz (Geschäftsführung)
- 🔴 **Unternehmens-Admin:** Waleri Moretz (Trainer & Community)
- 🟣 **Manager:** Anna Schmidt (Marketing)
- 🟢 **Member:** Lisa Bauer (Content & Social), Tom Weber (Performance Marketing), Jana Klein (Community Support)

---

## 1️⃣ Rollenübergreifender Workflow: System-Einrichtung & Initialsetup

**⏱️ Dauer:** 2-3 Tage | **Beteiligung:** Admin + Manager  
**Ziel:** Das Marketing-System ist ready für die erste Kampagne

### Schritt 1: Admin — Positionierung festlegen (Tag 1 Morgen)

**Was:** Daniel Moretz (Admin) füllt die **Digitale Positionierung** aus.

1. Login: → `daniel@test-it-academy.de` / `admin123`
2. Gehe zu: **Unternehmen > Digitale Positionierung**
3. Fülle aus:
   - **Block 1 (DNA):** Name, Tagline, Gründung, etc.
   - **Block 2 (Identität):** Vision, Mission, 5 Werte
   - **Block 3 (Kommunikation):** Tone-of-Voice, Dos & Don'ts
   - **Block 4 (Keywords):** Unternehmensweite Keywords (z.B. "ISTQB", "Tester ohne Programmieren", "Karrierewechsel")
   - **Block 5 (Markt):** Zielmarkt, Primär- & Sekundärmärkte
4. Speichern

**Output:** Alle Manager und Member sehen jetzt die zentrale Markenbasis.

---

### Schritt 2: Admin — Kanäle & Touchpoints einrichten (Tag 1 Nachmittag)

**Was:** Daniel Moretz regt die Touchpoint-Verwaltung an oder beauftragt Anna damit.

1. Gehe zu: **Einstellungen > (Kanäle-Verwaltung)** oder navigiere zu **Kanäle & Touchpoints**
2. Stelle sicher, dass folgende Kanäle hinterlegt sind:
   - Google Ads ("Paid Search", Link: `ads.google.com/...`)
   - LinkedIn Ads ("Paid Social", Link: `linkedin.com/ads/...`)
   - E-Mail CRM ("Owned CRM", Link: `crm.outlook.com`)
   - Website / Webinar-LP ("Owned Website", Link: `test-it-academy.com/webinar`)
   - Instagram ("Organic Social", Link: `instagram.com/test_it_academy`)
   - Sales-Pipeline ("Direct Sales", Link: intern)
3. Jeder Kanal erhält: Beschreibung, Typ, Link

**Output:** Das System hat nun einen Single-Source-of-Truth für alle verfügbaren Kanäle.

---

### Schritt 3: Admin — Team-Rollenzuweisung (Tag 2 Morgen)

**Was:** Daniel Moretz stellt sicher, dass alle Mitarbeiter richtig eingestellt sind.

1. Gehe zu: **Einstellungen > Team-Übersicht** oder **Benutzerverwaltung**
2. Weise bestehende Benutzer per E-Mail dem aktiven Unternehmen zu.
   - Falls E-Mail noch nicht als Benutzer existiert: Erst Benutzer anlegen, dann erneut zuweisen.
   - Erfolgreiche E-Mail-Zuweisungen erhalten standardmäßig die Rolle **Member**.
2. Prüfe & Speichere:
   ```
   - Waleri Moretz     → Unternehmens-Admin (Trainer & Kampagnen-Verantwortung)
   - Anna Schmidt      → Manager (Marketing Execution)
   - Lisa Bauer        → Member (Content & Social)
   - Tom Weber         → Member (Performance Ads)
   - Jana Klein        → Member (Community & Support)
   ```
3. Optional als Super-Admin: Im **Super-Admin Panel > Unternehmen** projektbezogene Rollen direkt nachziehen (Admin/Manager/Member).
4. Besprechung kurz mit Anna: "Die CTFL v4.0 Kampagne starten wir morgen früh. Waleri und du seid die Kampagnen-Owner."

**Output:** Alle Mitarbeiter sind gewappnet. Navigation & UI passen sich an ihre Rollen an.

---

### Schritt 4: Briefing — Admin & Manager (Tag 2 Nachmittag)

**Was:** Kickoff-Besprechung zwischen Daniel (Admin) und Anna (Manager).

**Agenda (ca. 1 Stunde):**

1. **Strategie-Überblick:**
   - Zeitraum: 01.04. - 30.06.2026
   - Budget: €15.000 (Split: 40% Ads, 40% Content/Design, 20% Reserve)
   - KPIs: 500 Anmeldungen, 50 Conv. Rate, ROI 3:1

2. **Zielgruppen (Personas) besprechen:**
   - "Jobsuchende ohne IT-Erfahrung, 25-45 Jahre"
   - "IT-Manager, die Testers suchen"
   - Welche Pain Points? Was ist die Value Proposition?

3. **Content-Strategie kurz skizzieren:**
   - Wochenweise Content-Planung (z.B. Mo: LinkedIn-Post, Mi: Blog, Fr: Instagram Story)
   - Welche Touchpoints sind Priorität? (Annahme: Google + LinkedIn, dann E-Mail)

4. **Team-Zuweisung:**
   - Anna: Kampagnen-Planung, Budget, Content-Koordination
   - Waleri: Trainer-Input, Webinar-Planung, Community-Moderation
   - Lisa: Social Media Posts, Blog-Grafiken
   - Tom: Ads-Setup, Performance-Tracking
   - Jana: E-Mail-Sequenzen, Support-Tickets

---

## 2️⃣ Manager-Workflow: Kampagnen-Planung & Launch

**⏱️ Dauer:** 3-5 Tage vor Kampagnen-Start | **Beteiligung:** Manager (Anna)  
**Ziel:** Eine vollständig geplante, startbereit Kampagne im System

### Schritt 1: Personas anlegen

**Navigation:** `Marketing > Zielgruppen`

1. Klick auf **"+ Neue Zielgruppe"**
2. Erstelle Persona 1: **"Job-Switcher Sarah"**
   - Alter: 32
   - Branche: Keine IT
   - Ziele: „Sicherer, gut bezahlter Job in IT"
   - Frustrationen: „Angst vor Programmieren, zu alt, keine Erfahrung"
   - Preferred Channels: LinkedIn, Google, E-Mail
3. Erstelle Persona 2: **"IT-Manager Tom"**
   - Jobtitel: Engineering Lead
   - Ziele: „Gute Tester finden"
   - Frustrationen: „Kandidaten haben keine Zertifikate"
   - Preferred Channels: LinkedIn, Webinare

**Output:** 2 Personas sind definiert und verlinkt. Sie sind später an der Kampagne angehängt.

---

### Schritt 2: Customer Journey (5-Phasen-Modell) für die Kampagne skizzieren

**Navigation:** `Marketing > Customer Journey`

1. Wähle Persona "Job-Switcher Sarah"
2. Pro Phase des 5-Phasen-Modells überlegen: Welche Touchpoints & welcher Content sind relevant?
   - **Awareness:** Google Ads ("ISTQB Tester Kurs"), Instagram
   - **Consideration:** LinkedIn Post, Blog-Artikel, Webinar-LP
   - **Purchase:** E-Mail Sequence, Case Study, Testimonial, Anmelde-Formular
   - **Retention:** Alumni-Community
   - **Advocacy:** Referral-Program

3. Überprüfe: Sind alle diese Touchpoints in **Kanäle & Touchpoints** hinterlegt? Wenn ja, gut. Wenn nein, notiere für Admin.

**Output:** Ein klares Verständnis, wo Sarah die Informationen sieht und wann. Content wird später hier verlinkt.

---

### Schritt 3: Kampagne erstellen

**Navigation:** `Marketing > Kampagnen > Neue Kampagne`

**Modal — Schritt 1: Grunddaten**
- Name: `CTFL v4.0 Kampagne Q2 2026`
- Startdatum: `01.04.2026`
- Enddatum: `30.06.2026`
- Budget: `15000`
- Beschreibung: `Lancierung der ISTQB CTFL v4.0 Schulung. Ziel: 500 Anmeldungen. Multi-Channel: Google Ads, LinkedIn, E-Mail, Website.`

**Modal — Schritt 2: Zielgruppen & Master-Prompt**
- Wähle beide Personas: "Job-Switcher Sarah" + "IT-Manager Tom"
- Master-Prompt (KI-Briefing für Content-Generierung):
  ```
  Du bist ein Marketing-Texter für WAMOCON Academy.
  Zielgruppe 1: Jobsuchende ohne IT-Erfahrung (25-45 Jahre), die einen sicheren, gut bezahlten Job wollen.
  Zielgruppe 2: IT-Manager, die zertifizierte Tester suchen.
  
  Tone: Ermutigend, Praxisnah, Klar, Verständlich, Persönlich
  Key Message: "In 45 Tagen zum ISTQB Certified Tester — ohne zu programmieren"
  
  Generiere Content-Ideen, die beide Gruppen abholen und die ISTQB v4.0 Zertifizierung als Lösung für ihre Probleme positionieren.
  ```

**Modal — Schritt 3: Keywords**
- Corporate Keywords (automatisch importiert): "ISTQB", "Tester", "Zertifikate", "Weiterbildung"
- Kampagnen-spezifische Keywords: "CTFL v4.0", "QA Testing", "Software Testing", "Careers", "Weiterbildung"

**Speichern.**

**Output:** Eine Kampagne ist jetzt im System mit allen strategischen Ankern.

---

### Schritt 4: Content-Kalender befüllen

**Navigation:** `Marketing > Content-Kalender`

**Prozess:**
1. Klick auf **"Content planen"** (oben rechts)
2. Erstelle wöchentlich wiederkehrenden Content für 12 Wochen:

| Woche | Montag | Mittwoch | Freitag |
|---|---|---|---|
| Woche 1 | LinkedIn Post: "Warum CTFL v4.0 wichtig ist" | Blog: "5 Wege zum IT-Tester" | Instagram: Story Serie |
| Woche 2 | LinkedIn Post: "Student Success Story" | Webinar-Einladung | Instagram: Behind-the-Scenes |

**Wichtig — Schritt 4.5: Aufgabenhüllen erstellen!**
- ⚠️ **NICHT vergessen:** Beim Erstellen von Content **immer "Aufgabenhülle erstellen" ankreuzen**!
- Dadurch wird automatisch eine Draft-Aufgabe für ein Team-Mitglied generiert
- Ohne Aufgabe → Content erscheint **rot markiert** im Kalender
- Mit Aufgabe → Content ist zugewiesen und wird umgesetzt

3. Verknüpfe alle Content-Stücke mit der Kampagne "CTFL v4.0"

**Output:** 36 Content-Stücke sind im Kalender geplant, jedes mit einer dazugehörigen Aufgabe.

---

### Schritt 5: Aufgaben-Delegation (Das Briefing)

**Navigation:** `Marketing > Aufgaben` (Kanban-Board)

**Prozess:**
1. Öffne die erste Task (z.B. "LinkedIn Post: Warum CTFL v4.0 wichtig ist")
2. Klick **"Bearbeiten"**
3. Fülle aus:
   - **Zugewiesen an:** Lisa Bauer (Content & Social)
   - **Beschreibung (DAS BRIEFING):**
     ```
     LinkedIn Post für die CTFL v4.0 Kampagne (Woche 1, Montag)
     
     ZIELGRUPPE: 
     - Jobsuchende ohne IT-Background (Sie haben Angst vor Programmieren)
     - IT-Manager (Sie suchen zertifizierte Tester)
     
     NACHRICHT:
     "CTFL v4.0 ist das neue Standard-Zertifikat für alle, die ins Testing einsteigen oder sich upgraden wollen.
     Die neue Version ist noch praxisnaher und fokussiert auf moderne Test-Ansätze.
     
     CALL-TO-ACTION:
     - Jobsuchende: "Kostenlos zum WebinarVorbeitrag anmelden → Link to Website"
     - Manager: "Talent-Pool entdecken → LinkedIn Message"
     
     FORMAT:
     - 1-2 Absätze max
     - Emoji Nutzen (z.B. 🎓 🚀 ✅)
     - Hashtags: #ISTQB #QA #Testing #Certification
     
     DEADLINE: Dienstag, 02.04.2026 18:00
     
     DATEI-ABLAGE:
     1. Schreibe den Post in Word/Google Docs
     2. Kopiere den ShareLink in den "OneDrive Link"-Feld unten
     ```
   - **Duedate:** `02.04.2026`
   - **Platform:** LinkedIn
   - **OneDrive Link:** (wird später gefüllt)

4. Speichern → Task wechselt von "Draft" zu "To Do" und Anna sieht die Benachrichtigung, dass Lisa diese Task hat.

5. **Wiederhole das Briefing für alle 36 Tasks.**
   - Lisa: ~15 Social Posts
   - Tom: 5 Ads-Setup Tasks, Performance-Tracking
   - Jana: 10 E-Mail-Sequenzen, Support-Planung
   - Waleri: 6 Webinar-Planung & Trainer-Content

**Output:** 36 Aufgaben sind verteilt. Jedes Team-Mitglied sieht seine To-Do's.

---

### Schritt 6: Budget erfassen & Kontrolle einrichten

**Navigation:** `Marketing > Budget & Controlling`

1. Budgets pro Kanal festlegen (€15.000 total):
   - Google Ads: €4.500
   - LinkedIn Ads: €3.000
   - Website-Hosting & E-Mail-Tool: €1.000
   - Freelancer-Design (4 Wochen): €4.000
   - Reserve: €2.500

2. Klick **"Ausgabe erfassen"** und trage erste Rechnungen ein (z.B. Freelancer-Invoice)

3. Das System zeigt: Plan vs. Ist, Warn-Alerts bei 80% Budget-Nutzung

**Output:** Budget ist transparent, Anna sieht Überziehungs-Risiken früh.

---

## 3️⃣ Manager-Workflow: Ongoing Campaign Management

**⏱️ Dauer:** 12 Wochen (01.04. - 30.06.2026) | **Beteiligung:** Manager (Anna)  
**Ziel:** Kampagne läuft smooth, Tasks werden umgesetzt, Performance wird gemessen

### Tägliche Routine (15 Min)

1. **Dashboard checken:**
   - Login → sieht im Dashboard die KPIs:
     - Kampagnen-Fortschritt
     - Meine kritischen Tasks (fällig in den nächsten 3 Tagen)
     - Budget-Status

2. **Kanban überprüfen:**
   - Gehe zu `Marketing > Aufgaben`
   - Schau, wo liegen Tasks? Gibt es "Blocked / Blocked" Tasks?
   - Falls ja: Lisa oder Tom anschreiben ("Warum ist die Task blockiert?")

3. **Content-Kalender kurz checken:**
   - Sind alle Tasks aktuell in Bearbeitung oder fertig?
   - Rote Markierungen? → Neue Aufgaben erstellen

### Wöchentliche Routine (1-2 Std)

**Montag Morgen — Weekly Standup:**
1. Besprechung mit Lisa, Tom, Jana (15 Min):
   - Was wurde letzte Woche fertig?
   - Was sind die Blockers diese Woche?
   - Deadline-Erinnerung für kritische Tasks

**Mittwoch — Performance-Check:**
1. Gehe zu `Dashboard > Kanal-Performance` pie chart
2. Prüfe: Welche Kanäle performen am besten?
   - Google Ads: 150 Klicks, CPC €2,10
   - LinkedIn: 80 Klicks, CPC €5,50
   - E-Mail: 200 Opens, CTR 12%

3. Notiere: "E-Mail performa viel besser als erwartet. Können wir den Fokus vergrößern?"

**Freitag — Content Review & Approval:**
1. Gehe zu `Marketing > Content-Kalender`
2. Schau alle Content-Stücke an, die diese Woche fertig wurden (Status: "In Review")
3. Pro Stück:
   - Öffne den **OneDrive Link** (Lisa/Tom haben ihn eingefügt)
   - Check: Quality OK? Markenkonform? Copy gut?
   - Falls OK: Status → "Ready" (wird nächste Woche gepostet)
   - Falls nicht OK: Notiere Feedback in unter "Beschreibung" → Lisa/Tom sieht es

### Monatliche Routine (2-3 Std)

**Monatsabschluss — Berichterstattung:**

1. Gehe zu Dashboard & generiere KPI-Report:
   - Impressionen: 250.000
   - Klicks: 5.200
   - Conversions: 280
   - ROI: 2.1:1
   - Budget gesamt: €7.250 von €15.000 (48%)

2. Budgeting-Check:
   - Gehe zu `Budget & Controlling` → "Plan vs. Ist"
   - Google Ads: Budget €4.500, ausgegeben €3.200 → on track
   - LinkedIn: Budget €3.000, ausgegeben €2.100 → on track
   - Freelancer: Budget €4.000, ausgegeben €4.200 → ACHTUNG! +€200 overbudget

3. Bericht an Daniel (Admin):
   ```
   "Monatsbericht CTFL Kampagne — April 2026
   
   KPIs:
   - 250K Impressionen, 5.2K Klicks, 280 Conv., ROI 2.1:1
   - E-Mail-Kanal over-performs (150 Conv. Rate)
   - Google Ads unter-performa (1.8 Conv. per 1000 Clicks)
   
   Budget:
   - Gesamt: €7.250 / €15.000 (48%)
   - Freelancer: +€200 overbudget (Grund: extra Design-Iterationen)
   
   Nächste Schritte:
   - E-Mail-Budget erhöhen um 20%
   - Google Ads Copy testen
   - Freelancer-Cap halten auf €4.000
   ```

---

## 4️⃣ Member-Workflows: Content Production & Task Execution

**⏱️ Dauer:** Täglich | **Beteiligung:** Members (Lisa, Tom, Jana)  
**Ziel:** Qualitativ hochwertige Umsetzung von Aufgaben nach Briefing

### Workflow 4A: Lisa Bauer (Content & Social Media)

**Persona:** Content & Social Media Specialist  
**Aufgaben:** ~15 Social Posts (LinkedIn, Instagram), Blog-Grafiken  
**Tools:** Canva, Docs, Figma, LinkedIn Creator Studio

#### Morgen-Routine (30 Min)

1. **Login & Dashboard:**
   - `lisa@test-it-academy.de` / `member123`
   - Dashboard checken → "Meine Aufgabenliste"
   - Diese Woche: 4 Aufgaben fällig

2. **Aufgabe öffnen — Beispiel: "LinkedIn Post Woche 1"**
   - Klick auf Aufgabe
   - Modal öffnet
   - **Lies das Briefing** von Anna genau (in der Beschreibung):
     ```
     LinkedIn Post für die CTFL v4.0 Kampagne
     Zielgruppe: Jobsuchende + IT-Manager
     Key Message: "In 45 Tagen zum zertifizierten Tester"
     Format: 1-2 Absätze, Emoji, Hashtags
     Deadline: Di 02.04.2026 18:00
     ```
   - Schau den **"Zugehöriger Content"**-Link → Gibt es zusammenhang mit Content-Kalender?

3. **Status wechseln:**
   - Aktuell: "To Do"
   - Wechsle zu **"In Progress"** (Anna sieht: "Lisa macht was")

#### Content-Erstellung (1-2 Std)

1. Öffne Figma / Canva / Docs
2. Schreib den LinkedIn Post (nach Briefing):
   ```
   ISTQB Certified Tester Foundation Level v4.0 🎓
   
   Die neue Standards-Zertifizierung ist da!
   
   Du träumst vom Wechsel in die IT? Keine Programmier-Erfahrung? Kein Problem!
   
   Mit dem CTFL v4.0 Kurs von WAMOCON Academy:
   ✅ In 45 Tagen dorftsicher beruflicher Einstieg
   ✅ Keine Konzepte, nur Praxis (300+ Übungen mit unserem DiTeLe-Tool)
   ✅ Akkreditierte Trainer & 25 Jahre Erfahrung
   ✅ ISTQB® Zertifikat als Jobgarantie
   
   💪 Interessiert? Melde dich zu unserem kostenlosen Webinar-Vortrag an!
   
   [Link zu Anmeldung]
   
   #ISTQB #QA #Certification #TestingCareer #Weiterbildung
   ```

3. Speichere die finale Version lokal oder in Canva

#### Upload & Link-Eintrag (15 Min)

1. Upload die **finale PNG oder PDF** auf:
   - OneDrive: `WAMOCON/2026-Kampagnen/CTFL-Q2/LinkedIn-Posts/Woche-1-KPIs.png`
   - Oder: Google Drive / SharePoint

2. **Share-Link kopieren** (Recht-Click → Share)

3. Zurück zur Aufgabe in der App:
   - Klick **"Bearbeiten"**
   - Scroll zu **"Ressourcen Link (OneDrive / Drive)"**
   - Paste den Link: `https://onedrive.com/...`
   - Speichern

4. Status wechseln → **"In Review"** (Anna sieht: "Lisa ist fertig, bitte checken")

#### Feedback-Loop (Falls Überarbeitungen nötig)

1. Anna öffnet die Datei via Link
2. Falls nicht OK: Schreibt Feedback in der Task-Description:
   - "Lisa, bitte überarbeite den 2. Absatz. Tone ist zu formal. Mach es persönlicher!"
3. Lisa sieht die Notification
4. Überarbeitet, updated den OneDrive Link (mit "Überarbeitete Version v2" im Namen)
5. Status bleibt "In Review" bis Anna "Done" clickt

**Output pro Woche:** 3-4 fertige LinkedIn Posts + Instagram Stories + Blog-Grafik

---

### Workflow 4B: Tom Weber (Performance Marketing / Ads)

**Persona:** Performance Marketing Expert  
**Aufgaben:** Google Ads & LinkedIn Ads Setup, Performance Tracking  
**Tools:** Google Ads Manager, LinkedIn Campaign Manager, Analytics

#### Launch (Erste Woche)

**Aufgabe 1: Google Ads Campaign Setup**

1. Briefing von Anna:
   ```
   Google Ads Kampagne starten für CTFL v4.0
   Budget: €4.500 / 12 Wochen (€375/Woche)
   Zielgruppen: 
   - Keywords: "ISTQB", "QA Testing", "Tester Kurs", "Zertifikat"
   - Geo: Deutschland, Schweiz
   
   Landing Page: test-it-academy.com/ctfl-2026
   
   Target: 
   - 1000+ Klicks/Monat
   - CPC max €3.50
   - Conv. Rate 10%+
   
   Deadline: Mittwoch 01.04.2026 08:00 (Go-Live!)
   ```

2. Status: "In Progress"

3. Setup im Google Ads Manager:
   - Erstelle eine neue Campaign: "CTFL v4.0 Q2 2026"
   - Ad Groups: 
     - "CTFL für Jobsuchende"
     - "CTFL für Manager"
   - Schreib 5 unterschiedliche Ad-Copyies (A/B Testing)
   - Setze Landing Page Link
   - Tägliches Budget: €125 (€375/Woche ÷ 3)

4. Sobald Campaign live:
   - Copy den Campaign-Link
   - Back in die Task
   - Paste Link unter "Ressourcen Link"
   - Status: "In Review"

**Aufgabe 2: Performance Tracking (Wöchentlich)**

1. Briefing:
   ```
   Wöchentliches Ads-Performance-Report
   - Datum: Jeden Freitag 17:00
   - Metriken: Impressionen, Klicks, CTR, CPC, Conv.
   - Daten aus: Google Ads + LinkedIn Campaign Manager
   - Format: PNG-Screenshot + txt-Notizen
   ```

2. Routine:
   - Öffne Google Ads Dashboard
   - Screenshot machen der KPIs der letzten 7 Tage
   - Annotiere: "CPCs waren hoch diese Woche wegen Konkurrenz. Keywords anpassen empfohlen."
   - Save als `Google-Ads-Report-Woche-1.png`
   - Upload auf OneDrive
   - Link in Task eintragen
   - Status: "Done"

**Output:** Ad Kampagnen runnen 12 Wochen kontinuierlich, Tom reportet wöchentlich.

---

### Workflow 4C: Jana Klein (Community Support & E-Mail)

**Persona:** Community Support Specialist  
**Aufgaben:** E-Mail Sequenzen, Support-Tickets, Community Moderation  
**Tools:** Outlook, E-Mail Marketing Tool, Teams

#### E-Mail Sequence Design

1. Briefing von Anna:
   ```
   E-Mail Sequence für CTFL v4.0 Kampagne:
   
   Sequenz 1: Webinar-Anmeldung (Tag 1, 3, 7)
   - E-Mail 1: "Starte auf dem richtigen Fuß ins Testing"
   - E-Mail 2: "3 Gründe, warum CTFL v4.0 wichtig ist"
   - E-Mail 3: "Plätze werden knapp — jetzt anmelden!"
   
   Tone: Personal, Ermutigend, Nutzen-fokussiert
   Format: Text + CTA-Button (Link zu Webinar)
   
   Deadline: Mo 01.04.2026
   ```

2. Status: "In Progress"

3. Schreib die E-Mails:
   ```
   Subjekt E1: "Sarah, das ist deine erste Stunde als Tester! 🚀"
   
   Hallo Sarah,
   
   herzlich willkommen in der Welt des Software-Testings!
   
   Du fragst dich jetzt vielleicht: "Kann ich das wirklich, ohne zu programmieren?"
   
   Kurze Antwort: JA! 👍
   
   Mit dem ISTQB CTFL v4.0 Kurs von WAMOCON Academy hast du alles, was du brauchst:
   - Keine Programmierung erforderlich
   - 300+ Praxisübungen (mit unserem diTeLe Tool)
   - Akkreditierte Trainer (25 Jahre Erfahrung!)
   - In 45 Tagen fertig
   - Das anerkannte Zertifikat in der Hand
   
   Startdatum: 15. April 2026
   Webinar-Vortrag: Mi 10.04. um 19:00 (kostenlos)
   
   [👉 PLATZ RESERVIEREN]
   
   Fragen? Schreib mir einfach zurück!
   
   Viele Grüße,
   Jana
   WAMOCON Academy
   ```

4. E-Mail-Tool-Setup (Outlook/Mailchimp):
   - Importiere Lead-Liste
   - Konfiguriere Automation: Trigger "Webinar Anmeldung" → Sende E-Mail 1
   - Nach 3 Tagen: E-Mail 2
   - Nach 7 Tagen: E-Mail 3

5. Test-Send an sich selbst, dann an Anna
6. Status: "In Review"
7. Anna approved → Status: "Done" → Automation läuft!

**Output:** 1000+ Leads bekommen personalisierte E-Mail-Sequenzen über 12 Wochen.

---

## 5️⃣ Admin-Workflow: Monitoring & Strategic Adjustments

**⏱️ Dauer:** Wöchentlich (1-2 Std) | **Beteiligung:** Admin (Daniel)  
**Ziel:** System läuft smooth, strategische Anpassungen bei Bedarf

### Wöchentliche Überprüfung (Freitag Nachmittag)

1. **Login & Dashboard-Review:**
   - Welche KPIs sieht Daniel auf dem Dashboard?
   - Sind die Zielwerte für ROI, Conversions, etc. on-track?

2. **Positionierung überprüfen:**
   - Gehe zu `Unternehmen > Digitale Positionierung`
   - Stimmt die Tone-of-Voice noch mit den Inhalten überein?
   - Beispiel: "Tone sagt 'Ermutigend', aber LinkedIn Posts sind zu akademisch"
   - Falls ja: Kontaktiere Anna → "Briefing anpassen"

3. **Budget-Überwachung:**
   - Gehe zu `Budget & Controlling`
   - Ist das Ausgaben-Tempo ok?
   - Falls Overruns drohen: Warnt das System?

### Monatlich: Strategy Review mit Anna & Waleri

**Meeting: Monatliches Strategie-Sync (1.5 Std)**

1. **Anna präsentiert KPI-Report** (siehe Manager-Workflow)
   - Was läuft gut?
   - Was läuft nicht so gut?
   - Worauf justieren wir nach?

2. **Diskussion & Adjustments:**
   - Beispiel: "LinkedIn performa 3x besser als Google. Sollen wir Budget verschieben?"
   - Daniel (Admin) & Waleri diskutieren: "Ja, LinkedIn hat bessere Job-Matching. Verschiebe 20% von Google zu LinkedIn."
   - Anna updatet Budget-Allocation im System

3. **Team-Feedback einsammeln:**
   - Waleri (Trainer): "Die Leads sind super qualifiziert. Viele schaffen die Prüfung beim ersten Mal!"
   - Lisa: "E-Mail-Campaign performa besser wenn wir GIFs nutzen instead of statics"
   - Tom: "LinkedIn Ads mit Video-Creatives haben 40% bessere CTR"

4. **Content-Adjustments beschließen:**
   - "Nächste 4 Wochen: Mehr LinkedIn Posts mit Video. Weniger Text-Posts."
   - "Tim (Waleri) gibt uns 2 kurze Trainer-Videos für Testimonials"

### Am Ende (Kampagnen-Abschluss, Juni 2026)

1. **Final Report:**
   - Total Anmeldungen: 680 (Ziel war 500 ✅)
   - Total Conversions (bezahlte Kurse): 320
   - ROI: 3.2:1 (Ziel war 3:1 ✅)
   - Cost per Acquisition: €46.87 (sehr gut)

2. **Lessons Learned:**
   - "E-Mail war der Hammer-Kanal"
   - "LinkedIn Video-Content sollte Content-Fokus sein"
   - "Google Ads brauchte besseres Landing Page"

3. **Archivierung & Next Cycle:**
   - Kampagne wird in den "Completed" Status verschoben
   - Anna & Daniel planen die nächste Kampagne: "Q3 Advanced Testing Webinar"
   - Lernings werden genutzt ("E-Mail + Video fokussieren")

---

## 🎯 Zusammenfassung: Rollen auf einen Blick

| Rolle | Häufigste Aktivitäten | Zeitaufwand/Woche | Tools im System |
|---|---|---|---|
| **Admin (Daniel)** | Positionierung pflegen, User-Mgmt, Strategic Review | 4-6 Std | Positioning, Settings, Dashboard |
| **Manager (Anna)** | Kampagnen planen, Content-Briefing, Performance-Review | 15-20 Std | Campaigns, Content, Tasks, Budget |
| **Manager (Waleri)** | Training-Input, Webinar-Coaching, Community-Moderation | 8-10 Std | Tasks, Campaigns, Manual (Anleitung geben) |
| **Member (Lisa)** | Social Media Posts, Blog-Grafiken, Content-Produktion | 20-25 Std | Content-Kalender, Tasks (Production) |
| **Member (Tom)** | Ads-Setup & Optimization, Performance-Tracking | 15-20 Std | Tasks, Dashboard (KPIs), Budget (insights) |
| **Member (Jana)** | E-Mail-Sequenzen, Support-Tickets, Community | 12-18 Std | Tasks, Campaigns (E-Mail-Links), Manual |

---

## 📚 Cross-Workflow Dependencies

**Diese Workflows sind voneinander abhängig:**

```
Admin Setup (Tag 1-2)
    ↓
Manager Campaign Planning (Tag 3-7)
    ├─→ Persona Definition
    ├─→ 5-Phasen Journey Mapping
    ├─→ Content-Kalender Befüllung
    └─→ Task Delegation
          ↓
     Member Execution (Laufend)
          ├─→ Lisa: Content Production
          ├─→ Tom: Ads Setup & Tracking
          └─→ Jana: E-Mail & Support
               ↓
          Weekly Performance Review (Manager)
               ↓
          Monthly Strategy Sync (Admin + Manager + evtl. Members)
               ↓
          Campaign Adjustments & Content Optimization
```

---

## ✅ Checklist für einen erfolgreichen Campaign-Launch

**Tag 1 (Admin):**
- [ ] Positionierung komplettieren
- [ ] Kanäle & Touchpoints hinterlegen
- [ ] Team-Rollen assignen

**Tag 2 (Admin + Manager):**
- [ ] Kickoff-Besprechung
- [ ] Budget-Rahmen definieren
- [ ] High-Level-Strategie skizzieren

**Tag 3-7 (Manager):**
- [ ] Personas anlegen
- [ ] 5-Phasen Journey skizzieren
- [ ] Kampagne erstellen
- [ ] Content-Kalender (mit Aufgabenhüllen!)
- [ ] Task Briefs schreiben & delegieren

**Tag 8+ (Members):**
- [ ] In Progress gehen
- [ ] Content produzieren
- [ ] OneDrive Links eintragen
- [ ] Status aktualisieren
- [ ] Reviews einholen

**Ongoing (Manager + Admin):**
- [ ] Wöchentliche Performance Reviews
- [ ] Task Status Monitoring
- [ ] Budget-Kontrolle
- [ ] Monatliche Strategy Syncs

---

## 🔔 Benachrichtigungs-Workflow (Realtime)

Das Notification-System arbeitet ereignisbasiert und informiert Rollen in Echtzeit:

1. **Auslöser (Trigger):**
   - Task wird zugewiesen
   - Task-Status ändert sich
   - KI-Generierung ist abgeschlossen oder fehlerhaft
   - Kampagnenstatus ändert sich
   - Budget erreicht kritische Schwellwerte (>=80% / >=100%)
   - Content-Status ändert sich (z. B. ready, published)

2. **Erzeugung:**
   - Trigger erzeugt Eintrag in `notifications`
   - Notification enthält `type`, `priority`, `entity_id`, `action_url`, `recipient_user_id`

3. **Auslieferung:**
   - Supabase Realtime pusht Ereignis in aktive Clients
   - Bell-Badge im Header aktualisiert sich ohne Seiten-Refresh

4. **Nutzung im Alltag:**
   - Manager sehen sofort neue Team-Updates
   - Member bekommen direkte Hinweise bei Zuweisung und AI-Ergebnissen
   - Admins erhalten frühe Budget-Warnungen

### Beispiel-Szenario: Task-Delegation in Echtzeit

1. Anna (Manager) weist Lisa eine neue Aufgabe zu.
2. System erzeugt `task_assigned`-Notification für Lisa.
3. Lisa sieht sofort einen Badge an der Glocke.
4. Klick auf Notification öffnet direkt die Aufgabenansicht.
5. Nach Bearbeitung setzt Lisa den Status auf Review.
6. Anna erhält in Echtzeit `task_status_changed`.

### Beispiel-Szenario: Budget-Warnung

1. Kampagnenausgaben steigen auf 82%.
2. System erzeugt `budget_alert` mit Priority `high`.
3. Manager/Admin sehen orange markierte Warnung im Notification-Panel.
4. Bei 100%+ folgt eine `urgent`-Notification (rot hervorgehoben).

---

> **Hinweis:** Dieses Dokument zeigt ein ideales Szenario. Echte Kampagnen-Realities sind oft chaotischer — Deadlines verschieben sich, Budget ändert sich, Prioritäten rotieren. Das System ist aber so designt, dass auch Improvisation und Anpassung schnell im System abgebildet werden können.

**Letzte Aktualisierung:** 22.03.2026  
**Für:** Momentum v1.1.0
