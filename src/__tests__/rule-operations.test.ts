/**
 * Test suite for rule operations including duplicate functionality
 */

import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useRuleOperations } from '@/options/components/tabs/RuleManagement/hooks/useRuleOperations';
import type { HeaderRule } from '@/shared/types/rules';

// Mock the ruleStorage module
vi.mock('@/options/components/tabs/RuleManagement/utils/ruleStorage', () => ({
  saveRules: vi.fn().mockResolvedValue(undefined),
}));

// Mock the ruleValidation module
vi.mock(
  '@/options/components/tabs/RuleManagement/utils/ruleValidation',
  () => ({
    validateRuleForm: vi.fn().mockReturnValue(null),
    createRuleFromFormData: vi
      .fn()
      .mockImplementation((formData, headers, existingRule) => ({
        id: existingRule?.id || `rule_${Date.now()}`,
        name: formData.name,
        enabled: formData.enabled,
        pattern: formData.pattern,
        headers,
        priority: formData.priority,
        createdAt: existingRule?.createdAt || new Date(),
        updatedAt: new Date(),
      })),
  })
);

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

describe('useRuleOperations - Duplicate Functionality', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  const createMockRule = (
    id: string,
    name: string,
    overrides: Partial<HeaderRule> = {}
  ): HeaderRule => ({
    id,
    name,
    enabled: true,
    pattern: {
      protocol: 'https',
      domain: 'example.com',
      path: '/api/*',
    },
    headers: [
      {
        name: 'X-Custom-Header',
        value: 'test-value',
        operation: 'set',
        target: 'request',
      },
    ],
    priority: 1,
    createdAt: mockDate,
    updatedAt: mockDate,
    ...overrides,
  });

  let mockRules: HeaderRule[];
  let mockOnRulesUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Date.now() for consistent ID generation
    vi.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01T00:00:00.000Z

    // Mock global confirm and alert
    global.confirm = vi.fn().mockReturnValue(true);
    global.alert = vi.fn();

    mockRules = [
      createMockRule('rule-1', 'Test Rule 1'),
      createMockRule('rule-2', 'Test Rule 2'),
      createMockRule('rule-3', 'Complex Rule (Copy)', {
        headers: [
          {
            name: 'Authorization',
            value: 'Bearer token',
            operation: 'set',
            target: 'request',
          },
          {
            name: 'Content-Type',
            value: 'application/json',
            operation: 'set',
            target: 'request',
          },
        ],
      }),
    ];

    mockOnRulesUpdate = vi.fn();
  });

  describe('handleDuplicateRule', () => {
    it('should successfully duplicate a rule with basic name', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const sourceRule = mockRules[0];

      if (!sourceRule) return;
      let success = false;

      await act(async () => {
        success = await result.current.handleDuplicateRule(sourceRule);
      });

      expect(success).toBe(true);
      expect(mockOnRulesUpdate).toHaveBeenCalledWith([
        ...mockRules,
        expect.objectContaining({
          id: 'rule_1640995200000',
          name: 'Test Rule 1 (Copy)',
          enabled: true,
          pattern: sourceRule.pattern,
          headers: sourceRule.headers,
          priority: sourceRule.priority,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      ]);
    });

    it('should generate unique names for multiple duplicates', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const sourceRule = mockRules[0];
      expect(sourceRule).toBeDefined();
      if (!sourceRule) return;

      // First duplicate
      await act(async () => {
        await result.current.handleDuplicateRule(sourceRule);
      });

      // Update mock rules to include the first duplicate
      const updatedRules = [
        ...mockRules,
        createMockRule('rule_1640995200000', 'Test Rule 1 (Copy)'),
      ];

      const { result: result2 } = renderHook(() =>
        useRuleOperations(updatedRules, mockOnRulesUpdate)
      );

      // Second duplicate
      await act(async () => {
        await result2.current.handleDuplicateRule(sourceRule);
      });

      expect(mockOnRulesUpdate).toHaveBeenLastCalledWith([
        ...updatedRules,
        expect.objectContaining({
          name: 'Test Rule 1 (Copy 2)',
        }),
      ]);
    });

    it('should handle duplicating a rule that already has (Copy) in the name', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const sourceRule = mockRules[2]; // 'Complex Rule (Copy)'
      expect(sourceRule).toBeDefined();
      if (!sourceRule) return;

      await act(async () => {
        await result.current.handleDuplicateRule(sourceRule);
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledWith([
        ...mockRules,
        expect.objectContaining({
          name: 'Complex Rule (Copy 2)',
        }),
      ]);
    });

    it('should preserve all rule properties except id, name, and timestamps', async () => {
      // Use empty rules array to avoid name conflicts
      const { result } = renderHook(() =>
        useRuleOperations([], mockOnRulesUpdate)
      );

      const complexRule = createMockRule('complex-rule', 'Complex Rule', {
        enabled: false,
        pattern: {
          protocol: 'http',
          domain: '*.api.example.com',
          path: '/v1/**',
          port: '8080',
        },
        headers: [
          {
            name: 'X-API-Key',
            value: 'secret',
            operation: 'set',
            target: 'request',
          },
          {
            name: 'User-Agent',
            value: '',
            operation: 'remove',
            target: 'request',
          },
        ],
        priority: 5,
        profileId: 'test-profile',
        conditions: [
          {
            type: 'requestMethod',
            operator: 'equals',
            value: 'GET',
          },
          {
            type: 'header',
            operator: 'equals',
            value: 'application/json',
          },
        ],
      });

      await act(async () => {
        await result.current.handleDuplicateRule(complexRule);
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'rule_1640995200000',
          name: 'Complex Rule (Copy)',
          enabled: false, // Preserved
          pattern: complexRule.pattern, // Preserved
          headers: complexRule.headers, // Preserved
          priority: 5, // Preserved
          profileId: 'test-profile', // Preserved
          conditions: complexRule.conditions, // Preserved
          createdAt: expect.any(Date), // New timestamp
          updatedAt: expect.any(Date), // New timestamp
        }),
      ]);
    });

    it('should handle special characters in rule names', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const specialRule = createMockRule(
        'special-rule',
        'Rule with "quotes" & symbols!'
      );

      await act(async () => {
        await result.current.handleDuplicateRule(specialRule);
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledWith([
        ...mockRules,
        expect.objectContaining({
          name: 'Rule with "quotes" & symbols! (Copy)',
        }),
      ]);
    });

    it('should handle empty rule name', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const emptyNameRule = createMockRule('empty-rule', '');

      await act(async () => {
        await result.current.handleDuplicateRule(emptyNameRule);
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledWith([
        ...mockRules,
        expect.objectContaining({
          name: ' (Copy)',
        }),
      ]);
    });

    it('should handle storage errors gracefully', async () => {
      const { saveRules } = await import(
        '@/options/components/tabs/RuleManagement/utils/ruleStorage'
      );
      vi.mocked(saveRules).mockRejectedValueOnce(new Error('Storage error'));

      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const sourceRule = mockRules[0];
      if (!sourceRule) return;

      let success = true;

      await act(async () => {
        success = await result.current.handleDuplicateRule(sourceRule);
      });

      expect(success).toBe(false);
      expect(mockOnRulesUpdate).not.toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(
        'Failed to duplicate rule. Please try again.'
      );
    });

    it('should generate unique IDs for duplicated rules', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const sourceRule = mockRules[0];
      expect(sourceRule).toBeDefined();
      if (!sourceRule) return;

      // Mock different timestamps for multiple duplicates
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1640995200000)
        .mockReturnValueOnce(1640995201000);

      await act(async () => {
        await result.current.handleDuplicateRule(sourceRule);
      });

      await act(async () => {
        await result.current.handleDuplicateRule(sourceRule);
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledTimes(2);

      const firstCall = mockOnRulesUpdate.mock.calls[0]?.[0];
      const secondCall = mockOnRulesUpdate.mock.calls[1]?.[0];

      const firstDuplicate = firstCall[firstCall.length - 1];
      const secondDuplicate = secondCall[secondCall.length - 1];

      expect(firstDuplicate.id).toBe('rule_1640995200000');
      expect(secondDuplicate.id).toBe('rule_1640995201000');
    });
  });

  describe('Integration with other operations', () => {
    it('should work correctly after duplicating and then editing the duplicate', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const sourceRule = mockRules[0];
      expect(sourceRule).toBeDefined();
      if (!sourceRule) return;

      // Duplicate the rule
      await act(async () => {
        await result.current.handleDuplicateRule(sourceRule);
      });

      const duplicatedRule = mockOnRulesUpdate.mock.calls[0]?.[0].slice(-1)[0];
      expect(duplicatedRule).toBeDefined();

      // Update the duplicated rule
      const formData = {
        name: 'Updated Duplicate Rule',
        enabled: true,
        pattern: duplicatedRule.pattern,
        priority: 2,
        description: '',
        tags: [],
      };

      await act(async () => {
        await result.current.handleUpdateRule(
          duplicatedRule,
          formData,
          duplicatedRule.headers
        );
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledTimes(2);
    });

    it('should work correctly after duplicating and then deleting the duplicate', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const sourceRule = mockRules[0];
      expect(sourceRule).toBeDefined();
      if (!sourceRule) return;

      // Duplicate the rule
      await act(async () => {
        await result.current.handleDuplicateRule(sourceRule);
      });

      const duplicatedRule = mockOnRulesUpdate.mock.calls[0]?.[0].slice(-1)[0];
      expect(duplicatedRule).toBeDefined();

      // Delete the duplicated rule
      await act(async () => {
        await result.current.handleDeleteRule(duplicatedRule.id);
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledTimes(2);

      // Verify the duplicate was removed but original remains
      const finalRules = mockOnRulesUpdate.mock.calls[1]?.[0];
      expect(finalRules).toBeDefined();
      expect(finalRules).toHaveLength(mockRules.length);
      expect(
        finalRules.find((r: HeaderRule) => r.id === sourceRule.id)
      ).toBeDefined();
      expect(
        finalRules.find((r: HeaderRule) => r.id === duplicatedRule.id)
      ).toBeUndefined();
    });

    it('should work correctly after duplicating and then toggling the duplicate', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const sourceRule = mockRules[0];
      expect(sourceRule).toBeDefined();
      if (!sourceRule) return;

      // Duplicate the rule
      await act(async () => {
        await result.current.handleDuplicateRule(sourceRule);
      });

      const duplicatedRule = mockOnRulesUpdate.mock.calls[0]?.[0].slice(-1)[0];
      expect(duplicatedRule).toBeDefined();

      // Create a new hook instance with the updated rules that include the duplicate
      const rulesAfterDuplicate = mockOnRulesUpdate.mock.calls[0]?.[0];
      expect(rulesAfterDuplicate).toBeDefined();
      const { result: result2 } = renderHook(() =>
        useRuleOperations(rulesAfterDuplicate, mockOnRulesUpdate)
      );

      // Toggle the duplicated rule
      await act(async () => {
        await result2.current.handleToggleRule(duplicatedRule.id);
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledTimes(2);

      // Verify the duplicate was toggled but original remains unchanged
      const finalRules = mockOnRulesUpdate.mock.calls[1]?.[0];
      expect(finalRules).toBeDefined();
      const toggledRule = finalRules.find(
        (r: HeaderRule) => r.id === duplicatedRule.id
      );
      const originalRule = finalRules.find(
        (r: HeaderRule) => r.id === sourceRule.id
      );

      expect(toggledRule).toBeDefined();
      expect(originalRule).toBeDefined();
      expect(toggledRule.enabled).toBe(!duplicatedRule.enabled);
      expect(originalRule.enabled).toBe(sourceRule.enabled);
    });
  });

  describe('Edge cases and stress testing', () => {
    it('should handle rapid successive duplications', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const sourceRule = mockRules[0];
      expect(sourceRule).toBeDefined();
      if (!sourceRule) return;
      const promises: Promise<boolean>[] = [];

      // Simulate rapid clicking
      for (let i = 0; i < 5; i++) {
        promises.push(result.current.handleDuplicateRule(sourceRule));
      }

      const results = await Promise.all(promises);

      expect(results.every(r => r === true)).toBe(true);
      expect(mockOnRulesUpdate).toHaveBeenCalledTimes(5);
    });

    it('should handle very long rule names', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const longName = 'A'.repeat(1000);
      const longNameRule = createMockRule('long-rule', longName);

      await act(async () => {
        await result.current.handleDuplicateRule(longNameRule);
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledWith([
        ...mockRules,
        expect.objectContaining({
          name: `${longName} (Copy)`,
        }),
      ]);
    });

    it('should handle rules with undefined or null properties', async () => {
      const { result } = renderHook(() =>
        useRuleOperations(mockRules, mockOnRulesUpdate)
      );

      const incompleteRule: HeaderRule = {
        id: 'incomplete-rule',
        name: 'Incomplete Rule',
        enabled: true,
        pattern: { domain: 'example.com' },
        headers: [],
        priority: 1,
        createdAt: mockDate,
        updatedAt: mockDate,
        // profileId and conditions are optional, so we can omit them
      };

      await act(async () => {
        await result.current.handleDuplicateRule(incompleteRule);
      });

      expect(mockOnRulesUpdate).toHaveBeenCalledWith([
        ...mockRules,
        expect.objectContaining({
          name: 'Incomplete Rule (Copy)',
          // Note: profileId and conditions are not checked here because
          // they weren't present in the source rule, so they won't be
          // present in the duplicated rule either (not set to undefined)
        }),
      ]);
    });
  });
});
