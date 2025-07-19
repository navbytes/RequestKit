/**
 * Theme detection and icon management utilities
 */

import { ICON_PATHS, THEME_TYPES } from '@/config/constants';
import type { ExtensionSettings } from '@/shared/types/storage';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export class BackgroundThemeManager {
  private static currentTheme: 'light' | 'dark' = 'light';

  /**
   * Detect system theme
   */
  static async detectSystemTheme(): Promise<'light' | 'dark'> {
    try {
      // Use chrome.system.display to detect theme if available
      // For now, we'll use a fallback method
      return 'light'; // Default fallback
    } catch (error) {
      logger.error('Failed to detect system theme:', error);
      return 'light';
    }
  }

  /**
   * Update extension icon based on theme
   */
  static async updateExtensionIcon(theme?: 'light' | 'dark'): Promise<void> {
    try {
      const targetTheme = theme || this.currentTheme;
      const iconPaths =
        targetTheme === 'dark' ? ICON_PATHS.DARK : ICON_PATHS.LIGHT;

      await ChromeApiUtils.action.setIcon({
        path: {
          16: ChromeApiUtils.runtime.getURL(iconPaths[16]),
          32: ChromeApiUtils.runtime.getURL(iconPaths[32]),
          48: ChromeApiUtils.runtime.getURL(iconPaths[48]),
          128: ChromeApiUtils.runtime.getURL(iconPaths[128]),
        },
      });

      this.currentTheme = targetTheme;
      logger.info(
        `[RequestKit] Extension icon updated for ${targetTheme} theme`
      );
    } catch (error) {
      logger.error('Failed to update extension icon:', error);
      if (chrome.runtime.lastError) {
        logger.error('Chrome runtime error:', chrome.runtime.lastError);
      }
    }
  }

  /**
   * Initialize theme detection
   */
  static async initializeTheme(settings: ExtensionSettings): Promise<void> {
    try {
      // Check user's theme preference from settings
      if (settings.ui.theme === THEME_TYPES.AUTO) {
        // Auto-detect system theme
        this.currentTheme = await this.detectSystemTheme();
      } else {
        // Use user's explicit preference
        this.currentTheme = settings.ui.theme as 'light' | 'dark';
      }

      await this.updateExtensionIcon(this.currentTheme);
    } catch (error) {
      logger.error('Failed to initialize theme:', error);
    }
  }

  /**
   * Handle theme changes
   */
  static async handleThemeChange(
    newTheme: 'light' | 'dark' | 'auto'
  ): Promise<void> {
    try {
      if (newTheme === 'auto') {
        this.currentTheme = await this.detectSystemTheme();
      } else {
        this.currentTheme = newTheme as 'light' | 'dark';
      }

      await this.updateExtensionIcon(this.currentTheme);
    } catch (error) {
      logger.error('[Background] Failed to handle theme change:', error);
    }
  }

  /**
   * Get current theme
   */
  static getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }
}
