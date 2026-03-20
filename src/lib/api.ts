import { supabase } from './supabase';
import type {
  User, Campaign, Task, TaskStatus, ContentItem, ContentStatus,
  Audience, Touchpoint, AsidasJourney, JourneyStage,
  Company, CompanyMember, CompanyRole,
  Plan, Subscription, ConnectedAccount, SocialPlatform,
  ScheduledPost, EngagementMetric, EngagementGroup,
  KnowledgeDocument, AiGenerationLog,
} from '../types';
import type {
  CompanyPositioning, CompanyKeyword, BudgetData, BudgetCategory,
  MonthlyTrend, ActivityItem, TeamMember, ChartDataPoint,
  ChannelPerformanceItem,
} from '../types/dashboard';

// ─── Helper ────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

// Converts snake_case DB rows to camelCase used in app types
function toCamelUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    password: r.password as string,
    role: r.role as User['role'],
    isSuperAdmin: (r.is_super_admin as boolean) ?? false,
    jobTitle: r.job_title as string,
    avatar: r.avatar as string,
    status: r.status as User['status'],
    department: r.department as string,
    phone: r.phone as string,
    joinedAt: r.joined_at as string,
  };
}

function toCamelTouchpoint(r: Record<string, unknown>): Touchpoint {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as string,
    journeyPhase: r.journey_phase as string,
    url: r.url as string,
    status: r.status as Touchpoint['status'],
    description: r.description as string,
    kpis: (r.kpis as Touchpoint['kpis']) ?? undefined,
  };
}

function toCamelAudience(r: Record<string, unknown>): Audience {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as string,
    segment: r.segment as Audience['segment'],
    color: r.color as string,
    initials: r.initials as string,
    age: r.age as string,
    gender: r.gender as string,
    location: r.location as string,
    income: r.income as string,
    education: r.education as string,
    jobTitle: r.job_title as string,
    interests: r.interests as string[],
    painPoints: r.pain_points as string[],
    goals: r.goals as string[],
    preferredChannels: r.preferred_channels as string[],
    buyingBehavior: r.buying_behavior as string,
    decisionProcess: r.decision_process as string,
    journeyPhase: r.journey_phase as string,
    description: r.description as string,
    campaignIds: r.campaign_ids as string[],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toCamelCampaign(r: Record<string, unknown>): Campaign {
  return {
    id: r.id as string,
    name: r.name as string,
    status: r.status as Campaign['status'],
    startDate: r.start_date as string,
    endDate: r.end_date as string,
    budget: Number(r.budget),
    spent: Number(r.spent),
    channels: r.channels as string[],
    touchpointIds: r.touchpoint_ids as string[] | undefined,
    description: r.description as string,
    masterPrompt: r.master_prompt as string,
    targetAudiences: r.target_audiences as string[],
    campaignKeywords: r.campaign_keywords as string[],
    kpis: r.kpis as Campaign['kpis'],
    channelKpis: (r.channel_kpis as Campaign['channelKpis']) ?? undefined,
    owner: r.owner as string,
    progress: r.progress as number,
    responsibleManagerId: (r.responsible_manager_id as string) ?? '',
    teamMemberIds: (r.team_member_ids as string[]) ?? [],
  };
}

function toCamelTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string,
    title: r.title as string,
    status: r.status as TaskStatus,
    assignee: r.assignee as string,
    author: r.author as string,
    dueDate: r.due_date as string,
    publishDate: (r.publish_date as string) ?? null,
    platform: (r.platform as string) ?? null,
    touchpointId: (r.touchpoint_id as string) ?? null,
    type: r.type as string,
    oneDriveLink: r.one_drive_link as string | undefined,
    description: r.description as string,
    campaignId: (r.campaign_id as string) ?? null,
    scope: r.scope as string | undefined,
    performance: (r.performance as Task['performance']) ?? null,
    aiSuggestion: r.ai_suggestion as string | undefined,
    aiPrompt: r.ai_prompt as string | undefined,
    analysisResult: (r.analysis_result as Task['analysisResult']) ?? null,
  };
}

function toCamelContent(r: Record<string, unknown>): ContentItem {
  return {
    id: r.id as string,
    title: r.title as string,
    description: r.description as string,
    status: r.status as ContentStatus,
    publishDate: (r.publish_date as string) ?? null,
    platform: r.platform as string,
    touchpointId: (r.touchpoint_id as string) ?? null,
    campaignId: (r.campaign_id as string) ?? null,
    taskIds: r.task_ids as string[],
    author: r.author as string,
    contentType: r.content_type as string,
    journeyPhase: r.journey_phase as string,
    createdAt: r.created_at as string,
  };
}

function toCamelPositioning(r: Record<string, unknown>): CompanyPositioning {
  return {
    name: r.name as string,
    tagline: r.tagline as string,
    founded: r.founded as string,
    industry: r.industry as string,
    headquarters: r.headquarters as string,
    legalForm: r.legal_form as string,
    employees: r.employees as string,
    website: r.website as string,
    vision: r.vision as string,
    mission: r.mission as string,
    values: r.company_values as CompanyPositioning['values'],
    toneOfVoice: r.tone_of_voice as CompanyPositioning['toneOfVoice'],
    dos: r.dos as string[],
    donts: r.donts as string[],
    primaryMarket: r.primary_market as string,
    secondaryMarkets: r.secondary_markets as string[],
    targetCompanySize: r.target_company_size as string,
    targetIndustries: r.target_industries as string[],
    lastUpdated: r.last_updated as string,
    updatedBy: r.updated_by as string,
  };
}

// ─── New Entity Converters ─────────────────────────────────

