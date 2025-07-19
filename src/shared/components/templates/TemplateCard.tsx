import { Icon } from '@/shared/components/Icon';
import { Card, Badge, Button } from '@/shared/components/ui';
import { useI18n } from '@/shared/hooks/useI18n';
import type { RuleTemplate } from '@/shared/types/templates';
import { TEMPLATE_CATEGORIES } from '@/shared/types/templates';

interface TemplateCardProps {
  template: RuleTemplate;
  onView?: () => void;
  onApply?: () => void;
  onEdit?: () => void;
  onClone?: () => void;
  onExport?: () => void;
  onDelete?: () => void | Promise<void>;
  isApplying?: boolean;
  compact?: boolean;
}

export function TemplateCard({
  template,
  onView,
  onApply,
  onEdit,
  onClone,
  onExport,
  onDelete,
  isApplying = false,
  compact = false,
}: Readonly<TemplateCardProps>) {
  const { t } = useI18n();
  const getTemplateFeaturesSummary = (template: RuleTemplate) => {
    const features = [];
    if (template.headers?.length)
      features.push(
        t('templates_features_headers', [template.headers.length.toString()])
      );
    if (template.fileInterceptions?.length)
      features.push(
        t('templates_features_file_rules', [
          template.fileInterceptions.length.toString(),
        ])
      );
    if (template.conditions?.length)
      features.push(
        t('templates_features_conditions', [
          template.conditions.length.toString(),
        ])
      );
    if (template.schedule) features.push(t('templates_features_scheduled'));
    if (template.limits) features.push(t('templates_features_rate_limited'));
    return features.join(', ') || t('templates_features_none');
  };

  const getTemplateTypeIcon = (templateType: string) => {
    switch (templateType) {
      case 'headers':
        return 'file-text';
      case 'conditional':
        return 'git-branch';
      case 'file':
        return 'package';
      case 'advanced':
        return 'settings';
      case 'complete':
        return 'target';
      default:
        return 'file-text';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Template Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Icon
              name={TEMPLATE_CATEGORIES[template.category]?.icon || 'file-text'}
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
            />
            <Icon
              name={getTemplateTypeIcon(template.templateType)}
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
            />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {template.name}
            </h3>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            {template.isBuiltIn ? (
              <Badge variant="primary" size="xs">
                {t('templates_official_template')}
              </Badge>
            ) : (
              <Badge variant="secondary" size="xs">
                {t('templates_custom_template')}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {template.description}
          </p>
        </div>
      </div>

      {/* Template Type Badge */}
      <div className="mb-3">
        <Badge variant="outline" size="sm">
          {t('templates_type_label', [
            template.templateType.charAt(0).toUpperCase() +
              template.templateType.slice(1),
          ])}
        </Badge>
      </div>

      {/* Features Summary */}
      {!compact && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {t('templates_features_label')}
          </div>
          <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {getTemplateFeaturesSummary(template)}
          </div>
        </div>
      )}

      {/* Quick Preview */}
      {!compact && (
        <div className="mb-4">
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {template.headers?.slice(0, 2).map(header => (
              <div
                key={header.name}
                className="text-xs font-mono bg-blue-50 dark:bg-blue-900/20 p-1 rounded"
              >
                <span
                  className={`font-medium ${
                    header.target === 'request'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {header.target === 'request' ? '→' : '←'} {header.name}
                </span>
              </div>
            ))}
            {template.conditions?.slice(0, 1).map(condition => (
              <div
                key={condition.value}
                className="text-xs font-mono bg-orange-50 dark:bg-orange-900/20 p-1 rounded"
              >
                <span className="font-medium text-orange-600 dark:text-orange-400 flex items-center space-x-1">
                  <Icon name="git-branch" className="w-3 h-3" />
                  <span>
                    {condition.type} {condition.operator}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 4).map(tag => (
            <Badge key={tag} variant="outline" size="xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 4 && (
            <Badge variant="secondary" size="xs">
              +{template.tags.length - 4}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-2">
        {/* Primary Actions Row */}
        <div className="flex space-x-2">
          {onView && (
            <Button
              variant="secondary"
              size="sm"
              icon="eye"
              onClick={onView}
              className="flex-1"
            >
              {t('ui_button_view')}
            </Button>
          )}

          {template.isBuiltIn
            ? onClone && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="copy"
                  onClick={onClone}
                  className="flex-1"
                >
                  {t('ui_button_clone')}
                </Button>
              )
            : onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="edit"
                  onClick={onEdit}
                  className="flex-1"
                >
                  {t('ui_button_edit')}
                </Button>
              )}
        </div>

        {/* Secondary Actions Row */}
        <div className="flex space-x-2">
          {onExport && (
            <Button
              variant="secondary"
              size="xs"
              icon="download"
              onClick={onExport}
              className="flex-1"
            >
              {t('ui_button_export')}
            </Button>
          )}

          {onApply && (
            <Button
              variant="primary"
              size="sm"
              icon="target"
              onClick={onApply}
              loading={isApplying}
              className="flex-1"
            >
              {t('ui_button_apply')}
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          {!template.isBuiltIn && onDelete && (
            <Button variant="error" size="xs" icon="trash" onClick={onDelete}>
              {t('ui_button_delete')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
