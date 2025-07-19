import { DEFAULT_SETTINGS } from '@/config/constants';
import { StorageUtils } from '@/lib/core';
import { VariableStorageUtils } from '@/lib/core/variable-storage';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';
import { ThemeManager, type Theme } from '@/shared/utils/theme';

/**
 * Reset all extension data to defaults
 */

interface ResetResult {
  success: boolean;
  error?: string;
}

// Get logger for this module
const logger = loggers.shared;

export const resetExtensionData = async (): Promise<void> => {
  logger.info('[Reset] Starting extension reset process...');

  // Clear analytics and performance data
  logger.info('[Reset] Clearing analytics and performance data...');
  const { AnalyticsMonitor } = await import('@/lib/integrations');
  const analyticsMonitor = AnalyticsMonitor.getInstance();
  await analyticsMonitor.clearAnalytics();

  const { PerformanceMonitor } = await import('@/lib/integrations');
  PerformanceMonitor.resetMetrics();
  await PerformanceMonitor.clearMetricsFromStorage();

  // Clear Chrome storage
  logger.info('[Reset] Clearing Chrome storage...');
  await chrome.storage.sync.clear();
  await chrome.storage.local.clear();

  // Restore default settings
  logger.info('[Reset] Restoring default settings...');
  await StorageUtils.saveSettings(DEFAULT_SETTINGS);

  // Initialize default variables
  logger.info('[Reset] Initializing default variables...');
  await VariableStorageUtils.initializeDefaultVariables();

  // Apply default theme
  logger.info('[Reset] Applying default theme...');
  const themeManager = ThemeManager.getInstance();
  const defaultTheme =
    DEFAULT_SETTINGS.ui.theme === 'auto' ? 'system' : DEFAULT_SETTINGS.ui.theme;
  await themeManager.setTheme(defaultTheme as Theme);

  // Clear background script data
  logger.info('[Reset] Clearing background script data...');
  try {
    const resetResult = (await ChromeApiUtils.runtime.sendMessage({
      type: 'RESET_EXTENSION_DATA',
    })) as ResetResult;
    if (resetResult.success) {
      logger.info('[Reset] Background script data cleared successfully');
    } else {
      logger.warn(
        '[Reset] Background script data clearing failed:',
        resetResult.error
      );
    }
  } catch (error) {
    logger.warn('[Reset] Failed to communicate with background script:', error);
  }

  // Notify background script to reload rules
  logger.info('[Reset] Notifying background script to reload rules...');
  ChromeApiUtils.runtime.sendMessage({ type: 'RULES_UPDATED' });

  logger.info('[Reset] Reset process completed successfully');
};
