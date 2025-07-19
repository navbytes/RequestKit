// Theme detection and management utility

import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export type Theme = 'light' | 'dark' | 'system';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = 'system';
  private mediaQuery: MediaQueryList;

  private constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.init();
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private init(): void {
    // Load saved theme preference
    this.loadThemePreference().then(() => {
      // Apply initial theme after loading preference
      this.applyTheme();
    });

    // Listen for system theme changes
    this.mediaQuery.addEventListener(
      'change',
      this.handleSystemThemeChange.bind(this)
    );

    // Apply initial theme immediately (will use default 'system')
    this.applyTheme();
  }

  private async loadThemePreference(): Promise<void> {
    try {
      // First try to load from the old 'theme' key for backward compatibility
      const themeResult = await ChromeApiUtils.storage.sync.get(['theme']);
      // Then try to load from settings
      const settingsResult = await ChromeApiUtils.storage.sync.get([
        'settings',
      ]);

      // Use theme from settings if available, otherwise fall back to direct theme key
      interface SettingsWithTheme {
        ui?: {
          theme?: Theme;
        };
      }

      const themeFromSettings = (
        (settingsResult as Record<string, unknown>)
          .settings as SettingsWithTheme
      )?.ui?.theme;
      const directTheme = (themeResult as Record<string, unknown>).theme as
        | Theme
        | undefined;

      this.currentTheme = themeFromSettings || directTheme || 'system';
    } catch (error) {
      logger.warn('Failed to load theme preference:', error);
      this.currentTheme = 'system';
    }
  }

  private handleSystemThemeChange = (): void => {
    if (this.currentTheme === 'system') {
      this.applyTheme();
    }
  };

  private applyTheme(): void {
    const isDark = this.shouldUseDarkMode();
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    if (isDark) {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
    }
  }

  private shouldUseDarkMode(): boolean {
    switch (this.currentTheme) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'system':
      default:
        return this.mediaQuery.matches;
    }
  }

  public async setTheme(theme: Theme): Promise<void> {
    this.currentTheme = theme;

    try {
      // Save theme in both locations for compatibility
      await ChromeApiUtils.storage.sync.set({ theme });

      // Also update the theme in settings if settings exist
      const settingsResult = await ChromeApiUtils.storage.sync.get([
        'settings',
      ]);
      if ((settingsResult as Record<string, unknown>).settings) {
        interface SettingsWithUI {
          ui?: {
            theme?: string;
            [key: string]: unknown;
          };
          [key: string]: unknown;
        }

        const settings = (settingsResult as Record<string, unknown>)
          .settings as SettingsWithUI;
        const updatedSettings: SettingsWithUI = {
          ...settings,
          ui: {
            ...settings.ui,
            theme: theme === 'system' ? 'auto' : theme, // Convert system back to auto for settings
          },
        };
        await ChromeApiUtils.storage.sync.set({ settings: updatedSettings });
      }
    } catch (error) {
      logger.warn('Failed to save theme preference:', error);
    }

    this.applyTheme();
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

  public isDarkMode(): boolean {
    return this.shouldUseDarkMode();
  }

  public getSystemTheme(): 'light' | 'dark' {
    return this.mediaQuery.matches ? 'dark' : 'light';
  }
}

// Initialize theme immediately when script loads
export function initializeTheme(): void {
  // Apply theme as early as possible to prevent flash
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = mediaQuery.matches;

  if (isDark) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }

  // Then initialize the full theme manager
  ThemeManager.getInstance();
}

// Convenience function for components
export function useTheme() {
  return ThemeManager.getInstance();
}
