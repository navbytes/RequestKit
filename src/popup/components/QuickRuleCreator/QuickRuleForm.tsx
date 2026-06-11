import { useI18n } from '@/shared/hooks/useI18n';

// Common developer headers offered as one-click presets. Values are
// examples the user is expected to adjust; ${uuid()} showcases the
// variable system.
const HEADER_PRESETS: ReadonlyArray<{ name: string; value: string }> = [
  { name: 'Authorization', value: 'Bearer ' },
  { name: 'X-Api-Key', value: '' },
  { name: 'X-Request-Id', value: '${uuid()}' },
  { name: 'X-Forwarded-For', value: '127.0.0.1' },
  { name: 'Cache-Control', value: 'no-cache' },
];

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
          {t('common_rule_name')}{' '}
          <span className="font-normal text-gray-400 dark:text-gray-500">
            ({t('common_optional')})
          </span>
        </label>
        <input
          type="text"
          id="quick-rule-name"
          value={ruleName}
          onChange={e => setRuleName((e.target as HTMLInputElement).value)}
          placeholder={`${t('quick_rule_placeholder_name')} ${domain}`}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('quick_rule_common_headers')}
        </span>
        <div className="flex flex-wrap gap-1">
          {HEADER_PRESETS.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setHeaderName(preset.name);
                setHeaderValue(preset.value);
              }}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                headerName === preset.name
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-400'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
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
          disabled={isSubmitting || !headerName.trim() || !headerValue.trim()}
          className="flex-1 btn btn-primary btn-sm"
        >
          {isSubmitting ? t('status_creating') : t('action_create_rule')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn btn-secondary btn-sm"
        >
          {t('common_cancel')}
        </button>
      </div>
    </form>
  );
}
