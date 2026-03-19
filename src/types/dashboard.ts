
// ─── Positioning Types ─────────────────────────────────────

export interface CompanyValue {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface ToneOfVoice {
  adjectives: string[];
  description: string;
  personality: string;
}

export interface CompanyPositioning {
  name: string;
  tagline: string;
  founded: string;
  industry: string;
  headquarters: string;
  legalForm: string;
  employees: string;
  website: string;
  vision: string;
  mission: string;
  values: CompanyValue[];
  toneOfVoice: ToneOfVoice;
  dos: string[];
  donts: string[];
  primaryMarket: string;
  secondaryMarkets: string[];
  targetCompanySize: string;
  targetIndustries: string[];
  lastUpdated: string;
  updatedBy: string;
}

export interface CompanyKeyword {
  id: string;
  term: string;
  category: string;
  description: string;
}

// ─── Budget Types ──────────────────────────────────────────

export interface BudgetCategory {
  name: string;
  planned: number;
  spent: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  planned: number;
  actual: number;
}

export interface BudgetData {
  total: number;
  spent: number;
  remaining: number;
  categories: BudgetCategory[];
  monthlyTrend: MonthlyTrend[];
}

// ─── Journey Types ─────────────────────────────────────────

export interface JourneyMetric {
  label: string;
  value: string;
  trend: string;
}

export interface JourneyStage {
  id: string;
  phase: string;
  title: string;
  description: string;
  touchpoints: string[];
  contentFormats: string[];
  emotions: string[];
  painPoints: string[];
  metrics: JourneyMetric;
  contentIds?: string[];
}

export interface AsidasJourney {
  id: string;
  name: string;
  audienceId: string;
  description: string;
  stages: JourneyStage[];
}

// ─── Activity & Dashboard Types ────────────────────────────

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
}

export interface ChartDataPoint {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface ChannelPerformanceItem {
  name: string;
  value: number;
  color: string;
}

// ─── Misc Types ────────────────────────────────────────────

export type ContentTypeColors = Record<string, string>;
