import type { HeaderEntry } from '@/shared/types/rules';

interface TemplateHeadersProps {
  headers: HeaderEntry[];
}

export function TemplateHeaders({ headers }: Readonly<TemplateHeadersProps>) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Headers ({headers.length})
      </h3>
      <div className="space-y-3">
        {headers.map((header, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label
                  htmlFor={`template-header-name-${index}`}
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  Header Name
                </label>
                <code
                  id={`template-header-name-${index}`}
                  className="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded"
                >
                  {header.name}
                </code>
              </div>
              <div>
                <label
                  htmlFor={`template-header-value-${index}`}
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  Value
                </label>
                <code
                  id={`template-header-value-${index}`}
                  className="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded break-all"
                >
                  {header.value}
                </code>
              </div>
              <div>
                <label
                  htmlFor={`template-header-operation-${index}`}
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  Operation
                </label>
                <span
                  id={`template-header-operation-${index}`}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    header.operation === 'set'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : header.operation === 'append'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {header.operation}
                </span>
              </div>
              <div>
                <label
                  htmlFor={`template-header-target-${index}`}
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  Target
                </label>
                <span
                  id={`template-header-target-${index}`}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    header.target === 'request'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {header.target === 'request' ? '→ Request' : '← Response'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
