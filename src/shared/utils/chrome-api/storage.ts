/**
 * Chrome Storage API utilities
 */

/**
 * Chrome Storage API wrapper
 */

// Get logger for this module
import { loggers } from '@/shared/utils/debug';
const logger = loggers.shared;

export const StorageApi = {
  /**
   * Get data from sync storage
   */
  async get(
    keys: string | string[] | Record<string, unknown>
  ): Promise<unknown> {
    try {
      return await chrome.storage.sync.get(keys);
    } catch (error) {
      logger.error('Failed to get from storage:', error);
      throw error;
    }
  },

  /**
   * Set data in sync storage
   */
  async set(items: Record<string, unknown>): Promise<void> {
    try {
      await chrome.storage.sync.set(items);
    } catch (error) {
      logger.error('Failed to set storage:', error);
      throw error;
    }
  },

  /**
   * Get data from local storage
   */
  async getLocal(
    keys: string | string[] | Record<string, unknown>
  ): Promise<unknown> {
    try {
      return await chrome.storage.local.get(keys);
    } catch (error) {
      logger.error('Failed to get from local storage:', error);
      throw error;
    }
  },

  /**
   * Set data in local storage
   */
  async setLocal(items: Record<string, unknown>): Promise<void> {
    try {
      await chrome.storage.local.set(items);
    } catch (error) {
      logger.error('Failed to set local storage:', error);
      throw error;
    }
  },

  /**
   * Remove data from local storage
   */
  async removeLocal(keys: string | string[]): Promise<void> {
    try {
      await chrome.storage.local.remove(keys);
    } catch (error) {
      logger.error('Failed to remove from local storage:', error);
      throw error;
    }
  },

  /**
   * Add storage change listener
   */
  addListener(
    callback: (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => void
  ): void {
    chrome.storage.onChanged.addListener(callback);
  },

  /**
   * Remove storage change listener
   */
  removeListener(
    callback: (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => void
  ): void {
    chrome.storage.onChanged.removeListener(callback);
  },

  /**
   * Sync storage operations
   */
  sync: {
    /**
     * Get data from sync storage
     */
    async get(
      keys?: string | string[] | Record<string, unknown>
    ): Promise<unknown> {
      try {
        return await chrome.storage.sync.get(keys);
      } catch (error) {
        logger.error('Failed to get from sync storage:', error);
        throw error;
      }
    },

    /**
     * Set data in sync storage
     */
    async set(items: Record<string, unknown>): Promise<void> {
      try {
        await chrome.storage.sync.set(items);
      } catch (error) {
        logger.error('Failed to set sync storage:', error);
        throw error;
      }
    },
  },

  /**
   * Local storage operations
   */
  local: {
    /**
     * Get data from local storage
     */
    async get(
      keys?: string | string[] | Record<string, unknown>
    ): Promise<unknown> {
      try {
        return await chrome.storage.local.get(keys);
      } catch (error) {
        logger.error('Failed to get from local storage:', error);
        throw error;
      }
    },

    /**
     * Set data in local storage
     */
    async set(items: Record<string, unknown>): Promise<void> {
      try {
        await chrome.storage.local.set(items);
      } catch (error) {
        logger.error('Failed to set local storage:', error);
        throw error;
      }
    },

    /**
     * Remove data from local storage
     */
    async remove(keys: string | string[]): Promise<void> {
      try {
        await chrome.storage.local.remove(keys);
      } catch (error) {
        logger.error('Failed to remove from local storage:', error);
        throw error;
      }
    },
  },

  /**
   * Storage change events
   */
  onChanged: {
    addListener(
      callback: (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string
      ) => void
    ): void {
      chrome.storage.onChanged.addListener(callback);
    },

    removeListener(
      callback: (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string
      ) => void
    ): void {
      chrome.storage.onChanged.removeListener(callback);
    },
  },
};
