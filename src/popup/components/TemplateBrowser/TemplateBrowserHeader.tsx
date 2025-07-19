import { Icon } from '@/shared/components/Icon';

interface TemplateBrowserHeaderProps {
  onClose: () => void;
}

export function TemplateBrowserHeader({ onClose }: TemplateBrowserHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Browse Templates
      </h2>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        <Icon name="close" className="w-5 h-5" />
      </button>
    </div>
  );
}
