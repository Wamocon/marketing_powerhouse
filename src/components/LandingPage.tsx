'use client';

import { useEffect, useMemo } from 'react';
import Script from 'next/script';
import '@/styles/landing.css';
import { useLanguage, type AppLanguage } from '../context/LanguageContext';

/** Landing page text translations */
const L: Record<string, Record<AppLanguage, string>> = {
    navProblem: { de: 'Problem', en: 'Problem', tr: 'Sorun' },
    navWhy: { de: 'Warum Momentum', en: 'Why Momentum', tr: 'Neden Momentum' },
    navRoles: { de: 'Rollen', en: 'Roles', tr: 'Roller' },
    navFeatures: { de: 'Funktionen', en: 'Features', tr: 'Özellikler' },
    navTech: { de: 'Technik', en: 'Technology', tr: 'Teknoloji' },
    navFaq: { de: 'FAQ', en: 'FAQ', tr: 'SSS' },
    ctaStart: { de: 'Jetzt starten', en: 'Get started', tr: 'Hemen başla' },
    heroTag: { de: 'Marketing-OS für Teams', en: 'Marketing OS for teams', tr: 'Ekipler için pazarlama işletim sistemi' },
    heroTitle: { de: 'Deine Marketing-Kampagnen.<br/>Mit <span style="color:#c1292e;">Momentum</span>.', en: 'Your marketing campaigns.<br/>With <span style="color:#c1292e;">Momentum</span>.', tr: 'Pazarlama kampanyalarınız.<br/><span style="color:#c1292e;">Momentum</span> ile.' },
    heroSubtitle: { de: 'Multi-Tenancy SaaS-Plattform für Marketing-Teams. Kampagnen, Content, Budget und Zusammenarbeit in einer DSGVO-konformen europäischen Lösung.', en: 'Multi-tenancy SaaS platform for marketing teams. Campaigns, content, budget, and collaboration in one GDPR-compliant European solution.', tr: 'Pazarlama ekipleri için çok kiracılı SaaS platformu. Kampanyalar, içerik, bütçe ve iş birliği tek bir KVKK uyumlu Avrupa çözümünde.' },
    heroUsers: { de: 'Marketing-Profis vertrauen Momentum', en: 'Marketing professionals trust Momentum', tr: 'Pazarlama profesyonelleri Momentum\'a güveniyor' },
    problemTag: { de: 'Das Problem', en: 'The Problem', tr: 'Sorun' },
    problemTitle: { de: 'Marketing-Teams arbeiten im Chaos', en: 'Marketing teams work in chaos', tr: 'Pazarlama ekipleri kaos içinde çalışıyor' },
    problemSubtitle: { de: 'Verstreute Tools, fehlende Übersicht, keine zentrale Steuerung.', en: 'Scattered tools, no overview, no central control.', tr: 'Dağınık araçlar, genel bakış yok, merkezi kontrol yok.' },
    whyTag: { de: 'Warum Momentum', en: 'Why Momentum', tr: 'Neden Momentum' },
    whyTitle: { de: 'Eine Plattform. Alles im Griff.', en: 'One platform. Everything under control.', tr: 'Tek platform. Her şey kontrol altında.' },
    whySubtitle: { de: 'Momentum vereint alle Marketing-Prozesse in einem System.', en: 'Momentum unites all marketing processes in one system.', tr: 'Momentum tüm pazarlama süreçlerini tek bir sistemde birleştirir.' },
    rolesTag: { de: '4-Rollen-System', en: '4-role system', tr: '4 rollü sistem' },
    rolesTitle: { de: 'Jede Rolle sieht genau das Richtige', en: 'Every role sees exactly what they need', tr: 'Her rol tam olarak ihtiyacı olanı görür' },
    rolesSubtitle: { de: 'Granulare Berechtigungen für jedes Team-Mitglied.', en: 'Granular permissions for every team member.', tr: 'Her ekip üyesi için ayrıntılı izinler.' },
    featuresTag: { de: 'Alle Funktionen', en: 'All features', tr: 'Tüm özellikler' },
    featuresTitle: { de: 'Alles, was dein Marketing-Team braucht', en: 'Everything your marketing team needs', tr: 'Pazarlama ekibinizin ihtiyacı olan her şey' },
    featuresSubtitle: { de: 'Von Kampagnen-Management bis Budget-Controlling.', en: 'From campaign management to budget controlling.', tr: 'Kampanya yönetiminden bütçe kontrolüne.' },
    techTag: { de: 'Technik & Sicherheit', en: 'Technology & security', tr: 'Teknoloji & güvenlik' },
    techTitle: { de: 'Enterprise-Grade Technologie', en: 'Enterprise-grade technology', tr: 'Kurumsal düzey teknoloji' },
    techSubtitle: { de: 'Modern, sicher und skalierbar. Made in Europe.', en: 'Modern, secure, and scalable. Made in Europe.', tr: 'Modern, güvenli ve ölçeklenebilir. Avrupa\'da üretildi.' },
    faqTag: { de: 'FAQ', en: 'FAQ', tr: 'SSS' },
    faqTitle: { de: 'Häufige Fragen', en: 'Frequently asked questions', tr: 'Sık sorulan sorular' },
    footerDesc: { de: 'Multi-Tenancy Marketing-OS für Teams. DSGVO-konform, europäisch, sicher.', en: 'Multi-tenancy marketing OS for teams. GDPR-compliant, European, secure.', tr: 'Ekipler için çok kiracılı pazarlama işletim sistemi. KVKK uyumlu, Avrupalı, güvenli.' },
    footerProduct: { de: 'Produkt', en: 'Product', tr: 'Ürün' },
    footerLegal: { de: 'Rechtliches', en: 'Legal', tr: 'Yasal' },
    footerImprint: { de: 'Impressum', en: 'Legal notice', tr: 'Yasal Bildirim' },
    footerPrivacy: { de: 'Datenschutz', en: 'Privacy', tr: 'Gizlilik' },
    footerTerms: { de: 'AGB', en: 'Terms', tr: 'Koşullar' },
    footerRights: { de: 'Alle Rechte vorbehalten.', en: 'All rights reserved.', tr: 'Tüm hakları saklıdır.' },
    footerMade: { de: 'Mit ❤️ in Europa entwickelt', en: 'Made with ❤️ in Europe', tr: 'Avrupa\'da ❤️ ile geliştirildi' },
};

export default function LandingPage() {
    const { language } = useLanguage();

    // Prevent main app styles from bleeding into landing page
    useEffect(() => {
        document.body.classList.add('landing-page-body');
        return () => { document.body.classList.remove('landing-page-body'); };
    }, []);

    const html = useMemo(() => buildLandingHtml(language), [language]);

    return (
        <>
            <div className="landing-page" dangerouslySetInnerHTML={{ __html: html }} />
            <Script src="/landing-script.js" strategy="afterInteractive" />
        </>
    );
}

function t(key: string, lang: AppLanguage): string {
    return L[key]?.[lang] ?? L[key]?.de ?? key;
}

function buildLandingHtml(lang: AppLanguage): string {
    return LANDING_HTML_TEMPLATE
        .replace(/\{\{(\w+)\}\}/g, (_, key) => t(key, lang));
}

/* ═══════════════════════════════════════════════════════════════
   Landing Page HTML — converted from static landing page.
   Changes vs. original:
   - REMOVED: Demo notice banner, Live Demo section (iframe),
     demo login info, "Live Demo" nav links
   - MODIFIED: "Demo anfragen" → "Jetzt starten" → /login
   - ADDED: Legal page links in footer (Impressum, Datenschutz, AGB)
   - Nav top position adjusted (no demo banner offset)
   ═══════════════════════════════════════════════════════════════ */
