/**
 * QA verification script — tests plans, subscriptions, and full pricing flow.
 * Usage: node scripts/qa_pricing.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'test';

if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(url, key, { db: { schema } });

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function main() {
  console.log(`\n═══ QA: Pricing System (schema: ${schema}) ═══\n`);

  // 1. Plans table
  console.log('── Plans ──');
  const { data: plans, error: planErr } = await supabase
    .from('plans')
    .select('*')
    .order('sort_order');
  
  assert('Plans table exists and is readable', !planErr, planErr?.message);
  assert('3 plans exist', plans?.length === 3, `found ${plans?.length}`);

  if (plans?.length === 3) {
    const [starter, pro, ultimate] = plans;
    assert('Starter slug correct', starter.slug === 'starter');
    assert('Starter price €29', starter.price_monthly_cents === 2900);
    assert('Starter max_seats = 2', starter.max_seats === 2);
    assert('Starter max_projects = 1', starter.max_projects === 1);
    assert('Starter features.core = true', starter.features?.core === true);
    assert('Starter features.ai_pro = false', starter.features?.ai_pro === false);
    
    assert('Pro slug correct', pro.slug === 'pro');
    assert('Pro price €79', pro.price_monthly_cents === 7900);
    assert('Pro max_seats = 5', pro.max_seats === 5);
    assert('Pro features.ai_pro = true', pro.features?.ai_pro === true);
    assert('Pro features.linkedin = true', pro.features?.linkedin === true);
    assert('Pro features.instagram = false', pro.features?.instagram === false);
    
    assert('Ultimate slug correct', ultimate.slug === 'ultimate');
    assert('Ultimate price €149', ultimate.price_monthly_cents === 14900);
    assert('Ultimate max_seats = 10', ultimate.max_seats === 10);
    assert('Ultimate features.ai_pro = true', ultimate.features?.ai_pro === true);
    assert('Ultimate features.linkedin = true', ultimate.features?.linkedin === true);
    assert('Ultimate features.instagram = true', ultimate.features?.instagram === true);
  }

  // 2. Subscriptions table
  console.log('\n── Subscriptions ──');
  const { data: subs, error: subErr } = await supabase
    .from('subscriptions')
    .select('*, plans(*)');
  
  assert('Subscriptions table exists and is readable', !subErr, subErr?.message);
  assert('Subscriptions exist', (subs?.length ?? 0) > 0, `found ${subs?.length}`);

  if (subs?.length) {
    for (const sub of subs) {
      const planName = sub.plans?.name || 'UNKNOWN';
      const companyId = sub.company_id;
      assert(`Sub ${companyId.slice(0, 8)}… → ${planName}`, sub.status === 'active');
      assert(`  Plan join works`, !!sub.plans, 'plans join returned null');
      assert(`  Has period dates`, !!sub.current_period_start && !!sub.current_period_end);
    }
  }

  // 3. Companies all have subscriptions
  console.log('\n── Company coverage ──');
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name');
  
  for (const company of (companies || [])) {
    const hasSub = subs?.some(s => s.company_id === company.id);
    assert(`"${company.name}" has subscription`, hasSub);
  }

  // 4. Users table basic check
  console.log('\n── Users ──');
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, name, email, role, is_super_admin');
  
  assert('Users table readable', !userErr, userErr?.message);
  assert('Users exist', (users?.length ?? 0) > 0, `found ${users?.length}`);
  
  if (users?.length) {
    const superAdmins = users.filter(u => u.is_super_admin);
    assert(`Super admins exist (${superAdmins.length})`, superAdmins.length > 0);
    for (const u of users) {
      assert(`User "${u.name}" has valid role`, ['company_admin', 'manager', 'member'].includes(u.role));
    }
  }

  // 5. Company Members
  console.log('\n── Company Members ──');
  const { data: members, error: memErr } = await supabase
    .from('company_members')
    .select('*');
  
  assert('Company members readable', !memErr, memErr?.message);
  assert('Members exist', (members?.length ?? 0) > 0, `found ${members?.length}`);

  // 6. Notifications table
  console.log('\n── Notifications ──');
  const { data: notifs, error: notifErr } = await supabase
    .from('notifications')
    .select('id')
    .limit(1);
  
  assert('Notifications table exists', !notifErr, notifErr?.message);

  // 7. Campaigns, Tasks, Content
  console.log('\n── Core data tables ──');
  for (const table of ['campaigns', 'tasks', 'contents', 'audiences', 'touchpoints', 'customer_journeys', 'positioning', 'company_keywords']) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    assert(`${table} accessible`, !error, error?.message);
    assert(`${table} has data`, (data?.length ?? 0) > 0);
  }

  // Summary
  console.log(`\n═══════════════════════════════════════`);
  console.log(`  PASSED: ${passed}  |  FAILED: ${failed}`);
  console.log(`═══════════════════════════════════════\n`);

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('QA script crashed:', err);
  process.exit(1);
});
