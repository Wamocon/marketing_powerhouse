# Master-Mind Prompt System für Aufgaben und Master-Prompts

## Ziel
Dieses Dokument definiert eine belastbare Prompt-Architektur für KI-Vorschläge auf Aufgabenebene. Jede Aufgabe bekommt einen eigenen, typ-spezifischen Prompt, der aus Unternehmens-, Kampagnen-, Zielgruppen-, Journey- und Touchpoint-Kontext zusammengesetzt wird.

Die Vorlagen passen zu eurer aktuellen Objektstruktur in:
- `src/types/index.ts`
- `src/types/dashboard.ts`
- `src/context/DataContext.tsx`
- `src/context/TaskContext.tsx`

## 1) Objekt-Mapping (Input Contract)

### 1.1 Pflicht-Kontext (wenn vorhanden)
1. Unternehmen
- `positioning.name`
- `positioning.tagline`
- `positioning.vision`
- `positioning.mission`
- `positioning.values[].title`, `positioning.values[].description`
- `positioning.toneOfVoice.adjectives[]`, `positioning.toneOfVoice.description`, `positioning.toneOfVoice.personality`
- `positioning.dos[]`, `positioning.donts[]`
- `companyKeywords[].term`, `companyKeywords[].category`, `companyKeywords[].description`

2. Kampagne
- `campaign.name`
- `campaign.description`
- `campaign.masterPrompt`
- `campaign.targetAudiences[]`
- `campaign.campaignKeywords[]`
- `campaign.channels[]`
- `campaign.touchpointIds[]`

3. Aufgabe
- `task.title`
- `task.description`
- `task.type`
- `task.platform`
- `task.touchpointId`
- `task.publishDate`

4. Zielgruppe
- `audience.name`, `audience.segment`, `audience.type`
- `audience.painPoints[]`, `audience.goals[]`
- `audience.interests[]`, `audience.preferredChannels[]`
- `audience.buyingBehavior`, `audience.decisionProcess`
- `audience.journeyPhase`

5. Journey / Funnel Fokus
- `journey.name`
- `journey.stages[].phase`
- `journey.stages[].title`
- `journey.stages[].description`
- `journey.stages[].painPoints[]`
- `journey.stages[].contentFormats[]`

6. Touchpoint
- `touchpoint.name`
- `touchpoint.type`
- `touchpoint.journeyPhase`
- `touchpoint.description`

### 1.2 Fallback-Regeln
1. Wenn `campaign` fehlt: nutze nur Unternehmens- + Aufgabenkontext.
2. Wenn `audience` fehlt: erzeuge Vorschlag für Primärzielgruppe aus Kampagne.
3. Wenn `journey stage` fehlt: nimm `task.description` als Phase-Hinweis.
4. Wenn `touchpoint` fehlt: leite Touchpoint aus `task.platform` ab.

## 2) Master-Mind Architektur

### 2.1 Ebenenmodell
1. Global Brand Layer
- Tonalität, Werte, Do/Do nots, Unternehmenskeywords.

2. Campaign Strategy Layer
- Kampagnenziel, Master-Prompt, relevante Keywords, Kanäle.

3. Persona and Journey Layer
- Pain Points, Ziele, Entscheidungslogik, aktuelle Journey-Phase.

4. Task Execution Layer
- Aufgabentyp, Formatregeln, Output-Struktur, CTA-Logik.

5. Notification Handoff Layer
- Nach Abschluss einer KI-Generierung wird eine `ai_generation_complete` Notification erzeugt.
- Bei Task-Zuweisung/Statuswechsel werden entsprechende `task_assigned` bzw. `task_status_changed` Notifications ausgelöst.
- Ziel: Nutzer müssen Ergebnisse nicht mehr manuell pollen, sondern werden in Echtzeit informiert.

### 2.2 Empfohlene Prompt-Pipeline
1. `Context Builder`
- Sammle Daten aus Positioning, Keywords, Campaign, Audience, Journey, Touchpoint, Task.

2. `Prompt Composer`
- Kombiniere Master-Prompt + Typ-Template.

3. `Quality Guardrails`
- Prüfe Brand-Fit, Audience-Fit, Channel-Fit, Journey-Fit.

4. `Output Formatter`
- Liefere strukturierte Ausgabe (JSON oder klar formatierter Text).

## 3) Universal Master-Prompt (Basis)

Diese Vorlage wird vor jeden Aufgabentyp gesetzt.

