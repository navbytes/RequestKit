/**
 * Chrome API type definitions and interfaces
 */

import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';

// Additional Chrome API interfaces
export interface NotificationOptions {
  type: chrome.notifications.TemplateType;
  iconUrl?: string;
  title?: string;
  message?: string;
  contextMessage?: string;
  priority?: number;
  eventTime?: number;
  buttons?: chrome.notifications.ButtonOptions[];
  imageUrl?: string;
  items?: chrome.notifications.ItemOptions[];
  progress?: number;
  isClickable?: boolean;
}

// Strongly-typed Chrome API response interfaces
export interface ExtensionStatus {
  enabled: boolean;
  rulesCount: number;
  activeRulesCount: number;
}

export interface ProfilesResponse {
  profiles: Profile[];
  activeProfile: string;
}

export interface RulesResponse {
  rules: Record<string, HeaderRule>;
}

export interface ProfileOperationResponse {
  success: boolean;
  error?: string;
}

export interface CreateProfileResponse extends ProfileOperationResponse {
  profile?: Profile;
}

export interface ChromeMessage {
  type: string;
  [key: string]: unknown;
}

export interface StorageResult<T = unknown> {
  [key: string]: T;
}

/**
 * Type guards for Chrome API responses
 */
export const TypeGuards = {
  isExtensionStatus(obj: unknown): obj is ExtensionStatus {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'enabled' in obj &&
      'rulesCount' in obj &&
      'activeRulesCount' in obj &&
      typeof (obj as ExtensionStatus).enabled === 'boolean' &&
      typeof (obj as ExtensionStatus).rulesCount === 'number' &&
      typeof (obj as ExtensionStatus).activeRulesCount === 'number'
    );
  },

  isProfilesResponse(obj: unknown): obj is ProfilesResponse {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'profiles' in obj &&
      'activeProfile' in obj &&
      Array.isArray((obj as ProfilesResponse).profiles) &&
      typeof (obj as ProfilesResponse).activeProfile === 'string'
    );
  },

  isRulesResponse(obj: unknown): obj is RulesResponse {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'rules' in obj &&
      typeof (obj as RulesResponse).rules === 'object' &&
      (obj as RulesResponse).rules !== null
    );
  },

  isProfileOperationResponse(obj: unknown): obj is ProfileOperationResponse {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'success' in obj &&
      typeof (obj as ProfileOperationResponse).success === 'boolean'
    );
  },

  isCreateProfileResponse(obj: unknown): obj is CreateProfileResponse {
    return this.isProfileOperationResponse(obj);
  },

  isStorageResult<T>(
    obj: unknown,
    keyValidator?: (value: unknown) => value is T
  ): obj is StorageResult<T> {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    if (!keyValidator) {
      return true;
    }

    return Object.values(obj).every(keyValidator);
  },
};
