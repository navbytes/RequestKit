import { ReactNode } from 'preact/compat';

import { useI18n } from '@/shared/hooks/useI18n';
import { Variable } from '@/shared/types';

interface TableHeaderProps {
  readonly renderSortButton: (
    key: keyof Variable | 'usage',
    label: string
  ) => ReactNode;
  readonly layout: 'desktop' | 'tablet';
}

export const TableHeader = ({ renderSortButton, layout }: TableHeaderProps) => {
  const { t } = useI18n();
  const isDesktop = layout === 'desktop';
  const gridCols = isDesktop ? 'grid-cols-10' : 'grid-cols-7';
  const minWidth = isDesktop ? '' : 'min-w-[700px]';
  const visibility = isDesktop
    ? 'hidden lg:block'
    : 'hidden md:block lg:hidden';
  const overflow = isDesktop ? '' : 'overflow-x-auto';

  return (
    <div
      className={`${visibility} bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ${overflow}`}
    >
      <div className={minWidth}>
        <div
          className={`grid ${gridCols} gap-4 text-sm font-medium text-gray-700 dark:text-gray-300`}
        >
          <div className="col-span-3">
            {renderSortButton('name', t('ui_label_name'))}
          </div>
          {isDesktop ? (
            <>
              <div className="col-span-1">
                {renderSortButton('scope', t('variables_scope_label'))}
              </div>
              <div className="col-span-4">{t('ui_label_value')}</div>
              <div className="col-span-1">
                {renderSortButton('usage', t('variables_usage_label'))}
              </div>
              <div className="col-span-1">{t('variables_actions_label')}</div>
            </>
          ) : (
            <>
              <div className="col-span-2">
                {renderSortButton('scope', t('variables_scope_label'))}
              </div>
              <div className="col-span-1">
                {renderSortButton('usage', t('variables_usage_label'))}
              </div>
              <div className="col-span-1">{t('variables_actions_label')}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