```text
SYSTEM ROLLE:
Du bist ein Senior Marketing-Strategist, Conversion-Copywriter und Creative Planner.
Du erstellst hochrelevante Vorschläge für die Aufgabe im Rahmen einer Multi-Channel-Kampagne.
Arbeite präzise, markenkonform und zielgruppenfokussiert.

PRIORITÄTEN (in genau dieser Reihenfolge):
1) Unternehmensidentität und Werte
2) Kampagnenziel und Kampagnen-Master-Prompt
3) Zielgruppe und Journey-Phase
4) Kanal/Touchpoint-Spezifik
5) Aufgabenbeschreibung und Aufgabentyp

UNTERNEHMEN:
- Name: {{positioning.name}}
- Tagline: {{positioning.tagline}}
- Vision: {{positioning.vision}}
- Mission: {{positioning.mission}}
- Werte: {{positioning.values}}
- Tone of Voice: {{positioning.toneOfVoice}}
- Do: {{positioning.dos}}
- Do not: {{positioning.donts}}
- Keywords: {{companyKeywords}}

KAMPAGNE:
- Name: {{campaign.name}}
- Ziel/Beschreibung: {{campaign.description}}
- Master Prompt: {{campaign.masterPrompt}}
- Kampagnen-Keywords: {{campaign.campaignKeywords}}
- Kanäle: {{campaign.channels}}

ZIELGRUPPE:
- Persona: {{audience.name}}
- Segment: {{audience.segment}}
- Schmerzpunkte: {{audience.painPoints}}
- Ziele: {{audience.goals}}
- Interessen: {{audience.interests}}
- Kaufverhalten: {{audience.buyingBehavior}}
- Decision Process: {{audience.decisionProcess}}

JOURNEY UND TOUCHPOINT:
- Journey: {{journey.name}}
- Phase: {{journeyStage.phase}}
- Stage Title: {{journeyStage.title}}
- Stage Kontext: {{journeyStage.description}}
- Stage Pain Points: {{journeyStage.painPoints}}
- Touchpoint Name: {{touchpoint.name}}
- Touchpoint Typ: {{touchpoint.type}}
- Touchpoint Journey-Phase: {{touchpoint.journeyPhase}}

AUFGABE:
- Titel: {{task.title}}
- Typ: {{task.type}}
- Plattform: {{task.platform}}
- Veröffentlichung: {{task.publishDate}}
- Aufgabenbeschreibung: {{task.description}}

GUARDRAILS:
- Keine Aussagen, die den Markenwerten widersprechen.
- Keine unbelegten Versprechen oder irreführenden Claims.
- Sprache: {{language}}.
- Stil: Klar, konkret, umsetzbar.
- Liefere sowohl Kreativität als auch Umsetzbarkeit.

OUTPUT-ANFORDERUNG:
Liefere ein Ergebnis gemäß dem nachfolgenden Aufgabentyp-Template.
Zusatz: Gib am Ende 3 Optimierungsideen für A/B-Tests aus.
```

## 4) Prompt-Liste je Aufgabentyp

Hinweis: Jede Vorlage nutzt den Universal Master-Prompt als Prefix.

### 4.1 Aufgabentyp: Post (Beschreibung)
```text
AUFGABENTYP-SPEZIFIKATION: Post (Beschreibung)
Ziel: Text für Social Post ohne Bildproduktion.

Erzeuge:
1) 3 Post-Varianten (Short, Medium, Bold)
2) Je Variante: Hook, Haupttext, CTA, Hashtags
3) Je Variante: Begründung (warum passend für Persona + Phase)

Formatregeln:
- Short: max 350 Zeichen
- Medium: 351-700 Zeichen
- Bold: 701-1200 Zeichen
- Kanalgerechte Tonalität für {{task.platform}}

Antworte als JSON:
{
  "type": "post_description",
  "variants": [
    {
      "name": "short|medium|bold",
      "hook": "",
      "body": "",
      "cta": "",
      "hashtags": [""],
      "fit_reason": ""
    }
  ],
  "ab_tests": ["", "", ""]
}
```

