// ─── User & Auth Types ─────────────────────────────────────

/** Per-company role assigned via company_members table */
export type CompanyRole = 'company_admin' | 'manager' | 'member';

/** Legacy-compatible Role type — includes all assignable roles */
export type Role = 'company_admin' | 'manager' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  isSuperAdmin: boolean;
  jobTitle: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  department: string;
  phone: string;
  joinedAt: string;
}

export interface RoleConfig {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  description: string;
}

// ─── Company / Multi-Tenancy Types ─────────────────────────

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  industry: string;
  createdAt: string;
  createdBy: string;
}

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyRole;
  joinedAt: string;
  /** Populated via join for display purposes */
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  userStatus?: User['status'];
  userIsSuperAdmin?: boolean;
}

export type PermissionKey =
  | 'canEditPositioning'
  | 'canEditCompanyKeywords'
  | 'canManageUsers'
  | 'canManageSettings'
  | 'canManageCompany'
  | 'canCreateCampaigns'
  | 'canEditCampaigns'
  | 'canViewAllCampaigns'
  | 'canDeleteItems'
  | 'canManageTouchpoints'
  | 'canEditAudiences'
  | 'canViewAudiences'
  | 'canSeeBudget'
  | 'canEditBudget'
  | 'canAssignTasks'
  | 'canCreateCampaignTasks'
  | 'canEditAllTasks'
  | 'canEditOwnTasks'
  | 'canEditContent';

export type PermissionMap = Record<PermissionKey, boolean>;

// ─── Campaign Types ────────────────────────────────────────

export interface CampaignKpis {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
}

export interface ChannelKpi {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  spend: number;
  cpc: number;
  cpa: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'planned' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  channels: string[];
  touchpointIds?: string[];
  description: string;
  masterPrompt: string;
  targetAudiences: string[];
  campaignKeywords: string[];
  kpis: CampaignKpis;
  channelKpis?: Record<string, ChannelKpi>;
  owner: string;
  progress: number;
  responsibleManagerId: string;
  teamMemberIds: string[];
}

// ─── Task Types ────────────────────────────────────────────

export type TaskStatus =
  | 'draft'
  | 'ai_generating'
  | 'ai_ready'
  | 'revision'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'live'
  | 'monitoring'
  | 'analyzed';

export interface TaskPerformance {
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface AnalysisResult {
  verdict: 'good' | 'needs_improvement';
  text: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  author: string;
  dueDate: string;
  publishDate?: string | null;
  platform: string | null;
  touchpointId?: string | null;
  type: string;
  oneDriveLink?: string;
  description: string;
  campaignId: string | null;
  scope?: string;
  performance?: TaskPerformance | null;
  aiSuggestion?: string;
  aiPrompt?: string;
  analysisResult?: AnalysisResult | null;
}

// ─── Content Types ─────────────────────────────────────────

export type ContentStatus =
  | 'idea'
  | 'planning'
  | 'production'
  | 'ready'
  | 'scheduled'
  | 'published';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  status: ContentStatus;
  publishDate: string | null;
  platform: string;
  touchpointId?: string | null;
  campaignId: string | null;
  taskIds: string[];
  author: string;
  contentType: string;
  journeyPhase: string;
  createdAt: string;
}

export interface ContentStatusConfig {
  label: string;
  color: string;
  icon: string;
}

// ─── Audience Types ────────────────────────────────────────

export interface Audience {
  id: string;
  name: string;
  type: string;
  segment: 'B2C' | 'B2B';
  color: string;
  initials: string;
  age: string;
  gender: string;
  location: string;
  income: string;
  education: string;
  jobTitle: string;
  interests: string[];
  painPoints: string[];
  goals: string[];
  preferredChannels: string[];
  buyingBehavior: string;
  decisionProcess: string;
  journeyPhase: string;
  description: string;
  campaignIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Touchpoint Types ──────────────────────────────────────

export interface TouchpointKpis {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  spend: number;
  cpc: number;
  cpa: number;
}

export interface Touchpoint {
  id: string;
  name: string;
  type: string;
  journeyPhase: string;
  url: string;
  status: 'active' | 'planned' | 'inactive';
  description: string;
  kpis?: TouchpointKpis;
}

// ─── Plan & Subscription Types ─────────────────────────────

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;    // cents
  priceYearly: number;     // cents
  maxSeats: number;
  maxProjects: number;
  includedSocialAccounts: number;
  features: PlanFeatures;
  isActive: boolean;
  sortOrder: number;
}

