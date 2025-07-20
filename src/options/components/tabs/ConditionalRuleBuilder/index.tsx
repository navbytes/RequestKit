import { useState } from 'preact/hooks';

import { STORAGE_KEYS } from '@/config/constants';
import { ConditionalRuleEngine } from '@/lib/engines';
import { TabDescription } from '@/shared/components/TabDescription';
import type {
  RuleCondition,
  ConditionalRule,
  HeaderRule,
} from '@/shared/types/rules';
import { ChromeApiUtils } from '@/shared/utils';

import { ConditionalRuleForm } from './ConditionalRuleForm';
import { ConditionalRulesList } from './ConditionalRulesList';

// Types
interface ConditionalRuleBuilderProps {
  rules: HeaderRule[];
  onRulesUpdate: (rules: HeaderRule[]) => void;
}

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

// Constants
const EQUALS_OPERATOR = 'equals';
const CONTAINS_OPERATOR = 'contains';
const REGEX_OPERATOR = 'regex';
const REGEX_MATCH_LABEL = 'Regex match';

const DEFAULT_RULE_FORM: NewConditionalRule = {
  name: '',
  domain: '',
  path: '/*',
  protocol: '*',
  headers: {},
  enabled: true,
  conditions: [],
  conditionLogic: 'AND',
};

const DEFAULT_CONDITION_FORM: Partial<RuleCondition> = {
  type: 'responseStatus',
  operator: EQUALS_OPERATOR,
  value: '',
};

// Custom Hooks
function useConditionalRuleForm(_editingRule: ConditionalRule | null) {
  const [newRule, setNewRule] = useState<NewConditionalRule>(DEFAULT_RULE_FORM);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [newCondition, setNewCondition] = useState<Partial<RuleCondition>>(
    DEFAULT_CONDITION_FORM
  );

  const resetForm = () => {
    setNewRule(DEFAULT_RULE_FORM);
    setNewHeaderKey('');
    setNewHeaderValue('');
    setNewCondition(DEFAULT_CONDITION_FORM);
  };

  const loadRuleForEditing = (rule: ConditionalRule) => {
    const headersObject = rule.headers.reduce(
      (acc, header) => {
        acc[header.name] = header.value;
        return acc;
      },
      {} as Record<string, string>
    );

    setNewRule({
      name: rule.name,
      domain: rule.pattern.domain,
      path: rule.pattern.path || '/*',
      protocol: rule.pattern.protocol || '*',
      headers: headersObject,
      enabled: rule.enabled,
      conditions: rule.conditions || [],
      conditionLogic: rule.conditionLogic || 'AND',
    });
  };

  return {
    newRule,
    setNewRule,
    newHeaderKey,
    setNewHeaderKey,
    newHeaderValue,
    setNewHeaderValue,
    newCondition,
    setNewCondition,
    resetForm,
    loadRuleForEditing,
  };
}

function useConditionalRules(rules: HeaderRule[]) {
  return rules.filter(
    rule =>
      'conditions' in rule && rule.conditions && rule.conditions.length > 0
  ) as ConditionalRule[];
}

// Utility Functions
const saveRules = async (rulesToSave: HeaderRule[]) => {
  const rulesObject = rulesToSave.reduce(
    (acc, rule) => {
      acc[rule.id] = rule;
      return acc;
    },
    {} as Record<string, HeaderRule>
  );

  await ChromeApiUtils.storage.sync.set({
    [STORAGE_KEYS.RULES]: rulesObject,
  });
};

