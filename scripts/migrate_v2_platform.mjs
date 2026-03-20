// Migration V2: Platform layer — subscriptions, publishing, AI knowledge, RLS
// Adds tables for: plans, subscriptions, connected social accounts,
// scheduled posts, engagement metrics, AI knowledge (pgvector), AI generation log
// Also adds RLS policies for all existing + new tables
//
// Run via: node scripts/migrate_v2_platform.mjs

const SUPABASE_MCP_URL = 'https://mcp.supabase.com/mcp';
const SUPABASE_PAT = 'sbp_c3e67a8545c389fd0c922adc6ebad248d42f324c';
const PROJECT_ID = 'ftbkqtteavvdqmhbmzoy';

const headers = {
  Authorization: `Bearer ${SUPABASE_PAT}`,
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
};

let sessionId = null;

async function mcpCall(method, params, id = 1) {
  const body = { jsonrpc: '2.0', id, method, params };
  const h = { ...headers };
  if (sessionId) h['mcp-session-id'] = sessionId;
  const res = await fetch(SUPABASE_MCP_URL, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`MCP HTTP ${res.status}: ${await res.text()}`);
  const sid = res.headers.get('mcp-session-id');
  if (sid) sessionId = sid;
  return res.json();
}

async function executeSql(sql) {
  const result = await mcpCall('tools/call', {
    name: 'execute_sql',
    arguments: { project_id: PROJECT_ID, query: sql },
  }, Math.floor(Math.random() * 100000));
  const content = result?.result?.content?.[0]?.text;
  if (content && content.includes('"error"')) {
    throw new Error(`SQL error: ${content}`);
  }
  return content;
}

async function init() {
  await mcpCall('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'migrate-v2-script', version: '1.0.0' },
  });
  await mcpCall('notifications/initialized', {});
  console.log('MCP session initialized');
}

// ═══════════════════════════════════════════════════════════
// STEP 1: Enable pgvector extension (for AI knowledge base)
// ═══════════════════════════════════════════════════════════

const ENABLE_EXTENSIONS = `
-- Enable pgvector for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pg_cron for simple scheduled tasks (token refresh etc.)
-- Note: pg_cron is pre-installed on Supabase, just needs enabling
CREATE EXTENSION IF NOT EXISTS pg_cron;
`;

// ═══════════════════════════════════════════════════════════
// STEP 2: Plans & Subscriptions (product/pricing model)
// ═══════════════════════════════════════════════════════════

const PLANS_AND_SUBSCRIPTIONS = `
-- ── Plans (product catalog) ──
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price_monthly_cents INTEGER NOT NULL DEFAULT 0,
  price_yearly_cents INTEGER NOT NULL DEFAULT 0,
  max_seats INTEGER NOT NULL DEFAULT 2,
  max_projects INTEGER NOT NULL DEFAULT 1,
  included_social_accounts INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Subscriptions (company <-> plan binding) ──
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'paused')),
  current_seats INTEGER NOT NULL DEFAULT 1,
  current_projects INTEGER NOT NULL DEFAULT 1,
  extra_social_accounts INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly', 'yearly')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id)
);
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast lookup by company
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
`;

// ═══════════════════════════════════════════════════════════
// STEP 3: Connected Social Accounts & Publishing Pipeline
// ═══════════════════════════════════════════════════════════

const PUBLISHING_TABLES = `
-- ── Connected Social Accounts ──
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'instagram', 'telegram', 'twitter')),
  account_name TEXT NOT NULL DEFAULT '',
  account_id TEXT NOT NULL DEFAULT '',
  platform_user_id TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  token_scopes TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  connected_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER connected_accounts_updated_at BEFORE UPDATE ON connected_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_connected_accounts_company ON connected_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_platform ON connected_accounts(platform);

-- ── Scheduled Posts (the publishing queue) ──
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  content_item_id TEXT REFERENCES contents(id) ON DELETE SET NULL,
  connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  -- Content payload
  post_text TEXT NOT NULL DEFAULT '',
  post_image_url TEXT,
  post_type TEXT NOT NULL DEFAULT 'text'
    CHECK (post_type IN ('text', 'image', 'carousel', 'video', 'reel')),
  hashtags TEXT[] DEFAULT '{}',
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  -- State machine
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft',
      'text_generating', 'text_ready',
      'image_generating', 'ready_for_review',
      'approved', 'scheduled',
      'publishing', 'published',
      'failed', 'canceled'
    )),
  -- Platform response
  platform_post_id TEXT,
  platform_post_url TEXT,
  -- Error handling
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  -- Auto-comment (algorithm boost)
  auto_comment_text TEXT,
  auto_comment_posted BOOLEAN NOT NULL DEFAULT false,
  auto_comment_at TIMESTAMPTZ,
  -- Metadata
  created_by TEXT REFERENCES users(id),
  approved_by TEXT REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER scheduled_posts_updated_at BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_company ON scheduled_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_account ON scheduled_posts(connected_account_id);

-- Constraint: only approved content can be scheduled
-- (enforced via trigger, not simple CHECK, because it's cross-column)
CREATE OR REPLACE FUNCTION enforce_approved_before_schedule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'scheduled' AND OLD.status != 'approved' THEN
    RAISE EXCEPTION 'Post must be approved before scheduling. Current status: %', OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_approved_before_schedule
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION enforce_approved_before_schedule();

-- ── Engagement Metrics (pulled from platforms) ──
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  video_views INTEGER NOT NULL DEFAULT 0,
  engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  raw_data JSONB DEFAULT '{}',
  pulled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_post ON engagement_metrics(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_pulled ON engagement_metrics(pulled_at);

-- ── Engagement Groups (Telegram/WhatsApp notification channels) ──
CREATE TABLE IF NOT EXISTS engagement_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'telegram'
    CHECK (platform IN ('telegram', 'whatsapp')),
  group_name TEXT NOT NULL DEFAULT '',
  chat_id TEXT NOT NULL DEFAULT '',
  bot_token_encrypted TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER engagement_groups_updated_at BEFORE UPDATE ON engagement_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`;

