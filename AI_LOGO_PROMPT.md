# 🎨 Momentum Logo Design Prompt für Gemini Nano Banana

> **Ziel:** Erstellung eines Logo-Designs + animierter Variante für "Momentum" SaaS-Plattform
> **Format:** Für Bildgenerierung und Animationskonzepte
> **Stand:** 10.03.2026

---

## 📋 Haupt-Prompt für Logo (Static)

```
Erstelle ein minimalistisches, modernes Logo für eine Marketing-SaaS-Plattform namens "Momentum".

DESIGN-SPEZIFIKATION:
─────────────────────

LOGO-KONZEPT: "The Nexus"
- Vier verbundene Punkte/Knoten, die ein Quadrat oder Gitter bilden
- Die Punkte sind durch dünne, präzise Linien verbunden
- Der Punkt oben links oder center könnte als "Lead-Punkt" in der Markenfarbe Rot (#c1292e) hervorgehoben sein
- Ausstrahlung: Stabilität, Vernetzung, Datenfluss, Zusammenhalt

FARBEN (exakt):
- Primär-Rot:        #c1292e (für einen Punkt oder die Linien als Accent)
- Neutral-Grau:      #6b7280 (für die restlichen Punkte und Linien)
- Optional Weiß:     #ffffff (für Negative Space und Untergrund)

STILRICHTUNG:
- Geometric, eckig, präzise (keine Rundungen oder organischen Formen)
- Minimalistisch — nur das Nötigste darstellen
- Modern, professional, tech-forward
- Selbsterklärend: Punkt-Vernetzung = Kampagnen verbinden, Daten fließen

GRÖSSENVERHÄLTNISSE & TECHNIK:
- Design sollte skalierbar sein (32x32px bis 512x512px)
- Stroke-Width: 2–3px für die Verbindungslinien (gut lesbar auch bei klein)
- Padding/Negativ-Space: Großzügig rund um die Netzwerk-Form
- Keine Anti-Aliasing-Probleme bei kleinen Größen

APPLIKATIONEN:
- Favicon (32x32px, weiß auf Rot-Grund, oder Rot-Icon auf White)
- Logo-Variante mit Text-Beistand: "Momentum" neben oder unter The Nexus (horizontal oder vertikal)
- Nur Icon-Variante: Die vier Punkte als alleinstehender Icon
- Inverted: Weiße Punkte auf Rot-Hintergrund für Header/Branding

REFERENZEN FÜR STIL:
- Ähnlich wie: Lucide Icons (schlank, 2px Stroke)
- Design-Philosophie von: Figma, Notion, Slack Logos (Einfachheit trifft Tech)
- Nicht zu: Aggressiv, zu playful, zu organisch, zu verspielt

OUTPUT:
- Hochauflösendes PNG/SVG des Logo (transparent background)
- Format: Square Canvas (1024x1024px minimum)
- Separate Varianten:
  1. Icon Only (quadratisch, Padding innen)
  2. Horizontal (Icon + Text "Momentum" rechts davon)
  3. Vertikal (Icon oben, Text "Momentum" unten)
  4. Inverted (Weiß auf Rot)
  5. Monochrom (Grau-Version für Print/B&W)
```

---

## 🎬 Prompt für Animierte Variante

