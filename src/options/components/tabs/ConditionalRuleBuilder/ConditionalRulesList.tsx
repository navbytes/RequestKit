import { Icon } from '@/shared/components/Icon';
import type { ConditionalRule, RuleCondition } from '@/shared/types/rules';

interface ConditionalRulesListProps {
  conditionalRules: ConditionalRule[];
  onToggleRule: (ruleId: string) => void;
  onEditRule: (rule: ConditionalRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onCreateNew: () => void;
  formatCondition: (condition: RuleCondition) => string;
}

export function ConditionalRulesList({
  conditionalRules,
  onToggleRule,
  onEditRule,
  onDeleteRule,
  onCreateNew,
  formatCondition,
}: Readonly<ConditionalRulesListProps>) {
  return (
    <div className="space-y-4">
      {conditionalRules.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {conditionalRules.length} conditional rule
            {conditionalRules.length !== 1 ? 's' : ''} configured
          </p>
          <button onClick={onCreateNew} className="btn btn-primary btn-sm">
            + Add Conditional Rule
          </button>
        </div>
      )}

      {conditionalRules.length === 0 ? (
        <EmptyState onCreateNew={onCreateNew} />
      ) : (
        conditionalRules.map(rule => (
          <ConditionalRuleCard
            key={rule.id}
            rule={rule}
            onToggleRule={onToggleRule}
            onEditRule={onEditRule}
            onDeleteRule={onDeleteRule}
            formatCondition={formatCondition}
          />
        ))
      )}
    </div>
  );
}

interface EmptyStateProps {
  readonly onCreateNew: () => void;
}

function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-12">
      <Icon name="git-branch" size={60} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No conditional rules configured
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Create rules that apply only when specific conditions are met
      </p>
      <button onClick={onCreateNew} className="btn btn-primary">
        Create Your First Conditional Rule
      </button>
    </div>
  );
}

interface ConditionalRuleCardProps {
  readonly rule: ConditionalRule;
  readonly onToggleRule: (ruleId: string) => void;
  readonly onEditRule: (rule: ConditionalRule) => void;
  readonly onDeleteRule: (ruleId: string) => void;
  readonly formatCondition: (condition: RuleCondition) => string;
}

function ConditionalRuleCard({
  rule,
  onToggleRule,
  onEditRule,
  onDeleteRule,
  formatCondition,
}: ConditionalRuleCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggleRule(rule.id)}
            className={`toggle ${rule.enabled ? 'toggle-checked' : 'toggle-unchecked'}`}
          >
            <span
              className={`toggle-thumb ${rule.enabled ? 'toggle-thumb-checked' : 'toggle-thumb-unchecked'}`}
            />
          </button>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {rule.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {rule.pattern.protocol || '*'}://{rule.pattern.domain}
              {rule.pattern.path || ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEditRule(rule)}
            className="btn btn-sm btn-secondary"
          >
            Edit
          </button>
          <button
            onClick={() => onDeleteRule(rule.id)}
            className="btn btn-sm bg-error-600 text-white hover:bg-error-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <div className="mb-2">
          <strong>Conditions ({rule.conditionLogic}):</strong>
          <div className="mt-1 space-y-1">
            {rule.conditions?.map(condition => (
              <div
                key={condition.value}
                className="font-mono text-xs bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-2 rounded"
              >
                {formatCondition(condition)}
              </div>
            ))}
          </div>
        </div>
        <div>
          <strong>Headers:</strong> {rule.headers.length} configured
          {rule.headers.length > 0 && (
            <div className="mt-1 space-y-1">
              {rule.headers.map(header => (
                <div
                  key={header.name}
                  className="font-mono text-xs bg-gray-100 dark:bg-gray-600 p-1 rounded"
                >
                  {header.name}: {header.value} ({header.operation})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
