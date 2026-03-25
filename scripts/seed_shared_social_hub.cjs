const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'test';

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and a usable Supabase key.');
  process.exit(1);
}

const supabase = createClient(url, key, { db: { schema } });

const now = new Date();

function isoFromNow(days, hour) {
  const value = new Date(now);
  value.setDate(value.getDate() + days);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
}

const connectedAccounts = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    company_id: 'c1',
    platform: 'linkedin',
    account_name: 'WAMOCON Academy LinkedIn',
    account_id: 'wamocon-linkedin',
    platform_user_id: 'linkedin-admin-c1',
    token_scopes: ['r_liteprofile', 'w_member_social'],
    is_active: true,
    metadata: { source: 'qa_seed', label: 'shared-demo-linkedin' },
    connected_by: 'u1',
    token_expires_at: isoFromNow(45, 9),
    created_at: isoFromNow(-14, 10),
    updated_at: isoFromNow(-1, 9),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    company_id: 'c1',
    platform: 'instagram',
    account_name: 'WAMOCON Academy Instagram',
    account_id: 'wamocon-instagram',
    platform_user_id: 'instagram-admin-c1',
    token_scopes: ['instagram_basic', 'instagram_content_publish'],
    is_active: true,
    metadata: { source: 'qa_seed', label: 'shared-demo-instagram' },
    connected_by: 'u1',
    token_expires_at: isoFromNow(30, 9),
    created_at: isoFromNow(-14, 10),
    updated_at: isoFromNow(-1, 9),
  },
];

const scheduledPosts = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    company_id: 'c1',
    content_item_id: 'cnt5',
    connected_account_id: '11111111-1111-1111-1111-111111111111',
    post_text: 'Case Study: So hat ein Frankfurter Finanzunternehmen sein QA-Team mit einem Inhouse-ISTQB-Training in acht Wochen auf ein neues Niveau gebracht.',
    post_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    post_type: 'image',
    hashtags: ['#LinkedIn', '#B2BMarketing', '#CaseStudy'],
    scheduled_at: isoFromNow(1, 10),
    published_at: null,
    status: 'approved',
    auto_comment_text: 'Welche Enablement-Formate funktionieren in deinem Unternehmen am besten?',
    created_by: 'u2',
    approved_by: 'u1',
    approved_at: isoFromNow(-1, 11),
    created_at: isoFromNow(-2, 9),
    updated_at: isoFromNow(-1, 11),
    image_prompt: 'Corporate B2B case study visual with training workshop and finance team',
    sources: 'qa-seed',
    topic: 'B2B Case Study: Inhouse ISTQB Erfolg',
    notes: 'Shared QA seed linked to content cnt5 and task cr2.',
    campaign_id: '4',
    task_id: 'cr2',
    platform: 'linkedin',
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    company_id: 'c1',
    content_item_id: 'cnt1',
    connected_account_id: '22222222-2222-2222-2222-222222222222',
    post_text: 'Was ist eigentlich ein Bug? Dieses Kurzformat erklärt in 20 Sekunden, warum Testing für jedes Produktteam geschäftskritisch ist.',
    post_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    post_type: 'video',
    hashtags: ['#Instagram', '#SoftwareTesting', '#QA'],
    scheduled_at: isoFromNow(2, 12),
    published_at: null,
    status: 'draft',
    auto_comment_text: 'Soll daraus auch eine Karussell-Version entstehen?',
    created_by: 'u3',
    approved_by: null,
    approved_at: null,
    created_at: isoFromNow(-2, 14),
    updated_at: isoFromNow(-1, 8),
    image_prompt: 'Instagram reel cover explaining software bug basics with bold educational layout',
    sources: 'qa-seed',
    topic: 'Instagram Reel: Was ist ein Bug?',
    notes: 'Shared QA seed linked to content cnt1 and task cr1.',
    campaign_id: '1',
    task_id: 'cr1',
    platform: 'instagram',
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    company_id: 'c1',
    content_item_id: null,
    connected_account_id: '11111111-1111-1111-1111-111111111111',
    post_text: 'Heute live: Unsere Learnings aus 25 QA-Rollouts in regulierten Branchen. Drei Muster, die wiederholt zu schnelleren Releases geführt haben.',
    post_image_url: null,
    post_type: 'text',
    hashtags: ['#ThoughtLeadership', '#QA', '#ReleaseManagement'],
    scheduled_at: isoFromNow(-1, 9),
    published_at: isoFromNow(-1, 9),
    status: 'published',
    auto_comment_text: 'Wenn du magst, teile deine eigenen Rollout-Learnings unten.',
    created_by: 'u1',
    approved_by: 'u1',
    approved_at: isoFromNow(-2, 16),
    created_at: isoFromNow(-3, 15),
    updated_at: isoFromNow(-1, 9),
    image_prompt: null,
    sources: 'qa-seed',
    topic: 'QA Rollout Learnings',
    notes: 'Shared QA seed for dashboard and published-state coverage.',
    campaign_id: '4',
    task_id: null,
    platform: 'linkedin',
  },
];

async function upsertTable(table, rows) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    throw error;
  }
}

(async () => {
  console.log(`Seeding shared Social Hub QA data into schema ${schema}...`);
  await upsertTable('connected_accounts', connectedAccounts);
  await upsertTable('scheduled_posts', scheduledPosts);

  const { count: accountCount, error: accountError } = await supabase
    .from('connected_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', 'c1');
  if (accountError) throw accountError;

  const { count: postCount, error: postError } = await supabase
    .from('scheduled_posts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', 'c1');
  if (postError) throw postError;

  console.log(`Connected accounts for c1: ${accountCount}`);
  console.log(`Scheduled posts for c1: ${postCount}`);
  console.log('Shared Social Hub QA seed complete.');
})().catch((error) => {
  console.error('Failed to seed shared Social Hub QA data:', error.message || error);
  process.exit(1);
});