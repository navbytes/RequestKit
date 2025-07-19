import { useState } from 'preact/hooks';

import { TabDescription } from '@/shared/components/TabDescription';
import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';

import { ExportSection } from './ExportSection';
import { ExportOptionsState } from './ExportSection/ExportOptions';
import { useImportExportData } from './hooks/useImportExportData';
import { useImportExportOperations } from './hooks/useImportExportOperations';
import { ImportSection } from './ImportSection';
import { ProgressModal } from './ProgressModal';

interface EnhancedImportExportProps {
  readonly rules: HeaderRule[];
  readonly settings: ExtensionSettings;
  readonly onRulesUpdate: (rules: HeaderRule[]) => void;
  readonly onSettingsUpdate: (settings: ExtensionSettings) => void;
}

export function EnhancedImportExport({
  rules,
  settings,
  onRulesUpdate,
  onSettingsUpdate,
}: EnhancedImportExportProps) {
  const { t } = useI18n();
  const [exportOptions, setExportOptions] = useState<ExportOptionsState>({
    rules: true,
    templates: true,
    profiles: true,
    settings: false,
    stats: false,
    profileStats: false,
    activeProfile: true,
    appVersion: true,
  });

  const [importProgress, setImportProgress] = useState<{
    show: boolean;
    step: string;
    progress: number;
  }>({ show: false, step: '', progress: 0 });

  const { lastExport, setLastExport } = useImportExportData();

  const { handleExport, handleImport, handleQuickExport } =
    useImportExportOperations(
      rules,
      settings,
      exportOptions,
      onRulesUpdate,
      onSettingsUpdate,
      setImportProgress,
      setLastExport
    );

  return (
    <div className="p-6 space-y-8">
      <TabDescription
        title={t('import_export_title')}
        description={t('import_export_description')}
        icon="download"
        features={[
          t('import_export_features_1'),
          t('import_export_features_2'),
          t('import_export_features_3'),
          t('import_export_features_4'),
          t('import_export_features_5'),
        ]}
        useCases={[
          t('import_export_use_cases_1'),
          t('import_export_use_cases_2'),
          t('import_export_use_cases_3'),
          t('import_export_use_cases_4'),
        ]}
      />

      {/* Export Section */}
      <ExportSection
        exportOptions={exportOptions}
        setExportOptions={setExportOptions}
        onExport={handleExport}
        onQuickExport={handleQuickExport}
        rulesCount={rules.length}
        lastExport={lastExport}
      />

      {/* Import Section */}
      <ImportSection onImport={handleImport} />

      {/* Progress Modal */}
      {importProgress.show && (
        <ProgressModal
          step={importProgress.step}
          progress={importProgress.progress}
        />
      )}
    </div>
  );
}
