// ─── Import / Export Schema Types ──────────────────────────
// Used for project, campaign, and audience import/export between Momentum instances.

import type { CompanyPositioning, CompanyKeyword, BudgetCategory } from './dashboard';

// ─── Questionnaire Field Metadata ──────────────────────────

export interface QuestionnaireField {
  key: string;
  label: { de: string; en: string };
  description: { de: string; en: string };
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'array' | 'object' | 'boolean';
  required: boolean;
  options?: string[];
  example?: unknown;
}

export interface QuestionnaireSection {
  id: string;
  title: { de: string; en: string };
  description: { de: string; en: string };
  fields: QuestionnaireField[];
}

// ─── Project Import/Export ──────────────────────────────────

export interface ProjectExportData {
  _meta: ExportMeta;
  project: {
    name: string;
    description: string;
    industry: string;
    logo: string;
  };
  positioning: CompanyPositioning | null;
  keywords: Omit<CompanyKeyword, 'id'>[];
  budgetCategories: Omit<BudgetCategory, 'id'>[];
}

// ─── Campaign Import/Export ────────────────────────────────

export interface CampaignExportData {
  _meta: ExportMeta;
  campaign: {
    name: string;
    status: 'active' | 'planned' | 'completed' | 'paused';
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    channels: string[];
    description: string;
    masterPrompt: string;
    targetAudiences: string[];
    campaignKeywords: string[];
    kpis: { impressions: number; clicks: number; conversions: number; ctr: number };
    channelKpis?: Record<string, {
      impressions: number; clicks: number; conversions: number;
      ctr: number; spend: number; cpc: number; cpa: number;
    }>;
    progress: number;
  };
}

// ─── Audience Import/Export ────────────────────────────────

export interface AudienceExportData {
  _meta: ExportMeta;
  audience: {
    name: string;
    type: string;
    segment: 'B2C' | 'B2B';
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
  };
}

// ─── Shared Meta ───────────────────────────────────────────

export interface ExportMeta {
  version: string;
  type: 'project' | 'campaign' | 'audience';
  exportedAt: string;
  appName: string;
}

// ─── Validation ────────────────────────────────────────────

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export type ImportLevel = 'project' | 'campaign' | 'audience';