```
Basierend auf dem statischen "Momentum Logo" (The Nexus — vier verbundene Punkte), 
erstelle eine animierte Version für folgende Anwendungsfälle:

ANIMATIONEN (CSS + SVG):
──────────────────────

1️⃣ LOADING-ANIMATION (Loop, ~2 Sekunden)
   ├─ Die Verbindungslinien zwischen den Punkten werden nacheinander "gezogen"
   ├─ Animation-Sequence:
   │  • Linie oben (Punkt links → Punkt rechts): 150ms
   │  • Linie rechts (Punkt oben-rechts → Punkt unten-rechts): 150ms
   │  • Linie unten (Punkt rechts → Punkt links): 150ms
   │  • Linie links (Punkt unten-links → Punkt oben-links): 150ms
   │  • Pause: 200ms
   │  • Dann Repeat
   ├─ Farbe während Animation: Rot (#c1292e) für die aktive Linie
   ├─ Idle-Farbe: Grau (#6b7280)
   └─ Effekt: Erzeugt das Gefühl von "Daten fließen durch das System"

2️⃣ SUCCESS-ANIMATION (One-time, ~600ms)
   ├─ Logo "pulst" subtil: Expand um 10%, dann Zurück
   ├─ Farbe ändert kurz zu Grün (#10b981)
   ├─ Subtiler Glow-Effekt um die Punkte
   ├─ Checkmark-Icon könnte fading dabei erscheinen
   └─ Timing: 300ms Expand, 300ms Contract + Fade-Out

3️⃣ ERROR-ANIMATION (One-time, ~400ms)
   ├─ Logo "wackelt" leicht (horizontal vibration)
   ├─ Amplitude: ±2–3px
   ├─ Farbe wird Rot (#ef4444)
   ├─ 4–5 schnelle Wackelbewegungen
   └─ Keine Glow, eher "scharfer" Eindruck

4️⃣ IDLE-ANIMATION (Subtil, Loop)
   ├─ Optionale subtile "breathing" Animation der Punkte
   ├─ Punkte skalieren leicht: 1.0 → 1.05 → 1.0 über 3 Sekunden
   ├─ Oder: Der zentrale Punkt rotiert leicht (z.B. ganze Form um 2°, dann zurück)
   ├─ Sehr subtil, nicht ablenkend
   └─ Timing: Smooth, cubic-bezier(0.4, 0, 0.2, 1)

5️⃣ HOVER-EFFECT (Interactive)
   ├─ Wenn Nutzer über das Logo hoverd:
   ├─ Alle vier Punkte skalieren leicht (1.0 → 1.1)
   ├─ Verbindungslinien werden Rot (#c1292e) statt Grau
   ├─ Subtiler Glow um das gesamte Logo
   ├─ Transition: 150ms smooth
   └─ Nutzen: Macht klar, dass Logo clickable ist (z.B. zu Home-Page)

TECHNISCHE ANFORDERUNGEN:
────────────────────────
Format: SVG mit eingebettetem CSS oder GSAP-Animationen
Export-Varianten:
  1. Pure CSS Keyframes (für einfaches Einbetten in HTML)
  2. SVG + inline CSS
  3. GSAP JavaScript (für komplexere Animationen)
  4. Lottie JSON (für universelle Kompatibilität)

Performance:
  • GPU-accelerated (transform, opacity, nicht width/height)
  • 60fps zielend
  • Kleine Datei-Größe (<50KB für SVG)

Browser-Kompatibilität:
  • Chrome, Firefox, Safari (letzte 2 Versionen)
  • Mobile-optimiert (kein Jank)

DOKUMENTATION:
  • Timing-Specs für jede Animation (Duration, Delay, Easing)
  • Code-Beispiele für Einbindung
  • Performance-Tipps
  • Farb-Override-Anleitung (z.B. Theme-Anpassungen)
```

---

## 🎯 Detaillierte technische Specs für Entwicklung

### Logo-Dimensionen & Export

