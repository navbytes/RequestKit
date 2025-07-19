/**
 * Locale management service - main API for internationalization
 * Follows the same pattern as ChromeApiUtils for consistency
 */

import { SUPPORTED_LOCALES } from '@/config';
import { type SupportedLocale } from '@/config';
import { loggers } from '@/shared/utils/debug';

import { LanguageDetector } from './language-detector';
import { MessageFormatter } from './message-formatter';
import type {
  LocalizationConfig,
  MessageParams,
  FormatterOptions,
  ValidationResult,
} from './types';
import { LocalizationError } from './types';

const logger = loggers.shared;

/**
 * Default localization configuration
 */
const DEFAULT_CONFIG: LocalizationConfig = {
  defaultLocale: 'en',
  fallbackLocale: 'en',
  supportedLocales: [...SUPPORTED_LOCALES],
  enableFallback: true,
  enableCache: true,
  cacheTimeout: 300000, // 5 minutes
};

/**
 * Main localization manager class
 * Provides strongly-typed wrappers around Chrome i18n APIs
 */
export class LocaleManager {
  private static config: LocalizationConfig = DEFAULT_CONFIG;
  private static currentLocale: SupportedLocale = 'en';
  private static readonly messageCache = new Map<string, string>();
  private static cacheTimestamp = 0;
  private static initialized = false;

  /**
   * Initialize the locale manager
   */
  static async initialize(config?: Partial<LocalizationConfig>): Promise<void> {
    try {
      // Merge with default config
      this.config = { ...DEFAULT_CONFIG, ...config };

      // Get the current UI language from Chrome
      const chromeLocale = chrome.i18n.getUILanguage();

      // Chrome automatically selects the best locale file based on browser settings
      // We just need to track what Chrome is using
      this.currentLocale = this.mapChromeLocaleToSupported(chromeLocale);

      logger.info('Locale manager initialized:', {
        chromeLocale,
        mappedLocale: this.currentLocale,
        source: 'chrome',
      });

      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize locale manager:', error);
      this.currentLocale = this.config.defaultLocale;
      this.initialized = true;
    }
  }

  /**
   * Map Chrome's locale to our supported locales
   */
  private static mapChromeLocaleToSupported(
    chromeLocale: string
  ): SupportedLocale {
    // Chrome locale might be like 'en-US', we want 'en'
    const baseLocale = chromeLocale.toLowerCase().split('-')[0];

    // Check if we support this base locale
    if (SUPPORTED_LOCALES.includes(baseLocale as SupportedLocale)) {
      return baseLocale as SupportedLocale;
    }

    // Fallback to default
    return this.config.defaultLocale;
  }

