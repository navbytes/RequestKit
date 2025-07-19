/**
 * Localization testing framework
 * Tests for i18n functionality and message completeness
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

import { LocalizedStrings } from '@/config/localized-constants';
import {
  I18nUtils,
  LocaleManager,
  LanguageDetector,
  MessageFormatter,
} from '@/shared/utils/i18n';

// Mock Chrome APIs for testing
const mockChrome = {
  i18n: {
    getMessage: vi.fn(),
    getUILanguage: vi.fn(() => 'en'),
  },
  storage: {
    sync: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
    },
  },
  runtime: {
    id: 'test-extension-id',
  },
};

// @ts-expect-error - Mocking global chrome object for testing
global.chrome = mockChrome;

describe('Localization System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    LocaleManager.clearCache();
  });

  describe('I18nUtils', () => {
    test('should initialize successfully', async () => {
      await expect(I18nUtils.initialize()).resolves.not.toThrow();
      expect(I18nUtils.isInitialized()).toBe(true);
    });

    test('should get message with fallback', () => {
      mockChrome.i18n.getMessage.mockReturnValue('Test Message');

      const message = I18nUtils.getMessage('test_key');
      expect(message).toBe('Test Message');
      expect(mockChrome.i18n.getMessage).toHaveBeenCalledWith(
        'test_key',
        undefined
      );
    });

    test('should return key as fallback when message not found', () => {
      mockChrome.i18n.getMessage.mockReturnValue('');

      const message = I18nUtils.getMessage('missing_key');
      expect(message).toBe('missing_key');
    });

    test('should format message with parameters', () => {
      mockChrome.i18n.getMessage.mockReturnValue(
        'Hello {name}, you have {count} messages'
      );

      const formatted = I18nUtils.getFormattedMessage('test_key', {
        name: 'John',
        count: 5,
      });

      expect(formatted).toBe('Hello John, you have 5 messages');
    });
  });

  describe('LanguageDetector', () => {
    test('should detect Chrome UI language', () => {
      const language = LanguageDetector.detectChromeLanguage();
      expect(language).toBe('en');
    });

    test('should find best match for supported locales', () => {
      const match = LanguageDetector.findBestMatch('en-US', ['en', 'es', 'fr']);
      expect(match).toBe('en');
    });

    test('should return null for unsupported language', () => {
      const match = LanguageDetector.findBestMatch('zh-CN', ['en', 'es', 'fr']);
      expect(match).toBeNull();
    });

    test('should validate supported locale', () => {
      expect(LanguageDetector.isSupportedLocale('en')).toBe(true);
      expect(LanguageDetector.isSupportedLocale('es')).toBe(true);
      expect(LanguageDetector.isSupportedLocale('zh')).toBe(false);
    });

    test('should get language display names', () => {
      expect(LanguageDetector.getLanguageDisplayName('en')).toBe('English');
      expect(LanguageDetector.getLanguageDisplayName('es')).toBe('Español');
    });

    test('should get native language names', () => {
      expect(LanguageDetector.getNativeLanguageName('en')).toBe('English');
      expect(LanguageDetector.getNativeLanguageName('es')).toBe('Español');
    });
  });

  describe('MessageFormatter', () => {
    test('should format with substitutions', () => {
      const formatted = MessageFormatter.formatWithSubstitutions(
        'Hello $1, welcome to $2',
        ['John', 'RequestKit']
      );
      expect(formatted).toBe('Hello John, welcome to RequestKit');
    });

    test('should format with named parameters', () => {
      const formatted = MessageFormatter.formatWithParams(
        'Hello {name}, you have {count} messages',
        { name: 'John', count: 5 }
      );
      expect(formatted).toBe('Hello John, you have 5 messages');
    });

    test('should format dates', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const formatted = MessageFormatter.formatDate(date);
      expect(formatted).toMatch(/Jan|1|2023/); // Should contain date elements
    });

    test('should format file sizes', () => {
      expect(MessageFormatter.formatFileSize(1024)).toBe('1.0 KB');
      expect(MessageFormatter.formatFileSize(1048576)).toBe('1.0 MB');
    });

    test('should format durations', () => {
      expect(MessageFormatter.formatDuration(1000)).toBe('1s');
      expect(MessageFormatter.formatDuration(60000)).toBe('1m 0s');
      expect(MessageFormatter.formatDuration(3661000)).toBe('1h 1m');
    });

    test('should pluralize correctly', () => {
      expect(MessageFormatter.pluralize(1, 'item')).toBe('item');
      expect(MessageFormatter.pluralize(2, 'item')).toBe('items');
      expect(MessageFormatter.pluralize(0, 'item')).toBe('items');
    });

    test('should validate message format', () => {
      const validation1 = MessageFormatter.validateMessageFormat('Hello $1');
      expect(validation1.isValid).toBe(true);
      expect(validation1.placeholders).toEqual(['$1']);

      const validation2 =
        MessageFormatter.validateMessageFormat('Hello {name}');
      expect(validation2.isValid).toBe(true);
      expect(validation2.placeholders).toEqual(['{name}']);

      const validation3 = MessageFormatter.validateMessageFormat(
        'Hello $1 and {name}'
      );
      expect(validation3.isValid).toBe(false);
      expect(validation3.errors).toContain(
        'Mixed placeholder types not recommended'
      );
    });
  });

  describe('LocalizedStrings', () => {
    beforeEach(() => {
      mockChrome.i18n.getMessage.mockImplementation((key: string) => {
        const messages: Record<string, string> = {
          errors_validation_domain_invalid: 'Invalid domain pattern',
          ui_button_save: 'Save',
          templates_cors_name: 'CORS Headers',
          rules_priority_high: 'High',
        };
        return messages[key] || key;
      });
    });

    test('should get error messages', () => {
      const message = LocalizedStrings.getErrorMessage('INVALID_DOMAIN');
      expect(message).toBe('Invalid domain pattern');
    });

    test('should get button labels', () => {
      const label = LocalizedStrings.getButton('SAVE');
      expect(label).toBe('Save');
    });

    test('should get template names', () => {
      const name = LocalizedStrings.getTemplate('CORS_NAME');
      expect(name).toBe('CORS Headers');
    });

    test('should get rule priorities', () => {
      const priority = LocalizedStrings.getRulePriority('HIGH');
      expect(priority).toBe('High');
    });
  });

  describe('Message Completeness', () => {
    const requiredKeys = [
      'extensionName',
      'extensionDescription',
      'ui_button_save',
      'ui_button_cancel',
      'errors_validation_domain_invalid',
      'notifications_rule_created',
    ];

    test('should validate English locale completeness', () => {
      mockChrome.i18n.getMessage.mockImplementation((key: string) => {
        return requiredKeys.includes(key) ? `Mock ${key}` : '';
      });

      const validation = LocaleManager.validateLocale('en', requiredKeys);
      expect(validation.isValid).toBe(true);
      expect(validation.coverage).toBe(100);
      expect(validation.missingKeys).toHaveLength(0);
    });

    test('should detect missing keys', () => {
      mockChrome.i18n.getMessage.mockImplementation((key: string) => {
        // Simulate missing some keys
        const availableKeys = requiredKeys.slice(0, 3);
        return availableKeys.includes(key) ? `Mock ${key}` : '';
      });

      const validation = LocaleManager.validateLocale('en', requiredKeys);
      expect(validation.isValid).toBe(false);
      expect(validation.coverage).toBe(50); // 3 out of 6 keys
      expect(validation.missingKeys).toHaveLength(3);
    });
  });

  describe('Cache Management', () => {
    test('should cache messages', () => {
      mockChrome.i18n.getMessage.mockReturnValue('Cached Message');

      // First call
      const message1 = I18nUtils.getMessage('test_key');
      expect(message1).toBe('Cached Message');

      // Second call should use cache
      const message2 = I18nUtils.getMessage('test_key');
      expect(message2).toBe('Cached Message');

      // Should only call Chrome API once due to caching
      expect(mockChrome.i18n.getMessage).toHaveBeenCalledTimes(1);
    });

    test('should clear cache', () => {
      mockChrome.i18n.getMessage.mockReturnValue('Test Message');

      I18nUtils.getMessage('test_key');
      expect(mockChrome.i18n.getMessage).toHaveBeenCalledTimes(1);

      LocaleManager.clearCache();

      I18nUtils.getMessage('test_key');
      expect(mockChrome.i18n.getMessage).toHaveBeenCalledTimes(2);
    });

    test('should provide cache statistics', () => {
      mockChrome.i18n.getMessage.mockReturnValue('Test Message');

      I18nUtils.getMessage('test_key_1');
      I18nUtils.getMessage('test_key_2');

      const stats = LocaleManager.getCacheStats();
      expect(stats.messageCache).toBeGreaterThan(0);
      expect(stats.lastUpdate).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle Chrome API errors gracefully', () => {
      mockChrome.i18n.getMessage.mockImplementation(() => {
        throw new Error('Chrome API error');
      });

      const message = I18nUtils.getMessage('test_key');
      expect(message).toBe('test_key'); // Should fallback to key
    });

    test('should handle storage errors', async () => {
      mockChrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));

      const stored = await LanguageDetector.getStoredLanguage();
      expect(stored).toBeNull();
    });
  });
});

/**
 * Integration tests for real Chrome extension environment
 */
