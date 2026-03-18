// ─── User & Auth Types ─────────────────────────────────────

export type Role = 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
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

export type PermissionKey =
  | 'canEditPositioning'
  | 'canEditCompanyKeywords'
  | 'canManageUsers'
  | 'canManageSettings'
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

export * from './dashboard';
