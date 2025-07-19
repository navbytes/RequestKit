/**
 * Chrome Action API utilities (for extension icon/badge)
 */

/**
 * Chrome Action API wrapper
 */

// Get logger for this module
import { loggers } from '@/shared/utils/debug';
const logger = loggers.shared;

export const ActionApi = {
  /**
   * Set badge text
   */
  async setBadgeText(details: chrome.action.BadgeTextDetails): Promise<void> {
    try {
      await chrome.action.setBadgeText(details);
    } catch (error) {
      logger.error('Failed to set badge text:', error);
      throw error;
    }
  },

  /**
   * Set badge background color
   */
  async setBadgeBackgroundColor(
    details: chrome.action.BadgeBackgroundColorDetails
  ): Promise<void> {
    try {
      await chrome.action.setBadgeBackgroundColor(details);
    } catch (error) {
      logger.error('Failed to set badge background color:', error);
      throw error;
    }
  },

  /**
   * Set icon
   */
  async setIcon(details: chrome.action.TabIconDetails): Promise<void> {
    try {
      await chrome.action.setIcon(details);
    } catch (error) {
      logger.error('Failed to set icon:', error);
      throw error;
    }
  },
};
