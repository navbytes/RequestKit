import { Button } from '@/shared/components/ui';

interface ExportButtonsProps {
  exportOptions: {
    rules: boolean;
    templates: boolean;
    profiles: boolean;
    settings: boolean;
    stats: boolean;
    profileStats: boolean;
    activeProfile: boolean;
    appVersion: boolean;
  };
  onExport: () => void;
  onQuickExport: (type: 'rules' | 'templates' | 'profiles') => void;
}

export function ExportButtons({
  exportOptions,
  onExport,
  onQuickExport,
}: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onExport}
        disabled={!Object.values(exportOptions).some(Boolean)}
        icon="download"
      >
        Export Selected
      </Button>

      <Button onClick={() => onQuickExport('rules')} variant="secondary">
        Export Rules Only
      </Button>

      <Button onClick={() => onQuickExport('templates')} variant="secondary">
        Export Templates Only
      </Button>

      <Button onClick={() => onQuickExport('profiles')} variant="secondary">
        Export Profiles Only
      </Button>
    </div>
  );
}