function toCamelPlan(r: Record<string, unknown>): Plan {
  return {
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    description: r.description as string,
    priceMonthly: r.price_monthly_cents as number,
    priceYearly: r.price_yearly_cents as number,
    maxSeats: r.max_seats as number,
    maxProjects: r.max_projects as number,
    includedSocialAccounts: r.included_social_accounts as number,
    features: r.features as Plan['features'],
    isActive: r.is_active as boolean,
    sortOrder: r.sort_order as number,
  };
}

function toCamelSubscription(r: Record<string, unknown>): Subscription {
  return {
    id: r.id as string,
    companyId: r.company_id as string,
    planId: r.plan_id as string,
    status: r.status as Subscription['status'],
    currentSeats: r.current_seats as number,
    currentProjects: r.current_projects as number,
    extraSocialAccounts: r.extra_social_accounts as number,
    billingCycle: r.billing_cycle as Subscription['billingCycle'],
    stripeSubscriptionId: r.stripe_subscription_id as string | undefined,
    stripeCustomerId: r.stripe_customer_id as string | undefined,
    trialEndsAt: r.trial_ends_at as string | undefined,
    currentPeriodStart: r.current_period_start as string | undefined,
    currentPeriodEnd: r.current_period_end as string | undefined,
    canceledAt: r.canceled_at as string | undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toCamelConnectedAccount(r: Record<string, unknown>): ConnectedAccount {
  return {
    id: r.id as string,
    companyId: r.company_id as string,
    platform: r.platform as SocialPlatform,
    accountName: r.account_name as string,
    accountId: r.account_id as string,
    platformUserId: r.platform_user_id as string | undefined,
    tokenExpiresAt: r.token_expires_at as string | undefined,
    tokenScopes: r.token_scopes as string[],
    isActive: r.is_active as boolean,
    metadata: r.metadata as Record<string, unknown>,
    connectedBy: r.connected_by as string | undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toCamelScheduledPost(r: Record<string, unknown>): ScheduledPost {
  return {
    id: r.id as string,
    companyId: r.company_id as string,
    contentItemId: r.content_item_id as string | undefined,
    connectedAccountId: r.connected_account_id as string,
    postText: r.post_text as string,
    postImageUrl: r.post_image_url as string | undefined,
    postType: r.post_type as ScheduledPost['postType'],
    hashtags: r.hashtags as string[],
    scheduledAt: r.scheduled_at as string,
    publishedAt: r.published_at as string | undefined,
    status: r.status as ScheduledPost['status'],
    platformPostId: r.platform_post_id as string | undefined,
    platformPostUrl: r.platform_post_url as string | undefined,
    errorMessage: r.error_message as string | undefined,
    retryCount: r.retry_count as number,
    maxRetries: r.max_retries as number,
    autoCommentText: r.auto_comment_text as string | undefined,
    autoCommentPosted: r.auto_comment_posted as boolean,
    autoCommentAt: r.auto_comment_at as string | undefined,
    createdBy: r.created_by as string | undefined,
    approvedBy: r.approved_by as string | undefined,
    approvedAt: r.approved_at as string | undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toCamelEngagementMetric(r: Record<string, unknown>): EngagementMetric {
  return {
    id: r.id as string,
    scheduledPostId: r.scheduled_post_id as string,
    impressions: r.impressions as number,
    clicks: r.clicks as number,
    likes: r.likes as number,
    comments: r.comments as number,
    shares: r.shares as number,
    reach: r.reach as number,
    saves: r.saves as number,
    videoViews: r.video_views as number,
    engagementRate: Number(r.engagement_rate),
    rawData: r.raw_data as Record<string, unknown>,
    pulledAt: r.pulled_at as string,
  };
}

function toCamelEngagementGroup(r: Record<string, unknown>): EngagementGroup {
  return {
    id: r.id as string,
    companyId: r.company_id as string,
    platform: r.platform as EngagementGroup['platform'],
    groupName: r.group_name as string,
    chatId: r.chat_id as string,
    isActive: r.is_active as boolean,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toCamelKnowledgeDoc(r: Record<string, unknown>): KnowledgeDocument {
  return {
    id: r.id as string,
    companyId: r.company_id as string,
    category: r.category as KnowledgeDocument['category'],
    title: r.title as string,
    content: r.content as string,
    metadata: r.metadata as Record<string, unknown>,
    source: r.source as string,
    isActive: r.is_active as boolean,
    createdBy: r.created_by as string | undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    similarity: r.similarity as number | undefined,
  };
}

function toCamelAiLog(r: Record<string, unknown>): AiGenerationLog {
  return {
    id: r.id as string,
    companyId: r.company_id as string,
    taskId: r.task_id as string | undefined,
    scheduledPostId: r.scheduled_post_id as string | undefined,
    modelUsed: r.model_used as string,
    promptTemplate: r.prompt_template as string,
    contextDocumentsUsed: r.context_documents_used as string[],
    inputTokenCount: r.input_token_count as number | undefined,
    output: r.output as string,
    outputTokenCount: r.output_token_count as number | undefined,
    outputFormat: r.output_format as AiGenerationLog['outputFormat'],
    userRating: r.user_rating as number | undefined,
    userFeedback: r.user_feedback as string | undefined,
    wasAccepted: r.was_accepted as boolean | undefined,
    costCents: r.cost_cents as number,
    latencyMs: r.latency_ms as number,
    generatedBy: r.generated_by as string | undefined,
    createdAt: r.created_at as string,
  };
}

// ─── Users ─────────────────────────────────────────────────

export async function fetchUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error || !data) return null;
  return toCamelUser(data);
}

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return (data ?? []).map(toCamelUser);
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();
  if (error || !data) return null;
  return toCamelUser(data);
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
  const { error } = await supabase.from('users').update({ status }).eq('id', id);
  if (error) throw error;
}

// ─── Campaigns ─────────────────────────────────────────────

export async function fetchCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase.from('campaigns').select('*').order('created_at');
  if (error) throw new Error(error.message ?? JSON.stringify(error));
  return (data ?? []).map(toCamelCampaign);
}

export async function createCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
  const id = generateId();
  const row = {
    id,
    name: campaign.name,
    status: campaign.status,
    start_date: campaign.startDate,
    end_date: campaign.endDate,
    budget: campaign.budget,
    spent: campaign.spent,
    channels: campaign.channels,
    touchpoint_ids: campaign.touchpointIds ?? [],
    description: campaign.description,
    master_prompt: campaign.masterPrompt,
    target_audiences: campaign.targetAudiences,
    campaign_keywords: campaign.campaignKeywords,
    kpis: campaign.kpis,
    channel_kpis: campaign.channelKpis ?? null,
    owner: campaign.owner,
    progress: campaign.progress,
    responsible_manager_id: campaign.responsibleManagerId ?? '',
    team_member_ids: campaign.teamMemberIds ?? [],
  };
  const { data, error } = await supabase.from('campaigns').insert(row).select().single();
  if (error) throw new Error(error.message ?? JSON.stringify(error));
  return toCamelCampaign(data);
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.startDate !== undefined) row.start_date = updates.startDate;
  if (updates.endDate !== undefined) row.end_date = updates.endDate;
  if (updates.budget !== undefined) row.budget = updates.budget;
  if (updates.spent !== undefined) row.spent = updates.spent;
  if (updates.channels !== undefined) row.channels = updates.channels;
  if (updates.touchpointIds !== undefined) row.touchpoint_ids = updates.touchpointIds;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.masterPrompt !== undefined) row.master_prompt = updates.masterPrompt;
  if (updates.targetAudiences !== undefined) row.target_audiences = updates.targetAudiences;
  if (updates.campaignKeywords !== undefined) row.campaign_keywords = updates.campaignKeywords;
  if (updates.kpis !== undefined) row.kpis = updates.kpis;
  if (updates.channelKpis !== undefined) row.channel_kpis = updates.channelKpis;
  if (updates.owner !== undefined) row.owner = updates.owner;
  if (updates.progress !== undefined) row.progress = updates.progress;
  if (updates.responsibleManagerId !== undefined) row.responsible_manager_id = updates.responsibleManagerId;
  if (updates.teamMemberIds !== undefined) row.team_member_ids = updates.teamMemberIds;
  const { error } = await supabase.from('campaigns').update(row).eq('id', id);
  if (error) throw new Error(error.message ?? JSON.stringify(error));
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) throw new Error(error.message ?? JSON.stringify(error));
}

