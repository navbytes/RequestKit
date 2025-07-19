/**
 * Chrome Notifications API utilities
 */

/**
 * Chrome Notifications API wrapper
 */

// Get logger for this module
import { loggers } from '@/shared/utils/debug';
const logger = loggers.shared;

export const NotificationsApi = {
  /**
   * Create notification
   */
  create(
    notificationId: string,
    options: chrome.notifications.NotificationOptions<true>
  ): void {
    try {
      chrome.notifications.create(notificationId, options);
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  },
};
