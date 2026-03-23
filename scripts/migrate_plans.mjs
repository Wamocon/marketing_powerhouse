/**
 * Migration: Plans & Subscriptions
 * Seeds the plans table with Starter/Pro/Ultimate tiers and creates
 * an "Ultimate" subscription for every existing company (test users).
 *
 * Usage:
 *   node scripts/migrate_plans.mjs
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

// ─── SQL to create tables ──────────────────────────────────

const DDL_SQL = `
-- ═══════════════════════════════════════════════
-- Plans table
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_monthly_cents INTEGER NOT NULL DEFAULT 0,
  price_yearly_cents INTEGER NOT NULL DEFAULT 0,
  max_seats INTEGER NOT NULL DEFAULT 2,
  max_projects INTEGER NOT NULL DEFAULT 1,
  included_social_accounts INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- Subscriptions table
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','trialing','past_due','canceled','paused')),
  current_seats INTEGER NOT NULL DEFAULT 1,
  current_projects INTEGER NOT NULL DEFAULT 1,
  extra_social_accounts INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);
`;

// ─── Plan seed data ────────────────────────────────────────

const PLANS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Starter',
    slug: 'starter',
    description: 'Ideal for solo marketers and small teams getting started.',
    price_monthly_cents: 2900,
    price_yearly_cents: 29000,
    max_seats: 2,
    max_projects: 1,
    included_social_accounts: 0,
    features: { core: true, ai_pro: false, linkedin: false, instagram: false, max_ai_generations_month: 0 },
    is_active: true,
    sort_order: 1,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Pro',
    slug: 'pro',
    description: 'For growing teams with AI-powered content and LinkedIn publishing.',
    price_monthly_cents: 7900,
    price_yearly_cents: 79000,
    max_seats: 5,
    max_projects: 3,
    included_social_accounts: 1,
    features: { core: true, ai_pro: true, linkedin: true, instagram: false, max_ai_generations_month: -1 },
    is_active: true,
    sort_order: 2,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Ultimate',
    slug: 'ultimate',
    description: 'Full power for agencies and large marketing departments.',
    price_monthly_cents: 14900,
    price_yearly_cents: 149000,
    max_seats: 10,
    max_projects: 10,
    included_social_accounts: 4,
    features: { core: true, ai_pro: true, linkedin: true, instagram: true, max_ai_generations_month: -1 },
    is_active: true,
    sort_order: 3,
  },
];

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log(`[migrate_plans] Using schema: ${schema}`);

  // 1. Run DDL
  console.log('[migrate_plans] Creating tables...');
  const { error: ddlError } = await supabase.rpc('exec_sql', { sql: DDL_SQL });
  if (ddlError) {
    // If exec_sql RPC doesn't exist, tables may already exist — try insertion directly
    console.warn('[migrate_plans] DDL via RPC failed (tables may already exist):', ddlError.message);
  } else {
    console.log('[migrate_plans] Tables created/verified.');
  }

  // 2. Upsert plans
  console.log('[migrate_plans] Seeding plans...');
  for (const plan of PLANS) {
    const { error } = await supabase
      .from('plans')
      .upsert(plan, { onConflict: 'slug' });
    if (error) {
      console.error(`  [ERROR] Plan "${plan.slug}":`, error.message);
    } else {
      console.log(`  [OK] Plan "${plan.slug}" upserted.`);
    }
  }

  // 3. Assign Ultimate to every existing company that has no subscription
  console.log('[migrate_plans] Assigning Ultimate to test companies...');
  const { data: companies, error: compErr } = await supabase
    .from('companies')
    .select('id, name');
  if (compErr) {
    console.error('  [ERROR] Fetching companies:', compErr.message);
    return;
  }

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 365 * 86400000); // 1 year from now

  for (const company of (companies ?? [])) {
    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('company_id', company.id)
      .maybeSingle();

    if (existing) {
      // Update to ultimate
      const { error: upErr } = await supabase
        .from('subscriptions')
        .update({
          plan_id: '00000000-0000-0000-0000-000000000003',
          status: 'active',
          current_period_end: periodEnd.toISOString(),
        })
        .eq('id', existing.id);
      if (upErr) {
        console.error(`  [ERROR] Updating subscription for "${company.name}":`, upErr.message);
      } else {
        console.log(`  [OK] "${company.name}" subscription updated to Ultimate.`);
      }
    } else {
      // Create new subscription
      const { error: insErr } = await supabase
        .from('subscriptions')
        .insert({
          company_id: company.id,
          plan_id: '00000000-0000-0000-0000-000000000003',
          status: 'active',
          current_seats: 10,
          current_projects: 10,
          extra_social_accounts: 0,
          billing_cycle: 'monthly',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
      if (insErr) {
        console.error(`  [ERROR] Creating subscription for "${company.name}":`, insErr.message);
      } else {
        console.log(`  [OK] "${company.name}" → Ultimate subscription created.`);
      }
    }
  }

  console.log('[migrate_plans] Done.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
