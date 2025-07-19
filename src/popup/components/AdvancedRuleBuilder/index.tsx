import { Icon } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderRule } from '@/shared/types/rules';

import { BasicRuleInfo } from './BasicRuleInfo';
import { HeadersSection } from './HeadersSection';
import { useAdvancedRuleBuilder } from './hooks/useAdvancedRuleBuilder';
import { ResourceTypesSection } from './ResourceTypesSection';
import { RuleOptionsSection } from './RuleOptionsSection';
import { URLPatternSection } from './URLPatternSection';

interface AdvancedRuleBuilderProps {
  currentUrl?: string;
  onRuleCreated: (rule: HeaderRule) => void;
  onCancel: () => void;
  initialRule?: Partial<HeaderRule>;
}

export function AdvancedRuleBuilder({
  currentUrl,
  onRuleCreated,
  onCancel,
  initialRule,
}: Readonly<AdvancedRuleBuilderProps>) {
  const { t } = useI18n();
  const {
    formData,
    profiles,
    isSubmitting,
    updateFormData,
    addHeader,
    removeHeader,
    updateHeader,
    toggleResourceType,
    handleSubmit,
  } = useAdvancedRuleBuilder(currentUrl, initialRule, onRuleCreated);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {initialRule ? t('popup_edit_rule') : t('popup_create_advanced_rule')}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title={t('popup_cancel')}
        >
          <Icon name="close" className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <BasicRuleInfo
          formData={formData}
          profiles={profiles}
          onUpdate={updateFormData}
        />

        {/* URL Pattern */}
        <URLPatternSection formData={formData} onUpdate={updateFormData} />

        {/* Resource Types */}
        <ResourceTypesSection
          resourceTypes={formData.resourceTypes}
          onToggle={toggleResourceType}
        />

        {/* Headers */}
        <HeadersSection
          headers={formData.headers}
          onAdd={addHeader}
          onRemove={removeHeader}
          onUpdate={updateHeader}
        />

        {/* Options */}
        <RuleOptionsSection
          enabled={formData.enabled}
          onUpdate={updateFormData}
        />

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.ruleName.trim() ||
              !formData.domain.trim()
            }
            className="flex-1 btn btn-primary"
          >
            {isSubmitting
              ? `${t('ui_button_save')}...`
              : initialRule
                ? t('ui_button_update')
                : t('ui_button_create')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn btn-secondary"
          >
            {t('ui_button_cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
