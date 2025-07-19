import { Icon } from '@/shared/components/Icon';

interface AddRuleButtonProps {
  currentUrl: string;
  onCreateRule: () => void;
}

export function AddRuleButton({
  currentUrl,
  onCreateRule,
}: AddRuleButtonProps) {
  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'this page';
    }
  };

  const domain = getDomainFromUrl(currentUrl);

  return (
    <button
      onClick={onCreateRule}
      className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
    >
      <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
        <Icon name="plus" className="w-5 h-5" />
        <span className="font-medium">Create Rule for {domain}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
        Quick setup for current page
      </p>
    </button>
  );
}
