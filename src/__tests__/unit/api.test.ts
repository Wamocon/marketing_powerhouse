/**
 * Unit tests for src/lib/api.ts
 *
 * Coverage strategy: all exported functions are exercised with
 * a Proxy-based Supabase chain mock that satisfies both awaitable
 * multi-step chains (select/eq/order/single) and error paths.
 *
 * Branch coverage targets:
 *  fetchUserById   — error/null → null  |  success → mapped user
 *  loginUser       — error/null → null  |  success → mapped user
 *  fetchUsers      — data null → []     |  data → mapped array
 *  updateUserStatus — success | error throws
 *  fetchTouchpoints — null data → []   |  kpis present vs absent
 *  createTouchpoint — kpis null vs provided | error throws
 *  updateTouchpoint — all fields defined | no fields | error throws
 *  deleteTouchpoint — success | error throws
 *  fetchCampaigns  — null data → []    |  data → mapped array
 *  createCampaign  — channelKpis null vs provided | error throws
 *  updateCampaign  — all fields | no fields | error throws
 *  deleteCampaign  — success | error throws
 *  fetchJourneys   — empty → []  | non-empty without stages | with stages
 *  createJourney   — without stages | with stages | error throws
 *  deleteJourney   — success | error throws
 */
import { describe, it, expect, vi } from 'vitest';

// ─── Mock supabase module before any api import ───────────────────────────────
vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '@/lib/supabase';
import type { Mock } from 'vitest';
import * as api from '@/lib/api';

// ─── Proxy-based chainable Supabase mock ─────────────────────────────────────
/**
 * Returns a Proxy where every method call returns itself, and the whole chain
 * is awaitable (thenable) resolving to `result`.  Covers all Supabase patterns:
 *   await supabase.from('x').select('*')
 *   await supabase.from('x').select('*').eq(...).single()
 *   await supabase.from('x').insert(row).select().single()
 */
function chain(result: { data: unknown; error: unknown }) {
  let proxy: object;
  const handler: ProxyHandler<object> = {
    get(_t, prop: string | symbol) {
      if (prop === 'then') return (onRes: Function, onRej?: Function) => Promise.resolve(result).then(onRes as any, onRej as any);
      if (prop === 'catch') return (fn: Function) => Promise.resolve(result).catch(fn as any);
      if (prop === 'finally') return (fn: Function) => Promise.resolve(result).finally(fn as any);
      return () => proxy; // any other method returns the same proxy
    },
  };
  proxy = new Proxy({}, handler);
  return proxy;
}

// Convenience: reset the mock before each test
function mockFrom(result: { data: unknown; error: unknown }) {
  (supabase.from as Mock).mockReturnValue(chain(result));
}

function mockFromOnce(results: Array<{ data: unknown; error: unknown }>) {
  const mock = supabase.from as Mock;
  results.forEach(r => mock.mockReturnValueOnce(chain(r)));
}

// ─── Shared DB rows (snake_case) ──────────────────────────────────────────────
const dbUser = {
  id: 'u1', name: 'Daniel Admin', email: 'daniel@test.de',
  password: 'admin123', role: 'admin', job_title: 'Admin',
  avatar: 'DA', status: 'online', department: 'IT', phone: '', joined_at: '2024-01-01',
};

const dbTouchpointWithKpis = {
  id: 'tp1', name: 'Website CTA', type: 'Website', journey_phase: 'Awareness',
  url: 'https://example.com', status: 'active', description: 'CTA button',
  kpis: { impressions: 100, clicks: 20, ctr: 0.2, conversions: 5 },
};

const dbTouchpointNoKpis = { ...dbTouchpointWithKpis, id: 'tp2', kpis: null };

const dbCampaign = {
  id: 'c1', name: 'Q1 2025', status: 'active', start_date: '2025-01-01',
  end_date: '2025-03-31', budget: 10000, spent: 3000, channels: ['Instagram'],
  touchpoint_ids: [], description: 'Q1', master_prompt: '', target_audiences: [],
  campaign_keywords: [], kpis: {}, channel_kpis: null, owner: 'Daniel', progress: 30,
  responsible_manager_id: 'u1', team_member_ids: ['u2', 'u3'],
};

