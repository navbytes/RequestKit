import { TemplateCard } from '@/shared/components/templates';
import { EmptyState } from '@/shared/components/ui';
import { useI18n } from '@/shared/hooks/useI18n';
import type { RuleTemplate } from '@/shared/types/templates';

interface TemplatesListProps {
  templates: RuleTemplate[];
  searchQuery: string;
  isApplying: string | null;
  onApplyTemplate: (template: RuleTemplate) => void;
}

export function TemplatesList({
  templates,
  searchQuery,
  isApplying,
  onApplyTemplate,
}: Readonly<TemplatesListProps>) {
  const { t } = useI18n();

  return (
    <div className="flex-1 overflow-y-auto max-h-96">
      {templates.length === 0 ? (
        <EmptyState
          icon="file-text"
          title={t('message_no_templates_found')}
          description={
            searchQuery.trim()
              ? t('templates_try_different_search')
              : t('templates_no_templates_in_category')
          }
          className="py-8 px-4"
        />
      ) : (
        <div className="p-4 space-y-3">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={() => onApplyTemplate(template)}
              isApplying={isApplying === template.id}
              compact={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
