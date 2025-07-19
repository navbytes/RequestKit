/**
 * Chrome Declarative Net Request API utilities
 */

/**
 * Chrome Declarative Net Request API wrapper
 */

// Get logger for this module
import { loggers } from '@/shared/utils/debug';
const logger = loggers.shared;

export const DeclarativeNetRequestApi = {
  /**
   * Update dynamic rules
   */
  async updateDynamicRules(
    options: chrome.declarativeNetRequest.UpdateRuleOptions
  ): Promise<void> {
    try {
      await chrome.declarativeNetRequest.updateDynamicRules(options);
    } catch (error) {
      logger.error('Failed to update dynamic rules:', error);
      throw error;
    }
  },

  /**
   * Get dynamic rules
   */
  async getDynamicRules(): Promise<chrome.declarativeNetRequest.Rule[]> {
    try {
      return await chrome.declarativeNetRequest.getDynamicRules();
    } catch (error) {
      logger.error('Failed to get dynamic rules:', error);
      throw error;
    }
  },
};
