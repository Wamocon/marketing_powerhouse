import {
  ArrowLeft,
  Edit,
  Globe,
  MoreVertical,
  Plus,
  Radio,
  Share2,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  CREATIVE_STATES,
  CreativeCard,
  PLATFORM_ICONS,
  statusConfig,
  statusSteps,
} from "../components/CampaignDetailComponents";
import ChannelKpiSection from "../components/ChannelKpiSection";
import ContentDetailModal from "../components/ContentDetailModal";
import NewContentModal from "../components/NewContentModal";
import PageHelp from "../components/PageHelp";
import TaskDetailModal from "../components/TaskDetailModal";
import { useAuth } from "../context/AuthContext";
import { CONTENT_STATUSES, useContents } from "../context/ContentContext";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";
import { useSubscription } from "../context/SubscriptionContext";
import { useTasks } from "../context/TaskContext";
import { useProjectRouter } from "../hooks/useProjectRouter";
import { CONTENT_TYPE_COLORS } from "../lib/constants";
import { hasSocialHubPlanEntitlement } from "../lib/socialHubEntitlements";
import type { ContentItem, Task } from "../types";

import {
  CampaignOverviewTab,
  NewCreativeModal,
} from "../components/CampaignDetailTabs";
// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useProjectRouter();
  const { can } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { language, locale } = useLanguage();
  const t = (tr: { de: string; en: string; tr: string }) => tr[language];
  const {
    campaigns,
    audiences,
    users: testUsers,
    touchpoints,
    deleteCampaign,
    loading,
  } = useData();
  const canDelete = can("canDeleteItems");
  const canSocialHubRole = can("canUseSocialHub");
  const hasSocialHubPlanAccess = hasSocialHubPlanEntitlement(subscription);
  const canSocialHub = canSocialHubRole && hasSocialHubPlanAccess;
  const showSocialHubUpgrade =
    canSocialHubRole && !subscriptionLoading && !hasSocialHubPlanAccess;
  const campaign = campaigns.find((c) => c.id === id);
  const status = campaign
    ? statusConfig[campaign.status]
    : statusConfig.planned;
  const linkedAudiences = audiences.filter((a) =>
    campaign?.targetAudiences?.includes(a.id),
  );

  // ─── Tabs ───
  const [activeTab, setActiveTab] = useState("overview");

  // ─── Master Prompt ───
  const [masterPromptExpanded, setMasterPromptExpanded] = useState(false);
  const [promptEditMode, setPromptEditMode] = useState(false);
  const [promptValue, setPromptValue] = useState(campaign?.masterPrompt || "");

  // ─── Keywords ───
  const [kwList, setKwList] = useState(campaign?.campaignKeywords || []);
  const [newKw, setNewKw] = useState("");
  const [addingKw, setAddingKw] = useState(false);

  // ─── Creatives / Aufgaben ───
  const { tasks, addTask, updateTaskStatus, analyzeTask } = useTasks();
  const { contents } = useContents();
  const creatives = tasks.filter((t) => t.campaignId === id);
  const campaignContents = contents.filter((c) => c.campaignId === id);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedCampaignContent, setSelectedCampaignContent] =
    useState<ContentItem | null>(null);
  const [showNewCampaignContent, setShowNewCampaignContent] = useState(false);

  const [showNewCreativeModal, setShowNewCreativeModal] = useState(false);
  const [newCreative, setNewCreative] = useState({
    title: "",
    platform: "",
    type: "Post",
    description: "",
    scope: "single",
  });

  // ─── Handlers ───
  const handleStatusChange = (creativeId, newStatus) => {
    updateTaskStatus(creativeId, newStatus);
  };

  const handleAnalyze = (creativeId) => {
    analyzeTask(creativeId);
  };
  const handleAddCreative = () => {
    if (!newCreative.title.trim()) return;
    addTask({
      ...newCreative,
      platform: newCreative.scope === "all" ? null : newCreative.platform,
      status: "draft" as import("../types").TaskStatus,
      assignee: testUsers[3]?.name || "Unzugewiesen",
      author: "Anna Schmidt", // Mock author
      campaignId: id || null,
      dueDate: new Date().toISOString().split("T")[0],
      publishDate: null,
      oneDriveLink: "",
      touchpointId: undefined,
      performance: null,
      aiSuggestion: undefined,
      analysisResult: null,
    });
    setNewCreative({
      title: "",
      platform: "",
      type: "Post",
      description: "",
      scope: "single",
    });
    setShowNewCreativeModal(false);
  };

  const addKeyword = () => {
    if (newKw.trim() && !kwList.includes(newKw.trim())) {
      setKwList([...kwList, newKw.trim()]);
      setNewKw("");
      setAddingKw(false);
    }
  };

  // ─── Derived ───
  const singlePlatformCreatives = creatives.filter((c) => c.scope === "single");
  const allPlatformCreatives = creatives.filter((c) => c.scope === "all");

  // ═══════════════════ RENDER ═══════════════════
  if (loading) {
    return (
      <div className="animate-in">
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">
            {t({ de: "Kampagne wird geladen...", en: "Loading campaign...", tr: "Kampanya yükleniyor..." })}
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="animate-in">
        <button
          className="btn btn-ghost"
          onClick={() => router.push("/campaigns")}
          style={{ marginBottom: "16px" }}
        >
          <ArrowLeft size={16} />{" "}
          {t({ de: "Zurück zu Kampagnen", en: "Back to Campaigns", tr: "Kampanyalara dön" })}
        </button>
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">
            {t({ de: "Kampagne nicht gefunden", en: "Campaign Not Found", tr: "Kampanya bulunamadı" })}
          </div>
          <div className="empty-state-text">
            {t({
              de: `Die Kampagne mit der ID "${id}" existiert nicht.`,
              en: `The campaign with ID "${id}" does not exist.`,
              tr: `"${id}" ID'li kampanya mevcut değil.`,
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Back + Title */}
      <div style={{ marginBottom: "24px" }}>
        <button
          className="btn btn-ghost"
          onClick={() => router.push("/campaigns")}
          style={{ marginBottom: "16px" }}
        >
          <ArrowLeft size={16} />{" "}
          {t({ de: "Zurück zu Kampagnen", en: "Back to Campaigns", tr: "Kampanyalara dön" })}
        </button>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div className="page-header-left">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1 className="page-title">{campaign.name}</h1>
              <span className={`badge ${status.badge}`}>{status.label}</span>
            </div>
            <p className="page-subtitle">{campaign.description}</p>
          </div>
          <div className="page-header-actions">
            <PageHelp
              title={t({ de: "Kampagnen-Details", en: "Campaign Details", tr: "Kampanya Detayları" })}
            >
              <p style={{ marginBottom: "12px" }}>
                {t({
                  de: "Die Detailansicht einer Kampagne bündelt alle relevanten Workstreams zu diesem Projekt.",
                  en: "The campaign detail view bundles all relevant workstreams for this project.",
                  tr: "Kampanya detay görünümü, bu projeye ait tüm ilgili iş akışlarını bir araya getirir.",
                })}
              </p>
              <ul className="help-list">
                <li>
                  <strong>{t({ de: "Übersicht:", en: "Overview:", tr: "Genel Bakış:" })}</strong>{" "}
                  {t({
                    de: "Zusammenfassung von Zielgruppen, Keywords, Timing und Kampagnenzielen.",
                    en: "Summary of linked audiences, keywords, timing, and campaign goals.",
                    tr: "Hedef kitleler, anahtar kelimeler, zamanlama ve kampanya hedeflerinin özeti.",
                  })}
                </li>
                <li>
                  <strong>
                    {t({ de: "Manager & Team:", en: "Manager & Team:", tr: "Yönetici & Ekip:" })}
                  </strong>{" "}
                  {t({
                    de: "Zeigt verantwortlichen Manager und beteiligte Team-Mitglieder.",
                    en: "Shows responsible manager and planned team members.",
                    tr: "Sorumlu yöneticiyi ve planlanan ekip üyelerini gösterir.",
                  })}
                </li>
                <li>
                  <strong>
                    {t({ de: "Creatives & Aufgaben:", en: "Creatives & Tasks:", tr: "Yaratıcı İçerikler & Görevler:" })}
                  </strong>{" "}
                  {t({
                    de: "Mini-Kanban für kreative Umsetzung und Produktionsfortschritt.",
                    en: "Mini kanban for creative execution and production progress.",
                    tr: "Yaratıcı içerik üretimi ve üretim ilerlemesi için mini kanban.",
                  })}
                </li>
                <li>
                  <strong>{t({ de: "Content:", en: "Content:", tr: "İçerik:" })}</strong>{" "}
                  {t({
                    de: "Alle geplanten Beiträge für diese Kampagne mit Aufgaben-Verknüpfung.",
                    en: "All planned content for this campaign with task linkage.",
                    tr: "Bu kampanya için görev bağlantılı tüm planlanmış içerikler.",
                  })}
                </li>
                <li>
                  <strong>{t({ de: "Performance:", en: "Performance:", tr: "Performans:" })}</strong>{" "}
                  {t({
                    de: "Kanal-KPIs mit Impressionen, Klicks, CTR, Conversions und Spend.",
                    en: "Channel KPIs for impressions, clicks, CTR, conversions, and spend.",
                    tr: "Gösterimler, tıklamalar, CTR, dönüşümler ve harcama için kanal KPI'ları.",
                  })}
                </li>
              </ul>
            </PageHelp>
            {canDelete && (
              <button
                className="btn btn-ghost"
                style={{ color: "#ef4444" }}
                onClick={async () => {
                  if (
                    window.confirm(
                      t({
                        de: "Möchtest du diese Kampagne wirklich löschen?",
                        en: "Do you really want to delete this campaign?",
                        tr: "Bu kampanyayı gerçekten silmek istiyor musun?",
                      }),
                    )
                  ) {
                    await deleteCampaign(campaign.id);
                    router.push("/campaigns");
                  }
                }}
              >
                <Trash2 size={16} /> {t({ de: "Löschen", en: "Delete", tr: "Sil" })}
              </button>
            )}
            <button className="btn btn-secondary">
              <Edit size={16} /> {t({ de: "Bearbeiten", en: "Edit", tr: "Düzenle" })}
            </button>
            <button className="btn btn-ghost btn-icon">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-title" style={{ marginBottom: "16px" }}>
          {t({ de: "Kampagnen-Status", en: "Campaign Status", tr: "Kampanya Durumu" })}
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {statusSteps.map((step, idx) => (
            <div key={step} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  height: "6px",
                  borderRadius: "var(--radius-full)",
                  background:
                    idx <= status.steps
                      ? "var(--color-primary)"
                      : "var(--bg-active)",
                  marginBottom: "8px",
                }}
              />
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color:
                    idx <= status.steps
                      ? "var(--text-primary)"
                      : "var(--text-tertiary)",
                  fontWeight: idx === status.steps ? 600 : 400,
                }}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: "24px" }}>
        {[
          { id: "overview", label: t({ de: "Übersicht", en: "Overview", tr: "Genel Bakış" }) },
          {
            id: "creatives",
            label: t({
              de: `Creatives & Aufgaben (${creatives.length})`,
              en: `Creatives & Tasks (${creatives.length})`,
              tr: `Yaratıcı İçerikler & Görevler (${creatives.length})`,
            }),
          },
          { id: "content", label: `${t({ de: "Content", en: "Content", tr: "İçerik" })} (${campaignContents.length})` },
          { id: "performance", label: t({ de: "Performance", en: "Performance", tr: "Performans" }) },
        ].map((t) => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: OVERVIEW ═══ */}
      {activeTab === "overview" && (
        <CampaignOverviewTab
          campaign={campaign}
          linkedAudiences={linkedAudiences}
          navigate={router.push}
          can={can}
          kwList={kwList}
          setKwList={setKwList}
          newKw={newKw}
          setNewKw={setNewKw}
          addingKw={addingKw}
          setAddingKw={setAddingKw}
          addKeyword={addKeyword}
          masterPromptExpanded={masterPromptExpanded}
          setMasterPromptExpanded={setMasterPromptExpanded}
          promptEditMode={promptEditMode}
          setPromptEditMode={setPromptEditMode}
          promptValue={promptValue}
          setPromptValue={setPromptValue}
        />
      )}
      {activeTab === "creatives" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>
                Creatives & {t({ de: "Aufgaben", en: "Tasks", tr: "Görevler" })}
              </h2>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-tertiary)",
                }}
              >
                {t({
                  de: "Erstelle, reviewe und veröffentliche Inhalte für diese Kampagne",
                  en: "Create, review, and publish assets for this campaign",
                  tr: "Bu kampanya için içerikleri oluşturun, inceleyin ve yayınlayın",
                })}
              </p>
            </div>
            {can("canCreateCampaignTasks") && (
              <button
                className="btn btn-primary"
                onClick={() => setShowNewCreativeModal(true)}
              >
                <Plus size={16} />{" "}
                {t({ de: "Neues Creative", en: "New Creative", tr: "Yeni Yaratıcı İçerik" })}
              </button>
            )}
          </div>

          {/* Workflow Legend */}
          <div
            className="card"
            style={{ marginBottom: "20px", padding: "12px 16px" }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                color: "var(--text-tertiary)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              CREATIVE WORKFLOW
            </div>
            <div
              style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {Object.entries(CREATIVE_STATES).map(([key, s], i) => (
                <div
                  key={key}
                  style={{ display: "flex", alignItems: "center", gap: "2px" }}
                >
                  <span
                    style={{
                      fontSize: "0.6rem",
                      padding: "2px 6px",
                      borderRadius: "var(--radius-full)",
                      background: `${s.color}18`,
                      color: s.color,
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </span>
                  {i < Object.keys(CREATIVE_STATES).length - 1 && (
                    <span
                      style={{
                        color: "var(--text-tertiary)",
                        fontSize: "0.7rem",
                      }}
                    >
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social Hub CTA for campaigns with social channels */}
          {canSocialHub &&
            campaign.channels.some(
              (ch) => ch === "LinkedIn" || ch === "Instagram",
            ) && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "16px 20px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(14, 165, 233, 0.04)",
                  border: "1px solid rgba(14, 165, 233, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(14, 165, 233, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Share2 size={20} style={{ color: "#0ea5e9" }} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      Social Hub
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {t({
                        de: `Generiere und veröffentliche KI-Posts für ${campaign.channels.filter((ch) => ch === "LinkedIn" || ch === "Instagram").join(" & ")}`,
                        en: `Generate and publish AI posts for ${campaign.channels.filter((ch) => ch === "LinkedIn" || ch === "Instagram").join(" & ")}`,
                        tr: `${campaign.channels.filter((ch) => ch === "LinkedIn" || ch === "Instagram").join(" & ")} için yapay zeka gönderileri oluşturun ve yayınlayın`,
                      })}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => router.push("/social-hub")}
                >
                  <Radio size={14} />{" "}
                  {t({ de: "Social Hub öffnen", en: "Open Social Hub", tr: "Social Hub'\u0131 aç" })}
                </button>
              </div>
            )}

          {showSocialHubUpgrade &&
            campaign.channels.some(
              (ch) => ch === "LinkedIn" || ch === "Instagram",
            ) && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "16px 20px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(193, 41, 46, 0.04)",
                  border: "1px solid rgba(193, 41, 46, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(193, 41, 46, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Share2
                      size={20}
                      style={{ color: "var(--color-primary)" }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      {t({ de: "Social Hub ab Pro", en: "Social Hub from Pro", tr: "Pro'dan itibaren Social Hub" })}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {t({
                        de: "Upgrade auf Pro oder Ultimate, um aus dieser Kampagne direkt Social Posts zu generieren und zu veröffentlichen.",
                        en: "Upgrade to Pro or Ultimate to generate and publish social posts directly from this campaign.",
                        tr: "Bu kampanyadan doğrudan sosyal medya gönderileri oluşturmak ve yayınlamak için Pro veya Ultimate'e yükseltin.",
                      })}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => router.push("/settings?tab=subscription")}
                >
                  <Radio size={14} />{" "}
                  {t({ de: "Auf Pro upgraden", en: "Upgrade to Pro", tr: "Pro'ya yükseltin" })}
                </button>
              </div>
            )}

          {/* All-Platform Creatives */}
          {allPlatformCreatives.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Globe size={14} />{" "}
                {t({
                  de: "Übergreifende Aufgaben (alle Plattformen)",
                  en: "Cross-platform tasks (all platforms)",
                  tr: "Platformlar arası görevler (tüm platformlar)",
                })}
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                {allPlatformCreatives.map((c) => (
                  <CreativeCard
                    key={c.id}
                    creative={c}
                    onStatusChange={handleStatusChange}
                    onAnalyze={handleAnalyze}
                    onClick={() => setSelectedTask(c)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Per-Platform Creatives */}
          {campaign.channels.map((ch) => {
            const platformCreatives = singlePlatformCreatives.filter(
              (c) => c.platform === ch,
            );
            if (platformCreatives.length === 0) return null;
            const ChIcon = PLATFORM_ICONS[ch] || Globe;
            return (
              <div key={ch} style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 600,
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ChIcon size={14} /> {ch}
                </div>
                <div style={{ display: "grid", gap: "12px" }}>
                  {platformCreatives.map((c) => (
                    <CreativeCard
                      key={c.id}
                      creative={c}
                      onStatusChange={handleStatusChange}
                      onAnalyze={handleAnalyze}
                      onClick={() => setSelectedTask(c)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {creatives.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🎨</div>
                <div className="empty-state-title">
                  {t({ de: "Noch keine Creatives", en: "No Creatives Yet", tr: "Henüz Yaratıcı İçerik Yok" })}
                </div>
                <div className="empty-state-text">
                  {t({
                    de: "Erstelle dein erstes Creative, um den KI-gestützten Workflow zu starten.",
                    en: "Create your first creative to start the AI-supported workflow.",
                    tr: "Yapay zeka destekli iş akışını başlatmak için ilk yaratıcı içeriğinizi oluşturun.",
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ TAB: CONTENT ═══ */}
      {activeTab === "content" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>
              {t({
                de: `Kampagnen-Content (${campaignContents.length})`,
                en: `Campaign Content (${campaignContents.length})`,
                tr: `Kampanya İçeriği (${campaignContents.length})`,
              })}
            </h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNewCampaignContent(true)}
            >
              <Plus size={14} />{" "}
              {t({ de: "Content hinzufügen", en: "Add Content", tr: "İçerik ekle" })}
            </button>
          </div>
          {campaignContents.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <div className="empty-state-title">
                  {t({ de: "Noch kein Content", en: "No Content Yet", tr: "Henüz İçerik Yok" })}
                </div>
                <div className="empty-state-text">
                  {t({
                    de: "Erstelle Content-Einträge für diese Kampagne, um die Redaktionsplanung zu starten.",
                    en: "Create content items for this campaign to start editorial planning.",
                    tr: "Editöryal planlamayı başlatmak için bu kampanya için içerik girişleri oluşturun.",
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "14px",
              }}
            >
              {campaignContents.map((cnt) => {
                const cst = CONTENT_STATUSES[cnt.status];
                const hasTasks = cnt.taskIds && cnt.taskIds.length > 0;
                return (
                  <div
                    key={cnt.id}
                    className="card"
                    onClick={() => setSelectedCampaignContent(cnt)}
                    style={{
                      cursor: "pointer",
                      padding: "16px",
                      transition: "all 0.2s",
                      borderLeft: hasTasks
                        ? `3px solid ${cst?.color}`
                        : "3px solid #ef4444",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow = "var(--shadow-md)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow = "var(--shadow-sm)")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        {cnt.title}
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: `${cst?.color}18`,
                          color: cst?.color,
                          border: `1px solid ${cst?.color}33`,
                          fontSize: "0.65rem",
                          flexShrink: 0,
                        }}
                      >
                        {cst?.icon} {cst?.label}
                      </span>
                    </div>
                    {cnt.description && (
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--text-secondary)",
                          marginBottom: "10px",
                          lineHeight: 1.5,
                        }}
                      >
                        {cnt.description.length > 80
                          ? cnt.description.slice(0, 80) + "…"
                          : cnt.description}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "8px",
                      }}
                    >
                      <span
                        className={`badge badge-${CONTENT_TYPE_COLORS[cnt.contentType] || "info"}`}
                        style={{ fontSize: "0.6rem" }}
                      >
                        {cnt.platform}
                      </span>
                      {hasTasks ? (
                        <span
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "var(--color-success)",
                          }}
                        >
                          ✅ {cnt.taskIds.length}{" "}
                          {t({ de: "Aufgabe(n)", en: "task(s)", tr: "görev" })}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "#ef4444",
                            fontWeight: 600,
                          }}
                        >
                          ⚠ {t({ de: "Keine Aufgaben", en: "No Tasks", tr: "Görev Yok" })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {selectedCampaignContent && (
            <ContentDetailModal
              content={selectedCampaignContent}
              onClose={() => setSelectedCampaignContent(null)}
            />
          )}
          {showNewCampaignContent && (
            <NewContentModal
              onClose={() => setShowNewCampaignContent(false)}
              defaultCampaignId={id}
            />
          )}
        </>
      )}

      {/* ═══ TAB: PERFORMANCE ═══ */}
      {activeTab === "performance" && (
        <>
          {/* Aggregate KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div className="stat-card success">
              <span className="stat-card-label">
                {t({ de: "Impressionen", en: "Impressions", tr: "Gösterimler" })}
              </span>
              <span className="stat-card-value">
                {campaign.kpis.impressions.toLocaleString(locale)}
              </span>
            </div>
            <div className="stat-card info">
              <span className="stat-card-label">
                {t({ de: "Klicks", en: "Clicks", tr: "Tıklamalar" })}
              </span>
              <span className="stat-card-value">
                {campaign.kpis.clicks.toLocaleString(locale)}
              </span>
            </div>
            <div className="stat-card warning">
              <span className="stat-card-label">
                {t({ de: "Conversions", en: "Conversions", tr: "Dönüşümler" })}
              </span>
              <span className="stat-card-value">
                {campaign.kpis.conversions.toLocaleString(locale)}
              </span>
            </div>
            <div className="stat-card primary">
              <span className="stat-card-label">CTR</span>
              <span className="stat-card-value">{campaign.kpis.ctr}%</span>
            </div>
          </div>

          {/* Channel KPI Breakdown */}
          {campaign.channelKpis &&
          Object.keys(campaign.channelKpis).length > 0 ? (
            <div className="card" style={{ padding: "20px" }}>
              <ChannelKpiSection
                channelKpis={campaign.channelKpis}
                touchpoints={touchpoints}
                title={
                  t({
                    de: "Performance nach Kanal / Touchpoint",
                    en: "Performance by Channel / Touchpoint",
                    tr: "Kanala / Temas Noktasına Göre Performans",
                  })
                }
              />
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">
                  {t({ de: "Keine Kanal-KPIs", en: "No Channel KPIs", tr: "Kanal KPI'ları Yok" })}
                </div>
                <div className="empty-state-text">
                  {t({
                    de: "Für diese Kampagne liegen noch keine kanalspezifischen Performance-Daten vor.",
                    en: "No channel-specific performance data is available for this campaign yet.",
                    tr: "Bu kampanya için henüz kanala özgü performans verileri mevcut değil.",
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ MODAL: New Creative ═══ */}
      {showNewCreativeModal && (
        <NewCreativeModal
          campaign={campaign}
          newCreative={newCreative}
          setNewCreative={setNewCreative}
          onClose={() => setShowNewCreativeModal(false)}
          onSubmit={handleAddCreative}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
