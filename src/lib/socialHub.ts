// Social Hub API client for Momentum App
// This module provides functions to communicate with the Social Hub microservice.

import { supabase } from './supabase';

const SOCIAL_HUB_URL = process.env.NEXT_PUBLIC_SOCIAL_HUB_URL || '/social-hub';
const SOCIAL_HUB_BRIDGE_URL = '/api/social-hub';
const MOMENTUM_SESSION_KEY = 'momentum_session_user_id';

type SocialHubMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface SocialHubBridgePayload {
  userId: string;
  companyId: string;
  path: string;
  method: SocialHubMethod;
  body?: unknown;
}

function getMomentumSessionUserId(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(MOMENTUM_SESSION_KEY) ?? '';
}

async function socialHubFetch<T>(path: string, options: { method: SocialHubMethod; companyId: string; body?: unknown }): Promise<T> {
  const userId = getMomentumSessionUserId();
  if (!userId) {
    throw new Error('Authentication required');
  }

  const payload: SocialHubBridgePayload = {
    userId,
    companyId: options.companyId,
    path,
    method: options.method,
  };

  if (options.body !== undefined) {
    payload.body = options.body;
  }

  const response = await fetch(SOCIAL_HUB_BRIDGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(body.detail || body.error || `Social Hub error: ${response.status}`);
  }
  return response.json();
}

// ─── Generate AI Post ──────────────────────────────────────

export interface GeneratePostParams {
  companyId: string;
  platform: 'linkedin' | 'instagram';
  topic?: string;
  contentItemId?: string;
  connectedAccountId?: string;
}

export interface GeneratePostResult {
  post_id: string;
  topic: string;
  platform: string;
  status: string;
  message: string;
}

export async function generateAiPost(params: GeneratePostParams): Promise<GeneratePostResult> {
  return socialHubFetch<GeneratePostResult>('/api/v1/generate', {
    method: 'POST',
    companyId: params.companyId,
    body: {
      company_id: params.companyId,
      platform: params.platform,
      topic: params.topic || '',
      content_item_id: params.contentItemId,
      connected_account_id: params.connectedAccountId,
    },
  });
}

// ─── Publish Post ──────────────────────────────────────────

export interface PublishResult {
  post_id: string;
  status: string;
  platform_post_id: string | null;
  message: string;
}

export async function publishPost(companyId: string, postId: string): Promise<PublishResult> {
  return socialHubFetch<PublishResult>(`/api/v1/publish/${postId}`, {
    method: 'POST',
    companyId,
  });
}

// ─── Get Readiness ─────────────────────────────────────────

export interface ReadinessResult {
  score: number;
  items: Array<{ label: string; state: string; detail: string }>;
}

export async function getReadiness(companyId: string): Promise<ReadinessResult> {
  return socialHubFetch<ReadinessResult>(`/api/v1/readiness/${companyId}`, {
    method: 'GET',
    companyId,
  });
}

// ─── Suggest Topics ────────────────────────────────────────

export async function suggestTopics(companyId: string, count = 5): Promise<string[]> {
  const result = await socialHubFetch<{ topics: string[] }>('/api/v1/topics/suggest', {
    method: 'POST',
    companyId,
    body: { company_id: companyId, count },
  });
  return result.topics;
}

// ─── Regenerate Text ───────────────────────────────────────

export interface RegeneratePostTextResult {
  body: string;
  hashtags: string[];
  auto_comment_text: string | null;
  image_prompt: string | null;
  retry_count?: number;
}

export async function regeneratePostText(companyId: string, postId: string, instruction: string): Promise<RegeneratePostTextResult> {
  return socialHubFetch<RegeneratePostTextResult>(`/api/v1/regenerate-text/${postId}`, {
    method: 'POST',
    companyId,
    body: { instruction },
  });
}

// ─── Regenerate Image ──────────────────────────────────────

export async function regeneratePostImage(companyId: string, postId: string): Promise<void> {
  await socialHubFetch(`/api/v1/regenerate-image/${postId}`, {
    method: 'POST',
    companyId,
  });
}

// ─── Health Check ──────────────────────────────────────────

