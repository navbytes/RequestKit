/**
 * Extension initialization utilities
 */

import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/config/constants';
import { VariableStorageUtils } from '@/lib/core/variable-storage';
import { LocalizationUtils } from '@/shared/hooks/useLocalization';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';
import { createDefaultProfiles } from '@/shared/utils/default-profiles';

/**
 * Initialize extension on first install
 */

// Get logger for this module
const logger = loggers.shared;

export async function initializeExtension(): Promise<void> {
  try {
    // Initialize localization system first
    await LocalizationUtils.initialize();
    logger.info('Localization system initialized for background');

    // Set default settings and profiles
    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
      [STORAGE_KEYS.RULES]: {},
      [STORAGE_KEYS.TEMPLATES]: {},
      [STORAGE_KEYS.PROFILES]: createDefaultProfiles(),
      [STORAGE_KEYS.ACTIVE_PROFILE]: 'dev-profile',
      [STORAGE_KEYS.STATS]: {},
      [STORAGE_KEYS.PROFILE_STATS]: {},
      [STORAGE_KEYS.VARIABLES]: {
        global: {},
        profiles: {},
      },
      [STORAGE_KEYS.VERSION]: '1.0.0',
    });

    // Initialize variables storage and default variables
    await VariableStorageUtils.initializeVariablesStorage();
    await VariableStorageUtils.initializeDefaultVariables();

    logger.info('Extension initialized with default data and variables');

    // Show welcome notification
    if (DEFAULT_SETTINGS.notifications.enabled) {
      ChromeApiUtils.notifications.create('welcome', {
        type: 'basic',
        iconUrl: ChromeApiUtils.runtime.getURL('assets/icons/icon-48.png'),
        title: 'RequestKit Installed',
        message: 'Click the extension icon to start creating header rules!',
      });
    }
  } catch (error) {
    logger.error('Failed to initialize extension:', error);
  }
}

/**
 * Handle extension update
 */
export async function handleExtensionUpdate(): Promise<void> {
  try {
    // Load existing data
    const data = await ChromeApiUtils.storage.sync.get([
      STORAGE_KEYS.VERSION,
      STORAGE_KEYS.SETTINGS,
    ]);

    if (!isStorageRecord(data)) {
      throw new Error('Invalid storage data format');
    }

    // Perform migration if needed
    const currentVersion =
      typeof data[STORAGE_KEYS.VERSION] === 'string'
        ? data[STORAGE_KEYS.VERSION]
        : '0.0.0';
    logger.info('Updating from version:', currentVersion);

    // Update version
    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.VERSION]: '1.0.0',
    });

    logger.info('Extension updated successfully');
  } catch (error) {
    logger.error('Failed to handle extension update:', error);
  }
}

/**
 * Type guard for storage data
 */
function isStorageRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}