const dbJourney = {
  id: 'j1', name: 'A-Journey', audience_id: 'aud1', description: 'Test',
};

const dbStage = {
  id: 's1', journey_id: 'j1', phase: 'Awareness', title: 'Stage 1',
  description: 'Desc', touchpoints: [], content_formats: [], emotions: [],
  pain_points: [], metrics: {}, content_ids: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

describe('fetchUserById()', () => {
  // BRANCH: error → null
  it('returns null when Supabase returns an error', async () => {
    mockFrom({ data: null, error: new Error('not found') });
    const result = await api.fetchUserById('missing');
    expect(result).toBeNull();
  });

  // BRANCH: no data → null
  it('returns null when data is null (no matching row)', async () => {
    mockFrom({ data: null, error: null });
    const result = await api.fetchUserById('unknown');
    expect(result).toBeNull();
  });

  // BRANCH: success → mapped user
  it('returns a mapped User when data is found', async () => {
    mockFrom({ data: dbUser, error: null });
    const user = await api.fetchUserById('u1');
    expect(user).not.toBeNull();
    expect(user!.id).toBe('u1');
    expect(user!.role).toBe('admin');
    expect(user!.jobTitle).toBe('Admin');   // snake→camel mapping
    expect(user!.joinedAt).toBe('2024-01-01');
  });
});

describe('loginUser()', () => {
  // BRANCH: error → null
  it('returns null when Supabase returns an error', async () => {
    mockFrom({ data: null, error: new Error('auth error') });
    expect(await api.loginUser('wrong@test.de', 'bad')).toBeNull();
  });

  // BRANCH: no data → null
  it('returns null when no matching user is found', async () => {
    mockFrom({ data: null, error: null });
    expect(await api.loginUser('notfound@test.de', 'wrong')).toBeNull();
  });

  // BRANCH: success → mapped user
  it('returns a mapped User on valid credentials', async () => {
    mockFrom({ data: dbUser, error: null });
    const user = await api.loginUser('daniel@test.de', 'admin123');
    expect(user).not.toBeNull();
    expect(user!.email).toBe('daniel@test.de');
  });
});

describe('fetchUsers()', () => {
  // BRANCH: null data → []
  it('returns empty array when data is null', async () => {
    mockFrom({ data: null, error: null });
    expect(await api.fetchUsers()).toEqual([]);
  });

  // BRANCH: success → mapped array
  it('returns array of mapped users', async () => {
    mockFrom({ data: [dbUser], error: null });
    const users = await api.fetchUsers();
    expect(users).toHaveLength(1);
    expect(users[0].jobTitle).toBe('Admin');
  });

  it('throws when Supabase returns an error', async () => {
    mockFrom({ data: null, error: new Error('DB error') });
    await expect(api.fetchUsers()).rejects.toThrow('DB error');
  });
});

describe('updateUserStatus()', () => {
  it('resolves without throwing on success', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.updateUserStatus('u1', 'offline')).resolves.toBeUndefined();
  });

  it('throws when Supabase returns an error', async () => {
    mockFrom({ data: null, error: new Error('update failed') });
    await expect(api.updateUserStatus('u1', 'offline')).rejects.toThrow('update failed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Touchpoints
// ─────────────────────────────────────────────────────────────────────────────

describe('fetchTouchpoints()', () => {
  // BRANCH: null data → [] (data ?? [])
  it('returns empty array when data is null', async () => {
    mockFrom({ data: null, error: null });
    expect(await api.fetchTouchpoints()).toEqual([]);
  });

  // BRANCH: kpis present → included in result
  it('includes kpis object when the DB row has kpis', async () => {
    mockFrom({ data: [dbTouchpointWithKpis], error: null });
    const tps = await api.fetchTouchpoints();
    expect(tps[0].kpis).toEqual({ impressions: 100, clicks: 20, ctr: 0.2, conversions: 5 });
  });

  // BRANCH: kpis null → kpis is undefined in result
  it('sets kpis to undefined when the DB row has null kpis', async () => {
    mockFrom({ data: [dbTouchpointNoKpis], error: null });
    const tps = await api.fetchTouchpoints();
    expect(tps[0].kpis).toBeUndefined();
  });

  it('throws when Supabase returns an error', async () => {
    mockFrom({ data: null, error: new Error('fetch error') });
    await expect(api.fetchTouchpoints()).rejects.toThrow();
  });
});

describe('createTouchpoint()', () => {
  const base = {
    name: 'Test TP', type: 'Social', journeyPhase: 'Awareness',
    url: '', status: 'active' as const, description: 'Test',
  };

  // BRANCH: no kpis provided → row.kpis: null
  it('stores kpis as null when not provided', async () => {
    mockFrom({ data: { ...dbTouchpointNoKpis }, error: null });
    const tp = await api.createTouchpoint(base);
    expect(tp.kpis).toBeUndefined(); // toCamelTouchpoint maps null kpis → undefined
  });

  // BRANCH: kpis provided → row.kpis: {...}
  it('stores provided kpis object', async () => {
    const kpis = { impressions: 500, clicks: 50, ctr: 0.1, conversions: 10, spend: 0, cpc: 0, cpa: 0 };
    mockFrom({ data: { ...dbTouchpointWithKpis, kpis }, error: null });
    const tp = await api.createTouchpoint({ ...base, kpis });
    expect(tp.kpis).toEqual(kpis);
  });

  it('throws when Supabase returns an error', async () => {
    mockFrom({ data: null, error: new Error('insert failed') });
    await expect(api.createTouchpoint(base)).rejects.toThrow('insert failed');
  });
});

describe('updateTouchpoint()', () => {
  // BRANCH: all fields provided → all ifs are truthy
  it('resolves when all update fields are provided', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.updateTouchpoint('tp1', {
      name: 'New Name', type: 'Email', journeyPhase: 'Decision',
      url: 'http://new.url', status: 'inactive', description: 'Updated',
      kpis: { impressions: 1, clicks: 0, ctr: 0, conversions: 0, spend: 0, cpc: 0, cpa: 0 },
    })).resolves.toBeUndefined();
  });

  // BRANCH: no fields provided → all ifs are falsy → empty row update
  it('resolves when no update fields are provided', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.updateTouchpoint('tp1', {})).resolves.toBeUndefined();
  });

  it('throws when Supabase returns an error', async () => {
    mockFrom({ data: null, error: new Error('update error') });
    await expect(api.updateTouchpoint('tp1', { name: 'X' })).rejects.toThrow('update error');
  });
});