// ─── Tasks ─────────────────────────────────────────────────

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(toCamelTask);
}

export async function createTask(task: Omit<Task, 'id'> & { id?: string }): Promise<Task> {
  const id = task.id || generateId();
  const row = {
    id,
    title: task.title,
    status: task.status,
    assignee: task.assignee,
    author: task.author,
    due_date: task.dueDate,
    publish_date: task.publishDate,
    platform: task.platform,
    touchpoint_id: task.touchpointId,
    type: task.type,
    one_drive_link: task.oneDriveLink,
    description: task.description,
    campaign_id: task.campaignId,
    scope: task.scope,
    performance: task.performance ?? null,
    ai_suggestion: task.aiSuggestion,
    ai_prompt: task.aiPrompt,
    analysis_result: task.analysisResult ?? null,
  };
  const { data, error } = await supabase.from('tasks').insert(row).select().single();
  if (error) throw error;
  return toCamelTask(data);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.assignee !== undefined) row.assignee = updates.assignee;
  if (updates.author !== undefined) row.author = updates.author;
  if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
  if (updates.publishDate !== undefined) row.publish_date = updates.publishDate;
  if (updates.platform !== undefined) row.platform = updates.platform;
  if (updates.touchpointId !== undefined) row.touchpoint_id = updates.touchpointId;
  if (updates.type !== undefined) row.type = updates.type;
  if (updates.oneDriveLink !== undefined) row.one_drive_link = updates.oneDriveLink;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.campaignId !== undefined) row.campaign_id = updates.campaignId;
  if (updates.scope !== undefined) row.scope = updates.scope;
  if (updates.performance !== undefined) row.performance = updates.performance;
  if (updates.aiSuggestion !== undefined) row.ai_suggestion = updates.aiSuggestion;
  if (updates.aiPrompt !== undefined) row.ai_prompt = updates.aiPrompt;
  if (updates.analysisResult !== undefined) row.analysis_result = updates.analysisResult;
  const { error } = await supabase.from('tasks').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// ─── Contents ──────────────────────────────────────────────

export async function fetchContents(): Promise<ContentItem[]> {
  const { data, error } = await supabase.from('contents').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(toCamelContent);
}

export async function createContent(content: Omit<ContentItem, 'id' | 'createdAt'>): Promise<ContentItem> {
  const id = generateId();
  const row = {
    id,
    title: content.title,
    description: content.description,
    status: content.status,
    publish_date: content.publishDate,
    platform: content.platform,
    touchpoint_id: content.touchpointId,
    campaign_id: content.campaignId,
    task_ids: content.taskIds,
    author: content.author,
    content_type: content.contentType,
    journey_phase: content.journeyPhase,
  };
  const { data, error } = await supabase.from('contents').insert(row).select().single();
  if (error) throw error;
  return toCamelContent(data);
}

