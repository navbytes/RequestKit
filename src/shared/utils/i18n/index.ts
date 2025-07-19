/**
 * Main i18n utilities entry point
 * Provides strongly-typed wrappers around Chrome i18n APIs following chrome-api pattern
 */

import { LanguageDetector } from './language-detector';
import { LocaleManager } from './locale-manager';
import { MessageFormatter } from './message-formatter';
import type { SupportedLocale } from './types';

// Re-export main API class (similar to ChromeApiUtils)
export { LocaleManager };

// Re-export utility classes
export { LanguageDetector } from './language-detector';
export { MessageFormatter } from './message-formatter';

// Re-export all types
export * from './types';

/**
 * Main i18n API class - follows ChromeApiUtils pattern
 * Provides convenient static methods for common localization tasks
 */
export class I18nUtils {
  /**
   * Initialize localization system
   */
  static async initialize(): Promise<void> {
    return LocaleManager.initialize();
  }

  /**
   * Get localized message
   */
  static getMessage(key: string, substitutions?: string[]): string {
    return LocaleManager.getMessage(key, substitutions);
  }

  /**
   * Get formatted message with parameters
   */
  static getFormattedMessage(
    key: string,
    params?: Record<string, string | number | Date>
  ): string {
    return LocaleManager.getFormattedMessage(key, params);
  }

  /**
   * Get current locale
   */
  static getCurrentLocale(): string {
    return LocaleManager.getCurrentLocale();
  }

  /**
   * Set current locale
   */
  static async setLocale(locale: string): Promise<void> {
    return LocaleManager.setLocale(locale as SupportedLocale);
  }

  /**
   * Check if current locale is RTL
   */
  static isRTL(): boolean {
    return LocaleManager.isRTL();
  }

  /**
   * Format date for current locale
   */
  static formatDate(date: Date): string {
    return LocaleManager.formatDate(date);
  }

  /**
   * Format number for current locale
   */
  static formatNumber(number: number, context?: string): string {
    return LocaleManager.formatNumber(number, context);
  }

  /**
   * Format relative time
   */
  static formatRelativeTime(date: Date): string {
    return LocaleManager.formatRelativeTime(date);
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    return LocaleManager.formatFileSize(bytes);
  }

  /**
   * Format duration
   */
  static formatDuration(milliseconds: number): string {
    return LocaleManager.formatDuration(milliseconds);
  }

  /**
   * Pluralize text
   */
  static pluralize(count: number, singular: string, plural?: string): string {
    return LocaleManager.pluralize(count, singular, plural);
  }

  /**
   * Get supported locales
   */
  static getSupportedLocales(): string[] {
    return LocaleManager.getSupportedLocales();
  }

  /**
   * Get language display name
   */
  static getLanguageDisplayName(locale?: string): string {
    return LocaleManager.getLanguageDisplayName(locale as SupportedLocale);
  }

  /**
   * Validate message exists
   */
  static validateMessage(key: string): boolean {
    return LocaleManager.validateMessage(key);
  }

  /**
   * Clear localization cache
   */
  static clearCache(): void {
    return LocaleManager.clearCache();
  }

  /**
   * Check if localization is initialized
   */
  static isInitialized(): boolean {
    return LocaleManager.isInitialized();
  }

  // Expose domain-specific APIs (similar to ChromeApiUtils pattern)
  static locale = LocaleManager;
  static detector = LanguageDetector;
  static formatter = MessageFormatter;
}

// Default export for convenience
export default I18nUtils;
