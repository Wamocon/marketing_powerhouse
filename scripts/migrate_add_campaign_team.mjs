// Migration script: Adds responsible_manager_id and team_member_ids columns to campaigns table
// Run via: node scripts/migrate_add_campaign_team.mjs

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
    clientInfo: { name: 'migrate-campaign-team', version: '1.0.0' },
  });
  await mcpCall('notifications/initialized', {});
  console.log('MCP session initialized');
}

const ADD_COLUMNS_SQL = `
-- Add responsible_manager_id and team_member_ids to campaigns (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'responsible_manager_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN responsible_manager_id TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'team_member_ids'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN team_member_ids TEXT[] DEFAULT '{}';
  END IF;
END
$$;
`;

const UPDATE_EXISTING_SQL = `
-- Seed manager/team for existing campaigns
UPDATE campaigns SET responsible_manager_id = 'u3', team_member_ids = ARRAY['u4','u5'] WHERE id = '1' AND responsible_manager_id = '';
UPDATE campaigns SET responsible_manager_id = 'u2', team_member_ids = ARRAY['u4','u5','u6'] WHERE id = '2' AND responsible_manager_id = '';
UPDATE campaigns SET responsible_manager_id = 'u3', team_member_ids = ARRAY['u4','u6'] WHERE id = '3' AND responsible_manager_id = '';
UPDATE campaigns SET responsible_manager_id = 'u3', team_member_ids = ARRAY['u5'] WHERE id = '4' AND responsible_manager_id = '';
`;

async function main() {
  try {
    await init();

    console.log('Step 1/3: Adding columns to campaigns table...');
    await executeSql(ADD_COLUMNS_SQL);
    console.log('  ✓ Columns added (or already exist)');

    console.log('Step 2/3: Updating existing campaigns with team data...');
    await executeSql(UPDATE_EXISTING_SQL);
    console.log('  ✓ Existing campaigns updated');

    console.log('Step 3/3: Reloading PostgREST schema cache...');
    await executeSql("NOTIFY pgrst, 'reload schema';");
    console.log('  ✓ Schema cache reloaded');

    console.log('\n✅ Migration complete! responsible_manager_id and team_member_ids are now available.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message || err);
    process.exit(1);
  }
}

main();