export async function updateContent(id: string, updates: Partial<ContentItem>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.publishDate !== undefined) row.publish_date = updates.publishDate;
  if (updates.platform !== undefined) row.platform = updates.platform;
  if (updates.touchpointId !== undefined) row.touchpoint_id = updates.touchpointId;
  if (updates.campaignId !== undefined) row.campaign_id = updates.campaignId;
  if (updates.taskIds !== undefined) row.task_ids = updates.taskIds;
  if (updates.author !== undefined) row.author = updates.author;
  if (updates.contentType !== undefined) row.content_type = updates.contentType;
  if (updates.journeyPhase !== undefined) row.journey_phase = updates.journeyPhase;
  const { error } = await supabase.from('contents').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase.from('contents').delete().eq('id', id);
  if (error) throw error;
}

// ─── Audiences ─────────────────────────────────────────────

export async function fetchAudiences(): Promise<Audience[]> {
  const { data, error } = await supabase.from('audiences').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(toCamelAudience);
}

export async function createAudience(audience: Omit<Audience, 'id'>): Promise<Audience> {
  const id = generateId();
  const row = {
    id,
    name: audience.name,
    type: audience.type,
    segment: audience.segment,
    color: audience.color,
    initials: audience.initials,
    age: audience.age,
    gender: audience.gender,
    location: audience.location,
    income: audience.income,
    education: audience.education,
    job_title: audience.jobTitle,
    interests: audience.interests,
    pain_points: audience.painPoints,
    goals: audience.goals,
    preferred_channels: audience.preferredChannels,
    buying_behavior: audience.buyingBehavior,
    decision_process: audience.decisionProcess,
    journey_phase: audience.journeyPhase,
    description: audience.description,
    campaign_ids: audience.campaignIds,
  };
  const { data, error } = await supabase.from('audiences').insert(row).select().single();
  if (error) throw error;
  return toCamelAudience(data);
}

export async function updateAudience(id: string, updates: Partial<Audience>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.type !== undefined) row.type = updates.type;
  if (updates.segment !== undefined) row.segment = updates.segment;
  if (updates.color !== undefined) row.color = updates.color;
  if (updates.initials !== undefined) row.initials = updates.initials;
  if (updates.age !== undefined) row.age = updates.age;
  if (updates.gender !== undefined) row.gender = updates.gender;
  if (updates.location !== undefined) row.location = updates.location;
  if (updates.income !== undefined) row.income = updates.income;
  if (updates.education !== undefined) row.education = updates.education;
  if (updates.jobTitle !== undefined) row.job_title = updates.jobTitle;
  if (updates.interests !== undefined) row.interests = updates.interests;
  if (updates.painPoints !== undefined) row.pain_points = updates.painPoints;
  if (updates.goals !== undefined) row.goals = updates.goals;
  if (updates.preferredChannels !== undefined) row.preferred_channels = updates.preferredChannels;
  if (updates.buyingBehavior !== undefined) row.buying_behavior = updates.buyingBehavior;
  if (updates.decisionProcess !== undefined) row.decision_process = updates.decisionProcess;
  if (updates.journeyPhase !== undefined) row.journey_phase = updates.journeyPhase;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.campaignIds !== undefined) row.campaign_ids = updates.campaignIds;
  const { error } = await supabase.from('audiences').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteAudience(id: string): Promise<void> {
  const { error } = await supabase.from('audiences').delete().eq('id', id);
  if (error) throw error;
}

// ─── Touchpoints ───────────────────────────────────────────

export async function fetchTouchpoints(): Promise<Touchpoint[]> {
  const { data, error } = await supabase.from('touchpoints').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(toCamelTouchpoint);
}

export async function createTouchpoint(tp: Omit<Touchpoint, 'id'>): Promise<Touchpoint> {
  const id = generateId();
  const row = {
    id,
    name: tp.name,
    type: tp.type,
    journey_phase: tp.journeyPhase,
    url: tp.url,
    status: tp.status,
    description: tp.description,
    kpis: tp.kpis ?? null,
  };
  const { data, error } = await supabase.from('touchpoints').insert(row).select().single();
  if (error) throw error;
  return toCamelTouchpoint(data);
}

export async function updateTouchpoint(id: string, updates: Partial<Touchpoint>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.type !== undefined) row.type = updates.type;
  if (updates.journeyPhase !== undefined) row.journey_phase = updates.journeyPhase;
  if (updates.url !== undefined) row.url = updates.url;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.kpis !== undefined) row.kpis = updates.kpis;
  const { error } = await supabase.from('touchpoints').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteTouchpoint(id: string): Promise<void> {
  const { error } = await supabase.from('touchpoints').delete().eq('id', id);
  if (error) throw error;
}

// ─── Company Positioning ───────────────────────────────────

export async function fetchPositioning(): Promise<CompanyPositioning> {
  const { data, error } = await supabase.from('company_positioning').select('*').eq('id', 'main').single();
  if (error) throw error;
  return toCamelPositioning(data);
}

export async function savePositioning(pos: CompanyPositioning): Promise<void> {
  const row = {
    name: pos.name,
    tagline: pos.tagline,
    founded: pos.founded,
    industry: pos.industry,
    headquarters: pos.headquarters,
    legal_form: pos.legalForm,
    employees: pos.employees,
    website: pos.website,
    vision: pos.vision,
    mission: pos.mission,
    company_values: pos.values,
    tone_of_voice: pos.toneOfVoice,
    dos: pos.dos,
    donts: pos.donts,
    primary_market: pos.primaryMarket,
    secondary_markets: pos.secondaryMarkets,
    target_company_size: pos.targetCompanySize,
    target_industries: pos.targetIndustries,
    last_updated: new Date().toISOString().split('T')[0],
    updated_by: pos.updatedBy,
  };
  const { error } = await supabase.from('company_positioning').update(row).eq('id', 'main');
  if (error) throw error;
}

