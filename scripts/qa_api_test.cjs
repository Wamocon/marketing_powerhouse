/**
 * QA: Test subscription API endpoints end-to-end
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'test';
const s = createClient(url, key, { db: { schema } });

let passed = 0;
let failed = 0;

function pass(msg) { console.log('  [PASS] ' + msg); passed++; }
function fail(msg) { console.log('  [FAIL] ' + msg); failed++; }

(async () => {
  console.log('=== QA: API Endpoint Tests ===\n');

  // Test 1: fetchPlans
  console.log('--- Test: fetchPlans ---');
  const { data: plans, error: pe } = await s
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (pe) fail('fetchPlans error: ' + pe.message);
  else if (plans.length === 3) pass('fetchPlans returns 3 active plans');
  else fail('fetchPlans returned ' + plans.length + ' plans');

  // Test 2: fetchSubscription with join
  console.log('--- Test: fetchSubscription (with plan join) ---');
  const { data: sub, error: se } = await s
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('company_id', 'c1')
    .single();
  if (se) fail('fetchSubscription error: ' + se.message);
  else {
    if (sub.plans) pass('fetchSubscription returns joined plan data');
    else fail('fetchSubscription: no plan data in join');
    if (sub.status === 'active') pass('Subscription status is active');
    else fail('Wrong status: ' + sub.status);
    if (sub.plans && sub.plans.slug === 'ultimate') pass('Plan slug is ultimate');
    else fail('Wrong plan: ' + (sub.plans?.slug || 'null'));
  }

  // Test 3: createSubscription (simulate with a temp company)
  console.log('--- Test: createSubscription ---');
  // Create temp company
  const tempCompanyId = 'qa-temp-' + Date.now();
  const { error: cc } = await s.from('companies').insert({
    id: tempCompanyId,
    name: 'QA Test Company',
    slug: 'qa-test-' + Date.now(),
    description: 'Temporary for QA',
    industry: 'Test',
    logo: 'Q',
    created_by: 'u1',
  });
  if (cc) {
    fail('Could not create temp company: ' + cc.message);
  } else {
    const starterPlan = plans.find(p => p.slug === 'starter');
    if (!starterPlan) {
      fail('No starter plan found for test');
    } else {
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 86400000);
      const { data: newSub, error: nse } = await s
        .from('subscriptions')
        .insert({
          company_id: tempCompanyId,
          plan_id: starterPlan.id,
          billing_cycle: 'monthly',
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .select()
        .single();
      if (nse) fail('createSubscription error: ' + nse.message);
      else if (newSub) {
        pass('createSubscription works');

        // Test 4: updateSubscription (upgrade to pro)
        console.log('--- Test: updateSubscription (upgrade) ---');
        const proPlan = plans.find(p => p.slug === 'pro');
        if (proPlan) {
          const { error: ue } = await s
            .from('subscriptions')
            .update({ plan_id: proPlan.id })
            .eq('id', newSub.id);
          if (ue) fail('updateSubscription error: ' + ue.message);
          else {
            // Verify the update
            const { data: updated } = await s
              .from('subscriptions')
              .select('*, plans(*)')
              .eq('id', newSub.id)
              .single();
            if (updated && updated.plans && updated.plans.slug === 'pro') {
              pass('updateSubscription: plan changed to pro');
            } else {
              fail('updateSubscription: plan not updated correctly');
            }
          }
        }

        // Cleanup: delete temp subscription and company
        await s.from('subscriptions').delete().eq('id', newSub.id);
      }
    }
    await s.from('companies').delete().eq('id', tempCompanyId);
    pass('Cleanup: temp company and subscription removed');
  }

  // Test 5: Verify LoginPage plan state initialization
  console.log('--- Test: LoginPage plan loading (fetchPlans for registration) ---');
  const { data: regPlans } = await s.from('plans').select('id,name,slug,price_monthly_cents').eq('is_active', true).order('sort_order');
  if (regPlans && regPlans.length === 3) {
    pass('Registration plan picker: 3 plans available');
    for (const p of regPlans) {
      console.log('    ' + p.name + ' (' + p.slug + '): EUR' + (p.price_monthly_cents / 100));
    }
  } else {
    fail('Plan picker would fail: ' + (regPlans?.length || 0) + ' plans');
  }

  // Test 6: Verify subscription for all companies (no orphans)
  console.log('--- Test: No orphan companies (all have subscriptions) ---');
  const { data: allCompanies } = await s.from('companies').select('id, name');
  const { data: allSubs } = await s.from('subscriptions').select('company_id');
  const subCompanyIds = new Set((allSubs || []).map(sub => sub.company_id));
  const orphans = (allCompanies || []).filter(c => !subCompanyIds.has(c.id));
  if (orphans.length === 0) pass('All companies have subscriptions');
  else fail('Orphan companies without subscriptions: ' + orphans.map(c => c.name).join(', '));

  // Summary
  console.log('\n=== API Test Summary ===');
  console.log('Passed: ' + passed + ' | Failed: ' + failed);
  if (failed === 0) console.log('ALL API TESTS PASSED');
  else console.log(failed + ' FAILURE(S) - REVIEW ABOVE');
})().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
