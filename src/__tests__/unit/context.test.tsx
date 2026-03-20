/**
 * Unit tests for DataContext CRUD mutators.
 *
 * Strategy: mock the entire @/lib/api module, render DataProvider
 * on a background with all fetch functions returning empty/minimal data,
 * then call each mutator and assert:
 *   1. the correct api function was called
 *   2. the React state was updated correctly
 *
 * Branches covered per mutator pair (add/update/delete):
 *   add   → api.createX called → new item appended to state
 *   update → api.updateX called → matching item updated in state
 *   delete → api.deleteX called → matching item removed from state
 *
 * addJourney / deleteJourney update customerJourneys state.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import type { Campaign, Touchpoint } from '../../types';

// ─── Mock CompanyContext so DataProvider can call useCompany ───────────────────
vi.mock('@/context/CompanyContext', () => ({
  useCompany: () => ({
    activeCompany: { id: 'c1' },
  }),
}));

// ─── Mock the api module ──────────────────────────────────────────────────────
vi.mock('@/lib/api', async () => {
  const emptyPositioning = {
    name: '', tagline: '', founded: '', industry: '', headquarters: '',
    legalForm: '', employees: '', website: '', vision: '', mission: '',
    values: [], toneOfVoice: { adjectives: [], description: '', personality: '' },
    dos: [], donts: [], primaryMarket: '', secondaryMarkets: [],
    targetCompanySize: '', targetIndustries: [], lastUpdated: '', updatedBy: '',
  };
  return {
    fetchUsers: vi.fn().mockResolvedValue([]),
    fetchCampaigns: vi.fn().mockResolvedValue([]),
    fetchAudiences: vi.fn().mockResolvedValue([]),
    fetchBudgetData: vi.fn().mockResolvedValue({ total: 0, spent: 0, remaining: 0, categories: [], monthlyTrend: [] }),
    fetchTeamMembers: vi.fn().mockResolvedValue([]),
    fetchTouchpoints: vi.fn().mockResolvedValue([]),
    fetchJourneys: vi.fn().mockResolvedValue([]),
    fetchPositioning: vi.fn().mockResolvedValue(emptyPositioning),
    fetchKeywords: vi.fn().mockResolvedValue([]),
    fetchActivityFeed: vi.fn().mockResolvedValue([]),
    fetchChartData: vi.fn().mockResolvedValue([]),
    fetchChannelPerformance: vi.fn().mockResolvedValue([]),
    // Mutators — configured per test
    createAudience: vi.fn(),
    updateAudience: vi.fn().mockResolvedValue(undefined),
    deleteAudience: vi.fn().mockResolvedValue(undefined),
    createCampaign: vi.fn(),
    updateCampaign: vi.fn().mockResolvedValue(undefined),
    deleteCampaign: vi.fn().mockResolvedValue(undefined),
    createTouchpoint: vi.fn(),
    updateTouchpoint: vi.fn().mockResolvedValue(undefined),
    deleteTouchpoint: vi.fn().mockResolvedValue(undefined),
    createJourney: vi.fn(),
    deleteJourney: vi.fn().mockResolvedValue(undefined),
    savePositioning: vi.fn().mockResolvedValue(undefined),
    createKeyword: vi.fn(),
    deleteKeyword: vi.fn().mockResolvedValue(undefined),
  };
});

import * as api from '@/lib/api';
import { DataProvider, useData } from '@/context/DataContext';

// ─── Wrapper ──────────────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(DataProvider, null, children);

// Wait for initial load to finish
async function mountAndWait() {
  const { result } = renderHook(() => useData(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

// ─── Audience fixtures ────────────────────────────────────────────────────────
const audienceBase = {
  name: 'Entscheider', type: 'B2B', segment: 'B2C' as const,
  color: '#333', initials: 'EN', age: '35-50', gender: 'mixed',
  location: 'DACH', income: 'high', education: 'university', jobTitle: 'CEO',
  interests: [], painPoints: [], goals: [], preferredChannels: [],
  buyingBehavior: 'deliberate', decisionProcess: 'committee',
  journeyPhase: 'Awareness', description: '', campaignIds: [],
  createdAt: '2025-01-01', updatedAt: '2025-01-01',
};
const createdAudience = { ...audienceBase, id: 'a-new' };
const existingAudience = { ...audienceBase, id: 'a-existing' };

beforeEach(() => {
  vi.mocked(api.fetchAudiences).mockResolvedValue([existingAudience]);
});

// ═══════════════════════════════════════════════════════════════════════════════
// Audience CRUD
// ═══════════════════════════════════════════════════════════════════════════════
describe('DataContext — Audience CRUD', () => {
  it('addAudience appends the new audience to state', async () => {
    vi.mocked(api.createAudience).mockResolvedValue(createdAudience);

    const result = await mountAndWait();
    expect(result.current.audiences).toHaveLength(1);

    await act(async () => {
      await result.current.addAudience(audienceBase);
    });

    expect(api.createAudience).toHaveBeenCalledWith(audienceBase, 'c1');
    expect(result.current.audiences).toHaveLength(2);
    expect(result.current.audiences.find(a => a.id === 'a-new')).toBeDefined();
  });

  it('updateAudience applies updates to the matching audience in state', async () => {
    const result = await mountAndWait();

    await act(async () => {
      await result.current.updateAudience('a-existing', { name: 'Updated Name' });
    });

    expect(api.updateAudience).toHaveBeenCalledWith('a-existing', { name: 'Updated Name' });
    expect(result.current.audiences[0].name).toBe('Updated Name');
  });

  it('deleteAudience removes the matching audience from state', async () => {
    const result = await mountAndWait();
    expect(result.current.audiences).toHaveLength(1);

    await act(async () => {
      await result.current.deleteAudience('a-existing');
    });

    expect(api.deleteAudience).toHaveBeenCalledWith('a-existing');
    expect(result.current.audiences).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Campaign CRUD
// ═══════════════════════════════════════════════════════════════════════════════
const campaignBase = {
  name: 'Q1', status: 'planned' as const, startDate: '2025-01-01', endDate: '2025-03-31',
  budget: 5000, spent: 0, channels: [], description: '', masterPrompt: '',
  targetAudiences: [], campaignKeywords: [], kpis: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 }, owner: 'Test', progress: 0,
  responsibleManagerId: '', teamMemberIds: [] as string[],
};
const createdCampaign = { ...campaignBase, id: 'camp-new' };
const existingCampaign = { ...campaignBase, id: 'camp-existing' };

describe('DataContext — Campaign CRUD', () => {
  beforeEach(() => {
    vi.mocked(api.fetchCampaigns).mockResolvedValue([existingCampaign]);
  });

  it('addCampaign appends the new campaign and returns it', async () => {
    vi.mocked(api.createCampaign).mockResolvedValue(createdCampaign);
    const result = await mountAndWait();

    let returned: Campaign | undefined;
    await act(async () => {
      returned = await result.current.addCampaign(campaignBase);
    });

    expect(returned?.id).toBe('camp-new');
    expect(result.current.campaigns).toHaveLength(2);
  });

  it('updateCampaign updates matching campaign in state', async () => {
    const result = await mountAndWait();

    await act(async () => {
      await result.current.updateCampaign('camp-existing', { name: 'Q1 Updated' });
    });

    expect(api.updateCampaign).toHaveBeenCalledWith('camp-existing', { name: 'Q1 Updated' });
    expect(result.current.campaigns[0].name).toBe('Q1 Updated');
  });

  it('deleteCampaign removes matching campaign from state', async () => {
    const result = await mountAndWait();

    await act(async () => {
      await result.current.deleteCampaign('camp-existing');
    });

    expect(result.current.campaigns).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Touchpoint CRUD
// ═══════════════════════════════════════════════════════════════════════════════
const tpBase = {
  name: 'CTA', type: 'Website', journeyPhase: 'Awareness',
  url: '', status: 'active' as const, description: '',
};
const createdTp = { ...tpBase, id: 'tp-new' };
const existingTp = { ...tpBase, id: 'tp-existing' };

describe('DataContext — Touchpoint CRUD', () => {
  beforeEach(() => {
    vi.mocked(api.fetchTouchpoints).mockResolvedValue([existingTp]);
  });

  it('addTouchpoint appends new touchpoint and returns it', async () => {
    vi.mocked(api.createTouchpoint).mockResolvedValue(createdTp);
    const result = await mountAndWait();

    let returned: Touchpoint | undefined;
    await act(async () => {
      returned = await result.current.addTouchpoint(tpBase);
    });

    expect(returned?.id).toBe('tp-new');
    expect(result.current.touchpoints).toHaveLength(2);
  });

  it('updateTouchpoint updates matching touchpoint in state', async () => {
    const result = await mountAndWait();

    await act(async () => {
      await result.current.updateTouchpoint('tp-existing', { name: 'Updated CTA' });
    });

    expect(result.current.touchpoints[0].name).toBe('Updated CTA');
  });

  it('deleteTouchpoint removes matching touchpoint from state', async () => {
    const result = await mountAndWait();

    await act(async () => {
      await result.current.deleteTouchpoint('tp-existing');
    });

    expect(result.current.touchpoints).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Journey CRUD
// ═══════════════════════════════════════════════════════════════════════════════
const journeyBase = {
  name: 'Test Journey', audienceId: 'aud1', description: '', stages: [],
};
const createdJourney = { ...journeyBase, id: 'j-new' };
const existingCustomer = { ...journeyBase, id: 'j-customer' };

describe('DataContext — Journey CRUD', () => {
  beforeEach(() => {
    vi.mocked(api.fetchJourneys)
      .mockResolvedValue([existingCustomer]);
  });

  it('addJourney appends to customerJourneys', async () => {
    vi.mocked(api.createJourney).mockResolvedValue(createdJourney);
    const result = await mountAndWait();

    await act(async () => {
      await result.current.addJourney(journeyBase);
    });

    expect(result.current.customerJourneys).toHaveLength(2);
  });

  it('deleteJourney removes from customerJourneys', async () => {
    vi.mocked(api.createJourney).mockResolvedValue(createdJourney);

    const result = await mountAndWait();

    await act(async () => {
      await result.current.deleteJourney('j-customer');
    });

    expect(result.current.customerJourneys).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Keywords
// ═══════════════════════════════════════════════════════════════════════════════
const kwBase = { term: 'B2B SaaS', category: 'Produkt', description: 'Core term' };
const createdKw = { ...kwBase, id: 'kw-new' };
const existingKw = { ...kwBase, id: 'kw-existing' };

describe('DataContext — Keywords', () => {
  beforeEach(() => {
    vi.mocked(api.fetchKeywords).mockResolvedValue([existingKw]);
  });

  it('addKeyword appends new keyword to state', async () => {
    vi.mocked(api.createKeyword).mockResolvedValue(createdKw);
    const result = await mountAndWait();

    await act(async () => {
      await result.current.addKeyword(kwBase);
    });

    expect(result.current.companyKeywords).toHaveLength(2);
    expect(result.current.companyKeywords.find(k => k.id === 'kw-new')).toBeDefined();
  });

  it('deleteKeyword removes keyword from state', async () => {
    const result = await mountAndWait();

    await act(async () => {
      await result.current.deleteKeyword('kw-existing');
    });

    expect(result.current.companyKeywords).toHaveLength(0);
  });
});
