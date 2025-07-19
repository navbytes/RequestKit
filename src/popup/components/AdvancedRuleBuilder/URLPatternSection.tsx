import { useI18n } from '@/shared/hooks/useI18n';

interface FormData {
  protocol: 'http' | 'https' | '*';
  domain: string;
  path: string;
}

interface URLPatternSectionProps {
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
}

export function URLPatternSection({
  formData,
  onUpdate,
}: Readonly<URLPatternSectionProps>) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('forms_url_pattern')}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label
            htmlFor="url-protocol-select"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            {t('popup_protocol')}
          </label>
          <select
            id="url-protocol-select"
            value={formData.protocol}
            onChange={e =>
              onUpdate({
                protocol: (e.target as HTMLSelectElement).value as
                  | 'http'
                  | 'https'
                  | '*',
              })
            }
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="*">{t('popup_any')}</option>
            <option value="https">{t('popup_https')}</option>
            <option value="http">{t('popup_http')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="url-domain-input"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            {t('popup_domain')} *
          </label>
          <input
            type="text"
            id="url-domain-input"
            value={formData.domain}
            onChange={e =>
              onUpdate({ domain: (e.target as HTMLInputElement).value })
            }
            placeholder={t('popup_example_domain')}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label
            htmlFor="url-path-input"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            {t('popup_path')}
          </label>
          <input
            type="text"
            id="url-path-input"
            value={formData.path}
            onChange={e =>
              onUpdate({ path: (e.target as HTMLInputElement).value })
            }
            placeholder={t('popup_example_path')}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