describe('deleteTouchpoint()', () => {
  it('resolves on success', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.deleteTouchpoint('tp1')).resolves.toBeUndefined();
  });

  it('throws when Supabase returns an error', async () => {
    mockFrom({ data: null, error: new Error('delete error') });
    await expect(api.deleteTouchpoint('tp1')).rejects.toThrow('delete error');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Campaigns
// ─────────────────────────────────────────────────────────────────────────────

describe('fetchCampaigns()', () => {
  it('returns empty array when data is null', async () => {
    mockFrom({ data: null, error: null });
    expect(await api.fetchCampaigns()).toEqual([]);
  });

  it('returns mapped campaigns', async () => {
    mockFrom({ data: [dbCampaign], error: null });
    const campaigns = await api.fetchCampaigns();
    expect(campaigns).toHaveLength(1);
    expect(campaigns[0].startDate).toBe('2025-01-01');  // snake→camel
    expect(campaigns[0].channelKpis).toBeUndefined();   // null → undefined (??)
  });
});

describe('createCampaign()', () => {
  const base = {
    name: 'TestCamp', status: 'planned' as const, startDate: '2025-01-01',
    endDate: '2025-12-31', budget: 5000, spent: 0, channels: [],
    description: '', masterPrompt: '', targetAudiences: [],
    campaignKeywords: [], kpis: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 }, owner: 'Test', progress: 0,
    responsibleManagerId: '', teamMemberIds: [] as string[],
  };

  // BRANCH: channelKpis undefined → null sent to DB
  it('creates campaign without channelKpis', async () => {
    mockFrom({ data: { ...dbCampaign }, error: null });
    const c = await api.createCampaign(base);
    expect(c.id).toBe('c1');
    expect(c.channelKpis).toBeUndefined();
  });

  // BRANCH: channelKpis provided
  it('creates campaign with channelKpis', async () => {
    const channelKpis = { Instagram: { impressions: 1000, clicks: 50, conversions: 5, ctr: 0.05, spend: 100, cpc: 2, cpa: 20 } };
    mockFrom({ data: { ...dbCampaign, channel_kpis: channelKpis }, error: null });
    const c = await api.createCampaign({ ...base, channelKpis });
    expect(c.channelKpis).toEqual(channelKpis);
  });

  it('throws on DB error', async () => {
    mockFrom({ data: null, error: new Error('insert failed') });
    await expect(api.createCampaign(base)).rejects.toThrow();
  });
});

describe('updateCampaign()', () => {
  // BRANCH: all fields defined
  it('resolves when all fields are updated', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.updateCampaign('c1', {
      name: 'X', status: 'active', startDate: '2025-01-01', endDate: '2025-12-31',
      budget: 1000, spent: 100, channels: ['Instagram'], description: 'D',
      masterPrompt: 'M', targetAudiences: [], campaignKeywords: [],
      kpis: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 }, channelKpis: {}, owner: 'O', progress: 50,
    })).resolves.toBeUndefined();
  });

  // BRANCH: no fields defined
  it('resolves when no fields are provided', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.updateCampaign('c1', {})).resolves.toBeUndefined();
  });

  it('throws on DB error', async () => {
    mockFrom({ data: null, error: new Error('update failed') });
    await expect(api.updateCampaign('c1', { name: 'X' })).rejects.toThrow();
  });
});