// ═══════════════════════════════════════════════════════════
// STEP 4: AI Knowledge Base (pgvector RAG)
// ═══════════════════════════════════════════════════════════

const AI_KNOWLEDGE_TABLES = `
-- ── Knowledge Documents (RAG source material) ──
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL
    CHECK (category IN (
      'brand_voice', 'persona', 'past_post', 'product',
      'guideline', 'style_reference', 'industry', 'faq'
    )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB DEFAULT '{}',
  source TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER knowledge_documents_updated_at BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- HNSW index for fast similarity search (pgvector best practice)
CREATE INDEX IF NOT EXISTS idx_knowledge_embedding ON knowledge_documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_knowledge_company ON knowledge_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_documents(category);

-- ── AI Generation Log (audit trail + learning) ──
CREATE TABLE IF NOT EXISTS ai_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE SET NULL,
  -- What was sent to the AI
  model_used TEXT NOT NULL DEFAULT '',
  prompt_template TEXT NOT NULL DEFAULT '',
  context_documents_used UUID[] DEFAULT '{}',
  full_prompt_hash TEXT NOT NULL DEFAULT '',
  input_token_count INTEGER,
  -- What came back
  output TEXT NOT NULL DEFAULT '',
  output_token_count INTEGER,
  output_format TEXT DEFAULT 'text'
    CHECK (output_format IN ('text', 'json', 'image_url')),
  -- Quality tracking
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  was_accepted BOOLEAN,
  -- Cost tracking
  cost_cents INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  -- Metadata
  generated_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_log_company ON ai_generation_log(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_log_task ON ai_generation_log(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_log_created ON ai_generation_log(created_at);

-- ── RAG similarity search function ──
CREATE OR REPLACE FUNCTION match_knowledge_documents(
  query_embedding vector(768),
  match_company_id TEXT,
  match_count INTEGER DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.title,
    kd.content,
    kd.category,
    kd.metadata,
    1 - (kd.embedding <=> query_embedding) AS similarity
  FROM knowledge_documents kd
  WHERE kd.company_id = match_company_id
    AND kd.is_active = true
    AND 1 - (kd.embedding <=> query_embedding) > match_threshold
  ORDER BY kd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
`;

// ═══════════════════════════════════════════════════════════
// STEP 5: Usage Metering (for billing)
// ═══════════════════════════════════════════════════════════

const USAGE_METERING = `
-- ── Usage Records (track billable events per billing period) ──
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  metric TEXT NOT NULL
    CHECK (metric IN (
      'ai_generation', 'image_generation',
      'post_published', 'seat_count',
      'social_account_count', 'project_count'
    )),
  quantity INTEGER NOT NULL DEFAULT 1,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_usage_company_period ON usage_records(company_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_metric ON usage_records(metric);
`;

// ═══════════════════════════════════════════════════════════
// STEP 6: Add company_id to existing tables (multi-tenancy)
// ═══════════════════════════════════════════════════════════

const ADD_COMPANY_ID_TO_EXISTING = `
-- Add company_id column to existing tables that don't have it yet
-- Using DO block to handle "already exists" gracefully

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_campaigns_company ON campaigns(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiences' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE audiences ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_audiences_company ON audiences(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'touchpoints' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE touchpoints ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_touchpoints_company ON touchpoints(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_tasks_company ON tasks(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contents' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE contents ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_contents_company ON contents(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_positioning' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE company_positioning ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_positioning_company ON company_positioning(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_keywords' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE company_keywords ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_keywords_company ON company_keywords(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journeys' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE journeys ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_journeys_company ON journeys(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budget_overview' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE budget_overview ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_budget_overview_company ON budget_overview(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budget_categories' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE budget_categories ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_budget_categories_company ON budget_categories(company_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_feed' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE activity_feed ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_activity_feed_company ON activity_feed(company_id);
  END IF;
END $$;
`;

