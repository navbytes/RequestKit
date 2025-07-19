/**
 * Chrome Tabs API utilities
 */

/**
 * Chrome Tabs API wrapper
 */

// Get logger for this module
import { loggers } from '@/shared/utils/debug';
const logger = loggers.shared;

export const TabsApi = {
  /**
   * Query tabs
   */
  async query(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    try {
      return await chrome.tabs.query(queryInfo);
    } catch (error) {
      logger.error('Failed to query tabs:', error);
      throw error;
    }
  },

  /**
   * Create a new tab
   */
  async create(
    createProperties: chrome.tabs.CreateProperties
  ): Promise<chrome.tabs.Tab> {
    try {
      return await chrome.tabs.create(createProperties);
    } catch (error) {
      logger.error('Failed to create tab:', error);
      throw error;
    }
  },

  /**
   * Get tab by ID
   */
  async get(tabId: number): Promise<chrome.tabs.Tab> {
    try {
      return await chrome.tabs.get(tabId);
    } catch (error) {
      logger.error('Failed to get tab:', error);
      throw error;
    }
  },

  /**
   * Get current active tab
   */
  async getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      return tab || null;
    } catch (error) {
      logger.error('Failed to get current tab:', error);
      return null;
    }
  },

  /**
   * Add tab update listener
   */
  addUpdateListener(
    callback: (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
    ) => void
  ): void {
    chrome.tabs.onUpdated.addListener(callback);
  },

  /**
   * Add tab activation listener
   */
  addActivationListener(
    callback: (activeInfo: chrome.tabs.TabActiveInfo) => void
  ): void {
    chrome.tabs.onActivated.addListener(callback);
  },

  /**
   * Tab update events
   */
  onUpdated: {
    addListener(
      callback: (
        tabId: number,
        changeInfo: chrome.tabs.TabChangeInfo,
        tab: chrome.tabs.Tab
      ) => void
    ): void {
      chrome.tabs.onUpdated.addListener(callback);
    },
  },

  /**
   * Tab activation events
   */
  onActivated: {
    addListener(
      callback: (activeInfo: chrome.tabs.TabActiveInfo) => void
    ): void {
      chrome.tabs.onActivated.addListener(callback);
    },
  },
};
