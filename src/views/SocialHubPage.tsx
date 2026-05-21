"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Hash,
  Image as ImageIcon,
  Instagram,
  Layers,
  Lightbulb,
  Link2,
  Linkedin,
  Loader2,
  MessageSquare,
  PlayCircle,
  Radio,
  RefreshCw,
  Search,
  Send,
  Shield,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ContentSeriesPanel from "../components/ContentSeriesPanel";
import LinkedInPreview from "../components/LinkedInPreview";
import InstagramPreview from "../components/InstagramPreview";
import PageHelp from "../components/PageHelp";
import PostVariantPicker from "../components/PostVariantPicker";
import SocialHubUpgradePrompt from "../components/SocialHubUpgradePrompt";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import { useLanguage, type Translations } from "../context/LanguageContext";
import { useSubscription } from "../context/SubscriptionContext";
import {
  approvePost,
  checkSocialHubHealth,
  generateAiPost,
  getConnectedAccounts,
  getPostDetail,
  getReadiness,
  listPosts,
  publishPost,
  regeneratePostImage,
  regeneratePostText,
  rejectPost,
  SOCIAL_HUB_URL,
  subscribeToPostChanges,
  type ConnectedAccount,
  type ContentSeriesIdea,
  type CreateFromVariantResult,
  type PostDetail,
  type ReadinessResult,
  type ScheduledPost,
} from "../lib/socialHub";
import { hasSocialHubPlanEntitlement } from "../lib/socialHubEntitlements";

// ─── Constants ─────────────────────────────────────────────

const STATUS_BADGE: Record<
  string,
  { label: Translations; color: string; bg: string }
