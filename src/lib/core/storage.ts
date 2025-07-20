import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/config/constants';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

import { updateVariableUsageCounts } from './variable-storage/management/usageTracking';

/**
 * Shared storage utilities for consistent Chrome storage operations
 */

// Get logger for this module
const logger = loggers.coreStorage;

export class StorageUtils {
  /**
   * Get all rules from storage
   */
  static async getRules(): Promise<HeaderRule[]> {
    try {
      const result = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      const rulesObject =
        (result as Record<string, unknown>)[STORAGE_KEYS.RULES] || {};
      return Object.values(
        typeof rulesObject === 'object' && rulesObject !== null
          ? (rulesObject as Record<string, HeaderRule>)
          : {}
      );
    } catch (error) {
      logger.error('Failed to get rules:', error);
      return [];
    }
  }

  /**
   * Get rules as object (keyed by ID)
   */
  static async getRulesObject(): Promise<Record<string, HeaderRule>> {
    try {
      const result = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      return typeof (result as Record<string, unknown>)[STORAGE_KEYS.RULES] ===
        'object' &&
        (result as Record<string, unknown>)[STORAGE_KEYS.RULES] !== null
        ? ((result as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
            string,
            HeaderRule
          >)
        : {};
    } catch (error) {
      logger.error('Failed to get rules object:', error);
      return {};
    }
  }

  /**
   * Save rules to storage
   */
  static async saveRules(rules: HeaderRule[]): Promise<void> {
    try {
      const rulesObject = rules.reduce(
        (acc, rule) => {
          acc[rule.id] = rule;
          return acc;
        },
        {} as Record<string, HeaderRule>
      );

      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.RULES]: rulesObject,
      });

      // Update variable usage counts after saving rules
      await updateVariableUsageCounts();

      // Notify background script
      ChromeApiUtils.runtime.sendMessage({ type: 'RULES_UPDATED' });
    } catch (error) {
      logger.error('Failed to save rules:', error);
      throw error;
    }
  }

  /**
   * Save rules object to storage
   */
  static async saveRulesObject(
    rulesObject: Record<string, HeaderRule>
  ): Promise<void> {
    try {
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.RULES]: rulesObject,
      });

      // Update variable usage counts after saving rules
      await updateVariableUsageCounts();

      // Notify background script
      ChromeApiUtils.runtime.sendMessage({ type: 'RULES_UPDATED' });
    } catch (error) {
      logger.error('Failed to save rules object:', error);
      throw error;
    }
  }

  /**
   * Add or update a single rule
   */
  static async saveRule(rule: HeaderRule): Promise<void> {
    try {
      const rulesObject = await this.getRulesObject();
      rulesObject[rule.id] = rule;
      await this.saveRulesObject(rulesObject);
    } catch (error) {
      logger.error('Failed to save rule:', error);
      throw error;
    }
  }

  /**
   * Delete a rule by ID
   */
  static async deleteRule(ruleId: string): Promise<void> {
    try {
      const rulesObject = await this.getRulesObject();
      delete rulesObject[ruleId];
      await this.saveRulesObject(rulesObject);
    } catch (error) {
      logger.error('Failed to delete rule:', error);
      throw error;
    }
  }

  /**
   * Get extension settings
   */
  static async getSettings(): Promise<ExtensionSettings> {
    try {
      const result = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.SETTINGS,
      ]);
      return {
        ...DEFAULT_SETTINGS,
        ...(typeof (result as Record<string, unknown>)[
          STORAGE_KEYS.SETTINGS
        ] === 'object' &&
        (result as Record<string, unknown>)[STORAGE_KEYS.SETTINGS] !== null
          ? ((result as Record<string, unknown>)[
              STORAGE_KEYS.SETTINGS
            ] as Partial<ExtensionSettings>)
          : {}),
      };
    } catch (error) {
      logger.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save extension settings
   */
  static async saveSettings(settings: ExtensionSettings): Promise<void> {
    try {
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: settings,
      });
    } catch (error) {
      logger.error('Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Update a specific setting path
   */
  static async updateSetting(path: string, value: unknown): Promise<void> {
    try {
      const settings = await this.getSettings();
      const keys = path.split('.');
      let current: Record<string, unknown> = settings as unknown as Record<
        string,
        unknown
      >;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key && typeof current[key] === 'object' && current[key] !== null) {
          current =
            typeof current[key] === 'object' && current[key] !== null
              ? (current[key] as Record<string, unknown>)
              : {};
        }
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }

      await this.saveSettings(settings);
    } catch (error) {
      logger.error('Failed to update setting:', error);
      throw error;
    }
  }

  /**
   * Listen for storage changes
   */
  static onStorageChanged(
    callback: (changes: Record<string, chrome.storage.StorageChange>) => void
  ): void {
    ChromeApiUtils.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        callback(changes);
      }
    });
  }

  /**
   * Remove storage change listener
   */
  static removeStorageListener(
    callback: (changes: Record<string, chrome.storage.StorageChange>) => void
  ): void {
    ChromeApiUtils.storage.onChanged.removeListener(callback);
  }
}