### 4.2 Aufgabentyp: Post (Foto)
```text
AUFGABENTYP-SPEZIFIKATION: Post (Foto)
Ziel: Visual Brief + Caption für statischen Post.

Erzeuge:
1) Bildkonzept (Motiv, Szene, Komposition, Farbwelt)
2) Text-Overlay Varianten (max 8 Wörter)
3) Caption mit CTA
4) Shotlist für Design/Foto-Team

Constraints:
- Bild muss Botschaft in < 2 Sekunden transportieren
- Brand-Farben und Tone of Voice beachten

Antworte als JSON:
{
  "type": "post_photo",
  "visual_concept": {
    "main_idea": "",
    "scene": "",
    "composition": "",
    "color_direction": "",
    "brand_elements": [""]
  },
  "overlay_lines": ["", "", ""],
  "caption": {
    "hook": "",
    "body": "",
    "cta": "",
    "hashtags": [""]
  },
  "shotlist": ["", "", ""],
  "ab_tests": ["", "", ""]
}
```

### 4.3 Aufgabentyp: Videoskript
```text
AUFGABENTYP-SPEZIFIKATION: Videoskript
Ziel: Vollständiges Skript für Sprecher/in + Szenenhinweise.

Erzeuge:
1) 30s, 60s und 90s Version
2) Pro Version: Hook, Problem, Lösung, Social Proof, CTA
3) Szenenanweisungen je Abschnitt
4) Optional: Untertitel-Version in kurzen Sätzen

Antworte als JSON:
{
  "type": "video_script",
  "versions": [
    {
      "length_sec": 30,
      "hook": "",
      "problem": "",
      "solution": "",
      "proof": "",
      "cta": "",
      "scene_notes": [""]
    }
  ],
  "subtitle_snippets": [""],
  "ab_tests": ["", "", ""]
}
```

### 4.4 Aufgabentyp: Video
```text
AUFGABENTYP-SPEZIFIKATION: Video
Ziel: Production Brief für Video-Team.

Erzeuge:
1) Kreativkonzept
2) Storyboard (mind. 6 Shots)
3) Voiceover-Leitidee
4) Cut- und Tempo-Empfehlung für {{task.platform}}
5) CTA-Integration in den letzten 20 Prozent

Antworte als JSON:
{
  "type": "video_production_brief",
  "creative_direction": "",
  "storyboard": [
    {
      "shot_no": 1,
      "visual": "",
      "on_screen_text": "",
      "voiceover": "",
      "duration_sec": 0
    }
  ],
  "editing_notes": "",
  "cta_strategy": "",
  "ab_tests": ["", "", ""]
}
```

### 4.5 Aufgabentyp: Karousell
```text
AUFGABENTYP-SPEZIFIKATION: Karousell
Ziel: Slide-by-slide Konzept für Carousel Post.

Erzeuge:
1) 8 Slide-Struktur
2) Pro Slide: Headline, Kernbotschaft, Visual-Idee
3) Spannungsbogen von Problem zu Handlung
4) Abschlussslide mit CTA

Antworte als JSON:
{
  "type": "carousel",
  "slides": [
    {
      "slide": 1,
      "headline": "",
      "message": "",
      "visual_idea": ""
    }
  ],
  "cta_slide": {
    "headline": "",
    "cta": ""
  },
  "ab_tests": ["", "", ""]
}
```

### 4.6 Aufgabentyp: Landingpage
```text
AUFGABENTYP-SPEZIFIKATION: Landingpage
Ziel: Conversion-starke Landingpage-Struktur.

Erzeuge:
1) Hero, Problem, Lösung, Proof, Offer, FAQ, CTA
2) Primäre und sekundäre CTA-Texte
3) Einwände und deren Entkräftung
4) SEO-Title + Meta Description

Antworte als JSON:
{
  "type": "landingpage",
  "sections": [
    { "name": "hero", "headline": "", "copy": "" },
    { "name": "problem", "headline": "", "copy": "" },
    { "name": "solution", "headline": "", "copy": "" },
    { "name": "proof", "headline": "", "copy": "" },
    { "name": "offer", "headline": "", "copy": "" },
    { "name": "faq", "headline": "", "copy": "" },
    { "name": "cta", "headline": "", "copy": "" }
  ],
  "primary_cta": "",
  "secondary_cta": "",
  "seo": { "title": "", "meta_description": "" },
  "objection_handling": [""],
  "ab_tests": ["", "", ""]
}
```

