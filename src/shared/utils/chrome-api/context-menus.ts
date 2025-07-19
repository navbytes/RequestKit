/**
 * Chrome Context Menus API utilities
 */

/**
 * Chrome Context Menus API wrapper
 */

// Get logger for this module
import { loggers } from '@/shared/utils/debug';
const logger = loggers.shared;

export const ContextMenusApi = {
  /**
   * Create context menu item
   */
  create(createProperties: chrome.contextMenus.CreateProperties): void {
    try {
      chrome.contextMenus.create(createProperties);
    } catch (error) {
      logger.error('Failed to create context menu:', error);
      throw error;
    }
  },

  /**
   * Remove all context menu items
   */
  async removeAll(): Promise<void> {
    try {
      await chrome.contextMenus.removeAll();
    } catch (error) {
      logger.error('Failed to remove all context menus:', error);
      throw error;
    }
  },

  /**
   * Context menu click events
   */
  onClicked: {
    addListener(
      callback: (
        info: chrome.contextMenus.OnClickData,
        tab?: chrome.tabs.Tab
      ) => void
    ): void {
      chrome.contextMenus.onClicked.addListener(callback);
    },
  },
};
