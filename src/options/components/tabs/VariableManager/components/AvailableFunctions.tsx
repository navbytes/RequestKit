import { VariableResolver } from '@/lib/core/variable-resolver';
import { Icon } from '@/shared/components/Icon';
import { Card } from '@/shared/components/ui';

export function AvailableFunctions() {
  const functions = VariableResolver.getAvailableFunctions();

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Icon name="code" className="text-indigo-500" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Available Functions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built-in functions you can use in variable values
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {functions.map(func => (
          <div
            key={func.name}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <div className="flex items-center space-x-2 mb-2">
              <code className="text-sm font-mono bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                ${func.name}
              </code>
              {func.parameters.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({func.parameters.length} params)
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {func.description}
            </p>
            {func.parameters.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Parameters:
                </p>
                {func.parameters.map(param => (
                  <div
                    key={param.name}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    <code className="font-mono">{param.name}</code>
                    <span className="text-gray-500"> ({param.type})</span>
                    {param.required && <span className="text-red-500"> *</span>}
                    {param.description && (
                      <span className="ml-1">- {param.description}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Usage:</strong>{' '}
                {func.parameters.length > 0 ? (
                  <code className="font-mono">
                    ${func.name}({func.parameters.map(p => p.name).join(', ')})
                  </code>
                ) : (
                  <span>
                    <code className="font-mono">${func.name}</code> or{' '}
                    <code className="font-mono">${func.name}()</code>
                  </span>
                )}
              </p>
              {func.parameters.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  <em>
                    Note: Functions with parameters require parentheses syntax
                  </em>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