const LANDING_HTML_TEMPLATE = `
<!-- SVG Icon Sprite -->
<svg class="hidden" xmlns="http://www.w3.org/2000/svg">
  <symbol id="i-target" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </symbol>
  <symbol id="i-zap" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </symbol>
  <symbol id="i-calendar" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </symbol>
  <symbol id="i-users" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </symbol>
  <symbol id="i-map" viewBox="0 0 24 24">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </symbol>
  <symbol id="i-trending" viewBox="0 0 24 24">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </symbol>
  <symbol id="i-bell" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </symbol>
  <symbol id="i-layout" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
  </symbol>
  <symbol id="i-check" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </symbol>
  <symbol id="i-shield" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </symbol>
  <symbol id="i-briefcase" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
  </symbol>
  <symbol id="i-user-cog" viewBox="0 0 24 24">
    <circle cx="9" cy="7" r="4"/>
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
    <circle cx="19" cy="11" r="2"/><path d="M19 8v1m0 4v1m-2.5-3.5l.7.7m3.6-3.6l.7.7m-5 2.8H18m4 0h-1m-2.5 2.5l-.7-.7m-3.6 3.6l-.7-.7"/>
  </symbol>
  <symbol id="i-clock" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </symbol>
  <symbol id="i-globe" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </symbol>
</svg>

<!-- Gradient Orbs -->
<div class="gradient-orbs" aria-hidden="true">
  <div class="orb orb--1"></div>
  <div class="orb orb--2"></div>
  <div class="orb orb--3"></div>
</div>

<!-- Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-400" id="nav">
  <div class="w-full max-w-[1100px] mx-auto px-5 md:px-10 flex items-center justify-between">
    <a href="/" class="hover:opacity-70 transition-opacity flex items-center gap-2"
      style="font-size:1.8rem;font-weight:900;letter-spacing:-1px;color:#c1292e;text-decoration:none;">
      MOMENTUM<span style="display:inline-block;font-size:.52rem;font-weight:800;letter-spacing:.10em;padding:2px 7px;border-radius:5px;background:rgba(245,158,11,.15);color:#d97706;border:1px solid rgba(245,158,11,.38);margin-left:9px;vertical-align:middle;line-height:1.5;">V2</span>
    </a>
    <div class="hidden md:flex items-center gap-4">
      <div class="nav-links-pill">
        <a href="#problem" class="nav-link" data-nav-section="problem">{{navProblem}}</a>
        <a href="#warum" class="nav-link" data-nav-section="warum">{{navWhy}}</a>
        <a href="#rollen" class="nav-link" data-nav-section="rollen">{{navRoles}}</a>
        <a href="#funktionen" class="nav-link" data-nav-section="funktionen">{{navFeatures}}</a>
        <a href="#technik" class="nav-link" data-nav-section="technik">{{navTech}}</a>
        <a href="#faq" class="nav-link" data-nav-section="faq">{{navFaq}}</a>
      </div>
      <a href="/login"
        style="display:inline-flex;align-items:center;gap:6px;padding:7px 16px;background:#c1292e;color:#fff;font-size:.75rem;font-weight:700;border-radius:10px;text-decoration:none;transition:all .2s ease;box-shadow:0 2px 12px rgba(193,41,46,.3);">
        Jetzt starten
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px;">
          <path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
    </div>
    <button class="nav-hamburger md:hidden" id="navHamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- Mobile Menu -->
<div id="mobileMenu" aria-hidden="true">
  <button style="position:absolute;top:18px;right:18px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.2rem;" onclick="closeMobileMenu()">&times;</button>
  <div class="mm-brand">MOMENTUM</div>
  <div class="mm-grid">
    <a href="#problem"    class="mm-link" onclick="closeMobileMenu()">{{navProblem}}</a>
    <a href="#warum"      class="mm-link" onclick="closeMobileMenu()">{{navWhy}}</a>
    <a href="#rollen"     class="mm-link" onclick="closeMobileMenu()">{{navRoles}}</a>
    <a href="#funktionen" class="mm-link" onclick="closeMobileMenu()">{{navFeatures}}</a>
    <a href="#technik"    class="mm-link" onclick="closeMobileMenu()">{{navTech}}</a>
    <a href="#faq"        class="mm-link" onclick="closeMobileMenu()">{{navFaq}}</a>
  </div>
  <div style="margin-top:2rem;">
    <a href="/login"
      style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:#c1292e;color:#fff;font-size:.9rem;font-weight:700;border-radius:12px;text-decoration:none;"
      onclick="closeMobileMenu()">{{ctaStart}}</a>
  </div>
</div>

<!-- ═══ 1. HERO SECTION ═══ -->
<section class="relative flex items-center justify-center overflow-hidden pt-[140px] pb-[160px]" id="hero">
  <canvas id="heroParticles" class="absolute inset-0 z-[1]"></canvas>
  <div class="absolute inset-0 z-0"
    style="background:radial-gradient(ellipse 70% 55% at 50% 40%,rgba(193,41,46,.07)0%,transparent 65%),radial-gradient(ellipse 50% 60% at 20% 80%,rgba(139,92,246,.04)0%,transparent 50%),radial-gradient(ellipse 45% 50% at 80% 25%,rgba(193,41,46,.05)0%,transparent 50%)">
  </div>
  <div class="absolute inset-0 z-0 opacity-[.06]"
    style="background-image:linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px);background-size:72px 72px;mask-image:radial-gradient(ellipse 60% 55% at 50% 50%,black 0%,transparent 70%)">
  </div>
  <div class="relative z-10 text-center max-w-[960px] px-5 w-full">
    <h1 class="reveal text-3xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-8" style="color:#111113;">
      Marketing ohne<br><span class="gradient-text">Blindflug.</span>
    </h1>
    <p class="reveal text-lg md:text-xl max-w-[620px] mx-auto leading-relaxed mb-12" style="color:#555558;">
      Verstreute Tools, verpasste Deadlines, kein Budget-Überblick. Momentum bringt Strategie, Content-Planung und Team-Collaboration in einen durchdachten, DSGVO-konformen Workflow.
    </p>
    <div class="reveal flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="/login"
        style="display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:#c1292e;color:#fff;font-size:.95rem;font-weight:700;border-radius:12px;text-decoration:none;transition:all .25s ease;box-shadow:0 4px 24px rgba(193,41,46,.4);">
        Jetzt starten
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;">
          <path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
      <a href="#funktionen"
        style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:rgba(0,0,0,.05);color:#111113;font-size:.95rem;font-weight:600;border-radius:12px;text-decoration:none;border:1px solid rgba(0,0,0,.12);transition:all .25s ease;">
        Alle Funktionen
      </a>
    </div>

    <!-- Hero Video -->
    <p class="reveal mt-20 text-xs font-semibold tracking-widest uppercase mb-5" style="color:rgba(0,0,0,.28);letter-spacing:.18em;">
      Momentum Marketing &middot; App-Vorschau
    </p>
    <div class="reveal hero-video-wrap">
      <div class="hero-video-container" id="heroVideoContainer">
        <video autoplay muted loop playsinline class="hero-video" id="heroVideo">
          <source src="/Momentum_Marketing_Video.mp4" type="video/mp4">
        </video>
        <div class="hero-replay-overlay" id="heroReplayOverlay" aria-hidden="true">
          <button type="button" class="hero-replay-btn" id="heroReplayBtn" aria-label="Erneut abspielen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            <span>Erneut abspielen</span>
          </button>
        </div>
        <div class="hero-video-controls">
          <button class="hero-video-btn" id="heroPlayBtn" aria-label="Play/Pause">
            <svg class="hero-video-icon hero-video-icon--pause" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
            <svg class="hero-video-icon hero-video-icon--play" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,4 20,12 6,20"/>
            </svg>
          </button>
          <button class="hero-video-btn" id="heroMuteBtn" aria-label="Ton an/aus">
            <svg class="hero-video-icon hero-video-icon--muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
              <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
            <svg class="hero-video-icon hero-video-icon--unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
              <path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="absolute bottom-0 left-0 right-0 h-[120px] z-20" style="background:linear-gradient(to bottom, transparent, #f5f5f7);"></div>
</section>

<!-- ═══ 2. PROBLEM SECTION ═══ -->
<section class="relative section-dark" id="problem" style="padding:7rem 0 6rem;margin-top:-2px;">
  <div class="max-w-[1100px] mx-auto px-5 md:px-10">
    <h2 class="reveal text-4xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6" style="color:#f0f0f2;">
      Marketing-Teams kämpfen<br><span style="color:#c1292e;">gegen ihre eigenen Werkzeuge</span>
    </h2>
    <p class="reveal text-lg max-w-[600px] leading-relaxed mb-16" style="color:#9a9aaa;">
      Durchschnittlich 12 verschiedene Tools, verpasste Deadlines und kein gemeinsamer Überblick über Budget und Performance — das ist der Alltag in den meisten Marketing-Teams.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
      <div class="reveal text-center p-8 rounded-2xl" style="background:rgba(193,41,46,.07);border:1px solid rgba(193,41,46,.25);">
        <span class="block text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-black leading-none mb-3 tabular-nums tracking-tighter" style="color:#c1292e;letter-spacing:-0.05em;" data-target="12" data-suffix="+ Tools">0</span>
        <span class="block text-lg font-semibold mb-1" style="color:#f0f0f2;">nutzt ein Team im Schnitt</span>
        <span class="block text-xs" style="color:#7a7a88;">Quelle: Gartner Martech Survey 2024</span>
      </div>
      <div class="reveal text-center p-8 rounded-2xl" style="background:rgba(193,41,46,.07);border:1px solid rgba(193,41,46,.25);">
        <span class="block text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-black leading-none mb-3 tabular-nums tracking-tighter" style="color:#c1292e;letter-spacing:-0.05em;" data-target="63" data-suffix="%">0</span>
        <span class="block text-lg font-semibold mb-1" style="color:#f0f0f2;">der Kampagnen werden verzögert</span>
        <span class="block text-xs" style="color:#7a7a88;">Quelle: Content Marketing Institute 2024</span>
      </div>
      <div class="reveal text-center p-8 rounded-2xl" style="background:rgba(193,41,46,.07);border:1px solid rgba(193,41,46,.25);">
        <span class="block text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-black leading-none mb-3 tabular-nums tracking-tighter" style="color:#c1292e;letter-spacing:-0.05em;" data-target="30" data-suffix="%">0</span>
        <span class="block text-lg font-semibold mb-1" style="color:#f0f0f2;">des Budgets geht durch Silos verloren</span>
        <span class="block text-xs" style="color:#7a7a88;">Quelle: McKinsey Marketing ROI Report 2023</span>
      </div>
    </div>
  </div>
</section>

<!-- "Momentum ändert das" Divider -->
<div style="background:#050508;padding:5rem 1rem;text-align:center;position:relative;overflow:hidden;">
  <div style="width:2px;height:90px;background:linear-gradient(to bottom,transparent,#c1292e);margin:0 auto 2.5rem;"></div>
  <h2 class="reveal text-3xl md:text-5xl font-black" style="color:#f0f0f2;">Momentum&nbsp;ändert das</h2>
  <p class="reveal text-base mt-4 max-w-[480px] mx-auto leading-relaxed" style="color:#9a9aaa;">
    Drei Kernprobleme. Eine Plattform. Gebaut für professionelle Marketing-Teams in Europa.
  </p>
  <div style="width:2px;height:90px;background:linear-gradient(to bottom,#c1292e,transparent);margin:2.5rem auto 0;"></div>
</div>

<!-- 3 Solution Cards -->
<section class="relative section-dark" style="padding:5rem 0 7rem;background:#050508;">
  <div class="max-w-[1100px] mx-auto px-5 md:px-10">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
      <div class="reveal p-7 rounded-2xl" style="background:rgba(193,41,46,.05);border:1px solid rgba(193,41,46,.22);display:flex;flex-direction:column;">
        <span class="block text-xs font-bold tracking-widest uppercase mb-4" style="color:#ef4444;">Planung</span>
        <h3 class="text-xl font-bold tracking-tight mb-3" style="color:#f0f0f2;">Alles in einem Workflow</h3>
        <p class="text-sm leading-relaxed mb-6" style="color:#7a7a88;">Von der Unternehmens-DNA über Customer Journey und Zielgruppen bis zur fertigen Kampagne — Momentum bündelt alle Planungsschritte in einem durchgängigen, strukturierten Prozess.</p>
        <div style="margin-top:auto;border-top:1px solid rgba(193,41,46,.18);padding-top:1rem;">
          <span class="text-sm font-bold" style="color:#ef4444;">&#10003;&ensp;Momentum macht es möglich.</span>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl" style="background:rgba(193,41,46,.05);border:1px solid rgba(193,41,46,.22);display:flex;flex-direction:column;">
        <span class="block text-xs font-bold tracking-widest uppercase mb-4" style="color:#ef4444;">Umsetzung</span>
        <h3 class="text-xl font-bold tracking-tight mb-3" style="color:#f0f0f2;">KI-gestützter Creative-Workflow</h3>
        <p class="text-sm leading-relaxed mb-6" style="color:#7a7a88;">90&nbsp;% des Content scheitert an fehlenden Briefings oder Abstimmungschaos. Der 10-stufige Creative-Workflow mit KI-Assistent begleitet jeden Inhalt von der Idee bis zur Veröffentlichung.</p>
        <div style="margin-top:auto;border-top:1px solid rgba(193,41,46,.18);padding-top:1rem;">
          <span class="text-sm font-bold" style="color:#ef4444;">&#10003;&ensp;Momentum macht es einfach.</span>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl" style="background:rgba(193,41,46,.05);border:1px solid rgba(193,41,46,.22);display:flex;flex-direction:column;">
        <span class="block text-xs font-bold tracking-widest uppercase mb-4" style="color:#ef4444;">Kontrolle</span>
        <h3 class="text-xl font-bold tracking-tight mb-3" style="color:#f0f0f2;">Echtes Budget-Tracking</h3>
        <p class="text-sm leading-relaxed mb-6" style="color:#7a7a88;">Wer zu spät trackt, verbrennt Budget. Momentum warnt automatisch bei 80&nbsp;%, 90&nbsp;% und bei Überschreitung — rollenbasiert, für jeden Manager sofort sichtbar.</p>
        <div style="margin-top:auto;border-top:1px solid rgba(193,41,46,.18);padding-top:1rem;">
          <span class="text-sm font-bold" style="color:#ef4444;">&#10003;&ensp;Momentum sichert das Budget.</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ 4. WHY MOMENTUM — Animated Roadmap ═══ -->
<section class="py-24 md:py-36 section-dark" id="warum" style="background:#050508;">
  <div class="max-w-[1100px] mx-auto px-5 md:px-10">
    <div class="text-center mb-20">
      <h2 class="reveal text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-5" style="color:#f0f0f2;">
        Sechs Schritte.<br>Ein durchgängiger Flow.
      </h2>
      <p class="reveal text-lg max-w-[620px] mx-auto leading-relaxed" style="color:#9999a1;">
        Von der Strategie bis zur Erfolgsmessung — Momentum begleitet jede Marketingentscheidung mit dem richtigen Werkzeug.
      </p>
    </div>
    <div class="rm" id="roadmapTimeline">
      <div class="rm__line" id="rmLine">
        <svg preserveAspectRatio="none" id="rmSvg">
          <defs>
            <linearGradient id="rmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#c1292e"/>
              <stop offset="100%" stop-color="#ef4444"/>
            </linearGradient>
          </defs>
          <path class="rm__line-bg" id="rmPathBg"/>
          <path class="rm__line-progress" id="rmPathFill"/>
        </svg>
        <div class="rm__line-glow" id="rmGlow"></div>
      </div>
      <!-- Step 1 -->
      <div class="rm__row" data-rm-progress="0.06">
        <div class="rm__cell"><div class="rm__card rm__card--l">
          <span class="rm__label">Strategie</span>
          <h3 class="rm__title">Digitale Positionierung</h3>
          <p class="rm__desc">Unternehmens-DNA, Vision, Mission und Tone of Voice zentral festhalten. Alle 5 Blöcke (DNA, Identität, Kommunikation, Keywords, Zielmarkt) in einer bearbeitbaren, teamweiten Quelle.</p>
          <div class="rm__tags"><span class="rm__tag">Unternehmens-DNA</span><span class="rm__tag">Tone of Voice</span><span class="rm__tag">Markenidentität</span></div>
        </div></div>
        <div class="rm__center"><div class="rm__branch rm__branch--l"></div><div class="rm__dot"></div></div>
        <div class="rm__cell rm__cell--hide"></div>
      </div>
      <!-- Step 2 -->
      <div class="rm__row" data-rm-progress="0.22">
        <div class="rm__cell rm__cell--hide"></div>
        <div class="rm__center"><div class="rm__branch rm__branch--r"></div><div class="rm__dot"></div></div>
        <div class="rm__cell"><div class="rm__card rm__card--r">
          <span class="rm__label">Zielgruppen</span>
          <h3 class="rm__title">Personas & Customer Journey</h3>
          <p class="rm__desc">B2B- und B2C-Personas mit Avatar, Demografie, Pain Points und Kaufverhalten anlegen. Das 5-Phasen-Modell (Awareness → Advocacy) und der ASIDAS-Funnel visualisieren den kompletten Weg zur Conversion.</p>
          <div class="rm__tags"><span class="rm__tag">Persona-Avatare</span><span class="rm__tag">5-Phasen-Journey</span><span class="rm__tag">ASIDAS-Funnel</span></div>
        </div></div>
      </div>
      <!-- Step 3 -->
      <div class="rm__row" data-rm-progress="0.38">
        <div class="rm__cell"><div class="rm__card rm__card--l">
          <span class="rm__label">Kampagnen</span>
          <h3 class="rm__title">Multi-Channel in 3 Schritten</h3>
          <p class="rm__desc">Kampagnen in drei Schritten aufbauen: Grunddaten &amp; Master-Prompt, Zielgruppen-Zuordnung, Kanal-Auswahl. Jede Kampagne kennt ihr Budget, ihre Touchpoints und ihr Team.</p>
          <div class="rm__tags"><span class="rm__tag">Master-Prompt</span><span class="rm__tag">Channel-Mapping</span><span class="rm__tag">Team-Zuweisung</span></div>
        </div></div>
        <div class="rm__center"><div class="rm__branch rm__branch--l"></div><div class="rm__dot"></div></div>
        <div class="rm__cell rm__cell--hide"></div>
      </div>
      <!-- Step 4 -->
      <div class="rm__row" data-rm-progress="0.54">
        <div class="rm__cell rm__cell--hide"></div>
        <div class="rm__center"><div class="rm__branch rm__branch--r"></div><div class="rm__dot"></div></div>
        <div class="rm__cell"><div class="rm__card rm__card--r">
          <span class="rm__label">Content</span>
          <h3 class="rm__title">Redaktionsplanung & Kalender</h3>
          <p class="rm__desc">Content im 6-stufigen Workflow (Idee → Planung → Produktion → Bereit → Eingeplant → Veröffentlicht) planen. Der Monatskalender zeigt Lücken und fehlende Aufgabenhüllen sofort an.</p>
          <div class="rm__tags"><span class="rm__tag">Monatskalender</span><span class="rm__tag">6-Stufen-Workflow</span><span class="rm__tag">Deadlines</span></div>
        </div></div>
      </div>
      <!-- Step 5 -->
      <div class="rm__row" data-rm-progress="0.70">
        <div class="rm__cell"><div class="rm__card rm__card--l">
          <span class="rm__label">Aufgaben & KI</span>
          <h3 class="rm__title">10-stufiger Creative-Workflow</h3>
          <p class="rm__desc">Jede Aufgabe durchläuft 10 Stufen: Entwurf → KI-Generierung → KI-Vorschlag → Review → Überarbeitung → Freigabe → Einplanung → Posting → Beobachtung → KI-Analyse. Der integrierte KI-Assistent unterstützt automatisch.</p>
          <div class="rm__tags"><span class="rm__tag">Kanban-Board</span><span class="rm__tag">KI-Assistent</span><span class="rm__tag">Briefing-Generator</span></div>
        </div></div>
        <div class="rm__center"><div class="rm__branch rm__branch--l"></div><div class="rm__dot"></div></div>
        <div class="rm__cell rm__cell--hide"></div>
      </div>
      <!-- Step 6 -->
      <div class="rm__row" data-rm-progress="0.88">
        <div class="rm__cell rm__cell--hide"></div>
        <div class="rm__center"><div class="rm__branch rm__branch--r"></div><div class="rm__dot"></div></div>
        <div class="rm__cell"><div class="rm__card rm__card--r">
          <span class="rm__label">Performance</span>
          <h3 class="rm__title">Budget & KPI-Controlling</h3>
          <p class="rm__desc">Plan vs. Ist in Echtzeit. Kanal-KPIs (Impressionen, Klicks, CTR, CPC, CPA) direkt in der Kampagnen-Detailansicht. Automatische Budget-Alerts bei 80&nbsp;%, 90&nbsp;% und Überschreitung — rollenbasiert zugestellt.</p>
          <div class="rm__tags"><span class="rm__tag">CSV-Export</span><span class="rm__tag">Kanal-KPIs</span><span class="rm__tag">Budget-Alerts</span></div>
        </div></div>
      </div>
      <div class="rm__end">
        <div class="rm__end-marker" id="rmEndDot">
          <div class="rm__end-ring">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <span class="rm__end-label">Und das ist erst Phase 1.</span>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="divider-gradient" style="background:linear-gradient(to bottom, #0f1117, #f5f5f7);"></div>

<!-- ═══ 5. ROLLEN SECTION ═══ -->
<section class="py-24 md:py-32" id="rollen" style="position:relative;overflow:hidden;">
  <div style="position:absolute;top:-140px;left:-140px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(193,41,46,.07) 0%,transparent 68%);pointer-events:none;"></div>
  <div class="max-w-[1100px] mx-auto px-5 md:px-10">
    <div class="text-center mb-16">
      <span class="reveal inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5" style="color:#c1292e;background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Rollenbasierter Zugriff</span>
      <h2 class="reveal text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-5">Vier Rollen.<br>Eine Plattform. <span style="display:inline-block;font-size:.5rem;font-weight:800;letter-spacing:.10em;padding:2px 8px;border-radius:5px;background:rgba(245,158,11,.15);color:#d97706;border:1px solid rgba(245,158,11,.38);vertical-align:middle;line-height:1.5;">V2</span></h2>
      <p class="reveal text-lg max-w-[620px] mx-auto leading-relaxed" style="color:#555558;">Jede Rolle sieht genau das, was sie braucht — nicht mehr, nicht weniger.</p>
    </div>
    <div class="grid grid-cols-1 gap-8">
      <!-- Super-Admin -->
      <div class="reveal rounded-2xl overflow-hidden" style="border:1.5px solid rgba(245,158,11,.30);box-shadow:0 12px 56px rgba(245,158,11,.10);background:linear-gradient(165deg,rgba(245,158,11,.04) 0%,#ffffff 50%);">
        <div class="px-8 py-6 flex items-center gap-5 role-header" style="background:linear-gradient(135deg,rgba(245,158,11,.12),rgba(245,158,11,.04));border-bottom:1px solid rgba(245,158,11,.15);">
          <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,rgba(245,158,11,.22),rgba(245,158,11,.08));border:1px solid rgba(245,158,11,.32);display:flex;align-items:center;justify-content:center;">
            <svg class="icon w-7 h-7" style="color:#f59e0b;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-user-cog"/></svg>
          </div>
          <div style="flex:1;">
            <div style="font-size:.62rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#f59e0b;margin-bottom:3px;display:flex;align-items:center;gap:8px;">Globale Ebene <span style="font-size:.58rem;font-weight:800;padding:1px 6px;border-radius:4px;background:rgba(245,158,11,.2);color:#d97706;border:1px solid rgba(245,158,11,.4);">V2 NEU</span></div>
            <h3 class="text-2xl font-bold">Super-Admin&nbsp;<span style="font-size:.85rem;font-weight:500;color:#555558;">(Plattform-Verwaltung)</span></h3>
          </div>
        </div>
        <div class="grid grid-cols-2" style="border-bottom:1px solid rgba(245,158,11,.10);">
          <div style="padding:10px 28px;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9a7a20;background:rgba(245,158,11,.03);">Vorher</div>
          <div style="padding:10px 28px;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#f59e0b;background:rgba(245,158,11,.04);border-left:2px solid rgba(245,158,11,.15);">Mit Momentum</div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(245,158,11,.08);">
          <div class="px-8 py-5" style="background:rgba(245,158,11,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;text-decoration-color:rgba(245,158,11,.3);">Kein übergreifender Zugriff auf mehrere Projekte gleichzeitig</span></div></div>
          <div class="px-8 py-5" style="background:linear-gradient(135deg,rgba(245,158,11,.055),rgba(245,158,11,.015));border-left:2px solid rgba(245,158,11,.22);"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#f59e0b;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>Super-Admin Panel</strong> — alle Projekte und Nutzer zentral auf einer globalen Ebene verwalten</span></div></div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(245,158,11,.08);">
          <div class="px-8 py-5" style="background:rgba(245,158,11,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;text-decoration-color:rgba(245,158,11,.3);">Rollenvergabe erfordert manuelle IT-Koordination pro Projekt</span></div></div>
          <div class="px-8 py-5" style="background:linear-gradient(135deg,rgba(245,158,11,.055),rgba(245,158,11,.015));border-left:2px solid rgba(245,158,11,.22);"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#f59e0b;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>Globales Rollen-Management</strong> — Nutzer Projekten direkt zuweisen und Rollen pro Projekt ändern</span></div></div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(245,158,11,.08);">
          <div class="px-8 py-5" style="background:rgba(245,158,11,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;text-decoration-color:rgba(245,158,11,.3);">Kein Multi-Tenancy — ein Tool, ein Team, ein Projekt</span></div></div>
          <div class="px-8 py-5" style="background:linear-gradient(135deg,rgba(245,158,11,.055),rgba(245,158,11,.015));border-left:2px solid rgba(245,158,11,.22);"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#f59e0b;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>Multi-Tenancy</strong> — mehrere unabhängige Projekte pro Nutzer mit vollständiger Datentrennung</span></div></div>
        </div>
      </div>
      <!-- Admin -->
      <div class="reveal rounded-2xl overflow-hidden" style="border:1.5px solid rgba(193,41,46,.22);box-shadow:0 12px 56px rgba(193,41,46,.09);background:linear-gradient(165deg,rgba(193,41,46,.035) 0%,#ffffff 50%);">
        <div class="px-8 py-6 flex items-center gap-5 role-header" style="background:linear-gradient(135deg,rgba(193,41,46,.11),rgba(193,41,46,.04));border-bottom:1px solid rgba(193,41,46,.14);">
          <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,rgba(193,41,46,.2),rgba(193,41,46,.08));border:1px solid rgba(193,41,46,.28);display:flex;align-items:center;justify-content:center;">
            <svg class="icon w-7 h-7" style="color:#c1292e;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-shield"/></svg>
          </div>
          <div>
            <div style="font-size:.62rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#c1292e;margin-bottom:3px;">Vollzugriff</div>
            <h3 class="text-2xl font-bold">Unternehmens-Admin&nbsp;<span style="font-size:.85rem;font-weight:500;color:#555558;">(Projekt-Ebene)</span></h3>
          </div>
        </div>
        <div class="grid grid-cols-2" style="border-bottom:1px solid rgba(193,41,46,.08);">
          <div style="padding:10px 28px;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#903020;background:rgba(193,41,46,.03);">Vorher</div>
          <div class="role-colhead--after" style="padding:10px 28px;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#c1292e;background:rgba(193,41,46,.04);border-left:2px solid rgba(193,41,46,.12);">Mit Momentum</div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(193,41,46,.08);">
          <div class="px-8 py-5" style="background:rgba(193,41,46,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;text-decoration-color:rgba(193,41,46,.3);">Positionierung und Brand-Vorgaben in Word-Dokumenten verteilt</span></div></div>
          <div class="role-after-row px-8 py-5" style="background:linear-gradient(135deg,rgba(193,41,46,.055),rgba(193,41,46,.015));border-left:2px solid rgba(193,41,46,.22);"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#c1292e;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>Digitale Positionierung</strong> — Alle 5 Blöcke zentral bearbeitbar, teamweit abrufbar</span></div></div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(193,41,46,.08);">
          <div class="px-8 py-5" style="background:rgba(193,41,46,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;text-decoration-color:rgba(193,41,46,.3);">Rollenvergabe per E-Mail und manuellem IT-Ticket</span></div></div>
          <div class="role-after-row px-8 py-5" style="background:linear-gradient(135deg,rgba(193,41,46,.055),rgba(193,41,46,.015));border-left:2px solid rgba(193,41,46,.22);"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#c1292e;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>User-Management direkt in den Einstellungen</strong> — Rollen per Dropdown zuweisen</span></div></div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(193,41,46,.08);">
          <div class="px-8 py-5" style="background:rgba(193,41,46,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;text-decoration-color:rgba(193,41,46,.3);">Kein Überblick, wer gerade woran arbeitet</span></div></div>
          <div class="role-after-row px-8 py-5" style="background:linear-gradient(135deg,rgba(193,41,46,.055),rgba(193,41,46,.015));border-left:2px solid rgba(193,41,46,.22);"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#c1292e;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>Admin-Dashboard</strong> — Aktivitäts-Feed, Kampagnenstatus und Team-Übersicht auf einen Blick</span></div></div>
        </div>
      </div>
      <!-- Manager + Member cards (kompakt) -->
      <div class="reveal rounded-2xl overflow-hidden role-card--manager">
        <div class="px-8 py-6 flex items-center gap-5 role-header" style="border-bottom:1px solid rgba(139,92,246,.14);">
          <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,rgba(139,92,246,.2),rgba(139,92,246,.08));border:1px solid rgba(139,92,246,.28);display:flex;align-items:center;justify-content:center;">
            <svg class="icon w-7 h-7" style="color:#8b5cf6;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-briefcase"/></svg>
          </div>
          <div>
            <div style="font-size:.62rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8b5cf6;margin-bottom:3px;">Kampagnen & Budget</div>
            <h3 class="text-2xl font-bold">Marketing Manager</h3>
          </div>
        </div>
        <div class="grid grid-cols-2" style="border-bottom:1px solid rgba(139,92,246,.08);">
          <div style="padding:10px 28px;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#5a4a8a;background:rgba(139,92,246,.03);">Vorher</div>
          <div class="role-colhead--after" style="padding:10px 28px;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Mit Momentum</div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(139,92,246,.08);">
          <div class="px-8 py-5" style="background:rgba(139,92,246,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;">Kampagnenstatus in 5 verschiedenen Tools abfragen</span></div></div>
          <div class="role-after-row px-8 py-5"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#8b5cf6;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>Kampagnen-Dashboard</strong> — Status, Budget und KPIs aller Kampagnen in einer Ansicht</span></div></div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(139,92,246,.08);">
          <div class="px-8 py-5" style="background:rgba(139,92,246,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;">Manuelle Excel-Tabelle für Budget-Tracking</span></div></div>
          <div class="role-after-row px-8 py-5"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#8b5cf6;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>Automatische Budget-Alerts</strong> — Benachrichtigungen bei 80&nbsp;%, 90&nbsp;% und Überschreitung</span></div></div>
        </div>
      </div>
      <div class="reveal rounded-2xl overflow-hidden role-card--member">
        <div class="px-8 py-6 flex items-center gap-5 role-header" style="border-bottom:1px solid rgba(20,184,166,.14);">
          <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,rgba(20,184,166,.2),rgba(20,184,166,.08));border:1px solid rgba(20,184,166,.28);display:flex;align-items:center;justify-content:center;">
            <svg class="icon w-7 h-7" style="color:#14b8a6;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-users"/></svg>
          </div>
          <div>
            <div style="font-size:.62rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#14b8a6;margin-bottom:3px;">Aufgaben & Content</div>
            <h3 class="text-2xl font-bold">Team-Member</h3>
          </div>
        </div>
        <div class="grid grid-cols-2" style="border-bottom:1px solid rgba(20,184,166,.08);">
          <div style="padding:10px 28px;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#3a7a72;background:rgba(20,184,166,.03);">Vorher</div>
          <div class="role-colhead--after" style="padding:10px 28px;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Mit Momentum</div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(20,184,166,.08);">
          <div class="px-8 py-5" style="background:rgba(20,184,166,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;">Aufgaben per E-Mail ohne klares Briefing</span></div></div>
          <div class="role-after-row px-8 py-5"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#14b8a6;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>Strukturiertes Briefing</strong> — Jede Aufgabe mit Kontext, Ziel, Kanal und KI-generiertem Briefing</span></div></div>
        </div>
        <div class="grid grid-cols-2" style="border-top:1px solid rgba(20,184,166,.08);">
          <div class="px-8 py-5" style="background:rgba(20,184,166,.02);"><div class="flex items-start gap-3"><svg width="15" height="15" viewBox="0 0 16 16" class="shrink-0 mt-0.5" style="color:#cc4444;"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="text-sm leading-relaxed" style="color:#999;text-decoration:line-through;">Status-Updates manuell per E-Mail oder Slack kommunizieren</span></div></div>
          <div class="role-after-row px-8 py-5"><div class="flex items-start gap-3"><svg class="icon w-5 h-5 shrink-0 mt-0.5" style="color:#14b8a6;fill:none;stroke:currentColor;stroke-width:2;"><use href="#i-check"/></svg><span class="text-sm leading-relaxed"><strong>Automatische Benachrichtigungen</strong> — Status-Änderungen erreichen Manager &amp; Assignee sofort</span></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ 6. FEATURES SECTION ═══ -->
<section class="py-24 md:py-36 text-center section-alt section-glow" id="funktionen">
  <div class="max-w-[1100px] mx-auto px-5 md:px-10">
    <span class="reveal inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded mb-4" style="color:#c1292e;background:rgba(193,41,46,.06);">Funktionen</span>
    <h2 class="reveal text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-5">Alles, was das<br>Marketing-Team braucht</h2>
    <p class="reveal text-lg max-w-[620px] mx-auto leading-relaxed" style="color:#555558;">Neun Kernbereiche. Vollständig integriert. Keine Insellösungen.</p>
    <div class="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="reveal p-7 rounded-2xl bg-white border text-left card-hover accent-hover" style="position:relative;overflow:hidden;border-color:rgba(0,0,0,.08);">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.18);color:#c1292e;">
            <svg class="icon w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><use href="#i-target"/></svg>
          </div>
          <div><h3 class="font-semibold text-lg mb-1">Kampagnen-Management</h3><p class="text-sm leading-relaxed" style="color:#555558;">Multi-Channel Kampagnen in 3 Schritten aufbauen: Master-Prompt, Zielgruppen-Zuordnung, Touchpoint-Auswahl.</p></div>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl bg-white border text-left card-hover accent-hover" style="position:relative;overflow:hidden;border-color:rgba(0,0,0,.08);">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.18);color:#c1292e;">
            <svg class="icon w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><use href="#i-map"/></svg>
          </div>
          <div><h3 class="font-semibold text-lg mb-1">Customer Journey & ASIDAS</h3><p class="text-sm leading-relaxed" style="color:#555558;">5-Phasen-Modell (Awareness → Advocacy) und ASIDAS-Funnel als alternative Analyse-Sicht.</p></div>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl bg-white border text-left card-hover accent-hover" style="position:relative;overflow:hidden;border-color:rgba(0,0,0,.08);">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.18);color:#c1292e;">
            <svg class="icon w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><use href="#i-calendar"/></svg>
          </div>
          <div><h3 class="font-semibold text-lg mb-1">Content-Kalender</h3><p class="text-sm leading-relaxed" style="color:#555558;">Monatsansicht und Listenansicht, farbcodiert nach Content-Typ. 6-stufiger Status-Workflow.</p></div>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl bg-white border text-left card-hover accent-hover" style="position:relative;overflow:hidden;border-color:rgba(0,0,0,.08);">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.18);color:#c1292e;">
            <svg class="icon w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><use href="#i-users"/></svg>
          </div>
          <div><h3 class="font-semibold text-lg mb-1">Zielgruppen & Personas</h3><p class="text-sm leading-relaxed" style="color:#555558;">B2B/B2C-Personas mit Avatar, Demografie, Pain Points, Zielen und Journey-Phasen.</p></div>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl bg-white border text-left card-hover accent-hover" style="position:relative;overflow:hidden;border-color:rgba(0,0,0,.08);">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.18);color:#c1292e;">
            <svg class="icon w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><use href="#i-layout"/></svg>
          </div>
          <div><h3 class="font-semibold text-lg mb-1">Aufgaben & Kanban-Board</h3><p class="text-sm leading-relaxed" style="color:#555558;">Globales Kanban mit 5 Spalten. 10-stufiger Creative-Workflow mit KI-Assistent.</p></div>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl bg-white border text-left card-hover accent-hover" style="position:relative;overflow:hidden;border-color:rgba(0,0,0,.08);">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.18);color:#c1292e;">
            <svg class="icon w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><use href="#i-trending"/></svg>
          </div>
          <div><h3 class="font-semibold text-lg mb-1">Budget & Controlling</h3><p class="text-sm leading-relaxed" style="color:#555558;">Plan-Ist-Vergleich, Kanal-KPIs (CTR, CPC, CPA). CSV-Export. Automatische Budget-Alerts.</p></div>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl bg-white border text-left card-hover accent-hover" style="position:relative;overflow:hidden;border-color:rgba(0,0,0,.08);">
        <div style="position:absolute;top:12px;right:12px;font-size:.58rem;font-weight:800;letter-spacing:.08em;padding:2px 7px;border-radius:4px;background:rgba(245,158,11,.13);color:#d97706;border:1px solid rgba(245,158,11,.33);">V2 NEU</div>
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.18);color:#c1292e;">
            <svg class="icon w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><use href="#i-bell"/></svg>
          </div>
          <div><h3 class="font-semibold text-lg mb-1">Benachrichtigungssystem</h3><p class="text-sm leading-relaxed" style="color:#555558;">27 Notification-Typen mit 4 Prioritätsstufen. Rollenbasierte Zustellung.</p></div>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl bg-white border text-left card-hover accent-hover" style="position:relative;overflow:hidden;border-color:rgba(0,0,0,.08);">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.18);color:#c1292e;">
            <svg class="icon w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><use href="#i-globe"/></svg>
          </div>
          <div><h3 class="font-semibold text-lg mb-1">Digitale Positionierung</h3><p class="text-sm leading-relaxed" style="color:#555558;">Unternehmens-DNA, Vision & Mission, Tone-of-Voice, Keywords, Zielmarkt.</p></div>
        </div>
      </div>
      <div class="reveal p-7 rounded-2xl text-left card-hover" style="position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(245,158,11,.04) 0%,#ffffff 60%);border:1px solid rgba(245,158,11,.22);">
        <div style="position:absolute;top:12px;right:12px;font-size:.58rem;font-weight:800;letter-spacing:.08em;padding:2px 7px;border-radius:4px;background:rgba(245,158,11,.15);color:#d97706;border:1px solid rgba(245,158,11,.35);">V2 NEU</div>
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.22);color:#f59e0b;">
            <svg class="icon w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><use href="#i-user-cog"/></svg>
          </div>
          <div><h3 class="font-semibold text-lg mb-1">Multi-Tenancy & Super-Admin</h3><p class="text-sm leading-relaxed" style="color:#555558;">Mehrere unabhängige Projekte pro Nutzer. Super-Admin Panel zur globalen Verwaltung.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ 7. TECH STACK ═══ -->
<div class="divider-gradient" style="background:linear-gradient(to bottom, #eeeef0, #f5f5f7);"></div>
<section class="py-20" id="technik">
  <div class="max-w-[1100px] mx-auto px-5 md:px-10 text-center mb-10">
    <span class="reveal inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded mb-4" style="color:#c1292e;background:rgba(193,41,46,.06);">Tech Stack</span>
    <h2 class="reveal text-2xl md:text-4xl font-bold tracking-tight">Gebaut auf modernen, europäischen Technologien</h2>
    <p class="reveal text-base mt-3 max-w-[520px] mx-auto" style="color:#555558;">Next.js 16, Supabase PostgreSQL in der EU, TypeScript Strict Mode — kein Vendor Lock-in.</p>
  </div>
  <div class="marquee">
    <div class="marquee__track">
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Next.js 16</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">React 19</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">TypeScript & Strict Mode</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Tailwind CSS v4</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Supabase PostgreSQL</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">EU Hosting (eu-central-1)</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Recharts</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Lucide React</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">RBAC</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">DSGVO-konform</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">KI-Assistent</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Turbopack</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.30);color:#d97706;font-weight:700;">Supabase Realtime ✨ V2</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.30);color:#d97706;font-weight:700;">Multi-Tenancy ✨ V2</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Next.js 16</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">React 19</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">TypeScript & Strict Mode</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Tailwind CSS v4</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Supabase PostgreSQL</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">EU Hosting (eu-central-1)</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Recharts</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Lucide React</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">RBAC</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">DSGVO-konform</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">KI-Assistent</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">Turbopack</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.30);color:#d97706;font-weight:700;">Supabase Realtime ✨ V2</div>
      <div class="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.30);color:#d97706;font-weight:700;">Multi-Tenancy ✨ V2</div>
    </div>
  </div>
  <div class="max-w-[1100px] mx-auto px-5 md:px-10 mt-14">
    <div class="reveal grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-6 rounded-2xl text-center" style="background:#ffffff;border:1px solid rgba(0,0,0,.08);">
        <div class="text-3xl font-black tracking-tight mb-1" style="color:#c1292e;">19</div>
        <div class="text-sm font-semibold mb-1">Datenbank-Tabellen <span style="font-size:.55rem;font-weight:800;padding:1px 5px;border-radius:3px;background:rgba(245,158,11,.15);color:#d97706;border:1px solid rgba(245,158,11,.35);">V2</span></div>
        <div class="text-xs" style="color:#555558;">Supabase PostgreSQL, RLS aktiviert</div>
      </div>
      <div class="p-6 rounded-2xl text-center" style="background:#ffffff;border:1px solid rgba(0,0,0,.08);">
        <div class="text-3xl font-black tracking-tight mb-1" style="color:#c1292e;">19</div>
        <div class="text-sm font-semibold mb-1">Berechtigungen (RBAC) <span style="font-size:.55rem;font-weight:800;padding:1px 5px;border-radius:3px;background:rgba(245,158,11,.15);color:#d97706;border:1px solid rgba(245,158,11,.35);">V2</span></div>
        <div class="text-xs" style="color:#555558;">Granulare Rollen-Matrix für 4 Rollen</div>
      </div>
      <div class="p-6 rounded-2xl text-center" style="background:#ffffff;border:1px solid rgba(0,0,0,.08);">
        <div class="text-3xl font-black tracking-tight mb-1" style="color:#c1292e;">27</div>
        <div class="text-sm font-semibold mb-1">Notification-Typen</div>
        <div class="text-xs" style="color:#555558;">Rollenbasierte Zustellung mit 4 Prioritätsstufen</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ 8. FAQ SECTION ═══ -->
<section class="py-24 md:py-32" id="faq">
  <div class="max-w-[720px] mx-auto px-5 md:px-10">
    <div class="text-center mb-14">
      <span class="reveal inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5" style="color:#c1292e;background:rgba(193,41,46,.06);border:1px solid rgba(193,41,46,.14);">FAQ</span>
      <h2 class="reveal text-3xl md:text-5xl font-bold tracking-tight mb-5">Häufige Fragen</h2>
    </div>
    <div id="faqList">
      <div class="faq-item"><button class="faq-question flex items-center gap-4 w-full text-left py-5 px-2 cursor-pointer bg-transparent border-0" style="font-family:inherit;"><span style="font-size:.7rem;font-weight:700;letter-spacing:.09em;color:#c1292e;opacity:.8;min-width:26px;padding-top:3px;flex-shrink:0;">01</span><span class="flex-1 font-semibold text-base">Für welche Unternehmen ist Momentum geeignet?</span><span class="faq-question__icon relative w-5 h-5 shrink-0"></span></button><div class="faq-answer"><div class="pb-5 px-2 pl-12 text-sm leading-relaxed" style="color:#555558;">Momentum richtet sich an Marketing-Teams in KMUs und mittleren bis großen Unternehmen (5–500 Mitarbeiter), die ihre Kampagnen-Orchestrierung professionalisieren wollen.</div></div></div>
      <div class="faq-item"><button class="faq-question flex items-center gap-4 w-full text-left py-5 px-2 cursor-pointer bg-transparent border-0" style="font-family:inherit;"><span style="font-size:.7rem;font-weight:700;letter-spacing:.09em;color:#c1292e;opacity:.8;min-width:26px;padding-top:3px;flex-shrink:0;">02</span><span class="flex-1 font-semibold text-base">Wie unterscheidet sich Momentum von HubSpot?</span><span class="faq-question__icon relative w-5 h-5 shrink-0"></span></button><div class="faq-answer"><div class="pb-5 px-2 pl-12 text-sm leading-relaxed" style="color:#555558;">Momentum ist kein CRM und kein Marketing Automation Tool. Es ist die Schaltzentrale für die interne Teamorganisation: Strategie, Planung, Rollenzuweisung und Creative-Workflow in einem durchgängigen Prozess.</div></div></div>
      <div class="faq-item"><button class="faq-question flex items-center gap-4 w-full text-left py-5 px-2 cursor-pointer bg-transparent border-0" style="font-family:inherit;"><span style="font-size:.7rem;font-weight:700;letter-spacing:.09em;color:#c1292e;opacity:.8;min-width:26px;padding-top:3px;flex-shrink:0;">03</span><span class="flex-1 font-semibold text-base">Welche Rollen gibt es?</span><span class="faq-question__icon relative w-5 h-5 shrink-0"></span></button><div class="faq-answer"><div class="pb-5 px-2 pl-12 text-sm leading-relaxed" style="color:#555558;"><strong>Super-Admin</strong> — globaler Zugriff. <strong>Unternehmens-Admin</strong> — Vollzugriff pro Projekt. <strong>Manager</strong> — Kampagnen, Budget, Team-Koordination. <strong>Member</strong> — eigene Aufgaben, Content-Produktion. 19 granulare Berechtigungen.</div></div></div>
      <div class="faq-item"><button class="faq-question flex items-center gap-4 w-full text-left py-5 px-2 cursor-pointer bg-transparent border-0" style="font-family:inherit;"><span style="font-size:.7rem;font-weight:700;letter-spacing:.09em;color:#c1292e;opacity:.8;min-width:26px;padding-top:3px;flex-shrink:0;">04</span><span class="flex-1 font-semibold text-base">Wie funktioniert der KI-Assistent?</span><span class="faq-question__icon relative w-5 h-5 shrink-0"></span></button><div class="faq-answer"><div class="pb-5 px-2 pl-12 text-sm leading-relaxed" style="color:#555558;">Der KI-Assistent generiert automatisch ein strukturiertes Briefing basierend auf Kampagnen-Kontext, Zielgruppen-Profil und Touchpoint. Der 10-stufige Creative-Workflow wird dadurch erheblich beschleunigt.</div></div></div>
      <div class="faq-item"><button class="faq-question flex items-center gap-4 w-full text-left py-5 px-2 cursor-pointer bg-transparent border-0" style="font-family:inherit;"><span style="font-size:.7rem;font-weight:700;letter-spacing:.09em;color:#c1292e;opacity:.8;min-width:26px;padding-top:3px;flex-shrink:0;">05</span><span class="flex-1 font-semibold text-base">Ist Momentum DSGVO-konform?</span><span class="faq-question__icon relative w-5 h-5 shrink-0"></span></button><div class="faq-answer"><div class="pb-5 px-2 pl-12 text-sm leading-relaxed" style="color:#555558;">Ja. Alle Daten werden in EU-Rechenzentren (eu-central-1) via Supabase PostgreSQL gespeichert. Row Level Security auf allen 19 Tabellen aktiviert. Keine Weitergabe an Dritte.</div></div></div>
      <div class="faq-item"><button class="faq-question flex items-center gap-4 w-full text-left py-5 px-2 cursor-pointer bg-transparent border-0" style="font-family:inherit;"><span style="font-size:.7rem;font-weight:700;letter-spacing:.09em;color:#c1292e;opacity:.8;min-width:26px;padding-top:3px;flex-shrink:0;">06</span><span class="flex-1 font-semibold text-base">Was ist Multi-Tenancy?</span><span class="faq-question__icon relative w-5 h-5 shrink-0"></span></button><div class="faq-answer"><div class="pb-5 px-2 pl-12 text-sm leading-relaxed" style="color:#555558;">Ein Nutzer kann mehreren unabhängigen Projekten angehören — mit vollständiger Datentrennung. Ideal für Agenturen mit mehreren Kunden oder Unternehmen mit mehreren Marken.</div></div></div>
      <div class="faq-item"><button class="faq-question flex items-center gap-4 w-full text-left py-5 px-2 cursor-pointer bg-transparent border-0" style="font-family:inherit;"><span style="font-size:.7rem;font-weight:700;letter-spacing:.09em;color:#c1292e;opacity:.8;min-width:26px;padding-top:3px;flex-shrink:0;">07</span><span class="flex-1 font-semibold text-base">Was kostet Momentum?</span><span class="faq-question__icon relative w-5 h-5 shrink-0"></span></button><div class="faq-answer"><div class="pb-5 px-2 pl-12 text-sm leading-relaxed" style="color:#555558;">Kontaktieren Sie uns für ein individuelles Angebot. Der Preis richtet sich nach Anzahl der Nutzer und gewünschten Integrationen.</div></div></div>
    </div>
  </div>
</section>

<!-- ═══ 9. CTA SECTION ═══ -->
<section class="section-dark py-24 md:py-32" style="background:#050508;">
  <div class="max-w-[700px] mx-auto px-5 md:px-10 text-center">
    <h2 class="reveal text-3xl md:text-5xl font-black leading-[1.05] tracking-tight mb-6" style="color:#f0f0f2;">
      Bereit für Marketing<br><span style="color:#c1292e;">mit echtem Momentum?</span>
    </h2>
    <p class="reveal text-lg leading-relaxed mb-10" style="color:#9a9aaa;">
      Lassen Sie uns in einem kurzen Gespräch zeigen, wie Momentum Ihr Team koordiniert, Ihre Kampagnen strukturiert und Ihr Budget schützt.
    </p>
    <div class="reveal flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="/login"
        style="display:inline-flex;align-items:center;gap:8px;padding:16px 36px;background:#c1292e;color:#fff;font-size:1rem;font-weight:700;border-radius:14px;text-decoration:none;transition:all .25s ease;box-shadow:0 4px 24px rgba(193,41,46,.3);">
        Jetzt starten
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;">
          <path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
    </div>
    <p class="reveal mt-8 text-sm" style="color:#5a5a62;">
      Erstellen Sie Ihr Konto kostenlos und starten Sie sofort mit Ihrem ersten Projekt.
    </p>
  </div>
</section>

<!-- ═══ 10. FOOTER ═══ -->
<footer style="background:#0a0a0c;padding:3rem 0 2rem;border-top:1px solid rgba(255,255,255,.06);">
  <div class="max-w-[1100px] mx-auto px-5 md:px-10">
    <div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
      <div class="text-center md:text-left">
        <span style="font-size:1.6rem;font-weight:900;letter-spacing:-1px;color:#c1292e;">MOMENTUM</span>
        <p style="color:#6e6e76;font-size:.8rem;margin-top:.5rem;max-width:240px;line-height:1.6;">Deine Marketing-Kampagnen mit Momentum. SaaS-Plattform für strategische Marketing-Teams.</p>
      </div>
      <div class="grid grid-cols-2 gap-x-12 gap-y-2 text-sm" style="color:#6e6e76;">
        <a href="#problem" style="color:#6e6e76;text-decoration:none;transition:color .2s;">Problem</a>
        <a href="#funktionen" style="color:#6e6e76;text-decoration:none;transition:color .2s;">Funktionen</a>
        <a href="#warum" style="color:#6e6e76;text-decoration:none;transition:color .2s;">Warum Momentum</a>
        <a href="#technik" style="color:#6e6e76;text-decoration:none;transition:color .2s;">Technik</a>
        <a href="#rollen" style="color:#6e6e76;text-decoration:none;transition:color .2s;">Rollen</a>
        <a href="#faq" style="color:#6e6e76;text-decoration:none;transition:color .2s;">FAQ</a>
        <a href="/login" style="color:#c1292e;text-decoration:none;transition:color .2s;font-weight:600;">Jetzt starten</a>
      </div>
      <div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <svg width="38" height="38" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="color:#4a4a52;">
            <circle cx="100" cy="100" r="96" stroke="currentColor" stroke-width="4" fill="none"/>
            <circle cx="100" cy="100" r="86" stroke="currentColor" stroke-width="2" fill="none"/>
            <polygon points="100,28 106,46 124,46 110,56 115,74 100,64 85,74 90,56 76,46 94,46" fill="currentColor"/>
            <path id="footerSealTop2" d="M 30,100 A 70,70 0 0,1 170,100" fill="none"/>
            <text font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="currentColor">
              <textPath href="#footerSealTop2" startOffset="50%" text-anchor="middle">ENTWICKELT IN</textPath>
            </text>
            <path id="footerSealBot2" d="M 28,108 A 72,72 0 0,0 172,108" fill="none"/>
            <text font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="currentColor">
              <textPath href="#footerSealBot2" startOffset="50%" text-anchor="middle">DEUTSCHLAND</textPath>
            </text>
            <rect x="70" y="82" width="60" height="8" rx="1" fill="#f0f0f2"/>
            <rect x="70" y="90" width="60" height="8" fill="#DD0000"/>
            <rect x="70" y="98" width="60" height="8" rx="1" fill="#FFCC00"/>
          </svg>
          <span style="font-size:11px;letter-spacing:.02em;font-weight:500;color:#4a4a52;">DSGVO-konform</span>
        </div>
      </div>
    </div>
    <!-- Legal Links -->
    <div style="border-top:1px solid rgba(255,255,255,.05);padding-top:1rem;display:flex;flex-wrap:wrap;justify-content:center;gap:1.5rem;margin-bottom:1rem;">
      <a href="/impressum" style="color:#6e6e76;text-decoration:none;font-size:.75rem;transition:color .2s;">Impressum</a>
      <a href="/datenschutz" style="color:#6e6e76;text-decoration:none;font-size:.75rem;transition:color .2s;">Datenschutz</a>
      <a href="/agb" style="color:#6e6e76;text-decoration:none;font-size:.75rem;transition:color .2s;">AGB</a>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,.05);padding-top:1rem;display:flex;flex-direction:column;align-items:center;gap:6px;">
      <p style="color:#4a4a52;font-size:.7rem;">&copy; 2026 Momentum. Alle Rechte vorbehalten. &nbsp;|&nbsp; DSGVO-konform &nbsp;|&nbsp; EU-Hosting</p>
      <p style="color:#3a3a42;font-size:.65rem;">Momentum ist eine SaaS-Plattform. Version 1.1.0 — Phase 2.5 (Multi-Tenancy + Realtime Notification System)</p>
    </div>
  </div>
</footer>

<!-- Back to Top -->
<button class="back-to-top" id="backToTop" aria-label="Nach oben">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:20px;height:20px;">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
</button>

<!-- Cookie Banner -->
<div class="cookie-banner" id="cookieBanner">
  <div class="cookie-banner__inner">
    <div style="font-weight:700;font-size:.95rem;margin-bottom:6px;">&#x1F36A; Cookies</div>
    <div style="font-size:.8rem;color:#555558;line-height:1.6;margin-bottom:16px;">Wir verwenden Cookies, um die Nutzung dieser Website zu analysieren und zu verbessern.</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <button class="cookie-banner__btn cookie-banner__btn--accept" data-cookie-action="accept">Akzeptieren</button>
      <button class="cookie-banner__btn cookie-banner__btn--reject" data-cookie-action="reject">Ablehnen</button>
    </div>
  </div>
</div>
`;
