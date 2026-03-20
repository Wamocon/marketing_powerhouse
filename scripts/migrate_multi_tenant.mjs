// Migration script: Multi-Tenancy — Creates companies, company_members tables
// and adds company_id + is_super_admin columns to existing tables.
// Run via: node scripts/migrate_multi_tenant.mjs
//
// PREREQUISITE: Supabase project must already have the base tables from migrate.mjs
//
// This script:
// 1. Creates `companies` table
// 2. Creates `company_members` join table
// 3. Adds `is_super_admin` boolean to `users`
// 4. Updates role constraint to use company_admin instead of admin
// 5. Adds `company_id` FK to all data tables
// 6. Creates WAMOCON Academy company and assigns ALL existing users

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
    clientInfo: { name: 'migrate-multi-tenant', version: '1.0.0' },
  });
  await mcpCall('notifications/initialized', {});
  console.log('MCP session initialized');
}

// ─── Step 1: DDL — New tables & columns ────────────────────

const DDL_COMPANIES = `
-- Companies table (TEXT id to match existing schema pattern)
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL
);
`;

const DDL_COMPANY_MEMBERS = `
-- Company Members join table
CREATE TABLE IF NOT EXISTS company_members (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('company_admin', 'manager', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);
`;

const DDL_USER_COLUMNS = `
-- Add is_super_admin to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Backfill possible NULL values from old rows
UPDATE users
SET is_super_admin = false
WHERE is_super_admin IS NULL;
`;

const DDL_USER_ROLE_CONSTRAINT = `
-- Update role constraint safely: admin -> company_admin
-- Important order: drop old constraint -> migrate data -> add new constraint
DO $$
BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

  UPDATE users
  SET role = 'company_admin'
  WHERE role = 'admin';

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_role_check'
      AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('company_admin', 'manager', 'member'));
  END IF;
END $$;
`;

const DDL_COMPANY_ID_COLUMNS = `
-- Add company_id TEXT FK to all data tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'company_id') THEN
    ALTER TABLE campaigns ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'company_id') THEN
    ALTER TABLE tasks ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'company_id') THEN
    ALTER TABLE contents ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audiences' AND column_name = 'company_id') THEN
    ALTER TABLE audiences ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'touchpoints' AND column_name = 'company_id') THEN
    ALTER TABLE touchpoints ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_positioning' AND column_name = 'company_id') THEN
    ALTER TABLE company_positioning ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_keywords' AND column_name = 'company_id') THEN
    ALTER TABLE company_keywords ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_overview' AND column_name = 'company_id') THEN
    ALTER TABLE budget_overview ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_categories' AND column_name = 'company_id') THEN
    ALTER TABLE budget_categories ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'monthly_trends' AND column_name = 'company_id') THEN
    ALTER TABLE monthly_trends ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_feed' AND column_name = 'company_id') THEN
    ALTER TABLE activity_feed ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'company_id') THEN
    ALTER TABLE team_members ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_chart_data' AND column_name = 'company_id') THEN
    ALTER TABLE dashboard_chart_data ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'channel_performance' AND column_name = 'company_id') THEN
    ALTER TABLE channel_performance ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journeys' AND column_name = 'company_id') THEN
    ALTER TABLE journeys ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;
`;

const DDL_INDEXES = `
-- Indexes for fast company_id lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_company ON campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_contents_company ON contents(company_id);
CREATE INDEX IF NOT EXISTS idx_audiences_company ON audiences(company_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_company ON touchpoints(company_id);
CREATE INDEX IF NOT EXISTS idx_journeys_company ON journeys(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON company_members(user_id);
`;

// ─── Step 2: Seed — Users, Company, Members, Data ─────────

