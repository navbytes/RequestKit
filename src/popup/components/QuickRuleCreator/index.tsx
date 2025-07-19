import { Icon } from '@/shared/components/Icon';
import type { HeaderRule } from '@/shared/types/rules';

import { useQuickRuleCreator } from './hooks/useQuickRuleCreator';
import { QuickRuleForm } from './QuickRuleForm';

interface QuickRuleCreatorProps {
  currentUrl: string;
  onRuleCreated: (rule: HeaderRule) => void;
  onCancel: () => void;
}

export function QuickRuleCreator({
  currentUrl,
  onRuleCreated,
  onCancel,
}: QuickRuleCreatorProps) {
  const {
    ruleName,
    setRuleName,
    headerName,
    setHeaderName,
    headerValue,
    setHeaderValue,
    isSubmitting,
    domain,
    handleSubmit,
  } = useQuickRuleCreator(currentUrl, onRuleCreated);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Quick Rule for {domain}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="Cancel"
        >
          <Icon name="close" className="w-4 h-4" />
        </button>
      </div>

      <QuickRuleForm
        ruleName={ruleName}
        setRuleName={setRuleName}
        headerName={headerName}
        setHeaderName={setHeaderName}
        headerValue={headerValue}
        setHeaderValue={setHeaderValue}
        isSubmitting={isSubmitting}
        domain={domain}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        This will add a header to all requests matching {domain}
      </p>
    </div>
  );
}
