import type { HeaderRule } from '@/shared/types/rules';

import type { RuleFormData, NewHeaderEntry } from '../utils/ruleValidation';

import { HeadersSection } from './HeadersSection';
import { URLPatternSection } from './URLPatternSection';

interface RuleFormProps {
  editingRule: HeaderRule | null;
  formData: RuleFormData;
  setFormData: (data: RuleFormData) => void;
  headers: NewHeaderEntry[];
  setHeaders: (headers: NewHeaderEntry[]) => void;
  onSave: () => void;
  onCancel: () => void;
  updateFormData: (updates: Partial<RuleFormData>) => void;
  updatePattern: (updates: Partial<RuleFormData['pattern']>) => void;
  addHeader: () => void;
  updateHeader: (
    index: number,
    field: keyof NewHeaderEntry,
    value: string
  ) => void;
  removeHeader: (index: number) => void;
}

export function RuleForm({
  editingRule,
  formData,
  headers,
  onSave,
  onCancel,
  updateFormData,
  updatePattern,
  addHeader,
  updateHeader,
  removeHeader,
}: RuleFormProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {editingRule ? `Edit Rule: ${editingRule.name}` : 'Create New Rule'}
      </h3>

      {/* Basic Rule Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="rule-name" className="form-label">
            Rule Name *
          </label>
          <input
            id="rule-name"
            type="text"
            className="input"
            value={formData.name}
            onInput={e => updateFormData({ name: e.currentTarget.value })}
            placeholder="My Custom Rule"
          />
        </div>
        <div>
          <label htmlFor="rule-priority" className="form-label">
            Priority
          </label>
          <input
            id="rule-priority"
            type="number"
            className="input"
            value={formData.priority}
            onInput={e =>
              updateFormData({
                priority: parseInt(e.currentTarget.value) || 1,
              })
            }
            min="1"
            max="100"
          />
        </div>
      </div>

      {/* URL Pattern */}
      <URLPatternSection
        pattern={formData.pattern}
        onPatternChange={updatePattern}
      />

      {/* Headers */}
      <HeadersSection
        headers={headers}
        onAddHeader={addHeader}
        onUpdateHeader={updateHeader}
        onRemoveHeader={removeHeader}
      />

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="rule-description" className="form-label">
          Description (Optional)
        </label>
        <textarea
          id="rule-description"
          className="input"
          rows={2}
          value={formData.description}
          onInput={e => updateFormData({ description: e.currentTarget.value })}
          placeholder="Describe what this rule does..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.enabled}
            onChange={e => updateFormData({ enabled: e.currentTarget.checked })}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Enable rule immediately
          </span>
        </label>
        <div className="space-x-2">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="btn btn-primary"
            disabled={!formData.name || !formData.pattern.domain}
          >
            {editingRule ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}
