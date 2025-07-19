import { Icon } from '@/shared/components/Icon';

interface VariableActionsProps {
  totalCount: number;
  onImport: (file: File) => void;
  onExport: () => void;
  onCreateVariable: () => void;
}

export function VariableActions({
  totalCount,
  onImport,
  onExport,
  onCreateVariable,
}: Readonly<VariableActionsProps>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <label className="btn btn-secondary btn-sm">
          <Icon name="upload" className="w-4 h-4 mr-2" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={e => {
              const file = e.currentTarget.files?.[0];
              if (file) {
                onImport(file);
              }
            }}
            className="hidden"
          />
        </label>
        <button
          onClick={onExport}
          className="btn btn-secondary btn-sm"
          disabled={totalCount === 0}
        >
          <Icon name="download" className="w-4 h-4 mr-2" />
          Export
        </button>
        <button onClick={onCreateVariable} className="btn btn-primary btn-sm">
          <Icon name="plus" className="w-4 h-4 mr-2" />
          Create Variable
        </button>
      </div>
    </div>
  );
}