describe('deleteCampaign()', () => {
  it('resolves on success', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.deleteCampaign('c1')).resolves.toBeUndefined();
  });

  it('throws on DB error', async () => {
    mockFrom({ data: null, error: new Error('delete error') });
    await expect(api.deleteCampaign('c1')).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Journeys — most complex branching in api.ts
// ─────────────────────────────────────────────────────────────────────────────

describe('fetchJourneys()', () => {
  // BRANCH A: empty / null journeys → return []
  it('returns empty array when Supabase returns no journeys', async () => {
    mockFrom({ data: [], error: null });
    expect(await api.fetchJourneys('asidas')).toEqual([]);
  });

  it('returns empty array when journey data is null', async () => {
    mockFrom({ data: null, error: null });
    expect(await api.fetchJourneys('customer')).toEqual([]);
  });

  // BRANCH B: journeys exist but no stages
  it('returns journeys with empty stages array when no stages exist', async () => {
    mockFromOnce([
      { data: [dbJourney], error: null },    // journeys query
      { data: [], error: null },             // stages query
    ]);
    const journeys = await api.fetchJourneys('asidas');
    expect(journeys).toHaveLength(1);
    expect(journeys[0].id).toBe('j1');
    expect(journeys[0].stages).toEqual([]);
  });

  // BRANCH C: journeys + stages → fully mapped
  it('maps stages to their parent journey', async () => {
    mockFromOnce([
      { data: [dbJourney], error: null },
      { data: [dbStage], error: null },
    ]);
    const journeys = await api.fetchJourneys('asidas');
    expect(journeys[0].stages).toHaveLength(1);
    expect(journeys[0].stages[0].phase).toBe('Awareness');
    expect(journeys[0].stages[0].contentFormats).toEqual([]); // snake→camel
    expect(journeys[0].stages[0].painPoints).toEqual([]);
  });

  it('throws when first Supabase call returns error', async () => {
    mockFrom({ data: null, error: new Error('journey fetch error') });
    await expect(api.fetchJourneys('asidas')).rejects.toThrow('journey fetch error');
  });

  it('throws when stage fetch returns error', async () => {
    mockFromOnce([
      { data: [dbJourney], error: null },
      { data: null, error: new Error('stage fetch error') },
    ]);
    await expect(api.fetchJourneys('asidas')).rejects.toThrow('stage fetch error');
  });
});

describe('createJourney()', () => {
  const baseJourney = {
    name: 'Test Journey', audienceId: 'aud1', description: 'Desc', stages: [],
  };

  // BRANCH: no stages → only journey row inserted, no stage insert
  it('creates journey without stages', async () => {
    // Two from() calls: insert journey, then no stage insert
    mockFrom({ data: null, error: null });
    const result = await api.createJourney(baseJourney, 'asidas');
    expect(result.name).toBe('Test Journey');
    expect(result.stages).toEqual([]);
  });

  // BRANCH: with stages → stage rows also inserted
  it('creates journey with stages', async () => {
    mockFromOnce([
      { data: null, error: null }, // journey insert
      { data: null, error: null }, // stages insert
    ]);
    const stage = {
      id: 's1', phase: 'Awareness', title: 'Stage 1', description: '',
      touchpoints: [], contentFormats: [], emotions: [], painPoints: [],
      metrics: { label: '', value: '', trend: '' }, contentIds: [],
    };
    const result = await api.createJourney({ ...baseJourney, stages: [stage] }, 'customer');
    expect(result.stages).toHaveLength(1);
    expect(result.stages[0].phase).toBe('Awareness');
  });

  it('throws on journey insert error', async () => {
    mockFrom({ data: null, error: new Error('insert failed') });
    await expect(api.createJourney(baseJourney, 'asidas')).rejects.toThrow('insert failed');
  });

  it('throws on stage insert error', async () => {
    const stage = {
      id: 's1', phase: 'Awareness', title: 'Stage 1', description: '',
      touchpoints: [], contentFormats: [], emotions: [], painPoints: [],
      metrics: { label: '', value: '', trend: '' }, contentIds: [],
    };
    mockFromOnce([
      { data: null, error: null },
      { data: null, error: new Error('stage insert failed') },
    ]);
    await expect(api.createJourney({ ...baseJourney, stages: [stage] }, 'asidas'))
      .rejects.toThrow('stage insert failed');
  });
});

describe('deleteJourney()', () => {
  it('resolves on success', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.deleteJourney('j1')).resolves.toBeUndefined();
  });

  it('throws on DB error', async () => {
    mockFrom({ data: null, error: new Error('delete error') });
    await expect(api.deleteJourney('j1')).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Audiences
// ─────────────────────────────────────────────────────────────────────────────

const dbAudience = {
  id: 'a1', name: 'B2B Entscheider', type: 'B2B', segment: 'primary', color: '#333',
  initials: 'BE', age: '35-50', gender: 'mixed', location: 'DACH', income: 'high',
  education: 'university', job_title: 'CEO', interests: [], pain_points: [], goals: [],
  preferred_channels: [], buying_behavior: 'deliberate', decision_process: 'committee',
  journey_phase: 'Awareness', description: '', campaign_ids: [],
  created_at: '2025-01-01', updated_at: '2025-01-01',
};

describe('fetchAudiences()', () => {
  it('returns empty array when data is null', async () => {
    mockFrom({ data: null, error: null });
    expect(await api.fetchAudiences()).toEqual([]);
  });

  it('returns mapped audiences', async () => {
    mockFrom({ data: [dbAudience], error: null });
    const audiences = await api.fetchAudiences();
    expect(audiences[0].jobTitle).toBe('CEO');   // snake→camel
    expect(audiences[0].painPoints).toEqual([]); // snake→camel
  });
});

describe('updateAudience()', () => {
  it('resolves when all fields are provided', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.updateAudience('a1', {
      name: 'New', type: 'B2C', segment: 'B2B', color: '#fff',
      initials: 'NN', age: '25-35', gender: 'female', location: 'DE',
      income: 'medium', education: 'bachelor', jobTitle: 'Manager',
      interests: [], painPoints: [], goals: [], preferredChannels: [],
      buyingBehavior: 'fast', decisionProcess: 'solo', journeyPhase: 'Decision',
      description: 'Updated', campaignIds: [],
    })).resolves.toBeUndefined();
  });

  it('resolves when no fields are provided', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.updateAudience('a1', {})).resolves.toBeUndefined();
  });
});

describe('deleteAudience()', () => {
  it('resolves on success', async () => {
    mockFrom({ data: null, error: null });
    await expect(api.deleteAudience('a1')).resolves.toBeUndefined();
  });

  it('throws on DB error', async () => {
    mockFrom({ data: null, error: new Error('delete error') });
    await expect(api.deleteAudience('a1')).rejects.toThrow();
  });
});
