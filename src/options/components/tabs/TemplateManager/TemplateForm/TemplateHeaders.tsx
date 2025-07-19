import { Icon } from '@/shared/components/Icon';
import type { HeaderEntry } from '@/shared/types/rules';
import {
  getInputValue,
  getSelectValue,
  createTypedSelectHandler,
} from '@/shared/utils/form-events';

interface NewHeaderType {
  name: string;
  value: string;
  operation: 'set' | 'append' | 'remove';
  target: 'request' | 'response';
}

interface TemplateHeadersProps {
  headers: HeaderEntry[];
  newHeader: NewHeaderType;
  setNewHeader: (
    header: NewHeaderType | ((prev: NewHeaderType) => NewHeaderType)
  ) => void;
  addHeader: () => void;
  removeHeader: (index: number) => void;
  updateHeader: (
    index: number,
    field: keyof HeaderEntry,
    value: string
  ) => void;
}

export function TemplateHeaders({
  headers,
  newHeader,
  setNewHeader,
  addHeader,
  removeHeader,
  updateHeader,
}: TemplateHeadersProps) {
  return (
    <div>
      <label
        htmlFor="template-headers-section"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
      >
        Headers *
      </label>

      {/* Existing Headers */}
      <div id="template-headers-section" className="space-y-3 mb-4">
        {headers.map((header, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label
                  htmlFor={`existing-header-name-${index}`}
                  className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Header Name
                </label>
                <input
                  id={`existing-header-name-${index}`}
                  type="text"
                  value={header.name}
                  onInput={e => updateHeader(index, 'name', getInputValue(e))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Content-Type"
                />
              </div>
              <div>
                <label
                  htmlFor={`existing-header-value-${index}`}
                  className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Header Value
                </label>
                <input
                  id={`existing-header-value-${index}`}
                  type="text"
                  value={header.value}
                  onInput={e => updateHeader(index, 'value', getInputValue(e))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  placeholder="application/json"
                />
              </div>
              <div>
                <label
                  htmlFor={`existing-header-operation-${index}`}
                  className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Operation
                </label>
                <select
                  id={`existing-header-operation-${index}`}
                  value={header.operation}
                  onChange={e =>
                    updateHeader(index, 'operation', getSelectValue(e))
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="set">Set</option>
                  <option value="append">Append</option>
                  <option value="remove">Remove</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label
                    htmlFor={`existing-header-target-${index}`}
                    className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Target
                  </label>
                  <select
                    id={`existing-header-target-${index}`}
                    value={header.target}
                    onChange={e =>
                      updateHeader(index, 'target', getSelectValue(e))
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="request">Request</option>
                    <option value="response">Response</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeHeader(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Remove header"
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Header */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
          Add New Header
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <input
              type="text"
              value={newHeader.name}
              onInput={e =>
                setNewHeader({
                  ...newHeader,
                  name: getInputValue(e),
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
              placeholder="Header name"
            />
          </div>
          <div>
            <input
              type="text"
              value={newHeader.value}
              onInput={e =>
                setNewHeader({
                  ...newHeader,
                  value: getInputValue(e),
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
              placeholder="Header value"
            />
          </div>
          <div>
            <select
              value={newHeader.operation}
              onChange={createTypedSelectHandler<typeof newHeader.operation>(
                operation =>
                  setNewHeader({
                    ...newHeader,
                    operation,
                  })
              )}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="set">Set</option>
              <option value="append">Append</option>
              <option value="remove">Remove</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <select
                value={newHeader.target}
                onChange={createTypedSelectHandler<typeof newHeader.target>(
                  target =>
                    setNewHeader({
                      ...newHeader,
                      target,
                    })
                )}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="request">Request</option>
                <option value="response">Response</option>
              </select>
            </div>
            <button
              type="button"
              onClick={addHeader}
              className="px-3 py-2 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {headers.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          No headers added yet. Add at least one header to create the template.
        </p>
      )}
    </div>
  );
}
