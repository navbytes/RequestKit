/**
 * Simple i18n hook that uses Chrome's built-in localization
 * Chrome automatically selects the correct locale file based on browser language
 */

import { useCallback } from 'preact/hooks';

import { loggers } from '@/shared/utils/debug';

const logger = loggers.shared;

/**
 * Hook for accessing localized messages
 */
export function useI18n() {
  const t = useCallback((key: string, substitutions?: string[]) => {
    try {
      const message = chrome.i18n.getMessage(key, substitutions);
      return message || key; // Fallback to key if message not found
    } catch (error) {
      logger.warn('Failed to get i18n message:', error);
      return key;
    }
  }, []);

  return { t };
}

/**
 * Simple function for non-React contexts
 */
export function getMessage(key: string, substitutions?: string[]): string {
  try {
    const message = chrome.i18n.getMessage(key, substitutions);
    return message || key; // Fallback to key if message not found
  } catch (error) {
    logger.warn('Failed to get i18n message:', error);
    return key;
  }
}
