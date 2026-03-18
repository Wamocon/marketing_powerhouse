import { supabase } from './supabase';
import type {
  User, Campaign, Task, TaskStatus, ContentItem, ContentStatus,
  Audience, Touchpoint, AsidasJourney, JourneyStage,
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

// ─── Users ─────────────────────────────────────────────────

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
  if (error) throw error;
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
  };
  const { data, error } = await supabase.from('campaigns').insert(row).select().single();
  if (error) throw error;
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
  const { error } = await supabase.from('campaigns').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) throw error;
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
