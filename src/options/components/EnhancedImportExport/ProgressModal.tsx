import { Icon } from '@/shared/components/Icon';

interface ProgressModalProps {
  readonly step: string;
  readonly progress: number;
}

export function ProgressModal({ step, progress }: ProgressModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <Icon
              name="loader"
              className="w-full h-full animate-spin text-primary-600"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {step}
          </h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {progress}% complete
          </p>
        </div>
      </div>
    </div>
  );
}
