import { ReactNode } from 'preact/compat';

import { Variable } from '@/shared/types';

interface TableHeaderProps {
  renderSortButton: (key: keyof Variable | 'usage', label: string) => ReactNode;
  layout: 'desktop' | 'tablet';
}

export const TableHeader = ({ renderSortButton, layout }: TableHeaderProps) => {
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
          <div className="col-span-3">{renderSortButton('name', 'Name')}</div>
          {isDesktop ? (
            <>
              <div className="col-span-1">
                {renderSortButton('scope', 'Scope')}
              </div>
              <div className="col-span-4">Value</div>
              <div className="col-span-1">
                {renderSortButton('usage', 'Usage')}
              </div>
              <div className="col-span-1">Actions</div>
            </>
          ) : (
            <>
              <div className="col-span-2">
                {renderSortButton('scope', 'Scope')}
              </div>
              <div className="col-span-1">
                {renderSortButton('usage', 'Usage')}
              </div>
              <div className="col-span-1">Actions</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
