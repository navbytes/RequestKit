import type { RuleCondition, ConditionalRule } from '@/shared/types/rules';

// Types
interface NewConditionalRule {
  name: string;
  domain: string;
  path: string;
  protocol: string;
  headers: Record<string, string>;
  enabled: boolean;
  conditions: RuleCondition[];
  conditionLogic: 'AND' | 'OR';
}

interface ConditionalRuleFormProps {
  editingRule: ConditionalRule | null;
  newRule: NewConditionalRule;
  setNewRule: (
    rule:
      | NewConditionalRule
      | ((prev: NewConditionalRule) => NewConditionalRule)
  ) => void;
  newHeaderKey: string;
  setNewHeaderKey: (key: string) => void;
  newHeaderValue: string;
  setNewHeaderValue: (value: string) => void;
  newCondition: Partial<RuleCondition>;
  setNewCondition: (
    condition:
      | Partial<RuleCondition>
      | ((prev: Partial<RuleCondition>) => Partial<RuleCondition>)
  ) => void;
  onCreateRule: () => void;
  onCancel: () => void;
  addHeader: () => void;
  removeHeader: (key: string) => void;
  addCondition: () => void;
  removeCondition: (index: number) => void;
  getConditionTypeOptions: () => Array<{ value: string; label: string }>;
  getOperatorOptions: (type: string) => Array<{ value: string; label: string }>;
  getValuePlaceholder: (type: string, operator: string) => string;
  formatCondition: (condition: RuleCondition) => string;
}

