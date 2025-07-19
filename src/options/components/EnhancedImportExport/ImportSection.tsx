import { Icon } from '@/shared/components/Icon';

interface ImportSectionProps {
  readonly onImport: (event: Event) => void;
}

export function ImportSection({ onImport }: ImportSectionProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Import Data
      </h3>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <Icon
            name="upload"
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Select a RequestKit export file to import
          </p>
          <label className="btn btn-primary">
            Choose File
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Icon
              name="warning"
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Import Notes
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                <li>
                  • You&apos;ll be asked whether to merge or replace existing
                  data
                </li>
                <li>• Settings import will overwrite current preferences</li>
                <li>• Large imports may take a few moments to complete</li>
                <li>• Always backup your current data before importing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
