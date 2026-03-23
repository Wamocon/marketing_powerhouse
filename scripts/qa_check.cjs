/**
 * QA Check: Verify database integrity for plans & subscriptions
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'test';

if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

const s = createClient(url, key, { db: { schema } });
let issues = 0;

function fail(msg) {
  console.log('  [FAIL] ' + msg);
  issues++;
}
function pass(msg) {
  console.log('  [PASS] ' + msg);
}

(async () => {
  console.log('=== QA: Plans & Subscriptions (' + schema + ' schema) ===\n');

  // 1. Plans
  console.log('--- Plans Table ---');
  const { data: plans, error: pe } = await s.from('plans').select('*').order('sort_order');
  if (pe) { fail('Plans query error: ' + pe.message); return; }
  
  if (plans.length === 3) pass('3 plans exist');
  else fail('Expected 3 plans, got ' + plans.length);

  const slugs = plans.map(p => p.slug);
  if (slugs.includes('starter') && slugs.includes('pro') && slugs.includes('ultimate')) {
    pass('All 3 slugs present: starter, pro, ultimate');
  } else {
    fail('Missing slug(s). Found: ' + slugs.join(', '));
  }

  for (const p of plans) {
    console.log('  Plan: ' + p.name + ' (' + p.slug + ')');
    console.log('    Price: EUR' + (p.price_monthly_cents / 100) + '/month');
    console.log('    Seats: ' + p.max_seats + ' | Projects: ' + p.max_projects + ' | Social: ' + p.included_social_accounts);
    console.log('    Features: ' + JSON.stringify(p.features));
    
    // Validate features structure
    const f = p.features;
    if (typeof f.core !== 'boolean') fail(p.slug + ': features.core is not boolean');
    if (typeof f.ai_pro !== 'boolean') fail(p.slug + ': features.ai_pro is not boolean');
    if (typeof f.linkedin !== 'boolean') fail(p.slug + ': features.linkedin is not boolean');
    if (typeof f.instagram !== 'boolean') fail(p.slug + ': features.instagram is not boolean');
    if (typeof f.max_ai_generations_month !== 'number') fail(p.slug + ': features.max_ai_generations_month is not number');
  }

  // Validate specific plan values
  const starter = plans.find(p => p.slug === 'starter');
  const pro = plans.find(p => p.slug === 'pro');
  const ultimate = plans.find(p => p.slug === 'ultimate');

  if (starter) {
    if (starter.price_monthly_cents === 2900) pass('Starter price correct: EUR29');
    else fail('Starter price wrong: ' + starter.price_monthly_cents);
    if (starter.max_seats === 2) pass('Starter seats=2');
    else fail('Starter seats wrong: ' + starter.max_seats);
    if (starter.features.ai_pro === false) pass('Starter: AI Pro disabled');
    else fail('Starter should NOT have AI Pro');
  }

  if (pro) {
    if (pro.price_monthly_cents === 7900) pass('Pro price correct: EUR79');
    else fail('Pro price wrong: ' + pro.price_monthly_cents);
    if (pro.max_seats === 5) pass('Pro seats=5');
    else fail('Pro seats wrong: ' + pro.max_seats);
    if (pro.features.ai_pro === true) pass('Pro: AI Pro enabled');
    else fail('Pro should have AI Pro');
    if (pro.features.linkedin === true) pass('Pro: LinkedIn enabled');
    else fail('Pro should have LinkedIn');
    if (pro.features.instagram === false) pass('Pro: Instagram disabled');
    else fail('Pro should NOT have Instagram');
  }

  if (ultimate) {
    if (ultimate.price_monthly_cents === 14900) pass('Ultimate price correct: EUR149');
    else fail('Ultimate price wrong: ' + ultimate.price_monthly_cents);
    if (ultimate.max_seats === 10) pass('Ultimate seats=10');
    else fail('Ultimate seats wrong: ' + ultimate.max_seats);
    if (ultimate.features.ai_pro === true) pass('Ultimate: AI Pro enabled');
    else fail('Ultimate should have AI Pro');
    if (ultimate.features.instagram === true) pass('Ultimate: Instagram enabled');
    else fail('Ultimate should have Instagram');
  }

  // 2. Subscriptions
  console.log('\n--- Subscriptions Table ---');
  const { data: subs, error: se } = await s.from('subscriptions').select('*, plans(name,slug)');
  if (se) { fail('Subscriptions query error: ' + se.message); return; }

  // 3. Companies
  const { data: companies } = await s.from('companies').select('id, name');
  const companyCount = (companies || []).length;

  console.log('  Companies: ' + companyCount + ' | Subscriptions: ' + subs.length);

  if (subs.length >= companyCount) pass('All companies have subscriptions');
  else fail(companyCount + ' companies but only ' + subs.length + ' subscriptions');

  for (const sub of subs) {
    const planName = sub.plans ? sub.plans.name : 'UNKNOWN';
    const planSlug = sub.plans ? sub.plans.slug : 'UNKNOWN';
    const companyName = (companies || []).find(c => c.id === sub.company_id)?.name || sub.company_id;
    console.log('  ' + companyName + ' -> ' + planName + ' (' + planSlug + ') | status=' + sub.status);
    
    if (sub.status !== 'active') fail(companyName + ': subscription not active');
      if (!['starter', 'pro', 'ultimate'].includes(planSlug)) fail(companyName + ': invalid plan slug ' + planSlug);
    if (!sub.current_period_end) fail(companyName + ': no period end date');
  }

  // 4. Cross-check: fetchSubscription join
  console.log('\n--- API Join Test (subscription + plan) ---');
  const testCompanyId = companies && companies[0] ? companies[0].id : null;
  if (testCompanyId) {
    const { data: joinTest, error: je } = await s
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('company_id', testCompanyId)
      .single();
    if (je) {
      fail('Join query failed: ' + je.message);
    } else if (joinTest && joinTest.plans) {
      pass('Subscription join with plan works. Plan: ' + joinTest.plans.name);
    } else {
      fail('Join returned data but no plans object');
    }
  }

  // 5. Check knowledge_documents for AI
  console.log('\n--- Knowledge Documents (for AI) ---');
  const { data: docs, error: de } = await s.from('knowledge_documents').select('id,title,category,content').eq('is_active', true);
  if (de) {
    fail('Knowledge docs query error: ' + de.message);
  } else {
    console.log('  Total active docs: ' + (docs || []).length);
    const categories = {};
    for (const d of (docs || [])) {
      categories[d.category] = (categories[d.category] || 0) + 1;
    }
    console.log('  Categories: ' + JSON.stringify(categories));
    if ((docs || []).length >= 5) pass('Sufficient knowledge documents');
    else fail('Only ' + (docs || []).length + ' knowledge docs - AI quality may suffer');
  }

  // Summary
  console.log('\n=== QA SUMMARY ===');
  if (issues === 0) {
    console.log('ALL CHECKS PASSED - No issues found.');
  } else {
    console.log(issues + ' ISSUE(S) FOUND - Review above.');
  }
})().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
