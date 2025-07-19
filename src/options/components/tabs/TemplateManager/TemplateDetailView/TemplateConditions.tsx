interface TemplateCondition {
  type: string;
  operator: string;
  value: string | number;
  negate?: boolean;
}

interface TemplateConditionsProps {
  conditions: TemplateCondition[];
}

export function TemplateConditions({ conditions }: TemplateConditionsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Conditions ({conditions.length})
      </h3>
      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <div
            key={index}
            className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                {condition.type}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                {condition.operator}
              </span>
              <code className="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded">
                {condition.value}
              </code>
              {condition.negate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  negated
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
