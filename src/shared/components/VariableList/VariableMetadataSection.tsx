import { useI18n } from '@/shared/hooks/useI18n';
import type { Variable } from '@/shared/types/variables';

const MetadataField = ({
  label,
  value,
  className = '',
}: {
  readonly label: string;
  readonly value: string;
  readonly className?: string;
}) => (
  <div className={className}>
    <span className="text-gray-500 dark:text-gray-400">{label}:</span>
    <span className="ml-2 text-gray-900 dark:text-white">{value}</span>
  </div>
);

export const VariableMetadataSection = ({
  variable,
  formatDate,
}: {
  readonly variable: Variable;
  readonly formatDate: (date?: Date | string) => string;
}) => {
  const { t } = useI18n();
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        {t('common_metadata')}
      </h4>
      <div className="space-y-2 text-sm">
        <MetadataField
          label={t('variables_created_label')}
          value={
            variable.metadata?.createdAt
              ? formatDate(variable.metadata.createdAt)
              : t('common_unknown')
          }
        />

        <MetadataField
          label={t('variables_updated_label')}
          value={
            variable.metadata?.updatedAt
              ? formatDate(variable.metadata.updatedAt)
              : t('common_unknown')
          }
        />

        {variable.metadata?.lastUsed && (
          <MetadataField
            label={t('variables_last_used_label')}
            value={formatDate(variable.metadata.lastUsed)}
          />
        )}

        <MetadataField
          label={t('variables_usage_count_label')}
          value={String(variable.metadata?.usageCount || 0)}
        />
      </div>
    </div>
  );
};
