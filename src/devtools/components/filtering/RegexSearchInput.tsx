/**
 * Regex Search Input for RequestKit DevTools
 * Input component with regex validation and suggestions
 */

import { useState, useEffect } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';
import { getInputValue } from '@/shared/utils/form-events';

import { useRegexSearch } from '../../hooks/useRegexSearch';

interface RegexSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onRegexToggle: (useRegex: boolean) => void;
  useRegex: boolean;
  placeholder?: string;
  className?: string;
}

export function RegexSearchInput({
  value,
  onChange,
  onRegexToggle,
  useRegex,
  placeholder = 'Enter search pattern...',
  className = '',
}: RegexSearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    pattern,
    setPattern,
    isValid,
    error,
    suggestions,
    applySuggestion,
    history,
  } = useRegexSearch({
    initialPattern: value,
    validateOnChange: useRegex,
    debounceMs: 300,
  });

  // Update internal pattern when value changes externally
  useEffect(() => {
    if (value !== pattern) {
      setPattern(value);
    }
  }, [value, pattern, setPattern]);

  const handleInputChange = (e: Event) => {
    const newValue = getInputValue(e);
    setPattern(newValue);
    // Directly call onChange to update parent component immediately
    onChange(newValue);
  };

  const handleInputFocus = () => {
    if (useRegex && (suggestions.length > 0 || history.length > 0)) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSuggestionClick = (suggestion: string) => {
    applySuggestion(suggestion);
    setShowSuggestions(false);
  };

  const handleRegexToggle = () => {
    onRegexToggle(!useRegex);
    if (!useRegex) {
      // Show suggestions when enabling regex mode
      setShowSuggestions(true);
    }
  };

  const inputClasses = `
    w-full px-3 py-2 pr-20 text-sm border rounded-lg
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-white 
    placeholder-gray-500 dark:placeholder-gray-400
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-colors
    ${
      useRegex && !isValid
        ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
        : 'border-gray-300 dark:border-gray-600'
    }
  `.trim();

  return (
    <div className={`relative ${className}`}>
      {/* Input Container */}
      <div className="relative">
        <input
          type="text"
          value={pattern}
          onInput={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={inputClasses}
        />

        {/* Controls */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Regex Toggle */}
          <button
            onClick={handleRegexToggle}
            className={`p-1 rounded text-xs font-mono transition-colors ${
              useRegex
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={useRegex ? 'Disable regex mode' : 'Enable regex mode'}
          >
            .*
          </button>

          {/* Suggestions Toggle */}
          {useRegex && (
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Show suggestions"
            >
              <Icon
                name="search"
                className="w-3 h-3 text-gray-500 dark:text-gray-400"
              />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {useRegex && error && (
        <div className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
          <Icon name="alert-circle" className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Validation Indicator */}
      {useRegex && pattern && (
        <div className="mt-1 text-xs flex items-center space-x-1">
          {isValid ? (
            <>
              <Icon
                name="check-circle"
                className="w-3 h-3 text-green-600 dark:text-green-400"
              />
              <span className="text-green-600 dark:text-green-400">
                Valid regex pattern
              </span>
            </>
          ) : (
            <>
              <Icon
                name="alert-circle"
                className="w-3 h-3 text-red-600 dark:text-red-400"
              />
              <span className="text-red-600 dark:text-red-400">
                Invalid regex pattern
              </span>
            </>
          )}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions &&
        useRegex &&
        (suggestions.length > 0 || history.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {/* History */}
            {history.length > 0 && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Recent Patterns
                </div>
                {history.slice(0, 5).map((item, index) => (
                  <button
                    key={`history-${index}`}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Common Patterns
                </div>
                {suggestions.slice(0, 8).map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
