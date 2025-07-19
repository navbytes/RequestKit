/**
 * Message formatting utilities for internationalization
 */

import { loggers } from '@/shared/utils/debug';

import type { SupportedLocale, MessageParams, FormatterOptions } from './types';

const logger = loggers.shared;

/**
 * Message formatting service
 */
export class MessageFormatter {
  private static formatters = new Map<
    string,
    Intl.DateTimeFormat | Intl.NumberFormat
  >();

  /**
   * Format message with simple substitutions
   * Supports Chrome extension format: "Hello $1, welcome to $2"
   */
  static formatWithSubstitutions(
    message: string,
    substitutions: string[] = []
  ): string {
    try {
      let formatted = message;

      // Replace $1, $2, etc. with provided substitutions
      substitutions.forEach((substitution, index) => {
        const placeholder = `$${index + 1}`;
        formatted = formatted.replace(
          new RegExp(`\\${placeholder}`, 'g'),
          substitution
        );
      });

      return formatted;
    } catch (error) {
      logger.error('Failed to format message with substitutions:', error);
      return message;
    }
  }

  /**
   * Format message with named parameters
   * Supports format: "Hello {name}, you have {count} messages"
   */
  static formatWithParams(
    message: string,
    params: MessageParams = {},
    options: FormatterOptions = {}
  ): string {
    try {
      let formatted = message;

      // Replace named placeholders
      Object.entries(params).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        const formattedValue = this.formatValue(value, key, options);
        formatted = formatted.replace(
          new RegExp(`\\${placeholder}`, 'g'),
          formattedValue
        );
      });