export function ConditionalRuleForm({
  editingRule,
  newRule,
  setNewRule,
  newHeaderKey,
  setNewHeaderKey,
  newHeaderValue,
  setNewHeaderValue,
  newCondition,
  setNewCondition,
  onCreateRule,
  onCancel,
  addHeader,
  removeHeader,
  addCondition,
  removeCondition,
  getConditionTypeOptions,
  getOperatorOptions,
  getValuePlaceholder,
  formatCondition,
}: ConditionalRuleFormProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {editingRule ? 'Edit Conditional Rule' : 'Create New Conditional Rule'}
      </h3>

      {/* Basic Rule Info */}
      <BasicRuleInfo newRule={newRule} setNewRule={setNewRule} />

      {/* Conditions Section */}
      <ConditionsSection
        newRule={newRule}
        setNewRule={setNewRule}
        newCondition={newCondition}
        setNewCondition={setNewCondition}
        addCondition={addCondition}
        removeCondition={removeCondition}
        getConditionTypeOptions={getConditionTypeOptions}
        getOperatorOptions={getOperatorOptions}
        getValuePlaceholder={getValuePlaceholder}
        formatCondition={formatCondition}
      />

      {/* Headers Section */}
      <HeadersSection
        newRule={newRule}
        newHeaderKey={newHeaderKey}
        setNewHeaderKey={setNewHeaderKey}
        newHeaderValue={newHeaderValue}
        setNewHeaderValue={setNewHeaderValue}
        addHeader={addHeader}
        removeHeader={removeHeader}
      />

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={newRule.enabled}
            onChange={e =>
              setNewRule(prev => ({
                ...prev,
                enabled: e.currentTarget.checked,
              }))
            }
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
            onClick={onCreateRule}
            className="btn btn-primary"
            disabled={
              !newRule.name ||
              !newRule.domain ||
              newRule.conditions.length === 0
            }
          >
            {editingRule ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface BasicRuleInfoProps {
  newRule: NewConditionalRule;
  setNewRule: (
    rule:
      | NewConditionalRule
      | ((prev: NewConditionalRule) => NewConditionalRule)
  ) => void;
}

function BasicRuleInfo({ newRule, setNewRule }: BasicRuleInfoProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="rule-name-input" className="form-label">Rule Name</label>
          <input
            type="text"
            id="rule-name-input"
            className="input"
            value={newRule.name}
            onInput={e =>
              setNewRule(prev => ({ ...prev, name: e.currentTarget.value }))
            }
            placeholder="e.g., API Rate Limiting"
          />
        </div>
        <div>
          <label htmlFor="protocol-select" className="form-label">Protocol</label>
          <select
            id="protocol-select"
            className="input"
            value={newRule.protocol}
            onChange={e =>
              setNewRule(prev => ({
                ...prev,
                protocol: e.currentTarget.value,
              }))
            }
          >
            <option value="*">Any Protocol</option>
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="domain-input" className="form-label">Domain</label>
          <input
            type="text"
            id="domain-input"
            className="input"
            value={newRule.domain}
            onInput={e =>
              setNewRule(prev => ({
                ...prev,
                domain: e.currentTarget.value,
              }))
            }
            placeholder="e.g., api.example.com"
          />
        </div>
        <div>
          <label htmlFor="path-input" className="form-label">Path</label>
          <input
            type="text"
            id="path-input"
            className="input"
            value={newRule.path}
            onInput={e =>
              setNewRule(prev => ({ ...prev, path: e.currentTarget.value }))
            }
            placeholder="e.g., /api/*"
          />
        </div>
      </div>
    </>
  );
}

interface ConditionsSectionProps {
  newRule: NewConditionalRule;
  setNewRule: (
    rule:
      | NewConditionalRule
      | ((prev: NewConditionalRule) => NewConditionalRule)
  ) => void;
  newCondition: Partial<RuleCondition>;
  setNewCondition: (
    condition:
      | Partial<RuleCondition>
      | ((prev: Partial<RuleCondition>) => Partial<RuleCondition>)
  ) => void;
  addCondition: () => void;
  removeCondition: (index: number) => void;
  getConditionTypeOptions: () => Array<{ value: string; label: string }>;
  getOperatorOptions: (type: string) => Array<{ value: string; label: string }>;
  getValuePlaceholder: (type: string, operator: string) => string;
  formatCondition: (condition: RuleCondition) => string;
}

function ConditionsSection({
  newRule,
  setNewRule,
  newCondition,
  setNewCondition,
  addCondition,
  removeCondition,
  getConditionTypeOptions,
  getOperatorOptions,
  getValuePlaceholder,
  formatCondition,
}: ConditionsSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <label htmlFor="conditions-section" className="form-label">Conditions</label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Logic:
          </span>
          <select
            className="input w-20"
            value={newRule.conditionLogic}
            onChange={e =>
              setNewRule(prev => ({
                ...prev,
                conditionLogic: e.currentTarget.value as 'AND' | 'OR',
              }))
            }
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
      </div>

      {/* Existing Conditions */}
      {newRule.conditions.length > 0 && (
        <div className="space-y-2 mb-4">
          {newRule.conditions.map((condition, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white dark:bg-gray-600 p-3 rounded border"
            >
              <span className="font-mono text-sm">
                {formatCondition(condition)}
              </span>
              <button
                onClick={() => removeCondition(index)}
                className="btn btn-sm bg-error-600 text-white hover:bg-error-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Condition */}
      <div className="bg-white dark:bg-gray-600 p-4 rounded border">
        <h4 className="font-medium mb-3">Add Condition</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label htmlFor="condition-type-select" className="form-label text-xs">Type</label>
            <select
              id="condition-type-select"
              className="input"
              value={newCondition.type}
              onChange={e =>
                setNewCondition(prev => ({
                  ...prev,
                  type: e.currentTarget.value as RuleCondition['type'],
                  operator: 'equals',
                  value: '',
                }))
              }
            >
              {getConditionTypeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="condition-operator-select" className="form-label text-xs">Operator</label>
            <select
              id="condition-operator-select"
              className="input"
              value={newCondition.operator}
              onChange={e =>
                setNewCondition(prev => ({
                  ...prev,
                  operator: e.currentTarget.value as RuleCondition['operator'],
                }))
              }
            >
              {getOperatorOptions(newCondition.type || '').map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="condition-value-input" className="form-label text-xs">Value</label>
            <input
              type="text"
              id="condition-value-input"
              className="input"
              value={newCondition.value}
              onInput={e =>
                setNewCondition(prev => ({
                  ...prev,
                  value: e.currentTarget.value,
                }))
              }
              placeholder={getValuePlaceholder(
                newCondition.type || '',
                newCondition.operator || ''
              )}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addCondition}
              className="btn btn-sm btn-secondary w-full"
              disabled={
                !newCondition.type ||
                !newCondition.operator ||
                newCondition.value === ''
              }
            >
              Add
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={newCondition.negate || false}
              onChange={e =>
                setNewCondition(prev => ({
                  ...prev,
                  negate: e.currentTarget.checked,
                }))
              }
            />
            <span>Negate (NOT)</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={newCondition.caseSensitive || false}
              onChange={e =>
                setNewCondition(prev => ({
                  ...prev,
                  caseSensitive: e.currentTarget.checked,
                }))
              }
            />
            <span>Case sensitive</span>
          </label>
        </div>
      </div>
    </div>
  );
}

interface HeadersSectionProps {
  newRule: NewConditionalRule;
  newHeaderKey: string;
  setNewHeaderKey: (key: string) => void;
  newHeaderValue: string;
  setNewHeaderValue: (value: string) => void;
  addHeader: () => void;
  removeHeader: (key: string) => void;
}

function HeadersSection({
  newRule,
  newHeaderKey,
  setNewHeaderKey,
  newHeaderValue,
  setNewHeaderValue,
  addHeader,
  removeHeader,
}: HeadersSectionProps) {
  return (
    <div className="mb-6">
      <label htmlFor="headers-section" className="form-label">Headers to Apply</label>
      <div className="space-y-2">
        {Object.entries(newRule.headers).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <input type="text" className="input flex-1" value={key} readOnly />
            <input
              type="text"
              className="input flex-1"
              value={value}
              readOnly
            />
            <button
              onClick={() => removeHeader(key)}
              className="btn btn-sm bg-error-600 text-white hover:bg-error-700"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="input flex-1"
            value={newHeaderKey}
            onInput={e => setNewHeaderKey(e.currentTarget.value)}
            placeholder="Header name"
          />
          <input
            type="text"
            className="input flex-1"
            value={newHeaderValue}
            onInput={e => setNewHeaderValue(e.currentTarget.value)}
            placeholder="Header value"
          />
          <button
            onClick={addHeader}
            className="btn btn-sm btn-secondary"
            disabled={!newHeaderKey || !newHeaderValue}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