// Main Component
export function ConditionalRuleBuilder({
  rules,
  onRulesUpdate,
}: Readonly<ConditionalRuleBuilderProps>) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<ConditionalRule | null>(null);

  const conditionalRules = useConditionalRules(rules);
  const {
    newRule,
    setNewRule,
    newHeaderKey,
    setNewHeaderKey,
    newHeaderValue,
    setNewHeaderValue,
    newCondition,
    setNewCondition,
    resetForm,
    loadRuleForEditing,
  } = useConditionalRuleForm(editingRule);

  const handleCreateRule = async () => {
    if (!newRule.name || !newRule.domain) return;

    // Convert headers object to HeaderEntry array
    const headerEntries = Object.entries(newRule.headers).map(
      ([name, value]) => ({
        name,
        value,
        operation: 'set' as const,
        target: 'request' as const,
      })
    );

    let updatedRules: HeaderRule[];

    if (editingRule) {
      // Update existing rule
      const updatedRule: ConditionalRule = {
        ...editingRule,
        name: newRule.name,
        enabled: newRule.enabled,
        pattern: {
          protocol: newRule.protocol,
          domain: newRule.domain,
          path: newRule.path,
        },
        headers: headerEntries,
        conditions: newRule.conditions,
        conditionLogic: newRule.conditionLogic,
        updatedAt: new Date(),
      };

      updatedRules = rules.map(rule =>
        rule.id === editingRule.id ? updatedRule : rule
      );
    } else {
      // Create new conditional rule
      const rule: ConditionalRule = {
        id: `conditional_rule_${Date.now()}`,
        name: newRule.name,
        enabled: newRule.enabled,
        pattern: {
          protocol: newRule.protocol,
          domain: newRule.domain,
          path: newRule.path,
        },
        headers: headerEntries,
        conditions: newRule.conditions,
        conditionLogic: newRule.conditionLogic,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      updatedRules = [...rules, rule];
    }

    await saveRules(updatedRules);
    onRulesUpdate(updatedRules);

    // Reset form
    resetForm();
    setEditingRule(null);
    setShowCreateForm(false);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this conditional rule?'))
      return;

    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    await saveRules(updatedRules);
    onRulesUpdate(updatedRules);
  };

  const handleToggleRule = async (ruleId: string) => {
    const updatedRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    await saveRules(updatedRules);
    onRulesUpdate(updatedRules);
  };

  const addHeader = () => {
    if (!newHeaderKey || !newHeaderValue) return;

    setNewRule(prev => ({
      ...prev,
      headers: {
        ...prev.headers,
        [newHeaderKey]: newHeaderValue,
      },
    }));
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const removeHeader = (key: string) => {
    setNewRule(prev => {
      const headers = { ...prev.headers };
      delete headers[key];
      return { ...prev, headers };
    });
  };

  const addCondition = () => {
    if (
      !newCondition.type ||
      !newCondition.operator ||
      newCondition.value === ''
    )
      return;

    const condition: RuleCondition = {
      type: newCondition.type,
      operator: newCondition.operator,
      value: newCondition.value as string | number,
      ...(newCondition.negate !== undefined && { negate: newCondition.negate }),
      ...(newCondition.caseSensitive !== undefined && {
        caseSensitive: newCondition.caseSensitive,
      }),
    };

    // Validate condition
    const validation = ConditionalRuleEngine.validateCondition(condition);
    if (!validation.isValid) {
      alert(`Invalid condition: ${validation.errors.join(', ')}`);
      return;
    }

    setNewRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, condition],
    }));

    // Reset condition form
    setNewCondition({
      type: 'responseStatus',
      operator: EQUALS_OPERATOR,
      value: '' as string | number,
    });
  };

  const removeCondition = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const getConditionTypeOptions = () => [
    { value: 'responseStatus', label: 'Response Status Code' },
    { value: 'requestMethod', label: 'Request Method' },
    { value: 'userAgent', label: 'User Agent' },
    { value: 'cookie', label: 'Cookie' },
    { value: 'time', label: 'Time/Schedule' },
    { value: 'header', label: 'Request Header' },
    { value: 'url', label: 'URL Pattern' },
  ];

  const getOperatorOptions = (type: string) => {
    const operatorMap: Record<
      string,
      Array<{ value: string; label: string }>
    > = {
      responseStatus: [
        { value: EQUALS_OPERATOR, label: 'Equals' },
        { value: 'greater', label: 'Greater than' },
        { value: 'less', label: 'Less than' },
        { value: CONTAINS_OPERATOR, label: 'Contains' },
        { value: REGEX_OPERATOR, label: REGEX_MATCH_LABEL },
      ],
      requestMethod: [
        { value: EQUALS_OPERATOR, label: 'Equals' },
        { value: CONTAINS_OPERATOR, label: 'Contains' },
        { value: REGEX_OPERATOR, label: REGEX_MATCH_LABEL },
      ],
      userAgent: [
        { value: EQUALS_OPERATOR, label: 'Equals' },
        { value: CONTAINS_OPERATOR, label: 'Contains' },
        { value: REGEX_OPERATOR, label: REGEX_MATCH_LABEL },
      ],
      cookie: [
        { value: 'exists', label: 'Exists' },
        { value: EQUALS_OPERATOR, label: 'Equals' },
        { value: CONTAINS_OPERATOR, label: 'Contains' },
        { value: REGEX_OPERATOR, label: REGEX_MATCH_LABEL },
      ],
      time: [{ value: EQUALS_OPERATOR, label: 'In range' }],
      header: [
        { value: 'exists', label: 'Exists' },
        { value: EQUALS_OPERATOR, label: 'Equals' },
        { value: CONTAINS_OPERATOR, label: 'Contains' },
        { value: REGEX_OPERATOR, label: REGEX_MATCH_LABEL },
      ],
      url: [
        { value: EQUALS_OPERATOR, label: 'Equals' },
        { value: CONTAINS_OPERATOR, label: 'Contains' },
        { value: REGEX_OPERATOR, label: REGEX_MATCH_LABEL },
      ],
    };

    return operatorMap[type] || [];
  };

  const getValuePlaceholder = (type: string, operator: string) => {
    const placeholders: Record<string, Record<string, string>> = {
      responseStatus: {
        [EQUALS_OPERATOR]: '200',
        greater: '299',
        less: '400',
        contains: '20',
        regex: '^2\\d{2}$',
      },
      requestMethod: {
        [EQUALS_OPERATOR]: 'POST',
        contains: 'GET',
        regex: '^(GET|POST)$',
      },
      userAgent: {
        [EQUALS_OPERATOR]: 'Mozilla/5.0...',
        contains: 'Chrome',
        regex: '.*Chrome.*',
      },
      cookie: {
        exists: 'sessionId',
        [EQUALS_OPERATOR]: 'sessionId=abc123',
        contains: 'sessionId=abc',
        regex: 'sessionId=\\w+',
      },
      time: {
        [EQUALS_OPERATOR]: '09:00-17:00 or weekday:1-5 or hour:9-17',
      },
      header: {
        exists: 'Authorization',
        [EQUALS_OPERATOR]: 'Authorization=Bearer token',
        contains: 'Authorization=Bearer',
        regex: 'Authorization=Bearer \\w+',
      },
      url: {
        [EQUALS_OPERATOR]: 'https://api.example.com/users',
        contains: '/api/',
        regex: '\\/api\\/v\\d+\\/',
      },
    };

    return placeholders[type]?.[operator] || 'Enter value...';
  };

  const formatCondition = (condition: RuleCondition) => {
    const typeLabels: Record<string, string> = {
      responseStatus: 'Status',
      requestMethod: 'Method',
      userAgent: 'User Agent',
      cookie: 'Cookie',
      time: 'Time',
      header: 'Header',
      url: 'URL',
    };

    const operatorLabels: Record<string, string> = {
      [EQUALS_OPERATOR]: '=',
      greater: '>',
      less: '<',
      contains: CONTAINS_OPERATOR,
      regex: 'matches',
      exists: 'exists',
    };

    const type = typeLabels[condition.type] || condition.type;
    const operator = operatorLabels[condition.operator] || condition.operator;
    const negate = condition.negate ? 'NOT ' : '';

    return `${negate}${type} ${operator} "${condition.value}"`;
  };

  const handleEditRule = (rule: ConditionalRule) => {
    loadRuleForEditing(rule);
    setEditingRule(rule);
    setShowCreateForm(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setEditingRule(null);
    setShowCreateForm(false);
  };

  return (
    <div className="p-6">
      <TabDescription
        title="Conditional Rules"
        description="Create advanced rules that apply headers only when specific conditions are met. Use conditions based on response status, request method, user agent, cookies, time, and more to create intelligent, context-aware header injection."
        icon="git-branch"
        features={[
          'Multiple condition types (status, method, headers, etc.)',
          'AND/OR logic for combining conditions',
          'Negation and case-sensitive matching',
          'Time-based and schedule conditions',
          'Cookie and header value matching',
        ]}
        useCases={[
          'Apply headers only for successful responses',
          'Different headers for different request methods',
          'Time-based header injection',
          'User agent specific modifications',
          'Cookie-based conditional logic',
        ]}
      />

      {/* Create Conditional Rule Form */}
      {showCreateForm && (
        <ConditionalRuleForm
          editingRule={editingRule}
          newRule={newRule}
          setNewRule={setNewRule}
          newHeaderKey={newHeaderKey}
          setNewHeaderKey={setNewHeaderKey}
          newHeaderValue={newHeaderValue}
          setNewHeaderValue={setNewHeaderValue}
          newCondition={newCondition}
          setNewCondition={setNewCondition}
          onCreateRule={handleCreateRule}
          onCancel={handleCancelForm}
          addHeader={addHeader}
          removeHeader={removeHeader}
          addCondition={addCondition}
          removeCondition={removeCondition}
          getConditionTypeOptions={getConditionTypeOptions}
          getOperatorOptions={getOperatorOptions}
          getValuePlaceholder={getValuePlaceholder}
          formatCondition={formatCondition}
        />
      )}

      <ConditionalRulesList
        conditionalRules={conditionalRules}
        onToggleRule={handleToggleRule}
        onEditRule={handleEditRule}
        onDeleteRule={handleDeleteRule}
        onCreateNew={() => setShowCreateForm(true)}
        formatCondition={formatCondition}
      />
    </div>
  );
}
