/**
 * Rule-related message handler
 */

import { STORAGE_KEYS } from '@/config/constants';
import type { HeaderRule } from '@/shared/types/rules';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

import { RuleProcessor } from '../services/rule-processor';
import type {
  RequestData,
  AnalysisResult,
  TestRuleMatchResult,
} from '../types/background-types';

// Get logger for this module
const logger = loggers.shared;

// Rule handler specific interfaces
interface RuleStats {
  matchCount: number;
  lastMatched: string;
  averageExecutionTime: number;
  totalExecutionTime: number;
  errorCount?: number;
}

interface RuleExportMetadata {
  exportedAt: string;
  version: string;
  profileId?: string;
  includeDisabled: boolean;
  totalRules: number;
}

interface RuleExportResult {
  rules: HeaderRule[];
  metadata: RuleExportMetadata;
}

interface RuleImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

interface RuleBulkUpdateResult {
  updated: number;
  errors: string[];
}

interface RuleValidationResult {
  valid: boolean;
  errors: string[];
}

type RuleHandlerResponse =
  | AnalysisResult
  | TestRuleMatchResult
  | Record<string, RuleStats>
  | RuleStats
  | null
  | void
  | RuleExportResult
  | RuleImportResult
  | HeaderRule
  | RuleBulkUpdateResult
  | RuleValidationResult;

export class RuleHandler {
  /**
   * Handle rule-related messages
   */
  static async handleMessage(
    action: string,
    data: unknown,
    _sender: chrome.runtime.MessageSender
  ): Promise<RuleHandlerResponse> {
    switch (action) {
      case 'analyzeRequest':
        return await this.handleAnalyzeRequest(
          data as { requestData: RequestData; profileId?: string }
        );

      case 'testRuleMatch':
        return await this.handleTestRuleMatch(
          data as { ruleId: string; url: string; requestData?: RequestData }
        );

      case 'getRuleStats':
        return await this.handleGetRuleStats(
          data as
            | { ruleId?: string; timeRange?: 'hour' | 'day' | 'week' | 'month' }
            | undefined
        );

      case 'clearRuleStats':
        return await this.handleClearRuleStats();

      case 'exportRules':
        return await this.handleExportRules(
          data as { profileId?: string; includeDisabled?: boolean } | undefined
        );

      case 'importRules':
        return await this.handleImportRules(
          data as {
            rules: HeaderRule[];
            options?: {
              overwrite?: boolean;
              profileId?: string;
              enableAll?: boolean;
            };
          }
        );

      case 'validateRule':
        return await this.handleValidateRule(
          data as { rule: Partial<HeaderRule> }
        );

      case 'duplicateRule':
        return await this.handleDuplicateRule(
          data as { ruleId: string; newName?: string }
        );

      case 'bulkUpdateRules':
        return await this.handleBulkUpdateRules(
          data as { ruleIds: string[]; updates: Partial<HeaderRule> }
        );

      default:
        throw new Error(`Unknown rule action: ${action}`);
    }
  }