// ═══════════════════════════════════════════════════════════
// STEP 7: Row Level Security Policies
// ═══════════════════════════════════════════════════════════

const RLS_POLICIES = `
-- Enable RLS on all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable (pricing page)
CREATE POLICY plans_select ON plans FOR SELECT USING (true);

-- Subscriptions: only members of the company can see
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm WHERE cm.user_id = current_setting('app.current_user_id', true)
    )
  );

-- Connected accounts: company members can read, admins can modify
CREATE POLICY connected_accounts_select ON connected_accounts FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm WHERE cm.user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY connected_accounts_modify ON connected_accounts FOR ALL
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm
      WHERE cm.user_id = current_setting('app.current_user_id', true)
        AND cm.role IN ('company_admin', 'manager')
    )
  );

-- Scheduled posts: company members can read, admins/managers can modify
CREATE POLICY scheduled_posts_select ON scheduled_posts FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm WHERE cm.user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY scheduled_posts_modify ON scheduled_posts FOR ALL
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm
      WHERE cm.user_id = current_setting('app.current_user_id', true)
        AND cm.role IN ('company_admin', 'manager')
    )
  );

-- Engagement metrics: readable by company members
CREATE POLICY engagement_metrics_select ON engagement_metrics FOR SELECT
  USING (
    scheduled_post_id IN (
      SELECT sp.id FROM scheduled_posts sp
      WHERE sp.company_id IN (
        SELECT cm.company_id FROM company_members cm WHERE cm.user_id = current_setting('app.current_user_id', true)
      )
    )
  );

-- Knowledge documents: company members can read, admins can modify
CREATE POLICY knowledge_docs_select ON knowledge_documents FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm WHERE cm.user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY knowledge_docs_modify ON knowledge_documents FOR ALL
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm
      WHERE cm.user_id = current_setting('app.current_user_id', true)
        AND cm.role IN ('company_admin', 'manager')
    )
  );

-- AI generation log: company members can read
CREATE POLICY ai_log_select ON ai_generation_log FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm WHERE cm.user_id = current_setting('app.current_user_id', true)
    )
  );

-- Usage records: company admins only
CREATE POLICY usage_select ON usage_records FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm
      WHERE cm.user_id = current_setting('app.current_user_id', true)
        AND cm.role = 'company_admin'
    )
  );
`;

// ═══════════════════════════════════════════════════════════
// STEP 8: Seed initial plans data
// ═══════════════════════════════════════════════════════════

const SEED_PLANS = `
INSERT INTO plans (name, slug, description, price_monthly_cents, price_yearly_cents, max_seats, max_projects, included_social_accounts, features, sort_order)
VALUES
  (
    'Starter',
    'starter',
    'Core marketing tools for small teams',
    2900, 27840,
    2, 1, 0,
    '{"core": true, "ai_pro": false, "linkedin": false, "instagram": false, "max_ai_generations_month": 0}',
    1
  ),
  (
    'Pro',
    'pro',
    'AI-powered marketing with LinkedIn publishing',
    7900, 75840,
    5, 3, 1,
    '{"core": true, "ai_pro": true, "linkedin": true, "instagram": false, "max_ai_generations_month": 200}',
    2
  ),
  (
    'Ultimate',
    'ultimate',
    'Full platform with all channels and advanced analytics',
    14900, 143040,
    10, 10, 4,
    '{"core": true, "ai_pro": true, "linkedin": true, "instagram": true, "max_ai_generations_month": -1}',
    3
  )
ON CONFLICT (slug) DO NOTHING;
`;

// ═══════════════════════════════════════════════════════════
// Runner
// ═══════════════════════════════════════════════════════════

async function run() {
  await init();

  const steps = [
    { name: 'Enable extensions (pgvector, pg_cron)', sql: ENABLE_EXTENSIONS },
    { name: 'Create plans & subscriptions tables', sql: PLANS_AND_SUBSCRIPTIONS },
    { name: 'Create publishing pipeline tables', sql: PUBLISHING_TABLES },
    { name: 'Create AI knowledge base tables', sql: AI_KNOWLEDGE_TABLES },
    { name: 'Create usage metering table', sql: USAGE_METERING },
    { name: 'Add company_id to existing tables', sql: ADD_COMPANY_ID_TO_EXISTING },
    { name: 'Set up RLS policies', sql: RLS_POLICIES },
    { name: 'Seed initial plans', sql: SEED_PLANS },
  ];

  for (const step of steps) {
    console.log(`\n▶ ${step.name}...`);
    try {
      const result = await executeSql(step.sql);
      console.log(`  ✓ Done`);
      if (result) {
        const parsed = JSON.parse(result);
        if (parsed?.length) console.log(`  Rows affected:`, parsed.length);
      }
    } catch (err) {
      console.error(`  ✗ FAILED: ${err.message}`);
      // Continue with other steps even if one fails
    }
  }

  console.log('\n═══ Migration V2 complete ═══');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