  /**
   * Get localized message by key
   */
  static getMessage(key: string, substitutions?: string[]): string {
    try {
      this.ensureInitialized();

      // Check cache first
      const cacheKey = `${key}:${substitutions?.join(',')}`;
      if (this.config.enableCache && this.isCacheValid()) {
        const cached = this.messageCache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Get message from Chrome i18n API (Chrome handles locale selection automatically)
      let message = chrome.i18n.getMessage(key, substitutions);

      // If no message found, return the key as fallback
      if (!message) {
        logger.warn(`Message not found for key '${key}'`);
        message = key;
      }

      // Cache the result
      if (this.config.enableCache) {
        this.messageCache.set(cacheKey, message);
        this.cacheTimestamp = Date.now();
      }

      return message;
    } catch (error) {
      logger.error('Failed to get message:', error);
      return key; // Return key as fallback
    }
  }

  /**
   * Get formatted message with named parameters
   */
  static getFormattedMessage(
    key: string,
    params?: MessageParams,
    options?: FormatterOptions
  ): string {
    try {
      const message = this.getMessage(key);

      if (!params || Object.keys(params).length === 0) {
        return message;
      }

      const formatOptions = {
        ...options,
        locale: options?.locale || this.currentLocale,
      };

      return MessageFormatter.formatWithParams(message, params, formatOptions);
    } catch (error) {
      logger.error('Failed to format message:', error);
      return this.getMessage(key);
    }
  }

  /**
   * Get current locale
   */
  static getCurrentLocale(): SupportedLocale {
    this.ensureInitialized();
    return this.currentLocale;
  }

  /**
   * Set current locale
   */
  static async setLocale(locale: SupportedLocale): Promise<void> {
    try {
      if (!this.config.supportedLocales.includes(locale)) {
        throw new Error(`Unsupported locale: ${locale}`);
      }

      this.currentLocale = locale;

      // Store preference
      await LanguageDetector.setStoredLanguage(locale);

      // Clear cache to force reload of messages
      this.clearCache();

      logger.info('Locale changed to:', locale);
    } catch (error) {
      logger.error('Failed to set locale:', error);
      throw error;
    }
  }

  /**
   * Get supported locales
   */
  static getSupportedLocales(): SupportedLocale[] {
    return [...this.config.supportedLocales];
  }

  /**
   * Check if current locale is RTL
   */
  static isRTL(): boolean {
    return LanguageDetector.isRTL(this.currentLocale);
  }

  /**
   * Get language display name
   */
  static getLanguageDisplayName(
    locale?: SupportedLocale,
    inLocale?: SupportedLocale
  ): string {
    const targetLocale = locale || this.currentLocale;
    return LanguageDetector.getLanguageDisplayName(targetLocale, inLocale);
  }

  /**
   * Get native language name
   */
  static getNativeLanguageName(locale?: SupportedLocale): string {
    const targetLocale = locale || this.currentLocale;
    return LanguageDetector.getNativeLanguageName(targetLocale);
  }

  /**
   * Get date formatter for current locale
   */
  static getDateFormatter(
    options?: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(this.currentLocale, options);
  }

  /**
   * Get number formatter for current locale
   */
  static getNumberFormatter(
    options?: Intl.NumberFormatOptions
  ): Intl.NumberFormat {
    return new Intl.NumberFormat(this.currentLocale, options);
  }

  /**
   * Format date using current locale
   */
  static formatDate(date: Date, options?: FormatterOptions): string {
    const formatOptions = {
      ...options,
      locale: options?.locale || this.currentLocale,
    };
    return MessageFormatter.formatDate(date, formatOptions);
  }

  /**
   * Format number using current locale
   */
  static formatNumber(
    number: number,
    context: string = 'default',
    options?: FormatterOptions
  ): string {
    const formatOptions = {
      ...options,
      locale: options?.locale || this.currentLocale,
    };
    return MessageFormatter.formatNumber(number, context, formatOptions);
  }

  /**
   * Format relative time
   */
  static formatRelativeTime(date: Date): string {
    return MessageFormatter.formatRelativeTime(date, this.currentLocale);
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    return MessageFormatter.formatFileSize(bytes, this.currentLocale);
  }

  /**
   * Format duration
   */
  static formatDuration(milliseconds: number): string {
    return MessageFormatter.formatDuration(milliseconds, this.currentLocale);
  }

  /**
   * Pluralize text
   */
  static pluralize(count: number, singular: string, plural?: string): string {
    return MessageFormatter.pluralize(
      count,
      singular,
      plural,
      this.currentLocale
    );
  }

  /**
   * Validate message exists
   */
  static validateMessage(key: string): boolean {
    try {
      const message = chrome.i18n.getMessage(key);
      return !!message;
    } catch {
      return false;
    }
  }

  /**
   * Get missing message keys for current locale
   */
  static getMissingKeys(requiredKeys: string[]): string[] {
    return requiredKeys.filter(key => !this.validateMessage(key));
  }

  /**
   * Validate locale completeness
   */
  static validateLocale(
    locale: SupportedLocale,
    requiredKeys: string[]
  ): ValidationResult {
    const originalLocale = this.currentLocale;
    this.currentLocale = locale;

    try {
      const missingKeys = this.getMissingKeys(requiredKeys);
      const invalidKeys: string[] = [];

      // Check for invalid message formats
      for (const key of requiredKeys) {
        const message = chrome.i18n.getMessage(key);
        if (message) {
          const validation = MessageFormatter.validateMessageFormat(message);
          if (!validation.isValid) {
            invalidKeys.push(key);
          }
        }
      }

      const coverage =
        ((requiredKeys.length - missingKeys.length) / requiredKeys.length) *
        100;

      return {
        isValid: missingKeys.length === 0 && invalidKeys.length === 0,
        missingKeys,
        invalidKeys,
        coverage,
      };
    } finally {
      this.currentLocale = originalLocale;
    }
  }

  /**
   * Clear message cache
   */
  static clearCache(): void {
    this.messageCache.clear();
    this.cacheTimestamp = 0;
    MessageFormatter.clearCache();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    messageCache: number;
    formatterCache: number;
    lastUpdate: number;
  } {
    return {
      messageCache: this.messageCache.size,
      formatterCache: MessageFormatter.getCacheSize(),
      lastUpdate: this.cacheTimestamp,
    };
  }

  /**
   * Get configuration
   */
  static getConfig(): LocalizationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  static updateConfig(config: Partial<LocalizationConfig>): void {
    this.config = { ...this.config, ...config };
    this.clearCache();
  }

  /**
   * Check if manager is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Ensure manager is initialized
   */
  private static ensureInitialized(): void {
    if (!this.initialized) {
      logger.warn('LocaleManager not initialized, using defaults');
      this.currentLocale = this.config.defaultLocale;
      this.initialized = true;
    }
  }

  /**
   * Check if cache is valid
   */
  private static isCacheValid(): boolean {
    if (!this.config.enableCache) return false;
    return Date.now() - this.cacheTimestamp < this.config.cacheTimeout;
  }

  /**
   * Create localization error
   */
  static createError(
    message: string,
    code: 'MISSING_KEY' | 'INVALID_LOCALE' | 'FORMATTING_ERROR' | 'LOAD_ERROR',
    context?: Record<string, unknown>
  ): LocalizationError {
    return new LocalizationError(message, code, context);
  }
}
