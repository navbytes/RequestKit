import { useI18n } from '@/shared/hooks/useI18n';

interface QuickRuleFormProps {
  ruleName: string;
  setRuleName: (name: string) => void;
  headerName: string;
  setHeaderName: (name: string) => void;
  headerValue: string;
  setHeaderValue: (value: string) => void;
  isSubmitting: boolean;
  domain: string;
  onSubmit: (e: Event) => void;
  onCancel: () => void;
}

export function QuickRuleForm({
  ruleName,
  setRuleName,
  headerName,
  setHeaderName,
  headerValue,
  setHeaderValue,
  isSubmitting,
  domain,
  onSubmit,
  onCancel,
}: Readonly<QuickRuleFormProps>) {
  const { t } = useI18n();

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="quick-rule-name"
          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('quick_rule_label_name')}
        </label>
        <input
          type="text"
          id="quick-rule-name"
          value={ruleName}
          onChange={e => setRuleName((e.target as HTMLInputElement).value)}
          placeholder={`${t('quick_rule_placeholder_name')} ${domain}`}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label
          htmlFor="quick-header-name"
          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('quick_rule_label_header_name')}
        </label>
        <input
          type="text"
          id="quick-header-name"
          value={headerName}
          onChange={e => setHeaderName((e.target as HTMLInputElement).value)}
          placeholder={t('quick_rule_placeholder_header_name')}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label
          htmlFor="quick-header-value"
          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('quick_rule_label_header_value')}
        </label>
        <input
          type="text"
          id="quick-header-value"
          value={headerValue}
          onChange={e => setHeaderValue((e.target as HTMLInputElement).value)}
          placeholder={t('quick_rule_placeholder_header_value')}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div className="flex space-x-2 pt-2">
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !ruleName.trim() ||
            !headerName.trim() ||
            !headerValue.trim()
          }
          className="flex-1 btn btn-primary btn-sm"
        >
          {isSubmitting
            ? t('quick_rule_button_creating')
            : t('quick_rule_button_create')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn btn-secondary btn-sm"
        >
          {t('button_cancel')}
        </button>
      </div>
    </form>
  );
}
