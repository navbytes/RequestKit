/**
 * Language detection utilities for Chrome extension
 */

import {
  SUPPORTED_LOCALES,
  SUPPORTED_LOCALES_DISPLAY_NAMES,
  SUPPORTED_LOCALES_NATIVE_DISPLAY_NAMES,
} from '@/config';
import { type SupportedLocale } from '@/config';
import { loggers } from '@/shared/utils/debug';

import type { LanguageDetectionResult, LocalizationConfig } from './types';

const logger = loggers.shared;

/**
 * Language detection service
 */
export class LanguageDetector {
  private static readonly STORAGE_KEY = 'i18n_preferred_locale';

  /**
   * Detect the best language for the user
   */
  static async detectBestLanguage(
    config: LocalizationConfig
  ): Promise<LanguageDetectionResult> {
    try {
      // 1. Check stored preference first
      const storedLocale = await this.getStoredLanguage();
      if (storedLocale && config.supportedLocales.includes(storedLocale)) {
        return {
          detected: storedLocale,
          confidence: 1.0,
          source: 'storage',
        };
      }

      // 2. Check Chrome extension UI language
      const chromeLanguage = this.detectChromeLanguage();
      const chromeMatch = this.findBestMatch(
        chromeLanguage,
        config.supportedLocales
      );
      if (chromeMatch) {
        return {
          detected: chromeMatch,
          confidence: 0.9,
          source: 'browser',
        };
      }

      // 3. Check browser accept languages
      const browserLanguages = this.detectBrowserLanguages();
      for (const lang of browserLanguages) {
        const match = this.findBestMatch(lang, config.supportedLocales);
        if (match) {
          return {
            detected: match,
            confidence: 0.8,
            source: 'browser',
          };
        }
      }

      // 4. Check system language (if available)
      const systemLanguage = this.detectSystemLanguage();
      if (systemLanguage) {
        const systemMatch = this.findBestMatch(
          systemLanguage,
          config.supportedLocales
        );
        if (systemMatch) {
          return {
            detected: systemMatch,
            confidence: 0.7,
            source: 'system',
          };
        }
      }

      // 5. Fall back to default
      return {
        detected: config.defaultLocale,
        confidence: 0.5,
        source: 'default',
      };
    } catch (error) {
      logger.error('Language detection failed:', error);
      return {
        detected: config.defaultLocale,
        confidence: 0.0,
        source: 'default',
      };
    }
  }

  /**
   * Get Chrome extension UI language
   */
  static detectChromeLanguage(): string {
    try {
      return chrome.i18n.getUILanguage();
    } catch (error) {
      logger.warn('Failed to get Chrome UI language:', error);
      return '';
    }
  }

  /**
   * Get browser accept languages
   */
  static detectBrowserLanguages(): string[] {
    try {
      if (typeof navigator !== 'undefined') {
        const languages = navigator.languages || [navigator.language];
        return Array.from(languages);
      }
      return [];
    } catch (error) {
      logger.warn('Failed to get browser languages:', error);
      return [];
    }
  }

  /**
   * Get system language (limited in extension context)
   */
  static detectSystemLanguage(): string | null {
    try {
      // In Chrome extensions, this is usually the same as UI language
      return chrome.i18n.getUILanguage();
    } catch (error) {
      logger.warn('Failed to get system language:', error);
      return null;
    }
  }

  /**
   * Get stored language preference
   */
  static async getStoredLanguage(): Promise<SupportedLocale | null> {
    try {
      const result = await chrome.storage.sync.get(this.STORAGE_KEY);
      const stored = result[this.STORAGE_KEY] satisfies SupportedLocale;

      if (stored && this.isSupportedLocale(stored)) {
        return stored;
      }
      return null;
    } catch (error) {
      logger.warn('Failed to get stored language:', error);
      return null;
    }
  }

  /**
   * Store language preference
   */
  static async setStoredLanguage(locale: SupportedLocale): Promise<void> {
    try {
      await chrome.storage.sync.set({ [this.STORAGE_KEY]: locale });
      logger.info('Language preference stored:', locale);
    } catch (error) {
      logger.error('Failed to store language preference:', error);
      throw error;
    }
  }

  /**
   * Find best matching supported locale
   */
  static findBestMatch(
    language: string,
    supportedLocales: SupportedLocale[]
  ): SupportedLocale | null {
    if (!language) return null;

    const normalized = language.toLowerCase().replace('_', '-');

    // Exact match
    for (const locale of supportedLocales) {
      if (normalized === locale || normalized.startsWith(`${locale}-`)) {
        return locale;
      }
    }

    // Language family match (e.g., 'en-US' -> 'en')
    const languageCode = normalized.split('-')[0];
    for (const locale of supportedLocales) {
      if (languageCode === locale) {
        return locale;
      }
    }

    return null;
  }

  /**
   * Check if locale is supported
   */
  static isSupportedLocale(locale: SupportedLocale): locale is SupportedLocale {
    return SUPPORTED_LOCALES.includes(locale);
  }

  /**
   * Get language direction (LTR/RTL)
   */
  static isRTL(locale: SupportedLocale): boolean {
    // Currently no RTL languages in our supported set
    // This would include 'ar', 'he', 'fa', etc. in the future
    const rtlLanguages: string[] = [];
    return rtlLanguages.includes(locale);
  }

  /**
   * Get language display name
   */
  static getLanguageDisplayName(
    locale: SupportedLocale,
    inLocale?: SupportedLocale
  ): string {
    const targetLocale = inLocale || locale;
    return SUPPORTED_LOCALES_DISPLAY_NAMES[targetLocale]?.[locale] || locale;
  }

  /**
   * Get native language name
   */
  static getNativeLanguageName(locale: SupportedLocale): string {
    return SUPPORTED_LOCALES_NATIVE_DISPLAY_NAMES[locale] || locale;
  }

  /**
   * Validate language detection configuration
   */
  static validateConfig(config: LocalizationConfig): boolean {
    return (
      config.supportedLocales.length > 0 &&
      config.supportedLocales.includes(config.defaultLocale) &&
      config.supportedLocales.includes(config.fallbackLocale)
    );
  }
}