export interface PlanFeatures {
  core: boolean;
  ai_pro: boolean;
  linkedin: boolean;
  instagram: boolean;
  max_ai_generations_month: number;   // -1 = unlimited
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused';
export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  currentSeats: number;
  currentProjects: number;
  extraSocialAccounts: number;
  billingCycle: BillingCycle;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
  // Joined data
  plan?: Plan;
}

// ─── Publishing & Social Account Types ─────────────────────

export type SocialPlatform = 'linkedin' | 'instagram' | 'telegram' | 'twitter';

export interface ConnectedAccount {
  id: string;
  companyId: string;
  platform: SocialPlatform;
  accountName: string;
  accountId: string;
  platformUserId?: string;
  tokenExpiresAt?: string;
  tokenScopes: string[];
  isActive: boolean;
  metadata: Record<string, unknown>;
  connectedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type ScheduledPostStatus =
  | 'draft'
  | 'text_generating' | 'text_ready'
  | 'image_generating' | 'ready_for_review'
  | 'approved' | 'scheduled'
  | 'publishing' | 'published'
  | 'failed' | 'canceled';

export type PostType = 'text' | 'image' | 'carousel' | 'video' | 'reel';

export interface ScheduledPost {
  id: string;
  companyId: string;
  contentItemId?: string;
  connectedAccountId: string;
  postText: string;
  postImageUrl?: string;
  postType: PostType;
  hashtags: string[];
  scheduledAt: string;
  publishedAt?: string;
  status: ScheduledPostStatus;
  platformPostId?: string;
  platformPostUrl?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  autoCommentText?: string;
  autoCommentPosted: boolean;
  autoCommentAt?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Joined data
  connectedAccount?: ConnectedAccount;
  engagementMetrics?: EngagementMetric[];
}

export interface EngagementMetric {
  id: string;
  scheduledPostId: string;
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  saves: number;
  videoViews: number;
  engagementRate: number;
  rawData: Record<string, unknown>;
  pulledAt: string;
}

export interface EngagementGroup {
  id: string;
  companyId: string;
  platform: 'telegram' | 'whatsapp';
  groupName: string;
  chatId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── AI Knowledge Base Types ───────────────────────────────

export type KnowledgeCategory =
  | 'brand_voice' | 'persona' | 'past_post' | 'product'
  | 'guideline' | 'style_reference' | 'industry' | 'faq';

export interface KnowledgeDocument {
  id: string;
  companyId: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  source: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  // Only present in search results
  similarity?: number;
}

export type AiOutputFormat = 'text' | 'json' | 'image_url';

export interface AiGenerationLog {
  id: string;
  companyId: string;
  taskId?: string;
  scheduledPostId?: string;
  modelUsed: string;
  promptTemplate: string;
  contextDocumentsUsed: string[];
  inputTokenCount?: number;
  output: string;
  outputTokenCount?: number;
  outputFormat: AiOutputFormat;
  userRating?: number;
  userFeedback?: string;
  wasAccepted?: boolean;
  costCents: number;
  latencyMs: number;
  generatedBy?: string;
  createdAt: string;
}

// ─── Usage Metering Types ──────────────────────────────────

export type UsageMetric =
  | 'ai_generation' | 'image_generation'
  | 'post_published' | 'seat_count'
  | 'social_account_count' | 'project_count';

export interface UsageRecord {
  id: string;
  companyId: string;
  subscriptionId: string;
  metric: UsageMetric;
  quantity: number;
  periodStart: string;
  periodEnd: string;
  recordedAt: string;
}

export * from './dashboard';
