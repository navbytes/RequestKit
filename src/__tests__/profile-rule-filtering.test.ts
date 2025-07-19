/**
 * Test profile-based rule filtering functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { HeaderRule } from '@/shared/types/rules';
import type { VariableContext } from '@/shared/types/variables';

import { ChromeRulesConverter } from '../background/services/chrome-rules-converter';
import { RuleProcessor } from '../background/services/rule-processor';

describe('Profile-based Rule Filtering', () => {
  const mockRules: Record<string, HeaderRule> = {
    'rule-dev-1': {
      id: 'rule-dev-1',
      name: 'Dev Rule 1',
      enabled: true,
      profileId: 'dev-profile',
      pattern: { domain: 'dev.example.com' },
      headers: [
        { name: 'X-Dev', value: 'true', operation: 'set', target: 'request' },
      ],
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'rule-prod-1': {
      id: 'rule-prod-1',
      name: 'Prod Rule 1',
      enabled: true,
      profileId: 'prod-profile',
      pattern: { domain: 'prod.example.com' },
      headers: [
        { name: 'X-Prod', value: 'true', operation: 'set', target: 'request' },
      ],
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'rule-unassigned-1': {
      id: 'rule-unassigned-1',
      name: 'Unassigned Rule 1',
      enabled: true,
      profileId: '', // No profile assigned
      pattern: { domain: 'global.example.com' },
      headers: [
        {
          name: 'X-Global',
          value: 'true',
          operation: 'set',
          target: 'request',
        },
      ],
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockBaseContext: VariableContext = {
    systemVariables: [],
    globalVariables: [],
    profileVariables: [],
    ruleVariables: [],
    profileId: 'dev-profile',
  };

  const mockSettings = {
    enabled: true,
    performance: { maxRules: 100 },
    notifications: {
      enabled: false,
      showRuleMatches: false,
      showErrors: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ChromeRulesConverter Profile Filtering', () => {
    it('should only include dev profile rules when dev profile is active', async () => {
      const chromeRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'dev-profile',
          { ...mockBaseContext, profileId: 'dev-profile' },
          mockSettings as any
        );

      expect(chromeRules).toHaveLength(1);
      expect(chromeRules[0]?.action.requestHeaders?.[0]?.header).toBe('X-Dev');
    });

    it('should only include prod profile rules when prod profile is active', async () => {
      const chromeRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'prod-profile',
          { ...mockBaseContext, profileId: 'prod-profile' },
          mockSettings as any
        );

      expect(chromeRules).toHaveLength(1);
      expect(chromeRules[0]?.action.requestHeaders?.[0]?.header).toBe('X-Prod');
    });

    it('should only include unassigned rules when unassigned is active', async () => {
      const chromeRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'unassigned',
          { ...mockBaseContext, profileId: 'unassigned' },
          mockSettings as any
        );

      expect(chromeRules).toHaveLength(1);
      expect(chromeRules[0]?.action.requestHeaders?.[0]?.header).toBe(
        'X-Global'
      );
    });

    it('should include no rules when switching to non-existent profile', async () => {
      const chromeRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'non-existent-profile',
          { ...mockBaseContext, profileId: 'non-existent-profile' },
          mockSettings as any
        );

      expect(chromeRules).toHaveLength(0);
    });
  });

  describe('RuleProcessor Profile Filtering', () => {
    const mockRequestData = {
      url: 'https://dev.example.com/api',
      method: 'GET',
      headers: {},
    };

    it('should only analyze dev profile rules when dev profile is active', async () => {
      const result = await RuleProcessor.analyzeRequest(
        mockRequestData,
        mockRules,
        'dev-profile'
      );

      // Should only match the dev rule
      expect(result.matchedRules).toHaveLength(1);
      expect(result.matchedRules[0]?.ruleId).toBe('rule-dev-1');
    });

    it('should only analyze unassigned rules when unassigned is active', async () => {
      const globalRequestData = {
        url: 'https://global.example.com/api',
        method: 'GET',
        headers: {},
      };

      const result = await RuleProcessor.analyzeRequest(
        globalRequestData,
        mockRules,
        'unassigned'
      );

      // Should only match the unassigned rule
      expect(result.matchedRules).toHaveLength(1);
      expect(result.matchedRules[0]?.ruleId).toBe('rule-unassigned-1');
    });

    it('should not analyze unassigned rules when specific profile is active', async () => {
      const globalRequestData = {
        url: 'https://global.example.com/api',
        method: 'GET',
        headers: {},
      };

      const result = await RuleProcessor.analyzeRequest(
        globalRequestData,
        mockRules,
        'dev-profile'
      );

      // Should not match any rules because unassigned rules are excluded when specific profile is active
      expect(result.matchedRules).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle disabled rules correctly', async () => {
      const devRule1 = mockRules['rule-dev-1'];
      expect(devRule1).toBeDefined();
      if (!devRule1) return;

      const rulesWithDisabled = {
        ...mockRules,
        'rule-dev-disabled': {
          ...devRule1,
          id: 'rule-dev-disabled',
          enabled: false,
          name: 'Dev Rule Disabled',
          priority: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const chromeRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          rulesWithDisabled,
          'dev-profile',
          { ...mockBaseContext, profileId: 'dev-profile' },
          mockSettings as any
        );

      // Should only include the enabled dev rule
      expect(chromeRules).toHaveLength(1);
      expect(chromeRules[0]?.action.requestHeaders?.[0]?.header).toBe('X-Dev');
    });

    it('should handle empty rules object', async () => {
      const chromeRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          {},
          'dev-profile',
          { ...mockBaseContext, profileId: 'dev-profile' },
          mockSettings as any
        );

      expect(chromeRules).toHaveLength(0);
    });
  });
});
