import { useState, useEffect, useRef } from 'preact/hooks';

import { VariableResolver } from '@/lib/core';
import { Icon } from '@/shared/components/Icon';
import type { Variable } from '@/shared/types/variables';

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  availableVariables?: Variable[];
  showPreview?: boolean;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}

interface AutocompleteItem {
  name: string;
  description: string | undefined;
  type: 'variable' | 'function';
  insertText: string;
}

export function VariableInput({
  value,
  onChange,
  placeholder = 'Enter value with ${variable_name} syntax...',
  className = '',
  availableVariables = [],
  showPreview = true,
  multiline = false,
  rows = 3,
  disabled = false,
}: VariableInputProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState<
    AutocompleteItem[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [previewValue, setPreviewValue] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Update preview when value changes
  useEffect(() => {
    const validateTemplate = () => {
      if (!value) {
        setValidationErrors([]);
        return;
      }

      const validation = VariableResolver.validateTemplate(value);
      setValidationErrors(validation.errors);
    };
    const updatePreview = () => {
      try {
        const preview = VariableResolver.previewResolution(value, {
          sample_var: 'example_value',
          api_key: 'sk-1234567890abcdef',
          user_id: '12345',
          timestamp: '1704067200',
        });
        setPreviewValue(preview);
      } catch (error) {
        setPreviewValue(`Preview error: ${error}`);
      }
    };
    if (showPreview && value) {
      updatePreview();
    } else {
      setPreviewValue('');
    }
    validateTemplate();
  }, [value, showPreview]);

  const getAutocompleteItems = (query: string): AutocompleteItem[] => {
    const items: AutocompleteItem[] = [];

    // Add available variables
    availableVariables.forEach(variable => {
      if (variable.name.toLowerCase().includes(query.toLowerCase())) {
        items.push({
          name: variable.name,
          description: variable.description || undefined,
          type: 'variable',
          insertText: `\${${variable.name}}`,
        });
      }
    });

    // Add built-in functions
    const builtInFunctions = [
      {
        name: 'timestamp',
        description: 'Current Unix timestamp',
        insertText: '${timestamp()}',
      },
      {
        name: 'iso_date',
        description: 'Current ISO date string',
        insertText: '${iso_date()}',
      },
      {
        name: 'uuid',
        description: 'Generate UUID v4',
        insertText: '${uuid()}',
      },
      {
        name: 'random',
        description: 'Random number between min and max',
        insertText: '${random(1, 100)}',
      },
      {
        name: 'base64',
        description: 'Base64 encode a value',
        insertText: '${base64("value")}',
      },
      {
        name: 'date',
        description: 'Format current date',
        insertText: '${date("iso")}',
      },
    ];

    builtInFunctions.forEach(func => {
      if (func.name.toLowerCase().includes(query.toLowerCase())) {
        items.push({
          name: func.name,
          description: func.description,
          type: 'function',
          insertText: func.insertText,
        });
      }
    });

    return items.slice(0, 10); // Limit to 10 items
  };

  const handleInputChange = (e: Event) => {
    const target = e.target;
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLTextAreaElement)
    ) {
      return;
    }
    const newValue = target.value;
    const cursorPos = target.selectionStart || 0;

    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check if we should show autocomplete
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const match = textBeforeCursor.match(/\$\{([^}]*)$/);

    if (match) {
      const query = match[1] || '';
      const items = getAutocompleteItems(query);
      setAutocompleteItems(items);
      setShowAutocomplete(items.length > 0);
      setSelectedIndex(0);
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showAutocomplete) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < autocompleteItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : autocompleteItems.length - 1
        );
        break;
      case 'Enter':
      case 'Tab': {
        e.preventDefault();
        const selectedItem = autocompleteItems[selectedIndex];
        if (selectedItem) {
          insertAutocompleteItem(selectedItem);
        }
        break;
      }
      case 'Escape':
        setShowAutocomplete(false);
        break;
    }
  };

  const insertAutocompleteItem = (item: AutocompleteItem) => {
    if (!inputRef.current) return;

    const input = inputRef.current;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);

    // Find the start of the variable reference
    const match = textBeforeCursor.match(/\$\{([^}]*)$/);
    if (!match) return;

    const startPos = textBeforeCursor.length - match[0].length;
    const newValue =
      value.substring(0, startPos) + item.insertText + textAfterCursor;

    onChange(newValue);
    setShowAutocomplete(false);

    // Set cursor position after the inserted text
    setTimeout(() => {
      const newCursorPos = startPos + item.insertText.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
      input.focus();
    }, 0);
  };

  const handleBlur = () => {
    // Delay hiding autocomplete to allow clicking on items
    setTimeout(() => setShowAutocomplete(false), 150);
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="relative">
      <div className="relative">
        <InputComponent
          ref={inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
          type={multiline ? undefined : 'text'}
          value={value}
          onInput={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            // Re-check for autocomplete on focus
            const textBeforeCursor = value.substring(0, cursorPosition);
            const match = textBeforeCursor.match(/\$\{([^}]*)$/);
            if (match && match[1] !== undefined) {
              const query = match[1];
              const items = getAutocompleteItems(query);
              setAutocompleteItems(items);
              setShowAutocomplete(items.length > 0);
            }
          }}
          placeholder={placeholder}
          className={`input ${className} ${validationErrors.length > 0 ? 'border-red-500' : ''}`}
          disabled={disabled}
          rows={multiline ? rows : undefined}
        />

        {/* Variable syntax indicator */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon name="sparkles" size={16} />
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {showAutocomplete && autocompleteItems.length > 0 && (
        <div
          ref={autocompleteRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {autocompleteItems.map((item, index) => (
            <button
              key={`${item.type}-${item.name}`}
              onClick={() => insertAutocompleteItem(item)}
              className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon
                  name={item.type === 'variable' ? 'sparkles' : 'code'}
                  size={14}
                  className={
                    item.type === 'variable'
                      ? 'text-blue-500'
                      : 'text-green-500'
                  }
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                  {item.type}
                </code>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="mt-1 text-sm text-red-600 dark:text-red-400">
          {validationErrors.map((error, index) => (
            <div key={index} className="flex items-center space-x-1">
              <Icon name="warning" size={14} />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {showPreview && previewValue && validationErrors.length === 0 && (
        <div className="mt-2">
          <label
            htmlFor="variable-preview"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            Preview:
          </label>
          <div
            id="variable-preview"
            className="bg-gray-50 dark:bg-gray-700 border rounded-md p-2"
          >
            <code className="text-sm text-gray-800 dark:text-gray-200 break-all">
              {previewValue}
            </code>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Use{' '}
        <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
          ${'{variable_name}'}
        </code>{' '}
        syntax to reference variables. Press{' '}
        <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
          Ctrl+Space
        </kbd>{' '}
        for autocomplete.
      </div>
    </div>
  );
}