export async function checkSocialHubHealth(): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${SOCIAL_HUB_URL}/api/v1/health`, { signal: controller.signal });
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── List Posts ────────────────────────────────────────────

export interface ScheduledPost {
  id: string;
  topic: string;
  status: string;
  platform: string | null;
  campaign_id: string | null;
  task_id: string | null;
  content_item_id: string | null;
  connected_account_id: string | null;
  post_text: string;
  post_image_url: string | null;
  hashtags: string[];
  auto_comment_text: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string | null;
}

export interface ListPostsParams {
  companyId: string;
  status?: string;
  campaignId?: string;
  taskId?: string;
  contentItemId?: string;
  platform?: string;
  limit?: number;
}

export async function listPosts(companyIdOrParams: string | ListPostsParams, status?: string): Promise<ScheduledPost[]> {
  const params = typeof companyIdOrParams === 'string'
    ? { companyId: companyIdOrParams, status }
    : companyIdOrParams;

  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.campaignId) qs.set('campaign_id', params.campaignId);
  if (params.taskId) qs.set('task_id', params.taskId);
  if (params.contentItemId) qs.set('content_item_id', params.contentItemId);
  if (params.platform) qs.set('platform', params.platform);
  if (params.limit) qs.set('limit', String(params.limit));
  const queryString = qs.toString() ? `?${qs.toString()}` : '';
  return socialHubFetch<ScheduledPost[]>(`/api/v1/posts/${params.companyId}${queryString}`, {
    method: 'GET',
    companyId: params.companyId,
  });
}

// ─── Post Detail ───────────────────────────────────────────

export interface PostDetail {
  id: string;
  company_id: string;
  topic: string;
  status: string;
  platform: string | null;
  account_name: string | null;
  connected_account_id: string | null;
  campaign_id: string | null;
  task_id: string | null;
  content_item_id: string | null;
  post_text: string;
  post_image_url: string | null;
  post_type: string;
  hashtags: string[];
  auto_comment_text: string | null;
  image_prompt: string | null;
  sources: string;
  notes: string;
  platform_post_url: string | null;
  error_message: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function getPostDetail(companyId: string, postId: string): Promise<PostDetail> {
  return socialHubFetch<PostDetail>(`/api/v1/posts/${companyId}/${postId}`, {
    method: 'GET',
    companyId,
  });
}

// ─── Approve / Reject ──────────────────────────────────────

export interface ApproveRejectResult {
  id: string;
  status: string;
  approved_at?: string;
}

export async function approvePost(companyId: string, postId: string, userId: string, notes?: string): Promise<ApproveRejectResult> {
  return socialHubFetch<ApproveRejectResult>(`/api/v1/posts/${postId}/approve`, {
    method: 'PUT',
    companyId,
    body: { user_id: userId, notes: notes || '' },
  });
}

export async function rejectPost(companyId: string, postId: string, userId: string, notes?: string): Promise<ApproveRejectResult> {
  return socialHubFetch<ApproveRejectResult>(`/api/v1/posts/${postId}/reject`, {
    method: 'PUT',
    companyId,
    body: { user_id: userId, notes: notes || '' },
  });
}

// ─── Connected Accounts ────────────────────────────────────

export interface ConnectedAccount {
  id: string;
  platform: string;
  account_name: string;
  account_id: string;
  token_status: 'ok' | 'expiring_soon' | 'expired';
  token_expires_at: string | null;
  connected_by: string | null;
  created_at: string | null;
}

export async function getConnectedAccounts(companyId: string): Promise<ConnectedAccount[]> {
  return socialHubFetch<ConnectedAccount[]>(`/api/v1/accounts/${companyId}`, {
    method: 'GET',
    companyId,
  });
}

// ─── Generate from Task ────────────────────────────────────

export interface GenerateFromTaskParams {
  companyId: string;
  taskId?: string;
  taskTitle: string;
  taskDescription?: string;
  platform?: 'linkedin' | 'instagram';
  campaignId?: string;
  campaignName?: string;
  campaignGoal?: string;
  taskType?: string;
  publishDate?: string | null;
  targetAudience?: string;
  tone?: string;
  brandName?: string;
  brandIndustry?: string;
  brandTagline?: string;
  brandTone?: string;
  brandDos?: string[];
  brandDonts?: string[];
  keywords?: string[];
  journeyPhase?: string;
  language?: string;
}

export interface GenerateFromTaskResult {
  post_id: string;
  post_text: string;
  post_image_url: string | null;
  hashtags: string[];
  auto_comment_text: string | null;
  image_prompt: string;
  status: string;
  platform: string;
}

export async function generateFromTask(params: GenerateFromTaskParams): Promise<GenerateFromTaskResult> {
  return socialHubFetch<GenerateFromTaskResult>('/api/v1/generate-from-task', {
    method: 'POST',
    companyId: params.companyId,
    body: {
      company_id: params.companyId,
      task_id: params.taskId || '',
      task_title: params.taskTitle,
      task_description: params.taskDescription || '',
      platform: params.platform || 'linkedin',
      campaign_id: params.campaignId || '',
      campaign_name: params.campaignName || '',
      campaign_goal: params.campaignGoal || '',
      task_type: params.taskType || '',
      publish_date: params.publishDate || '',
      target_audience: params.targetAudience || '',
      tone: params.tone || '',
      brand_name: params.brandName || '',
      brand_industry: params.brandIndustry || '',
      brand_tagline: params.brandTagline || '',
      brand_tone: params.brandTone || '',
      brand_dos: params.brandDos || [],
      brand_donts: params.brandDonts || [],
      keywords: params.keywords || [],
      journey_phase: params.journeyPhase || '',
      language: params.language || 'de',
    },
  });
}

// ─── Open Social Hub Dashboard ─────────────────────────────

export { SOCIAL_HUB_URL };

export function getSocialHubDashboardUrl(companyId: string): string {
  return `${SOCIAL_HUB_URL}/project/${encodeURIComponent(companyId)}`;
}

// ─── Real-time Subscription ────────────────────────────────

/**
 * Subscribe to real-time changes on `scheduled_posts` for a company.
 * Returns an unsubscribe function.
 */
export function subscribeToPostChanges(
  companyId: string,
  onPostChange: () => void,
): () => void {
  const channel = supabase
    .channel(`scheduled_posts:${companyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: '*',
        table: 'scheduled_posts',
        filter: `company_id=eq.${companyId}`,
      },
      () => {
        onPostChange();
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