// ─── Company Keywords ──────────────────────────────────────

export async function fetchKeywords(): Promise<CompanyKeyword[]> {
  const { data, error } = await supabase.from('company_keywords').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(r => ({
    id: r.id as string,
    term: r.term as string,
    category: r.category as string,
    description: r.description as string,
  }));
}

export async function createKeyword(kw: Omit<CompanyKeyword, 'id'>): Promise<CompanyKeyword> {
  const id = generateId();
  const { data, error } = await supabase.from('company_keywords').insert({ id, ...kw }).select().single();
  if (error) throw error;
  return { id: data.id, term: data.term, category: data.category, description: data.description };
}

export async function deleteKeyword(id: string): Promise<void> {
  const { error } = await supabase.from('company_keywords').delete().eq('id', id);
  if (error) throw error;
}

// ─── Budget ────────────────────────────────────────────────

export async function fetchBudgetData(): Promise<BudgetData> {
  const [overview, categories, trends] = await Promise.all([
    supabase.from('budget_overview').select('*').eq('id', 'main').single(),
    supabase.from('budget_categories').select('*').order('sort_order'),
    supabase.from('monthly_trends').select('*').order('sort_order'),
  ]);
  if (overview.error) throw overview.error;
  if (categories.error) throw categories.error;
  if (trends.error) throw trends.error;
  return {
    total: Number(overview.data.total),
    spent: Number(overview.data.spent),
    remaining: Number(overview.data.remaining),
    categories: (categories.data ?? []).map(r => ({
      name: r.name as string,
      planned: Number(r.planned),
      spent: Number(r.spent),
      color: r.color as string,
    })),
    monthlyTrend: (trends.data ?? []).map(r => ({
      month: r.month as string,
      planned: Number(r.planned),
      actual: Number(r.actual),
    })),
  };
}

export async function updateBudgetOverview(updates: Partial<BudgetData>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.total !== undefined) row.total = updates.total;
  if (updates.spent !== undefined) row.spent = updates.spent;
  if (updates.remaining !== undefined) row.remaining = updates.remaining;
  const { error } = await supabase.from('budget_overview').update(row).eq('id', 'main');
  if (error) throw error;
}

export async function updateBudgetCategory(id: string, updates: Partial<BudgetCategory>): Promise<void> {
  const { error } = await supabase.from('budget_categories').update(updates).eq('id', id);
  if (error) throw error;
}

export async function createBudgetCategory(cat: Omit<BudgetCategory, 'id'> & { id?: string }): Promise<void> {
  const id = cat.id || generateId();
  const { error } = await supabase.from('budget_categories').insert({ id, ...cat }).select().single();
  if (error) throw error;
}

// ─── Dashboard ─────────────────────────────────────────────

export async function fetchActivityFeed(): Promise<ActivityItem[]> {
  const { data, error } = await supabase.from('activity_feed').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => ({
    id: r.id as string,
    user: r.user_name as string,
    action: r.action as string,
    target: r.target as string,
    time: r.created_display as string,
    icon: r.icon as string,
  }));
}

export async function createActivity(activity: Omit<ActivityItem, 'id'>): Promise<void> {
  const id = generateId();
  const { error } = await supabase.from('activity_feed').insert({
    id,
    user_name: activity.user,
    action: activity.action,
    target: activity.target,
    created_display: activity.time,
    icon: activity.icon,
  });
  if (error) throw error;
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase.from('team_members').select('*');
  if (error) throw error;
  return (data ?? []).map(r => ({
    id: r.id as string,
    name: r.name as string,
    role: r.role as string,
    avatar: r.avatar as string,
    status: r.status as TeamMember['status'],
  }));
}

export async function fetchChartData(): Promise<ChartDataPoint[]> {
  const { data, error } = await supabase.from('dashboard_chart_data').select('*').order('sort_order');
  if (error) throw error;
  return (data ?? []).map(r => ({
    name: r.name as string,
    impressions: r.impressions as number,
    clicks: r.clicks as number,
    conversions: r.conversions as number,
  }));
}

export async function fetchChannelPerformance(): Promise<ChannelPerformanceItem[]> {
  const { data, error } = await supabase.from('channel_performance').select('*').order('sort_order');
  if (error) throw error;
  return (data ?? []).map(r => ({
    name: r.name as string,
    value: r.value as number,
    color: r.color as string,
  }));
}

// ─── Journeys ──────────────────────────────────────────────

export async function fetchJourneys(type: 'asidas' | 'customer'): Promise<AsidasJourney[]> {
  const { data: journeys, error: jErr } = await supabase
    .from('journeys')
    .select('*')
    .eq('journey_type', type)
    .order('created_at');
  if (jErr) throw jErr;
  if (!journeys?.length) return [];

  const ids = journeys.map(j => j.id as string);
  const { data: stages, error: sErr } = await supabase
    .from('journey_stages')
    .select('*')
    .in('journey_id', ids)
    .order('sort_order');
  if (sErr) throw sErr;

  const stageMap = new Map<string, JourneyStage[]>();
  for (const s of stages ?? []) {
    const jid = s.journey_id as string;
    if (!stageMap.has(jid)) stageMap.set(jid, []);
    stageMap.get(jid)!.push({
      id: s.id as string,
      phase: s.phase as string,
      title: s.title as string,
      description: s.description as string,
      touchpoints: s.touchpoints as string[],
      contentFormats: s.content_formats as string[],
      emotions: s.emotions as string[],
      painPoints: s.pain_points as string[],
      metrics: s.metrics as JourneyStage['metrics'],
      contentIds: s.content_ids as string[] | undefined,
    });
  }

  return journeys.map(j => ({
    id: j.id as string,
    name: j.name as string,
    audienceId: j.audience_id as string,
    description: j.description as string,
    stages: stageMap.get(j.id as string) ?? [],
  }));
}

