/**
 * Regex search hook for RequestKit DevTools
 * Provides regex pattern validation and search functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'preact/hooks';

import { loggers } from '@/shared/utils/debug';

import { filterService } from '../services/FilterService';
import type { RegexSearchPattern } from '../types/filtering';

interface UseRegexSearchOptions {
  initialPattern?: string;
  initialFlags?: string;
  validateOnChange?: boolean;
  debounceMs?: number;
}

interface UseRegexSearchReturn {
  // Pattern state
  pattern: string;
  flags: string;
  regexPattern: RegexSearchPattern | null;

  // Pattern actions
  setPattern: (pattern: string) => void;
  setFlags: (flags: string) => void;
  updatePattern: (pattern: string, flags?: string) => void;
  clearPattern: () => void;

  // Validation
  isValid: boolean;
  error: string | null;

  // Suggestions
  suggestions: string[];
  applySuggestion: (suggestion: string) => void;

  // History
  history: string[];
  addToHistory: (pattern: string) => void;
  clearHistory: () => void;
}


// Get logger for this module
const logger = loggers.shared;

const COMMON_REGEX_SUGGESTIONS = [
  // URL patterns
  '^https?://.*',
  '.*\\.json$',
  '.*\\.js$',
  '.*\\.css$',
  '/api/.*',
  '/graphql.*',

  // Header patterns
  'content-type',
  'authorization',
  'x-.*',
  'cache-control',

  // Status patterns
  '^[45]\\d\\d$', // 4xx and 5xx errors
  '^2\\d\\d$', // 2xx success
  '^3\\d\\d$', // 3xx redirects

  // Common values
  'application/json',
  'text/html',
  'Bearer .*',
  'no-cache',
];

export function useRegexSearch({
  initialPattern = '',
  initialFlags = 'i',
  validateOnChange = true,
  debounceMs = 300,
}: UseRegexSearchOptions = {}): UseRegexSearchReturn {
  const [pattern, setPatternState] = useState(initialPattern);
  const [flags, setFlagsState] = useState(initialFlags);
  const [regexPattern, setRegexPattern] = useState<RegexSearchPattern | null>(
    null
  );
  const [history, setHistory] = useState<string[]>([]);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('requestkit-regex-history');
      if (stored) {
        const parsedHistory = JSON.parse(stored);
        setHistory(parsedHistory.slice(0, 10)); // Keep only last 10
      }
    } catch (error) {
      logger.warn('Failed to load regex history:', error);
    }
  }, []);

  // Validate regex pattern
  const validatePattern = useCallback(
    async (patternToValidate: string, flagsToValidate: string) => {
      if (!patternToValidate) {
        setRegexPattern(null);
        return;
      }

      try {
        const result = await filterService.compileRegex(
          patternToValidate,
          flagsToValidate
        );
        setRegexPattern(result);
      } catch (error) {
        setRegexPattern({
          pattern: patternToValidate,
          flags: flagsToValidate,
          isValid: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    []
  );

  // Debounced validation
  useEffect(() => {
    if (!validateOnChange) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      validatePattern(pattern, flags);
    }, debounceMs);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pattern, flags, validateOnChange, validatePattern, debounceMs, debounceTimer]);

  // Set pattern with validation
  const setPattern = useCallback((newPattern: string) => {
    // Only update if the pattern actually changed
    setPatternState(currentPattern => {
      if (currentPattern === newPattern) {
        return currentPattern;
      }
      return newPattern;
    });
  }, []);

  // Set flags with validation
  const setFlags = useCallback((newFlags: string) => {
    setFlagsState(newFlags);
  }, []);

  // Update both pattern and flags
  const updatePattern = useCallback((newPattern: string, newFlags?: string) => {
    setPatternState(newPattern);
    if (newFlags !== undefined) {
      setFlagsState(newFlags);
    }
  }, []);

  // Clear pattern
  const clearPattern = useCallback(() => {
    setPatternState('');
    setRegexPattern(null);
  }, []);

  // Add pattern to history
  const addToHistory = useCallback((patternToAdd: string) => {
    if (!patternToAdd || patternToAdd.trim() === '') return;

    setHistory(prev => {
      const newHistory = [
        patternToAdd,
        ...prev.filter(p => p !== patternToAdd),
      ].slice(0, 10);

      // Persist to localStorage
      try {
        localStorage.setItem(
          'requestkit-regex-history',
          JSON.stringify(newHistory)
        );
      } catch (error) {
        logger.warn('Failed to save regex history:', error);
      }

      return newHistory;
    });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('requestkit-regex-history');
    } catch (error) {
      logger.warn('Failed to clear regex history:', error);
    }
  }, []);

  // Apply suggestion
  const applySuggestion = useCallback(
    (suggestion: string) => {
      setPattern(suggestion);
      addToHistory(suggestion);
    },
    [setPattern, addToHistory]
  );

  // Get filtered suggestions based on current pattern
  const suggestions = useMemo(() => {
    if (!pattern) return COMMON_REGEX_SUGGESTIONS;

    const lowerPattern = pattern.toLowerCase();
    return COMMON_REGEX_SUGGESTIONS.filter(
      suggestion =>
        suggestion.toLowerCase().includes(lowerPattern) ||
        lowerPattern.includes(suggestion.toLowerCase())
    );
  }, [pattern]);

  // Computed values
  const isValid = regexPattern?.isValid ?? true;
  const error = regexPattern?.error ?? null;

  return {
    // Pattern state
    pattern,
    flags,
    regexPattern,

    // Pattern actions
    setPattern,
    setFlags,
    updatePattern,
    clearPattern,

    // Validation
    isValid,
    error,

    // Suggestions
    suggestions,
    applySuggestion,

    // History
    history,
    addToHistory,
    clearHistory,
  };
}
