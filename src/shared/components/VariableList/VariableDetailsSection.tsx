import { Variable, VariableScope } from '@/shared/types';

export const VariableDetailsSection = ({
  variable,
  getAssociationDisplay,
}: {
  variable: Variable;
  getAssociationDisplay: (variable: Variable) => string;
}) => (
  <div>
    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
      Details
    </h4>
    <div className="space-y-2 text-sm">
      {variable.description && (
        <div>
          <span className="text-gray-500 dark:text-gray-400">Description:</span>
          <p className="text-gray-900 dark:text-white mt-1">
            {variable.description}
          </p>
        </div>
      )}

      <div>
        <span className="text-gray-500 dark:text-gray-400">Full Value:</span>
        <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono break-all">
          {variable.isSecret ? '••••••••••••••••' : variable.value}
        </code>
      </div>

      {variable.tags && variable.tags.length > 0 && (
        <div>
          <span className="text-gray-500 dark:text-gray-400">Tags:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {variable.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Association Information */}
      {(variable.scope === VariableScope.PROFILE ||
        variable.scope === VariableScope.RULE) && (
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            {variable.scope === VariableScope.PROFILE ? 'Profile:' : 'Rule:'}
          </span>
          <span className="ml-2 text-gray-900 dark:text-white">
            {getAssociationDisplay(variable)}
          </span>
          {variable.profileId && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ID: {variable.profileId}
            </div>
          )}
          {variable.ruleId && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ID: {variable.ruleId}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