export async function createJourney(
  journey: Omit<AsidasJourney, 'id'>,
  type: 'asidas' | 'customer',
): Promise<AsidasJourney> {
  const id = generateId();
  const { error: jErr } = await supabase.from('journeys').insert({
    id,
    name: journey.name,
    audience_id: journey.audienceId,
    description: journey.description,
    journey_type: type,
  });
  if (jErr) throw jErr;

  if (journey.stages?.length) {
    const rows = journey.stages.map((s, i) => ({
      id: generateId(),
      journey_id: id,
      phase: s.phase,
      title: s.title,
      description: s.description,
      touchpoints: s.touchpoints,
      content_formats: s.contentFormats,
      emotions: s.emotions,
      pain_points: s.painPoints,
      metrics: s.metrics,
      content_ids: s.contentIds ?? [],
      sort_order: i,
    }));
    const { error: sErr } = await supabase.from('journey_stages').insert(rows);
    if (sErr) throw sErr;
  }

  return { ...journey, id };
}

export async function deleteJourney(id: string): Promise<void> {
  const { error } = await supabase.from('journeys').delete().eq('id', id);
  if (error) throw error;
}

// ─── Companies ─────────────────────────────────────────────

function toCamelCompany(r: Record<string, unknown>): Company {
  return {
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    logo: (r.logo as string) ?? '',
    description: (r.description as string) ?? '',
    industry: (r.industry as string) ?? '',
    createdAt: r.created_at as string,
    createdBy: r.created_by as string,
  };
}

function toCamelCompanyMember(r: Record<string, unknown>): CompanyMember {
  return {
    id: r.id as string,
    companyId: r.company_id as string,
    userId: r.user_id as string,
    role: r.role as CompanyRole,
    joinedAt: r.joined_at as string,
  };
}

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase.from('companies').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(toCamelCompany);
}

export async function fetchCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
  if (error || !data) return null;
  return toCamelCompany(data);
}

export async function fetchUserCompanies(userId: string): Promise<(Company & { role: CompanyRole })[]> {
  const { data, error } = await supabase
    .from('company_members')
    .select('*, companies(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => {
    const company = r.companies as Record<string, unknown>;
    return {
      ...toCamelCompany(company),
      role: r.role as CompanyRole,
    };
  });
}

export async function createCompany(company: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
  const id = generateId();
  const slug = company.slug || company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase.from('companies').insert({
    id,
    name: company.name,
    slug,
    logo: company.logo || '',
    description: company.description || '',
    industry: company.industry || '',
    created_by: company.createdBy,
  }).select().single();
  if (error) throw error;
  return toCamelCompany(data);
}

export async function updateCompany(id: string, updates: Partial<Company>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.slug !== undefined) row.slug = updates.slug;
  if (updates.logo !== undefined) row.logo = updates.logo;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.industry !== undefined) row.industry = updates.industry;
  const { error } = await supabase.from('companies').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) throw error;
}

// ─── Company Members ───────────────────────────────────────

export async function fetchCompanyMembers(companyId: string): Promise<CompanyMember[]> {
  const { data, error } = await supabase
    .from('company_members')
    .select('*, users(name, email, avatar, status, is_super_admin)')
    .eq('company_id', companyId);
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => {
    const user = r.users as Record<string, unknown> | null;
    const member = toCamelCompanyMember(r);
    if (user) {
      member.userName = user.name as string;
      member.userEmail = user.email as string;
      member.userAvatar = user.avatar as string;
      member.userStatus = user.status as User['status'];
      member.userIsSuperAdmin = (user.is_super_admin as boolean) ?? false;
    }
    return member;
  });
}

export async function addCompanyMember(companyId: string, userId: string, role: CompanyRole): Promise<CompanyMember> {
  const id = generateId();
  const { data, error } = await supabase.from('company_members').insert({
    id,
    company_id: companyId,
    user_id: userId,
    role,
  }).select().single();
  if (error) throw error;
  return toCamelCompanyMember(data);
}

export async function updateCompanyMemberRole(memberId: string, role: CompanyRole): Promise<void> {
  const { error } = await supabase.from('company_members').update({ role }).eq('id', memberId);
  if (error) throw error;
}

export async function removeCompanyMember(memberId: string): Promise<void> {
  const { error } = await supabase.from('company_members').delete().eq('id', memberId);
  if (error) throw error;
}

export async function fetchUserCompanyRole(userId: string, companyId: string): Promise<CompanyRole | null> {
  const { data, error } = await supabase
    .from('company_members')
    .select('role')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .single();
  if (error || !data) return null;
  return data.role as CompanyRole;
}

// ─── Super-Admin: All Users ────────────────────────────────

export async function updateUserSuperAdmin(userId: string, isSuperAdmin: boolean): Promise<void> {
  const { error } = await supabase.from('users').update({ is_super_admin: isSuperAdmin }).eq('id', userId);
  if (error) throw error;
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const id = generateId();
  const { data, error } = await supabase.from('users').insert({
    id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
    is_super_admin: user.isSuperAdmin ?? false,
    job_title: user.jobTitle,
    avatar: user.avatar,
    status: user.status,
    department: user.department,
    phone: user.phone,
    joined_at: user.joinedAt,
  }).select().single();
  if (error) throw error;
  return toCamelUser(data);
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;
}

