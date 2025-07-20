import { Icon } from '@/shared/components/Icon';
import { Badge } from '@/shared/components/ui';
import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderRule } from '@/shared/types/rules';

interface RuleItemProps {
  rule: HeaderRule;
  isMatching?: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
  showPattern?: boolean;
}

export function RuleItem({
  rule,
  isMatching = false,
  onToggle,
  onEdit,
  onDelete,
  compact = false,
  showPattern = true,
}: Readonly<RuleItemProps>) {
  const { t } = useI18n();

  const formatPattern = (rule: HeaderRule): string => {
    const { protocol, domain, path } = rule.pattern;
    return `${protocol || '*'}://${domain}${path || ''}`;
  };

  return (
    <div
      className={`${compact ? 'p-2' : 'p-3'} rounded-lg border transition-colors ${
        isMatching
          ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4
              className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-900 dark:text-white truncate`}
            >
              {rule.name}
            </h4>
            {isMatching && rule.enabled && (
              <Badge
                variant="primary"
                size={compact ? 'xs' : 'sm'}
                icon="check"
              >
                {t('rule_badge_active')}
              </Badge>
            )}
            {!rule.enabled && (
              <Badge variant="secondary" size={compact ? 'xs' : 'sm'}>
                {t('rule_badge_disabled')}
              </Badge>
            )}
          </div>
          {!compact && showPattern && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
              {formatPattern(rule)}
            </p>
          )}
        </div>
        <div className="flex items-end space-x-1 ml-2 flex-col">
          <div
            className={`flex items-center ${compact ? 'space-x-0.5' : 'space-x-1'} ml-2`}
          >
            <button
              onClick={onToggle}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                rule.enabled ? 'text-success-600' : 'text-gray-400'
              }`}
              title={
                rule.enabled
                  ? t('rule_tooltip_disable')
                  : t('rule_tooltip_enable')
              }
            >
              <Icon
                name={rule.enabled ? 'eye' : 'eye-off'}
                className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`}
              />
            </button>

            <button
              onClick={onEdit}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-600"
              title={t('rule_tooltip_edit')}
            >
              <Icon
                name="edit"
                className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`}
              />
            </button>

            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-error-600"
              title={t('rule_tooltip_delete')}
            >
              <Icon
                name="trash"
                className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`}
              />
            </button>
          </div>
          {!compact && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {rule.headers.length}{' '}
              {rule.headers.length !== 1
                ? t('rule_header_count_plural')
                : t('rule_header_count_single')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
