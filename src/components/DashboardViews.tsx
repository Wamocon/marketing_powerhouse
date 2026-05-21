import {
  ArrowUpRight,
  Clock,
  FileEdit,
  Radio,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";
import { useSubscription } from "../context/SubscriptionContext";
import {
  checkSocialHubHealth,
  listPosts,
  type ScheduledPost,
} from "../lib/socialHub";
import { hasSocialHubPlanEntitlement } from "../lib/socialHubEntitlements";
import type { ContentItem, Task } from "../types";
import {
  BudgetOverview,
  buildDashboardStats,
  CustomTooltip,
  getTaskColorLogic,
} from "./DashboardComponents";

interface DashboardViewProps {
  navigate: (path: string) => void;
  tasks: Task[];
  contents: ContentItem[];
  setSelectedTask: (t: Task) => void;
  setSelectedContent: (c: ContentItem) => void;
  currentUser?: { name: string; role: string } | null;
}

export function AdminDashboard({
  navigate,
  setSelectedTask: _st,
  setSelectedContent: _sc,
}: DashboardViewProps) {
  const {
    campaigns,
    activityFeed,
    dashboardChartData,
    channelPerformance,
    budgetData,
  } = useData();
  const { can } = useAuth();
  const { activeCompany } = useCompany();
  const { language } = useLanguage();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const t = (tr: { de: string; en: string; tr: string }) => tr[language];
  const dateLocale = language === "de" ? "de-DE" : language === "tr" ? "tr-TR" : "en-US";
  const canSocialHubRole = can("canUseSocialHub");
  const hasSocialHubPlanAccess = hasSocialHubPlanEntitlement(subscription);
  const canSocialHub = canSocialHubRole && hasSocialHubPlanAccess;
  const showSocialHubUpgrade =
    canSocialHubRole && !subscriptionLoading && !hasSocialHubPlanAccess;
  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const stats = buildDashboardStats(dashboardChartData, budgetData);

  // Live Social Hub stats
  const [shOnline, setShOnline] = useState<boolean | null>(null);
  const [shPosts, setShPosts] = useState<ScheduledPost[]>([]);
  useEffect(() => {
    if (!canSocialHub || !activeCompany?.id) return;
    let cancelled = false;
    (async () => {
      try {
        await checkSocialHubHealth();
        if (!cancelled) setShOnline(true);
        const posts = await listPosts({
          companyId: activeCompany.id,
          limit: 200,
        });
        if (!cancelled) setShPosts(posts);
      } catch {
        if (!cancelled) {
          setShOnline(false);
          setShPosts([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCompany?.id, canSocialHub]);
  return (
    <>
      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`stat-card ${stat.color}`}>
              <div className="stat-card-header">
                <span className="stat-card-label">{stat.label}</span>
                <div className={`stat-card-icon ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-card-value">{stat.value}</div>
              <div
                className={`stat-card-change ${stat.positive ? "positive" : "negative"}`}
              >
                {stat.positive ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {stat.change} {t({ de: "vs. Vormonat", en: "vs. last month", tr: "önceki aya göre" })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="content-grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{t({ de: "Performance-Trend", en: "Performance Trend", tr: "Performans Trendi" })}</div>
              <div className="card-subtitle">{t({ de: "Letzte 7 Wochen", en: "Last 7 weeks", tr: "Son 7 hafta" })}</div>
            </div>
            <div className="flex gap-sm">
              <button className="btn btn-ghost btn-sm">{t({ de: "Impressionen", en: "Impressions", tr: "Gösterimler" })}</button>
              <button className="btn btn-ghost btn-sm">{t({ de: "Klicks", en: "Clicks", tr: "Tıklamalar" })}</button>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardChartData}>
                <defs>
                  <linearGradient
                    id="gradientImpressions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="gradientClicks"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.06)"
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  name={t({ de: "Impressionen", en: "Impressions", tr: "Gösterimler" })}
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#gradientImpressions)"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name={t({ de: "Klicks", en: "Clicks", tr: "Tıklamalar" })}
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#gradientClicks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{t({ de: "Kanal-Performance", en: "Channel Performance", tr: "Kanal Performansı" })}</div>
              <div className="card-subtitle">{t({ de: "Anteil am Gesamtergebnis", en: "Share of total results", tr: "Toplam sonuçlardaki pay" })}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div style={{ width: 200, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {channelPerformance.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {channelPerformance.map((channel) => (
                <div
                  key={channel.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: channel.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "var(--font-size-sm)", flex: 1 }}>
                    {channel.name}
                  </span>
                  <span
                    style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}
                  >
                    {channel.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{t({ de: "Aktive Kampagnen", en: "Active Campaigns", tr: "Aktif Kampanyalar" })}</div>
              <div className="card-subtitle">
                {activeCampaigns.length} {t({ de: "Kampagnen laufen", en: "campaigns running", tr: "kampanya çalışıyor" })}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/campaigns")}
            >
              {t({ de: "Alle anzeigen", en: "View all", tr: "Tümünü göster" })} <ArrowUpRight size={14} />
            </button>
          </div>
          {activeCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              style={{
                padding: "16px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)",
                marginBottom: "8px",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-elevated)")
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}
                >
                  {campaign.name}
                </span>
                <span className="badge badge-success">{t({ de: "Aktiv", en: "Active", tr: "Aktif" })}</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: "8px" }}>
                <div
                  className="progress-bar-fill primary"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-tertiary)",
                }}
              >
                <span>{campaign.progress}% {t({ de: "abgeschlossen", en: "completed", tr: "tamamlandı" })}</span>
                <span>
                  €{campaign.spent.toLocaleString(dateLocale)} / €
                  {campaign.budget.toLocaleString(dateLocale)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{t({ de: "Aktivitäts-Feed", en: "Activity Feed", tr: "Aktivite Akışı" })}</div>
              <div className="card-subtitle">{t({ de: "Neueste Aktivitäten im Team", en: "Latest team activities", tr: "Ekipteki son aktiviteler" })}</div>
            </div>
          </div>
          <div>
            {activityFeed.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {activity.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "var(--font-size-sm)" }}>
                    <strong>{activity.user}</strong> {activity.action}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-tertiary)",
                      marginTop: "2px",
                    }}
                  >
                    {activity.target} · {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BudgetOverview navigate={navigate} />

      {/* Social Hub Quick Access – Live Stats */}
      {canSocialHub && (
        <div className="card">
          <div className="card-header">
            <div>
              <div
                className="card-title"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Radio size={18} style={{ color: "var(--color-primary)" }} />{" "}
                Social Hub
              </div>
              <div className="card-subtitle">
                {t({ de: "KI-gestützte Social-Media-Veröffentlichung", en: "AI-powered social media publishing", tr: "Yapay zeka destekli sosyal medya yayıncılığı" })}
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/social-hub")}
            >
              {t({ de: "Öffnen", en: "Open", tr: "Aç" })} <ArrowUpRight size={14} />
            </button>
          </div>
          {(() => {
            const published = shPosts.filter(
              (p) => p.status === "published",
            ).length;
            const drafts = shPosts.filter(
              (p) => p.status === "draft" || p.status === "generated",
            ).length;
            const scheduled = shPosts.filter(
              (p) => p.status === "approved" || p.status === "scheduled",
            ).length;
            const lastPublished = shPosts
              .filter((p) => p.published_at)
              .sort((a, b) =>
                (b.published_at || "").localeCompare(a.published_at || ""),
              )[0];
            return (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {/* Connection status */}
                <div
                  style={{
                    flex: "1 1 100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-elevated)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background:
                        shOnline === null
                          ? "var(--text-tertiary)"
                          : shOnline
                            ? "var(--color-success)"
                            : "#ef4444",
                      boxShadow: shOnline
                        ? "0 0 6px rgba(16,185,129,0.4)"
                        : "none",
                    }}
                  />
                  {shOnline === null
                    ? t({ de: "Verbindung wird geprüft\u2026", en: "Checking connection\u2026", tr: "Bağlantı kontrol ediliyor\u2026" })
                    : shOnline
                      ? t({ de: "Social Hub verbunden", en: "Social Hub connected", tr: "Social Hub bağlı" })
                      : t({ de: "Social Hub offline - Momentum läuft weiter", en: "Social Hub offline - Momentum continues", tr: "Social Hub çevrimdışı - Momentum devam ediyor" })}
                </div>
                {/* Stats tiles */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(16,185,129,0.06)",
                      textAlign: "center",
                    }}
                  >
                    <Send
                      size={16}
                      style={{
                        color: "var(--color-success)",
                        marginBottom: "4px",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "var(--font-size-lg)",
                        fontWeight: 700,
                      }}
                    >
                      {published}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {t({ de: "Veröffentlicht", en: "Published", tr: "Yayınlandı" })}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(14,165,233,0.06)",
                      textAlign: "center",
                    }}
                  >
                    <FileEdit
                      size={16}
                      style={{ color: "#0ea5e9", marginBottom: "4px" }}
                    />
                    <div
                      style={{
                        fontSize: "var(--font-size-lg)",
                        fontWeight: 700,
                      }}
                    >
                      {drafts}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {t({ de: "Entwürfe", en: "Drafts", tr: "Taslaklar" })}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(139,92,246,0.06)",
                      textAlign: "center",
                    }}
                  >
                    <Clock
                      size={16}
                      style={{ color: "#8b5cf6", marginBottom: "4px" }}
                    />
                    <div
                      style={{
                        fontSize: "var(--font-size-lg)",
                        fontWeight: 700,
                      }}
                    >
                      {scheduled}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {t({ de: "Geplant", en: "Scheduled", tr: "Planlanmış" })}
                    </div>
                  </div>
                </div>
                {/* Last published */}
                {lastPublished && (
                  <div
                    style={{
                      flex: "1 1 100%",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-tertiary)",
                      padding: "6px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-elevated)",
                    }}
                  >
                    {t({ de: "Letzter Post", en: "Last post", tr: "Son gönderi" })}:{" "}
                    <strong style={{ color: "var(--text-secondary)" }}>
                      {lastPublished.topic}
                    </strong>{" "}
                    ({lastPublished.platform}) –{" "}
                    {new Date(lastPublished.published_at!).toLocaleDateString(
                      dateLocale,
                      {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {showSocialHubUpgrade && (
        <div className="card">
          <div className="card-header">
            <div>
              <div
                className="card-title"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Radio size={18} style={{ color: "var(--color-primary)" }} />{" "}
                Social Hub
              </div>
              <div className="card-subtitle">
                {t({ de: "Ab Pro verfügbar", en: "Available from Pro", tr: "Pro'dan itibaren kullanılabilir" })}
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/settings?tab=subscription")}
            >
              {t({ de: "Upgrade", en: "Upgrade", tr: "Yükselt" })} <ArrowUpRight size={14} />
            </button>
          </div>
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-md)",
              background: "rgba(193, 41, 46, 0.04)",
              border: "1px solid rgba(193, 41, 46, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>
              {t({ de: "KI-Social-Publishing für wachsende Teams", en: "AI social publishing for growing teams", tr: "Büyüyen ekipler için yapay zeka sosyal yayıncılığı" })}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-tertiary)",
              }}
            >
              {t({ de: "Mit Pro generierst du Social Drafts aus Momentum, steuerst Freigaben zentral und veröffentlichst direkt aus deinem Workflow.", en: "With Pro, you generate social drafts from Momentum, manage approvals centrally, and publish inside one workflow.", tr: "Pro ile Momentum'dan sosyal taslaklar oluşturur, onayları merkezi olarak yönetir ve iş akışından doğrudan yayınlarsın." })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ManagerDashboard({
  navigate,
  tasks,
  contents,
  setSelectedTask,
  setSelectedContent,
}: DashboardViewProps) {
  const { campaigns: mgrCampaigns } = useData();
  const { language } = useLanguage();
  const t = (tr: { de: string; en: string; tr: string }) => tr[language];
  const dateLocale = language === "de" ? "de-DE" : language === "tr" ? "tr-TR" : "en-US";
  const activeCampaigns = mgrCampaigns.filter((c) => c.status === "active");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">{t({ de: "Kampagnen & Aufgaben-Übersicht", en: "Campaigns & Tasks Overview", tr: "Kampanyalar ve Görevlere Genel Bakış" })}</div>
            <div className="card-subtitle">
              {t({ de: "Verfolgung des Content- und Aufgabenstatus für aktive Kampagnen.", en: "Tracking content and task status for active campaigns.", tr: "Aktif kampanyalar için içerik ve görev durumunun takibi." })}
            </div>
          </div>
        </div>

        {activeCampaigns.map((camp) => {
          const campContents = contents.filter((c) => c.campaignId === camp.id);
          return (
            <div
              key={camp.id}
              style={{
                marginBottom: "24px",
                padding: "20px",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-surface)",
              }}
            >
              <h3
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 700,
                  marginBottom: "16px",
                  color: "var(--text-primary)",
                }}
              >
                {camp.name}
              </h3>
              {campContents.length === 0 ? (
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {t({ de: "Kein Content zugeordnet.", en: "No content assigned.", tr: "Atanmış içerik yok." })}
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {campContents.map((cnt) => {
                    const cntTasks = tasks.filter(
                      (t) => cnt.taskIds && cnt.taskIds.includes(t.id),
                    );
                    return (
                      <div
                        key={cnt.id}
                        style={{
                          background: "var(--bg-hover)",
                          padding: "16px",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "var(--font-size-sm)",
                            fontWeight: 600,
                            marginBottom: "12px",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                          }}
                          onClick={() => setSelectedContent(cnt)}
                        >
                          {cnt.title}
                        </h4>
                        {cntTasks.length === 0 ? (
                          <div
                            style={{
                              padding: "10px",
                              borderLeft: "4px solid var(--color-danger)",
                              background: "var(--color-danger-bg)",
                              borderRadius: "4px",
                              fontSize: "var(--font-size-xs)",
                            }}
                          >
                            {t({ de: "Keine Aufgaben verknüpft! (Kritisch)", en: "No tasks linked! (Critical)", tr: "Bağlı görev yok! (Kritik)" })}
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            {cntTasks.map((task) => {
                              const { color, label } = getTaskColorLogic(
                                task.dueDate,
                              );
                              return (
                                <div
                                  key={task.id}
                                  style={{
                                    padding: "12px",
                                    borderLeft: `4px solid ${color}`,
                                    background: "var(--bg-elevated)",
                                    borderRadius: "var(--radius-sm)",
                                    boxShadow: "var(--shadow-sm)",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      marginBottom: "6px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "var(--font-size-xs)",
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                        textUnderlineOffset: "2px",
                                      }}
                                      onClick={() => setSelectedTask(task)}
                                    >
                                      {task.title}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        color: color,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {label}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    {task.assignee} | {t({ de: "Fällig:", en: "Due:", tr: "Teslim:" })}{" "}
                                    {task.dueDate
                                      ? new Date(task.dueDate).toLocaleDateString(
                                          dateLocale,
                                        )
                                      : t({ de: "Kein Datum", en: "No date", tr: "Tarih yok" })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <BudgetOverview navigate={navigate} />
    </div>
  );
}

export function MemberDashboard({
  tasks,
  currentUser,
  setSelectedTask,
}: DashboardViewProps) {
  const myTasks = tasks.filter((t) => t.assignee === currentUser?.name);
  const { language } = useLanguage();
  const t = (tr: { de: string; en: string; tr: string }) => tr[language];
  const dateLocale = language === "de" ? "de-DE" : language === "tr" ? "tr-TR" : "en-US";
  const sortedTasks = [...myTasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );

  return (
    <div className="card">
      <div className="card-header" style={{ marginBottom: "16px" }}>
        <div>
          <div className="card-title">{t({ de: "Meine zugewiesenen Aufgaben", en: "My Assigned Tasks", tr: "Bana Atanan Görevler" })}</div>
          <div className="card-subtitle">
            {t({ de: "Alle To-Dos priorisiert nach Fälligkeit", en: "All to-dos prioritized by due date", tr: "Tüm yapılacaklar teslim tarihine göre önceliklendirilmiş" })}
          </div>
        </div>
      </div>
      {sortedTasks.length === 0 ? (
        <p
          className="text-secondary"
          style={{ color: "var(--text-secondary)" }}
        >
          {t({ de: "Aktuell stehen keine Aufgaben an.", en: "No tasks pending at the moment.", tr: "\u015eu anda bekleyen g\u00f6rev yok." })}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sortedTasks.map((task) => {
            const { color, bgColor, label } = getTaskColorLogic(task.dueDate);
            return (
              <div
                key={task.id}
                style={{
                  padding: "16px",
                  borderLeft: `6px solid ${color}`,
                  background: bgColor || "var(--bg-elevated)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedTask(task)}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "var(--font-size-md)",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {task.title}
                  </h4>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t({ de: "Fällig am:", en: "Due:", tr: "Teslim tarihi:" })}{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString(dateLocale)
                      : t({ de: "Kein Datum", en: "No date", tr: "Tarih yok" })}
                    &nbsp;-&nbsp; {t({ de: "Status:", en: "Status:", tr: "Durum:" })}{" "}
                    <span
                      style={{ textTransform: "uppercase", fontSize: "10px" }}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 700,
                      color: color,
                      background: "var(--bg-surface)",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: `1px solid ${color}`,
                    }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
