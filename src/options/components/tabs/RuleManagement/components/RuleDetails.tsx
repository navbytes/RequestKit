import type { HeaderRule } from '@/shared/types/rules';

interface RuleDetailsProps {
  rule: HeaderRule;
}

export function RuleDetails({ rule }: RuleDetailsProps) {
  return (
    <>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        <p>
          <strong>Headers:</strong> {rule.headers.length} configured
        </p>
        <p>
          <strong>Priority:</strong> {rule.priority}
        </p>
        {rule.description && (
          <p>
            <strong>Description:</strong> {rule.description}
          </p>
        )}
      </div>

      {rule.headers.length > 0 && (
        <div className="space-y-1">
          {rule.headers.map((header, index) => (
            <div
              key={index}
              className="font-mono text-xs bg-blue-100 dark:bg-blue-900 p-1 rounded"
            >
              <span className="text-blue-600 dark:text-blue-400">
                {header.target}
              </span>
              {' → '}
              <span className="text-green-600 dark:text-green-400">
                {header.operation}
              </span>{' '}
              <span className="text-purple-600 dark:text-purple-400">
                {header.name}
              </span>
              {header.operation !== 'remove' && (
                <>
                  {': '}
                  <span className="text-orange-600 dark:text-orange-400">
                    {header.value.length > 30
                      ? `${header.value.substring(0, 30)}...`
                      : header.value}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
