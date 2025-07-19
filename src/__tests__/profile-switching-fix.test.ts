/**
 * Test suite for profile switching bug fix
 * Verifies that the critical profile filtering issue has been resolved
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ChromeRulesConverter } from '../background/services/chrome-rules-converter';
import type { HeaderRule } from '../shared/types/rules';
import type { VariableContext } from '../shared/types/variables';

// Mock the debug logger
vi.mock('@/shared/utils/debug', () => ({
  loggers: {
    shared: {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
  },
}));

describe('Profile Switching Bug Fix', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  const createMockRule = (
    id: string,
    name: string,
    profileId: string,
    headerValue: string
  ): HeaderRule => ({
    id,
    name,
    enabled: true,
    profileId,
    pattern: {
      protocol: 'https',
      domain: 'example.com',
      path: '/*',
    },
    headers: [
      {
        name: 'X-Mirrord-User',
        value: headerValue,
        operation: 'set',
        target: 'request',
      },
    ],
    priority: 1,
    createdAt: mockDate,
    updatedAt: mockDate,
  });

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

  describe('Profile-based Rule Filtering', () => {
    it('should only include dev-profile rules when dev-profile is active', async () => {
      const mockRules: Record<string, HeaderRule> = {
        'rule-dev-1': createMockRule(
          'rule-dev-1',
          'DEV | Mirrord Sharding',
          'dev-profile',
          'Naveen'
        ),
        'rule-prod-1': createMockRule(
          'rule-prod-1',
          'PROD | Mirrord Sharding',
          'prod-profile',
          'Alice'
        ),
      };

      const chromeRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'dev-profile',
          { ...mockBaseContext, profileId: 'dev-profile' },
          mockSettings as any
        );

      expect(chromeRules).toHaveLength(1);
      expect(chromeRules[0]?.action.requestHeaders?.[0]?.header).toBe(
        'X-Mirrord-User'
      );
      expect(chromeRules[0]?.action.requestHeaders?.[0]?.value).toBe('Naveen');
    });

    it('should only include prod-profile rules when prod-profile is active', async () => {
      const mockRules: Record<string, HeaderRule> = {
        'rule-dev-1': createMockRule(
          'rule-dev-1',
          'DEV | Mirrord Sharding',
          'dev-profile',
          'Naveen'
        ),
        'rule-prod-1': createMockRule(
          'rule-prod-1',
          'PROD | Mirrord Sharding',
          'prod-profile',
          'Alice'
        ),
      };

      const chromeRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'prod-profile',
          { ...mockBaseContext, profileId: 'prod-profile' },
          mockSettings as any
        );

      expect(chromeRules).toHaveLength(1);
      expect(chromeRules[0]?.action.requestHeaders?.[0]?.header).toBe(
        'X-Mirrord-User'
      );
      expect(chromeRules[0]?.action.requestHeaders?.[0]?.value).toBe('Alice');
    });

    it('should switch correctly between profiles with different header values', async () => {
      const mockRules: Record<string, HeaderRule> = {
        'rule-dev-1': createMockRule(
          'rule-dev-1',
          'DEV | Mirrord Sharding',
          'dev-profile',
          'Naveen'
        ),
        'rule-prod-1': createMockRule(
          'rule-prod-1',
          'PROD | Mirrord Sharding',
          'prod-profile',
          'Alice'
        ),
      };

      // Test dev profile
      const devRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'dev-profile',
          { ...mockBaseContext, profileId: 'dev-profile' },
          mockSettings as any
        );

      expect(devRules).toHaveLength(1);
      expect(devRules[0]?.action.requestHeaders?.[0]?.value).toBe('Naveen');

      // Test prod profile
      const prodRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'prod-profile',
          { ...mockBaseContext, profileId: 'prod-profile' },
          mockSettings as any
        );

      expect(prodRules).toHaveLength(1);
      expect(prodRules[0]?.action.requestHeaders?.[0]?.value).toBe('Alice');
    });

    it('should handle multiple rules per profile correctly', async () => {
      const mockRules: Record<string, HeaderRule> = {
        'rule-dev-1': createMockRule(
          'rule-dev-1',
          'DEV | Mirrord Sharding',
          'dev-profile',
          'Naveen'
        ),
        'rule-dev-2': createMockRule(
          'rule-dev-2',
          'DEV | Another Rule',
          'dev-profile',
          'DevValue'
        ),
        'rule-prod-1': createMockRule(
          'rule-prod-1',
          'PROD | Mirrord Sharding',
          'prod-profile',
          'Alice'
        ),
        'rule-prod-2': createMockRule(
          'rule-prod-2',
          'PROD | Another Rule',
          'prod-profile',
          'ProdValue'
        ),
      };

      // Test dev profile - should get 2 rules
      const devRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'dev-profile',
          { ...mockBaseContext, profileId: 'dev-profile' },
          mockSettings as any
        );

      expect(devRules).toHaveLength(2);
      const devValues = devRules.map(
        rule => rule?.action.requestHeaders?.[0]?.value
      );
      expect(devValues).toContain('Naveen');
      expect(devValues).toContain('DevValue');

      // Test prod profile - should get 2 rules
      const prodRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'prod-profile',
          { ...mockBaseContext, profileId: 'prod-profile' },
          mockSettings as any
        );

      expect(prodRules).toHaveLength(2);
      const prodValues = prodRules.map(
        rule => rule?.action.requestHeaders?.[0]?.value
      );
      expect(prodValues).toContain('Alice');
      expect(prodValues).toContain('ProdValue');
    });

    it('should exclude disabled rules regardless of profile', async () => {
      const mockRules: Record<string, HeaderRule> = {
        'rule-dev-1': createMockRule(
          'rule-dev-1',
          'DEV | Mirrord Sharding',
          'dev-profile',
          'Naveen'
        ),
        'rule-dev-disabled': {
          ...createMockRule(
            'rule-dev-disabled',
            'DEV | Disabled Rule',
            'dev-profile',
            'DisabledValue'
          ),
          enabled: false,
        },
      };

      const chromeRules =
        await ChromeRulesConverter.convertToDeclarativeNetRequestRules(
          mockRules,
          'dev-profile',
          { ...mockBaseContext, profileId: 'dev-profile' },
          mockSettings as any
        );

      expect(chromeRules).toHaveLength(1);
      expect(chromeRules[0]?.action.requestHeaders?.[0]?.value).toBe('Naveen');
    });
  });

  describe('Edge Cases', () => {
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

    it('should handle non-existent profile', async () => {
      const mockRules: Record<string, HeaderRule> = {
        'rule-dev-1': createMockRule(
          'rule-dev-1',
          'DEV | Mirrord Sharding',
          'dev-profile',
          'Naveen'
        ),
      };

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
});
