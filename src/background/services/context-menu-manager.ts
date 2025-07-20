/**
 * Context menu management service
 */

import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

// Constants
const PAGE_CONTEXT = 'page';
const MAIN_MENU_ID = 'requestkit-main';

export class ContextMenuManager {
  /**
   * Set up context menus
   */
  static async setupContextMenus(): Promise<void> {
    try {
      // Remove existing menus
      await ChromeApiUtils.contextMenus.removeAll();

      // Create main menu
      ChromeApiUtils.contextMenus.create({
        id: MAIN_MENU_ID,
        title: 'RequestKit',
        contexts: [PAGE_CONTEXT],
      });

      // Toggle extension
      ChromeApiUtils.contextMenus.create({
        id: 'toggle-extension',
        parentId: MAIN_MENU_ID,
        title: 'Toggle Extension',
        contexts: [PAGE_CONTEXT],
      });

      // Create rule for current page
      ChromeApiUtils.contextMenus.create({
        id: 'create-rule-for-page',
        parentId: MAIN_MENU_ID,
        title: 'Create Rule for This Page',
        contexts: [PAGE_CONTEXT],
      });

      // Separator
      ChromeApiUtils.contextMenus.create({
        id: 'separator',
        parentId: MAIN_MENU_ID,
        type: 'separator',
        contexts: [PAGE_CONTEXT],
      });

      // Open options
      ChromeApiUtils.contextMenus.create({
        id: 'open-options',
        parentId: MAIN_MENU_ID,
        title: 'Open Options',
        contexts: [PAGE_CONTEXT],
      });

      logger.info('Context menus set up successfully');
    } catch (error) {
      logger.error('Failed to set up context menus:', error);
    }
  }

  /**
   * Handle context menu clicks
   */
  static async handleContextMenuClick(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
    onToggleExtension?: () => Promise<void>,
    onCreateRuleForPage?: (url: string) => Promise<void>
  ): Promise<void> {
    logger.info('Context menu clicked:', info.menuItemId);

    switch (info.menuItemId) {
      case 'toggle-extension':
        if (onToggleExtension) {
          // Call the toggle function without parameters - let it handle the state logic
          await onToggleExtension();
        }
        break;

      case 'open-options':
        ChromeApiUtils.runtime.openOptionsPage();
        break;

      case 'create-rule-for-page':
        if (tab?.url && onCreateRuleForPage) {
          await onCreateRuleForPage(tab.url);
        }
        break;
    }
  }

  /**
   * Handle creating rule for current page
   */
  static async createRuleForPage(url: string): Promise<void> {
    try {
      // Open options page with pre-filled data
      const optionsUrl = ChromeApiUtils.runtime.getURL(
        'src/options/index.html'
      );
      const createUrl = `${optionsUrl}?action=create&url=${encodeURIComponent(url)}`;

      ChromeApiUtils.tabs.create({ url: createUrl });
    } catch (error) {
      logger.error('Failed to create rule for page:', error);
    }
  }
}