describe('Chrome Extension Integration', () => {
  // These tests would run in a real Chrome extension environment
  test.skip('should work with real Chrome i18n API', () => {
    // This test would be enabled when running in actual Chrome extension
    expect(typeof chrome).toBe('object');
    expect(typeof chrome.i18n).toBe('object');
    expect(typeof chrome.i18n.getMessage).toBe('function');
  });

  test.skip('should detect real browser language', () => {
    const language = LanguageDetector.detectChromeLanguage();
    expect(typeof language).toBe('string');
    expect(language.length).toBeGreaterThan(0);
  });
});

/**
 * Performance tests
 */
describe('Performance', () => {
  test('should handle large number of message requests efficiently', () => {
    mockChrome.i18n.getMessage.mockReturnValue('Test Message');

    const start = performance.now();

    // Make 1000 message requests
    for (let i = 0; i < 1000; i++) {
      I18nUtils.getMessage(`test_key_${i % 10}`); // Reuse some keys for cache testing
    }

    const end = performance.now();
    const duration = end - start;

    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(100); // 100ms
  });

  test('should have efficient cache lookup', () => {
    mockChrome.i18n.getMessage.mockReturnValue('Cached Message');

    // Prime the cache
    I18nUtils.getMessage('cached_key');

    const start = performance.now();

    // Make many cached requests
    for (let i = 0; i < 1000; i++) {
      I18nUtils.getMessage('cached_key');
    }

    const end = performance.now();
    const duration = end - start;

    // Cached requests should be very fast
    expect(duration).toBeLessThan(10); // 10ms

    // Should only call Chrome API once (for the initial request)
    expect(mockChrome.i18n.getMessage).toHaveBeenCalledTimes(1);
  });
});