const SEED_UPDATE_USERS = `
-- Rename role 'admin' → 'company_admin' for all existing admin users
UPDATE users SET role = 'company_admin' WHERE role = 'admin';

-- Waleri Moretz (u2) is company admin for WAMOCON Academy
UPDATE users SET role = 'company_admin' WHERE id = 'u2';

-- Make Daniel Moretz (u1) Super-Admin
UPDATE users SET is_super_admin = true WHERE id = 'u1';
`;

const SEED_COMPANY = `
-- Create WAMOCON Academy company
INSERT INTO companies (id, name, slug, description, industry, created_by)
VALUES (
  'c1',
  'WAMOCON Academy',
  'wamocon-academy',
  'Zentraler Workspace für alle Marketing-Aktivitäten der WAMOCON Academy (Test-IT Academy).',
  'IT-Ausbildung & Schulungen',
  'u1'
) ON CONFLICT (id) DO NOTHING;
`;

const SEED_MEMBERS = `
-- Assign ALL existing users to WAMOCON Academy
-- Roles match the existing user roles from the users table
INSERT INTO company_members (id, company_id, user_id, role) VALUES
  ('cm1', 'c1', 'u1', 'company_admin'),
  ('cm2', 'c1', 'u2', 'company_admin'),
  ('cm3', 'c1', 'u3', 'manager'),
  ('cm4', 'c1', 'u4', 'member'),
  ('cm5', 'c1', 'u5', 'member'),
  ('cm6', 'c1', 'u6', 'member')
ON CONFLICT (company_id, user_id) DO UPDATE SET role = EXCLUDED.role;
`;

const SEED_ASSIGN_DATA = `
-- Link all existing data to WAMOCON Academy (c1)
UPDATE campaigns SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE tasks SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE contents SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE audiences SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE touchpoints SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE company_positioning SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE company_keywords SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE budget_overview SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE budget_categories SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE monthly_trends SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE activity_feed SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE team_members SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE dashboard_chart_data SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE channel_performance SET company_id = 'c1' WHERE company_id IS NULL;
UPDATE journeys SET company_id = 'c1' WHERE company_id IS NULL;
`;

// ─── Main execution ────────────────────────────────────────

async function main() {
  try {
    await init();

    console.log('\n🚀 Multi-Tenancy Migration');
    console.log('='.repeat(50));

    console.log('\nStep 1/7: Creating companies table...');
    await executeSql(DDL_COMPANIES);
    console.log('  ✓ companies table created');

    console.log('Step 2/7: Creating company_members table...');
    await executeSql(DDL_COMPANY_MEMBERS);
    console.log('  ✓ company_members table created');

    console.log('Step 3/7: Adding is_super_admin + updating role constraint...');
    await executeSql(DDL_USER_COLUMNS);
    await executeSql(DDL_USER_ROLE_CONSTRAINT);
    console.log('  ✓ users table updated');

    console.log('Step 4/7: Adding company_id to all data tables...');
    await executeSql(DDL_COMPANY_ID_COLUMNS);
    console.log('  ✓ company_id columns added');

    console.log('Step 5/7: Creating indexes...');
    await executeSql(DDL_INDEXES);
    console.log('  ✓ Indexes created');

    console.log('Step 6/7: Updating user roles...');
    await executeSql(SEED_UPDATE_USERS);
    console.log('  ✓ User roles updated (admin → company_admin, u1 = Super-Admin)');

    console.log('Step 7/7: Creating WAMOCON Academy & assigning users + data...');
    await executeSql(SEED_COMPANY);
    await executeSql(SEED_MEMBERS);
    await executeSql(SEED_ASSIGN_DATA);
    console.log('  ✓ WAMOCON Academy created, all users assigned, all data linked');

    console.log('\n✅ Multi-Tenancy Migration complete!');
    console.log('\n  Company:  WAMOCON Academy (id: c1)');
    console.log('  Members:  u1 (company_admin/super), u2 (company_admin), u3 (manager), u4 (member), u5 (member), u6 (member)');
    console.log('  Data:     All campaigns, tasks, contents, audiences, touchpoints, etc. → company_id = c1');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

main();
