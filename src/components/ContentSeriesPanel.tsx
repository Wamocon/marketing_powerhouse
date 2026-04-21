"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Instagram,
  Lightbulb,
  Linkedin,
  Loader2,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  suggestContentSeries,
  type ContentSeriesIdea,
  type ContentSeriesResult,
} from "@/lib/socialHub";

interface ContentSeriesPanelProps {
  companyId: string;
  language: string;
  onIdeaSelect: (idea: ContentSeriesIdea, platform: "linkedin" | "instagram") => void;
}

type SeriesPhase = "input" | "loading" | "results" | "error";

export default function ContentSeriesPanel({
  companyId,
  language,
  onIdeaSelect,
}: ContentSeriesPanelProps) {
  const t = language === "en";

  const [phase, setPhase] = useState<SeriesPhase>("input");
  const [broadTopic, setBroadTopic] = useState("");
  const [platform, setPlatform] = useState<"linkedin" | "instagram">("linkedin");
  const [seriesResult, setSeriesResult] = useState<ContentSeriesResult | null>(null);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!broadTopic.trim()) return;
    setPhase("loading");
    setError(null);
    setSeriesResult(null);
    setSelectedIdeas(new Set());

    try {
      const result = await suggestContentSeries(
        companyId,
        broadTopic.trim(),
        platform,
        5,
        language,
      );
      setSeriesResult(result);
      setPhase(result.ideas?.length > 0 ? "results" : "error");
      if (!result.ideas?.length) {
        setError(t ? "No ideas generated. Try a broader topic." : "Keine Ideen generiert. Versuch ein breiteres Thema.");
      }
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : t ? "Generation failed" : "Generierung fehlgeschlagen");
    }
  }, [companyId, broadTopic, platform, language, t]);

  const toggleIdea = (index: number) => {
    setSelectedIdeas((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleStartOver = () => {
    setPhase("input");
    setSeriesResult(null);
    setSelectedIdeas(new Set());
    setError(null);
  };

  // ─── Input Phase ─────────────────────────────────────

  if (phase === "input") {
    return (
      <div className="card" style={{ maxWidth: "720px" }}>
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={18} style={{ color: "#f59e0b" }} />
              {t ? "Content Series Planner" : "Content-Serie planen"}
            </div>
            <div className="card-subtitle">
              {t
                ? "Enter a broad topic and AI will suggest 5 distinct post angles. Pick the ones you like and generate variants for each."
                : "Gib ein breites Thema ein und die KI schlägt 5 verschiedene Post-Blickwinkel vor. Wähle die besten aus und generiere Varianten für jeden."}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" }}>
              {t ? "Broad Topic / Theme" : "Breites Thema / Serie"}
            </label>
            <textarea
              className="form-textarea"
              value={broadTopic}
              onChange={(e) => setBroadTopic(e.target.value)}
              placeholder={t
                ? 'e.g. "Product Launch Q2 2026" or "AI in HR" or "Future of Remote Work"'
                : 'z.B. „Produktlaunch Q2 2026" oder „KI im Personalwesen" oder „Zukunft der Remote-Arbeit"'}
              style={{ minHeight: "72px", fontSize: "var(--font-size-sm)" }}
              maxLength={1000}
              aria-label={t ? "Series topic" : "Serien-Thema"}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" }}>
              {t ? "Target Platform" : "Zielplattform"}
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["linkedin", "instagram"] as const).map((p) => (
                <button
                  key={p}
                  className={`btn btn-sm ${platform === p ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setPlatform(p)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px" }}
                  type="button"
                >
                  {p === "linkedin" ? <Linkedin size={16} /> : <Instagram size={16} />}
                  {p === "linkedin" ? "LinkedIn" : "Instagram"}
                </button>
              ))}
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!broadTopic.trim()}
            style={{ alignSelf: "flex-start", padding: "10px 24px" }}
            type="button"
          >
            <Lightbulb size={16} />
            {t ? "Generate 5 Ideas" : "5 Ideen generieren"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading Phase ───────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="card" style={{ maxWidth: "720px", textAlign: "center", padding: "60px 32px" }}>
        <Loader2 size={40} className="spin" style={{ color: "#f59e0b", marginBottom: "16px" }} />
        <div style={{ fontWeight: 700, fontSize: "var(--font-size-md)", marginBottom: "8px" }}>
          {t ? "Planning Your Content Series…" : "Plane deine Content-Serie…"}
        </div>
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
          {t
            ? "AI is analyzing trends and creating 5 unique post angles."
            : "Die KI analysiert Trends und erstellt 5 einzigartige Post-Blickwinkel."}
        </div>
      </div>
    );
  }

  // ─── Results Phase ───────────────────────────────────

  if (phase === "results" && seriesResult) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, margin: 0 }}>
              {seriesResult.series_title || (t ? "Content Series" : "Content-Serie")}
            </h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              {t
                ? `${seriesResult.ideas.length} ideas · select the ones you want to create`
                : `${seriesResult.ideas.length} Ideen · wähle aus, welche du erstellen möchtest`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {selectedIdeas.size > 0 && (
              <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> {selectedIdeas.size} {t ? "selected" : "ausgewählt"}
              </span>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleStartOver} type="button">
              {t ? "Start Over" : "Neu starten"}
            </button>
          </div>
        </div>

        {/* Ideas List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {seriesResult.ideas.map((idea, index) => {
            const isSelected = selectedIdeas.has(index);
            return (
              <div
                key={index}
                className="card"
                style={{
                  padding: "16px",
                  cursor: "pointer",
                  borderLeft: isSelected ? "3px solid var(--color-primary)" : "3px solid transparent",
                  background: isSelected ? "rgba(14,165,233,0.04)" : undefined,
                  transition: "all 0.15s ease",
                }}
                onClick={() => toggleIdea(index)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleIdea(index); } }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-full)",
                      border: isSelected ? "2px solid var(--color-primary)" : "2px solid var(--border-color)",
                      background: isSelected ? "var(--color-primary)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSelected ? (
                      <CheckCircle2 size={16} style={{ color: "#fff" }} />
                    ) : (
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)" }}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "var(--font-size-sm)", marginBottom: "4px" }}>
                      {idea.title}
                    </div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      <strong>{t ? "Angle:" : "Blickwinkel:"}</strong> {idea.angle}
                    </div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", marginTop: "4px", fontStyle: "italic" }}>
                      „{idea.hook}"
                    </div>
                  </div>
                  {isSelected && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onIdeaSelect(idea, platform);
                      }}
                      type="button"
                      style={{ flexShrink: 0 }}
                    >
                      <ArrowRight size={14} />
                      {t ? "Create Variants" : "Varianten erstellen"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Batch action hint */}
        {selectedIdeas.size > 1 && (
          <div style={{ padding: "12px 16px", background: "rgba(245,158,11,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(245,158,11,0.2)", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Lightbulb size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />
            {t
              ? "Tip: Click the arrow button on each selected idea to generate post variants for it."
              : "Tipp: Klicke auf den Pfeil-Button bei jeder ausgewählten Idee, um Post-Varianten dafür zu generieren."}
          </div>
        )}
      </div>
    );
  }

  // ─── Error Phase ─────────────────────────────────────

  return (
    <div className="card" style={{ maxWidth: "720px", borderLeft: "3px solid #ef4444" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <AlertCircle size={24} style={{ color: "#ef4444" }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: "var(--font-size-sm)" }}>
            {t ? "Planning Failed" : "Planung fehlgeschlagen"}
          </div>
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
            {error || (t ? "An unexpected error occurred." : "Ein unerwarteter Fehler ist aufgetreten.")}
          </div>
        </div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={handleStartOver} type="button">
        {t ? "Try Again" : "Erneut versuchen"}
      </button>
    </div>
  );
}