      return formatted;
    } catch (error) {
      logger.error('Failed to format message with params:', error);
      return message;
    }
  }

  /**
   * Format individual values based on type and context
   */
  private static formatValue(
    value: string | number | Date,
    key: string,
    options: FormatterOptions
  ): string {
    try {
      if (value instanceof Date) {
        return this.formatDate(value, options);
      }

      if (typeof value === 'number') {
        return this.formatNumber(value, key, options);
      }

      return String(value);
    } catch (error) {
      logger.warn('Failed to format value:', error);
      return String(value);
    }
  }

  /**
   * Format date values
   */
  static formatDate(date: Date, options: FormatterOptions = {}): string {
    try {
      const locale = options.locale || 'en';
      const cacheKey = `date-${locale}-${options.dateStyle}-${options.timeStyle}`;

      let formatter = this.formatters.get(cacheKey) as Intl.DateTimeFormat;

      if (!formatter) {
        formatter = new Intl.DateTimeFormat(locale, {
          dateStyle: options.dateStyle || 'medium',
          timeStyle: options.timeStyle,
          timeZone: options.timezone,
        });
        this.formatters.set(cacheKey, formatter);
      }

      return formatter.format(date);
    } catch (error) {
      logger.warn('Failed to format date:', error);
      return date.toLocaleDateString();
    }
  }

  /**
   * Format number values
   */
  static formatNumber(
    number: number,
    context: string,
    options: FormatterOptions = {}
  ): string {
    try {
      const locale = options.locale || 'en';
      const style = this.getNumberStyle(context, options);
      const cacheKey = `number-${locale}-${style}-${options.currency}`;

      let formatter = this.formatters.get(cacheKey) as Intl.NumberFormat;

      if (!formatter) {
        const formatOptions: Intl.NumberFormatOptions = {
          style,
        };

        if (style === 'currency') {
          formatOptions.currency = options.currency || 'USD';
        }

        formatter = new Intl.NumberFormat(locale, formatOptions);
        this.formatters.set(cacheKey, formatter);
      }

      return formatter.format(number);
    } catch (error) {
      logger.warn('Failed to format number:', error);
      return number.toString();
    }
  }

  /**
   * Determine number formatting style based on context
   */
  private static getNumberStyle(
    context: string,
    options: FormatterOptions
  ): 'decimal' | 'currency' | 'percent' {
    if (options.numberStyle) {
      return options.numberStyle;
    }

    // Infer style from context
    const lowerContext = context.toLowerCase();

    if (
      lowerContext.includes('price') ||
      lowerContext.includes('cost') ||
      lowerContext.includes('amount')
    ) {
      return 'currency';
    }

    if (lowerContext.includes('percent') || lowerContext.includes('rate')) {
      return 'percent';
    }

    return 'decimal';
  }

  /**
   * Format relative time (e.g., "2 hours ago", "in 3 days")
   */
  static formatRelativeTime(
    date: Date,
    _locale: SupportedLocale = 'en'
  ): string {
    try {
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      const rtf = new Intl.RelativeTimeFormat(_locale, { numeric: 'auto' });

      if (Math.abs(diffDays) >= 1) {
        return rtf.format(diffDays, 'day');
      } else if (Math.abs(diffHours) >= 1) {
        return rtf.format(diffHours, 'hour');
      } else if (Math.abs(diffMinutes) >= 1) {
        return rtf.format(diffMinutes, 'minute');
      } else {
        return rtf.format(diffSeconds, 'second');
      }
    } catch (error) {
      logger.warn('Failed to format relative time:', error);
      return date.toLocaleDateString();
    }
  }

  /**
   * Format file size
   */
  static formatFileSize(
    bytes: number,
    __locale: SupportedLocale = 'en'
  ): string {
    try {
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      const formatter = new Intl.NumberFormat(__locale, {
        minimumFractionDigits: unitIndex === 0 ? 0 : 1,
        maximumFractionDigits: unitIndex === 0 ? 0 : 2,
      });

      return `${formatter.format(size)} ${units[unitIndex]}`;
    } catch (error) {
      logger.warn('Failed to format file size:', error);
      return `${bytes} B`;
    }
  }

  /**
   * Format duration (milliseconds to human readable)
   */
  static formatDuration(
    milliseconds: number,
    _locale: SupportedLocale = 'en'
  ): string {
    try {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days}d ${hours % 24}h`;
      } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else if (seconds > 0) {
        return `${seconds}s`;
      } else {
        return `${milliseconds}ms`;
      }
    } catch (error) {
      logger.warn('Failed to format duration:', error);
      return `${milliseconds}ms`;
    }
  }

  /**
   * Pluralization helper
   */
  static pluralize(
    count: number,
    singular: string,
    plural?: string,
    _locale: SupportedLocale = 'en'
  ): string {
    try {
      const pluralRules = new Intl.PluralRules(_locale);
      const rule = pluralRules.select(count);

      // Simple English pluralization if no plural form provided
      if (!plural) {
        plural = singular.endsWith('s') ? singular : `${singular}s`;
      }

      return rule === 'one' ? singular : plural;
    } catch (error) {
      logger.warn('Failed to pluralize:', error);
      return count === 1 ? singular : plural || `${singular}s`;
    }
  }

  /**
   * Clear formatter cache
   */
  static clearCache(): void {
    this.formatters.clear();
  }

  /**
   * Get cache size for debugging
   */
  static getCacheSize(): number {
    return this.formatters.size;
  }

  /**
   * Validate message format
   */
  static validateMessageFormat(message: string): {
    isValid: boolean;
    placeholders: string[];
    errors: string[];
  } {
    const errors: string[] = [];
    const placeholders: string[] = [];

    try {
      // Find all placeholders
      const substitutionMatches = message.match(/\$\d+/g) || [];
      const namedMatches = message.match(/\{[^}]+\}/g) || [];

      placeholders.push(...substitutionMatches, ...namedMatches);

      // Check for mixed placeholder types
      if (substitutionMatches.length > 0 && namedMatches.length > 0) {
        errors.push('Mixed placeholder types not recommended');
      }

      // Check for sequential substitution placeholders
      if (substitutionMatches.length > 0) {
        const numbers = substitutionMatches
          .map(match => parseInt(match.substring(1)))
          .sort((a, b) => a - b);

        for (let i = 0; i < numbers.length; i++) {
          if (numbers[i] !== i + 1) {
            errors.push(`Non-sequential placeholder: $${numbers[i]}`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        placeholders,
        errors,
      };
    } catch {
      return {
        isValid: false,
        placeholders,
        errors: ['Failed to validate message format'],
      };
    }
  }
}
