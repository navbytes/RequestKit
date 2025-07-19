/**
 * Shared utility for creating default profiles
 *
 * This utility provides a centralized function for creating default profiles
 * that can be safely imported without triggering Date() execution at module load time.
 * The function creates fresh dates when called, maintaining service worker compatibility.
 */

import type { Profile } from '@/shared/types/profiles';

/**
 * Creates default profiles with fresh timestamps
 *
 * This function is designed to be called when needed, not at module load time,
 * to maintain service worker compatibility by avoiding Date() execution during import.
 *
 * @returns Record of default profiles keyed by profile ID
 */
export function createDefaultProfiles(): Record<string, Profile> {
  const now = new Date();

  return {
    'dev-profile': {
      id: 'dev-profile',
      name: 'Development',
      description:
        'Profile for development environment with debug features enabled',
      color: '#10b981',
      environment: 'development' as const,
      rules: [],
      enabled: true,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      settings: {
        debugMode: true,
        logLevel: 'debug' as const,
        notifications: {
          enabled: true,
          showRuleMatches: true,
          showErrors: true,
        },
        performance: {
          maxRules: 50,
          enableMetrics: true,
        },
      },
    },
    'prod-profile': {
      id: 'prod-profile',
      name: 'Production',
      description: 'Profile for production environment with minimal logging',
      color: '#ef4444',
      environment: 'production' as const,
      rules: [],
      enabled: false,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
      settings: {
        debugMode: false,
        logLevel: 'error' as const,
        notifications: {
          enabled: false,
          showRuleMatches: false,
          showErrors: true,
        },
        performance: {
          maxRules: 100,
          enableMetrics: false,
        },
      },
    },
  };
}
