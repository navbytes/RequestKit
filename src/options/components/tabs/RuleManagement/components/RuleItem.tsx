import type { HeaderRule } from '@/shared/types/rules';

import { RuleDetails } from './RuleDetails';

interface RuleItemProps {
  rule: HeaderRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
}

export function RuleItem({
  rule,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate,
}: RuleItemProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggle}
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
              {rule.pattern.protocol}://{rule.pattern.domain}
              {rule.pattern.path}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onEdit} className="btn btn-sm btn-secondary">
            Edit
          </button>
          <button onClick={onDuplicate} className="btn btn-sm btn-secondary">
            Duplicate
          </button>
          <button
            onClick={onDelete}
            className="btn btn-sm bg-error-600 text-white hover:bg-error-700"
          >
            Delete
          </button>
        </div>
      </div>

      <RuleDetails rule={rule} />
    </div>
  );
}
