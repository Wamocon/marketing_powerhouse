"use client";

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Hash,
  Instagram,
  Linkedin,
  Loader2,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  createFromVariant,
  generateVariants,
  type CreateFromVariantResult,
  type PostVariant,
} from "@/lib/socialHub";
import LinkedInPreview from "./LinkedInPreview";
import InstagramPreview from "./InstagramPreview";

interface PostVariantPickerProps {
  companyId: string;
  companyName?: string;
  language: string;
  initialTopic?: string;
  initialPlatform?: "linkedin" | "instagram";
  onPostCreated?: (result: CreateFromVariantResult) => void;
}

type PickerPhase = "input" | "loading" | "pick" | "creating" | "done" | "error";

const TONE_STYLES: Record<string, { label: string; labelDe: string; color: string; bg: string; icon: typeof Zap }> = {
  professional: { label: "Professional", labelDe: "Professionell", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)", icon: Zap },
  storytelling: { label: "Storytelling", labelDe: "Storytelling", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: MessageSquare },
  bold: { label: "Bold & Provocative", labelDe: "Mutig & Provokant", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: Sparkles },
};

export default function PostVariantPicker({
  companyId,
  companyName,
  language,
  initialTopic,
  initialPlatform,
  onPostCreated,
}: PostVariantPickerProps) {
  const t = language === "en";

  const [phase, setPhase] = useState<PickerPhase>("input");
  const [topic, setTopic] = useState(initialTopic || "");
  const [platform, setPlatform] = useState<"linkedin" | "instagram">(initialPlatform || "linkedin");
  const [variants, setVariants] = useState<PostVariant[]>([]);
  const [researchSummary, setResearchSummary] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<CreateFromVariantResult | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setPhase("loading");
    setError(null);
    setVariants([]);
    setSelectedIndex(null);
    setCreatedResult(null);

    try {
      const result = await generateVariants({
        companyId,
        platform,
        topic: topic.trim(),
        language,
      });
      setVariants(result.variants);
      setResearchSummary(result.research_summary);
      setPhase(result.variants.length > 0 ? "pick" : "error");
      if (result.variants.length === 0) {
        setError(t ? "No variants generated. Try a different topic." : "Keine Varianten generiert. Versuch ein anderes Thema.");
      }
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : t ? "Generation failed" : "Generierung fehlgeschlagen");
    }
  }, [companyId, platform, topic, language, t]);

  const handleSelectAndCreate = useCallback(async (index: number) => {
    const variant = variants[index];
    if (!variant) return;
    setSelectedIndex(index);
    setPhase("creating");
    setError(null);

    try {
      const result = await createFromVariant({
        companyId,
        topic,
        platform,
        body: variant.body,
        hashtags: variant.hashtags,
        valueComment: variant.value_comment,
        imagePrompt: variant.image_prompt,
        tone: variant.tone,
        generateImage: true,
      });
      setCreatedResult(result);
      setPhase("done");
      onPostCreated?.(result);
    } catch (e) {
      setPhase("pick");
      setError(e instanceof Error ? e.message : t ? "Post creation failed" : "Post-Erstellung fehlgeschlagen");
    }
  }, [variants, companyId, topic, platform, onPostCreated, t]);

  const handleStartOver = () => {
    setPhase("input");
    setVariants([]);
    setSelectedIndex(null);
    setCreatedResult(null);
    setError(null);
    setResearchSummary("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  // ─── Input Phase ─────────────────────────────────────

  if (phase === "input") {
    return (
      <div className="card" style={{ maxWidth: "720px" }}>
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "#8b5cf6" }} />
              {t ? "Generate Post Variants" : "Post-Varianten generieren"}
            </div>
            <div className="card-subtitle">
              {t
                ? "AI generates 3 unique versions of your post with different tones. Pick your favorite."
                : "Die KI erstellt 3 einzigartige Versionen deines Posts in verschiedenen Tonalitäten. Wähle deinen Favoriten."}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" }}>
              {t ? "Topic" : "Thema"}
            </label>
            <textarea
              className="form-textarea"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t
                ? 'e.g. "Remote work productivity tips for 2026"'
                : 'z.B. „Produktivitätstipps für Remote-Arbeit 2026"'}
              style={{ minHeight: "80px", fontSize: "var(--font-size-sm)" }}
              maxLength={1000}
              aria-label={t ? "Post topic" : "Post-Thema"}
            />
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", marginTop: "4px", textAlign: "right" }}>
              {topic.length}/1000
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" }}>
              {t ? "Platform" : "Plattform"}
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
            disabled={!topic.trim()}
            style={{ alignSelf: "flex-start", padding: "10px 24px" }}
            type="button"
          >
            <Sparkles size={16} />
            {t ? "Generate 3 Variants" : "3 Varianten generieren"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading Phase ───────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="card" style={{ maxWidth: "720px", textAlign: "center", padding: "60px 32px" }}>
        <Loader2 size={40} className="spin" style={{ color: "#8b5cf6", marginBottom: "16px" }} />
        <div style={{ fontWeight: 700, fontSize: "var(--font-size-md)", marginBottom: "8px" }}>
          {t ? "Researching & Creating Variants…" : "Recherchiere & erstelle Varianten…"}
        </div>
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
          {t
            ? "AI is researching current facts with Google Search, then creating 3 post versions with different tones."
            : "Die KI recherchiert aktuelle Fakten über Google Search und erstellt dann 3 Post-Versionen mit verschiedenen Tonalitäten."}
        </div>
        <div style={{ marginTop: "24px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {Object.entries(TONE_STYLES).map(([key, style]) => (
            <span key={key} style={{ fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "var(--radius-full)", color: style.color, background: style.bg }}>
              {t ? style.label : style.labelDe}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ─── Pick Phase ──────────────────────────────────────

  if (phase === "pick" || phase === "creating") {
    const isCreating = phase === "creating";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1200px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, margin: 0 }}>
              {t ? "Choose Your Variant" : "Wähle deine Variante"}
            </h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              {t ? `Topic: "${topic}"` : `Thema: „${topic}"`} ·{" "}
              {platform === "linkedin" ? "LinkedIn" : "Instagram"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPreview(!showPreview)} type="button">
              {showPreview ? (t ? "Hide Preview" : "Vorschau ausblenden") : (t ? "Show Preview" : "Vorschau anzeigen")}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleStartOver} type="button" disabled={isCreating}>
              {t ? "Start Over" : "Neu starten"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--color-danger-bg)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--font-size-sm)" }}>
            <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Research Summary (collapsible) */}
        {researchSummary && (
          <details style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
            <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--text-tertiary)", padding: "4px 0" }}>
              {t ? "📚 Research sources used" : "📚 Verwendete Recherchequellen"}
            </summary>
            <div style={{ marginTop: "8px", padding: "12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: "200px", overflowY: "auto" }}>
              {researchSummary}
            </div>
          </details>
        )}

        {/* Variant Cards */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${showPreview ? "340px" : "280px"}, 1fr))`, gap: "16px" }}>
          {variants.map((variant, index) => {
            const toneStyle = TONE_STYLES[variant.tone] || TONE_STYLES.professional;
            const isSelected = selectedIndex === index;

            return (
              <div
                key={`${variant.tone}-${index}`}
                className="card"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  border: isSelected ? `2px solid ${toneStyle.color}` : "1px solid var(--border-color)",
                  opacity: isCreating && !isSelected ? 0.5 : 1,
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Tone Label */}
                <div style={{ padding: "12px 16px", background: toneStyle.bg, display: "flex", alignItems: "center", gap: "8px", borderBottom: `2px solid ${toneStyle.color}` }}>
                  <toneStyle.icon size={16} style={{ color: toneStyle.color }} />
                  <span style={{ fontWeight: 700, fontSize: "var(--font-size-sm)", color: toneStyle.color }}>
                    {variant.tone_label || (t ? toneStyle.label : toneStyle.labelDe)}
                  </span>
                  {isSelected && isCreating && (
                    <Loader2 size={14} className="spin" style={{ color: toneStyle.color, marginLeft: "auto" }} />
                  )}
                </div>

                {/* Preview */}
                {showPreview && (
                  <div style={{ padding: "12px", background: "#0a0a0a", borderBottom: "1px solid var(--border-color)" }}>
                    {platform === "linkedin" ? (
                      <LinkedInPreview
                        authorName={companyName || "Ihr Unternehmen"}
                        postText={variant.body}
                        hashtags={variant.hashtags}
                        compact
                      />
                    ) : (
                      <InstagramPreview
                        authorName={companyName?.toLowerCase().replace(/\s/g, "_") || "ihr_unternehmen"}
                        postText={variant.body}
                        hashtags={variant.hashtags}
                        compact
                      />
                    )}
                  </div>
                )}

                {/* Text Excerpt (when preview hidden) */}
                {!showPreview && (
                  <div style={{ padding: "16px", flex: 1 }}>
                    <div style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.6, color: "var(--text-primary)", whiteSpace: "pre-wrap", maxHeight: "200px", overflowY: "auto" }}>
                      {variant.body}
                    </div>
                    {variant.hashtags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                        {variant.hashtags.slice(0, 5).map((tag, i) => (
                          <span key={i} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "var(--radius-full)", background: "rgba(14,165,233,0.1)", color: "#0ea5e9" }}>
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </span>
                        ))}
                        {variant.hashtags.length > 5 && (
                          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                            +{variant.hashtags.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Info & Actions */}
                <div style={{ padding: "12px 16px", marginTop: "auto", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
                    <span>{variant.body.length} {t ? "chars" : "Zeichen"}</span>
                    {variant.hashtags.length > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        <Hash size={10} /> {variant.hashtags.length}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSelectAndCreate(index)}
                      disabled={isCreating}
                      style={{ flex: 1 }}
                      type="button"
                    >
                      {isCreating && isSelected ? (
                        <><Loader2 size={14} className="spin" /> {t ? "Creating…" : "Erstelle…"}</>
                      ) : (
                        <><CheckCircle2 size={14} /> {t ? "Use This" : "Diese verwenden"}</>
                      )}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => copyToClipboard(variant.body)}
                      title={t ? "Copy text" : "Text kopieren"}
                      type="button"
                      aria-label={t ? "Copy post text" : "Post-Text kopieren"}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Done Phase ──────────────────────────────────────

  if (phase === "done" && createdResult) {
    return (
      <div className="card" style={{ maxWidth: "720px", borderLeft: "3px solid #10b981" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <CheckCircle2 size={24} style={{ color: "#10b981" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--font-size-md)" }}>
              {t ? "Post Created Successfully!" : "Post erfolgreich erstellt!"}
            </div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
              {t
                ? `${createdResult.tone} variant saved as draft · ${createdResult.platform}`
                : `${createdResult.tone}-Variante als Entwurf gespeichert · ${createdResult.platform}`}
              {createdResult.post_image_url && (
                <span> · {t ? "Image generated" : "Bild generiert"} ✓</span>
              )}
            </div>
          </div>
        </div>

        {/* Show preview of the created post */}
        <div style={{ marginBottom: "16px" }}>
          {createdResult.platform === "linkedin" ? (
            <LinkedInPreview
              authorName={companyName || "Ihr Unternehmen"}
              postText={createdResult.post_text}
              imageUrl={createdResult.post_image_url}
              hashtags={createdResult.hashtags}
            />
          ) : (
            <InstagramPreview
              authorName={companyName?.toLowerCase().replace(/\s/g, "_") || "ihr_unternehmen"}
              postText={createdResult.post_text}
              imageUrl={createdResult.post_image_url}
              hashtags={createdResult.hashtags}
            />
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-sm" onClick={handleStartOver} type="button">
            <Sparkles size={14} /> {t ? "Generate More" : "Weitere generieren"}
          </button>
        </div>
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
            {t ? "Generation Failed" : "Generierung fehlgeschlagen"}
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
