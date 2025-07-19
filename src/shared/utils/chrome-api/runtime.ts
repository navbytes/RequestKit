/**
 * Chrome Runtime API utilities
 */

import { loggers } from '@/shared/utils/debug';

import type { ChromeMessage } from './types';

/**
 * Type-safe Chrome runtime message handling
 */

// Get logger for this module
const logger = loggers.shared;

class TypedChromeRuntime {
  /**
   * Send strongly-typed message to background script
   */
  async sendTypedMessage<TRequest extends ChromeMessage, TResponse>(
    message: TRequest,
    responseValidator: (response: unknown) => response is TResponse,
    defaultResponse: TResponse
  ): Promise<TResponse> {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return responseValidator(response) ? response : defaultResponse;
    } catch (error) {
      logger.error('Failed to send typed message:', error);
      return defaultResponse;
    }
  }

  /**
   * Send message with automatic response handling
   */
  async sendMessage<T = unknown>(message: ChromeMessage): Promise<T | null> {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response as T;
    } catch (error) {
      logger.error('Failed to send message:', error);
      return null;
    }
  }
}

export const typedRuntime = new TypedChromeRuntime();

/**
 * Chrome Runtime API wrapper
 */
export const RuntimeApi = {
  /**
   * Send message to background script
   */
  async sendMessage(message: unknown): Promise<unknown> {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      logger.error('Failed to send runtime message:', error);
      throw error;
    }
  },

  /**
   * Add message listener
   */
  addMessageListener(
    callback: (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void
    ) => void
  ): void {
    chrome.runtime.onMessage.addListener(callback);
  },

  /**
   * Get URL for extension resource
   */
  getURL(path: string): string {
    return chrome.runtime.getURL(path);
  },

  /**
   * Open options page
   */
  openOptionsPage(): void {
    chrome.runtime.openOptionsPage();
  },

  /**
   * Add install listener
   */
  addInstallListener(
    callback: (details: chrome.runtime.InstalledDetails) => void
  ): void {
    chrome.runtime.onInstalled.addListener(callback);
  },

  /**
   * Add startup listener
   */
  addStartupListener(callback: () => void): void {
    chrome.runtime.onStartup.addListener(callback);
  },

  /**
   * Get last error
   */
  get lastError(): chrome.runtime.LastError | undefined {
    return chrome.runtime.lastError;
  },

  /**
   * Runtime install events
   */
  onInstalled: {
    addListener(
      callback: (details: chrome.runtime.InstalledDetails) => void
    ): void {
      chrome.runtime.onInstalled.addListener(callback);
    },
  },

  /**
   * Runtime startup events
   */
  onStartup: {
    addListener(callback: () => void): void {
      chrome.runtime.onStartup.addListener(callback);
    },
  },

  /**
   * Runtime message events
   */
  onMessage: {
    addListener(
      callback: (
        message: unknown,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void
      ) => boolean | void
    ): void {
      chrome.runtime.onMessage.addListener(callback);
    },
  },
};
