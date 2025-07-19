import type { Variable } from '@/shared/types/variables';

const MetadataField = ({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
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
  variable: Variable;
  formatDate: (date?: Date | string) => string;
}) => (
  <div>
    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
      Metadata
    </h4>
    <div className="space-y-2 text-sm">
      <MetadataField
        label="Created"
        value={
          variable.metadata?.createdAt
            ? formatDate(variable.metadata.createdAt)
            : 'Unknown'
        }
      />

      <MetadataField
        label="Updated"
        value={
          variable.metadata?.updatedAt
            ? formatDate(variable.metadata.updatedAt)
            : 'Unknown'
        }
      />

      {variable.metadata?.lastUsed && (
        <MetadataField
          label="Last Used"
          value={formatDate(variable.metadata.lastUsed)}
        />
      )}

      <MetadataField
        label="Usage Count"
        value={String(variable.metadata?.usageCount || 0)}
      />
    </div>
  </div>
);
