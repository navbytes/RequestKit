import { Icon } from '@/shared/components/Icon';

interface HeaderActionsProps {
  onExport: () => void;
  onClear: () => void;
}

export function HeaderActions({
  onExport,
  onClear,
}: Readonly<HeaderActionsProps>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <button onClick={onExport} className="btn btn-secondary btn-sm">
          <Icon name="download" className="w-4 h-4 mr-2" />
          Export Data
        </button>
        <button onClick={onClear} className="btn btn-error btn-sm">
          <Icon name="trash" className="w-4 h-4 mr-2" />
          Clear Data
        </button>
      </div>
    </div>
  );
}
