/**
 * Internationalization (i18n) type definitions
 */

/**
 * Supported locale codes
 */
export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'ja';

/**
 * Message category types for organization
 */
export type MessageCategory =
  | 'app'
  | 'ui'
  | 'errors'
  | 'notifications'
  | 'templates'
  | 'profiles'
  | 'rules'
  | 'settings'
  | 'devtools'
  | 'contextmenu';

/**
 * Message key structure following naming convention:
 * {category}_{component}_{element}_{context?}
 */
export type MessageKey = string;

/**
 * Chrome extension message structure
 */
export interface ChromeMessage {
  message: string;
  description?: string;
  placeholders?: Record<
    string,
    {
      content: string;
      example?: string;
    }
  >;
}

/**
 * Locale data structure
 */
export interface LocaleData {
  [key: string]: ChromeMessage;
}

/**
 * Language information
 */
export interface LanguageInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  isRTL: boolean;
  region?: string;
}

/**
 * Localization configuration
 */
export interface LocalizationConfig {
  defaultLocale: SupportedLocale;
  fallbackLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
  enableFallback: boolean;
  enableCache: boolean;
  cacheTimeout: number;
}

/**
 * Message formatting parameters
 */
export interface MessageParams {
  [key: string]: string | number | Date;
}

/**
 * Localization context for components
 */
export interface LocalizationContext {
  currentLocale: SupportedLocale;
  isRTL: boolean;
  getMessage: (key: MessageKey, substitutions?: string[]) => string;
  getFormattedMessage: (key: MessageKey, params?: MessageParams) => string;
  setLocale: (locale: SupportedLocale) => Promise<void>;
}

/**
 * Translation validation result
 */
export interface ValidationResult {
  isValid: boolean;
  missingKeys: string[];
  invalidKeys: string[];
  coverage: number;
}

/**
 * Language detection result
 */
export interface LanguageDetectionResult {
  detected: SupportedLocale;
  confidence: number;
  source: 'browser' | 'system' | 'storage' | 'default';
}

/**
 * Message formatter options
 */
export interface FormatterOptions {
  locale?: SupportedLocale;
  timezone?: string;
  currency?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  numberStyle?: 'decimal' | 'currency' | 'percent';
}

/**
 * Localization error types
 */
export class LocalizationError extends Error {
  constructor(
    message: string,
    public code:
      | 'MISSING_KEY'
      | 'INVALID_LOCALE'
      | 'FORMATTING_ERROR'
      | 'LOAD_ERROR',
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LocalizationError';
  }
}

/**
 * Type guards for runtime validation
 */
export const LocalizationTypeGuards = {
  isSupportedLocale(locale: string): locale is SupportedLocale {
    return ['en', 'es', 'fr', 'de', 'ja'].includes(locale);
  },

  isLocaleData(obj: unknown): obj is LocaleData {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      Object.values(obj).every(
        value =>
          typeof value === 'object' &&
          value !== null &&
          'message' in value &&
          typeof (value as ChromeMessage).message === 'string'
      )
    );
  },

  isLanguageInfo(obj: unknown): obj is LanguageInfo {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'code' in obj &&
      'name' in obj &&
      'nativeName' in obj &&
      'isRTL' in obj &&
      this.isSupportedLocale((obj as LanguageInfo).code) &&
      typeof (obj as LanguageInfo).name === 'string' &&
      typeof (obj as LanguageInfo).nativeName === 'string' &&
      typeof (obj as LanguageInfo).isRTL === 'boolean'
    );
  },
};
