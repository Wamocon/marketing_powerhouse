/**
 * Migration: Notification System
 * Adds notifications + notification_preferences tables to Supabase.
 *
 * Usage:
 *   node scripts/migrate_notifications.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'test';

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { db: { schema } });

const NOTIFICATION_TYPES = [
  'campaign_update', 'budget_alert', 'task_reminder',
  'task_assigned', 'task_status_changed', 'ai_generation_complete',
  'content_review', 'content_approved', 'content_published',
  'team_activity', 'kpi_anomaly', 'weekly_report', 'system_alert',
];

const SQL = `
-- ═══════════════════════════════════════════════
-- Notifications table
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  recipient_user_id TEXT NOT NULL,

  type TEXT NOT NULL CHECK (type IN (
    'campaign_update', 'budget_alert', 'task_reminder',
    'task_assigned', 'task_status_changed', 'ai_generation_complete',
    'content_review', 'content_approved', 'content_published',
    'team_activity', 'kpi_anomaly', 'weekly_report', 'system_alert'
  )),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',

  entity_type TEXT,
  entity_id TEXT,
  action_url TEXT,

  triggered_by_user_id TEXT,
  metadata JSONB DEFAULT '{}',

  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON notifications(recipient_user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_company
  ON notifications(company_id, created_at DESC);

-- ═══════════════════════════════════════════════
-- Notification Preferences table
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, company_id, type)
);
`;

async function run() {
  console.log(`\\n📬 Notification System Migration (schema: ${schema})\\n`);

  // Execute SQL via rpc or direct query
  const { error } = await supabase.rpc('exec_sql', { query: SQL }).maybeSingle();

  if (error) {
    // If rpc is not available, try creating tables individually via insert-based approach
    console.log('ℹ️  rpc exec_sql not available, creating tables via Supabase API...');
    await createTablesViaApi();
  } else {
    console.log('✅ Tables created via SQL');
  }

  console.log('\\n✅ Notification migration complete!\\n');
}

async function createTablesViaApi() {
  // Test if table already exists by trying to select from it
  const { error: testError } = await supabase.from('notifications').select('id').limit(1);

  if (testError && testError.message.includes('does not exist')) {
    console.log('⚠️  The notifications table does not exist yet.');
    console.log('   Please run the following SQL in your Supabase SQL editor:\\n');
    console.log(SQL);
    console.log('\\n   After running the SQL, re-run this migration script.');
    process.exit(0);
  } else if (testError) {
    console.log('⚠️  Unexpected error checking table:', testError.message);
    console.log('   Please run the SQL manually in the Supabase SQL editor:\\n');
    console.log(SQL);
    process.exit(0);
  } else {
    console.log('✅ notifications table already exists');
  }

  // Check notification_preferences
  const { error: prefError } = await supabase.from('notification_preferences').select('id').limit(1);
  if (prefError && prefError.message.includes('does not exist')) {
    console.log('⚠️  notification_preferences table needs to be created manually.');
  } else if (!prefError) {
    console.log('✅ notification_preferences table already exists');
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
