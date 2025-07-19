/**
 * Localization utilities for Chrome extension
 * Provides easy access to i18n functionality
 */

import {
  I18nUtils,
  type SupportedLocale,
  type MessageParams,
} from '@/shared/utils/i18n';

import { loggers } from '../utils/debug';

const logger = loggers.shared;

/**
 * Localization utility class for non-React contexts
 */
export class LocalizationUtils {
  private static currentLocale: SupportedLocale = 'en';
  private static initialized = false;

  /**
   * Initialize localization
   */
  static async initialize(): Promise<void> {
    if (!this.initialized) {
      await I18nUtils.initialize();
      this.currentLocale = I18nUtils.getCurrentLocale() as SupportedLocale;
      this.initialized = true;
    }
  }

  /**
   * Get localized message
   */
  static t(key: string, substitutions?: string[]): string {
    return I18nUtils.getMessage(key, substitutions);
  }

  /**
   * Get formatted message with parameters
   */
  static tf(key: string, params?: MessageParams): string {
    return I18nUtils.getFormattedMessage(key, params);
  }

  /**
   * Get current locale
   */
  static getCurrentLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * Set locale
   */
  static async setLocale(locale: SupportedLocale): Promise<void> {
    await I18nUtils.setLocale(locale);
    this.currentLocale = locale;
  }

  /**
   * Check if RTL
   */
  static isRTL(): boolean {
    return I18nUtils.isRTL();
  }

  /**
   * Get supported locales
   */
  static getSupportedLocales(): SupportedLocale[] {
    return I18nUtils.getSupportedLocales() as SupportedLocale[];
  }

  /**
   * Get language display name
   */
  static getLanguageDisplayName(locale?: SupportedLocale): string {
    return I18nUtils.getLanguageDisplayName(locale);
  }

  /**
   * Format date
   */
  static formatDate(date: Date): string {
    return I18nUtils.formatDate(date);
  }

  /**
   * Format number
   */
  static formatNumber(number: number, context?: string): string {
    return I18nUtils.formatNumber(number, context);
  }

  /**
   * Format relative time
   */
  static formatRelativeTime(date: Date): string {
    return I18nUtils.formatRelativeTime(date);
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    return I18nUtils.formatFileSize(bytes);
  }

  /**
   * Format duration
   */
  static formatDuration(milliseconds: number): string {
    return I18nUtils.formatDuration(milliseconds);
  }

  /**
   * Pluralize text
   */
  static pluralize(count: number, singular: string, plural?: string): string {
    return I18nUtils.pluralize(count, singular, plural);
  }

  /**
   * Check if initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Create localization helper for specific context
 */
export function createLocalizationHelper() {
  return {
    t: LocalizationUtils.t.bind(LocalizationUtils),
    tf: LocalizationUtils.tf.bind(LocalizationUtils),
    getCurrentLocale:
      LocalizationUtils.getCurrentLocale.bind(LocalizationUtils),
    setLocale: LocalizationUtils.setLocale.bind(LocalizationUtils),
    isRTL: LocalizationUtils.isRTL.bind(LocalizationUtils),
    getSupportedLocales:
      LocalizationUtils.getSupportedLocales.bind(LocalizationUtils),
    getLanguageDisplayName:
      LocalizationUtils.getLanguageDisplayName.bind(LocalizationUtils),
    formatDate: LocalizationUtils.formatDate.bind(LocalizationUtils),
    formatNumber: LocalizationUtils.formatNumber.bind(LocalizationUtils),
    formatRelativeTime:
      LocalizationUtils.formatRelativeTime.bind(LocalizationUtils),
    formatFileSize: LocalizationUtils.formatFileSize.bind(LocalizationUtils),
    formatDuration: LocalizationUtils.formatDuration.bind(LocalizationUtils),
    pluralize: LocalizationUtils.pluralize.bind(LocalizationUtils),
  };
}

/**
 * Global localization instance for easy access
 */
export const localization = createLocalizationHelper();

/**
 * Initialize localization on module load for Chrome extension contexts
 */
if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
  LocalizationUtils.initialize().catch(error => {
    logger.error('Failed to initialize localization:', error);
  });
}

// Export for backward compatibility
export { LocalizationUtils as useLocalization };