> = {
  draft: { label: { de: "Entwurf", en: "Draft", tr: "Taslak" }, color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  scheduled: {
    label: { de: "Geplant", en: "Scheduled", tr: "Planlanmış" },
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.12)",
  },
  approved: {
    label: { de: "Freigegeben", en: "Approved", tr: "Onaylandı" },
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
  },
  publishing: {
    label: { de: "Wird veröffentlicht...", en: "Publishing...", tr: "Yayınlanıyor..." },
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  published: {
    label: { de: "Veröffentlicht", en: "Published", tr: "Yayınlandı" },
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
  failed: {
    label: { de: "Fehlgeschlagen", en: "Failed", tr: "Başarısız" },
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
  rejected: {
    label: { de: "Abgelehnt", en: "Rejected", tr: "Reddedildi" },
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
};

const STATE_ICON: Record<string, typeof CheckCircle2> = {
  ready: CheckCircle2,
  warn: AlertTriangle,
  issue: XCircle,
};
const STATE_COLOR: Record<string, string> = {
  ready: "var(--color-success)",
  warn: "var(--color-warning)",
  issue: "var(--color-danger)",
};

const PLATFORM_ICON: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  instagram: Instagram,
};

const TOKEN_STATUS_MAP: Record<string, { label: Translations; color: string }> = {
  ok: { label: { de: "Verbunden", en: "Connected", tr: "Bağlı" }, color: "var(--color-success)" },
  expiring_soon: { label: { de: "Läuft bald ab", en: "Expiring soon", tr: "Süresi dolmak üzere" }, color: "var(--color-warning)" },
  expired: { label: { de: "Abgelaufen", en: "Expired", tr: "Süresi doldu" }, color: "var(--color-danger)" },
};

// ─── Component ─────────────────────────────────────────────

export default function SocialHubPage() {
  const { activeCompany } = useCompany();
  const { currentUser, can } = useAuth();
  const { language, t } = useLanguage();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const canUseSocialHubRole = can("canUseSocialHub");
  const hasSocialHubPlanAccess = hasSocialHubPlanEntitlement(subscription);
  const canUseSocialHub = canUseSocialHubRole && hasSocialHubPlanAccess;
  const showUpgradePrompt =
    canUseSocialHubRole && !subscriptionLoading && !hasSocialHubPlanAccess;

  // Data state
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<
    "overview" | "posts" | "generate" | "accounts"
  >("overview");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [regenerateInstruction, setRegenerateInstruction] = useState("");

  // Generate state
  const [genTopic, setGenTopic] = useState("");
  const [genPlatform, setGenPlatform] = useState<"linkedin" | "instagram">(
    "linkedin",
  );
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{
    post_id: string;
    topic: string;
    platform: string;
  } | null>(null);

  // Generate sub-mode: "quick" (single), "variants" (3 options), "series" (content series)
  const [genMode, setGenMode] = useState<"quick" | "variants" | "series">(
    "variants",
  );
  // For content series → variant picker flow
  const [seriesIdeaForVariants, setSeriesIdeaForVariants] = useState<{
    topic: string;
    platform: "linkedin" | "instagram";
  } | null>(null);

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const companyId = activeCompany?.id || "";
  const isOnline = health?.status === "ok" || health?.status === "degraded";

  // ─── Data Loading ──────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!companyId || !canUseSocialHub) return;
    setLoading(true);
    setError(null);
    try {
      const [healthRes, readinessRes, postsRes, accountsRes] =
        await Promise.allSettled([
          checkSocialHubHealth(),
          getReadiness(companyId),
          listPosts(companyId),
          getConnectedAccounts(companyId),
        ]);
      if (healthRes.status === "fulfilled") setHealth(healthRes.value);
      if (readinessRes.status === "fulfilled") setReadiness(readinessRes.value);
      if (postsRes.status === "fulfilled") setPosts(postsRes.value);
      if (accountsRes.status === "fulfilled") setAccounts(accountsRes.value);

      if (healthRes.status === "rejected") {
        setError(
          t({
            de: "Der Social-Hub-Service ist über die App-Route nicht erreichbar. Stelle sicher, dass der gemeinsame Dev-Start läuft.",
            en: "Social Hub service is not reachable behind the app route. Make sure the shared dev server is running.",
            tr: "Social Hub servisi uygulama rotası üzerinden erişilebilir değil. Paylaşılan geliştirme sunucusunun çalıştığından emin olun.",
          }),
        );
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }, [canUseSocialHub, companyId, language]);

  useEffect(() => {
    if (canUseSocialHub) {
      loadData();
      return;
    }

    setLoading(false);
    setError(null);
    setHealth(null);
    setReadiness(null);
    setPosts([]);
    setAccounts([]);
  }, [canUseSocialHub, loadData]);

  // Real-time subscription: auto-refresh when scheduled_posts change
  useEffect(() => {
    if (!companyId || !canUseSocialHub) return;
    const unsubscribe = subscribeToPostChanges(companyId, () => {
      // Refresh posts list silently (no loading spinner)
      listPosts(companyId)
        .then(setPosts)
        .catch(() => {});
    });
    return unsubscribe;
  }, [canUseSocialHub, companyId]);

  // ─── Post Detail ───────────────────────────────────────

  const openPostDetail = async (postId: string) => {
    setDetailLoading(true);
    setRegenerateInstruction("");
    try {
      const detail = await getPostDetail(companyId, postId);
      setSelectedPost(detail);
    } catch {
      setSelectedPost(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closePostDetail = () => setSelectedPost(null);

  const refreshSelectedPost = useCallback(
    async (postId: string) => {
      const detail = await getPostDetail(companyId, postId);
      setSelectedPost(detail);
    },
    [companyId],
  );

  // ─── Actions ───────────────────────────────────────────

  const handleApprove = async (postId: string) => {
    if (!currentUser?.id) return;
    setActionLoading(postId);
    try {
      await approvePost(companyId, postId, currentUser.id);
      if (selectedPost?.id === postId) {
        const updated = await getPostDetail(companyId, postId);
        setSelectedPost(updated);
      }
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (postId: string, notes?: string) => {
    if (!currentUser?.id) return;
    setActionLoading(postId);
    try {
      await rejectPost(companyId, postId, currentUser.id, notes);
      if (selectedPost?.id === postId) {
        const updated = await getPostDetail(companyId, postId);
        setSelectedPost(updated);
      }
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (postId: string) => {
    setActionLoading(postId);
    try {
      await publishPost(companyId, postId);
      if (selectedPost?.id === postId) {
        const updated = await getPostDetail(companyId, postId);
        setSelectedPost(updated);
      }
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegenerateText = async () => {
    if (!selectedPost || !regenerateInstruction.trim()) return;
    setActionLoading(`regenerate-text:${selectedPost.id}`);
    try {
      await regeneratePostText(
        companyId,
        selectedPost.id,
        regenerateInstruction,
      );
      await refreshSelectedPost(selectedPost.id);
      await loadData();
      setRegenerateInstruction("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Text regeneration failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegenerateImage = async () => {
    if (!selectedPost) return;
    setActionLoading(`regenerate-image:${selectedPost.id}`);
    try {
      await regeneratePostImage(companyId, selectedPost.id);
      await refreshSelectedPost(selectedPost.id);
      await loadData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Image regeneration failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    setGenerating(true);
    setGenResult(null);
    try {
      const result = await generateAiPost({
        companyId,
        platform: genPlatform,
        topic: genTopic,
      });
      setGenResult(result);
      setGenTopic("");
      await loadData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  // ─── Filtering ─────────────────────────────────────────

  const filteredPosts = posts.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.topic?.toLowerCase().includes(q) ||
        p.post_text?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ─── Derived ───────────────────────────────────────────

  const scoreColor =
    (readiness?.score ?? 0) >= 80
      ? "var(--color-success)"
      : (readiness?.score ?? 0) >= 50
        ? "var(--color-warning)"
        : "var(--color-danger)";
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const approvedCount = posts.filter(
    (p) => p.status === "approved" || p.status === "scheduled",
  ).length;
  const publishedCount = posts.filter((p) => p.status === "published").length;

  // ─── Empty State ───────────────────────────────────────

  if (!activeCompany) {
    return (
      <div
        className="animate-in"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div
          className="card"
          style={{ textAlign: "center", padding: "48px", maxWidth: "420px" }}
        >
          <Radio
            size={48}
            style={{ color: "var(--text-tertiary)", marginBottom: "16px" }}
          />
          <h2 style={{ marginBottom: "8px" }}>
            {t({ de: "Kein Projekt ausgewählt", en: "No project selected", tr: "Proje seçilmedi" })}
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {t({
              de: "Wähle zuerst ein Projekt aus, um den Social Hub zu nutzen.",
              en: "Select a project to use the Social Hub.",
              tr: "Social Hub'ı kullanmak için bir proje seç.",
            })}
          </p>
        </div>
      </div>
    );
  }

  if (!canUseSocialHubRole) {
    return (
      <div
        className="animate-in"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div
          className="card"
          style={{ textAlign: "center", padding: "48px", maxWidth: "460px" }}
        >
          <Shield
            size={48}
            style={{ color: "var(--text-tertiary)", marginBottom: "16px" }}
          />
          <h2 style={{ marginBottom: "8px" }}>
            {t({ de: "Zugriff eingeschränkt", en: "Access restricted", tr: "Erişim kısıtlı" })}
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {t({
              de: "Deine aktuelle Projektrolle erlaubt keinen Zugriff auf den Social Hub.",
              en: "Your current project role does not allow Social Hub access.",
              tr: "Mevcut proje rolün Social Hub erişimine izin vermiyor.",
            })}
          </p>
        </div>
      </div>
    );
  }

  if (showUpgradePrompt) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <div className="page-header-left">
            <h1
              className="page-title"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <Radio size={24} style={{ color: "var(--color-primary)" }} />
              Social Hub
            </h1>
            <p className="page-subtitle">
              {t({
                de: "Upgrade auf Pro oder Ultimate, um KI-Social-Publishing freizuschalten",
                en: "Upgrade to Pro or Ultimate to unlock AI social publishing",
                tr: "Yapay zeka destekli sosyal medya yayınını açmak için Pro veya Ultimate'e yükseltin",
              })}
            </p>
          </div>
        </div>

        <SocialHubUpgradePrompt showPricingCards />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1
            className="page-title"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <Radio size={24} style={{ color: "var(--color-primary)" }} />
            Social Hub
          </h1>
          <p className="page-subtitle">
            {t({
              de: "KI-gestützte Social-Media-Veröffentlichung für LinkedIn & Instagram",
              en: "AI-powered social media publishing for LinkedIn & Instagram",
              tr: "LinkedIn ve Instagram için yapay zeka destekli sosyal medya yayını",
            })}
          </p>
        </div>
        <div className="page-header-actions">
          <PageHelp title="Social Hub">
            <p style={{ marginBottom: "12px" }}>
              {t({
                de: "Der Social Hub ist deine Zentrale für KI-generierte Social-Media-Posts. Er verbindet sich automatisch mit deinen LinkedIn- und Instagram-Accounts.",
                en: "The Social Hub is your central hub for AI-generated social media posts. It connects to your LinkedIn and Instagram accounts.",
                tr: "Social Hub, yapay zeka ile oluşturulan sosyal medya gönderileri için merkezi platformundur. LinkedIn ve Instagram hesaplarınıza otomatik olarak bağlanır.",
              })}
            </p>
            <ul className="help-list">
              <li>
                <strong>{t({ de: "Übersicht", en: "Overview", tr: "Genel Bakış" })}:</strong>{" "}
                {t({
                  de: "Systemstatus, Readiness-Score und Statistiken",
                  en: "System status, readiness score and stats",
                  tr: "Sistem durumu, hazırlık puanı ve istatistikler",
                })}
              </li>
              <li>
                <strong>Posts:</strong>{" "}
                {t({
                  de: "Posts prüfen, freigeben und veröffentlichen",
                  en: "Review, approve and publish posts",
                  tr: "Gönderileri inceleyin, onaylayın ve yayınlayın",
                })}
              </li>
              <li>
                <strong>{t({ de: "Generieren", en: "Generate", tr: "Oluştur" })}:</strong>{" "}
                {t({
                  de: "Neue KI-Posts erstellen",
                  en: "Create new AI posts",
                  tr: "Yeni yapay zeka gönderileri oluşturun",
                })}
              </li>
              <li>
                <strong>Accounts:</strong>{" "}
                {t({
                  de: "Status der verbundenen Accounts",
                  en: "Connected account status",
                  tr: "Bağlı hesap durumu",
                })}
              </li>
            </ul>
          </PageHelp>
          <button
            className="btn btn-ghost"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            {t({ de: "Aktualisieren", en: "Refresh", tr: "Yenile" })}
          </button>
        </div>
      </div>

      {/* Connection Status Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          marginBottom: "24px",
          borderRadius: "var(--radius-md)",
          background: isOnline
            ? "rgba(16,185,129,0.08)"
            : "rgba(239,68,68,0.08)",
          border: `1px solid ${isOnline ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isOnline
              ? "var(--color-success)"
              : "var(--color-danger)",
            boxShadow: isOnline
              ? "0 0 8px rgba(16,185,129,0.5)"
              : "0 0 8px rgba(239,68,68,0.5)",
          }}
        />
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: isOnline ? "var(--color-success)" : "var(--color-danger)",
          }}
        >
          {isOnline
            ? t({ de: "Social Hub verbunden", en: "Social Hub Connected", tr: "Social Hub Bağlı" })
            : t({ de: "Social Hub offline", en: "Social Hub Offline", tr: "Social Hub Çevrimdışı" })}
        </span>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
            marginLeft: "auto",
          }}
        >
          {accounts.length} {t({ de: "Accounts verbunden", en: "accounts connected", tr: "hesap bağlı" })}
        </span>
      </div>

      {error && (
        <div
          style={{
            padding: "16px",
            marginBottom: "24px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-danger-bg)",
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <XCircle
            size={18}
            style={{ color: "var(--color-danger)", flexShrink: 0 }}
          />
          <span>{error}</span>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={() => setError(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "0",
        }}
      >
        {(
          [
            { key: "overview", label: t({ de: "Übersicht", en: "Overview", tr: "Genel Bakış" }) },
            { key: "posts", label: `Posts (${posts.length})` },
            { key: "generate", label: t({ de: "Generieren", en: "Generate", tr: "Oluştur" }) },
            { key: "accounts", label: `Accounts (${accounts.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              color:
                activeTab === tab.key
                  ? "var(--color-primary)"
                  : "var(--text-tertiary)",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
              transition: "all 0.15s ease",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <Loader2
            size={32}
            className="spin"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>
      ) : (
        <>
          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === "overview" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Stats Row */}
              <div
                className="stats-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                }}
              >
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">
                      {t({ de: "Bereitschaft", en: "Readiness", tr: "Hazırlık" })}
                    </span>
                    <div
                      className="stat-card-icon"
                      style={{
                        color: scoreColor,
                        background: `${scoreColor}15`,
                      }}
                    >
                      <Zap size={20} />
                    </div>
                  </div>
                  <div
                    className="stat-card-value"
                    style={{ color: scoreColor }}
                  >
                    {readiness?.score ?? "–"}%
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {readiness?.items?.filter((i) => i.state === "ready")
                      .length ?? 0}
                    /{readiness?.items?.length ?? 0}{" "}
                    {t({ de: "Checks bestanden", en: "checks passed", tr: "kontrol geçti" })}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">
                      {t({ de: "Gesamt Posts", en: "Total Posts", tr: "Toplam Gönderi" })}
                    </span>
                    <div
                      className="stat-card-icon"
                      style={{
                        color: "var(--color-accent)",
                        background: "var(--color-info-bg)",
                      }}
                    >
                      <Send size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{posts.length}</div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {publishedCount} {t({ de: "veröffentlicht", en: "published", tr: "yayınlandı" })}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">
                      {t({ de: "In Warteschlange", en: "Queued", tr: "Sırada" })}
                    </span>
                    <div
                      className="stat-card-icon"
                      style={{
                        color: "var(--color-data-purple)",
                        background: "rgba(139,92,246,0.1)",
                      }}
                    >
                      <Clock size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{approvedCount}</div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {t({ de: "freigegeben & geplant", en: "approved & scheduled", tr: "onaylandı ve planlandı" })}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">
                      {t({ de: "Entwürfe", en: "Drafts", tr: "Taslaklar" })}
                    </span>
                    <div
                      className="stat-card-icon"
                      style={{
                        color: "var(--color-neutral)",
                        background: "rgba(107,114,128,0.1)",
                      }}
                    >
                      <Sparkles size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">{draftCount}</div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {t({ de: "warten auf Review", en: "awaiting review", tr: "inceleme bekliyor" })}
                  </div>
                </div>
              </div>

              {/* Readiness + Accounts */}
              <div className="content-grid-2">
                {/* Readiness Card */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">
                        {t({ de: "Go-Live Bereitschaft", en: "Go-Live Readiness", tr: "Yayına Hazırlık" })}
                      </div>
                      <div className="card-subtitle">
                        {t({
                          de: "Systemprüfungen für die Veröffentlichung",
                          en: "System checks for publishing",
                          tr: "Yayınlama için sistem kontrolleri",
                        })}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {readiness?.items?.map((item, i) => {
                      const Icon = STATE_ICON[item.state] || AlertTriangle;
                      const color =
                        STATE_COLOR[item.state] || "var(--text-tertiary)";
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--bg-elevated)",
                          }}
                        >
                          <Icon size={18} style={{ color, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "var(--font-size-sm)",
                                fontWeight: 600,
                              }}
                            >
                              {item.label}
                            </div>
                            <div
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-tertiary)",
                              }}
                            >
                              {item.detail}
                            </div>
                          </div>
                        </div>
                      );
                    }) || (
                      <div
                        style={{
                          padding: "24px",
                          textAlign: "center",
                          color: "var(--text-tertiary)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        {t({
                          de: "Readiness-Daten konnten nicht geladen werden",
                          en: "Could not load readiness data",
                          tr: "Hazırlık verileri yüklenemedi",
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Accounts Summary + Recent Drafts */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  {/* Accounts Summary */}
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          {t({ de: "Verbundene Accounts", en: "Connected Accounts", tr: "Bağlı Hesaplar" })}
                        </div>
                        <div className="card-subtitle">
                          {accounts.length} {t({ de: "aktiv", en: "active", tr: "aktif" })}
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setActiveTab("accounts")}
                      >
                        {t({ de: "Details", en: "Details", tr: "Detaylar" })} →
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {accounts.length === 0 ? (
                        <div
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "var(--text-tertiary)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          <Link2
                            size={24}
                            style={{ marginBottom: "8px", opacity: 0.4 }}
                          />
                          <div>
                            {t({
                              de: "Noch keine Accounts verbunden",
                              en: "No accounts connected yet",
                              tr: "Henüz bağlı hesap yok",
                            })}
                          </div>
                          <a
                            href={`${SOCIAL_HUB_URL}/project/${encodeURIComponent(companyId)}/settings`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: "12px" }}
                          >
                            <Link2 size={14} />{" "}
                            {t({ de: "Account verbinden", en: "Connect Account", tr: "Hesap Bağla" })}
                          </a>
                        </div>
                      ) : (
                        accounts.map((acc) => {
                          const PIcon = PLATFORM_ICON[acc.platform] || Radio;
                          const ts =
                            TOKEN_STATUS_MAP[acc.token_status] ||
                            TOKEN_STATUS_MAP.ok;
                          return (
                            <div
                              key={acc.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 12px",
                                borderRadius: "var(--radius-sm)",
                                background: "var(--bg-elevated)",
                              }}
                            >
                              <PIcon
                                size={18}
                                style={{
                                  color:
                                    acc.platform === "linkedin"
                                      ? "#0077B5"
                                      : "#E4405F",
                                  flexShrink: 0,
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: "var(--font-size-sm)",
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {acc.account_name || acc.platform}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: ts.color,
                                }}
                              >
                                {t(ts.label)}                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Recent Drafts Needing Review */}
                  {draftCount > 0 && (
                    <div
                      className="card"
                      style={{ borderLeft: "3px solid #6b7280" }}
                    >
                      <div className="card-header">
                        <div>
                          <div className="card-title">
                            {t({ de: "Review erforderlich", en: "Needs Review", tr: "İnceleme Gerekli" })}
                          </div>
                          <div className="card-subtitle">
                            {draftCount}{" "}
                            {t({
                              de: "Entwürfe warten auf Freigabe",
                              en: "drafts awaiting approval",
                              tr: "taslak onay bekliyor",
                            })}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        {posts
                          .filter((p) => p.status === "draft")
                          .slice(0, 3)
                          .map((post) => (
                            <div
                              key={post.id}
                              onClick={() => openPostDetail(post.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px",
                                borderRadius: "var(--radius-sm)",
                                background: "var(--bg-elevated)",
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--bg-hover)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--bg-elevated)")
                              }
                            >
                              <Sparkles
                                size={14}
                                style={{
                                  color: "var(--text-tertiary)",
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "var(--font-size-sm)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flex: 1,
                                }}
                              >
                                {post.topic ||
                                  post.post_text?.slice(0, 60) ||
                                  t({ de: "Ohne Titel", en: "Untitled", tr: "Başlıksız" })}
                              </span>
                              <Eye
                                size={14}
                                style={{ color: "var(--text-tertiary)" }}
                              />
                            </div>
                          ))}
                        {draftCount > 3 && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setActiveTab("posts");
                              setStatusFilter("draft");
                            }}
                          >
                            +{draftCount - 3} {t({ de: "weitere", en: "more", tr: "daha" })} →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ POSTS TAB ═══ */}
          {activeTab === "posts" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Toolbar */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ position: "relative", flex: 1, minWidth: "200px" }}
                >
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-tertiary)",
                    }}
                  />
                  <input
                    className="form-input"
                    placeholder={t({ de: "Posts durchsuchen...", en: "Search posts...", tr: "Gönderilerde ara..." })}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
                <div
                  style={{ display: "flex", gap: "4px", alignItems: "center" }}
                >
                  <Filter size={14} style={{ color: "var(--text-tertiary)" }} />
                  {["all", "draft", "approved", "published", "rejected"].map(
                    (s) => (
                      <button
                        key={s}
                        className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setStatusFilter(s)}
                        style={{ fontSize: "12px" }}
                      >
                        {s === "all"
                          ? t({ de: "Alle", en: "All", tr: "Tümü" })
                          : STATUS_BADGE[s]?.label ? t(STATUS_BADGE[s].label) : s}
                      </button>
                    ),
                  )}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab("generate")}
                >
                  <Sparkles size={14} /> {t({ de: "Neu generieren", en: "Generate New", tr: "Yeni Oluştur" })}
                </button>
              </div>

              {/* Post Cards */}
              {filteredPosts.length === 0 ? (
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "48px" }}
                >
                  <Send
                    size={40}
                    style={{
                      marginBottom: "12px",
                      opacity: 0.3,
                      color: "var(--text-tertiary)",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {searchQuery || statusFilter !== "all"
                      ? t({
                          de: "Keine Posts entsprechen deinem Filter.",
                          en: "No posts match your filter.",
                          tr: "Filtrenizle eşleşen gönderi yok.",
                        })
                      : t({
                          de: "Noch keine Posts. Generiere deinen ersten KI-Post!",
                          en: "No posts yet. Generate your first AI post!",
                          tr: "Henüz gönderi yok. İlk yapay zeka gönderini oluştur!",
                        })}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {filteredPosts.map((post) => {
                    const badge =
                      STATUS_BADGE[post.status] || STATUS_BADGE.draft;
                    return (
                      <div
                        key={post.id}
                        className="card"
                        style={{
                          padding: "16px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          borderLeft: `3px solid ${badge.color}`,
                        }}
                        onClick={() => openPostDetail(post.id)}
                      >
                        <div style={{ display: "flex", gap: "16px" }}>
                          {/* Image Preview */}
                          {post.post_image_url ? (
                            <div
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: "var(--radius-md)",
                                background: "var(--bg-hover)",
                                flexShrink: 0,
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={post.post_image_url}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: "var(--radius-md)",
                                background: "var(--bg-hover)",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ImageIcon
                                size={24}
                                style={{
                                  color: "var(--text-tertiary)",
                                  opacity: 0.4,
                                }}
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: "12px",
                                marginBottom: "6px",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: "var(--font-size-sm)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {post.topic || t({ de: "Ohne Titel", en: "Untitled", tr: "Başlıksız" })}
                              </div>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  padding: "3px 10px",
                                  borderRadius: "var(--radius-full)",
                                  color: badge.color,
                                  background: badge.bg,
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                {t(badge.label)}
                              </span>
                            </div>

                            <p
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-secondary)",
                                margin: 0,
                                lineHeight: 1.5,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {post.post_text || ""}
                            </p>

                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: "8px",
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-tertiary)",
                                alignItems: "center",
                              }}
                            >
                              {post.hashtags && post.hashtags.length > 0 && (
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  <Hash size={12} /> {post.hashtags.length}
                                </span>
                              )}
                              {post.scheduled_at && (
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  <Clock size={12} />
                                  {new Date(post.scheduled_at).toLocaleString(
                                    "de-DE",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              )}
                              {post.published_at && (
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    color: "var(--color-success)",
                                  }}
                                >
                                  <CheckCircle2 size={12} />
                                  {new Date(post.published_at).toLocaleString(
                                    "de-DE",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions Row (for drafts) */}
                        {post.status === "draft" && (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginTop: "12px",
                              paddingTop: "12px",
                              borderTop: "1px solid var(--border-color)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "rgba(16,185,129,0.1)",
                                color: "#10b981",
                              }}
                              disabled={actionLoading === post.id}
                              onClick={() => handleApprove(post.id)}
                            >
                              {actionLoading === post.id ? (
                                <Loader2 size={12} className="spin" />
                              ) : (
                                <ThumbsUp size={12} />
                              )}
                              {t({ de: "Freigeben", en: "Approve", tr: "Onayla" })}
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                color: "#ef4444",
                              }}
                              disabled={actionLoading === post.id}
                              onClick={() => handleReject(post.id)}
                            >
                              <ThumbsDown size={12} />
                              {t({ de: "Ablehnen", en: "Reject", tr: "Reddet" })}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ marginLeft: "auto" }}
                              onClick={() => openPostDetail(post.id)}
                            >
                              <Eye size={12} /> {t({ de: "Vorschau", en: "Preview", tr: "Önizleme" })}
                            </button>
                          </div>
                        )}

                        {/* Quick Action: Publish for approved */}
                        {post.status === "approved" && (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginTop: "12px",
                              paddingTop: "12px",
                              borderTop: "1px solid var(--border-color)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={actionLoading === post.id}
                              onClick={() => handlePublish(post.id)}
                            >
                              {actionLoading === post.id ? (
                                <Loader2 size={12} className="spin" />
                              ) : (
                                <PlayCircle size={12} />
                              )}
                              {t({ de: "Jetzt veröffentlichen", en: "Publish Now", tr: "Şimdi Yayınla" })}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ GENERATE TAB ═══ */}
          {activeTab === "generate" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* Mode Switcher */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {([
                  { key: "variants" as const, icon: Layers, label: t({ de: "Multi-Variante", en: "Multi-Variant", tr: "Çoklu Varyant" }), labelSub: t({ de: "3 Tonalitäten", en: "3 tone options", tr: "3 ton seçeneği" }) },
                  { key: "series" as const, icon: Target, label: t({ de: "Content-Serie", en: "Content Series", tr: "İçerik Serisi" }), labelSub: t({ de: "5 Blickwinkel", en: "5 angle ideas", tr: "5 bakış açısı" }) },
                  { key: "quick" as const, icon: Zap, label: t({ de: "Schnell generieren", en: "Quick Generate", tr: "Hızlı Oluştur" }), labelSub: t({ de: "einzelner Post", en: "single post", tr: "tek gönderi" }) },
                ]).map((mode) => (
                  <button
                    key={mode.key}
                    className={`btn btn-sm ${genMode === mode.key ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => {
                      setGenMode(mode.key);
                      setSeriesIdeaForVariants(null);
                    }}
                    type="button"
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px" }}
                  >
                    <mode.icon size={14} />
                    <span>{mode.label}</span>
                    <span style={{ fontSize: "10px", opacity: 0.7 }}>({mode.labelSub})</span>
                  </button>
                ))}
              </div>

              {/* ─── Variants Mode ─── */}
              {genMode === "variants" && !seriesIdeaForVariants && (
                <PostVariantPicker
                  companyId={companyId}
                  companyName={activeCompany?.name}
                  language={language}
                  onPostCreated={() => loadData()}
                />
              )}

              {/* ─── Series → Variants flow ─── */}
              {genMode === "variants" && seriesIdeaForVariants && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSeriesIdeaForVariants(null)}
                      type="button"
                    >
                      ← {t({ de: "Zurück zur Serie", en: "Back to Series", tr: "Seriye Dön" })}
                    </button>
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)" }}>
                      {t({ de: "Erstelle Varianten für:", en: "Creating variants for:", tr: "Varyantlar oluşturuluyor:" })} „{seriesIdeaForVariants.topic}"
                    </span>
                  </div>
                  <PostVariantPicker
                    companyId={companyId}
                    companyName={activeCompany?.name}
                    language={language}
                    initialTopic={seriesIdeaForVariants.topic}
                    initialPlatform={seriesIdeaForVariants.platform}
                    onPostCreated={() => loadData()}
                    key={seriesIdeaForVariants.topic}
                  />
                </div>
              )}

              {/* ─── Content Series Mode ─── */}
              {genMode === "series" && (
                <ContentSeriesPanel
                  companyId={companyId}
                  language={language}
                  onIdeaSelect={(idea, platform) => {
                    setSeriesIdeaForVariants({
                      topic: idea.title,
                      platform,
                    });
                    setGenMode("variants");
                  }}
                />
              )}

              {/* ─── Quick Generate Mode (legacy single-post) ─── */}
              {genMode === "quick" && (
              <div style={{ maxWidth: "720px" }}>
              <div className="card">
                <div className="card-header">
                  <div>
                    <div
                      className="card-title"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Sparkles size={18} style={{ color: "#8b5cf6" }} />
                      {t({ de: "KI-Post generieren", en: "Generate AI Post", tr: "Yapay Zeka Gönderisi Oluştur" })}
                    </div>
                    <div className="card-subtitle">
                      {t({
                        de: "Gib ein Thema ein und wähle eine Plattform. Die KI generiert Text, Bild und Hashtags.",
                        en: "Enter a topic and select a platform. AI will generate text, image and hashtags.",
                        tr: "Bir konu girin ve platform seçin. Yapay zeka metin, görsel ve hashtag oluşturacak.",
                      })}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {/* Topic Input */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 600,
                        color: "var(--text-tertiary)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                      }}
                    >
                      {t({ de: "Thema", en: "Topic", tr: "Konu" })}
                    </label>
                    <textarea
                      className="form-textarea"
                      value={genTopic}
                      onChange={(e) => setGenTopic(e.target.value)}
                      placeholder={
                        t({ de: 'z.B. „5 Tipps für bessere Team-Kommunikation im Homeoffice"', en: 'e.g. "5 tips for better team communication in remote work"', tr: 'ör. "Uzaktan çalışmada daha iyi ekip iletişimi için 5 ipucu"' })
                      }
                      style={{
                        minHeight: "80px",
                        fontSize: "var(--font-size-sm)",
                      }}
                      disabled={generating}
                    />
                  </div>

                  {/* Platform Select */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 600,
                        color: "var(--text-tertiary)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                      }}
                    >
                      {t({ de: "Plattform", en: "Platform", tr: "Platform" })}
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {(["linkedin", "instagram"] as const).map((p) => (
                        <button
                          key={p}
                          className={`btn btn-sm ${genPlatform === p ? "btn-primary" : "btn-ghost"}`}
                          onClick={() => setGenPlatform(p)}
                          disabled={generating}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                          }}
                        >
                          {p === "linkedin" ? (
                            <Linkedin size={16} />
                          ) : (
                            <Instagram size={16} />
                          )}
                          {p === "linkedin" ? "LinkedIn" : "Instagram"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={generating || !genTopic.trim()}
                    style={{ alignSelf: "flex-start", padding: "10px 24px" }}
                  >
                    {generating ? (
                      <>
                        <Loader2 size={16} className="spin" />{" "}
                        {t({ de: "Wird generiert...", en: "Generating...", tr: "Oluşturuluyor..." })}
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />{" "}
                        {t({ de: "Post generieren", en: "Generate Post", tr: "Gönderi Oluştur" })}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generation Result */}
              {genResult && (
                <div
                  className="card"
                  style={{ borderLeft: "3px solid #10b981" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <CheckCircle2
                      size={20}
                      style={{ color: "var(--color-success)" }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        {t({
                          de: "Post erfolgreich generiert!",
                          en: "Post Generated Successfully!",
                          tr: "Gönderi Başarıyla Oluşturuldu!",
                        })}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {t({
                          de: "Der Post ist jetzt ein Entwurf",
                          en: "The post is now a draft",
                          tr: "Gönderi şu anda bir taslak",
                        })}{" "}
                        · {genResult.platform}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openPostDetail(genResult.post_id)}
                    >
                      <Eye size={14} /> {t({ de: "Post ansehen", en: "View Post", tr: "Gönderiyi Gör" })}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setActiveTab("posts");
                        setStatusFilter("draft");
                      }}
                    >
                      {t({ de: "Zu den Posts", en: "Go to Posts", tr: "Gönderilere Git" })} →
                    </button>
                  </div>
                </div>
              )}
            </div>
              )}
            </div>
          )}

          {/* ═══ ACCOUNTS TAB ═══ */}
          {activeTab === "accounts" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">
                      {t({
                        de: "Verbundene Social-Accounts",
                        en: "Connected Social Accounts",
                        tr: "Bağlı Sosyal Hesaplar",
                      })}
                    </div>
                    <div className="card-subtitle">
                      {t({
                        de: "Verwalte deine LinkedIn- und Instagram-Verbindungen",
                        en: "Manage your LinkedIn and Instagram connections",
                        tr: "LinkedIn ve Instagram bağlantılarınızı yönetin",
                      })}
                    </div>
                  </div>
                  <a
                    href={`${SOCIAL_HUB_URL}/project/${encodeURIComponent(companyId)}/settings`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    <Link2 size={14} /> {t({ de: "Neu verbinden", en: "Connect New", tr: "Yeni Bağla" })}
                  </a>
                </div>

                {accounts.length === 0 ? (
                  <div
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <Link2
                      size={40}
                      style={{ marginBottom: "12px", opacity: 0.3 }}
                    />
                    <p
                      style={{
                        fontSize: "var(--font-size-sm)",
                        marginBottom: "16px",
                      }}
                    >
                      {t({
                        de: "Noch keine Social-Accounts verbunden. Verbinde deinen LinkedIn- oder Instagram-Account, um mit der Veröffentlichung zu beginnen.",
                        en: "No social accounts connected yet. Connect your LinkedIn or Instagram account to start publishing.",
                        tr: "Henüz sosyal hesap bağlanmadı. Yayınlamaya başlamak için LinkedIn veya Instagram hesabınızı bağlayın.",
                      })}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {accounts.map((acc) => {
                      const PIcon = PLATFORM_ICON[acc.platform] || Radio;
                      const ts =
                        TOKEN_STATUS_MAP[acc.token_status] ||
                        TOKEN_STATUS_MAP.ok;
                      const platformColor =
                        acc.platform === "linkedin" ? "#0077B5" : "#E4405F";
                      return (
                        <div
                          key={acc.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            padding: "16px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-color)",
                            borderLeft: `3px solid ${platformColor}`,
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "var(--radius-md)",
                              background: `${platformColor}15`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <PIcon size={22} style={{ color: platformColor }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "var(--font-size-sm)",
                                marginBottom: "2px",
                              }}
                            >
                              {acc.account_name || acc.platform}
                            </div>
                            <div
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-tertiary)",
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                              }}
                            >
                              <span style={{ textTransform: "capitalize" }}>
                                {acc.platform}
                              </span>
                              {acc.created_at && (
                                <span>
                                  {t({ de: "Verbunden", en: "Connected", tr: "Bağlandı" })}:{" "}
                                  {new Date(acc.created_at).toLocaleDateString(
                                    "de-DE",
                                  )}
                                </span>
                              )}
                              {acc.token_expires_at && (
                                <span>
                                  {t({ de: "Token läuft ab", en: "Token expires", tr: "Token süresi" })}:{" "}
                                  {new Date(
                                    acc.token_expires_at,
                                  ).toLocaleDateString("de-DE")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: ts.color,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "var(--font-size-sm)",
                                fontWeight: 600,
                                color: ts.color,
                              }}
                            >
                              {t(ts.label)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* OAuth Info */}
              <div
                className="card"
                style={{
                  background: "rgba(14,165,233,0.06)",
                  borderLeft: "3px solid #0ea5e9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <Shield
                    size={20}
                    style={{
                      color: "#0ea5e9",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "var(--font-size-sm)",
                        marginBottom: "4px",
                      }}
                    >
                      {t({
                        de: "Sichere OAuth-Verbindung",
                        en: "Secure OAuth Connection",
                        tr: "Güvenli OAuth Bağlantısı",
                      })}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                      }}
                    >
                      {t({
                        de: "Account-Tokens werden verschlüsselt gespeichert. Der Social Hub nutzt offizielle LinkedIn- und Instagram-APIs mit korrekten OAuth-2.0-Flows. Tokens werden automatisch vor Ablauf erneuert.",
                        en: "Account tokens are encrypted at rest. Social Hub uses official LinkedIn and Instagram APIs with proper OAuth 2.0 flows. Tokens are automatically refreshed before expiry.",
                        tr: "Hesap tokenları şifrelenmiş olarak saklanır. Social Hub, uygun OAuth 2.0 akışlarıyla resmi LinkedIn ve Instagram API'lerini kullanır. Tokenlar süresi dolmadan otomatik olarak yenilenir.",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ POST DETAIL MODAL ═══ */}
      {(selectedPost || detailLoading) && (
        <div
          className="modal-overlay"
          onClick={closePostDetail}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            className="modal animate-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              margin: 0,
              maxHeight: "90vh",
              width: "100%",
              maxWidth: "700px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-xl)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {detailLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "80px 0",
                }}
              >
                <Loader2
                  size={32}
                  className="spin"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </div>
            ) : (
              selectedPost && (
                <>
                  {/* Modal Header */}
                  <div
                    className="modal-header"
                    style={{ background: "var(--bg-surface)" }}
                  >
                    <div
                      className="modal-title"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <Radio
                        size={18}
                        style={{ color: "var(--color-primary)" }}
                      />
                      {t({ de: "Post-Details", en: "Post Details", tr: "Gönderi Detayları" })}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {selectedPost.platform_post_url && (
                        <a
                          href={selectedPost.platform_post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          <ExternalLink size={14} />{" "}
                          {t({ de: "Live ansehen", en: "View Live", tr: "Canlı Gör" })}
                        </a>
                      )}
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={closePostDetail}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div
                    className="modal-body"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      background: "var(--bg-base)",
                    }}
                  >
                    {/* Status & Platform */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "4px 12px",
                          borderRadius: "var(--radius-full)",
                          color: (
                            STATUS_BADGE[selectedPost.status] ||
                            STATUS_BADGE.draft
                          ).color,
                          background: (
                            STATUS_BADGE[selectedPost.status] ||
                            STATUS_BADGE.draft
                          ).bg,
                        }}
                      >
                        {t(
                          (
                            STATUS_BADGE[selectedPost.status] ||
                            STATUS_BADGE.draft
                          ).label
                        )}
                      </span>
                      {selectedPost.platform && (
                        <span
                          className="badge badge-info"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {selectedPost.platform === "linkedin" ? (
                            <Linkedin size={12} />
                          ) : (
                            <Instagram size={12} />
                          )}
                          {selectedPost.platform}
                        </span>
                      )}
                      {selectedPost.account_name && (
                        <span
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          → {selectedPost.account_name}
                        </span>
                      )}
                    </div>

                    {/* Topic */}
                    <h3
                      style={{
                        fontSize: "var(--font-size-lg)",
                        fontWeight: 700,
                        marginBottom: "16px",
                      }}
                    >
                      {selectedPost.topic || t({ de: "Ohne Titel", en: "Untitled", tr: "Başlıksız" })}
                    </h3>

                    {/* Platform Native Preview */}
                    {selectedPost.platform && (
                      <div
                        style={{
                          marginBottom: "16px",
                          padding: "16px",
                          background: "#0a0a0a",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "var(--font-size-xs)",
                            fontWeight: 600,
                            color: "var(--text-tertiary)",
                            marginBottom: "12px",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Eye size={12} />
                          {t({ de: "Plattform-Vorschau", en: "Platform Preview", tr: "Platform Önizleme" })}
                        </div>
                        {selectedPost.platform === "linkedin" ? (
                          <LinkedInPreview
                            authorName={activeCompany?.name || t({ de: "Ihr Unternehmen", en: "Your Company", tr: "Şirketiniz" })}
                            postText={selectedPost.post_text}
                            imageUrl={selectedPost.post_image_url}
                            hashtags={selectedPost.hashtags}
                          />
                        ) : (
                          <InstagramPreview
                            authorName={
                              activeCompany?.name?.toLowerCase().replace(/\s/g, "_") ||
                              t({ de: "ihr_unternehmen", en: "your_company", tr: "sirketiniz" })
                            }
                            postText={selectedPost.post_text}
                            imageUrl={selectedPost.post_image_url}
                            hashtags={selectedPost.hashtags}
                          />
                        )}
                      </div>
                    )}

                    {/* Image Preview */}
                    {selectedPost.post_image_url && (
                      <div
                        style={{
                          marginBottom: "16px",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                          border: "1px solid var(--border-color)",
                          maxHeight: "300px",
                        }}
                      >
                        <img
                          src={selectedPost.post_image_url}
                          alt="Post preview"
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            maxHeight: "300px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Post Text */}
                    <div className="card" style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          fontWeight: 600,
                          color: "var(--text-tertiary)",
                          marginBottom: "8px",
                          textTransform: "uppercase",
                        }}
                      >
                        {t({ de: "Post-Text", en: "Post Text", tr: "Gönderi Metni" })}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--font-size-sm)",
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                          color: "var(--text-primary)",
                        }}
                      >
                        {selectedPost.post_text}
                      </div>
                    </div>

                    {selectedPost.status !== "published" && (
                      <div
                        className="card"
                        style={{
                          marginBottom: "16px",
                          background: "rgba(14,165,233,0.04)",
                          borderLeft: "3px solid #0ea5e9",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "var(--font-size-xs)",
                            fontWeight: 600,
                            color: "#0ea5e9",
                            marginBottom: "8px",
                            textTransform: "uppercase",
                          }}
                        >
                          {t({
                            de: "Neu generieren und verbessern",
                            en: "Retry and Improve",
                            tr: "Yeniden Oluştur ve İyileştir",
                          })}
                        </div>
                        <textarea
                          className="form-textarea"
                          value={regenerateInstruction}
                          onChange={(e) =>
                            setRegenerateInstruction(e.target.value)
                          }
                          placeholder={
                            t({
                              de: "z.B. Mach den Text prägnanter, konkreter und pointierter für LinkedIn.",
                              en: "e.g. Make it sharper, more concrete, and more opinionated for LinkedIn.",
                              tr: "ör. LinkedIn için daha keskin, somut ve fikirli yap.",
                            })
                          }
                          style={{ minHeight: "72px", marginBottom: "10px" }}
                        />
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleRegenerateText}
                            disabled={
                              actionLoading ===
                                `regenerate-text:${selectedPost.id}` ||
                              !regenerateInstruction.trim()
                            }
                          >
                            {actionLoading ===
                            `regenerate-text:${selectedPost.id}` ? (
                              <Loader2 size={14} className="spin" />
                            ) : (
                              <RefreshCw size={14} />
                            )}
                            {t({ de: "Text neu generieren", en: "Regenerate Text", tr: "Metni Yeniden Oluştur" })}
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={handleRegenerateImage}
                            disabled={
                              actionLoading ===
                              `regenerate-image:${selectedPost.id}`
                            }
                          >
                            {actionLoading ===
                            `regenerate-image:${selectedPost.id}` ? (
                              <Loader2 size={14} className="spin" />
                            ) : (
                              <ImageIcon size={14} />
                            )}
                            {t({ de: "Bild neu generieren", en: "Regenerate Image", tr: "Görseli Yeniden Oluştur" })}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Hashtags */}
                    {selectedPost.hashtags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                          marginBottom: "16px",
                        }}
                      >
                        {selectedPost.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "3px 10px",
                              borderRadius: "var(--radius-full)",
                              background: "rgba(14,165,233,0.1)",
                              color: "#0ea5e9",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Value Comment */}
                    {selectedPost.auto_comment_text && (
                      <div
                        className="card"
                        style={{
                          marginBottom: "16px",
                          background: "rgba(139,92,246,0.06)",
                          borderLeft: "3px solid #8b5cf6",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <MessageSquare
                            size={14}
                            style={{ color: "#8b5cf6" }}
                          />
                          <span
                            style={{
                              fontSize: "var(--font-size-xs)",
                              fontWeight: 600,
                              color: "#8b5cf6",
                              textTransform: "uppercase",
                            }}
                          >
                            Value Comment
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "var(--font-size-sm)",
                            color: "var(--text-secondary)",
                            lineHeight: 1.6,
                          }}
                        >
                          {selectedPost.auto_comment_text}
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {selectedPost.error_message && (
                      <div
                        style={{
                          padding: "12px 16px",
                          marginBottom: "16px",
                          borderRadius: "var(--radius-md)",
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <AlertCircle
                          size={16}
                          style={{ color: "#ef4444", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: "var(--font-size-sm)",
                            color: "#ef4444",
                          }}
                        >
                          {selectedPost.error_message}
                        </span>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="card" style={{ marginBottom: "0" }}>
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          fontWeight: 600,
                          color: "var(--text-tertiary)",
                          marginBottom: "12px",
                          textTransform: "uppercase",
                        }}
                      >
                        {t({ de: "Metadaten", en: "Metadata", tr: "Meta Veriler" })}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "130px 1fr",
                          gap: "8px",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        <div style={{ color: "var(--text-tertiary)" }}>
                          {t({ de: "Erstellt", en: "Created", tr: "Oluşturuldu" })}:
                        </div>
                        <div>
                          {selectedPost.created_at
                            ? new Date(selectedPost.created_at).toLocaleString(
                                "de-DE",
                              )
                            : "–"}
                        </div>

                        {selectedPost.scheduled_at && (
                          <>
                            <div style={{ color: "var(--text-tertiary)" }}>
                              {t({ de: "Geplant", en: "Scheduled", tr: "Planlandı" })}:
                            </div>
                            <div>
                              {new Date(
                                selectedPost.scheduled_at,
                              ).toLocaleString("de-DE")}
                            </div>
                          </>
                        )}
                        {selectedPost.approved_at && (
                          <>
                            <div style={{ color: "var(--text-tertiary)" }}>
                              {t({ de: "Freigegeben", en: "Approved", tr: "Onaylandı" })}:
                            </div>
                            <div>
                              {new Date(
                                selectedPost.approved_at,
                              ).toLocaleString("de-DE")}
                            </div>
                          </>
                        )}
                        {selectedPost.published_at && (
                          <>
                            <div style={{ color: "var(--text-tertiary)" }}>
                              {t({ de: "Veröffentlicht", en: "Published", tr: "Yayınlandı" })}:
                            </div>
                            <div>
                              {new Date(
                                selectedPost.published_at,
                              ).toLocaleString("de-DE")}
                            </div>
                          </>
                        )}
                        {selectedPost.notes && (
                          <>
                            <div style={{ color: "var(--text-tertiary)" }}>
                              {t({ de: "Notizen", en: "Notes", tr: "Notlar" })}:
                            </div>
                            <div style={{ whiteSpace: "pre-wrap" }}>
                              {selectedPost.notes}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer - Actions */}
                  <div
                    className="modal-footer"
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "flex-end",
                      flexWrap: "wrap",
                    }}
                  >
                    {selectedPost.status === "draft" && (
                      <>
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                          }}
                          disabled={actionLoading === selectedPost.id}
                          onClick={() => handleReject(selectedPost.id)}
                        >
                          <ThumbsDown size={14} /> {t({ de: "Ablehnen", en: "Reject", tr: "Reddet" })}
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading === selectedPost.id}
                          onClick={() => handleApprove(selectedPost.id)}
                        >
                          {actionLoading === selectedPost.id ? (
                            <Loader2 size={14} className="spin" />
                          ) : (
                            <ThumbsUp size={14} />
                          )}
                          {t({ de: "Freigeben", en: "Approve", tr: "Onayla" })}
                        </button>
                      </>
                    )}
                    {selectedPost.status === "rejected" && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading === selectedPost.id}
                        onClick={() => handleApprove(selectedPost.id)}
                      >
                        {actionLoading === selectedPost.id ? (
                          <Loader2 size={14} className="spin" />
                        ) : (
                          <ThumbsUp size={14} />
                        )}
                        {t({ de: "Erneut freigeben", en: "Re-approve", tr: "Tekrar Onayla" })}
                      </button>
                    )}
                    {selectedPost.status === "approved" && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading === selectedPost.id}
                        onClick={() => handlePublish(selectedPost.id)}
                      >
                        {actionLoading === selectedPost.id ? (
                          <Loader2 size={14} className="spin" />
                        ) : (
                          <PlayCircle size={14} />
                        )}
                        {t({ de: "Jetzt veröffentlichen", en: "Publish Now", tr: "Şimdi Yayınla" })}
                      </button>
                    )}
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
