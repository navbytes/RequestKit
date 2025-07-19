import { ReactNode } from 'preact/compat';

import { useI18n } from '@/shared/hooks/useI18n';
import { Variable } from '@/shared/types';

import { Icon } from '../Icon';

// Extracted reusable components
const ExpandButton = ({
  isExpanded,
  onClick,
  className = '',
}: {
  readonly isExpanded: boolean;
  readonly onClick: () => void;
  readonly className?: string;
}) => (
  <button
    onClick={onClick}
    className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${className}`}
  >
    <Icon
      name="chevron-down"
      size={16}
      className={`transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
    />
  </button>
);

const VariableName = ({
  variable,
  className = '',
}: {
  readonly variable: Variable;
  readonly className?: string;
}) => {
  const { t } = useI18n();
  return (
    <div className={className}>
      <p className="font-medium text-gray-900 dark:text-white truncate">
        {variable.name}
      </p>
      {!variable.enabled && (
        <span className="text-xs text-red-500">{t('ui_label_disabled')}</span>
      )}
    </div>
  );
};

const UsageDisplay = ({
  count,
  className = '',
}: {
  readonly count: number;
  readonly className?: string;
}) => (
  <div className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
    {count}
  </div>
);

interface VariableRowTabletProps {
  readonly variable: Variable;
  readonly isExpanded: boolean;
  readonly onToggleExpanded: () => void;
  readonly renderActionButtons: (variable: Variable) => ReactNode;
  readonly renderScopeTag: (variable: Variable) => ReactNode;
}

interface VariableRowProps extends VariableRowTabletProps {
  readonly renderValueDisplay: (variable: Variable) => ReactNode;
}

export const VariableRowMobile = ({
  variable,
  isExpanded,
  onToggleExpanded,
  renderActionButtons,
  renderScopeTag,
  renderValueDisplay,
}: VariableRowProps) => {
  const { t } = useI18n();
  return (
    <div className="block md:hidden">
      <div className="space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <ExpandButton
              isExpanded={isExpanded}
              onClick={onToggleExpanded}
              className="flex-shrink-0"
            />
            <VariableName variable={variable} className="flex-1 min-w-0" />
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {renderActionButtons(variable)}
          </div>
        </div>

        {/* Scope and Usage Row */}
        <div className="flex items-center justify-between">
          {renderScopeTag(variable)}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('variables_usage_label')}: {variable.metadata?.usageCount || 0}
          </div>
        </div>

        {/* Value Row */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('ui_label_value')}:
          </div>
          {renderValueDisplay(variable)}
        </div>
      </div>
    </div>
  );
};

export const VariableRowTablet = ({
  variable,
  isExpanded,
  onToggleExpanded,
  renderActionButtons,
  renderScopeTag,
}: VariableRowTabletProps) => (
  <div className="hidden md:block lg:hidden overflow-x-auto">
    <div className="min-w-[700px]">
      <div className="grid grid-cols-7 gap-4 items-center">
        {/* Name */}
        <div className="col-span-3">
          <div className="flex items-center space-x-2">
            <ExpandButton
              isExpanded={isExpanded}
              onClick={onToggleExpanded}
              className="flex-shrink-0"
            />
            <VariableName variable={variable} className="min-w-0" />
          </div>
        </div>

        {/* Scope */}
        <div className="col-span-2">{renderScopeTag(variable)}</div>

        {/* Value */}
        {/* <div className="col-span-3">{renderValueDisplay(variable)}</div> */}

        {/* Usage */}
        <div className="col-span-1">
          <UsageDisplay count={variable.metadata?.usageCount || 0} />
        </div>

        {/* Actions */}
        <div className="col-span-1">{renderActionButtons(variable)}</div>
      </div>
    </div>
  </div>
);

export const VariableRowDesktop = ({
  variable,
  isExpanded,
  onToggleExpanded,
  renderActionButtons,
  renderScopeTag,
  renderValueDisplay,
}: VariableRowProps) => (
  <div className="hidden lg:block">
    <div className="grid grid-cols-10 gap-4 items-center">
      {/* Name */}
      <div className="col-span-3">
        <div className="flex items-center space-x-2">
          <ExpandButton isExpanded={isExpanded} onClick={onToggleExpanded} />
          <VariableName variable={variable} />
        </div>
      </div>

      {/* Scope */}
      <div className="col-span-1">{renderScopeTag(variable)}</div>

      {/* Value */}
      <div className="col-span-4">{renderValueDisplay(variable)}</div>

      {/* Usage */}
      <div className="col-span-1">
        <UsageDisplay count={variable.metadata?.usageCount || 0} />
      </div>

      {/* Actions */}
      <div className="col-span-1">{renderActionButtons(variable)}</div>
    </div>
  </div>
);
