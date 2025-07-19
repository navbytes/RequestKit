/**
 * Extension badge management service
 */

import type { HeaderRule } from '@/shared/types/rules';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export class BadgeManager {
  /**
   * Update extension badge based on current state
   */
  static async updateBadge(
    isEnabled: boolean,
    rules: Record<string, HeaderRule>
  ): Promise<void> {
    try {
      const activeRulesCount = Object.values(rules).filter(
        rule => rule.enabled
      ).length;

      if (!isEnabled) {
        ChromeApiUtils.action.setBadgeText({ text: 'OFF' });
        ChromeApiUtils.action.setBadgeBackgroundColor({ color: '#ef4444' });
      } else if (activeRulesCount > 0) {
        ChromeApiUtils.action.setBadgeText({
          text: activeRulesCount.toString(),
        });
        ChromeApiUtils.action.setBadgeBackgroundColor({ color: '#22c55e' });
      } else {
        ChromeApiUtils.action.setBadgeText({ text: '' });
      }
    } catch (error) {
      logger.error('Failed to update badge:', error);
    }
  }

  /**
   * Update badge for specific tab
   */
  static async updateBadgeForTab(
    tabId: number,
    url: string,
    isEnabled: boolean,
    rules: Record<string, HeaderRule>
  ): Promise<void> {
    try {
      if (!isEnabled) return;

      // Count matching rules for this URL
      const matchingRules = Object.values(rules).filter(rule => {
        if (!rule.enabled) return false;
        // Simple URL matching - in a real implementation, use the pattern matcher
        return url.includes(rule.pattern.domain);
      });

      if (matchingRules.length > 0) {
        ChromeApiUtils.action.setBadgeText({
          text: matchingRules.length.toString(),
          tabId,
        });
        ChromeApiUtils.action.setBadgeBackgroundColor({
          color: '#3b82f6',
          tabId,
        });
      } else {
        ChromeApiUtils.action.setBadgeText({ text: '', tabId });
      }
    } catch (error) {
      logger.error('Failed to update badge for tab:', error);
    }
  }
}
