import { useState, useEffect } from 'preact/hooks';

import { loggers } from '@/shared/utils/debug';
import { ThemeManager } from '@/shared/utils/theme';

// Get logger for this module
const logger = loggers.shared;

export function useThemeManager() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Initialize theme manager and sync current theme
    const initializeTheme = async () => {
      const themeManager = ThemeManager.getInstance();
      const currentThemeFromManager = themeManager.getTheme();

      // Convert 'system' to actual theme for display
      const displayTheme =
        currentThemeFromManager === 'system'
          ? themeManager.getSystemTheme()
          : currentThemeFromManager;

      setCurrentTheme(displayTheme);
      logger.info(
        '[PopupApp] Initialized theme from ThemeManager:',
        displayTheme
      );
    };

    initializeTheme();
  }, []);

  const handleToggleTheme = async () => {
    try {
      logger.info(
        '[PopupApp] Theme toggle clicked, current theme:',
        currentTheme
      );

      // Toggle between light and dark themes for testing
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      logger.info('[PopupApp] Switching to theme:', newTheme);

      // Use ThemeManager to properly set theme across entire extension
      logger.info(
        '[PopupApp] Using ThemeManager.setTheme() for proper theme handling'
      );
      const themeManager = ThemeManager.getInstance();
      await themeManager.setTheme(newTheme);

      // Update local state
      setCurrentTheme(newTheme);

      logger.info(
        `[PopupApp] Theme switched to: ${newTheme} using ThemeManager`
      );
      logger.info(
        '[PopupApp] Theme change persisted to storage and applied across extension'
      );
    } catch (error) {
      logger.error('[PopupApp] Failed to toggle theme:', error);
    }
  };

  return {
    currentTheme,
    handleToggleTheme,
  };
}