// ─── Plans & Subscriptions ─────────────────────────────────

export async function fetchPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []).map(toCamelPlan);
}

export async function fetchSubscription(companyId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('company_id', companyId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  if (!data) return null;
  const sub = toCamelSubscription(data);
  if (data.plans) sub.plan = toCamelPlan(data.plans as Record<string, unknown>);
  return sub;
}

export async function createSubscription(
  companyId: string,
  planId: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      company_id: companyId,
      plan_id: planId,
      billing_cycle: billingCycle,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 86400000).toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return toCamelSubscription(data);
}

export async function updateSubscription(id: string, updates: Partial<{
  planId: string;
  status: string;
  currentSeats: number;
  currentProjects: number;
  extraSocialAccounts: number;
  billingCycle: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
}>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.planId !== undefined) row.plan_id = updates.planId;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.currentSeats !== undefined) row.current_seats = updates.currentSeats;
  if (updates.currentProjects !== undefined) row.current_projects = updates.currentProjects;
  if (updates.extraSocialAccounts !== undefined) row.extra_social_accounts = updates.extraSocialAccounts;
  if (updates.billingCycle !== undefined) row.billing_cycle = updates.billingCycle;
  if (updates.stripeSubscriptionId !== undefined) row.stripe_subscription_id = updates.stripeSubscriptionId;
  if (updates.stripeCustomerId !== undefined) row.stripe_customer_id = updates.stripeCustomerId;
  const { error } = await supabase.from('subscriptions').update(row).eq('id', id);
  if (error) throw error;
}

// ─── Connected Social Accounts ─────────────────────────────

export async function fetchConnectedAccounts(companyId: string): Promise<ConnectedAccount[]> {
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map(toCamelConnectedAccount);
}