  /**
   * Analyze a network request against active rules
   */
  private static async handleAnalyzeRequest(data: {
    requestData: RequestData;
    profileId?: string;
  }): Promise<AnalysisResult> {
    try {
      // Get current rules
      const rulesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      const rules =
        ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
          string,
          HeaderRule
        >) || {};

      // Get active profile
      const profileData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.ACTIVE_PROFILE,
      ]);
      const activeProfile =
        data.profileId ||
        ((profileData as Record<string, unknown>)[
          STORAGE_KEYS.ACTIVE_PROFILE
        ] as string) ||
        'dev-profile';

      return await RuleProcessor.analyzeRequest(
        data.requestData,
        rules,
        activeProfile
      );
    } catch (error) {
      logger.error('Error analyzing request:', error);
      throw error;
    }
  }

  /**
   * Test a specific rule against a URL
   */
  private static async handleTestRuleMatch(data: {
    ruleId: string;
    url: string;
    requestData?: RequestData;
  }): Promise<TestRuleMatchResult> {
    try {
      // Get current rules
      const rulesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      const rules =
        ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
          string,
          HeaderRule
        >) || {};

      const requestData: RequestData = data.requestData || {
        url: data.url,
        method: 'GET',
        headers: {},
      };

      return await RuleProcessor.testRuleMatch(
        data.ruleId,
        data.url,
        requestData,
        rules
      );
    } catch (error) {
      logger.error('Error testing rule match:', error);
      throw error;
    }
  }

  /**
   * Get rule performance statistics
   */
  private static async handleGetRuleStats(data?: {
    ruleId?: string;
    timeRange?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<Record<string, RuleStats> | RuleStats | null> {
    try {
      const statsData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.STATS,
      ]);
      const allStats =
        ((statsData as Record<string, unknown>)[STORAGE_KEYS.STATS] as Record<
          string,
          RuleStats
        >) || {};

      if (data?.ruleId) {
        return allStats[data.ruleId] || null;
      }

      // Return all stats with optional filtering by time range
      if (data?.timeRange) {
        const cutoffTime = this.getTimeRangeCutoff(data.timeRange);
        const filteredStats: Record<string, RuleStats> = {};

        for (const [ruleId, stats] of Object.entries(allStats)) {
          if (stats.lastMatched && new Date(stats.lastMatched) >= cutoffTime) {
            filteredStats[ruleId] = stats;
          }
        }

        return filteredStats;
      }

      return allStats;
    } catch (error) {
      logger.error('Error getting rule stats:', error);
      throw error;
    }
  }

  /**
   * Clear rule performance statistics
   */
  private static async handleClearRuleStats(): Promise<void> {
    try {
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.STATS]: {},
      });
    } catch (error) {
      logger.error('Error clearing rule stats:', error);
      throw error;
    }
  }

  /**
   * Export rules to JSON
   */
  private static async handleExportRules(data?: {
    profileId?: string;
    includeDisabled?: boolean;
  }): Promise<RuleExportResult> {
    try {
      const rulesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      const allRules =
        ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
          string,
          HeaderRule
        >) || {};

      let rulesToExport = Object.values(allRules);

      // Filter by profile if specified
      if (data?.profileId) {
        rulesToExport = rulesToExport.filter(
          rule => !rule.profileId || rule.profileId === data.profileId
        );
      }

      // Filter out disabled rules if not included
      if (!data?.includeDisabled) {
        rulesToExport = rulesToExport.filter(rule => rule.enabled !== false);
      }

      const metadata: RuleExportMetadata = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        includeDisabled: data?.includeDisabled || false,
        totalRules: rulesToExport.length,
      };

      if (data?.profileId) {
        metadata.profileId = data.profileId;
      }

      return {
        rules: rulesToExport,
        metadata,
      };
    } catch (error) {
      logger.error('Error exporting rules:', error);
      throw error;
    }
  }

  /**
   * Import rules from JSON
   */
  private static async handleImportRules(data: {
    rules: HeaderRule[];
    options?: {
      overwrite?: boolean;
      profileId?: string;
      enableAll?: boolean;
    };
  }): Promise<{ imported: number; skipped: number; errors: string[] }> {
    try {
      const rulesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      const existingRules =
        ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
          string,
          HeaderRule
        >) || {};

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const rule of data.rules) {
        try {
          // Validate rule structure
          const validationResult = this.validateRuleStructure(rule);
          if (!validationResult.valid) {
            errors.push(
              `Rule ${rule.name || rule.id}: ${validationResult.error}`
            );
            skipped++;
            continue;
          }

          // Check if rule already exists
          if (existingRules[rule.id] && !data.options?.overwrite) {
            skipped++;
            continue;
          }

          // Apply import options
          const importedRule = { ...rule };

          if (data.options?.profileId) {
            importedRule.profileId = data.options.profileId;
          }

          if (data.options?.enableAll) {
            importedRule.enabled = true;
          }

          // Add timestamps
          if (!existingRules[rule.id]) {
            importedRule.createdAt = new Date();
          }
          importedRule.updatedAt = new Date();

          existingRules[rule.id] = importedRule;
          imported++;
        } catch (error) {
          errors.push(
            `Rule ${rule.name || rule.id}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
          skipped++;
        }
      }

      // Save updated rules
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.RULES]: existingRules,
      });

      return { imported, skipped, errors };
    } catch (error) {
      logger.error('Error importing rules:', error);
      throw error;
    }
  }

  /**
   * Validate a rule structure
   */
  private static async handleValidateRule(data: {
    rule: Partial<HeaderRule>;
  }): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const validationResult = this.validateRuleStructure(data.rule);
      return {
        valid: validationResult.valid,
        errors: validationResult.valid
          ? []
          : [validationResult.error || 'Unknown error'],
      };
    } catch (error) {
      logger.error('Error validating rule:', error);
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Duplicate a rule
   */
  private static async handleDuplicateRule(data: {
    ruleId: string;
    newName?: string;
  }): Promise<HeaderRule> {
    try {
      const rulesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      const rules =
        ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
          string,
          HeaderRule
        >) || {};

      const originalRule = rules[data.ruleId];
      if (!originalRule) {
        throw new Error(`Rule ${data.ruleId} not found`);
      }

      // Create duplicate with new ID
      const newId = `${originalRule.id}_copy_${Date.now()}`;
      const duplicatedRule: HeaderRule = {
        ...originalRule,
        id: newId,
        name: data.newName || `${originalRule.name} (Copy)`,
        enabled: false, // Disable by default
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save the duplicated rule
      rules[newId] = duplicatedRule;
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.RULES]: rules,
      });

      return duplicatedRule;
    } catch (error) {
      logger.error('Error duplicating rule:', error);
      throw error;
    }
  }

  /**
   * Bulk update multiple rules
   */
  private static async handleBulkUpdateRules(data: {
    ruleIds: string[];
    updates: Partial<HeaderRule>;
  }): Promise<{ updated: number; errors: string[] }> {
    try {
      const rulesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      const rules =
        ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
          string,
          HeaderRule
        >) || {};

      let updated = 0;
      const errors: string[] = [];

      for (const ruleId of data.ruleIds) {
        try {
          if (!rules[ruleId]) {
            errors.push(`Rule ${ruleId} not found`);
            continue;
          }

          // Apply updates
          const existingRule = rules[ruleId];
          rules[ruleId] = {
            ...existingRule,
            ...data.updates,
            updatedAt: new Date(),
          } as HeaderRule;

          updated++;
        } catch (error) {
          errors.push(
            `Rule ${ruleId}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      }

      // Save updated rules
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.RULES]: rules,
      });

      return { updated, errors };
    } catch (error) {
      logger.error('Error bulk updating rules:', error);
      throw error;
    }
  }

  /**
   * Get time range cutoff date
   */
  private static getTimeRangeCutoff(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // Beginning of time
    }
  }

  /**
   * Validate rule structure
   */
  private static validateRuleStructure(rule: Partial<HeaderRule>): {
    valid: boolean;
    error?: string;
  } {
    if (!rule.id) {
      return { valid: false, error: 'Rule ID is required' };
    }

    if (!rule.name) {
      return { valid: false, error: 'Rule name is required' };
    }

    if (!rule.pattern) {
      return { valid: false, error: 'Rule pattern is required' };
    }

    // Validate pattern structure
    if (typeof rule.pattern !== 'object') {
      return { valid: false, error: 'Rule pattern must be an object' };
    }

    // Validate headers if present
    if (rule.headers && Array.isArray(rule.headers)) {
      for (const header of rule.headers) {
        if (!header.name) {
          return { valid: false, error: 'Header name is required' };
        }
        if (!header.operation) {
          return { valid: false, error: 'Header operation is required' };
        }
        if (header.operation !== 'remove' && !header.value) {
          return {
            valid: false,
            error: 'Header value is required for non-remove operations',
          };
        }
      }
    }

    return { valid: true };
  }
}