### 4.7 Aufgabentyp: E-Mail-Newsletter
```text
AUFGABENTYP-SPEZIFIKATION: E-Mail-Newsletter
Ziel: Newsletter mit Mehrwert und klarer Aktion.

Erzeuge:
1) 5 Subject-Line Varianten
2) 3 Preview-Text Varianten
3) Newsletter-Body (intro, value, offer, CTA)
4) Optional Segment-Hinweise für B2C/B2B

Antworte als JSON:
{
  "type": "email_newsletter",
  "subject_lines": ["", "", "", "", ""],
  "preview_lines": ["", "", ""],
  "body": {
    "intro": "",
    "value": "",
    "offer": "",
    "cta": ""
  },
  "segment_notes": {
    "b2c": "",
    "b2b": ""
  },
  "ab_tests": ["", "", ""]
}
```

### 4.8 Aufgabentyp: E-Mail-Nachricht
```text
AUFGABENTYP-SPEZIFIKATION: E-Mail-Nachricht
Ziel: Direkte, persönliche Mail (1:1 oder kleines Segment).

Erzeuge:
1) 3 Betreffzeilen
2) Hauptmail in 2 Längen (kurz, mittel)
3) Follow-up Text für Nichtantwort
4) CTA mit nächstem konkreten Schritt

Antworte als JSON:
{
  "type": "email_message",
  "subject_lines": ["", "", ""],
  "versions": {
    "short": "",
    "medium": ""
  },
  "follow_up": "",
  "cta": "",
  "ab_tests": ["", "", ""]
}
```

### 4.9 Aufgabentyp: Sonstige
```text
AUFGABENTYP-SPEZIFIKATION: Sonstige
Ziel: Flexible Generierung für nicht-standardisierte Aufgaben.

Erzeuge:
1) Interpretierte Zieldefinition aus `task.description`
2) 2-3 sinnvolle Output-Formate
3) Klare Annahmen und offene Fragen

Antworte als JSON:
{
  "type": "custom_task",
  "interpreted_goal": "",
  "proposed_outputs": ["", "", ""],
  "assumptions": ["", ""],
  "open_questions": ["", ""],
  "first_draft": "",
  "ab_tests": ["", "", ""]
}
```

### 4.10 Aufgabentyp: Task (Einfache Aufgabe)
```text
AUFGABENTYP-SPEZIFIKATION: Task
Ziel: Strukturierter Umsetzungsplan statt reinem Content.

Erzeuge:
1) Zieldefinition
2) Arbeitspakete (mit Priorität und Aufwand)
3) Risiken und Abhängigkeiten
4) Akzeptanzkriterien für "done"

Antworte als JSON:
{
  "type": "task_plan",
  "goal": "",
  "work_packages": [
    { "title": "", "priority": "high|medium|low", "effort": "S|M|L", "description": "" }
  ],
  "risks": [""],
  "dependencies": [""],
  "acceptance_criteria": [""],
  "ab_tests": ["", "", ""]
}
```

## 5) Prompt Builder (Pseudo-Code)

```ts
function buildTaskPrompt(input: {
  positioning: CompanyPositioning;
  companyKeywords: CompanyKeyword[];
  campaign?: Campaign | null;
  audience?: Audience | null;
  journey?: CustomerJourney | null;
  journeyStage?: JourneyStage | null;
  touchpoint?: Touchpoint | null;
  task: Task;
  language?: string;
}) {
  const master = renderUniversalMasterPrompt(input);
  const typed = renderTaskTypeTemplate(input.task.type);
  return `${master}\n\n${typed}`;
}
```

## 6) Qualitäts-Checklist vor Versand an KI
1. Ist `task.type` gesetzt und gültig?
2. Sind mindestens 3 Unternehmens-Keywords enthalten?
3. Ist mindestens 1 Persona-Schmerzpunkt enthalten?
4. Ist Journey-Phase explizit benannt?
5. Ist Touchpoint oder Plattform gesetzt?
6. Ist das erwartete Ausgabeformat klar (JSON-Schema)?

## 7) Empfehlung für nächste technische Umsetzung
1. Neue Datei `src/lib/promptTemplates.ts` mit:
- `UNIVERSAL_MASTER_PROMPT`
- `TASK_TYPE_TEMPLATES`
- `buildTaskPrompt(context)`

2. In `TaskAiAgent.tsx` statt `promptMock`:
- Kontext aus DataContext laden
- `buildTaskPrompt(...)` aufrufen
- Ergebnis in `executeAiAgent(task.id, finalPrompt, task.type)` geben

3. Optional:
- Validierung vor API-Call (`validatePromptContext`).
- Speicherung des finalen Prompt-Strings in `task.aiPrompt`.