```
EXPORT-FORMATE:
├─ SVG (Vektor, skalierbar) ← PRIMÄR für Web
├─ PNG 1024x1024px (High-Res für Social/Print)
├─ PNG 512x512px (Standard Web)
├─ PNG 256x256px (Tablet/iPad Icons)
├─ PNG 32x32px (Favicon)
├─ WebP (optimierte Web-Größe)
└─ PDF (für Print/Brand-Guidelines)

FARBVARIANTEN:
├─ Full Color (#c1292e Red + #6b7280 Gray)
├─ Monochrom Black (#1f2937)
├─ Monochrom White (#ffffff auf Transparent oder dunkel Grund)
├─ One Color Red (#c1292e only)
├─ One Color Gray (#6b7280 only)
└─ Inverted (Farben umkehren)

LOGO-LAYOUTS:
├─ Icon Only (Quadratisch 1:1, mit Padding 20–40px)
├─ Icon + Text Horizontal (16:9, Icon links, "Momentum" in Inter Bold rechts)
├─ Icon + Text Vertical (9:16, Icon oben, "Momentum" unten)
├─ Logo mit Tagline (Icon + "Momentum" + "Deine Kampagnen mit Momentum" kleiner darunter)
└─ Stacked (Icon mittig, großer Text darunter)

SPACING-RULES:
├─ Minimum clear space um Logo: 0.5x der Icon-Höhe
├─ Text-Abstand vom Icon: 1x Icon-Höhe
├─ Minimum Größe für Lesbarkeit: 32x32px
└─ Größe in Printmedien: Mindestens 2cm Breite
```

### CSS Animation Snippets (Reference)

```css
/* LOADING ANIMATION EXAMPLE */
@keyframes nexus-loading {
  0% {
    stroke-dasharray: 0 100;
    stroke: #6b7280;
  }
  25% {
    stroke-dasharray: 100 0;
    stroke: #c1292e;
  }
  50% {
    stroke-dasharray: 0 100;
    stroke: #6b7280;
  }
  100% {
    stroke-dasharray: 0 100;
    stroke: #6b7280;
  }
}

.nexus-logo-loading {
  animation: nexus-loading 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* SUCCESS PULSE */
@keyframes nexus-success {
  0% {
    transform: scale(1);
    color: #6b7280;
  }
  50% {
    transform: scale(1.1);
    color: #10b981;
  }
  100% {
    transform: scale(1);
    color: #10b981;
  }
}

.nexus-logo-success {
  animation: nexus-success 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 📝 Zusätz liche Design-Notizen

**Philosophie:**
- Das Logo sollte sofort "Vernetzung" und "Momentum" suggerieren
- Keine Text im Icon selbst (nur Icon as standalone)
- Gesamteindruck: Professional, Tech-Forward, Vertrauenswürdig
- Nicht zu spielerisch oder zu minimalistisch (Goldene Mitte)

**Brand-Kontext:**
- Momentum ist eine Marketing-Management SaaS-Plattform in Europa
- Zielgruppe: Marketing Manager, Content Creators, Finance-Controller (B2B)
- Tone: Direkt, Zielgerichtet, Intelligent, Befähigend
- Nutzer sind rational-entscheidungsfreudig, keine Spielerei gewünscht

**Langlebigkeit:**
- Design sollte zeitlos sein (nicht trendy)
- Sollte gut aussehen in:
  - Dark Mode & Light Mode
  - Klein (32px Favicon) & Groß (Plakate)
  - Print & Digital
  - Schwarz-Weiß & Farbe

---

## 🚀 Gewünschte Outputs summarized

1. **Static Logo** (5 Varianten: Icon, Horizontal, Vertikal, Inverted, B&W)
2. **Animated Loading** (SVG + CSS, Loop, 2s duration)
3. **Animated Success** (SVG + CSS, 600ms, Green Pulse)
4. **Animated Error** (SVG + CSS, 400ms, Red Vibration)
5. **Dokumentation** (Timing-Specs, Farb-Codes, Implementation Guide)
6. **Favicon Package** (32x32, 64x64, 128x128 für verschiedene Plattformen)

---

**💡 Hinweis für Gemini:**
Falls Du alternative Interpretationen haben möchtest (z.B. "Momentum" als Pfeil, oder als Welle), erwähne diese gerne als Secondary Designs. Das Primär-Ziel ist aber: The Nexus (vier verbundene Punkte) mit den spezifizierten Farben und Animationen.
