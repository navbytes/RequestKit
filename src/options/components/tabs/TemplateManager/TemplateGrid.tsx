import { TemplateCard } from '@/shared/components/templates';
import { EmptyState } from '@/shared/components/ui';
import type { RuleTemplate } from '@/shared/types/templates';

interface TemplateGridProps {
  templates: RuleTemplate[];
  searchQuery: string;
  onView: (template: RuleTemplate) => void;
  onApply?: ((template: RuleTemplate) => void | Promise<void>) | undefined;
  onEdit: (template: RuleTemplate) => void;
  onDelete: (templateId: string) => void;
  onClone: (template: RuleTemplate) => void;
  onExport: (template: RuleTemplate) => void;
  isApplying?: string | null;
}

export function TemplateGrid({
  templates,
  searchQuery,
  onView,
  onApply,
  onEdit,
  onDelete,
  onClone,
  onExport,
  isApplying,
}: Readonly<TemplateGridProps>) {
  if (templates.length === 0) {
    return (
      <EmptyState
        icon="file-text"
        title="No templates found"
        description={
          searchQuery
            ? 'Try a different search term or filter'
            : 'Create your first template to get started'
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onView={() => onView(template)}
          onExport={() => onExport(template)}
          isApplying={isApplying === template.id}
          {...(onApply && { onApply: () => onApply(template) })}
          {...(template.isBuiltIn
            ? { onClone: () => onClone(template) }
            : {
                onEdit: () => onEdit(template),
                onDelete: () => onDelete(template.id),
              })}
        />
      ))}
    </div>
  );
}
