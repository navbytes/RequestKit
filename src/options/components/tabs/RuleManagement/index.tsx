import { useState, useEffect } from 'preact/hooks';

import { TabDescription } from '@/shared/components/TabDescription';
import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderRule } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

import { EmptyState } from './components/EmptyState';
import { RuleForm } from './components/RuleForm';
import { RuleList } from './components/RuleList';
import { useRuleForm } from './hooks/useRuleForm';
import { useRuleOperations } from './hooks/useRuleOperations';

interface RuleManagementProps {
  rules: HeaderRule[];
  onRulesUpdate: (rules: HeaderRule[]) => void;
  initialAction?: string | null;
  initialRuleId?: string | null;
  initialUrl?: string | null;
}

export function RuleManagement({
  rules,
  onRulesUpdate,
  initialAction,
  initialRuleId,
  initialUrl,
}: Readonly<RuleManagementProps>) {
  const { t } = useI18n();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<HeaderRule | null>(null);

  const {
    formData,
    headers,
    resetForm,
    updateFormData,
    updatePattern,
    addHeader,
    updateHeader,
    removeHeader,
  } = useRuleForm(editingRule, initialUrl);

  const {
    handleCreateRule,
    handleUpdateRule,
    handleDeleteRule,
    handleToggleRule,
    handleDuplicateRule,
  } = useRuleOperations(rules, onRulesUpdate);

  // Get logger for this module
  const logger = loggers.shared;

  // Handle initial edit action from URL parameters
  useEffect(() => {
    if (initialAction === 'edit' && initialRuleId && rules.length > 0) {
      logger.info('Processing edit action for rule:', initialRuleId);
      const ruleToEdit = rules.find(rule => rule.id === initialRuleId);
      if (ruleToEdit) {
        logger.info('Found rule to edit:', ruleToEdit.name);
        setEditingRule(ruleToEdit);
        setShowCreateForm(true);
      } else {
        logger.warn('Rule not found for edit:', initialRuleId);
      }
    } else if (initialAction === 'create') {
      logger.info('Processing create action');
      setShowCreateForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction, initialRuleId, rules]); // logger is stable, no need to include in deps

  const handleSave = async () => {
    const result = editingRule
      ? await handleUpdateRule(editingRule, formData, headers)
      : await handleCreateRule(formData, headers);

    if (result.success) {
      resetForm();
      setShowCreateForm(false);
      setEditingRule(null);
    } else {
      alert(result.error);
    }
  };

  const startEdit = (rule: HeaderRule) => {
    setEditingRule(rule);
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingRule(null);
    setShowCreateForm(false);
    resetForm();
  };

  const handleDelete = async (ruleId: string) => {
    await handleDeleteRule(ruleId);
  };

  const handleToggle = async (ruleId: string) => {
    await handleToggleRule(ruleId);
  };

  return (
    <div className="p-6">
      <TabDescription
        title={t('rules_management_title')}
        description={t('rules_management_description')}
        icon="settings"
        features={[
          t('rules_management_features_1'),
          t('rules_management_features_2'),
          t('rules_management_features_3'),
          t('rules_management_features_4'),
          t('rules_management_features_5'),
        ]}
        useCases={[
          t('rules_management_use_cases_1'),
          t('rules_management_use_cases_2'),
          t('rules_management_use_cases_3'),
          t('rules_management_use_cases_4'),
        ]}
      />

      {/* Create/Edit Form */}
      {showCreateForm && (
        <RuleForm
          editingRule={editingRule}
          formData={formData}
          setFormData={() => {}} // Not used directly, using updateFormData instead
          headers={headers}
          setHeaders={() => {}} // Not used directly, using header methods instead
          onSave={handleSave}
          onCancel={cancelEdit}
          updateFormData={updateFormData}
          updatePattern={updatePattern}
          addHeader={addHeader}
          updateHeader={updateHeader}
          removeHeader={removeHeader}
        />
      )}

      {/* Rules List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('rules_count', [rules.length.toString()])}
          </h3>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              {t('rules_create_new_with_plus')}
            </button>
          )}
        </div>

        {rules.length === 0 ? (
          <EmptyState onCreateRule={() => setShowCreateForm(true)} />
        ) : (
          <RuleList
            rules={rules}
            onEditRule={startEdit}
            onDeleteRule={handleDelete}
            onToggleRule={handleToggle}
            onDuplicateRule={handleDuplicateRule}
          />
        )}
      </div>
    </div>
  );
}