export async function createConnectedAccount(account: Omit<ConnectedAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConnectedAccount> {
  const { data, error } = await supabase
    .from('connected_accounts')
    .insert({
      company_id: account.companyId,
      platform: account.platform,
      account_name: account.accountName,
      account_id: account.accountId,
      platform_user_id: account.platformUserId,
      token_scopes: account.tokenScopes,
      is_active: account.isActive,
      metadata: account.metadata,
      connected_by: account.connectedBy,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamelConnectedAccount(data);
}

export async function updateConnectedAccount(id: string, updates: Partial<ConnectedAccount>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.accountName !== undefined) row.account_name = updates.accountName;
  if (updates.isActive !== undefined) row.is_active = updates.isActive;
  if (updates.tokenScopes !== undefined) row.token_scopes = updates.tokenScopes;
  if (updates.metadata !== undefined) row.metadata = updates.metadata;
  const { error } = await supabase.from('connected_accounts').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteConnectedAccount(id: string): Promise<void> {
  const { error } = await supabase.from('connected_accounts').delete().eq('id', id);
  if (error) throw error;
}

// ─── Scheduled Posts ───────────────────────────────────────

export async function fetchScheduledPosts(companyId: string): Promise<ScheduledPost[]> {
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*, connected_accounts(platform, account_name)')
    .eq('company_id', companyId)
    .order('scheduled_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => {
    const post = toCamelScheduledPost(r);
    if (r.connected_accounts) {
      const ca = r.connected_accounts as Record<string, unknown>;
      post.connectedAccount = {
        platform: ca.platform as SocialPlatform,
        accountName: ca.account_name as string,
      } as ConnectedAccount;
    }
    return post;
  });
}

export async function createScheduledPost(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduledPost> {
  const { data, error } = await supabase
    .from('scheduled_posts')
    .insert({
      company_id: post.companyId,
      content_item_id: post.contentItemId,
      connected_account_id: post.connectedAccountId,
      post_text: post.postText,
      post_image_url: post.postImageUrl,
      post_type: post.postType,
      hashtags: post.hashtags,
      scheduled_at: post.scheduledAt,
      status: post.status || 'draft',
      auto_comment_text: post.autoCommentText,
      created_by: post.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamelScheduledPost(data);
}

export async function updateScheduledPost(id: string, updates: Partial<ScheduledPost>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.postText !== undefined) row.post_text = updates.postText;
  if (updates.postImageUrl !== undefined) row.post_image_url = updates.postImageUrl;
  if (updates.postType !== undefined) row.post_type = updates.postType;
  if (updates.hashtags !== undefined) row.hashtags = updates.hashtags;
  if (updates.scheduledAt !== undefined) row.scheduled_at = updates.scheduledAt;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.platformPostId !== undefined) row.platform_post_id = updates.platformPostId;
  if (updates.platformPostUrl !== undefined) row.platform_post_url = updates.platformPostUrl;
  if (updates.publishedAt !== undefined) row.published_at = updates.publishedAt;
  if (updates.errorMessage !== undefined) row.error_message = updates.errorMessage;
  if (updates.retryCount !== undefined) row.retry_count = updates.retryCount;
  if (updates.autoCommentText !== undefined) row.auto_comment_text = updates.autoCommentText;
  if (updates.autoCommentPosted !== undefined) row.auto_comment_posted = updates.autoCommentPosted;
  if (updates.approvedBy !== undefined) row.approved_by = updates.approvedBy;
  if (updates.approvedAt !== undefined) row.approved_at = updates.approvedAt;
  const { error } = await supabase.from('scheduled_posts').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteScheduledPost(id: string): Promise<void> {
  const { error } = await supabase.from('scheduled_posts').delete().eq('id', id);
  if (error) throw error;
}

// ─── Engagement Metrics ────────────────────────────────────

export async function fetchEngagementMetrics(postId: string): Promise<EngagementMetric[]> {
  const { data, error } = await supabase
    .from('engagement_metrics')
    .select('*')
    .eq('scheduled_post_id', postId)
    .order('pulled_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toCamelEngagementMetric);
}

export async function createEngagementMetric(metric: Omit<EngagementMetric, 'id'>): Promise<void> {
  const { error } = await supabase
    .from('engagement_metrics')
    .insert({
      scheduled_post_id: metric.scheduledPostId,
      impressions: metric.impressions,
      clicks: metric.clicks,
      likes: metric.likes,
      comments: metric.comments,
      shares: metric.shares,
      reach: metric.reach,
      saves: metric.saves,
      video_views: metric.videoViews,
      engagement_rate: metric.engagementRate,
      raw_data: metric.rawData,
    });
  if (error) throw error;
}

// ─── Knowledge Documents ───────────────────────────────────

export async function fetchKnowledgeDocuments(companyId: string, category?: string): Promise<KnowledgeDocument[]> {
  let query = supabase
    .from('knowledge_documents')
    .select('id, company_id, category, title, content, metadata, source, is_active, created_by, created_at, updated_at')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toCamelKnowledgeDoc);
}

export async function createKnowledgeDocument(doc: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeDocument> {
  const { data, error } = await supabase
    .from('knowledge_documents')
    .insert({
      company_id: doc.companyId,
      category: doc.category,
      title: doc.title,
      content: doc.content,
      metadata: doc.metadata,
      source: doc.source,
      is_active: doc.isActive,
      created_by: doc.createdBy,
    })
    .select('id, company_id, category, title, content, metadata, source, is_active, created_by, created_at, updated_at')
    .single();
  if (error) throw error;
  return toCamelKnowledgeDoc(data);
}

export async function updateKnowledgeDocument(id: string, updates: Partial<KnowledgeDocument>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.content !== undefined) row.content = updates.content;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.metadata !== undefined) row.metadata = updates.metadata;
  if (updates.source !== undefined) row.source = updates.source;
  if (updates.isActive !== undefined) row.is_active = updates.isActive;
  const { error } = await supabase.from('knowledge_documents').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteKnowledgeDocument(id: string): Promise<void> {
  const { error } = await supabase.from('knowledge_documents').update({ is_active: false }).eq('id', id);
  if (error) throw error;
}

// ─── AI Generation Log ─────────────────────────────────────

export async function fetchAiGenerationLogs(companyId: string, limit = 50): Promise<AiGenerationLog[]> {
  const { data, error } = await supabase
    .from('ai_generation_log')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(toCamelAiLog);
}

export async function createAiGenerationLog(log: Omit<AiGenerationLog, 'id' | 'createdAt'>): Promise<AiGenerationLog> {
  const { data, error } = await supabase
    .from('ai_generation_log')
    .insert({
      company_id: log.companyId,
      task_id: log.taskId,
      scheduled_post_id: log.scheduledPostId,
      model_used: log.modelUsed,
      prompt_template: log.promptTemplate,
      context_documents_used: log.contextDocumentsUsed,
      input_token_count: log.inputTokenCount,
      output: log.output,
      output_token_count: log.outputTokenCount,
      output_format: log.outputFormat,
      cost_cents: log.costCents,
      latency_ms: log.latencyMs,
      generated_by: log.generatedBy,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamelAiLog(data);
}

export async function updateAiGenerationLog(id: string, updates: {
  userRating?: number;
  userFeedback?: string;
  wasAccepted?: boolean;
}): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.userRating !== undefined) row.user_rating = updates.userRating;
  if (updates.userFeedback !== undefined) row.user_feedback = updates.userFeedback;
  if (updates.wasAccepted !== undefined) row.was_accepted = updates.wasAccepted;
  const { error } = await supabase.from('ai_generation_log').update(row).eq('id', id);
  if (error) throw error;
}

// ─── Usage Records ─────────────────────────────────────────

export async function fetchUsageSummary(companyId: string, periodStart: string, periodEnd: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('usage_records')
    .select('metric, quantity')
    .eq('company_id', companyId)
    .gte('period_start', periodStart)
    .lte('period_end', periodEnd);
  if (error) throw error;
  const summary: Record<string, number> = {};
  for (const row of data ?? []) {
    const metric = row.metric as string;
    summary[metric] = (summary[metric] || 0) + (row.quantity as number);
  }
  return summary;
}

export async function recordUsage(
  companyId: string,
  subscriptionId: string,
  metric: string,
  quantity: number = 1,
): Promise<void> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  const { error } = await supabase
    .from('usage_records')
    .insert({
      company_id: companyId,
      subscription_id: subscriptionId,
      metric,
      quantity,
      period_start: periodStart,
      period_end: periodEnd,
    });
  if (error) throw error;
}

// ─── Engagement Groups ─────────────────────────────────────

export async function fetchEngagementGroups(companyId: string): Promise<EngagementGroup[]> {
  const { data, error } = await supabase
    .from('engagement_groups')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map(toCamelEngagementGroup);
}

export async function createEngagementGroup(group: Omit<EngagementGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<EngagementGroup> {
  const { data, error } = await supabase
    .from('engagement_groups')
    .insert({
      company_id: group.companyId,
      platform: group.platform,
      group_name: group.groupName,
      chat_id: group.chatId,
      is_active: group.isActive,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamelEngagementGroup(data);
}

export async function deleteEngagementGroup(id: string): Promise<void> {
  const { error } = await supabase.from('engagement_groups').delete().eq('id', id);
  if (error) throw error;
}
