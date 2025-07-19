/**
 * Main Chrome API utilities entry point
 * Provides strongly-typed wrappers around Chrome APIs to eliminate casting
 */

import type { Profile } from '@/shared/types/profiles';

import { ActionApi } from './action';
import { ContextMenusApi } from './context-menus';
import { DeclarativeNetRequestApi } from './declarative-net-request';
import { NotificationsApi } from './notifications';
import { typedRuntime, RuntimeApi } from './runtime';
import { StorageApi } from './storage';
import { TabsApi } from './tabs';
import {
  TypeGuards,
  type ExtensionStatus,
  type ProfilesResponse,
  type RulesResponse,
  type ProfileOperationResponse,
  type CreateProfileResponse,
  type ChromeMessage,
} from './types';

export class ChromeApiUtils {
  /**
   * Get extension status from background script
   */
  static async getExtensionStatus(): Promise<ExtensionStatus> {
    const defaultStatus: ExtensionStatus = {
      enabled: false,
      rulesCount: 0,
      activeRulesCount: 0,
    };

    return typedRuntime.sendTypedMessage(
      { type: 'GET_STATUS' },
      TypeGuards.isExtensionStatus,
      defaultStatus
    );
  }

  /**
   * Toggle extension enabled state
   */
  static async toggleExtension(enabled: boolean): Promise<void> {
    await chrome.runtime.sendMessage({
      type: 'TOGGLE_EXTENSION',
      enabled,
    });
  }

  /**
   * Get current active tab
   */
  static async getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    return TabsApi.getCurrentTab();
  }

  /**
   * Open options page
   */
  static openOptionsPage(): void {
    chrome.runtime.openOptionsPage();
  }

  /**
   * Create a new tab with the options page and pre-filled data
   */
  static openOptionsPageWithData(data: {
    action?: string;
    url?: string;
    ruleId?: string;
  }): void {
    const optionsUrl = chrome.runtime.getURL('src/options/index.html');
    const params = new URLSearchParams();

    if (data.action) params.set('action', data.action);
    if (data.url) params.set('url', data.url);
    if (data.ruleId) params.set('ruleId', data.ruleId);

    const fullUrl = params.toString()
      ? `${optionsUrl}?${params.toString()}`
      : optionsUrl;
    chrome.tabs.create({ url: fullUrl });
  }

  /**
   * Send message to background script
   */
  static async sendMessage(message: ChromeMessage): Promise<unknown> {
    return typedRuntime.sendMessage(message);
  }

  /**
   * Get profiles from background script
   */
  static async getProfiles(): Promise<ProfilesResponse> {
    const defaultResponse: ProfilesResponse = {
      profiles: [],
      activeProfile: '',
    };

    return typedRuntime.sendTypedMessage(
      { type: 'GET_PROFILES' },
      TypeGuards.isProfilesResponse,
      defaultResponse
    );
  }

  /**
   * Get rules from background script
   */
  static async getRules(): Promise<RulesResponse> {
    const defaultResponse: RulesResponse = {
      rules: {},
    };

    return typedRuntime.sendTypedMessage(
      { type: 'GET_RULES' },
      TypeGuards.isRulesResponse,
      defaultResponse
    );
  }

  /**
   * Switch to a different profile
   */
  static async switchProfile(
    profileId: string
  ): Promise<ProfileOperationResponse> {
    const defaultResponse: ProfileOperationResponse = {
      success: false,
      error: 'No response',
    };

    return typedRuntime.sendTypedMessage(
      { type: 'SWITCH_PROFILE', profileId },
      TypeGuards.isProfileOperationResponse,
      defaultResponse
    );
  }

  /**
   * Create a new profile
   */
  static async createProfile(
    profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CreateProfileResponse> {
    const defaultResponse: CreateProfileResponse = {
      success: false,
      error: 'No response',
    };

    return typedRuntime.sendTypedMessage(
      { type: 'CREATE_PROFILE', profile },
      TypeGuards.isCreateProfileResponse,
      defaultResponse
    );
  }

  /**
   * Update an existing profile
   */
  static async updateProfile(
    profileId: string,
    profile: Partial<Omit<Profile, 'id' | 'createdAt'>>
  ): Promise<ProfileOperationResponse> {
    const defaultResponse: ProfileOperationResponse = {
      success: false,
      error: 'No response',
    };

    return typedRuntime.sendTypedMessage(
      { type: 'UPDATE_PROFILE', profileId, profile },
      TypeGuards.isProfileOperationResponse,
      defaultResponse
    );
  }

  /**
   * Delete a profile
   */
  static async deleteProfile(
    profileId: string
  ): Promise<ProfileOperationResponse> {
    const defaultResponse: ProfileOperationResponse = {
      success: false,
      error: 'No response',
    };

    return typedRuntime.sendTypedMessage(
      { type: 'DELETE_PROFILE', profileId },
      TypeGuards.isProfileOperationResponse,
      defaultResponse
    );
  }

  /**
   * Change theme
   */
  static async changeTheme(theme: string): Promise<void> {
    await this.sendMessage({
      type: 'CHANGE_THEME',
      theme,
    });
  }

  /**
   * Close current window (for popup)
   */
  static closeWindow(): void {
    if (window && window.close) {
      window.close();
    }
  }

  /**
   * Get URL parameters from current page
   */
  static getUrlParams(): URLSearchParams {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Check if running in extension context
   */
  static isExtensionContext(): boolean {
    return (
      typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id
    );
  }

  /**
   * i18n - get message
   */
  static getMessage(
    messageName: string,
    substitutions?: string | string[]
  ): string {
    return chrome.i18n.getMessage(messageName, substitutions);
  }

  // Expose domain-specific APIs
  static storage = StorageApi;
  static tabs = TabsApi;
  static runtime = RuntimeApi;
  static contextMenus = ContextMenusApi;
  static notifications = NotificationsApi;
  static declarativeNetRequest = DeclarativeNetRequestApi;
  static action = ActionApi;
}

// Export all types and utilities
export * from './types';
export { RuntimeApi } from './runtime';
export { StorageApi } from './storage';
export { TabsApi } from './tabs';
export { ContextMenusApi } from './context-menus';
export { NotificationsApi } from './notifications';
export { DeclarativeNetRequestApi } from './declarative-net-request';
export { ActionApi } from './action';
